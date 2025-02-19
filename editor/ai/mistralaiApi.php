<?php

class mistralaiApi
{
    //constructor must be like this when adding new api
    function __construct(string $api) {
        require_once (str_replace('\\', '/', __DIR__) . "/" . $api ."/load_preset_models.php");
        $this->preset_models = $mistralai_preset_models;
        require_once (str_replace('\\', '/', __DIR__) . "/../../config.php");
        $this->xerte_toolkits_site = $xerte_toolkits_site;
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

    private function POST_mistralai($prompt, $settings) {
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->mistralai_key;

        $settings["payload"]["messages"][max(sizeof($settings["payload"]["messages"])-1, 0)]["content"] = $prompt;
        $payload = json_encode($settings["payload"]);

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_POST, 1);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_URL, $settings["url"]);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [$authorization, "Content-Type: application/json", 'Accept: application/json']);
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

    private function generatePrompt($p, $type): string {
        $prompt = '';
        foreach ($this->preset_models->prompt_list[$type] as $prompt_part){
            if ($p[$prompt_part] == null){
                $prompt = $prompt . $prompt_part;
            } else {
                $prompt = $prompt . $p[$prompt_part];
            }
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

    //Function to ensure attribute values are correctly escaped, as mistral tends to default to using unescaped tags
    function sanitizeXmlAttributes($xmlString) {
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

    public function ai_request($p, $type){
        if (is_null($this->preset_models->type_list[$type]) or $type == "") {
            return (object) ["status" => "error", "message" => "there is no match in type_list for " . $type];
        }

        if ($this->xerte_toolkits_site->mistralai_key == "") {
            return (object) ["status" => "error", "message" => "there is no corresponding API key"];
        }

        $prompt = $this->generatePrompt($p, $type);

        $results = array();

        $results[] = $this->POST_mistralai($prompt, $this->preset_models->type_list[$type]);

        $answer = "";
        foreach ($results as $result) {
            // Ensure choices exist and contain at least one response
            if (isset($result->choices) && is_array($result->choices) && count($result->choices) > 0) {
                $choice = $result->choices[0];

                // Concatenate content in case of streaming or partial responses
                $answer .= $choice->message->content;
            }
        }

        $answer = $this->removeBracketsAndContent($answer);
        $answer = $this->cleanXmlCode($answer);
        $answer = $this->cleanJsonCode($answer);
        $answer = preg_replace('/&(?!#\d+;|amp;|lt;|gt;|quot;|apos;)/', '&amp;', $answer);
        $answer = $this->sanitizeXmlAttributes($answer);
        return $answer;
    }
}