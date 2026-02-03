<?php
use function rag\makeRag;

require_once __DIR__.'/logging/log_ai_request.php';
require_once(dirname(__FILE__) . "/../../config.php");
_load_language_file("/editor/ai_internal/ai.inc");


global $xerte_toolkits_site;

abstract class BaseAiApi
{
    //constructor must be like this when adding new api
    private $api;

    private $languageName;

    protected $languageMessage;

     protected $globalInstructions = ["Output must be plain text only. Do not use Markdown (no *, _, backticks, or Markdown headings/lists). Use HTML only, and escape it for XML (e.g., &lt;em&gt;...&lt;/em&gt;)."];

    const DEFAULT_MSG = AI_INTERNAL_BASEREQUEST_ERROR_DEFAULT;

    //List of error messages which can explicitly be sent to the frontend.
    const ALLOWED_USER_MESSAGES = [
        // API
        AI_INTERNAL_BASEREQUEST_ERROR_API,
        // Network
        AI_INTERNAL_BASEREQUEST_ERROR_NETWORK,
        //JSON/Parse
        AI_INTERNAL_BASEREQUEST_ERROR_JSONPARSE,
        // Generic
        self::DEFAULT_MSG,
    ];

    function __construct($api) {

        $this->api = $api;
        require_once (str_replace('\\', '/', __DIR__) . "/../../config.php");
        require_once (str_replace('\\', '/', __DIR__) . "/rag/RagFactory.php");
        require_once (str_replace('\\', '/', __DIR__) . "/management/dataRetrievalHelper.php");
        require_once (str_replace('\\', '/', __DIR__) . "/" . $api ."/load_model.php");
    }

    protected function clean_result($answer) {
        //IMPORTANT GPT really wants to add \n into answers
        $tmp = str_replace('\n', "", $answer);
        $tmp = preg_replace('/\s+/', ' ', $tmp);
        $tmp = str_replace('> <', "><", $tmp);
        return $tmp;
    }

    abstract protected function POST_request($prompt, $payload, $url, $type);

    abstract protected function buildQueries(array $inputs);

    abstract protected function parseResponse($results);

    /**
     * Logs the real error details and return a standardised message for the user.
     *
     * @param string    $type     One of: 'api', 'json', 'curl', or 'default'
     * @param Throwable $e        The caught exception (for internal logging)
     * @param string    $context  Optional short context label, e.g. 'buildQueries'
     */
    protected function handleError($type, $e, $context = 'General')
    {
        // Log full internal detail
        error_log(sprintf('[%s] %s', $context, $e->getMessage()));

        $messages = [
            'api'    => AI_INTERNAL_BASEREQUEST_ERROR_API,
            'json'   => AI_INTERNAL_BASEREQUEST_ERROR_JSONPARSE,
            'curl'   => AI_INTERNAL_BASEREQUEST_ERROR_NETWORK,
            'default'=> AI_INTERNAL_BASEREQUEST_ERROR_DEFAULT,
        ];

        return isset($messages[$type]) ? $messages[$type] : $messages['default'];
    }

    // Helper to recursively replace invalid UTF-8 sequences in strings
    protected function json_utf8_substitute($value)
    {
        if (is_array($value)) {
            foreach ($value as $k => $v) {
                $value[$k] = $this->json_utf8_substitute($v);
            }
        } elseif (is_object($value)) {
            foreach ($value as $k => $v) {
                $value->$k = $this->json_utf8_substitute($v);
            }
        } elseif (is_string($value)) {
            if (function_exists('mb_convert_encoding')) {
                // Replaces invalid UTF-8 with U+FFFD (�), similar to JSON_INVALID_UTF8_SUBSTITUTE
                $value = mb_convert_encoding($value, 'UTF-8', 'UTF-8');
            } elseif (function_exists('iconv')) {
                // Fallback: drop invalid bytes (closer to *_IGNORE than *_SUBSTITUTE)
                $converted = @iconv('UTF-8', 'UTF-8//IGNORE', $value);
                if ($converted !== false) {
                    $value = $converted;
                }
            }
        }

        return $value;
    }

//todo remove this from all files, security risk
    protected function safeExecute(callable $fn, $context = 'General')
    {
        try {
            return $fn();
        } catch (\Exception $e) {
            $message = $e->getMessage();
            $msgType = 'default';

            // Avoid direct \JsonException reference so IDE doesn't complain
            if (class_exists('JsonException') && is_a($e, 'JsonException')) {
                $msgType = 'json';
            } elseif (strpos($message, 'cURL') === 0) {
                $msgType = 'curl';
            } elseif (strpos($message, 'API') === 0) {
                $msgType = 'api';
            }

            throw new \Exception($this->handleError($msgType, $e, $context));
        }
    }


