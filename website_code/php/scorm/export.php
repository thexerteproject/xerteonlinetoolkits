<?php
/**
 *
 * export, allows the creation of zip and scorm packages
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");
include "../template_status.php";

ini_set('max_execution_time', 300);

if(is_numeric($_GET['template_id'])){
    $_GET['template_id'] = (int) $_GET['template_id'];
    $proceed = false;
    if(is_template_exportable($_GET['template_id'])){
        $proceed = true;
    }else{
        if(is_user_creator($_GET['template_id'])||is_user_admin()){
            $proceed = true;
        }
    }

    if($proceed){
	
		$fullArchive = false;
	
        if (isset($_GET['full'])){
            if($_GET['full']=="true"){
                $fullArchive = true;
            }

        }
        _debug("Full archive: " . $fullArchive);
        $mysql_id=database_connect("Scorm export database connect success","Scorm export database connect failed");

        /*
         * Get the file path
         */
        $query = "select " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_name as zipname, " . $xerte_toolkits_site->database_table_prefix . "templaterights.template_id, " . $xerte_toolkits_site->database_table_prefix . "logindetails.username, " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails.template_name, " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails.template_framework from " . $xerte_toolkits_site->database_table_prefix . "templaterights, " . $xerte_toolkits_site->database_table_prefix . "logindetails, " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails, " . $xerte_toolkits_site->database_table_prefix . "templatedetails where " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_type_id = " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails.template_type_id and " . $xerte_toolkits_site->database_table_prefix . "templaterights.template_id = " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_id and " . $xerte_toolkits_site->database_table_prefix . "templatedetails.creator_id = " . $xerte_toolkits_site->database_table_prefix . "logindetails.login_id and " . $xerte_toolkits_site->database_table_prefix . "templaterights.template_id=\"" . mysql_real_escape_string($_GET['template_id']) . "\" AND role=\"creator\"";
        $query_response = mysql_query($query);
        $row = mysql_fetch_array($query_response);
		
		if(file_exists($xerte_toolkits_site->root_file_path . "modules/" . $row['template_framework'] . "/export.php")){
		
			require_once($xerte_toolkits_site->root_file_path . "modules/" . $row['template_framework'] . "/export.php");
		
		}
		
    }
}