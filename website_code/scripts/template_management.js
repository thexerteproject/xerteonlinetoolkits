	/**	
	 * 
	 * template management, javascript for the management of the templates in the file area and their creation
	 *
	 * @author Patrick Lockley
	 * @version 1.0
	 * @copyright Copyright (c) 2008,2009 University of Nottingham
	 * @package
	 */

var active_div="";

var edit_window_open = new Array();

	 /**
	 * 
	 * Function url return
 	 * This function sorts out the URL depending on whether the htaccess if off or on
	 * @param string url = the extra part of the url to make this URL from
 	 * @param string parameter - the template id
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function url_return(url,parameter){

	switch(url){

		case "edit": if(site_apache=="true"){
			
					return url + "_" + parameter;

				}else{

					return url + ".php?template_id=" + parameter;

				}
				break;
		case "preview": if(site_apache=="true"){
			
					return url + "_" + parameter;

				}else{

					return url + ".php?template_id=" + parameter;

				}
				break;
		case "play": if(site_apache=="true"){
			
					return url + "_" + parameter;

				}else{

					return url + ".php?template_id=" + parameter;

				}
				break;
		case "example": if(site_apache=="true"){
			
					return url + "_" + parameter;

				}else{

					return url + ".php?template_id=" + parameter;

				}
				break;
		case "properties": if(site_apache=="true"){
			
					return url + "_" + parameter;

				}else{

					return url + ".php?template_id=" + parameter;

				}
				break;
		case "folderproperties": if(site_apache=="true"){
			
					return url + "_" + parameter;

				}else{

					return url + ".php?template_id=" + parameter;

				}
				break;
		case "workspaceproperties": if(site_apache=="true"){
			
					return url; 

				}else{

					return url + ".php"

				}
		case "publishproperties": if(site_apache=="true"){
			
					return url + "_" + parameter;

				}else{

					return url + ".php?template_id=" + parameter;

				}
				break;


		default:break;

	}
}


	 /* 
	 * Function template toggle
 	 * This function sorts out the display and hiding of the blank templates side of the screen
	 * @param string tag = the div to display
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function template_toggle(tag){

	var temp = document.getElementById(tag);

	if((temp.style.display=="none")||(temp.style.display=="")){
		temp.style.display="block";	
	}else{
		temp.style.display="none"
	}	

}

// Function toggle (obsolete) ********** CHECK ***************
//
// Version 1.0 University of Nottingham
// (pl)
// open and close template areas when creating a new one


function toggle(tag){

	if(document.getElementById(tag).style.display=="none"){		
		document.getElementById(tag).style.display="block";
	}else{
		document.getElementById(tag).style.display="none";
	}

}

	 /**
	 * 
	 * Function edit window
 	 * This function opens an edit window
	 * @param string admin = is the user an administrator
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function edit_window(admin){

	if(!admin){
	
		x=0;

		while(x!=drag_manager.selected_items.length){

			if(drag_manager.selected_items[x].className=="file"){
			
					if(drag_manager.selected_items[x].parentNode.id!="folderchild_recyclebin"){

						var NewEditWindow = window.open(site_url + url_return("edit", (drag_manager.selected_items[x].id.substr(drag_manager.selected_items[x].id.indexOf("_")+1,drag_manager.selected_items[x].id.length))), "editwindow" + drag_manager.selected_items[x].id, "height=665, width=800" );

						NewEditWindow.window_reference = self;	

						try{
	
							xmlHttp=new XMLHttpRequest();
		
						}catch (e){    // Internet Explorer    

							try{
	     	  	
								xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
      
							}catch (e){      
			
								try{        
					
									xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
					
							   	}catch (e){
				
								}      
						      }    
						}


						NewEditWindow.ajax_handle = xmlHttp;		

						NewEditWindow.focus();

						window_id = "editwindow" + drag_manager.selected_items[x].id;

						window_open = false;

						for(z=0;z<edit_window_open.length;z++){

							if(("editwindow" + edit_window_open[z])==window_id){

								window_open = true;

							}

						}

						if(!window_open){

							edit_window_open.push(drag_manager.selected_items[x].id);
		
						}

					}else{

						alert("You cannot edit files in the recycle bin. Please remove the file from the recycle bin before editing.");

					}

			}else{

				alert("You cannot edit a folder. To change a folder's properties please click 'Properties'");

			}

			x++;

		}

	}else{

		var NewEditWindow = window.open(site_url + url_return("edit", admin), "editwindow" + admin, "height=665, width=800" );

		NewEditWindow.window_reference = self;			

		NewEditWindow.focus();

	}

}

	 /**
	 * 
	 * Function close edit window
 	 * This function sorts out the deletion of lock files
	 * @param string path = the path to delete the lock file, or an ID number
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function close_edit_window(path){
	
	/*
	* if the path variable contains a hyphen, then it is the path to delete a file
	*/
	
	/*
	* use the for loop to check for its place in the array then delete it
	*/

	for(x=0;x<edit_window_open.length;x++){

		if(path.indexOf("-")!=-1){

			if(edit_window_open[x].substr(5,edit_window_open[x].length-5)==path.substr(0,path.indexOf("-"))){

				edit_window_open.splice(x,1);

			}			

		}else{

			if(edit_window_open[x].substr(5,edit_window_open[x].length-5)==path){

				edit_window_open.splice(x,1);

			}

		}

	}

}

