<?PHP
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

//PROPERTIES LIBRARY

require_once(dirname(__FILE__) . "/../../../config.php");
require_once(dirname(__FILE__) . "/../template_status.php");
require_once(dirname(__FILE__) . "/../template_library.php");
require_once(dirname(__FILE__) . "/../xAPI/xAPI_library.php");


_load_language_file("/website_code/php/properties/publish.inc");
_load_language_file("/website_code/php/properties/properties_library.inc");
_load_language_file("/website_code/php/properties/sharing_status_template.inc");
_load_language_file("/properties.inc");

function xml_template_display($xerte_toolkits_site, $template_id, $change){

    $prefix = $xerte_toolkits_site->database_table_prefix;
	
	echo "<h2 class=\"header\">" . PROPERTIES_LIBRARY_XML_TITLE . "</h2>";
	echo "<div id=\"mainContent\">";

    echo "<p>" . PROPERTIES_LIBRARY_XML_DESCRIPTION . "</p>";

    $query = "select * from {$prefix}additional_sharing where sharing_type= ? AND template_id = ?";
    $params = array("xml", $template_id);

    $row = db_query_one($query, $params);
	
	echo "<form id=\"xmlshare\" action=\"javascript:xml_change_template()\">";
	
	echo "<div><input type=\"checkbox\" id=\"xmlon\" " . (!empty($row) ? "checked" : "") . " /><label for=\"xmlon\">" . PROPERTIES_LIBRARY_XML_SHARING . "</label></div>";
	
	echo "<label id=\"sitenameLabel\" class=\"block\" for=\"sitename\">" . PROPERTIES_LIBRARY_XML_RESTRICT . ":</label>";
	
	echo "<input id=\"sitename\" type=\"text\" value=\"" . (isset($row['extra']) ? $row['extra'] : "") . "\" name=\"sitename\" style=\"width:90%;\" />";
	
	echo "<button type=\"submit\" class=\"xerte_button\" style=\"padding-left:5px;\" align=\"top\" ><i class=\"fa fa-floppy-o\"></i>&nbsp;" . PROPERTIES_LIBRARY_SAVE . "</button>";
	
	if($change){

		echo "<span class='alert_msg' aria-live='polite'><i class='fa fa-exclamation-circle' style='height: 14px; color:#f86718;'></i> " . PROPERTIES_LIBRARY_XML_SAVE . "</span>";

	}
	
	echo "</form>";
	
	echo "</div>";

}

function xml_template_display_fail($editor){

	echo "<h2 class=\"header\">" . PROPERTIES_LIBRARY_XML_TITLE . "</h2>";
	
    echo "<div id=\"mainContent\">";
	
	if ($editor) { // not creator / co-author
		
		echo "<p>" . PROPERTIES_LIBRARY_XML_ERROR . "</p>";
		
	} else {
		
		echo "<p>" . PROPERTIES_LIBRARY_PROJECT_FAIL . "</p>";
		
	}
	
	echo "</div>";

}

function properties_display($xerte_toolkits_site, $template_id, $change, $msgtype){

    echo "<h2 class=\"header\">" . PROPERTIES_LIBRARY_PROJECT . "</h2>";
	echo "<div id=\"mainContent\">";
	
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $query_for_names = "select {$prefix}templatedetails.template_name, template_framework, date_created, date_modified, extra_flags from "
    . "{$prefix}templatedetails, {$prefix}originaltemplatesdetails where template_id= ? and {$prefix}originaltemplatesdetails.template_type_id =  {$prefix}templatedetails.template_type_id ";

    $params = array($template_id);
    $row = db_query_one($query_for_names, $params);

	$query_for_template_name = "select template_name from {$prefix}templatedetails where template_id= ?";
	$params = array($template_id);

	$row_template_name = db_query_one($query_for_template_name, $params);

    if(is_user_creator_or_coauthor($template_id) || is_user_permitted("projectadmin")){

        echo "<form id=\"rename_form\" action=\"javascript:rename_template('" . $template_id ."', 'rename_form')\"><label class=\"block\" for=\"newfilename\">" . PROPERTIES_LIBRARY_PROJECT_NAME . ":</label><input type=\"text\" value=\"" . str_replace("_", " ", $row_template_name['template_name']) . "\" name=\"newfilename\" id=\"newfilename\" /><button type=\"submit\" class=\"xerte_button\" style=\"padding-left:5px;\" align=\"top\" ><i class=\"fa fa-floppy-o\"></i>&nbsp;" . PROPERTIES_LIBRARY_RENAME . "</button>";

        if($change && $msgtype=="name"){

            echo "<p class='alert_msg' aria-live='polite'><i class='fa fa-exclamation-circle' style='height: 14px; color:#f86718;'></i> " . PROPERTIES_LIBRARY_PROJECT_CHANGED . "</p>";

        }
		
		echo "</form>";

    } else {
		
		echo "<p>" . PROPERTIES_LIBRARY_PROJECT_NAME . ": " . str_replace("_", " ", $row_template_name['template_name']) . "</p>";
		
	}

    echo "<p>" . PROPERTIES_LIBRARY_PROJECT_CREATE . " " . $row['date_created'] . "</p>";

    echo "<p>" . PROPERTIES_LIBRARY_PROJECT_MODIFY . " " . $row['date_modified'] . "</p>";

	include "../../../modules/" . $row['template_framework'] . "/module_functions.php";

    if(template_access_settings($template_id)!='Private'){

        echo "<p>" . PROPERTIES_LIBRARY_PROJECT_LINK;

        echo "<br/><a target=\"new\" href='" . $xerte_toolkits_site->site_url .
                url_return("play", $template_id) . "'>" .
                $xerte_toolkits_site->site_url . url_return("play", $template_id) . "</a>" .  PROPERTIES_LIBRARY_PROJECT_LINKS . "</p>";

		$template = explode("_", get_template_type($template_id));

        if(file_exists($xerte_toolkits_site->root_file_path . "/modules/" . $template[0] . "/play_links.php")){

			require_once($xerte_toolkits_site->root_file_path . "/modules/" . $template[0] . "/play_links.php");

			show_play_links($template[1]);

		}

        // Get the template screen size

        $query_for_template_name = "select {$prefix}originaltemplatesdetails.template_name, "
        . "{$prefix}originaltemplatesdetails.template_framework from "
        . "{$prefix}originaltemplatesdetails, {$prefix}templatedetails where"
        . " {$prefix}templatedetails.template_type_id = {$prefix}originaltemplatesdetails.template_type_id AND template_id = ?";

        $params = array($template_id);

        $row_name = db_query_one($query_for_template_name, $params);

		if(isset($xerte_toolkits_site->learning_objects->{$row_name['template_framework'] . "_" . $row_name['template_name']}->preview_size)){

			if($xerte_toolkits_site->learning_objects->{$row_name['template_framework'] . "_" . $row_name['template_name']}->preview_size!="*"){

				$temp_string = $xerte_toolkits_site->learning_objects->{$row_name['template_framework'] . "_" . $row_name['template_name']}->preview_size;

			}else{

				$temp_string = "100%,100%";

			}

		}else{

			$temp_string = "100%,100%";

		}

        $temp_array = explode(",",$temp_string);

        echo "<label id=\"embedCodeLabel\" class=\"block indent\" for=\"embedCode\">" . PROPERTIES_LIBRARY_PROJECT_IFRAME . ":</label><textarea name=\"embedCode\" id=\"embedCode\" readonly rows='3' cols='40' onfocus='this.select()' class='indent'><iframe src=\""  . $xerte_toolkits_site->site_url .  url_return("play", $template_id) .  "\" width=\"" . $temp_array[0] . "\" height=\"" . $temp_array[1] . "\" frameborder=\"0\" style=\"position:relative; top:0px; left:0px; z-index:0;\"></iframe></textarea>";

    }
	
	if(is_user_creator_or_coauthor($template_id) || is_user_permitted("projectadmin")){
		
		if(function_exists("display_property_engines")){
			
			echo "<br/>";
			
			display_property_engines($change,$msgtype);

		}
		
	}
	
	echo "</div>";

}

function properties_display_fail(){

	echo "<h2 class=\"header\">" . PROPERTIES_LIBRARY_PROJECT . "</h2>";
	
    echo "<div id=\"mainContent\">";

    echo "<p>" . PROPERTIES_LIBRARY_PROJECT_FAIL . "</p>";
	
	echo "</div>";
	
}

function publish_display($template_id)
{
    global $xerte_toolkits_site;

    $prefix = $xerte_toolkits_site->database_table_prefix;
    $database_id=database_connect("Properties template database connect success","Properties template database connect failed");

    // User has to have some rights to do this
    if( has_rights_to_this_template($template_id, $_SESSION['toolkits_logon_id']) || is_user_permitted("projectadmin") ){
		
		echo "<h2 class=\"header\">" . PUBLISH_TITLE . "</h2>";

		echo "<div id=\"mainContent\">";

        $query_for_names = "select td.template_name, td.date_created, td.date_modified, otd.template_framework from {$prefix}templatedetails td, "
        . "{$prefix}originaltemplatesdetails otd where td.template_id= ? and td.template_type_id = otd.template_type_id";

        $params = array($template_id);

        $row = db_query_one($query_for_names, $params);
		
		include "../../../modules/" . $row['template_framework'] . "/module_functions.php";
		
		$template_access = template_access_settings($template_id);

		$query_for_template_name = "select template_name from {$prefix}templatedetails where template_id= ?";
		$params = array($template_id);

		$row_template_name = db_query_one($query_for_template_name, $params);

        echo "<p>" . PUBLISH_NAME . ": " . str_replace('_', ' ', $row_template_name['template_name']) . "</p>";
		
		display_publish_engine();

        echo "<p>" . PUBLISH_ACCESS . ": " . $template_access . "</p>";
		
		if($template_access!="Private"){
		
			echo "<p>" . PUBLISH_WEB_ADDRESS . ": <a target='_blank' href='" . $xerte_toolkits_site->site_url . url_return("play",$template_id) . "'>" . $xerte_toolkits_site->site_url . url_return("play",$template_id) . "</a>" . PUBLISH_LINKS . "</p>";
		
			if(!is_template_rss($template_id)){

				echo "<p>" . PUBLISH_RSS . ": " . PUBLISH_RSS_NOT_INCLUDE . "</p>";

			}else{

				echo "<p>" . PUBLISH_RSS . ": " . PUBLISH_RSS_INCLUDE . "</p>";

			}
			
			if(!is_template_syndicated($template_id)){

				echo "<p>" . PUBLISH_SYNDICATION . ": " .  PUBLISH_SYNDICATION_STATUS_OFF . "</p>";

			}else{

				echo "<p>" . PUBLISH_SYNDICATION . ": " .  PUBLISH_SYNDICATION_STATUS_ON . "</p>";

			}
		
		} else {
			
            echo "<p><i class='fa fa-exclamation-circle' style='height: 14px; color:#f86718;'></i> " . PUBLISH_ACCESS_STATUS . "</p>";

        }

        if($template_access!=""){

            echo "<p><button type=\"button\" class=\"xerte_button\" onclick=\"publish_project(window.name);\"><i class=\"fa fa-share xerte-icon\"></i> " . PUBLISH_BUTTON_LABEL . "</button></p>";

        }
		
		echo "</div>";

    }else{
		
		publish_display_fail();

    }
	
}

