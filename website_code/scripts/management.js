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

var function_to_use = null;

var management_ajax_php_path = "website_code/php/management/";

var xwd_url = "http://localhost/xerteonlinetoolkits/modules/xerte/parent_templates/Nottingham/wizards/en-GB/data.xwd";

if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function()
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

// Function properties ajax send prepare
//
// Generic ajax sender for this script

function management_ajax_send_prepare(url){

   	xmlHttp.open("post",management_ajax_php_path + url,true);
	xmlHttp.onreadystatechange=management_stateChanged;
	xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

}

function management_stateChanged(response) {
	if (response != "") {

		document.getElementById('admin_area').innerHTML = response;

		$(".selectize").selectize();

		loadModal();
	}
}

// Function management state changed alert
//
// Generic ajax handler for this script

function management_alert_stateChanged(response){
	response = response.trim();
	if(response!=""){
		alert(response);
	}
}

// Function management state changed alert
//
// Generic ajax handler for this script

function management_delete_sub_stateChanged(response){
	response = response.trim();
	if(response!=""){
		alert(response);
	}
	templates_list();
}

function upload_template(){
	
}

// Function feeds list
//
// remove a share, and check who did it

function feeds_list(){
	function_to_use="feeds";
	$.ajax({
		type: "POST",
		url: "website_code/php/management/syndication.php",
		data: {no_id: 1},
	})
	.done(function(response){
		management_stateChanged(response);
	});
}

// Function remove licenses
//
// remove a share, and check who did it

function remove_feed(id,type){

	if (confirm(REMOVE_PROMPT)) {
		var data = {};
		if(type=="RSS"){
			data = {
				template_id: id,
				rss: 'setfalse'
			};
		}
		if(type=="EXPORT"){
			data = {
				template_id: id,
				export: 'setfalse'
			}
		}
		if(type=="SYND"){
			data = {
				template_id: id,
				synd: 'setfalse'
			}
		}

		$.ajax({
			type: "POST",
			url: "website_code/php/management/syndication_remove.php",
			data: data
		})
		.done(function(response){
			management_stateChanged(response);
		});
	}
}

// Function licenses list
//
// remove a share, and check who did it

function licenses_list(){
	function_to_use="licenses";
	$.ajax({
		type: "POST",
		url: "website_code/php/management/licenses.php",
		data: {no_id: 1},
	})
	.done(function(response){
		management_stateChanged(response);
	});
}

// Function remove licenses
//
// remove a share, and check who did it

function remove_licenses(id){

	if (confirm(REMOVE_PROMPT)) {
		$.ajax({
			type: "POST",
			url: "website_code/php/management/remove_license.php",
			data: {remove: id},
		})
		.done(function(response){
			management_stateChanged(response);
		});
	}
}

// Function categories list
//
// remove a share, and check who did it

function categories_list(){
	function_to_use="categories";
	$.ajax({
		type: "POST",
		url: "website_code/php/management/categories.php",
		data: {no_id: 1},
	})
	.done(function(response){
		management_stateChanged(response);
	});
}

// Function educationlevel list
//
// remove a share, and check who did it

function educationlevel_list(){
	function_to_use="educationlevel";
	$.ajax({
		type: "POST",
		url: "website_code/php/management/educationlevel.php",
		data: {no_id: 1},
	})
		.done(function(response){
			management_stateChanged(response);
		});
}

// Function grouping list
//
// remove a share, and check who did it

function grouping_list(){
	function_to_use="grouping";
    $.ajax({
		type: "POST",
		url: "website_code/php/management/grouping.php",
		data: {no_id: 1},
	})
	.done(function(response){
		management_stateChanged(response);
	});
}

// Function course list
//
// remove a share, and check who did it

function course_list(){
	function_to_use="course";
    $.ajax({
		type: "POST",
		url: "website_code/php/management/course.php",
		data: {no_id: 1},
	})
	.done(function(response){
		management_stateChanged(response);
	});
}


// Function remove category
//
// remove a share, and check who did it

function remove_category(id){

    if (confirm(REMOVE_PROMPT)) {
		$.ajax({
			type: "POST",
			url: "website_code/php/management/remove_category.php",
			data: {remove: id},
		})
		.done(function(response){
			management_stateChanged(response);
		});
    }
}

// Function remove educatonlevel
//
// remove a share, and check who did it

function remove_educationlevel(id){

	if (confirm(REMOVE_PROMPT)) {
		$.ajax({
			type: "POST",
			url: "website_code/php/management/remove_educationlevel.php",
			data: {remove: id},
		})
			.done(function(response){
				management_stateChanged(response);
			});
	}
}
function hide_show_children(children, id_prefix){
	const childrenArray = children.split(",");
	childrenArray.forEach(node => $("#" + id_prefix + node).toggle())
}
// Function remove grouping
//
// remove a share, and check who did it

function remove_grouping(id){

    if (confirm(REMOVE_PROMPT)) {
		$.ajax({
			type: "POST",
			url: "website_code/php/management/remove_grouping.php",
			data: {remove: id},
		})
		.done(function(response){
			management_stateChanged(response);
		});
    }
}

// Function remove course
//
// remove a share, and check who did it

