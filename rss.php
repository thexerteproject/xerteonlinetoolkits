<?PHP    

   header("Content-Type: application/xml; charset=ISO-8859-1");  

   require "config.php";
   require $xerte_toolkits_site->root_file_path . "languages/" . $_SESSION['toolkits_language'] . "/rss.inc";
   
   include $xerte_toolkits_site->php_library_path . "database_library.php";
   include $xerte_toolkits_site->php_library_path . "url_library.php";

   function normal_date($string){

	$temp = explode("-", $string);
	return $temp[2] . "/" . $temp[1] . "/" . $temp[0];

   }

   $database_id = database_connect("rss page.php database connect success worked","rss failed");

   $query_modifier = "rss";

   $action_modifder = "play";

   if(isset($_GET['export'])){

		$query_modifier = "export";

		$action_modifder = "export";

   }

   if(!isset($_GET['username'])){

	/*
	* Change this to reflect site settings
	*/

	echo "<rss version=\"2.0\"><channel><title>" . $xerte_toolkits_site->name . "</title><link>" . $xerte_toolkits_site->site_url . "</link><description>" . RSS_DESCRIPTION . " " . $xerte_toolkits_site->name . "</description><language>" . RSS_LANGUAGE . "</language><image><title>" . $xerte_toolkits_site->name . "</title><url>" . $xerte_toolkits_site->site_url . "website_code/images/xerteLogo.jpg</url><link>" . $xerte_toolkits_site->site_url . "</link></image>";

   }else{  

	if(!$database_id){

		die(RSS_DB_FAIL . mysql_error() );
		
       }

	$temp_array = explode("_",mysql_real_escape_string($_GET['username']));

	$query_created_by = "select login_id from " . $xerte_toolkits_site->database_table_prefix . "logindetails where (firstname=\"" . $temp_array[0] . "\" AND surname =\"" . $temp_array[1] . "\")";

	$query_create = mysql_query($query_created_by);

	if(mysql_num_rows($query_create)==0){

		header("HTTP/1.0 404 Not Found");

	}else{

		if(!isset($_GET['folder_name'])){
		
			echo "<rss version=\"2.0\"><channel><title>" . $temp_array[0] . " " . $temp_array[1] . RSS_LO . " - " . $xerte_toolkits_site->name . "</title><link>" . $xerte_toolkits_site->site_url . "</link><description>" . RSS_FEED_DESC . $temp_array[0] . " " . $temp_array[1] . "'s  public learning objects from the " . $xerte_toolkits_site->name . "</description><language>en-gb</language><image><title>" . $xerte_toolkits_site->rss_title . "</title><url>" . $xerte_toolkits_site->site_url .  "website_code/images/xerteLogo.jpg</url><link>" . $xerte_toolkits_site->site_url . "</link></image>";

		}else{

			echo "<rss version=\"2.0\"><channel><title>" . $temp_array[0] . " " . $temp_array[1] . "'s Learning Objects - " . str_replace("_"," ",$_GET['folder_name']) . " - " . $xerte_toolkits_site->name  . "</title><link>" . $xerte_toolkits_site->site_url . "</link><description>" . RSS_FEED_USER . $temp_array[0] . " " . $temp_array[1] . RSS_USER_LO . " - " . str_replace("_"," ",$_GET['folder_name']) . " " . RSS_FROM . $xerte_toolkits_site->name . RSS_SITE . "</description><language>" . RSS_LANGUAGE . "</language><image><title>" . $xerte_toolkits_site->rss_title . "</title><url>" . $xerte_toolkits_site->site_url . "/website_code/images/xerteLogo.jpg</url><link>" . $xerte_toolkits_site->site_url . "</link></image>";

		}

		$row_create = mysql_fetch_array($query_create);

	}


   }

 
   if(!isset($_GET['username'])){

	$query = "select " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_id,creator_id,date_created,template_name,description from " . $xerte_toolkits_site->database_table_prefix . "templatedetails, " . $xerte_toolkits_site->database_table_prefix . "templatesyndication where " . $query_modifier . "=\"true\" and " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_id = " . $xerte_toolkits_site->database_table_prefix . "templatesyndication.template_id";

   }else{

	   if(!isset($_GET['folder_name'])){

		$query = "select " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_id,creator_id,date_created,template_name,description from " . $xerte_toolkits_site->database_table_prefix . "templatedetails, " . $xerte_toolkits_site->database_table_prefix . "templatesyndication where " . $query_modifier . "=\"true\" AND creator_id=\"" . $row_create['login_id'] . "\" and " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_id = " . $xerte_toolkits_site->database_table_prefix . "templatesyndication.template_id";

	   }else{

		$query_folder = "select folder_id from " . $xerte_toolkits_site->database_table_prefix . "folderdetails where folder_name=\"" . str_replace("_", " ",mysql_real_escape_string($_GET['folder_name'])) . "\"";

		$query_folder_response = mysql_query($query_folder);

		$row_folder = mysql_fetch_array($query_folder_response);

		$query = "select * from " . $xerte_toolkits_site->database_table_prefix . "templaterights, " . $xerte_toolkits_site->database_table_prefix . "templatedetails, " . $xerte_toolkits_site->database_table_prefix . "templatesyndication where folder = \"" . $row_folder['folder_id'] .  "\" and " . $xerte_toolkits_site->database_table_prefix . "templaterights.template_id = " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_id and " . $xerte_toolkits_site->database_table_prefix . "templatesyndication.template_id = " . $xerte_toolkits_site->database_table_prefix . "templaterights.template_id and rss = \"true\"";

		//$query = "select " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_id,creator_id,template_name,folder,description from " . $xerte_toolkits_site->database_table_prefix . "templatedetails," . $xerte_toolkits_site->database_table_prefix . "templaterights," . $xerte_toolkits_site->database_table_prefix . "templatesyndication where " . $query_modifier . "=\"true\" AND creator_id=\"" . $row_create['login_id'] . "\" and " . $xerte_toolkits_site->database_table_prefix . "templaterights.template_id = " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_id and folder_id=\"" . $row_folder['folder_id'] . "\"";

	   }

   }

   $query_response = mysql_query($query);

   while($row = mysql_fetch_array($query_response)){

	 if(!isset($_GET['username'])){

		$query_creator = "select firstname,surname from " . $xerte_toolkits_site->database_table_prefix . "logindetails where login_id=\"" . $row['creator_id'] . "\"";

		$query_creator_response = mysql_query($query_creator);

		$row_creator = mysql_fetch_array($query_creator_response);

		$user = $row_creator['firstname'] . " " . $row_creator['surname'];

	 }else{

		$user = $temp_array[0] . " " . $temp_array[1];

   	 }

		if(isset($_GET['export'])){

			echo "<item><title>" . str_replace("_"," ",$row['template_name']) . "</title><link><![CDATA[" . $xerte_toolkits_site->site_url . url_return("export", $row['template_id']) . "]]></link><description><![CDATA[" . $row['description'] . "<br><br>" . str_replace("_"," ",$row['template_name']) . RSS_DEVELOP . $user . "]]></description><pubDate>" . date('D, d M Y', strtotime($row['date_created'])) . " 12:00:00 GMT</pubDate><guid><![CDATA[" . $xerte_toolkits_site->site_url . url_return("export", $row['template_id']) . "]]></guid></item>";

		}else{

			echo "<item><title>" . str_replace("_"," ",$row['template_name']) . "</title><link><![CDATA[" . $xerte_toolkits_site->site_url . url_return("play", $row['template_id']) . "]]></link><description><![CDATA[" . $row['description'] . "<br><br>" . str_replace("_"," ",$row['template_name']) . RSS_DEVELOP . $user . "]]></description><pubDate>" . date('D, d M Y', strtotime($row['date_created'])) . " 12:00:00 GMT</pubDate><guid><![CDATA[" . $xerte_toolkits_site->site_url . url_return("play", $row['template_id']) . "]]></guid></item>";


		}

	}

	echo "</channel></rss>";

	mysql_close($database_id);

?>