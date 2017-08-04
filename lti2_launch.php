<?php
$tsugi_disable_xerte_session = true;
require_once(dirname(__FILE__) . "/config.php");
require_once(dirname(__FILE__) . "/tsugi/config.php");


$id = $_GET["template_id"];
if(is_numeric($id))
{
	$prefix = "";//$xerte_toolkits_site->database_table_prefix;
	$query = "select {$prefix}templatedetails.template_name as zipname, {$prefix}templaterights.template_id, "
	. "{$prefix}logindetails.username, {$prefix}originaltemplatesdetails.template_name,"
	. "{$prefix}originaltemplatesdetails.template_framework from {$prefix}templaterights, {$prefix}logindetails, "
	. "{$prefix}originaltemplatesdetails, {$prefix}templatedetails WHERE "
	. "{$prefix}templatedetails.template_type_id = {$prefix}originaltemplatesdetails.template_type_id and "
	. "{$prefix}templaterights.template_id = {$prefix}templatedetails.template_id and "
	. "{$prefix}templatedetails.creator_id = {$prefix}logindetails.login_id and {$prefix}templaterights.template_id= ? AND role= ?";

	$params = array($_GET['template_id'], 'creator');
	$row = db_query_one($query, $params);
		
	$tsugi_project_dir = $row['template_id'] . "-" . $row['username'] . "-" . $row['template_name'];
	$tsugi_dir = $xerte_toolkits_site->root_file_path . "tsugi/mod/$tsugi_project_dir/";
	//$tsugi_project_dir = "2-guest2-Nottingham";
	//$tsugi_dir = dirname(__FILE__) . "/tsugi/mod/$tsugi_project_dir/";
	$dir = "tsugi/mod/$tsugi_project_dir/";
	if(file_exists($tsugi_dir))
	{
		chdir($tsugi_dir);
		include($tsugi_dir . "register.php");
		include($tsugi_dir . "index.php");
	}
}
?>