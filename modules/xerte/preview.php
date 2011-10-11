<?PHP    

/**
* 
* preview page, allows the site to make a preview page for a xerte module
*
* @author Patrick Lockley
* @version 1.0
* @params array row_play - The array from the last mysql query
* @copyright Copyright (c) 2008,2009 University of Nottingham
* @package
*/


/**
* 
* Function show_preview_code
* This function creates folders needed when creating a template
* @param array $row - an array from a mysql query for the template
* @param array $row_username - an array from a mysql query for the username
* @version 1.0
* @author Patrick Lockley
*/

function show_preview_code($row, $row_username){

	global $xerte_toolkits_site;

	/*
	* Format the XML strings to provide data to the engine
	*/

	if(!file_exists($xerte_toolkits_site->users_file_area_short . $row['template_id'] . "-" . $row_username['username'] . "-" . $row['template_name'] . "/preview.xml")){

		$buffer = file_get_contents($xerte_toolkits_site->users_file_area_short . $row['template_id'] . "-" . $row_username['username'] . "-" . $row['template_name'] . "/data.xml");

		$fp = fopen($xerte_toolkits_site->users_file_area_short . $row['template_id'] . "-" . $row_username['username'] . "-" . $row['template_name'] . "/preview.xml","x");
		fwrite($fp, $buffer);
		fclose($fp);		

	}

	$string_for_flash_xml = $xerte_toolkits_site->users_file_area_short . $row['template_id'] . "-" . $row_username['username'] . "-" . $row['template_name'] . "/preview.xml" . "?time=" . time();

	$string_for_flash = $xerte_toolkits_site->users_file_area_short . $row['template_id'] . "-" . $row_username['username'] . "-" . $row['template_name'] . "/";

	/*
	* Get the size of the div required for this type of template
	*/

	$dimension = explode("~",get_template_screen_size($row['template_name'],$row['template_framework']));
	
	require $xerte_toolkits_site->root_file_path . "languages/" . $_SESSION['toolkits_language'] . "/modules/xerte/preview.inc";
	
	?>
	
	<!-- 

	University of Nottingham Xerte Online Toolkits

	HTML to use at the top of the Xerte preview and play windows
	Version 1.0

	-->

	<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
	<html style="width:100%; height:100%; min-height:100%;">
	<head>
	<title><?PHP echo XERTE_PREVIEW_TITLE;  ?></title>
	<script type="text/javascript">
	function enableTTS(){
	  if (navigator.appName.indexOf("Microsoft") != -1){
		VoiceObj = new ActiveXObject("Sapi.SpVoice");
	  }
	}
	function openWindow(params){
	  window.open(params.url,'xerte_window',"status=0,toolbar=0,location=0,menubar=0,directories=0,resizable=0,scrollbars=0,left=" + String((screen.width / 2) - (params.width / 2)) + ",top=" + String((screen.height / 2) - (params.height / 2)) + ",height=" + params.height + ",width=" + params.width);
	}
	</script>
	<SCRIPT LANGUAGE=JavaScript1.1>
	<!--
	var MM_contentVersion = 6;

	var plugin = (navigator.mimeTypes && navigator.mimeTypes["application/x-shockwave-flash"]) ? navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin : 0;
	if ( plugin ) {
			var words = navigator.plugins["Shockwave Flash"].description.split(" ");
			for (var i = 0; i < words.length; ++i)
			{
			if (isNaN(parseInt(words[i])))
			continue;
			var MM_PluginVersion = words[i]; 
			}
		var MM_FlashCanPlay = MM_PluginVersion >= MM_contentVersion;
	}
	else if (navigator.userAgent && navigator.userAgent.indexOf("MSIE")>=0 
	   && (navigator.appVersion.indexOf("Win") != -1)) {
		document.write('<SCR' + 'IPT LANGUAGE=VBScript\> \n'); //FS hide this from IE4.5 Mac by splitting the tag
		document.write('on error resume next \n');
		document.write('MM_FlashCanPlay = ( IsObject(CreateObject("ShockwaveFlash.ShockwaveFlash." & MM_contentVersion)))\n');
		document.write('</SCR' + 'IPT\> \n');
	}
	if (! MM_FlashCanPlay ) {
		document.write("You don't have Adobe Flash installed. Please visit <a href=\"http://get.adobe.com/flashplayer/?promoid=BUIGP\">The Adobe Website</a> to download it.");
	}
	//-->

	</SCRIPT>
	<script type="text/javascript" src = "rloObject.js"></script>
	</head>

	<body style="margin:0; width:100%; height:100%; min-height:100%;">

	<!--<div style="margin:0px auto;">-->

	<div style="min-height:100%; width:100%; height:100%;">

	<script type="text/javascript" language="JavaScript">
	<?PHP
	
	/*	
	* Output the standard xerte display code
	*/
	
	if(isset($_GET['linkID'])){

		$link_id = mysql_real_escape_string($_GET['linkID']);
		
		echo "myRLO = new rloObject('" . $dimension[0] . "','" . $dimension[1] . "','modules/" . $row['template_framework'] . "/parent_templates/" . $row['template_name'] ."/" . $row['template_name'] . ".rlt','$string_for_flash', '$string_for_flash_xml', '$xerte_toolkits_site->site_url' , '$link_id')";
		
	}else{
	
		$link_id = null;
		
		echo "myRLO = new rloObject('" . $dimension[0] . "','" . $dimension[1] . "','modules/" . $row['template_framework'] . "/parent_templates/" . $row['template_name'] ."/" . $row['template_name'] . ".rlt','$string_for_flash', '$string_for_flash_xml', '$xerte_toolkits_site->site_url' , '$link_id')";
	
	}

	echo "</script></div></body></html>";

}

?>