function remove_course(id){

    if (confirm(REMOVE_PROMPT)) {
		$.ajax({
			type: "POST",
			url: "website_code/php/management/remove_course.php",
			data: {remove: id},
		})
		.done(function(response){
			management_stateChanged(response);
		});
    }
}

// Function user templates list
//
// remove a share, and check who did it

function user_templates_list(){
	function_to_use="user_templates";
	$.ajax({
		type: "POST",
		url: "website_code/php/management/user_templates.php",
		data: {no_id: 1},
	})
	.done(function(response){
		management_stateChanged(response);
	});
}

function register()
{
    // Open link to community website
    // The way this is implemented, is to open register.php
    // register.php will verify if a unique id for this installation already exists,
    // If not, it will generate is, and then open the registration form on the community website
    window.open("website_code/php/register.php");
}

// Function users list
//
// remove a share, and check who did it

function users_list(){
	function_to_use="users";
	$.ajax({
		type: "POST",
		url: "website_code/php/management/users.php",
		data: {no_id: 1},
	})
	.done(function(response){
		management_stateChanged(response);
	});
}

// Function template_sync
//
// remove a share, and check who did it

function template_sync(){
	$.ajax({
		type: "POST",
		url: "website_code/php/management/sync.php",
		data: {no_id: 1},
	})
	.done(function(response){
		management_stateChanged(response);
	});
}

// Show first tab that user has permission to see
function show_first_tab()
{
	eval(firsttab);
}

// Function site list
//
// remove a share, and check who did it

function site_list(){
	function_to_use="site";
	$.ajax({
		type: "POST",
		url: "website_code/php/management/site.php",
		data: {no_id: 1},
	})
	.done(function(response){
		management_stateChanged(response);
	});
}

// Function delete sharing template
//
// remove a share, and check who did it

function templates_list(){
	function_to_use="templates";
	$.ajax({
		type: "POST",
		url: "website_code/php/management/templates.php",
		data: {no_id: 1},
	})
	.done(function(response){
		management_stateChanged(response);
	});
}

function themes_list(){
	function_to_use="themes";
	$.ajax({
		type: "POST",
		url: "website_code/php/management/themes.php",
		data: {no_id: 1},
	})
	.done(function(response){
		management_stateChanged(response);
	});
}


// Function delete sharing template
//
// remove a share, and check who did it

function update_template(){
	//bababoeie
	// Get selected pages of the active_section
	// 1. First get non-selected boxes
	var disable_advanced_cb = $("#sub_page_select_disable_advanced_" + active_section + ":checked");
	var disable_advanced = (disable_advanced_cb.length > 0);
	var simple_lo_page_cb = $("#sub_page_select_titleonly_" + active_section + ":checked");
	var simple_lo_page = (simple_lo_page_cb.length > 0);
	var checkboxes_all = $(".sub_page_selection_model_" + active_section);
	var checkboxes_selected = $(".sub_page_selection_model_" + active_section + ":checked");
	var sub_pages = "";
	if(disable_advanced_cb.length > 0){
		sub_pages += "disable_advanced"
	}
	if(simple_lo_page_cb.length > 0){
		if (sub_pages.length > 0)
			sub_pages += ",";
		sub_pages += "simple_lo_page"
	}
	if (checkboxes_all.length != checkboxes_selected.length)
	{
		checkboxes_selected.each(function(index, checkbox){
			if (sub_pages.length > 0)
				sub_pages += ",";
			sub_pages += checkbox.name;
		});
	}
	$.ajax({
		type: "POST",
		url: "website_code/php/management/template_details_management.php",
		data: {
			template_id       : active_section,
			desc              : document.getElementById(active_section + "desc").value,
			display           : document.getElementById(active_section + "display").value,
			date_uploaded     : document.getElementById(active_section + "_date_uploaded").value,
			example           : document.getElementById(active_section + "example").value,
			access            : document.getElementById(active_section + "access").value,
			active            : document.getElementById(active_section + "active").value,
			template_sub_pages: sub_pages
		},
	})
	.done(function(response){
		management_alert_stateChanged(response);
	});

}

// Function update play security
//
// remove a share, and check who did it

function update_play_security(){
	$.ajax({
		type: "POST",
		url: "website_code/php/management/play_security_management.php",
		data: {
			play_id : active_section,
			security: document.getElementById(active_section + "security").value,
			data    : document.getElementById(active_section + "data").value,
			info    : document.getElementById(active_section + "info").value,
		},
	})
	.done(function(response){
		management_alert_stateChanged(response);
	});
}

// Function remove security
//
// remove a share, and check who did it

function remove_security(){

	if(setup_ajax()!=false){

		var answer = confirm(REMOVE_PROMPT);

		if(answer) {
			$.ajax({
				type: "POST",
				url: "website_code/php/management/remove_play_security.php",
				data: {play_id: active_section},
			})
			.done(function (response) {
				management_stateChanged(response);
			});
		}
	}
}

// Function update site
//
// remove a share, and check who did it

