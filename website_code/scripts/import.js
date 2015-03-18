/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.

 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

	/**	
	 * 
	 * import, javascript for the import action
	 *
	 * @author Patrick Lockley
	 * @version 1.0
	 * @package
	 */

	 /**
	 * 
	 * Function iframe check upload
 	 * This function looks at the iframe where the upload takes place for the end of string marker to see when the code has finished (used on the media upload page).
	 * @version 1.0
	 * @author Patrick Lockley
	 */

var iframe_interval = 0;

function iframe_check_upload(){

	if(window["upload_iframe"].document.body.innerHTML!=""){

		if(window["upload_iframe"].document.body.innerHTML.indexOf("****")!=-1){

			clearInterval(iframe_interval);

			string = window["upload_iframe"].document.body.innerHTML.substr(window["upload_iframe"].document.body.innerHTML.indexOf(">")+1);

			string = string.substr(0,string.length-4);

			alert("Upload: " + string);

			media_and_quota_template();

			window["upload_iframe"].document.body.innerHTML="";

		}else{

			clearInterval(iframe_interval);

			string = window["upload_iframe"].document.body.innerHTML.substr(window["upload_iframe"].document.body.innerHTML.indexOf(">")+1);

			alert(PHP_ERROR + " - " + string);

		}

	}
	
}

	 /**
	 * 
	 * Function iframe check
 	 * This function looks at the iframe where the upload takes place for the end of string marker to see when the code has finished
	 * @version 1.0
	 * @author Patrick Lockley
	 */

var iframe_interval = 0;