/**
	 * 
	 * Function file_version_sync
 	 * This function opens a window to display an example template
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function file_version_sync(){

	if (xmlHttp.readyState==4){ 

		if(xmlHttp.responseText!=""){

			alert(xmlHttp.responseText);

		}

	}

}

/**
	 * 
	 * Function example state changed
 	 * This function opens a window to display an example template
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function file_need_save(){

	if (xmlHttp.readyState==4){ 

		result = xmlHttp.responseText.split("~*~");

		if(xmlHttp.responseText!=""){

			var response = confirm(result[0]);

			if(response){

				var url="website_code/php/versioncontrol/update_file.php";

				xmlHttp.open("post",url,true);
				xmlHttp.onreadystatechange=file_version_sync;
				xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				xmlHttp.send('file_path=' + result[1]);

			}

		}

	}

}

	 /**
	 * 
	 * Function edit window close
 	 * This function is empty to handle the response from the lock file deletion (which generates no response)
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function edit_window_close(path){

	for(x=0;x<edit_window_open.length;x++){

		if(path.indexOf("-")!=-1){

			if(edit_window_open[x].substr(5,edit_window_open[x].length-5)==path.substr(0,path.indexOf("-"))){

				edit_window_open.splice(x,1);

			}			

		}else{

			if(edit_window_open[x].substr(5,edit_window_open[x].length-5)==path){

				edit_window_open.splice(x,1);

			}

		}

	}

	if(setup_ajax()!=false){
    
		var url="website_code/php/versioncontrol/template_close.php";

		xmlHttp.open("post",url,true);
		xmlHttp.onreadystatechange=file_need_save;
		xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xmlHttp.send('file_path=' + path);

	}
	
}

	 /**
	 * 
	 * Function example window
 	 * This function requests the screen size for an example template
 	 * @param string examole_id = the id of the example
	 * @version 1.0
	 * @author Patrick Lockley
	 */
	 
