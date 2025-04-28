<?php
//columnpage model using gpt-3.5 turbo
require_once(dirname(__FILE__) . "/../../../../config.php");
_load_language_file("/editor/ai_models/anthropic_model_grid_ai.inc");

//generates questions
$model = $_POST['model'] ?? "claude-3-5-sonnet-20241022";
$context = $_POST['context'] ?? 'standard';  // Defaults to 'standard' learning object but can also be bootstrap which requires a different message chain

// URL selection based on whether assistant is activated
$chat_url = "https://api.anthropic.com/v1/messages";

//set default parameters here, override later in case of specific model or context requirements

// Context-specific settings
if ($context === 'standard') {
    $q = LEARNING_PROMPT_GRID;
    $object = LEARNING_RESULT_GRID;
    $defaultPrompt = DEFAULT_PROMPT_GRID;
}
elseif ($context === 'bootstrap') {
    $q = LEARNING_PROMPT_GRID_BOOTSTRAP;
    $object = LEARNING_RESULT_GRID_BOOTSTRAP;
    $defaultPrompt = DEFAULT_PROMPT_GRID_BOOTSTRAP;
}

    //default payload for chat/completions endpoint
    $payload = ["model" => $model,
        "max_tokens" => 4096,
        "temperature" => 0.2,
        "messages" => [["role" => "user", "content" => $q],
            ["role" => "assistant", "content" => $object],
            ["role" => "user", "content" => ""]]];


$anthropic_preset_models->type_list["grid"] = ["payload" => $payload, "url" => $chat_url];

$anthropic_preset_models->prompt_list["grid"] = explode(",", $defaultPrompt);

$anthropic_preset_models->multi_run[] = "grid";