function iframe_check(){

	if(window["upload_iframe"].document.body.innerHTML!=""){

		if(window["upload_iframe"].document.body.innerHTML.indexOf("****")!=-1){

			clearInterval(iframe_interval);

			string = window["upload_iframe"].document.body.innerHTML.substr(window["upload_iframe"].document.body.innerHTML.indexOf(">")+1);

			string = string.substr(0,string.length-4);

			alert(string);
			
			if(typeof window_reference==="undefined"){
                
                //window.opener.screen_refresh();
                window.opener.refresh_workspace();
            }else{
                
                //window_reference.screen_refresh();
                window_reference.refresh_workspace();
                
            }

			window["upload_iframe"].document.body.innerHTML="";

		}else{

			clearInterval(iframe_interval);

			string = window["upload_iframe"].document.body.innerHTML.substr(window["upload_iframe"].document.body.innerHTML.indexOf(">")+1);

			alert(PHP_ERROR + " - " + string);

		}

	}

}

	 /**
	 * 
	 * Function iframe upload check initialise
 	 * This function starts checking the iframe for the response text every 5 seconds (used by the media quota import page).
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function iframe_upload_check_initialise(){

	iframe_interval = setInterval("iframe_check_upload()",500);

}


	 /**
	 * 
	 * Function iframe check initialise
 	 * This function starts checking the iframe for the response text every 5 seconds
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function iframe_check_initialise(){

	iframe_interval = setInterval("iframe_check()",500);

}

	 /**
	 * 
	 * Function import template pop up (OSBOLETE)
 	 * This function repurposes the folder pop up for the import action
	 * @param string id_to_replace = the id of the template we might replace
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function import_template_pop_up(id_to_replace){

	/*
	* place the folder popup
	*/

	tag = document.getElementById("file_area");

	x=0;
	y=0;	

	while(tag.className!="pagecontainer"){

		x += tag.offsetLeft;
		y += tag.offsetTop;
	
		if(tag.parentNode){

			tag = tag.parentNode;

		}else{

			break;

		}

	} 
	
	file_area_width = document.getElementById("file_area").offsetWidth;

	document.getElementById("message_box").style.left = x + (file_area_width/2) - 150 + "px";
	document.getElementById("message_box").style.top = y + 100 +"px";	
	document.getElementById("message_box").style.display = "block";

	if(id_to_replace!=undefined){

		if(id_to_replace.indexOf("folder")!=-1){

		/*
		* Importing into a folder
		*/

			document.getElementById(id_to_replace).open=true;
			open_folders.push(document.getElementById(id_to_replace));

			document.getElementById("message_box").innerHTML = '<div class="corner" style="background-image:url(website_code/images/MessBoxTL.gif); background-position:top left;"></div><div class="central" style="background-image:url(website_code/images/MessBoxTop.gif);"></div><div class="corner" style="background-image:url(website_code/images/MessBoxTR.gif); background-position:top right;"></div><div class="main_area_holder_1"><div class="main_area_holder_2"><div class="main_area" id="dynamic_section"><p>" + IMPORT_TEXT + "</p><form method="post" enctype="multipart/form-data" id="importpopup" name="importform" target="upload_iframe" action="website_code/php/import/import.php" onsubmit="javascript:iframe_check_initialise();"><input name="filenameuploaded" type="file" /><br /><input type="hidden" name="folder" value="' + id_to_replace.substr(id_to_replace.indexOf("_")+1) + '" /><button type="submit" name="submitBtn" value="Upload" onsubmit="javascript:iframe_check_initialise()" /></form><p><img src="website_code/images/Bttn_CloseOff.gif" onmouseover="this.src=\'website_code/images/Bttn_CloseOn.gif\'" onmousedown="this.src=\'website_code/images/Bttn_CloseClick.gif\'" onmouseout="this.src=\'website_code/images/Bttn_CloseOff.gif\'" onclick="javascript:popup_close()" style="padding-right:5px" /><span id="folder_feedback"></span></p></div></div></div><div class="corner" style="background-image:url(website_code/images/MessBoxBL.gif); background-position:top left;"></div><div class="central" style="background-image:url(website_code/images/MessBoxBottom.gif);"></div><div class="corner" style="background-image:url(website_code/images/MessBoxBR.gif); background-position:top right;"></div>';

		}else{

			document.getElementById("message_box").style.height = "220px";

			document.getElementById("message_box").innerHTML = '<div class="corner" style="background-image:url(website_code/images/MessBoxTL.gif); background-position:top left;"></div><div class="central" style="background-image:url(website_code/images/MessBoxTop.gif);"></div><div class="corner" style="background-image:url(website_code/images/MessBoxTR.gif); background-position:top right;"></div><div class="main_area_holder_1"><div class="main_area_holder_2"><div class="main_area" id="dynamic_section"><p style="color:#f00; font-weight:bold">" + IMPORT_PROMPT + "</p><form method="post" enctype="multipart/form-data" id="importpopup" name="importform" target="upload_iframe" action="website_code/php/import/import.php" onsubmit="javascript:iframe_check_initialise();"><input name="filenameuploaded" type="file" /><br /><input type="hidden" name="replace" value="' + id_to_replace.substr(id_to_replace.indexOf("_")+1) + '" /><input type="submit" name="submitBtn" value="Upload" onsubmit="javascript:iframe_check_initialise()" /></form><p><img src="website_code/images/Bttn_CloseOff.gif" onmouseover="this.src=\'website_code/images/Bttn_CloseOn.gif\'" onmousedown="this.src=\'website_code/images/Bttn_CloseClick.gif\'" onmouseout="this.src=\'website_code/images/Bttn_CloseOff.gif\'" onclick="javascript:popup_close()" style="padding-right:5px" /><span id="folder_feedback"></span></p></div></div></div><div class="corner" style="background-image:url(website_code/images/MessBoxBL.gif); background-position:top left;"></div><div class="central" style="background-image:url(website_code/images/MessBoxBottom.gif);"></div><div class="corner" style="background-image:url(website_code/images/MessBoxBR.gif); background-position:top right;"></div>';

		}

	}else{

		document.getElementById("message_box").innerHTML = '<div class="corner" style="background-image:url(website_code/images/MessBoxTL.gif); background-position:top left;"></div><div class="central" style="background-image:url(website_code/images/MessBoxTop.gif);"></div><div class="corner" style="background-image:url(website_code/images/MessBoxTR.gif); background-position:top right;"></div><div class="main_area_holder_1"><div class="main_area_holder_2"><div class="main_area" id="dynamic_section"><p>" + IMPORT_TEXT + "</p><form method="post" enctype="multipart/form-data" id="importpopup" name="importform" target="upload_iframe" action="website_code/php/import/import.php" onsubmit="javascript:iframe_check_initialise();"><input name="filenameuploaded" type="file" /><br /><br />" + NEW_PROJECT_NAME + "<br /><br /><input name="templatename" type="text" onkeyup="new_template_name()" /><p id="name_wrong"></p><button type="submit" class = "xerte_button" name="submitBtn" value="Upload" onsubmit="javascript:iframe_check_initialise()">' + IMPORT_BUTTON_UPLOAD + '</button></form><p><button type="button" onclick="javascript:popup_close()" style="padding-right:5px">'+IMPORT_BUTTON_CLOSE+'</button><span id="folder_feedback"></span></p></div></div></div><div class="corner" style="background-image:url(website_code/images/MessBoxBL.gif); background-position:top left;"></div><div class="central" style="background-image:url(website_code/images/MessBoxBottom.gif);"></div><div class="corner" style="background-image:url(website_code/images/MessBoxBR.gif); background-position:top right;"></div>';
		
	}

	document.importform.submitBtn.disabled = true;

	document.getElementById("message_box").style.zindex = 2;

}


	 /**
	 * 
	 * Function new template name
 	 * This function prevents imported names being invalid
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function new_template_name(){

	if(document.importform.templatename.value!=""){		

		if(is_ok_name(document.importform.templatename.value)){

			document.getElementById("namewrong").innerHTML = "";
			document.getElementById("submitbutton").disabled = false;

		}else{

			document.getElementById("namewrong").innerHTML = NAME_FAIL_IMPORT;

		}

	}else{

		document.importform.submitBtn.disabled = true;

	}

}

	 /**
	 * 
	 * Function import template
 	 * This function handles the display of the import pop up
	 * @version 1.0
	 * @author Patrick Lockley
	 */


function import_template(){

	if(drag_manager.selected_items.length>=2){

		alert(ONE_TEMPLATE_ERROR);

	}else if(drag_manager.selected_items.length==1){

		if(drag_manager.selected_items[0].className=="file"){

			alert(IMPORT_OVER);

			/*
			var answer = confirm("By selection this option you will replace this template with a new version - are you sure?");

			if(answer){

				import_template_pop_up(drag_manager.selected_items[0].id);

			}*/

		}else{

			var answer = confirm(IMPORT_OVERWRITE_CONFIRM);

			if(answer){

				import_template_pop_up(drag_manager.selected_items[0].id);

			}

		}

	}else if(drag_manager.selected_items.length==0){

		var answer = confirm(IMPORT_CONFIRM);

		if(answer){

			import_template_pop_up();			

		}

	}
	
}