function publish_display_fail(){

	echo "<h2 class=\"header\">" . PUBLISH_TITLE . "</h2>";
	
    echo "<div id=\"mainContent\">";

    echo "<p>" . PUBLISH_FAIL . "</p>";
	
	echo "</div>";
	
}

function notes_display($notes, $change, $template_id){
    $template_id = (int) $template_id;
    $notes = htmlentities($notes, ENT_QUOTES, 'UTF-8', false);
	
	echo "<h2 class=\"header\">" . PROPERTIES_TAB_NOTES . "</h2>";
	echo "<div id=\"mainContent\">";

    echo "<form id=\"notes_form\" action=\"javascript:change_notes('" . $template_id ."', 'notes_form')\"><label class=\"block\" for=\"notes\">" . PROPERTIES_LIBRARY_NOTES_EXPLAINED . ":</label><textarea id=\"notes\" name=\"notes\" style=\"width:90%; height:330px\">" . $notes . "</textarea><button type=\"submit\" class=\"xerte_button\"><i class=\"fa fa-floppy-o\"></i>&nbsp;" . PROPERTIES_LIBRARY_SAVE . " </button>";
	
	if($change){

        echo "<span class='alert_msg' aria-live='polite'><i class='fa fa-exclamation-circle' style='height: 14px; color:#f86718;'></i> " . PROPERTIES_LIBRARY_NOTES_SAVED . "</span>";

    }
	
	echo "</form>";
    echo "<script type=\"text/javascript\">
        function makeeditor() {
        ckeditor = CKEDITOR.replace(\"notes\", {
                toolbarStartupExpanded: false,
                height: 360,
                language: '" . $_SESSION['toolkits_language'] . "'
            });
        }
        </script>";
	
	echo "</div>";
}

function notes_display_fail($editor){

	echo "<h2 class=\"header\">" . PROPERTIES_TAB_NOTES . "</h2>";
	
    echo "<div id=\"mainContent\">";
	
	if ($editor) { // not creator / co-author
		
		echo "<p>" . PROPERTIES_LIBRARY_NOTES_FAIL . "</p>";
		
	} else {
		
		echo "<p>" . PROPERTIES_LIBRARY_PROJECT_FAIL . "</p>";
		
	}
	
	echo "</div>";

}

function peer_display($xerte_toolkits_site,$change, $template_id){
    $prefix = $xerte_toolkits_site->database_table_prefix;
    $template_id = (int) $template_id;
	
	echo "<h2 class=\"header\">" . PROPERTIES_LIBRARY_PEER . "</h2>";
	
	echo "<div id=\"mainContent\">";

    echo "<p>" . PROPERTIES_LIBRARY_PEER_EXPLAINED . "</p>";
	
	$query = "select * from {$prefix}additional_sharing where sharing_type=? AND template_id = ?";

    $params = array('peer', $template_id);

    $row = db_query_one($query, $params);
	
	if(!empty($row)) {
		
		echo "<p>" . PROPERTIES_LIBRARY_PEER_LINK . ":<br/><a target=\"new\" href=\"" . $xerte_toolkits_site->site_url . url_return("peerreview", $template_id) . "\">" .  $xerte_toolkits_site->site_url . url_return("peerreview", $template_id)  . "</a>" . PROPERTIES_LIBRARY_PEER_LINKS . "</p>";
		
	}
	
	echo "<form id=\"peer\" action=\"javascript:peer_change_template()\" name=\"peer\" >";
	
	echo "<div><input type=\"checkbox\" id=\"peeron\" " . (!empty($row) ? "checked" : "") . " /><label for=\"peeron\">" . PROPERTIES_LIBRARY_PEER_STATUS . "</label></div>";
	
	$extra = array();
    $passwd = "";
    if(!empty($row)) {
        $extra = explode("," , $row['extra'],2);
        $passwd = $extra[0];
    }

    if (count($extra) > 1)
    {
        $retouremail = $extra[1];
    }
    else
    {
        $retouremail = $_SESSION['toolkits_logon_username'];
        if (strlen($xerte_toolkits_site->email_to_add_to_username)>0)
        {
            $retouremail .= '@' . $xerte_toolkits_site->email_to_add_to_username;
        }

    }
	
	echo "<label id=\"passwordLabel\" class=\"block\" for=\"password\">" . PROPERTIES_LIBRARY_PEER_PASSWORD_PROMPT . ":</label>";
	
	echo "<input id=\"password\" type=\"text\" value=\"" . $passwd . "\" name=\"password\" style=\"width:90%;\" />";
	
	echo "<label id=\"retouremailLabel\" class=\"block\" for=\"retouremail\">" . PROPERTIES_LIBRARY_PEER_RETOUREMAIL_PROMPT . ":</label>";
	
	echo "<input id=\"retouremail\" type=\"text\" value=\"" . $retouremail . "\" name=\"retouremail\" style=\"width:90%;\" />";
	
	echo "<button type=\"submit\" class=\"xerte_button\" ><i class=\"fa fa-floppy-o\"></i>&nbsp;" . PROPERTIES_LIBRARY_SAVE . "</button>";
	
	if($change){
		
        echo "<span class='alert_msg' aria-live='polite'><i class='fa fa-exclamation-circle' style='height: 14px; color:#f86718;'></i> " . PROPERTIES_LIBRARY_PEER_SAVED . "</span>";

    }
	
	echo "</form>";
	
	echo "</div>";

}

function peer_display_fail($editor){
	
	echo "<h2 class=\"header\">" . PROPERTIES_LIBRARY_PEER . "</h2>";
	
	echo "<div id=\"mainContent\">";

	if ($editor) { // not creator / co-author
		
		echo "<p>" . PROPERTIES_LIBRARY_PEER_FAIL . "</p>";
		
	} else {
		
		echo "<p>" . PROPERTIES_LIBRARY_PROJECT_FAIL . "</p>";
		
	}
	
	echo "</div>";

}

function syndication_display($xerte_toolkits_site, $template_id, $change){
	
	echo "<h2 class=\"header\">" . PROPERTIES_LIBRARY_SYNDICATION . "</h2>";
    
	echo "<div id=\"mainContent\">";

    echo "<p>" . PROPERTIES_LIBRARY_SYNDICATION_EXPLAINED . ": <a target=\"new\" href=\"" . $xerte_toolkits_site->site_url . url_return("RSS_syndicate",null) . "\">" . $xerte_toolkits_site->site_url . url_return("RSS_syndicate",null) . "</a>" .  PROPERTIES_LIBRARY_SYNDICATION_LINKS . "</p>";

    $prefix =  $xerte_toolkits_site->database_table_prefix;

    $query_for_syndication = "select syndication,description,keywords,category,license from {$prefix}templatesyndication where template_id=?";

    $params = array($template_id);

    $row_syndication = db_query_one($query_for_syndication, $params);
	
	echo "<form id=\"xmlshare\" action=\"javascript:syndication_change_template()\" name=\"xmlshare\" >";
	
	echo "<div><input type=\"checkbox\" id=\"syndon\" " . ($row_syndication !== false && $row_syndication != null && $row_syndication['syndication']=="true" ? "checked" : "") . " /><label for=\"syndon\">" . PROPERTIES_LIBRARY_SYNDICATION_PROMPT . "</label></div>";
	
	echo "<label id=\"category_listLabel\" class=\"block\" for=\"category_list\">" . PROPERTIES_LIBRARY_SYNDICATION_CATEGORY . ":</label><select SelectedItem=\"" . ($row_syndication !== false && $row_syndication != null ? $row_syndication['category'] : "") . "\" name=\"type\" id=\"category_list\">";

    $query_for_categories = "select category_name from {$prefix}syndicationcategories";

    $query_categories_response = db_query($query_for_categories);

    foreach($query_categories_response as $row_categories) {

        echo "<option value=\"" . $row_categories['category_name'] . "\"";

        if($row_categories['category_name']==$row_syndication['category']){

            echo " selected=\"selected\" ";

        }

        echo ">" . $row_categories['category_name'] . "</option>";

    }

    echo "</select>";

    echo "<label id=\"license_listLabel\" for=\"license_list\" class=\"block\">" . PROPERTIES_LIBRARY_SYNDICATION_LICENCE . ":</label><select ";

    if(isset($row_syndication['license_name'])){

        echo " SelectedItem=\"" . $row_syndication['license_name'] . "\"";

    }

    echo " name=\"type\" id=\"license_list\">";

    $query_for_licenses = "select license_name from {$prefix}syndicationlicenses";

    $query_licenses_response = db_query($query_for_licenses);

    foreach($query_licenses_response as $row_licenses){

        echo "<option value=\"" . $row_licenses['license_name'] . "\"";

        if($row_licenses['license_name']==$row_syndication['license']){

            echo " selected=\"selected\" ";

        }

        echo ">" . $row_licenses['license_name'] . "</option>";

    }

    echo "</select>";
	
	echo "<label id=\"descriptionLabel\" class=\"block\" for=\"description\">" . PROPERTIES_LIBRARY_SYNDICATION_DESCRIPTION . ":</label><textarea id=\"description\" style=\"width:90%; height:120px;\">" . ($row_syndication !== false && $row_syndication != null ? $row_syndication['description'] : "") . "</textarea>";
	
	echo "<label id=\"keywordsLabel\" class=\"block\" for=\"keywords\">" . PROPERTIES_LIBRARY_SYNDICATION_KEYWORDS . ":</label><textarea id=\"keywords\" style=\"width:90%; height:40px;\">" . ($row_syndication !== false && $row_syndication != null ? $row_syndication['keywords'] : "") . "</textarea>";	
	
	echo "<button type=\"submit\" class=\"xerte_button\" ><i class=\"fa fa-floppy-o\"></i>&nbsp;" . PROPERTIES_LIBRARY_SAVE . "</button>";
	
	if($change){
		
        echo "<span class='alert_msg' aria-live='polite'><i class='fa fa-exclamation-circle' style='height: 14px; color:#f86718;'></i> " . PROPERTIES_LIBRARY_SYNDICATION_SAVED . "</span>";

    }
	
	echo "</form>";
	
	echo "</div>";

}

function syndication_not_public($xerte_toolkits_site){
	
	echo "<h2 class=\"header\">" . PROPERTIES_LIBRARY_SYNDICATION . "</h2>";
    echo "<div id=\"mainContent\">";

    echo "<p>" . PROPERTIES_LIBRARY_SYNDICATION_PUBLIC . "</p>";

    echo "<p>" . PROPERTIES_LIBRARY_SYNDICATION_URL . " <a target=\"new\" href=\"" . $xerte_toolkits_site->site_url . url_return("RSS_syndicate",null) . "\">" . $xerte_toolkits_site->site_url . url_return("RSS_syndicate",null) . "</a></p>";

	echo "</div>";

}

