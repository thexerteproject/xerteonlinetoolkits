<?php
require_once(dirname(__FILE__) . "/../../../../config.php");
_load_language_file("/editor/ai_models/openai_model_topxq_ai.inc");

//generates questions
$model = $_POST['model'] ?? "gpt-4o";
$assistantId = $_POST['asst_id'] ?? "asst_IyiBKzr8nvwddAzVKuh6OnlC";
$context = $_POST['context'] ?? 'standard';  // Default to 'standard'
$assistantOn = !empty($_POST['url']) || !empty($_POST['textSnippet']);

// URL selection based on whether assistant is activated
$chat_url = $assistantOn ? "https://api.openai.com/v1/threads/runs" : "https://api.openai.com/v1/chat/completions";

//set default parameters here, override later in case of specific model or context requirements
$instructions = "Follow the instructions in the last message from the user. Use the appropriate uploaded transcript as your source. If no source has been uploaded or the source does not contain information relevant to the subject, and you have been given explicit permission to use knowledge outside of the uploaded file, try to fulfil the request using general knowledge about the specified subject. Regardless of what you end up doing, never return anything except the XML in plaintext. Do not use markdown to denote the xml. Do not add any explanations before or after the xml.";
$additionalInstructions = "When following XML examples, make sure you follow it exactly. This includes formatting, special characters, node structure and everything else. Do not deviate from the example AND how it is presented other than the content and the amount of each type of node and the contents therein. Notably, do NOT use markdown syntax when formatting your answer! Only return plain text.";

// Context-specific settings
if ($context === 'standard') {
    $q = LEARNING_PROMPT_TOPXQ;
    $object = LEARNING_RESULT_TOPXQ;
    $defaultPrompt = DEFAULT_PROMPT_TOPXQ;
}
elseif ($context === 'bootstrap') {
    $q = LEARNING_PROMPT_TOPXQ_BOOTSTRAP;
    $object = LEARNING_RESULT_TOPXQ_BOOTSTRAP;
    $defaultPrompt = DEFAULT_PROMPT_TOPXQ_BOOTSTRAP;
}
if ($assistantOn){
    //default payload for threads/runs endpoint
    $payload = [
        "assistant_id" => $assistantId, // Required: The ID of the assistant to use for the run

        // Optional: If you want to use a specific model other than the default - currently GPT4o which functions most consistently -, uncomment the following line and set the model ID
        // "model" => $model,

        "thread" => [
            "messages" => [
                ["role" => "user", "content" => $q],
                ["role" => "assistant", "content" => $object],
                ["role" => "user", "content" => ""]
            ],
        ],

        // Optional: Uncomment and set instructions to override the assistant's default instructions
        "instructions" => $instructions,

        // Optional: Uncomment and set additional instructions to append to the existing instructions without overriding them
        "additional_instructions" => $additionalInstructions,

        // Optional: Uncomment and add additional messages to the thread before creating the run
        // "additional_messages" => [
        //     ["role" => "user", "content" => "Additional message content"]
        // ],

        // Optional: Uncomment and attach metadata to this run, using key-value pairs
        // "metadata" => [
        //     "key1" => "value1",
        //     "key2" => "value2"
        // ],

        // Optional: Uncomment and override the tools available for this run
        "tools" => [
            //     ["type" => "code_interpreter"],
            ["type" => "file_search"]
        ],

        // Optional: Uncomment and set temperature to control the randomness of the output (between 0 and 2)
        // "temperature" => 0.7,

        // Optional: Uncomment and set top_p for nucleus sampling (considers top_p probability mass)
        // "top_p" => 0.9,

        // Optional: Uncomment to enable streaming of events during the run
        // "stream" => true,

        // Optional: Uncomment and set to limit the maximum number of prompt tokens
        // "max_prompt_tokens" => 500,

        // Optional: Uncomment and set to limit the maximum number of completion tokens
        // "max_completion_tokens" => 500,

        // Optional: Uncomment and set truncation strategy to conrol initial context window of the run
        // "truncation_strategy" => [
        //     "type" => "last_messages",
        //     "last_messages" => 5
        // ],

        // Optional: Uncomment and set tool_choice to control which tool (if any) is called by the model
        "tool_choice" => "required",

        // Optional: Uncomment and set response_format to specify the format that the model must output
        // "response_format" => ["type" => "json_object"],

        // Optional: Uncomment to enable parallel function calling during tool use
        // "parallel_tool_calls" => true,
    ];
}
else{
    //default payload for chat/completions endpoint
    $payload = ["model" => $model,
        "max_tokens" => 3096,
        "n" => 1,
        "temperature" => 0.2,
        "messages" => [["role" => "user", "content" => $q],
            ["role" => "assistant", "content" => $object],
            ["role" => "user", "content" => ""]]];
}


$openAI_preset_models->type_list["topXQ"] = ["payload" => $payload, "url" => $chat_url];

$openAI_preset_models->prompt_list["topXQ"] = explode(",", $defaultPrompt);

$openAI_preset_models->multi_run[] = "topXQ";