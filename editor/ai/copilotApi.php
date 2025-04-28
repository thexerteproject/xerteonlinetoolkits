<?php

class copilotApi
{
    //constructor must be like this when adding new api
    function __construct(string $api) {
        require_once (dirname(__FILE__) . "/" . $api ."/load_preset_models.php");
        $this->preset_models = $openAI_preset_models;
        require_once (dirname(__FILE__) . "/../../config.php");
        $this->xerte_toolkits_site = $xerte_toolkits_site;
    }

    private function clean_result($answer) {

    }

    private function POST_copilot($prompt, $settings) {
        //todo look at new library

    }

    private function generatePrompt($p, $type): string {
        return "";
    }

    public function ai_request($p, $type){
        if (is_null($this->preset_models->type_list[$type]) or $type == "") {
            return (object) ["status" => "error", "message" => "there is no match in type_list for " . $type];
        }
        //todo check for corresponding key to api
        if ($this->xerte_toolkits_site->copilot_key == "") {
            return (object) ["status" => "error", "message" => "there is no corresponding API key"];
        }

        $prompt = $this->generatePrompt($p, $type);


    }
}