function example_window(example_id){

	if(example_id!=0){

		if(setup_ajax()!=false){
    
			var url="website_code/php/properties/screen_size_template.php";

   			xmlHttp.open("post",url,true);
			xmlHttp.onreadystatechange=example_stateChanged;
			xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xmlHttp.send('tutorial_id=' + example_id); 

		}

	}else{

		alert("Sorry an example does not exist for this template");

	}
	
}

 	/**
	 * 
	 * Function preview window
 	 * This function opens a window to display a preview of a template
 	 * @param string admin = whether the user is an admin
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function preview_window(admin){

	if(!admin){

		if(setup_ajax()!=false){
    
			x=0;

			while(x!=drag_manager.selected_items.length){

				if(drag_manager.selected_items[x].className=="file"){
			
					var url="website_code/php/properties/screen_size_template.php";

					xmlHttp.open("post",url,true);
					xmlHttp.onreadystatechange=screensize_stateChanged;
					xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
					xmlHttp.send('tutorial_id=' + (drag_manager.selected_items[x].id.substr(drag_manager.selected_items[x].id.indexOf("_")+1,drag_manager.selected_items[x].id.length))); 
	
			
				}else{

					alert("Please select a project to preview.");

				}

				x++;

			}

		}	

	}else{

		var url="website_code/php/properties/screen_size_template.php";

		xmlHttp.open("post",url,true);
		xmlHttp.onreadystatechange=screensize_stateChanged;
		xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xmlHttp.send('tutorial_id=' + admin); 

	}
	
}

// Function screen size state changed (duplicate)
// 
// Version 1.0 University of Nottingham
// (pl)
// opens a new window to the right size

function screensize_stateChanged(){

	if (xmlHttp.readyState==4){ 
			
		if(xmlHttp.responseText!=""){

			temp = xmlHttp.responseText.toString().split("~");

			parameter = "height=" + temp[1] + ",width=" + temp[0] + ",status=No,resizable=1";

			//parameter = "height=" + screen.height + ",width=" + screen.width + ",status=No";

			var property_id = temp[2];

			var NewWindow = window.open(site_url + url_return("preview", property_id), "previewwindow" + property_id, parameter);

			//var NewWindow = window.open(site_url + url_return("preview", property_id), "previewwindow" + property_id, parameter);

			NewWindow.focus();


		}

	}

}

 	/**
	 * 
	 * Function example state changed
 	 * This function opens a window to display an example template
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function example_stateChanged(){

	if (xmlHttp.readyState==4){ 
			
		if(xmlHttp.responseText!=""){

			temp = xmlHttp.responseText.toString().split("~");

			parameter = "height=" + temp[1] + ",width=" + temp[0] + ",status=No";

			var property_id = temp[2];

			var NewWindow = window.open(site_url + url_return("example",property_id), "examplewindow" + property_id, parameter);

			NewWindow.focus();

		}

	}

}

	 /**
	 * 
	 * Function properties window
 	 * This function opens a properties window
 	 * @param string admin - is the user an admin
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function publishproperties_window(admin){

		var NewWindow = window.open(site_url + url_return("publishproperties", (drag_manager.selected_items[0].id.substr(drag_manager.selected_items[0].id.indexOf("_")+1,drag_manager.selected_items[0].id.length))), (drag_manager.selected_items[0].id.substr(drag_manager.selected_items[0].id.indexOf("_")+1,drag_manager.selected_items[0].id.length)), "height=570, width=610" );
	
		NewWindow.window_reference = self;

		NewWindow.focus();

}

	 /**
	 * 
	 * Function properties window
 	 * This function opens a properties window
 	 * @param string admin - is the user an admin
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function properties_window(admin){

	if(!admin){

		if(document.getElementById("folder_workspace").mainhighlight){

			var NewWindow = window.open(site_url + url_return("workspaceproperties", null), "workspace", "height=570, width=610" );

			NewWindow.window_reference = self;

			NewWindow.focus();

		}else{

			x=0;

			while(x!=drag_manager.selected_items.length){

				if(drag_manager.selected_items[x].className=="file"){

					if(drag_manager.selected_items[x].parentNode.id!="folderchild_recyclebin"){

						var NewWindow = window.open(site_url + url_return("properties", (drag_manager.selected_items[x].id.substr(drag_manager.selected_items[x].id.indexOf("_")+1,drag_manager.selected_items[x].id.length))), (drag_manager.selected_items[x].id.substr(drag_manager.selected_items[x].id.indexOf("_")+1,drag_manager.selected_items[x].id.length)), "height=570, width=610" );

						NewWindow.window_reference = self;

						NewWindow.focus();

					}else{
			
						alert("You cannot set the properties on a file in the recycle bin, please remove this file before continuing");

					}

				}else{

					var NewWindow = window.open(site_url + url_return("folderproperties", (drag_manager.selected_items[x].id.substr(7,drag_manager.selected_items[x].id.length)+"_folder")), (drag_manager.selected_items[x].id.substr(7,drag_manager.selected_items[x].id.length)+"_folder"), "height=570, width=610" );

					NewWindow.window_reference = self;

					NewWindow.focus();


				}

				x++;

			}

		}

	}else{

		var NewWindow = window.open(site_url + url_return("properties", admin), admin, "height=570, width=610" );

		NewWindow.window_reference = self;

		NewWindow.focus();

	}

}

 	/**
	 * 
	 * Function selection changed
 	 * This function redisplays the file area sorted accordingly
	 * @version 1.0
	 * @author Patrick Lockley
	 */


