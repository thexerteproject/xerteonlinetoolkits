<?php
/**
 *
 * export template, allows the site to display the html for the export panel
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
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

    if(is_user_creator(mysql_real_escape_string($_POST['template_id']), $_SESSION['toolkits_logon_id'])||is_user_admin()){

        echo "<p class=\"header\"><span>" . EXPORT_TITLE . "</span></p>";

		$query_for_play_content_strip = str_replace("\" . \$xerte_toolkits_site->database_table_prefix . \"", $xerte_toolkits_site->database_table_prefix, $xerte_toolkits_site->play_edit_preview_query);

		$safe_template_id = htmlentities($_POST['template_id']);

		$query_for_play_content = str_replace("TEMPLATE_ID_TO_REPLACE", $safe_template_id, $query_for_play_content_strip);

		$query_for_play_content_response = mysql_query($query_for_play_content);

		$row_play = mysql_fetch_array($query_for_play_content_response);
		
		if(file_exists($xerte_toolkits_site->root_file_path . "modules/" . $row_play['template_framework'] . "/export_page.php")){

			require_once($xerte_toolkits_site->root_file_path . "modules/" . $row_play['template_framework'] . "/export_page.php");
			
		}else{
		
			echo "<p>" . EXPORT_NOT_AVAILABLE . "</p>";
		
		}

    }else{

        echo "<p>". EXPORT_FAIL. "</p>";

    }

}
