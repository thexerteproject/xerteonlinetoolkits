
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

function folder_rss(){
	/*
	if(setup_ajax()!=false){
    
		var url="folder_rss.php";

		folders_ajax_send_prepare(url);

		xmlHttp.send('folder_id=' + window.name); 

	 }
	 */
	 $.ajax({
		 type: "POST",
		 url: "website_code/php/folderproperties/folder_rss.php",
		 data: {folder_id: window.name},
	 })
	 .done(function(response){
		 $('#dynamic_area').html(response);
	 })
}

 /**
	 * 
	 * Function folders properties
 	 * This function displays the basic properties panel for this folder
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function folderproperties(){
	 $.ajax({
		 type: "POST",
		 url: "website_code/php/folderproperties/folderproperties.php",
		 data: {folder_id: String(window.name).substr(0,String(window.name).indexOf("_"))},
	 })
	 .done(function(response){
		 $('#dynamic_area').html(response);
	 })
}

 /**
	 * 
	 * Function folder content template
 	 * This function shows the content of this folder for the folder content tab
	 * @version 1.0
	 * @author Patrick Lockley
	 */


function folder_content(){

	$.ajax({
		 type: "POST",
		 url: "website_code/php/folderproperties/folder_content.php",
		 data: {folder_id: String(window.name).substr(0,String(window.name).indexOf("_"))},
	})
	.done(function(response){
		$('#dynamic_area').html(response);
	})

}

 /**  CHECK THIS - OBSOLETE?
	 * 
	 * Function folders ajax send prepare
 	 * This function sorts out the URL for most of the queries in the folder properties window
	 * @param string url = the extra part of the url for this ajax query
	 * @version 1.0
	 * @author Patrick Lockley
	 */


function folder_name_a() {

	 $.ajax({
		 type: "POST",
		 url: "website_code/php/folderproperties/folder_name.php",
		 data: {folder_id: window.name},
	 })
	 .done(function (response) {
		 $('#dynamic_area').html(response);
	 })
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

	var new_name = $('#'+ form_tag + ' input').val();

	if(is_ok_name(new_name)){
		$.ajax({
			type: "POST",
			url: "website_code/php/folderproperties/rename_folder.php",
			data: {
				folder_id: folder_id,
				folder_name: new_name
			},
		})
		.done(function (response) {

			// the response contains the new html and the new file name, so split them
			var array_response = response.split("~*~");

			// set the html
			$('#dynamic_area').html(array_response[0]);

			// set the file name in the file_area
			if (typeof window_reference === "undefined") {
				window.opener.refresh_workspace();
			} else {
				window_reference.refresh_workspace();
			}
		})
	}else{
		alert(NAME_FAIL_FOLDER_PROPERTIES);
	}

}


/**
 *
 * Function sharing status folder
 * This function handles the display of the current sharing status
 * modified for use with folders
 * @version 1.0
 * @author Patrick Lockley
 */

function sharing_status_folder(){

	$.ajax({
		type: "POST",
		url: "website_code/php/folderproperties/sharing_status_folder.php",
		data: {folder_id: window.name},
	})
	.done(function(response){
		$('#dynamic_area').html(response);
	})
}

/**
 *
 * Function name select template
 * This function handles the selecting of a name
 * modified for use with folders
 * @version 1.0
 * @author Patrick Lockley
 */

function name_select_folder(){

	if(setup_ajax()!=false){

		search_string = document.getElementById('share_form').childNodes[0].value;

		if(search_string==""){
			document.getElementById('area2').innerHTML="<p>" + NAMES_APPEAR + "</p>";
		}

		if(is_ok_user(search_string)){
			$.ajax({
				type: "POST",
				url: "website_code/php/folderproperties/name_select_folder.php",
				data: {
					search_string : search_string,
					folder_id: window.name
				},
			})
			.done(function(response){
				$('#area2').html(response);
			});
		}else{
			$('#area2').html("<p>" + SEARCH_FAIL + "</p>");
		}

	}

}


function share_stateChanged(){

	if (xmlHttp.readyState==4){

		if(xmlHttp.responseText!=""){
			document.getElementById('area3').innerHTML = xmlHttp.responseText;
		}
	}
}

/**
 *
 * Function share this folder
 * This function handles the sharing of a folder
 * @param string folder = id of the folder
 * @param string user - the user to give it to
 * @version 1.0
 * @author Patrick Lockley
 */

function share_this_folder(folder, id, group=false){

	if(setup_ajax()!=false){
		var role = document.querySelector('input[name="role"]:checked').value;

		$.ajax({
			type: "POST",
			url: "website_code/php/folderproperties/share_this_folder.php",
			data: {
				folder_id: window.name,
				id: id,
				role: role,
				group: group,
			},
		})
		.done(function(response){
			$('#area3').html(response);
			sharing_status_folder()
		});
	}

}


function set_sharing_rights_folder(role, folder, id, group=false){

	if(setup_ajax()!=false){
		$.ajax({
			type: "POST",
			url: "website_code/php/folderproperties/share_this_folder.php",
			data: {
				folder_id: window.name,
				id: id,
				role: role,
				group: group,
			},
		})
			.done(function(response){
				//$('#area3').html(response);
				sharing_status_folder()
			});
	}

}


function delete_sharing_folder(folder_id,id,who_deleted_flag, group=false){

	var answer = confirm(SHARING_CONFIRM_FOLDER_PROPERTIES);
	var after_sharing_deleted = false;
	if(answer){
		if(who_deleted_flag){
			after_sharing_deleted = true;
		}

		if(setup_ajax()!=false){
			$.ajax({
				type: "POST",
				url: "website_code/php/folderproperties/remove_sharing_folder.php",
				data: {
					folder_id: folder_id,
					id: id,
					group: group,
					user_deleting_self: after_sharing_deleted
				},
			})
				.done(function(response){
					$('#area3').html(response);

					if(after_sharing_deleted){
						if(typeof window_reference==="undefined"){
							window.opener.refresh_workspace();
						}
						else {
							window_reference.refresh_workspace();
						}

					}

					sharing_status_folder()
				});
		}
	}
}

//   	xmlHttp.open("post",properties_ajax_php_path + url,true);
// 	xmlHttp.onreadystatechange=properties_stateChanged;
// 	xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