function update_site() {

	var copyright = document.getElementById("copyright").value;
	copyright = copyright.split("�").join("AAA");

	$.ajax({
		type: "POST",
		url: "website_code/php/management/site_details_management.php",
		data: {
			site_url: document.getElementById("site_url").value,
			apache: document.getElementById("apache").value,
			site_title: document.getElementById("site_title").value,
			site_name: document.getElementById("site_name").value,
			site_logo: document.getElementById("site_logo").value,
			organisational_logo: document.getElementById("organisational_logo").value,
			welcome_message: document.getElementById("welcome_message").value,
			site_text: document.getElementById("site_text").value,
			tutorial_text: document.getElementById("tutorial_text").value,
			news_text: document.getElementById("news_text").value,
			pod_one: document.getElementById("pod_one").value,
			pod_two: document.getElementById("pod_two").value,
			copyright: document.getElementById("copyright").value,
			demonstration_page: document.getElementById("demonstration_page").value,
			form_string: document.getElementById("form_string").value,
			peer_form_string: document.getElementById("peer_form_string").value,
			feedback_list: document.getElementById("feedback_list").value,
			rss_title: document.getElementById("rss_title").value,
			module_path: document.getElementById("module_path").value,
			website_code_path: document.getElementById("website_code_path").value,
			users_file_area_short: document.getElementById("users_file_area_short").value,
			php_library_path: document.getElementById("php_library_path").value,
			root_file_path: document.getElementById("root_file_path").value,
			play_edit_preview_query: document.getElementById("play_edit_preview_query").value,
			email_error_list: document.getElementById("error_email_list").value,
			error_log_message: document.getElementById("error_log_message").value,
			max_error_size: document.getElementById("max_error_size").value,
			authentication_method: document.getElementById("authentication_method").value,
			ldap_host: document.getElementById("ldap_host").value,
			ldap_port: document.getElementById("ldap_port").value,
			bind_pwd: document.getElementById("bind_pwd").value,
			base_dn: document.getElementById("base_dn").value,
			bind_dn: document.getElementById("bind_dn").value,
			flash_save_path: document.getElementById("flash_save_path").value,
			flash_upload_path: document.getElementById("flash_upload_path").value,
			flash_preview_check_path: document.getElementById("flash_preview_check_path").value,
			flash_flv_skin: document.getElementById("flash_flv_skin").value,
			site_email_account: document.getElementById("site_email_account").value,
			headers: document.getElementById("headers").value,
			email_to_add_to_username: document.getElementById("email_to_add_to_username").value,
			proxy1: document.getElementById("proxy1").value,
			port1: document.getElementById("port1").value,
			site_session_name: document.getElementById("site_session_name").value,
			synd_publisher: document.getElementById("synd_publisher").value,
			synd_rights: document.getElementById("synd_rights").value,
			synd_license: document.getElementById("synd_license").value,
			import_path: document.getElementById("import_path").value,
			enable_mime_check: document.getElementById("enable_mime_check").value,
			mimetypes: document.getElementById("mimetypes").value,
			enable_file_ext_check: document.getElementById("enable_file_ext_check").value,
			file_extensions: document.getElementById("file_extensions").value,
			enable_clamav_check: document.getElementById("enable_clamav_check").value,
			clamav_cmd: document.getElementById("clamav_cmd").value,
			clamav_opts: document.getElementById("clamav_opts").value,
			LDAP_preference: document.getElementById("LDAP_preference").value,
			LDAP_filter: document.getElementById("LDAP_filter").value,
			integration_config_path: document.getElementById("integration_config_path").value,
			admin_username: document.getElementById("admin_username").value,
			admin_password: document.getElementById("admin_password").value,
			site_xapi_endpoint: document.getElementById("site_xapi_endpoint").value,
			site_xapi_key: document.getElementById("site_xapi_key").value,
			site_xapi_secret: document.getElementById("site_xapi_secret").value,
			site_xapi_dashboard_enable: document.getElementById("site_xapi_dashboard_enable").value,
			site_xapi_dashboard_nonanonymous: document.getElementById("site_xapi_dashboard_nonanonymous").value,
			site_xapi_force_anonymous_lrs: document.getElementById("site_xapi_force_anonymous_lrs").value,
			xapi_dashboard_minrole: document.getElementById("xapi_dashboard_minrole").value,
			xapi_dashboard_urls: document.getElementById("xapi_dashboard_urls").value,
			site_xapi_dashboard_period: document.getElementById("site_xapi_dashboard_period").value,
			globalhidesocial: document.getElementById("site_socialicon_globaldisable").value,
			globalsocialauth: document.getElementById("site_socialicon_globalauthorauth").value,
			//default_theme_xerte: document.getElementById("default_theme_xerte").value,
			//default_theme_site: document.getElementById("default_theme_site").value
		},
	})
	.done(function (response) {
		management_alert_stateChanged(response);
	});
}

function update_themes() {

	$.ajax({
		type: "POST",
		url: "website_code/php/management/themes_details_management.php",
		data: {
			default_theme_xerte: document.getElementById("default_theme_xerte").value,
			default_theme_site: document.getElementById("default_theme_site").value,
			default_theme_decision: document.getElementById("default_theme_decision").value
		},
	})
		.done(function (response) {
			management_alert_stateChanged(response);
		});
}


// Function update course
//
// remove a share, and check who did it

function update_course(){
    $.ajax({
		type: "POST",
		url: "website_code/php/management/course_details_management.php",
		data: {
			course_freetext_enabled: document.getElementById("course_freetext_enabled").value
		},
	})
	.done(function (response) {
		management_alert_stateChanged(response);
	});
}


