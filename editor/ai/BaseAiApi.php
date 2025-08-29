<?php
use rag\MistralRAG;
use function rag\makeRag;


abstract class BaseAiApi
{
//constructor must be like this when adding new api
    private string $api;

    private string $languageName;

    protected string $languageMessage;

    //protected $global_instructions = ["When handling text enclosed in attribute tags, all text enclosed within the following attributes: 'text', 'goals', 'audience', 'prereq', 'howto', 'summary', 'nextsteps', 'pageintro', 'tip', 'side1', 'side2', 'txt', 'instruction', 'prompt', 'answer', 'intro', 'feedback', 'unit', 'question', 'hint', 'label', 'passage', 'initialtext', 'initialtitle', 'suggestedtext', 'suggestedtitle', 'generalfeedback', 'instructions', 'p1', 'p2', 'title', 'introduction', 'wrongtext', 'wordanswer', 'words' must be formatted with relevant HTML encoding tags (headers, paragraphs, etc. if needed), you have to use EXCLUSIVELY HTML entities. On the other hand, when handling text in CDATA nodes, only IF there is text inside CDATA nodes in the first response you gave, format it using at minimum paragraph tags, or other relevant tags if needed. Otherwise, do NOT wrap text which belongs in attributes into CDATA nodes."];
     protected $globalInstructions = [];

    function __construct(string $api) {
        global $xerte_toolkits_site;
        $this->api = $api;
        require_once (str_replace('\\', '/', __DIR__) . "/../../config.php");
        $this->xerte_toolkits_site = $xerte_toolkits_site;
        require_once (str_replace('\\', '/', __DIR__) . "/rag/RagFactory.php");
        require_once (str_replace('\\', '/', __DIR__) . "/management/dataRetrievalHelper.php");
        require_once (str_replace('\\', '/', __DIR__) . "/" . $api ."/load_model.php");
    }

    protected function clean_result($answer) {
        //TODO idea: if not correct drop until last closed xml and close rest manually?

        //TODO ensure answer contains no html and xml has no data fields aka remove spaces
        //IMPORTANT GPT really wants to add \n into answers
        $tmp = str_replace('\n', "", $answer);
        $tmp = preg_replace('/\s+/', ' ', $tmp);
        $tmp = str_replace('> <', "><", $tmp);
        return $tmp;
    }

    abstract protected function POST_request($prompt, $payload, $url, $type);

    abstract protected function buildQueries(array $inputs): array;

    abstract protected function parseResponse($results);

    protected function setupLanguageInstructions ($selectedCode){
        $languages = [
            'en-GB' => ['English', 'IMPORTANT: All non-structural output within the XML should be in English!'],
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

    protected function generatePrompt($p, $model): string {
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

    protected function processFileForRAG(string $filePath): string {
        try {
            $loader = DocumentLoaderFactory::getLoader($filePath);
            return $loader->load();
        } catch (Exception $e) {
            return "Error: " . $e->getMessage();
        }
    }

    protected function prepareURL($uploadPath){
        $basePath = __DIR__ . '/../../'; // Moves up from ai -> editor -> xot
        $finalPath = realpath($basePath . $uploadPath);

        if ($finalPath === false) {
            throw new Exception("File does not exist: $finalPath");
        }

        return $finalPath;
    }

    //A get message array for sorting through different types of $payload structures
    protected function &getMessagesArray(&$payload) {
        //anthropic, mistral and a legacy openAI chat completion
        if (isset($payload['messages'])) {
            return $payload['messages'];
        }
        //for openAI assistant requests
        if (isset($payload['thread']['messages'])) {
            return $payload['thread']['messages'];
        }

        // Fallback: return a dummy reference (prevents fatal error)
        $null = [];
        return $null;
    }

    public function ai_request($p, $type, $subtype, $context, $baseUrl, $selectedCode, $useCorpus = false, $fileList = null, $restrictCorpusToLo = false){
        /*
        if (is_null($this->preset_models->type_list[$type]) or $type == "") {
            return (object) ["status" => "error", "message" => "there is no match in type_list for " . $type];
        }

        if ($this->xerte_toolkits_site->openai_key == "") {
            return (object) ["status" => "error", "message" => "there is no corresponding API key"];
        }*/


        $this->setupLanguageInstructions($selectedCode);
        $managementSettings = get_block_indicators();

        //We add this as a prompt param for prompts which might make use of the language information.
        //When making any prompt, the stand-in for the language must therefore be 'responseLanguage'
        $p['responseLanguage'] = $this->languageName;

        $model = load_model($type, $this->api, null, $context, $subtype);

        $prompt = $this->generatePrompt($p, $model);
        $payload = $model->get_payload();

        if ($useCorpus || $fileList != null || $restrictCorpusToLo){
            $encodingApiKey = $this->xerte_toolkits_site->{$managementSettings['encoding']['key_name']};
            $encodingDirectory = $this->prepareURL($baseUrl);
            $provider = $managementSettings['encoding']['active_vendor'];
            $cfg = [
                'api_key' => $encodingApiKey,
                'encoding_directory' => $encodingDirectory,
                'provider' => $provider
            ];
            $rag = makeRag($cfg);
            if ($rag->isCorpusValid()){
                $promptReferences = $this->buildQueries($p);
                $promptReference = $promptReferences['vector_query'];
                //$testReference = $promptReferences['frequency_query'];
                if ($restrictCorpusToLo){
                    $fileList = [$encodingDirectory . '/preview.xml'];
                    $weights = [
                        'embedding_cosine' => 0.3,
                        'embedding_euclidean' => 0.2,
                        'tfidf_cosine' => 0.3,
                        'tfidf_euclidean' => 0.2
                    ];
                    $context = $rag->getWeightedContext($promptReference, $fileList, $weights, 25);
                }else{
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

                $messages =& $this->getMessagesArray($payload);
                array_splice($messages, 2, 0, $new_messages);
            }
        }

        $results = array();

        $results[] = $this->POST_request($prompt, $payload, $model->get_chat_url(), $type);

        $answer = $this->parseResponse($results);

        $answer = $this->removeBracketsAndContent($answer);
        $answer = $this->cleanXmlCode($answer);
        $answer = $this->cleanJsonCode($answer);
        $answer = preg_replace('/&(?!#\d+;|amp;|lt;|gt;|quot;|apos;)/', '&amp;', $answer);
        $answer = $this->sanitizeXmlAttributes($answer);
        return $answer;
    }
}