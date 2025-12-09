<?php
class openai_ai_modelanswer extends openai_model {
	public function __construct($type, $model = null, $context = "standard", $sub_type = null, $model_template = null, $assistantOn = false, $assistantId = null){
		if($assistantId != null){
			$this->assistantId = $assistantId;
		}
		if($assistantOn && $type != "modelanswer") {
			$this->chat_url = "https://api.openai.com/v1/threads/runs";
		}
		$this->assistantOn = $assistantOn;

		if($model == null) {
			$this->model = "gtp-4";
		}else { 
			$this->model = $model;
		}

        if (!preg_match('/^[a-zA-Z]+$/', $type)) {
            die("path traversal detected");
        }

		_load_language_file("/editor/ai_models/anthropic_model_" . strtolower($type) . "_ai.inc");
	}

	public function get_payload() {
		return [
			"model" => $this->model,
			//"max_tokens" => $max_tokens,
			"n" => 1,
			//"temperature" => $this->temperature,
			"messages" => [
				["role" => "system", "content" => MODEL_SYSTEM],
				["role" => "user", "content" => ""]
			]
		];
	}

	public function get_prompt_list() {
		return explode(",", MODEL_PROMPT);
	}
}
