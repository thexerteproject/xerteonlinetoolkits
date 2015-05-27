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

var extend_ajax_php_path = "website_code/php/extend/";

if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function() 
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

// Function properties ajax send prepare
//
// (pl)
// Generic ajax sender for this script

function extend_ajax_send_prepare(url){

   	xmlHttp.open("post",extend_ajax_php_path + url,true);
	xmlHttp.onreadystatechange=extend_stateChanged;
	xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	
}

// Function extend state changed update screen
//
// (pl)
// Generic ajax handler for this script

function extend_stateChanged(){ 

	if (xmlHttp.readyState==4){ 

		if(xmlHttp.responseText!=""){
			
			document.getElementById('admin_area').innerHTML = xmlHttp.responseText;

		}
	}
}

// Function extend state changed alert
//
// (pl)
// Generic ajax handler for this script

function extend_alert_stateChanged(){ 

	if (xmlHttp.readyState==4){ 

		response = xmlHttp.responseText.trim();
		
		if(response!=""){
			
			alert(response);

		}
	}
}

// Function delete sharing template
//
// Version 1.0 
// (pl)

function list_modules(){

	if(setup_ajax()!=false){
	
		var url="list_modules.php";

		xmlHttp.open("post",extend_ajax_php_path + url,true);
		xmlHttp.onreadystatechange=extend_stateChanged;
		xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

		xmlHttp.send('id=1');

		/*xmlHttp.send('template_id=' + active_section + 
					 '&desc=' + document.getElementById(active_section + "desc").value + 
					 '&display=' + document.getElementById(active_section + "display").value + 
					 '&date_uploaded=' + document.getElementById(active_section + "_date_uploaded").value + 
					 '&example=' + document.getElementById(active_section + "example").value + 
					 '&access=' + document.getElementById(active_section + "access").value + 
					 '&active=' + document.getElementById(active_section + "active").value); */		

	}

}

function list_modules(){

	if(setup_ajax()!=false){
	
		var url="list_modules.php";

		xmlHttp.open("post",extend_ajax_php_path + url,true);
		xmlHttp.onreadystatechange=extend_stateChanged;
		xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

		xmlHttp.send('id=1');	

	}

}

function get_module(module_url, module_name){

	if(setup_ajax()!=false){
	
		var url="get_module.php";

		xmlHttp.open("post",extend_ajax_php_path + url,true);
		xmlHttp.onreadystatechange=extend_stateChanged;
		xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

		xmlHttp.send('url=' + module_url + '&name=' + module_name);	

	}

}

function module_activate(module_name){

	if(setup_ajax()!=false){
	
		var url="module_activate.php";

		xmlHttp.open("post",extend_ajax_php_path + url,true);
		xmlHttp.onreadystatechange=extend_stateChanged;
		xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

		xmlHttp.send('name=' + module_name);	

	}

}