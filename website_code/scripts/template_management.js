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
 * template management, javascript for the management of the templates in the file area and their creation
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function() 
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}
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

    switch (url) {

        case "edit":
            if (site_apache == "true") {

                return url + "_" + parameter;

            } else {

                return url + ".php?template_id=" + parameter;

            }
        case "edithtml":
            if (site_apache == "true") {

                return url + "_" + parameter;

            } else {

                return url + ".php?template_id=" + parameter;

            }
            break;
        case "preview":
            if (site_apache == "true") {

                return url + "_" + parameter;

            } else {

                return url + ".php?template_id=" + parameter;

            }
            break;
        case "play":
            if (site_apache == "true") {

                return url + "_" + parameter;

            } else {

                return url + ".php?template_id=" + parameter;

            }
            break;
        case "properties":
            if (site_apache == "true") {

                return url + "_" + parameter;

            } else {

                return url + ".php?template_id=" + parameter;

            }
            break;
        case "folderproperties":
            if (site_apache == "true") {

                return url + "_" + parameter;

            } else {

                return url + ".php?template_id=" + parameter;

            }
            break;
        case "workspaceproperties":
            if (site_apache == "true") {

                return url;

            } else {

                return url + ".php"

            }
        case "publishproperties":
            if (site_apache == "true") {

                return url + "_" + parameter;

            } else {

                return url + ".php?template_id=" + parameter;

            }
            break;


        default:
            break;

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
    var butt = document.getElementById(tag+'_button');

    if((temp.style.display=="none")||(temp.style.display=="")){
        temp.style.display="block";	
				butt.style.display="none";
    }else{
        temp.style.display="none";
				butt.style.display="";
    }	

}

// Function toggle (obsolete) ********** CHECK ***************
//
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

