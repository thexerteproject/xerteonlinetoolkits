<?php
	require_once("../../../tsugi/config.php");
	require_once("../../../tsugi/admin/admin_util.php");

	use \Tsugi\Util\LTI;
	use \Tsugi\Core\LTIX;
	use \Tsugi\Config\ConfigInfo;

	require_once("../../../config.php");
	
	require_once("../../../functions.php");
	
	require_once "../template_status.php";

	require_once "../url_library.php";

	require_once "../user_library.php";
	
	require_once "properties_library.php";
	
	
	
	$id = $_REQUEST['template_id'];
		
	if(is_numeric($id)){
		if(true || is_user_creator($id)||is_user_admin()){
			$tsugidir = "../../../tsugi/";
			$moddir = $tsugidir . "mod/";
			$database_id = database_connect("peer template database connect success","peer template change database connect failed");

			$prefix = $xerte_toolkits_site->database_table_prefix;
			
			$query = "select {$prefix}templaterights.template_id, "
					. "{$prefix}logindetails.username, {$prefix}originaltemplatesdetails.template_name,"
					. "{$prefix}originaltemplatesdetails.template_framework from {$prefix}templaterights, {$prefix}logindetails, "
					. "{$prefix}originaltemplatesdetails, {$prefix}templatedetails WHERE "
					. "{$prefix}templatedetails.template_type_id = {$prefix}originaltemplatesdetails.template_type_id and "
					. "{$prefix}templaterights.template_id = {$prefix}templatedetails.template_id and "
					. "{$prefix}templatedetails.creator_id = {$prefix}logindetails.login_id and {$prefix}templaterights.template_id= ? AND role= ?";

			$params = array($id, 'creator');
			
			$row = db_query_one($query, $params);
			$projectdir = $moddir . $row['template_id'] . "-" . $row['username'] . "-" . $row['template_name'];
			$new_publish = true;
			$tsugi_secret = "secret";
			$tsugi_key = "12345";
			$name = "Name";
			$shortname = "Short name";
			$desciption = "Description";
			
			if(file_exists($projectdir))
			{
				if(file_exists($projectdir . "/register.php"))
				{
					include($projectdir . "/register.php");
					$name = $REGISTER_LTI2["name"];
					$shortname = $REGISTER_LTI2["short_name"];
					$desciption = $REGISTER_LTI2["description"];
				}
			}
			?>
				<p class="header"><span>Tsugi</span></p>
				<p>
					
					<form method="post" action="<?php echo $xerte_toolkits_site->site_url;?>website_code/php/scorm/export.php?tsugi=true&template_id=<?php echo $id;?>">
						<label for="tsugi_name">Name:</label><input name="tsugi_name" type="text" value="<?php echo $name ?>"><br>
						<label for="tsugi_shortname">Short name:</label><input name="tsugi_shortname" type="text" value="<?php echo $shortname ?>"><br>
						<label for="tsugi_description">Description:</label><input name="tsugi_description" type="text" value="<?php echo $desciption ?>"><br>
						<input type="submit" value="Publish" class="xerte_button">
					</form>
				</p>
			<?php

		}
	}
	
?> 