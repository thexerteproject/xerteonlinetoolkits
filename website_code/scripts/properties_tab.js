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

	 /**
	 * 
	 * Function properties ajax send prepare
 	 * This function sorts out the URL for most of the queries in the properties window
	 * @param string url = the extra part of the url for this ajax query
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function properties_ajax_send_prepare(url){

   	xmlHttp.open("post",properties_ajax_php_path + url,true);
	xmlHttp.onreadystatechange=properties_stateChanged;
	xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	
}

	 /**
	 * 
	 * Function properties state changed
 	 * This function sorts out the page display for most of the properties ajax queries
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function properties_stateChanged(){ 

	if (xmlHttp.readyState==4){ 

		if(xmlHttp.responseText!=""){
			
			document.getElementById('dynamic_area').innerHTML = xmlHttp.responseText;

		}
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

	if(setup_ajax()!=false){

			var url="publish.php";

			xmlHttp.open("post",properties_ajax_php_path + url,true);
			xmlHttp.onreadystatechange=properties_stateChanged;
			xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xmlHttp.send('template_id=' + window.name); 

	}

}

 /**
	 * 
	 * Function screen size state changed
 	 * This function handles the embed code for the properties panel
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function screen_size_stateChanged(){ 

	if (xmlHttp.readyState==4){ 
			
		if(xmlHttp.responseText!=""){
			
			temp = xmlHttp.responseText.toString().split("~");

			document.getElementById('dynamic_area').innerHTML += "<p>" + EMBED_CODE + "</p><form><textarea rows='10' cols='40'><iframe src='http://" + site_url + "play_" + window.name +"' width='" + temp[0] + "' height='" + temp[1] + "' frameborder=\"0\"></iframe></textarea></form>";


		}
	}
} 

 /**
	 * 
	 * Function name share state changed
 	 * This function handles the display for the drop down name list for the sharing tab
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function name_share_stateChanged(){ 

	if (xmlHttp.readyState==4){ 
			
		if(xmlHttp.responseText!=""){
			
			document.getElementById('area2').innerHTML = xmlHttp.responseText;

		}
	}
}

 /**
	 * 
	 * Function share this state changed
 	 * This function handles the response from making a share request
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function share_this_stateChanged(){ 

	if (xmlHttp.readyState==4){ 
			
		if(xmlHttp.responseText!=""){
			
			document.getElementById('area2').innerHTML = "";
			document.getElementById('area3').innerHTML = xmlHttp.responseText;
			sharing_status_template();

		}
	}
}

 /**
	 * 
	 * Function delete share state changed
 	 * This function handles the deletion of a share
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function delete_share_stateChanged(){ 

	if (xmlHttp.readyState==4){ 

		sharing_status_template();

		if(after_sharing_deleted){
            if(typeof window_reference==="undefined"){
                window.opener.refres_workspace();
            }
            else {
                window_reference.refresh_workspace();
            }

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

function share_rights_stateChanged(){ 

	if (xmlHttp.readyState==4){ 
			
		sharing_status_template();

	}
}

 /**
	 * 
	 * Function rename state changed
 	 * This function handles the results of a rename action
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function rename_stateChanged(){ 

	if (xmlHttp.readyState==4){ 
		
		if(xmlHttp.responseText!=""){

			/*
			* split the two returning bits of info (the html and the new file name)
			*/
			
			array_response = xmlHttp.responseText.split("~~**~~");

			document.getElementById('dynamic_area').innerHTML = array_response[2];

			/*
			* set the file name in the file_area
			*/

			if(typeof window_reference==="undefined"){
			
				current_innerHTML = window.opener.document.getElementById("file_" + window.name).innerHTML;

				future_innerHTML = current_innerHTML.substr(0,current_innerHTML.lastIndexOf(">")+1) + array_response[1];
                
                window.opener.document.getElementById("file_" + window.name).innerHTML = future_innerHTML;
                
            }else{
                
				current_innerHTML = window_reference.document.getElementById("file_" + window.name).innerHTML;

				future_innerHTML = current_innerHTML.substr(0,current_innerHTML.lastIndexOf(">")+1) + array_response[1];
				
                window_reference.document.getElementById("file_" + window.name).innerHTML = future_innerHTML;
                
            }
			
			

		}

	}		

}

