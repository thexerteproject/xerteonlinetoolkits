<?php

namespace rag;

class TfidfRAG extends BaseRAG
{
    private $apiKey;

    public function __construct($apiKey, $encodingDirectory, $chunkSize = 2048)
    {
        parent::__construct($encodingDirectory, $chunkSize);
        $this->apiKey = $apiKey;
    }

    protected function supportsProviderEmbeddings(): bool { return false; }

    /*Retrieve an embedding for a single piece of text*/
    protected function getEmbeddings($text): array
    {
        return [];
    }


}
