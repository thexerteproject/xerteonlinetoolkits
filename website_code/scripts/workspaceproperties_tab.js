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
	 * workspace properties, javascript for the workspace properties tab
	 *
	 * @author Patrick Lockley
	 * @version 1.0
	 * @package
	 */

	 /**
	 * 
	 * Function workspace ajax send prepare
 	 * This function sorts out the URL for most of the queries in the workspace properties window
	 * @param string url = the extra part of the url for this ajax query
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function workspace_ajax_send_prepare(url){

   	xmlHttp.open("post","website_code/php/workspaceproperties/" + url,true);
	xmlHttp.onreadystatechange=workspace_properties_stateChanged;
	xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	
}

 	/**
	 * 
	 * Function folders properties state changed
 	 * This function handles all of the responses from the ajax queries
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function workspace_properties_stateChanged(response){
	if(response!=""){
		document.getElementById('dynamic_area').innerHTML = response;
	}
}

 /**
	 * 
	 * Function workspace templates template
 	 * This function displays workspace properties page listing templates
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function workspace_templates_template(){
	 $.ajax({
		 type: "POST",
		 url: "website_code/php/workspaceproperties/workspace_templates_template.php",
		 data: {
			 details: 'null'
		 }
	 })
	 .done(function(response){
		 workspace_properties_stateChanged(response);
	 });
}

 /**
	 * 
	 * Function shared templates template
 	 * This function displays the shared templates
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function shared_templates_template(){
	 $.ajax({
		 type: "POST",
		 url: "website_code/php/workspaceproperties/shared_templates_template.php",
		 data: {
			 details: 'null'
		 }
	 })
	 .done(function(response){
		 workspace_properties_stateChanged(response);
	 });
}

 /**
	 * 
	 * Function shared templates template
 	 * This function displays the shared templates
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function public_templates_template(){
	 $.ajax({
		 type: "POST",
		 url: "website_code/php/workspaceproperties/public_templates_template.php",
		 data: {
			 details: 'null'
		 }
	 })
	 .done(function(response){
		 workspace_properties_stateChanged(response);
	 });
}

 /**
	 * 
	 * Function shared templates template
 	 * This function displays the shared templates
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function usage_templates_template(){
	 $.ajax({
		 type: "POST",
		 url: "website_code/php/workspaceproperties/usage_templates_template.php",
		 data: {
			 details: 'null'
		 }
	 })
	 .done(function(response){
		 workspace_properties_stateChanged(response);
	 });
}

 /**
	 * 
	 * Function rss templates template
 	 * This function displays the shared templates
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function rss_templates_template(){
	 $.ajax({
		 type: "POST",
		 url: "website_code/php/workspaceproperties/rss_templates_template.php",
		 data: {
			 details: 'null'
		 }
	 })
	 .done(function(response){
		 workspace_properties_stateChanged(response);
	 });
}

/**
	 * 
	 * Function rss templates template
 	 * This function displays the shared templates
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function syndication_templates_template(){
	$.ajax({
		type: "POST",
		url: "website_code/php/workspaceproperties/syndication_templates_template.php",
		data: {
			details: 'null'
		}
	})
	.done(function(response){
		workspace_properties_stateChanged(response);
	});
}

/**
	 * 
	 * Function peer templates template
 	 * This function displays the shared templates
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function peer_templates_template(){
	$.ajax({
		type: "POST",
		url: "website_code/php/workspaceproperties/peer_templates_template.php",
		data: {
			details: 'null'
		}
	})
	.done(function(response){
		workspace_properties_stateChanged(response);
	});
}

/**
	 * 
	 * Function xml templates template
 	 * This function displays the shared templates
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function xml_templates_template(){
	$.ajax({
		type: "POST",
		url: "website_code/php/workspaceproperties/xml_templates_template.php",
		data: {
			details: 'null'
		}
	})
	.done(function(response){
		workspace_properties_stateChanged(response);
	});
}

/**
	 * 
	 * Function my properties template
 	 * This function displays the users details
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function my_properties_template(){
	$.ajax({
		type: "POST",
		url: "website_code/php/workspaceproperties/my_properties_template.php",
		data: {
			details: 'null'
		}
	})
	.done(function(response){
		workspace_properties_stateChanged(response);
	});
}

/**
	 * 
	 * Function folder rss templates template
 	 * This function displays the rss options for the user and their folders
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function folder_rss_templates_template(){
	$.ajax({
		type: "POST",
		url: "website_code/php/workspaceproperties/folder_rss_templates_template.php",
		data: {
			details: 'null'
		}
	})
	.done(function(response){
		workspace_properties_stateChanged(response);
	});
}

/**
	 * 
	 * Function import templates template
 	 * This function displays the rss options for the user and their folders
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function import_templates_template(){

	document.getElementById("dynamic_area").innerHTML = '<p class="header"><span>' + WORKSPACE_IMPORT + '</span></p><p><form target="upload_iframe" method="post" onsubmit="javascript:iframe_check_initialise(1);" enctype="multipart/form-data" id="importpopup" name="importform" action="website_code/php/import/import.php" ><input name="filenameuploaded" type="file" /><br /><br />' + WORKSPACE_NEW_PROJECTNAME + '<br /><br /><input name="templatename" type="text" onkeyup="new_template_name()" /><br /><span id="namewrong"></span><br /><button id="submitbutton" type="submit" name="submitBtn" onclick="javascript:load_button_spinner(this);" class="xerte_button"><i class="fa fa-upload"></i> ' + WORKSPACE_UPLOAD + '</button></form></p>';

}

/**
	 * 
	 * Function API template
 	 * This function displays the API options
	 * @version 1.0
	 * @author John Smith
	 */

function api_template(){
	$.ajax({
		type: "POST",
		url: "website_code/php/workspaceproperties/api_template.php",
		data: {
			details: 'null'
		}
	})
	.done(function(response){
		workspace_properties_stateChanged(response);
	});

}
