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
	 * properties, javascript for the properties tab
	 *
	 * @author Patrick Lockley
	 * @version 1.0
	 * @package
	 */

	 /**
	 *
	 * Function properties ajax send prepare
 	 * This function sorts out the URL for most of the queries in the properties window
	 * @param string url = the extra part of the url for this ajax query
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function properties_ajax_send_prepare(url){

   	xmlHttp.open("post",properties_ajax_php_path + url,true);
	xmlHttp.onreadystatechange=properties_stateChanged;
	xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

}

	 /**
	 *
	 * Function properties state changed
 	 * This function sorts out the page display for most of the properties ajax queries
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function properties_stateChanged(response, tabId){
	if(response!=""){
		$("#dynamic_area .tabPanel").empty().hide();
		
		$("#" + tabId).html(response).show();
	}
}

/**
	 *
	 * Function publish template
 	 * This function displays the the welcome for the publish page
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function publish_template(){
	$.ajax({
		type: "POST",
		url: "website_code/php/properties/publish.php",
		data: {template_id: window.name},
	})
	.done(function(response){
		properties_stateChanged(response, 'panelProject');
	});
}

 /**
	 *
	 * Function screen size state changed
 	 * This function handles the embed code for the properties panel
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function screen_size_stateChanged(response){
	if(response!=""){
		temp = response.toString().split("~");
		document.getElementById('dynamic_area').innerHTML += "<p>" + EMBED_CODE + "</p><form><textarea rows='10' cols='40'><iframe src='http://" + site_url + "play_" + window.name +"' width='" + temp[0] + "' height='" + temp[1] + "' frameborder=\"0\"></iframe></textarea></form>";
	}
}

 /**
	 *
	 * Function share this state changed
 	 * This function handles the response from making a share request
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function share_this_stateChanged(response){
	if(response!=""){
		document.getElementById('area2').innerHTML = "";
		document.getElementById('area3').innerHTML = response;
		sharing_status_template();
	}
}

/**
 *
 * Function share this state changed
 * This function handles the response from making a share request for groups
 * @version 1.0
 * @author Patrick Lockley
 */

function group_share_this_stateChanged(response){
	if(response!=""){
		document.getElementById('area2').innerHTML = response;
		group_sharing_status_template();
	}
}


 /**
	 *
	 * Function delete share state changed
 	 * This function handles the deletion of a share
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function delete_share_stateChanged(response, after_sharing_deleted){
	sharing_status_template();

	if(after_sharing_deleted){
		if(typeof window_reference==="undefined"){
			window.opener.refresh_workspace();
		}
		else {
			window_reference.refresh_workspace();
		}
	}
}

 /**
	 *
	 * Function share rights state changed
 	 * This function handles any change to sharing status
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function share_rights_stateChanged(response){
	sharing_status_template();
}

 /**
	 *
	 * Function rename state changed
 	 * This function handles the results of a rename action
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function rename_stateChanged(response){
	if(response!=""){
		/*
		* split the two returning bits of info (the html and the new file name)
		*/

		array_response = response.split("~~**~~");
		properties_stateChanged(array_response[2], 'panelProject');
		
		/*
		* set the file name in the file_area
		*/
		if(typeof window_reference==="undefined"){
			window.opener.refresh_workspace();
		}
		else {
			window_reference.refresh_workspace();
		}
		
		//properties_stateChanged(response, 'panelProject');
	}
}

var after_sharing_deleted = false;

     /**
	 *
	 * Function delete sharing template
 	 * This function handles the deletion of a share by a user
	 * @param string template_id = window type to open
 	 * @param string id = user or group we are removing
  	 * @param string who_deleted_flag = obsolete ***** CHECK *******
     * @group bool group = if we are removing a gorup
	 * @version 1.0
	 */


function delete_sharing_template(template_id,id,who_deleted_flag, group){
	
	var answer = confirm(SHARING_CONFIRM);
	if(answer){
		if(who_deleted_flag){
			var after_sharing_deleted = true;
		}else{
			var after_sharing_deleted = true;
		}

		$.ajax({
			type: "POST",
			url: "website_code/php/properties/remove_sharing_template.php",
			data: {
				template_id: template_id,
				id: id,
				user_deleting_self: who_deleted_flag,
				group: group
			}
		})
		.done(function(response){
			delete_share_stateChanged(response, after_sharing_deleted);
		});
	}
}


