<?php

namespace rag;
require_once (str_replace('\\', '/', __DIR__) . "/BaseRAG.php");
require_once (str_replace('\\', '/', __DIR__) . "/MistralRAG.php");
require_once (str_replace('\\', '/', __DIR__) . "/OpenAIRAG.php");
require_once (str_replace('\\', '/', __DIR__) . "/TfidfRAG.php");

function makeRag(array $cfg)
{
    $provider = $cfg['provider'] ?? 'none';
    $adminEnabled = (bool)($cfg['enabled'] ?? true);

    if ($adminEnabled && $provider === 'openai' && !empty($cfg['api_key'])) {
        return new OpenAIRAG($cfg['api_key'], $cfg['encoding_directory']);
    }

    if ($adminEnabled && $provider === 'mistral' && !empty($cfg['api_key'])) {
        return new MistralRAG($cfg['api_key'], $cfg['encoding_directory']);
    }

    //If no provider (either not recognised or null/empty) default to TfidfRAG
    //an encoding directory must still be provided; it serves as the base 'RAG' directory where all AI-related content is found
    return new TfidfRAG('null', $cfg['encoding_directory']);
}