var after_sharing_deleted = false;

     /**
	 * 
	 * Function delete sharing template
 	 * This function handles the deletion of a share by a user
	 * @param string template_id = window type to open
 	 * @param string user_id = user we are removing
  	 * @param string who_deleted_flag = obsolete ***** CHECK ******
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function delete_sharing_template(template_id,user_id,who_deleted_flag){

	var answer = confirm(SHARING_CONFIRM);

	if(answer){

		if(who_deleted_flag){	

			after_sharing_deleted = true;
		
		}else{	

			after_sharing_deleted = true;

		}

		if(setup_ajax()!=false){

			var url="remove_sharing_template.php";

			xmlHttp.open("post",properties_ajax_php_path + url,true);
			xmlHttp.onreadystatechange=delete_share_stateChanged;
			xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

			if(who_deleted_flag){

				xmlHttp.send('template_id=' + template_id +'&user_id=' + user_id + '&user_deleting_self=true'); 

			}else{

				xmlHttp.send('template_id=' + template_id +'&user_id=' + user_id + '&user_deleting_self=false'); 

			}

		}

	}

}

     /**
	 * 
	 * Function syndication template
 	 * This function displays a templates syndication options
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function syndication_template(){

	if(setup_ajax()!=false){
    
		var url="syndication_template.php";

		xmlHttp.open("post",properties_ajax_php_path + url,true);
		xmlHttp.onreadystatechange=rss_stateChanged;
		xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

		xmlHttp.send('tutorial_id=' + window.name); 

	}

}

     /**
	 * 
	 * Function syndication change template
 	 * This function handles the setting of syndication settings being changed
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function syndication_change_template(){

	synd = "false";

	if(document.getElementById("syndon").src==(site_url + "website_code/images/TickBoxOn.gif")){

		synd="true";

	}

	category_value = document.getElementById("category_list").value;

	license_value = document.getElementById("license_list").value;

	description = document.getElementById("description").value;

	keywords = document.getElementById("keywords").value;

	if(setup_ajax()!=false){

		var url="syndication_change_template.php";

		properties_ajax_send_prepare(url);
    
		xmlHttp.send('tutorial_id=' + window.name + '&synd=' + synd + '&description=' + description + '&keywords=' + keywords + '&category_value=' + category_value + '&license_value=' + license_value); 

	}

}

     /**
	 * 
	 * Function rss template
 	 * This function handles the setting of RSS templates
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function rss_template(){

	if(setup_ajax()!=false){
    
		var url="rss_template.php";

		xmlHttp.open("post",properties_ajax_php_path + url,true);
		xmlHttp.onreadystatechange=rss_stateChanged;
		xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

		xmlHttp.send('tutorial_id=' + window.name); 

	}

}

     /**
	 * 
	 * Function rss state changed
 	 * This function handles the response from the ajax query
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function rss_stateChanged(){

	if (xmlHttp.readyState==4){ 

		if(xmlHttp.responseText!=""){
					
			document.getElementById('dynamic_area').innerHTML=xmlHttp.responseText;


		}
		
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

	if(setup_ajax()!=false){
    
		var url="screen_size_template.php";

		xmlHttp.open("post",properties_ajax_php_path + url,true);
		xmlHttp.onreadystatechange=screen_size_stateChanged;
		xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

		xmlHttp.send('tutorial_id=' + window.name); 

	}

}

     /** *********OBSOLETE***************
	 * 
	 * Function delete sharing template
 	 * This function handles the deletion of a share by a user
	 * @param string template_id = window type to open
 	 * @param string user_id = user we are removing
  	 * @param string who_deleted_flag = obsolete ***** CHECK ******
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function links_template(){

	if(setup_ajax()!=false){
    
		var url="links_template.php";

		properties_ajax_send_prepare(url);

		xmlHttp.send('template_id=' + window.name); 

	}

}

     /**
	 * 
	 * Function peer template
 	 * This function handles the display of the templates peer review properties
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function peer_template(){

	
	if(setup_ajax()!=false){
    
		var url="peer_template.php";

		properties_ajax_send_prepare(url);

		xmlHttp.send('template_id=' + window.name); 

	}

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

	if(document.getElementById("peeron").src==site_url + "website_code/images/TickBoxOn.gif"){

		if(document.peer.password.value!=""){

			if(setup_ajax()!=false){

                var extra = document.peer.password.value;
                if (document.peer.retouremail.value!="")
                {
                    extra += ",";
                    extra += document.peer.retouremail.value;
                }
				var url="peer_change_template.php";

				properties_ajax_send_prepare(url);

				xmlHttp.send('template_id=' + window.name + '&peer_status=on' + '&extra=' + extra);

			}

		}else{

			alert(PASSWORD_REMINDER);

		}


	}else{

		if(setup_ajax()!=false){
    
			var url="peer_change_template.php";

			properties_ajax_send_prepare(url);

			xmlHttp.send('template_id=' + window.name + '&peer_status=off'); 
	
		}
	
	}

}

     /**
	 * 
	 * Function rss tick toggle
 	 * This function handles the ticking and unticking on the rss page
	 * @param string tag = the tick image clicked on
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function rss_tick_toggle(tag){

	switch(tag){

		case "rsson":document.getElementById(tag).src = "website_code/images/TickBoxOn.gif";
			      document.getElementById("rssoff").src = "website_code/images/TickBoxOff.gif";
			      break;
		case "rssoff":document.getElementById(tag).src = "website_code/images/TickBoxOn.gif";
			      document.getElementById("rsson").src = "website_code/images/TickBoxOff.gif";
			      break;
		case "exporton":document.getElementById(tag).src = "website_code/images/TickBoxOn.gif";
			      document.getElementById("exportoff").src = "website_code/images/TickBoxOff.gif";
			      break;
		case "exportoff":document.getElementById(tag).src = "website_code/images/TickBoxOn.gif";
			      document.getElementById("exporton").src = "website_code/images/TickBoxOff.gif";
			      break;
		case "syndon":document.getElementById(tag).src = "website_code/images/TickBoxOn.gif";
			      document.getElementById("syndoff").src = "website_code/images/TickBoxOff.gif";
			      break;
		case "syndoff":document.getElementById(tag).src = "website_code/images/TickBoxOn.gif";
			      document.getElementById("syndon").src = "website_code/images/TickBoxOff.gif";
			      break;

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

	rssing = "false";
	exporting = "false";

	if(document.getElementById("rsson").src==(site_url + "website_code/images/TickBoxOn.gif")){

		rssing="true";

	}

	if(document.getElementById("exporton").src==(site_url + "website_code/images/TickBoxOn.gif")){

		exporting="true";

	}

	desc = document.getElementById("desc").value;

	if(setup_ajax()!=false){

		var url="rss_change_template.php";

		properties_ajax_send_prepare(url);
    
		xmlHttp.send('template_id=' + window.name + '&rss=' + rssing + '&export=' + exporting + '&desc=' + desc); 

	}

	
}

     /**
	 * 
	 * Function xml template
 	 * This function handles the display of the templates XML sharing settings
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function xml_template(){

	if(setup_ajax()!=false){
    
		var url="xml_template.php";

		properties_ajax_send_prepare(url);

		xmlHttp.send('template_id=' + window.name); 

	}

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

	if(document.getElementById("xmlon").src==site_url + "website_code/images/TickBoxOn.gif"){

		if(setup_ajax()!=false){

			var url="xml_change_template.php";

			properties_ajax_send_prepare(url);
    
			if(document.xmlshare.sitename.value!=""){

				xmlHttp.send('template_id=' + window.name + '&xml_status=on' + '&address=' + document.xmlshare.sitename.value); 

			}else{

				xmlHttp.send('template_id=' + window.name + '&xml_status=on' + '&address=null'); 

			}

		}

	}else{

		var url="xml_change_template.php";

		properties_ajax_send_prepare(url);
    
		xmlHttp.send('template_id=' + window.name + '&xml_status=off' + '&address=null'); 

	}

}

     /**
	 * 
	 * Function properties template
 	 * This function handles the display of the default properties page
	 * @version 1.0
	 * @author Patrick Lockley
	 */


