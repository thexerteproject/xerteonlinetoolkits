<?php

if ($argc > 1) {
    $xmlfile = $argv[1];
    $xml = simplexml_load_file($xmlfile);

    $nodes = $xml->xpath("//vdex:term");

    for ($i=0; $i<count($nodes); $i++)
    {
        $node = $nodes[$i];
        $ns = $node->getNamespaces();
        $c = $node->children($ns['vdex']);
        echo (string)$c->termIdentifier . ' ';
        echo (string)$c->caption->langstring . "\n";

    }

    print_r($nodes, true);
}