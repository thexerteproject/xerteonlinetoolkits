<?php
//columnpage model using gpt-3.5 turbo
require_once(dirname(__FILE__) . "/../../../../config.php");
_load_language_file("/editor/ai_models/anthropic_model_nestedtab_ai.inc");

//generates questions
$model = $_POST['model'] ?? "claude-3-haiku-20240307";
$context = $_POST['context'] ?? 'standard';  // Defaults to 'standard' learning object but can also be bootstrap which requires a different message chain

// URL selection based on whether assistant is activated
$chat_url = "https://api.anthropic.com/v1/messages";

//set default parameters here, override later in case of specific model or context requirements

// Context-specific settings
if ($context === 'standard') {
    $q = LEARNING_PROMPT_NESTEDTAB;
    $object = LEARNING_RESULT_NESTEDTAB;
    $defaultPrompt = DEFAULT_PROMPT_NESTEDTAB;
}
elseif ($context === 'bootstrap') {
    $q = LEARNING_PROMPT_NESTEDTAB_BOOTSTRAP;
    $object = LEARNING_RESULT_NESTEDTAB_BOOTSTRAP;
    $defaultPrompt = DEFAULT_PROMPT_NESTEDTAB_BOOTSTRAP;
}

    //default payload for chat/completions endpoint
    $payload = ["model" => $model,
        "max_tokens" => 4096,
        "temperature" => 0.2,
        "messages" => [["role" => "user", "content" => $q],
            ["role" => "assistant", "content" => $object],
            ["role" => "user", "content" => ""]]];


$anthropic_preset_models->type_list["nestedTab"] = ["payload" => $payload, "url" => $chat_url];

$anthropic_preset_models->prompt_list["nestedTab"] = explode(",", $defaultPrompt);

$anthropic_preset_models->multi_run[] = "nestedTab";