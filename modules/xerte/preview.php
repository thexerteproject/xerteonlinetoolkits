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
	
	require_once("config.php");
	
	_load_language_file("/modules/xerte/preview.inc");
	
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
		if (params.type == "media") {
			var src = params.url + '?media=../' + params.media + ',transcript=../' + params.transcript + ',img=../' + params.img;
			window.open(src,'xerte_window',"status=0,toolbar=0,location=0,menubar=0,directories=0,resizable=0,scrollbars=0,left=" + String((screen.width / 2) - (params.width / 2)) + ",top=" + String((screen.height / 2) - (params.height / 2)) + ",height=" + params.height + ",width=" + params.width);
		} else {
			window.open(params.url,'xerte_window',"status=0,toolbar=0,location=0,menubar=0,directories=0,resizable=0,scrollbars=0,left=" + String((screen.width / 2) - (params.width / 2)) + ",top=" + String((screen.height / 2) - (params.height / 2)) + ",height=" + params.height + ",width=" + params.width);
		}
	}

	var popupInfo = new Array();
	var stageW;
	var stageH;
	var screenSize;

	function makePopUp(params) {
		//kill any existing popups
		var popup = document.getElementById("popup");
		var parent = document.getElementById("popup_parent");
		
		if (popup != null) {
			parent.removeChild(popup);
		}
		
		//make the div and style it
		var create_div = document.createElement("DIV");
		create_div.id = params.id;
		create_div.style.position = "absolute";
		create_div.style.background = params.bgColour;
		if (params.borderColour != "none") {
			create_div.style.border = "1px solid " + params.borderColour;
		}
		
		stageW = params.width;
		stageH = params.height;
		if (stageW == 1600 && stageH == 1200) {
			stageW = document.getElementsByTagName('body')[0].clientWidth;
			stageH = document.getElementsByTagName('body')[0].clientHeight;
		}
		if (screenSize == "full screen") {
			calcStageSize();
		}
		
		// save info about popup to use if screen resized
		var index = popupInfo.length;
		popupInfo[index] = new Array();
		popupInfo[index][0] = params.id;
		popupInfo[index][1] = params.type;
		popupInfo[index][2] = params.calcW;
		popupInfo[index][3] = params.calcH;
		popupInfo[index][4] = params.calcX;
		popupInfo[index][5] = params.calcY;
		
		if (screenSize == "fill window") {
			create_div.style.width = params.calcW + "%";
			create_div.style.height = params.calcH + "%";
			create_div.style.left = params.calcX + "%";
			create_div.style.top = params.calcY + "%";
		} else {
			create_div.style.width = calcPopupSize("width", index) + "px";
			create_div.style.height = calcPopupSize("height", index) + "px";
			create_div.style.left = calcPopupSize("x", index) + "px";
			create_div.style.top = calcPopupSize("y", index) + "px";
		}
		
		if (params.type == 'div') {
			create_div.innerHTML = params.src;
		} else {
			var iframe_create_div = document.createElement("IFRAME");
			iframe_create_div.id = "i" + params.id;
			iframe_create_div.name = "i" + params.id;
			iframe_create_div.src = params.src;
			if (params.type == 'jmol') {
				iframe_create_div.src += ',width=' + calcPopupSize("width", index) + ',height=' + calcPopupSize("height", index);
			}
			iframe_create_div.style.width = "100%";
			iframe_create_div.style.height = "100%";
			iframe_create_div.frameBorder = 'no';
			create_div.appendChild(iframe_create_div);
		}

		//finally append the div
		parent.appendChild(create_div);
	}

	function killPopUp() {
		var parent = document.getElementById("popup_parent");
		if (parent.hasChildNodes()) {
			while (parent.childNodes.length >= 1) {
				parent.removeChild(parent.firstChild);
				popupInfo.splice(0, popupInfo.length);
			}
		}
	}

	function calcPopupSize(type, index) {
		var num;
		if (type == "width") {
			num = stageW / 100 * popupInfo[index][2];
		} else if (type == "height") {
			num = stageH / 100 * popupInfo[index][3];
		} else if (type == "x") {
			num = stageW / 100 * popupInfo[index][4];
		} else if (type == "y") {
			num = stageH / 100 * popupInfo[index][5];
		}
		return num;
	}

	function calcStageSize() {
		if (stageH / stageW != 0.75) {
			var ratio = stageH / stageW;
			if (ratio > 0.75) {
				stageH = stageW * 0.75;
			} else {
				stageW = stageH / 0.75;
			}
		}
	}

	function resizePopup(type, width, height) {
		if (screenSize != type && !(screenSize == undefined && type == "default")) {
			var parent = document.getElementById("popup_parent");
			if (parent.hasChildNodes()) {
				if (type == "fill window") {			
					for (i=0; i<popupInfo.length; i++) {
						id = parent.childNodes[i].id;
						document.getElementById(id).style.width = popupInfo[i][2] + "%";
						document.getElementById(id).style.height = popupInfo[i][3] + "%";
						document.getElementById(id).style.left = popupInfo[i][4] + "%";
						document.getElementById(id).style.top = popupInfo[i][5] + "%";
						if (popupInfo[i][1] == 'jmol') {
							stageW = document.getElementsByTagName('body')[0].clientWidth;
							stageH = document.getElementsByTagName('body')[0].clientHeight;
							document.getElementById("ipopup"+i).contentWindow.resize(calcPopupSize("width", i), calcPopupSize("height", i));
							//window.frames["ipopup"+i].resize(calcPopupSize("width", i), calcPopupSize("height", i));
						}
					}
				} else {
					if (type == "full screen") {
						stageW = document.getElementsByTagName('body')[0].clientWidth;
						stageH = document.getElementsByTagName('body')[0].clientHeight;
						calcStageSize();
					} else {
						stageW = width;
						stageH = height;
					}
					for (i=0; i<popupInfo.length; i++) {
						id = parent.childNodes[i].id;
						document.getElementById(id).style.width = calcPopupSize("width", i) + "px";
						document.getElementById(id).style.height = calcPopupSize("height", i) + "px";
						document.getElementById(id).style.left = calcPopupSize("x", i) + "px";
						document.getElementById(id).style.top = calcPopupSize("y", i) + "px";
						if (popupInfo[i][1] == 'jmol') {
							document.getElementById("ipopup"+i).contentWindow.resize(calcPopupSize("width", i), calcPopupSize("height", i));
							//window.frames["ipopup"+i].resize(calcPopupSize("width", i), calcPopupSize("height", i));
						}
					}
				}
			}
		}
		screenSize = type;
	}

	function windowResized() {
		var parent = document.getElementById("popup_parent");
		if (parent.hasChildNodes() && screenSize == "full screen") {
			stageW = document.getElementsByTagName('body')[0].clientWidth;
			stageH = document.getElementsByTagName('body')[0].clientHeight;
			calcStageSize();
			for (i=0; i<popupInfo.length; i++) {
				id = parent.childNodes[i].id;
				document.getElementById(id).style.width = calcPopupSize("width", i) + "px";
				document.getElementById(id).style.height = calcPopupSize("height", i) + "px";
				document.getElementById(id).style.left = calcPopupSize("x", i) + "px";
				document.getElementById(id).style.top = calcPopupSize("y", i) + "px";
			}
		}
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

	<body style="margin:0; width:100%; height:100%; min-height:100%;" onResize="windowResized();">

	<!--<div style="margin:0px auto;">-->
	<div id="popup_parent"></div>

	<div style="min-height:100%; width:100%; height:100%; z-index:-10">

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