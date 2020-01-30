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
 
// *******************
// *     Toolbox    *
// *******************

var merged = false;
var EDITOR = (function ($, parent) {

    var my = parent.toolbox = {},
        scrollTop = 0,
        defaultToolBar = false,
        jqGridsLastSel = {},
        jqGridsColSel = {},
        jqGrGridData = {},
		jqGridSetUp = false,
		workspace,

    // Build the "insert page" menu
    create_insert_page_menu = function (advanced_toggle) {
        var getMenuItem = function (itemData) {
            var data = {
                href: '#',
                html: itemData.name,
                class: itemData.name
            };
            
            if (itemData.icon != undefined) {
                data.icon = itemData.icon;
				data.html = '<img class="icon" src="' + moduleurlvariable + 'icons/' + itemData.icon + '.png"/>' + data.html;
            }
			
            var item = $("<li>")
				.append($("<a>", data))
				.attr("item", itemData.item);
			
			// it's a category
			if (itemData.submenu != undefined) {
                var subList = $("<ul>");
                $.each(itemData.submenu, function () {
                    if (!this.deprecated && (this.simple_enabled || advanced_toggle)) {
                        subList.append(getMenuItem(this));
                    }
                });
                item.append(subList);
				
			// it's a page type
            } else if (itemData.item != undefined) {
				var hint = itemData.hint != undefined ? '<p>' + itemData.hint + '</p>' : "";
				hint = itemData.thumb != undefined ? '<div>' + language.insertDialog.$preview + ':</div><img class="preview_thumb" alt="' + itemData.name + ' ' + language.insertDialog.$preview + '" src="modules/xerte/parent_templates/Nottingham/' + itemData.thumb + '" />' + hint : hint;
				hint = hint != "" ? '<hr/>' + hint : hint;
				
				var $insertInfo = $('<ul class="details"><li><a href="#"><div class="insert_buttons"/>' + hint + '</a></li></ul>'),
					label = language.insertDialog.$label + ":",
					pos = label.indexOf('{i}');
				
				label = pos >= 0 ? label.substr(0, pos) + itemData.name + label.substr(pos + 3) : label;
				
				$insertInfo.find(".insert_buttons").append('<div>' + label + '</div>');
				
				$insertInfo.appendTo(item);
			}
			
            return item;
        };
		
		// create 1st level of menu and call getMenuItem to add every item and submenu to it
        var $menu = $("<ul>", {
            id: 'menu'
        });
        
        $.each(menu_data.menu, function () {
            if (!this.deprecated && (this.simple_enabled || advanced_toggle)) {
                $menu.append(
                    getMenuItem(this)
                )
            };
        });
		
		// create insert buttons above the page hints / thumbs
            $([

                {
                    name: language.insertDialog.insertBefore.$label,
                    icon: 'editor/img/insert-before.png',
                    tooltip: language.insertDialog.insertBefore.$tooltip,
                    id: 'insert_button_before',
                    btnvalue: "before"
                },
                {
                    name: language.insertDialog.insertAfter.$label,
                    icon: 'editor/img/insert-after.png',
                    tooltip: language.insertDialog.insertAfter.$tooltip,
                    id: 'insert_button_after',
                    btnvalue: "after"
                },
                {
                    name: language.insertDialog.insertAtEnd.$label,
                    icon: 'editor/img/insert-end.png',
                    tooltip: language.insertDialog.insertAtEnd.$tooltip,
                    id: 'insert_button_at_end',
                    btnvalue: "end"
                }

            ]).each(function (index, value) {
                var button = $('<button>')
                    .attr('id', value.id)
                    .attr('title', value.tooltip)
                    .attr('value', value.btnvalue)
                    .attr('tabindex', index + 3)
                    .addClass("insert_button")
                    .click(add_page)
                    .append($('<img>').attr('src', value.icon).height(14))
                    .append(value.name);

                    $menu.find(".insert_buttons").append(button);
            });
            if (templateframework == "xerte") {
                $([

                    {
                        name: language.insertDialog.insertMerge.$label,
                        icon: 'editor/img/insert-end.png',
                        tooltip: language.insertDialog.insertMerge.$tooltip,
                        id: 'insert_button_merge',
                        btnvalue: "merge"
                    }

                ]).each(function (index, value) {
                    var button = $('<button>')
                        .attr('id', value.id)
                        .attr('title', value.tooltip)
                        .attr('value', value.btnvalue)
                        .attr('tabindex', index + 3)
                        .addClass("insert_button")
                        .click(insert_import)
                        .append($('<img>').attr('src', value.icon).height(14))
                        .append(value.name);

                        $menu.find(".insert_buttons").last().append(button);
                });
            }

        if (typeof insert_menu_object !== 'undefined')
        {
            // menu is aleready set once
            insert_menu_object.menu("destroy");
            /*
            $.widget("ui.menu", $.ui.menu, {
                collapseAll: function(e) {},
                _open: function(submenu) {}
            });
            */

        }
        else {
            // Set default once
            $.widget("ui.menu", $.ui.menu, {
                collapseAll: function (e) {
                    if (e.type == "click" && e.target.id != "insert_button") {
                        $("#insert_menu").hide();
                        $("#shadow").hide();
                    } else if (e.type == "keydown" && $(e.target).parent().hasClass("insert_buttons")) {
                        $("#insert_menu").hide();
                        $("#shadow").hide();
                        parent.tree.addNode($(e.target).closest("[item]").attr("item"), $(e.target).attr("value"));
                    }
                    return this._super();
                },
                _open: function (submenu) {
                    // make sure the menus fit on screen and scroll when needed
                    this._super(submenu);
                    if (submenu.hasClass("details")) {
                        if ($("body").height() < (submenu.height() + submenu.offset().top + 20)) {
                            submenu.offset({"top": $("body").height() - submenu.height() - 20});
                        }
                    } else {
                        submenu.css("max-height", $("body").height() - submenu.offset().top - 30);
                    }
                }
            });
        }

        insert_menu_object = $menu.menu();
        $("#insert_menu").html(insert_menu_object);
		$menu.find(".ui-menu-item a").first().attr("tabindex", 2);
    },
    
    //Loads the data into the import screen
	insert_import = function() {
		parent.tree.refresh_workspaceMerge()
	},

	add_page = function(e) {
		$("#insert_menu #menu").menu("collapseAll", e, true);
		parent.tree.addNode($(this).closest("[item]").attr("item"), $(this).attr("value"));
	},

    // Get text from html, by putting html in a div, strip out the scripts
    // and convert to text
    getTextFromHTML = function(html)
    {
        var tmpDiv = $("<div>").html(html);
        tmpDiv
            .find("script")
            .remove()
            .end();
        var tmpText = tmpDiv.text();
        return tmpText;

    },

    getExtraTreeIcon = function(key, icon, enabled, tooltip)
    {
        switch (icon) {
            case "deprecated":
                if (enabled) {
                    return '<i class="deprecatedIcon iconEnabled fa fa-exclamation-triangle " id="' + key + '_deprecated" title ="' + tooltip + '"></i>';
                }
                else {
                    return '<i class="deprecatedIcon iconDisabled fa fa-exclamation-triangle " id="' + key + '_deprecated"></i>';
                }
            case "unmark":
                if (enabled)
                {
                    return '<i class="unmarkCompletionIcon iconEnabled fa fa-times-circle-o " id="' + key + '_unmark" title ="' + language.unmarkForCompletion.$tooltip + '"></i>';
                }
                else
                {
                    return '<i class="unmarkCompletionIcon iconDisabled fa fa-times-circle-o " id="' + key + '_unmark" title ="' + language.unmarkForCompletion.$tooltip + '"></i>';
                }
            case "hidden":
                if (enabled) {
                    return '<i class="hiddenIcon iconEnabled fa fa-eye-slash " id="' + key + '_hidden" title ="' + language.hidePage.$tooltip + '"></i>';
                }
                else {
                    return '<i class="hiddenIcon iconDisabled fa fa-eye-slash " id="' + key + '_hidden" title ="' + language.hidePage.$tooltip + '"></i>';
                }
            case "advanced":
                if (enabled) {
                    return '<i class="advancedIcon iconEnabled fa fa-exclamation-circle " id="' + key + '_advanced" title ="' + language.advancedPage.$tooltip + '"></i>';
                }
                else {
                    return '<i class="advancedIcon iconDisabled fa fa-exclamation-circle " id="' + key + '_advanced" title ="' + language.advancedPage.$tooltip + '"></i>';
                }
        }
    },

    changeNodeStatus = function(key, item, enabled, newtext)
    {
        // Get icon states

        var deprecatedState = ($("#"+key+"_deprecated.iconEnabled").length > 0);
        var hiddenState = ($("#"+key+"_hidden.iconEnabled").length > 0);
        var unmarkState = ($("#"+key+"_unmark.iconEnabled").length > 0);
        var change = false;
        var tooltip = "";
        switch(item)
        {
            case "deprecated":
                if (deprecatedState != enabled)
                    change = true;
                break;
            case "hidden":
                if (hiddenState != enabled)
                    change = true;
                break;
            case "unmark":
                if (unmarkState != enabled)
                    change = true;
                break;
            case "text":
                change = true;
                break;
        }
        if (change)
        {
            var tree = $.jstree.reference("#treeview");
            var node = tree.get_node(key, false);

            if (deprecatedState) {
                tooltip = $("#" + key + '_deprecated')[0].attributes['title'];
            }
            var deprecatedIcon = getExtraTreeIcon(key, "deprecated", (item == "deprecated" ? enabled : deprecatedState), tooltip);
            var hiddenIcon = getExtraTreeIcon(key, "hidden", (item == "hidden" ? enabled : hiddenState));
            var unmarkIcon = getExtraTreeIcon(key, "unmark", (item == "unmark" ? enabled : unmarkState));
            var nodetext;
            if (item == "text")
            {
                nodetext = newtext;
            }
            else {
                nodetext = $("#" + key + '_text').text();
            }
            nodetext = '<span id="' + key + '_container">' + unmarkIcon + hiddenIcon + deprecatedIcon + '</span><span id="' + key + '_text">' + nodetext + '</span>';
            tree.rename_node(node, nodetext);
            //tree.set_text(node, nodetext);
            //tree.refresh();
            // debugging
            node = tree.get_node(key, false);
        }
    },

    // ** Recursive function to traverse the xml and build
    build_lo_data = function (xmlData, parent_id) {

        // First lets generate a unique key
        var key = parent.tree.generate_lo_key();
        if (parent_id == null)
        {
            key = 'treeroot';
        }

        // Parse the attributes and store in the data store
        var attributes = {nodeName: xmlData[0].nodeName};
        $(xmlData[0].attributes).each(function() {
            attributes[this.name] = this.value;
        });

		if (parent_id == null)
        {
    		// Look for the editor version attribute and then add xml flag to show we've checked
        	if (attributes.editorVersion && parseInt("0" + attributes.editorVersion, 10) >= 3) alreadyUpgraded = true;
        	attributes["editorVersion"] = "3";
        }

        // Expand FileLocation + to full path, except for attributes of type media
        //  also take care here of converting CRs to <br /> where appropriate
        var options = wizard_data[xmlData[0].nodeName].node_options;
        $.each(attributes, function(key, attribute){
            var attroptions = {};
            for (var i=0; i<options.all.length; i++)
            {
                if (key == options.all[i].name)
                {
                    attroptions = options.all[i].value;
                    break;
                }
            }

            // Deal with line breaks in TextInput and TextArea fields
            if (!alreadyUpgraded && attroptions.type && (attroptions.type.toLowerCase() == 'textinput' || attroptions.type.toLowerCase() == 'textarea'))
            {
                attributes[key] = addLineBreaks(attributes[key]);
            }

            // Deal with media
            if (attroptions.type && attroptions.type.toLowerCase() != 'media')
            {
                attributes[key] = makeAbsolute(attributes[key]);
            }
        });
        lo_data[key] = {};
        lo_data[key]['attributes'] = attributes;
        if (xmlData[0].firstChild && xmlData[0].firstChild.nodeType == 4)  // cdata-section
        {
            lo_data[key]['data'] = makeAbsolute(xmlData[0].firstChild.data);
			
			if (!alreadyUpgraded)
			{
				lo_data[key]['data'] = addLineBreaks(lo_data[key]['data']);
			}
        }

        // Build the JSON object for the treeview
        // For version 3 jsTree
        var treeLabel = xmlData[0].nodeName;
        if (xmlData[0].attributes['name'])
        {
            // Cleanup label
            treeLabel = getTextFromHTML(xmlData[0].attributes['name'].value);
        }
        else
        {
            if (wizard_data[treeLabel].menu_options.menuItem)
                treeLabel = wizard_data[treeLabel].menu_options.menuItem;
        }

        var deprecatedIcon = getExtraTreeIcon(key, "deprecated", wizard_data[xmlData[0].nodeName].menu_options.deprecated, wizard_data[xmlData[0].nodeName].menu_options.deprecated);
        var hiddenIcon = getExtraTreeIcon(key, "hidden", xmlData[0].getAttribute("hidePage") == "true");
        var unmarkIcon = getExtraTreeIcon(key, "unmark", xmlData[0].getAttribute("unmarkForCompletion") == "true" && parent_id == 'treeroot');
        var advancedIcon = getExtraTreeIcon(key, "advanced", simple_mode && parent_id == 'treeroot' && template_sub_pages.indexOf(lo_data[key].attributes.nodeName) == -1);

        treeLabel = '<span id="' + key + '_container">' + unmarkIcon + hiddenIcon + deprecatedIcon + advancedIcon + '</span><span id="' + key + '_text">' + treeLabel + '</span>';

        var this_json = {
            id : key,
            text : treeLabel,
            type : xmlData[0].nodeName
        }

        // if we are at top level then make sure it's open and display node data
        if (parent_id == null) {
            this_json.state = { opened : true };
        }

        if (xmlData.children()[0]) {
            this_json.children = [];

            xmlData.children().each(function(i) {
                this_json.children.push( build_lo_data($(this), key) );
            });
        }

        return this_json;
    },


    getOptionValue = function (all_options, key)
    {
        var value="";
        for (var i=0; i<all_options.length; i++) {
            if (all_options[i].name == key)
            {
                value = all_options[i].value;
                break;
            }
        }
        return value;
    },

    getIcon = function (nodeName)
    {
        var node = wizard_data[nodeName];
        var icon = "";
        if (node && node.menu_options.icon)
        {
            icon = moduleurlvariable + "icons/" + node.menu_options.icon + ".png";
        }

        return icon;
    },

    getAttributeValue = function (attributes, name, options, key)
    {
        var attribute_value;
        var attr_found = false;

        // find the value
        if (name in attributes)
        {
            attribute_value = attributes[name];
            attr_found = true;
        }
        if (!attr_found)
        {
            if (options.cdata && options.cdata_name == name)
            {
                attribute_value = lo_data[key]['data'];
            }
            else
            {
                return {found: false, value: ""};
            }
        }
        return {found : true, value: attribute_value};
    },
	

    displayParameter = function (id, all_options, name, value, key, nodelabel)
    {
        var options = (nodelabel ? wizard_data[name].menu_options : getOptionValue(all_options, name));
        var label = (nodelabel ? nodelabel : options.label);
        var deprecated = false,
			groupChild = $(id).parents('.wizardgroup').length > 0 ? true : false;
		
        if (options != null)
        {
            var flashonly = $('<img>')
                .attr('src', 'editor/img/flashonly.png')
                .attr('title', 'Flash only attribute');

            var tr = $('<tr>');
            if (options.deprecated) {
                var td = $('<td>')
                    .addClass("deprecated")
					.append($('<i>')
						.attr('id', 'deprbtn_' + name)
                        .addClass('fa')
                        .addClass('fa-exclamation-triangle')
                        .addClass("xerte-icon")
						.attr('title', options.deprecated)
                        .height(14)
                        .addClass("deprecated deprecatedIcon"));
				
                if (options.optional == 'true' && groupChild == false) {
                    var opt = $('<i>').attr('id', 'optbtn_' + name)
                        .addClass('fa')
                        .addClass('fa-trash')
                        .addClass("xerte-icon")
                        .height(14)
                        .addClass("optional");
                    td.addClass("wizardoptional");
                    td.prepend(opt);
                }
                if (options.flashonly)
                {
                    td.addClass('flashonly');
                    td.append(flashonly);
                }
                tr.attr('id', 'depr_' + name)
                    .addClass("wizardattribute")
                    .addClass("wizarddeprecated")
                    .append(td);
                deprecated = true;
            }
            else if (options.optional == 'true' && groupChild == false) {
                var td = $('<td>')
                    .addClass("wizardoptional")
                    .append($('<i>')
                        .attr('id', 'optbtn_' + name)
                        .addClass('fa')
                        .addClass('fa-trash')
                        .addClass("xerte-icon")
                        .height(14)
                        .addClass("optional"));
                if (options.flashonly)
                {
                    td.addClass('flashonly');
                    td.append(flashonly);
                }
                tr.attr('id', 'opt_' + name)
                    .addClass("wizardattribute")
                    .append(td);
            }

            else
            {
                var td = $('<td>')
                    .addClass("wizardparameter");
                if (options.flashonly)
                {
                    td.addClass('flashonly');
                    td.append(flashonly);
                }
                tr.attr('id', 'param_'+ name)
                    .addClass("wizardattribute")
                    .append(td);
            }
            var tdlabel = $('<td>')
                .addClass("wizardlabel");
            if (deprecated)
            {
                tdlabel.addClass("wizarddeprecated")
            }
            tdlabel.append(label);
			
			if (options.tooltip) {
				$('<i class="tooltipIcon iconEnabled fa fa-info-circle"></i>')
					.attr('title', options.tooltip)
					.appendTo(tdlabel);
			}
			
            tr.append(tdlabel)
                .append($('<td>')
                    .addClass("wizardvalue")
                    .append($('<div>')
                        .addClass("wizardvalue_inner")
                        .append(displayDataType(value, options, name, key))));
			
            $(id).append(tr);
            if (options.optional == 'true' && groupChild == false) {
                $("#optbtn_"+ name).on("click", function () {
                    var this_name = name;
                    removeOptionalProperty(this_name);
                });
            }
        }
    },
	
	
	displayGroup = function (id, name, options, key)
    {
		var tr = $('<tr><td colspan="3"/></tr>');
		var group = $('<fieldset class="wizardgroup"></fieldset>').appendTo(tr.find('td'));
		var legend = $('<legend></legend>').appendTo(group);
		
		if (options.deprecated) {
			group.addClass("wizarddeprecated");
			
			legend
				.append($('<img>')
				.attr('id', 'deprbtn_' + name)
				.attr('src', 'editor/img/deprecated.png')
				.attr('title', options.deprecated)
				.addClass("deprecated"));
			
			if (options.optional == 'true') {
				legend.prepend($('<i>')
					.attr('id', 'optbtn_' + name)
					.addClass('fa')
					.addClass('fa-trash')
					.addClass("xerte-icon")
					.height(14)
					.addClass("optional"));
			}
			
			legend.append('<span class="legend_label">' + options.label + '</span>');
			
			tr.attr('id', 'group_' + name)
				.addClass("wizardattribute")
				.addClass("wizarddeprecated")
			
		} else if (options.optional == 'true') {
			group.addClass("wizardoptional")
			
			legend
				.append($('<i>')
				.attr('id', 'optbtn_' + name)
				.addClass('fa')
				.addClass('fa-trash')
				.addClass("xerte-icon")
				.height(14)
				.addClass("optional"));
			
			group.find('legend').append('<span class="legend_label">' + options.label + '</span>');
			
			tr.attr('id', 'group_' + name)
				.addClass("wizardattribute")
			
		} else {
			group.addClass("wizardparameter");
			
			group.find('legend').append('<span class="legend_label">' + options.label + '</span>');
			
			tr.attr('id', 'group_' + name)
				.addClass("wizardattribute");
		}
		
		if (options.tooltip) {
			$('<i class="tooltipIcon iconEnabled fa fa-info-circle"></i>')
				.attr('title', options.tooltip)
				.appendTo(legend.find('.legend_label'));
		}
		
		$('<i class="minMaxIcon fa fa-caret-up"></i>').appendTo(legend.find('.legend_label'));
		
		legend.find('.legend_label').click(function() {
			var $icon = $(this).find('i.minMaxIcon');
			var $fieldset = $(this).parents('fieldset');
			
			if ($fieldset.find('.table_holder').is(':visible')) {
				$fieldset.find('.table_holder').slideUp(400, function() {
					$icon
						.removeClass('fa-caret-up')
						.addClass('fa-caret-down');
					
					$fieldset.addClass('collapsed');
				});
				
			} else {
				$fieldset.find('.table_holder').slideDown(400);
				
				$icon
					.removeClass('fa-caret-down')
					.addClass('fa-caret-up');
				
				$fieldset.removeClass('collapsed');
			}
		});
		
		var info = "";
		if (options.info) info = '<div class="group_info">' + options.info + '</div>';
		
		group.append('<div class="table_holder">' + info + '</div>');
		group.find('.table_holder').append(
			$('<table width="100%" class="column_table"><tr></table>')
		);

		var group_table, columns = (options.cols ? Math.min(options.cols, 3) : 1);
		for (var w = 0; w < columns; w++) {
			group_table = $('<table id="groupTable_' + name + (w == 0 ? '' : '_' + w ) + '" class="wizardgroup_table"/>');

			if (columns > 1) group_table.addClass('wizardgroup_table_box');

			group.find('.column_table tr').append(
				$('<td width="' + parseInt(100 / columns, 10) + '%"/>')
					.append(group_table)
			);
		}
		
		$(id).append(tr);
		
		if (options.optional == 'true') {
			$("#optbtn_" + name).on("click", function () {
				removeOptionalProperty(name, options.children);
			});
		}
    },


    removeDeprecatedProperty = function (name) {
        if (!confirm('Are you sure?')) {
            return;
        }

        // Need to remove row from the screen
        var $row = $("#depr_" + name).remove();

        // Find the property in the data store
        var key = parent.tree.getSelectedNodeKeys();

        if (name in lo_data[key]["attributes"])
        {
            delete lo_data[key]["attributes"][name];
        };
    },

    removeOptionalProperty = function (name, children) {
        if (!confirm('Are you sure?')) {
            return;
        }
		
		var toDelete = [];
		
		// if it's a group being deleted then remove all of its children
		if (children) {
			for (var i=0; i<children.length; i++) {
				toDelete.push(children[i].name);
			}
		} else {
			toDelete.push(name);
		}
		
        // Find the property in the data store
        var key = parent.tree.getSelectedNodeKeys();
		
		for (var i=0; i<toDelete.length; i++) {
			if (toDelete[i] == "hidePage") {
			    changeNodeStatus(key, "hidden", false);
                //var hiddenIcon = $("#" + key + "_hidden");
                //if (hiddenIcon) {
                //    hiddenIcon.switchClass('iconEnabled', 'iconDisabled');
                //}
			}
            if (toDelete[i] == "unmarkForCompletion"){
                changeNodeStatus(key, "unmark", false);
                //var unmarkIcon = $("#" + key + "_unmark");
                //if (unmarkIcon) {
                //    unmarkIcon.switchClass('iconEnabled', 'iconDisabled');
                //}
            }

			if (toDelete[i] in lo_data[key]["attributes"])
			{
				delete lo_data[key]["attributes"][toDelete[i]];
			};
		}
		
        /**
         * TOR 20150614
         *
         *  Previously the row in the table was deleted
         *  You cannot do that, because when the optional parameter contains a
         *  Wysiwyg editor, when you add another optional parameter or move to
         *  another page, the ckeditor instance is being destroyed without the
         *  textarea, and this causes the editor to hang!
         *
         *   // Need to remove row from the screen
         *   var $row = $("#opt_" + name).remove();
         *
         *   // Enable the optional parameter button
         *   $('#insert_opt_' + name)
         *       .switchClass('disabled', 'enabled')
         *       .prop('disabled', false);
         */

        parent.tree.showNodeData(key);
    },

    insertOptionalProperty = function (key, name, defaultvalue, load)
    {
		// Place attribute
		lo_data[key]['attributes'][name] = defaultvalue;

		// Enable the optional parameter button
		$('#insert_opt_' + name)
			.switchClass('enabled', 'disabled')
			.prop('disabled', true);
		
		if (load != false) {
			parent.tree.showNodeData(key);
		}
    },

    showToolBar = function(show){
        defaultToolBar = show;
        var tree = $.jstree.reference("#treeview");
        var ids = tree.get_selected();
        var id;
        if (ids.length>0)
        {
            id = ids[0];
            parent.tree.showNodeData(id);
        }
    },

    onclickJqGridSubmitLocal = function(id, key, name, options, postdata) {
        var grid = $('#' + id + '_jqgrid'),
            grid_p = grid[0].p,
            idname = grid_p.prmNames.id,
            grid_id = grid[0].id,
            id_in_postdata = grid_id + "_id",
            rowid,
            addMode,
            oldValueOfSortColumn;
		
		// replaces contents in empty cells with " " to avoid them being interpreted as end of row
		$.each(postdata, function(key, element, i) {
			if (key.indexOf("col_") == 0 && element == "") {
				postdata[key] = " ";
			}
			// replaces | with &#124; to avoid them being interpreted as end of cell/row
			if (key.indexOf("col_") == 0 && postdata[key].indexOf("|") != -1) {
				postdata[key] = postdata[key].replace(/\|/g, "&#124;");
			}
		});
		
        if (postdata[id_in_postdata])
        {
            rowid = postdata[id_in_postdata];
        }
        else if (postdata[idname])
        {
            rowid = postdata[idname];
        }
        if (postdata['oper'])
        {
            addMode = true;
            delete postdata['oper'];
        }
        else
        {
            addMode = rowid === "_empty";
        }
		
        // postdata has row id property with another name. we fix it:
        if (addMode) {
            // generate new id
            var new_id = grid_p.records + 1;
            while (grid.find("#" + new_id).length !== 0) {
                new_id++;
            }
            postdata[idname] = String(new_id);
			
        } else if (typeof(postdata[idname]) === "undefined") {
            // set id property only if the property not exist
            postdata[idname] = rowid;
        }
        delete postdata[id_in_postdata];

        // clone postdata
        var data = $.extend({}, postdata);
        data['col_0'] = data[idname];
        delete data[idname];
        var colnr = parseInt(postdata[idname]) - 1;
        for (var field in data){
            data[field] = stripP(data[field]);
        };
        jqGrGridData[key + '_' + id][colnr] = data;
		
        var xerte = convertjqGridData(jqGrGridData[key + '_' + id]);
        setAttributeValue(key, [name], [xerte]);

        // prepare postdata for tree grid
        if(grid_p.treeGrid === true) {
            if (addMode) {
                var tr_par_id = grid_p.treeGridModel === 'adjacency' ? grid_p.treeReader.parent_id_field : 'parent_id';
                postdata[tr_par_id] = grid_p.selrow;
            }

            $.each(grid_p.treeReader, function (i){
                if(postdata.hasOwnProperty(this)) {
                    delete postdata[this];
                }
            });
        }

        // decode data if there encoded with autoencode
        if(grid_p.autoencode) {
            $.each(postdata,function(n,v){
                postdata[n] = $.jgrid.htmlDecode(v); // TODO: some columns could be skipped
            });
        }

        // save old value from the sorted column
        oldValueOfSortColumn = grid_p.sortname === "" ? undefined: grid.jqGrid('getCell',rowid,grid_p.sortname);

        // save the data in the grid
        if (grid_p.treeGrid === true) {
            if (addMode) {
                grid.jqGrid("addChildNode",data['col_0'],grid_p.selrow,data);
            } else {
                grid.jqGrid("setTreeRow",data['col_0'],data);
            }
        } else {
            if (addMode) {
                grid.jqGrid("addRowData",data['col_0'],data, options.addedrow);
            } else {
                grid.jqGrid("setRowData",data['col_0'],data);
            }
        }

        if ((addMode && options.closeAfterAdd) || (!addMode && options.closeAfterEdit)) {
            // close the edit/add dialog
            $.jgrid.hideModal("#editmod"+grid_id,
                {gb:"#gbox_"+grid_id,jqm:options.jqModal,onClose:options.onClose});
        }

        if (oldValueOfSortColumn === undefined || postdata[grid_p.sortname] !== oldValueOfSortColumn) {
            // if the data are changed in the column by which are currently sorted, or no sort is defined
            // we need resort the grid
            setTimeout(function() {
                grid.trigger("reloadGrid", [{current:true}]);
            },100);
        }
		
		checkRowIds(grid);

        // !!! the most important step: skip ajax request to the server
        this.processing = true;
        return {};
    },

    delRow = function(id, key, name, rowid){
		var gridId = key + '_' + id;
        jqGrGridData[gridId].splice(rowid-1, 1);
		
		// renumber the data array
		for (var i=0; i<jqGrGridData[gridId].length; i++) {
			if (jqGrGridData[gridId][i]['col_0'] != i+1) {
				jqGrGridData[gridId][i]['col_0'] = String(i+1);
			}
		}
		
        var xerte = convertjqGridData(jqGrGridData[gridId]);
        setAttributeValue(key, [name], [xerte]);
    },

    addColumn = function(id, key, name, colnr)
    {
        // get the default value of the new column
		var gridId = key + '_' + id;
        var nodeName = lo_data[key].attributes.nodeName;
        var alloptions = wizard_data[nodeName].node_options.all;
        var defvalue = " ";
        for (var i=0; i<alloptions.length; i++)
        {
            if (alloptions[i].name == name)
            {
                defvalue = alloptions[i].value.newCol;
                break;
            }
        }

        // Modify data, and rebuild Xerte structure
        // ignore colnr for now
        $.each(jqGrGridData[gridId], function(i, row){
            var col = row.length-1;
            row['col_' + col] = defvalue;
        });
		
        var data = convertjqGridData(jqGrGridData[gridId]);
        setAttributeValue(key, [name], [data]);
        parent.tree.showNodeData(key);
    },

    delColumn = function(id, key, name, colnr)
    {
		var gridId = key + '_' + id;
        // Modify data, and rebuild Xerte structure
        $.each(jqGrGridData[gridId], function(i, row){
            delete row['col_' + (colnr)];
        });
		
        var data = convertjqGridData(jqGrGridData[gridId]);
        setAttributeValue(key, [name], [data]);
        parent.tree.showNodeData(key);
    },

    convertjqGridData = function(data)
    {
        var xerte = "";
        $.each(data, function(i, row){
            if (i>0)
            {
                xerte += '||';
            }
			var k = 0;
            $.each(row, function(j, field){
                if (j != 'col_0') {
                    if (k != 0) {
                        xerte += '|';
					} else {
						k++;
					}
                    xerte += field;
                }
            });
        })
		
        return xerte;
    },

    jqGridAfterShowForm = function(id, ids, options)
    {
		var col_id = this.id;
		
        if (options.wysiwyg != 'false' && options.wysiwyg != undefined)
        {
            // destroy editor for all columns
            $('#' + ids[0].id + ' textarea').each(function(){
                if (CKEDITOR.instances[col_id]) {
                    try {
                        CKEDITOR.instances[col_id].destroy(true);
                    }
                    catch (e) {
                        CKEDITOR.remove(col_id);
                    }
                }
            });
        }
        else {
            if (CKEDITOR.instances[col_id]) {
                try {
                    CKEDITOR.instances[col_id].destroy(true);
                } catch (e) {
                    CKEDITOR.remove(col_id);
                }
            }
        }
		
        var ckoptions = {
            filebrowserBrowseUrl : 'editor/elfinder/browse.php?mode=cke&type=media&uploadDir='+rlopathvariable+'&uploadURL='+rlourlvariable.substr(0, rlourlvariable.length-1),
            filebrowserImageBrowseUrl : 'editor/elfinder/browse.php?mode=cke&type=image&uploadDir='+rlopathvariable+'&uploadURL='+rlourlvariable.substr(0, rlourlvariable.length-1),
            filebrowserFlashBrowseUrl : 'editor/elfinder/browse.php?mode=cke&type=flash&uploadDir='+rlopathvariable+'&uploadURL='+rlourlvariable.substr(0, rlourlvariable.length-1),
            uploadUrl : 'editor/uploadImage.php?mode=dragdrop&uploadPath='+rlopathvariable+'&uploadURL='+rlourlvariable.substr(0, rlourlvariable.length-1),
            mathJaxClass :  'mathjax',
            mathJaxLib :    'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_HTMLorMML-full',
            toolbarStartupExpanded : false,
            height : 150,
            resize_enabled: false
        };
		
		var defaultToolbar = [
			{ name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
			{ name: 'editing',     groups: [ 'spellchecker' ] },
			{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
			{ name: 'links' },
			{ name: 'styles' },
			{ name: 'colors' },
			{ name: 'insert' }
		];
		
		var fullToolbar = [
			{ name: 'document',	   groups: [ 'mode' ] },
			{ name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
			{ name: 'editing',     groups: [ 'spellchecker' ] },
			{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
			{ name: 'links' },
			{ name: 'styles' },
			{ name: 'colors' },
			{ name: 'insert' },
			{ name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align' ] }
		];
		
		// wysiwyg option can be true (defaultToolbar), full (fullToolbar) or false (off) - false is default of no wysiwyg property
		// can set different wysiwyg setting for each field by having list e.g. 'false,full,full' - otherwise all fields will have same setting
		var wysiwyg = options.wysiwyg != undefined ? options.wysiwyg.split(',') : 'false';
		
		$('#' + ids[0].id + ' textarea:visible, #' + ids[0].id + ' input:visible').each(function(i) {
			var col_id = this.id;
			
			if ((wysiwyg.length == 1 && i > 0 && wysiwyg[0] != 'false' && wysiwyg[0] != undefined) || wysiwyg[i] != 'false' && wysiwyg[i] != undefined) {
				// destroy editor for all columns
				var myCkOptions = ckoptions;
				
				myCkOptions.toolbarGroups = wysiwyg[i] == 'full' || (wysiwyg.length == 1 && i > 0 && wysiwyg[0] == 'full') ? fullToolbar : defaultToolbar;
				
				$(this).ckeditor(function () {
					// JQGrid
					// we need to get selected row in case currently we are in Edit Mode
					var grid = $('#' + id + '_jqgrid');
					var selID = grid.getGridParam('selrow'); // get selected row
					// I don't know how to get the current mode is, in Editing or Add new?
					// then let's find out if
					//navigational buttons are hidden for both of it and selID == null <– Add mode ^0^
					if (!($('a#pData').is(':hidden') || $('a#nData').is(':hidden') && selID == null)) { // then it must be edit?
						var va = grid.getRowData(selID);
						CKEDITOR.instances[col_id].setData(va[col_id]);
					}
				}, myCkOptions);
				
			} else if ($(this).is('textarea')) {
				$(this).ckeditor(function () {
					// JQGrid
					// we need to get selected row in case currently we are in Edit Mode
					var grid = $('#' + id + '_jqgrid');
					var selID = grid.getGridParam('selrow'); // get selected row
					// I don't know how to get the current mode is, in Editing or Add new?
					// then let's find out if
					//navigational buttons are hidden for both of it and selID == null <– Add mode ^0^
					if (!($('a#pData').is(':hidden') || $('a#nData').is(':hidden') && selID == null)) { // then it must be edit?
						var va = grid.getRowData(selID);
						CKEDITOR.instances[col_id].setData(va[col_id]);
					}
				}, ckoptions);
			}
			
		});
		
		// resize the dialog to make sure they fit on screen once ckeditor has loaded
		setTimeout(function(){
			var $dialog = $('#' + ids[0].id).parents('.ui-jqdialog'),
			$dialogContent = $('#' + ids[0].id);
			
			if ($dialog.height() > ($('body').height() * 0.8)) {
				var diff = $dialog.height() - $dialogContent.height();
				$dialog.height($('body').height() * 0.8);
				$dialogContent.height($dialog.height() - diff);
			}
		}, 0);
    },

    jqGridAfterCloseForm = function (id, selector, options)
    {
		var wysiwyg = options.wysiwyg != undefined ? options.wysiwyg.split(',') : 'false';
		
		$(selector + ' textarea, ' + selector + ' input').each(function(i) {
			var col_id = this.id;
			
			if ($(this).is('textarea')) {
				if ((wysiwyg.length == 1 && i > 0 && wysiwyg[0] != 'false' && wysiwyg[0] != undefined) || wysiwyg[i] != 'false' && wysiwyg[i] != undefined) {
					$(this).ckeditor(function () {
						if (CKEDITOR.instances[col_id])
						{
							try {
								CKEDITOR.instances[col_id].destroy(true);
							}
							catch (e) {
								CKEDITOR.remove(col_id);
							}
						}
					});
					
				} else {
					$(this).ckeditor(function () {
						try {
							CKEDITOR.instances[col_id].destroy(true);
						} catch (e) {
							CKEDITOR.remove(col_id);
						}
					});
				}
			}
		});
    },

    jqGridAfterclickPgButtons = function(id, whichbutton, formid, rowid)
    {
        var grid = $('#' + id + '_jqgrid');
        var va = grid.getRowData(rowid);
        CKEDITOR.instances.col_2.setData( va['col_2'] );
    },

    convertTextAreas = function ()
    {
        $.each(textareas_options, function (i, options) {
            var codemirroroptions = {

                // Set this to the theme you wish to use (codemirror themes)
                theme: 'default',

                // Whether or not you want to show line numbers
                lineNumbers: true,

                // Whether or not you want to use line wrapping
                lineWrapping: true,

                // Whether or not you want to highlight matching braces
                matchBrackets: true,

                // Whether or not you want tags to automatically close themselves
                autoCloseTags: true,

                // Whether or not you want Brackets to automatically close themselves
                autoCloseBrackets: true,

                // Whether or not to enable search tools, CTRL+F (Find), CTRL+SHIFT+F (Replace), CTRL+SHIFT+R (Replace All), CTRL+G (Find Next), CTRL+SHIFT+G (Find Previous)
                enableSearchTools: true,

                // Whether or not you wish to enable code folding (requires 'lineNumbers' to be set to 'true')
                enableCodeFolding: true,

                // Whether or not to enable code formatting
                enableCodeFormatting: true,

                // Whether or not to automatically format code should be done when the editor is loaded
                autoFormatOnStart: true,

                // Whether or not to automatically format code should be done every time the source view is opened
                autoFormatOnModeChange: true,

                // Whether or not to automatically format code which has just been uncommented
                autoFormatOnUncomment: true,

                // Whether or not to highlight the currently active line
                highlightActiveLine: true,

                // Define the language specific mode 'htmlmixed' for html including (css, xml, javascript), 'application/x-httpd-php' for php mode including html, or 'text/javascript' for using java script only
                mode: 'htmlmixed',

                // Whether or not to show the search Code button on the toolbar
                showSearchButton: true,

                // Whether or not to show Trailing Spaces
                showTrailingSpace: true,

                // Whether or not to highlight all matches of current word/selection
                highlightMatches: true,

                // Whether or not to show the format button on the toolbar
                showFormatButton: true,

                // Whether or not to show the comment button on the toolbar
                showCommentButton: true,

                // Whether or not to show the uncomment button on the toolbar
                showUncommentButton: true,

                // Whether or not to show the showAutoCompleteButton button on the toolbar
                showAutoCompleteButton: true

            };
            var ckoptions = {
                filebrowserBrowseUrl : 'editor/elfinder/browse.php?mode=cke&type=media&uploadDir='+rlopathvariable+'&uploadURL='+rlourlvariable.substr(0, rlourlvariable.length-1),
                filebrowserImageBrowseUrl : 'editor/elfinder/browse.php?mode=cke&type=image&uploadDir='+rlopathvariable+'&uploadURL='+rlourlvariable.substr(0, rlourlvariable.length-1),
                filebrowserFlashBrowseUrl : 'editor/elfinder/browse.php?mode=cke&type=flash&uploadDir='+rlopathvariable+'&uploadURL='+rlourlvariable.substr(0, rlourlvariable.length-1),
                uploadUrl : 'editor/uploadImage.php?mode=dragdrop&uploadPath='+rlopathvariable+'&uploadURL='+rlourlvariable.substr(0, rlourlvariable.length-1),
                mathJaxClass :  'mathjax',
                mathJaxLib :    'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_HTMLorMML-full',
                toolbarStartupExpanded : defaultToolBar,
                codemirror : codemirroroptions,
                extraAllowedContent: 'style',
                language : language.$code.substr(0,2)
            };

            if (options.options.height)
            {
                var height = parseInt(options.options.height) + 20;
                ckoptions['height'] = height;
            }
            if (options.options.type == 'html')
            {
                // enable source mode of ckeditor
                ckoptions['startupMode'] = 'source';
            }
            if (options.options.type != 'script')
            {
                var ckeditorcontents = $('#'+options.id).data('afterckeditor');
                $('#'+options.id).ckeditor(function(){
                		var self = this;

                    if (ckeditorcontents) this.setData(ckeditorcontents);

                    // Editor is ready, attach change event
                    this.on('change', function(){
                        inputChanged(options.id, options.key, options.name, self.getData(), self);
                    });
										this.on('fileUploadResponse', function(e) {
											/*self.on('NO-EVENT-WORKS-HERE', function(e) {
												e.removeListener();
												inputChanged(options.id, options.key, options.name, self.getData(), self);	
											});*/
											setTimeout(function () {
														self.fire('change');
													}, 1500);
										});
                }, ckoptions);
            }
            else
            {
                // Start a codemirror window (without WYSIWYG)
                codemirroroptions['mode'] = "javascript";
                var textArea = document.getElementById(options.id);
                var codemirror = CodeMirror.fromTextArea(textArea, codemirroroptions);
                codemirror.on("change", function(){
                    inputChanged(options.id, options.key, options.name, codemirror.getValue(), codemirror);
                });
                if (options.options.height)
                {
                    var height = parseInt(options.options.height) + 20;
                    codemirror.setSize(null,height);
                }
                $('.CodeMirror').resizable({
                    resize: function() {
                        codemirror.setSize($(this).width(), $(this).height());
                        codemirror.refresh();
                    }
                });
            }
        });
    },


    // Clean up the text - must be a better way of doing this
    stripP = function (val) {
        if (val.indexOf('<p>') == 0)
        {
            var strippedValue = val.substr(3);
            if (strippedValue.lastIndexOf('</p>') != strippedValue.length - 4)
            {
                // Strip extra newline
                strippedValue = strippedValue.substr(0, strippedValue.length-5);
            }
            else
            {
                strippedValue = strippedValue.substr(0, strippedValue.length-4);
            }
            return strippedValue.trim();
        }
        else
        {
            return val;
        }
    },
    
    convertTextInputs = function () {
        $.each(textinputs_options, function (i, options) {
            if (options) {
                $('#'+options.id).ckeditor(function(){
                    // Editor is ready, attach onchange event
                    this.on('change', function(){
                        var thisValue = this.getData();
                        thisValue = thisValue.substr(0, thisValue.length-1); // Remove the extra linebreak
                        inputChanged(options.id, options.key, options.name, thisValue, this);
                    });
                    var lastValue = "";
                    this.on('change', function(event) {
                        if (options.name == 'name') {
                            var thisValue = this.getData();
                            var thisText = getTextFromHTML(thisValue);
                            thisValue = stripP(thisValue.substr(0, thisValue.length-1));
                            if (lastValue != thisValue) {
                                lastValue = thisValue;

                                changeNodeStatus(options.key, "text", true, thisText);
                                //var tree = $.jstree.reference("#treeview");
                                //var node = tree.get_node(options.key, false);
                                //var parent_id = tree.get_parent(node);

								//if (options.key != "treeroot") {

								//    $("#" + options.key + "_text").html(thisText);
								//}

                                // Rename the node
                                //tree.rename_node(node, thisText);

                                if ($('#mainleveltitle'))
                                {
                                    $('#mainleveltitle').html(thisText);
                                }
                            }
                        }
                    });
                    // Fix for known issue in webkit browsers that change contenteditable when an outer div is hidden
                    this.on('focus', function () {
                        this.setReadOnly(false);
                    });
                }, { toolbar:
                    [
                        [ 'Font', 'FontSize', 'TextColor', 'BGColor' ],
                        [ 'Bold', 'Italic', 'Underline', 'Superscript', 'Subscript', 'rubytext' ],
                        [ 'Sourcedialog' ],
                        [ 'FontAwesome']
                    ],
                    filebrowserBrowseUrl : 'editor/elfinder/browse.php?mode=cke&type=media&uploadDir='+rlopathvariable+'&uploadURL='+rlourlvariable.substr(0, rlourlvariable.length-1),
                    filebrowserImageBrowseUrl : 'editor/elfinder/browse.php?mode=cke&type=image&uploadDir='+rlopathvariable+'&uploadURL='+rlourlvariable.substr(0, rlourlvariable.length-1),
                    filebrowserFlashBrowseUrl : 'editor/elfinder/browse.php?mode=cke&type=flash&uploadDir='+rlopathvariable+'&uploadURL='+rlourlvariable.substr(0, rlourlvariable.length-1),
                    uploadUrl : 'editor/uploadImage.php?mode=dragdrop&uploadPath='+rlopathvariable+'&uploadURL='+rlourlvariable.substr(0, rlourlvariable.length-1),
                    mathJaxClass :  'mathjax',
                    mathJaxLib :    'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_HTMLorMML-full',
                    extraPlugins : 'sourcedialog,image3,fontawesome,rubytext',
                    language : language.$code.substr(0,2)
                });
            }
        });
    },

    hideInlineEditor = function()
    {
        var newScrollTop = $('#content').scrollTop();
        var delta = newScrollTop - scrollTop;
        scrollTop = newScrollTop;
        for(var i=0; i<textinputs_options.length; i++)
        {

            var textinput = textinputs_options[i];
            $('#' + textinput.id).change();
            if ($('#cke_' + textinput.id).is(':visible'))
            {
                $('#cke_' + textinput.id).hide();
            }
        }
    },

    convertColorPickers = function ()
    {
        $.each(colorpickers, function (i, options){
			var myPicker = new jscolor.color(document.getElementById(options.id), {'required':false});
			
			if (options.value != undefined) {
				myPicker.fromString(Array(7-options.value.length).join('0') + options.value);
			}
        });
    },

    convertDataGrids = function ()
    {
        // Set up a jqGrid for local editing. This is not that trivial, because jqGrid is all setup to
        // send the data back to the server automatically.
        // cf. the source of http://www.ok-soft-gmbh.com/jqGrid/LocalFormEditing.htm as an excellent example
        jqGridsLastSel = {};
        jqGridsColSel = {};
		
        $.each(datagrids, function(i, options){
			
			var thisGrid = this;
			// Get the data for this grid
            var data = lo_data[options.key].attributes[options.name];
            var rows = [];

            $.each(data.split('||'), function(j, row){
                var records = row.split('|');
                var record = {};
                record['col_0'] = j+1;
                $.each(records, function(k, field)
                {
                    var colnr = k+1;
                    record['col_' + colnr] = field;
                });
                rows.push(record);
            });
			
            var gridoptions = options.options;
            var key = options.key;
			var id = options.id;
			var gridId = key + '_' + id; // uses this to store data against now instead of just key so that multiple grids on wizard work correctly
			
			jqGridsLastSel[gridId] = -1;
            jqGridsColSel[gridId] = -1;
            jqGrGridData[gridId] = rows;
			
            var name = options.name;
            var nrCols = gridoptions.columns;
            var addCols = false;
            // If the nr of Columns is dynamic, get the nrCols from the data
            if (gridoptions.addCols && gridoptions.addCols === 'true')
            {
                addCols = true;
                var rs = data.split('||');
                var cs = rs[0].split('|');
                nrCols = cs.length;
            }
            var headers = [];
            var showHeaders = false;
            if (gridoptions.headers)
            {
                showHeaders = (gridoptions.showHeaderRow !== undefined ? gridoptions.showHeaderRow : true);
                headers = gridoptions.headers.split(',');
                headers.unshift('#');
            }
            if (!showHeaders)
            {
                headers.push('#');
                for(var i=0; i<nrCols; i++)
                {
                    headers.push((i+1) + '');
                }
            }
            nrCols++;

            var editable;
            if (gridoptions.editable)
            {
                editable = gridoptions.editable.split(',');
            }
            var colWidths = [];
            if (gridoptions.colWidths)
            {
                colWidths = gridoptions.colWidths.split(',');
            }

            // set up the jqGrid column model
            // Add unique hidden column as key for records
            var colModel  = [];
            var col = {};
            col['name'] = 'col_0'
            col['key'] = true;
            col['editable'] = false;
            col['sortable'] = false;
            col['hidden'] = true;
            col['editrules'] = {
                required:true,
                edithidden:true
            };
            col['editoptions'] = {
                dataInit: function(element){
                    $(element).attr("readonly", "readonly");
                }
            };
            colModel.push(col);
			
			var wysiwygOn = false;

            for (var i=0; i<nrCols-1; i++)
            {
                var col = {};
                col['name'] = 'col_' + (i+1);
                if (addCols)
                {
                    col['width'] = Math.round(parseInt(gridoptions.width) / nrCols);
                }
                else
                {
                    col['width'] = (colWidths[i] ? colWidths[i] : Math.round(parseInt(gridoptions.width) / nrCols));
                }
                col['editable'] = (editable[i] !== undefined ? (editable[i] == "1" ? true : false) : true);
                col['sortable'] = false;
				
				if (gridoptions.wysiwyg != undefined) {
					var wysiwyg = gridoptions.wysiwyg.split(',');
					if ((wysiwyg.length == 1 && i > 0 && wysiwyg[0] != 'false' && wysiwyg[0] != undefined) || wysiwyg[i] != 'false' && wysiwyg[i] != undefined) {
						col['edittype'] = 'textarea';
						col['editoptions'] = {rows:"6",cols:"40"};
						col['editrules'] = {edithidden:true};
						wysiwygOn = true;
					}
				}
				
                colModel.push(col);
            }
			
            var editSettings,
                addSettings,
                delSettings;
			
			editSettings = {
				top: 50,
				left: 300,
				//height: 550,
				width:700,
				resize: true,
				//dataheight: 450,
				jqModal:true,
				reloadAfterSubmit:false,
				closeOnEscape:true,
				savekey: [true,13],
				closeAfterEdit:true,
				onclickSubmit: function(options, postdata){
					return onclickJqGridSubmitLocal(id, key, name, options, postdata);
				}
			};
			
			addSettings = {
				top: 50,
				left: 300,
				//height: 550,
				width:700,
				//dataheight: 450,
				jqModal:true,
				reloadAfterSubmit:false,
				savekey: [true,13],
				closeOnEscape:true,
				closeAfterAdd:true,
				onclickSubmit:function(options, postdata){
					return onclickJqGridSubmitLocal(id, key, name, options, postdata);
				}
			}
			
			delSettings = {
				// because I use "local" data I don't want to send the changes to the server
                // so I use "processing:true" setting and delete the row manually in onclickSubmit
				top: 50,
				left: 300,
                onclickSubmit: function(options, rowid) {
					var grid_id = $.jgrid.jqID(grid[0].id),
                        grid_p = grid[0].p,
                        newPage = grid[0].p.page;
					
					// reset the value of processing option which could be modified
					options.processing = true;
					
                    // delete the row
                    grid.delRowData(rowid);
					
					// rename row ids so the next row that's deleted will be treated correctly
					checkRowIds(grid);
					
					$.jgrid.hideModal("#delmod" + grid_id, { gb: "#gbox_"+grid_id, jqm: true, onClose:options.onClose });
					
					// on the multipage grid reload the grid
                    if (grid_p.lastpage > 1) {
                        if (grid_p.reccount === 0 && newPage === grid_p.lastpage) {
                            // if after deleting there are no rows on the current page
                            // which is the last page of the grid
                            newPage--; // go to the previous page
                        }
                        // reload grid to make the row from the next page visable.
                        grid.trigger("reloadGrid", [{ page: newPage }]);
                    }
					
					delRow(id, key, name, rowid);
					return true;
                },
                processing:true
            };
			
			// one or more of the fields being edited has wysiwyg turned on
            if (wysiwygOn == true) {
				editSettings.afterclickPgButtons = function (whichbutton, formid, rowid) {
					jqGridAfterclickPgButtons(id, whichbutton, formid, rowid);
				}
				
				editSettings.afterShowForm = function(ids) {
					jqGridAfterShowForm(id, ids, gridoptions);
				}
				
				editSettings.onClose = function (selector) {
					jqGridAfterCloseForm(id, selector, gridoptions);
				}
				
				addSettings.afterShowForm = function(ids) {
					jqGridAfterShowForm(id, ids, gridoptions);
				}
				
				addSettings.onClose = function (selector) {
					jqGridAfterCloseForm(id, selector, gridoptions);
				}
            }
			
            // Setup the grid
            var grid = $('#' + id + '_jqgrid');

            grid.jqGrid({
                datatype: 'local',
                data: rows,
                height: "100%",
				autowidth: true,
                colNames: headers,
                colModel: colModel,
                rowNum: 10,
                rowList: [5,10,15,20,30],
                viewrecords: true,
                pager: '#' + id + '_nav',
                editurl: 'editor/js/vendor/jqgrid/jqgrid_dummy.php',
                rownumbers:true,
                gridview:true,
                ondblClickRow: function(rowid, ri, ci) {
                    var p = grid[0].p;
                    if (p.selrow !== rowid) {
                        // prevent the row from be unselected on double-click
                        // the implementation is for "multiselect:false" which we use,
                        // but one can easy modify the code for "multiselect:true"
                        grid.jqGrid('setSelection', rowid);
                    }
                    grid.jqGrid('editGridRow', rowid, editSettings);
                },
                onSelectRow: function(id, status, event) {
                    if (id && id !== jqGridsLastSel[gridId]) {
                        // cancel editing of the previous selected row if it was in editing state.
                        // jqGrid hold intern savedRow array inside of jqGrid object,
                        // so it is safe to call restoreRow method with any id parameter
                        // if jqGrid not in editing state
                        if (jqGridsLastSel[gridId] !== -1) {
                            grid.jqGrid('restoreRow',jqGridsLastSel[gridId]);
                        }
                        jqGridsLastSel[gridId] = id;
                    }
                },
                onCellSelect: function(iRow, iCol, content, event) {
					// enable / disable delete column button
                    var delbutton = $('#' + id + '_delcol');
                    delbutton.html("");
                    if (iCol > 0) {
                        jqGridsColSel[gridId] = iCol - 1;
                    	delbutton.append($('<i>').addClass('fa').addClass('fa-trash').addClass('xerte-icon').height(14))
                        	.append(language.btnDelColumn.$label + ' ' + jqGridsColSel[gridId]);
						
                    	delbutton.switchClass('disabled', 'enabled');
                    	delbutton.prop('disabled', false);
                    }
                    else {
                    	delbutton.append($('<i>').addClass('fa').addClass('fa-trash').addClass('xerte-icon').height(14))
                        	.append(language.btnDelColumn.$label);
						
                    	delbutton.switchClass('enabled', 'disabled');
                    	delbutton.prop('disabled', true);
                    }
                }
            });
			
            grid.jqGrid('navGrid', '#' + id + '_nav', {refresh: false}, editSettings, addSettings, delSettings, {multipleSearch:true, overlay:false});
			
			// add the buttons to add / delete columns if required
            if (addCols) {
                buttons = $('#' + id + '_addcolumns');
				
                $([
                    {name: language.btnAddColumn.$label, tooltip: language.btnAddColumn.$tooltip, icon:'fa-plus-circle', disabled: false, id: id + '_addcol', click:addColumn},
                    {name: language.btnDelColumn.$label, tooltip: language.btnDelColumn.$tooltip, icon:'fa-trash', disabled: true, id: id + '_delcol', click:delColumn}
                ])
                .each(function(index, value) {
                    var button = $('<button>')
                        .attr('id', value.id)
                        .attr('title', value.tooltip)
                        .addClass("xerte_button")
                        .prop('disabled', value.disabled)
                        .addClass(value.disabled ? 'disabled' : 'enabled')
                        .click({ id: id, key: key, name: name }, function(evt){
                            var par = evt.data;
                            value.click(par.id, par.key, par.name, jqGridsColSel[gridId]);
                        })
                        .append($('<i>').addClass('fa').addClass(value.icon).addClass('xerte-icon').height(14))
                        .append(value.name);
					
                    buttons.append(button);
                });
				
                buttons.append($('<br>'));
            }
			
			// can't get jqGrid to be automatically responsive so listens to window resize to manually resize the grids
			if (jqGridSetUp != true) {
				$(window).resize(function() {
					if (this.resizeTo) {
						clearTimeout(this.resizeTo);
					}
					this.resizeTo = setTimeout(function() {
						$(this).trigger("resizeEnd");
					}, 200)
				});
				
				$(window).on("resizeEnd", function() {
					$("#mainPanel .ui-jqgrid").hide();
					var newWidth = $("#mainPanel .ui-jqgrid").parent().width();
					$("#mainPanel .ui-jqgrid").show();
					$("#mainPanel .ui-jqgrid table").jqGrid("setGridWidth", newWidth, true);
				});
				
				jqGridSetUp == true;
			}
        });
    },
	
	checkRowIds = function (grid) {
		var rows = grid.find('tr.jqgrow, tr.jqgfirstrow');
		for (var i=0; i<rows.length; i++) {
			var row = $(rows[i]);
			if (!row.hasClass('jqgfirstrow')) {
				if (Number(row.attr('id')) != i) {
					row.attr('id', String(i));
				}
			}
		}
	},
					

    setAttributeValue = function (key, names, values)
    {
        // Get the node name
        if (names[0] == "hidePage") {
            changeNodeStatus(key, "hidden", values[0] == "true");
            /*
            var hiddenIcon = $("#" + key + "_hidden");
            if (hiddenIcon) {
                if (values[0] == "true") {
                    hiddenIcon.switchClass('iconDisabled', 'iconEnabled');
                    $("#" + key).addClass("hiddenNode");
                    //$("#" + key + " .jstree-anchor").each(function (i, v) {
                    //   $(v).contents().eq($(v).contents().length - 1).wrap('<span class="hidden"/>');
                    //});
                }
                else {
                    hiddenIcon.switchClass('iconEnabled', 'iconDisabled');
                    $("#" + key).removeClass("hiddenNode");
                    //$("#" + key + " .hidden").contents().unwrap();
                }
            }
            */
        }

        if (names[0] == "unmarkForCompletion") {
            changeNodeStatus(key, "unmark", values[0] == "true");
            /*
            var unmarkIcon = $("#" + key + "_unmark");
            if (unmarkIcon) {
                if (values[0] == "true") {
                    unmarkIcon.switchClass('iconDisabled', 'iconEnabled');
                    $("#" + key).addClass("unmarkNode");
                } else {
                    unmarkIcon.switchClass('iconEnabled', 'iconDisabled');
                    $("#" + key).removeClass("unmarkNode");
                }
            }
            */
        }

        var node_name = lo_data[key]['attributes'].nodeName;

        var node_options = wizard_data[node_name].node_options;

        $.each(names, function(i, name){
            //console.log("Setting sub attribute " + key + ", " + name + ": " + values[i]);
            if (node_options['cdata'] && node_options['cdata_name'] == name)
            {
                lo_data[key]['data'] = values[i];
            }
            else
            {
                lo_data[key]['attributes'][name] = values[i];
            }

        });
    },


    cbChanged = function (id, key, name, value, obj)
    {
        //console.log(id + ': ' + key + ', ' +  name);
        // The current xml expectes 'true' and/or 'false'
        var value = $('#' + id).prop('checked');
        if (value)
        {
            value = 'true';
        }
        else
        {
            value = 'false';
        }
        setAttributeValue(key, [name], [value]);
    },

    changeLanguage = function(id, key, name, value, obj)
    {
        if (value == language.$code)
        {
            // The same language is chosen as the selected XOT language
            // Do we want to replace all the language options with the default
            // This way a user that inadvertantly (or previously) created an LO in English can switch to Dutch
            // Ask confirmation (for now not implemented)
            // So loop over all the pages and replace the language options with their defaults
            if (confirm(language.Alert.changeLanguage.prompt + " " + language.$name + " (" + language.$code + ")")) {
                $.each(lo_data, function (key, page) {
                    var attributes = page['attributes'];

                    // Get the node name
                    var node_name = attributes.nodeName;

                    var node_options = wizard_data[node_name].node_options;

                    if (node_options.language.length) {
                        // There are options to set. get parent, because the parent holds the default values of the language options
                        var tree = $.jstree.reference("#treeview");
                        var p_node_name;
                        var p_attributes;

                        var current_node = tree.get_node(key, false);
                        var id = tree.get_parent(current_node);

                        p_attributes = lo_data[id]['attributes'];
                        // Get the node name
                        p_node_name = p_attributes.nodeName;

                        // Get the default node
                        // Search in array newnodes for node_name
                        i = $.inArray(node_name, wizard_data[p_node_name].new_nodes);
                        if (i>=0) {
                            node_xml = wizard_data[p_node_name].new_nodes_defaults[i];
                            if (node_xml != "undefined") {

                                // Parse XML
                                var x2js = new X2JS({
                                    // XML attributes. Default is "_"
                                    attributePrefix: "$"
                                });
                                var defaults = x2js.xml_str2json(node_xml)[node_name];

                                $.each(node_options.language, function (index, lang_attr) {
                                    // search
                                    if (typeof defaults['$' + lang_attr.name] !== 'undefined') {
                                        setAttributeValue(key, [lang_attr.name], [defaults['$' + lang_attr.name]])
                                    }
                                });
                            }
                        }

                    }


                });
            }

        }
        setAttributeValue(key, [name], [value]);
    },

    themeChanged = function(id, key, name, value, obj)
    {
        // Set preview and description
        var theme = theme_list[value];
        $('img.theme_preview:first')
			.attr({
				'src': theme.preview,
				'alt': obj[value].label
			});
        var description = $("<div>" + theme.description + "</div><div class='theme_url_param'>" + language.ThemeUrlParam + " " + theme.name + "</div>");
        $('div.theme_description:first').html(description);
        setAttributeValue(key, [name], [theme.name]);
    },

    selectChanged = function (id, key, name, value, obj)
    {
        setAttributeValue(key, [name], [value]);
    },
	
	catListChanged = function (id, key, name, $parentDiv, obj)
	{
		var checked = $parentDiv.data('checked');
		if ($(obj).prop('checked') == true && $.inArray(obj.id.substring(4), checked) == -1) {
			checked.push(obj.id.substring(4));
		} else if ($.inArray(obj.id.substring(4), checked) > -1) {
			checked.splice($.inArray(obj.id.substring(4), checked), 1);
		}
		$parentDiv.data('checked', checked);
		
		setAttributeValue(key, [name], [checked.toString()]);
	},

    inputChanged = function (id, key, name, value, obj)
    {
        console.log('inputChanged : ' + id + ': ' + key + ', ' +  name  + ', ' +  value);
        var actvalue = value;

        if (id.indexOf('textinput') >= 0 || id.indexOf('media') >=0)
        {
            actvalue = value;
            actvalue = stripP(actvalue);
        }
        if (id.indexOf('color')>=0)
        {
            if (actvalue.indexOf('#') == 0)
                actvalue = actvalue.substr(1);
            actvalue = '0x' + actvalue;
        }
        if (actvalue.indexOf('FileLocation +') >=0)
        {
            // Make sure the &#39; is translated to a '
            console.log("Convert " + actvalue);
            actvalue = $('<textarea/>').html(actvalue).val();
            console.log("    ..to " + actvalue);
        }
        setAttributeValue(key, [name], [actvalue]);
    },

    courseChanged = function (id, key, name, form_id, value, obj)
    {
        //console.log('inputChanged : ' + id + ': ' + key + ', ' +  name  + ', ' +  value);
        var actvalue = value;

        if (actvalue == language.course.FreeText.$label)
        {
            // Enable free text input box
            $("#" + id).css("width", "50%");
            $("#course_freetext_" + form_id).show();
            actvalue = $("#course_freetext_" + form_id).val();
            actvalue = stripP(actvalue);
        }
        else
        {
            $("#course_freetext_" + form_id).hide();
            $("#" + id).css("width", "");
        }

        var sel = $("#" + id + ".deprecated");
        if (sel.length > 0) {
            if (sel[0].selectedIndex == sel[0].length - 1) {
                sel.addClass("deprecated_option_selected");
            }
            else {
                sel.removeClass("deprecated_option_selected");
            }
        }
        setAttributeValue(key, [name], [actvalue]);
    },

    courseFreeTextChanged = function (id, key, name, form_id, value, obj)
    {
        //console.log('inputChanged : ' + id + ': ' + key + ', ' +  name  + ', ' +  value);
        var actvalue = value;

        if (id.indexOf('textinput') >= 0 || id.indexOf('media') >=0)
        {
            actvalue = value;
            actvalue = stripP(actvalue);
        }
        if (id.indexOf('color')>=0)
        {
            if (actvalue.indexOf('#') == 0)
                actvalue = actvalue.substr(1);
            actvalue = '0x' + actvalue;
        }
        if (actvalue.indexOf('FileLocation +') >=0)
        {
            // Make sure the &#39; is translated to a '
            console.log("Convert " + actvalue);
            actvalue = $('<textarea/>').html(actvalue).val();
            console.log("    ..to " + actvalue);
        }
        setAttributeValue(key, [name], [actvalue]);
    },

    browseFile = function (id, key, name, value, obj)
    {
        //console.log('Browse file: ' + id + ': ' + key + ', ' +  name  + ', ' +  value);

        window.elFinder = {};
        window.elFinder.callBack = function(file) {
            // Actions with url parameter here
            var url = decodeURIComponent(file.url);
            //console.log('Browse file: url=' + url);
            pos = url.indexOf(rlourlvariable);
            if (pos >=0)
                url = "FileLocation + '" + url.substr(rlourlvariable.length + 1) + "'";
            $('#' + id).attr("value", url);
            setAttributeValue(key, [name], [url]);
            window.elFinder = null;
        };
        window.open('editor/elfinder/browse.php?type=media&lang=' + languagecodevariable.substr(0,2) + '&uploadDir='+rlopathvariable+'&uploadURL='+rlourlvariable, 'Browse file', "height=600, width=800");
    },
	
	previewFile = function(alt, src, title)
	{
		// ** currently only previews images - need to allow other file types too
		src = src.indexOf("FileLocation + '") == 0 ? rlourlvariable + src.substring(("FileLocation + '").length, src.length - 1) : src;
		
		var $previewImg = $('<img class="previewFile"/>')
				.on("error", function() {
						$('.featherlight .previewFile')
							.after('<p>' + language.compPreview.$error + '</p>')
							.remove();
					})
				.attr({
					"src": src,
					"alt": alt
				})
		
		var $preview = $('<div/>')
				.append($previewImg);
		
		if (title != undefined && title != '') {
			$preview.prepend('<div class="preview_title">' + title + '</div>');
		}
		
		$.featherlight($preview);
	},

    makeAbsolute = function(html){
        var temp = html;
        var pos = temp.indexOf('FileLocation + \'');
        while (pos >= 0)
        {
            var pos2 = temp.substr(pos+16).indexOf("'") + pos;
            if (pos2>=0)
            {
                temp = temp.substr(0, pos) + rlourlvariable + temp.substr(pos + 16, pos2-pos) + temp.substr(pos2+17);
            }
            pos = temp.indexOf('FileLocation + \'');
        }
        return temp;
    },

    editDrawing = function(id, key, name, value){
        console.log('Edit drawing: ' + id + ': ' + key + ', ' +  name);
        window.XOT = {};
        window.XOT.callBack = function(key, name, xmldata) {
            // Actions with url parameter here
            console.log('Save drawing file: ' + key + ', ' + name);
            setAttributeValue(key, [name], [xmldata]);
            // Refresh form, otherwise the value passed by the Edit button to the drawingEditor when the button is paused again
            parent.tree.showNodeData(key);
        };
        window.XOT.close = function()
        {
            window.XOT = null;
        };
        // Make a form with hidden fields we want to post
        var drawingForm = $('<form>')
            .attr('id', 'form_'+ key)
            .attr('target', 'Drawing Editor')
            .attr('method', 'POST')
            .attr('action', 'drawingjs.php');

        var input = $('<input>')
            .attr('type', 'hidden')
            .attr('name', 'rlofile')
            .attr('value', rlopathvariable.substr(rlopathvariable.indexOf("USER-FILES")));

        drawingForm.append(input);

        input = $('<input>')
            .attr('type', 'hidden')
            .attr('name', 'data')
            .attr('value', value);
        drawingForm.append(input);

        input = $('<input>')
            .attr('type', 'hidden')
            .attr('name', 'key')
            .attr('value', key);
        drawingForm.append(input);

        input = $('<input>')
            .attr('type', 'hidden')
            .attr('name', 'name')
            .attr('value', name);

        drawingForm.append(input);

        // Add the form to body
        $('body').append(drawingForm);

        var de = window.open('', 'Drawing Editor', "height=710, width=800");

        if (de)
        {
            drawingForm.submit();
        }
        else
        {
            alert("You must allow popups for the drawing editor to work!");
        }
        $('#' + 'form_'+ key).remove();
    },

    /**
     * getPagelist in an array. the array has contains arrays of length 2, the first element is the name (or label
     * the second element is the value
     *
     * This is the format that ckEditor dialog expects for se;ect lists
     * We use the same format in the displayDataType for the pagelist type.
     *
     * Also make sure we only take the text from the name, and not the full HTML
     */
	getPageList = function()
	{
		
		var tree = $.jstree.reference("#treeview");
		var lo_node = tree.get_node("treeroot", false);
		var pages=[];
		
		if (moduleurlvariable == "modules/xerte/" || moduleurlvariable == "modules/site/") {
			pages = [
								[language.XotLinkRelativePages.firstpage,'[first]'],
								[language.XotLinkRelativePages.lastpage,'[last]'],
								[language.XotLinkRelativePages.prevpage,'[previous]'],
								[language.XotLinkRelativePages.nextpage,'[next]']
							];
						$.each(lo_node.children, function(i, key){
								var name = getAttributeValue(lo_data[key]['attributes'], 'name', [], key);
								var pageID = getAttributeValue(lo_data[key]['attributes'], 'pageID', [], key);
								var linkID = getAttributeValue(lo_data[key]['attributes'], 'linkID', [], key);
								var hidden = lo_data[key]['attributes'].hidePage;
								
								if ((pageID.found && pageID.value != "") || (linkID.found && linkID.value != ""))
								{
										var page = [];
										// Also make sure we only take the text from the name, and not the full HTML
										page.push((hidden == 'true' ? '-- ' + language.hidePage.$title + ' -- ' : '') + getTextFromHTML(name.value));
										page.push(pageID.found ? pageID.value : linkID.value);
										pages.push(page);

										// Now we do the children (if deeplinking is allowed)
										if (wizard_data[getAttributeValue(lo_data[key]['attributes'], 'nodeName', [], key).value].menu_options.deepLink == "true") {
											var childNode = tree.get_node(key, false);
											$.each(childNode.children, function(i, key){
												var name = getAttributeValue(lo_data[key]['attributes'], 'name', [], key);
												var pageID = getAttributeValue(lo_data[key]['attributes'], 'pageID', [], key);
												var linkID = getAttributeValue(lo_data[key]['attributes'], 'linkID', [], key);
												if ((pageID.found && pageID.value != "") || (linkID.found && linkID.value != ""))
												{
													var page = [];
													// Also make sure we only take the text from the name, and not the full HTML
													page.push(getTextFromHTML("&nbsp;- "+name.value));
													page.push(pageID.found ? pageID.value : linkID.value);
													pages.push(page);
												}
											});
										}
								}
						});
					}
		
		return pages;
	},

    /**
     * function to convert \n chracters to <BR>
     * This is needed because Flash editor was a text editor, not an HTML editor
     * This is replica of the function used in Xenith.js (ref. x_addLineBreaks).
     */
	addLineBreaks = function(text) {
		// First test for new editor - Only applicable for Xenith.js
		//if (x_params && x_params.editorVersion && parseInt("0" + x_params.editorVersion, 10) >= 3)
		//{
		//	return text; // Return text unchanged
		//}

		// Now try to identify v3beta created LOs
		if ((text.trim().indexOf("<p") == 0 || text.trim().indexOf("<h") == 0) && (text.trim().lastIndexOf("</p") == text.trim().length-4 || text.trim().lastIndexOf("</h") == text.trim().length-5))
		{
			return text; // Return text unchanged
		}

		// Now assume it's v2.1 or before
		if (text.indexOf("<math") == -1 && text.indexOf("<table") == -1)
		{
			return text.replace(/(\n|\r|\r\n)/g, "<br />");
		}
		else { // ignore any line breaks inside these tags as they don't work correctly with <br>
			var newText = text;
			if (newText.indexOf("<math") != -1) { // math tag found
				var tempText = "",
					mathNum = 0;

				while (newText.indexOf("<math", mathNum) != -1) {
					var text1 = newText.substring(mathNum, newText.indexOf("<math", mathNum)),
						tableNum = 0;
					while (text1.indexOf("<table", tableNum) != -1 && newText.indexOf("</table", tableNum) != -1) { // check for table tags before/between math tags
						tempText += text1.substring(tableNum, text1.indexOf("<table", tableNum)).replace(/(\n|\r|\r\n)/g, "<br />");
						tempText += text1.substring(text1.indexOf("<table", tableNum), text1.indexOf("</table>", tableNum) + 8);
						tableNum = text1.indexOf("</table>", tableNum) + 8;
					}
					tempText += text1.substring(tableNum).replace(/(\n|\r|\r\n)/g, "<br />");
					tempText += newText.substring(newText.indexOf("<math", mathNum), newText.indexOf("</math>", mathNum) + 7);
					mathNum = newText.indexOf("</math>", mathNum) + 7;
				}

				var text2 = newText.substring(mathNum),
					tableNum = 0;
				while (text2.indexOf("<table", tableNum) != -1 && newText.indexOf("</table", tableNum) != -1) { // check for table tags after math tags
					tempText += text2.substring(tableNum, text2.indexOf("<table", tableNum)).replace(/(\n|\r|\r\n)/g, "<br />");
					tempText += text2.substring(text2.indexOf("<table", tableNum), text2.indexOf("</table>", tableNum) + 8);
					tableNum = text2.indexOf("</table>", tableNum) + 8;
				}
				tempText += text2.substring(tableNum).replace(/(\n|\r|\r\n)/g, "<br />");
				newText = tempText;

			} else if (newText.indexOf("<table") != -1) { // no math tags - so just check table tags
				var tempText = "",
					tableNum = 0;
				
				while (newText.indexOf("<table", tableNum) != -1 && newText.indexOf("</table", tableNum) != -1) {
					tempText += newText.substring(tableNum, newText.indexOf("<table", tableNum)).replace(/(\n|\r|\r\n)/g, "<br />");
					tempText += newText.substring(newText.indexOf("<table", tableNum), newText.indexOf("</table>", tableNum) + 8);
					tableNum = newText.indexOf("</table>", tableNum) + 8;
				}
				tempText += newText.substring(tableNum).replace(/(\n|\r|\r\n)/g, "<br />");
				newText = tempText;
			}

			return newText;
		}
	},

    baseUrl = function()
    {
        var pathname = window.location.href;
        var newPathname = pathname.split("/");
        var urlPath = "";
        for (var i = 0; i < newPathname.length -1; i++ )
        {
            urlPath += newPathname[i] + "/";
        }
        if (newPathname[0] != "http:" && newPathname[0] != "https:" && newPathname[0] != "localhost") {
            urlPath = "http://xerte.org.uk/";
        }
        return urlPath;
    },

    drawHotspot = function(html, url, hsattrs, hspattrs, id, forceRectangle){
        // Draw Hotspot on the wizard page as preview on the thumbnail image
        // Always treat hotspot as a polygon
        // Step 0. Find image, set scale and wrap with overlayWrapper

        var img =  html.find('img');

        var natWidth = img[0].naturalWidth;
        var width = img.width();
        var scale = width/natWidth;
        //img.addClass("overlayImage");
        img.wrap('<div class="overlayWrapper" id="overlayWrapper_' + id + '"></div>');
        img.hide();

        // Step 1. Create canvas over img
        var canvasObj = $('<canvas>')
            .attr('id', 'wizard_hscanvas_' + id);
        $('#overlayWrapper_' + id).append(canvasObj);
        var canvas = new fabric.Canvas('wizard_hscanvas_' + id, {selection: false, interaction: false});
        canvas.setWidth(img.width());
        canvas.setHeight(img.height());
        fabric.Image.fromURL(url, function(bgimg){
            bgimg.scaleToWidth(canvas.width);
            bgimg.scaleToHeight(canvas.height);
            canvas.setBackgroundImage(bgimg, canvas.renderAll.bind(canvas),
                {
                    stretch: true,
                });
        });

        canvas.on('mouse:down', function(){editHotspot(url, hsattrs, hspattrs, id, forceRectangle)});
        // Step 2. Create polygon in appropriate scale
        var scaledpoints = [];
        // Old way of specifying hotspot: x,y,w,h
        if (forceRectangle || (hsattrs.mode == undefined && hsattrs.x != undefined && hsattrs.y != undefined && hsattrs.w != undefined && hsattrs.h != undefined)) {
            // create polygon, start with topleft
            scaledpoints[0] = {x: parseFloat(hsattrs.x), y: parseFloat(hsattrs.y)};
            scaledpoints[1] = {x: parseFloat(hsattrs.x) + parseFloat(hsattrs.w), y: parseFloat(hsattrs.y)};
            scaledpoints[2] = {x: parseFloat(hsattrs.x) + parseFloat(hsattrs.w), y: parseFloat(hsattrs.y) + parseFloat(hsattrs.h)};
            scaledpoints[3] = {x: parseFloat(hsattrs.x), y: parseFloat(hsattrs.y) + parseFloat(hsattrs.h)};
        }
        if (scaledpoints.length == 4 || (hsattrs.points != undefined && hsattrs.mode != undefined)) {
            if (scaledpoints.length != 4) {
                scaledpoints = JSON.parse(hsattrs['points']);
            }
            if (scaledpoints.length > 0) {
                for (var i in scaledpoints) {
                    scaledpoints[i].x *= scale;
                    scaledpoints[i].y *= scale;
                }
                var poly = new fabric.Polygon(scaledpoints, {
                    fill: 'rgba(255,0,0,0.5)',
                    selectable: false,
                    objectCaching: false,

                    evented:false
                });
                // Step 3. Draw Polygon
                canvas.add(poly);
            }
        }
    };

    editHotspot = function (url, hsattrs, hspattrs, id, forceRectangle){
	    var shape = "rectangle";
	    var scale;
	    var isDown = false;
        var activeShape = false;
        var activeLine = null;
        var pointArray = null;
        var lineArray = null;
        var hs = null;

	    var edit_img = $("<div></div>");
        //.css("background", "url(" + url + ")")
        edit_img.attr('id', 'outer_img_' + id)
            .addClass("hotspotEditor");
        edit_img.data("id", id);
        edit_img.append('<div class="hsbutton_holder" id="hsbutton_holder_'+ id + '">' +
            '<button id="rectangle_' + id + '" class="hseditModeButton" title="' + language.editHotspot.Buttons.Rectangle + '"><i class="fas fa-2x fa-vector-square"></i></button>' +
            '<button id="poly_'+ id + '" class="hseditModeButton" title="' + language.editHotspot.Buttons.Polygon + '"><i class="fas fa-2x fa-draw-polygon"></i></button>' +
            '<button id="reset_'+ id + '" class="hseditModeButton firstoption" title="' + language.editHotspot.Buttons.Reset + '" disabled><i class="fas fa-2x fa-undo-alt"></i></button>' +
            '<button id="' + id + '_cancel" name="cancel" class="hseditModeButton" title="' + language.Alert.cancellabel + '" style="float:right"><i class="fas fa-2x fa-window-close"></i></button>' +
            '<button id="' + id + '_ok" name="ok" class="hseditModeButton" title="' + language.Alert.oklabel + '" style="float:right"><i class="fas fa-2x fa-check-square"></i></button>' +
            '</div>');

            edit_img.append('<div class="overlayWrapper" id="overlayWrapper_' + id + '"><canvas id="hscanvas_' + id + '" class="overlayCanvas"></canvas></div>');
        edit_img.append('<div class="hsinstructions" id="instructions_' + id + '"></div>');
        /*
        edit_img.append($('<button>')
            .attr('id', id + '_ok')
            .attr('name', 'ok')
            .attr('type', 'button')
            .attr('title', language.Alert.oklabel)
            .addClass('hseditModeButton')
            .append('<i class="far fa-2x fa-check-square"></i>')
        )
            .append($('<button>')
                .attr('id', id + '_cancel')
                .attr('name', 'cancel')
                .attr('type', 'button')
                .attr('title', language.Alert.cancellabel)
                .addClass('hseditModeButton')
                .append('<i class="far fa-2x fa-window-close"></i>')
            );

         */
        if (!forceRectangle && hsattrs.mode != undefined)
        {
            shape = hsattrs.mode;
        }

        var img;
        var overlayWidth;
        var overlayHeight;

        fabric.Image.fromURL(url, function(bgimg) {
            img = bgimg;
            var img_width = bgimg.width;
            var img_height = bgimg.height;
            if (img_width > img_height) {
                var ratio = img_height / img_width;
                overlayWidth = 0.7 * $("body").width();
                overlayHeight = 0.7 * ratio * $("body").width();
                edit_img.find("#overlayWrapper_" + id).css("width", overlayWidth + "px")
                    .css("height", overlayHeight + "px");
                $.featherlight(edit_img, {
                    closeOnClick:   'false',       /* Close lightbox on click ('background', 'anywhere', or false) */
                    closeOnEsc:     true,          /* Close lightbox when pressing esc */
                    closeIcon:      '',            /* Close icon */
                    afterOpen: function () {
                        doEdit();
                    }
                });
            }
            else {
                var ratio = img_width / img_height;
                overlayWidth = 0.7 * ratio * $("body").height();
                overlayHeight = 0.7 * $("body").height();
                edit_img.find("#overlayWrapper_" + id).css("width", overlayWidth + "px")
                    .css("height", overlayHeight + "px");
                $.featherlight(edit_img, {
                    closeOnClick:   'false',       /* Close lightbox on click ('background', 'anywhere', or false) */
                    closeOnEsc:     true,          /* Close lightbox when pressing esc */
                    closeIcon:      '',            /* Close icon */
                    afterOpen: function () {
                        doEdit();
                    }
                });
            }

        });


        doEdit = function()
        {
            var canvas;

            var origX;
            var origY;

            var img_size_width = img.width;
            var img_size_height = img.height;
            var imgwidth = overlayWidth;
            var imgheight = overlayHeight;
            scale = img_size_width / imgwidth;
            $("#hscanvas_" + id).width(imgwidth);
            $("#hscanvas_" + id).height(imgheight);

            var canvasoptions = {};
            if (forceRectangle)
            {
                canvasoptions = {
                    lockRotation: true,

                }
            }
            canvas = new fabric.Canvas('hscanvas_' + id);
            canvas.setWidth(imgwidth);
            canvas.setHeight(imgheight);
            img.scaleToWidth(overlayWidth);
            img.scaleToHeight(overlayHeight);
            canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas),
                {
                    stretch: true
                });

            //$('#featherlight-content').unbind('click');

            var setDrawingModeButtonState = function(shape)
            {
                switch(shape)
                {
                    case "rectangle":
                        $("#rectangle_" + id).addClass("selected");
                        $("#poly_" + id).removeClass("selected");
                        break;
                    case "polygon":
                        $("#poly_" + id).addClass("selected");
                        $("#rectangle_" + id).removeClass("selected");
                        break;
                }
            };

            var initShape = function()
            {
                // initialise Hotspot
                hs = null;

                switch (shape)
                {
                    case "rectangle":
                        if (!forceRectangle && hsattrs.mode != undefined && hsattrs.shape != undefined) {
                            var rect = JSON.parse(hsattrs.shape);
                            hs = new fabric.Rect({
                                top: rect.top / scale,
                                left: rect.left / scale,
                                width: rect.width / scale,
                                height: rect.height / scale,
                                angle: rect.angle,
                                fill: 'rgba(255,0,0,0.5)',
                                selectable: true,
                                objectCaching: false,
                                transparentCorners: true,
                                cornerColor: 'yellow',
                                borderColor: 'yellow'
                            });
                        }
                        else if (forceRectangle || (hsattrs.x != undefined && hsattrs.y != undefined && hsattrs.w != undefined && hsattrs.h != undefined)) {
                            // Old definition of hotspot
                            hs = new fabric.Rect({
                                top: parseFloat(hsattrs.y) / scale,
                                left: parseFloat(hsattrs.x) / scale,
                                width : parseFloat(hsattrs.w) /scale,
                                height : parseFloat(hsattrs.h) /scale,
                                angle: 0,
                                fill: 'rgba(255,0,0,0.5)',
                                selectable: true,
                                objectCaching: false,
                                transparentCorners: true,
                                cornerColor: 'yellow',
                                borderColor: 'yellow',
                                hasRotatingPoint: !forceRectangle
                            });
                        }
                        setDrawingModeButtonState(shape);
                        if (hs == null) {
                            setRectangleHandlers();
                            disableReset();
                        }
                        else {
                            enableReset();
                        }
                        break;
                    case "polygon":
                        var scaledpoints = [];
                        if (hsattrs.points != undefined) {
                            scaledpoints = JSON.parse(hsattrs.points);
                            if (scaledpoints.length > 0) {
                                for (var i in scaledpoints) {
                                    scaledpoints[i].x /= scale;
                                    scaledpoints[i].y /= scale;
                                }
                                var hs = new fabric.Polygon(scaledpoints, {
                                    fill: 'rgba(255,0,0,0.5)',
                                    selectable: true,
                                    objectCaching: false,
                                    transparentCorners: true,
                                    cornerColor: 'yellow',
                                    borderColor: 'yellow'
                                });
                            }
                        }
                        setDrawingModeButtonState(shape);
                        if (hs == null) {
                            setPolygonHandlers();
                            disableReset();
                        }
                        else {
                            enableReset();
                        }
                        break;
                }
                if (hs != null) {
                    // Step 3. Draw Polygon
                    canvas.add(hs);
                    canvas.renderAll();
                }
                return hs;
            };

            var setInstructions=function(edit) {
                var instructions = language.editHotspot.Instructions.header;
                instructions += "<ul>";
                if (edit && !forceRectangle) {
                    instructions += "<li>" + language.editHotspot.Instructions.edit + "</li>" +
                    "<li>" + language.editHotspot.Instructions.reset + "</li>";

                } else {
                    if (forceRectangle) {
                        instructions += "<li>" + language.editHotspot.Instructions.forceRectangle + "</li>";
                    }
                    switch (shape) {
                        case "rectangle":
                            instructions += "<li>" + language.editHotspot.Instructions.rectangle + "</li>";
                            break;
                        case "polygon":
                            instructions += "<li>" + language.editHotspot.Instructions.polygon + "</li>";
                            break;
                    }
                }
                instructions += "<li>" + language.editHotspot.Instructions.save + "</li>"
                + "</ul>";
                $("#instructions_" + id).html(instructions);
            };

            // Ok handler
            var okbutton = $('#featherlight-content button[name="ok"]');
            okbutton.click(function(event){

                var key = $("#inner_img_" + id).data("key");
                var current = $.featherlight.current();
                var npoints = [];
                switch (shape) {
                    case "rectangle":
                        if (hs != null) {
                            var hspoints = hs.oCoords;
                            //Get tl, tr, br, bl
                            var cornerpoints = ['tl', 'tr', 'br', 'bl'];
                            for (var pi in cornerpoints) {
                                var point = hspoints[cornerpoints[pi]];
                                npoints.push({
                                    "x": point.x * scale,
                                    "y": point.y * scale
                                });
                            }
                            var rect = {};
                            rect.top = hs.top * scale;
                            rect.left = hs.left * scale;
                            rect.width = hs.getScaledWidth() * scale;
                            rect.height = hs.getScaledHeight() * scale;
                            rect.angle = hs.angle;
                            var stringPoints = JSON.stringify(npoints);
                            var stringShape = JSON.stringify(rect);

                            if (forceRectangle) {
                                setAttributeValue(key, ["x", "y", "w", "h"], [rect.left, rect.top, rect.width, rect.height]);
                            }
                            else {
                                setAttributeValue(key, ["points", "mode", "shape"], [stringPoints, shape, stringShape]);
                            }
                        }
                        else {
                            setAttributeValue(key, ["points", "mode", "shape"], ['[]', shape, '{}']);
                        }
                        break;
                    case "polygon":
                        if (hs != null) {
                            // Transform to correct coordinates based on canvas,
                            // So calculated resulting point after possible translation and rotation
                            var matrix = hs.calcTransformMatrix();
                            var hspoints = hs.get("points")
                                .map(function (p) {
                                    return new fabric.Point(
                                        p.x - hs.pathOffset.x,
                                        p.y - hs.pathOffset.y);
                                })
                                .map(function (p) {
                                    return fabric.util.transformPoint(p, matrix);
                                });
                            for (var pi in hspoints) {
                                var point = hspoints[pi];
                                npoints.push({
                                    "x": point.x * scale,
                                    "y": point.y * scale
                                });
                            }
                            var stringPoints = JSON.stringify(npoints);
                            setAttributeValue(key, ["points", "mode", "shape"], [stringPoints, shape, "{}"]);
                        }
                        else {
                            setAttributeValue(key, ["points", "mode", "shape"], ['[]', shape, '{}']);
                        }
                        break;
                }


                current.close();
                parent.tree.showNodeData(key);
            });

            // Cancel handler
            var cancelbutton = $('#featherlight-content button[name="cancel"]');
            cancelbutton.click(function(event){
                var key = $("#inner_img_" + id).data("key");
                var current = $.featherlight.current();
                current.close();
                parent.tree.showNodeData(key);
            });

            // Switch to polygon mode
            var polygonbutton = $('#featherlight-content #poly_'+id);
            if (forceRectangle)
            {
                polygonbutton.prop("disabled", true);
            }
            polygonbutton.click(function (event) {
                if (shape != "polygon") {
                    switchToPolygonMode();
                }
            });

            var switchToPolygonMode = function()
            {
                shape = "polygon";
                setDrawingModeButtonState(shape);
                pointArray = [];
                lineArray = [];
                activeShape = false;
                canvas.remove(hs);
                canvas.renderAll();
                hs = null;
                setPolygonHandlers();
                disableReset();
            };

            var rectanglebutton = $('#featherlight-content #rectangle_'+id);
            rectanglebutton.click(function (event) {
                if (shape != "rectangle") {
                    switchToRectangleMode();
                }

            });

            var switchToRectangleMode = function()
            {
                shape = "rectangle";
                setDrawingModeButtonState(shape);
                canvas.set({selection: false});
                canvas.remove(hs);
                canvas.renderAll();
                hs = null;
                setRectangleHandlers();
                disableReset();
            };

            // Reset handler
            var resetbutton = $('#featherlight-content #reset_'+id);
            resetbutton.click(function (event){
                switch (shape)
                {
                    case "rectangle":
                        switchToRectangleMode();
                        disableReset();
                        break;
                    case "polygon":
                        switchToPolygonMode();
                        disableReset();
                        break;
                }
            });

            var enableReset = function()
            {
                resetbutton.prop("disabled", false);
                setInstructions(true);
            };

            var disableReset = function()
            {
                resetbutton.prop("disabled", true);
                setInstructions(false);
            };

            var setRectangleHandlers = function()
            {
                canvas.off('mouse:down');
                canvas.off('mouse:move');
                canvas.off('mouse:up');
                canvas.on('mouse:down', function(opt) {
                    rectangleMouseDown(opt)
                });
                canvas.on('mouse:move', function(opt) {
                    rectangleMouseMove(opt)
                });
                canvas.on('mouse:up', function(opt) {
                    rectangleMouseUp(opt)
                });
            };

            var rectangleMouseDown = function(o){
                isDown = true;
                var pointer = canvas.getPointer(o.e);
                origX = pointer.x;
                origY = pointer.y;
                var pointer = canvas.getPointer(o.e);
                hs = new fabric.Rect({
                    left: origX,
                    top: origY,
                    originX: 'left',
                    originY: 'top',
                    width: pointer.x-origX,
                    height: pointer.y-origY,
                    angle: 0,
                    fill: 'rgba(255,0,0,0.5)',
                    transparentCorners: true,
                    cornerColor: 'yellow',
                    borderColor: 'yellow',
                    selectable: true,
                    hasRotationPoint: !forceRectangle
                });
                canvas.add(hs);
            };

            var rectangleMouseMove = function(o){
                if (!isDown) return;
                var pointer = canvas.getPointer(o.e);

                if(origX>pointer.x){
                    hs.set({ left: Math.abs(pointer.x) });
                }
                if(origY>pointer.y){
                    hs.set({ top: Math.abs(pointer.y) });
                }

                hs.set({ width: Math.abs(origX - pointer.x) });
                hs.set({ height: Math.abs(origY - pointer.y) });


                canvas.renderAll();
            };

            var rectangleMouseUp = function(o){
                isDown = false;
                canvas.off('mouse:down');
                canvas.off('mouse:move');
                canvas.off('mouse:up');
                canvas.off('mouse:dblclick');
                canvas.set({selection: (forceRectangle ? true : false)});
                canvas.remove(hs);
                canvas.add(hs);
                canvas.renderAll();
                enableReset();
            };

            var setPolygonHandlers = function()
            {
                canvas.off('mouse:down');
                canvas.off('mouse:move');
                canvas.off('mouse:up');
                canvas.off('mouse:dblclick');
                canvas.on('mouse:down', function(opt) {
                    polygonMouseDown(opt)
                });
                canvas.on('mouse:move', function(opt) {
                    polygonMouseMove(opt)
                });

            };

            var polygonMouseDown = function(o){
                var min = 99;
                var max = 999999;

                if(o.target && o.target.id == pointArray[0].id){
                    generatePolygon(pointArray);
                }
                else {
                    // addPoint
                    var random = Math.floor(Math.random() * (max - min + 1)) + min;
                    var id = new Date().getTime() + random;
                    var circle = new fabric.Circle({
                        radius: 5,
                        fill: '#ffffff',
                        stroke: '#333333',
                        strokeWidth: 0.5,
                        left: (o.e.layerX/canvas.getZoom()),
                        top: (o.e.layerY/canvas.getZoom()),
                        selectable: false,
                        hasBorders: false,
                        hasControls: false,
                        originX:'center',
                        originY:'center',
                        id:id,
                        objectCaching:false
                    });
                    if(pointArray.length == 0){
                        circle.set({
                            fill:'red'
                        })
                    }
                    var p = [(o.e.layerX/canvas.getZoom()),(o.e.layerY/canvas.getZoom()),(o.e.layerX/canvas.getZoom()),(o.e.layerY/canvas.getZoom())];
                    var line = new fabric.Line(p, {
                        strokeWidth: 2,
                        fill: '#999999',
                        stroke: '#999999',
                        class:'line',
                        originX:'center',
                        originY:'center',
                        selectable: false,
                        hasBorders: false,
                        hasControls: false,
                        evented: false,
                        objectCaching:false
                    });
                    if(activeShape){
                        var pos = canvas.getPointer(o.e);
                        var points = activeShape.get("points");
                        points.push({
                            x: pos.x,
                            y: pos.y
                        });
                        var polygon = new fabric.Polygon(points,{
                            stroke:'#333333',
                            strokeWidth:1,
                            fill: '#cccccc',
                            opacity: 0.3,
                            selectable: false,
                            hasBorders: false,
                            hasControls: false,
                            evented: false,
                            objectCaching:false
                        });
                        canvas.remove(activeShape);
                        canvas.add(polygon);
                        activeShape = polygon;
                        canvas.renderAll();
                    }
                    else{
                        var polyPoint = [{x:(o.e.layerX/canvas.getZoom()),y:(o.e.layerY/canvas.getZoom())}];
                        var polygon = new fabric.Polygon(polyPoint,{
                            stroke:'#333333',
                            strokeWidth:1,
                            fill: '#cccccc',
                            opacity: 0.3,
                            selectable: false,
                            hasBorders: false,
                            hasControls: false,
                            evented: false,
                            objectCaching:false
                        });
                        activeShape = polygon;
                        canvas.add(polygon);
                    }
                    activeLine = line;

                    pointArray.push(circle);
                    lineArray.push(line);

                    canvas.add(line);
                    canvas.add(circle);
                    canvas.selection = false;
                }

            };

            var polygonMouseMove = function(o)
            {
                if(activeLine && activeLine.class == "line"){
                    var pointer = canvas.getPointer(o.e);
                    activeLine.set({ x2: pointer.x, y2: pointer.y });

                    var points = activeShape.get("points");
                    points[pointArray.length] = {
                        x:pointer.x,
                        y:pointer.y
                    };
                    activeShape.set({
                        points: points
                    });
                    canvas.renderAll();
                }
                canvas.renderAll();
            };

            var generatePolygon  = function(pointArray){
                var points = new Array();
                $.each(pointArray,function(index,point){
                    points.push({
                        x:point.left,
                        y:point.top
                    });
                    canvas.remove(point);
                });
                $.each(lineArray,function(index,line){
                    canvas.remove(line);
                });
                canvas.remove(activeShape).remove(activeLine);
                hs = new fabric.Polygon(points,{
                    //stroke:'#333333',
                    //strokeWidth:0.5,
                    fill: 'rgba(255,0,0,0.5)',
                    selectable: true,
                    transparentCorners : true,
                    cornerColor: 'yellow',
                    borderColor: 'yellow'

                });
                canvas.off('mouse:down');
                canvas.off('mouse:move');
                canvas.off('mouse:up');
                canvas.off('mouse:dblclick');

                canvas.add(hs);

                activeLine = null;
                activeShape = null;
                canvas.selection = true;
                enableReset();
            };


            hs = initShape();
        }

    };

    displayDataType = function (value, options, name, key) {
		var html;

		switch(options.type.toLowerCase())
		{
			case 'checkbox':
				var id = 'checkbox_' + form_id_offset;
				form_id_offset++;
				html = $('<input>')
					.attr('id', id)
					.attr('type',  "checkbox")
					.prop('checked', value && value == 'true')
					.change({id:id, key:key, name:name}, function(event){
						cbChanged(event.data.id, event.data.key, event.data.name, this.checked, this);
					});
				break;
			case 'combobox':
				var id = 'select_' + form_id_offset;
				form_id_offset++;
				var s_options = options.options.split(',');
				var s_data = [];
				if (options.data)
				{
					s_data = options.data.split(',');
				}
				else
				{
					s_data = s_options;
				}
				html = $('<select>')
					.attr('id', id)
					.change({id:id, key:key, name:name}, function(event)
					{
						selectChanged(event.data.id, event.data.key, event.data.name, this.value, this);
					});
				
				if (value == '') {
					html.append($('<option>').attr('value', '').prop('selected', true));
				}
				
				for (var i=0; i<s_options.length; i++) {
					var option = $('<option>')
						.attr('value', s_data[i]);
					if (s_data[i]==value) {
						option.prop('selected', true);
					}
					option.append(s_options[i]);
					html.append(option);
					if (value == '' && html.find('option:selected').index() > 0) {
						html.find(option).eq(0).remove();
					}
				}

				break;
			case 'text':
			case 'script':
			case 'html':
			case 'textarea':
				var id = "textarea_" + form_id_offset;
				var textvalue = "";

				form_id_offset++;

				if (value.toLowerCase().indexOf('<textarea') == -1) textvalue = value;

				var textarea = "<textarea id=\"" + id + "\" class=\"ckeditor\" style=\"";
				if (options.height) textarea += "height:" + options.height + "px";
				textarea += "\">" + textvalue + "</textarea>";
				$textarea = $(textarea);

				if (textvalue.length == 0) $textarea.data('afterckeditor', value);

				html = $('<div>')
					.attr('style', 'width:100%')
					.append($textarea);

				textareas_options.push({id: id, key: key, name: name, options: options});
				break;
			case 'numericstepper':
				var min = parseInt(options.min);
				var max = parseInt(options.max);
				var step = parseInt(options.step);
				var intvalue = parseInt(value);
				if (!Modernizr.inputtypes.number)
				{
					var id = 'select_' + form_id_offset;
					form_id_offset++;
					html = $('<select>')
						.attr('id', id)
						.change({id:id, key:key, name:name}, function(event)
						{
							selectChanged(event.data.id, event.data.key, event.data.name, this.value, this);
						});
					for (var i=min; i<max; i += step) {
						var option = $('<option>')
							.attr('value', i);
						if (intvalue==i)
							option.prop('selected', true);
						option.append(i);
						html.append(option);
					}

				}
				else
				{
					var id = 'numericstepper_' + form_id_offset;
					form_id_offset++;
					html = $('<input>')
						.attr('id', id)
						.attr('type', 'number')
						.attr('min', min)
						.attr('max', max)
						.attr('step', step)
						.attr('value', value)
						.change({id:id, key:key, name:name}, function(event)
						{
							if (this.value <= max &&  this.value >= min) {
								if (this.value == '') {
									this.value = (min + max) / 2; // choose midpoint for NaN
								}
								inputChanged(event.data.id, event.data.key, event.data.name, this.value, this);
							}
							else { // set to max or min if out of range
								this.value = Math.max(Math.min(this.value, max), min);
							}
						});
				}
				break;
			case 'pagelist':
				// Implement differently then in the flash editor
				// Leave PageIDs untouched, and prefer to use the PageID over the linkID
				var id = 'select_' + form_id_offset;
				form_id_offset++;
				html = $('<select>')
					.attr('id', id)
					.change({id:id, key:key, name:name}, function(event)
					{
						selectChanged(event.data.id, event.data.key, event.data.name, this.value, this);
					});
				// Add empty entry
				var option = $('<option>')
					.attr('value', "");
				if (value=="")
					option.prop('selected', true);
				option.append("&nbsp;");
				html.append(option);
				var pages = getPageList();
				$.each(pages, function(page)
				{
					option = $('<option>')
						.attr('value', this[1]);
					if (value==this[1])
						option.prop('selected', true);
					option.append(this[0]);
					html.append(option);
				});
				break;
			case 'categorylist':
				var id = 'select_' + form_id_offset;
				form_id_offset++;
				html = $('<div id="' + id + '" class="categoryListHolder">').data('checked', value != '' ? value.split(',') : []);
				
				if (lo_data.treeroot['attributes'][options.target] != undefined) {
					// set up all the categories & their checkboxes
					var categories = lo_data.treeroot['attributes'][options.target].split('||');
					
					// work out what categories & options there are
					for (var i=0; i<categories.length; i++) {
						var categoryInfo = categories[i].split('|');
						
						if (categoryInfo.length == 2) {
							var catTitle = categoryInfo[0].trim(),
								catOpts = categoryInfo[1].split('\n');
							
							for (var j=0; j<catOpts.length; j++) {
								catOpts.splice(j, 1, catOpts[j].trim());
								
								if (catOpts[j].length == 0) {
									catOpts.splice(j, 1);
									j--;
								} else {
									var stripTags = $("<div/>").html(catOpts[j]).text().trim();
									if (stripTags.length > 0) {
										var optInfo = stripTags.split('(');
										if (optInfo.length > 1 && optInfo[1].trim().length > 0) {
											catOpts.splice(j, 1, { id: optInfo[0].trim(), name: optInfo[1].trim().slice(0, -1) });
										} else {
											catOpts.splice(j, 1, { id: optInfo[0].replace(/ /g, "_"), name: optInfo[0] });
										}
									} else {
										catOpts.splice(j, 1);
										j--;
									}
								}
							}
							
							if (catTitle.length > 0 && catOpts.length > 0) {
								categories.splice(i, 1, { name: catTitle, options: catOpts });
							} else {
								categories.splice(i, 1);
								i--;
							}
						} else {
							categories.splice(i, 1);
							i--;
						}
					}
					
					// if some categories exist add them to the page
					if (categories.length > 0) {
						for (var i=0; i<categories.length; i++) {
							var option = $('<div class="categoryList"><div class="catTitle">' + categories[i].name + ':</div></div>');
							
							for (var j=0; j<categories[i].options.length; j++) {
								var checkbox = $('<input>')
									.attr({
										'type': 'checkbox',
										'name': 'cat_' + categories[i].options[j].id,
										'id': 'cat_' + categories[i].options[j].id
									})
									.prop('checked', $.inArray(categories[i].options[j].id, html.data('checked')) > -1 ? true : false)
									.change({id:id, key:key, name:name}, function(event) {
										catListChanged(event.data.id, event.data.key, event.data.name, html, this);
									});
								
								var label = $('<label for="cat_' + categories[i].options[j].id + '">' + categories[i].options[j].name + '</label>');
								
								$('<div class="catGroup">')
									.appendTo(option)
									.append(checkbox)
									.append(label);
							}
							html.append(option);
						}
					} else {
						var optName = wizard_data['learningObject'].node_options.all.find(function(o) { return o['name'] === options.target}).value.label;
						html.append('<span class="error">' + language.categoryList.errorEmpty.replace('{x}', "'" + optName + "'") + "</span>");
					}
				} else {
					var optName = wizard_data['learningObject'].node_options.all.find(function(o) { return o['name'] === options.target}).value.label;
					html.append('<span class="error">' + language.categoryList.error.replace('{x}', "'" + optName + "'") + "</span>");
				}
				break;
			case 'colourpicker':
				var colorvalue = value;
				var id = 'colorpicker_' + form_id_offset;
				form_id_offset++;
				if (colorvalue.indexOf("0x") == 0)
				{
					colorvalue = colorvalue.substr(2);
				}
				if (Modernizr.inputtypes.color && false) // TODO: I can't get this to work! The widget doesn't show the correct colour, turned off for now
				{
					html = $('<input>')
						.attr('id', id)
						.attr('type', 'color')
						.change({id:id, key:key, name:name}, function(event)
						{
							inputChanged(event.data.id, event.data.key, event.data.name, this.value, this);
						});
				}
				else
				{
					html = $('<input>')
						.attr('id', id)
						.addClass('color')
						.change({id:id, key:key, name:name}, function(event)
						{
							inputChanged(event.data.id, event.data.key, event.data.name, this.value, this);
						});
					
					colorpickers.push({id: id, options: options});
					
					if (colorvalue != '') {
						html.attr('value', colorvalue);
						colorpickers[colorpickers.length-1].value = colorvalue;
					}
				}
				break;
			case 'languagelist':
				var id = 'select_' + form_id_offset;
				form_id_offset++;
				html = $('<select>')
					.attr('id', id)
					.change({id:id, key:key, name:name}, function(event)
					{
						changeLanguage(event.data.id, event.data.key, event.data.name, this.value, this);
						//selectChanged(event.data.id, event.data.key, event.data.name, this.value, this);
					});
				for (var i=0; i<installed_languages.length; i++) {
					var option = $('<option>')
						.attr('value', installed_languages[i].code);
					if (installed_languages[i].code==value)
						option.prop('selected', true);
					option.append(installed_languages[i].name);
					html.append(option);
				}
				break;
			case 'themelist':
				var id = 'select_' + form_id_offset;
				var html = $('<div>')
					.attr('id', 'theme_div_' + form_id_offset);
				var currtheme = 0;
				var select = $('<select>')
					.attr('id', id)
					.change({id:id, key:key, name:name}, function(event)
					{
						themeChanged(event.data.id, event.data.key, event.data.name, this.value, this);
					});
				for (var i=0; i<theme_list.length; i++) {
					var option = $('<option>')
						.attr('value', i);
					if (theme_list[i].name==value) {
						option.prop('selected', true);
						currtheme = i;
					}
					option.append(theme_list[i].display_name);
					select.append(option);
				}
				html.append(select);
				var preview = $('<img>')
					.attr('id', 'theme_preview_' + form_id_offset)
					.addClass('theme_preview')
					.attr({
						'src': theme_list[currtheme].preview,
						'alt': theme_list[currtheme].display_name
					})
					.click(function() {
						previewFile($(this).attr('alt'), $(this).attr('src'), $(this).attr('alt'));
					});
					
				html.append(preview);
				var description = $("<div>" + theme_list[currtheme].description + "</div><div class='theme_url_param'>" + language.ThemeUrlParam + " " + theme_list[currtheme].name + "</div>");
				var description_box = $('<div>')
					.attr('id', 'theme_description_' + form_id_offset)
					.addClass('theme_description')
					.append(description);
				html.append(description_box);
				form_id_offset++;

				break;
			case 'category':
				var id = 'select_' + form_id_offset;
				var html = $('<div>')
					.attr('id', 'category_div_' + form_id_offset);
				var currselected=false;
				var select = $('<select>')
					.attr('id', id)
					.change({id:id, key:key, name:name}, function(event)
					{
						inputChanged(event.data.id, event.data.key, event.data.name, this.value, this);
					});
				// Add empty option
				var option = $('<option>')
					.attr('value', "");
				if (value=="") {
					option.prop('selected', true);
					currselected=true;
				}
				option.append("");
				select.append(option);
				for (var i=0; i<category_list.length; i++) {
					var option = $('<option>')
						.attr('value', category_list[i].category_name);
					if (category_list[i].category_name==value) {
						option.prop('selected', true);
						curreselected = true;
					}
					option.append(category_list[i].category_name);
					select.append(option);
				}
				if (value != "" && !currselected)
				{
					//  Add current value as option, even though it is not in the list
					var option = $('<option>')
						.attr('value', value);
					option.prop('selected', true);
					option.append(value);
					select.append(option);
				}
				html.append(select);
			break;
			case 'grouping':
				var id = 'select_' + form_id_offset;
				var html = $('<div>')
					.attr('id', 'grouping_div_' + form_id_offset);
				var currselected = false;
				var select = $('<select>')
					.attr('id', id)
					.change({id:id, key:key, name:name}, function(event)
					{
						inputChanged(event.data.id, event.data.key, event.data.name, this.value, this);
					});
				// Add empty option
				var option = $('<option>')
					.attr('value', "");
				if (value=="") {
					option.prop('selected', true);
					currselected = true;
				}
				option.append("");
				select.append(option);
				for (var i=0; i<grouping_list.length; i++) {
					var option = $('<option>')
						.attr('value', grouping_list[i].grouping_name);
					if (grouping_list[i].grouping_name==value) {
						option.prop('selected', true);
						currselected = true;
					}
					option.append(grouping_list[i].grouping_name);
					select.append(option);
				}
				if (value != "" && !currselected)
				{
					//  Add current value as option, even though it is not in the list
					var option = $('<option>')
						.attr('value', value);
					option.prop('selected', true);
					option.append('<i class="fa fa-exclamation-triangle " title ="' + language.category.$deprecated + '"></i>&nbsp;' + value);
					select.append(option);
				}
				html.append(select);
				break;
			case 'course':
				if (course_list.length == 0)
				{
					// Create a non-wysiwyg textinput
					var id = 'textinput_' + form_id_offset;
					html = $('<input>')
						.attr('type', "text")
						.addClass('inputtext')
						.attr('id', id)
						.keyup({name: name, key: key, options: options}, function()
						{
							if (name == 'name') {
								// Rename the node
								var tree = $.jstree.reference("#treeview");
								tree.rename_node(tree.get_node(key, false), $(this).val());
							}
						})
						.change({id:id, key:key, name:name}, function(event)
						{
							inputChanged(event.data.id, event.data.key, event.data.name, this.value, this);
						})
						.attr('value', value);
				}
				else {
					var id = 'select_' + form_id_offset;
					var html = $('<div>')
						.attr('id', 'course_div_' + form_id_offset);
					var currselected = false;
					var select = $('<select>')
						.attr('id', id)
						.change({id: id, key: key, name: name, form_id: form_id_offset}, function (event) {
							courseChanged(event.data.id, event.data.key, event.data.name, event.data.form_id, this.value, this);
						});
					// Add empty option
					var option = $('<option>')
						.attr('value', "");
					if (value == "") {
						option.prop('selected', true);
						currselected = true;
					}
					option.append("");
					select.append(option);
					for (var i = 0; i < course_list.length; i++) {
						var option = $('<option>')
							.attr('value', course_list[i].course_name);
						if (course_list[i].course_name == value) {
							option.prop('selected', true);
							currselected = true;
						}
						option.append(course_list[i].course_name);
						select.append(option);
					}
					if (course_freetext_enabled)
					{
						var option = $('<option>')
							.attr('value', language.course.FreeText.$label);
						option.append(language.course.FreeText.$label);
						if (!currselected)
						{
							option.prop('selected', true);
							select.css("width", "50%");

						}
						select.append(option);
						html.append(select);

						// Add textinput after select
						// Create a non-wysiwyg textinput
						var id = 'course_freetext_' + form_id_offset;
						var textinput = $('<input>')
							.attr('type', "text")
							.addClass('inputtext')
							.addClass('course_freetext')
							.attr('id', id)
							.keyup({name: name, key: key, options: options}, function()
							{
								if (name == 'name') {
									// Rename the node
									var tree = $.jstree.reference("#treeview");
									tree.rename_node(tree.get_node(key, false), $(this).val());
								}
							})
							.change({id:id, key:key, name:name}, function(event)
							{
								inputChanged(event.data.id, event.data.key, event.data.name, this.value, this);
							});
						if (currselected)
						{
							// Disabled
							textinput.hide();
						}
						else {
							textinput.attr('value', value);
						}
						html.append(textinput);
					}
					else
					{
						if (value != "" && !currselected) {
							//  Add current value as option, even though it is not in the list
							var option = $('<option>')
								.attr('value', value);
							option.prop('selected', true);
							option.append(value);
							select.append(option);
							select.addClass("deprecated");
							select.addClass("deprecated_option_selected")
						}
						html.append(select);
						if (value != "" && !currselected) {
							html.append('<i class="deprecated fa fa-exclamation-triangle " title ="' + language.category.$deprecated + '"></i>&nbsp;');
						}
					}

				}
				break;
			case 'hotspot':
            case 'flexhotspot':
				var id = 'hotspot_' + form_id_offset;
				form_id_offset++;

                // Furthermore, the hotspot image, and the hotspot color are in the parent (or if the parent is a hotspotGroup, in the parents parent
                // So, get the image, the highlight colour, and the coordinates here, and make a lightbox of a small image that is clickable
                var forceRectangle = (options.type.toLowerCase() === "hotspot");
				var hsattrs = lo_data[key].attributes;
                var hsparent = parent.tree.getParent(key);
                var hspattrs = lo_data[hsparent].attributes;
                if (hspattrs.nodeName.toLowerCase() == "hotspotgroup")
                {
                    // go one further up
                    hsparent = parent.tree.getParent(hsparent);
                    hspattrs = lo_data[hsparent].attributes;
                }

                    // Create the container
                    html = $('<div>').attr('id', id);

                    var url = hspattrs.url;
                    // Replace FileLocation + ' with full url
                    url = makeAbsolute(url);
                    // Create a div with the image in there (if there is an image) and overlayed on the image is the hotspot box
                    if (url.substring(0,4) == "http")
                    {
                        var shape = "square";
                        html.addClass('clickableHotspot');
                        html.append("<img>");
                        var cur_key = key;
                        html.find('img')
                            .attr('id', 'inner_img_' + id)
                            .attr("data-key", cur_key)
                            .attr("src", url)
                            .load(function(){

                                $(this).css({width: '100%'});
                                drawHotspot(html, url, hsattrs, hspattrs, id, forceRectangle);
                            }).click(function(){
                                editHotspot(url, hsattrs, hspattrs, id, forceRectangle);
                            });
                    }
                    else
                    {
                        html.append("<span class=\"error\">" + language.editHotspot.Error.selectFile + "</span>");
                    }

				break;
			case 'media':
				var id = 'media_' + form_id_offset;
				form_id_offset++;
				// a textinput with a browse buttons next to the type-in
				var td1 = $('<td width="100%">')
					.append($('<input>')
						.attr('type', "text")
						.attr('id', id)
						.addClass('media')
						.change({id:id, key:key, name:name}, function(event)
						{
							inputChanged(event.data.id, event.data.key, event.data.name, this.value, this);
						})
						.attr('value', value));
				
				var td2 = $('<td>');
				var btnHolder = $('<div style="width:4.5em"></div>').appendTo(td2);
				btnHolder.append($('<button>')
					.attr('id', 'browse_' + id)
					.attr('title', language.compMedia.$tooltip)
					.addClass("xerte_button")
					.addClass("media_browse")
					.click({id:id, key:key, name:name}, function(event)
					{
						browseFile(event.data.id, event.data.key, event.data.name, this.value, this);
					})
					.append($('<i>').addClass('fa').addClass('fa-lg').addClass('fa-upload').addClass('xerte-icon')))
				
				btnHolder.append($('<button>')
					.attr('id', 'preview_' + id)
					.attr('title', language.compPreview.$tooltip)
					.addClass("xerte_button")
					.click({id:id, key:key, name:name}, function(event)
					{
						previewFile(options.label, $(this).closest('tr').find('input')[0].value);
					})
					.append($('<i>').addClass('fa').addClass('fa-lg').addClass('fa-search').addClass('xerte-icon')));
						
				html = $('<div>')
					.attr('id', 'container_' + id)
					.addClass('media_container');
				html.append($('<table width="100%">')
					.append($('<tr>')
						.append(td1)
						.append(td2)));
				break;
			case 'datagrid':
				var id = 'grid_' + form_id_offset;
				form_id_offset++;
				html = $('<div>')
					.attr('id', id)
					.addClass('datagrid')
					.append($('<table>')
						.attr('id', id + '_jqgrid'))
					.append($('<div>')
						.attr('id', id + '_nav'))
					.append($('<div>')
						.attr('id', id + '_addcolumns')
						.addClass('jqgridAddColumnsContainer'));

				datagrids.push({id: id, key: key, name: name, options: options});
				break;
			case 'datefield':
				var id = 'date_' + form_id_offset;
				form_id_offset++;
				var format = 0;
				if (value.length > 0) {
					if (value.split('-').length == 3) {
						format = 1;
						value = value.split('T')[0];
					}
				} else if (value.length == 0 && options.allowBlank != "true") {
					value = new Date().toISOString();
					setAttributeValue(key, [name], [value]);
				}
				
				// a datepicker with a browse buttons next to it
				var td1 = $('<td width="100%">')
					.append($('<input>')
						.attr('type', "text")
						.attr('id', id)
						.addClass('date')
						.change({id:id, key:key, name:name}, function(event)
						{
							inputChanged(event.data.id, event.data.key, event.data.name, this.value.length == 0 ? '' : (format == 0 ? this.value : new Date(this.value).toISOString()), this);
						})
						.attr('value', value.split('T')[0])
						.datepicker({
							showOtherMonths: true,
							selectOtherMonths: true,
							dateFormat: 'yy-mm-dd', // the format used to be dd/mm/yyyy so some of code above is to cope with this
							minDate: options.preventPrev == "true" ? 0 : null
						}));
				
				var td2 = $('<td>');
				var btnHolder = $('<div style="width:4.5em"></div>').appendTo(td2);
				btnHolder.append($('<button>')
					.attr('id', 'calendar_' + id)
					.attr('title', language.calendar != undefined ? language.calendar.$tooltip : '')
					.addClass("xerte_button")
					.click({id:id, key:key, name:name}, function(event)
					{
						td1.datepicker("show");
					})
					.append($('<i>').addClass('fa').addClass('fa-lg').addClass('fa-calendar').addClass('xerte-icon')))
				
				html = $('<div>')
					.attr('id', 'container_' + id)
					.addClass('media_container');
				html.append($('<table width="100%">')
					.append($('<tr>')
						.append(td1)
						.append(td2)));
				break;
			case 'drawing': // Not implemented
				var id = 'drawing_' + form_id_offset;
				form_id_offset++;
				html = $('<button>')
					.attr('id', id)
					.attr('title', language.edit.$tooltip)
					.addClass("xerte_button")
					.click({id:id, key:key, name:name, value:value}, function(event)
					{
						editDrawing(event.data.id, event.data.key, event.data.name, event.data.value);
					}
				)
					.append(language.edit.$label);
				break;
			case 'webpage':  //Not used??
			case 'xerteurl':
			case 'xertelo':
			default:
				var id = 'textinput_' + form_id_offset;
				form_id_offset++;
				if (options.wysiwyg && options.wysiwyg != "false")
				{
					html = $('<div>')
						.attr('id', id)
						.addClass('inlinewysiwyg')
						.attr('contenteditable', 'true')
						.append('<p>' + value + '</p>');
					
					textinputs_options.push({id: id, key: key, name: name, options: options});
				}
				else {
					if (options.type.toLowerCase() == 'xerteurl' && value.length==0)
					{
						value=baseUrl();
						setAttributeValue(key, [name], [value]);
					}
					if (options.type.toLowerCase() == 'xertelo' && value.length==0)
					{
						value=template_id;
						setAttributeValue(key, [name], [value]);
					}
					html = $('<input>')
						.attr('type', "text")
						.addClass('inputtext')
						.attr('id', id)
						.keyup({name: name, key: key, options: options}, function()
						{
							if (name == 'name') {
								// Rename the node
								var tree = $.jstree.reference("#treeview");
								tree.rename_node(tree.get_node(key, false), $(this).val());
							}
						})
						.change({id:id, key:key, name:name}, function(event)
						{
							inputChanged(event.data.id, event.data.key, event.data.name, this.value, this);
						})
						.attr('value', value);
				}
		}
		return html;
	};

		
	CKEDITOR.on('dialogDefinition', function(event) {
		try {
			var dialogName = event.data.name;
			var dialogDefinition = event.data.definition;
			if (dialogName == 'link') {
				var informationTab = dialogDefinition.getContents('target');
				var targetField = informationTab.get('linkTargetType');
				targetField['default'] = '_blank';
			}
		} catch(e) {};
	});
	
    // Add the functions that need to be public
    my.getExtraTreeIcon = getExtraTreeIcon;
    my.changeNodeStatus = changeNodeStatus;
    my.build_lo_data = build_lo_data;
    my.create_insert_page_menu = create_insert_page_menu;
    my.getAttributeValue = getAttributeValue;
    my.setAttributeValue = setAttributeValue;
    my.displayParameter = displayParameter;
	my.displayGroup = displayGroup;
    my.convertTextAreas = convertTextAreas;
    my.convertTextInputs = convertTextInputs;
    my.convertColorPickers = convertColorPickers;
    my.convertDataGrids = convertDataGrids;
    my.showToolBar = showToolBar;
    my.getIcon = getIcon;
    my.insertOptionalProperty = insertOptionalProperty;
    my.getPageList = getPageList;
    my.hideInlineEditor = hideInlineEditor;

    return parent;

})(jQuery, EDITOR || {});


