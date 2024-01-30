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

require_once('oaiserver.php');
require_once('../config.php');
if (!file_exists("oai_config.php"))
{
    die("oai-pmh is not available");
}
require_once('oai_config.php');
require_once(__DIR__ . "/../website_code/php/template_library.php");

/**
 * Identifier settings. It needs to have proper values to reflect the settings of the data provider.
 * Is MUST be declared in this order
 *
 * - $identifyResponse['repositoryName'] : compulsory. A human readable name for the repository;
 * - $identifyResponse['baseURL'] : compulsory. The base URL of the repository;
 * - $identifyResponse['protocolVersion'] : compulsory. The version of the OAI-PMH supported by the repository;
 * - $identifyResponse['earliestDatestamp'] : compulsory. A UTCdatetime that is the guaranteed lower limit of all datestamps recording changes, modifications, or deletions in the repository. A repository must not use datestamps lower than the one specified by the content of the earliestDatestamp element. earliestDatestamp must be expressed at the finest granularity supported by the repository.
 * - $identifyResponse['deletedRecord'] : the manner in which the repository supports the notion of deleted records. Legitimate values are no ; transient ; persistent with meanings defined in the section on deletion.
 * - $identifyResponse['granularity'] : the finest harvesting granularity supported by the repository. The legitimate values are YYYY-MM-DD and YYYY-MM-DDThh:mm:ssZ with meanings as defined in ISO8601.
 *
 */
// based on original work from the PHP Laravel framework
if (!function_exists('str_contains')) {
    function str_contains($haystack, $needle) {
        return $needle !== '' && mb_strpos($haystack, $needle) !== false;
    }
}


$identifyResponse = array();
$identifyResponse["repositoryName"] = $xerte_toolkits_site->name ;
$identifyResponse["baseURL"] =  $xerte_toolkits_site->site_url . 'oai-pmh/oai.php'; //'http://198.199.108.242/~neis/oai_pmh/oai.php';
$identifyResponse["protocolVersion"] = '2.0';
$identifyResponse['adminEmail'] = $config['adminEmail']; //'danielneis@gmail.com';
$identifyResponse["earliestDatestamp"] = call_user_func('getEarliestDatestamp') . "T00:00:00Z";//'2013-01-01T12:00:00Z';
$identifyResponse["deletedRecord"] = 'persistent'; // How your repository handles deletions
// no:             The repository does not maintain status about deletions.
//                It MUST NOT reveal a deleted status.
// persistent:    The repository persistently keeps track about deletions
//                with no time limit. It MUST consistently reveal the status
//                of a deleted record over time.
// transient:   The repository does not guarantee that a list of deletions is
//                maintained. It MAY reveal a deleted status for records.
$identifyResponse["granularity"] = 'YYYY-MM-DDThh:mm:ssZ';

/* unit tests ;) */
if (!isset($args)) {
    $args = $_GET;
}
if (!isset($uri)) {
    $uri = $xerte_toolkits_site->site_url . 'oai-pmh/oai.php';
}
$oai2 = new OAIServer($uri, $args, $identifyResponse,
    array(
        'ListMetadataFormats' =>
            function($identifier = '') {
                if (!empty($identifier) && $identifier != 'a.b.c') {
                    throw new OAIException('idDoesNotExist');
                }
                return
                    array(
                        'lom_ims' => array('metaDataPrefix'=>'lom_ims',
                            'schema'=>'http://www.imsglobal.org/xsd/imsmd_v1p2p4.xsd',
                            'metadataNamespace'=> 'http://www.imsglobal.org/xsd/imsmd_v1p2',
                        ),
                        'oai_dc' => array('metadataPrefix'=>'oai_dc',
                            'schema'=>'http://www.openarchives.org/OAI/2.0/oai_dc.xsd',
                            'metadataNamespace'=>'http://www.openarchives.org/OAI/2.0/oai_dc/',
                            'record_prefix'=>'dc',
                            'record_namespace' => 'http://purl.org/dc/elements/1.1/'));

            },

        'ListSets' =>
            function($resumptionToken = '') {
                return
                    array (
                        array('setSpec'=>'class:collection', 'setName'=>'Collections'),
                        array('setSpec'=>'math', 'setName'=>'Mathematics') ,
                        array('setSpec'=>'phys', 'setName'=>'Physics'),
                        array('setSpec'=>'phdthesis', 'setName'=>'PHD Thesis',
                            'setDescription'=>
                                '<oai_dc:dc xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" '.
                                ' xmlns:dc="http://purl.org/dc/elements/1.1/" '.
                                ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '.
                                ' xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/ '.
                                ' http://www.openarchives.org/OAI/2.0/oai_dc.xsd"> '.
                                ' <dc:description>This set contains metadata describing '.
                                ' electronic music recordings made during the 1950ies</dc:description> '.
                                ' </oai_dc:dc>'));

            },

        'ListRecords' =>
            function($metadataPrefix, $from, $until, $set = '', $count = false, $deliveredRecords = 0, $maxItems = 0){
                if ($count) {
                    return 1;
                }
                if ($set != '') {
                    throw new OAIException('noSetHierarchy');
                }
                $records = call_user_func('getTemplates', $metadataPrefix,$from, $until);
                return $records;
            },

        'GetRecord' =>
            function($identifier, $metadataPrefix){

                //TODO: Test whether identifier is in the right format and parse identifier to template_id
                global $xerte_toolkits_site;

                if(str_contains($identifier, $xerte_toolkits_site->site_url)) {
                    $parsed_identifier = explode($xerte_toolkits_site->site_url, $identifier)[1];
                }
                else{
                    throw new OAIException('idDoesNotExist');
                }

                $response_record = call_user_func(getSingleTemplate,$metadataPrefix, $parsed_identifier);
                return $response_record;
            },
    )
);




