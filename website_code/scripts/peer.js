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
	 * peer, javascript for the folder properties tab
	 *
	 * @author Patrick Lockley
	 * @version 1.0
	 * @package
	 */

	 /**
	 * 
	 * Function peer state changed
 	 * This function handle the response from the ajax query
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function peer_stateChanged(){ 

	if (xmlHttp.readyState==4){ 
		
		document.getElementById("pv_feedback").innerHTML = xmlHttp.responseText;
		
	}
}

	 /**
	 * 
	 * Function send review
 	 * This function handle the response from the ajax query
 	 * @param string user = the user to provide feedback too
 	 * @param string template_id = the id of the template
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function send_review(retouremail,template_id){

	if(setup_ajax()!=false){

		url="website_code/php/peer/peer_review.php";

   		xmlHttp.open("post",url,true);
		xmlHttp.onreadystatechange=peer_stateChanged;
		xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

		xmlHttp.send('retouremail=' + retouremail + '&template_id=' + template_id + '&feedback=' + document.peer.response.value);

	}	

}