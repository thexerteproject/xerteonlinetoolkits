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
	 * screen display, javascript for the various functions to do with screen display
	 *
	 * @author Patrick Lockley
	 * @version 1.0
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

	while(current_node!=null && current_node.id!="pagecontainer"){


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
// TODO: depracate
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
// TODO: depracate
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
// TODO: depracate
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
// TODO: depracate
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
//TODO: depracate
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
//TODO : depracate
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

     var tree = $.jstree.reference("#workspace"),
         ids = tree.get_selected();



    editbtn.disabled="disabled";
    editbtn.className = "xerte_button_c_no_width disabled";
    editbtn.onclick="";

    previewbtn.disabled="disabled";
    previewbtn.className = "xerte_button_c_no_width disabled";
    previewbtn.onclick="";

    deletebtn.disabled="disabled";
    deletebtn.className="xerte_button_c_no_width disabled";
    deletebtn.onclick="";

    duplicatebtn.disabled="disabled";
    duplicatebtn.className = "xerte_button_c_no_width disabled";
    duplicatebtn.onclick="";

    publishbtn.disabled="disabled";
    publishbtn.className = "xerte_button_c_no_width disabled";
    publishbtn.onclick="";

    propertiesbtn.disabled="disabled";
    propertiesbtn.className = "xerte_button_c_no_width disabled";
    propertiesbtn.onclick="";

    deletebtn.disabled="disabled";
    deletebtn.className = "xerte_button_c_no_width disabled";
    deletebtn.onclick="";

    if(ids.length==1) {
        switch (workspace.nodes[ids[0]].type) {
            case "workspace":
                propertiesbtn.removeAttribute("disabled");
                propertiesbtn.className = "xerte_button_c_no_width";
                propertiesbtn.onclick = function () {
                    properties_window()
                };
                break;
            case "recyclebin":
                deletebtn.removeAttribute("disabled");
                deletebtn.className = "xerte_button_c_no_width";
                deletebtn.onclick = function () {
                    remove_this()
                };
                break;
            case "folder":
                propertiesbtn.removeAttribute("disabled");
                propertiesbtn.className = "xerte_button_c_no_width";
                propertiesbtn.onclick = function () {
                    properties_window()
                };

                deletebtn.removeAttribute("disabled");
                deletebtn.className = "xerte_button_c_no_width";
                deletebtn.onclick = function () {
                    remove_this()
                };
                break;
            default:
                propertiesbtn.removeAttribute("disabled");
                propertiesbtn.className = "xerte_button_c_no_width";
                propertiesbtn.onclick = function () {
                    properties_window()
                };

                editbtn.removeAttribute("disabled");
                editbtn.className = "xerte_button_c_no_width";
                editbtn.onclick = function (e) {
                    if (e.shiftKey) {
                        edit_window(false, "edit");
                    }
                    else {
                        edit_window(false, "edithtml");
                    }
                };

                previewbtn.removeAttribute("disabled");
                previewbtn.className = "xerte_button_c_no_width";
                previewbtn.onclick = function () {
                    preview_window()
                };

                deletebtn.removeAttribute("disabled");
                deletebtn.className = "xerte_button_c_no_width";
                deletebtn.onclick = function () {
                    remove_this()
                };

                duplicatebtn.removeAttribute("disabled");
                duplicatebtn.className = "xerte_button_c_no_width";
                duplicatebtn.onclick = function () {
                    duplicate_template()
                };

                publishbtn.removeAttribute("disabled");
                publishbtn.className = "xerte_button_c_no_width";
                publishbtn.onclick = function () {
                    publish_this()
                };
        }
    }
    else
    {
        deletebtn.removeAttribute("disabled");
        deletebtn.className = "xerte_button";
        deletebtn.onclick = function () {
            remove_this()
        };
    }
}

