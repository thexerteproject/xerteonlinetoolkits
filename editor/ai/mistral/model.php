<?php
class mistral_ai {
	private $model = "mistral-large-latest";
	private $chat_url = "https://api.mistral.ai/v1/chat/completions";
	private $leaning_prompt;
	private $object;
	private $defaultPrompt;
	private $max_tokens = 4096;
	private $temperature = 0.2;

	public function __construct($type, $model = null, $context = "standard", $sub_type = null){
        $default_model_override = [
        ];

		if($model == null) {
			if(isset($default_model_override[$type])){
				$this->model = $default_model_override[$type];
			}
		}else { 
			$this->model = $model;
		}
		_load_language_file("/editor/ai_models/mistral_model_" . $type . "_ai.inc");
		$upper_type = strtoupper($type);
		if ($context === 'standard') {
			$this->leaning_prompt = constant("LEARNING_PROMPT_" . $upper_type);
			$this->object = constant("LEARNING_RESULT_" . $upper_type);
			$this->defaultPrompt = constant("DEFAULT_PROMPT_" . $upper_type);
		} elseif ($context === 'bootstrap') {
			$this->leaning_prompt = constant("LEARNING_PROMPT_" . $upper_type . "_BOOTSTRAP");
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
				["role" => "user", "content" => $this->leaning_prompt],
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
