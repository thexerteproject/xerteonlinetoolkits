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

//$xerte_toolkits_site->users_file_area_full = 'P:\\public_html\\xotoai-pmh\\USER-FILES\\';

if (!file_exists("../oai_config.php"))
{
    die("oai-pmh is not available");
}

require_once('../oai_config.php');
require_once($xerte_toolkits_site->php_library_path  . "template_library.php");

function getAllTemplates()
{
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

    $templates = db_query($q);

    return $templates;
}

function getPublishStatus()
{
    global $xerte_toolkits_site;

    $q = "select * from {$xerte_toolkits_site->database_table_prefix}oai_publish ";
    $publish_status = db_query($q);

    return $publish_status;
}

function getMetaData($templates, $publish_status)
{
    $published = array();
    foreach($templates as $template) {
        $template_id = $template['template_id'];
        $template_creator = $template['owner_username'];
        $template_type = $template['template_type'];

        $meta = get_meta_data($template_id, $template['template_name'], $template_creator, $template_type);

        $meta->oai_published = $meta->oaiPmhAgree && $meta->domain != 'unknown' && $meta->level != 'unknown';

        if ($meta->oai_published) {
            $meta->creator_id = $template['owner_userid'];
            $meta->date_modified = $template['date_modified'];
            $meta->template_id = $template_id;
            $published[] = $meta;
        }
    }
    return $published;
}

$templates = getAllTemplates();
$publish_status = getPublishStatus();
$published = getMetaData($templates, $publish_status);


//Build the new contents of the oai_publish table

$q = "truncate table {$xerte_toolkits_site->database_table_prefix}oai_publish";
db_query($q);

$params = array();
$q = "insert into {$xerte_toolkits_site->database_table_prefix}oai_publish (template_id, login_id, user_type, status, timestamp) values ";
foreach($published as $meta) {
    $q .= "(?,?,'creator','published',?),";
    $params[] = $meta->template_id;
    $params[] = $meta->creator_id;
    $params[] = $meta->date_modified;
}
$q = rtrim($q, ',');
db_query($q, $params);
