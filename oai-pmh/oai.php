<?php

require_once('oaiserver.php');
require_once('../config.php');

require_once('oai_config.php');
require_once('xerteobjects.php');

//require $xerte_toolkits_site->php_library_path  . "template_library.php";

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


$identifyResponse = array();
$identifyResponse["repositoryName"] = $xerte_toolkits_site->name ;
$identifyResponse["baseURL"] =  $xerte_toolkits_site->site_url . 'oai-pmh/oai.php'; //'http://198.199.108.242/~neis/oai_pmh/oai.php';
$identifyResponse["protocolVersion"] = '2.0';
$identifyResponse['adminEmail'] = $config['adminEmail']; //'danielneis@gmail.com';
$identifyResponse["earliestDatestamp"] = call_user_func(getEarliestDatestamp) . "T00:00:00Z";//'2013-01-01T12:00:00Z';
$identifyResponse["deletedRecord"] = 'no'; // How your repository handles deletions
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
    $uri = 'test.oai_pmh';
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
                        ));
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
            function($metadataPrefix, $from = '', $until = '', $set = '', $count = false, $deliveredRecords = 0, $maxItems = 0){
                if ($count) {
                    return 1;
                }
                if ($set != '') {
                    throw new OAIException('noSetHierarchy');
                }
                $records = call_user_func(getTemplates);
                return $records;
            },

        'GetRecord' =>
            function($identifier, $metadataPrefix){

                //TODO: Test whether identifier is in the right format and parse identifier to template_id

                $response_record = call_user_func(getSingleTemplate, $identifier);
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

function getSingleTemplate($template_id) {
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $q = "select td.template_id, 
          otd.template_framework, 
          otd.template_name as template_type, 
          otd.display_name as type_display_name, 
          td.template_name,  
          td.creator_id as owner_userid, 
          ld.username as owner_username, 
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
    $tempMetaData = call_user_func(get_meta_data,$response_template[0]['template_id'],$response_template[0]["owner_username"],$response_template[0]["template_type"]);
    $response_record = call_user_func(makeRecordFromTemplate,$response_template[0], $tempMetaData);

    return $response_record;
}

function getTemplates() {
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $q = "select td.template_id, 
          otd.template_framework, 
          otd.template_name as template_type, 
          otd.display_name as type_display_name, 
          td.template_name,  
          td.creator_id as owner_userid, 
          ld.username as owner_username, 
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

    $templates = db_query($q);
    $response = new stdClass();
    $response->site_url = $xerte_toolkits_site->site_url;
    $response->site_name = $xerte_toolkits_site->site_name;

    $response->count = count($templates);
    $response->templates = $templates;

    $tmpRecords = array();
    for($i=0;$i<count($templates);$i++)
    {
        $currentTemplate = $templates[$i];
        $tempMetaData = call_user_func(get_meta_data,$currentTemplate['template_id'],$currentTemplate["owner_username"],$currentTemplate["template_type"]);
        $currentRecord = call_user_func(makeRecordFromTemplate,$currentTemplate, $tempMetaData);
        $tmpRecords[] = $currentRecord;
    }

    return $tmpRecords;
};

function makeRecordFromTemplate($template, $metadata){
    global $xerte_toolkits_site;
    $record = array('identifier' => ($xerte_toolkits_site->site_url . $template['template_id']),
        'datestamp' => date($template['date_modified']),
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
                'title' => $template['template_name'],//'Testing records',
                'language'=> explode("-",$metadata->language)[0],
                'description'=> $metadata->description,
            ),
            'misc' => array(
                'course' => $metadata->course,
                'educational_code'=> $metadata->education,
            ),
            'keywords' => explode("\n",$metadata->keywords),
            'relation' => array(
                'thumbnail' => $metadata->thumbnail
            ),
            'lifecycle' => array(
                'author' => $metadata->author,
                'publisher' => $metadata->publisher,
                'publishdate' => $template['date_modified'],
            ),
            'classification' => array(
                'domain_id' => $metadata->domainId,
                'domain' => $metadata->domain,
                'domain_source' => $metadata->domainSource,
            ),
        ));
    return $record;
};


