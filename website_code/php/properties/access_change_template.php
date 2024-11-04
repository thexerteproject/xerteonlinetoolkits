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
 * access change template, allows the site to set access properties for the template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once("../../../config.php");

include "../user_library.php";
include "../template_status.php";

include "properties_library.php";

require_once (__DIR__ . "/../XerteProjectDecoder.php");

if (!isset($_SESSION['toolkits_logon_id']))
{
    _debug("Session is invalid or expired");
    die("Session is invalid or expired");
}

/**
 * 
 * Function template share status
 * This function checks the current access setting against a string
 * @param string $string - string to check against the database
 * @return bool True or False if two params match
 * @version 1.0
 * @author Patrick Lockley
 */

function template_share_status($string){

    if($_POST['access']==$string){
        return true;
    }else{
        if(strpos($string,"other-"==0)){
            return true;
        }else{		
            return false;
        }
    }

}

$database_id = database_connect("Access change database connect success","Access change database connect failed");

/*
 * Update the database setting
 */
$prefix = $xerte_toolkits_site->database_table_prefix;
if (!isset($_POST['template_id']))
{
    die('Invalid template_id');
}
$template_id = x_clean_input($_POST['template_id'], 'numeric');

if(is_user_creator_or_coauthor($_POST['template_id'])||is_user_permitted("projectadmin")) {
    $query = "UPDATE {$prefix}templatedetails SET access_to_whom = ? WHERE template_id = ?";
    if (isset($_POST['server_string'])) {
        $access_to_whom = $_POST['access'] . '-' . $_POST['server_string'];
    } else if (isset($_POST['password'])) {
        $access_to_whom = $_POST['access'] . '-' . $_POST['password'];
	} else {
        $access_to_whom = $_POST['access'];
    }

    $params = array($access_to_whom, $_POST['template_id']);
    $ok = db_query($query, $params);

    if ($ok === false) {
        access_display_fail();

    } else {
        update_oai_access($prefix, $xerte_toolkits_site->users_file_area_full);
        access_display($xerte_toolkits_site, $template_id,true);
    }
}

function update_oai_access($prefix, $path_root){
    if (!isset($_POST['template_id']) || !isset($_POST['access']))
    {
        die('Invalid parameters');
    }
    $template_id = x_clean_input($_POST['template_id'], 'numeric');
    $access = x_clean_input($_POST['access']);
    //get oai status
    $q_get_oai = "select * from {$prefix}oai_publish where template_id=? ORDER BY audith_id DESC LIMIT 1";
    $oai = db_query_one($q_get_oai, array($template_id));

    if ($oai !== null and $oai["status"] === "published" and $access !== "Public"){
        //set oai to deleted
        $q_delete_oai = "insert into {$prefix}oai_publish set template_id=?, login_id=?, user_type='creator', status='deleted'";
        $params = array($template_id, $_SESSION["toolkits_logon_id"]);
        db_query_one($q_delete_oai, $params);
    } elseif ($access === "Public" and (($oai === null) or ($oai !== null and ($oai["status"] === "deleted" or $oai["status"] === "incomplete")))) {
        //get template information from db
        $q = "select
          otd.template_name as template_type, 
          ld.username as owner_username
          from {$prefix}templatedetails as td, 
          {$prefix}originaltemplatesdetails otd,
          {$prefix}logindetails ld 
          where td.template_type_id=otd.template_type_id and td.creator_id=ld.login_id and td.template_id=?";
        $template = db_query_one($q, array($template_id));
        //compute local template location and read template data
        $template_dir = $path_root . $template_id . "-" . $template['owner_username'] . "-" . $template['template_type'] . "/";
        $dataFilename = $template_dir . "data.xml";
        $decoder = new XerteProjectDecoder($dataFilename);
        $info = $decoder->detailedTemplateDecode($template_id);

        $q_add_oai = "insert into {$prefix}oai_publish set template_id=?, login_id=?, user_type='creator', status='published'";
        $params = array($template_id, $_SESSION["toolkits_logon_id"]);

        if ($oai === null and $info->oaiPmhAgree === "true" and $info->education !== "unknown" and $info->category !== 'unknown'){
            db_query_one($q_add_oai, $params);
        } elseif ($oai !== null and $info->oaiPmhAgree === "true" and $info->education !== "unknown" and $info->category !== 'unknown'){
            db_query_one($q_add_oai, $params);
        }
    }
}
