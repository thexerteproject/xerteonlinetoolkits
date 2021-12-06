<?php

require_once('../../config.php');

// php rights.php ./vocabularies/copyrightsandotherrestrictions.xml

if ($argc > 1) {

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
        insertRights($tempLabel);
    }
}
/*

function createRightsTable() {
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $q = "CREATE TABLE IF NOT EXISTS {$prefix}oai_rights(
    rights_id INT(11) PRIMARY KEY AUTO_INCREMENT NOT NULL,
    term_id VARCHAR(63) NOT NULL,
    label VARCHAR(255) NOT NULL)";

    db_query($q);
}
*/

function insertRights($label){
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $q = "INSERT INTO {$xerte_toolkits_site->database_table_prefix}syndicationlicenses(license_name) VALUES (?)";
    $params = array($label);
    db_query($q,$params);

}


