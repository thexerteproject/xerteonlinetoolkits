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

function workspace_properties_stateChanged(response, tabId){
	if(response!=""){
		$("#dynamic_area .tabPanel").empty().hide();
		
		$("#" + tabId).html(response).show();
	}
}

function workspace_properties_projects_stateChanged(response, tabId){
	if(response!=""){
		$("#sub_dynamic_area .tabPanel").empty().hide();
		
		$("#" + tabId).html(response).show();
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
		 workspace_properties_stateChanged(response, 'panelProjects');
	 });
}

 /**
	 * 
	 * Function shared templates template
 	 * This function displays the shared templates
	 */

function my_templates_template(){
	 $.ajax({
		 type: "POST",
		 url: "website_code/php/workspaceproperties/my_templates_template.php",
		 data: {
			 details: 'null'
		 }
	 })
	 .done(function(response){
		 workspace_properties_projects_stateChanged(response, 'panelMyProjects');
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
		 workspace_properties_projects_stateChanged(response, 'panelShared');
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
		 workspace_properties_projects_stateChanged(response, 'panelPublic');
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
		 workspace_properties_projects_stateChanged(response, 'panelUsage');
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
		 workspace_properties_projects_stateChanged(response, 'panelRss');
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
		workspace_properties_projects_stateChanged(response, 'panelOpen');
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
		workspace_properties_projects_stateChanged(response, 'panelPeer');
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
		workspace_properties_projects_stateChanged(response, 'panelXml');
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
		workspace_properties_stateChanged(response, 'panelProp');
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
		workspace_properties_stateChanged(response, 'panelRss');
	});
}

/**
	 * 
	 * Function import templates template
 	 * This function displays the rss options for the user and their folders
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function import_templates_template(toolkits_logon_id){
	
	var panelHtml;
	if (toolkits_logon_id) {
		panelHtml = '<h2 class="header">' + WORKSPACE_IMPORT + '</h2><div id="mainContent"><p>' + WORKSPACE_INSTRUCTIONS + '</p><form target="upload_iframe" method="post" onsubmit="javascript:iframe_check_initialise(1);" enctype="multipart/form-data" id="importpopup" name="importform" action="website_code/php/import/import.php" ><label class="block" for="templatename">' + WORKSPACE_NEW_PROJECTNAME + ':</label><input id="templatename" name="templatename" type="text" onkeyup="new_template_name()" /><div id="namewrong"></div><div><div id="filenameuploaded_container"><input name="filenameuploaded" id="filenameuploaded" type="file" /></div><button id="submitbutton" type="submit" name="submitBtn" onclick="javascript:load_button_spinner(this);" class="xerte_button"><i class="fa fa-upload"></i> ' + WORKSPACE_UPLOAD + '</button></div></form></div>';
	} else {
		panelHtml = '<h2 class="header">' + WORKSPACE_IMPORT + '</h2><div id="mainContent"><p>' + WORKSPACE_ERROR + '</p></div>';
	}
	
	workspace_properties_stateChanged(panelHtml, 'panelImport');

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
		workspace_properties_stateChanged(response, 'panelApi');
	});

}

function panelTabClicked(tab){
	$("#panelTabs button:not(#" + tab + ")").attr("aria-selected", "false");
	$("#panelTabs button:not(#" + tab + ")").removeClass("tabSelected");
	$("#panelTabs button#" + tab).attr("aria-selected", "true");
	$("#panelTabs button#" + tab).addClass("tabSelected");
}
