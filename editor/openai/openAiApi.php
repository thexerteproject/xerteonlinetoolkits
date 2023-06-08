<?php

class OpenAi
{
    private $type_list ;

    function __construct() {
        require_once (dirname(__FILE__) . "/ai_preset_models.php");
        $this->preset_models = $openAI_preset_models;
    }

//TODO global design of function
//check if user is allowed
//check if corp has tokens
//check if prompt conforms to requirements
//query api (done)
//check if result matches model
//make data usable by frontend (done)
//lower corp token pool
//return data to frontend (done)

    //TODO add functionality
    //check if answer conforms to model
    private function conform_to_model($answer)
    {
        //TODO idea if not correct drop until last closed xml and close rest manualy
        //prevents out of token answers

        //TODO ensure answer has no html code and xml has no data fields aka remove spaces
        //IMPORTANT GPT really wants to add \n into answers

        $tmp = str_replace('\n', "", $answer);
        $tmp = preg_replace('/\s+/', ' ', $tmp);
        $tmp = str_replace('> <', "><", $tmp);
        return $tmp;
    }

    //general class for interactions with the openai API
    //this should only be called if the user passed all checks
    private function POST_OpenAi($prompt, $settings)
    {
        require_once (dirname(__FILE__) . "/../../config.php");
        $authorization = "Authorization: Bearer " . $xerte_toolkits_site->openAI_key;

        //add user supplied prompt to payload
        $settings["payload"]["messages"][max(sizeof($settings["payload"]["messages"])-1, 0)]["content"] = $prompt;
        $payload = json_encode($settings["payload"]);

        //start api interaction
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_POST, 1);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_URL, $settings["url"]);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [$authorization, "Content-Type: application/json"]);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $payload);

        $result = curl_exec($curl);

        curl_close($curl);


        $resultConform = $this->conform_to_model($result);
        $resultConform = json_decode($resultConform);

        if ($resultConform->error) {
            return (object) ["status" => "error", "message" => "error on api call with code:" . $result->error->code];
        }
        //if (!$this->conform_to_model($resultConform)){
        //    return (object) ["status" => "error", "message" => "answer does not match model"];
        //}
        return $resultConform;
    }

    //TODO add functionality
    //function should lower the amount of tokens the corp is still allowed to use
    private function lower_corp_tokens($usage)
        {
        }

    //todo add functionality
    //function should check the number of tokens still available to a corp
    private function check_corp_tokens(): bool
    {
        return true;
    }

    public function openAI_request($p, $type)
    {
        if (!$this->check_corp_tokens()) {
            return (object) ["status" => "error", "message" => "no tokens left, please contact your administrator"];
        } else {
            if (is_null($this->preset_models->type_list[$type]) or $type == "") {
                return (object) ["status" => "error", "message" => "there is no match in type_list for " . $type];
            }

            $prompt = '';
            foreach ($this->preset_models->prompt_list["quiz"] as $prompt_part){
                if ($p[$prompt_part] == null){
                    $prompt = $prompt . $prompt_part;
                } else {
                    $prompt = $prompt . $p[$prompt_part];
                }
            }


            $result = $this->POST_OpenAi($prompt, $this->preset_models->type_list[$type]);

            //if status is set something went wrong
            if ($result->status){
                return $result;
            }

            $tokens_used = $result->usage->total_tokens;
            $answer = $result->choices[0]->message->content;

            $this->lower_corp_tokens($tokens_used);

            return $answer;
        }
    }

}
