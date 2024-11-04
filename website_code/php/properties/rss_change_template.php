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
 * rss change template, allows a user to rename a template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once("../../../config.php");


include "../template_status.php";

include "../url_library.php";

include "../user_library.php";

include "properties_library.php";

if (!isset($_POST['template_id']) || !isset($_POST['rss']) || !isset($_POST['export']) || !isset($_POST['desc'])){
    die("Invalid paramaters");
}


$template_id = x_clean_input($_POST['template_id'], 'numeric');
$rss = x_clean_input($_POST['rss']);
$export = x_clean_input($_POST['export']);
$desc = x_clean_input($_POST['desc']);

if(is_user_creator_or_coauthor($template_id)||is_user_permitted("projectadmin")){

    $query_for_rss_status = "select rss from {$xerte_toolkits_site->database_table_prefix}templatesyndication where template_id=?";

    $rows = db_query($query_for_rss_status, array($template_id));
    $status = false;
    if(sizeof($rows)==0){
        $query_to_change_rss_status = "Insert into {$xerte_toolkits_site->database_table_prefix}templatesyndication (template_id,rss,export,description) VALUES (?,?,?,?)";
        $status = db_query($query_to_change_rss_status, array($template_id, $rss, $export, $desc));

    }else{
        $query_to_change_rss_status = "update {$xerte_toolkits_site->database_table_prefix}templatesyndication 
            set rss=?, export=?, description=? WHERE template_id = ?";
        $status = db_query($query_to_change_rss_status, array($rss, $export, $desc, $template_id));
    }

    // Update templatedetails modify date
    $sql = "update {$xerte_toolkits_site->database_table_prefix}templatedetails set date_modified=? where template_id=?";
    $params = array(date("Y-m-d H:i:s"), $template_id);
    db_query_one($sql, $params);

    if($status === false) {
        echo "<p class='error'>Error saving change to template.</p>";
    }

    if(template_access_settings($template_id)=="Public"){

        $query_for_name = "select firstname,surname from {$xerte_toolkits_site->database_table_prefix}logindetails where login_id=?";
        $row_name = db_query_one($query_for_name, array($_SESSION['toolkits_logon_id']));
        rss_display($xerte_toolkits_site,$template_id,true);

    }else{

        rss_display_public();

    }

}else{

    rss_display_fail(true);

}

