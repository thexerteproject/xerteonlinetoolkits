	/**	
	 * 
	 * file system, code for connecting to the database
	 *
	 * @author Patrick Lockley
	 * @version 1.0
	 * @copyright Copyright (c) 2008,2009 University of Nottingham
	 * @package
	 */
	 
	 /**
	 * Some global objects to manage the file system
	 */

var mousecursor = new Object;
var drag_manager = new Object;

/*
*  Key last pressed
*/

drag_manager.active_key=null;
drag_manager.orig_y=0;
drag_manager.drag = ""; 
drag_manager.start_x=0;
drag_manager.start_y=0;

/*
* Number of files / folders selected
*/

drag_manager.selected=0;

/*
* flag used to indicate a drag has occurred
*/ 

drag_manager.dragged = false;

/*
* last selected file
*/

drag_manager.last_selected = null;
drag_manager.last_mouse_over=null;

/*
* used in IE - the value that the page has been scrolled
*/

drag_manager.scroll_value=0;

/*
* height of the file area window
*/

drag_manager.file_area_top=0;
drag_manager.file_area_bottom=0;

/*
* list of all files selected
*/

drag_manager.selected_items = new Array();

document.onkeydown = key_pressed;
document.onkeyup = key_up;

/*
* arrays used when calculating the mouse position for folder shading and file dropping
*/

var folder_div_id = new Array();
var folder_position_top = new Array();
var folder_position_bottom = new Array();

	 /**
	 * 
	 * Function scroll check
 	 * This function checks the amount of scroll in the file area DIV
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function scroll_check(ev,tag){

	drag_manager.scroll_value = tag.scrollTop;

	folder_positions_find();

}

	 /**
	 * 
	 * Function highlight main toggle
 	 * This function highlights the work space and recycle bin highlight
	 * @param object div_name = the div we wish to highlight, passed as an object
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function highlight_main_toggle(div_name){

	if(div_name.mainhightlight == undefined){

		div_name.mainhighlight == true;

	}

	if(!div_name.mainhighlight){
		div_name.style.backgroundColor = "#e8edf3";		
		div_name.mainhighlight = true;
	}else{
		div_name.style.backgroundColor = "#ffffff";		
		div_name.mainhighlight = false;
	}

	for(q=0;q<drag_manager.selected_items.length;q++){

		if(drag_manager.selected_items[q].highlight){

			highlight(drag_manager.selected_items[q]);

		}

	}

	if(div_name.id=="recyclebin"){

		document.getElementById("folder_workspace").style.backgroundColor = "#ffffff";		
		document.getElementById("folder_workspace").mainhighlight = false;

	}else{

		document.getElementById("recyclebin").style.backgroundColor = "#ffffff";		
		document.getElementById("recyclebin").mainhighlight = false;

	}

	drag_manager.selected_items.splice(0,drag_manager.selected_items.length);

	button_check();
	
}

	 /**
	 * 
	 * Function hightlight toggle
 	 * This function handles template and folder highlighting
	 * @param object div_name = object to highlight
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function highlight_toggle(div_name){

	if(div_name.highlight==false){
		div_name.highlight=true;
		drag_manager.selected+=1;
		div_name.style.backgroundColor = "#e8edf3";		
		div_name.style.zIndex = "1";
	}else{
		div_name.highlight=false;
		drag_manager.selected-=1;
		div_name.style.backgroundColor = "#ffffff";		
		div_name.style.zIndex = "0";
	}
	
}

	 /** CHECK THIS
	 * 
	 * Function database connect
 	 * This function checks http security settings
	 * @param string $success_string = Successful message for the error log
 	 * @param string $error_string = Error message for the error log
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function highlight(div_name){

	highlight_toggle(div_name);		
	
}

	 /**
	 * 
	 * Function key up
 	 * This function sets the key to be null
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function key_up(){

	drag_manager.active_key=null;

}

	 /**
	 * 
	 * Function key pressed
 	 * This function sets the active key variable
	 * @param event ev = The key pressed event
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function key_pressed(ev){

	e = ev || window.event;
	
	if (e.keyCode) code = e.keyCode;
	else if (e.which) code = e.which;
	
	/*
	* if being dragged, the Escape key (27) drop all the files back to their original location
	*/

	if(drag_manager.drag_flag){

		if(code==27){

			screen_refresh_no_ajax();

		}

	}

	drag_manager.active_key=code;

}