/**
 *
 * Function delete sharing template
 * This function handles the deletion of a share by a user
 * @param string template_id = window type to open
 * @param string group_id = group we are removing
 * @version 1.0
 * @author Patrick Lockley
 */

function group_delete_sharing_template(template_id,group_id){

	var answer = confirm(SHARING_CONFIRM);

	if(answer){
		$.ajax({
			type: "POST",
			url: "website_code/php/properties/group_remove_sharing_template.php",
			data: {
				template_id: template_id,
				group_id: group_id
			}
		})
		.done(function(response){
			group_sharing_status_template(response);
		});
	}
}

     /**
	 *
	 * Function syndication template
 	 * This function displays a templates syndication options
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function syndication_template() {
	 $.ajax({
		 type: "POST",
		 url: "website_code/php/properties/syndication_template.php",
		 data: {
			 tutorial_id: window.name
		 }
	 })
	 .done(function (response) {
		if (response!="") {
			properties_stateChanged(response, 'panelSyn');
		}
	 });
 }

 /**
 *
 * Function syndication change template
 * This function handles the setting of syndication settings being changed
 * @version 1.0
 * @author Patrick Lockley
 */

function syndication_change_template(){

	var synd = $('#syndon').prop('checked');
	var category_value = $('#category_list').find(":selected").val();
	var license_value = $('#license_list').find(":selected").val();
	var description = $('#description').val();
	var keywords = $('#keywords').val();

	$.ajax({
		type: "POST",
		url: "website_code/php/properties/syndication_change_template.php",
		data: {
			tutorial_id: window.name,
			synd: synd,
			description: description,
			keywords: keywords,
			category_value: category_value,
			license_value:license_value
		}
	})
	.done(function (response) {
		properties_stateChanged(response, 'panelSyn');
	});
}

 /**
 *
 * Function rss template
 * This function handles the setting of RSS templates
 * @version 1.0
 * @author Patrick Lockley
 */

function rss_template(){
	 $.ajax({
		 type: "POST",
		 url: "website_code/php/properties/rss_template.php",
		 data: {
			 tutorial_id: window.name
		 }
	 })
	 .done(function (response) {
		if (response!="") {
			properties_stateChanged(response, 'panelRss');
		}
	 });
}

 /**
 *
 * Function rss state changed
 * This function handles the response from the ajax query
 * @version 1.0
 * @author Patrick Lockley
 */

function rss_stateChanged(response){
	if(response!=""){
		document.getElementById('panelRss').innerHTML=response;
	}
}

 /**
 *
 * Function screen size template
 * This function gets a templates screen sizes
 * @version 1.0
 * @author Patrick Lockley
 */

function screen_size_template(){
	$.ajax({
		type: "POST",
		url: "website_code/php/properties/screen_size_template.php",
		data: {
			tutorial_id: window.name
		}
	})
	.done(function (response) {
		screen_size_stateChanged(response);
	});
}

 /**
 *
 * Function peer template
 * This function handles the display of the templates peer review properties
 * @version 1.0
 * @author Patrick Lockley
*/

