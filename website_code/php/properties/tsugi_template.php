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

    global $xerte_toolkits_site;
	
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
			$checked = "";
			$xapi_enabled = "";
			$key = "12345";
			$secret = "secret";
			$published = false;
			$url = $xerte_toolkits_site->site_url . "tsugi/mod/" . $row['template_id'] . "-" . $row['username'] . "-" . $row['template_name'] . "/";
			if(file_exists($projectdir))
			{
				$indexfile = $projectdir . "index.php";
				$published = true;
				$PDOX = LTIX::getConnection();
				$row = $PDOX->rowDie(
					"	SELECT k.key_key, k.secret 
						FROM {$CFG->dbprefix}lti_key AS k, {$CFG->dbprefix}lti_context AS c, lti_link AS l  
							WHERE k.key_id = c.key_id AND c.context_id = l.context_id AND l.path = :DPATH",
						array(':DPATH' => $url . "index.php"));
				$key = $row["key_key"];
				$secret = $row["secret"];
				$checked = "checked";
                if(file_exists($projectdir . "/xttracking_xapi.js"))
                {
                    $xapi_enabled = "checked";
                    $xapi_endpoint = $xerte_toolkits_site->LRS_Endpoint;
                    $xapi_username = $xerte_toolkits_site->LRS_Key;
                    $xapi_password = $xerte_toolkits_site->LRS_Secret;
                }

				if(file_exists($projectdir . "/register.php"))
				{
					include($projectdir . "/register.php");
					$name = $REGISTER_LTI2["name"];
					$shortname = $REGISTER_LTI2["short_name"];
					$desciption = $REGISTER_LTI2["description"];
                    $xapi_endpoint = $xApi_Config["xapi_endpoint"];
                    $xapi_username = $xApi_Config["xapi_username"];
                    $xapi_password = $xApi_Config["xapi_password"];
				}
			}
			?>
				<p class="header"><span>Tsugi</span></p>
				<p>

					<form method="post" action="<?php echo $xerte_toolkits_site->site_url;?>website_code/php/scorm/export.php?tsugi=true&template_id=<?php echo $id;?>">
						<label for="tsugi_published">Publish</label><input id="pubChk" type="checkbox" name="tsugi_published" <?php echo $checked; ?>><br>
                        <div id="publish">
						    <label for="tsugi_name">Name:</label><input name="tsugi_name" type="text" value="<?php echo $name ?>"><br>
						    <label for="tsugi_shortname">Short name:</label><input name="tsugi_shortname" type="text" value="<?php echo $shortname ?>"><br>
						    <label for="tsugi_description">Description:</label><input name="tsugi_description" type="text" value="<?php echo $desciption ?>"><br>
							<label for="tsugi_secret">Secret:</label><input name="tsugi_secret" type="text" value="<?php echo $secret ?>"><br>
							<label for="tsugi_key">Key:</label><input name="tsugi_key" type="text" value="<?php echo $key ?>"><br>

							<label for="tsugi_xapi">xAPI enabled: </label><input id="xChk" type="checkbox" name="tsugi_xapi" <?php echo $xapi_enabled;?>><br>
                            <div id="xApi">
						       <label for="tsugi_xapi_endpoint">xAPI endpoint: </label><input type="text" name="tsugi_xapi_endpoint" value="<?php echo $xapi_endpoint;?>"><br>
						        <label for="tsugi_xapi_username">xAPI username: </label><input type="text" name="tsugi_xapi_username" value="<?php echo $xapi_username;?>"><br>
						        <label for="tsugi_xapi_password">xAPI endpoint: </label><input type="text" name="tsugi_xapi_password" value="<?php echo $xapi_password;?>"><br>
                            </div>
                        </div>

						<input type="submit" value="Update" class="xerte_button">
					</form>
					<?php
					if($published)
					{
						
						echo "Your LTI2 link is: <br><a href=\"$url\">$url</a>";
					}
					?>
				</p>
			<?php

		}
	}
	
?> 