    // Check if error message should make it to the front end
    protected function toUserMessage($e, $context = 'General')
    {
        // Log raw message
        error_log(sprintf('[%s boundary] %s', $context, $e->getMessage()));

        $msg = $e->getMessage();
        return in_array($msg, self::ALLOWED_USER_MESSAGES, true)
            ? $msg
            : self::DEFAULT_MSG;
    }

    /**
     * Remove characters that are illegal in XML 1.0.
     */
    protected function stripInvalidXmlChars($s) {
        // Allowed: #x9 | #xA | #xD | #x20-#xD7FF | #xE000-#xFFFD
        return preg_replace('/[^\x09\x0A\x0D\x20-\x{D7FF}\x{E000}-\x{FFFD}]/u', '', $s);
    }

    /**
     * Fix attribute values without double-encoding existing entities.
     * - Works for both single- and double-quoted attributes.
     * - Handles namespaced/dashed attr names.
     * - Escapes bare &, <, >, and the delimiting quote.
     */
    protected function fixXmlAttributeValues($xml) {
        $pattern = '/([A-Za-z_:][A-Za-z0-9_.:-]*)\s*=\s*(["\'])(.*?)\2/s';

        $cleaned_xml = preg_replace_callback($pattern, function ($m) {
            list($all, $name, $q, $val) = $m;

            // Remove illegal XML chars inside attribute values
            $val = $this->stripInvalidXmlChars($val);

            // 1) bare ampersands that are not (dec/hex) numeric or the 5 XML entities
            $val = preg_replace(
                '/&(?!#\d+;|#x[0-9A-Fa-f]+;|amp;|lt;|gt;|quot;|apos;)/',
                '&amp;',
                $val
            );

            // 2) angle brackets (must be escaped inside attributes)
            $val = str_replace(['<', '>'], ['&lt;', '&gt;'], $val);

            // 3) the delimiting quote
            if ($q === '"') {
                $val = str_replace('"', '&quot;', $val);
            } else {
                $val = str_replace("'", '&apos;', $val);
            }

            return $name . '=' . $q . $val . $q;
        }, $xml);

        return $cleaned_xml;
    }

    /**
     * Validate XML and return libxml errors (empty array == OK).
     */
    protected function lintXml($xml) {
        libxml_use_internal_errors(true);
        $dom = new DOMDocument('1.0', 'UTF-8');
        $ok  = $dom->loadXML($xml, LIBXML_NONET | LIBXML_COMPACT | LIBXML_BIGLINES);
        $errs = [];
        if (!$ok) {
            foreach (libxml_get_errors() as $e) {
                $errs[] = [
                    'level'   => $e->level,
                    'code'    => $e->code,
                    'message' => trim($e->message),
                    'line'    => $e->line,
                    'column'  => $e->column,
                ];
            }
        }
        libxml_clear_errors();
        return $errs;
    }

    /**
     * One-shot interceptor you can run on every model response.
     * Returns ['xml' => sanitizedXml, 'errors' => []] — errors non-empty if still broken.
     */
    protected function sanitizeModelXml($rawXml) {

        $xml = $this->stripInvalidXmlChars($rawXml);
        $xml = $this->fixXmlAttributeValues($xml);
        //todo use these errors
        $errors = $this->lintXml($xml);

        //return ['xml' => $xml, 'errors' => $errors]; //only use this for debugging
        return $xml;
    }

