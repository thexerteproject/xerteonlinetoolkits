<?php

// php categories.php "./vocabularies/opleidingsdomeinen.xml" "./vocabularies/domeinoverstijgend.xml"

require_once('../../config.php');


call_user_func(clearCategoryTable);
call_user_func(createCategoryTable);
if ($argc > 1) {

    for ($args = 1; $args < $argc; $args++) {

        $xmlfile = $argv[$args];
        if($xmlfile == "./vocabularies/opleidingsdomeinen.xml"){
            $source_url = "https://vdex.kennisnet.nl/kennisnetset/2015.01/mbo_opleidingsdomeinen_studierichtingen-knset.xml";
        }
        else {
            $source_url = "https://vdex.kennisnet.nl/kennisnetset/2015.01/bve_domeinoverstijgende_vakken-knset.xml";
        }
        echo $source_url;
        $xml = simplexml_load_file($xmlfile);
        $nodes = $xml->xpath("//vdex:term");

        for ($i = 0; $i < count($nodes); $i++) {
            $node = $nodes[$i];
            $ns = $node->getNamespaces();
            $c = $node->children($ns['vdex']);
            $tempTaxon = (string)$c->termIdentifier;
            $tempLabel = (string)$c->caption->langstring;
            call_user_func(insertCategory,$source_url,$tempTaxon,$tempLabel);


        }
    }
    print_r($nodes, true);

}

// Tabel clearen + OAI-Category table creation

// XML inladen

//Namespace parsen

// DataFrame met Naam -> Taxon

// Tables vullen


function createCategoryTable() {
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $q = "CREATE TABLE IF NOT EXISTS oai_categories(
    category_id INT(11) PRIMARY KEY NOT NULL,
    taxon VARCHAR(64) NOT NULL,
    label VARCHAR(255) NOT NULL,
    source_url VARCHAR(255) NOT NULL)";

    db_query($q);
}

function clearCategoryTable() {
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $q = "delete from toolkits_data.syndicationcategories";

    db_query($q);
}

function insertCategory($source_url, $taxon, $label){
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $q = "INSERT INTO toolkits_data.syndicationcategories(category_name) VALUES (?)";
    db_query($q,array($label));

    $q2 = "SELECT category_id,category_name FROM toolkits_data.syndicationcategories WHERE category_name like ?";
    $result = db_query($q2,array($label));
    $return_id = $result[0]['category_id'];

    $q3 = "INSERT INTO toolkits_data.oai_categories(category_id,taxon,label,source_url) VALUES (?,?,?,?)";
    $params = array($return_id,$taxon,$label,$source_url);
    db_query($q3,$params);

}