function setupMainLayout()
{
    var opentooltip = "Open this pane",
        closetooltip = "Close this pane",
        resizetooltip = "Resize this pane",
        xertemain_layout_settings = {
            name: "xertemain_layout",
            defaults: {
                size:                   "auto",
                minSize:                50,
                paneClass:              "pane",
                resizerClass:           "resizer",
                togglerClass:           "toggler",
                buttonClass:            "button",
                contentSelector:        ".content",
                contentIgnoreSelector:  "span",
                togglerLength_open:     35,
                togglerLength_closed:   35,
                hideTogglerOnSlide:     true,
                togglerTip_open:        closetooltip,
                togglerTip_closed:      opentooltip,
                resizerTip:             resizetooltip,
                fxName:                 "none",
                /*
                fxName:                 "none",
                fxSpeed_open:           750,
                fxSpeed_close:          1500,
                fxSettings_open:        { easing: "easeInQuint" },
                fxSettings_close:       { easing: "easeOutQuint" }
                */
            },
            north: {
                size:                   117,
                minSize:                65,
                spacing_open:           1,
                togglerLength_open:     0,
                togglerLength_closed:   -1,
                resizable:              false,
                slidable:               false,
                closable:               false,
                fxName:                 "none"
            },
            south: {
                size:                   "auto",
                minSize:                40,
                maxSize:                250,
                spacing_closed:         21,
                spacing_open:           6,
                togglerLength_closed:   21,
                togglerLength_open:     0,
                togglerAlign_closed:    "right",
                togglerTip_open:        closetooltip,
                togglerTip_closed:      opentooltip,
                resizerTip_open:        resizetooltip,
                slideTrigger_open:      "mouseover",
                slidable:               true,
                initClosed:             false,
                slidable:               false,
                closable:               true
                /*
                 fxName:                 "drop",
                 fxSpeed:                "normal",
                fxSettings:             { easing: "" } // remove default
                */
            },

            center: {
                //paneSelector:           "#mainContent",
                minWidth:               200,
                minHeight:              200/*,
                 contentSelector:        ".ui-layout-content"*/
            }
        },
        xerteinner_layout_settings = {
            name: "xerteinner_layout",
            defaults: {
                size:                   "auto",
                minSize:                50,
                paneClass:              "pane",
                resizerClass:           "resizer",
                togglerClass:           "toggler",
                buttonClass:            "button",
                contentSelector:        ".content",
                contentIgnoreSelector:  "span",
                togglerLength_open:     35,
                togglerLength_closed:   35,
                hideTogglerOnSlide:     true,
                togglerTip_open:        closetooltip,
                togglerTip_closed:      opentooltip,
                resizerTip:             resizetooltip,
                fxName:                 "none",
                /*
                fxName:                 "slide",
                fxSpeed_open:           750,
                fxSpeed_close:          1500,
                fxSettings_open:        { easing: "easeInQuint" },
                fxSettings_close:       { easing: "easeOutQuint" },
                */
                closable:               false
            },

            west: {
                size:                   400,
                minSize:                200,
                spacing_open:           6,
                spacing_closed:         21,
                togglerLength_closed:   21,
                togglerAlign_closed:    "top",
                togglerLength_open:     0,
                togglerTip_open:        closetooltip,
                togglerTip_closed:      opentooltip,
                resizerTip_open:        resizetooltip,
                slideTrigger_open:      "click",
                initClosed:             false
                /*
                fxName:                 "drop",
                fxSpeed:                "normal",
                fxSettings:             { easing: "" } // remove default
                */
            },
            east: {
                size:                   300,
                minSize:                150,
                maxSize:                450,
                spacing_open:           6,
                spacing_closed:         21,
                togglerLength_closed:   21,
                togglerAlign_closed:    "top",
                togglerLength_open:     0,
                togglerTip_open:        closetooltip,
                togglerTip_closed:      opentooltip,
                resizerTip_open:        resizetooltip,
                slideTrigger_open:      "click",
                initClosed:             false,
                closable:               true,
                resizable:              true
                /*
                onclose: function()
                {
                    $('div.toggler-east-closed').addClass("fa").addClass("fa-chevron-right").addClass("xerte-icon").append("test");
                }
                */
                /*
                fxSettings_open:        { easing: "easeOutBounce" }
                */
            },

            center: {
                //paneSelector:           "#mainContent",
                minWidth:               200,
                minHeight:              200/*,
                 contentSelector:        ".ui-layout-content"*/
            }
        };

    console.log("Setting up MainLayout...");

    xertemain_layout = $("body").layout( xertemain_layout_settings );
    xerteinner_layout = $("#pagecontainer").layout( xerteinner_layout_settings);

    var right_column = "#pagecontainer > .ui-layout-east";
    var south_pane = "body > .ui-layout-south";

    /* ** Add pin buttons and wire them up **
    $("<span></span>").addClass("pin-button").prependTo( right_column );
    xerteinner_layout.addPinBtn( right_column +" .pin-button", "east" );
	*/
    $("<span></span>").addClass("pin-button").prependTo( south_pane );
    xertemain_layout.addPinBtn( south_pane +" .pin-button", "south" );

    // ** Add close buttons and wire them up **
    $("<span></span>").attr("id", "east-closer").prependTo( right_column );
    xerteinner_layout.addCloseBtn("#east-closer", "east");

    $("<span></span>").attr("id", "south-closer").prependTo( south_pane );
    xertemain_layout.addCloseBtn("#south-closer", "south");

    dynamicResize();

    $(window).resize(function ()
    {
        dynamicResize();
    });
}


function dynamicResize()
{
	
    // Set sizes, get the windows size
    var windowWidth = parseInt($(window).width());
    var windowHeight = parseInt($(window).height());

    // If Window is narrow, close east panel, and make center panel narrow
    if (windowWidth < 650)
    {
        // Close east panel
        xerteinner_layout.close('east');
    }
    // Make west panel 60% of windowWidth
    xerteinner_layout.sizePane('west', windowWidth * 0.45);

    // If window is low, close south panel
    if (windowHeight < 400)
    {
        xertemain_layout.close('south');
    }
}

