<?php
//quiz model using gpt-3.5 turbo
require_once(dirname(__FILE__) . "/../../../../config.php");
_load_language_file("/editor/ai_models/openai_model_modelanswer_ai.inc");

//generates questions
$chat_url = "https://api.openai.com/v1/chat/completions";
$model = "gpt-4";

$openAI_preset_models->type_list["modelanswer"] = ["payload" => ["model" => $model, "max_tokens" => 3096, "n" => 1, "temperature" => 0.2, "messages" => [["role" => "system", "content" => MODEL_SYSTEM],["role" => "user", "content" => ""]]], "url" => $chat_url];

$openAI_preset_models->prompt_list["modelanswer"] = explode(",", MODEL_PROMPT);