var total = 0;

	 /**
	 * 
	 * Function folder child test
 	 * This function checks to see whether a folder is being dropped onto one of its children
	 * @param string tag - the id string for the folder dropped
 	 * @param string div - the id for the target
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function folder_child_test(tag,div){

	if(tag.indexOf("folder_"!=-1)){

		tag = "folderchild_" + tag.substr(tag.indexOf("_")+1,tag.length);

	}

	for(var y=0;y!=document.getElementById(tag).childNodes.length;y++){

		if(document.getElementById(tag).childNodes[y].id==div){
			return true;
		}

		if(document.getElementById(tag).childNodes[y].id.indexOf("_")!=-1){
			folder_loop_heights(document.getElementById(tag).childNodes[y].id, div);	
		}

	}

}

	 /**
	 * 
	 * Function find height
 	 * This function checks the vertical offset of the file area
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function find_height(){

	total_height=0;

	current_node=document.getElementById("file_area");

	while(current_node.className!="pagecontainer"){

		total_height+=current_node.offsetTop;
		
		current_node = current_node.parentNode;
		
	}

	drag_manager.initial_scroll = drag_manager.scroll_value;

	return total_height - drag_manager.scroll_value - drag_manager.body_scroll;
		
}

var start=0;

	 /**
	 * 
	 * Function folder loop heights
 	 * This function finds the top and bottom of each of the unhighlighted folders (function recurses)
 	 * @param string tag - the id of the folder
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function folder_loop_heights(tag){

	for(var y=0;y!=document.getElementById(tag).childNodes.length;y++){

		if(document.getElementById(tag).childNodes[y].highlight==false){
			
			div_top = total;
			
			div_bottom = 0;

			if(document.getElementById(tag).childNodes[y].id.indexOf("child")==-1){

				if(!document.getElementById(document.getElementById(tag).childNodes[y].id).highlight){

					folder_position_top.push(div_top);

					folder_div_id.push(document.getElementById(tag).childNodes[y]);

					div_bottom = total + document.getElementById(tag).childNodes[y].offsetHeight;

					folder_position_bottom.push(div_bottom);

					total += document.getElementById(tag).childNodes[y].offsetHeight;

				}

			}			

			if(document.getElementById(document.getElementById(tag).childNodes[y].id).open){
				
				// if the folder is open, recurse through it as well

				new_id = "folderchild_" + document.getElementById(tag).childNodes[y].id.substr(document.getElementById(tag).childNodes[y].id.indexOf("_")+1,document.getElementById(tag).childNodes[y].id.length);

				folder_loop_heights(new_id);

			}

		}

	}

}

	 /**
	 * 
	 * Function folder positions find
 	 * This function checks for where folder positions are
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function folder_positions_find(){

	total=find_height();
	
	if(folder_position_top.length!=0){
		folder_position_top.splice(0,folder_position_top.length);
		folder_position_bottom.splice(0,folder_position_bottom.length);
		folder_div_id.splice(0,folder_div_id.length);
	}
	
	folder_loop_heights("file_area");

}

	 /**
	 * 
	 * Function release drag flag
 	 * This function removes the timeout used to distinguish between a click and a drag click
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function release_drag_flag(){

	clearTimeout(drag_manager.click_timeout);

	drag_manager.drag_flag=false;

}

	 /**
	 * 
	 * Function file drag stop
 	 * This function is triggered by a mouse being let go (effectively files being dropped)
	 * @param event ev - The mouse up event
	 * @param string div - where mouse was let on / dropped on top of
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function file_drag_stop(ev,div){

	release_drag_flag();

	drag_manager.drag=false;
	drag_manager.orig_y=0;
	
	e = ev || window.event;
	
	/*
	* get mouse positions
	*/
	
	if(e.pageY){
		final_mouse_y = e.pageY;
	}else{
		final_mouse_y = e.clientY + document.body.scrollTop - document.body.clientTop;
	}	
	
	/*
	* if the drag flag was on
	*/
	
	if(drag_manager.dragged){

		folder_count = 0;
	
		folder_positions_find();
		
		target="";
		
		/*
		* move through the folders, looking for which one the mouse was over when the button was released
		*/
		
		while(folder_count!=folder_position_top.length){

			
			if(((folder_position_top[folder_count])<=(final_mouse_y-drag_manager.new_scroll))&&((final_mouse_y-drag_manager.new_scroll)<=(folder_position_bottom[folder_count]))){

				if(folder_div_id[folder_count].className=="folder"){
					target = folder_div_id[folder_count].id;					
				}

				if(folder_div_id[folder_count].className=="file"){

					target = folder_div_id[folder_count].parentNode.id;								
					
				}

			}
			
			folder_count++;
			
		}

		if(target=="recyclebin"){

			for(x=0;x!=drag_manager.selected_items.length;x++){

				if(drag_manager.selected_items[x].className=="folder"){

					alert(FOLDER_RECYCLE_FAIL);
					screen_refresh_no_ajax();
					break;
				}

			}

		}

		moved_items = new Array();
		item_type = new Array();
		item_parent = new Array();
	
		/*
		* create the information needed to pass to the PHP
		*/
	
		for(x=0;x!=drag_manager.selected_items.length;x++){
	
			moved_items.push(drag_manager.selected_items[x].id);
			item_type.push(drag_manager.selected_items[x].className);
			item_parent.push(drag_manager.selected_items[x].parentNode.id);

		}
		
		/*
		* Reset the drag flags
		*/
		
		drag_manager.dragged=false;

		child_error_detect=true;

		/*
		* Check the folder is not one its children
		*/

		for(z=0;z!=item_type.length;z++){

			if(item_type[z]=="folder"){

				if(folder_child_test(moved_items[z],target)){

					child_error_detect=false;
					alert(CHILD_FAIL);
					screen_refresh();
				
				}

			}

		}
		
		if(child_error_detect==true){

			if(item_parent!=target){
				
				/*
				* send the files and folders to the PHP
				*/

				copy_to_folder(moved_items,item_type,item_parent,target);
	
			}else{

				screen_refresh_no_ajax();

			}

		}
		
	}

	drag_start=false;

}

	 /**
	 * 
	 * Function file drag start
 	 * This function is used to set the drag parameter to start file dragging
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function file_drag_start(){

	drag_flag();

}

var click_event = null;

	 /**
	 * 
	 * Function file folder click pause
 	 * This function checks whether the click was a drag click or a select click
	 * @param event event - the mouse click event
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function file_folder_click_pause(event){

	click_event = event || window.event;

	if(click_event.pageY){

		drag_manager.orig_y = click_event.pageY;
		drag_manager.backup_y = click_event.pageY;

	}else{

		drag_manager.orig_y = click_event.clientY + document.body.scrollTop - document.body.clientTop;
		drag_manager.backup_y = click_event.clientY + document.body.scrollTop - document.body.clientTop;

	}

	drag_manager.click_timeout = setTimeout('file_drag_start()',200);

}

	 /**
	 * 
	 * Function drag flag
 	 * This function does some work before dragging starts i.e. closes folders and sets the drag flag
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function drag_flag(){

	drag_manager.drag_flag=true;

	for(c=0;c<open_folders.length;c++){

		if(document.getElementById(open_folders[c].id).open){

			if(document.getElementById(open_folders[c].id).highlight){

				folder_open_close(open_folders[c]);

			}
			
		}

	}

	folder_positions_find();

}

var buffer = 0;

drag_manager.body_scroll = 0;

	 /**
	 * 
	 * Function body scroll
 	 * This function checks how much the document itself has scrolled
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function body_scroll(){

	drag_manager.body_scroll = document.documentElement.scrollTop;

}

drag_manager.new_scroll=0;

scroll_number = 0;

	 /**
	 * 
	 * Function mousecoords
 	 * This function checks http security settings
	 * @param event event = The mouse move event.
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function mousecoords(ev){

	e = ev || window.event;
	
	// get the mouse location
	
	if(e.pageX||e.pageY){

		mousecursor.y = e.pageY;

	}else{
	
		mousecursor.y = e.clientY + drag_manager.body_scroll;

	}
	
	/*
	* If the files are being dragged
	*/

	if(drag_manager.drag_flag){

		/*
		* Has the window been scrolled since the drag started - if so get the values again
		*/

		if(drag_manager.initial_scroll!=document.getElementById("file_area").scrollTop){

			folder_positions_find();

			drag_manager.initial_scroll = document.getElementById("file_area").scrollTop;
			
		}
		
		/*
		* for each selected item
		*/

		for(x=0;x!=drag_manager.selected_items.length;x++){

			/*
			* change the styles to allow for dragging and transparency
			*/

			drag_manager.selected_items[x].style.position = "absolute";
				
			if(navigator.appName=="Netscape"){					
				drag_manager.selected_items[x].style.MozOpacity=0.5;
			}else if(navigator.appName=="Microsoft Internet Explorer"){				
				drag_manager.selected_items[x].style.filter="alpha(opacity=50)";
			}else if(navigator.appName=="Opera"){
				drag_manager.selected_items[x].style.opacity=.50;
			}

			/*
			* set the top of the file
			*/

			drag_manager.selected_items[x].style.top = mousecursor.y + drag_manager.scroll_value - drag_manager.body_scroll - file_area_height() + (x*25) + "px";	

			/*
			* fix the file to the left
			*/
			
			drag_manager.selected_items[x].style.left="0px";
			
			/*
			* take the files back int he z buffer to make sure the folders we are dragging over are visible
			*/

			drag_manager.selected_items[x].style.zindex="-1";
		

		}

		folder_count=0;
		
		/*
		* code to highlight the folders
		*/
			
		while(folder_count!=folder_position_top.length){

			if((folder_position_top[folder_count]+(drag_manager.body_scroll+drag_manager.new_scroll)<=mousecursor.y)&&(mousecursor.y<=folder_position_bottom[folder_count]+(drag_manager.body_scroll+drag_manager.new_scroll))){
					
				
				if(String(drag_manager.last_mouse_over)!=String(folder_div_id[folder_count].id)){	
							
					if(drag_manager.last_mouse_over!=null){
										
						document.getElementById(String(drag_manager.last_mouse_over)).style.backgroundColor = "#fff";						

					}
									
					drag_manager.last_mouse_over = String(folder_div_id[folder_count].id);
					
					if(folder_div_id[folder_count].className=="folder"){
					
						if(!folder_div_id[folder_count].highlight){
	
							folder_div_id[folder_count].style.backgroundColor="#c2ccd8";
						
						}	
										
					}
					
				}
						
			}			
				
			folder_count++;

		}
		
		drag_manager.dragged=true;

	}			
	
													
	temp = document.getElementById('file_area');
	
	new_cursor_location = mousecursor.y-temp.parentNode.offsetTop;
	
}

