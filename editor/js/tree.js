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

        // Save buttons
        buttons = $('<div />').attr('id', 'save_buttons');
        $([
            {name:language.btnPreview.$label, tooltip: language.btnPreview.$tooltip, icon:'editor/img/insert.png', id:'preview_button', click:preview},
            {name:language.btnPublishXot.$label, tooltip: language.btnPublishXot.$tooltip, icon:'editor/img/copy.png', id:'publish_button', click:publish}
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
        $('.ui-layout-center .header').append(buttons);

        // Advanced and language checkboxes
        var checkboxes = $('<div />').attr('id', 'parameter_checkboxes');
        $([
            {name:language.chkShowLanguage.$label, tooltip: language.chkShowLanguage.$tooltip, id:'language_cb', click:showLanguage},
            {name:language.chkShowAdvanced.$label, tooltip: language.chkShowAdvanced.$tooltip, id:'advanced_cd', click:showAdvanced}
        ]).each(function(index, value) {
            var checkbox = $('<input>')
                .attr('id', value.id)
                .attr('type',  'checkbox')
                .attr('title', value.tooltip)
                .attr('disabled', 'disabled')
                .on('change', value.click)

            checkboxes.append(checkbox);
            var span = $('<span>')
                .attr('id', value.id + "_span")
                .addClass("disabled")
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
		//obj.attributes = lo_data[node_id]['attributes'];

		console.log(node_id + ": " + node.children.length + " children");
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
    

    preview = function () {
		var json = build_json("treeroot");
		var ajax_call = $.ajax({
                url: "editor/upload.php",
                data: {
                    fileupdate: 0,
                    lo_data: encodeURIComponent(JSON.stringify(json))
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
			alert( "success" );
			// We would also launch the preview window from here
		})
		.fail(function() {
			alert( "error" );
		});
	},


    publish = function () {
		var json = build_json("treeroot");
        var ajax_call = $.ajax({
                url: "editor/upload.php",
                data: {
                    fileupdate: 1,
                    lo_data: encodeURIComponent(JSON.stringify(json))
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
			alert( "success" );
		})
		.fail(function() {
			alert( "error" );
		});
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

        }
        else
        {
            $('#languagePanel').hide();
        }
    },

    showAdvanced = function() {
        if ($('#advanced_cb').prop('checked'))
        {
            // show
            $('#advancedPanel').show();
            //$('div.textinput').attr('contenteditable', 'true');

        }
        else
        {
            $('#advancedPanel').hide();
        }
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
        var node_name = attributes.nodeName;
        var node_label = '';

        var node_options = wizard_data[node_name].node_options;
        var new_nodes = wizard_data[node_name].new_nodes;
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
        if (node_label.length > 0 && !node_options['cdata'])
        {
            toolbox.displayParameter('#mainPanel', node_options['normal'], node_name, '', key, node_label);
        }
        // Optional parameters
        // 1. Empty right panel
        $('#optionalParams').html("");
        var html = $('<div>')
            .addClass("optButtonContainer");
        var table = $('<table>');

        for (var i=0; i<node_options['optional'].length; i++)
        {
            attribute_name = node_options['optional'][i].name[0];
            attribute_label = "  " + node_options['optional'][i].value.label;
            // Create button for right panel
            var button = $('<button>')
                .attr('id', 'insert_opt_' + attribute_name)
                .addClass('btnInsertOptParam')
                .click({key:key, attribute:attribute_name, default:(node_options['optional'][i].value.defaultValue ? node_options['optional'][i].value.defaultValue : "")},
                    function(event){
                        parent.toolbox.insertOptionalProperty(event.data.key, event.data.attribute, event.data.default);
                    })
                .append($('<img>').attr('src', 'editor/img/insert.png').height(14))
                .append(attribute_label);
            attribute_value = toolbox.getAttributeValue(attributes, attribute_name, node_options, key);
            if (attribute_value.found)
            {
                toolbox.displayParameter('#mainPanel', node_options['optional'], attribute_name, attribute_value.value, key);
                // Add disabled button to right panel
                button.attr('enabled', false)
                    .addClass('disabled');
            }
            else
            {
                // Add enabled button to the right panel
                button.attr('enabled', true)
                    .addClass('enabled');
            }
            var tablerow = $('<tr>')
                .append($('<td>')
                    .append(button));
            table.append(tablerow);
        }
        html.append(table);
        if (node_options['optional'].length > 0)
        {
            $('#optionalParams').append(html);
        }

        // The rest of the normal params
        for (var i=0; i<node_options['normal'].length; i++)
        {
            attribute_name = node_options['normal'][i].name[0];
            attribute_value = toolbox.getAttributeValue(attributes, attribute_name, node_options, key);
            if (attribute_value.found)
            {
                toolbox.displayParameter('#mainPanel', node_options['normal'], attribute_name, attribute_value.value, key);
            }
        }
        $('#mainPanel').append("</table>");

        $('#advancedPanel').html("<hr><table class=\"wizard\" border=\"0\">");

        // advancedOptons
        var nradvancedoptions= 0;

        for (var i=0; i<node_options['advanced'].length; i++)
        {
            attribute_name = node_options['advanced'][i].name[0];
            attribute_value = toolbox.getAttributeValue(attributes, attribute_name, node_options, key);
            if (attribute_value.found)
            {
                toolbox.displayParameter('#advancedPanel', node_options['advanced'], attribute_name, attribute_value.value, key);
                nradvancedoptions++;
            }
        }
        $('#advancedPanel').append("</table>");
        if (nradvancedoptions>0)
        {
            // Enable Advanced settings
            $('#advancedPanel').hide();
            $('#advanced_cb_span').switchClass("disabled", "enabled");
            $('#advanced_cb').removeAttr("disabled");
            $('#advanced_cb').prop('checked', false);
        }
        else
        {
            // Hide the advanced panel and disable check box
            $('#advanced_cb_span').switchClass("enabled", "disabled");
            $('#advanced_cb').attr("disabled", "disabled");
            $('#advanced_cb').prop('checked', false);
            $('#advancedPanel').hide();
        }

        $('#languagePanel').html("<hr><table class=\"wizard\" border=\"0\">");
        // languageOptons
        var nrlanguageoptions= 0;
        for (var i=0; i<node_options['language'].length; i++)
        {
            attribute_name = node_options['language'][i].name[0];
            attribute_value = toolbox.getAttributeValue(attributes, attribute_name, node_options, key);
            if (attribute_value.found)
            {
                toolbox.displayParameter('#languagePanel', node_options['language'], attribute_name, attribute_value.value, key);
                nrlanguageoptions++;
            }
        }
        $('#languagePanel').append("</table>");
        if (nrlanguageoptions>0)
        {
            // Enable Advanced settings
            $('#languagePanel').hide();
            $('#language_cb_span').switchClass("disabled", "enabled");
            $('#language_cb').removeAttr("disabled");
            $('#language_cb').prop('checked', false);
        }
        else
        {
            // Hide the advanced panel and disable check box
            $('#languagePanel').hide();
            $('#language_cb_span').switchClass("enabled", "disabled");
            $('#language_cb').attr("disabled", "disabled");
            $('#language_cb').prop('checked', false);
        }

        // Extra insert buttons
        if (new_nodes.length > 0 && key != 'treeroot')
        {
            $('#insert_subnodes').html("<hr>");
            for (var i=0; i<new_nodes.length; i++)
            {
                var item = new_nodes[i];
                var itemname = item;
                if (wizard_data[item].menu_options.menuItem)
                    itemname = wizard_data[item].menu_options.menuItem;
                var buttonlabel = language.newLink.$label;
                var pos = buttonlabel.indexOf('{i}');
                if (pos >= 0)
                    buttonlabel = buttonlabel.substr(0, pos) + itemname + buttonlabel.substr(pos+3);
                var button = $('<button>')
                    .attr('id',  'add_'+item)
                    .click({key: key, node: item}, function(event){
                        addSubNode(event);
                    })
                    .append($('<img>').attr('src', 'editor/img/insert.png').height(14))
                    .append(buttonlabel);
                $('#insert_subnodes').append(button);
            }
        }
        else
        {
            $('#insert_subnodes').html("");
        }

        // The optional parameters (what to do here, only enable the not used entries)

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
    },

    addSubNode = function (event)
    {
        alert('Add sub node ' + event.data.node + ' to ' + event.data.key);
    }
    // Build the tree once the data has loaded
    build = function (xml) {
        var tree_json = toolbox.build_lo_data($($.parseXML(xml)).find("learningObject"), null),
        
        create_node_type = function (page_name, children) {
			return {
                icon: parent.toolbox.getIcon(page_name),
                valid_children: children
        	};
        };

        // build Types structure for the types plugin
        var node_types = {};
        node_types["#"] = create_node_type(null, "treeroot"); // Make sure that only the LO can be at root level
        $.each(wizard_data, function (key, value) {
            node_types[key] = create_node_type(key, value.new_nodes);
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
        {name:'UP', icon:'', id:'up_button', click:up_btn},
        {name:'DOWN', icon:'', id:'down_button', click:down_btn}
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
    my.generate_lo_key = generate_lo_key;
    my.getSelectedNodeKeys = getSelectedNodeKeys;
    my.showNodeData = showNodeData;

    return parent;

})(jQuery, EDITOR || {});