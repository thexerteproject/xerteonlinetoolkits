	/**	
	 * 
	 * screen display, javascript for the various functions to do with screen display
	 *
	 * @author Patrick Lockley
	 * @version 1.0
	 * @copyright Copyright (c) 2008,2009 University of Nottingham
	 * @package
	 */

var file_area_html = "";

var xmlHttp;

	 /**
	 * 
	 * Function disable selection
 	 * This function prevents the selection on text on the index.php page
	 * @param string div - the div to prevent this om
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function disableSelection(div){

	if (typeof div.onselectstart!="undefined") //IE route
		div.onselectstart=function(){return false}
	else if (typeof div.style.MozUserSelect!="undefined") //Firefox route
		div.style.MozUserSelect="none"
	else //All other route (ie: Opera)
		div.onmousedown=function(){return false}
		div.style.cursor = "default"
}

	 /**
	 * 
	 * Function file area height
 	 * This function finds the vertical height of the file area div
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function file_area_height(){

	total_height=0;

	current_node=document.getElementById("file_area");

	while(current_node.className!="pagecontainer"){

		total_height+=current_node.offsetTop;
		
		current_node = current_node.parentNode;
		
	}

	drag_manager.initial_scroll = drag_manager.scroll_value;

	return total_height;
		
}

	 /**
	 * 
	 * Function page load sort
 	 * This function handles the display of the page and setting up some configuration
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function page_load_sort(tag){

	drag_manager.file_area_height = file_area_height();

	for(var x=0;x!=document.getElementById(tag).childNodes.length;x++){

		document.getElementById(tag).childNodes[x].highlight=false;

		disableSelection(document.getElementById(tag).childNodes[x]);

		if(document.getElementById(tag).childNodes[x].id.indexOf("child_")!=-1){
			page_load_sort(document.getElementById(tag).childNodes[x].id);
		}

	}

}

	 /**
	 * 
	 * Function folders re open
 	 * This function re opens folders previously open before the screen refresh
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function folders_reopen(){

	temp_folder_array = new Array();

	temp_folder_array = open_folders.slice();

	open_folders.splice(0,open_folders.length);

	if(temp_folder_array.length!=0){

		while(x=temp_folder_array.pop()){

			if(document.getElementById(x.id)!=null){

				document.getElementById(x.id).open=true;

				if(x.id.indexOf("recycle")!=-1){				

					document.getElementById("folderchild_" + x.id).style.display="block";	
				
					image = "folder_recyclebin";	

				}else{

					reopen = "folderchild_" + x.id.substr(x.id.indexOf("_")+1,x.id.length); 

					document.getElementById(reopen).style.display="block";

					image = "folder_" + x.id.substr(x.id.indexOf("_")+1,x.id.length) + "_image"; 

					if(document.getElementById(image)!=null){

						document.getElementById(image).src = "website_code/images/Icon_FolderOpen2.gif";

					}

				}
						
				open_folders.push(x);

			}

		}

	}

}

	 /**
	 * 
	 * Function file area redraw state changed
 	 * This function handles changes in the file area div and the setting of values for this new content
	 * @param string url = the extra part of the url for this ajax query
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function file_area_redraw_stateChanged(){

	if (xmlHttp.readyState==4){ 
	
		document.getElementById("file_area").innerHTML =  xmlHttp.responseText;
		sort_display_settings();

	}

}

	 /**
	 * 
	 * Function sort display settings
 	 * This function is an umbrella for most of the display settings for a page, and resets some system values
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function sort_display_settings(){
		
	document.getElementById("folder_workspace").open = true;

	page_load_sort('file_area');

	folders_reopen();

	drag_manager.file_area_top = find_height();

	drag_manager.file_area_bottom = drag_manager.file_area_top + document.getElementById("file_area").offsetHeight;

	/*
	* reset some system values
	*/

	drag_manager.active_key=null;
	drag_manager.orig_y=0;
	drag_manager.drag = ""; 
	drag_manager.start_x=0;
	drag_manager.start_y=0;
	drag_manager.selected=0;
	drag_manager.inital_scroll=0;
	drag_manager.new_scroll=0;
	drag_manager.scroll_top = document.getElementById("file_area").scrollTop;
	drag_manager.dragged = false;
	drag_manager.last_selected = null;
	drag_manager.last_mouse_over=null;

	/*
	* delete arrays if not already empty
	*/

	if(drag_manager.selected_items.length!=0){

		drag_manager.selected_items.splice(0,drag_manager.selected_items.length);

	}

	if(folder_div_id.length!=0){

		folder_div_id.splice(0,folder_div_id.length);

	}

	if(folder_position_top.length!=0){

		folder_position_top.splice(0,folder_position_top.length);

	}

	if(folder_position_bottom.length!=0){

		folder_position_bottom.splice(0,folder_position_bottom.length);

	}

	file_area_html = "";

	file_area_html = document.getElementById("file_area").innerHTML;

	button_check();
	

}

	 /**
	 * 
	 * Function screen refresh no ajax
 	 * This function redisplays the html if no ajax query is needed
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function screen_refresh_no_ajax(){

	document.getElementById("file_area").innerHTML = file_area_html;

	sort_display_settings();

}

	 /**	
	 * 
	 * Function screen refresh
 	 * This function sorts out the URL for most of the queries in the folder properties window
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function screen_refresh(){

	if(setup_ajax()!=false){

		var url="website_code/php/templates/your_templates.php";

   		xmlHttp.open("post",url,true);
		xmlHttp.onreadystatechange=file_area_redraw_stateChanged;
		xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		
		xmlHttp.send('sort_type=' + document.sorting.type.value); 

	}

}

	 /**
	 * 
	 * Function button check
 	 * This functions counts the number of highlighted items and configures the buttons accordingly
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function button_check(){

	if(drag_manager.selected_items.length==0){

		document.getElementById("edit").src="website_code/images/Bttn_EditDis.gif"; 
		document.getElementById("edit").onmousedown="";
		document.getElementById("edit").onmouseover="";
		document.getElementById("edit").onmouseout="";
		document.getElementById("edit").onclick="";

		document.getElementById("preview").src="website_code/images/Bttn_PreviewDis.gif"; 
		document.getElementById("preview").onmousedown="";
		document.getElementById("preview").onmouseover="";
		document.getElementById("preview").onmouseout="";
		document.getElementById("preview").onclick="";

		document.getElementById("delete").src="website_code/images/Bttn_DeleteDis.gif"; 
		document.getElementById("delete").onmousedown="";
		document.getElementById("delete").onmouseover="";
		document.getElementById("delete").onmouseout="";
		document.getElementById("delete").onclick="";

		document.getElementById("duplicate").src="website_code/images/Bttn_DuplicateDis.gif"; 
		document.getElementById("duplicate").onmousedown="";
		document.getElementById("duplicate").onmouseover="";
		document.getElementById("duplicate").onmouseout="";
		document.getElementById("duplicate").onclick="";

		document.getElementById("publish").src="website_code/images/Bttn_PublishDis.gif";
		document.getElementById("publish").onmousedown="";
		document.getElementById("publish").onmouseover="";
		document.getElementById("publish").onmouseout="";
		document.getElementById("publish").onclick="";

		if(document.getElementById("folder_workspace").mainhighlight){

			document.getElementById("properties").src="website_code/images/Bttn_PropertiesOff.gif"; 
			document.getElementById("properties").onmousedown= function(){ this.src="website_code/images/Bttn_PropertiesClick.gif"};
			document.getElementById("properties").onmouseover= function(){ this.src="website_code/images/Bttn_PropertiesOn.gif"};
			document.getElementById("properties").onmouseout= function(){ this.src="website_code/images/Bttn_PropertiesOff.gif"};
			document.getElementById("properties").onclick=function(){properties_window()}; 

		}else{

			document.getElementById("properties").src="website_code/images/Bttn_PropertiesDis.gif"; 
			document.getElementById("properties").onmousedown="";
			document.getElementById("properties").onmouseover="";
			document.getElementById("properties").onmouseout="";
			document.getElementById("properties").onclick="";

		}

		if(document.getElementById("recyclebin").mainhighlight){

			if(document.getElementById("folderchild_recyclebin").childNodes.length!=0){

				document.getElementById("delete").src="website_code/images/Bttn_DeleteOff.gif";
				document.getElementById("delete").onmousedown=function(){ this.src="website_code/images/Bttn_DeleteClick.gif"};
				document.getElementById("delete").onmouseover=function(){ this.src="website_code/images/Bttn_DeleteOn.gif"};
				document.getElementById("delete").onmouseout=function(){ this.src="website_code/images/Bttn_DeleteOff.gif"};
				document.getElementById("delete").onclick=function(){remove_this()};

			}

		}	

	}else if(drag_manager.selected_items.length==1){

		if(drag_manager.selected_items[0].id.indexOf("folder")==-1){

			document.getElementById("edit").src="website_code/images/Bttn_EditOff.gif";
			document.getElementById("edit").onmousedown= function(){ this.src="website_code/images/Bttn_EditClick.gif"};
			document.getElementById("edit").onmouseover= function(){ this.src="website_code/images/Bttn_EditOn.gif"};
			document.getElementById("edit").onmouseout= function(){ this.src="website_code/images/Bttn_EditOff.gif"};
			document.getElementById("edit").onclick=function(){edit_window()};

			document.getElementById("preview").src="website_code/images/Bttn_PreviewOff.gif";
			document.getElementById("preview").onmousedown=function(){ this.src="website_code/images/Bttn_PreviewClick.gif"};
			document.getElementById("preview").onmouseover=function(){ this.src="website_code/images/Bttn_PreviewOn.gif"};
			document.getElementById("preview").onmouseout=function(){ this.src="website_code/images/Bttn_PreviewOff.gif"};
			document.getElementById("preview").onclick=function(){preview_window()}; 			

			document.getElementById("publish").src="website_code/images/Bttn_PublishOff.gif";
			document.getElementById("publish").onmousedown=function(){ this.src="website_code/images/Bttn_PublishClick.gif"};
			document.getElementById("publish").onmouseover=function(){ this.src="website_code/images/Bttn_PublishOn.gif"};
			document.getElementById("publish").onmouseout=function(){ this.src="website_code/images/Bttn_PublishOff.gif"};
			document.getElementById("publish").onclick=function(){publish_this()}; 

			document.getElementById("duplicate").src="website_code/images/Bttn_DuplicateOff.gif";
			document.getElementById("duplicate").onmousedown=function(){ this.src="website_code/images/Bttn_DuplicateClick.gif"};
			document.getElementById("duplicate").onmouseover=function(){ this.src="website_code/images/Bttn_DuplicateOn.gif"};
			document.getElementById("duplicate").onmouseout=function(){ this.src="website_code/images/Bttn_DuplicateOff.gif"};
			document.getElementById("duplicate").onclick=function(){duplicate_template()}; 

		}else{
			
			document.getElementById("edit").src="website_code/images/Bttn_EditDis.gif"; 
			document.getElementById("edit").onmousedown="";
			document.getElementById("edit").onmouseover="";
			document.getElementById("edit").onmouseout="";
			document.getElementById("edit").onclick="";

			document.getElementById("preview").src="website_code/images/Bttn_PreviewDis.gif"; 
			document.getElementById("preview").onmousedown="";
			document.getElementById("preview").onmouseover="";
			document.getElementById("preview").onmouseout="";
			document.getElementById("preview").onclick="";

			document.getElementById("delete").src="website_code/images/Bttn_DeleteDis.gif";
			document.getElementById("delete").onmousedown="";
			document.getElementById("delete").onmouseover="";
			document.getElementById("delete").onmouseout="";
			document.getElementById("delete").onclick="";
 
			document.getElementById("duplicate").src="website_code/images/Bttn_DuplicateDis.gif";
			document.getElementById("duplicate").onmousedown="";
			document.getElementById("duplicate").onmouseover="";
			document.getElementById("duplicate").onmouseout="";
			document.getElementById("duplicate").onclick="";

			document.getElementById("publish").src="website_code/images/Bttn_PublishDis.gif";
			document.getElementById("publish").onmousedown="";
			document.getElementById("publish").onmouseover="";
			document.getElementById("publish").onmouseout="";
			document.getElementById("publish").onclick="";

		}

		document.getElementById("properties").src="website_code/images/Bttn_PropertiesOff.gif";
		document.getElementById("properties").onmousedown= function(){ this.src="website_code/images/Bttn_PropertiesClick.gif"};
		document.getElementById("properties").onmouseover= function(){ this.src="website_code/images/Bttn_PropertiesOn.gif"};
		document.getElementById("properties").onmouseout= function(){ this.src="website_code/images/Bttn_PropertiesOff.gif"};
		document.getElementById("properties").onclick=function(){properties_window()}; 

		document.getElementById("delete").src="website_code/images/Bttn_DeleteOff.gif";
		document.getElementById("delete").onmousedown=function(){ this.src="website_code/images/Bttn_DeleteClick.gif"};
		document.getElementById("delete").onmouseover=function(){ this.src="website_code/images/Bttn_DeleteOn.gif"};
		document.getElementById("delete").onmouseout=function(){ this.src="website_code/images/Bttn_DeleteOff.gif"};
		document.getElementById("delete").onclick=function(){remove_this()};

	}

}