function peer_template(){
	
	 $.ajax({
		 type: "POST",
		 url: "website_code/php/properties/peer_template.php",
		 data: {
			 template_id: window.name
		 }
	 })
	 .done(function (response) {
		 properties_stateChanged(response, 'panelPeer');
	 });
}

     /**
	 *
	 * Function peer tick toggle
 	 * This function handles the ticking and unticking on the peer review page
	 * @param string tag = the id of the image we are changing
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function peer_tick_toggle(tag){

	if(tag=="peeron"){

		document.getElementById("peeron").src = "website_code/images/TickBoxOn.gif";
		document.getElementById("peeroff").src = "website_code/images/TickBoxOff.gif";

	}else{

		document.getElementById("peeron").src = "website_code/images/TickBoxOff.gif";
		document.getElementById("peeroff").src = "website_code/images/TickBoxOn.gif";

	}

}

     /**
	 *
	 * Function peer change template
 	 * This function handles the creation of peer review
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function peer_change_template(){
	var peeron = $('#peeron').prop('checked') ? 'on' : 'off';
	var pswd = peeron == 'on' ? ($('#password').val() != '' ? $('#password').val() : '') : '';
	var email = pswd != '' ? ($('#retouremail').val() != '' ? ',' + $('#retouremail').val() : '') : '';

	if (peeron == 'on' && pswd == ''){
		
		alert(PASSWORD_REMINDER);
		
	} else {
		$.ajax({
			type: "POST",
			url: "website_code/php/properties/peer_change_template.php",
			data: {
				template_id: window.name,
				peer_status: peeron,
				extra: pswd + email
			}
		})
		.done(function (response) {
			properties_stateChanged(response, 'panelPeer');
		});

	}
}

     /**
	 *
	 * Function rss change template
 	 * This function handles the changing of an RSS entry in the database
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function rss_change_template(){
	
	var rssing = $('#rsson').prop('checked'),
		exporting = $('#exporton').prop('checked'),
		desc = document.getElementById("desc").value;

	 $.ajax({
		 type: "POST",
		 url: "website_code/php/properties/rss_change_template.php",
		 data: {
			 template_id: window.name,
			 rss: rssing,
			 export: exporting,
			 desc: desc
		 }
	 })
	 .done(function (response) {
		 properties_stateChanged(response, 'panelRss');
	 });
}

     /**
	 *
	 * Function xml template
 	 * This function handles the display of the templates XML sharing settings
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function xml_template(){
	 $.ajax({
		 type: "POST",
		 url: "website_code/php/properties/xml_template.php",
		 data: {
			 template_id: window.name
		 }
	 })
	 .done(function (response) {
		 properties_stateChanged(response, 'panelRss');
	 });
}

     /**
	 *
	 * Function xml tick toggle
 	 * This function handles the ticking and unticking on the XML sharing page
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function xml_tick_toggle(tag){

	if(tag=="xmlon"){

		document.getElementById("xmlon").src = "website_code/images/TickBoxOn.gif";
		document.getElementById("xmloff").src = "website_code/images/TickBoxOff.gif";

	}else{

		document.getElementById("xmlon").src = "website_code/images/TickBoxOff.gif";
		document.getElementById("xmloff").src = "website_code/images/TickBoxOn.gif";

	}

}



     /**
	 *
	 * Function xml change template
 	 * This function handles creation of an XML sharing record
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function xml_change_template(){

	var xmlon = $('#xmlon').prop('checked') ? 'on' : 'off';
	var address = xmlon == 'on' ? ($('#sitename').val() != '' ? $('#sitename').val() : 'null') : 'null';

	$.ajax({
		type: "POST",
		url: "website_code/php/properties/xml_change_template.php",
		data: {
			template_id: window.name,
			xml_status: xmlon,
			address: address
		}
	})
	.done(function (response) {
		properties_stateChanged(response, 'panelXml');
	});
}

     /**
	 *
	 * Function properties template
 	 * This function handles the display of the default properties page
	 * @version 1.0
	 * @author Patrick Lockley
	 */


function properties_template(){
	 $.ajax({
		 type: "POST",
		 url: "website_code/php/properties/properties_template.php",
		 data: {
			 template_id: window.name
		 }
	 })
	 .done(function (response) {
		 properties_stateChanged(response, 'panelProject');
	 });
}

function default_engine_toggle(type)
{
	$.ajax({
		type: "POST",
		url: "website_code/php/properties/properties_default_engine.php",
		data: {
			template_id: window.name,
			engine: $('input[name="engine"]:checked').attr('id'),
			page:'properties'
		}
	})
	.done(function (response) {
		properties_stateChanged(response, 'panelProject');
	});
}

function publish_engine_toggle(tag, engine1, engine2)
{
	var engine = engine1;
	if(document.getElementById(tag).src.indexOf("TickBoxOn.gif") >0 )
	{
		engine = engine2;
	}
	$.ajax({
		type: "POST",
		url: "website_code/php/properties/properties_default_engine.php",
		data: {
			template_id: window.name,
			engine: engine,
			page:'publish'
		}
	})
	.done(function (response) {
		properties_stateChanged(response, 'panelProject');
	});
}

 /**
 *
 * Function name template ********** OBSOLETE ***************
 * This function handles the deletion of a share by a user
 * @param string template_id = window type to open
 * @param string user_id = user we are removing
 * @param string who_deleted_flag = obsolete ***** CHECK ******
 * @version 1.0
 * @author Patrick Lockley
 */