function properties_template(){

	if(setup_ajax()!=false){
    
		var url="properties_template.php";

		properties_ajax_send_prepare(url);

		xmlHttp.send('template_id=' + window.name); 

	}

}

function default_engine_toggle(tag, engine1, engine2)
{
    var url="properties_default_engine.php";
    properties_ajax_send_prepare(url);

    if(document.getElementById(tag).src.indexOf("TickBoxOn.gif") >0 )
    {
        xmlHttp.send('template_id=' + window.name + '&engine=' + engine2 + '&page=properties');
    }
    else
    {
        xmlHttp.send('template_id=' + window.name + '&engine=' + engine1 + '&page=properties');
    }
}

function publish_engine_toggle(tag, engine1, engine2)
{
    var url="properties_default_engine.php";
    properties_ajax_send_prepare(url);

    if(document.getElementById(tag).src.indexOf("TickBoxOn.gif") >0 )
    {
        xmlHttp.send('template_id=' + window.name + '&engine=' + engine2 + '&page=publish');
    }
    else
    {
        xmlHttp.send('template_id=' + window.name + '&engine=' + engine1  + '&page=publish');
    }
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

	if(setup_ajax()!=false){
    
		var url="name_template.php";

		properties_ajax_send_prepare(url);

		xmlHttp.send('template_id=' + window.name); 

	}

}

     /**
	 * 
	 * Function notes template
 	 * This function handles the display of a templates notes
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function notes_template(){

	if(setup_ajax()!=false){
    
		var url="notes_template.php";

		properties_ajax_send_prepare(url);

		xmlHttp.send('template_id=' + window.name); 

	}

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

	new_notes = document.getElementById(form_tag).childNodes[0].value;

	if(is_ok_notes(new_notes)){

		if(setup_ajax()!=false){
    
			var url="notes_change_template.php";

			properties_ajax_send_prepare(url);

			xmlHttp.send('template_id=' + template_id +'&notes=' + new_notes); 

		}

	}else{

		alert(NOTES_FAIL);

	}

}

     /**
	 * 
	 * Function delete file
 	 * This function handles the changing of notes on a template
 	 * @param string file = id of the file to delete
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function delete_file(file){

	var answer = confirm(DELETE_FILE_CONFIRM);

	if(answer){

		if(setup_ajax()!=false){
    
			var url="delete_file_template.php";

			xmlHttp.open("post",properties_ajax_php_path + url,true);
			xmlHttp.onreadystatechange=delete_file_stateChanged;
			xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xmlHttp.send('file=' + encodeURIComponent(file));

		}	

	}

}

     /**
	 * 
	 * Function delete file state changed
 	 * This function refreshes the file list when a file is deleted
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function delete_file_stateChanged(){

	if (xmlHttp.readyState==4){ 

		media_and_quota_template();
		
	}	

}

     /**
	 * 
	 * Function media and quota template
 	 * This function handles the display of the media and quota for a file
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function media_and_quota_template(){

	if(setup_ajax()!=false){
    
		var url="media_and_quota_template.php";

		properties_ajax_send_prepare(url);

		xmlHttp.send('template_id=' + window.name); 

	}

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

	new_name = document.getElementById(form_tag).childNodes[0].value;

	if(is_ok_name(new_name)){

		if(setup_ajax()!=false){
    
			var url="rename_template.php";

			xmlHttp.open("post",properties_ajax_php_path + url,true);
			xmlHttp.onreadystatechange=rename_stateChanged;
			xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

			xmlHttp.send('template_id=' + template_id +'&template_name=' + new_name); 

		}

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

	if(setup_ajax()!=false){
    
		var url="access_template.php";

		properties_ajax_send_prepare(url);

		xmlHttp.send('template_id=' + window.name); 

	}

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

	path = site_url;

	z = document.getElementById('security_list').childNodes.length;

	x=0;

	access_value="";

	while(x!=z){

		if(document.getElementById('security_list').childNodes[x].id!=""){

			if(document.getElementById('security_list').childNodes[x].childNodes[0].src== path + "website_code/images/TickBoxOn.gif"){

				access_value = document.getElementById('security_list').childNodes[x].id;

			}

		}

		x++;

	}

	if(access_value=="Other"&&document.getElementById('url').value==""){

		alert(ACCESS_RESTRICT);

	}else{

		if(setup_ajax()!=false){
    
			var url="access_change_template.php";

			properties_ajax_send_prepare(url);

			if(access_value=="Other"){
					xmlHttp.send('template_id=' + template_id + '&access=' + access_value +'&server_string=' + document.getElementById('url').value); 
			}else{
					xmlHttp.send('template_id=' + template_id + '&access=' + access_value); 
			}

		}

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

function gift_stateChanged(){

	if (xmlHttp.readyState==4){ 

		document.getElementById('dynamic_area').innerHTML = xmlHttp.responseText;

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
	 * Function gift this template
 	 * This function handles the gifting of a template
 	 * @param string tutorial_id = id of the template
 	 * @param string user_id - the user to give it to
  	 * @param string action - whether to give a copy or give this version
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function gift_this_template(tutorial_id, user_id, action){

	if(setup_ajax()!=false){
    
		var url="gift_this_template.php";

		xmlHttp.open("post",properties_ajax_php_path + url,true);
		xmlHttp.onreadystatechange=gift_stateChanged;
		xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

		xmlHttp.send('tutorial_id=' + tutorial_id + '&user_id=' + user_id + '&action=' + action); 

	}

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
    
		search_string = document.getElementById('share_form').childNodes[0].value;

		if(search_string==""){
			document.getElementById('area2').innerHTML="<p>Names will appear here</p>";
		}

		if(is_ok_user(search_string)){

			var url="name_select_gift_template.php";

			xmlHttp.open("post",properties_ajax_php_path + url,true);
			xmlHttp.onreadystatechange=name_share_stateChanged;
			xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

			xmlHttp.send('search_string=' + search_string + '&template_id=' + window.name); 

		}else{

			document.getElementById('area2').innerHTML="<p>" + SEARCH_FAIL + "</p>";

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
    
		search_string = document.getElementById('share_form').childNodes[0].value;

		if(search_string==""){
			document.getElementById('area2').innerHTML="<p>" + NAMES_APPEAR + "</p>";
		}

		if(is_ok_user(search_string)){

			var url="name_select_template.php";

			xmlHttp.open("post",properties_ajax_php_path + url,true);
			xmlHttp.onreadystatechange=name_share_stateChanged;
			xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

			xmlHttp.send('search_string=' + search_string + '&template_id=' + window.name); 

		}else{

			document.getElementById('area2').innerHTML="<p>" + SEARCH_FAIL + "</p>";

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

	if(setup_ajax()!=false){
    
		var url="gift_template.php";

		properties_ajax_send_prepare(url);

		xmlHttp.send('template_id=' + window.name); 

	}

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

function share_this_template(template, user){

	if(setup_ajax()!=false){
    
		var url="share_this_template.php";

		xmlHttp.open("post",properties_ajax_php_path + url,true);
		xmlHttp.onreadystatechange=share_this_stateChanged;
		xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

		xmlHttp.send('template_id=' + template + '&user_id=' + user); 

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


	if(setup_ajax()!=false){
    
		var url="sharing_status_template.php";

		properties_ajax_send_prepare(url);

		xmlHttp.send('template_id=' + window.name); 

	}

}

     /**
	 * 
	 * Function export template
 	 * This function handles the display of the export page for a template
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function export_template(){
	
	if(setup_ajax()!=false){
    
		var url="export_template.php";

		properties_ajax_send_prepare(url);

		xmlHttp.send('template_id=' + window.name); 

	}

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

function set_sharing_rights_template(rights, template, user){

	if(setup_ajax()!=false){
    
		var url="set_sharing_rights_template.php";

		xmlHttp.open("post",properties_ajax_php_path + url,true);
		xmlHttp.onreadystatechange=share_rights_stateChanged;
		xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

		xmlHttp.send('rights=' + rights + '&template_id=' + window.name + '&user_id=' + user); 

	}

}


var last_selected=null;

     /**
	 * 
	 * Function tab highlight
 	 * This function handles the highlighting of tabs on the properties window
 	 * @param string id = id of the tab to highlight
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function tab_highlight(id){


	document.getElementById("tab"+id).className = "tab_selected";
	
	if((last_selected!=null)&&(last_selected!=id)){
		document.getElementById("tab" + last_selected).className = "tab";
	}
	
	last_selected = id;
	
}

function export_engine_toggle(tag){
    if(document.getElementById(tag).src.indexOf("TickBoxOn.gif") >0 ){
        document.getElementById(tag).src = "website_code/images/TickBoxOff.gif";
    }
    else
    {
        document.getElementById(tag).src = "website_code/images/TickBoxOn.gif";
    }
}

function export_use_engine(tag)
{
    if(document.getElementById(tag).src.indexOf("TickBoxOn.gif") >0)
    {
        return 'true';
    }
    else
    {
        return 'false';
    }
}

function property_tab_download(id,html5_tag, flash_tag, url)
{
    var ifrm = document.getElementById(id);
    var export_html5_engine="";
    var export_flash_engine="";
    if (html5_tag.length>0) {
        export_html5_engine = export_use_engine(html5_tag);
    }
    if(flash_tag.length>0) {
        export_flash_engine = export_use_engine(flash_tag);
    }
    var urlparams = url.indexOf('?') !== false;
    ifrm.src = url + (urlparams ? '&' : '?') + 'html5='+export_html5_engine+'&flash='+export_flash_engine;
}


function property_tab_file_download(id, url)
{
    var ifrm = document.getElementById(id);
    ifrm.src = url;
}

function setup_download_link(path, buttonlbl, file)
{
    var button = '<button type="button" class="xerte_button" onclick="property_tab_file_download(\'download_frame\', \'getfile.php?file=' + file + '\')">' + buttonlbl +  '</button>';
    document.getElementById('linktext').value=path;
    document.getElementById('download_link').innerHTML=button;
}

