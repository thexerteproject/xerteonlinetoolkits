	/**	
	 * 
	 * workspace properties, javascript for the workspace properties tab
	 *
	 * @author Patrick Lockley
	 * @version 1.0
	 * @copyright Copyright (c) 2008,2009 University of Nottingham
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

function workspace_properties_stateChanged(){ 

	if (xmlHttp.readyState==4){ 
			
		if(xmlHttp.responseText!=""){
			
			document.getElementById('dynamic_area').innerHTML = xmlHttp.responseText;

		}
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

	if(setup_ajax()!=false){
    
		var url="workspace_templates_template.php";

		workspace_ajax_send_prepare(url);

		xmlHttp.send('details=null'); 

	}

}

 /**
	 * 
	 * Function shared templates template
 	 * This function displays the shared templates
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function shared_templates_template(){

	if(setup_ajax()!=false){
    
		var url="shared_templates_template.php";

		workspace_ajax_send_prepare(url);

		xmlHttp.send('details=null'); 

	}

}

 /**
	 * 
	 * Function shared templates template
 	 * This function displays the shared templates
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function public_templates_template(){

	if(setup_ajax()!=false){
    
		var url="public_templates_template.php";

		workspace_ajax_send_prepare(url);

		xmlHttp.send('details=null'); 

	}

}

 /**
	 * 
	 * Function shared templates template
 	 * This function displays the shared templates
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function usage_templates_template(){

	if(setup_ajax()!=false){
    
		var url="usage_templates_template.php";

		workspace_ajax_send_prepare(url);

		xmlHttp.send('details=null'); 

	}

}

 /**
	 * 
	 * Function rss templates template
 	 * This function displays the shared templates
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function rss_templates_template(){

	if(setup_ajax()!=false){
    
		var url="rss_templates_template.php";

		workspace_ajax_send_prepare(url);

		xmlHttp.send('details=null'); 

	}

}

/**
	 * 
	 * Function rss templates template
 	 * This function displays the shared templates
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function syndication_templates_template(){

	if(setup_ajax()!=false){
    
		var url="syndication_templates_template.php";

		workspace_ajax_send_prepare(url);

		xmlHttp.send('details=null'); 

	}

}

/**
	 * 
	 * Function peer templates template
 	 * This function displays the shared templates
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function peer_templates_template(){

	if(setup_ajax()!=false){
    
		var url="peer_templates_template.php";

		workspace_ajax_send_prepare(url);

		xmlHttp.send('details=null'); 

	}

}

/**
	 * 
	 * Function xml templates template
 	 * This function displays the shared templates
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function xml_templates_template(){

	if(setup_ajax()!=false){
    
		var url="xml_templates_template.php";

		workspace_ajax_send_prepare(url);

		xmlHttp.send('details=null'); 

	}

}

/**
	 * 
	 * Function my properties template
 	 * This function displays the users details
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function my_properties_template(){

	if(setup_ajax()!=false){
    
		var url="my_properties_template.php";

		workspace_ajax_send_prepare(url);

		xmlHttp.send('details=null'); 

	}

}

/**
	 * 
	 * Function folder rss templates template
 	 * This function displays the rss options for the user and their folders
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function folder_rss_templates_template(){

	if(setup_ajax()!=false){
    
		var url="folder_rss_templates_template.php";

		workspace_ajax_send_prepare(url);

		xmlHttp.send('details=null'); 

	}

}

/**
	 * 
	 * Function import templates template
 	 * This function displays the rss options for the user and their folders
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function import_templates_template(){

	document.getElementById("dynamic_area").innerHTML = '<p class="header"><span>Import</span></p><form method="post" enctype="multipart/form-data" id="importpopup" name="importform" target="upload_iframe" action="website_code/php/import/import.php" onsubmit="javascript:iframe_check_initialise();"><input name="filenameuploaded" type="file" /><br /><br />New project name<br /><br /><input name="templatename" type="text" onkeyup="new_template_name()" /><p id="name_wrong"></p><input type="submit" name="submitBtn" value="Upload" onsubmit="javascript:iframe_check_initialise()"/></form>';

}