<?php
class gemini_model
{
    public $context;

    public $chat_url =
        "https://generativelanguage.googleapis.com/v1beta/interactions";

    public $model = "gemini-3.6-flash";

    /*
     * Null means that Gemini's default temperature is used.
     * Google recommends the default value of 1.0 for Gemini 3 models.
     */
    public $temperature = null;

    /*
     * Retain the existing property name for compatibility with the rest
     * of the application. It is mapped to max_output_tokens below.
     */
    public $max_tokens = 4096;

    public $learning_prompt;
    public $object;
    public $defaultPrompt;

    public function __construct(
        $type,
        $model = null,
        $context = "standard",
        $sub_type = null
    )
    {
        $default_model_override = [
            // "categories" => "gemini-3.6-flash",
            // "columnpage" => "gemini-3.6-flash",
        ];

        if (!preg_match('/^[a-zA-Z]+$/', $type)) {
            die("path traversal detected");
        }

        $this->context = $context;

        if ($model !== null) {
            $this->model = $model;
        } elseif (isset($default_model_override[$type])) {
            $this->model = $default_model_override[$type];
        }

        _load_language_file(
            "/editor/ai_models/gemini_model_"
            . strtolower($type)
            . "_ai.inc"
        );

        $upper_type = strtoupper($type);

        if ($context === "standard") {
            $this->learning_prompt = constant(
                "LEARNING_PROMPT_" . $upper_type
            );

            $this->object = constant(
                "LEARNING_RESULT_" . $upper_type
            );

            $this->defaultPrompt = constant(
                "DEFAULT_PROMPT_" . $upper_type
            );
        } elseif ($context === "bootstrap") {
            $this->learning_prompt = constant(
                "LEARNING_PROMPT_" . $upper_type . "_BOOTSTRAP"
            );

            $this->object = constant(
                "LEARNING_RESULT_" . $upper_type . "_BOOTSTRAP"
            );

            $this->defaultPrompt = constant(
                "DEFAULT_PROMPT_" . $upper_type . "_BOOTSTRAP"
            );
        } else {
            die("not supported context: " . $context);
        }
    }

    public function get_payload()
    {
        $generation_config = [
            "max_output_tokens" => $this->max_tokens,
        ];

        /*
         * Only send temperature when explicitly configured.
         */
        if ($this->temperature !== null) {
            $generation_config["temperature"] = $this->temperature;
        }

        return [
            "model" => $this->model,

            /*
             * user      => learning prompt
             * assistant => expected result
             * user      => actual request, inserted later
             */
            "input" => [
                [
                    "type" => "user_input",
                    "content" => [
                        [
                            "type" => "text",
                            "text" => $this->learning_prompt,
                        ],
                    ],
                ],
                [
                    "type" => "model_output",
                    "content" => [
                        [
                            "type" => "text",
                            "text" => $this->object,
                        ],
                    ],
                ],
                [
                    "type" => "user_input",
                    "content" => [
                        [
                            "type" => "text",
                            "text" => "",
                        ],
                    ],
                ],
            ],

            "generation_config" => $generation_config,

            /*
             * This application is sending the complete context with every
             * request, so server-side interaction storage is unnecessary.
             */
            "store" => false,
        ];
    }

    public function get_chat_url()
    {
        return $this->chat_url;
    }

    public function get_prompt_list()
    {
        return explode(",", $this->defaultPrompt);
    }
}