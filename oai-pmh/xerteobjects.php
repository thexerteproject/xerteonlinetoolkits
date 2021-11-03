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
function get_meta_data($template_id, $creator_user_name="", $template_type_name="")
{
    global $config;
    global $xerte_toolkits_site;

    $xml = get_template_data_as_xml($template_id, $creator_user_name, $template_type_name);
    $xerteMetaObj = new stdClass();
    $xerteMetaObj->name = (string)$xml['name'];
    if (isset($xml['educode']))
    {
        $xerteMetaObj->educode = (string)$xml['educode'];
    }
    if (isset($xml['metaEducation']))
    {
        $xerteMetaObj->education = (string)$xml['metaEducation'];
    }
    if (isset($xml['metaLevel']))
    {
        $xerteMetaObj->level = "HBO";// (string)$xml['metaLevel'];
        $xerteMetaObj->levelId = "be140797-803f-4b9e-81cc-5572c711e09c"; // (string)$xml['metaLevelId'];
    }
    else
    {
        $xerteMetaObj->level = 12;
    }
    if (isset($xml['metaThumbnail']))
    {
        $xerteMetaObj->thumbnail = (string)$xml['metaThumbnail'];
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
    if (isset($xml['metaKeywords']))
        $xerteMetaObj->keywords = (string)$xml['metaKeywords'];
    else
        $xerteMetaObj->keywords = '';
    if (isset($xml['metaAuthor']) && ((isset($xml['metaAuthorInclude']) && $xml['metaAuthorInclude'] == 'true') || !isset($xml['metaAuthorInclude'])))
        $xerteMetaObj->author = (string)$xml['metaAuthor'];
    else
        $xerteMetaObj->author = $config['institute'];
    if (isset($xml['category'])) {
        $xerteMetaObj->domain = "Afbouw, hout en onderhoud";// (string)$xml['category'];
        $xerteMetaObj->domainId = "3ed67cca-37f6-4d7b-b1eb-872f6671caf7";
        $xerteMetaObj->domainSource = "https://vdex.kennisnet.nl/kennisnetset/2015.01/mbo_opleidingsdomeinen_studierichtingen-knset.xml";
    }
    else
        $xerteMetaObj->domain = 'unknown';
    if (isset($xml['subcategory']))
        $xerteMetaObj->subdomain = (string)$xml['subcategory'];
    else
        $xerteMetaObj->subdomain = 'unknown';
    $xerteMetaObj->language = (string)$xml['language'];
    $xerteMetaObj->publisher = $config['institute'];

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
