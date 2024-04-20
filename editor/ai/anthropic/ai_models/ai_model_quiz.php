<?php
//quiz model using gpt-3.5 turbo
require_once(dirname(__FILE__) . "/../../../../config.php");
_load_language_file("/editor/ai_models/anthropic_model_quiz_ai.inc");

//generates questions
$chat_url = "https://api.anthropic.com/v1/messages";
//TODO Timo, support all 3 models?
$model = "claude-3-haiku-20240307";
$q = LEARNING_PROMPT;
$object = LEARNING_RESULT;

$anthropic_preset_models->type_list["quiz"] = ["payload" => ["model" => $model, "max_tokens" => 4096, "temperature" => 0.2, "messages" => [["role" => "user", "content" => $q], ["role" => "assistant", "content" => $object], ["role" => "user", "content" => ""]]], "url" => $chat_url];

$anthropic_preset_models->prompt_list["quiz"] = explode(",", DEFAULT_PROMPT);

$anthropic_preset_models->multi_run[] = "quiz";