var last_click = 0;
var folder_lock = false;

	 /**
	 * 
	 * Function single click
 	 * This function works out whether a highlight or a drag
	 * @param object div_name = The div clicked on
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function single_click(div_name){

	/*
	* De highlight the recycle bin / workspace
	*/

	if(document.getElementById("recyclebin").mainhighlight){
		document.getElementById("recyclebin").style.backgroundColor = "#ffffff";		
		document.getElementById("recyclebin").mainhighlight = false;
	}

	if(document.getElementById("folder_workspace").mainhighlight){
		document.getElementById("folder_workspace").style.backgroundColor = "#ffffff";		
		document.getElementById("folder_workspace").mainhighlight = false;
	}

	if(div_name.highlight==false){
			
		/*
		* if nothing is highlighted	
		*/
			
		if(drag_manager.selected_items.length==0){

			highlight(div_name);
			drag_manager.last_selected = div_name;
			drag_manager.selected_items.push(div_name);
					
		/*
		* if something is highlighted and control is held down			
		*/
					
		}else if((drag_manager.selected_items!=0)&&(drag_manager.active_key==17)){
		
			highlight(div_name);
			drag_manager.last_selected = div_name;
			drag_manager.selected_items.push(div_name);
			
		/*
		* if something is highlighted and shift is held down	
		*/
	
		}else if((drag_manager.selected_items.length!=0)&&(drag_manager.active_key==16)){
		
			div_original_parent = drag_manager.selected_items[0].parentNode;

			div_request_parent = div_name.parentNode;

			if(div_original_parent.id==div_request_parent.id){

				x_last = 0;
				x_current = 0;
		
				for(x=0;x!=div_name.parentNode.childNodes.length;x++){
			
					if(div_name.parentNode.childNodes[x].highlight==true){
				
						highlight(div_name.parentNode.childNodes[x]);
						drag_manager.selected_items.push(div_name);
				
					}

					if(div_name.parentNode.childNodes[x]==div_name){
				
						x_current = x;
										
					}
					
					if(div_name.parentNode.childNodes[x]==drag_manager.last_selected){
				
						x_last = x;	
													
					}
					
				}
		
				/*
				* empty the selected items array
				*/

				drag_manager.selected_items.splice(0,drag_manager.selected_items.length);

				if(x_last<x_current){
			
					for(z=x_last;z<=x_current;z++){
				
						if(div_name.parentNode.childNodes[z].highlight==false){
					
								highlight(div_name.parentNode.childNodes[z]);	
								drag_manager.selected_items.push(div_name.parentNode.childNodes[z]);
								div_name.parentNode.childNodes[z].original_offset = div_name.parentNode.childNodes[z].offsetTop;
							}
				
					}
				
				}else{
			
					for(z=x_current;z<=x_last;z++){
			
						if(div_name.parentNode.childNodes[z].highlight==false){
				
							highlight(div_name.parentNode.childNodes[z]);
							drag_manager.selected_items.push(div_name.parentNode.childNodes[z]);
							div_name.parentNode.childNodes[z].original_offset = div_name.parentNode.childNodes[z].offsetTop;
						
						}

					}
				
				}
			
			}		
			

		}else if(drag_manager.selected!=0){

			/*
			* code to unhighlight
			*/

			while(x=drag_manager.selected_items.pop()){
			
				highlight(x);
	
			}
			
			highlight(div_name);
			drag_manager.last_selected = div_name;
			drag_manager.selected_items.push(div_name);
		
		}		
	
	}else{

		if(drag_manager.active_key!=17){

			for(q=0;q<drag_manager.selected_items.length;q++){

				if(drag_manager.selected_items[q].highlight){

					highlight(drag_manager.selected_items[q]);

				}

			}

			drag_manager.selected_items.splice(0,drag_manager.selected_items.length);

			if(drag_manager.last_selected.id!=div_name.id){

				highlight(div_name);
				drag_manager.last_selected = div_name;
				drag_manager.selected_items.push(div_name);

			}

		}

	}	

	button_check();
	
}

var open_folders = new Array();

	 /**
	 * 
	 * Function folder open close
 	 * This function opens and closes folders
	 * @param objecr ref - the id of the folder clicked on
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function folder_open_close(ref){

	temp=ref;

	temp = temp.id.substr(temp.id.indexOf("_")+1,temp.id.length);

	if(temp!="workspace"){

		if(!document.getElementById("folder_" + temp).open){

			document.getElementById("folder_" + temp).open=true;
			document.getElementById("folderchild_" + temp).style.display="block";

			if(document.getElementById(ref.id + "_image")){
				document.getElementById(ref.id + "_image").src = "website_code/images/Icon_FolderOpen2.gif";
			}
			open_folders.push(ref);

		}else{

			delete_div="";

			document.getElementById("folder_" + temp).open=false;
			document.getElementById("folderchild_" + temp).style.display="none";
			if(document.getElementById(ref.id + "_image")){
				document.getElementById(ref.id + "_image").src = "website_code/images/Icon_Folder.gif";
			}
			for(x=0;x!=open_folders.length;x++){

				if(ref == open_folders[x]){

					delete_div =x;

				}

			}

			open_folders.splice(delete_div,1);

		}

		folder_lock=false;

	}

}