function syndication_display_fail($editor){

	echo "<h2 class=\"header\">" . PROPERTIES_LIBRARY_SYNDICATION . "</h2>";
	
    echo "<div id=\"mainContent\">";

	if ($editor) { // not creator / co-author
		
		echo "<p>" . PROPERTIES_LIBRARY_SYNDICATION_FAIL . "</p>";
		
	} else {
		
		echo "<p>" . PROPERTIES_LIBRARY_PROJECT_FAIL . "</p>";
		
	}
	
	echo "</div>";

}

function project_info($template_id){

    global $xerte_toolkits_site;

	$prefix = $xerte_toolkits_site->database_table_prefix;

    $query_for_names = "select td.template_name as project_name, td.template_id, otd.template_framework, otd.template_name, otd.display_name, otd.parent_template, otd2.display_name as parent_display_name, td.date_created, td.date_modified, td.extra_flags from "
        . "{$prefix}templatedetails td, {$prefix}originaltemplatesdetails otd, {$prefix}originaltemplatesdetails otd2 where td.template_id= ? and otd.template_type_id = td.template_type_id and otd.parent_template = otd2.template_name";

    $params = array($template_id);
    $row = db_query_one($query_for_names, $params);

    $query_for_template_name = "select template_name from {$prefix}templatedetails where template_id= ?";
    $params = array($template_id);

    $row_template_name = db_query_one($query_for_template_name, $params);

    $info = PROJECT_INFO_NAME . ": " . str_replace('_', ' ', $row_template_name['template_name']) . "<br/>";

    $info .= PROJECT_INFO_ID . ": " . $row['template_id'] . "<br/>";

    $info .= PROJECT_INFO_CREATED . ": " . $row['date_created'] . "<br/>";

    $info .=  PROJECT_INFO_MODIFIED . ": " . $row['date_modified'] . "<br/>";

    $info .= PROJECT_INFO_FRAMEWORK . ": " . $row['display_name'];

    if ($row['parent_template'] == $row['template_name']) {
        $info .= "<br/>";
    } else {
        $info .= " (" . $row['parent_display_name'] . ")<br/>";
    }

    include "../../../modules/" . $row['template_framework'] . "/module_functions.php";

    $info .=  PROJECT_INFO_RUNTIME  . ": ";

    if (get_default_engine($template_id) == 'flash')
    {
        $info .=  "<span class='warning'><i class='fa fa-exclamation-triangle' title='" . PROPERTIES_LIBRARY_FLASH_WARNING . "' style='height: 14px;'></i> ";
        $info .=  PROPERTIES_LIBRARY_DEFAULT_FLASH . "</span><br/>";
    }
    else
    {
        $info .=  PROPERTIES_LIBRARY_DEFAULT_HTML5 . "<br/>";
    }

    if(template_access_settings($template_id)!='Private'){

        $info .= '<br/>' . PROJECT_INFO_URL . ": ";

        $play_page = "play";

        $info .=  "<a target=\"new\" href='" . $xerte_toolkits_site->site_url .
            url_return("play", $template_id) . "'>" .
            $xerte_toolkits_site->site_url . url_return("play", $template_id) . "</a><br/>";

        $template = explode("_", get_template_type($template_id));


        if(file_exists($xerte_toolkits_site->root_file_path . "/modules/" . $template[0] . "/play_links.php")){

            require_once($xerte_toolkits_site->root_file_path . "/modules/" . $template[0] . "/play_links.php");

            //show_play_links($template[1]);

        }

        // Get the template screen size

        $query_for_template_name = "select {$prefix}originaltemplatesdetails.template_name, "
            . "{$prefix}originaltemplatesdetails.template_framework from "
            . "{$prefix}originaltemplatesdetails, {$prefix}templatedetails where"
            . " {$prefix}templatedetails.template_type_id = {$prefix}originaltemplatesdetails.template_type_id AND template_id = ?";

        $params = array($template_id);

        $row_name = db_query_one($query_for_template_name, $params);


        if(isset($xerte_toolkits_site->learning_objects->{$row_name['template_framework'] . "_" . $row_name['template_name']}->preview_size)){

            if($xerte_toolkits_site->learning_objects->{$row_name['template_framework'] . "_" . $row_name['template_name']}->preview_size!="*"){

                $temp_string = $xerte_toolkits_site->learning_objects->{$row_name['template_framework'] . "_" . $row_name['template_name']}->preview_size;

            }else{

                $temp_string = "100%,100%";

            }

        }else{

            $temp_string = "100%,100%";

        }

        $temp_array = explode(",",$temp_string);

        $info .=  '<br/><form><label class=\"block\" for="embed_text_area">' . PROJECT_INFO_EMBEDCODE . ":</label><br/><textarea readonly id='embed_text_area' rows='3' cols='30' onfocus='this.select()'><iframe src=\""  . $xerte_toolkits_site->site_url .  url_return($play_page, $template_id) .  "\" width=\"" . $temp_array[0] . "\" height=\"" . $temp_array[1] . "\" frameborder=\"0\" style=\"position:relative; top:0px; left:0px; z-index:0;\"></iframe></textarea></form><br/>";
    }
    return $info;

}

function folder_info($folder_id){

    global $xerte_toolkits_site;

    $prefix = $xerte_toolkits_site->database_table_prefix;

    $query = "select folder_name, folder_id, date_created from "
        . "{$prefix}folderdetails where folder_id= ?";

    $params = array($folder_id);
    $row = db_query_one($query, $params);

    $info = PROJECT_INFO_NAME . ": " . str_replace('_', ' ', $row['folder_name']) . "<br/>";

    $info .= PROJECT_INFO_ID . ": " . $row['folder_id'] . "<br/>";

    $info .= PROJECT_INFO_CREATED . ": " . $row['date_created'] . "<br/>";

    return $info;

}

function group_info($group_id)
{
    global $xerte_toolkits_site;

    $prefix = $xerte_toolkits_site->database_table_prefix;

    $query = "select ld.firstname, ld.surname, ld.username from "
        . "{$prefix}logindetails ld, {$prefix}user_group_members ugm where ld.login_id=ugm.login_id and ugm.group_id= ?";

    $params = array($group_id);
    $members = db_query($query, $params);

    $query = "select group_name, group_id from "
        . "{$prefix}user_groups where group_id= ?";
    $group = db_query_one($query, $params);

    $info = GROUP_INFO_NAME . ": " . $group['group_name'] . "<br/>";
    $info .= GROUP_INFO_MEMBERS . ": " . "<br/><ul class='group_members'>";
    foreach ($members as $member)
    {
        $info .= "<li>" . $member['firstname'] . " " . $member['surname'] . " (" . $member['username'] . ")</li>";
    }
    $info .= "</ul>";
    return $info;
}

function statistics_prepare($template_id, $force=false)
{
    global $xerte_toolkits_site;

    $tsugi_installed = false;
    if (file_exists($xerte_toolkits_site->tsugi_dir)) {
        $tsugi_installed = true;
    }
    $info = new stdClass();
    $info->available = false;

    $html = "<div id='graph_" . $template_id . "' class='statistics'><img src='editor/img/loading16.gif'/></div>";

    if ($xerte_toolkits_site->dashboard_enabled != 'false' || $force) {
        $access = false;
        if (! $force) {
            // determine role and check against minrole
            $role = get_user_access_rights($template_id);
            $access = false;
            switch ($xerte_toolkits_site->xapi_dashboard_minrole) {
                case 'creator':
                    $access = ($role == 'creator');
                    break;
                case 'co-author':
                    $access = ($role == 'creator' || $role == 'co-author');
                    break;
                case 'editor':
                    $access = ($role == 'creator' || $role == 'co-author' || $role == 'editor');
                    break;
                case 'read-only':
                    $access = ($role == 'creator' || $role == 'co-author' || $role == 'editor' || $role == 'read-only');
                    break;
            }
        }
        if ($access || $force) {

            $prefix = $xerte_toolkits_site->database_table_prefix;

            $query_for_names = "select td.tsugi_published, td.tsugi_xapi_enabled, td.tsugi_xapi_useglobal, td.tsugi_xapi_endpoint, td.tsugi_xapi_key, td.tsugi_xapi_secret, td.tsugi_xapi_student_id_mode, td.dashboard_allowed_links, td.dashboard_display_options from {$prefix}templatedetails td where template_id=?";

            $params = array($template_id);
            $row = db_query_one($query_for_names, $params);
            $row_sitedetails = db_query_one("select dashboard_allowed_links, LRS_Endpoint from {$prefix}sitedetails");
            if ($row['tsugi_published'] && $tsugi_installed)
            {
                $info->published = $row["tsugi_published"];
                $info->linkinfo = PROJECT_INFO_LTI_PUBLISHED . "<br>";
                $info->url = $xerte_toolkits_site->site_url . "lti_launch.php?template_id=" . $template_id;
            }
            else
            {
                $info->published = false;
            }
            if ($row['tsugi_xapi_enabled'] && ($row['tsugi_xapi_useglobal'] || ($row['tsugi_xapi_endpoint'] != "" && $row['tsugi_xapi_key'] != "" && $row['tsugi_xapi_secret'] != "")) && (template_access_settings($template_id)!='Private' || $row['tsugi_published'])) {
                $info->info = $html;
                $info->xapi_linkinfo = PROJECT_INFO_XAPI_PUBLISHED;
                $info->xapi_url = $xerte_toolkits_site->site_url . "xapi_launch.php?template_id=" . $template_id . "&group=groupname";
                $lrsendpoint = array();
                if ($row['tsugi_xapi_useglobal'])
                {
                    $lrsendpoint['lrsendpoint'] = $row_sitedetails['LRS_Endpoint'];
                }
                else
                {
                    $lrsendpoint['lrsendpoint'] = $row['tsugi_xapi_endpoint'];
                }
                $lrsendpoint = CheckLearningLocker($lrsendpoint, true);
                $lrs = new stdClass();
                $lrs->lrsendpoint = $xerte_toolkits_site->site_url . "xapi_proxy.php";
                $lrs->aggregate = $lrsendpoint['aggregate'];
                $lrs->db = $lrsendpoint['db'];

                $lrs->lrskey = "";
                $lrs->lrssecret = "";
                $lrs->lrsurls = $row['dashboard_allowed_links'];
                $lrs->site_allowed_urls = $row_sitedetails["dashboard_allowed_links"];
                if($lrs->lrsurls == null)
                {
                    $lrs->lrsurls = "";
                }
                $lrs->groupmode = $row['tsugi_xapi_student_id_mode'];
                $info->lrs = $lrs;
                $info->available = true;

                $dashboard = new stdClass();
                $dashboard->enable_nonanonymous = $xerte_toolkits_site->dashboard_nonanonymous;
                $dashboard->default_period = (int)$xerte_toolkits_site->dashboard_period;
                $dashboard->display_options = $row['dashboard_display_options'];
                if($dashboard->display_options == NULL){
                    $dashboard->display_options = "{}";
                }

                $info->dashboard = $dashboard;
            } else {
                $info->info = "";
                $info->available = false;
            }
        }
        else{
            $info->info = "";
            $info->available = false;
        }
    }
    else
    {
        $info->info = "";
        $info->available = false;
    }
    return $info;
}

