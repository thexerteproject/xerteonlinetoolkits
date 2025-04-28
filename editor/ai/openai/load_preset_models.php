<?php
//aggregator for all openai models
global $openAI_preset_models;
$openAI_preset_models = new stdClass();


//dynamically grows when more models are placed in /openai/ai_models/
//workaround to prevent __FILE__ and __dir__ being xdebug in ide
foreach (glob(str_replace('\\', '/', __DIR__) . "/ai_models/*.php") as $model) {
    require_once($model);
}