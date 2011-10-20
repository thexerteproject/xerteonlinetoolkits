<?php     
require_once("../../../config.php");

require("../user_library.php");

if(is_user_admin()){

	$database_id = database_connect("templates list connected","template list failed");

	$query="select * from " . $xerte_toolkits_site->database_table_prefix . "templatesyndication," . $xerte_toolkits_site->database_table_prefix . "templatedetails where " . $xerte_toolkits_site->database_table_prefix . "templatesyndication.template_id = " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_id and( rss=\"true\" or export=\"true\" or syndication=\"true\")";

	$query_response = mysql_query($query);

	while($row = mysql_fetch_array($query_response)){

		echo "<p>" . $row['template_name'];

		if($row['rss']=="true"){

			echo " - <a href=\"javascript:remove_feed('" . $row['template_id'] .  "','RSS')\">Remove from RSS</a> ";

		}

		if($row['export']=="true"){

			echo " - <a href=\"javascript:remove_feed('" . $row['template_id'] .  "', 'EXPORT')\">Remove from Export</a> ";

		}

		if($row['syndication']=="true"){

			echo " - <a href=\"javascript:remove_feed('" . $row['template_id'] .  "','SYND')\">Remove from Syndication</a> ";

		}

	}

			
}else{

	echo "the feature is for administrators only";

}

?>