function getIcon(nodetype)
{
    switch(nodetype)
    {
        case "workspace":
            icon = "website_code/images/folder_workspace.gif";
            break;
        case "recyclebin":
            icon = "website_code/images/rb_empty.gif";
            break;
        case "folder":
            icon = "website_code/images/Icon_Folder.gif";
            break;
        default:
            icon = "website_code/images/Icon_Page_" + nodetype + ".gif";
    }
    return icon;
};

function create_node_type(nodetype, children) {
    // clone children
    var lchildren = children.slice();

    return {
        icon: getIcon(nodetype),
        valid_children: lchildren
    };
};


/**
 * Initialise tree from workspace (a json structure that contains all the info to build the tree)
 * information is in global variable workspace
 */
function init_workspace()
{
    // build Types structure for the types plugin
    var node_types = {};
    // root
    node_types["#"] = create_node_type(null, ["workspace", "recyclebin"]); // Make sure that only the Workspace and recyclebin can be at root level

    // workspace
    var workspace_children = ["folder"];
    workspace_children = workspace_children.concat(workspace.templates);
    node_types["workspace"] = create_node_type("workspace", workspace_children);

    //recyclebin
    var recyclebin_children = ["folder"];
    recyclebin_children = recyclebin_children.concat(workspace.templates);
    node_types["recyclebin"] = create_node_type("recyclebin", recyclebin_children);

    //folder
    var folder_children = ["folder"];
    folder_children = folder_children.concat(workspace.templates);
    node_types["folder"] = create_node_type("folder", folder_children);

    $.each(workspace.templates, function () {
        node_types[this] = create_node_type(this, [""]);
    });

	// Remove _ from project names
	$.each(workspace.items, function () {
        this.text = this.text.replace(/_/g, ' ');
    });

    console.log(node_types);
    console.log(workspace.items);

    var tree = $.jstree.reference("#workspace");
    if (tree)
    {
        tree.settings.core.data = workspace.items;
        tree.refresh();
    }
    else {
        $("#workspace").jstree({
            "plugins": ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) ? ["types", "search", "state"] : ["types", "dnd", "search", "state"],
            "core": {
                "data": workspace.items,
                "check_callback": true, // Need this to allow the copy_node function to work...
                "multiple": true // Need to disable this just now as nodes could be on different levels
            },
            "types": node_types,
            "search": {
                "show_only_matches": true,
                "fuzzy": false
            },
            "dnd": {
                "settings": {
                    "threshold": /Android|AppleWebKit|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 50 : 5
                }
            }
        })
            .bind('select_node.jstree', function (event, data) {
                button_check();
                showInformationAndSetStatus(data.node);
            })
            .bind('move_node.jstree',function(event,data)
            {
                console.log(event);
                console.log(data);
                copy_to_folder(data);
            });

        /*
         .bind("copy_node.jstree", function (event, data) {
         var new_id = generate_lo_key(),
         original_id =  data.original.id,
         tree = $('#treeview').jstree(true);

         // Change the id
         tree.set_id(data.node, new_id);

         // Copy the lo_data from the old node to the new one
         lo_data[new_id] = lo_data[original_id];

         // Do the same for all the children
         for(var i = 0, j = data.original.children_d.length; i < j; i++) {
         new_id = generate_lo_key();
         original_id =  data.original.children_d[i];
         tree.set_id(data.node.children_d[i], new_id);
         lo_data[new_id] = lo_data[original_id];
         }
         })
         */

        var to = false;
        $('#workspace_search').keyup(function () {
            if (to) {
                clearTimeout(to);
            }
            to = setTimeout(function () {
                var v = $('#workspace_search').val();
                $('#workspace').jstree(true).search(v);
            }, 250);
        });

        // Double click handling
        $('#workspace a').bind('dblclick',function (e) {
            var tree = $.jstree.reference("#workspace");
            var linode = $(e.target).closest("li");
            var node_id = linode[0].id;
            var node = tree.get_node(node_id, false);
            var type = node.type;
            var id = node.id;
            var xot_id = node.original.xot_id;

            switch(type)
            {
                case "folder":
                case "workspace":
                case "recyclebin":
                    break;
                default:


                    tree.deselect_all();
                    tree.select_node(id);

                    edit_window(false, "edithtml");

            }
        });
    }
}

function showInformationAndSetStatus(node)
{
    var type = node.type;
    var id = node.id;
    var xot_id = node.original.xot_id;

    switch(type)
    {
        case "folder":
            $("#project_information").html("Folder " + node.text);
            break;
        case "workspace":
        case "recyclebin":
            $("#project_information").html("");
            break;
        default:
            getProjectInformation(workspace.user, xot_id);
    }
}