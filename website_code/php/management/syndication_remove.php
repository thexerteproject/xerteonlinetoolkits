<?PHP require("../../../config.php");
require("../../../session.php");

require("../database_library.php");
require("../user_library.php");
require("../error_library.php");

if(is_user_admin()){

	$database_id = database_connect("templates list connected","template list failed");

	if($_POST['rss']!=""){

		$query="update " . $xerte_toolkits_site->database_table_prefix . "templatesyndication set rss=\"false\" where template_id =\"" . $_POST['template_id'] . "\"";

	}

	if($_POST['export']!=""){

		$query="update " . $xerte_toolkits_site->database_table_prefix . "templatesyndication set export=\"false\" where template_id =\"" . $_POST['template_id'] . "\"";
	}

	if($_POST['synd']!=""){

		$query="update " . $xerte_toolkits_site->database_table_prefix . "templatesyndication set syndication=\"false\" where template_id =\"" . $_POST['template_id'] . "\"";

	}

	$query_response = mysql_query($query);

	$query="select * from " . $xerte_toolkits_site->database_table_prefix . "templatesyndication," . $xerte_toolkits_site->database_table_prefix . "templatedetails where " . $xerte_toolkits_site->database_table_prefix . "templatesyndication.template_id = " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_id and(rss=\"true\" or export=\"true\" or syndication=\"true\")";

	$query_response = mysql_query($query);

	if(mysql_num_rows($query_response)!=0){

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

		echo "<p>No content in feeds</p>";

	}

			
}else{

	echo "the feature is for administrators only";

}

?>