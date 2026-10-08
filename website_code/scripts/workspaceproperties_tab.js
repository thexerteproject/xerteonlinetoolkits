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

	// Debug: console.warn('workspace_ajax_send_prepare is obsolete');
}

function workspacePropsApiBase() {
	return (typeof rest_api_url !== 'undefined' && rest_api_url) ? rest_api_url : 'website_code/api/v1/index.php';
}

function workspacePropsApiUrl(route) {
	return workspacePropsApiBase() + '?route=' + encodeURIComponent(route);
}

function escapeHtml(s) {
	if (s === null || s === undefined) return '';
	return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function wsSetPanelHtml(tabId, html, inSubArea) {
	if (html === '' || html === null || html === undefined) return;
	if (inSubArea) {
		$("#sub_dynamic_area .tabPanel").empty().hide();
		$("#" + tabId).html(html).show();
		return;
	}
	$("#dynamic_area .tabPanel").empty().hide();
	$("#" + tabId).html(html).show();
}

function wsApiGet(route, data, onOk, onFail) {
	return $.ajax({
		type: 'GET',
		url: workspacePropsApiUrl(route),
		data: data || {},
		dataType: 'json'
	}).done(function (res) {
		if (!res || !res.ok) {
			if (onFail) onFail(res);
			return;
		}
		if (onOk) onOk(res.data);
	}).fail(function (xhr) {
		if (onFail) onFail(null);
	});
}

function renderProjectsMenu(d) {
	var h = '<h2 class="header">' + escapeHtml((d && d.tabs && d.tabs.length) ? d.tabs[0].label : '') + '</h2>';
	h = '<h2 class="header">' + escapeHtml((typeof WORKSPACE_LIBRARY_MY !== 'undefined') ? WORKSPACE_LIBRARY_MY : 'Projects') + '</h2>';
	h += '<div id="mainContent">';
	h += '<div id="panelTabs" role="tabList" class="menu_holder">';
	for (var i = 0; i < d.tabs.length; i++) {
		var t = d.tabs[i];
		var tabId = 'tab_' + t.id;
		var panelId = 'panel_' + t.id;
		var sel = (t.id === d.defaultTab);
		h += '<button id="' + tabId + '" type="button" role="tab" aria-controls="' + panelId + '" aria-selected="' + (sel ? 'true' : 'false') + '" class="menu_button' + (sel ? ' tabSelected' : '') + '" onclick="javascript:wsProjectsTabClick(\'' + t.id + '\'); panelTabClicked(\'' + tabId + '\');">' + escapeHtml(t.label) + '</button>';
	}
	h += '</div>';
	h += '<div id="sub_dynamic_area">';
	for (var j = 0; j < d.tabs.length; j++) {
		var tt = d.tabs[j];
		h += '<div id="panel_' + tt.id + '" class="tabPanel" role="tabpanel" aria-labelledby="tab_' + tt.id + '"></div>';
	}
	h += '</div></div>';
	return h;
}

function renderProjectsTable(d) {
	var h = '<table class="workspaceProjectsTable">';
	if (d.caption) {
		h += '<caption>' + escapeHtml(d.caption) + '</caption>';
	}
	h += '<tr>';
	for (var ci = 0; ci < d.columns.length; ci++) {
		var c = d.columns[ci];
		h += '<th' + (c.narrow ? ' class="narrow"' : '') + '>' + escapeHtml(c.label) + '</th>';
	}
	h += '</tr>';
	for (var i = 0; i < d.items.length; i++) {
		var it = d.items[i];
		h += '<tr>';
		for (var cj = 0; cj < d.columns.length; cj++) {
			var col = d.columns[cj];
			var val = it[col.id];
			if (col.id === 'name') {
				var url = it.previewUrl || it.playUrl || it.peerUrl || null;
				if (url) {
					h += '<td><a href="' + escapeHtml(url) + '" target="_blank">' + escapeHtml(val) + (d.i18n && d.i18n.linkWindow ? '<span class="sr-only">(' + escapeHtml(d.i18n.linkWindow) + ')</span>' : '') + '</a></td>';
				} else {
					h += '<td>' + escapeHtml(val) + '</td>';
				}
			} else if (col.icon) {
				var on = !!val;
				h += '<td class="iconCell">' + (on ? '<i class="fa fa-check"></i>' : '<i class="fa fa-times"></i>') + '<span class="sr-only">' + escapeHtml(on ? (d.i18n && d.i18n.on ? d.i18n.on : 'on') : (d.i18n && d.i18n.off ? d.i18n.off : 'off')) + '</span></td>';
			} else if (col.id === 'password' && it.password) {
				h += '<td>' + escapeHtml(it.password) + (d.i18n && d.i18n.copy ? '<button class="copyBtn" data-copy-value="' + escapeHtml(it.password) + '" onclick="navigator.clipboard.writeText(this.dataset.copyValue);" title="' + escapeHtml(d.i18n.copy) + '"><i class="fa fa-copy"></i><span class="sr-only">' + escapeHtml(d.i18n.copy) + '</span></button>' : '') + '</td>';
			} else {
				h += '<td>' + escapeHtml(val === null || val === undefined ? '' : val) + '</td>';
			}
		}
		h += '</tr>';
	}
	h += '</table>';
	return h;
}

function wsProjectsTabClick(tab) {
	switch (tab) {
		case 'my': return my_templates_template();
		case 'shared': return shared_templates_template();
		case 'public': return public_templates_template();
		case 'usage': return usage_templates_template();
		case 'peer': return peer_templates_template();
		case 'rss': return rss_templates_template();
		case 'xml': return xml_templates_template();
		case 'open': return syndication_templates_template();
	}
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
	wsApiGet('workspaceproperties/projects/menu', {}, function (d) {
		wsSetPanelHtml('panelProjects', renderProjectsMenu(d), false);
		wsProjectsTabClick(d.defaultTab || 'my');
	}, function () {});
}

 /**
	 * 
	 * Function shared templates template
 	 * This function displays the shared templates
	 */

function my_templates_template(){
	wsApiGet('workspaceproperties/projects/my', {}, function (d) {
		wsSetPanelHtml('panel_my', renderProjectsTable(d), true);
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
	wsApiGet('workspaceproperties/projects/shared', {}, function (d) {
		wsSetPanelHtml('panel_shared', renderProjectsTable(d), true);
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
	wsApiGet('workspaceproperties/projects/public', {}, function (d) {
		wsSetPanelHtml('panel_public', renderProjectsTable(d), true);
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
	wsApiGet('workspaceproperties/projects/usage', {}, function (d) {
		wsSetPanelHtml('panel_usage', renderProjectsTable(d), true);
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
	wsApiGet('workspaceproperties/projects/rss', {}, function (d) {
		wsSetPanelHtml('panel_rss', renderProjectsTable(d), true);
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
	wsApiGet('workspaceproperties/projects/open', {}, function (d) {
		wsSetPanelHtml('panel_open', renderProjectsTable(d), true);
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
	wsApiGet('workspaceproperties/projects/peer', {}, function (d) {
		wsSetPanelHtml('panel_peer', renderProjectsTable(d), true);
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
	wsApiGet('workspaceproperties/projects/xml', {}, function (d) {
		wsSetPanelHtml('panel_xml', renderProjectsTable(d), true);
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
	wsApiGet('workspaceproperties/my-properties', {}, function (d) {
		var h = '<h2 class="header">' + escapeHtml(d.heading) + '</h2><div id="mainContent">';
		h += '<p>' + escapeHtml(d.i18n.nameLabel) + ': ' + escapeHtml(d.user.name) + '</p>';
		h += '<p>' + escapeHtml(d.i18n.usernameLabel) + ': ' + escapeHtml(d.user.username) + '</p>';
		h += '<p>' + escapeHtml(d.i18n.lastLoginLabel) + ': ' + escapeHtml(d.user.lastLogin) + '</p>';
		h += '</div>';
		wsSetPanelHtml('panelProp', h, false);
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
	wsApiGet('workspaceproperties/folder-rss', {}, function (d) {
		var h = '<h2 class="header">' + escapeHtml(d.heading) + '</h2><div id="mainContent">';
		h += '<h3>' + escapeHtml(d.i18n.myFeedHeading) + ':</h3><ul class="rssLists">';
		h += '<li><a href="' + escapeHtml(d.userFeed.url) + '" target="_blank">' + escapeHtml(d.userFeed.name) + '</a><span class="sr-only">' + escapeHtml(d.i18n.linksSrOnly) + '</span></li></ul>';
		if (d.folderFeeds && d.folderFeeds.length) {
			h += '<h3>' + escapeHtml(d.i18n.myFolderFeedHeading) + ':</h3><ul class="rssLists">';
			for (var i = 0; i < d.folderFeeds.length; i++) {
				var f = d.folderFeeds[i];
				h += '<li><a href="' + escapeHtml(f.url) + '" target="_blank">' + escapeHtml(f.name) + '</a><span class="sr-only">' + escapeHtml(d.i18n.linksSrOnly) + '</span></li>';
			}
			h += '</ul><p>' + escapeHtml(d.i18n.linksNewWindow) + '</p>';
		}
		h += '</div>';
		wsSetPanelHtml('panelRss', h, false);
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
	wsApiGet('workspaceproperties/api-keys', {}, function (d) {
		var h = '<h2 class="header">' + escapeHtml(d.heading) + '</h2><div id="mainContent">';
		if (!d.installed) {
			h += '<p>' + escapeHtml(d.i18n.notInstalled) + '</p></div>';
			wsSetPanelHtml('panelApi', h, false);
			return;
		}
		if (!d.items || !d.items.length) {
			h += '<p>' + escapeHtml(d.i18n.noApplications) + '</p></div>';
			wsSetPanelHtml('panelApi', h, false);
			return;
		}
		for (var i = 0; i < d.items.length; i++) {
			var it = d.items[i];
			h += '<p><strong>' + escapeHtml(it.description) + '</strong><br />';
			h += escapeHtml(d.i18n.keyLabel) + ': ' + escapeHtml(it.key) + '<br />';
			h += escapeHtml(d.i18n.secretLabel) + ': ' + escapeHtml(it.secret) + '<br />';
			h += escapeHtml(d.i18n.statusLabel) + ': ' + escapeHtml(it.active ? 'ENABLED' : 'DISABLED') + '<br />';
			h += escapeHtml(d.i18n.createdLabel) + ' ' + escapeHtml(it.created) + '<br />';
			h += escapeHtml(d.i18n.modifiedLabel) + ' ' + escapeHtml(it.modified) + '<br />';
			h += escapeHtml(it.lastUsed ? (d.i18n.lastUsedLabel + ' ' + it.lastUsed) : d.i18n.neverUsed) + '<br />';
			h += escapeHtml(it.usesCount > 0 ? d.i18n.usedFmt.replace('{x}', it.usesCount) : d.i18n.neverUsed) + '</p>';
		}
		h += '</div>';
		wsSetPanelHtml('panelApi', h, false);
	});

}

function panelTabClicked(tab){
	$("#panelTabs button:not(#" + tab + ")").attr("aria-selected", "false");
	$("#panelTabs button:not(#" + tab + ")").removeClass("tabSelected");
	$("#panelTabs button#" + tab).attr("aria-selected", "true");
	$("#panelTabs button#" + tab).addClass("tabSelected");
}
