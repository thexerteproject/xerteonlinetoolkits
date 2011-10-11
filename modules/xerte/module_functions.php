<?PHP     /**
* 
* module functions page, shared functions for this module
*
* @author Patrick Lockley
* @version 1.0
* @copyright Copyright (c) 2008,2009 University of Nottingham
* @package
*/


/**
* 
* Function dont_show_template
* This function outputs the HTML for people have no rights to this template
* @version 1.0
* @author Patrick Lockley
*/

function dont_show_template(){

	require("config.php");

	require $xerte_toolkits_site->root_file_path . "languages/" . $_SESSION['toolkits_language'] . "/modules/xerte/module_functions.inc";
	
	?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
	<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
	<script src="modules/Xerte/javascript/swfobject.js"></script>
	<script src="website_code/scripts/opencloseedit.js"></script>
	<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
	<link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
	</head>

	<body>

	<div style="margin:0 auto; width:800px">
	<div class="edit_topbar" style="width:800px">
		<img src="website_code/images/edit_xerteLogo.jpg" style="margin-left:10px; float:left" />
		<img src="website_code/images/edit_UofNLogo.jpg" style="margin-right:10px; float:right" />
	</div>	
	<div style="margin:0 auto">
	<?PHP

	echo XERTE_DISPLAY_FAIL;
	
	?></div></div></body></html><?PHP

	die();

}

?>