    protected function setupLanguageInstructions ($selectedCode){
        $languages = [
            'en-GB' => ['English', 'IMPORTANT: All non-structural output within the XML should be in British English!'],
            'nl-NL' => ['Nederlands', 'BELANGRIJK: Alle niet-structurele output binnen de XML moet in het Nederlands zijn!'],
            'nl-BE' => ['Vlaams', 'BELANGRIJK: Alle niet-structurele output binnen de XML moet in het Vlaams zijn!'],
            'fr-FR' => ['Français', 'IMPORTANT : Toute sortie non structurelle dans le XML doit être en français !'],
            'es-ES' => ['Español', 'IMPORTANTE: Toda salida no estructural dentro del XML debe estar en español.'],
            'cs-CZ' => ['Czech', 'DŮLEŽITÉ: Veškerý nestrukturovaný výstup v XML by měl být v češtině!'],
            'cy-GB' => ['Cymraeg', 'PWYSIG: Dylai’r holl allbwn nad yw’n strwythurol o fewn yr XML fod yn Gymraeg!'],
            'pl-PL' => ['Polish', 'WAŻNE: Cała nie-strukturalna zawartość w XML powinna być w języku polskim!'],
            'ru-RU' => ['Russian', 'ВАЖНО: Весь нестуктурированный вывод в XML должен быть на русском языке!'],
            'nb-NO' => ['Norsk bokmål', 'VIKTIG: All ikke-strukturell output i XML skal være på norsk!'],
            'it-IT' => ['Italiano', 'IMPORTANTE: Tutto l’output non strutturale all’interno dell’XML deve essere in italiano!'],
            'ja-JP' => ['Japanese', '重要：XML内の構造化されていないすべての出力は日本語である必要があります！'],
            'pt-BR' => ['Portugues', 'IMPORTANTE: Toda a saída não estrutural dentro do XML deve estar em português!'],
            'de-DE' => ['Deutsch', 'WICHTIG: Alle nicht-strukturellen Inhalte im XML müssen auf Deutsch sein!'],
            'tr-TR' => ['Türkçe', 'ÖNEMLİ: XML içindeki tüm yapısal olmayan çıktı Türkçe olmalıdır!'],
            'uk-UA' => ['Українська', 'ВАЖЛИВО: Усі неструктуровані дані в XML мають бути українською мовою!'],
            'el-GR' => ['Ελληνικά', 'ΣΗΜΑΝΤΙΚΟ: Όλη η μη δομική έξοδος μέσα στο XML πρέπει να είναι στα ελληνικά!'],
        ];

        if (array_key_exists($selectedCode, $languages)) {
            $this->languageName = $languages[$selectedCode][0];
            $this->languageMessage = $languages[$selectedCode][1];
        }
    }

    protected function generatePrompt($p, $model){
        $prompt = $this->languageMessage. " ";
        foreach ($model->get_prompt_list() as $prompt_part) {
            if ($p[$prompt_part] == null) {
                $prompt .= $prompt_part;
            } else {
                $prompt .= $p[$prompt_part];
            }
        }

        // Append global instructions at the end if not empty
        if (!empty($this->globalInstructions)) {
            // Join the array into a single string with a newline between instructions
            $globalInstructionsStr = implode("\n", $this->globalInstructions);
            $prompt .= "\n" . $globalInstructionsStr;
        }

        $prompt .= "\n" . $this->languageMessage;
        return $prompt;
    }

    protected function removeBracketsAndContent($text) {
        // Define the regex pattern to match the brackets and the content inside
        $pattern = '/【.*?】/u';
        // Use preg_replace to remove the matched patterns
        $cleanedText = preg_replace($pattern, '', $text);
        // Return the cleaned text
        return $cleanedText;
    }

