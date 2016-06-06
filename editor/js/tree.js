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

// Tree : Add the tree object to the editor
var EDITOR = (function ($, parent) {

    // Create the tree object and refer locally to it as 'my'
    var my = parent.tree = {},
        toolbox = parent.toolbox,
        defaultLanguage = false,
        defaultAdvanced = false,


    // Called once document is ready
    setup = function (xml) {
        console.log("Setting up tree");
        do_bottom_buttons();
        do_buttons();
        build(xml);

        window.onbeforeunload = unloadFunction;
    },

    unloadFunction = function() {
        //save my data
        savepreviewasync(false);
        bunload();

    }
    // Add the buttons
    do_buttons = function () {
        var insert_page = function() {
                // TOR 20150514, weird!!
                // Chrome has a strange problem with font-awesome icons on buttons
                // When you click the icon, the event is fired, and the menu is shown, but right after the menu is shown
                // somehow it's hidden again.
                // If you click on the button, but next to the icon, everything works fine
                // By delaying showing the menu, everything works fine.
                setTimeout(function() {
                    $("#shadow").show();
                    $("#insert_menu")
                        .css({
                            "top":	$(".pane-west").position().top + $(".pane-west .content").position().top,
                            "left":	$("#insert_button").position().left
                            })
                        .show();
                }, 20);
        },

        delete_page = function() {
            deleteSelectedNodes();
        },

        duplicate_page = function() {
            duplicateSelectedNodes();
        },

        buttons = $('<div />').attr('id', 'top_buttons');
        $([
            {name: language.btnInsert.$label, tooltip: language.btnInsert.$tooltip, icon:'fa-plus-circle', id:'insert_button', click:insert_page},
            {name: language.btnDuplicate.$label, tooltip: language.btnDuplicate.$tooltip, icon:'fa-copy', id:'copy_button', click:duplicate_page},
            {name: language.btnDelete.$label, tooltip: language.btnDelete.$tooltip, icon:'fa-trash', id:'delete_button', click:delete_page}
        ])
        .each(function(index, value) {
                var button = $('<button>')
                    .attr('id', value.id)
                    .attr('title', value.tooltip)
                    .click(value.click)
                    .attr('tabindex', index == 0 ? index + 1 : index + 5) // leave gap in tab index for insert page menu & its insert buttons (needed for easy keyboard navigation)
                    .addClass("xerte_button")
                    .append($('<i>').addClass('fa').addClass(value.icon).addClass("xerte-icon").height(14));
                buttons.append(button);
        });
		
        $('.ui-layout-west .header').append(buttons);

        // If the menu is empty, disable insert
        if (menu_data.menu.length == 1 && menu_data.menu[0].name == "")
        {
            $('#insert_button').prop('disabled', true);
            $('#insert_button').addClass('disabled');
        }

        // Page type
        $('.ui-layout-center .header').append($('<div>').attr('id', 'pagetype'));
        // Save buttons
        buttons = $('<div />').attr('id', 'save_buttons');
        $([
            {name:language.btnPreview.$label, tooltip: language.btnPreview.$tooltip, icon:'fa-play', id:'preview_button', click:preview},
            //{name:language.btnSaveXerte.$label, tooltip: language.btnSaveXerte.$tooltip, icon:'editor/img/publish.png', id:'save_button', click:savepreview},
            {name:language.btnPublishXot.$label, tooltip: language.btnPublishXot.$tooltip, icon:'fa-globe', id:'publish_button', click:publish}
        ])
        .each(function(index, value) {
            var button = $('<button>')
                .attr('id', value.id)
                .attr('title', value.tooltip)
                .addClass("xerte_button_dark")
                .click(function(e){
                    $('#loader').show();
                    setTimeout(function(){ value.click(e); }, 250);
                })
                .append($('<i>').addClass('fa').addClass(value.icon).addClass("xerte-icon").height(14))
                .append(value.name);
            buttons.append(button);
        });
        $('.ui-layout-center .header').prepend(buttons);

        // Advanced and language checkboxes
        var checkboxes = $('<div />').attr('id', 'parameter_checkboxes');
        $([
            {name:language.chkShowLanguage.$label, tooltip: language.chkShowLanguage.$tooltip, id:'language_cb', disabled: true, click:showLanguage},
            {name:language.chkShowAdvanced.$label, tooltip: language.chkShowAdvanced.$tooltip, id:'advanced_cb', disabled: true, click:showAdvanced},
            {name:language.chkShowToolbar.$label, tooltip: language.chkShowToolbar.$tooltip, id:'toolbar_cb', disabled: false, click:showToolbar}
        ]).each(function(index, value) {
            var checkbox = $('<input>')
                .attr('id', value.id)
                .attr('type',  'checkbox')
                .attr('title', value.tooltip)
                .prop('disabled', value.disabled)
                .on('change', value.click)

            checkboxes.append(checkbox);
            var span = $('<span>')
                .attr('id', value.id + "_span")
                .addClass(value.disabled ? "disabled" : "enabled")
                .append(value.name);
            checkboxes.append(span);
        });
        $('#checkbox_holder').append(checkboxes);
    },


    build_json = function (node_id) {
        var tree = $.jstree.reference("#treeview");
        var node = tree.get_node(node_id, false);
        var obj = {};
        //console.log(lo_data[node_id]);
        $.each(lo_data[node_id], function(key , value){
            obj[key] = value;
        });

        //console.log(node_id + ": " + node.children.length + " children");
        if (node.children.length > 0) {
            obj.children = {};
            for (var i=0; i<node.children.length; i++) {
                key = node.children[i];
                obj.children[i] = build_json(key);
            }
        }
        //console.log(obj);
        return(obj);
    },


    preview = function (e) {
        // ***************** TEMPORARY ****************
        //if(previewxmlurl.slice(-11) == "preview.xml") {
        //    previewxmlurl = previewxmlurl.substring(0, previewxmlurl.length-4) + "2.xml";
        //}
        // ***************** TEMPORARY ****************

        var json = build_json("treeroot");
        var clickevent = e || window.event;
        var urlparam = "";
        if (clickevent.shiftKey)
        {
            var id = getCurrentPageID();
            if (id !== false)
            {
                urlparam = '&linkID='+id;
            }
        }
        var ajax_call = $.ajax({
                url: "editor/upload.php",
                data: {
                    fileupdate: 0, //0= preview->preview.xml
                    filename: previewxmlurl,
                    lo_data: encodeURIComponent(JSON.stringify(json)),
                    absmedia: rlourlvariable,
                    template_id: template_id
                },
                //success: function(data){
                //    alert("success");
                //},
                //error: function(data, status, error){
                //    alert(status + ': ' + error);
                //},
                dataType: "json",
                type: "POST"
            }
        )
        .done(function() {
            //alert( "success" );
            // We would also launch the preview window from here
            $('#loader').hide();
            window.open(site_url + "preview.php?template_id=" + template_id + urlparam, "previewwindow" + template_id, "height=" + template_height + ", width=" + template_width + ", resizable=yes, scrollbars=1" );
        })
        .fail(function() {
            $('#loader').hide();
            alert( "error" );
        });
    },


    publish = function () {
        var json = build_json("treeroot");
        var ajax_call = $.ajax({
                url: "editor/upload.php",
                data: {
                    fileupdate: 1, // 1=publish -> data.xml
                    filename: dataxmlurl,
                    preview: previewxmlurl,
                    lo_data: encodeURIComponent(JSON.stringify(json)),
                    absmedia: rlourlvariable,
                    template_id: template_id
                },
                //success: function(data){
                //    alert("success");
                //},
                //error: function(data, status, error){
                //    alert(status + ': ' + error);
                //},
                dataType: "json",
                type: "POST"
            }
        ).done(function() {
            $('#loader').hide();
            //alert( "success" );
        })
        .fail(function() {
            $('#loader').hide();
            alert( "error" );
        });
    },

    savepreview = function()
    {
        savepreviewasync(true);
    },

    savepreviewasync = function (async) {
        var json = build_json("treeroot");
        var ajax_call = $.ajax({
                url: "editor/upload.php",
                data: {
                    fileupdate: 0, // 1=publish -> data.xml
                    filename: previewxmlurl,
                    lo_data: encodeURIComponent(JSON.stringify(json)),
                    absmedia: rlourlvariable,
                    template_id: template_id
                },
                //success: function(data){
                //    alert("success");
                //},
                //error: function(data, status, error){
                //    alert(status + ': ' + error);
                //},
                dataType: "json",
                type: "POST",
                cache:false,
                async:async
            }
        ).done(function() {
                $('#loader').hide();
                //alert( "success" );
            })
            .fail(function() {
                $('#loader').hide();
                alert( "error" );
            });
    },

    getParent = function(key)
    {
        var tree = $.jstree.reference("#treeview");
        var node = tree.get_node(key, false);

        return node.parent;
    },

    getCurrentPageID = function()
    {
        var tree = $.jstree.reference("#treeview"),
            ids = tree.get_selected();

        if(!ids.length) { return false; } // Something needs to be selected

        var id = ids[0];
        while (tree.get_parent(id) != 'treeroot')
        {
            id = tree.get_parent(id);
        }

        if (lo_data[id]['attributes'].linkID)
            return lo_data[id]['attributes'].linkID;
        else
            return false;
    },

    getSelectedNodeKeys = function () {
        var tree = $.jstree.reference("#treeview"),
            ids = tree.get_selected();

            return ids[0];
    },

    showLanguage = function(event) {
        if ($('#language_cb').prop('checked'))
        {
            // show
            $('#languagePanel').show();
            $('#languagePanel div.inputtext').attr('contenteditable', 'true');
            defaultLanguage = true;

        }
        else
        {
            $('#languagePanel').hide();
            defaultLanguage = false;
        }
    },

    showAdvanced = function() {
        if ($('#advanced_cb').prop('checked'))
        {
            // show
            $('.advNewNodesLevel').show();
            //$('div.textinput').attr('contenteditable', 'true');
            defaultAdvanced = true;

        }
        else
        {
            $('.advNewNodesLevel').hide();
            defaultAdvanced = false;
        }
    },

    showToolbar = function(){
        parent.toolbox.showToolBar($('#toolbar_cb').prop('checked'));
    },

    duplicateNodes = function(tree, id, parent_id, pos, select)
    {
        console.log(id);

        var current_node = tree.get_node(id, false); console.log(current_node);

        // This will be the key for the new node
        var key = parent.tree.generate_lo_key();

        // Duplicate the node data, make sure the node gets deep copied!
        lo_data[key] = $.extend(true, {},lo_data[id]);

        // Give unique linkID
        if (lo_data[key].attributes['linkID']) {
            var linkID = 'PG' + new Date().getTime();
            lo_data[key].attributes['linkID'] = linkID;
        }

        // Create the tree node
        var this_json = {
            id : key,
            text : current_node.text,
            type : current_node.type,
            state: {
                opened:true
            }
        }
        console.log(this_json);

        // Add the node
        if (validateInsert(parent_id, current_node.type, tree))
        {
            var newkey = tree.create_node(parent_id, this_json, pos, function(){
                if (select) {
                    tree.deselect_all();
                    tree.select_node(key);
                }
            });
        }

        // Also clone all sub-pages
        $.each(current_node.children, function () {
            duplicateNodes(tree, this, key, "last", false)
        });
    }

    // Make a copy of the currently selected node
    // Presently limited to first node if multiple selected
    duplicateSelectedNodes = function () {
        var tree = $.jstree.reference("#treeview");
        var copy_node, new_node, id, ids = tree.get_selected();

        if(!ids.length) { return false; } // Something needs to be selected

        id = ids[0];
        var nodeName = lo_data[id].attributes.nodeName;

        if (wizard_data[nodeName].menu_options.duplicate == "false") {  // Can't duplicate the node
            alert(language.Alert.duplicateitem.prompt);
            return false;
        }
        
        if (id == "treeroot") { return false; } // Can't copy the root node

        // Determine pos
        var pos;
        var current_node = tree.get_node(id, false); console.log(current_node);
        var parent_node_id = tree.get_parent(current_node); console.log(parent_node_id);
        var parent_node = tree.get_node(parent_node_id, false); console.log(parent_node);
        // Walk and count children of 'treeroot' to figure out pos
        var i = 0;
        $.each(parent_node.children, function () {
            if (this == id)
                pos = i;
            i++;
        });
        pos++;

        duplicateNodes(tree, id, parent_node_id, pos, true);

        return true; // Successful

    },

    // Remove the currently selected node
    // Presently limited to the first node if multiple selected
    deleteSelectedNodes = function () {
        var tree = $.jstree.reference("#treeview");
        var copy_node, new_node, id, ids = tree.get_selected();

        if(!ids.length) { return false; } // Something needs to be selected

        id = ids[0];
        var nodeName = lo_data[id].attributes.nodeName;

        if (wizard_data[nodeName].menu_options.remove == "false") {  // Can't remove the root node
            alert(language.Alert.deletenode.error.prompt);
            return false;
        }

        if (!confirm(language.Alert.deletenode.confirm.prompt)) {
            return;
        }

        // Get next sibling node
        var next = tree.get_next_dom(id);        

        // Delete from the tree
        tree.delete_node(id);

        // Delete
        delete lo_data[id];

        tree.deselect_all();
        tree.select_node(next);  // Used to be get_prev_dom(id)

        return true; // Successful
    },

    /** showNodeData has to be done in two steps:
     * 1. First destroy all existing editor, to free up shared resources between the editors
     * 2. Build the new data
     *
     * Step 1. needs to be done carefully when switching between pages, because if we destroy the
     * editor too soon, the blur event doesn't fire!!!
     *
     * So, split the function in 2 parts
     * 1. function with the original name, showNodeData that will call buildPage with a timeout
     * 2. function buildPage that will destroy the editor, and when done, will build the new form (basically the functionallity of the old showNodeData
     *
     */

    showNodeData = function(key) {
        setTimeout(function()
        {
            buildPage(key)
        }, 350);
    },

    // Refresh the page when a new node is selected
    buildPage = function (key) {

        // Cleanup all current CKEDITOR instances!
        for(name in CKEDITOR.instances)
        {
            CKEDITOR.instances[name].destroy(true);
        }

        var attributes = lo_data[key]['attributes'];

        // Get the node name
        var node_name = attributes.nodeName;
        var node_label = '';

        var menu_options = wizard_data[node_name].menu_options;
        if (menu_options.menu && menu_options.menuItem) {
            $('#pagetype').html(menu_options.menu + ' > ' + menu_options.menuItem);
        }
        else if (menu_options.menuItem)
        {
            // This is not a page, but a sub-page
            // Build crumb path by walking up the tree
            var crumb = menu_options.menuItem;
            var tree = $.jstree.reference("#treeview");
            var id = key;
            var node;
            var lattributes;
            var lmenu_options;
            var topmenu;
            do
            {
                var current_node = tree.get_node(id, false);
                var id = tree.get_parent(current_node);

                topmenu = false;
                lattributes = lo_data[id]['attributes'];
                // Get the node name
                node = lattributes.nodeName;
                lmenu_options = wizard_data[node].menu_options;
                if (lmenu_options.menuItem)
                {
                    crumb = lmenu_options.menuItem + ' > ' + crumb;
                }
                if (lmenu_options.menu)
                {
                    topmenu = true;
                }
            }
            while (!topmenu && id != 'treeroot');
            if (lmenu_options.menu)
            {
                crumb = lmenu_options.menu + ' > ' + crumb;
            }
            $('#pagetype').html(crumb);

        }
        else
        {
            $('#pagetype').html('');
        }

        var node_options = wizard_data[node_name].node_options;
        if (wizard_data[node_name].menu_options.label)
        {
            node_label = wizard_data[node_name].menu_options.label;
        }
        // Clear editor array
        textareas_options = [];
        textinputs_options = [];
        colorpickers = [];
        datagrids = [];

        form_fields = [];
        form_id_offset = 0;
        $("#mainPanel").html("<table class=\"wizard\" border=\"0\">");

        // Build the form
        var attribute_name;
        var attribute_value;
        // Always display name option first
        if (node_options['name'].length > 0)
        {
            attribute_name = node_options['name'][0].name;
            attribute_value = toolbox.getAttributeValue(attributes, attribute_name, node_options, key);
            if (attribute_value.found)
            {
                toolbox.displayParameter('#mainPanel .wizard', node_options['name'], attribute_name, attribute_value.value, key);
            }
            else if (node_options['name'][0].value.mandatory)
            {
                toolbox.displayParameter('#mainPanel .wizard', node_options['name'], attribute_name, node_options['name'][0].value.defaultValue, key);
            }
        }
        // If the main node has a label, display the node item second (unconditionaly)
        if (node_label.length > 0 && !node_options['cdata'])
        {
            toolbox.displayParameter('#mainPanel .wizard', node_options['normal'], node_name, '', key, node_label);
        }

        // The rest of the normal params
        for (var i=0; i<node_options['normal'].length; i++)
        {
            attribute_name = node_options['normal'][i].name;
            attribute_value = toolbox.getAttributeValue(attributes, attribute_name, node_options, key);

            // The language attribute deserves some special treatment
            // If the attribute exists, but the value is an empty string, replace it withe the currently chosen language
            if (attribute_name == 'language')
            {
                if (attribute_value.found && attribute_value.value=="")
                {
                    attribute_value.value = language.$code;
                }
            }
            if (attribute_value.found)
            {
                toolbox.displayParameter('#mainPanel .wizard', node_options['normal'], attribute_name, attribute_value.value, key);
            }
            else if (node_options['normal'][i].value.mandatory)
            {
                toolbox.displayParameter('#mainPanel .wizard', node_options['normal'], attribute_name, node_options['normal'][i].value.defaultValue, key);
            }
        }
        // Optional parameters
        // 1. Empty right panel
        $('#optionalParams').html("");
        var html = $('<div>')
            .addClass("optButtonContainer");
        var table = $('<table>');
        var flashonly = $('<img>')
            .attr('src', 'editor/img/flashonly.png')
            .attr('alt', 'Flash only attribute');
        var flashonlytxt = '<img class="flash-icon" src="editor/img/flashonly.png" alt="Flash only attribute">';

		// Sort into alphabetical order
		node_options['optional'].sort(function(a,b) {
			var aN = a.value.label.toLowerCase();
			var bN = b.value.label.toLowerCase(); 
			return (aN < bN) ? -1 : ((aN > bN) ? 1 : 0);
		});

        for (var i=0; i<node_options['optional'].length; i++)
        {
            attribute_name = node_options['optional'][i].name;
            attribute_label = node_options['optional'][i].value.label;
            attribute_value = toolbox.getAttributeValue(attributes, attribute_name, node_options, key);

            if (!node_options['optional'][i].value.deprecated) {
                // Create button for right panel
                var label = attribute_label;
                var button = $('<button>')
                    .attr('id', 'insert_opt_' + attribute_name)
                    .addClass('btnInsertOptParam')
                    .addClass('xerte_button')
                    .click({
                        key: key,
                        attribute: attribute_name,
                        default: (node_options['optional'][i].value.defaultValue ? node_options['optional'][i].value.defaultValue : "")
                    },
                    function (event) {
                        parent.toolbox.insertOptionalProperty(event.data.key, event.data.attribute, event.data.default);
                    })
                    .append($('<i>').addClass('fa').addClass('fa-plus-circle').addClass('fa-lg').addClass("xerte-icon").height(14));
                if (node_options['optional'][i].value.flashonly) {
                    label += flashonlytxt;
                }
                button.append(label);
                if (node_options['optional'][i].value.tooltip)
                {
                    button.attr('title', node_options['optional'][i].value.tooltip);
                }
                if (attribute_value.found) {
                    // Add disabled button to right panel
                    button.prop('disabled', true)
                        .addClass('disabled');
                }
                else {
                    // Add enabled button to the right panel
                    button.prop('disabled', false)
                        .addClass('enabled');
                }
                var tablerow = $('<tr>')
                    .append($('<td>')
                        .append(button));
                table.append(tablerow);
            }
            if (attribute_value.found) {
                // Add paramter to the wizard
                toolbox.displayParameter('#mainPanel .wizard', node_options['optional'], attribute_name, attribute_value.value, key);
            }
        }
        html.append(table);
        if (node_options['optional'].length > 0)
        {
            $('#optionalParams').append(html);
        }

        $('#languagePanel').html("<hr><table class=\"wizard\" border=\"0\">");
        // languageOptons
        var nrlanguageoptions= 0;
        for (var i=0; i<node_options['language'].length; i++)
        {
            attribute_name = node_options['language'][i].name;
            attribute_value = toolbox.getAttributeValue(attributes, attribute_name, node_options, key);
            if (attribute_value.found)
            {
                toolbox.displayParameter('#languagePanel .wizard', node_options['language'], attribute_name, attribute_value.value, key);
                nrlanguageoptions++;
            }
        }

        if (nrlanguageoptions>0)
        {
            // Enable Advanced settings
            if (defaultLanguage)
            {
                $('#languagePanel').show();
                $('#languagePanel div.inputtext').attr('contenteditable', 'true');
            }
            else
            {
                $('#languagePanel').hide();
            }
            $('#language_cb_span').switchClass("disabled", "enabled");
            $('#language_cb').removeAttr("disabled");
            $('#language_cb').prop('checked', defaultLanguage);
        }

        // Extra insert buttons
        // Start with the current level, and work your way up to rootlevel
        var tree = $.jstree.reference("#treeview");
        var currkey = key;
        var hr_drawn = false;
        $('#insert_subnodes').html("");
        var subnodes = $('<div>').
            addClass('newNodesContainer');
        var subnodes_present = false;
        var advsubnodes_present = false;
        while (currkey != 'treeroot')
        {
            var currItem = lo_data[currkey]['attributes'].nodeName;
            var new_nodes = wizard_data[currItem].new_nodes;
            if (new_nodes.length > 0)
            {
                // There are nodes for this level
                var new_nodes_default = wizard_data[currItem].new_nodes_defaults;
                if (!hr_drawn)
                {
                    subnodes.append("<hr>");
                    hr_drawn = true;
                    subnodes_present = true;
                }
                // Display the level, i.e. the name of the current node
                var currItemName;
                if (wizard_data[currItem].menu_options.menuItem)
                    currItemName = wizard_data[currItem].menu_options.menuItem;
                var label = currItemName;
                if (lo_data[currkey]['attributes'].name)
                    label = lo_data[currkey]['attributes'].name;


                var advlevel = $('<div>')
                    .addClass('advNewNodesLevel')
                    .append($('<hr>'));


                var level = $('<div>')
                    .addClass('newNodesLevel');

                var leveltitle = $('<div>')
                        .addClass('newNodesTitle');
                if (tree.get_parent(currkey) == 'treeroot')
                {
                    leveltitle.attr('id', 'mainleveltitle');
                }
                leveltitle = leveltitle.append(label);
                level = level.append(leveltitle);

                var advnodes_level = false;
                // Weird, the flash editor showed the nodes in reversed order
                for (var i=new_nodes.length-1; i>=0; i--)
                {
                    var item = new_nodes[i];
                    var itemname = item;
                    if (wizard_data[item].menu_options.menuItem)
                        itemname = wizard_data[item].menu_options.menuItem;
                    var buttonlabel = language.newLink.$label;
                    var pos = buttonlabel.indexOf('{i}');
                    if (pos >= 0)
                        buttonlabel = buttonlabel.substr(0, pos) + itemname + buttonlabel.substr(pos+3) + "...";
                    var button = $('<button>')
                        .addClass('btnNewNode')
                        .addClass('editorbutton')
                        .attr('type', 'button')
                        .attr('id',  'add_'+item)
                        .click({key: currkey, node: item, defaultnode: new_nodes_default[i]}, function(event){
                            addSubNode(event);
                        })
                        //.append($('<img>').attr('src', 'editor/img/insert.png').height(14))
                        .append($('<i>').addClass('fa').addClass('fa-plus-circle').addClass("fa-lg").addClass("xerte-icon").height(14))
                        .append(buttonlabel);


                    if (wizard_data[item].menu_options.advanced === 'true')
                    {
                        advlevel.append(button)
                            .append("<br>");
                        advnodes_level = true;
                        advsubnodes_present = true;
                    }
                    else
                    {
                        level.append(button)
                            .append("<br>");
                    }

                }
                subnodes.append(level);
                if (advnodes_level)
                {
                    subnodes.append(advlevel);
                }
            }
            currkey = tree.get_parent(currkey);
        }
        if (subnodes_present)
        {
            // There are newNodes
            $('#insert_subnodes').append(subnodes);

            if (advsubnodes_present)
            {
                // Enable Advanced settings
                if (defaultAdvanced) {
                    $('.advNewNodesLevel').show();
                }
                else
                {
                    $('.advNewNodesLevel').hide();
                }
                $('#advanced_cb_span').switchClass("disabled", "enabled");
                $('#advanced_cb').removeAttr("disabled");
                $('#advanced_cb').prop('checked', defaultAdvanced);
            }
            else
            {
                // Hide the advanced panel and disable check box
                $('#advanced_cb_span').switchClass("enabled", "disabled");
                $('#advanced_cb').attr("disabled", "disabled");
                $('#advanced_cb').prop('checked', defaultAdvanced);
                $('.advNewNodesLevel').hide();
            }
        }

        //finally, do the help, if it exists...
        if (wizard_data[node_name].info.length > 0)
        {
            $('#info').html(wizard_data[node_name].info);
        }
        else
        {
            $('#info').html("");
        }

        toolbox.convertTextAreas();
        toolbox.convertTextInputs();
        toolbox.convertColorPickers();
        toolbox.convertDataGrids();

        // And finally, scroll to the top
        setTimeout(function(){
            $('#content').animate({scrollTop: 0});
        }, 50);
        toolbox.scrollTop = 0;
    },

    addNodeToTree = function(key, pos, nodeName, xmlData, tree, select)
    {
        var lkey = parent.tree.generate_lo_key();
        var attributes = {nodeName: nodeName, linkID : 'PG' + new Date().getTime()};
        var extranodes = false;
        $(xmlData.attributes).each(function() {
            attributes[this.name] = this.value;
        });
        lo_data[lkey] = {};
        lo_data[lkey]['attributes'] = attributes;
        if (xmlData.firstChild)
        {
            if(xmlData.firstChild.nodeType == 3)  // becomes a cdata-section
            {
                lo_data[lkey]['data'] = xmlData.firstChild.data;
            }
            else if (xmlData.firstChild.nodeType == 1) // extra node
            {
                extranodes = true;
            }
        }
        // Build the JSON object for the treeview
        // For version 3 jsTree

        var treeLabel = nodeName;
        if (xmlData.attributes['name'])
        {
            treeLabel = xmlData.attributes['name'].value;
        }
        else
        {
            if (wizard_data[treeLabel].menu_options.menuItem)
                treeLabel = wizard_data[treeLabel].menu_options.menuItem;
        }
        var this_json = {
            id : lkey,
            text : treeLabel,
            type : nodeName,
            state: {
                opened: true
            }
        }
        console.log("Adding " + this_json);
        // Add the node
        if (validateInsert(key, nodeName, tree))
        {
            var newkey = tree.create_node(key, this_json, pos, function(){
                if (select) {
                    tree.deselect_all();
                    tree.select_node(lkey);
                }
            });
        }
        // Any children to add
        if (extranodes)
        {
            $.each(xmlData.childNodes, function(nr, child) {   // Was children
                if (child.nodeType == 1)
                {
                    addNodeToTree(lkey,'last',child.nodeName,child,tree,false);
                }
            });
        }
    },

    addSubNode = function (event)
    {
        console.log('Add sub node ' + event.data.node + ' to ' + event.data.key);
        var tree = $.jstree.reference("#treeview");
        var node = tree.get_node(event.data.key, false);
        var nodeName = event.data.node;
        //var key = parent.tree.generate_lo_key();
        var xmlData = $.parseXML(event.data.defaultnode);
        // Parse the attributes and store in the data store
        addNodeToTree(event.data.key,'last',nodeName,xmlData.firstChild,tree,true);

    },

    addNode = function(selectedItem, mode)
    {
        console.log(selectedItem, mode);
        var tree = $.jstree.reference("#treeview");
        var ids = tree.get_selected();
        var id;
        var pos;
        if (mode == 'before' || mode == 'after')
        {
            if(!ids.length) {
                pos='last';
            }
            else
            {
                id = ids[0];

                if (id == 'treeroot')
                {
                    pos = 'first';
                }
                else
                {
                    while (tree.get_parent(id) != 'treeroot')
                        id = tree.get_parent(id);

                    // Walk and count children of 'treeroot' to figure out pos
                    var i = 0;
                    $.each(tree.get_children_dom('treeroot'), function () {
                        if (this.attributes['id'].nodeValue == id)
                            pos = i;
                        i++;
                    });
                    if (mode == 'after')
                        pos++;
                }
            }
        }
        else
        {
            // Insert at last node, id is 'treeroot' and pos is 'last'
            pos = 'last';
        }

        var node = tree.get_node('treeroot', false);
        var nodeName = selectedItem;
        var key = parent.tree.generate_lo_key();
        var extranodes = false;

        for (i=0; i<wizard_data[topLevelObject].new_nodes.length; i++)
        {
            if (selectedItem == wizard_data[topLevelObject].new_nodes[i])
                break;
        }
        if (i >= wizard_data[topLevelObject].new_nodes.length)
            return; // not found!!
        var xmlData = $.parseXML(wizard_data[topLevelObject].new_nodes_defaults[i]).firstChild;

        addNodeToTree('treeroot',pos,nodeName,xmlData,tree,true);
    },

    validateInsert = function(key, newNode, tree)
    {
        if (wizard_data[newNode]['menu_options'].max)
        {
            var max = wizard_data[newNode]['menu_options'].max;
            var children = tree.get_children_dom(key);
            var numNodes =0;
            for (var i=0; i<children.length; i++) {
                if (lo_data[children[i].id].attributes.nodeName == newNode) {
                    numNodes++;
                    if (max == numNodes) {
                        var mesg = language.Alert.validate.max.prompt;
                        var pos = mesg.indexOf("{m}");
                        mesg = mesg.substr(0, pos) + max + mesg.substr(pos + 3, mesg.length);
                        pos = mesg.indexOf("{i}");
                        mesg = mesg.substr(0, pos) + wizard_data[newNode]['menu_options'].menuItem + mesg.substr(pos + 3, mesg.length);
                        alert(mesg);
                        return false;
                    }
                }
            }
        }
        if (wizard_data[lo_data[key].attributes.nodeName]['menu_options'].mixedContent === "false")
        {
            var children = tree.get_children_dom(key);
            for (var i=0; i<children.length; i++)
            {
                if (lo_data[children[i].id].attributes.nodeName != newNode)
                {
                    // title is in language.Alert.validate.mixedcontent.$title
                    alert(language.Alert.validate.mixedcontent.prompt);
                    return false;
                }
            }
        }
        return true;
    },
    // Build the tree once the data has loaded
    build = function (xml) {
        var xmlData = $.parseXML(xml);
        topLevelObject = xmlData.childNodes[0].nodeName;
        var tree_json = toolbox.build_lo_data($($.parseXML(xml)).find(topLevelObject), null),

        create_node_type = function (page_name, children) {
            // clone children
            var lchildren = children.slice();

            // Check defaults, and see whther there are children, that are NOT new_nodes
            // As an example see tableData within table
            for (var i=0; i<wizard_data[topLevelObject].new_nodes.length; i++)
            {
                if (page_name == wizard_data[topLevelObject].new_nodes[i])
                    break;
            }
            if (i < wizard_data[topLevelObject].new_nodes.length)
            {
                var xmlData = $.parseXML(wizard_data[topLevelObject].new_nodes_defaults[i]).firstChild;
                $.each(xmlData.childNodes, function(j, child)       // Was children
                {
                    if (child.nodeType == 1)
                    {
                        for (var i=0; i<lchildren.length; i++)
                        {
                            if (lchildren[i] == child.nodeName)
                                break;
                        }
                        if (i>=lchildren.length)
                        {
                            lchildren.push(child.nodeName);
                        }
                    }
                });
            }
            //console.log("Type: " + page_name + ", valid children: " + lchildren);
            return {
                icon: parent.toolbox.getIcon(page_name),
                valid_children: lchildren
            };
        };

        // build Types structure for the types plugin
        var node_types = {};
        node_types["#"] = create_node_type(null, ["treeroot"]); // Make sure that only the LO can be at root level
        $.each(wizard_data, function (key, value) {
                node_types[key] = create_node_type(key, value.new_nodes);
        });

        console.log(node_types);

        //console.log(JSON.stringify(tree_json));
        var treeview = $('<div />').attr('id', 'treeview');
        $(".ui-layout-west .content").append(treeview);
        $("#treeview").jstree({
            "plugins": ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) ? ["types"] : ["types", "dnd"],
            "core" : {
                "data" : tree_json,
                "check_callback" : true, // Need this to allow the copy_node function to work...
                "multiple" : false // Need to disable this just now as nodes could be on different levels
            },
            "types" : node_types
        })
        .one('ready.jstree', function (e, data) {
            data.instance.open_node(["treeroot"]);
            data.instance.select_node(["treeroot"]);
        })
        .bind('select_node.jstree', function(event, data) {
            showNodeData(data.node.id);
        })
        .bind('move_node.jstree', function(event, data) {
            console.log("move node");
        });
    },


    // Up button handler
    up_btn = function() {
        move_node('up');
    },

    // Down button handler
    down_btn = function() {
        move_node('down');
    },

    // Move the selected node up or down
    move_node = function(dir) {
        var tree = $.jstree.reference("#treeview"),
            copy_node,
            new_node,
            id,
            ids = tree.get_selected(),
            pos,
            new_pos,
            count;

        if(!ids.length) { return false; } // Something needs to be selected

        id = ids[0];

        if (id == "treeroot") return false; // Can't remove the root node

        current_node = tree.get_node(id, false);
        $current_node = $("#" + id).closest('li');

        // Calculate positions and total
        pos = $current_node.index();
        new_pos = pos + (dir == 'up' ? -1 : 2);
        count = $current_node.siblings().length + 1;

        // Exit if we are at the top or bottom
        if (new_pos < 0 ) return false;
        if (new_pos > count) return false;

        // Get the parent node
        parent_node_id = tree.get_parent(current_node);
        parent_node = tree.get_node(parent_node_id, false);

        // Do the move
        tree.move_node(current_node, parent_node, new_pos);

        return true;
    },


    generate_lo_key = function () {
        var key;

        function lo_key_exists(key) {
            for (var lo_key in lo_data) if (lo_key == key) return true;
            return false;
        };

        do {
            key = "ID_";
            for (var i=0; i<10; i++) key += String(parseInt(Math.random()*9));
        } while (lo_key_exists(key));
        return key;
    },


    do_bottom_buttons = function () {
        buttons = $('<div />').attr('id', 'bottom_buttons');
        $([
            {name:'', tooltip: language.btnMoveUp.$tooltip, icon:'fa-chevron-up', id:'up_button', click:up_btn},
            {name:'', tooltip: language.btnMoveDown.$tooltip, icon:'fa-chevron-down', id:'down_button', click:down_btn}
        ])
        .each(function(index, value) {
        var button = $('<button>')
            .attr('id', value.id)
            .attr('title', value.tooltip)
            .click(value.click)
            .addClass("xerte_button")
            .append($('<i>').addClass('fa').addClass(value.icon).addClass("xerte-icon").height(14));
        buttons.append(button);
        });
        $('.ui-layout-west .footer').append(buttons);
    };

    my.setup = setup;
    my.generate_lo_key = generate_lo_key;
    my.getSelectedNodeKeys = getSelectedNodeKeys;
    my.showNodeData = showNodeData;
    my.addNode = addNode;
    my.getParent = getParent;

    return parent;

})(jQuery, EDITOR || {});