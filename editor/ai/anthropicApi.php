<?php

use rag\MistralRAG;
class anthropicApi
{
    //constructor must be like this when adding new api
    function __construct(string $api) {
        global $xerte_toolkits_site;
        require_once (str_replace('\\', '/', __DIR__) . "/" . $api ."/load_preset_models.php");
        $this->preset_models = $anthropic_preset_models;
        require_once (str_replace('\\', '/', __DIR__) . "/../../config.php");
        $this->xerte_toolkits_site = $xerte_toolkits_site;
        require_once (str_replace('\\', '/', __DIR__) . "/rag/BaseRAG.php");
        require_once (str_replace('\\', '/', __DIR__) . "/rag/MistralRAG.php");
    }

    private function clean_result($answer) {
        //TODO idea: if not correct drop until last closed xml and close rest manually?

        //TODO ensure answer contains no html and xml has no data fields aka remove spaces
        //IMPORTANT GPT really wants to add \n into answers
        $tmp = str_replace('\n', "", $answer);
        $tmp = preg_replace('/\s+/', ' ', $tmp);
        $tmp = str_replace('> <', "><", $tmp);
        return $tmp;
    }

    private function POST_anthropic($prompt, $settings) {
        $authorization = "x-api-key: " . $this->xerte_toolkits_site->anthropic_key;

        $settings["payload"]["messages"][max(sizeof($settings["payload"]["messages"])-1, 0)]["content"] = $prompt;
        $payload = json_encode($settings["payload"]);

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_POST, 1);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_URL, $settings["url"]);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [$authorization, "Content-Type: application/json", "anthropic-version: 2023-06-01"]);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $payload);

        $result = curl_exec($curl);

        curl_close($curl);

        $resultConform = $this->clean_result($result);
        $resultConform = json_decode($resultConform);

        if ($resultConform->error) {
            return (object) ["status" => "error", "message" => "error on api call with type:" . $result->error->type];
        }
        //if (!$this->conform_to_model($resultConform)){
        //    return (object) ["status" => "error", "message" => "answer does not match model"];
        //}
        return $resultConform;
    }

    private function generatePrompt($p, $type, $globalInstructions): string {
        $prompt = '';
        foreach ($this->preset_models->prompt_list[$type] as $prompt_part) {
            if ($p[$prompt_part] == null) {
                $prompt .= $prompt_part;
            } else {
                $prompt .= $p[$prompt_part];
            }
        }

        // Append global instructions at the end if not empty
        if (!empty($globalInstructions)) {
            // Join the array into a single string with a newline between instructions
            $globalInstructionsStr = implode("\n", $globalInstructions);
            $prompt .= "\n" . $globalInstructionsStr;
        }

        return $prompt;

    }

    private function removeBracketsAndContent($text) {
        // Define the regex pattern to match the brackets and the content inside
        $pattern = '/【.*?】/u';
        // Use preg_replace to remove the matched patterns
        $cleanedText = preg_replace($pattern, '', $text);
        // Return the cleaned text
        return $cleanedText;
    }

    private function cleanXmlCode($xmlString) {
        // Check if the string starts with ```xml and remove it
        if (strpos($xmlString, "```xml") === 0) {
            $xmlString = substr($xmlString, strlen("```xml"));
            $xmlString = ltrim($xmlString); // Trim any leading whitespace after ```xml
        }

        // Check if the string ends with ``` and remove it
        if (substr($xmlString, -3) === "```") {
            $xmlString = substr($xmlString, 0, -3);
            $xmlString = rtrim($xmlString); // Trim any trailing whitespace before ```
        }

        return $xmlString;
    }

    private function cleanJsonCode($jsonString) {
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

    private function prepareURL($uploadPath){
        $basePath = __DIR__ . '/../../'; // Moves up from ai -> editor -> xot
        $finalPath = realpath($basePath . $uploadPath);

        if ($finalPath === false) {
            throw new Exception("File does not exist: $finalPath");
        }

        return $finalPath;
    }

    public function ai_request($p, $type, $baseUrl, $globalInstructions, $useCorpus = false, $fileList = null, $restrictCorpusToLo = false){
        if (is_null($this->preset_models->type_list[$type]) or $type == "") {
            return (object) ["status" => "error", "message" => "there is no match in type_list for " . $type];
        }

        if ($this->xerte_toolkits_site->anthropic_key == "") {
            return (object) ["status" => "error", "message" => "there is no corresponding API key"];
        }

        $prompt = $this->generatePrompt($p, $type, $globalInstructions);

        if ($useCorpus || $fileList != null || $restrictCorpusToLo){
            $apiKey = $this->xerte_toolkits_site->mistralenc_key;
            $encodingDirectory = $this->prepareURL($baseUrl);
            $rag = new MistralRAG($apiKey, $encodingDirectory);
            if ($rag->isCorpusValid()){
            $promptReference = x_clean_input($p['subject']);

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
                $context = $rag->getWeightedContext($promptReference, $fileList);
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

            array_splice($this->preset_models->type_list[$type]['payload']['messages'], 2, 0, $new_messages);
            }
        }

        $results = array();

        $results[] = $this->POST_anthropic($prompt, $this->preset_models->type_list[$type]);

        $answer = "";
        foreach ($results as $result) {
            if ($result->status) {
                return $result;
            }
            //todo change to work for anthropic method
            $answer = $answer . $result->content[0]->text;
        }

        $answer = $this->removeBracketsAndContent($answer);
        $answer = $this->cleanXmlCode($answer);
        $answer = $this->cleanJsonCode($answer);
        $answer = preg_replace('/&(?!#\d+;|amp;|lt;|gt;|quot;|apos;)/', '&amp;', $answer);
        return $answer;
    }
}