// Function delete sharing template
//
// remove a share, and check who did it

function user_template(){
	$.ajax({
		type: "POST",
		url: "website_code/php/management/user_details_management.php",
		data: {
			user_id: active_section,
			firstname: document.getElementById("firstname" + active_section).value,
			surname  : document.getElementById("surname"+active_section).value,
			username : document.getElementById("username"+active_section).value
		},
	})
	.done(function (response) {
		management_alert_stateChanged(response);
	});
}

// Function play security list
//
// remove a share, and check who did it

function play_security_list(template){
	function_to_use="playsecurity";
	$.ajax({
		type: "POST",
		url: "website_code/php/management/play_security_list.php",
		data: {logon_id: 1},
	})
	.done(function (response) {
		management_stateChanged(response);
	});
}

// Function new LTI Key
//
// add a new LTI Key

function new_LTI_key(){
	$.ajax({
		type: "POST",
		url: "website_code/php/management/new_ltikey.php",
		data: {
			lti_keys_name: document.getElementById("lti_keys_nameNEW").value,
			lti_keys_key : document.getElementById("lti_keys_keyNEW").value,
			lti_keys_secret: document.getElementById("lti_keys_secretNEW").value,
			lti_keys_context_id: document.getElementById("lti_keys_context_idNEW").value
		},
	})
	.done(function (response) {
		management_stateChanged(response);
	});
}

// Function edit LTI Key
//
// edit an LTI Key

function edit_LTI_key(editltikey){
	$.ajax({
		type: "POST",
		url: "website_code/php/management/edit_ltikey.php",
		data: {
			lti_keys_name: document.getElementById("lti_keys_name" + editltikey).value,
			lti_keys_key : document.getElementById("lti_keys_key" + editltikey).value,
			lti_keys_secret: document.getElementById("lti_keys_secret" + editltikey).value,
			lti_keys_id: editltikey,
			lti_keys_context_id: document.getElementById("lti_keys_context_id" + editltikey).value
		},
	})
	.done(function (response) {
		management_stateChanged(response);
	});
}

// Function delete LTI Key
//
// delete an LTI Key

function delete_LTI_key(ltikey) {
	if (confirm("Are you sure you want to delete")) {
		$.ajax({
			type: "POST",
			url: "website_code/php/management/delete_ltikey.php",
			data: {
				lti_keys_id: ltikey
			},
		})
		.done(function (response) {
			management_stateChanged(response);
		});
	}
}

// Function new security
//
// remove a share, and check who did it

function new_security(){
	$.ajax({
		type: "POST",
		url: "website_code/php/management/new_security.php",
		data: {
			newsecurity: document.getElementById("newsecurity").value,
			newdata: document.getElementById("newdata").value,
			newdesc: document.getElementById("newdesc").value
		},
	})
	.done(function (response) {
		management_stateChanged(response);
	});
}

// Function new category
//
// remove a share, and check who did it

function new_category(parentID = ""){
	$.ajax({
		type: "POST",
		url: "website_code/php/management/new_category.php",
		data: {
			newcategory: document.getElementById("newcategory").value,
			parent: parentID
		},
	})
	.done(function (response) {
		management_stateChanged(response);
	});
}

// Function new educationlevel
//
// remove a share, and check who did it
function new_educationlevel(parentID = ""){
	$.ajax({
		type: "POST",
		url: "website_code/php/management/new_educationlevel.php",
		data: {
			parent: parentID,
			educationlevel: document.getElementById("neweducationlevel").value

		},
	})
		.done(function (response) {
			management_stateChanged(response);
		});
}

// Function new grouping
//
// remove a share, and check who did it

function new_grouping(){
	$.ajax({
		type: "POST",
		url: "website_code/php/management/new_grouping.php",
		data: {
			newgrouping: document.getElementById("newgrouping").value
		},
	})
	.done(function (response) {
		management_stateChanged(response);
	});
}

// Function new course
//
// remove a share, and check who did it

function new_course(){
	$.ajax({
		type: "POST",
		url: "website_code/php/management/new_course.php",
		data: {
			newcourse: document.getElementById("newcourse").value
		},
	})
	.done(function (response) {
		management_stateChanged(response);
	});
}

// Function new category
//
// remove a share, and check who did it

function new_license(){
	$.ajax({
		type: "POST",
		url: "website_code/php/management/new_license.php",
		data: {
			newlicense: document.getElementById("newlicense").value
		},
	})
	.done(function (response) {
		management_stateChanged(response);
	});
}

// Function error list
//
// remove a share, and check who did it

function errors_list(template){
	function_to_use="errors";
	$.ajax({
		type: "POST",
		url: "website_code/php/management/error_list.php",
		data: {
			logon_id: 1
		},
	})
	.done(function (response) {
		management_stateChanged(response);
	});
}

// Function delete error logs
//
// deletes all error logs

function delete_error_logs(){
	if (confirm(DELETE_PROMPT)) {
		$.ajax({
			type: "POST",
			url: "website_code/php/management/delete_error_list.php",
			data: {
				logon_id: 1
			},
		})
		.done(function (response) {
			management_stateChanged(response);
		});
	}
}