function folder_size($dir_path)
{
    $quota = 0;
    $d = opendir($dir_path);

    while ($f = readdir($d)) {
        $full = $dir_path . "/" . $f;
        if (!is_dir($full)) {
            $quota += filesize($full);
        }
        else
        {
            if ($f != "." && $f != "..") {
                $quota += folder_size($full);
            }
        }
    }
    closedir($d);
    return $quota;
}

function media_quota_info($template_id)
{
    global $xerte_toolkits_site;
    $quota=0;

    if (has_rights_to_this_template($template_id, $_SESSION['toolkits_logon_id']) || is_user_permitted("projectadmin")) {

        $prefix = $xerte_toolkits_site->database_table_prefix;
        $sql = "select {$prefix}originaltemplatesdetails.template_name, {$prefix}templaterights.folder, {$prefix}logindetails.username FROM " .
            "{$prefix}originaltemplatesdetails, {$prefix}templatedetails, {$prefix}templaterights, {$prefix}logindetails WHERE " .
            "{$prefix}originaltemplatesdetails.template_type_id = {$prefix}templatedetails.template_type_id AND " .
            "{$prefix}templaterights.template_id = {$prefix}templatedetails.template_id AND " .
            "{$prefix}templatedetails.creator_id = {$prefix}logindetails.login_id AND " .
            "{$prefix}templatedetails.template_id = ? AND (role = ? OR role = ?)";

        $row_path = db_query_one($sql, array($template_id, 'creator', 'co-author'));

        $end_of_path = $template_id . "-" . $row_path['username'] . "-" . $row_path['template_name'];

        /**
         * Set the paths
         */

        $dir_path = $xerte_toolkits_site->users_file_area_full . $end_of_path . "/media";

        $xmlpath = $xerte_toolkits_site->users_file_area_full . $end_of_path . "/data.xml";

        $previewpath = $xerte_toolkits_site->users_file_area_full . $end_of_path . "/preview.xml";

        if (file_exists($xerte_toolkits_site->users_file_area_full . $end_of_path . "/preview.xml")) {

            $quota = filesize($xerte_toolkits_site->users_file_area_full . $end_of_path . "/data.xml")
                + filesize($xerte_toolkits_site->users_file_area_full . $end_of_path . "/preview.xml");

        }

        if (file_exists($dir_path))
        {
            $quota += folder_size($dir_path);
            $info =  PROJECT_INFO_MEDIA . ": ";
            $info .=  (round($quota/10000, 0)/100) . " MB<br/>";
            return $info;
        }
        else
        {
            return "";
        }
    }
}

function order_shared_folder_users($shared_users)
{
    //Sort array shared_users by role, then by surname, then by firstname
    //Role sort order: creator, co-author, editor, read-only
    usort($shared_users, function($a, $b) {
        $role_order = array('creator', 'co-author', 'editor', 'read-only');
        $a_role = array_search($a['role'], $role_order);
        $b_role = array_search($b['role'], $role_order);
        if ($a_role == $b_role) {
            if ($a['surname'] == $b['surname']) {
                return strcmp($a['firstname'], $b['firstname']);
            } else {
                return strcmp($a['surname'], $b['surname']);
            }
        } else {
            return $a_role - $b_role;
        }
    });
    return $shared_users;
}

