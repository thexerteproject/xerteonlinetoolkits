<?php

class gemini_model_ivoverlaypanel extends gemini_model
{

    public function __construct(
        $type,
        $model = null,
        $context = "standard",
        $sub_type = null
    )
    {
        if (!preg_match('/^[a-zA-Z]+$/', $type)) {
            die("path traversal detected");
        }

        if ($model !== null) {
            $this->model = $model;
        }

        $this->context = $context;

        _load_language_file(
            "/editor/ai_models/gemini_model_"
            . strtolower($type)
            . "_ai.inc"
        );

        if ($context !== "standard") {
            die("not supported context: " . $context);
        }

        $subtype = $sub_type !== null
            ? $sub_type
            : "text_object";

        switch ($subtype) {
            case "text_object":
                $this->learning_prompt =
                    LEARNING_PROMPT_IVOVERLAYPANEL_TEXT;

                $this->object =
                    LEARNING_RESULT_IVOVERLAYPANEL_TEXT;

                $this->defaultPrompt =
                    DEFAULT_PROMPT_IVOVERLAYPANEL_TEXT;
                break;

            case "mcq":
                $this->learning_prompt =
                    LEARNING_PROMPT_IVOVERLAYPANEL_MCQ;

                $this->object =
                    LEARNING_RESULT_IVOVERLAYPANEL_MCQ;

                $this->defaultPrompt =
                    DEFAULT_PROMPT_IVOVERLAYPANEL_MCQ;
                break;

            default:
                die("unsupported subtype: " . $subtype);
        }
    }
}
