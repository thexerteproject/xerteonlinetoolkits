<?php

require_once('../../config.php');

// php educational.php ./vocabularies/vdex_context_czp_20060628.xml

if ($argc > 1) {
    createEducationalTable();

    $xmlfile = $argv[1];

    $source_url = $xmlfile;
    $xml = simplexml_load_file($xmlfile);

    $ns = $xml->getNamespaces();
    if (isset($ns[''])) {
        // Register default name space and call it vdex
        $xml->registerXPathNamespace('vdex', $ns['']);
    }

    $nodes = $xml->xpath('//vdex:term');


    for ($i = 0; $i < count($nodes); $i++) {
        $node = $nodes[$i];

        $c = $node->children();

        $tempLabel = (string)$c->caption->langstring;
        $tempID = (string)$c->termIdentifier;
        $tempDescription = (string)$c->description->langstring;

        insertEducational($tempID,$tempLabel,$tempDescription);
    }
}
function createEducationalTable() {
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $q = "CREATE TABLE IF NOT EXISTS {$prefix}oai_educational(
    educational_id INT(11) PRIMARY KEY AUTO_INCREMENT NOT NULL,
    term_id VARCHAR(63) NOT NULL,
    label VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL)";

    db_query($q);
}

function insertEducational($termID, $label, $description){
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $q = "INSERT INTO {$xerte_toolkits_site->database_table_prefix}oai_educational(term_id,label,description) VALUES (?,?,?)";
    $params = array($termID,$label,$description);
    db_query($q,$params);

}