$response = $oai2->response();
if (isset($return)) {
    return $response;
} else {
    $response->formatOutput = true;
    $response->preserveWhiteSpace = false;
    header('Content-Type: text/xml');
    echo $response->saveXML();
}

function getEarliestDatestamp() {
    global $xerte_toolkits_site;
    $q = "select template_id,date_created from templatedetails ORDER BY date_created limit 1";
    $result = db_query($q);
    return $result[0]["date_created"];
}

function getSingleTemplate($metadataPrefix,$template_id) {
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $q = "select td.template_id, 
          otd.template_framework, 
          otd.template_name as template_type, 
          otd.display_name as type_display_name, 
          td.template_name,  
          td.creator_id as owner_userid, 
          ld.username as owner_username, 
          concat(ld.firstname,' ',ld.surname) as owner,
          td.date_created, 
          td.date_modified, 
          td.date_accessed, 
          td.number_of_uses, 
          td.access_to_whom, 
          td.extra_flags,
          td.tsugi_published as lti_enabled,
          td.tsugi_xapi_enabled as xapi_enabled
          from {$prefix}templatedetails as td, 
          {$prefix}originaltemplatesdetails as otd,
          {$prefix}logindetails as ld 
          where td.template_type_id=otd.template_type_id and td.creator_id=ld.login_id and td.access_to_whom = 'Public' and td.template_id = {$template_id}";

    $response_template = db_query($q);
    if (!$response_template) {
        throw new OAIException('idDoesNotExist');
    }
    $tempMetaData = call_user_func(get_meta_data,$response_template[0]['template_id'],$response_template[0]['template_name'],$response_template[0]["owner_username"],$response_template[0]["template_type"],$response_template[0]['owner']);
    $response_record = call_user_func(makeRecordFromTemplate,$metadataPrefix,$response_template[0], $tempMetaData);

    return $response_record;
}

