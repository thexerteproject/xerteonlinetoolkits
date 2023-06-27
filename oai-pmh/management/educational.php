<?php
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.

 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(PHP_SAPI !== 'cli' || isset($_SERVER['HTTP_USER_AGENT'])) && die('cli only');

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
    $lookup = array();

    foreach ($nodes as $node) {
        $row = array();
        $c = $node->children($ns['vdex']);
        $row['label'] = (string)$c->caption->langstring;
        $row['ID'] = (string)$c->termIdentifier;
        foreach ($relations as $relation){
            $relationChild = $relation->children($ns['vdex']);
                if ((string)$relationChild->sourceTerm == $row['ID'] and (string)$relationChild->relationshipType == "BT") {
                    $row['parent'] = (string)$relationChild->targetTerm;
                    $lookup[$row['ID']] = $row;
                    break;
            }
        }
        $lookup[$row['ID']] = $row;
    }
    insertEducational($lookup);

}
function createEducationalTable() {
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $q = "CREATE TABLE IF NOT EXISTS {$prefix}oai_education(
    education_id INT(11) PRIMARY KEY NOT NULL,
    term_id VARCHAR(63) NOT NULL,
    label VARCHAR(255) NOT NULL,
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

function insertEducational($lookup, $termID = null, $label = null, $parent = null){

    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;
    foreach ($lookup as $i => $row){
        //generate serversideID populate both tables
        $q = "INSERT INTO {$prefix}educationlevel(educationlevel_name) VALUES (?)";
        $serverside_id = db_query_one($q,array($row['label']));
        $lookup[$i]['serverID'] = $serverside_id;
        $q2 = "INSERT INTO {$prefix}oai_education(education_id,term_id,label) VALUES (?,?,?)";
        $params = array($serverside_id, $row['ID'], $row['label']);
        $res = db_query($q2, $params);
    }
    foreach ($lookup as $row){
        if (isset($row['parent'])){
            $q3 = "update {$prefix}educationlevel SET parent_id = ? WHERE educationlevel_id = ?";
            $parent_id = $lookup[$row['parent']]['serverID'];
            $params = array($parent_id, $row['serverID']);
            $res = db_query($q3, $params);
            $q4 = "update {$prefix}oai_education SET parent_id = ? WHERE education_id = ?";
            $res = db_query($q4, $params);
        }
    }

//    $q = "INSERT INTO {$prefix}educationlevel(educationlevel_name) VALUES (?)";
//    $res = db_query($q,array($label));
//
//    $q2 = "SELECT educationlevel_id,educationlevel_name FROM {$prefix}educationlevel WHERE educationlevel_name like ?";
//    $result = db_query($q2,array($label));
//    $return_id = $result[0]['educationlevel_id'];
//
//    $q3 = "INSERT INTO {$prefix}oai_education(education_id,term_id,label,parent_id) VALUES (?,?,?,?)";
//    if (is_null($parent)){
//        $params = array($return_id, $termID, $label, $parent);
//        $res = db_query($q3,$params);
//    } else {
//        $q = "SELECT education_id FROM {$prefix}oai_education WHERE term_id = ?";
//        $parent_id = db_query_one($q, array($parent))["education_id"];
//        $params = array($return_id, $termID, $label, $parent_id);
//        $res = db_query($q3,$params);
//        $q4 = "UPDATE {$prefix}educationlevel SET parent_id = ? WHERE educationlevel_id = ?";
//        $res = db_query($q4,array($parent_id, $return_id));
//    }

}

