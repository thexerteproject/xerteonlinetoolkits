
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

function tab_stateChanged(response, tabId){
	if(response!=""){
		$("#dynamic_area .tabPanel").empty().hide();
		
		$("#" + tabId).html(response).show();
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
	 $.ajax({
		 type: "POST",
		 url: "website_code/php/folderproperties/folder_rss.php",
		 data: {folder_id: window.name},
	 })
	 .done(function(response){
		 tab_stateChanged(response, 'panelRss');
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
		tab_stateChanged(response, 'panelFolder');
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
		tab_stateChanged(response, 'panelContent');
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
			tab_stateChanged(array_response[0], 'panelFolder');

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
		tab_stateChanged(response, 'panelSyn');
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

		search_string = document.getElementById('searcharea').value;

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


function set_sharing_rights_folder(folder, id, group){
	
	var idPrefix = group == true ? 'groupRole' : 'role';
	var role = document.getElementById(idPrefix + '_' + id).value.split('_')[0];

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

function delete_sharing_folder(folder_id,id,who_deleted_flag, group){
	
	var answer = confirm(SHARING_CONFIRM_FOLDER_PROPERTIES);
	var after_sharing_deleted = false;
	if(answer){
		if(who_deleted_flag){
			after_sharing_deleted = true;
		}

		if(setup_ajax()!=false){
			$.ajax({
				type: "POST",
				url: "website_code/php/folderproperties/check_remove_sharing_folder.php",
				data: {
					folder_id: folder_id,
					id: id,
					group: group,
					user_deleting_self: after_sharing_deleted
				},
			})
			.done(function(owns_templates){
				do_it = true;
				if (owns_templates != "OK") {
					do_it = confirm(owns_templates);
				}
				if (do_it) {
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
					.done(function (response) {
						$('#area3').html(response);

						if (after_sharing_deleted) {
							if (typeof window_reference === "undefined") {
								window.opener.refresh_workspace();
							} else {
								window_reference.refresh_workspace();
							}

						}

						sharing_status_folder()
					});
				}
			})
		}
	}
}

//   	xmlHttp.open("post",properties_ajax_php_path + url,true);
// 	xmlHttp.onreadystatechange=properties_stateChanged;
// 	xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