function name_template(){
	 $.ajax({
		 type: "POST",
		 url: "website_code/php/properties/name_template.php",
		 data: {
			 template_id: window.name
		 }
	 })
	 .done(function (response) {
		 properties_stateChanged(response, 'panelProject');
	 });
}

     /**
	 *
	 * Function notes template
 	 * This function handles the display of a templates notes
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function notes_template(){
	 $.ajax({
		 type: "POST",
		 url: "website_code/php/properties/notes_template.php",
		 data: {
			 template_id: window.name
		 }
	 })
	 .done(function (response) {
		 properties_stateChanged(response, 'panelNotes');
	 });
}

     /**
	 *
	 * Function change notes
 	 * This function handles the changing of notes on a template
 	 * @param string template_id = id of the template
 	 * @param string form_tag - the form to get the value from
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function change_notes(template_id, form_tag){
	var i = document.getElementById(form_tag).childNodes[0].nodeName.toLowerCase() == 'textarea' ? 0 : 1;
	new_notes = document.getElementById(form_tag).childNodes[i].value;

	$.ajax({
		type: "POST",
		url: "website_code/php/properties/notes_change_template.php",
		data: {
			template_id: template_id,
			notes: new_notes
		}
	})
	.done(function (response) {
		properties_stateChanged(response, 'panelNotes');
	});
}

/**
 *
 * Function to delete all unused files
 *
 */

function delete_unused_files(delete_path, delete_string){
	if (delete_string.length <= 0){
		confirm(DELETE_UNUSED_FILES_EMPTY);
	} else {
		var answer = confirm(DELETE_UNUSED_FILES_CONFIRM);
		if (answer) {
			delete_unused_files_ajax(delete_path, delete_string);
		}
	}
}

/**
 *
 * Function delete unused files
 * This function handles the changing of notes on a template
 * @param string file = id of the file to delete
 * @version 1.0
 * @author Timo Boer
 */

function delete_unused_files_ajax(delete_path, delete_string){

	var files = new Array()
	const delete_files = JSON.parse(atob(delete_string));

	for (let i = 0; i < delete_files.length; i++) {
		files.push(encodeURIComponent(delete_path + delete_files[i]));
	}
	files = btoa(JSON.stringify(files));
	$.ajax({
		type: "POST",
		url: "website_code/php/properties/delete_unused_files_template.php",
		data: {
			data: files
		}
	})
		.done(function (response) {
			delete_file_stateChanged(response);
		});

}

     /**
	 *
	 * Function delete file
 	 * This function handles the changing of notes on a template
 	 * @param string file = id of the file to delete
	  * @param boolean answer = false, set to true to skip confirmation
	 * @version 1.1
	 * @author Timo Boer
	 */

