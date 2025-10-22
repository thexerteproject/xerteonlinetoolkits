<?php
namespace Ai;
use \Exception;
use \CURLFile;

interface AiClientInterface
{
    /**
     * @param array $messages OpenAI-style messages [[role=>'system'|'user'|'assistant', 'content'=>string], ...]
     * @param array $options ['model'=>string, 'max_tokens'=>int, 'temperature'=>float]
     * @return array ['ok'=>bool, 'content'=>string|null, 'raw'=>mixed|null, 'error'=>string|null]
     */
    public function chat(array $messages, array $options = []): array;
}