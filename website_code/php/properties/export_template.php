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
 * export template, allows the site to display the html for the export panel
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once("../../../config.php");
_load_language_file("/website_code/php/properties/export_template.inc");

require_once("../template_library.php");

include "../template_status.php";

include "../url_library.php";

include "../user_library.php";

$database_id=database_connect("Export template database connect success","Export template database connect failed");

/*
 * check user has some rights to this template
 */

if(is_numeric($_POST['template_id'])){

    if(is_user_creator($_POST['template_id'], $_SESSION['toolkits_logon_id'])||is_user_admin()){

        echo "<p class=\"header\"><span>" . EXPORT_TITLE . "</span></p>";

		$query_for_play_content_strip = str_replace("\" . \$xerte_toolkits_site->database_table_prefix . \"", $xerte_toolkits_site->database_table_prefix, $xerte_toolkits_site->play_edit_preview_query);

		$safe_template_id = (int) $_POST['template_id'];

		$query_for_play_content = str_replace("TEMPLATE_ID_TO_REPLACE", $safe_template_id, $query_for_play_content_strip);

                $row_play = db_query_one($query_for_play_content);
		$export_exists = false;
                
                if(!empty($row_play)) {
                    $export_exists = file_exists($xerte_toolkits_site->root_file_path . "modules/" . $row_play['template_framework'] . "/export_page.php");
                }
		if($export_exists) {

			require_once($xerte_toolkits_site->root_file_path . "modules/" . $row_play['template_framework'] . "/export_page.php");
			
		}else{
		
			echo "<p>" . EXPORT_NOT_AVAILABLE . "</p>";
		
		}

    }else{

        echo "<p>". EXPORT_FAIL. "</p>";

    }

}