// Function delete sharing template
//
// remove a share, and check who did it

function delete_template(template){
	$.ajax({
		type: "POST",
		url: "website_code/php/management/delete_template.php",
		data: {
			template_id: template
		},
	})
	.done(function (response) {
		management_stateChanged(response);
	});
}


var iframe_language_interval = 0;

function iframe_language_check_upload(){

    if(window["upload_iframe"].document.body.innerHTML!=""){

        if(window["upload_iframe"].document.body.innerHTML.indexOf("****")!=-1){

            clearInterval(iframe_language_interval);

            string = window["upload_iframe"].document.body.innerHTML.substr(window["upload_iframe"].document.body.innerHTML.indexOf(">")+1);

            string = string.substr(0,string.length-4);

            alert(string);

            refresh_languages();

            window["upload_iframe"].document.body.innerHTML="";

        }else{

            clearInterval(iframe_language_interval);

            string = window["upload_iframe"].document.body.innerHTML.substr(window["upload_iframe"].document.body.innerHTML.indexOf(">")+1);

            alert(PHP_ERROR + " - " + string);

        }

    }

}

var iframe_language_interval = 0;

function iframe_language_check(){

    if(window["upload_iframe"].document.body.innerHTML!=""){

        if(window["upload_iframe"].document.body.innerHTML.indexOf("****")!=-1){

            clearInterval(iframe_language_interval);

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

            clearInterval(iframe_language_interval);

            string = window["upload_iframe"].document.body.innerHTML.substr(window["upload_iframe"].document.body.innerHTML.indexOf(">")+1);

            alert(PHP_ERROR + " - " + string);

        }

    }

}

/**
 *
 * Function iframe upload check initialise
 * This function starts checking the iframe for the response text every 500 milliseconds (used by the media quota import page).
 * @version 1.0
 * @author Patrick Lockley
 */

function iframe_upload_language_check_initialise(){

    iframe_language_interval = setInterval("iframe_language_check_upload()",500);

}

function iframe_language_check_initialise(){

    iframe_language_interval = setInterval("iframe_language_check()",500);

}

function management_languageChanged(response){
	response = response.trim();
	if(response!=""){
		p = response.indexOf("****");
		if (p != -1)
		{
			msg = response.substr(0, p);
			innerhtml = response.substr(p+4);
			elmnt = document.getElementById('languagedetails_child');
			elmnt.innerHTML = innerhtml;
			if (msg != "")
				alert(msg);
		}
		else
		{
			alert(response);
		}
	}
}

function delete_language(code){
    var answer = confirm(MANAGEMENT_DELETE_LANGUAGE + code);
    if (answer)
    {
		$.ajax({
			type: "POST",
			url: "website_code/php/language/delete_language.php",
			data: {
				code: code
			},
		})
		.done(function (response) {
			management_languageChanged(response);
		});
    }
}

function refresh_languages()
{
	$.ajax({
		type: "POST",
		url: "website_code/php/language/refresh_language.php",
	})
	.done(function (response) {
		management_languageChanged(response);
	});
}
// Function give a project
//
// remove a share, and check who did it

function change_owner(template_id){
	var login = (document.getElementById(template_id + "_new_owner").value);
	$.ajax({
		type: "POST",
		url: "website_code/php/management/change_owner.php",
		data: {
			template_id: template_id,
			new_user   : login
		},
	})
		.done(function (response) {
			change_owner_stateChanged(response);
		});

}

// Function give a project
//
// remove a share, and check who did it

function change_owner_stateChanged(response){

	if(response!=""){
		alert(USER_CHANGED);
		users_list();
	}else{
		alert("ERROR " + response);
	}
}

function templates_get_details(user_id, template_id)
{
	var tag = user_id + "template" + template_id;
	var child_tag = tag + "_child";
	var button_tag = tag + "_btn";
	if(document.getElementById(child_tag).style.display=="block"){
		// details are displayed at the moment, hide
		document.getElementById(child_tag).style.display="none";
		document.getElementById(button_tag).innerHTML = MANAGEMENT_SHOW;
	}
	else
	{
		var url="get_user_template_details.php";
		//retrieve details and show
		$.ajax({
			method: 'GET',
			url: management_ajax_php_path + url,
			data: {
				'user_id': user_id,
				'template_id': template_id,
			}
		})
		.done(function (data) {
			$('#' + child_tag).html(data);
			document.getElementById(child_tag).style.display="block";
			document.getElementById(button_tag).innerHTML = MANAGEMENT_HIDE;
		});
	}
}

var active_section = null;

function templates_display(tag){

	var child_tag = tag + "_child";
    var button_tag = tag + "_btn";
	active_section = document.getElementById(tag).getAttribute("savevalue");

	if(document.getElementById(child_tag).style.display=="block"){

		document.getElementById(child_tag).style.display="none";
	    document.getElementById(button_tag).innerHTML = MANAGEMENT_SHOW;
	}else{

		document.getElementById(child_tag).style.display="block";
        document.getElementById(button_tag).innerHTML = MANAGEMENT_HIDE;

	}

}



