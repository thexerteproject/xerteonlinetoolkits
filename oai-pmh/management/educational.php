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
    $relations = $xml->xpath("//vdex:relationship");

    for ($i = 0; $i < count($nodes); $i++) {
        $tempParent = null;
        $node = $nodes[$i];
        $c = $node->children($ns['vdex']);

        foreach ($relations as $relation){
            $relationChild = $relation->children($ns['vdex']);
            if ((string)$relationChild->sourceTerm == (string)$c->termIdentifier and (string)$relationChild->relationshipType == "BT"){
                $tempParent = (string)$relationChild->targetTerm;
                break;
                }
            }

        $tempLabel = (string)$c->caption->langstring;
        $tempID = (string)$c->termIdentifier;

        insertEducational($tempID,$tempLabel, $tempParent);
    }
}
function createEducationalTable() {
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $q = "CREATE TABLE IF NOT EXISTS {$prefix}oai_education(
    education_id INT(11) PRIMARY KEY NOT NULL,
    term_id VARCHAR(63) NOT NULL,
    label VARCHAR(255) NOT NULL
    parent_id INT(11))";

    db_query($q);
}

function clearEducationalTable() {
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $q = "delete from {$prefix}educationlevel";
    db_query($q);

    $q = "delete from {$prefix}oai_education";
    db_query($q);
}

function insertEducational($termID, $label, $parent = null){
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $q = "INSERT INTO {$prefix}educationlevel(educationlevel_name) VALUES (?)";
    $res = db_query($q,array($label));

    $q2 = "SELECT educationlevel_id,educationlevel_name FROM {$prefix}educationlevel WHERE educationlevel_name like ?";
    $result = db_query($q2,array($label));
    $return_id = $result[0]['educationlevel_id'];

    $q3 = "INSERT INTO {$prefix}oai_education(education_id,term_id,label,parent_id) VALUES (?,?,?,?)";
    if (is_null($parent)){
        $params = array($return_id, $termID, $label, $parent);
        $res = db_query($q3,$params);
    } else {
        $q = "SELECT education_id FROM {$prefix}oai_education WHERE term_id = ?";
        $parent_id = db_query_one($q, array($parent))["education_id"];
        $params = array($return_id, $termID, $label, $parent_id);
        $res = db_query($q3,$params);
        $q4 = "UPDATE {$prefix}educationlevel SET parent_id = ? WHERE educationlevel_id = ?";
        $res = db_query($q4,array($parent_id, $return_id));
    }


}