function sharing_info($template_id)
{
    global $xerte_toolkits_site;

    $prefix = $xerte_toolkits_site->database_table_prefix;

    if(!has_rights_to_this_template($template_id, $_SESSION['toolkits_logon_id']) && !is_user_permitted("projectadmin")) {
        return "";
    }

    $sql = "SELECT template_id, user_id, firstname, surname, username, role, folder FROM " .
        " {$prefix}templaterights tr, {$prefix}logindetails ld WHERE " .
        " ld.login_id = tr.user_id and template_id= ?";

    $query_sharing_rows = db_query($sql, array($template_id));

    $sql = "SELECT group_name, role FROM {$prefix}template_group_rights tgr, " .
        "{$prefix}user_groups ug WHERE template_id = ? AND tgr.group_id = ug.group_id";

    $query_group_sharing_rows = db_query($sql, array($template_id));

    $sql = "SELECT folder FROM {$prefix}templaterights where template_id = ?";
    $query_folder_ids = db_query($sql, array($template_id));

    $folder_ids_string = implode(",", array_map(function($item) {
        return $item['folder'];
    }, $query_folder_ids));

    $sql = "SELECT * FROM {$prefix}folderrights where folder_id in ({$folder_ids_string})";
    $query_folders = db_query($sql);

    $related_folders = array();
    $params = array();
    array_push($related_folders, $query_folders[0]);

    if(!empty($related_folders)){
        for($i =0;  $i < count($related_folders) ; $i++){
            if($related_folders[$i]["folder_id"] != 0){
                $sql = "SELECT * FROM {$prefix}folderrights where folder_id = ? and folder_parent != 0";
                $query_folders = db_query($sql, array($related_folders[$i]["folder_parent"]));
                foreach ($query_folders as $folder){
                    if($folder["role"] == "creator"){
                        array_push($related_folders, $folder);
                        array_push($params, $folder["login_id"]);
                    }else{
                        array_push($params, $folder["login_id"]);
                    }
                }
            }
        }
    }

    $sql = "SELECT ld.login_id as user_id, firstname, surname, username, role, folder_id, folder_parent FROM {$prefix}folderrights fr join {$prefix}logindetails ld on fr.login_id = ld.login_id";
    $sql_grouped = "SELECT ld.login_id as user_id, firstname, surname, username FROM {$prefix}folderrights fr join {$prefix}logindetails ld on fr.login_id = ld.login_id";
    foreach ($params as $index=>$param){
        if($index != 0){
            $sql .= " or ld.login_id = ?";
            $sql_grouped .= " or ld.login_id = ?";
        }else{
            $sql .= " where (ld.login_id = ?";
            $sql_grouped .= " where (ld.login_id = ?";
        }
    }

    if(count($params) > 0){
        $sql .= ")";
        $sql_grouped .= ")";
    }
    $sql .= " and";
    $sql_grouped .= " and";

    foreach ($related_folders as $index =>$rf){
        if($index != 0){
            $sql .= " or fr.folder_id = ?";
            $sql_grouped .= " or fr.folder_id = ?";
            array_push($params, $rf["folder_id"]);
        }else{
            $sql .= " (fr.folder_id = ?";
            $sql_grouped .= " (fr.folder_id = ?";
            array_push($params, $rf["folder_id"]);

        }
    }
    $sql .= ") ";
    $sql_grouped .= ") group by user_id, firstname, surname, username";
    $query_shared_folder_users_roles = db_query($sql, $params);
    $query_shared_folder_users = db_query($sql_grouped, $params);

    // Find all sub-folders and make sure they have the correct role records
    // Loop over related folders and find and add all records in $query_shared_folder_users_roles that are not in there yet with the role of the parent record
    foreach (array_reverse($related_folders) as $rf){
        $parent = $rf['folder_parent'];
        foreach ($query_shared_folder_users_roles as $role){
            if ($role['folder_id'] == $parent){
                // Check if this user already has a record for this folder
                $found = false;
                foreach ($query_shared_folder_users_roles as $role2){
                    if ($role2['folder_id'] == $rf['folder_id'] && $role2['user_id'] == $role['user_id']){
                        $found = true;
                        break;
                    }
                }
                if (!$found){
                    $role['folder_id'] = $rf['folder_id'];
                    $role['parent_id'] = $parent;
                    array_push($query_shared_folder_users_roles, $role);
                }
            }
        }
    }

    $params = array();
    $sql = "SELECT group_name, role FROM {$prefix}folder_group_rights fgr, " .
        "{$prefix}user_groups ug WHERE fgr.group_id = ug.group_id and ";

    foreach ($related_folders as $index =>$rf){
        if($index != 0){
            $sql .= " or fgr.folder_id = ?";
            $sql_grouped .= " or fgr.folder_id = ?";
            array_push($params, $rf["folder_id"]);
        }else{
            $sql .= " (fgr.folder_id = ?";
            $sql_grouped .= " (fgr.folder_id = ?";
            array_push($params, $rf["folder_id"]);
        }
    }
    $sql .= ") ";
    $query_shared_folders_groups = db_query($sql, $params);


    $roles = array("creator"=>4, "co-author"=>3, "editor"=>2, "read-only"=>1);

    foreach ($query_sharing_rows as $index => $row) {
        $found = false;
        foreach ($query_shared_folder_users as $indexUser => $user){
            if($row["user_id"] == $user["user_id"]){
                $found = true;
            }
            foreach($query_shared_folder_users_roles as $indexRole => $role) {
                if ($role['user_id'] == $user['user_id']) {
                    if ($row['folder'] == $role['folder_id']) {
                        $query_shared_folder_users[$indexUser]["role"] = $role['role'];

                        if ($row["user_id"] == $query_shared_folder_users[$indexUser]["user_id"] && $row["role"] == "creator") {
                            $query_shared_folder_users[$indexUser]["role"] = "creator";
                        }
                    }
                }
                if ($row["user_id"] == $query_shared_folder_users[$indexUser]["user_id"] && $row["role"] != "creator" && $roles[$role["role"]] < $roles[$row["role"]]) {
                    $query_shared_folder_users[$indexUser]["role"] = $row["role"];
                    $query_shared_folder_users[$indexUser]["role_source"] = 'template';
                }
            }
        }
        if (!$found)
        {
            // Add $row to $query_shared_folder_users
            $query_shared_folder_users[] = $row;
            if ($row['role'] == "creator") {
                // Change the role of the user to co-author
                foreach ($query_shared_folder_users as $indexUser2 => $user2) {
                    if ($user2['user_id'] != $row['user_id'] && $user2['role'] == "creator") {
                        $query_shared_folder_users[$indexUser2]["role"] = "co-author";
                        break;
                    }
                }
            }
        }
    }
    foreach ($query_sharing_rows as $index => $row) {
        foreach ($query_shared_folder_users as $indexUser => $user) {
            foreach ($query_shared_folder_users_roles as $indexRole => $role) {
                if ($role['user_id'] == $user['user_id']) {
                    if ($row['folder'] == $role['folder_id']) {
                        if ($row["user_id"] == $query_shared_folder_users[$indexUser]["user_id"] && $row["role"] == "creator") {
                            foreach ($query_shared_folder_users as $indexUser2 => $user2) {
                                if ($user2['user_id'] != $row['user_id'] && $user2['role'] == "creator") {
                                    $query_shared_folder_users[$indexUser2]["role"] = "co-author";
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    foreach ($query_shared_folder_users as $index => $user){
        $query_shared_folder_users[$index]["template_id"] = $template_id;
    }

    foreach ($query_group_sharing_rows as $index => $row) {
        $found = false;
        foreach ($query_shared_folders_groups as $indexGroup => $group){
            if($row["group_name"] == $group["group_name"]){
                $found = true;
                if ($roles[$group["role"]] < $roles[$row["role"]]) {
                    $query_shared_folders_groups[$indexGroup]["role"] = $row["role"];
                    $query_shared_folders_groups[$indexGroup]["role_source"] = 'template';
                }
            }
        }
        if (!$found)
        {
            // Add $row to $query_shared_folder_users
            $query_shared_folders_groups[] = $row;
        }
    }

    $info =  PROJECT_INFO_SHARED . ": ";

    if(count($query_sharing_rows)==1 && count($query_group_sharing_rows)==0 && count($query_shared_folder_users) == 1 && count($query_shared_folders_groups) == 0){
        $info .= PROJECT_INFO_NOTSHARED . "<br/>";
        return $info;
    }

    $info .=  SHARING_CURRENT . "<br>";
    if(sizeof($query_shared_folder_users)==1){
        foreach($query_sharing_rows as $row) {
            $info .=  "<li><span>" . $row['firstname'] . " " . $row['surname'] ." (" .$row['username'] . ")  -  (";
            switch($row['role'])
            {
                case "creator":
                    $info .=  SHARING_CREATOR;
                    break;
                case "co-author":
                    $info .=  SHARING_COAUTHOR;
                    break;
                case "editor":
                    $info .=  SHARING_EDITOR;
                    break;
                case "read-only":
                    $info .=  SHARING_READONLY;
                    break;
            }

            $info .=  ")</span></li>";
        }
    }
    else
    {
        $query_shared_folder_users = order_shared_folder_users($query_shared_folder_users);
        foreach ($query_shared_folder_users as $row) {
            $info .= "<li><span>" . $row['firstname'] . " " . $row['surname'] . " (" . $row['username'] . ")  -  (";
            switch ($row['role']) {
                case "creator":
                    $info .= SHARING_CREATOR;
                    break;
                case "co-author":
                    $info .= SHARING_COAUTHOR;
                    break;
                case "editor":
                    $info .= SHARING_EDITOR;
                    break;
                case "read-only":
                    $info .= SHARING_READONLY;
                    break;
            }

            if (isset($row['role_source'])) {
                $info .= " - " . SHARING_SOURCE;
                switch ($row['role_source']) {
                    case "template":
                        $info .= SHARING_SOURCE_TEMPLATE;
                        break;
                    case "folder":
                        $info .= SHARING_SOURCE_FOLDER;
                        break;
                }
            }

            $info .= ")</span></li>";
        }
    }
    if(empty($query_shared_folders_groups)) {


        foreach ($query_group_sharing_rows as $row) {
            $info .= "<li><span>" . $row['group_name'] . "  -  (";
            switch ($row['role']) {
                case "creator":
                    $info .= SHARING_CREATOR;
                    break;
                case "co-author":
                    $info .= SHARING_COAUTHOR;
                    break;
                case "editor":
                    $info .= SHARING_EDITOR;
                    break;
                case "read-only":
                    $info .= SHARING_READONLY;
                    break;
            }

            if (isset($row['role_source'])) {
                $info .= " - " . SHARING_SOURCE;
                switch ($row['role_source']) {
                    case "template":
                        $info .= SHARING_SOURCE_TEMPLATE;
                        break;
                    case "folder":
                        $info .= SHARING_SOURCE_FOLDER;
                        break;
                }
            }

            $info .= ")</span></li>";
        }
    }
    else {
        foreach ($query_shared_folders_groups as $row) {
            $info .= "<li><span>" . $row['group_name'] . "  -  (";
            switch ($row['role']) {
                case "creator":
                    $info .= SHARING_CREATOR;
                    break;
                case "co-author":
                    $info .= SHARING_COAUTHOR;
                    break;
                case "editor":
                    $info .= SHARING_EDITOR;
                    break;
                case "read-only":
                    $info .= SHARING_READONLY;
                    break;
            }

            if (isset($row['role_source'])) {
                $info .= " - " . SHARING_SOURCE;
                switch ($row['role_source']) {
                    case "template":
                        $info .= SHARING_SOURCE_TEMPLATE;
                        break;
                    case "folder":
                        $info .= SHARING_SOURCE_FOLDER;
                        break;
                }
            }

            $info .= ")</span></li>";
        }
    }
    $info .= "</ul>";

    return $info;
}

function folder_sharing_info($folder_id)
{
    global $xerte_toolkits_site;

    if (!has_rights_to_this_folder($folder_id, $_SESSION['toolkits_logon_id']) && !is_user_permitted("projectadmin")) {
        return "";
    }

    $sql = "SELECT folder_id, ld.login_id, firstname, surname, username, role FROM " .
        " {$xerte_toolkits_site->database_table_prefix}folderrights fr, {$xerte_toolkits_site->database_table_prefix}logindetails ld WHERE " .
        " ld.login_id = fr.login_id and folder_id= ?";

    $query_sharing_rows = db_query($sql, array($folder_id));

    $sql = "SELECT group_name, role FROM {$xerte_toolkits_site->database_table_prefix}folder_group_rights fgr, " .
        "{$xerte_toolkits_site->database_table_prefix}user_groups ug WHERE folder_id = ? AND fgr.group_id = ug.group_id";

    $query_group_sharing_rows = db_query($sql, array($folder_id));

    $sql = "SELECT folder_id FROM {$xerte_toolkits_site->database_table_prefix}folderrights where folder_id = ? and role =?";
    $query_folder_id = db_query_one($sql, array($folder_id, "creator"));

    $sql = "SELECT * FROM {$xerte_toolkits_site->database_table_prefix}folderrights where folder_id = ?";
    $query_folders = db_query($sql, array($query_folder_id["folder_id"]));

    $related_folders = array();
    $params = array();
    array_push($related_folders, $query_folders[0]);

    if(!empty($related_folders)){
        for($i =0;  $i < count($related_folders) ; $i++){
            if($related_folders[$i]["folder_id"] != 0){
                $sql = "SELECT * FROM {$xerte_toolkits_site->database_table_prefix}folderrights where folder_id = ? and folder_parent != 0";
                $query_folders = db_query($sql, array($related_folders[$i]["folder_parent"]));
                foreach ($query_folders as $folder){
                    if($folder["role"] == "creator"){
                        array_push($related_folders, $folder);
                        array_push($params, $folder["login_id"]);
                    }else{
                        array_push($params, $folder["login_id"]);
                    }
                }
            }
        }
    }

    $sql = "SELECT ld.login_id as user_id, firstname, surname, username, role, folder_id, folder_parent FROM {$xerte_toolkits_site->database_table_prefix}folderrights fr join {$xerte_toolkits_site->database_table_prefix}logindetails ld on fr.login_id = ld.login_id";
    $sql_grouped = "SELECT ld.login_id as user_id, firstname, surname, username FROM {$xerte_toolkits_site->database_table_prefix}folderrights fr join {$xerte_toolkits_site->database_table_prefix}logindetails ld on fr.login_id = ld.login_id";
    foreach ($params as $index=>$param){
        if($index != 0){
            $sql .= " or ld.login_id = ?";
            $sql_grouped .= " or ld.login_id = ?";
        }else{
            $sql .= " where (ld.login_id = ?";
            $sql_grouped .= " where (ld.login_id = ?";
        }
    }

    if(count($params) > 0){
        $sql .= ")";
        $sql_grouped .= ")";
    }
    $sql .= " and";
    $sql_grouped .= " and";

    foreach ($related_folders as $index =>$rf){
        if($index != 0){
            $sql .= " or fr.folder_id = ?";
            $sql_grouped .= " or fr.folder_id = ?";
            array_push($params, $rf["folder_id"]);
        }else{
            $sql .= " (fr.folder_id = ?";
            $sql_grouped .= " (fr.folder_id = ?";
            array_push($params, $rf["folder_id"]);

        }
    }
    $sql .= ") ";
    $sql_grouped .= ") group by user_id, firstname, surname, username";
    $query_shared_folder_users_roles = db_query($sql, $params);
    $query_shared_folder_users = db_query($sql_grouped, $params);

    // Find all sub-folders and make sure they have the correct role records
    // Loop over related folders and find and add all records in $query_shared_folder_users_roles that are not in there yet with the role of the parent record
    foreach (array_reverse($related_folders) as $rf){
        $parent = $rf['folder_parent'];
        foreach ($query_shared_folder_users_roles as $role){
            if ($role['folder_id'] == $parent){
                // Check if this user already has a record for this folder
                $found = false;
                foreach ($query_shared_folder_users_roles as $role2){
                    if ($role2['folder_id'] == $rf['folder_id'] && $role2['user_id'] == $role['user_id']){
                        $found = true;
                        break;
                    }
                }
                if (!$found){
                    $role['folder_id'] = $rf['folder_id'];
                    $role['parent_id'] = $parent;
                    array_push($query_shared_folder_users_roles, $role);
                }
            }
        }
    }

    $params = array();
    $sql = "SELECT group_name, role FROM {$xerte_toolkits_site->database_table_prefix}folder_group_rights fgr, " .
        "{$xerte_toolkits_site->database_table_prefix}user_groups ug WHERE fgr.group_id = ug.group_id and ";

    foreach ($related_folders as $index =>$rf){
        if($index != 0){
            $sql .= " or fgr.folder_id = ?";
            $sql_grouped .= " or fgr.folder_id = ?";
            array_push($params, $rf["folder_id"]);
        }else{
            $sql .= " (fgr.folder_id = ?";
            $sql_grouped .= " (fgr.folder_id = ?";
            array_push($params, $rf["folder_id"]);
        }
    }
    $sql .= ") ";
    $query_shared_folders_groups = db_query($sql, $params);


    $roles = array("creator"=>4, "co-author"=>3, "editor"=>2, "read-only"=>1);

    foreach ($query_sharing_rows as $index => $row) {
        $found = false;
        foreach ($query_shared_folder_users as $indexUser => $user){
            if($row["login_id"] == $user["user_id"]){
                $found = true;
            }
            foreach($query_shared_folder_users_roles as $indexRole => $role) {
                if ($role['user_id'] == $user['user_id']) {
                    if ($row['folder_id'] == $role['folder_id']) {
                        $query_shared_folder_users[$indexUser]["role"] = $role['role'];
                        //$query_shared_folder_users[$indexUser]["role_source"] = 'folder';

                        if ($row["login_id"] == $query_shared_folder_users[$indexUser]["user_id"] && $row["role"] == "creator") {
                            $query_shared_folder_users[$indexUser]["role"] = "creator";
                            // Change the role of the user to co-author
                            foreach ($query_shared_folder_users as $indexUser2 => $user2) {
                                if ($user2['user_id'] != $row['login_id'] && $user2['role'] == "creator") {
                                    $query_shared_folder_users[$indexUser2]["role"] = "co-author";
                                    break;
                                }
                            }
                        }
                    }
                }
                if ($row["login_id"] == $query_shared_folder_users[$indexUser]["user_id"] && $row["role"] != "creator" && $roles[$role["role"]] < $roles[$row["role"]]) {
                    $query_shared_folder_users[$indexUser]["role"] = $row["role"];
                    $query_shared_folder_users[$indexUser]["role_source"] = 'template';
                    if ($row['role'] == "creator") {
                        // Change the role of the user to co-author
                        foreach ($query_shared_folder_users as $indexUser2 => $user2) {
                            if ($user2['user_id'] != $row['user_id'] && $user2['role'] == "creator") {
                                $query_shared_folder_users[$indexUser2]["role"] = "co-author";
                                break;
                            }
                        }
                    }
                }
            }
        }
        if (!$found)
        {
            // Add $row to $query_shared_folder_users
            $index = count($query_shared_folder_users);
            $query_shared_folder_users[] = $row;
            if ($row['role'] == "creator") {
                // Change the role of the user to co-author
                foreach ($query_shared_folder_users as $indexUser2 => $user2) {
                    if ($user2['user_id'] != $row['user_id'] && $user2['role'] == "creator") {
                        $query_shared_folder_users[$indexUser2]["role"] = "co-author";
                        break;
                    }
                }
            }
        }
    }

    foreach ($query_shared_folder_users as $index => $user){
        $query_shared_folder_users[$index]["folder_id"] = $folder_id;
    }

    foreach ($query_group_sharing_rows as $index => $row) {
        $found = false;
        foreach ($query_shared_folders_groups as $indexGroup => $group){
            if($row["group_name"] == $group["group_name"]){
                $found = true;
                if ($roles[$group["role"]] < $roles[$row["role"]]) {
                    $query_shared_folders_groups[$indexGroup]["role"] = $row["role"];
                    $query_shared_folders_groups[$indexGroup]["role_source"] = 'folder';
                }
            }
        }
        if (!$found)
        {
            // Add $row to $query_shared_folder_users
            $query_shared_folders_groups[] = $row;
        }
    }


    $info = PROJECT_INFO_SHARED . ": ";

    if(count($query_sharing_rows)==1 && count($query_group_sharing_rows)==0 && count($query_shared_folder_users) == 1 && count($query_shared_folders_groups) == 0){
        $info .= PROJECT_INFO_NOTSHARED . "<br/>";
        return $info;
    }

    $info .=  SHARING_CURRENT_FOLDER . "<br>";
    if(sizeof($query_shared_folder_users)==1){
        foreach($query_sharing_rows as $row) {
            $info .=  "<li><span>" . $row['firstname'] . " " . $row['surname'] ." (" .$row['username'] . ")  -  (";
            switch($row['role'])
            {
                case "creator":
                    $info .=  SHARING_CREATOR;
                    break;
                case "co-author":
                    $info .=  SHARING_COAUTHOR;
                    break;
                case "editor":
                    $info .=  SHARING_EDITOR;
                    break;
                case "read-only":
                    $info .=  SHARING_READONLY;
                    break;
            }

            $info .=  ")</span></li>";
        }
    }
    else
    {
        $query_shared_folder_users = order_shared_folder_users($query_shared_folder_users);

        foreach ($query_shared_folder_users as $row) {
            $info .= "<li><span>" . $row['firstname'] . " " . $row['surname'] . " (" . $row['username'] . ")  -  (";
            switch ($row['role']) {
                case "creator":
                    $info .= SHARING_CREATOR;
                    break;
                case "co-author":
                    $info .= SHARING_COAUTHOR;
                    break;
                case "editor":
                    $info .= SHARING_EDITOR;
                    break;
                case "read-only":
                    $info .= SHARING_READONLY;
                    break;
            }

            if (isset($row['role_source'])) {
                $info .= " - " . SHARING_SOURCE;
                switch ($row['role_source']) {
                    case "template":
                        $info .= SHARING_SOURCE_TEMPLATE;
                        break;
                    case "folder":
                        $info .= SHARING_SOURCE_FOLDER;
                        break;
                }
            }

            $info .= ")</span></li>";
        }
    }
    if(empty($query_shared_folders_groups)) {


        foreach ($query_group_sharing_rows as $row) {
            $info .= "<li><span>" . $row['group_name'] . "  -  (";
            switch ($row['role']) {
                case "creator":
                    $info .= SHARING_CREATOR;
                    break;
                case "co-author":
                    $info .= SHARING_COAUTHOR;
                    break;
                case "editor":
                    $info .= SHARING_EDITOR;
                    break;
                case "read-only":
                    $info .= SHARING_READONLY;
                    break;
            }

            if (isset($row['role_source'])) {
                $info .= " - " . SHARING_SOURCE;
                switch ($row['role_source']) {
                    case "template":
                        $info .= SHARING_SOURCE_TEMPLATE;
                        break;
                    case "folder":
                        $info .= SHARING_SOURCE_FOLDER;
                        break;
                }
            }

            $info .= ")</span></li>";
        }
    }
    else {
        foreach ($query_shared_folders_groups as $row) {
            $info .= "<li><span>" . $row['group_name'] . "  -  (";
            switch ($row['role']) {
                case "creator":
                    $info .= SHARING_CREATOR;
                    break;
                case "co-author":
                    $info .= SHARING_COAUTHOR;
                    break;
                case "editor":
                    $info .= SHARING_EDITOR;
                    break;
                case "read-only":
                    $info .= SHARING_READONLY;
                    break;
            }

            if (isset($row['role_source'])) {
                $info .= " - " . SHARING_SOURCE;
                switch ($row['role_source']) {
                    case "template":
                        $info .= SHARING_SOURCE_TEMPLATE;
                        break;
                    case "folder":
                        $info .= SHARING_SOURCE_FOLDER;
                        break;
                }
            }

            $info .= ")</span></li>";
        }
    }
    $info .= "</ul>";

    return $info;
}

function nr_user_groups()
{
    global $xerte_toolkits_site;

    $count = 0;
    $sql = "select count(*) as count from {$xerte_toolkits_site->database_table_prefix}user_groups";
    $res = db_query($sql);

    if ($res !== false && $res != null)
        $count = $res[0]['count'];
    return $count;
}

function rss_syndication($template_id)
{
    global $xerte_toolkits_site;

    if(!has_rights_to_this_template($template_id, $_SESSION['toolkits_logon_id']) && !is_user_permitted("projectadmin")) {
        return "";
    }

    $prefix = $xerte_toolkits_site->database_table_prefix;
    $sql = "SELECT * FROM {$prefix}templatesyndication WHERE template_id = ?";

    $row = db_query_one($sql, array($template_id));

    $info =  PROJECT_INFO_RSS_SYNDICATION . "<br/>";

    if ($row == null || ($row['rss'] != 'true' && $row['export'] != 'true' && $row['syndication'] != 'true'))
    {
        return "";
    }
    else
    {
        if ($row['rss'] == 'true')
        {
            $info .= "<li>" . PROJECT_INFO_RSS_SYNDICATION_RSSENABLED . "</li>";
        }
        if ($row['export'] == 'true')
        {
            $info .= "<li>" . PROJECT_INFO_RSS_SYNDICATION_EXPORTENABLED . "</li>";
        }
        if ($row['syndication'] == 'true')
        {
            $info .= "<li>" . PROJECT_INFO_RSS_SYNDICATION_SYNDICATIONENABLED . "</li>";
        }

        return $info;
    }

}

function access_info($template_id){

    global $xerte_toolkits_site;

    $prefix =  $xerte_toolkits_site->database_table_prefix ;
    $query_for_template_access = "select access_to_whom, number_of_uses from {$prefix}templatedetails where template_id= ? ";
    $params = array($template_id);

    $row_access = db_query_one($query_for_template_access, $params);

    $info = PROJECT_INFO_ACCESS . ": ";

    $accessStr = template_access_settings($template_id);
    switch ($accessStr)
    {
        case "Public":
            $accessTranslation = PROJECT_INFO_PUBLIC;
            $nrViews = $row_access["number_of_uses"];
            break;
        case "Private":
            $accessTranslation = PROJECT_INFO_PRIVATE;
			$nrViews = $row_access["number_of_uses"];
            break;
        case "Password":
            $accessTranslation = PROJECT_INFO_PASSWORD;
            $nrViews = $row_access["number_of_uses"];
            break;
        default:
            if (substr($accessStr,0,5) == "Other")
            {
                $accessTranslation = PROJECT_INFO_OTHER . " ('" . substr($accessStr,5) . "')";
                $accessStr = "Other";
                $nrViews = $row_access["number_of_uses"];
            }
            else if (substr($accessStr,0,12) == "PasswordPlay")
		    {
				$accessTranslation = PROJECT_INFO_PASSWORD_PLAY;
                $accessStr = "PasswordPlay";
                $nrViews = $row_access["number_of_uses"];
			}
		    else
            {
                $accessTranslation = "'" . $accessStr . "'";
                $nrViews = $row_access["number_of_uses"];
            }
    }
    $info .=  /*PROJECT_INFO_ACCESS_SET_AS . " " .*/ $accessTranslation;
    if (isset($nrViews) && $nrViews!= "")
    {
       /* $info .= str_replace("%n", $nrViews, PROJECT_INFO_NRVIEWS);*/
		$info .= "<br/>" . PROJECT_INFO_NRVIEWSTITLE . ": " . $nrViews;
    }
    $info .= "<br/>";
    return $info;
}

function oai_shared($template_id){
    global $xerte_toolkits_site;

    if (!isset($xerte_toolkits_site->oai_pmh) || $xerte_toolkits_site->oai_pmh == false)
    {
        return "";
    }

    $sql = "select status from {$xerte_toolkits_site->database_table_prefix}oai_publish where template_id=? ORDER BY audith_id DESC LIMIT 1";
    $params = array($template_id);
    $status = db_query_one($sql, $params);
    $info = PROJECT_INFO_OAI . ": ";
    if ($status == null)
    {
        $info .= PROJECT_INFO_NOTSHARED . "<br/>";
    }
    else {
        $last_oaiTable_status = $status["status"];

        if (is_null($last_oaiTable_status) || $last_oaiTable_status != "published") {
            $info .= PROJECT_INFO_NOTSHARED . "<br/>";
        } else {
            $info .= PROJECT_INFO_SHARED . "<br/>";
        }
    }
    return $info;
}

function str_replace_1st($pattern, $replacement, $subject)
{
    $pos = strpos($subject, $pattern);
    if ($pos !== false) {
        return substr_replace($subject, $replacement, $pos, strlen($pattern));
    }
}

function access_display($xerte_toolkits_site, $template_id, $change){

    global $row_access;

    $prefix =  $xerte_toolkits_site->database_table_prefix ;
    $query_for_template_access = "select access_to_whom from {$prefix}templatedetails where template_id= ? ";
    $params = array($template_id);

    $row_access = db_query_one($query_for_template_access, $params);
	
    echo "<h2 class=\"header\">" . PROPERTIES_TAB_ACCESS . "</h2>";
    echo "<div id=\"mainContent\">";
	
	echo "<fieldset id=\"security_list\" class=\"plainFS\">";
	echo "<legend>" . PROPERTIES_LIBRARY_ACCESS . ":</legend>";

	echo "<div><input ";
	if(template_access_settings($template_id) == "Public"){
		echo "checked ";
	}
	echo "type=\"radio\" id=\"Public\" name=\"share_status\" value=\"Public\" ><label for=\"Public\">" . PROPERTIES_LIBRARY_ACCESS_PUBLIC . "</label></div>";
    echo "<p class=\"share_explain_paragraph\">" . PROPERTIES_LIBRARY_ACCESS_PUBLIC_EXPLAINED . "</p>";

	echo "<div><input ";
	if(template_access_settings($template_id) == "Password"){
		echo "checked ";
	}
	echo "type=\"radio\" id=\"Password\" name=\"share_status\" value=\"Password\"><label for=\"Password\">" . PROPERTIES_LIBRARY_ACCESS_PASSWORD . "</label></div>";
    echo "<p class=\"share_explain_paragraph\">" . PROPERTIES_LIBRARY_ACCESS_PASSWORD_EXPLAINED . "</p>";

	echo "<div><input ";
	if(substr(template_access_settings($_POST['template_id']), 0, 12) == "PasswordPlay"){
		echo "checked ";
	}
	echo "type=\"radio\" id=\"PasswordPlay\" name=\"share_status\" value=\"PasswordPlay\"><label for=\"PasswordPlay\">" . PROPERTIES_LIBRARY_ACCESS_PASSWORD_PLAY . "</label></div>";
    echo "<p class=\"share_explain_paragraph\">" . PROPERTIES_LIBRARY_ACCESS_PASSWORD_PLAY_EXPLAINED . "</p><form id=\"PWPlay_pwd\"><textarea id=\"pwd\" style=\"width:90%; height:20px;\">";

	if(isset($_POST['password'])){

        echo $_POST['password'];

    }else{
		if(substr(template_access_settings($_POST['template_id']), 0, 12) == "PasswordPlay"){

			$pos = strpos($row_access['access_to_whom'], "-");

			if($pos !== false){

				echo substr($row_access['access_to_whom'], $pos+1);

			}
		}

    }

	echo "</textarea></form>";

	echo "<div><input ";
	if(substr(template_access_settings($template_id),0,5) == "Other"){
		echo "checked ";
	}
	echo "type=\"radio\" id=\"Other\" name=\"share_status\" value=\"Other\"><label for=\"Other\">" . PROPERTIES_LIBRARY_ACCESS_OTHER;
	
	if(isset($_POST['server_string'])){

        echo " - " . x_clean_input($_POST['server_string']);

    }else{
		if(substr(template_access_settings($_POST['template_id']),0,5) == "Other"){
			$pos = strpos($row_access['access_to_whom'], "-");

			if($pos !== false){
				echo " - " . substr($row_access['access_to_whom'], $pos+1);
			}
		}

    }
	
	echo "</label></div>";
    echo "<p id=\"other_explain\" class=\"share_explain_paragraph\">" . PROPERTIES_LIBRARY_ACCESS_OTHER_EXPLAINED . "</p><form id=\"other_site_address\"><textarea id=\"url\" style=\"width:90%; height:20px;\"></textarea></form>";

	echo "<div><input ";
	if(template_access_settings($template_id) == "Private"){
		echo "checked ";
	}
	echo "type=\"radio\" id=\"Private\" name=\"share_status\" value=\"Private\"><label for=\"Private\">" . PROPERTIES_LIBRARY_ACCESS_PRIVATE . "</label></div>";
    echo "<p class=\"share_explain_paragraph\">" . PROPERTIES_LIBRARY_ACCESS_PRIVATE_EXPLAINED . "</p>";
	

    $query_for_security_content = "select * from {$prefix}play_security_details";

    $rows = db_query($query_for_security_content);

    foreach($rows as $row_security) {
		
		if(template_share_status($row_security['security_setting'])){
			
			echo "<div><input ";
			if(template_access_settings($template_id) == $row_security['security_setting']){
				echo "checked ";
			}
			echo "type=\"radio\" id=\"" . $row_security['security_setting'] . "\" name=\"share_status\" value=\"" . $row_security['security_setting'] . "\"><label for=\"" . $row_security['security_setting'] . "\">" . $row_security['security_setting'] . "</label></div>";
			echo "<p class=\"share_explain_paragraph\">" . $row_security['security_info'] . "</p>";

		}else{

			echo "<div><input ";
			if(template_access_settings($template_id) == $row_security['security_setting']){
				echo "checked ";
			}
			echo "type=\"radio\" id=\"" . $row_security['security_setting'] . "\" name=\"share_status\" value=\"" . $row_security['security_setting'] . "\"><label for=\"" . $row_security['security_setting'] . "\">" . $row_security['security_setting'] . "</label></div>";
			echo "<p class=\"share_explain_paragraph\">" . $row_security['security_info'] . "</p>";

		}
    }
	
	echo "<p><button type=\"button\" class=\"xerte_button\" onclick=\"javascript:access_change_template(" . $template_id . ")\"><i class=\"fa fa-floppy-o\"></i>&nbsp;" . PROPERTIES_LIBRARY_ACCESS_BUTTON_CHANGE . "</button>";
	
	if($change){

		echo "<span class='alert_msg' aria-live='polite'><i class='fa fa-exclamation-circle' style='height: 14px; color:#f86718;'></i> " . PROPERTIES_LIBRARY_ACCESS_CHANGED . "</span>";

    }
	
	echo "</p>";
	echo "</fieldset>";
	echo "</div>";

}

function access_display_fail($editor){

	echo "<h2 class=\"header\">" . PROPERTIES_TAB_ACCESS . "</h2>";
	
    echo "<div id=\"mainContent\">";

	if ($editor) { // not creator / co-author
		
		echo "<p>" . PROPERTIES_LIBRARY_ACCESS_FAIL . "</p>";
		
	} else {
		
		echo "<p>" . PROPERTIES_LIBRARY_PROJECT_FAIL . "</p>";
		
	}
	
	echo "</div>";

}

function rss_display($xerte_toolkits_site,$tutorial_id,$change){

    $prefix = $xerte_toolkits_site->database_table_prefix;

    $query_for_name = "select firstname,surname from {$prefix}logindetails where login_id= ?";
    $row_name = db_query_one($query_for_name, array($_SESSION['toolkits_logon_id']));

    $query_for_rss = "select rss,export,description from {$prefix}templatesyndication where template_id=?";
    $row_rss = db_query_one($query_for_rss, array($tutorial_id));
	
	echo "<h2 class=\"header\">" . PROPERTIES_LIBRARY_RSS . "</h2>";
    
	echo "<div id=\"mainContent\">";
	
	echo "<p>" . PROPERTIES_LIBRARY_RSS_SITE . "</p>";
	
	echo "<form action=\"javascript:rss_change_template()\" name=\"xmlshare\" >";
	
	echo "<div><input type=\"checkbox\" id=\"rsson\" " . ($row_rss !== false && $row_rss != null && $row_rss['rss']=="true" ? "checked" : "") . " /><label for=\"rsson\">" . PROPERTIES_LIBRARY_RSS_INCLUDE . "</label></div><br/>";
	
	echo "<div><input type=\"checkbox\" id=\"exporton\" " . ($row_rss !== false && $row_rss != null && $row_rss['export']=="true" ? "checked" : "") . " /><label for=\"exporton\">" . PROPERTIES_LIBRARY_RSS_EXPORT . "</label>";
	
	echo "<p class=\"share_status_paragraph\">" . PROPERTIES_LIBRARY_RSS_EXPORT_DESCRIPTION . "</p></div>";

	echo "<label id=\"descLabel\" class=\"block\" for=\"desc\">" . PROPERTIES_LIBRARY_RSS_DESCRIPTION . ":</label><textarea id=\"desc\" style=\"width:90%; height:120px;\">" . ($row_rss !== false && $row_rss != null ? $row_rss['description'] : "") . "</textarea>";
	
	echo "<button type=\"submit\" class=\"xerte_button\" ><i class=\"fa fa-floppy-o\"></i>&nbsp;" . PROPERTIES_LIBRARY_SAVE . "</button>";
	
	if($change){
		
        echo "<span class='alert_msg' aria-live='polite'><i class='fa fa-exclamation-circle' style='height: 14px; color:#f86718;'></i> " . PROPERTIES_LIBRARY_RSS_SAVED . "</span>";

    }
	
	echo "</form>";
	
	echo "<h3>" . PROPERTIES_LIBRARY_RSS_FEEDS . ":</h3>";

    echo "<p>" . PROPERTIES_LIBRARY_RSS_SITE_LINK . ": <a target=\"_blank\" href=\"" . $xerte_toolkits_site->site_url . url_return("RSS",null)  . "\">" . $xerte_toolkits_site->site_url . url_return("RSS",null) . "</a>" . PROPERTIES_LIBRARY_RSS_LINKS;
	
	echo "<br/>" . PROPERTIES_LIBRARY_RSS_SITE_DESCRIPTION . "</p>";
	
	echo "<p>" . PROPERTIES_LIBRARY_RSS_PERSONAL . ": <a target=\"_blank\" href=\"" . $xerte_toolkits_site->site_url . url_return("RSS_user", ($row_name['firstname'] . "_" . $row_name['surname'])) . "\">" . $xerte_toolkits_site->site_url . url_return("RSS_user", $row_name['firstname'] . "_" . $row_name['surname']) . "</a>" . PROPERTIES_LIBRARY_RSS_LINKS . ".";
	
	echo "<br/>" . PROPERTIES_LIBRARY_RSS_MINE . "</p>";

    echo "<p>" . PROPERTIES_LIBRARY_RSS_FOLDER . ":";

	echo "<br/>" . PROPERTIES_LIBRARY_RSS_FOLDER_DESCRIPTION . "</p>";
	
	echo "<div>";

}

function rss_display_public(){
	
	echo "<h2 class=\"header\">" . PROPERTIES_LIBRARY_RSS . "</h2>";
	
    echo "<div id=\"mainContent\">";
	
    echo "<p>" . PROPERTIES_LIBRARY_RSS_PUBLIC . "</p>";
	
	echo "</div>";

}

function rss_display_fail($editor){
	
	echo "<h2 class=\"header\">" . PROPERTIES_LIBRARY_RSS . "</h2>";
	
    echo "<div id=\"mainContent\">";
	
	if ($editor) { // not creator / co-author
		
		echo "<p>" . PROPERTIES_LIBRARY_RSS_FAIL . "</p>";
		
	} else {
		
		echo "<p>" . PROPERTIES_LIBRARY_PROJECT_FAIL . "</p>";
		
	}
	
	echo "</div>";

}

function tsugi_display($id, $lti_def, $mesg = "")
{
    global $xerte_toolkits_site;
	
	?>
	
	<h2 class="header"><?php echo PROPERTIES_LIBRARY_TSUGI; ?></h2>
	<div id="mainContent">
	
	<?php
    if ($lti_def->tsugi_installed)
    {
		echo PROPERTIES_LIBRARY_TSUGI_DESCRIPTION; ?>
		
		<form action="javascript:lti_update(<?php echo $id;?>)">
		<fieldset class="plainFS"><legend>LTI</legend>
		<div>
			<input id="pubChk" type="checkbox" onchange="javascript:tsugi_toggle_tsugi_publish('<?php echo htmlspecialchars(json_encode($lti_def));?>')" name="tsugi_published" <?php echo ($lti_def->published ? "checked" : ""); ?>>
			<label for="pubChk"><?php echo PROPERTIES_LIBRARY_TSUGI_PUBLISH; ?></label>
		</div>
		<div id="publish" class="publish <?php echo($lti_def->published ? "" : "disabled"); ?>">
            <input type="checkbox" <?php echo($lti_def->published ? "" : "disabled"); ?> name="tsugi_publish_in_store" id="tsugi_publish_in_store" <?php echo ($lti_def->tsugi_publish_in_store ? "checked" : "");?>>
            <label for="tsugi_publish_in_store"><?php echo PROPERTIES_LIBRARY_TSUGI_PUBLISH_IN_STORE; ?></label><br>
			<input type="checkbox" onchange="javascript:tsugi_toggle_useglobal('<?php echo htmlspecialchars(json_encode($lti_def));?>')" <?php echo($lti_def->published ? "" : "disabled"); ?> name="tsugi_useglobal" id="tsugi_useglobal" <?php echo ($lti_def->tsugi_useglobal ? "checked" : "");?>>
			<label for="tsugi_useglobal"><?php echo PROPERTIES_LIBRARY_TSUGI_USEGLOBAL; ?></label><br>
			<input type="checkbox" <?php echo($lti_def->published ? "" : "disabled"); ?> name="tsugi_useprivateonly" id="tsugi_useprivateonly" <?php echo ($lti_def->tsugi_privateonly ? "checked" : "");?>>
			<label for="tsugi_useprivateonly"><?php echo PROPERTIES_LIBRARY_TSUGI_USEPRIVATEONLY; ?></label><br>
			<div class="textBoxes">
				<div class="textBoxGroup"><label for="tsugi_key"><?php echo PROPERTIES_LIBRARY_TSUGI_KEY; ?></label>
				<input id="tsugi_key" name="tsugi_key" type="text" <?php echo ($lti_def->tsugi_useglobal || !$lti_def->published ? "disabled value=\"\"" : "value=\"" .  $lti_def->key . "\"");?>></div>
				<div class="textBoxGroup"><label for="tsugi_secret"><?php echo PROPERTIES_LIBRARY_TSUGI_SECRET; ?></label>
				<input id="tsugi_secret" name="tsugi_secret" type="text" <?php echo ($lti_def->tsugi_useglobal || !$lti_def->published ? "disabled value=\"\"" : "value=\"" .  $lti_def->secret . "\"");?>></div>
			</div>
		</div>
		</fieldset>
		
	<?php
    }
    else
    {
		echo PROPERTIES_LIBRARY_TSUGI_NOTAVAILABLE_DESCRIPTION;
		?>
		<form action="javascript:lti_update(<?php echo $id; ?>)">
	<?php }	?>
		
		<fieldset class="plainFS"><legend>xAPI</legend>
		<div>
			<input id="xChk" type="checkbox" onchange="javascript:tsugi_toggle_usexapi('<?php echo htmlspecialchars(json_encode($lti_def));?>')" name="tsugi_xapi" <?php echo ($lti_def->xapi_enabled ? "checked" : "");?>>
			<label for="xChk"><?php echo PROPERTIES_LIBRARY_TSUGI_ENABLE_XAPI; ?></label>
		</div>
		
		<div id="xAPI_enabled" class="publish <?php echo($lti_def->xapi_enabled ? "" : "disabled"); ?>">

            <div id="xApi_dashboard" class="<?php echo($lti_def->xapi_enabled ? "" : "disabled"); ?>">
                <input type="checkbox" <?php echo($lti_def->xapi_enabled ? "" : "disabled"); ?> name="tsugi_publish_dashboard_in_store" id="tsugi_publish_dashboard_in_store" <?php echo ($lti_def->tsugi_publish_dashboard_in_store ? "checked" : "");?>>
                <label for="tsugi_publish_dashboard_in_store"><?php echo PROPERTIES_LIBRARY_TSUGI_PUBLISH_DASHBOARD_IN_STORE; ?></label><br>
            </div>
			<div id="xApi" class="<?php echo($lti_def->published && $lti_def->xapi_enabled ? "" : "disabled"); ?>">
				<input type="checkbox" <?php echo($lti_def->published && $lti_def->xapi_enabled ? "" : "disabled"); ?> onchange="javascript:xapi_toggle_useglobal('<?php echo htmlspecialchars(json_encode($lti_def));?>')" name="tsugi_xapi_useglobal" id="tsugi_xapi_useglobal" <?php echo ($lti_def->xapi_useglobal ? "checked" : "");?>>
				<label for="tsugi_xapi_useglobal"><?php echo PROPERTIES_LIBRARY_TSUGI_XAPI_USEGLOBAL; ?></label>
			</div>
			
			<div class="textBoxes">
				
				<div id="endpoint" class="textBoxGroup <?php echo($lti_def->xapi_useglobal || !$lti_def->xapi_enabled ?  "disabled" : ""); ?>">
					<label for="tsugi_xapi_endpoint"><?php echo PROPERTIES_LIBRARY_TSUGI_XAPI_ENDPOINT; ?></label>
					<input type="text" name="tsugi_xapi_endpoint" id="tsugi_xapi_endpoint" <?php echo ($lti_def->xapi_useglobal || !$lti_def->xapi_enabled ?  "disabled value=\"\"" : "value=\"" .  $lti_def->xapi_endpoint . "\""); ?>>
				</div>
				
				<div id="username" class="textBoxGroup <?php echo($lti_def->xapi_useglobal || !$lti_def->xapi_enabled ?  "disabled" : ""); ?>">
					<label for="tsugi_xapi_username"><?php echo PROPERTIES_LIBRARY_TSUGI_XAPI_USERNAME; ?></label>
					<input type="text" name="tsugi_xapi_username" id="tsugi_xapi_username" <?php echo ($lti_def->xapi_useglobal || !$lti_def->xapi_enabled ?  "disabled value=\"\"" : "value=\"" .  $lti_def->xapi_username . "\""); ?>>
				</div>
				
				<div id="password" class="textBoxGroup <?php echo($lti_def->xapi_useglobal || !$lti_def->xapi_enabled ?  "disabled" : ""); ?>">
					<label for="tsugi_xapi_password"><?php echo PROPERTIES_LIBRARY_TSUGI_XAPI_PASSWORD; ?></label>
					<input type="text" name="tsugi_xapi_password" id="tsugi_xapi_password" <?php echo ($lti_def->xapi_useglobal || !$lti_def->xapi_enabled ?  "disabled value=\"\"" : "value=\"" .  $lti_def->xapi_password . "\""); ?>>
				</div>
				
				<div id="studentid" class="textBoxGroup <?php echo($lti_def->xapi_enabled ? "" : "disabled"); ?>">
					<label for="tsugi_xapi_student_id_mode"><?php echo PROPERTIES_LIBRARY_TSUGI_XAPI_STUDENT_ID_MODE; ?></label>
					<select name="tsugi_xapi_student_id_mode" id="tsugi_xapi_student_id_mode" <?php echo($lti_def->xapi_enabled ? "" : "disabled"); ?> >
				
					<?php
					for ($i=0; $i<4; $i++)
					{
						if (! $lti_def->tsugi_installed && $i<3)
						{
							continue;
						}
						if (true_or_false($xerte_toolkits_site->xapi_force_anonymous_lrs) && ($i==0 || $i==2))
						{
							// Skip email and name + email
							continue;
						}
						echo "<option value=\"" . $i . "\" " . ($i == $lti_def->xapi_student_id_mode ? "selected>" : ">");
						switch($i)
						{
							case 0:
								echo PROPERTIES_LIBRARY_TSUGI_XAPI_STUDENT_ID_MODE_0;
								break;
							case 1:
								echo PROPERTIES_LIBRARY_TSUGI_XAPI_STUDENT_ID_MODE_1;
								break;
							case 2:
								echo PROPERTIES_LIBRARY_TSUGI_XAPI_STUDENT_ID_MODE_2;
								break;
							case 3:
								echo PROPERTIES_LIBRARY_TSUGI_XAPI_STUDENT_ID_MODE_3;
								break;
						}
						echo "</option>";
					}
					?>
					</select>
				</div>
				
				<div class="textBoxGroup">
					<label for="dashboard_urls"><?php echo PROPERTIES_LIBRARY_TSUGI_DASHBOARD_URLS; ?></label>
					<input name="dashboard_urls" type="text" <?php echo($lti_def->xapi_enabled ? "" : "disabled"); ?> value="<?php echo $lti_def->dashboard_urls ?>">
				</div>
			
			</div>
		
		</div>
		
		</fieldset>
		
        <button type="submit" class="xerte_button"><i class="fa fa-floppy-o"></i> <?php echo PROPERTIES_LIBRARY_TSUGI_UPDATE_BUTTON_LABEL; ?></button>
		
	</form>
	
    <?php
    if (strlen($mesg)>0) { ?>
		<p class="alert_msg" aria-live="polite"><i class="fa fa-exclamation-circle" style="height: 14px; color:#f86718;"></i> <?php echo $mesg; ?></p>
    <?php
    }
    
    if($lti_def->published)
    {
        echo "<p class='lti_launch_url'>" . PROPERTIES_LIBRARY_TSUGI_LTI_LAUNCH_URL . "<br>";
		echo "<a class='lti_launch_url' href='" . $lti_def->url . "' target='_blank'>" . $lti_def->url . "</a>" . PROPERTIES_LIBRARY_PROJECT_LINKS;
        echo "</p>";
		echo "<p>" . PROPERTIES_LIBRARY_TSUGI_LTI13_LAUNCH_URL . "<br>";
		echo "<a class='lti_launch_url' href='" . $lti_def->url13 . "' target='_blank'>" . $lti_def->url13 . "</a>" . PROPERTIES_LIBRARY_PROJECT_LINKS;
		echo "</p>";
    }
    else if ($lti_def->xapi_enabled)
    {
		// Show xapionly url
		echo "<p class='lti_launch_url'>";
		echo PROPERTIES_LIBRARY_TSUGI_LTI_LAUNCH_URL . "<br>";
		echo "<a class='lti_launch_url' href='" . $lti_def->xapionly_url . "' target='_blank'>" . $lti_def->xapionly_url . "</a>" . PROPERTIES_LIBRARY_PROJECT_LINKS;
		echo "</p>";
    }
    ?>
	
	</div>

    <?php
}

function tsugi_display_fail($editor){

	echo "<h2 class=\"header\">" . PROPERTIES_LIBRARY_TSUGI . "</h2>";
	
    echo "<div id=\"mainContent\">";

	if ($editor) { // not creator / co-author
		
		echo "<p>" . PROPERTIES_LIBRARY_TSUGI_FAIL . "</p>";
		
	} else {
		
		echo "<p>" . PROPERTIES_LIBRARY_PROJECT_FAIL . "</p>";
		
	}
	
	echo "</div>";

}