function selection_changed(){

	if(setup_ajax()!=false){
    
		var url="website_code/php/templates/sort_templates.php";

   		xmlHttp.open("post",url,true);
		xmlHttp.onreadystatechange=selectionchanged_stateChanged;
		xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xmlHttp.send('sort_type=' + document.sorting.type.value); 

	}

}

 	/**
	 * 
	 * Function selection changed state changed
 	 * This function redisplays the file area after sorting
	 * @version 1.0
	 * @author Patrick Lockley
	 */


function selectionchanged_stateChanged(){ 

	if (xmlHttp.readyState==4){ 
			
		document.getElementById('file_area').innerHTML = xmlHttp.responseText;

		sort_display_settings();	

	}

} 

 	/**
	 * 
	 * Function remove template
 	 * This function removes a template
  	 * @param string template_id - id of the template to be deleted
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function remove_template(template_id){

	
	if(setup_ajax()!=false){
    
		var url="website_code/php/templates/remove_template.php";

   		xmlHttp.open("post",url,true);
		xmlHttp.onreadystatechange=delete_stateChanged;
		xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xmlHttp.send('template_id=' + (template_id.substr(template_id.indexOf("_")+1,template_id.length))); 

	}

}

 	/**
	 * 
	 * Function recycle bin remove all template
 	 * This function empties the recycle bin 
  	 * @param string template_id - id of the template to be deleted
	 * @version 1.0
	 * @author Patrick Lockley
	 */


var number_of_files_to_delete = 0;

function recycle_bin_remove_all_template(template_id){

	
	if(setup_ajax()!=false){
    
		var url="website_code/php/templates/remove_template.php";

		var xmlHttpDelete = new XMLHttpRequest();

   		xmlHttpDelete.open("post",url,true);

		xmlHttpDelete.onreadystatechange= function(){

			if (xmlHttpDelete.readyState==4){ 

				if(number_of_files_to_delete!=1){

					number_of_files_to_delete-=1;

				}else{

					screen_refresh();

				}						
		
			}

		};

		xmlHttpDelete.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xmlHttpDelete.send('template_id=' + (template_id.substr(template_id.indexOf("_")+1,template_id.length))); 

	}

}

 	/**
	 * 
	 * Function delete template
 	 * This function moves a file to the recycle bin
  	 * @param string template_id - id of the template to be deleted
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function delete_template(template_id){

	
	if(setup_ajax()!=false){
    
		var url="website_code/php/templates/delete_template.php";

   		xmlHttp.open("post",url,true);
		xmlHttp.onreadystatechange=delete_stateChanged;
		xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xmlHttp.send('template_id=' + (template_id.substr(template_id.indexOf("_")+1,template_id.length))); 

	}

}

 	/**
	 * 
	 * Function delete state changed
 	 * This function redisplays after a file is deleted
	 * @version 1.0
	 * @author Patrick Lockley
	 */

var delete_feedback_string="";

