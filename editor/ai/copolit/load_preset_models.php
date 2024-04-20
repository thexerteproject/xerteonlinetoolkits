<?php
//aggregator for all copilot models
global $copilot_preset_models;

//dynamically grows when more models are placed in /openai/ai_models/
//workaround to prevent __FILE__ and __dir__ being xdebug in ide
$dir = __DIR__;
foreach (glob($dir . "/ai_models/*.php") as $model) {
    require_once($model);
}