function getTemplates($metadataPrefix,$from,$until) {
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $q = "select td.template_id, 
          otd.template_framework, 
          otd.template_name as template_type, 
          otd.display_name as type_display_name, 
          td.template_name,  
          td.creator_id as owner_userid, 
          ld.username as owner_username, 
          concat(ld.firstname,' ',ld.surname) as owner,
          td.date_created, 
          td.date_modified, 
          td.date_accessed, 
          td.number_of_uses, 
          td.access_to_whom, 
          td.extra_flags,
          td.tsugi_published as lti_enabled,
          td.tsugi_xapi_enabled as xapi_enabled
          from {$prefix}templatedetails as td, 
          {$prefix}originaltemplatesdetails as otd,
          {$prefix}logindetails as ld 
          where td.template_type_id=otd.template_type_id and td.creator_id=ld.login_id and td.access_to_whom = 'Public'";

    if($from != "" && $until != ""){
        $q = $q . "and td.date_modified between ? and ?";
        $templates = db_query($q, array($from,$until));
    }
    else if($until != ""){
        $q = $q . "and td.date_modified <= ?";
        $templates = db_query($q, array($until));
    }
    else if($from != ""){
        $q = $q . "and td.date_modified >= ?";
        $templates = db_query($q, array($from));
    }
    else{
        $templates = db_query($q);
    }

    //$response = new stdClass();
    //$response->site_url = $xerte_toolkits_site->site_url;
    //$response->site_name = $xerte_toolkits_site->site_name;


    //To make sure the response templates are the same as the filled in metadata number
    //$tmpTemplates = array();

    $tmpRecords = array();
    //get the oai status for all templates that at some point have been published
    if($until != ""){
        $q = "select template_id, status, timestamp from {$xerte_toolkits_site->database_table_prefix}oai_publish where audith_id IN (SELECT max(audith_id) from {$xerte_toolkits_site->database_table_prefix}oai_publish where timestamp < ? group by template_id)";
        $publish_status = db_query($q, array($until));
    }
    else {
        $q = "select template_id, status, timestamp from {$xerte_toolkits_site->database_table_prefix}oai_publish where audith_id IN (SELECT max(audith_id) from {$xerte_toolkits_site->database_table_prefix}oai_publish group by template_id)";
        $publish_status = db_query($q);
    }
    $temp_added = array();

    for($i=0;$i<count($templates);$i++)
    {
        $currentTemplate = $templates[$i];
        $needle_key = array_search($currentTemplate['template_id'], array_column($publish_status, 'template_id'));
        if ($needle_key !== false){
            if (strcmp($publish_status[$needle_key]['status'], "published") == 0) {
                $tempMetaData = call_user_func('get_meta_data',$currentTemplate['template_id'],$currentTemplate['template_name'],$currentTemplate["owner_username"],$currentTemplate["template_type"], $currentTemplate['owner']);
                if($tempMetaData->domain != 'unknown' and $tempMetaData->level != "unknown" and $tempMetaData->oaiPmhAgree){
                    $currentRecord = call_user_func('makeRecordFromTemplate',$metadataPrefix,$currentTemplate, $tempMetaData);
                    $tmpRecords[] = $currentRecord;
                    $temp_added[] = $needle_key;
                }
            }
        }

    }

    //add all templates that have their sharing rights revoked
    for($i=0;$i<count($templates);$i++) {
        $currentTemplate = $templates[$i];
        $needle_key = array_search($currentTemplate['template_id'], array_column($publish_status, 'template_id'));
        if ($needle_key !== false){
            if (!in_array($needle_key, $temp_added)) {
                $record = array('identifier' => ($xerte_toolkits_site->site_url . $currentTemplate['template_id']),
                    'datestamp' => date($publish_status[$needle_key]['timestamp']),
                    'modified' => date($currentTemplate['date_modified']),
                    'deleted' => true);
                $tmpRecords[] = $record;
            }
        }
    }

    //$response->templates = $tmpTemplates;
    //$response->count = count($tmpTemplates);
    // Add the templates the have been really deleted as well
    $deleted = getDeletedTemplates($metadataPrefix,$from,$until);
    foreach($deleted as $d)
    {
        $record = array('identifier' => ($xerte_toolkits_site->site_url . $d['template_id']),
            'datestamp' => date($d['timestamp']),
            'modified' => date($d['timestamp']),
            'deleted' => true);
        $tmpRecords[] = $record;
    }

    return $tmpRecords;
};

