<?php
//aggregator for all openai models
global $openAI_preset_models;

//error handling set via same parameter as config.php
ini_set('error_reporting', 0);
if ($development) {
    ini_set('error_reporting', E_ALL);
    // Change this to where you want the XOT log file to go;
    // the webserver will need to be able to write to it.
    define('XOT_DEBUG_LOGFILE', dirname(__FILE__) . '/error_logs/debug.log');
}

//dynamically grows when more models are placed in /openai/ai_models/
//workaround to prevent __FILE__ and __dir__ being xdebug in ide
$dir = __DIR__;
foreach (glob($dir . "/ai_models/*.php") as $model) {
    require_once($model);
}