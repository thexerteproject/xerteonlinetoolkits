<?php
//columnpage model using gpt-3.5 turbo
require_once(dirname(__FILE__) . "/../../../../config.php");
_load_language_file("/editor/ai_models/mistralai_model_hangman_ai.inc");

//generates questions
$model = $_POST['model'] ?? "mistral-large-latest";
$context = $_POST['context'] ?? 'standard';  // Defaults to 'standard' learning object but can also be bootstrap which requires a different message chain

// URL selection based on whether assistant is activated
$chat_url = "https://api.mistral.ai/v1/chat/completions";

//set default parameters here, override later in case of specific model or context requirements

// Context-specific settings
if ($context === 'standard') {
    $q = LEARNING_PROMPT_HANGMAN;
    $object = LEARNING_RESULT_HANGMAN;
    $defaultPrompt = DEFAULT_PROMPT_HANGMAN;
}
elseif ($context === 'bootstrap') {
    $q = LEARNING_PROMPT_HANGMAN_BOOTSTRAP;
    $object = LEARNING_RESULT_HANGMAN_BOOTSTRAP;
    $defaultPrompt = DEFAULT_PROMPT_HANGMAN_BOOTSTRAP;
}

    //default payload for chat/completions endpoint
    $payload = ["model" => $model,
        "max_tokens" => 4096,
        "temperature" => 0.2,
        "messages" => [["role" => "user", "content" => $q],
            ["role" => "assistant", "content" => $object],
            ["role" => "user", "content" => ""]]];


$mistralai_preset_models->type_list["hangman"] = ["payload" => $payload, "url" => $chat_url];

$mistralai_preset_models->prompt_list["hangman"] = explode(",", $defaultPrompt);

$mistralai_preset_models->multi_run[] = "hangman";