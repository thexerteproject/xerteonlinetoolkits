<?php

// php categories.php https://vdex.kennisnet.nl/kennisnetset/2015.01/mbo_opleidingsdomeinen_studierichtingen-knset.xml https://vdex.kennisnet.nl/kennisnetset/2015.01/bve_domeinoverstijgende_vakken-knset.xml

require_once('../../config.php');


if ($argc > 1) {
    clearCategoryTable();
    createCategoryTable();
    $lookup = [];
    for ($args = 1; $args < $argc; $args++) {

        $xmlfile = $argv[$args];
        $source_url = $xmlfile;
        echo $source_url . "\n";
        $xml = simplexml_load_file($xmlfile);

        $nodes = $xml->xpath('//vdex:term');
        $relations = $xml->xpath("//vdex:relationship");

        foreach ($nodes as $node) {
            $row = [];
            $ns = $node->getNamespaces();
            $c = $node->children($ns['vdex']);
            $row[label] = (string)$c->caption->langstring;
            $row[ID] = (string)$c->termIdentifier;
            $row[url] = $source_url;
            foreach ($relations as $relation){
                $relationChild = $relation->children($ns['vdex']);
                if ((string)$relationChild->sourceTerm == $row[ID] and (string)$relationChild->relationshipType == "BT") {
                    $row[parent] = (string)$relationChild->targetTerm;
                    $lookup[$row[ID]] = $row;
                    break;
                }
            }
            $lookup[$row[ID]] = $row;
        }
    }
    insertCategory($lookup);
}
else
{
    echo "Specify all the desired references i.e.\n";
    echo "php categories.php https://vdex.kennisnet.nl/kennisnetset/2015.01/mbo_opleidingsdomeinen_studierichtingen-knset.xml https://vdex.kennisnet.nl/kennisnetset/2015.01/bve_domeinoverstijgende_vakken-knset.xml
\n";
}

// Tabel clearen + OAI-Category table creation

// XML inladen

//Namespace parsen

// DataFrame met Naam -> Taxon

// Tables vullen


function createCategoryTable() {
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $q = "CREATE TABLE IF NOT EXISTS {$prefix}oai_categories(
    category_id INT(11) PRIMARY KEY NOT NULL,
    taxon VARCHAR(64) NOT NULL,
    label VARCHAR(255) NOT NULL,
    source_url VARCHAR(255) NOT NULL,
    parent_id INT(11))";

    db_query($q);
}

function clearCategoryTable() {
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $q = "delete from {$xerte_toolkits_site->database_table_prefix}syndicationcategories";

    db_query($q);

    $q = "delete from {$xerte_toolkits_site->database_table_prefix}oai_categories";

    db_query($q);
}

function insertCategory($lookup)
{
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    foreach ($lookup as $i => $row) {
        //generate serversideID populate both tables
        $q = "INSERT INTO {$prefix}syndicationcategories(category_name) VALUES (?)";
        $serverside_id = db_query_one($q, array($row[label]));
        $lookup[$i][serverID] = $serverside_id;
        $q2 = "INSERT INTO {$prefix}oai_categories(category_id,taxon,label,source_url) VALUES (?,?,?,?)";
        $params = array($serverside_id, $row[ID], $row[label], $row[url]);
        $res = db_query($q2, $params);
    }
    foreach ($lookup as $row){
        if (!is_null($row[parent])){
            $q3 = "update {$prefix}syndicationcategories SET parent_id = ? WHERE category_id = ?";
            $parent_id = $lookup[$row[parent]][serverID];
            $params = array($parent_id, $row[serverID]);
            $res = db_query($q3, $params);
            $q4 = "update {$prefix}oai_categories SET parent_id = ? WHERE category_id = ?";
            $res = db_query($q4, $params);
        }
    }
}

//    $q3 = "INSERT INTO {$xerte_toolkits_site->database_table_prefix}oai_categories(category_id,taxon,label,source_url,parent_id) VALUES (?,?,?,?,?)";
//    if (is_null($parent)) {
//        $params = array($return_id, $taxon, $label, $source_url, null);
//        db_query($q3,$params);
//    } else {
//        $q ="SELECT category_id FROM {$xerte_toolkits_site->database_table_prefix}oai_categories WHERE taxon = ?";
//        $parent_id = db_query_one($q, array($parent))["category_id"];
//        $params = array($return_id, $taxon, $label, $source_url, $parent_id);
//        db_query($q3,$params);
//        $q4 = "UPDATE {$xerte_toolkits_site->database_table_prefix}syndicationcategories SET parent_id = ? WHERE category_id = ?";
//        db_query($q4,array($parent_id, $return_id));
//    }
