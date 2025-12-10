<?php
class anthropic_model_ivoverlaypanel extends anthropic_model {

	public function __construct($type, $model = null, $context = "standard", $sub_type = null){
		if($model != null) {
			$this->model = $model;
		}
		$this->context = $context;

        if (!preg_match('/^[a-zA-Z]+$/', $type)) {
            die("path traversal detected");
        }

		_load_language_file("/editor/ai_models/anthropic_model_" . strtolower($type) . "_ai.inc");
		if ($context === 'standard') {
			$subtype = "text_object";
			if($sub_type != null) {
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
		} else {
			die("not supported context: " . $context);
		}
	}
}
