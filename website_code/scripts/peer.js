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
 * Function send review
 * This function handle the response from the ajax query
 * @param string user = the user to provide feedback too
 * @param string template_id = the id of the template
 * @version 1.0
 * @author Patrick Lockley
 */

//function send_review(retouremail,template_id){
function send_review(){
	// Cleanup peer review text
	var response = $('<div>').html(document.peer.response.value);
	var response_cleantxt = $.trim(response.text());
	$.ajax({
		type: "POST",
		url: "website_code/php/peer/peer_review.php",
		data: {feedback: response_cleantxt},
	})
	.done(function(response){
		document.getElementById("pv_feedback").innerHTML = response;
	});

}
