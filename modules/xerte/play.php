<?PHP     require("module_functions.php");

//Function show_template
//
// Version 1.0 University of Nottingham
// (pl)
// Set up the preview window for a xerte piece

function show_template($row_play){

		require("config.php");

		$string_for_flash_xml = $xerte_toolkits_site->users_file_area_short . $row_play['template_id'] . "-" . $row_play['username'] . "-" . $row_play['template_name'] . "/data.xml?time=" . time();

		$string_for_flash = $xerte_toolkits_site->users_file_area_short . $row_play['template_id'] . "-" . $row_play['username'] . "-" . $row_play['template_name'] . "/";

		$dimension = split("~",get_template_screen_size($row_play['template_name'],$row_play['template_framework']));

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

		// slightly modified xerte preview code to allow for flash vars

		echo "myRLO = new rloObject('" . $dimension[0] . "','" . $dimension[1] . "','modules/" . $row_play['template_framework'] . "/parent_templates/" . $row_play['template_name'] . "/" . $row_play['template_name'] . ".rlt','$string_for_flash', '$string_for_flash_xml', '$xerte_toolkits_site->site_url')";

		echo "</script></div></div></body></html>";

}

?>