<?php
/**
 * 
 * rename template, allows a user to rename a template
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

if(is_numeric($_POST['template_id'])){

    $tutorial_id = mysql_real_escape_string($_POST['template_id']);

    $query = "update {$xerte_toolkits_site->database_table_prefix}templatedetails SET template_name = ? WHERE template_id = ?";
    $res = db_query($query, array(str_replace(' ', '_', $_POST['template_name']), $_POST['template_id']));

    if($res) {

        $query_for_names = "select template_name, date_created, date_modified from " . $xerte_toolkits_site->database_table_prefix . "templatedetails where template_id=\"". $tutorial_id . "\"";

        $query_names_response = mysql_query($query_for_names);

        $row = mysql_fetch_array($query_names_response);

        echo "~~**~~" . $_POST['template_name'] . "~~**~~";	

        echo "<p class=\"header\"><span>Project</span></p>";

        echo "<p>Project Name</p>";

        echo "<form id=\"rename_form\" action=\"javascript:rename_template('" . $_POST['template_id'] . "', 'rename_form')\"><input style=\"padding-bottom:5px\" type=\"text\" value=\"" . str_replace("_", " ", $_POST['template_name']) . "\" name=\"newfilename\" /><input style=\"padding-left:5px; padding-top:-5px;\" type=\"image\" src=\"website_code/images/Bttn_SaveOff.gif\" onmouseover=\"this.src='website_code/images/Bttn_SaveOn.gif'\" onmouseout=\"this.src='website_code/images/Bttn_SaveOff.gif'\" onmousedown=\"this.src='website_code/images/Bttn_SaveClick.gif'\" align=\"top\" /></form><p>Project renamed</p>";

        echo "<br><br><p>This file was created on " . $row['date_created'] . "</p>";
        echo "<p>This file was last modified on " . $row['date_modified'] . "</p>";

        echo "<p>To allow other people to access this file, the link is</p>";

        echo "<p><a target=\"new\" href='" . $xerte_toolkits_site->site_url . url_return("play", $_POST['template_id']) . "'>" . $xerte_toolkits_site->site_url . url_return("play", $_POST['template_id']) . "</a></p>";

        /*
         * Get the template screen size for the embed code
         */

        $query_for_template_name = "select " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails.template_name, " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails.template_framework from " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails, " . $xerte_toolkits_site->database_table_prefix . "templatedetails where " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_type_id = " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails.template_type_id AND template_id =\"" . $tutorial_id . "\"";

        $query_name_response = mysql_query($query_for_template_name);

        $row_name = mysql_fetch_array($query_name_response);

        $temp_string = get_template_screen_size($row_name['template_name'], $row_name['template_framework']);

        $temp_array = explode("~",$temp_string);

        echo "<br><br><p>This code will allow you to embed your project into a web page</p><form><textarea rows='3' cols='40' onfocus='this.select()'><iframe src='"  . $xerte_toolkits_site->site_url .  "play_" . $_POST['template_id'] . "' width='" . $temp_array[0] . "' height='" . $temp_array[1] . "' frameborder=\"0\"></iframe></textarea></form>";


    }else{

    }

}