function delete_file(file, answer = false){
	if (!answer) {
		answer = confirm(DELETE_FILE_CONFIRM);
	}
	if(answer){
		$.ajax({
			type: "POST",
			url: "website_code/php/properties/delete_file_template.php",
			data: {
				file: encodeURIComponent(file)
			}
		})
		.done(function (response) {
			delete_file_stateChanged(response);
		});
	}
}

     /**
	 *
	 * Function delete file state changed
 	 * This function refreshes the file list when a file is deleted
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function delete_file_stateChanged(response){
	media_and_quota_template();
}

     /**
	 *
	 * Function media and quota template
 	 * This function handles the display of the media and quota for a file
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function media_and_quota_template(){
	 $.ajax({
		 type: "POST",
		 url: "website_code/php/properties/media_and_quota_template.php",
		 data: {
			 template_id: window.name
		 }
	 })
	 .done(function (response) {
		 properties_stateChanged(response, 'panelMedia');
	 });
}

     /**
	 *
	 * Function rename_template
 	 * This function handles the the renaming of a template
 	 * @param string template_id = id of the template
 	 * @param string form_tag - the form to get the value from
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function rename_template(template_id,form_tag){

	new_name = document.getElementById(form_tag).childNodes[1].value;

	if(is_ok_name(new_name)){
		$.ajax({
			type: "POST",
			url: "website_code/php/properties/rename_template.php",
			data: {
				template_id: template_id,
				template_name: new_name
			}
		})
		.done(function (response) {
			rename_stateChanged(response);
		});
	}else{
		alert(PROPERTIES_NAME_FAIL);
	}
}

     /**
	 *
	 * Function access template
 	 * This function handles the display of the access settings for a template
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function access_template(){
	 $.ajax({
		 type: "POST",
		 url: "website_code/php/properties/access_template.php",
		 data: {
			 template_id: window.name
		 }
	 })
	 .done(function (response) {
		 properties_stateChanged(response, 'panelAccess');
	 });
}

     /**
	 *
	 * Function access change template
 	 * This function handles the changing of an access settings for a template
 	 * @param string template_id = id of the template
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function access_change_template(template_id){
	
	var access_value = $('#security_list').find('input:checked').attr('value');

	if(access_value=="Other"&&document.getElementById('url').value==""){

		alert(ACCESS_RESTRICT);

	}else{
		if(access_value=="Other") {
			var data = {
				template_id: template_id,
				access: access_value,
				server_string: document.getElementById('url').value
			};
		} else if (access_value=="PasswordPlay") {
			var pwd = document.getElementById('pwd').value;;
			if (pwd == null || pwd == "") {
				alert(PASSWORD_REMINDER);
				return;
			}
			var data = {
				template_id: template_id,
				access: access_value,
				password: document.getElementById('pwd').value
			};
		} else {
			var data = {
				template_id: template_id,
				access: access_value
			}
		}
		$.ajax({
			type: "POST",
			url: "website_code/php/properties/access_change_template.php",
			data: data
		})
		.done(function (response) {
			properties_stateChanged(response, 'panelAccess');
		});
	}
}

     /**
	 *
	 * Function access tick toggle
 	 * This function handles the ticking and unticking of images on the access page
 	 * @param string imagepath - path to the image we've ticked
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function access_tick_toggle(imagepath){

	path = site_url;

	z = document.getElementById('security_list').childNodes.length;

	x=0;

	while(x!=z){

		if(document.getElementById('security_list').childNodes[x].id!=""){

			if(document.getElementById('security_list').childNodes[x].childNodes[0].src== path + "website_code/images/TickBoxOn.gif"){

				document.getElementById('security_list').childNodes[x].childNodes[0].src = path + "website_code/images/TickBoxOff.gif";

			}

		}

		x++;

	}

	imagepath.src = path + "website_code/images/TickBoxOn.gif";

}

     /**
	 *
	 * Function gift state changed
 	 * This function handles the display of the gift settings for this template
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function gift_stateChanged(response){
	
	document.getElementById('area3').innerHTML = response;

	if(typeof window_reference==="undefined"){
		window.opener.refresh_workspace();
	}
	else {
		window_reference.refresh_workspace();
	}
}

     /**
	 *
	 * Function gift this template
 	 * This function handles the gifting of a template
 	 * @param string tutorial_id = id of the template
 	 * @param string user_id - the user to give it to
  	 * @param string action - whether to give a copy or give this version
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function gift_this_template(tutorial_id, user_id, action){
	
	 $.ajax({
		 type: "POST",
		 url: "website_code/php/properties/gift_this_template.php",
		 data: {
		 	tutorial_id: tutorial_id,
			 user_id: user_id,
			 action: action
		 }
	 })
	 .done(function (response) {
		 gift_stateChanged(response);
	 });
}


     /**
	 *
	 * Function name select gift template
 	 * This function handles the display of names for people we may wish to gift this too
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function name_select_gift_template(){
	
	if(setup_ajax()!=false){

		search_string = document.getElementById('searcharea').value;

		if(search_string==""){
			document.getElementById('area2').innerHTML="<p>Names will appear here</p>";
			document.getElementById('area3').innerHTML="";
		}

		if(is_ok_user(search_string)){
			$.ajax({
				type: "POST",
				url: "website_code/php/properties/name_select_gift_template.php",
				data: {
					search_string: search_string,
					template_id: window.name
				}
			})
			.done(function (response) {
				$('#area2').html(response);
				$('#area3').html("");
			});
		}else{

			$('#area2').html("<p>" + SEARCH_FAIL + "</p>");
			$('#area3').html("");
		}
	}
}

     /**
	 *
	 * Function name select template
 	 * This function handles the selecting of a name
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function name_select_template(){
	if(setup_ajax()!=false){

		search_string = document.getElementById('searcharea').value;

		if(search_string==""){
			document.getElementById('area2').innerHTML="<p>" + NAMES_APPEAR + "</p>";
		}

		if(is_ok_user(search_string)){
			$.ajax({
				type: "POST",
				url: "website_code/php/properties/name_select_template.php",
				data: {
					search_string : search_string,
					template_id: window.name
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

     /**
	 *
	 * Function gift template
 	 * This function handles the display to allow for the gifting of a template
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function gift_template(){
	 $.ajax({
		 type: "POST",
		 url: "website_code/php/properties/gift_template.php",
		 data: {
			 template_id: window.name
		 }
	 })
	 .done(function (response) {
		 properties_stateChanged(response, 'panelGive');
	 });
}

     /**
	 *
	 * Function share this template
 	 * This function handles the sharing of a template
 	 * @param string template = id of the template
 	 * @param string user - the user to give it to
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function share_this_template(template, id, group=false){

	 if(setup_ajax()!=false){
		 var role = document.querySelector('input[name="role"]:checked').value;

		 $.ajax({
			 type: "POST",
			 url: "website_code/php/properties/share_this_template.php",
			 data: {
				 template_id: template,
				 id: id,
				 role: role,
				 group: group,
			 },
		 })
		 .done(function(response){
			 $('#area2').html("");
			 $('#area3').html(response);
			 sharing_status_template()
		 });
	 }
}

     /**
	 *
	 * Function sharing statud template
 	 * This function handles the display of the current sharing status
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function sharing_status_template(){
	 $.ajax({
		 type: "POST",
		 url: "website_code/php/properties/sharing_status_template.php",
		 data: {
			 template_id: window.name,
		 }
	 })
	 .done(function (response) {
		 properties_stateChanged(response, 'panelShare');
	 });
}

	/**
	 *
	 * Function group sharing status template
	 * This function handles the display of the current sharing status for groups
	 * @version 1.0
	 * @author Noud Liefrink
	 */

