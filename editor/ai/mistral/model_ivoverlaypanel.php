<?php
class mistal_ai_ivoverlaypanel extends mistral_ai {
	public function __construct($type, $model = null, $context = "standard", $sub_type = null){
		if($model == null) {
			$this->model = "mistral-large-latest";
		}else { 
			$this->model = $model;
		}
		_load_language_file("/editor/ai_models/mistral_model_" . strtolower($type) . "_ai.inc");
		if ($context === 'standard') {
				$subtype = "text_object";
				if($sub_type != null) {
					$subtype = $sub_type;
				}
				switch ($subtype) {
					case 'text_object':
						$this->leaning_prompt = LEARNING_PROMPT_IVOVERLAYPANEL_TEXT;
						$this->object = LEARNING_RESULT_IVOVERLAYPANEL_TEXT;
						$this->defaultPrompt = DEFAULT_PROMPT_IVOVERLAYPANEL_TEXT;
						break;
					case 'mcq':
						$this->leaning_prompt = LEARNING_PROMPT_IVOVERLAYPANEL_MCQ;
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
