<?php

class anthropicApi
{
    //constructor must be like this when adding new api
    function __construct(string $api) {
        require_once (dirname(__FILE__) . "/../../config.php");
        $this->xerte_toolkits_site = $xerte_toolkits_site;
        require_once (dirname(__FILE__) . "/" . $api ."/load_preset_models.php");
        $this->preset_models = $anthropic_preset_models;
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

    public function ai_request($p, $type){
        if (is_null($this->preset_models->type_list[$type]) or $type == "") {
            return (object) ["status" => "error", "message" => "there is no match in type_list for " . $type];
        }

        if ($this->xerte_toolkits_site->anthropic_key == "") {
            return (object) ["status" => "error", "message" => "there is no corresponding API key"];
        }

        $prompt = $this->generatePrompt($p, $type);

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
        $answer = str_replace(["<". $type .">", "</". $type .">"], "", $answer);

        //todo change if lop level is changed
        return "<". $type ." >" . $answer. "</". $type .">";
    }
}