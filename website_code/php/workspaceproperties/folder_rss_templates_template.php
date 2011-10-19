<?PHP     /**
* 
* workspace templates template page, used displays the User created
*
* @author Patrick Lockley
* @version 1.0
* @copyright Copyright (c) 2008,2009 University of Nottingham
* @package
*/

	require("../../../config.php");
	require("../../../session.php");

	include "../database_library.php";
	include "../url_library.php";
	include "../display_library.php";

	/**
	* connect to the database
	*/
	
	$database_connect_id = database_connect("my_propertes_template.php connect success","my_properties_template.php connect failed");

	$query_for_folder = "select * from " . $xerte_toolkits_site->database_table_prefix . "folderdetails where login_id=\"" . $_SESSION['toolkits_logon_id'] . "\" and folder_parent!=\"0\"";

	$query_folder_response = mysql_query($query_for_folder);

	echo "<p class=\"header\"><span>My Feeds</span></p>";

	echo "<p>My RSS feed is <br/><a href=\"" . $xerte_toolkits_site->site_url . url_return("RSS_user", $_SESSION['toolkits_firstname'] . "_" . $_SESSION['toolkits_surname'] ) . "\" target=\"new\"> " . $xerte_toolkits_site->site_url . url_return("RSS_user", $_SESSION['toolkits_firstname'] . "_" . $_SESSION['toolkits_surname'] ) . "</a></p>";

	if(mysql_num_rows($query_folder_response)!=0){

		echo "<p>The RSS feeds for my folders are</p>";

		while($row_folder = mysql_fetch_array($query_folder_response)){

			echo "<p><a href=\"" . $xerte_toolkits_site->site_url . url_return("RSS_user", $_SESSION['toolkits_firstname'] . "_" . $_SESSION['toolkits_surname'] );

			if($xerte_toolkits_site->apache=="true"){

				echo "/" . str_replace("_"," ",$row_folder['folder_name']) . "/";

			}else{

				echo "&folder_name=" . str_replace("_"," ",$row_folder['folder_name']);

			}
			
			echo "\" target=\"new\">" . $xerte_toolkits_site->site_url . url_return("RSS_user", $_SESSION['toolkits_firstname'] . "_" . $_SESSION['toolkits_surname'] ); 

			if($xerte_toolkits_site->apache=="true"){

				echo str_replace("_"," ",$row_folder['folder_name']) . "/";

			}else{

				echo "&folder_name=" . str_replace("_"," ",$row_folder['folder_name']);	

			}

			echo "</a></p>";

		}

	}

	
?>