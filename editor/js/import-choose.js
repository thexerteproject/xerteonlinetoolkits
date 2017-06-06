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

function setup() {
    console.log("Setting up merge layout...");
    var opentooltip = "Open this pane",
        closetooltip = "Close this pane",
        resizetooltip = "Resize this pane",
        pin = "Pin",
        unpin = "Un-Pin";

    if (language.layout.$opentooltip)
        opentooltip = language.layout.$opentooltip;
    if (language.layout.$closetooltip)
        closetooltip = language.layout.$closetooltip;
    if (language.layout.$resizetooltip)
        resizetooltip = language.layout.$resizetooltip;
    if (language.layout.$pin)
        pin = language.layout.$pin;
    if (language.layout.$unpin)
        unpin = language.layout.$unpin;

    var xerte_merge_layout,
        xerte_merge_layout_settings = {
            name: "xerte_editor_layout",
            panes: {
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
                tips: {
                    Open: opentooltip    // eg: "Open Pane"
                    , Close: closetooltip
                    , Resize: resizetooltip
                    , Pin: pin
                    , Unpin: unpin
                },
                fxName:                 "none"
                /*
                 fxSpeed_open:           750,
                 fxSpeed_close:          1500,
                 fxSettings_open:        { easing: "easeInQuint" },
                 fxSettings_close:       { easing: "easeOutQuint" }
                 */
            },
            west: {
                size:                   300,
                minSize:                250,
                maxSize:                450,
                spacing_open:           4,
                spacing_closed:         21,
                togglerLength_closed:   21,
                togglerAlign_closed:    "top",
                togglerLength_open:     0,
                slideTrigger_open:      "click",
                initClosed:             false
                /*
                 fxName:                 "drop",
                 fxSpeed:                "normal",
                 fxSettings:             { easing: "" } // remove default
                 */
            },
            center: {
                /*paneSelector:           "#mainContent",*/
                minWidth:               200,
                minHeight:              200/*,
                 contentSelector:        ".ui-layout-content"*/
            }
        };

    var height = $("#content").height() - 16;
    $("#merge_mainContent").height(height);
    xerte_merge_layout = $("#merge_mainContent").layout( xerte_merge_layout_settings );
    var left_column = "body > .ui-layout-west";

    // ** Add pin buttons and wire them up **
    $("<span></span>").addClass("pin-button").prependTo( left_column );
    xerte_merge_layout.addPinBtn( left_column +" .pin-button", "west");

    // ** Add close buttons and wire them up **
    $("<span></span>").attr("id", "west-closer" ).prependTo( left_column );
    xerte_merge_layout.addCloseBtn("#west-closer", "west");

    init();
}

function merge_MainPanelResize(paneName, paneElement, paneState, paneOptions, layoutName)
{
    var height = $("#content").height() - 16;
    $("#merge_mainContent").height(height);
}

function CheckAll() {
    if($(".allCheck")[0].checked) {
        $(".checkAll").each(function (i) {
            $(this).prop("checked", true);
        });
    }
    else {
        $(".checkAll").each(function(i){
            $(this).prop("checked", false);
        });
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
}

function create_node_type(nodetype, children) {
    // clone children
    var lchildren = children.slice();

    return {
        icon: getIcon(nodetype),
        valid_children: lchildren
    };
};

var lastTreeItemTimestamp = undefined;

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
        $workspace = $("#workspace").jstree({
            "plugins": ["types"],
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
        });

        $workspace.bind('select_node.jstree', function (e, treenode)
        {
            if(lastTreeItemTimestamp == e.timeStamp)
            {
                return;
            }
            lastTreeItemTimestamp = e.timeStamp;

            xot_id = treenode.node.original.xot_id;

            var data = jsonData[xot_id];
            if(data != undefined){

                sourceProject = xot_id;
                if(data.glossary)
                {
                    $("#mergeGlossary").show();
                }else{
                    $("#mergeGlossaryCheck").prop("checked", false);
                    $("#mergeGlossary").hide();
                }

                html = "";
                html += "<label><input class=\"allCheck\" type=\"checkbox\" id=\"select-all\"  onClick=\"CheckAll()\"/> Select/Deselect All</label>"
                $.each(data.pages, function(x){
                    html += "<label><input class=\"pageCheckbox checkAll\" type=\"checkbox\" id=\"page_"+this.index+"\"'>" + '<img class=\"merge_page_icon\" src="modules/xerte/icons/'+this.icon+'.png">' + this.name + "</label>";
                });
                $("#merge").show();


                $("#pages").html(html);
            }else{
                $("#mergeGlossaryCheck").prop("checked", false);
                $("#mergeGlossary").hide();
                $("#pages").html("");
                $("#merge").hide();
            }
        });

    }
}


function init()
{
    var merged = false;
    currentProject = template_id;
    sourceProject = -1;
    $("#merge").hide();
    $("#mergeGlossary").hide();
    $("#pagetype").html(IMPORT);
    $(".optButtonContainer").hide();
    init_workspace();
    $('#workspace').bind("DOMSubtreeModified",function(){
        $("#workspace .jstree-clicked").removeClass("jstree-clicked");
    });

    $("#merge").click(function(e)
        {
            merged = true;
            source_pages = [];
            $(".pageCheckbox").each(function(){
                var $this = $(this);

                if($this.is(":checked")){
                    // id has the form "page_<nr>"
                    // Get the nr
                    var id = $this.attr("id");
                    var pagenr = id.substr(5, id.length-5);
                    source_pages.push(pagenr);
                }

            });
            merge_glossary = $("#mergeGlossaryCheck").is(":checked");
            if(source_pages.length > 0 || merge_glossary)
            {
                source_page = source_pages.join();
                source_project = sourceProject;
                target_insert = $(".jstree-children li").length;
                target_project = currentProject;

                //window.location.href = "merge.php?source_project="+source_project+"&target_project="+target_project+
                //    "&target_page_position="+target_insert+"&source_pages="+source_page + "&merge_glossary=" + merge_glossary;

                // 1. Save preview
                $('#loader').show();
                var json = EDITOR.tree.build_json("treeroot");
                var ajax_call = $.ajax({
                        url: "editor/upload.php",
                        data: {
                            fileupdate: 0, //0= preview->preview.xml
                            filename: previewxmlurl,
                            lo_data: encodeURIComponent(JSON.stringify(json)),
                            absmedia: rlourlvariable,
                            template_id: template_id
                        },
                        dataType: "json",
                        type: "POST"
                    }
                )
                .done(function() {
                    // 2. Call merge
                    var now = new Date().getTime();
                    var ajax_call = $.ajax({
                            url: "editor/importpages/merge.php?t=" + now,
                            data: {
                                source_project: source_project,
                                target_project: target_project,
                                target_page_position: target_insert,
                                source_pages: source_page,
                                merge_glossary: merge_glossary
                            },
                            dataType: "text",
                            type: "POST"
                        }
                    )
                    .done(function(data) {
                        // 3. Reload preview
                        $('#loader').hide();
                        // Cleanup tree and rebuild
                        $("#treeview").jstree("destroy");
                        EDITOR.tree.build(data);
                    })
                    .fail(function() {
                        $('#loader').hide();
                        alert( ERROR_IMPORT );
                    })
                })
                .fail(function() {
                    $('#loader').hide();
                    alert( ERROR_SAVING_PREVIEW );
                });
            }else{
                alert(NO_PAGES_SELECTED);
            }
        }
    );
}
debugger;
setup();
