<?php

require_once('../../config.php');

// php educational.php ./vocabularies/leerniveaus-knset.xml

if ($argc > 1) {
    createEducationalTable();
    clearEducationalTable();
    $xmlfile = $argv[1];

    $source_url = $xmlfile;
    $xml = simplexml_load_file($xmlfile);

    $ns = $xml->getNamespaces();

    $nodes = $xml->xpath('//vdex:term');

    for ($i = 0; $i < count($nodes); $i++) {
        $node = $nodes[$i];

        $c = $node->children($ns['vdex']);

        $tempLabel = (string)$c->caption->langstring;
        $tempID = (string)$c->termIdentifier;

        insertEducational($tempID,$tempLabel);
    }
}
function createEducationalTable() {
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $q = "CREATE TABLE IF NOT EXISTS {$prefix}oai_educational(
    educational_id INT(11) PRIMARY KEY AUTO_INCREMENT NOT NULL,
    term_id VARCHAR(63) NOT NULL,
    label VARCHAR(255) NOT NULL)";

    db_query($q);
}

function clearEducationalTable() {
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $q = "delete from {$xerte_toolkits_site->database_table_prefix}oai_educational";

    db_query($q);
}

function insertEducational($termID, $label){
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $q = "INSERT INTO {$xerte_toolkits_site->database_table_prefix}oai_educational(term_id,label) VALUES (?,?)";
    $params = array($termID,$label);
    db_query($q,$params);

}


