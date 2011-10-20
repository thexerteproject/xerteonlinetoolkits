<?php
/**
 * 
 * xml template, shows the xml sharing status for this template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");



include "../template_status.php";

include "../url_library.php";

include "../user_library.php";

$database_id = database_connect("peer template database connect success","peer template change database connect failed");

if(is_numeric($_POST['template_id'])){

    if(is_user_creator(mysql_real_escape_string($_POST['template_id']))||is_user_admin()){

        echo "<p class=\"header\"><span>XML Sharing</span></p>";			

        echo "<p class=\"share_status_paragraph\">In this section you can set up the XML Sharing for one of your projects. Your project must be published for this to work. This allows your work to be used in other systems</p>";

        $query = "select * from " . $xerte_toolkits_site->database_table_prefix . "additional_sharing where sharing_type=\"xml\" AND template_id =\"" . mysql_real_escape_string($_POST['template_id']) . "\"";

        $query_response = mysql_query($query);

        echo "<p class=\"share_status_paragraph\">XML Sharing is </p>";

        if(mysql_num_rows($query_response)==1){

            echo "<p class=\"share_status_paragraph\"><img id=\"xmlon\" src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:xml_tick_toggle('xmlon')\" /> on</p>";
            echo "<p class=\"share_status_paragraph\"><img id=\"xmloff\" src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:xml_tick_toggle('xmloff')\" /> off</p>";
            echo "<p class=\"share_status_paragraph\">The link for xml sharing is " . $xerte_toolkits_site->site_url . url_return("xml",$_POST['template_id']) . "</p>";

        }else{

            echo "<p class=\"share_status_paragraph\"><img id=\"xmlon\" src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:xml_tick_toggle('xmlon')\" /> on</p>";
            echo "<p class=\"share_status_paragraph\"><img id=\"xmloff\" src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:xml_tick_toggle('xmloff')\" /> off</p>";

        }

        $row = mysql_fetch_array($query_response);

        echo "<p class=\"share_status_paragraph\"><form action=\"javascript:xml_change_template()\" name=\"xmlshare\">You can restrict access to one site if you would like <br><br><input type=\"text\" size=\"30\" name=\"sitename\" style=\"margin:0px; padding:0px\" value=\"" . $row['extra'] . "\" /><br><br><input type=\"image\" src=\"website_code/images/Bttn_SaveOff.gif\" onmouseover=\"this.src='website_code/images/Bttn_SaveClick.gif'\" onmousedown=\"this.src='website_code/images/Bttn_SaveOn.gif'\" onmouseout=\"this.src='website_code/images/Bttn_SaveOff.gif'\" /></p></form>";

    }else{

        echo "<p>Sorry, only creators of templates can set up XML sharing</p>";

    }

    mysql_close($database_id);

}
?>
