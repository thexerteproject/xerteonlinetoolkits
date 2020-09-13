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
 
/**
 * 
 * function get maximum template number, finds the highest template number
 *
 * @author Patrick Lockley
 * @version 1.0
 * 
 * @package
 */

function get_template_type($template_id){

    global $xerte_toolkits_site;

    $row = db_query_one("SELECT template_framework as frame, {$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails.template_name as tname FROM {$xerte_toolkits_site->database_table_prefix}templatedetails, {$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails WHERE {$xerte_toolkits_site->database_table_prefix}templatedetails.template_type_id =  {$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails.template_type_id and template_id = ?", array($template_id));

    if($row == false) {
        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Failed to get template type", "Failed to get the template type");
    }
    else {
        return $row['frame'] . "_" . $row['tname'];
    }

}

/**
 * @param $template_id
 *
 * Get the sub pages of a template in an array. If the array is empty, show all subpages
 *
 */
function get_template_pagelist($template_id)
{
    global $xerte_toolkits_site;

    $row = db_query_one("SELECT otd.* FROM {$xerte_toolkits_site->database_table_prefix}templatedetails td, {$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails otd WHERE td.template_type_id = otd.template_type_id and td.template_id = ?", array($template_id));

    if($row == false) {
        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Failed to get template type", "Failed to get the template type");
        return array();
    }
    else {
        $sub_pages_str = $row['template_sub_pages'];
        if ($sub_pages_str != null && $sub_pages_str != "") {
            $simple_lo_page = false;
            $pos = strpos($sub_pages_str, "simple_lo_page");
            if ($pos !== false)
            {
                $sub_pages_str = substr($sub_pages_str, 15); // Get rid of 'simple_lo_page,'
                $simple_lo_page = true;
            }
            $sub_pages = explode(',', $sub_pages_str);
        }
        else{
            $sub_pages = array();
        }
        return $sub_pages;
    }
}

function get_template_simple_lo_page($template_id)
{
    global $xerte_toolkits_site;

    $row = db_query_one("SELECT otd.* FROM {$xerte_toolkits_site->database_table_prefix}templatedetails td, {$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails otd WHERE td.template_type_id = otd.template_type_id and td.template_id = ?", array($template_id));

    if($row == false) {
        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Failed to get template type", "Failed to get the template type");
        return array();
    }
    else {
        $sub_pages_str = $row['template_sub_pages'];
        $simple_lo_page = false;
        if ($sub_pages_str != null && $sub_pages_str != "") {
            $pos = strpos($sub_pages_str, "simple_lo_page");
            if ($pos !== false)
            {
                $simple_lo_page = true;
            }
        }
        return $simple_lo_page;
    }
}


function get_template_creator_username($template_id){

    global $xerte_toolkits_site;

    $row = db_query_one("SELECT ld.username FROM {$xerte_toolkits_site->database_table_prefix}templatedetails td, {$xerte_toolkits_site->database_table_prefix}logindetails ld WHERE td.template_id = ? and td.creator_id=ld.login_id", array($template_id));

    if($row == false) {
        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Failed to get creator username", "Failed to get the username of the template's creator");
    }
    else {
        return $row['username'];
    }

}



function get_default_engine($template_id)
{
    global $xerte_toolkits_site;

    $row = db_query_one("SELECT td.extra_flags  FROM {$xerte_toolkits_site->database_table_prefix}templatedetails td WHERE td.template_id = ?", array($template_id));

    if($row == false) {
        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Failed to get default template engine", "Failed to get the default template engine");
    }
    else
    {
        $engine='javascript';
        $extra_flags = explode(";", $row['extra_flags']);
        foreach($extra_flags as $flag)
        {
            $parameter = explode("=", $flag);
            switch($parameter[0])
            {
                case 'engine':
                    $engine = $parameter[1];
                    break;
            }
        }

        return $engine;
    }
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
