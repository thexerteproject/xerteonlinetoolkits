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

// php rights.php ./vocabularies/copyrightsandotherrestrictions.xml

if ($argc > 1) {
    createRightsTable();
    clearRightsTable();

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
        insertRights($tempID, $tempLabel);
    }
}

function createRightsTable() {
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $q = "CREATE TABLE IF NOT EXISTS {$prefix}oai_rights(
    rights_id INT(11) PRIMARY KEY NOT NULL,
    term_id VARCHAR(63) NOT NULL,
    label VARCHAR(255) NOT NULL)";

    db_query($q);
}

function clearRightsTable() {
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $q = "delete from {$prefix}syndicationlicenses";
    db_query($q);

    $q = "delete from {$prefix}oai_rights";
    db_query($q);
}

function insertRights($term_id, $label){
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $q = "INSERT INTO {$prefix}syndicationlicenses(license_name) VALUES (?)";
    $params = array($label);
    db_query($q,$params);

    $q2 = "SELECT license_id FROM {$prefix}syndicationlicenses WHERE license_name like ?";
    $result = db_query($q2,array($label));
    $return_id = $result[0]['license_id'];

    $q3 = "INSERT INTO {$prefix}oai_rights(rights_id,term_id,label) VALUES (?,?,?)";
    $params = array($return_id,$term_id,$label);
    $res = db_query($q3,$params);

}


