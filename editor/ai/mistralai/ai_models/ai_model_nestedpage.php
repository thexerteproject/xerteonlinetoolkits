<?php
//columnpage model using gpt-3.5 turbo
require_once(dirname(__FILE__) . "/../../../../config.php");
_load_language_file("/editor/ai_models/mistralai_model_nestedpage_ai.inc");

//generates questions
$model = $_POST['model'] ?? "mistral-large-latest";
$context = $_POST['context'] ?? 'standard';  // Defaults to 'standard' learning object but can also be bootstrap which requires a different message chain

// URL selection based on whether assistant is activated
$chat_url = "https://api.mistral.ai/v1/chat/completions";

//set default parameters here, override later in case of specific model or context requirements

// Context-specific settings
if ($context === 'standard') {
    $q = LEARNING_PROMPT_NESTEDPAGE;
    $object = LEARNING_RESULT_NESTEDPAGE;
    $defaultPrompt = DEFAULT_PROMPT_NESTEDPAGE;
}
elseif ($context === 'bootstrap') {
    $q = LEARNING_PROMPT_NESTEDPAGE_BOOTSTRAP;
    $object = LEARNING_RESULT_NESTEDPAGE_BOOTSTRAP;
    $defaultPrompt = DEFAULT_PROMPT_NESTEDPAGE_BOOTSTRAP;
}

    //default payload for chat/completions endpoint
    $payload = ["model" => $model,
        "max_tokens" => 4096,
        "temperature" => 0.2,
        "messages" => [["role" => "user", "content" => $q],
            ["role" => "assistant", "content" => $object],
            ["role" => "user", "content" => ""]]];


$mistralai_preset_models->type_list["nestedPage"] = ["payload" => $payload, "url" => $chat_url];

$mistralai_preset_models->prompt_list["nestedPage"] = explode(",", $defaultPrompt);

$mistralai_preset_models->multi_run[] = "nestedPage";