function group_sharing_status_template(){
	$.ajax({
		type: "POST",
		url: "website_code/php/properties/group_sharing_status_template.php",
		data: {
			template_id: window.name,
		}
	})
	.done(function (response) {
		properties_stateChanged(response, 'panelShare');
	});
}

	/**
	 *
	 * Function share this template with a group
	 * This function handles the sharing of a template of a group
	 * @param string template = id of the template
	 * @version 1.0
	 * @author Noud Liefrink
	 */

function group_share_this_template(template){
	var group_id = $('#group').val();
	$.ajax({
		type: "POST",
		url: "website_code/php/properties/group_share_this_template.php",
		data: {
			template_id: template,
			group_id: group_id
		}
	})
	.done(function (response) {
		group_share_this_stateChanged(response);
	});
}

 /**
 *
 * Function export template
 * This function handles the display of the export page for a template
 * @version 1.0
 * @author Patrick Lockley
 */

function export_template(){
	 $.ajax({
		 type: "POST",
		 url: "website_code/php/properties/export_template.php",
		 data: {
			 template_id: window.name
		 }
	 })
	 .done(function (response) {
		properties_stateChanged(response, 'panelExport');
	 });
}

function tsugi_template(){
	$.ajax({
		type: "POST",
		url: "website_code/php/properties/tsugi_template.php",
		data: {
			template_id: window.name
		}
	})
	.done(function (response) {
		properties_stateChanged(response, 'panelLti');
		showOptions();
	});
}

