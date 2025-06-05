<?php

require_once(dirname(__FILE__) . "/../../../../config.php");
_load_language_file("/editor/ai_models/mistral_model_ivoverlaypanel_ai.inc");

//generates questions
$model = $_POST['model'] ?? "mistral-large-latest";
$context = $_POST['context'] ?? 'standard';  // Defaults to 'standard' learning object but can also be bootstrap which requires a different message chain
$subtype = $_POST["prompt"]["subtype"] ?? "text_object";

// URL selection based on whether assistant is activated
$chat_url = "https://api.mistral.ai/v1/chat/completions";

//set default parameters here, override later in case of specific model or context requirements

//Context-specific settings
if ($context === 'standard') {
    switch ($subtype) {
        case 'text_object':
            $q = LEARNING_PROMPT_IVOVERLAYPANEL_TEXT;
            $object = LEARNING_RESULT_IVOVERLAYPANEL_TEXT;
            $defaultPrompt = DEFAULT_PROMPT_IVOVERLAYPANEL_TEXT;
            break;
        case 'mcq':
            $q = LEARNING_PROMPT_IVOVERLAYPANEL_MCQ;
            $object = LEARNING_RESULT_IVOVERLAYPANEL_MCQ;
            $defaultPrompt = DEFAULT_PROMPT_IVOVERLAYPANEL_MCQ;
            break;
    }
}
elseif ($context === 'bootstrap') {
    $q = LEARNING_PROMPT_IVOVERLAYPANEL_BOOTSTRAP;
    $object = LEARNING_RESULT_IVOVERLAYPANEL_BOOTSTRAP;
    $defaultPrompt = DEFAULT_PROMPT_IVOVERLAYPANEL_BOOTSTRAP;
}

//default payload for chat/completions endpoint
$payload = ["model" => $model,
    "max_tokens" => 4096,
    "temperature" => 0.2,
    "messages" => [["role" => "user", "content" => $q],
        ["role" => "assistant", "content" => $object],
        ["role" => "user", "content" => ""]]];


$mistral_preset_models->type_list["ivOverlayPanel"] = ["payload" => $payload, "url" => $chat_url];

$mistral_preset_models->prompt_list["ivOverlayPanel"] = explode(",", $defaultPrompt);

$mistral_preset_models->multi_run[] = "ivOverlayPanel";