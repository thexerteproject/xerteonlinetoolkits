<?php

class OpenAi
{
    private $type_list ;

    function __construct() {
        require_once (dirname(__FILE__) . "/ai_preset_models.php");
        $this->preset_models = $openAI_preset_models;
        require_once (dirname(__FILE__) . "/../../config.php");
        $this->xerte_toolkits_site = $xerte_toolkits_site;
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

        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openAI_key;

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

    private function generatePrompt($p, $type): string
    {
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

    public function openAI_request($p, $type)
    {
        if (!$this->check_corp_tokens()) {
            return (object) ["status" => "error", "message" => "no tokens left, please contact your administrator"];
        } else {
            if (is_null($this->preset_models->type_list[$type]) or $type == "") {
                return (object) ["status" => "error", "message" => "there is no match in type_list for " . $type];
            }

            $prompt = $this->generatePrompt($p, $type);

            $results = array();

            //TODO check for all "multiple-run" types
            $block_size = 6;
            if ($type == "quiz" and $p['nrq'] > $block_size){

                $nrq_remaining = $p['nrq'];

                while ($nrq_remaining > $block_size) {
                    $prompt = preg_replace('/'.$p['nrq'].'/', strval($block_size), $prompt, 1);

                    $results[] = $this->POST_OpenAi($prompt, $this->preset_models->type_list[$type]);
                    $tempxml = simplexml_load_string(end($results)->choices[0]->message->content);
                    foreach ($tempxml->children() as $child){
                        $prompt = $prompt . $child->attributes()->prompt . " ; ";
                    }

                    $nrq_remaining = $nrq_remaining - $block_size;
                }
                $prompt = preg_replace('/'.strval($block_size).'/', strval($nrq_remaining), $prompt, 1);
            }
            $results[] = $this->POST_OpenAi($prompt, $this->preset_models->type_list[$type]);

            $answer = "";
            $total_tokens_used = 0;
            //if status is set something went wrong
            foreach ($results as $result) {
                if ($result->status) {
                    return $result;
                }
                $total_tokens_used += $result->usage->total_tokens;
                $answer = $answer . $result->choices[0]->message->content;
            }
            $answer = str_replace(["<". $type .">", "</". $type .">"], "", $answer);

            $this->lower_corp_tokens($total_tokens_used);

            return "<". $type .">" . $answer. "</". $type .">";
        }
    }

}