function templates_delete_sub(id){
	if (confirm(REMOVE_SUB)) {
		$.ajax({
			type: "POST",
			url: "website_code/php/management/template_delete_sub.php",
			data: {
				template_id: id
			},
		})
		.done(function (response) {
			management_delete_sub_stateChanged(response);
		});
	}
}

function save_changes(){

	switch(function_to_use){
		case "site":update_site();
			break;
		case "themes":update_themes();
			break;
		case "templates":update_template();
			break;
		case "users":user_template();
			break;
		case "playsecurity":update_play_security();
			  break;
		case "course": update_course();
			break;
		default: break;


	}

}

function theme_display(tag){

	var child_tag = tag + "_child";
	var button_tag = tag + "_btn";
	if(document.getElementById(child_tag).style.display=="table"){
		document.getElementById(child_tag).style.display="none";
		document.getElementById(button_tag).innerHTML = MANAGEMENT_SHOW;
	}else{
		document.getElementById(child_tag).style.display="table";
		document.getElementById(button_tag).innerHTML = MANAGEMENT_HIDE;
	}
}

function list_templates_for_user(tag){

    var user = document.getElementById(tag).value;

	$.ajax({
		type: "POST",
		url: "website_code/php/management/get_templates_for_user.php",
		data: {
			user_id: user
		},
	})
	.done(function (response) {
		list_templates_for_user_stateChanged(response);
	});
}

function list_templates_for_user_stateChanged(response){
	if(response!=""){
		document.getElementById('usertemplatelist').innerHTML = response;
	}else{
		alert("ERROR " + response);
	}
}

function loadModal() {

    var modal = document.getElementById("nottingham_modal");
    var btn = document.getElementById("nottingham_btn");

    if (modal !== null) {
        btn.onclick = function () {
            modal.style.display = "block";
            load(modal);
        }
    }
}

function load(modal)
{
	$.get("website_code/php/management/query_templates.php", {queryData: 'modal'}, function(data){
		var x = data;

        var span = document.getElementsByClassName("close");
        var template_content = $(".template-content");

        if(span.length !== 0)
        {
            span[0].onclick = function () {
                modal.style.display = "none";
                template_content.empty();
            }
        }

        window.onclick = function(event)
        {
            if(event.target == modal)
            {
                modal.style.display = "none";
                template_content.empty();
            }
        };

        var templates = JSON.parse(x);
        for (var i=0; i<templates.length; i++) {
        	if(templates[i]["template_name"] === "Nottingham") {continue;}
			else{
                var paragraph = $("<p></p>");
                paragraph.append(templates[i]["template_name"]);
                template_content.append(paragraph, $("<br>"));
			}
        };

        $.ajax({
			type: "GET",
			url: xwd_url,
			dataType: "text",
			success: function(data) {
				console.log($($.parseXML(data)).find("wizards"));
			},
			error: function(data){
				console.log("error");
			}
		});
	});
}

function search_user_templates(tag){

	var search = document.getElementById(tag).value;
	$.ajax({
		type: "POST",
		url: "website_code/php/management/search_user_templates.php",
		data: {
			search: search
		},
	})
	.done(function (response) {
		search_user_templates_stateChanged(response);
	});
}

function search_user_templates_stateChanged(response){
	if(response!=""){
		document.getElementById('usertemplatelist').innerHTML = response;
	}else{
		alert("ERROR " + response);
	}
}

function transfer_user_templates(tag){

	var user = $('#' + tag).val();
	$.ajax({
		type: "POST",
		url: "website_code/php/management/transfer_user_templates.php",
		data: {
			user_id: user
		},
	})
	.done(function (response) {
		transfer_user_templates_stateChanged(response);
	});
}

function transfer_user_templates_stateChanged(response){
	if(response!=""){
		$('#transferownership').html(response).show();
	}else{
		alert("ERROR " + response);
	}
}

function do_transfer_user_templates(user_id, tag_user_select, tag_transfer_private, tag_transfer_shared_folders, tag_delete_user)
{
	var new_user = $('#' + tag_user_select).val();
	var transfer_private = $('#' + tag_transfer_private).prop('checked');
	var transfer_shared_folders = $('#' + tag_transfer_shared_folders).prop('checked');
	var delete_user = $('#' + tag_delete_user).prop('checked');

	$("#transfer_result").show();

	$.ajax({
		type: "POST",
		url: "website_code/php/management/do_transfer_user_templates.php",
		data: {
			olduserid: user_id,
			newuserid: new_user,
			transfer_private: transfer_private,
			transfer_shared_folders: transfer_shared_folders,
			delete_user: delete_user
		},
	})
	.done(function (response) {
		do_transfer_user_templates_stateChanged(response);
	});
}

function do_transfer_user_templates_stateChanged(response){
	if(response!=""){
		$('#transferownership').html(response).show();
	}else{
		alert("ERROR " + response);
	}
}

function transfer_user_templates_closepanel()
{
	$("#transferownership").html("");
	user_templates_list();
}

function sub_select_change_all(template_type_id)
{
	// Toggle all checkboxes based on template_type_id
	var checked = $("#sub_page_select_all_" + template_type_id).is(":checked");
	// Toggle all checkboxes with class sub_page_selection_model_<template_type_id>
	$(".sub_page_selection_model_" + template_type_id).prop("checked", checked);
}


