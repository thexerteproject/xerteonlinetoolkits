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

    $q = "CREATE TABLE IF NOT EXISTS {$prefix}oai_education(
    education_id INT(11) PRIMARY KEY NOT NULL,
    term_id VARCHAR(63) NOT NULL,
    label VARCHAR(255) NOT NULL)";

    db_query($q);
}

function clearEducationalTable() {
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $q = "delete from {$xerte_toolkits_site->database_table_prefix}educationlevel";
    db_query($q);

    $q = "delete from {$xerte_toolkits_site->database_table_prefix}oai_education";
    db_query($q);
}

function insertEducational($termID, $label){
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $q = "INSERT INTO {$xerte_toolkits_site->database_table_prefix}educationlevel(educationlevel_name) VALUES (?)";
    $res = db_query($q,array($label));

    $q2 = "SELECT educationlevel_id,educationlevel_name FROM {$xerte_toolkits_site->database_table_prefix}educationlevel WHERE educationlevel_name like ?";
    $result = db_query($q2,array($label));
    $return_id = $result[0]['educationlevel_id'];

    $q3 = "INSERT INTO {$xerte_toolkits_site->database_table_prefix}oai_education(education_id,term_id,label) VALUES (?,?,?)";
    $params = array($return_id,$termID,$label);
    $res = db_query($q3,$params);

}


