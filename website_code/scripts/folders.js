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
	 * folders, code for handling folders
	 *
	 * @author Patrick Lockley
	 * @version 1.0
	 * @package
	 */

 	/**
	 * 
	 * Function file status stage changed
 	 * This function renames the folder
	 * @version 1.0
	 * @author Patrick Lockley
	 */


function file_status_stateChanged(){ 

	if (xmlHttp.readyState==4){ 
		
		//screen_refresh();
        refresh_workspace();
		
	}
}

var folder_timeout = 0;

 	/**
	 * 
	 * Function folder status state changed
 	 * This function handles what happens after a new folder has been recreated
	 * @version 1.0
	 * @author Patrick Lockley
	 */


function folder_status_stateChanged(){ 

	if (xmlHttp.readyState==4){ 

		document.getElementById("folder_feedback").innerHTML = xmlHttp.responseText;

		refresh_workspace();

		folder_timeout = setTimeout("popup_close()",500);

	}
}

 	/**
	 * 
	 * Function delete folder
 	 * This function deletes a folder
	 * @param string folder_id = the id of this folder
	 * @version 1.0
	 * @author Patrick Lockley
	 */


function delete_folder(folder_id){

	if(setup_ajax()!=false){
    
		var url="website_code/php/folders/delete_folder.php";

   		xmlHttp.open("post",url,true);
		xmlHttp.onreadystatechange=file_status_stateChanged;
		xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xmlHttp.send('folder_id=' + folder_id); 

	}

}

 	/**
	 * 
	 * Function create folder
 	 * This function creates a folder
	 * @version 1.0
	 * @author Patrick Lockley
	 */


function create_folder(){

    var foldername = document.getElementById('foldername').value;
	if(is_ok_name(foldername)){

		if(setup_ajax()!=false){

			var url="website_code/php/folders/make_new_folder.php";

	   		xmlHttp.open("post",url,true);
			xmlHttp.onreadystatechange=folder_status_stateChanged;
			xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

			/*
			* if a folder is selected, create the folder in that folder
			*/
            var tree = $.jstree.reference("#workspace"),
                ids = tree.get_selected();
			if(ids.length==1){
                var node = workspace.nodes[ids[0]];
                if(node.xot_type == "folder"){
                    /*
                    * Open this folder
                    */

                    setTimeout(function () {tree.open_node(node.id)}, 250);


                    xmlHttp.send('folder_id=' + node.xot_id + '&folder_name=' + foldername);

                }else{

                    xmlHttp.send('folder_id=file_area&folder_name=' + foldername);

                }
			}else{

				xmlHttp.send('folder_id=file_area&folder_name=' + foldername);
 
			}

		}
	
	}else{

		alert("Sorry that is not a valid folder name. Please use only letters and numbers");

	}	

}

 	/**
	 * 
	 * Function make new folder
 	 * This function shows the new folder pop up
	 * @version 1.0
	 * @author Patrick Lockley
	 */


function make_new_folder(){

	/*
	* place the folder popup
	*/
/*
	tag = document.getElementById("file_area");

	x=0;
	y=0;	

	while(tag.className!="pagecontainer"){

		x += tag.offsetLeft;
		y += tag.offsetTop;

		if(tag.parentNode){

			tag = tag.parentNode;

		}else{

			break;

		}

	} 
	
	file_area_width = document.getElementById("file_area").offsetWidth;
*/
	document.getElementById("message_box").style.left = "250px"; // x + (file_area_width/2) - 150 + "px";
	document.getElementById("message_box").style.top = "150px";  // y + 100 +"px";
	document.getElementById("message_box").style.display = "block";

	//document.getElementById("message_box").innerHTML = '<div class="corner" style="background-image:url(website_code/images/MessBoxTL.gif); background-position:top left;">		</div><div class="central" style="background-image:url(website_code/images/MessBoxTop.gif);"></div><div class="corner" style="background-image:url(website_code/images/MessBoxTR.gif); background-position:top right;"></div><div class="main_area_holder_1"><div class="main_area_holder_2"><div class="main_area" id="dynamic_section"><p>What would you like to call your folder?</p><form id="foldernamepopup" name="foldercreateform" action="javascript:create_folder()" method="post" enctype="text/plain" style="display:inline"><div style="margin-left: 30px;"><input type="text" width="200" id="foldername" name="foldername" /><br/><input type="image" src="website_code/images/Bttn_CreateOff.gif" onmouseover="this.src=\'website_code/images/Bttn_CreateOn.gif\'" onmousedown="this.src=\'website_code/images/Bttn_CreateClick.gif\'" onmouseout="this.src=\'website_code/images/Bttn_CreateOff.gif\'" style="padding:3px" /><img src="website_code/images/Bttn_CancelOff.gif" onmouseover="this.src=\'website_code/images/Bttn_CancelOn.gif\'" onmousedown="this.src=\'website_code/images/Bttn_CancelClick.gif\'" onmouseout="this.src=\'website_code/images/Bttn_CancelOff.gif\'" onclick="javascript:popup_close()" style="padding:3px" /></div></form><p><span id="folder_feedback"></span></p></div></div></div><div class="corner" style="background-image:url(website_code/images/MessBoxBL.gif); background-position:top left;"></div><div class="central" style="background-image:url(website_code/images/MessBoxBottom.gif);"></div><div class="corner" style="background-image:url(website_code/images/MessBoxBR.gif); background-position:top right;"></div>';


	document.getElementById("message_box").style.zindex = 2;	

	
}

 	/**
	 * 
	 * Function popup close
 	 * This function closes the new folder pop up
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function popup_close(){

	clearTimeout(folder_timeout);

	document.getElementById("message_box").style.display = "none";
	document.getElementById("message_box").style.zindex = 0;	

}

 	/**
	 * 
	 * Function copy to folder
 	 * This function moves files and folders to other folders
	 * @param string items = the id of the item dropped
 	 * @param string items_type = whether file or folder
  	 * @param string items_parent = The previous parent for this item
  	 * @param string destination - the target
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function copy_to_folder(data){
    var tree = $.jstree.reference("#workspace"),
        ids = tree.get_selected();

    // node to move
    var node = workspace.nodes[data.node.id];
    var destination = workspace.nodes[data.parent];
    setTimeout(function () {tree.open_node(destination.id)}, 250);
	if(setup_ajax()!=false){
    
		var url="website_code/php/folders/copy_to_new_folder.php";

   		xmlHttp.open("post",url,true);
		xmlHttp.onreadystatechange=file_status_stateChanged;
		xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        if (node.xot_type == "folder") {
            xmlHttp.send('folder_id=' + node.xot_id + '&destination=' + destination.xot_id);
        }
        else
        {
            xmlHttp.send('template_id=' + node.xot_id + '&destination=' + destination.xot_id);
        }

	}
	
}