// Function user_groups list
// Create/delete groups, add/remove users to/from groups
function user_groups_list(){
	function_to_use="user_groups";
	$.ajax({
		type: "POST",
		url: "website_code/php/management/user_groups.php",
		data: {
			no_id: 1
		},
	})
	.done(function (response) {
		management_usergroupStateChanged(response);
	});
}

// Function management state changed update screen
//
// Specific ajax handler for user_groups_list

function management_usergroupStateChanged(response) {
	if (response != "") {

		document.getElementById('admin_area').innerHTML = response;
		loadModal();

		$('#list_user').selectize({
			plugins: ['remove_button'],
			hideSelected: false
		});
	}
}

function list_group_members(tag, id=-1){

	var group = document.getElementById(tag).value;
	if (id != -1){
		group = id;
	}

	if (group != "") {
		$.ajax({
			type: "POST",
			url: "website_code/php/management/get_group_members.php",
			data: {
				group_id: group
			},
		})
		.done(function (response) {
			list_group_members_stateChanged(response);
		})
		.fail(function(){
			alert(USER_LIST_FAIL);
		});
	}
}


function list_group_members_stateChanged(response){
	if(response!=""){
		document.getElementById('memberlist').innerHTML = response;
	}else{
		alert("ERROR " + response);
	}
}

function add_member(login_id, group_id){
	var group = document.getElementById(group_id).value;
	var login = $("#" + login_id).val(); //array

	if (group != "")
	{
		$.ajax({
			type: "POST",
			url: "website_code/php/management/add_member.php",
			data: {
				login_id: login,
				group_id: group
			},
		})
		.done(function (response) {
			list_group_members(group_id);
		})
		.fail(function(){
			alert(ADD_MEMBER_FAIL);
		});
	}
}


function delete_member(login_id, group_id){

	var group = document.getElementById(group_id).value;

	if (group != "")
	{
		$.ajax({
			type: "POST",
			url: "website_code/php/management/check_delete_member.php",
			data: {
				login_id: login_id,
				group_id: group,
			},
		})
		.done(function(owns_templates) {
			do_it = true;
			if (owns_templates != "OK") {
				do_it = confirm(owns_templates);
			}
			if (do_it) {
				$.ajax({
					type: "POST",
					url: "website_code/php/management/delete_member.php",
					data: {
						login_id: login_id,
						group_id: group
					},
				})
				.done(function (response) {
					list_group_members(group_id);
				})
				.fail(function () {
					alert(DELETE_MEMBER_FAIL);
				})
			}
		});
	}
}



function add_new_group( newgroup ){
	var group_name = document.getElementById(newgroup).value

	if (group_name != "")
	{
		if (confirm(CREATE_GROUP + " (" + group_name + ")")) {
			$.ajax({
				type: "POST",
				url: "website_code/php/management/create_group.php",
				data: {
					group_name: group_name,
				},
			})
				.done(function (response) {
					add_new_group_stateChanged(response);
				})
				.fail(function () {
					alert(GROUP_CREATE_FAIL);
				});
		}
	}
}

function add_new_group_stateChanged(response){
	if(response!=""){
		$("#group").html(response).show();
		$("#newgroup").val('');
		list_group_members('group', $("#group").val());
	}else{
		alert(GROUP_EXISTS);
    }
}


function delete_group( group_tag ){
	var group_id = document.getElementById(group_tag).value
	if (group_id != "")
	{
		if (confirm(DELETE_GROUP)) {
			$.ajax({
				type: "POST",
				url: "website_code/php/management/delete_group.php",
				data: {
					group_id: group_id,
				},
			})
			.done(function (response) {
				user_groups_list();
			})
			.fail(function () {
				alert(GROUP_DELETE_FAIL);
				user_groups_list();
			});
		}
	}
}

function changeUserSelection_active_users(mode='previous', include_header=false){
	let selected_users = $("#users");
	let oldmode = $("#users").data("mode");
	if (oldmode !== undefined && mode == 'previous') {
		mode = oldmode;
		$("#users").data("mode", mode);
	}
	else
	{
		$("#users").data("mode", mode);
	}
	if(selected_users){
		$.ajax({
			type: "POST",
			url: "website_code/php/management/get_active_users.php",
			data : {
				mode: mode,
				include_header: include_header,
				userids: selected_users.val(),
			},
		}).done(function (response){
			if (include_header) {
				document.getElementById("active_user_management").innerHTML = response;
				$(".selectize").selectize();
			}
			else {
				document.getElementById("user_selection").innerHTML = response;
			}
		}).fail(function (){
			alert("something went wrong");
		});
	}
}

function change_user_active(user_id){
	let user_disabled = $("#user_disabled" + user_id);
	if (user_disabled) {
		disabled = user_disabled.prop("checked");
		$.ajax({
			type: "POST",
			url: "website_code/php/management/change_user_active.php",
			data : {
				user_id: user_id,
				disabled: disabled,
			},
		}).done(function (response){
			if (response != "") {
				alert(response);
			}
			changeUserSelection_active_users('previous', true);
		}).fail(function (){
			alert("something went wrong");
		});
	}
}

