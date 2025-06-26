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

	_load_language_file("/website_code/php/management/management_library.inc");
	_load_language_file("/management.inc");
	
	require_once("../language_library.php");
	function category_list(){
	
		global $xerte_toolkits_site;

        $query = "select * from {$xerte_toolkits_site->database_table_prefix}syndicationcategories";
        $query_response = db_query($query);

        //build tree
        $tree = array();
        foreach ($query_response as $data){
            if (!is_null($data) or $data !== false) {
                $child['id'] = $data["category_id"];
                $child['name'] = $data["category_name"];
                $child['children'] = array();
                if (is_null($data["parent_id"])) {
                    $tree[$child["id"]] = $child;
                } else {
                    if (!is_null($tree[$data["parent_id"]])) {
                        //key is in top level
                        $tree[$data["parent_id"]]["children"][$child["id"]] = $child;
                    } else {
                        //only checks 3 levels TODO change to work with all levels?
                        foreach ($tree as $i => $v) {
                            if (!is_null($v["children"][$data["parent_id"]])) {
                                $tree[$i]["children"][$data["parent_id"]]["children"][$child["id"]] = $child;

                            }
                        }
                    }
                }
            }
        }
	    //build page
		echo "<h2>" . MANAGEMENT_MENUBAR_CATEGORIES . "</h2>";
		
		echo "<div class=\"admin_block\">";
		echo "<h3>" . MANAGEMENT_LIBRARY_ADD_CATEGORY . "</h3>";
		
		echo "<p>" . MANAGEMENT_LIBRARY_NEW_CATEGORY . "<form><textarea cols=\"100\" rows=\"2\" id=\"newcategory\">" . MANAGEMENT_LIBRARY_NEW_CATEGORY_NAME . "</textarea></form></p>";
 	    echo "<p><form action=\"javascript:new_category();\"><button class=\"xerte_button\" type=\"submit\"><i class=\"fa fa-plus-circle\"></i> " . MANAGEMENT_LIBRARY_NEW_LABEL . "</button></form></p>";
		echo "</div>";
		
		echo "<div class=\"admin_block\">";
		echo "<h3>" . MANAGEMENT_LIBRARY_EXISTING_CATEGORIES . "</h3>";

        foreach ($tree as $node){
            echo print_node($node, 0, "category");
        }
		
		echo "</div>";
	
	}

    function educationlevel_list(){
        global $xerte_toolkits_site;

        $query = "select * from {$xerte_toolkits_site->database_table_prefix}educationlevel";
        $query_response = db_query($query);

        //build tree
        $tree = array();
        foreach ($query_response as $data){
            if (!is_null($data) or $data !== false) {
                $child['id'] = $data["educationlevel_id"];
                $child['name'] = $data["educationlevel_name"];
                $child['children'] = array();
                if (is_null($data["parent_id"])) {
                    $tree[$child["id"]] = $child;
                } else {
                    if (!is_null($tree[$data["parent_id"]])) {
                        //key is in top level
                        $tree[$data["parent_id"]]["children"][$child["id"]] = $child;
                    } else {
                        //only checks 3 levels TODO change to work with all levels?
                        foreach ($tree as $i => $v) {
                            if (!is_null($v["children"][$data["parent_id"]])) {
                                $tree[$i]["children"][$data["parent_id"]]["children"][$child["id"]] = $child;

                            }
                        }
                    }
                }
            }
        }
        //build page
		echo "<h2>" . MANAGEMENT_MENUBAR_EDUCATION . "</h2>";

		echo "<div class=\"admin_block\">";
        echo "<h3>" . MANAGEMENT_LIBRARY_ADD_EDUCATION . "</h3>";

        echo "<p>" . MANAGEMENT_LIBRARY_NEW_EDUCATION . "<form><textarea cols=\"100\" rows=\"2\" id=\"neweducationlevel\">" . MANAGEMENT_LIBRARY_NEW_EDUCATION_NAME . "</textarea></form></p>";

        echo "<p><form action=\"javascript:new_educationlevel();\"><button class=\"xerte_button\" type=\"submit\"><i class=\"fa fa-plus-circle\"></i> " . MANAGEMENT_LIBRARY_NEW_LABEL . "</button></form></p>";
		echo "</div>";

		echo "<div class=\"admin_block\">";
        echo "<h3>" . MANAGEMENT_LIBRARY_EXISTING_EDUCATION . "</h3>";

        foreach ($tree as $node){
            echo print_node($node, 0, "educationlevel");
        }

		echo "</div>";

    }
    //returns a div with options and all its children =
    function print_node($node, $level, $id_prefix, $hidden = "", $margin = 0){
        $html = '<div style="margin-left: ' . $margin . 'px" id='. $id_prefix . $node["id"] . " " . $hidden."> <p>" . $node['name'] . " - ";
        if (!empty($node["children"])){
            $childIDs = "";
            foreach ($node["children"] as $child){
                $childIDs .= $child["id"] . ",";
            } $childIDs = substr($childIDs, 0 , -1);

            $html .= "<button type=\"button\" class=\"xerte_button\" onclick=\"javascript:hide_show_children('" . $childIDs . "','". $id_prefix . "')\"><i class=\"fa fa-eye\"></i> " . MANAGEMENT_LIBRARY_EXPAND . " </button> ";
        }
        if ($level < 2){
            //TODO change to be not hardcoded
        $html .= "<button style='margin-right: 5px' type=\"button\" class=\"xerte_button\" onclick=\"javascript:new_" . $id_prefix . "('" . $node["id"] . "')\"><i class=\"fa fa-plus-circle\"></i> " . MANAGEMENT_LIBRARY_ADD . " </button>";
        }
        $html .= "<button type=\"button\" class=\"xerte_button\" onclick=\"javascript:remove_" . $id_prefix . "('" . $node['id'] .  "')\"><i class=\"fa fa-minus-circle\"></i> " . MANAGEMENT_LIBRARY_REMOVE . " </button> </p>";

        if (!empty($node["children"])) {
            foreach ($node["children"] as $child){
                $html .= print_node($child, $level + 1, $id_prefix, "hidden", 30);
            }
        }

        $html .= "</div>";
        return $html;
    }

    function grouping_list(){

        global $xerte_toolkits_site;

        $query="select * from `" . $xerte_toolkits_site->database_table_prefix . "grouping` order by grouping_name ASC";
		
		echo "<h2>" . MANAGEMENT_MENUBAR_GROUPINGS . "</h2>";
		
		echo "<div class=\"admin_block\">";
        echo "<h3>" . MANAGEMENT_LIBRARY_ADD_GROUPING . "</h3>";

        echo "<p>" . MANAGEMENT_LIBRARY_NEW_GROUPING . "<form><textarea cols=\"100\" rows=\"2\" id=\"newgrouping\">" . MANAGEMENT_LIBRARY_NEW_GROUPING_NAME . "</textarea></form></p>";
        echo "<p><form action=\"javascript:new_grouping();\"><button class=\"xerte_button\" type=\"submit\"><i class=\"fa fa-plus-circle\"></i> " . MANAGEMENT_LIBRARY_NEW_LABEL . "</button></form></p>";
		echo "</div>";

		echo "<div class=\"admin_block\">";
        echo "<h3>" . MANAGEMENT_LIBRARY_EXISTING_GROUPINGS . "</h3>";

        $query_response = db_query($query);

        foreach($query_response as $row) {

            echo "<p>" . $row['grouping_name'] . " - <button type=\"button\" class=\"xerte_button\" onclick=\"javascript:remove_grouping('" . $row['grouping_id'] .  "')\"><i class=\"fa fa-minus-circle\"></i> " . MANAGEMENT_LIBRARY_REMOVE . " </button></p>";

        }
		echo "</div>";

    }

    function course_list()
    {

        global $xerte_toolkits_site;

        $query = "select course_freetext_enabled from " . $xerte_toolkits_site->database_table_prefix . "sitedetails";
		
		echo "<h2>" . MANAGEMENT_MENUBAR_COURSES . "</h2>";
		echo "<div class=\"admin_block\">";
		
        $row = db_query_one($query);
        echo "<p>" . MANAGEMENT_COURSE_FREE_TEXT_ENABLE . "<form><textarea id=\"course_freetext_enabled\">" . $row['course_freetext_enabled'] . "</textarea></form></p>";

        $query = "select * from " . $xerte_toolkits_site->database_table_prefix . "course order by course_name ASC";
		echo "</div>";
		
		echo "<div class=\"admin_block\">";
        echo "<h3>" . MANAGEMENT_LIBRARY_ADD_COURSE . "</h3>";

        echo "<p>" . MANAGEMENT_LIBRARY_NEW_COURSE . "<form><textarea cols=\"100\" rows=\"2\" id=\"newcourse\">" . MANAGEMENT_LIBRARY_NEW_COURSE_NAME . "</textarea></form></p>";
        echo "<p><form action=\"javascript:new_course();\"><button class=\"xerte_button\" type=\"submit\"><i class=\"fa fa-plus-circle\"></i> " . MANAGEMENT_LIBRARY_NEW_LABEL . "</button></form></p>";
		echo "</div>";
		
		echo "<div class=\"admin_block\">";
        echo "<h3>" . MANAGEMENT_LIBRARY_EXISTING_COURSES . "</h3>";

        $query_response = db_query($query);

        if ($query_response !== false && $query_response != null) {
            foreach ($query_response as $row) {
                echo "<p>" . $row['course_name'] . " - <button type=\"button\" class=\"xerte_button\" onclick=\"javascript:remove_course('" . $row['course_id'] . "')\"><i class=\"fa fa-minus-circle\"></i> " . MANAGEMENT_LIBRARY_REMOVE . " </button></p>";
            }
        }
		echo "</div>";
    }

	function syndication_list(){
	
		global $xerte_toolkits_site;
	
		$database_id = database_connect("templates list connected","template list failed");

		$query="select * from " . $xerte_toolkits_site->database_table_prefix . "templatesyndication," . 
                        $xerte_toolkits_site->database_table_prefix . "templatedetails where " .
                        $xerte_toolkits_site->database_table_prefix . "templatesyndication.template_id = " .
                        $xerte_toolkits_site->database_table_prefix . "templatedetails.template_id and( rss=? or export=? or syndication=?)";

                $params = array('true', 'true', 'true');
                
		$query_response = db_query($query, $params);
		
		echo "<h2>" . MANAGEMENT_MENUBAR_FEEDS . "</h2>";
		
		if (count($query_response) > 0) {
			
			echo "<div class=\"admin_block\">";

			foreach($query_response as $row) {

				echo "<p>" . $row['template_name'] . " (" . $row['template_id'] . ")";

				if($row['rss'] == "true") {

					echo " - <button type=\"button\" class=\"xerte_button\" onclick=\"javascript:remove_feed('" . $row['template_id'] .  "','RSS')\"><i class=\"fa fa-minus-circle\"></i> " . MANAGEMENT_LIBRARY_REMOVE_RSS . "</button> ";

				}

				if($row['export'] == "true") {

					echo " - <button type=\"button\" class=\"xerte_button\" onclick=\"javascript:remove_feed('" . $row['template_id'] .  "', 'EXPORT')\"><i class=\"fa fa-minus-circle\"></i> " . MANAGEMENT_LIBRARY_REMOVE_EXPORT . "</button> ";

				}

				if($row['syndication'] == "true"){

					echo " - <button type=\"button\" class=\"xerte_button\" onclick=\"javascript:remove_feed('" . $row['template_id'] .  "','SYND')\"><i class=\"fa fa-minus-circle\"></i> " . MANAGEMENT_LIBRARY_REMOVE_SYNDICATION . "</button> ";

				}

			}
			
			echo "</div>";
		}
		else {
			echo "<div class=\"admin_block\">";
			echo "<p>" . MANAGEMENT_LIBRARY_FEEDS_NO_FEEDS . "</p>";
			echo "</div>";
		}
	}
	
	function security_list(){
	
		global $xerte_toolkits_site;
		
		echo "<h2>" . MANAGEMENT_MENUBAR_PLAY . "</h2>";
	
		echo "<div class=\"admin_block\">";
		echo "<h3>" . MANAGEMENT_LIBRARY_ADD_SECURITY . "</h3>";

		echo "<p>" . MANAGEMENT_LIBRARY_NEW_SECURITY  . "<form><textarea cols=\"100\" rows=\"2\" id=\"newsecurity\">" . MANAGEMENT_LIBRARY_NEW_SECURITY_NAME . "</textarea></form></p>";
		echo "<p>" . MANAGEMENT_LIBRARY_NEW_SECURITY_DATA . "<form><textarea cols=\"100\" rows=\"2\" id=\"newdata\">" . MANAGEMENT_LIBRARY_NEW_SECURITY_DETAILS . "</textarea></form></p>";
		echo "<p>" . MANAGEMENT_LIBRARY_NEW_SECURITY_INFO . "<form><textarea cols=\"100\" rows=\"2\" id=\"newdesc\">" . MANAGEMENT_LIBRARY_NEW_SECURITY_DESCRIPTION . "</textarea></form></p>"; 
		echo "<p><form action=\"javascript:new_security();\"><button type=\"submit\" class=\"xerte_button\"><i class=\"fa fa-plus-circle\"></i> " . MANAGEMENT_LIBRARY_ADD_SECURITY . " </button></form></p>";
		
		echo "</div>";
		
		echo "<div class=\"admin_block\">";
		echo "<h3>" . MANAGEMENT_LIBRARY_EXISTING_SECURITY . "</h3>";
                
                $query_for_play_security = "select * from " . $xerte_toolkits_site->database_table_prefix . "play_security_details";

		$query_for_play_security_response = db_query($query_for_play_security);
		
		echo "<div class=\"indented\">";
		
        foreach($query_for_play_security_response as $row_security) {
		
			echo "<div class=\"template\" id=\"play" . $row_security['security_id'] . "\" savevalue=\"" . $row_security['security_id'] .  "\"><p>" . $row_security['security_setting'] . " <button type=\"button\" class=\"xerte_button\" id=\"play" . $row_security['security_id'] . "_btn\" onclick=\"javascript:templates_display('play" . $row_security['security_id'] . "')\"> " . MANAGEMENT_LIBRARY_VIEW . "</button></p></div><div class=\"template_details\" id=\"play" . $row_security['security_id']  . "_child\">";
		
			echo "<p>" . MANAGEMENT_LIBRARY_EXISTING_SECURITY_IS . "<form><textarea id=\"" . $row_security['security_id'] . "security\">" . $row_security['security_setting']  . "</textarea></form></p>";
			echo "<p>" . MANAGEMENT_LIBRARY_EXISTING_SECURITY_DATA . "<form><textarea id=\"" . $row_security['security_id'] .  "data\">" .  $row_security['security_data']  . "</textarea></form></p>";
			echo "<p>" . MANAGEMENT_LIBRARY_EXISTING_SECURITY_INFO . "<form><textarea id=\"" . $row_security['security_id'] .  "info\">" .  $row_security['security_info']  . "</textarea></form></p>"; 
		
			echo "<p><button type=\"button\" class=\"xerte_button\" onclick=\"javascript:remove_security()\"><i class=\"fa fa-minus-circle\"></i> " . MANAGEMENT_LIBRARY_EXISTING_SECURITY_REMOVE . "</button> " . MANAGEMENT_LIBRARY_EXISTING_SECURITY_WARNING . "</p></div>";

		}
		
		echo "</div></div>";
	
	}



	function licence_list(){
	
		global $xerte_toolkits_site;
	
		$database_id = database_connect("licence list connected","licence list failed");
		
		echo "<h2>" . MANAGEMENT_MENUBAR_LICENCES . "</h2>";
		
		echo "<div class=\"admin_block\">";
		echo "<h3>" . MANAGEMENT_LIBRARY_NEW_LICENCE . "</h3>";

		echo "<p>" . MANAGEMENT_LIBRARY_NEW_LICENCE_DETAILS . "<form><textarea cols=\"100\" rows=\"2\" id=\"newlicense\">" . MANAGEMENT_LIBRARY_NEW_LICENCE_NAME . "</textarea></form></p>";
		echo "<p><form action=\"javascript:new_license();\"><button type=\"submit\" class=\"xerte_button\" ><i class=\"fa fa-plus-circle\"></i> " . MANAGEMENT_LIBRARY_NEW_LABEL . "</button></form></p>";
		echo "</div>";
		
		echo "<div class=\"admin_block\">";
		echo "<h3>" . MANAGEMENT_LIBRARY_MANAGE_LICENCES . "</h3>";

		$query="select * from " . $xerte_toolkits_site->database_table_prefix . "syndicationlicenses";

		$query_response = db_query($query);

		foreach($query_response as $row) { 

			echo "<p>" . $row['license_name'] . " - <button type=\"button\" class=\"xerte_button\" onclick=\"javascript:remove_licenses('" . $row['license_id'] .  "')\"><i class=\"fa fa-minus-circle\"></i> " . MANAGEMENT_LIBRARY_REMOVE . " </button></p>";

		}
		echo "</div>";
	
	}

	function management_fail(){
	
		echo MANAGEMENT_LIBRARY_FAIL;
	
	}

    function language_details($changed){

        global $xerte_toolkits_site;


        echo "<p>" . MANAGEMENT_LIBRARY_LANGUAGES_EXPLAINED . "</p>";
        echo "<p>" . MANAGEMENT_LIBRARY_ADD_LANGUAGE . "</p>";
        echo "<p><br><form method=\"post\" enctype=\"multipart/form-data\" id=\"languagepopup\" name=\"languageform\" target=\"upload_iframe\" action=\"website_code/php/language/import_language.php\" onsubmit=\"javascript:iframe_upload_language_check_initialise();\"><input name=\"filenameuploaded\" type=\"file\" /><br /><br/><button type=\"submit\" class=\"xerte_button\" name=\"submitBtn\" onsubmit=\"javascript:iframe_language_check_initialise()\" ><i class=\"fa fa-plus-circle\"></i> " . MANAGEMENT_LIBRARY_LANGUAGE_INSTALL . "</button></form></p>";
        echo "<p>" . MANAGEMENT_LIBRARY_EXISTING_LANGUAGES . "</p>";
        $langs = getLanguages();
        $codes = array_keys($langs);
        echo "<ul>";
        foreach($codes as $code)
        {
	        $version = "";
            if($langs[$code]->version != ""){
                $version = " " . $langs[$code]->version;
            }
            echo "<li>" . $langs[$code]->name . $version;
            if ($code != "en-GB")
            {
                echo " <button type=\"button\" class=\"xerte_button\" onclick=\"javascript:delete_language('" . $code .  "')\"><i class=\"fa fa-minus-circle\"></i> " . MANAGEMENT_LIBRARY_REMOVE . " </button></li>";
            }
            else{
                echo "</li>";
            }
        }
        echo "</ul>";
        if ($changed)
        {
            echo "<p>". MANAGEMENT_LIBRARY_LANGUAGES_UPDATED . "</p>";
        }

    }
