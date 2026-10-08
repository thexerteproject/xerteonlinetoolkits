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

var ckeditorInstance = null;

function propertiesApiBase() {
	return (typeof rest_api_url !== 'undefined') ? rest_api_url : 'website_code/api/v1/index.php';
}

function propertiesApiUrl(route) {
	return propertiesApiBase() + '?route=' + encodeURIComponent(route);
}

function escapeHtml(s) {
	if (s === null || s === undefined) return '';
	return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function properties_showPanel(html, tabId) {
	if (html === '' || html === null || html === undefined) return;
	$("#dynamic_area .tabPanel").empty().hide();
	$("#" + tabId).html(html).show();
}

function propertiesApiPost(route, data, onOk, onFail) {
	return $.ajax({
		type: 'POST',
		url: propertiesApiUrl(route),
		data: data,
		dataType: 'json'
	}).done(function (res) {
		if (!res || !res.ok) {
			var msg = (res && res.error && res.error.message) ? res.error.message : 'Request failed';
			if (onFail) onFail(res); else alert(msg);
			return;
		}
		if (onOk) onOk(res.data);
	}).fail(function (xhr) {
		var msg = 'Request failed';
		try {
			var j = xhr.responseJSON;
			if (j && j.error && j.error.message) msg = j.error.message;
		} catch (e) {}
		if (onFail) onFail(null); else alert(msg);
	});
}

function renderPublishPanel(d) {
	var h = '<h2 class="header">' + PUBLISH_TITLE + '</h2><div id="mainContent">';
	h += '<p>' + PUBLISH_NAME + ': ' + escapeHtml(d.name) + '</p>';
	h += '<p>' + PROPERTIES_LIBRARY_DEFAULT_ENGINE + ' ' + escapeHtml(d.engineLabel) + '</p>';
	h += '<p>' + PUBLISH_ACCESS + ': ' + escapeHtml(d.access) + '</p>';
	if (d.access !== 'Private' && d.playUrl) {
		h += '<p>' + PUBLISH_WEB_ADDRESS + ": <a target='_blank' href='" + escapeHtml(d.playUrl) + "'>" + escapeHtml(d.playUrl) + '</a>' + PUBLISH_LINKS + '</p>';
		h += '<p>' + PUBLISH_RSS + ': ' + (d.rssIncluded ? PUBLISH_RSS_INCLUDE : PUBLISH_RSS_NOT_INCLUDE) + '</p>';
		h += '<p>' + PUBLISH_SYNDICATION + ': ' + (d.syndicated ? PUBLISH_SYNDICATION_STATUS_ON : PUBLISH_SYNDICATION_STATUS_OFF) + '</p>';
	} else if (d.access !== 'Private') {
		h += '<p>' + PUBLISH_RSS + ': ' + (d.rssIncluded ? PUBLISH_RSS_INCLUDE : PUBLISH_RSS_NOT_INCLUDE) + '</p>';
		h += '<p>' + PUBLISH_SYNDICATION + ': ' + (d.syndicated ? PUBLISH_SYNDICATION_STATUS_ON : PUBLISH_SYNDICATION_STATUS_OFF) + '</p>';
	} else {
		h += "<p><i class='fa fa-exclamation-circle' style='height: 14px; color:#f86718;'></i> " + PUBLISH_ACCESS_STATUS + '</p>';
	}
	if (d.canPublishButton) {
		h += '<p><button type="button" class="xerte_button" onclick="publish_project(window.name);"><i class="fa fa-share xerte-icon"></i> ' + PUBLISH_BUTTON_LABEL + '</button></p>';
	}
	h += '</div>';
	return h;
}

function renderProjectPanel(d) {
	var h = '<h2 class="header">' + PROPERTIES_LIBRARY_PROJECT + '</h2><div id="mainContent">';
	if (d.canRename) {
		h += '<form id="rename_form" action="javascript:rename_template(\'' + escapeHtml(String(d.templateId)) + '\',\'rename_form\')">';
		h += '<label class="block" for="newfilename">' + PROPERTIES_LIBRARY_PROJECT_NAME + ':</label>';
		h += '<input type="text" value="' + escapeHtml(d.displayName) + '" name="newfilename" id="newfilename" />';
		h += '<button type="submit" class="xerte_button" style="padding-left:5px;" align="top"><i class="fa fa-floppy-o"></i>&nbsp;' + PROPERTIES_LIBRARY_RENAME + '</button>';
		if (d.change && d.msgtype === 'name') {
			h += "<p class='alert_msg' aria-live='polite'><i class='fa fa-exclamation-circle' style='height: 14px; color:#f86718;'></i> " + PROPERTIES_LIBRARY_PROJECT_CHANGED + '</p>';
		}
		h += '</form>';
	} else {
		h += '<p>' + PROPERTIES_LIBRARY_PROJECT_NAME + ': ' + escapeHtml(d.displayName) + '</p>';
	}
	h += '<p>' + PROPERTIES_LIBRARY_PROJECT_CREATE + ' ' + escapeHtml(d.dateCreated) + '</p>';
	h += '<p>' + PROPERTIES_LIBRARY_PROJECT_MODIFY + ' ' + escapeHtml(d.dateModified) + '</p>';
	if (d.playUrl) {
		h += '<p>' + PROPERTIES_LIBRARY_PROJECT_LINK + "<br/><a target=\"new\" href='" + escapeHtml(d.playUrl) + "'>" + escapeHtml(d.playUrl) + '</a>' + PROPERTIES_LIBRARY_PROJECT_LINKS + '</p>';
		if (d.embed && d.embed.iframeSnippet) {
			h += '<label id="embedCodeLabel" class="block indent" for="embedCode">' + PROPERTIES_LIBRARY_PROJECT_IFRAME + ':</label>';
			h += '<textarea name="embedCode" id="embedCode" readonly rows="3" cols="40" onfocus="this.select()" class="indent">' + escapeHtml(d.embed.iframeSnippet) + '</textarea>';
		}
	}
	if (d.showEngineFieldset && d.engine) {
		var eng = d.engine;
		h += '<fieldset id="engineFS" class="plainFS"><legend>' + PROPERTIES_LIBRARY_DEFAULT_ENGINE + '</legend>';
		if (!eng.showFlashOption) {
			h += '<div><input checked type="radio" id="flash" name="engine" value="flash"><label for="flash">' + PROPERTIES_LIBRARY_DEFAULT_FLASH + '</label></div>';
		} else if (eng.defaultEngine === 'flash') {
			h += '<div><input type="radio" id="javascript" name="engine" value="javascript"' + (eng.selectedEngine === 'javascript' ? ' checked' : '') + ' onclick="javascript:default_engine_toggle()"><label for="javascript">' + PROPERTIES_LIBRARY_DEFAULT_HTML5 + '</label></div>';
			h += '<div><input type="radio" id="flash" name="engine" value="flash"' + (eng.selectedEngine === 'flash' ? ' checked' : '') + ' onclick="javascript:default_engine_toggle()"><label for="flash">' + PROPERTIES_LIBRARY_DEFAULT_FLASH + '</label></div>';
		} else {
			h += '<div><input type="radio" id="javascript" name="engine" value="javascript"' + (eng.selectedEngine === 'javascript' ? ' checked' : '') + ' onclick="javascript:default_engine_toggle()"><label for="javascript">' + PROPERTIES_LIBRARY_DEFAULT_HTML5 + '</label></div>';
			h += '<div><input type="radio" id="flash" name="engine" value="flash"' + (eng.selectedEngine === 'flash' ? ' checked' : '') + ' onclick="javascript:default_engine_toggle()"><label for="flash">' + PROPERTIES_LIBRARY_DEFAULT_FLASH + '</label></div>';
		}
		if (d.change && d.msgtype === 'engine') {
			h += "<p aria-live='polite' class=\"alert_msg\"><i class='fa fa-exclamation-circle' style='height: 14px; color:#f86718;'></i> " + PROPERTIES_LIBRARY_DEFAULT_ENGINE_CHANGED + '</p>';
		}
		h += '<p>' + PROPERTIES_LIBRARY_DEFAULT_ENGINE_WARNING + '</p></fieldset>';
	}
	h += '</div>';
	return h;
}

function renderSyndicationPanel(d) {
	if (d.notPublic) {
		var h = '<h2 class="header">' + PROPERTIES_LIBRARY_SYNDICATION + '</h2><div id="mainContent">';
		h += '<p>' + PROPERTIES_LIBRARY_SYNDICATION_PUBLIC + '</p>';
		h += '<p>' + PROPERTIES_LIBRARY_SYNDICATION_URL + ' <a target="new" href="' + escapeHtml(d.rssSyndicateUrl) + '">' + escapeHtml(d.rssSyndicateUrl) + '</a></p></div>';
		return h;
	}
	var i, h = '<h2 class="header">' + PROPERTIES_LIBRARY_SYNDICATION + '</h2><div id="mainContent">';
	h += '<p>' + PROPERTIES_LIBRARY_SYNDICATION_EXPLAINED + ': <a target="new" href="' + escapeHtml(d.rssSyndicateUrl) + '">' + escapeHtml(d.rssSyndicateUrl) + '</a>' + PROPERTIES_LIBRARY_SYNDICATION_LINKS + '</p>';
	h += '<form id="xmlshare" action="javascript:syndication_change_template()" name="xmlshare">';
	h += '<div><input type="checkbox" id="syndon" ' + (d.syndicationEnabled ? 'checked' : '') + ' /><label for="syndon">' + PROPERTIES_LIBRARY_SYNDICATION_PROMPT + '</label></div>';
	h += '<label id="category_listLabel" class="block" for="category_list">' + PROPERTIES_LIBRARY_SYNDICATION_CATEGORY + ':</label><select name="type" id="category_list">';
	for (i = 0; i < d.categories.length; i++) {
		var c = d.categories[i];
		h += '<option value="' + escapeHtml(c) + '"' + (c === d.category ? ' selected' : '') + '>' + escapeHtml(c) + '</option>';
	}
	h += '</select>';
	h += '<label id="license_listLabel" for="license_list" class="block">' + PROPERTIES_LIBRARY_SYNDICATION_LICENCE + ':</label><select name="type" id="license_list">';
	for (i = 0; i < d.licenses.length; i++) {
		var lic = d.licenses[i];
		h += '<option value="' + escapeHtml(lic) + '"' + (lic === d.license ? ' selected' : '') + '>' + escapeHtml(lic) + '</option>';
	}
	h += '</select>';
	h += '<label id="descriptionLabel" class="block" for="description">' + PROPERTIES_LIBRARY_SYNDICATION_DESCRIPTION + ':</label><textarea id="description" style="width:90%; height:120px;">' + escapeHtml(d.description) + '</textarea>';
	h += '<label id="keywordsLabel" class="block" for="keywords">' + PROPERTIES_LIBRARY_SYNDICATION_KEYWORDS + ':</label><textarea id="keywords" style="width:90%; height:40px;">' + escapeHtml(d.keywords) + '</textarea>';
	h += '<button type="submit" class="xerte_button"><i class="fa fa-floppy-o"></i>&nbsp;' + PROPERTIES_LIBRARY_SAVE + '</button>';
	if (d.change) {
		h += "<span class='alert_msg' aria-live='polite'><i class='fa fa-exclamation-circle' style='height: 14px; color:#f86718;'></i> " + PROPERTIES_LIBRARY_SYNDICATION_SAVED + '</span>';
	}
	h += '</form></div>';
	return h;
}

function renderRssPanel(d) {
	if (d.publicOnly) {
		return '<h2 class="header">' + PROPERTIES_LIBRARY_RSS + '</h2><div id="mainContent"><p>' + PROPERTIES_LIBRARY_RSS_PUBLIC + '</p></div>';
	}
	var h = '<h2 class="header">' + PROPERTIES_LIBRARY_RSS + '</h2><div id="mainContent">';
	h += '<p>' + PROPERTIES_LIBRARY_RSS_SITE + '</p>';
	h += '<form action="javascript:rss_change_template()" name="xmlshare">';
	h += '<div><input type="checkbox" id="rsson" ' + (d.rssEnabled ? 'checked' : '') + ' /><label for="rsson">' + PROPERTIES_LIBRARY_RSS_INCLUDE + '</label></div><br/>';
	h += '<div><input type="checkbox" id="exporton" ' + (d.exportEnabled ? 'checked' : '') + ' /><label for="exporton">' + PROPERTIES_LIBRARY_RSS_EXPORT + '</label>';
	h += '<p class="share_status_paragraph">' + PROPERTIES_LIBRARY_RSS_EXPORT_DESCRIPTION + '</p></div>';
	h += '<label id="descLabel" class="block" for="desc">' + PROPERTIES_LIBRARY_RSS_DESCRIPTION + ':</label><textarea id="desc" style="width:90%; height:120px;">' + escapeHtml(d.description) + '</textarea>';
	h += '<button type="submit" class="xerte_button"><i class="fa fa-floppy-o"></i>&nbsp;' + PROPERTIES_LIBRARY_SAVE + '</button>';
	if (d.change) {
		h += "<span class='alert_msg' aria-live='polite'><i class='fa fa-exclamation-circle' style='height: 14px; color:#f86718;'></i> " + PROPERTIES_LIBRARY_RSS_SAVED + '</span>';
	}
	h += '</form>';
	h += '<h3>' + PROPERTIES_LIBRARY_RSS_FEEDS + ':</h3>';
	h += '<p>' + PROPERTIES_LIBRARY_RSS_SITE_LINK + ': <a target="_blank" href="' + escapeHtml(d.rssGlobalUrl) + '">' + escapeHtml(d.rssGlobalUrl) + '</a>' + PROPERTIES_LIBRARY_RSS_LINKS;
	h += '<br/>' + PROPERTIES_LIBRARY_RSS_SITE_DESCRIPTION + '</p>';
	h += '<p>' + PROPERTIES_LIBRARY_RSS_PERSONAL + ': <a target="_blank" href="' + escapeHtml(d.rssUserUrl) + '">' + escapeHtml(d.rssUserUrl) + '</a>' + PROPERTIES_LIBRARY_RSS_LINKS + '.';
	h += '<br/>' + PROPERTIES_LIBRARY_RSS_MINE + '</p>';
	h += '<p>' + PROPERTIES_LIBRARY_RSS_FOLDER + ':<br/>' + PROPERTIES_LIBRARY_RSS_FOLDER_DESCRIPTION + '</p>';
	h += '</div>';
	return h;
}

function renderPeerPanel(d) {
	var h = '<h2 class="header">' + PROPERTIES_LIBRARY_PEER + '</h2><div id="mainContent">';
	h += '<p>' + PROPERTIES_LIBRARY_PEER_EXPLAINED + '</p>';
	if (d.peerLink) {
		h += '<p>' + PROPERTIES_LIBRARY_PEER_LINK + ':<br/><a target="new" href="' + escapeHtml(d.peerLink) + '">' + escapeHtml(d.peerLink) + '</a>' + PROPERTIES_LIBRARY_PEER_LINKS + '</p>';
	}
	h += '<form id="peer" action="javascript:peer_change_template()" name="peer">';
	h += '<div><input type="checkbox" id="peeron" ' + (d.peerEnabled ? 'checked' : '') + ' /><label for="peeron">' + PROPERTIES_LIBRARY_PEER_STATUS + '</label></div>';
	h += '<label id="passwordLabel" class="block" for="password">' + PROPERTIES_LIBRARY_PEER_PASSWORD_PROMPT + ':</label>';
	h += '<input id="password" type="text" value="' + escapeHtml(d.password) + '" name="password" style="width:90%;" />';
	h += '<label id="retouremailLabel" class="block" for="retouremail">' + PROPERTIES_LIBRARY_PEER_RETOUREMAIL_PROMPT + ':</label>';
	h += '<input id="retouremail" type="text" value="' + escapeHtml(d.returnEmail) + '" name="retouremail" style="width:90%;" />';
	h += '<button type="submit" class="xerte_button"><i class="fa fa-floppy-o"></i>&nbsp;' + PROPERTIES_LIBRARY_SAVE + '</button>';
	if (d.change) {
		h += "<span class='alert_msg' aria-live='polite'><i class='fa fa-exclamation-circle' style='height: 14px; color:#f86718;'></i> " + PROPERTIES_LIBRARY_PEER_SAVED + '</span>';
	}
	h += '</form></div>';
	return h;
}

function renderXmlPanel(d) {
	var h = '<h2 class="header">' + PROPERTIES_LIBRARY_XML_TITLE + '</h2><div id="mainContent">';
	h += '<p>' + PROPERTIES_LIBRARY_XML_DESCRIPTION + '</p>';
	h += '<form id="xmlshare" action="javascript:xml_change_template()">';
	h += '<div><input type="checkbox" id="xmlon" ' + (d.xmlEnabled ? 'checked' : '') + ' /><label for="xmlon">' + PROPERTIES_LIBRARY_XML_SHARING + '</label></div>';
	h += '<label id="sitenameLabel" class="block" for="sitename">' + PROPERTIES_LIBRARY_XML_RESTRICT + ':</label>';
	h += '<input id="sitename" type="text" value="' + escapeHtml(d.siteRestriction) + '" name="sitename" style="width:90%;" />';
	h += '<button type="submit" class="xerte_button" style="padding-left:5px;" align="top"><i class="fa fa-floppy-o"></i>&nbsp;' + PROPERTIES_LIBRARY_SAVE + '</button>';
	if (d.change) {
		h += "<span class='alert_msg' aria-live='polite'><i class='fa fa-exclamation-circle' style='height: 14px; color:#f86718;'></i> " + PROPERTIES_LIBRARY_XML_SAVE + '</span>';
	}
	h += '</form></div>';
	return h;
}

function renderNotesPanel(d) {
	var h = '<h2 class="header">' + PROPERTIES_TAB_NOTES + '</h2><div id="mainContent">';
	h += '<form id="notes_form" action="javascript:change_notes(\'' + escapeHtml(String(d.templateId)) + '\',\'notes_form\')">';
	h += '<label class="block" for="notes">' + PROPERTIES_LIBRARY_NOTES_EXPLAINED + ':</label>';
	h += '<textarea id="notes" name="notes" style="width:90%; height:330px">' + escapeHtml(d.notes) + '</textarea>';
	h += '<button type="submit" class="xerte_button"><i class="fa fa-floppy-o"></i>&nbsp;' + PROPERTIES_LIBRARY_SAVE + '</button>';
	if (d.change) {
		h += "<span class='alert_msg' aria-live='polite'><i class='fa fa-exclamation-circle' style='height: 14px; color:#f86718;'></i> " + PROPERTIES_LIBRARY_NOTES_SAVED + '</span>';
	}
	h += '</form></div>';
	return h;
}

function makeeditor() {
	if (typeof CKEDITOR === 'undefined') return;
	if (typeof ckeditorInstance !== 'undefined' && ckeditorInstance) {
		try { ckeditorInstance.destroy(); } catch (e) {}
	}
	ckeditorInstance = CKEDITOR.replace('notes', {
		toolbarStartupExpanded: false,
		height: 360,
		language: (typeof window.propertiesNotesLanguage !== 'undefined') ? window.propertiesNotesLanguage : 'en'
	});
	window.ckeditor = ckeditorInstance;
}

function renderAccessPanel(d) {
	var sel = d.selected;
	var h = '<h2 class="header">' + PROPERTIES_TAB_ACCESS + '</h2><div id="mainContent">';
	h += '<fieldset id="security_list" class="plainFS"><legend>' + PROPERTIES_LIBRARY_ACCESS + ':</legend>';
	h += '<div><input type="radio" id="Public" name="share_status" value="Public"' + (sel === 'Public' ? ' checked' : '') + '><label for="Public">' + PROPERTIES_LIBRARY_ACCESS_PUBLIC + '</label></div>';
	h += '<p class="share_explain_paragraph">' + PROPERTIES_LIBRARY_ACCESS_PUBLIC_EXPLAINED + '</p>';
	h += '<div><input type="radio" id="Password" name="share_status" value="Password"' + (sel === 'Password' ? ' checked' : '') + '><label for="Password">' + PROPERTIES_LIBRARY_ACCESS_PASSWORD + '</label></div>';
	h += '<p class="share_explain_paragraph">' + PROPERTIES_LIBRARY_ACCESS_PASSWORD_EXPLAINED + '</p>';
	h += '<div><input type="radio" id="PasswordPlay" name="share_status" value="PasswordPlay"' + (sel.indexOf('PasswordPlay') === 0 ? ' checked' : '') + '><label for="PasswordPlay">' + PROPERTIES_LIBRARY_ACCESS_PASSWORD_PLAY + '</label></div>';
	h += '<p class="share_explain_paragraph">' + PROPERTIES_LIBRARY_ACCESS_PASSWORD_PLAY_EXPLAINED + '</p><form id="PWPlay_pwd"><textarea id="pwd" style="width:90%; height:20px;">' + escapeHtml(d.passwordPlayValue) + '</textarea></form>';
	h += '<div><input type="radio" id="Other" name="share_status" value="Other"' + (sel.indexOf('Other') === 0 ? ' checked' : '') + '><label for="Other">' + PROPERTIES_LIBRARY_ACCESS_OTHER;
	if (sel.indexOf('Other') === 0 && d.otherSiteValue) {
		h += ' - ' + escapeHtml(d.otherSiteValue);
	}
	h += '</label></div>';
	h += '<p id="other_explain" class="share_explain_paragraph">' + PROPERTIES_LIBRARY_ACCESS_OTHER_EXPLAINED + '</p><form id="other_site_address"><textarea id="url" style="width:90%; height:20px;">' + escapeHtml(d.otherSiteValue) + '</textarea></form>';
	h += '<div><input type="radio" id="Private" name="share_status" value="Private"' + (sel === 'Private' ? ' checked' : '') + '><label for="Private">' + PROPERTIES_LIBRARY_ACCESS_PRIVATE + '</label></div>';
	h += '<p class="share_explain_paragraph">' + PROPERTIES_LIBRARY_ACCESS_PRIVATE_EXPLAINED + '</p>';
	var j;
	if (d.securityOptions && d.securityOptions.length) {
		for (j = 0; j < d.securityOptions.length; j++) {
			var so = d.securityOptions[j];
			if (!so.enabled) continue;
			h += '<div><input type="radio" id="' + escapeHtml(so.value) + '" name="share_status" value="' + escapeHtml(so.value) + '"' + (sel === so.value ? ' checked' : '') + '><label for="' + escapeHtml(so.value) + '">' + escapeHtml(so.label) + '</label></div>';
			h += '<p class="share_explain_paragraph">' + escapeHtml(so.info) + '</p>';
		}
	}
	h += '<p><button type="button" class="xerte_button" onclick="javascript:access_change_template(' + d.templateId + ')"><i class="fa fa-floppy-o"></i>&nbsp;' + PROPERTIES_LIBRARY_ACCESS_BUTTON_CHANGE + '</button>';
	if (d.change) {
		h += "<span class='alert_msg' aria-live='polite'><i class='fa fa-exclamation-circle' style='height: 14px; color:#f86718;'></i> " + PROPERTIES_LIBRARY_ACCESS_CHANGED + '</span>';
	}
	h += '</p></fieldset></div>';
	return h;
}

function renderMediaPanel(d) {
	if (d.error === 'no_access') {
		return '<h2 class="header">' + PROPERTIES_TAB_MEDIA + '</h2><div id="mainContent"><p>' + MEDIA_AND_QUOTA_FAIL + '</p></div>';
	}
	var h = '<h2 class="header">' + PROPERTIES_TAB_MEDIA + '</h2><div id="mainContent">';
	h += '<p>' + MEDIA_AND_QUOTA_USAGE + ' ' + escapeHtml(d.quotaMb) + ' MB</p>';
	h += '<p>' + MEDIA_AND_QUOTA_IMPORT_MEDIA + '</p>';
	h += '<form method="post" enctype="multipart/form-data" id="importpopup" name="importform" target="upload_iframe" action="website_code/php/import/fileupload.php" onsubmit="javascript:iframe_upload_check_initialise(1);">';
	h += '<div id="filenameuploaded_container"><input type="file" id="filenameuploaded" name="filenameuploaded"/><input type="hidden" name="mediapath" value="' + escapeHtml(d.mediaPath) + '" /></div>';
	h += '<button id="submitbutton" type="submit" class="xerte_button" name="submitBtn" onclick="javascript:load_button_spinner(this)"><i class="fa fa-upload"></i> ' + MEDIA_AND_QUOTA_BUTTON_IMPORT + '</button></form>';
	h += '<p id="linktextLabel" class="block indent" for="linktext">' + MEDIA_AND_QUOTA_CLICK_FILENAME + '</p>';
	h += '<p>' + MEDIA_AND_QUOTA_PUBLISH + '</p><div class="template_file_area"><table id="mediaTable">';
	h += '<tr><th class="filename">' + MEDIA_AND_QUOTA_FILE_NAME + '</th><th class="filesize">' + MEDIA_AND_QUOTA_FILE_SIZE + '</th><th class="fileinuse">' + MEDIA_AND_QUOTA_FILE_USED + '</th></tr>';
	var i, f;
	for (i = 0; i < d.files.length; i++) {
		f = d.files[i];
		var rowCls = f.inUse ? 'found' : 'notfound';
		h += '<tr><td class="filename ' + rowCls + '"><button type="button" class="filenameBtn" onclick="setup_download_link(\'' + escapeHtml(f.downloadPath).replace(/'/g, "\\'") + '\', \'' + MEDIA_AND_QUOTA_DOWNLOAD + '\', \'' + escapeHtml(f.getfileRelative).replace(/'/g, "\\'") + '\')">' + escapeHtml(f.filename) + '</button></td>';
		h += '<td class="filesize ' + rowCls + '">' + escapeHtml(f.sizeMb) + ' MB</td><td class="fileinuse ' + rowCls + '">';
		if (f.inUse) {
			h += '<i class="fa fa-check"></i><span class="sr-only">' + MEDIA_AND_QUOTA_USE + '</span>';
		} else {
			h += '<button type="button" class="deleteFile" onclick="javascript:delete_file(\'' + escapeHtml(f.fullPath).replace(/'/g, "\\'") + '\')" title="' + MEDIA_AND_QUOTA_DELETE + '"><i class="fa fa-times"></i><span class="sr-only">' + MEDIA_AND_QUOTA_NOT_IN_USE + ': ' + MEDIA_AND_QUOTA_DELETE + ' ' + escapeHtml(f.filename) + '</span></button>';
		}
		h += '</td></tr>';
	}
	h += '</table>';
	if (d.unusedFilesToken) {
		h += '<button id="delete_unused_files" type="submit" class="xerte_button" name="delete_unused_filesBTN" onclick="javascript:delete_unused_files(\'' + escapeHtml(d.mediaPath).replace(/'/g, "\\'") + '\', \'' + escapeHtml(d.unusedFilesToken).replace(/'/g, "\\'") + '\')"><i class="fa fa-trash"></i> ' + MEDIA_AND_QUOTA_UNUSED_DELETE + '</button>';
	}
	h += '</div></div>';
	return h;
}

function renderSharingPanel(d) {
	var h = '<h2 class="header">' + PROPERTIES_TAB_SHARED + '</h2><div id="mainContent">';
	if (d.canManage) {
		h += '<p>' + SHARING_INSTRUCTION + '</p><form id="share_form">';
		h += '<label class="block" for="searcharea">' + SHARING_NAME_LABEL + ':</label>';
		h += '<input id="searcharea" name="searcharea" onkeyup="javascript:name_select_template()" type="text" size="20" />';
		h += '<fieldset id="rolebutton" class="plainFS"><legend>' + SHARING_ROLE_LABEL + ':</legend>';
		h += '<div><input type="radio" name="role" id="co-author" value="co-author"><label for="co-author">' + SHARING_COAUTHOR + '</label></div>';
		h += '<div><input type="radio" name="role" id="editor" value="editor" checked><label for="editor">' + SHARING_EDITOR + '</label></div>';
		h += '<div><input type="radio" name="role" id="read-only" value="read-only"><label for="read-only">' + SHARING_READONLY + '</label></div></fieldset></form>';
		h += '<div id="area2"><p><span class="placeholderTxt">' + SHARING_NAMES + '</span></p></div><p id="area3">';
	}
	if (d.empty) {
		h += "<p class=\"share_files_paragraph\"><span>" + SHARING_NOT_SHARED + "</span></p></div>";
		return h;
	}
	h += '<p class="share_intro_p"><span>' + SHARING_CURRENT + '</span></p><ul class="share_users ' + (d.canManage ? '' : 'show_list') + '">';
	var i, u, g;
	for (i = 0; i < d.groups.length; i++) {
		g = d.groups[i];
		h += '<li>' + escapeHtml(g.name);
		if (d.canManage) {
			h += ' <label class="sr-only" for="groupRole_' + g.groupId + '">' + SHARING_ROLE_LABEL + ' (' + escapeHtml(g.name) + ')</label>';
			h += '<select name="groupRole_' + g.groupId + '" id="groupRole_' + g.groupId + '" onchange="set_sharing_rights_template(\'' + d.templateId + '\', \'' + g.groupId + '\', true)">';
			h += '<option value="co-author_' + g.groupId + '"' + (g.role === 'co-author' ? ' selected' : '') + '>' + SHARING_COAUTHOR + '</option>';
			h += '<option value="editor_' + g.groupId + '"' + (g.role === 'editor' ? ' selected' : '') + '>' + SHARING_EDITOR + '</option>';
			h += '<option value="read-only_' + g.groupId + '"' + (g.role === 'read-only' ? ' selected' : '') + '>' + SHARING_READONLY + '</option></select>';
			h += '&nbsp;<button type="button" class="xerte_button" onclick="javascript:delete_sharing_template(\'' + d.templateId + '\',\'' + g.groupId + '\',false,true)"><i class="fa fa-times"></i> ' + SHARING_REMOVE + '<span class="sr-only"> (' + escapeHtml(g.name) + ')</span></button>';
		} else {
			h += ' - ' + escapeHtml(g.role);
		}
		h += '</li>';
	}
	for (i = 0; i < d.users.length; i++) {
		u = d.users[i];
		h += '<li>' + escapeHtml(u.firstname) + ' ' + escapeHtml(u.surname) + ' (' + escapeHtml(u.username) + ')';
		if (u.role !== 'creator' && d.canManage) {
			h += ' <label class="sr-only" for="role_' + u.userId + '">' + SHARING_ROLE_LABEL + '</label>';
			h += '<select name="role_' + u.userId + '" id="role_' + u.userId + '" onchange="set_sharing_rights_template(\'' + d.templateId + '\', \'' + u.userId + '\', false)">';
			h += '<option value="co-author_' + u.userId + '"' + (u.role === 'co-author' ? ' selected' : '') + '>' + SHARING_COAUTHOR + '</option>';
			h += '<option value="editor_' + u.userId + '"' + (u.role === 'editor' ? ' selected' : '') + '>' + SHARING_EDITOR + '</option>';
			h += '<option value="read-only_' + u.userId + '"' + (u.role === 'read-only' ? ' selected' : '') + '>' + SHARING_READONLY + '</option></select>';
			h += '&nbsp;<button type="button" class="xerte_button" onclick="javascript:delete_sharing_template(\'' + d.templateId + '\',\'' + u.userId + '\',false,false)"><i class="fa fa-times"></i> ' + SHARING_REMOVE + '</button>';
		} else if (u.role === 'creator') {
			h += ' - ' + escapeHtml(u.role);
		} else {
			h += ' - ' + escapeHtml(u.role);
		}
		h += '</li>';
	}
	h += '</ul>';
	if (d.showSelfRemove) {
		h += '<p>' + SHARING_STOP_INSTRUCTIONS + ' <button type="button" class="xerte_button" onclick="javascript:delete_sharing_template(\'' + d.templateId + '\',\'' + d.currentUserId + '\',true,false)"><i class="fa fa-times"></i> ' + SHARING_STOP + '</button></p>';
	}
	h += '</div>';
	return h;
}

function renderGiftPanel(d) {
	if (!d.canGift) {
		return '<h2 class="header">' + PROPERTIES_TAB_GIVE + '</h2><div id="mainContent"><p>' + GIFT_ERROR + '</p></div>';
	}
	var h = '<h2 class="header">' + PROPERTIES_TAB_GIVE + '</h2><div id="mainContent">';
	h += '<p>' + GIFT_INSTRUCTIONS + '</p><form id="share_form">';
	h += '<label id="searchareaLabel" class="block" for="searcharea">' + GIFT_SEARCH_LABEL + ':</label>';
	h += '<input name="searcharea" id="searcharea" onkeyup="javascript:name_select_gift_template()" type="text" size="20" /></form>';
	h += '<div id="area2"><p><span class="placeholderTxt">' + GIFT_NAMES + '</span></p></div><p id="area3"></p></div>';
	return h;
}

function renderExportPanel(d) {
	var inner = d.exportInnerHtml || '';
	return '<h2 class="header">' + EXPORT_TITLE + '</h2><div id="mainContent">' + inner + '</div>';
}

function renderLtiPanel(d) {
	window._ltiDefForToggles = d;
	var h = '<h2 class="header">' + PROPERTIES_LIBRARY_TSUGI + '</h2><div id="mainContent">';
	if (d.tsugi_installed) {
		h += PROPERTIES_LIBRARY_TSUGI_DESCRIPTION;
		h += '<form action="javascript:lti_update(' + d.templateId + ')"><fieldset class="plainFS"><legend>LTI</legend>';
		h += '<div><input id="pubChk" type="checkbox" onchange="javascript:tsugi_toggle_tsugi_publish(JSON.stringify(window._ltiDefForToggles))" name="tsugi_published" ' + (d.published ? 'checked' : '') + '>';
		h += '<label for="pubChk">' + PROPERTIES_LIBRARY_TSUGI_PUBLISH + '</label></div>';
		h += '<div id="publish" class="publish ' + (d.published ? '' : 'disabled') + '">';
		h += '<input type="checkbox" ' + (d.published ? '' : 'disabled') + ' name="tsugi_publish_in_store" id="tsugi_publish_in_store" ' + (d.tsugi_publish_in_store ? 'checked' : '') + '>';
		h += '<label for="tsugi_publish_in_store">' + PROPERTIES_LIBRARY_TSUGI_PUBLISH_IN_STORE + '</label><br>';
		h += '<input type="checkbox" onchange="javascript:tsugi_toggle_useglobal(JSON.stringify(window._ltiDefForToggles))" ' + (d.published ? '' : 'disabled') + ' name="tsugi_useglobal" id="tsugi_useglobal" ' + (d.tsugi_useglobal ? 'checked' : '') + '>';
		h += '<label for="tsugi_useglobal">' + PROPERTIES_LIBRARY_TSUGI_USEGLOBAL + '</label><br>';
		h += '<input type="checkbox" ' + (d.published ? '' : 'disabled') + ' name="tsugi_useprivateonly" id="tsugi_useprivateonly" ' + (d.tsugi_privateonly ? 'checked' : '') + '>';
		h += '<label for="tsugi_useprivateonly">' + PROPERTIES_LIBRARY_TSUGI_USEPRIVATEONLY + '</label><br>';
		h += '<div class="textBoxes"><div class="textBoxGroup"><label for="tsugi_key">' + PROPERTIES_LIBRARY_TSUGI_KEY + '</label>';
		h += '<input id="tsugi_key" name="tsugi_key" type="text" ' + ((d.tsugi_useglobal || !d.published) ? 'disabled value=""' : 'value="' + escapeHtml(d.key) + '"') + '></div>';
		h += '<div class="textBoxGroup"><label for="tsugi_secret">' + PROPERTIES_LIBRARY_TSUGI_SECRET + '</label>';
		h += '<input id="tsugi_secret" name="tsugi_secret" type="text" ' + ((d.tsugi_useglobal || !d.published) ? 'disabled value=""' : 'value="' + escapeHtml(d.secret) + '"') + '></div></div></div></fieldset>';
	} else {
		h += PROPERTIES_LIBRARY_TSUGI_NOTAVAILABLE_DESCRIPTION;
		h += '<form action="javascript:lti_update(' + d.templateId + ')">';
	}
	h += '<fieldset class="plainFS"><legend>xAPI</legend>';
	h += '<div><input id="xChk" type="checkbox" onchange="javascript:tsugi_toggle_usexapi(JSON.stringify(window._ltiDefForToggles))" name="tsugi_xapi" ' + (d.xapi_enabled ? 'checked' : '') + '>';
	h += '<label for="xChk">' + PROPERTIES_LIBRARY_TSUGI_ENABLE_XAPI + '</label></div>';
	h += '<div id="xAPI_enabled" class="publish ' + (d.xapi_enabled ? '' : 'disabled') + '">';
	h += '<div id="xApi_dashboard" class="' + (d.xapi_enabled ? '' : 'disabled') + '">';
	h += '<input type="checkbox" ' + (d.xapi_enabled ? '' : 'disabled') + ' name="tsugi_publish_dashboard_in_store" id="tsugi_publish_dashboard_in_store" ' + (d.tsugi_publish_dashboard_in_store ? 'checked' : '') + '>';
	h += '<label for="tsugi_publish_dashboard_in_store">' + PROPERTIES_LIBRARY_TSUGI_PUBLISH_DASHBOARD_IN_STORE + '</label><br></div>';
	h += '<div id="xApi" class="' + (d.published && d.xapi_enabled ? '' : 'disabled') + '">';
	h += '<input type="checkbox" ' + (d.published && d.xapi_enabled ? '' : 'disabled') + ' onchange="javascript:xapi_toggle_useglobal(JSON.stringify(window._ltiDefForToggles))" name="tsugi_xapi_useglobal" id="tsugi_xapi_useglobal" ' + (d.xapi_useglobal ? 'checked' : '') + '>';
	h += '<label for="tsugi_xapi_useglobal">' + PROPERTIES_LIBRARY_TSUGI_XAPI_USEGLOBAL + '</label></div>';
	h += '<div class="textBoxes">';
	h += '<div id="endpoint" class="textBoxGroup ' + (d.xapi_useglobal || !d.xapi_enabled ? 'disabled' : '') + '"><label for="tsugi_xapi_endpoint">' + PROPERTIES_LIBRARY_TSUGI_XAPI_ENDPOINT + '</label>';
	h += '<input type="text" name="tsugi_xapi_endpoint" id="tsugi_xapi_endpoint" value="' + escapeHtml(d.xapi_endpoint) + '" ' + (d.xapi_useglobal || !d.xapi_enabled ? 'disabled' : '') + '></div>';
	h += '<div id="username" class="textBoxGroup ' + (d.xapi_useglobal || !d.xapi_enabled ? 'disabled' : '') + '"><label for="tsugi_xapi_username">' + PROPERTIES_LIBRARY_TSUGI_XAPI_USERNAME + '</label>';
	h += '<input type="text" name="tsugi_xapi_username" id="tsugi_xapi_username" value="' + escapeHtml(d.xapi_username) + '" ' + (d.xapi_useglobal || !d.xapi_enabled ? 'disabled' : '') + '></div>';
	h += '<div id="password" class="textBoxGroup ' + (d.xapi_useglobal || !d.xapi_enabled ? 'disabled' : '') + '"><label for="tsugi_xapi_password">' + PROPERTIES_LIBRARY_TSUGI_XAPI_PASSWORD + '</label>';
	h += '<input type="text" name="tsugi_xapi_password" id="tsugi_xapi_password" value="' + escapeHtml(d.xapi_password) + '" ' + (d.xapi_useglobal || !d.xapi_enabled ? 'disabled' : '') + '></div>';
	h += '<div id="studentid" class="textBoxGroup ' + (d.xapi_enabled ? '' : 'disabled') + '"><label for="tsugi_xapi_student_id_mode">' + PROPERTIES_LIBRARY_TSUGI_XAPI_STUDENT_ID_MODE + '</label>';
	h += '<select name="tsugi_xapi_student_id_mode" id="tsugi_xapi_student_id_mode" ' + (d.xapi_enabled ? '' : 'disabled') + '>';
	var modes = d.xapiStudentModeLabels || [];
	for (var mi = 0; mi < modes.length; mi++) {
		var m = modes[mi];
		h += '<option value="' + m.value + '"' + (String(m.value) === String(d.xapi_student_id_mode) ? ' selected' : '') + '>' + escapeHtml(m.label) + '</option>';
	}
	h += '</select></div>';
	h += '<div class="textBoxGroup"><label for="dashboard_urls">' + PROPERTIES_LIBRARY_TSUGI_DASHBOARD_URLS + '</label>';
	h += '<input name="dashboard_urls" type="text" ' + (d.xapi_enabled ? '' : 'disabled') + ' value="' + escapeHtml(d.dashboard_urls) + '"></div>';
	h += '</div></div></fieldset>';
	h += '<button type="submit" class="xerte_button"><i class="fa fa-floppy-o"></i> ' + PROPERTIES_LIBRARY_TSUGI_UPDATE_BUTTON_LABEL + '</button></form>';
	if (d.message) {
		h += "<p class=\"alert_msg\" aria-live=\"polite\"><i class=\"fa fa-exclamation-circle\" style=\"height: 14px; color:#f86718;\"></i> " + escapeHtml(d.message) + '</p>';
	}
	if (d.published && d.url) {
		h += "<p class='lti_launch_url'>" + PROPERTIES_LIBRARY_TSUGI_LTI_LAUNCH_URL + '<br><a class="lti_launch_url" href="' + escapeHtml(d.url) + '" target="_blank">' + escapeHtml(d.url) + '</a>' + PROPERTIES_LIBRARY_PROJECT_LINKS + '</p>';
		h += '<p>' + PROPERTIES_LIBRARY_TSUGI_LTI13_LAUNCH_URL + '<br><a class="lti_launch_url" href="' + escapeHtml(d.url13) + '" target="_blank">' + escapeHtml(d.url13) + '</a>' + PROPERTIES_LIBRARY_PROJECT_LINKS + '</p>';
	} else if (d.xapi_enabled && d.xapionly_url) {
		h += "<p class='lti_launch_url'>" + PROPERTIES_LIBRARY_TSUGI_LTI_LAUNCH_URL + '<br><a class="lti_launch_url" href="' + escapeHtml(d.xapionly_url) + '" target="_blank">' + escapeHtml(d.xapionly_url) + '</a>' + PROPERTIES_LIBRARY_PROJECT_LINKS + '</p>';
	}
	h += '</div>';
	return h;
}

function properties_ajax_send_prepare(url){
	// Debug: console.warn('properties_ajax_send_prepare is obsolete');
}

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
	propertiesApiPost('properties/publish', { template_id: window.name }, function (d) {
		properties_showPanel(renderPublishPanel(d), 'panelProject');
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
	if(response && response.project){
		properties_showPanel(renderProjectPanel(response.project), 'panelProject');
		if(typeof window_reference==="undefined"){
			window.opener.refresh_workspace();
		}
		else {
			window_reference.refresh_workspace();
		}
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

		propertiesApiPost('properties/share-remove', {
				template_id: template_id,
				id: id,
				user_deleting_self: who_deleted_flag,
				group: group
		}, function(){
			delete_share_stateChanged('', after_sharing_deleted);
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
		propertiesApiPost('properties/group-share-remove', {
				template_id: template_id,
				id: group_id,
				group: true
		 }, function(){
			group_sharing_status_template();
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
	propertiesApiPost('properties/syndication', { tutorial_id: window.name }, function (d) {
		properties_showPanel(renderSyndicationPanel(d), 'panelSyn');
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

	propertiesApiPost('properties/syndication', {
			tutorial_id: window.name,
			synd: synd,
			description: description,
			keywords: keywords,
			category_value: category_value,
			license_value:license_value
	}, function (d) {
		properties_showPanel(renderSyndicationPanel(d), 'panelSyn');
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
	propertiesApiPost('properties/rss', { tutorial_id: window.name }, function (d) {
		properties_showPanel(renderRssPanel(d), 'panelRss');
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
	propertiesApiPost('properties/screen-size', { tutorial_id: window.name }, function (d) {
		screen_size_stateChanged(d.width + '~' + d.height + '~' + d.templateId);
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
	propertiesApiPost('properties/peer', { template_id: window.name }, function (d) {
		 properties_showPanel(renderPeerPanel(d), 'panelPeer');
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
		propertiesApiPost('properties/peer', {
				template_id: window.name,
				peer_status: peeron,
				extra: pswd + email
		}, function (d) {
			properties_showPanel(renderPeerPanel(d), 'panelPeer');
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

	propertiesApiPost('properties/rss', {
			 template_id: window.name,
			 rss: rssing,
			 export: exporting,
			 desc: desc
	 }, function (d) {
		 properties_showPanel(renderRssPanel(d), 'panelRss');
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
	propertiesApiPost('properties/xml', { template_id: window.name }, function (d) {
		 properties_showPanel(renderXmlPanel(d), 'panelXml');
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

	propertiesApiPost('properties/xml', {
			template_id: window.name,
			xml_status: xmlon,
			address: address
	}, function (d) {
		properties_showPanel(renderXmlPanel(d), 'panelXml');
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
	propertiesApiPost('properties/project', { template_id: window.name }, function (d) {
		 properties_showPanel(renderProjectPanel(d), 'panelProject');
	 });
}

function default_engine_toggle(type)
{
	propertiesApiPost('properties/default-engine', {
			template_id: window.name,
			engine: $('input[name="engine"]:checked').attr('id'),
			page:'properties'
	}, function (d) {
		properties_showPanel(renderProjectPanel(d), 'panelProject');
	});
}

function publish_engine_toggle(tag, engine1, engine2)
{
	var engine = engine1;
	if(document.getElementById(tag).src.indexOf("TickBoxOn.gif") >0 )
	{
		engine = engine2;
	}
	propertiesApiPost('properties/default-engine', {
			template_id: window.name,
			engine: engine,
			page:'publish'
	}, function (d) {
		properties_showPanel(renderPublishPanel(d), 'panelProject');
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
	properties_template();
}

     /**
	 *
	 * Function notes template
 	 * This function handles the display of a templates notes
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function notes_template(){
	propertiesApiPost('properties/notes', { template_id: window.name }, function (d) {
		window.propertiesNotesLanguage = d.language;
		properties_showPanel(renderNotesPanel(d), 'panelNotes');
		if (typeof CKEDITOR !== 'undefined') {
			setTimeout(function () { makeeditor(); }, 0);
		}
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
	var new_notes = document.getElementById('notes') ? document.getElementById('notes').value : '';
	propertiesApiPost('properties/notes', {
			template_id: template_id,
			notes: new_notes
	}, function (d) {
		window.propertiesNotesLanguage = d.language;
		properties_showPanel(renderNotesPanel(d), 'panelNotes');
		if (typeof CKEDITOR !== 'undefined') {
			setTimeout(function () { makeeditor(); }, 0);
		}
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
	propertiesApiPost('properties/delete-unused-files', {
			data: files
	}, function () {
			delete_file_stateChanged('');
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
		propertiesApiPost('properties/delete-file', {
				file: encodeURIComponent(file)
		}, function () {
			delete_file_stateChanged('');
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
	propertiesApiPost('properties/media-quota', { template_id: window.name }, function (d) {
		 properties_showPanel(renderMediaPanel(d), 'panelMedia');
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
		propertiesApiPost('properties/rename', {
				template_id: template_id,
				template_name: new_name
		}, function (data) {
			rename_stateChanged(data);
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
	propertiesApiPost('properties/access', { template_id: window.name }, function (d) {
		 properties_showPanel(renderAccessPanel(d), 'panelAccess');
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
		propertiesApiPost('properties/access', data, function (d) {
			properties_showPanel(renderAccessPanel(d), 'panelAccess');
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
	var msg = typeof response === 'object' && response.message ? response.message : String(response);
	document.getElementById('area3').innerHTML = '<p class="alert_msg" aria-live="polite"><i class="fa fa-exclamation-circle" style="height: 14px; color:#f86718;"></i> ' + escapeHtml(msg) + '</p>';

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
	propertiesApiPost('properties/gift-action', {
		 	tutorial_id: tutorial_id,
			 user_id: user_id,
			 action: action
	 }, function (data) {
		 gift_stateChanged(data);
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
			propertiesApiPost('properties/gift-search', {
					search_string: search_string,
					template_id: window.name
			}, function (data) {
				var html = '<ul class="share_form_results">';
				var i, u;
				for (i = 0; i < data.users.length; i++) {
					u = data.users[i];
					html += '<li>' + escapeHtml(u.firstname) + '  ' + escapeHtml(u.surname) + ' (' + escapeHtml(u.username) + ') <button type="button" class="xerte_button" onclick="gift_this_template(\'' + window.name + '\', \'' + u.loginId + '\', \'keep\')"><i class="fa fa-plus"></i>&nbsp;' + NAME_SELECT_GIFT_CLICK + '<span class="sr-only"> (' + escapeHtml(u.firstname) + '  ' + escapeHtml(u.surname) + ' - ' + escapeHtml(u.username) + ')</span></button></li>';
				}
				html += '</ul>';
				$('#area2').html(data.users.length ? html : '<p>' + NAME_SELECT_GIFT_FIND_FAIL + '</p>');
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
			propertiesApiPost('properties/share-search', {
					search_string : search_string,
					template_id: window.name
			}, function (data) {
					var html = '<ul class="share_form_results">';
					var i, g, u;
					for (i = 0; i < data.groups.length; i++) {
						g = data.groups[i];
						html += '<li>' + escapeHtml(g.name) + ' <button type="button" class="xerte_button" onclick="share_this_template(\'' + window.name + '\', \'' + g.groupId + '\', true)"><i class="fas fa-plus"></i>&nbsp;' + NAME_SELECT_CLICK_GROUP + '<span class="sr-only"> (' + escapeHtml(g.name) + ')</span></button></li>';
					}
					for (i = 0; i < data.users.length; i++) {
						u = data.users[i];
						html += '<li>' + escapeHtml(u.firstname) + ' ' + escapeHtml(u.surname) + ' (' + escapeHtml(u.username) + ') <button type="button" class="xerte_button" onclick="share_this_template(\'' + window.name + '\', \'' + u.loginId + '\')"><i class="fa fa-plus"></i>&nbsp;' + NAME_SELECT_CLICK + '<span class="sr-only"> (' + escapeHtml(u.firstname) + ' ' + escapeHtml(u.surname) + ' - ' + escapeHtml(u.username) + ')</span></button></li>';
					}
					html += '</ul>';
					$('#area2').html(data.empty ? '<p>' + NAME_SELECT_DETAILS_FAIL + '</p>' : html);
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
	propertiesApiPost('properties/gift', { template_id: window.name }, function (d) {
		 properties_showPanel(renderGiftPanel(d), 'panelGive');
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

		 propertiesApiPost('properties/share-add', {
				 template_id: template,
				 id: id,
				 role: role,
				 group: group,
		 }, function(data){
			 $('#area2').html("");
			 $('#area3').html('<p>' + escapeHtml(data.message) + '</p>');
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
	propertiesApiPost('properties/sharing-status', {
			 template_id: window.name,
	 }, function (d) {
		 properties_showPanel(renderSharingPanel(d), 'panelShare');
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
	propertiesApiPost('properties/group-sharing-status', {
			template_id: window.name,
	}, function (d) {
		var html = '';
		if (d.canManage) {
			html += '<div><p class="header"><span>' + PROPERTIES_TAB_GROUP_SHARED + '</span></p><p><span>' + SHARING_INSTRUCTION + '</span></p>';
			html += '<form name="user_groups" action="javascript:group_share_this_template(' + window.name + ')"><select name="group" id="group">';
			var i;
			for (i = 0; i < d.availableGroups.length; i++) {
				var g = d.availableGroups[i];
				html += '<option value="' + escapeHtml(g.groupId) + '">' + escapeHtml(g.name) + '</option>';
			}
			html += '</select><button type="submit" class="xerte_button"><i class="fas fa-user-plus"></i>&nbsp;' + SHARING_ADD + '</button></form><p id="area2"></p></div>';
		}
		if (d.empty) {
			html += '<p class="share_files_paragraph"><span>' + SHARING_NOT_SHARED + '</span></p>';
		} else {
			html += '<p class="share_intro_p"><span>' + SHARING_CURRENT + '</span></p><ul class="share_users">';
			var i;
			for (i = 0; i < d.sharedGroups.length; i++) {
				var sg = d.sharedGroups[i];
				html += '<li>' + escapeHtml(sg.name) + ' <label class="sr-only" for="groupRole_' + sg.groupId + '">' + SHARING_ROLE_LABEL + '</label>';
				html += '<select id="groupRole_' + sg.groupId + '" onchange="set_sharing_rights_template(\'' + window.name + '\', \'' + sg.groupId + '\', true)">';
				html += '<option value="co-author_' + sg.groupId + '"' + (sg.role === 'co-author' ? ' selected' : '') + '>' + SHARING_COAUTHOR + '</option>';
				html += '<option value="editor_' + sg.groupId + '"' + (sg.role === 'editor' ? ' selected' : '') + '>' + SHARING_EDITOR + '</option>';
				html += '<option value="read-only_' + sg.groupId + '"' + (sg.role === 'read-only' ? ' selected' : '') + '>' + SHARING_READONLY + '</option></select>';
				html += '&nbsp;<button type="button" class="xerte_button" onclick="javascript:group_delete_sharing_template(\'' + window.name + '\',\'' + sg.groupId + '\')"><i class="fa fa-times"></i> ' + SHARING_REMOVE + '</button></li>';
			}
			html += '</ul>';
		}
		properties_showPanel(html, 'panelShare');
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
	propertiesApiPost('properties/group-share-add', {
			template_id: template,
			group_id: group_id
	}, function () {
		group_share_this_stateChanged('');
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
	propertiesApiPost('properties/export', {
			 template_id: window.name
	 }, function (d) {
		properties_showPanel(renderExportPanel(d), 'panelExport');
	 });
}

function tsugi_template(){
	propertiesApiPost('properties/tsugi', {
			template_id: window.name
	}, function (d) {
		properties_showPanel(renderLtiPanel(d), 'panelLti');
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
		 propertiesApiPost('properties/set-sharing-rights', {
				 template_id: template,
				 id: id,
				 role: role,
				 group: group,
		 }, function(){
				 $('#area3').html('');
				 sharing_status_template();
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
    var urlparams = url.indexOf('?') !== false;
    ifrm.src = url + (urlparams ? '&' : '?') + 'html5=true&flash=false';
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
	propertiesApiPost('properties/lti-update', {
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
	}, function (d) {
		document.getElementById('panelLti').innerHTML = renderLtiPanel(d);
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

