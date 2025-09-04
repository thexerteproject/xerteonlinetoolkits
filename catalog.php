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
 * data page, allows other sites to consume the xml of a toolkit
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once(dirname(__FILE__) . "/config.php");

_load_language_file('catalog.inc');

require $xerte_toolkits_site->php_library_path  . "template_status.php";
require $xerte_toolkits_site->php_library_path  . "template_library.php";
require $xerte_toolkits_site->php_library_path  . "display_library.php";
require $xerte_toolkits_site->php_library_path  . "user_library.php";
require $xerte_toolkits_site->php_library_path  . "XerteProjectDecoder.php";

function require_auth() {
    global $xerte_toolkits_site;
#TODO use hash for authentication
    header('Cache-Control: no-cache, must-revalidate, max-age=0');
    $has_supplied_credentials = !(empty($_SERVER['PHP_AUTH_USER']) && empty($_SERVER['PHP_AUTH_PW']));
    $is_not_authenticated = (
        !$has_supplied_credentials ||
        $_SERVER['PHP_AUTH_USER'] != $xerte_toolkits_site->admin_username ||
        hash('sha256', $_SERVER['PHP_AUTH_PW'])   != $xerte_toolkits_site->admin_password);
    if ($is_not_authenticated) {
        header('HTTP/1.1 401 Authorization Required');
        header('WWW-Authenticate: Basic realm="Access denied"');
        header('WWW-Authenticate: Basic realm="Catalog of ' . $xerte_toolkits_site->site_name . '"');
        header('HTTP/1.0 401 Unauthorized');
        echo '{"error" : "You do not have permission to retrieve this information"}'; //, "debug": "' . print_r($_SERVER, true) . '"}';
        exit;
    }
    return true;
}


// Authentication
$full_access = false;
// Admin user
if (is_user_admin()){
    $full_access = true;
}
else
{
    $full_access = require_auth();
}

$prefix = $xerte_toolkits_site->database_table_prefix;

// Determine modus
if ($full_access && isset($_REQUEST['list']))
{
    // Max nr. of items to return
    $take = 1000;
    if (isset($_REQUEST['take']))
    {
        $take = $_REQUEST['take'];
    }

    // Offset of itemes to return
    $offset = 0;
    if (isset($_REQUEST['offset']))
    {
        $offset = $_REQUEST['offset'];
    }

    $since = false;
    if (isset($_REQUEST['since']))
    {
        $since = new DateTime($_REQUEST['since']);
    }



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
          {$prefix}originaltemplatesdetails otd,
          {$prefix}logindetails ld 
          where td.template_type_id=otd.template_type_id and td.creator_id=ld.login_id and ld.disabled=0";

    if ($_REQUEST['list'] == 'Public')
    {
        // List all templates that are public
        $q .= " and access_to_whom='Public'";
        $params = array();
    }
    else if ($_REQUEST['list'] == 'Private')
    {
        // List all templates that are Private
        $q .= " and access_to_whom='Private'";
        $params = array();
    }
    else if ($_REQUEST['list'] == 'xAPI')
    {
        $q .= ' and tsugi_xapi_enabled=1';
        $params = array();
    }
    else if (strpos($_REQUEST['list'], 'Other') !== false)
    {
        // List all templates with referrer 
        $ref = $_REQUEST['list'];
        $refs = explode(':', $ref);
        $ref = $refs[1];
        $q .= " and access_to_whom like ?";
        $params = array('%' . $ref);
    }
    else if ($_REQUEST['list'] == 'All')
    {
        $params = array();
    }
    else
    {
        die("Invalid query");
    }
    if ($since !== false)
    {
        $q .= " and td.date_modified > ?";
        $params[] = $since->format('Y-m-d');
    }
    $q .= " order by td.date_modified asc limit $take offset $offset";

    $templates = db_query($q, $params);
    $response = new stdClass();
    $response->site_url = $xerte_toolkits_site->site_url;
    $response->site_name = $xerte_toolkits_site->site_name;
    $response->query = $_REQUEST['list'];
    $response->date = date('c');
    $response->total_count = count($templates);
    $response->take = $take;
    $response->offset = $offset;
    $tmptemplates = array();
    for ($i = 0; $i<count($templates); $i++)
    {
        $template = new stdClass();
        $template->db_record = $templates[$i];
        // Construct file name
        $template_dir = $xerte_toolkits_site->users_file_area_full . $templates[$i]['template_id'] . "-" . $templates[$i]['owner_username'] . "-" . $templates[$i]['template_type'] . "/";
        $dataFilename = $template_dir . "data.xml";
        $decoder = new XerteProjectDecoder($dataFilename);
        $template->data = $decoder->detailedTemplateDecode($templates[$i]['template_id'], $templates[$i]);
        $tmptemplates[] = $template;
    }
    $response->count = count($tmptemplates);
    $response->templates = $tmptemplates;

    echo json_encode($response);
}
else if (isset($_GET['template_id']) && is_numeric($_GET['template_id']) && ($full_access || has_rights_to_this_template($_GET['template_id'], $_SESSION['toolkits_logon_id']))) {
    // Retrieve information about the learning object
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
          {$prefix}originaltemplatesdetails otd,
          {$prefix}logindetails ld 
          where td.template_type_id=otd.template_type_id and td.creator_id=ld.login_id and ld.displabled=0 and td.template_id=?";
    $params = array($_GET['template_id']);

    $templates = db_query($q, $params);
    $response = new stdClass();
    $response->site_url = $xerte_toolkits_site->site_url;
    $response->site_name = $xerte_toolkits_site->site_name;
    $response->query = 'template_id=' . $_GET['template_id'];
    $response->date = date('c');
    $tmptemplates = array();
    for ($i = 0; $i<count($templates); $i++)
    {
        $template = new stdClass();
        //$template->db_record = $templates[$i];
        // Construct file name
        $template_dir = $xerte_toolkits_site->users_file_area_full . $templates[$i]['template_id'] . "-" . $templates[$i]['owner_username'] . "-" . $templates[$i]['template_type'] . "/";
        $dataFilename = $template_dir . "data.xml";
        $decoder = new XerteProjectDecoder($dataFilename);
        $template->data = $decoder->detailedTemplateDecode($templates[$i]['template_id'], $templates[$i]);
        $tmptemplates[] = $template;
    }
    $response->count = count($tmptemplates);
    $response->templates = $tmptemplates;

    echo json_encode($response);
}
else
{
    die("Permission denied!");
}