function change_user_active_state(state)
{
	let selected_users = $("#users");
	if(selected_users){
		$.ajax({
			type: "POST",
			url: "website_code/php/management/change_users_active.php",
			data : {
				state: state,
				userids: selected_users.val(),
			},
		}).done(function (response){
			changeUserSelection_active_users('previous', true);
		}).fail(function (){
			alert("something went wrong");
		});
	}
}

function change_user_active_mode(mode) {
	if (mode == 'all'|| mode == 'active' || mode == 'inactive') {
		changeUserSelection_active_users(mode, true);
	}
	else {
		alert("Invalid mode selected: " + mode);
	}
}

function disable_users_based_on_last_login()
{
	let last_login_date = $("#disable_users_last_login_date");
	if (last_login_date && last_login_date.val() != "") {

		$.ajax({
			type: "POST",
			url: "website_code/php/management/retrieve_users_based_on_last_login.php",
			data : {
				last_login_date: last_login_date.val(),
			},
		}).done(function (response){
			if (response != "") {
				if (confirm(response))
				{
					$.ajax({
						type: "POST",
						url: "website_code/php/management/disable_users_based_on_last_login.php",
						data : {
							last_login_date: last_login_date.val(),
						},
					}).done(function(response){
						if (response != "") {
							alert(response);
						}
						changeUserSelection_active_users('previous', true);
					})
				}
			}
		}).fail(function (){
			alert("something went wrong");
		});
	}
	else {
		alert("Please select a date to disable users based on their last login.");
	}
}
function changeUserSelection_user_roles(){
		let role_user_select = document.getElementById("user_roles");
		if(role_user_select){
				$.ajax({
						type: "POST",
						url: "website_code/php/management/get_user_roles.php",
						data : {
								userid: role_user_select.value,
						},
				}).done(function (response){
						document.getElementById("manage_user_roles").innerHTML = response;
						$(".selectize").selectize();
				}).fail(function (){
						alert("something went wrong");
				});
		}
}




function manage_user_roles_select(user_id)
{
	$.ajax({
		type: "POST",
		url: "website_code/php/management/get_user_roles.php",
		data : {
			userid: user_id
		},
	}).done(function (response){
		document.getElementById("manage_user_roles").innerHTML = response;
		$("#user_roles").selectize();
	}).fail(function (){
		alert("something went wrong");
	});
}

function update_roles(userid){
		// usage of fromdata because you don't have to hard code the roles
		let formdata = new FormData(document.getElementById("roles"));
		let data = {};
		formdata.forEach((value, key) =>{
				data[key] = value == "on"? true : value;
		});
		if(userid != null){
				if(confirm("are you sure want to modify the roles of the user")){
						data["id"]=userid;
						$.ajax({
								type: "POST",
								url: "website_code/php/management/modify_roles.php",
								data: data
						}).done(function (response) {
								alert(response);
								users_list();
						}).fail(function () {
								alert("failed to load modify_roles.php");
								users_list();
						});
						
				}
		}
}

function template_submit()
{
	var form = document.getElementById("form-template-upload");
	var formData = new FormData(form);
	$("#upload-button").prop('disabled', true);
	$.ajax({
		type: "POST",
		processData: false,
		contentType: false,
		url: "website_code/php/management/upload.php",
		data: formData
	})
		.done(function(response){
			//$("#upload-button").prop('disabled', false);
			$("body").css("cursor", "default");
			alert(response);
			// Refresh templates list
			templates_list();
		})
		.fail(function(response){
			//$("#upload-button").prop('disabled', false);
			$("body").css("cursor", "default");
			alert(response);
		});
}

function theme_submit(){
	var form = document.getElementById("form-theme-upload");
	var formData = new FormData(form);
	$.ajax({
		type: "POST",
		processData: false,
		contentType: false,
		url: "website_code/php/management/upload_theme.php",
		data: formData
	})
		.done(function(response){
			$("body").css("cursor", "default");
			alert(response);
			themes_list()
		})
		.fail(function(response){
			$("body").css("cursor", "default");
			alert(response);
		});
}

function theme_disable(theme, type, displayname, btn_enable_txt, btn_disable_txt){
	if (window.confirm(THEME_DELETE)) {
		$.ajax({
			type: "POST",
			url: "website_code/php/management/theme_enable_disable.php",
			data: {
				theme: theme,
				type: type,
			},
		})
		.done(function (response) {
			$('#'+ type + '_' + theme).html("<s>" + displayname + " (" + theme + ")</s><button class='xerte_button theme_enable' onclick=\"javascript:theme_enable('" + theme + "','" + type + "','" + displayname + "','" + btn_enable_txt + "','" + btn_disable_txt + "')\">" + btn_enable_txt + "</button>");
		});
	}
}

function theme_enable(theme, type, displayname, btn_enable_txt, btn_disable_txt){
	$.ajax({
		type: "POST",
		url: "website_code/php/management/theme_enable_disable.php",
		data: {
			theme: theme,
			type: type,
		},
	})
	.done(function (response) {
		$('#'+ type + '_' + theme).html(displayname + " (" + theme + ")<button class='xerte_button theme_disable' onclick=\"javascript:theme_disable('" + theme + "','" + type + "','" + displayname + "','" + btn_enable_txt + "','" + btn_disable_txt + "')\">" + btn_disable_txt + "</button>");
	});
}

 
