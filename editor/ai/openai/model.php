<?php
class  openai_ai {
	private $model = "gpt-4o";
	private $assistantId = "asst_IyiBKzr8nvwddAzVKuh6OnlC";
	protected $chat_url = "https://api.openai.com/v1/chat/completions";
	protected $temperature = 0.2;
	protected $max_tokens = 3096;
	protected $learning_prompt;
	protected $object;
	protected $defaultPrompt;
	protected $assistantOn = false;
	private $instructions = "Follow the instructions in the last message from the user. Use the appropriate transcript, which has been mentioned in the message history, as your source. If no source has been provided or the source does not contain information relevant to the subject, try to fulfil the request using general knowledge about the specified subject. Regardless of what you end up doing, never return anything except the XML in plaintext. Do not use markdown to denote the xml. Do not add any explanations before or after the xml.";
	private $additionalInstructions = "When following XML examples, make sure you follow it exactly. This includes formatting, special characters, node structure and everything else. Do not deviate from the example AND how it is presented other than the content and the amount of each type of node and the contents therein. Notably, do NOT use markdown syntax when formatting your answer! Only return plain text.";

	public function __construct($type, $model = null, $context = "standard", $sub_type = null, $model_template = null, $assistantOn = false, $assistantId = null){
		if($assistantId != null){
			$this->assistantId = $assistantId;
		}
		if($assistantOn && $type != "modelanswer") {
			$this->chat_url = "https://api.openai.com/v1/threads/runs";
		}
		$this->assistantOn = $assistantOn;

        $default_model_override = [
			"learningobject" => "gpt-3.5-turbo",
        ];
		
		$temperature_override = [
			"infostep" => 0.8,
			"mcqstep" => 0.8,
			"resultstep" => 0.8,
		];
		if(isset($temperature_override[$type])){
			$this->temperature = $temperature_override[$type];
		}

		if($model == null) {
			if(isset($default_model_override[$type])){
				$this->model = $default_model_override[$type];
			}
		}else { 
			$this->model = $model;
		}

		if($type == "quiz") {
			// diffrence with default is "or file as your source"
			$this->instructions = "Follow the instructions in the last message from the user. Use the appropriate uploaded transcript or file as your source. If no source has been uploaded or the source does not contain information relevant to the subject, and you have been given explicit permission to use knowledge outside of the uploaded file, try to fulfil the request using general knowledge about the specified subject. Regardless of what you end up doing, never return anything except the XML in plaintext. Do not use markdown to denote the xml. Do not add any explanations before or after the xml.";
		}

        if (!preg_match('/^[a-zA-Z]+$/', $type)) {
            die("path traversal detected");
        }

		_load_language_file("/editor/ai_models/openai_model_" . strtolower($type) . "_ai.inc");
		$upper_type = strtoupper($type);
		if ($context === 'standard') {
			$this->learning_prompt = constant("LEARNING_PROMPT_" . $upper_type);
			$this->object = constant("LEARNING_RESULT_" . $upper_type);
			$this->defaultPrompt = constant("DEFAULT_PROMPT_" . $upper_type);
		} elseif ($context === 'bootstrap') {
			$this->learning_prompt = constant("LEARNING_PROMPT_" . $upper_type . "_BOOTSTRAP");
			$this->object = constant("LEARNING_RESULT_" . $upper_type . "_BOOTSTRAP");
			$this->defaultPrompt = constant("DEFAULT_PROMPT_" . $upper_type . "_BOOTSTRAP");
		} else {
			die("not supported context: " . $context);
		}	
	}

	public function get_payload() {
		if ($this->assistantOn) {
				//default payload for threads/runs endpoint
				return [
					"assistant_id" => $this->assistantId, // Required: The ID of the assistant to use for the run

					// Optional: If you want to use a specific model other than the default - currently GPT4o which functions most consistently -, uncomment the following line and set the model ID
					// "model" => $model,

					"thread" => [
						"messages" => [
							["role" => "user", "content" => $this->learning_prompt],
							["role" => "assistant", "content" => $this->object],
							["role" => "user", "content" => ""]
						],
					],

					// Optional: Uncomment and set instructions to override the assistant's default instructions
					"instructions" => $this->instructions,

					// Optional: Uncomment and set additional instructions to append to the existing instructions without overriding them
					"additional_instructions" => $this->additionalInstructions,

					// Optional: Uncomment and add additional messages to the thread before creating the run
					// "additional_messages" => [
					//     ["role" => "user", "content" => "Additional message content"]
					// ],

					// Optional: Uncomment and attach metadata to this run, using key-value pairs
					// "metadata" => [
					//     "key1" => "value1",
					//     "key2" => "value2"
					// ],

					// Optional: Uncomment and override the tools available for this run
					//"tools" => [
						//     ["type" => "code_interpreter"],
						//["type" => "file_search"]
					//],

					// Optional: Uncomment and set temperature to control the randomness of the output (between 0 and 2)
					// "temperature" => 0.7,

					// Optional: Uncomment and set top_p for nucleus sampling (considers top_p probability mass)
					// "top_p" => 0.9,

					// Optional: Uncomment to enable streaming of events during the run
					// "stream" => true,

					// Optional: Uncomment and set to limit the maximum number of prompt tokens
 					// "max_prompt_tokens" => 500,

					// Optional: Uncomment and set to limit the maximum number of completion tokens
					// "max_completion_tokens" => 500,

					// Optional: Uncomment and set truncation strategy to conrol initial context window of the run
					// "truncation_strategy" => [
					//     "type" => "last_messages",
					//     "last_messages" => 5
					// ],

					// Optional: Uncomment and set tool_choice to control which tool (if any) is called by the model
					//"tool_choice" => "required",

					// Optional: Uncomment and set response_format to specify the format that the model must output
					// "response_format" => ["type" => "json_object"],

					// Optional: Uncomment to enable parallel function calling during tool use
					// "parallel_tool_calls" => true,
				];
			} else {
				//default payload for chat/completions endpoint
				return [
					"model" => $this->model,
					"max_tokens" => $this->max_tokens,
					"n" => 1,
					"temperature" => $this->temperature,
					"messages" => [
						["role" => "user", "content" => $this->learning_prompt],
						["role" => "assistant", "content" => $this->object],
						["role" => "user", "content" => ""]
					]
				];
			}
	}

	public function get_chat_url() {
		return $this->chat_url;
	}
	public function get_prompt_list() {
		return explode(",", $this->defaultPrompt);
	}
}
