<?php
class openai_ai_decision extends openai_ai {
	public function __construct($type, $model = null, $context = "standard", $sub_type = null, $model_template = null, $assistantOn = false, $assistantId = null){
		if($assistantId != null){
			$this->assistantId = $assistantId;
		}
		if($assistantOn && $type != "modelanswer") {
			$this->chat_url = "https://api.openai.com/v1/threads/runs";
		}
		$this->assistantOn = $assistantOn;

		$this->temperature = 0.8;

		if($model != null) {
			$this->model = $model;
		}

		_load_language_file("/editor/ai_models/openai_model_" . $type . "_ai.inc");
		$upper_type = strtoupper($type);
		if ($context === 'standard') {
			$modelTemplate = "standard";
			if ($model_template != null) {
				$modelTemplate = $model_template;
			}
			if ($modelTemplate == 'suggestion') {
				$this->learning_prompt = LEARNING_PROMPT_DECISION_SUGGEST;
				$this->object = LEARNING_RESULT_DECISION_SUGGEST;
				$this->defaultPrompt = DEFAULT_PROMPT_DECISION_SUGGEST;
			} elseif ($modelTemplate == 'construct') {
				$this->learning_prompt = LEARNING_PROMPT_DECISION_CONSTRUCT;
				$this->object = LEARNING_RESULT_DECISION_CONSTRUCT;
				$this->defaultPrompt = DEFAULT_PROMPT_DECISION_CONSTRUCT;
			} else {
				$this->learning_prompt = LEARNING_PROMPT_DECISION;
				$this->object = LEARNING_RESULT_DECISION;
				$this->defaultPrompt = DEFAULT_PROMPT_DECISION;
			}
		} elseif ($context === 'bootstrap') {
			$this->learning_prompt = constant("LEARNING_PROMPT_" . $upper_type . "_BOOTSTRAP");
			$this->object = constant("LEARNING_RESULT_" . $upper_type . "_BOOTSTRAP");
			$this->defaultPrompt = constant("DEFAULT_PROMPT_" . $upper_type . "_BOOTSTRAP");
		} else {
			die("not supported context: " . $context);
		}	
	}
}
