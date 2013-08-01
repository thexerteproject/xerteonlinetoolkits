<?php
/**
 * 
 * sharing status template, shows who is sharing a template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");
_load_language_file("/website_code/php/properties/sharing_status_template.inc");


include "../template_status.php";

include "../user_library.php";

if(is_numeric($_POST['template_id'])){

    $database_id=database_connect("Sharing status template database connect success","Sharing status template database connect failed");

    if(has_rights_to_this_template(mysql_real_escape_string($_POST['template_id']), $_SESSION['toolkits_logon_id'])||is_user_admin()){

        $query_for_sharing_details = "select template_id, user_id, firstname, surname, role from " . $xerte_toolkits_site->database_table_prefix . "templaterights, " . $xerte_toolkits_site->database_table_prefix . "logindetails where " . $xerte_toolkits_site->database_table_prefix . "logindetails.login_id = " . $xerte_toolkits_site->database_table_prefix . "templaterights.user_id and template_id=\"" . mysql_real_escape_string($_POST['template_id']) . "\" and user_id !=\"" . $_SESSION['toolkits_logon_id'] . "\"";

        $query_sharing_response = mysql_query($query_for_sharing_details);

        /*
         * show a different view if you are the file creator
         */

        if(is_user_creator(mysql_real_escape_string($_POST['template_id']))){

            echo "<div class=\"share_top\"><p class=\"header\"><span>" . SHARING_INSTRUCTION . "</span></p><form id=\"share_form\"><input name=\"searcharea\" onkeyup=\"javascript:name_select_template()\" type=\"text\" size=\"20\" /></form><div id=\"area2\"><p>" . SHARING_NAMES . "</p></div><p id=\"area3\"></div>";	

        }

        /*
         * find out how many times it has been shares (analgous to number of rows for this template)
         */

        if(mysql_num_rows($query_sharing_response)!=0){

            echo "<p class=\"share_intro_p\"><span>" . SHARING_CURRENT . "</span></p>";

            while($row = mysql_fetch_array($query_sharing_response)){

                echo "<p class=\"share_files_paragraph\"><span>" . $row['firstname'] . " " . $row['surname'] . " (" . $row['role'] . ")</span></p>"; 

                if($row['role']!="creator"){

                    if(is_user_creator(mysql_real_escape_string($_POST['template_id']))){

                        echo "<p class=\"share_files_paragraph\">";

                        if($row['role']=="editor"){

                            echo "<img src=\"website_code/images/TickBoxOn.gif\" style=\"\" class=\"share_files_img\" /> " . SHARING_EDITOR;

                        }else{

                            echo "<img src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:set_sharing_rights_template('editor', '" . $row['template_id'] . "','" . $row['user_id'] . "')\" class=\"share_files_img\" /> " . SHARING_EDITOR;

                        }

                        if($row['role']=="read-only"){

                            echo "<img src=\"website_code/images/TickBoxOn.gif\" class=\"share_files_img\" /> " . SHARING_READONLY;

                        }else{

                            echo "<img src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:set_sharing_rights_template('read-only', '" . $row['template_id'] . "','" . $row['user_id'] . "')\" class=\"share_files_img\" /> " . SHARING_READONLY;
                        }

                        echo "</p>";

                        echo "<p>" . SHARING_REMOVE_DESCRIPTION . "</p>";

                        echo "<button type=\"button\" class=\"xerte_button\" onclick=\"javascript:delete_sharing_template('" . $row['template_id'] . "','" . $row['user_id'] . "',false)\" style=\"vertical-align:middle\" >" . SHARING_REMOVE . "</button>";

                        echo "<p class=\"share_border\"></p>";

                    }

                }

            }

            if(!is_user_creator(mysql_real_escape_string($_POST['template_id']))&&!is_user_admin()){

                echo "<p><a href=\"javascript:delete_sharing_template('" . $_POST['template_id'] . "','" . $_SESSION['toolkits_logon_id'] . "',true)\">" . SHARING_STOP . "</a></p>";

            }

        }else{

            echo "<p class=\"share_files_paragraph\"><span>" . SHARING_NOT_SHARED . "</span</p>";

        }	

    }else{

        echo "<p>" . SHARING_FAIL . "</p>";

    }

}

?>
