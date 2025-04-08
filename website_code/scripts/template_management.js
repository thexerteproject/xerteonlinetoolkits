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

if (typeof(String.prototype.trim) === "undefined") {
    String.prototype.trim = function() {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}
var active_div = "";

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

function url_return(url, parameter) {

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

function template_toggle(tag) {

    var temp = document.getElementById(tag);
    var butt = document.getElementById(tag + '_button');

    if ((temp.style.display == "none") || (temp.style.display == "")) {
        temp.style.display = "block";
        butt.style.display = "none";
        temp.querySelector('input[name="filename"]').value = "";
        temp.querySelector('input[name="filename"]').focus();


    } else {
        temp.style.display = "none";
        butt.style.display = "";
    }

}

// Function toggle (obsolete) ********** CHECK ***************
//
// open and close template areas when creating a new one


function toggle(tag) {

    if (document.getElementById(tag).style.display == "none") {
        document.getElementById(tag).style.display = "block";
    } else {
        document.getElementById(tag).style.display = "none";
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

function edit_window(admin, edit, location) {

    if (!admin) {

        var jstree = $.jstree.reference("#workspace"),
            ids = jstree.get_selected();
        if (ids.length == 0)
            return;

        for (var i = 0; i < ids.length; i++) {
            var node = workspace.nodes[ids[i]];
            if (node.xot_type == "file") {

                if (node.parent != workspace.recyclebin_id) {
                    window_id = "editwindow" + node.id;

                    window_open = false;

                    if (typeof(edit_window_open) != 'undefined') {

                        for (z = 0; z < edit_window_open.length; z++) {
                            if (("editwindow" + edit_window_open[z].id) == window_id) {
                                window_open = edit_window_open[z].window;
                            }
                        }
                    }
                    console.log("Window open length: " + window_open.length);
                    console.log("Window open parent: " + window_open.parent);
                    if (!window_open || window_open.parent == null) {

                        let size = node.editor_size.split(",");
                        let swidth = window.screen.width;
                        let sheight = window.screen.height;
                        if (size[0].indexOf('%') >= 0)
                        {
                            let sizew = parseInt(size[0]);
                            let sizeh = parseInt(size[1]);
                            if (sizew <= 100 && sizeh <= 100)
                            {
                                size[0] = (sizew * swidth) / 100;
                                size[1] = (sizeh * sheight) / 100;
                            }
                            if (size[0] < 1280 && swidth > 1280)
                                size[0] = 1280;
                            if (size[1] < 768 && sheight > 768)
                                size[1] = 768;
                        }
                        if (size[0] > swidth)
                            size[0] = swidth;
                        if (size[1] > sheight)
                            size[1] = sheight;


                        if (location != null) {
                            if (location === "_blank") {
                                var NewEditWindow = window.open(site_url + url_return(edit, node.xot_id), location);
                            }
                            else
                            {
                                var NewEditWindow = $.featherlight(
                                    {
                                        iframe: site_url + url_return(edit, node.xot_id),
                                        iframeWidth: '95%',
                                        iframeHeight: '95%',
                                        beforeClose: function(){
                                            if (typeof this.$content[0].contentWindow.WIZARD_EDITOR != "undefined") {
                                                this.$content[0].contentWindow.WIZARD_EDITOR.tree.savepreviewasync(false);
                                                //tree.savepreviewasync(false);
                                                // Fake path, only id is used
                                                edit_window_close(node.xot_id + "-");
                                            }
                                        },
                                        closeOnClick: false,
                                    });
                            }
                        }
                        else {
                            if (size.length == 1) {
                                var NewEditWindow = window.open(site_url + url_return(edit, node.xot_id), "editwindow" + node.id, "toolbar=yes,location=yes");
                            } else {
                                var NewEditWindow = window.open(site_url + url_return(edit, node.xot_id), "editwindow" + node.id, "height=" + size[1] + ", width=" +
                                    size[0] + ",toolbar=yes,location=yes,resizable=yes");
                            }
                        }

                        try {

                            xmlHttp = new XMLHttpRequest();

                        } catch (e) { // Internet Explorer
                            try {
                                xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
                            } catch (e) {
                                try {
                                    xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
                                } catch (e) {

                                }
                            }
                        }

                        NewEditWindow.ajax_handle = xmlHttp;
                        self.last_reference = self;

                        if (!NewEditWindow.iframe)
                            NewEditWindow.focus();

                        edit_window_open.push({
                            id: node.id,
                            window: NewEditWindow
                        });

                        return NewEditWindow;

                    } else {
                        window_open.focus();
                    }

                } else {

                    alert(RECYCLE_EDIT);

                }

            } else {

                alert(FOLDER_EDIT);

            }

        }

    } else {

        var NewEditWindow = window.open(site_url + url_return("edithtml", admin), "editwindow" + admin, "height=665, width=800");

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

function close_edit_window(path) {

    /*
     * if the path variable contains a hyphen, then it is the path to delete a file
     */

    /*
     * use the for loop to check for its place in the array then delete it
     */
    for (x = 0; x < edit_window_open.length; x++) {

        if (path.indexOf("-") != -1) {
            if (edit_window_open[x].id.substr(5, edit_window_open[x].id.length - 5) == path.substr(0, path.indexOf("-"))) {

                edit_window_open.splice(x, 1);

            }

        } else {

            if (edit_window_open[x].id.substr(5, edit_window_open[x].id.length - 5) == path) {

                edit_window_open.splice(x, 1);

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

function file_version_sync(response) {
    response = response.trim();
    if (response != "") {
        alert(response);
    }
    refresh_workspace();
}

/**
 *
 * Function example state changed
 * This function opens a window to display an example template
 * @version 1.0
 * @author Patrick Lockley
 */

function file_need_save(response) {
    result = response.split("~*~");

    if (response != "") {

        var response = confirm(result[0]);

        if (response) {
            $.ajax({
                type: "POST",
                url: "website_code/php/versioncontrol/update_file.php",
                data: {
                    file_path: result[1],
                    template_id: result[2]
                }
            })
            .done(function (response) {
                file_version_sync(response);
            });
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

function edit_window_close(path) {

    for (x = 0; x < edit_window_open.length; x++) {

        if (path.indexOf("-") != -1) {

            if (edit_window_open[x].id.substr(edit_window_open[x].id.lastIndexOf("_") + 1, edit_window_open[x].id.length) == path.substr(0, path.indexOf("-"))) {
                //if(edit_window_open[x].substr(5,edit_window_open[x].length-5)==path.substr(0,path.indexOf("-"))){
                edit_window_open.splice(x, 1);
            }

        } else {
            if (edit_window_open[x].id.substr(5, edit_window_open[x].id.length - 5) == path) {
                edit_window_open.splice(x, 1);
            }

        }

    }
    $.ajax({
        type: "POST",
        url: "website_code/php/versioncontrol/template_close.php",
        data: {
            file_path: path
        }
    })
    .done(function (response) {
        file_need_save(response);
    });
}

/**
 *
 * Function example window
 * This function requests the screen size for an example template
 * @param string examole_id = the id of the example
 * @version 1.0
 * @author Patrick Lockley
 */

function example_window(example_id) {

    if (example_id != 0) {

        $.ajax({
            type: "POST",
            url: "website_code/php/properties/screen_size_template.php",
            data: {
                tutorial_id: example_id
            }
        })
        .done(function (response) {
            example_stateChanged(response);
        });

    } else {

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

function preview_window(admin) {

    if (!admin) {

        if (setup_ajax() != false) {
            var tree = $.jstree.reference("#workspace"),
                ids = tree.get_selected();
            if (ids.length == 0)
                return;

            for (var i = 0; i < ids.length; i++) {
                var node = workspace.nodes[ids[i]];

                if (node.xot_type == "file") {
                    var mode = (window.event && window.event.shiftKey ? 'play' : 'preview');
                    size = node.preview_size.split(",");
                    if (size.length != 1) {


                        var PreviewWindow = window.open(site_url + url_return(mode, node.xot_id), "previewwindow" + node.id, "height=" + size[1] +
                            ", width=" + size[0] + ", scrollbars=yes,resizable=yes");

                    } else {


                        var PreviewWindow = window.open(site_url + url_return(mode, node.xot_id), "previewwindow" + node.id,
                            "height=768,width=1024,scrollbars=yes,resizable=yes");

                    }

                } else {

                    alert(PROJECT_SELECT);

                }

            }

        }

    } else {

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

function example_stateChanged(response) {
    if (response != "") {

        temp = response.toString().split("~");

        parameter = "height=" + temp[1] + ",width=" + temp[0] + ",status=No";

        var property_id = temp[2];

        var NewWindow = window.open(site_url + url_return("play", property_id), "examplewindow" + property_id, parameter);

        NewWindow.focus();
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
            var NewWindow = window.open(site_url + url_return("workspaceproperties", null), "workspace", "height=760, width=1000");
            NewWindow.window_reference = self;
            NewWindow.focus();
        } else {
            for (var i = 0; i < ids.length; i++) {
                if (workspace.nodes[ids[i]].type != "folder" && workspace.nodes[ids[i]].type != "folder_shared" && workspace.nodes[ids[i]].type != "sub_folder_shared"&& workspace.nodes[ids[i]].type != "folder_group") {
                    if (workspace.nodes[ids[i]].parent != workspace.recyclebin_id) {
                        var NewWindow = window.open(site_url + url_return("properties", workspace.nodes[ids[i]].xot_id), workspace.nodes[ids[i]].xot_id,
                            "height=760,width=1000,status=yes");
                        NewWindow.window_reference = self;
                        NewWindow.focus();
                    } else {
                        alert(RECYCLE_PROPERTIES);
                    }
                } else {
                    var NewWindow = window.open(site_url + url_return("folderproperties", workspace.nodes[ids[i]].xot_id + "_folder"), workspace.nodes[ids[i]].xot_id +
                        "_folder", "height=760, width=1000");
                    NewWindow.window_reference = self;
                    NewWindow.focus();
                }
            }
        }
    } else {
        var NewWindow = window.open(site_url + url_return("properties", admin), admin, "height=760, width=1000");

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


function refresh_workspace() {
    // if (setup_ajax() != false) {
    //     var url = "website_code/php/templates/get_templates_sorted.php";
    //
    //     xmlHttp.open("post", url, true);
    //     xmlHttp.onreadystatechange = refreshworkspace_stateChanged;
    //     xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    //     xmlHttp.send('sort_type=' + document.sorting.type.value);
    // }
    $.ajax({
        type: "POST",
        url: "website_code/php/templates/get_templates_sorted.php",
        dataType: 'json',
        data: {
            sort_type: document.sorting.type.value
        }
    })
    .done(function(response){
        workspace = response;
        // Clear the project details
        $("#project_information").html("");
        init_workspace();
    });
}

function getProjectInformation(user_id, template_id) {
    // if (setup_ajax() != false) {
    //     var url = "website_code/php/templates/get_template_info.php";
    //
    //     xmlHttp.open("post", url, true);
    //     xmlHttp.onreadystatechange = getProjectInformation_stateChanged;
    //     xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    //     xmlHttp.send('user_id=' + user_id + '&template_id=' + template_id);
    // }
    $.ajax({
        type: "POST",
        url: "website_code/php/templates/get_template_info.php",
        dataType: 'json',
        data: {user_id: user_id, template_id: template_id},
    })
    .done(function(info) {
        document.getElementById('project_information').innerHTML = info.properties;
        disableReadOnlyButtons(info);
        if (info.fetch_statistics) {
            url = site_url + info.template_id;
            q = {};

            if (info.lrs.site_allowed_urls != null && info.lrs.site_allowed_urls != undefined && info.lrs.site_allowed_urls != "") {
                q['activities'] = [url].concat(info.lrs.lrsurls.split(",")).concat(info.lrs.site_allowed_urls.split(",").map(function(url) {return url + info.template_id})).filter(function(url) {return  url != ""});
            }
            q['activity'] = url;

            q['verb'] = "http://adlnet.gov/expapi/verbs/launched";
            q['related_activities'] = false;

            var today = new Date();
            var start = new Date(today.getTime() - info.dashboard.default_period * 24 * 60 * 60 * 1000);
            var startstartofday = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0);
            var todayendofday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 0);
            q['since'] = startstartofday.toISOString();
            x_Dashboard = new xAPIDashboard(info);
            x_Dashboard.getStatements(q, false, function() {
                $("#graph_" + info.template_id).html("");
                x_Dashboard.drawActivityChart("", $("#graph_" + info.template_id), startstartofday, todayendofday);
            }, true);
        }
    })
    .fail(function(jqXHR, textStatus, errorThrown)
    {

    });
}

function disableReadOnlyButtons(info){
    var editbtn = document.getElementById("edit");
    var propertiesbtn = document.getElementById("properties");
    var deletebtn = document.getElementById("delete");
    var publishbtn = document.getElementById("publish");
    var newfolderbtn = document.getElementById("newfolder");

    switch(info.role){
        case "creator":
        case "co-creator":
            break;
        case "read-only":
            editbtn.disabled = "disabled";
            editbtn.className = "xerte_workspace_button disabled";
            editbtn.onclick = "";

            publishbtn.disabled = "disabled";
            publishbtn.className = "xerte_workspace_button disabled";
            publishbtn.onclick = "";

            propertiesbtn.disabled = "disabled";
            propertiesbtn.className = "xerte_workspace_button disabled";
            propertiesbtn.onclick = "";

            deletebtn.disabled = "disabled";
            deletebtn.className = "xerte_workspace_button disabled";
            deletebtn.onclick = "";
        case "editor":
            newfolderbtn.disabled="disabled";
            newfolderbtn.className = "xerte_workspace_button disabled";
            newfolderbtn.onclick="";
            break;

    }
}

function getFolderInformation(user_id, folder_id) {
    $.ajax({
        type: "POST",
        url: "website_code/php/folders/get_folder_info.php",
        data: {folder_id: folder_id},
        dataType: "json",
        success: function (info) {
            document.getElementById('project_information').innerHTML = info.properties;
            disableReadOnlyButtons(info);

        }
    });
}

function getGroupInformation(user_id, group_name, group_id)
{
    $.ajax({
        type: "POST",
        url: "website_code/php/groups/get_group_info.php",
        data: {
            group_name: group_name,
            group_id: group_id
        },
        dataType: "json",
        success: function (info) {
            document.getElementById('project_information').innerHTML = info.properties;
            disableReadOnlyButtons(info);
        }
    });
}

/**
 *
 * Function remove template
 * This function removes a template
 * @param string template_id - id of the template to be deleted
 * @version 1.0
 * @author Patrick Lockley
 */

function remove_template(template_id) {
    $.ajax({
        type: "POST",
        url: "website_code/php/templates/remove_template.php",
        data: {
            template_id: template_id
        }
    })
    .done(function(response){
        delete_stateChanged(response);
    });
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

function recycle_bin_remove_all_template(template_id) {
    $.ajax({
        type: "POST",
        url: "website_code/php/templates/remove_template.php",
        data: {
            template_id: template_id
        }
    })
    .done(function(response){
        if (number_of_files_to_delete > 1) {
            number_of_files_to_delete -= 1;
        } else {
            refresh_workspace();
        }
    });
}

/**
 *
 * Function delete template
 * This function moves a file to the recycle bin
 * @param string template_id - id of the template to be deleted
 * @version 1.0
 * @author Patrick Lockley
 */

function delete_template(template_id) {
    $.ajax({
        type: "POST",
        url: "website_code/php/templates/delete_template.php",
        data: {
            template_id: template_id
        }
    })
    .done(function(response){
        delete_stateChanged(response);
    });
}

/**
 *
 * Function delete state changed
 * This function redisplays after a file is deleted
 * @version 1.0
 * @author Patrick Lockley
 */

var delete_feedback_string = "";

function delete_stateChanged(response) {

    response = response.trim();

    if (response.indexOf("Sorry") == 0) {
        alert(DELETE_ERROR + ' "' + response + '"');
    }

    refresh_workspace();
}

/**
 *
 * Function duplicate template
 * This function duplicates a template
 * @version 1.0
 * @author Patrick Lockley
 */

function duplicate_template() {
    var tree = $.jstree.reference("#workspace"),
        ids = tree.get_selected();

    if (ids.length == 1) {

        var node = workspace.nodes[ids[0]];
        if (node.xot_type == "file") {

            if (node.parent != workspace.recyclebin_id) {

                /*
                 * code to prevent folders being dupped
                 */

                var template_id = node.xot_id;
                var template_name = node.text;
                var folder_id = workspace.nodes[node.parent].xot_id;
                $.ajax({
                    type: "POST",
                    url: "website_code/php/templates/duplicate_template.php",
                    data: {
                        template_id: template_id,
                        template_name: template_name,
                        folder_id: folder_id
                    }
                })
                .done(function(response){
                    duplicate_stateChanged(response);
                });
            } else {
                alert(RECYCLE_DUPLICATE);
            }
        } else {
            alert(DUPLICATE_PROMPT);
        }
    } else if (ids.length == 0) {
        alert(DUPLICATE_PROMPT_OTHER);
    } else {
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

function duplicate_stateChanged(response) {
    response = response.trim();

    if (response != "") {
        alert(DUPLICATE_ERROR + ' "' + response + '"');
    }
    refresh_workspace();
}

/**
 *
 * Function duplicate template
 * This function duplicates a template
 * @version 1.0
 * @author Patrick Lockley
 */

function duplicate_folder() {
    var tree = $.jstree.reference("#workspace"),
        ids = tree.get_selected();

    if (ids.length == 1) {

        var node = workspace.nodes[ids[0]];
        if (node.xot_type == "folder") {

            if (node.parent != workspace.recyclebin_id) {

                /*
                 * code to prevent folders being dupped
                 */

                var folder_id = node.xot_id;
                var folder_name = node.text;
                var parentfolder_id = workspace.nodes[node.parent].xot_id;

                $.ajax({
                    type: "POST",
                    url: "website_code/php/templates/duplicate_folder.php",
                    data: {
                        folder_id: folder_id,
                        folder_name: folder_name,
                        parentfolder_id: parentfolder_id
                    }
                })
                .done(function(response){
                    duplicatefolder_stateChanged(response);
                });
            } else {
                alert(RECYCLE_DUPLICATE);
            }
        } else {
            alert(DUPLICATE_PROMPT);
        }
    } else if (ids.length == 0) {
        alert(DUPLICATE_PROMPT_OTHER);
    } else {
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

function duplicatefolder_stateChanged(response) {
    response = response.trim();

    if (response != "") {
        alert(DUPLICATE_ERROR + ' "' + response + '"');
    }

    refresh_workspace();
}


function publish_project(template_id) {
    $.ajax({
        type: "POST",
        url: "website_code/php/versioncontrol/update_file.php",
        data: {
            template_id: template_id
        }
    })
    .done(function(response){
        publish_stateChanged(response);
    });
}

/**
 *
 * Function publish this
 * This function updates the public copy
 * @version 1.0
 * @author Patrick Lockley
 */

function publish_this() {
    var tree = $.jstree.reference("#workspace"),
        ids = tree.get_selected();

    if (ids.length == 1) {
        publishproperties_window();
    } else {
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

function publish_stateChanged(response) {
    alert(PUBLISH_SUCCESS);
}



/**
 *
 * Function remove this
 * This function handles what we are to delete and whether we want to.
 * @version 1.0
 * @author Patrick Lockley
 */

function remove_this() {

    var tree = $.jstree.reference("#workspace"),
        ids = tree.get_selected();
    if (ids.length == 0)
        return;

    if (ids[0] == workspace.recyclebin_id) {
        var response = confirm(RECYCLE_EMPTY);

        if (response) {
            var node = workspace.nodes[ids[0]];
            var folder_node = tree.get_node(node.id, false);

            number_of_files_to_delete = folder_node.children.length;
            for (var i = 0; i < folder_node.children.length; i++) {
                recycle_bin_remove_all_template(workspace.nodes[folder_node.children[i]].xot_id);
            }
        }
    } else if (ids[0] == workspace.workspace_id) {
        alert(WORKSPACE_DELETE);
    } else {

        // Check publish attributes, warn if LO is not private and/or published through LTI
        var published = false;
        var shared = false;
        for (var i = 0; i < ids.length; i++)
        {
            var node = workspace.nodes[ids[i]];
            if (node.published)
                published = true;
            if (node.shared)
                shared = true;
            if (published && shared)
                break;
        }
        var prompt = "";
        if (ids.length ==1)
        {
            prompt = workspace.nodes[ids[0]].text.replace('_', ' ') + "\n\n";
        }
        if (published)
        {
            if (ids.length != 1) {
                prompt += SOME_ITEMS_PUBLISHED_PROMPT + "\n\n";
            } else {
                prompt += ITEM_PUBLISHED_PROMPT + "\n\n";
            }
        }
        if (shared)
        {
            if (ids.length != 1) {
                prompt += SOME_ITEMS_SHARED_PROMPT + "\n\n";
            } else {
                prompt += ITEM_SHARED_PROMPT + "\n\n";
            }
        }
        if (ids.length != 1)
        {
            prompt +=  DELETE_MULTIPLE_PROMPT;
        }
        else {
            prompt += DELETE_PROMPT;
        }
        var response = confirm(prompt);

        if (response) {
            for (var i = 0; i < ids.length; i++) {
                var node = workspace.nodes[ids[i]];

                if (ids[i] == workspace.workspace_id) {
                    continue;
                } else if (node.xot_type == "file") {
                    if (node.parent == workspace.recyclebin_id) {
                        var answer = confirm(DELETE_PERMENANT_PROMPT + " - " + node.text);
                        if (answer) {
                            remove_template(node.xot_id);
                        }
                    } else {
                        delete_template(node.xot_id);
                    }
                } else {
                    var folder_node = tree.get_node(node.id, false);

                    var folder_children = folder_node.children.length;

                    if (folder_children != 0) {

                        alert(DELETE_FOLDER_NOT_EMPTY);

                    } else {
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

function update_your_projects() {
    $.ajax({
        type: "POST",
        url: "website_code/php/templates/your_templates.php",
        data: {
            loginid: 1
        }
    })
    .done(function(response){
        tutorials_stateChanged(response);
    });
}

/**
 *
 * Function update templates
 * This function redisplays the blank templates
 * @version 1.0
 * @author Patrick Lockley
 */

function update_templates() {
    $.ajax({
        type: "POST",
        url: "website_code/php/templates/general_templates.php",
        data: {
            loginid: 1
        }
    })
    .done(function(response){
        tutorials_stateChanged(response);
    });
}

/**
 *
 * Function template state changed
 * This function redisplays the blank templates
 * @version 1.0
 * @author Patrick Lockley
 */

function templates_stateChanged(response) {
    if (response != "") {
        document.getElementById('new_template_area_middle_ajax').innerHTML = response;
    }
}

var active_div = null;
var new_file = null;
var new_template_folder = null;


/**
 *
 * Function tutorials state changed
 * This function handles what to do when a new file is created
 * @version 1.0
 * @author Patrick Lockley
 */

function tutorials_stateChanged(response) {
    if (response != "") {

        template_toggle(active_div);
        active_div = "";

        refresh_workspace();

    }
}

/**
 * Test if the new window is blocked!
 */
var popupBlockerChecker = {
    check: function(popup_window) {
        var _scope = this;
        if (popup_window) {
            if (/chrome/.test(navigator.userAgent.toLowerCase())) {
                setTimeout(function() {
                    _scope._is_popup_blocked(_scope, popup_window);
                }, 200);
            } else {
                popup_window.onload = function() {
                    _scope._is_popup_blocked(_scope, popup_window);
                };
            }
        } else {
            _scope._displayError();
        }
    },
    _is_popup_blocked: function(scope, popup_window) {
        if ((popup_window.innerHeight > 0) == false) {
            scope._displayError();
        }
    },
    _displayError: function() {
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

function tutorial_created(response) {
    if (typeof response == 'string') {
        response = String(response);
        response = response.trim();
        if (response != "") {
            data = response.split(",");

            open_created_node(data[0], new_template_folder);

            if (data[1] == "*") {

                var neweditorwindow = window.open(site_url + url_return("edithtml", data[0]), "editwindow" + data[0], "height=" + screen.height +
                    ", width=" + screen.width);

            } else {
                var url = site_url + url_return("edithtml", data[0]);
                var title = "editwindow" + data[0];
                var options = "height=" + data[2].trim() + ", width=" + data[1].trim();
                var neweditorwindow = window.open(url, title, options);

            }
            popupBlockerChecker.check(neweditorwindow);
            new_file = xmlHttp.responseText;
            neweditorwindow.window_reference = self;

            neweditorwindow.focus();

        }
    }
}

function open_created_node(template_id, folder_id) {
    setTimeout(function() {
        // Hope workspace has been updated in the mean time,
        // Search the template, and open the node
        var tree = $.jstree.reference("#workspace");
        var node;
        for (var i = 0; i < workspace.items.length; i++) {
            if (workspace.items[i].xot_id == template_id) {
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

function create_tutorial(tutorial) {
    if (setup_ajax() != false) {
        var url = "website_code/php/templates/new_template.php";
        active_div = tutorial;

        /*
         * if a folder is selected, create the folder in that folder
         */
        var tree = $.jstree.reference("#workspace"),
            ids = tree.get_selected();
        var new_template_folder = "";
        if (ids.length == 1) {
            var node = workspace.nodes[ids[0]];
            if (node.xot_type == "folder") {
                new_template_folder = node.xot_id;
            }
        }
        if (is_ok_name($("#" + tutorial + "_filename").val())) {
            $.ajax({
                type: "POST",
                url: "website_code/php/templates/new_template.php",
                data: {
                    tutorialid: tutorial,
                    templatename: $("#" + tutorial + "_templatename").val(),
                    tutorialname: $("#" + tutorial + "_filename").val(),
                    folder_id: new_template_folder
                }
            })
            .done(function(response){
                template_toggle(active_div);
                active_div = "";

                refresh_workspace();
                tutorial_created(response);
            });
        } else {
            alert(NAME_FAIL);
        }
    }
}


/********** CHECK **************/

function example() {

    if (setup_ajax() != false) {

        var url = "website_code/php/example.php";

        xmlHttp.open("post", url, true);
        xmlHttp.onreadystatechange = example_alert;
        xmlHttp.send('nullid=null');


    }
    $.ajax({
        type: "POST",
        url: "website_code/php/example.php",
        data: {
            nullid: 'null'
        }
    })
    .done(function(response){
        example_alert(response);
    });
}

function example_alert(response) {
}
