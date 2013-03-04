	/**	
	 * 
	 * peer, javascript for the folder properties tab
	 *
	 * @author Patrick Lockley
	 * @version 1.0
	 * @copyright Copyright (c) 2008,2009 University of Nottingham
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
		
		document.getElementById("feedback").innerHTML = xmlHttp.responseText;
		
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