function showOptions() {
    if ($('#pubChk').attr('checked'))
    {
        $('#publish').show();
        if ($('#xChk').attr('checked'))
        {
            $('#xApi').show();
        }
        else{
            $('#xApi').hide();
		}

    }
    else
	{
        $('#publish').hide();
	}
    $('#xApi').show();
    $('#publish').show();
}

     /**
	 *
	 * Function set sharing rights
 	 * This function handles the gifting of a template
 	 * @param string rights = the rights to give
 	 * @param string template - the template
  	 * @param string user - the user id
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function set_sharing_rights_template(template, id, group){
	
	var idPrefix = group == true ? 'groupRole' : 'role';
	var role = document.getElementById(idPrefix + '_' + id).value.split('_')[0];

	 if(setup_ajax()!=false){
		 $.ajax({
			 type: "POST",
			 url: "website_code/php/properties/set_sharing_rights_template.php",
			 data: {
				 template_id: template,
				 id: id,
				 role: role,
				 group: group,
			 },
		 })
			 .done(function(response){
				 $('#area3').html(response);
				 sharing_status_template()
			 });
	 }
}

     /**
	 *
	 * Function tab highlight
 	 * This function handles the highlighting of tabs on the properties window
 	 * @param string id = id of the tab to highlight
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function tabClicked(tab){
	
	$("#tabs button:not(#" + tab + ")").attr("aria-selected", "false");
	$("#tabs button:not(#" + tab + ")").removeClass("tabSelected");
	$("#tabs button#" + tab).attr("aria-selected", "true");
	$("#tabs button#" + tab).addClass("tabSelected");

}

function property_tab_download(id,html5_tag, flash_tag, url)
{
    var ifrm = document.getElementById(id);
    var export_html5_engine="";
    var export_flash_engine="";
	
	if ($('input[name="exportEngine"]:checked').length > 0) {
		if (html5_tag.length>0) {
			export_html5_engine = $('input[name="exportEngine"]:checked').attr('id') == html5_tag;
		}
		if(flash_tag.length>0) {
			
			export_flash_engine = $('input[name="exportEngine"]:checked').attr('id') == flash_tag;
		}
	}
	
	var urlparams = url.indexOf('?') !== false;
	ifrm.src = url + (urlparams ? '&' : '?') + 'html5='+export_html5_engine+'&flash='+export_flash_engine;
}


function property_tab_file_download(id, url)
{
    var ifrm = document.getElementById(id);
    ifrm.src = url;
}

function setup_download_link(path, buttonlbl, file)
{
	var lbContents = "<textarea name='linktext' id='linktext' readonly='' rows='3' cols='80' onfocus='this.select()' class='indent'>" + path + "</textarea>";
	lbContents += "<p style='margin:0px; padding:0px; margin-left:10px;' id='download_link'>";
	lbContents += "<button type='button' class='xerte_button' onclick='property_tab_file_download(\"download_frame\", \"getfile.php?file=" + file + "\")'><i class='fa fa-download'></i> " + buttonlbl +  "</button>";
	lbContents += "</p>";
	$.featherlight($(lbContents));
}


function lti_update(id) {
	$.ajax({
		type: "POST",
		url: "website_code/php/properties/lti_update.php",
		data: {
			template_id: id,
			tsugi_published: $("#pubChk").prop('checked'),
			tsugi_useglobal: $("[name=tsugi_useglobal]").prop('checked'),
			tsugi_privateonly: $("#tsugi_useprivateonly").prop('checked'),
			tsugi_title: $("[name=tsugi_title]").val(),
			tsugi_key: $("[name=tsugi_key]").val(),
			tsugi_secret: $("[name=tsugi_secret]").val(),
			tsugi_xapi: $("#xChk").prop('checked'),
			tsugi_xapi_useglobal: $("#tsugi_xapi_useglobal").prop('checked'),
			tsugi_xapi_endpoint: $("[name=tsugi_xapi_endpoint]").val(),
			tsugi_xapi_username: $("[name=tsugi_xapi_username]").val(),
			tsugi_xapi_password: $("[name=tsugi_xapi_password]").val(),
			dashboard_urls: $("[name=dashboard_urls]").val(),
			tsugi_xapi_student_id_mode: $("[name=tsugi_xapi_student_id_mode]").val(),
			tsugi_publish_in_store: $("[name=tsugi_publish_in_store]").prop('checked'),
			tsugi_publish_dashboard_in_store: $("[name=tsugi_publish_dashboard_in_store]").prop('checked')
		}
	})
	.done(function (response) {
		document.getElementById('panelLti').innerHTML = response;
		showOptions();
	});
}

function xapi_toggle_useglobal(lti_def_str)
{
	var useglobal = $("#tsugi_xapi_useglobal").prop('checked');
	if (useglobal) {
		$("#tsugi_xapi_endpoint").val("").prop('disabled', true);
		$("#endpoint").addClass('disabled');
		$("#tsugi_xapi_username").val("").prop('disabled', true);
		$("#username").addClass('disabled');
		$("#tsugi_xapi_password").val("").prop('disabled', true);
		$("#password").addClass('disabled');
	} else {
		$("#tsugi_xapi_endpoint").val("").prop('disabled', false);
		$("#endpoint").removeClass('disabled');
		$("#tsugi_xapi_username").val("").prop('disabled', false);
		$("#username").removeClass('disabled');
		$("#tsugi_xapi_password").val("").prop('disabled', false);
		$("#password").removeClass('disabled');
	}
}

function tsugi_toggle_tsugi_publish(lti_def_str)
{
	var published = $("#pubChk").prop('checked');
	var xapi = $("#xChk").prop('checked');
	var useglobal = $("#tsugi_useglobal").prop('checked');
	var lti_def = JSON.parse(lti_def_str);
	if (published) {
		$("#publish").removeClass("disabled");
		$("#publish input").prop("disabled", false);
		if (useglobal) {
			$("#tsugi_useprivateonly").prop('disabled', true);
			$("label[for=tsugi_useprivateonly]").addClass("disabled");
			$("#tsugi_title").val("").prop('disabled', true);
			$("#tsugi_key").val("").prop('disabled', true);
			$("label[for=tsugi_key]").addClass("disabled");
			$("#tsugi_secret").val("").prop('disabled', true);
			$("label[for=tsugi_secret]").addClass("disabled");
		}
		else
		{
			$("#tsugi_useprivateonly").prop('disabled', false);
			$("label[for=tsugi_useprivateonly]").removeClass("disabled");
			$("#tsugi_title").val(lti_def['title']).prop('disabled', false);
			$("#tsugi_key").val(lti_def['key']).prop('disabled', false);
			$("label[for=tsugi_key]").removeClass("disabled");
			$("#tsugi_secret").val(lti_def['secret']).prop('disabled', false);
			$("label[for=tsugi_secret]").removeClass("disabled");
		}
	}
	else {
		$("#publish").addClass("disabled");
		$("#publish input").prop("disabled", true);
	}
	// Set state of publish in dashboard
	if (published && xapi) {
		$("#tsugi_publish_dashboard_in_store").prop('disabled', false);
		$("label[for=tsugi_publish_dashboard_in_store]").prop('disabled', false);
		$("#xApi_dashboard").removeClass("disabled");
	}
	else
	{
		$("#tsugi_publish_dashboard_in_store").prop('disabled', true);
		$("label[for=tsugi_publish_dashboard_in_store]").prop('disabled', true);
		$("#xApi_dashboard").addClass("disabled");
	}
}

function tsugi_toggle_usexapi(lti_def_str)
{
	var xapi = $("#xChk").prop('checked');
	var published = $("#pubChk").prop('checked');
	var useglobal = $("#tsugi_xapi_useglobal").prop('checked');
	var lti_def = JSON.parse(lti_def_str);

	if (xapi) {
		$("#xApi, #xAPI_enabled, #studentid").removeClass("disabled");
		$("#xAPI_enabled input, #xAPI_enabled select").prop("disabled", false);
		if (useglobal) {
			$("#tsugi_xapi_endpoint").val("").prop('disabled', true);
			$("#endpoint").addClass('disabled');
			$("#tsugi_xapi_username").val("").prop('disabled', true);
			$("#username").addClass('disabled');
			$("#tsugi_xapi_password").val("").prop('disabled', true);
			$("#password").addClass('disabled');
		} else {
			$("#tsugi_xapi_endpoint").val("").prop('disabled', false);
			$("#endpoint").removeClass('disabled');
			$("#tsugi_xapi_username").val("").prop('disabled', false);
			$("#username").removeClass('disabled');
			$("#tsugi_xapi_password").val("").prop('disabled', false);
			$("#password").removeClass('disabled');
		}
	}
	else {
		$("#xApi, #xAPI_enabled, #studentid").addClass("disabled");
		$("#xAPI_enabled input, #xAPI_enabled select").prop("disabled", true);
		// ** should some of the 
	}
	// Set state of publish in dashboard
	if (published && xapi) {
		$("#tsugi_publish_dashboard_in_store").prop('disabled', false);
		$("label[for=tsugi_publish_dashboard_in_store]").prop('disabled', false);
		$("#xApi_dashboard").removeClass("disabled");
	}
	else
	{
		$("#tsugi_publish_dashboard_in_store").prop('disabled', true);
		$("label[for=tsugi_publish_dashboard_in_store]").prop('disabled', true);
		$("#xApi_dashboard").addClass("disabled");
	}
}

function tsugi_toggle_useglobal(lti_def_str)
{
	var useglobal = $("#tsugi_useglobal").prop('checked');
	var lti_def = JSON.parse(lti_def_str);
	if (useglobal) {
		$("#tsugi_useprivateonly").prop('disabled', true);
		$("label[for=tsugi_useprivateonly]").addClass("disabled");
		$("#tsugi_title").val("").prop('disabled', true);
		$("#tsugi_key").val("").prop('disabled', true);
		$("label[for=tsugi_key]").addClass("disabled");
		$("#tsugi_secret").val("").prop('disabled', true);
		$("label[for=tsugi_secret]").addClass("disabled");
	}
	else
	{
		$("#tsugi_useprivateonly").prop('disabled', false);
		$("label[for=tsugi_useprivateonly]").removeClass("disabled");
		$("#tsugi_title").val(lti_def['title']).prop('disabled', false);
		$("#tsugi_key").val(lti_def['key']).prop('disabled', false);
		$("label[for=tsugi_key]").removeClass("disabled");
		$("#tsugi_secret").val(lti_def['secret']).prop('disabled', false);
		$("label[for=tsugi_secret]").removeClass("disabled");
	}
}

