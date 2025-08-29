<?php
class anthropic_ai {
	public $context;
	public $prompt_list;
	public $chat_url = "https://api.anthropic.com/v1/messages";
	public $model = "claude-3-5-sonnet-20241022";
	public $temperature = 0.2;
	public $max_tokens = 4096;
	public $learning_prompt;
	public $object;
	public $defaultPrompt;

	public function __construct($type, $model = null, $context = "standard", $sub_type = null){
        $default_model_override = [
            "categories" => "claude-3-haiku-20240307",
            "columnpage" => "claude-3-haiku-20240307",
            "crossword" => "claude-3-haiku-20240307",
            "inventory" => "claude-3-haiku-20240307",
            "mcq" => "claude-3-haiku-20240307",
            "nestedcolumnpage" => "claude-3-haiku-20240307",
            "nestedpage" => "claude-3-haiku-20240307",
            "nestedtab" => "claude-3-haiku-20240307",
            "quiz" => "claude-3-haiku-20240307",
            "topxq" => "claude-3-haiku-20240307",
        ];

		if($model == null) {
			if(isset($default_model_override[$type])){
				$this->model = $default_model_override[$type];
			}
		}else { 
			$this->model = $model;
		}
		_load_language_file("/editor/ai_models/anthropic_model_" . strtolower($type) . "_ai.inc");
		$upper_type = strtoupper($type);
		if ($context === 'standard') {
			$this->learning_prompt = constant("LEARNING_PROMPT_" . $upper_type);
			$this->object = constant("LEARNING_RESULT_" . $upper_type);
			$this->defaultPrompt = constant("DEFAULT_PROMPT_" . $upper_type);
		}
		elseif ($context === 'bootstrap') {
			$this->learning_prompt = constant("LEARNING_PROMPT_" . $upper_type . "_BOOTSTRAP");
			$this->object = constant("LEARNING_RESULT_" . $upper_type . "_BOOTSTRAP");
			$this->defaultPrompt = constant("DEFAULT_PROMPT_" . $upper_type . "_BOOTSTRAP");
		} else {
			die("not supported context: " . $context);
		}
	}

	public function get_payload() {
		return [
			"model" => $this->model,
			"max_tokens" => $this->max_tokens,
			"temperature" => $this->temperature,
			"messages" => [
				["role" => "user", "content" => $this->learning_prompt],
				["role" => "assistant", "content" => $this->object],
				["role" => "user", "content" => ""]
			]
		];
	}

	public function get_chat_url() {
		return $this->chat_url;
	}
	public function get_prompt_list() {
		return explode(",", $this->defaultPrompt);
	}
}
