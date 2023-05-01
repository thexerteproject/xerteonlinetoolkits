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

require_once(dirname(__FILE__) . "/Html2Text.php");
require_once(dirname(__FILE__) . "/../website_code/php/url_library.php");
function get_meta_data($template_id, $creator_user_name="", $template_type_name="", $template_owner="")
{
    global $config;
    global $xerte_toolkits_site;

    $xml = get_template_data_as_xml($template_id, $creator_user_name, $template_type_name);
    $xerteMetaObj = new stdClass();

    $html = new \Html2Text\Html2Text((string)$xml['name']);
    $xerteMetaObj->name = $html->getText();

    if (isset($xml['educode']))
    {
        $xerteMetaObj->educode = (string)$xml['educode'];
    }
    else{
        $xerteMetaObj->educode = "";
    }
    //if (isset($xml['metaLevel']))
    //{
    //    $xerteMetaObj->level = "HBO";// (string)$xml['metaLevel'];
    //    $xerteMetaObj->levelId = "be140797-803f-4b9e-81cc-5572c711e09c"; // (string)$xml['metaLevelId'];
    //}
    //else
    //{
    //    $xerteMetaObj->level = 12;
    //}
    if (isset($xml['metaThumbnail']))
    {
        $xerteMetaObj->thumbnail = (string)$xml['metaThumbnail'];
        if (strpos($xerteMetaObj->thumbnail, "FileLocation") >= 0)
        {
            // Construct file name
            $template_dir = $xerte_toolkits_site->site_url . "USER-FILES/" . $template_id . "-" . $creator_user_name . "-" . $template_type_name . "/";
            $xerteMetaObj->thumbnail = str_replace("FileLocation + ", $template_dir, $xerteMetaObj->thumbnail);
            $xerteMetaObj->thumbnail = str_replace("'", "", $xerteMetaObj->thumbnail);
        }
        if (strpos($xerteMetaObj->thumbnail, "http") === false)
        {
            // No URL, invalid
            $xerteMetaObj->thumbnail = $config['thumbnail'];
        }
    }
    else
    {
        $xerteMetaObj->thumbnail = $config['thumbnail'];
    }
    if (isset($xml['course']))
        $xerteMetaObj->course = (string)$xml['course'];
    else
        $xerteMetaObj->course = 'unknown';

    if (isset($xml['module']))
        $xerteMetaObj->module = (string)$xml['module'];
    else
        $xerteMetaObj->module = '';
    if (isset($xml['metaDescription']))
        $xerteMetaObj->description = (string)$xml['metaDescription'];
    else
        $xerteMetaObj->description = '';
    if (isset($xml['oaiPmhAgree']))
        if ((string)$xml['oaiPmhAgree'] == 'true' )
            $xerteMetaObj->oaiPmhAgree = true;
        else
            $xerteMetaObj->oaiPmhAgree = false;
    else
        $xerteMetaObj->oaiPmhAgree = false;
    if (isset($xml['metaKeywords']))
        $xerteMetaObj->keywords = (string)$xml['metaKeywords'];
    else
        $xerteMetaObj->keywords = '';
    if (isset($xml['metaAuthor']) && ((isset($xml['metaAuthorInclude']) && $xml['metaAuthorInclude'] == 'true') || !isset($xml['metaAuthorInclude']))) {
        if ((string)$xml['metaAuthor'] == "") {
            $xerteMetaObj->author = $template_owner;
        } else {
            $xerteMetaObj->author = (string)$xml['metaAuthor'];
        }
    }
    else {
        $xerteMetaObj->author = $config['institute'];
    }
    //TODO check domain ^ level make sure they return "unknown"
    if (isset($xml['category']) || isset($xml['metaCategory'])) {
        if (isset($xml['metaCategory'])) {
            $cat = (string)$xml['metaCategory'];
        } else {
            $cat = (string)$xml['category'];
        }
        $cat = explode("|", $cat);
        $response = [];
        $xerteMetaObj->domain = [];
        $xerteMetaObj->domainId = [];
        $xerteMetaObj->domainSource = [];
        $q = "select * from {$xerte_toolkits_site->database_table_prefix}oai_categories where label=?";
        // query oai_categories
        foreach ($cat as $value){
            $params = array($value);
            $response[] = db_query_one($q, $params);
        }
        $parents = [];
        foreach ($response as $data){
            if ($data !== false and $data !== null) {
                $xerteMetaObj->domain[] = $data["label"];
                $xerteMetaObj->domainId[] = $data["taxon"];
                $xerteMetaObj->domainSource[] = $data["source_url"];
                if ($data["parent_id"] !== null and !in_array($data["parent_id"], $parents)){
                    $parents[] = $data["parent_id"];
                }
            }
        }
        if (!empty($parents)){
            $parents_str = implode(",", $parents);
            $q = "select taxon, label, source_url from {$xerte_toolkits_site->database_table_prefix}oai_categories where category_id in ($parents_str)";
            $response = db_query($q);
            foreach ($response as $data){
                $xerteMetaObj->domain[] = $data["label"];
                $xerteMetaObj->domainId[] = $data["taxon"];
                $xerteMetaObj->domainSource[] = $data["source_url"];
            }
        }

        //only "unknown if there are no valid entries"
        if (empty($xerteMetaObj->domain)){
            $xerteMetaObj->domain = 'unknown';
        }
    }
    else
        $xerteMetaObj->domain = 'unknown';

    if (isset($xml['metaEducation'])) {
        // query oai-education
        $edu = explode("|", (string)$xml["metaEducation"]);
        $response = [];
        $xerteMetaObj->level = [];
        $xerteMetaObj->levelId = [];
        $q = "select * from {$xerte_toolkits_site->database_table_prefix}oai_education where label=?";

        foreach ($edu as $value){
            $params = array($value);
            $response[] = db_query_one($q, $params);
        }
        $parents = [];
        foreach ($response as $data){
            if ($data !== false and $data !== null) {
                $xerteMetaObj->level[] = $data["label"];
                $xerteMetaObj->levelId[] = $data["term_id"];
                if ($data["parent_id"] !== null and !in_array($data["parent_id"], $parents)){
                    $parents[] = $data["parent_id"];
                }
            }
        }
        if (!empty($parents)){
            $parents_str = implode(",", $parents);
            $q = "select term_id, label from {$xerte_toolkits_site->database_table_prefix}oai_education where education_id in ($parents_str)";
            $response = db_query($q);
            foreach ($response as $data){
                $xerteMetaObj->level[] = $data["label"];
                $xerteMetaObj->levelId[] = $data["term_id"];
            }
        }

        //only "unknown if there are no valid entries"
        if (empty($xerteMetaObj->level)){
            $xerteMetaObj->level = 'unknown';
        }
    }
    else
        $xerteMetaObj->level = 'unknown';

    $xerteMetaObj->language = (string)$xml['language'];
    $xerteMetaObj->publisher = $config['institute'];

    // Check syndication
    $q = "select * from {$xerte_toolkits_site->database_table_prefix}templatesyndication where template_id=?";
    $params = array($template_id);
    $syndication = db_query_one($q, $params);
    if ($syndication !== false && $syndication!= null)
    {
        $xerteMetaObj->rights = $syndication['license'];
        $xerteMetaObj->download = ($syndication['export'] == 'true' ? true : false);
        if ($xerteMetaObj->download)
        {
            $xerteMetaObj->downloadUrl = $xerte_toolkits_site->site_url . url_return("export", $template_id);
        }
        $q = "select * from {$xerte_toolkits_site->database_table_prefix}oai_rights where label=?";
        $params = array( $syndication['license']);
        $rights = db_query_one($q, $params);
        if ($rights !== false && $rights !== null) {
            $xerteMetaObj->rightsId = $rights['term_id'];
        }
        else{
            $xerteMetaObj->rightsId = 'yes';
        }
    }
    else
    {
        $xerteMetaObj->rights = "";
        $xerteMetaObj->rightsId = "";
        $xerteMetaObj->download = false;
    }
    return $xerteMetaObj;
}

