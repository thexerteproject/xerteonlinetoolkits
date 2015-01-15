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
 * properties template, shows the basic page on the properties window
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");

include "../template_status.php";
include "../screen_size_library.php";
include "../url_library.php";
include "../user_library.php";
include "properties_library.php";

if(is_numeric($_POST['template_id'])){

    $template_id = (int) $_POST['template_id'];
    $engine = $_POST['engine'];

    if ($engine != 'flash' && $engine!='javascript')
    {
        $engine = 'javascript';
    }

    // Get extra flags
    $row = db_query_one("SELECT td.extra_flags  FROM {$xerte_toolkits_site->database_table_prefix}templatedetails td WHERE td.template_id = ?", array($template_id));

    $extra_flags = explode(";", $row['extra_flags']);
    $data = array();
    foreach($extra_flags as $i => $flag) {
        $bits = explode('=', $flag);
        $data[$bits[0]] = $bits[1];
    }
    $data['engine'] = $engine;
    // need to form into something like: engine=flash;foo=bar;something=somethingelse
    $db_flags = http_build_query($data, '', ';');
    $db_flags = str_replace(' ', '_', $db_flags); // not sure why we do this.

    $query = "UPDATE {$xerte_toolkits_site->database_table_prefix}templatedetails SET extra_flags = ? WHERE template_id = ?";
    $params = array($db_flags, $template_id);
    $ok = db_query($query, $params);

    if($ok) { 
        if ($_REQUEST['page']=='properties')
        {
            properties_display($xerte_toolkits_site,$template_id,true,"engine");
        }
        else
        {
            publish_display($template_id);
        }

    }else{

    }
}
