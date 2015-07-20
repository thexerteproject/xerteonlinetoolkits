
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
	 * folderproperties, javascript for the folder properties tab
	 *
	 * @author Patrick Lockley
	 * @version 1.0
	 * @package
	 */

	 /**
	 * 
	 * Function folders ajax send prepare
 	 * This function sorts out the URL for most of the queries in the folder properties window
	 * @param string url = the extra part of the url for this ajax query
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function folders_ajax_send_prepare(url){

   	xmlHttp.open("post","website_code/php/folderproperties/" + url,true);
	xmlHttp.onreadystatechange=folder_properties_stateChanged;
	xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	
}

 	/**
	 * 
	 * Function folders properties state changed
 	 * This function handles all of the responses from the ajax queries
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function folder_properties_stateChanged(){ 

	if (xmlHttp.readyState==4){ 
			
		if(xmlHttp.responseText!=""){
			
			document.getElementById('dynamic_area').innerHTML = xmlHttp.responseText;

		}
	}
} 

 	/**
	 * 
	 * Function folder name state changed
 	 * This function handles ajax responses for the folder rename query as this requires extra bits of work
	 * @version 1.0
	 * @author Patrick Lockley
	 */


function folder_rename_stateChanged(){ 

	if (xmlHttp.readyState==4){ 

		if(xmlHttp.responseText!=""){

			/*
			* the response contains the new html and the new file name, so split them
			*/

			array_response = xmlHttp.responseText.split("~*~");

			/*
			* set the html
			*/

			document.getElementById('dynamic_area').innerHTML = array_response[0];

			/*
			 * set the file name in the file_area
			 */
			if(typeof window_reference==="undefined"){
				window.opener.refresh_workspace();
			}
			else {
				window_reference.refresh_workspace();
			}
		}
	}		

}

 /**
	 * 
	 * Function folders rss template
 	 * This function displays the RSS features for this folder
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function folder_rss_template(){

	if(setup_ajax()!=false){
    
		var url="folder_rss_template.php";

		folders_ajax_send_prepare(url);

		xmlHttp.send('folder_id=' + window.name); 

	}

}

 /**
	 * 
	 * Function folders properties
 	 * This function displays the basic properties panel for this folder
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function folderproperties_template(){

	if(setup_ajax()!=false){
    
		var url="folderproperties_template.php";

		folders_ajax_send_prepare(url);

		xmlHttp.send('folder_id=' + String(window.name).substr(0,String(window.name).indexOf("_"))); 

	}

}

 /**
	 * 
	 * Function folder content template
 	 * This function shows the content of this folder for the folder content tab
	 * @version 1.0
	 * @author Patrick Lockley
	 */


function folder_content_template(){

	if(setup_ajax()!=false){
    
		var url="folder_content_template.php";

		folders_ajax_send_prepare(url);

		xmlHttp.send('folder_id=' + String(window.name).substr(0,String(window.name).indexOf("_"))); 

	}

}

 /**  CHECK THIS - OBSOLETE?
	 * 
	 * Function folders ajax send prepare
 	 * This function sorts out the URL for most of the queries in the folder properties window
	 * @param string url = the extra part of the url for this ajax query
	 * @version 1.0
	 * @author Patrick Lockley
	 */


function folder_name_template_a(){

	if(setup_ajax()!=false){
    
		var url="folder_name_template.php";

		folders_ajax_send_prepare(url);

		xmlHttp.send('folder_id=' + window.name); 

	}

}

 	/**
	 * 
	 * Function rename folder
 	 * This function renames the folder
	 * @param string folder_id = the id of this folder
 	 * @param string form_tag = the the id of the form
	 * @version 1.0
	 * @author Patrick Lockley
	 */


function rename_folder(folder_id,form_tag){

	new_name = document.getElementById(form_tag).childNodes[0].value;

	if(is_ok_name(new_name)){

		if(setup_ajax()!=false){
    
			var url="rename_folder_template.php";

			xmlHttp.open("post","website_code/php/folderproperties/" + url,true);
			xmlHttp.onreadystatechange=folder_rename_stateChanged;
			xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

			xmlHttp.send('folder_id=' + folder_id +'&folder_name=' + new_name); 

		}

	}else{

		alert(NAME_FAIL_FOLDER_PROPERTIES);

	}

}