function get_template_data_as_xmlstring($template_id, $creator_user_name="", $template_type_name="")
{
    global $xerte_toolkits_site;

    // Check parameters
    if ($creator_user_name == "" || $template_type_name == "") {
        $prefix = $xerte_toolkits_site->database_table_prefix;
        $q = "SELECT ld.username, otd.template_name FROM {$prefix}templatedetails td, {$prefix}originaltemplatesdetails, {$prefix}logindetails ld WHERE td.template_id = ? and td.creator_id=ld.login_id and td.template_type_id=otd.template_type_id";
        $params = array($template_id);

        $row = db_query_one($q, $params);

        if ($row == false) {
            receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Failed to get data as xml", "Failed to get the data as xml");
            return "";
        } else {
            $creator_user_name = $row['username'];
            $template_type_name = $row['template_name'];
        }
    }

    // Construct file name
    $template_dir = $xerte_toolkits_site->users_file_area_full . $template_id . "-" . $creator_user_name . "-" . $template_type_name . "/";
    $dataFilename = $template_dir . "data.xml";

    if (file_exists($dataFilename)) {

        $data = file_get_contents($dataFilename);
    } else {
        $data = "";
    }
    return $data;
}

function get_template_data_as_xml($template_id, $creator_user_name="", $template_type_name="")
{
    $xml = "";
    $dataXml = get_template_data_as_xmlstring($template_id, $creator_user_name, $template_type_name);
    if (strlen($dataXml) > 0)
    {
        // Convert to JSON
        $xml = simplexml_load_string($dataXml);
    }
    return $xml;
}
