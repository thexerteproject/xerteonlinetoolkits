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
	 * logout, javascript for the code to log a user out
	 *
	 * @author Patrick Lockley
	 * @version 1.0
	 * @package
	 */

	 /**
	 * 
	 * Function logout ajax send prepare
 	 * This function sends the ajax request to handle the logging out PHP
	 * @param string url = the extra part of the url for this ajax query
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function logout_ajax_send_prepare(url){

   	xmlHttp.open("post", ajax_php_path + url,true);
	xmlHttp.onreadystatechange=logout_stateChanged;
	xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	
}
	 /**
	 * 
	 * Function logout state changed
 	 * This function redirects the user once logged out
	 * @param string url = the extra part of the url for this ajax query
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function logout_stateChanged(){ 

    if (xmlHttp.readyState == 4) {

        if (window.location) {

            window.location = site_url;

        } else {

            window.location(site_url);

        }

    }
}

	 /**
	 * 
	 * Function logout
 	 * This function sorts out the URL for most of the queries in the folder properties window
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function logout(slo){
	
	/*
	* Check no windows are open
	*/

    var url = "logout.php";
    if (slo)
    {
        if (window.location) {

            window.location = ajax_php_path + url;

        } else {

            window.location(ajax_php_path + url);

        }
    }
    else {
        if (edit_window_open.length != 0) {

			var answer = confirm(OPEN_WINDOWS_START + ' ' + edit_window_open.length + ' ' + OPEN_WINDOWS_END);

			if (answer) {

				$.ajax({
					type: "POST",
					url: "website_code/php/logout.php",
				})
				.done(function (response) {
					if (window.location) {
						window.location = site_url;
					} else {
						window.location(site_url);
					}
				});
			}
		} else {

			$.ajax({
				type: "POST",
				url: "logout.php",
			})
			.done(function (response) {
				if (window.location) {
					window.location = site_url;
				} else {
					window.location(site_url);
				}
			});
        }
    }
}
