<?php
//openai api master class
//file name must be $api . Api.php for example openaiApi.php when adding new api
//class name AiApi mandatory when adding new api
class openaiApi
{
    //constructor must be like this when adding new api
    function __construct(string $api) {
        require_once (dirname(__FILE__) . "/" . $api ."/load_preset_models.php");
        $this->preset_models = $openAI_preset_models;
        require_once (dirname(__FILE__) . "/../../config.php");
        $this->xerte_toolkits_site = $xerte_toolkits_site;
    }
    //check if answer conforms to model
    private function clean_gpt_result($answer)
    {
        //TODO idea: if not correct drop until last closed xml and close rest manually?

        //TODO ensure answer contains no html and xml has no data fields aka remove spaces
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


        $resultConform = $this->clean_gpt_result($result);
        $resultConform = json_decode($resultConform);

        if ($resultConform->error) {
            return (object) ["status" => "error", "message" => "error on api call with type:" . $result->error->type];
        }
        //if (!$this->conform_to_model($resultConform)){
        //    return (object) ["status" => "error", "message" => "answer does not match model"];
        //}
        return $resultConform;
    }

    //generates prompt for openai from preset prompts and user input
    //todo rework to use wildcards
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

    //public function must be ai_request($p, $type) when adding new api
    //todo maybe change this to top level object and extend with api functions?
    public function ai_request($p, $type)
    {
        if (is_null($this->preset_models->type_list[$type]) or $type == "") {
            return (object) ["status" => "error", "message" => "there is no match in type_list for " . $type];
        }
        //todo check for corresponding key to api
        if ($this->xerte_toolkits_site->openAI_key == "") {
            return (object) ["status" => "error", "message" => "there is no corresponding API key"];
        }

        $prompt = $this->generatePrompt($p, $type);

        $results = array();

        $block_size = 6;
        if (in_array($type, $this->preset_models->multi_run) and isset($p['nrq']) and $p['nrq'] > $block_size){

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

        //todo change if lop level is changed
        return "<". $type ." >" . $answer. "</". $type .">";
    }

}