    protected function cleanXmlCode($xmlString) {
        // Check if the string starts with ```xml and remove it
        if (strpos($xmlString, "```xml") === 0) {
            $xmlString = substr($xmlString, strlen("```xml"));
            $xmlString = ltrim($xmlString); // Trim any leading whitespace after ```xml
        }

        if (strpos($xmlString, "```") === 0) {
            $xmlString = substr($xmlString, strlen("```"));
            $xmlString = ltrim($xmlString); // Trim any leading whitespace after ```
        }

        // Check if the string ends with ``` and remove it
        if (substr($xmlString, -3) === "```") {
            $xmlString = substr($xmlString, 0, -3);
            $xmlString = rtrim($xmlString); // Trim any trailing whitespace before ```
        }

        return $xmlString;
    }

    protected function cleanJsonCode($jsonString) {
        // Check if the string starts with ```json and remove it
        if (strpos($jsonString, "```json") === 0) {
            $jsonString = substr($jsonString, strlen("```json"));
            $jsonString = ltrim($jsonString); // Trim any leading whitespace after ```json
        }

        // Check if the string ends with ``` and remove it
        if (substr($jsonString, -3) === "```") {
            $jsonString = substr($jsonString, 0, -3);
            $jsonString = rtrim($jsonString); // Trim any trailing whitespace before ```
        }

        return $jsonString;
    }

    //Function to ensure attribute values are correctly escaped, as mistral tends to default to using unescaped tags
    protected function sanitizeXmlAttributes($xmlString) {
        // Match all attribute values (excluding CDATA and inner XML content)
        $xmlString = preg_replace_callback(
            '/(\w+)\s*=\s*"([^"]*<[^"]*>)"/', // Matches attribute values with unescaped < >
            function ($matches) {
                $attrName = $matches[1];
                $attrValue = htmlspecialchars($matches[2], ENT_QUOTES | ENT_XML1, 'UTF-8');
                return "$attrName=\"$attrValue\"";
            },
            $xmlString
        );

        return $xmlString;
    }

    //todo probably remove this
//    protected function processFileForRAG(string $filePath): string {
//        try {
//            $loader = DocumentLoaderFactory::getLoader($filePath);
//            return $loader->load();
//        } catch (Exception $e) {
//            return "Error: " . $e->getMessage();
//        }
//    }

    public function total_clean_machine($answer){
        $answer = $this->removeBracketsAndContent($answer);
        $answer = $this->cleanXmlCode($answer);
        $answer = $this->cleanJsonCode($answer);
        $answer = preg_replace('/&(?!#\d+;|amp;|lt;|gt;|quot;|apos;)/', '&amp;', $answer);
        $answer = $this->sanitizeXmlAttributes($answer);
        $answer = $this->sanitizeModelXml($answer);
        return $answer;
    }

    protected function prepareURL($uploadPath){
        global $xerte_toolkits_site;
        $basePath = __DIR__ . '/../../'; // Moves up from ai -> editor -> xot
        $finalPath = realpath($basePath . $uploadPath);

        if ($finalPath === false) {
            throw new Exception("File does not exist: $finalPath");
        }

        x_check_path_traversal($finalPath, $xerte_toolkits_site->users_file_area_full, 'Invalid file path specified');

        return $finalPath;
    }

    //A get message array for sorting through different types of $payload structures
    protected function changeMessage($payload, $new_messages) {
        //anthropic, mistral and a legacy openAI chat completion
        if (isset($payload['messages'])) {
            array_splice($payload['messages'], 2, 0, $new_messages);
        }
        //for openAI assistant requests
        if (isset($payload['thread']['messages'])) {
            array_splice($payload['thread']['messages'], 2, 0, $new_messages);
        }
        return $payload;
    }

    //Strips the input array from html entities, paragraph tags and the like; it only confuses the model if left.
    function cleanArray($arr) {
        return array_map(function ($v) {
            if (!is_string($v)) return $v;

            // 1. Convert &lt;p&gt; to <p>
            $v = html_entity_decode($v, ENT_QUOTES, 'UTF-8');

            // 2. Strip HTML tags
            $v = strip_tags($v);

            // 3. Trim whitespace
            return trim($v);
        }, $arr);
    }

