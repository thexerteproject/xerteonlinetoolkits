// Tree : Add the tree object to the editor
var EDITOR = (function ($, parent) {

    // Create the tree object and refer locally to it as 'my'
    var my = parent.tree = {},
        toolbox = parent.toolbox,

    // Called once document is ready
    setup = function (xml) {
        console.log("Setting up tree");
        do_bottom_buttons();
        do_buttons();
        build(xml);
    },

    // Add the buttons
    do_buttons = function () {
        $( "#insert-dialog" ).hide();
        $( "#insert-buttons" ).hide();

        var insert_page = function() {
            $( "#insert-dialog" ).dialog({ width: '60%' });
        },

        delete_page = function() {
            deleteSelectedNodes();
        },

        duplicate_page = function() {
            duplicateSelectedNodes();
        },

        buttons = $('<div />').attr('id', 'top_buttons');
        $([
            {name: language.btnInsert.$label, tooltip: language.btnInsert.$tooltip, icon:'editor/img/insert.png', id:'insert_button', click:insert_page},
            {name: language.btnDuplicate.$label, tooltip: language.btnDuplicate.$tooltip, icon:'editor/img/copy.png', id:'copy_button', click:duplicate_page},
            {name: language.btnDelete.$label, tooltip: language.btnDelete.$tooltip, icon:'editor/img/delete.gif', id:'delete_button', click:delete_page}
        ])
        .each(function(index, value) {
            var button = $('<button>')
                .attr('id', value.id)
                .attr('title', value.tooltip)
                .click(value.click)
                .append($('<img>').attr('src', value.icon).height(14))
                .append(value.name);
            buttons.append(button);
        });
        $('.ui-layout-west .header').append(buttons);

        buttons = $('<div />').attr('id', 'save_buttons');
        $([
            {name:language.btnPreview.$label, tooltip: language.btnPreview.$tooltip, icon:'editor/img/insert.png', id:'preview_button', click:preview},
            {name:language.btnPublishXot.$label, tooltip: language.btnPublishXot.$tooltip, icon:'editor/img/copy.png', id:'publish_button', click:publish},
        ])
        .each(function(index, value) {
            var button = $('<button>')
                .attr('id', value.id)
                .attr('title', value.tooltip)
                .click(value.click)
                .append($('<img>').attr('src', value.icon).height(14))
                .append(value.name);
            buttons.append(button);
        });
        $('.ui-layout-east .content').append(buttons);
    },

    preview = function () {
        console.log("preview clicked");
    },


    publish = function () {
        console.log("publish clicked");
    },

    // Make a copy of the currently selected node
    // Presently limited to first node if multiple selected
    duplicateSelectedNodes = function () {
    var tree = $.jstree.reference("#treeview");
        var copy_node, new_node, id, ids = tree.get_selected();

        if(!ids.length) { return false; } // Something needs to be selected

        id = ids[0];

        if (id == "treeroot") { return false; } // Can't copy the root node

        console.log(id);

        current_node = tree.get_node(id, false); console.log(current_node);
        parent_node_id = tree.get_parent(current_node); console.log(parent_node_id);
        parent_node = tree.get_node(parent_node_id, false); console.log(parent_node);

        tree.copy_node(current_node, parent_node, 'last');

        return true; // Successful

    },

    // Remove the currently selected node
    // Presently limited to the first node if multiple selected
    deleteSelectedNodes = function () {
        var tree = $.jstree.reference("#treeview");
        var copy_node, new_node, id, ids = tree.get_selected();

        if(!ids.length) { return false; } // Something needs to be selected

        id = ids[0];

        if (id == "treeroot") {  // Can't remove the root node
            alert("You can't remove the LO node");
            return false;
        }

        if (!confirm('Are you sure you want to delete this page?')) {
            return;
        }

        // Delete from the tree
        tree.delete_node(id);

        // Delete
        delete lo_data[id];

        //console.log(lo_data[id]);
        //tree.last_error();

        return true; // Successful
    },

    // Refresh the page when a new node is selected
    showNodeData = function (key) {

        var attributes = lo_data[key]['attributes'];

        // Get the node name
        var node_name = '';
        var node_label = '';
        for (var i=0, len=attributes.length; i<len; i++)
        {
            if (attributes[i].name == 'nodeName')
            {
                node_name = attributes[i].value;
                break;
            }
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
                toolbox.displayParameter('#mainPanel', node_options['name'], attribute_name, attribute_value.value, key);
            }
        }
        // If the main node has a label, display the node item second (unconditionaly)
        if (node_label.length > 0)
        {
            toolbox.displayParameter('#mainPanel', node_options['normal'], node_name, '', key, node_label);
        }
        // Optional parameters
        for (var i=0; i<node_options['optional'].length; i++)
        {
            attribute_name = node_options['optional'][i].name;
            attribute_value = toolbox.getAttributeValue(attributes, attribute_name, node_options, key);
            if (attribute_value.found)
            {
                toolbox.displayParameter('#mainPanel', node_options['optional'], attribute_name, attribute_value.value, key);
            }
        }
        // The rest of the normal params
        for (var i=0; i<node_options['normal'].length; i++)
        {
            attribute_name = node_options['normal'][i].name;
            attribute_value = toolbox.getAttributeValue(attributes, attribute_name, node_options, key);
            if (attribute_value.found)
            {
                toolbox.displayParameter('#mainPanel', node_options['normal'], attribute_name, attribute_value.value, key);
            }
        }
        $('#mainPanel').append("</table>");

        $('#advancedPanel').html("<hr><table class=\"wizard\" border=\"0\">");
        // advancedOptons
        for (var i=0; i<node_options['advanced'].length; i++)
        {
            attribute_name = node_options['advanced'][i].name;
            attribute_value = toolbox.getAttributeValue(attributes, attribute_name, node_options, key);
            if (attribute_value.found)
            {
                toolbox.displayParameter('#advancedPanel', node_options['advanced'], attribute_name, attribute_value.value, key);
            }
        }
        $('#advancedPanel').append("</table>");

        $('#languagePanel').html("<hr><table class=\"wizard\" border=\"0\">");
        // advancedOptons
        for (var i=0; i<node_options['language'].length; i++)
        {
            attribute_name = node_options['language'][i].name;
            attribute_value = toolbox.getAttributeValue(attributes, attribute_name, node_options, key);
            if (attribute_value.found)
            {
                toolbox.displayParameter('#languagePanel', node_options['language'], attribute_name, attribute_value.value, key);
            }
        }
        $('#languagePanel').append("</table>");
    /*
        for (var i=0; i<attributes.length; i++) {
            if ($.inArray(attributes[i].name, ['nodeName', 'linkID']) < 0) {
                var attribute_name = attributes[i].name;
                var attribute_value = attributes[i].value;

                var options = getOptionValue(node_options['all'], attribute_name);
                if (options != null)
                {
                    var output_string = '<tr class="wizardattribute">';
                    if (options.optional == 'true')
                    {
                        output_string += '<td class="wizardoptional"><img src="img/optional.gif" />&nbsp;</td>';
                    }
                    else
                    {
                        output_string += '<td class="wizardparameter"></td>';
                    }
                    output_string += '<td class="wizardlabel">' + options.label + ' : </td>';
                    output_string += '<td class="wizardvalue">' + displayDataType(attribute_value, options) + '</td>';
                    output_string += '</tr>';
                    $('#mainContent').append(output_string);
                }
            }
        }
    */

        //$('textarea.ckeditor').ckeditor(function(){}, { customConfig: 'config.js' });
        //$('textarea.ckeditor').ckeditor();
        toolbox.convertTextAreas();
        //$('div.inputtext').ckeditor(function(){}, { toolbarGroups : [
        //    { name: 'basicstyles', groups: [ 'basicstyles' ] },
        //    { name: 'colors' }]
        //});
        toolbox.convertTextInputs();
        toolbox.convertColorPickers();

        //$('div.inputtext').ckeditor();
    },

    // Build the tree once the data has loaded
    build = function (xml) {
        var tree_json = toolbox.build_lo_data($($.parseXML(xml)).find("learningObject"), null);

        // build Types structure for the types plugin
        var node_types = {};
        $.each(wizard_data, function (key, value) {
            // Add a object to nod_types containg the icon, and the valid children
            //var key = wizard_data['learningObject'].new_nodes[i];
            var node_type = {
                icon: parent.toolbox.getIcon(key),
                valid_children: value.new_nodes
                };
            node_types[key] = node_type;
        });

        console.log(node_types);

        //console.log(JSON.stringify(tree_json));
        var treeview = $('<div />').attr('id', 'treeview');
        $(".ui-layout-west .content").append(treeview);
        $("#treeview").jstree({
            "plugins" : [ "types",  "dnd"],
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
        .bind('move_node.jstree', function(event, data) {
            console.log("move node");
        });
    },

    // Up button handler
    up = function() {
        console.log("move node up");
        move(-1);
    },

    // Down button handler
    down = function() {
        console.log("move node down");
        move(2);
    },

    // Move the selected node up or down
    move = function(dir) {
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

        if (id == "treeroot") {  // Can't remove the root node
            alert("You can't move the LO node");
            return false;
        }

        current_node = tree.get_node(id, false);
        $current_node = $("#" + id).closest('li');

        // Calculate positions and total
        pos = $current_node.index();
        new_pos = pos + dir;
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

    do_bottom_buttons = function () {
        buttons = $('<div />').attr('id', 'bottom_buttons');
        $([
        {name:'UP', icon:'', id:'up_button', click:up},
        {name:'DOWN', icon:'', id:'down_button', click:down}
        ])
        .each(function(index, value) {
        var button = $('<button>')
            .attr('id', value.id)
            .click(value.click)
            .append($('<img>').attr('src', value.icon).height(14))
            .append(value.name);
        buttons.append(button);
        });
        $('.ui-layout-west .footer').append(buttons);
    };

    // Create the layout once the document has finished loading
    //$(document).ready(setup);

    // my.build = build;
    // my.do_buttons = do_buttons;
    my.setup = setup;

    return parent;

})(jQuery, EDITOR || {});