function edit_window(admin,edit){

    if(!admin){

        var tree = $.jstree.reference("#workspace"),
            ids = tree.get_selected();
        if (ids.length == 0)
            return;

        for(var i=0; i<ids.length; i++)
        {
            var node = workspace.nodes[ids[i]];
            if(node.xot_type == "file"){

                if(node.parent != workspace.recyclebin_id){
                    window_id = "editwindow" + node.id;
					
                    window_open = false;
					
					if (typeof(edit_window_open) != 'undefined') {

						for(z=0;z<edit_window_open.length;z++){
							if(("editwindow" + edit_window_open[z].id)==window_id) {
								window_open = edit_window_open[z].window;
							}
						}
					}

                    if(!window_open){
						
						size = node.editor_size.split(",");

						if(size.length==1){
							var NewEditWindow = window.open(site_url + url_return(edit, node.xot_id), "editwindow" + node.id );
						}else{
							var NewEditWindow = window.open(site_url + url_return(edit, node.xot_id), "editwindow" + node.id, "height=" + size[1] + ", width=" + size[0] + ", resizable=yes");
						}

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
						self.last_reference = self;		
						
						NewEditWindow.focus();
						
						edit_window_open.push({id:node.id, window:NewEditWindow});

                    } else {
						window_open.focus();
					}

                }else{

                    alert(RECYCLE_EDIT);

                }

            }else{

                alert(FOLDER_EDIT);

            }

        }

    }else{

        var NewEditWindow = window.open(site_url + url_return("edithtml", admin), "editwindow" + admin, "height=665, width=800" );

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
            if(edit_window_open[x].id.substr(5,edit_window_open[x].id.length-5)==path.substr(0,path.indexOf("-"))){

                edit_window_open.splice(x,1);

            }			

        }else{

            if(edit_window_open[x].id.substr(5,edit_window_open[x].id.length-5)==path){

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
        response = xmlHttp.responseText.trim();
        if(response!=""){
            alert(response);
        }
        refresh_workspace();
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
                xmlHttp.send('file_path=' + result[1] + "&template_id=" + result[2]);

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
			
			if(edit_window_open[x].id.substr(edit_window_open[x].id.lastIndexOf("_")+1,edit_window_open[x].id.length)==path.substr(0,path.indexOf("-"))){
			//if(edit_window_open[x].substr(5,edit_window_open[x].length-5)==path.substr(0,path.indexOf("-"))){
                edit_window_open.splice(x,1);
            }

        }else{
            if(edit_window_open[x].id.substr(5,edit_window_open[x].id.length-5)==path){
                edit_window_open.splice(x,1);
            }

        }

    }

    if(setup_ajax()!=false){

        var url="website_code/php/versioncontrol/template_close.php";

        xmlHttp.open("post",url,false);
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

        alert(NO_EXAMPLE);
		
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
            var tree = $.jstree.reference("#workspace"),
                ids = tree.get_selected();
            if (ids.length == 0)
                return;

            for(var i=0; i<ids.length; i++)
            {
                var node = workspace.nodes[ids[i]];

                if(node.xot_type=="file"){

					size = node.preview_size.split(",");
					
					if(size.length!=1){
					

						var PreviewWindow = window.open(site_url + url_return("preview", node.xot_id), "previewwindow" + node.id, "height=" + size[1] + ", width=" + size[0] + ", scrollbars=yes,resizable=1" );
						
					}else{
					

						var PreviewWindow = window.open(site_url + url_return("preview", node.xot_id), "previewwindow" + node.id, "height=768,width=1024,scrollbars=yes,resizable=true");
						
					}

                }else{

                    alert(PROJECT_SELECT);

                }

            }

        }	

    }else{

        var PreviewWindow = window.open(site_url + url_return("preview", admin), "previewwindow" + admin, "scrollbars=yes");

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

            var NewWindow = window.open(site_url + url_return("play",property_id), "examplewindow" + property_id, parameter);

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

function publishproperties_window(admin) {
    var tree = $.jstree.reference("#workspace"),
        ids = tree.get_selected();
    if (ids.length == 1) {
        var node = workspace.nodes[ids[0]];

        if (node.xot_type == "file") {
            var NewWindow = window.open(site_url + url_return("publishproperties", node.xot_id), node.xot_id, "height=600, width=635");
            NewWindow.window_reference = self;
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

function properties_window(admin) {
    if (!admin) {
        var tree = $.jstree.reference("#workspace"),
            ids = tree.get_selected();
        if (ids.length == 0)
            return;

        if (workspace.nodes[ids[0]].type == "workspace") {
            var NewWindow = window.open(site_url + url_return("workspaceproperties", null), "workspace", "height=600, width=635");
            NewWindow.window_reference = self;
            NewWindow.focus();
        } else {
            for (var i = 0; i < ids.length; i++) {
                if (workspace.nodes[ids[i]].type != "folder") {
                    if (workspace.nodes[ids[i]].parent != workspace.recyclebin_id) {
                        var NewWindow = window.open(site_url + url_return("properties", workspace.nodes[ids[i]].xot_id), workspace.nodes[ids[i]].xot_id, "height=600, width=635");
                        NewWindow.window_reference = self;
                        NewWindow.focus();
                    } else {
                        alert(RECYCLE_PROPERTIES);
                    }
                } else {
                    var NewWindow = window.open(site_url + url_return("folderproperties", workspace.nodes[ids[i]].xot_id + "_folder"), workspace.nodes[ids[i]].xot_id + "_folder", "height=600, width=635");
                    NewWindow.window_reference = self;
                    NewWindow.focus();
                }
            }
        }
    } else {
        var NewWindow = window.open(site_url + url_return("properties", admin), admin, "height=600, width=630");

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


function refresh_workspace(){
    if(setup_ajax()!=false){
        var url="website_code/php/templates/get_templates_sorted.php";

        xmlHttp.open("post",url,true);
        xmlHttp.onreadystatechange=refreshworkspace_stateChanged;
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


function refreshworkspace_stateChanged(){

    if (xmlHttp.readyState==4){ 

        //document.getElementById('file_area').innerHTML = xmlHttp.responseText;

        var response=xmlHttp.responseText;
        workspace = JSON.parse(response);
        init_workspace();

    }

}

function getProjectInformation(user_id, template_id){
    if(setup_ajax()!=false){
        var url="website_code/php/templates/get_template_info.php";

        xmlHttp.open("post",url,true);
        xmlHttp.onreadystatechange=getProjectInformation_stateChanged;
        xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xmlHttp.send('user_id=' + user_id + '&template_id=' + template_id);
    }
}

function getProjectInformation_stateChanged(){

    if (xmlHttp.readyState==4){
        var response=xmlHttp.responseText;
        var info = JSON.parse(response);
        document.getElementById('project_information').innerHTML = info.properties;
        if (info.role == 'read-only')
        {
            // disable edit button.
            var editbtn = document.getElementById("edit");
            var propertiesbtn = document.getElementById("properties");
            var deletebtn = document.getElementById("delete");
            var publishbtn = document.getElementById("publish");

            editbtn.disabled="disabled";
            editbtn.className = "xerte_button_c_no_width disabled";
            editbtn.onclick="";

            publishbtn.disabled="disabled";
            publishbtn.className = "xerte_button_c_no_width disabled";
            publishbtn.onclick="";

            propertiesbtn.disabled="disabled";
            propertiesbtn.className = "xerte_button_c_no_width disabled";
            propertiesbtn.onclick="";

            deletebtn.disabled="disabled";
            deletebtn.className = "xerte_button_c_no_width disabled";
            deletebtn.onclick="";
        }
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

                    //screen_refresh();
                    refresh_workspace();

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
        response = xmlHttp.responseText.trim();

        if(response.indexOf("Sorry")==0){
            alert(DELETE_ERROR + ' "' + response + '"');

        }		

        //screen_refresh();
        refresh_workspace();

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
    var tree = $.jstree.reference("#workspace"),
        ids = tree.get_selected();

    if(ids.length==1){

        var node = workspace.nodes[ids[0]];
        if(node.xot_type=="file"){

            if(node.parent!= workspace.recyclebin_id){

                /*
                 * code to prevent folders being dupped
                 */

                if(setup_ajax()!=false){

                    var url="website_code/php/templates/duplicate_template.php";

                    template_id = node.xot_id;

                    template_name = node.text;

                    folder_id = workspace.nodes[node.parent].xot_id;

                    xmlHttp.open("post",url,true);
                    xmlHttp.onreadystatechange=duplicate_stateChanged;
                    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                    xmlHttp.send('template_id=' + template_id + '&template_name=' + template_name + '&folder_id=' + folder_id); 

                }

            }else{

                alert(RECYCLE_DUPLICATE);

            }

        }else{

            alert(DUPLICATE_PROMPT);

        }

    }else if(ids.length==0){

        alert(DUPLICATE_PROMPT_OTHER);

    }else{

        alert(DUPLICATE_LIMIT);

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
        response = xmlHttp.responseText.trim();

        if(response!=""){
            alert(DUPLICATE_ERROR + ' "' + response + '"');

        }

        //screen_refresh();
        refresh_workspace();

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
    var tree = $.jstree.reference("#workspace"),
        ids = tree.get_selected();

    if(ids.length==1){
        publishproperties_window();
    }else{
        alert(PUBLISH_LIMIT);
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

        alert(PUBLISH_SUCCESS);

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

    var tree = $.jstree.reference("#workspace"),
        ids = tree.get_selected();
    if (ids.length == 0)
        return;

    if(ids[0] == workspace.recyclebin_id) {
        var response = confirm(RECYCLE_EMPTY);

        if (response) {
            var node = workspace.nodes[ids[0]];
            var folder_node = tree.get_node(node.id, false);

            number_of_files_to_delete =folder_node.children.length;
            for (var i=0; i<folder_node.children.length; i++)
            {
                recycle_bin_remove_all_template(workspace.nodes[folder_node.children[i]].xot_id);
            }
        }
    }
    else if (ids[0] == workspace.workspace_id)
    {
        alert(WORKSPACE_DELETE);
    }else{

        if(ids.length!=1){
            var response = confirm(DELETE_PROMPT);
        }else{
            var response = confirm(workspace.nodes[ids[0]].text + "\n\n" + DELETE_PROMPT);
        }

        if(response){
            for(var i=0; i<ids.length; i++)
            {
                var node = workspace.nodes[ids[i]];
                if(node.xot_type=="file"){
                    if(node.parent==workspace.recyclebin_id){
                        var answer = confirm(DELETE_PERMENANT_PROMPT + " - " + node.text);
                        if(answer){
                            remove_template(node.xot_id);
                        }
                    }else{
                        delete_template(node.xot_id);
                    }
                }else{
                    var folder_node = tree.get_node(node.id, false);

                    var folder_children = folder_node.children.length;

                    if(folder_children!=0){

                        alert(DELETE_FOLDER_NOT_EMPTY);

                    }else{
                        delete_folder(node.xot_id);
                    }
                }
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
var new_template_folder=null;


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

            refresh_workspace();

        }

    }

}

/**
 * Test if the new window is blocked!
 */
var popupBlockerChecker = {
    check: function(popup_window){
        var _scope = this;
        if (popup_window) {
            if(/chrome/.test(navigator.userAgent.toLowerCase())){
                setTimeout(function () {
                    _scope._is_popup_blocked(_scope, popup_window);
                },200);
            }else{
                popup_window.onload = function () {
                    _scope._is_popup_blocked(_scope, popup_window);
                };
            }
        }else{
            _scope._displayError();
        }
    },
    _is_popup_blocked: function(scope, popup_window){
        if ((popup_window.innerHeight > 0)==false){ scope._displayError(); }
    },
    _displayError: function(){
        alert(POPUP_BLOCKER_ACTIVATED);
    }
};
/**
 * 
 * Function tutorial created
 * This function opens the edit window when a new file is created
 * @version 1.0
 * @author Patrick Lockley
 */

function tutorial_created(){ 

    if (xmlHttp.readyState==4){ 
        if( typeof xmlHttp.responseText == 'string' ) {
            response = String(xmlHttp.responseText);
            response = response.trim();
            if(response!=""){
				data = xmlHttp.responseText.split(",");

                open_created_node(data[0], new_template_folder);
                update_your_projects();

				if(data[1]=="*"){
				
					var neweditorwindow = window.open(site_url + url_return("edithtml" , data[0]), "editwindow" + data[0], "height=" + screen.height + ", width=" + screen.width);
					
				}else{
				    var url=site_url + url_return("edithtml" , data[0]);
                    var title="editwindow" + data[0];
                    var options="height=" + data[2].trim() + ", width=" + data[1].trim();
					var neweditorwindow = window.open(url, title, options);
						
				}
                popupBlockerChecker.check(neweditorwindow);
                new_file = xmlHttp.responseText;
                neweditorwindow.window_reference = self;
				
                neweditorwindow.focus();

            }
        }
    }
} 

function open_created_node(template_id, folder_id)
{
    setTimeout(function(){
        // Hope workspace has been updated in the mean time,
        // Search the template, and open the node
        var tree = $.jstree.reference("#workspace");
        var node;
        for (var i=0; i<workspace.items.length; i++)
        {
            if (workspace.items[i].xot_id == template_id)
            {
                node = workspace.items[i];
                tree.deselect_all();
                tree.select_node(node.id);
                break;
            }

        }
    }, 1000);
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

        /*
         * if a folder is selected, create the folder in that folder
         */
        var tree = $.jstree.reference("#workspace"),
            ids = tree.get_selected();
        new_template_folder = "";
        if(ids.length==1) {
            var node = workspace.nodes[ids[0]];
            if (node.xot_type == "folder") {
                new_template_folder = node.xot_id;
            }
        }
        xmlHttp.open("post",url,true);
        xmlHttp.onreadystatechange=tutorial_created;
        xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        if(is_ok_name(document.getElementById(tutorial).childNodes[1].filename.value)){
            xmlHttp.send('tutorialid=' + tutorial + '&tutorialname=' + document.getElementById(tutorial).childNodes[1].filename.value + '&folder_id=' + new_template_folder);
        }else{
            alert(NAME_FAIL);
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