    public function ai_request($p, $type, $subtype, $context, $baseUrl, $selectedCode, $useCorpus = false, $fileList = null, $restrictCorpusToLo = false){
        $p = $this->cleanArray($p);
        try {
            $this->setupLanguageInstructions($selectedCode);
            $managementSettings = get_block_indicators();

            //We add this as a prompt param for prompts which might make use of the language information.
            //When making any prompt, the stand-in for the language must therefore be 'responseLanguage'
            $p['responseLanguage'] = $this->languageName;

            $model_ver = $managementSettings['ai']['preferred_model'];

            $model = load_model($type, $this->api, $model_ver, $context, $subtype);

            $prompt = $this->generatePrompt($p, $model);
            $payload = $model->get_payload();

            if ($useCorpus || $fileList != null || $restrictCorpusToLo) {
                global $xerte_toolkits_site;
                $encodingApiKey = $xerte_toolkits_site->{$managementSettings['encoding']['key_name']};
                $encodingDirectory = $this->prepareURL($baseUrl);
                $provider = $managementSettings['encoding']['active_vendor'];
                $preferredEncodingModel = $managementSettings['encoding']['preferred_model'];
                $cfg = [
                    'api_key' => $encodingApiKey,
                    'encoding_directory' => $encodingDirectory,
                    'provider' => $provider,
                    'preferredModel' => $preferredEncodingModel
                ];
                $rag = makeRag($cfg);
                if ($rag->isCorpusValid()) {
                    $promptReferences = $this->buildQueries($p);
                    $promptReference = $promptReferences['vector_query'];
                    //$testReference = $promptReferences['frequency_query'];
                    if ($restrictCorpusToLo) {
                        $fileList = [$encodingDirectory . '/preview.xml'];
                        $weights = [
                            'embedding_cosine' => 0.3,
                            'embedding_euclidean' => 0.2,
                            'tfidf_cosine' => 0.3,
                            'tfidf_euclidean' => 0.2
                        ];
                        $context = $rag->getWeightedContext($promptReference, $fileList, $weights, 25);
                    } else {
                        $context = $rag->getWeightedContext($promptReference, $fileList, '', 5);
                        //$testContext = $rag->getWeightedContext($testReference, $fileList, '', 5);
                    }

                    $new_messages = array(
                        array(
                            'role' => 'user',
                            'content' => 'Great job! That\'s a great example of what I need. Now, I want to send you the context of the learning object you are generating these XMLs for. Bear in mind, the context can take different forms: transcripts or text. In the future, please generate the xml based on the context I will provide.',
                        ),
                        array(
                            'role' => 'assistant',
                            'content' => 'Understood. I\'m happy to help you with your task. Please provide the current context of the learning object. I will keep in mind that for transcripts, I dont have to include the timestamps in my response unless otherwise specified. Once you do, we can proceed to generating new XML objects using the exact same structure I used in my previous message, this time taking the new context into account.',
                        ),
                        array(
                            'role' => 'user',
                            'content' => 'Ok. Remember, when you generate the new XML, it should do so with the context here in mind! I\'ve compiled the data for you here: [START OF CONTEXT]' . $context[0]['chunk'] . $context[1]['chunk'] . $context[2]['chunk'] . $context[3]['chunk'] . $context[4]['chunk'] . " [END OF CONTEXT]",
                        ),
                        array(
                            'role' => 'assistant',
                            'content' => 'Great! Now that we know the context of the sort of information I am working with, I can proceed with generating a new XML with the exact same XML structure as the first one I made, but with content adapted to the context. Please specify any of the other requirements for the XML, and I will return the XML directly with no additional commentary, so that you can immediately use my message as the XML.',
                        ),
                    );

                    $payload = $this->changeMessage($payload, $new_messages);
                }
            }

            $results = array();

            $results[] = $this->POST_request($prompt, $payload, $model->get_chat_url(), $type);

            $answer = $this->parseResponse($results);

            $clean_answer = $this->total_clean_machine($answer);

            return $clean_answer;
        }
        catch (\Exception $e) {
            return (object) array(
                'status'  => 'error',
                'message' => $this->toUserMessage($e),
            );
        }
    }
}