<?php
class openai_model_ivoverlaypanel extends openai_model {
	public function __construct($type, $model = null, $context = "standard", $sub_type = null, $model_template = null, $assistantOn = false, $assistantId = null){
        $assistantOn = false; //remove assistantOn at some point, its a relic of a different api ver.
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

		_load_language_file("/editor/ai_models/openai_model_" . strtolower($type) . "_ai.inc");
		if ($context === 'standard') {
			$subtype = "text_object";
			if ($sub_type != null) {
				$subtype = $sub_type;
			}
			switch ($subtype) {
				case 'text_object':
					$this->learning_prompt = LEARNING_PROMPT_IVOVERLAYPANEL_TEXT;
					$this->object = LEARNING_RESULT_IVOVERLAYPANEL_TEXT;
					$this->defaultPrompt = DEFAULT_PROMPT_IVOVERLAYPANEL_TEXT;
					break;
				case 'mcq':
					$this->learning_prompt = LEARNING_PROMPT_IVOVERLAYPANEL_MCQ;
					$this->object = LEARNING_RESULT_IVOVERLAYPANEL_MCQ;
					$this->defaultPrompt = DEFAULT_PROMPT_IVOVERLAYPANEL_MCQ;
					break;
				default:
					die("unsupported subtype: " . $subtype);
			}
		} elseif ($context === 'bootstrap') {
            $upper_type='IVOVERLAYPANEL';
			$this->learning_prompt = constant("LEARNING_PROMPT_" . $upper_type . "_BOOTSTRAP");
			$this->object = constant("LEARNING_RESULT_" . $upper_type . "_BOOTSTRAP");
			$this->defaultPrompt = constant("DEFAULT_PROMPT_" . $upper_type . "_BOOTSTRAP");
		} else {
			die("not supported context: " . $context);
		}
	}
}
