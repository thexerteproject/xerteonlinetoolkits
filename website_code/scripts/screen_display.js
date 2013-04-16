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
    else if (typeof div.style !="undefined" && typeof div.style.MozUserSelect!="undefined") //Firefox route
        div.style.MozUserSelect="none"
    else //All other route (ie: Opera)
        div.onmousedown=function(){return false}
    if (typeof div.style != "undefined") {
        div.style.cursor = "default"
    }
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

		if(typeof(document.getElementById(tag).childNodes[x].id) != "undefined") {
            if(document.getElementById(tag).childNodes[x].id.indexOf("child_")!=-1){
                page_load_sort(document.getElementById(tag).childNodes[x].id);
            }
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
     var propertiesbtn = document.getElementById("properties");
     var editbtn = document.getElementById("edit");
     var previewbtn = document.getElementById("preview");
     var deletebtn = document.getElementById("delete");
     var duplicatebtn = document.getElementById("duplicate");
     var publishbtn = document.getElementById("publish");

	if(drag_manager.selected_items.length==0){

		editbtn.disabled="disabled";
        editbtn.className = "xerte_button_disabled";
        editbtn.onclick="";

		previewbtn.disabled="disabled";
        previewbtn.className = "xerte_button_disabled";
        previewbtn.onclick="";

		deletebtn.disabled="disabled";
		deletebtn.className="xerte_button_disabled";
		deletebtn.onclick="";

		duplicatebtn.disabled="disabled";
        duplicatebtn.className = "xerte_button_disabled";
		duplicatebtn.onclick="";

		publishbtn.disabled="disabled";
        publishbtn.className = "xerte_button_disabled";
		publishbtn.onclick="";

		if(document.getElementById("folder_workspace").mainhighlight){

			propertiesbtn.removeAttribute("disabled");
            propertiesbtn.className = "xerte_button";
            propertiesbtn.onclick=function(){properties_window()};

		}else{

			propertiesbtn.disabled="disabled";
            propertiesbtn.className = "xerte_button_disabled";
            propertiesbtn.onclick="";

		}

		if(document.getElementById("recyclebin").mainhighlight){

			if(document.getElementById("folderchild_recyclebin").childNodes.length!=0){

				deletebtn.removeAttribute("disabled");
				deletebtn.className = "xerte_button";
				deletebtn.onclick=function(){remove_this()};
				
			}

		}	

	}else if(drag_manager.selected_items.length==1){

		if(drag_manager.selected_items[0].id.indexOf("folder")==-1){

			editbtn.removeAttribute("disabled");
            editbtn.className = "xerte_button";
			editbtn.onclick=function(){edit_window()};

			previewbtn.removeAttribute("disabled");
            previewbtn.className = "xerte_button";
            previewbtn.onclick=function(){preview_window()};

			publishbtn.removeAttribute("disabled");
			publishbtn.className = "xerte_button";
			publishbtn.onclick=function(){publish_this()};

			duplicatebtn.removeAttribute("disabled");
			duplicatebtn.className = "xerte_button";
			duplicatebtn.onclick=function(){duplicate_template()};

		}else{
			
			editbtn.disabled="disabled";
			editbtn.className = "xerte_button_disabled";
			editbtn.onclick="";

			previewbtn.disabled="disabled";
			previewbtn.className = "xerte_button_disabled";
			previewbtn.onclick="";

			deletebtn.disabled="disabled";
			deletebtn.className = "xerte_button_disabled";
			deletebtn.onclick="";
 
			duplicatebtn.disabled="disabled";
			duplicatebtn.className = "xerte_button_disabled";
			duplicatebtn.onclick="";

			publishbtn.disabled="disabled";
			publishbtn.className = "xerte_button_disabled";
			publishbtn.onclick="";

		}

		propertiesbtn.removeAttribute("disabled");
		propertiesbtn.className = "xerte_button";
		propertiesbtn.onclick=function(){properties_window()};

		deletebtn.removeAttribute("disabled");
		deletebtn.className = "xerte_button";
		deletebtn.onclick=function(){remove_this()};

	}

}