function getDeletedTemplates($metadataPrefix,$from,$until)
{
    // Get the ids of all the records that have been deleted but have been published before
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    // Get all the unique ids of the templates that have been deleted from oai_publix and do that not exist anymore in template_details
    if ($until != null && $until != "")
    {
        $q = "select template_id, timestamp from {$prefix}oai_publish op 
                where op.status = 'deleted' 
                and op.template_id not in (select template_id from {$prefix}templatedetails td where op.template_id = td.template_id and td.access_to_whom = 'Public')
                and audith_id IN (SELECT max(audith_id) from {$xerte_toolkits_site->database_table_prefix}oai_publish op2 where status='deleted' and timestamp < ? group by op2.template_id)";
        $params = array($until);
    }
    else {
        $q = "select template_id, timestamp from {$prefix}oai_publish op 
                where op.status = 'deleted' 
                and op.template_id not in (select template_id from {$prefix}templatedetails td where op.template_id = td.template_id and td.access_to_whom = 'Public')
                and audith_id IN (SELECT max(audith_id) from {$xerte_toolkits_site->database_table_prefix}oai_publish op2 where status='deleted' group by op2.template_id)";
        $params = array();
    }
    if ($from != null && $from != "")
    {
        $q = $q . " and op.timestamp >= ?";
        $params[] = $from;
    }
    $deleted_templates = db_query($q, $params);
    return $deleted_templates;
}
function makeRecordFromTemplate($metadataPrefix,$template, $metadata){
    global $xerte_toolkits_site;

    if($metadataPrefix == "lom_ims") {

        //get first publish time.
        $q = "select timestamp from {$xerte_toolkits_site->database_table_prefix}oai_publish where template_id = ? and status = ? order by timestamp asc limit 1";
        $params = array($template['template_id'], "published");
        $first_publish_time = db_query_one($q, $params);

        $record = array('identifier' => ($xerte_toolkits_site->site_url . $template['template_id']),
            'datestamp' => date($first_publish_time["timestamp"]),
            'modified' => date($template['date_modified']),
            //'set' => 'class:activity',
            'metadata' => array(
                'container_name' => 'lom',
                'container_attributes' => array(
                    'xmlns' => "http://www.imsglobal.org/xsd/imsmd_v1p2",
                    'xmlns:xsi' => "http://www.w3.org/2001/XMLSchema-instance",
                    'xsi:schemaLocation' =>
                        'http://www.imsglobal.org/xsd/imsmd_v1p2 http://www.imsglobal.org/xsd/imsmd_v1p2p4.xsd'
                ),
                'general' => array(
                    //'title' => $template['template_name'],//'Testing records',
                    'title' => $metadata->name,//'Testing records',
                    'language' => explode("-", $metadata->language)[0],
                    'description' => $metadata->description,

                ),
                'misc' => array(
                    'course' => $metadata->course,
                    'educational_code' => $metadata->educode,
                    'location' => ($xerte_toolkits_site->site_url . 'play.php?template_id=' . $template['template_id']),
                ),
                'keywords' => explode("\n", $metadata->keywords),
                'relation' => array(
                    'thumbnail' => $metadata->thumbnail,
                    'download' => $metadata->download
                ),
                'lifecycle' => array(
                    'author' => $metadata->author,
                    'publisher' => $metadata->publisher,
                    'publishdate' => date($first_publish_time["timestamp"]),
                ),
                'rights' => array(
                    'rights' => $metadata->rights,
                    'rightsId' => $metadata->rightsId,
                    'download' => $metadata->download
                ),
                'classification' => array(
                    'domain_id' => $metadata->domainId,
                    'domain' => $metadata->domain,
                    'domain_source' => $metadata->domainSource,
                    'level' => $metadata->level,
                    'levelId' => $metadata->levelId,
                ),
            ));
        if ($record['metadata']['relation']['download'])
        {
            $record['metadata']['relation']['download_url'] = $metadata->downloadUrl;
        }
    }
    else if($metadataPrefix == "oai_dc"){
        $record = array('identifier' => ($xerte_toolkits_site->site_url . $template['template_id']),
            'datestamp' => date($template['date_modified']),
            //'set' => 'class:activity',
            'metadata' => array(
                'container_name' => 'oai_dc:dc',
                'container_attributes' => array(
                    'xmlns:oai_dc' => "http://www.openarchives.org/OAI/2.0/oai_dc/",
                    'xmlns:dc' => "http://purl.org/dc/elements/1.1/",
                    'xmlns:xsi' => "http://www.w3.org/2001/XMLSchema-instance",
                    'xsi:schemaLocation' =>
                        'http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd'
                ),
                'fields' => array(
                    'dc:title' => $metadata->name,
                    'dc:creator' => $metadata->author,
                    'dc:subject' => $metadata->course,
                    'dc:description' =>$metadata->description,
                    'dc:publisher' => $metadata->publisher,
                    //'dc:contributor' => '',
                    'dc:date' => $template['date_modified'],
                    //'dc:type' => '',
                    //'dc:format' => '',
                    'dc:identifier' => ($xerte_toolkits_site->site_url . $template['template_id']),
                    'dc:source' => ($xerte_toolkits_site->site_url . 'play.php?template_id=' . $template['template_id']),
                    'dc:language' => explode("-", $metadata->language)[0],
                    //'dc:relation' => '',
                    //'dc:coverage' => '',
                    'dc:rights' => $metadata->rights,
                )

            ));
    }
    return $record;
};


