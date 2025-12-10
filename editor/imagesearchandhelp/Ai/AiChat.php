<?php

namespace Ai;

require_once (str_replace('\\', '/', __DIR__) . "/AiClientInterface.php");
require_once (str_replace('\\', '/', __DIR__) . "/AnthropicClient.php");
require_once (str_replace('\\', '/', __DIR__) . "/MistralClient.php");
require_once (str_replace('\\', '/', __DIR__) . "/OpenAIClient.php");

class AiChat
{
    private $clients = [];

    public function __construct($site)
    {
        if (!empty($site->openai_key)) {
            $this->clients['openai'] = new OpenAIClient($site->openai_key);
        }
        if (!empty($site->anthropic_key)) {
            $this->clients['anthropic'] = new AnthropicClient($site->anthropic_key);
        }
        if (!empty($site->mistral_key)) {
            $this->clients['mistral'] = new MistralClient($site->mistral_key);
        }
    }

    public function complete(array $messages, $provider = 'mistral', array $options = [])
    {
        if (!isset($this->clients[$provider])) {
            return ['ok' => false, 'error' => "AI provider '$provider' is not configured."];
        }
        return $this->clients[$provider]->chat($messages, $options);
    }
}