function delete_stateChanged(){ 

	if (xmlHttp.readyState==4){ 
			
		if(xmlHttp.responseText.indexOf("Sorry")==0){

			alert(xmlHttp.responseText);

		}		

		screen_refresh();
		
	}

} 

 	/**
	 * 
	 * Function duplicate template
 	 * This function duplicates a template
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function duplicate_template(){

	if(drag_manager.selected_items.length==1){

		if(drag_manager.selected_items[0].id.indexOf("folder")==-1){	
		
			if(drag_manager.selected_items[0].parentNode.id!="folderchild_recyclebin"){

				/*
				* code to prevent folders being dupped
				*/

				if(setup_ajax()!=false){
    
					var url="website_code/php/templates/duplicate_template.php";

					template_id = drag_manager.selected_items[0].id.substr(drag_manager.selected_items[0].id.indexOf("_")+1,drag_manager.selected_items[0].id.length);

					template_name = drag_manager.selected_items[0].innerHTML.substr(drag_manager.selected_items[0].innerHTML.indexOf(">")+1,drag_manager.selected_items[0].innerHTML.length);

					folder_id = drag_manager.selected_items[0].parentNode.id.substr(drag_manager.selected_items[0].parentNode.id.indexOf("_")+1,drag_manager.selected_items[0].parentNode.id.length);

			   		xmlHttp.open("post",url,true);
					xmlHttp.onreadystatechange=duplicate_stateChanged;
					xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
					xmlHttp.send('template_id=' + template_id + '&template_name=' + template_name + '&folder_id=' + folder_id); 

				}

			}else{

				alert("Please remove content from the recycle bin before duplicating it.");

			}

		}else{

			alert("Please select a project to duplicate");

		}

	}else if(drag_manager.selected_items.length==0){

		alert("Please select a template you would like to duplicate");

	}else{

		alert("Only 1 template can be duplicated at any time.");

	}
	
}

 	/**
	 * 
	 * Function duplicate state changed
 	 * This function redisplays the file area are a file is duplicate
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function duplicate_stateChanged(){ 

	if (xmlHttp.readyState==4){ 

		if(xmlHttp.responseText!=""){

			alert(xmlHttp.responseText);

		}

		screen_refresh();

	}

} 

function publish_project(template_id){

	if(setup_ajax()!=false){

		var url="website_code/php/versioncontrol/update_file.php";
		xmlHttp.open("post",url,true);
		xmlHttp.onreadystatechange=publish_stateChanged;
		xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xmlHttp.send('template_id=' + template_id);

	}
	
}

 	/**
	 * 
	 * Function publish this
 	 * This function updates the public copy
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function publish_this(){ 

	if(drag_manager.selected_items.length==1){

		publishproperties_window();
	
	}else{

		alert("Only 1 template can be published at any time");

	}

} 

 	/**
	 * 
	 * Function publish state changed
 	 * This function redisplays the file area are a file is duplicate
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function publish_stateChanged(){ 

	if (xmlHttp.readyState==4){ 

		alert("Your file has been published");

	}

}



 	/**
	 * 
	 * Function remove this
 	 * This function handles what we are to delete and whether we want to.
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function remove_this(){

	if(drag_manager.selected_items.length==0){

		if(document.getElementById("recyclebin").mainhighlight){

			var response = confirm("Are you sure you want to empty the recycle bin?");

			if(response){

				x=0;

				number_of_files_to_delete = document.getElementById("folderchild_recyclebin").childNodes.length;

				while(x!=document.getElementById("folderchild_recyclebin").childNodes.length){

					recycle_bin_remove_all_template(document.getElementById("folderchild_recyclebin").childNodes[x].id.substr(document.getElementById("folderchild_recyclebin").childNodes[x].id.indexOf("_"),document.getElementById("folderchild_recyclebin").childNodes[x].id.length));

					x++;

				}

				//screen_refresh();


			}

		}

		if(document.getElementById("folder_workspace").mainhighlight){
			alert("You cannot delete the Workspace folder");
		}

	}else{	

		if(drag_manager.selected_items.length!=1){

			var response = confirm("Are you sure you with to delete these item?");

		}else{

			var response = confirm("Are you sure you with to delete this item?");

		}

		if(response){

			x=0;

			while(x!=drag_manager.selected_items.length){

				if(drag_manager.selected_items[x].className=="file"){

					if(drag_manager.selected_items[x].parentNode.id=="folderchild_recyclebin"){

						var answer = confirm("Are you sure you want to permenantly delete file - " + drag_manager.selected_items[x].innerHTML.substr(drag_manager.selected_items[x].innerHTML.indexOf(">")+1,drag_manager.selected_items[x].innerHTML.length));

						if(answer){

							remove_template(drag_manager.selected_items[x].id.substr(drag_manager.selected_items[x].id.indexOf("_"),drag_manager.selected_items[x].id.length));			
						}

					}else{
				
						delete_template(drag_manager.selected_items[x].id.substr(drag_manager.selected_items[x].id.indexOf("_"),drag_manager.selected_items[x].id.length));				

					}

				}else{

					content_folder = "folderchild_" + String(drag_manager.selected_items[x].id).substr(String(drag_manager.selected_items[x].id).indexOf("_")+1,String(drag_manager.selected_items[x].id).length);
	
					folder_children = document.getElementById(content_folder).childNodes.length;

					if(folder_children!=0){
	
						alert("Sorry you cannot delete a folder that has projects in it. Please empty the folder first");
			
					}else{

						parent_name = document.getElementById(drag_manager.selected_items[x].id).parentNode.id;

						document.getElementById(parent_name).removeChild(document.getElementById(drag_manager.selected_items[x].id));
						document.getElementById(parent_name).removeChild(document.getElementById(content_folder));

						delete_folder(drag_manager.selected_items[x].id);				

					}				

				}
		
			x++;		
	
			}

		}

	}

}

var lock = "false";

 	/**
	 * 
	 * Function update your projects
 	 * This function redisplays the file area sorted accordingly
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function update_your_projects(){

	if(setup_ajax()!=false){

		var url="website_code/php/templates/your_templates.php";

	   	xmlHttp.open("post",url,true);
		xmlHttp.onreadystatechange=tutorials_stateChanged;
		xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		
		// send dummy code
		
		xmlHttp.send("loginid=1");

	}

}

 	/**
	 * 
	 * Function update templates
 	 * This function redisplays the blank templates
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function update_templates(){

	if(setup_ajax()!=false){

		var url="website_code/php/templates/general_templates.php";

	   	xmlHttp.open("post",url,true);
		xmlHttp.onreadystatechange=templates_stateChanged;
		xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		
		xmlHttp.send("loginid=1"); 
		
	}

}

 	/**
	 * 
	 * Function template state changed
 	 * This function redisplays the blank templates
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function templates_stateChanged(){ 

	if(xmlHttp.readyState==4){ 
			
		if(xmlHttp.responseText!=""){

			document.getElementById('new_template_area_middle_ajax').innerHTML = xmlHttp.responseText;

		}

	}

}

var active_div=null;
var new_file=null;


 	/**
	 * 
	 * Function tutorials state changed
 	 * This function handles what to do when a new file is created
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function tutorials_stateChanged(){ 

	if(xmlHttp.readyState==4){ 

		if(xmlHttp.responseText!=""){

			document.getElementById(active_div).childNodes[1].filename.value="";

			template_toggle(active_div);
			active_div="";
			document.getElementById('file_area').innerHTML = xmlHttp.responseText;

			sort_display_settings();
			
			update_templates();

			single_click(document.getElementById("file_" + new_file));
			drag_manager.last_selected = "file_" + new_file;
				
		}

	}

} 


 	/**
	 * 
	 * Function tutorial created
 	 * This function opens the edit window when a new file is created
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function tutorial_created(){ 

	if (xmlHttp.readyState==4){ 
			
		if(xmlHttp.responseText!=""){

			var neweditorwindow = window.open(site_url + url_return("edit" , xmlHttp.responseText), "editwindow" + xmlHttp.responseText, "height=665, width=800" );

			new_file = xmlHttp.responseText;
		
			neweditorwindow.window_reference = self;

			neweditorwindow.focus();		

			update_your_projects();

							
		}else{


		}
	}
} 


 	/**
	 * 
	 * Function create tutorial
 	 * This function redisplays the blank templates
 	 * @param string tutorial - the template type to create
	 * @version 1.0
	 * @author Patrick Lockley
	 */
		
function create_tutorial(tutorial){ 

	if(setup_ajax()!=false){
    
		var url="website_code/php/templates/new_template.php";

		active_div=tutorial;

		xmlHttp.open("post",url,true);
		xmlHttp.onreadystatechange=tutorial_created;

		xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

		if(is_ok_name(document.getElementById(tutorial).childNodes[1].filename.value)){

			xmlHttp.send('tutorialid=' + tutorial + '&tutorialname=' + document.getElementById(tutorial).childNodes[1].filename.value);

		}else{

			alert("Sorry that is not a valid name. Please use only letters and numbers.");

		}

	}

}

/********** CHECK **************/

function example(){

	if(setup_ajax()!=false){
    
		var url="website_code/php/example.php";

		xmlHttp.open("post",url,true);
		xmlHttp.onreadystatechange=example_alert;
		xmlHttp.send('nullid=null');

		
	}

}

function example_alert(){ 

	if (xmlHttp.readyState==4){ 
			

	}
} 



