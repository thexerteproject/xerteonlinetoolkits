<?php

require_once('../../config.php');

$xmlfile = $argv[1];

$source_url = $xmlfile;
$xml = simplexml_load_file($xmlfile);

$ns = $xml->getNamespaces();
if (isset($ns['']))
{
    // Register default name space and call it vdex
    $xml->registerXPathNamespace('vdex', $ns['']);
}

$nodes = $xml->xpath('//vdex:term');
// Pls help haha


echo count($nodes);
for ($i = 0; $i < count($nodes); $i++) {
    $node = $nodes[$i];

    //$ns = $node->getNamespaces();
    $c = $node->children();

    //$tempTaxon = (string)$c->termIdentifier;
    $tempLabel = (string)$c->caption->langstring;
    echo $tempLabel;

}


