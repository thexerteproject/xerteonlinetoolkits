<?php
	require_once("../../../config.php");
	global $xerte_toolkits_site;

	require_once($xerte_toolkits_site->tsugi_dir . "config.php");
	require_once($xerte_toolkits_site->tsugi_dir . "admin/admin_util.php");

	use \Tsugi\Util\LTI;
	use \Tsugi\Core\LTIX;
	use \Tsugi\Config\ConfigInfo;

	require_once("../../../functions.php");
	
	require_once "../template_status.php";

	require_once "../url_library.php";

	require_once "../user_library.php";
	
	require_once "properties_library.php";
	
	$id = $_REQUEST['template_id'];
	if(is_numeric($id)){
		if(true || is_user_creator($id)||is_user_admin()){
			$database_id = database_connect("peer template database connect success","peer template change database connect failed");
            $template_id = $id;
            $safe_template_id = (int)$id;
            $query_for_preview_content = "select otd.template_name, ld.username, otd.template_framework, tr.user_id, tr.folder, tr.template_id, td.access_to_whom, td.extra_flags,";
            $query_for_preview_content .= "td.tsugi_published, td.tsugi_xapi_enabled, td.tsugi_xapi_endpoint, td.tsugi_xapi_key, td.tsugi_xapi_secret";
            $query_for_preview_content .= " from " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails otd, " . $xerte_toolkits_site->database_table_prefix . "templaterights tr, " . $xerte_toolkits_site->database_table_prefix . "templatedetails td, " . $xerte_toolkits_site->database_table_prefix . "logindetails ld";
            $query_for_preview_content .= " where td.template_type_id = otd.template_type_id and td.creator_id = ld.login_id and tr.template_id = td.template_id and tr.template_id=" . $safe_template_id .  " and role='creator'";

            $row = db_query_one($query_for_preview_content);

			$tsugi_secret = "secret";
			$tsugi_key = "12345";
			$title = "Name";
			$checked = "";
			$xapi_enabled = "";
			$key = "12345";
			$secret = "secret";
			$published = $row["tsugi_published"];
            $url = $xerte_toolkits_site->site_url . "lti2_launch.php?template_id=" . $row['template_id'];
			$xapi_endpoint = $xerte_toolkits_site->LRS_Endpoint;
			$xapi_username = $xerte_toolkits_site->LRS_Key;
			$xapi_password = $xerte_toolkits_site->LRS_Secret;

			if($row["tsugi_xapi_enabled"] == 1)
            {
                $xapi_endpoint = $row["tsugi_xapi_endpoint"];
                $xapi_username = $row["tsugi_xapi_key"];
                $xapi_password = $row["tsugi_xapi_secret"];
                $xapi_enabled = "checked";
            }

			if($published == 1)
			{
				$PDOX = LTIX::getConnection();
				$row = $PDOX->rowDie(
					"	SELECT l.title, k.key_key, k.secret 
						FROM {$CFG->dbprefix}lti_key AS k, {$CFG->dbprefix}lti_context AS c, lti_link AS l  
							WHERE k.key_id = c.key_id AND c.context_id = l.context_id AND l.path = :DPATH",
						array(':DPATH' => $url));
				$key = $row["key_key"];
				$secret = $row["secret"];
				$title = $row["title"];
				$checked = "checked";
			}
			?>
				<p class="header"><span>LTI2/Tsugi</span></p>
				<p>

					<form id="form-action" method="post" action="<?php echo $xerte_toolkits_site->site_url;?>website_code/php/properties/lti_update.php?template_id=<?php echo $id;?>">
						<label for="tsugi_published">Publish</label><input id="pubChk" type="checkbox" name="tsugi_published" <?php echo $checked; ?>><br>
                        <div id="publish">
						    <label for="tsugi_title">Name:</label><input name="tsugi_title" type="text" value="<?php echo $title ?>"><br>
							<label for="tsugi_key">Key:</label><input name="tsugi_key" type="text" value="<?php echo $key ?>"><br>
							<label for="tsugi_secret">Secret:</label><input name="tsugi_secret" type="text" value="<?php echo $secret ?>"><br>


							<label for="tsugi_xapi">xAPI enabled: </label><input id="xChk" type="checkbox" name="tsugi_xapi" <?php echo $xapi_enabled;?>><br>
                            <div id="xApi">
						       <label for="tsugi_xapi_endpoint">xAPI endpoint: </label><input type="text" name="tsugi_xapi_endpoint" value="<?php echo $xapi_endpoint;?>"><br>
						        <label for="tsugi_xapi_username">xAPI username: </label><input type="text" name="tsugi_xapi_username" value="<?php echo $xapi_username;?>"><br>
						        <label for="tsugi_xapi_password">xAPI password: </label><input type="text" name="tsugi_xapi_password" value="<?php echo $xapi_password;?>"><br>
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
                    <div class="result_message"></div>
				</p>
			<?php

		}
	}
	
?> 