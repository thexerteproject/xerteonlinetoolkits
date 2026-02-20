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
		currtheme,

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
				hint = itemData.thumb != undefined ? hint + (itemData.example != undefined ? '<a href="' + itemData.example + '" data-featherlight="iframe" class="pageExample">' : '') + '<img class="preview_thumb" alt="' + itemData.name + ' ' + language.insertDialog.$preview + '" src="modules/xerte/parent_templates/Nottingham/' + itemData.thumb + '" />' + (itemData.example != undefined ? '</a>' : '') : hint;
				hint = itemData.example != undefined ? hint + '<p><a href="' + itemData.example + '" data-featherlight="iframe" class="pageExample exampleButton"><i class="fa fa-play-circle"></i>' + language.insertDialog.$example + '</a></p>' : hint;
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
				// if deprecatedLevel is low the appearance is slightly different
				var isDeprecated = enabled[0],
					deprecatedLevel = enabled[1];

                if (isDeprecated) {
                    return '<i class="deprecatedIcon iconEnabled fa ' + (deprecatedLevel == 'low' ? 'fa-info-circle' : 'fa-exclamation-triangle') + ' ' + (deprecatedLevel == 'low' ? 'deprecatedLevel_low' : '') + '" id="' + key + '_deprecated" title ="' + tooltip + '"></i>';
                }
                else {
                    return '<i class="deprecatedIcon iconDisabled fa ' + (deprecatedLevel == 'low' ? 'fa-info-circle' : 'fa-exclamation-triangle') + ' ' + (deprecatedLevel == 'low' ? 'deprecatedLevel_low' : '') + '" id="' + key + '_deprecated"></i>';
                }
            case "unmark":
                if (enabled)
                {
                    return '<i class="unmarkCompletionIcon iconEnabled far fa-times-circle " id="' + key + '_unmark" title ="' + language.unmarkForCompletion.$tooltip + '"></i>';
                }
                else
                {
                    return '<i class="unmarkCompletionIcon iconDisabled far fa-times-circle " id="' + key + '_unmark" title ="' + language.unmarkForCompletion.$tooltip + '"></i>';
                }
            case "hidden":
                if (enabled) {
                    return '<i class="hiddenIcon iconEnabled fa fa-eye-slash " id="' + key + '_hidden" title ="' + tooltip + '"></i>';
                }
                else {
                    return '<i class="hiddenIcon iconDisabled fa fa-eye-slash " id="' + key + '_hidden" title ="' + tooltip + '"></i>';
                }
			case "advanced":
                if (enabled) {
                    return '<i class="advancedIcon iconEnabled fa fa-exclamation-circle " id="' + key + '_advanced" title ="' + language.advancedPage.$tooltip + '"></i>';
                }
                else {
                    return '<i class="advancedIcon iconDisabled fa fa-exclamation-circle " id="' + key + '_advanced" title ="' + language.advancedPage.$tooltip + '"></i>';
                }
			case "standalone":
                if (enabled) {
                    return '<i class="standaloneIcon iconEnabled fa fa-external-link-alt " id="' + key + '_standalone" title ="' + language.standalonePage.$tooltip + '"></i>';
                }
                else {
                    return '<i class="standaloneIcon iconDisabled fa fa-external-link-alt " id="' + key + '_standalone" title ="' + language.standalonePage.$tooltip + '"></i>';
                }
			case "password":
                if (enabled) {
                    return '<i class="passwordIcon iconEnabled fa fa-lock " id="' + key + '_password" title ="' + language.passwordPage.$tooltip + '"></i>';
                }
                else {
                    return '<i class="passwordIcon iconDisabled fa fa-lock " id="' + key + '_password" title ="' + language.passwordPage.$tooltip + '"></i>';
                }
            case "milestone":
                if (enabled) {
                    return '<i class="milestoneIcon iconEnabled fa fa-location-dot " id="' + key + '_milestone" title ="' + language.milestonePage.$tooltip + '"></i>';
                }
                else {
                    return '<i class="milestoneIcon iconDisabled fa fa-location-dot " id="' + key + '_milestone" title ="' + language.milestonePage.$tooltip + '"></i>';
                }
        }
    },

    changeNodeStatus = function(key, item, enabled, newtext)
    {
        // Get icon states
        var deprecatedState = ($("#"+key+"_deprecated.iconEnabled").length > 0);
        var hiddenState = ($("#"+key+"_hidden.iconEnabled").length > 0);
        var hiddenContentState = ($("#"+key+"_hidden.iconEnabled").length > 0);
		var passwordState = ($("#"+key+"_password.iconEnabled").length > 0);
		var standaloneState = ($("#"+key+"_standalone.iconEnabled").length > 0);
        var unmarkState = ($("#"+key+"_unmark.iconEnabled").length > 0);
        var milestoneState = ($("#"+key+"_milestone.iconEnabled").length > 0);
        var change = false;
        var tooltip = "";
		var level;
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
            case "hiddenContent":
                if (hiddenContentState != enabled)
                    change = true;
                break;
			case "password":
                if (passwordState != enabled)
                    change = true;
                break;
			case "standalone":
                if (standaloneState != enabled)
                    change = true;
                break;
            case "unmark":
                if (unmarkState != enabled)
                    change = true;
                break;
            case "milestone":
                if (milestoneState != enabled)
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
				level = $("#" + key + '_deprecated').hasClass('deprecatedLevel_low') ? 'low' : undefined;
            } else if (item == "hidden") {
                tooltip = language.hidePage.$tooltip;
            } else if (item == "hiddenContent") {
                tooltip = language.hideContent.$tooltip;
            }
            var deprecatedIcon = getExtraTreeIcon(key, "deprecated", [item == "deprecated" ? enabled : deprecatedState, level], tooltip);
            var hiddenIcon = getExtraTreeIcon(key, "hidden", (item == "hidden" || item == "hiddenContent" ? enabled : hiddenState), tooltip);
			var passwordIcon = getExtraTreeIcon(key, "password", (item == "password" ? enabled : passwordState));
			var standaloneIcon = getExtraTreeIcon(key, "standalone", (item == "standalone" ? enabled : standaloneState));
            var unmarkIcon = getExtraTreeIcon(key, "unmark", (item == "unmark" ? enabled : unmarkState));
            var milestoneIcon = getExtraTreeIcon(key, "milestone", (item == "milestone" ? enabled : milestoneState));
            var nodetext;
            if (item == "text")
            {
                nodetext = newtext;
            }
            else {
                nodetext = $("#" + key + '_text').text();
            }
            nodetext = '<span id="' + key + '_container">' + unmarkIcon + hiddenIcon + milestoneIcon + passwordIcon + standaloneIcon + deprecatedIcon + '</span><span id="' + key + '_text">' + nodetext + '</span>';
            tree.rename_node(node, nodetext);
            //tree.set_text(node, nodetext);
            //tree.refresh();
            // debugging
            node = tree.get_node(key, false);
        }
    },

    // Recursive function to traverse the xml and build
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

        // cdata-section
        lo_data[key] = {};
        lo_data[key]['attributes'] = attributes;

        if (xmlData[0].firstChild && xmlData[0].firstChild.nodeType == 4) {
            // CDATA text in model answer results page is moved to an attribute instead as the page may now contain nested items
            if (lo_data[key].attributes.nodeName == "modelAnswerResults") {
                lo_data[key].attributes.text = makeAbsolute(xmlData[0].firstChild.data);
                if (!alreadyUpgraded)
                {
                    lo_data[key]['data'] = addLineBreaks(lo_data[key].attributes.text);
                }
            } else {
                lo_data[key]['data'] = makeAbsolute(xmlData[0].firstChild.data);
                if (!alreadyUpgraded)
                {
                    lo_data[key]['data'] = addLineBreaks(lo_data[key]['data']);
                }
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

        var deprecatedIcon = getExtraTreeIcon(key, "deprecated", [wizard_data[xmlData[0].nodeName].menu_options.deprecated, wizard_data[xmlData[0].nodeName].menu_options.deprecatedLevel], wizard_data[xmlData[0].nodeName].menu_options.deprecated);
        var hiddenIcon = getExtraTreeIcon(key, "hidden", xmlData[0].getAttribute("hidePage") == "true" || xmlData[0].getAttribute("hideContent") == "true", xmlData[0].getAttribute("hidePage") == "true" ? language.hidePage.$tooltip : language.hideContent.$tooltip);
        var passwordIcon = getExtraTreeIcon(key, "password", xmlData[0].getAttribute("password") != undefined && xmlData[0].getAttribute("password") != '');
        var standaloneIcon = getExtraTreeIcon(key, "standalone", xmlData[0].getAttribute("linkPage") == "true" || xmlData[0].getAttribute("linkPageChapter") == "true");
        var unmarkIcon = getExtraTreeIcon(key, "unmark", xmlData[0].getAttribute("unmarkForCompletion") == "true" && parent_id == 'treeroot');
		var advancedIcon = getExtraTreeIcon(key, "advanced", simple_mode && parent_id == 'treeroot' && template_sub_pages.indexOf(lo_data[key].attributes.nodeName) == -1);
		var milestoneIcon = getExtraTreeIcon(key, "milestone", xmlData[0].getAttribute("milestone") == "true");

        treeLabel = '<span id="' + key + '_container">' + unmarkIcon + hiddenIcon + milestoneIcon + passwordIcon + standaloneIcon + deprecatedIcon + advancedIcon + '</span><span id="' + key + '_text">' + treeLabel + '</span>';

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
        if (name == "HotSpot")
        {
            return {found : true, value: "ERROR"};
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

    evaluateConditionExpression = function(ctree, key, formState, source = 'attribute') {
        switch (ctree.type) {
            case "Literal":
                return ctree.value;
            case "LogicalExpression":
                if (ctree.operator == "&&") {
                    return evaluateConditionExpression(ctree.left, key, formState, source) && evaluateConditionExpression(ctree.right, key, formState, source);
                } else {
                    return evaluateConditionExpression(ctree.left, key, formState, source) || evaluateConditionExpression(ctree.right, key, formState, source);
                }
            case "BinaryExpression":
                switch (ctree.operator) {
                    case "==":
                        return evaluateConditionExpression(ctree.left, key, formState, source) == evaluateConditionExpression(ctree.right, key, formState, source);
                    case "!=":
                        return evaluateConditionExpression(ctree.left, key, formState, source) != evaluateConditionExpression(ctree.right, key, formState, source);
                    case "<":
                        return evaluateConditionExpression(ctree.left, key, formState, source) < evaluateConditionExpression(ctree.right, key, formState, source);
                    case "<=":
                        return evaluateConditionExpression(ctree.left, key, formState, source) <= evaluateConditionExpression(ctree.right, key, formState, source);
                    case ">":
                        return evaluateConditionExpression(ctree.left, key, formState, source) > evaluateConditionExpression(ctree.right, key, formState, source);
                    case ">=":
                        return evaluateConditionExpression(ctree.left, key, formState, source) >= evaluateConditionExpression(ctree.right, key, formState, source);
                    default:
                        return null;
                }
            case "MemberExpression":
                if (ctree.object.name == 'parent') {
                    var tree = $.jstree.reference("#treeview");
                    var parent = tree.get_parent(key);
                    return evaluateConditionExpression(ctree.property, parent, formState, source);
                }else if (ctree.object.name == 'treeroot') {
                    var key = 'treeroot';
                    return evaluateConditionExpression(ctree.property, key);
                }
                else if (ctree.object.object.name == 'theme_list') {
					return theme_list[currtheme][ctree.property.name];
				} else {
                    return null;
                }
                break;
            case "CallExpression":
                if (ctree.callee.name != '') {
                    let func = ctree.callee.name + '(';
                    for(let i = 0; i < ctree.arguments.length; i++) {
                        if (i > 0) {
                            func += ', ';
                        }
                        switch (ctree.arguments[i].type)
                        {
                            case "Literal":
                                func += ctree.arguments[i].raw;
                                break;
                            case "Identifier":
                                var attrs = lo_data[key]['attributes'];
                                if (typeof attrs[ctree.name] != "undefined") {
                                    func += attrs[ctree.name];
                                } else {
                                    try {
                                        var value = eval(ctree.name);
                                        func += value;
                                    }
                                    catch (e){
                                        return false;
                                    }
                                }
                                break;
                            default:
                                func += evaluateConditionExpression(ctree.arguments[i], key, formState, source);
                                break;
                        }
                    }
                    func += ')';
                    try {
                        return eval(func);
                    }
                    catch (e) {
                        return false;
                    }
                }
                break;
            case "Identifier":
                if (source === 'attribute') {
                    var attrs = lo_data[key]['attributes'];
                    if (typeof attrs[ctree.name] != "undefined") {
                        return attrs[ctree.name];
                    } else {
                        try {
                            var value = eval(ctree.name);
                            return value;
                        } catch (e) {};
                        return null;
                    }
                } else {
                    //get current data from lightbox form.
                    if (typeof formState[ctree.name] != 'undefined') {
                        return formState[ctree.name];
                    } else {
                        return null;
                    }
                }
            case "UnaryExpression":
                if (ctree.operator == '!') {
                    return !evaluateConditionExpression(ctree.argument, key, formState, source);
                } else {
                    return null;
                }
            default:
                // Unexpected node parsed
                return null;
        }
    },

    // This function behaves the same as the php function is_user_permitted (of user_library.php)
    // Assumes that the javascript variable roles is an array that contains all the assigned roles of the current user
    // This function is used in conditions of xwd files, so DO NOT REMOVE
    hasrole = function(role)
    {
        if (typeof roles == 'undefined')
        {
            return false;
        }
        if (roles.includes(role))
        {
            return true;
        }
        if (roles.includes('super'))
        {
            return true;
        }
        return false;
    },

        //Required for resolving xml conditionals for AI or other API-based services, please do not remove
    vendor_is_available = function (vendorType, vendor = "all") {
        // Helper: is a single row active?
        const isRowActive = function (row) {
            // Must match the type/category
            if (row.type !== vendorType) {
                return false;
            }

            // Must be enabled
            if (row.enabled != "1") {
                return false;
            }

            // If this vendor doesn't require a key, it's active as-is
            if (row.needs_key == "0") {
                return true;
            }

            // If it *does* require a key, check via vendor_options
            return vendorHasApiKey(vendorType, row.vendor);
        };

        // If we're checking a specific vendor in this category
        if (vendor !== "all") {
            for (let i = 0; i < management_helper_table.length; i++) {
                const row = management_helper_table[i];
                if (row.type === vendorType && row.vendor === vendor) {
                    return isRowActive(row);
                }
            }
            return false; // no matching row
        }

        // vendor === "all": is there at least one active vendor in this category?
        for (let i = 0; i < management_helper_table.length; i++) {
            const row = management_helper_table[i];

            if (isRowActive(row)) {
                return true; // found at least one active vendor
            }
        }

        return false; // none active
    },

    vendor_has_option = function(option, vendor = "all") {
        if(vendor == "all") {
            for(let i = 0; i < management_helper_table.length; i++){
                let vender_options = management_helper_table[i];
                if(option == "enabled"){
                    return vender_options.enabled == "1";
                }else {
                    for(let j = 0; j < vender_options.sub_options.length; j++){
                        return vender_options.sub_options[j] == "true";
                    }
                }
            }
        }else {
            for(let i = 0; i < management_helper_table.length; i++){
                let vender_options = management_helper_table[i];
                if(vender_options.vendor == vendor) {
                    if(option == "enabled"){
                        return vender_options.enabled == "1";
                    }else {
                        for(let j = 0; j < vender_options.sub_options.length; j++){
                            return vender_options.sub_options[j] == "true";
                        }
                    }
                    return false;
                }
            }
        }
        return false;
    },

    evaluateCondition = function(condition, key, formState, mode)
    {
        var tree = jsep(condition);
        var result = evaluateConditionExpression(tree, key, formState, mode);
        return (result == null ? false : result);
    },

    findDefaultAttributeValue = function (name, all_options) {
        for (let i = 0; i < (all_options?.length || 0); i++) {
            const opt = all_options[i];
            if (opt?.name === name) {
                const dv = opt?.value?.defaultValue;
                return dv;
            }
        }
        return undefined; // no matching option or no default provided
    },

    displayParameter = function (id, all_options, name, value, key, lightbox = "", lightboxMode= "none", nodelabel)
    {
        var options = (nodelabel ? wizard_data[name].menu_options : getOptionValue(all_options, name));
        var label = (nodelabel ? nodelabel : options.label);
        var deprecated = false;
		var	groupChild = $(id).parents('.wizardgroup').length > 0 ? true : false;
        //get input field value from value.
        let fieldValue = "";
        let formState = {};
        if (typeof value === 'object' && value !== null) {
            formState = value;
            if (formState.hasOwnProperty(name)) {
                fieldValue = formState[name];
            } else {
                const dv = findDefaultAttributeValue(name, all_options);
                fieldValue = dv !== undefined ? dv : ""; // fall back to "" only if truly no default
            }
        } else {
            fieldValue = value;
        }

        if (options != null)
        {
            var flashonly = $('<img>')
                .attr('src', 'editor/img/flashonly.png')
                .attr('title', 'Flash only attribute');

            if (options.condition)
            {

                var visible = evaluateCondition(options.condition, key, formState,
                    lightboxMode === "form" ? "form" : "attribute");
                if (!visible)
                {
                    return;
                }
            }

            var tr = $('<tr>');
            //todo move to footer of lightbos (footer does not yet exists)
            if(options.advanced == "true" && lightboxMode == "form"){
                    if(window?.showAdvanced?.[key] == undefined) {
                        if (window.showAdvanced == undefined){
                            window.showAdvanced = {};
                        }
                    }
                    setTimeout(function() {
                        $("#lb_advanced_cb, #lb_advanced_cb_span")
                            .switchClass("disabled", "enabled")
                            .prop("disabled", false);
                    }, 250);

                    if(window.showAdvanced[key] == undefined) {
                            showAdvanced[key] = { 'enabled' : false, 'group': options.group };
                    }
                    if(!window.showAdvanced[key]['enabled']) {
                            tr.css("display", "none");
                    }
            }

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

                if (options.optional == 'true' && groupChild == false && lightbox == "") {
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
            else if (options.optional == 'true' && groupChild == false && lightbox == "") {
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

			if (options.type.toLowerCase() === "info") {
                tdlabel.attr("colspan", "2");
			    tr.append(tdlabel)
            } else {
                tr.append(tdlabel)
                    .append($('<td>')
                        .addClass("wizardvalue")
                        .append($('<div>')
                            .addClass("wizardvalue_inner")
                            .append(displayDataType(fieldValue, options, name, key, label, lightboxMode))));
            }


            if (lightbox === "") {
                $(id).append(tr);
            } else {
                lightbox.append(tr);
            }
            if (options.optional == 'true' && groupChild == false && lightbox == "") {
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
				.append($('<i>')
				.attr('id', 'deprbtn_' + name)
				.addClass('fa')
				.addClass('fa-exclamation-triangle')
				.addClass("xerte-icon")
				.attr('title', options.deprecated)
				.height(14)
				.addClass("deprecated deprecatedIcon"));

			if (options.optional == 'true') {
				group.addClass("wizardoptional");
			}

			if (options.optional == 'true' && options.group == undefined) { // nested groups don't have delete btn
				legend
					.addClass('noindent')
					.prepend($('<i>')
						.attr('id', 'optbtn_' + name)
						.addClass('fa')
						.addClass('fa-trash')
						.addClass("xerte-icon")
						.height(14)
						.addClass("optional"));
			} else {
				group.addClass("wizardnestedgroup");
			}

			legend.append('<span class="legend_label">' + options.label + '</span>');

			tr.attr('id', 'group_' + name)
				.addClass("wizardattribute")
				.addClass("wizarddeprecated")

		} else if (options.optional == 'true') {

			group.addClass("wizardoptional")

			if (options.group == undefined) { // nested groups don't have delete btn
				legend
					.addClass('noindent')
					.append($('<i>')
						.attr('id', 'optbtn_' + name)
						.addClass('fa')
						.addClass('fa-trash')
						.addClass("xerte-icon")
						.height(14)
						.addClass("optional"));
			} else {
				group.addClass("wizardnestedgroup");
			}

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

		if (options.group == undefined) { // nested groups aren't collapsible
			$('<i class="minMaxIcon fa fa-caret-down"></i>').appendTo(legend.find('.legend_label'));

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
					$fieldset.find('.table_holder').slideDown(400, resizeDataGrids);

					$icon
						.removeClass('fa-caret-down')
						.addClass('fa-caret-up');

					$fieldset.removeClass('collapsed');

                    // refresh codemirror fields as otherwise they may show empty until in focus
                    $fieldset.find(".CodeMirror").each(function() {
                        $(this)[0].CodeMirror.refresh();
                    });
				}
			});
		}

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

		if (options.group == undefined) {
			$(id).append(tr);

            // collapse optional property groups initially on wizard load unless expand groups box is checked (they will be expanded when just added)
            if (group.hasClass('wizardoptional') && !$('#groups_cb').prop('checked')) {
                group.addClass('collapsed');
                group.find('.table_holder').slideUp(0);
            }
		} else {
			$('#groupTable_' + options.group).append(tr);
		}

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
		// including children of nested groups
		if (children) {
			
			function getChildren(groupChildren) {
				for (var i=0; i<groupChildren.length; i++) {
					
					if (groupChildren[i].value.type == "group") {
						
						getChildren(groupChildren[i].value.children);
						
					} else {
						
						toDelete.push(groupChildren[i].name);
						
					}
				}
			}
			
			getChildren(children);
			
		} else {
			toDelete.push(name);
		}

        // Find the property in the data store
        var key = parent.tree.getSelectedNodeKeys();

		for (var i=0; i<toDelete.length; i++) {
			if (toDelete[i] == "hidePage" || toDelete[i] == "hideContent") {
			    changeNodeStatus(key, "hidden", false);
			}
			if (toDelete[i] == "password") {
			    changeNodeStatus(key, "password", false);
			}
			if (toDelete[i] == "linkPage" || toDelete[i] == "linkPageChapter") {
			    changeNodeStatus(key, "standalone", false);
			}
            if (toDelete[i] == "milestone") {
                changeNodeStatus(key, "milestone", false);
            }
            if (toDelete[i] == "unmarkForCompletion"){
                changeNodeStatus(key, "unmark", false);
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

        parent.tree.showNodeData(key, true);
    },

    insertOptionalProperty = function (key, name, defaultvalue, load, scrollToId)
    {
		// Place attribute
		lo_data[key]['attributes'][name] = defaultvalue;

        // update tree icon if necessary
        changeTreeNodeStatus(key, name, defaultvalue);

		// Enable the optional parameter button
		$('#insert_opt_' + name)
			.prop('visible', true);

		if (load != false) {
			parent.tree.showNodeData(key, false, scrollToId);
		}
    },

    showToolBar = function(show){
        defaultToolBar = show;
        /*var tree = $.jstree.reference("#treeview");
        var ids = tree.get_selected();
        var id;
        if (ids.length>0)
        {
            id = ids[0];
            parent.tree.showNodeData(id, true);
        }*/
        $(".cke_toolbox_collapser").each(function(){
          var min = $(this).hasClass("cke_toolbox_collapser_min");
          if (show && min || !show && !min)
            $(this).click();
        });
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

        //if grid is a corpusGrid, perform the AI Context-specific verifications and proceed only if the posted data passes all the reqs
        if (name == 'corpus'){
            function normalizePath(raw) {
                // strip any surrounding single or double quotes, and trim whitespaces
                raw = raw.replace(/^['"]+|['"]+$/g, '').trim();

                // 1) Full URLs with scheme (http:// or https://)
                if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(raw)) {
                    try {
                        const u = new URL(raw);
                        if (u.origin !== window.location.origin) {
                            // External URL => leave intact
                            return raw;
                        }
                        // Same-origin URL => strip after /RAG/corpus/ or preview.xml if present
                        const idxCorpus = u.pathname.indexOf('/RAG/corpus/');
                        const idxPreview = u.pathname.indexOf('preview.xml');
                        if (idxCorpus !== -1) {
                            return u.pathname.slice(idxCorpus + 1).replace(/^['"]+|['"]+$/g, '');
                        }
                        if (idxPreview !== -1) {
                            return u.pathname.slice(idxPreview).replace(/^['"]+|['"]+$/g, '');
                        }
                        return raw;
                    } catch {
                        alert(`${raw} ${language.vendorApi.contextAlerts.malformedContextUrlMsg}`);
                        throw new Error(`Malformed URL: ${raw}`);
                    }
                }

                // 2) Bare hostnames without scheme => user error
                if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/|$)/.test(raw)) {
                    alert(`${raw} ${language.vendorApi.contextAlerts.missingHttpMsg}`);
                    throw new Error(`Invalid URL: ${raw}`);
                }

                // 3) Anywhere the text "RAG/corpus/" or "preview.xml" appears, pull out from there
                const idxAny = raw.indexOf('RAG/corpus/');
                const idxPreviewAny = raw.indexOf('preview.xml');
                if (idxAny !== -1) {
                    // slice and strip quotes again just in case
                    return raw.slice(idxAny).replace(/^['"]+|['"]+$/g, '');
                }
                if (idxPreviewAny !== -1) {
                    let lolang = loLanguage;
                    // slice and strip quotes again just in case
                    //When normalizing in the corpus, if we see preview.xml, we update the LO in corpus.
                    let completion_info = updateCorpusSingle(false, true, false, lolang);
                    const first = completion_info.results?.[0] || {};
                    const displaymsg = first.rag_status || first.transcription_status || completion_info?.error || 'No status available';
                    alert(displaymsg);
                    return raw.slice(idxPreviewAny).replace(/^['"]+|['"]+$/g, '');
                }

                // 4) Nothing matched, error
                alert(`${raw} ${language.vendorApi.contextAlerts.unrecognisedContextPathMsg}`);
                throw new Error(`Unrecognized path: ${raw}`);
            }
            //Upload a single file to the corpus
            async function updateCorpusSingle(postData, corpusGrid = false, useLoInCorpus = false, language) {
                // Show wait cursor
                $('body, .featherlight, .featherlight-content').css("cursor", "wait");

                const baseURL = rlopathvariable.substr(rlopathvariable.indexOf("USER-FILES"));

                // Build grid row
                let singleRow;
                if (!useLoInCorpus) {
                    singleRow = {
                        col_1: postData['col_1'],
                        col_2: normalizePath(postData['col_2']),
                        col_3: postData['col_3'],
                        col_4: ""
                    };
                } else {
                    singleRow = {
                        col_1: "",
                        col_2: [],
                        col_3: "",
                        col_4: ""
                    };
                }

                const payload = { name, baseURL, gridData: [singleRow], corpusGrid, useLoInCorpus, language };

                try {
                    // 1) Start the job and wait for the start response (job_id)
                    const resp = await new Promise((resolve, reject) => {
                        $.ajax({
                            url: 'editor/ai/rag/syncCorpus_start.php',
                            method: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify(payload),

                            success: function (resp) {
                                console.log('Corpus sync started:', resp);

                                resolve(resp); // just resolve the start response
                            },

                            error: function (xhr, status, err) {
                                console.error('Corpus sync failed:', err);
                                alert(`${language.vendorApi.contextAlerts.syncErrorGenericMsg}`);
                                reject(err);
                            }
                        });
                    });

                    // 2) Now poll until the job is actually finished
                    const finalStatus = await pollJobStatus(resp.job_id, baseURL);

                    // 3) Return final status / completion info
                    return finalStatus;

                } finally {
                    // Reset cursor no matter what
                    $('body, .featherlight, .featherlight-content').css("cursor", "default");
                }
            }

            async function pollJobStatus(jobId, baseURL) {
                return new Promise((resolve, reject) => {

                    const statusUrl = "editor/ai/rag/syncCorpus_status.php?job_id=" +
                        encodeURIComponent(jobId) + "&baseURL=" +
                        encodeURIComponent(baseURL);

                    function checkStatus() {
                        $.ajax({
                            url: statusUrl,
                            method: "GET",
                            cache: false,
                            success: function (data) {
                                if (data.status === "processed") {
                                    const first = data['completion_info'].results?.[0] || {};
                                    resolve(data['completion_info']);
                                    return;
                                }

                                if (data.status === "error") {
                                    reject(data['completion_info']);
                                    return;
                                }

                                setTimeout(checkStatus, 3000);
                            },
                            error: function (xhr, status, err) {
                                console.log("Polling error:", err);

                                // Fail after a set time, assuming polling fails (not that the job resulted in an error)
                                setTimeout(checkStatus, 5000);
                            }
                        });
                    }

                    // start polling
                    checkStatus();
                });
            }

            function updateGrid(name, id) {
                const baseURL = rlopathvariable.substr(rlopathvariable.indexOf("USER-FILES"));

                $.ajax({
                    url: 'editor/ai/rag/getCorpus.php',
                    method: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify({
                        name: name,
                        baseURL: baseURL,
                        type: name,
                        gridId: id,
                        format: "csv"
                    }),
                    success: function(resp) {
                        if (!resp?.corpus) {
                            alert(`${language.vendorApi.contextAlerts.noContextReturnedSubmitMsg}`);
                            return;
                        }
                        var gridId = '#' + resp.gridId + '_jqgrid';
                        $(gridId).jqGrid('clearGridData');
                        setAttributeValue(key, [resp.type], [resp.corpus]);
                        var rows = readyLocalJgGridData(key, resp.type);
                        $(gridId).jqGrid('setGridParam', {data: rows});
                        $(gridId).trigger('reloadGrid');

                        // show a count
                        let totalFiles = 0;
                        if (resp.corpus && typeof resp.corpus === "string") {
                            // Remove leading/trailing whitespace, split on newlines, filter out empty lines
                            totalFiles = resp.corpus.trim().split('\n').filter(line => line.trim() !== '').length;
                            //alert(`✅ Grid updated.`);
                        }
                    },
                    error: function(xhr, status, err) {
                        console.error('Failed to fetch corpus:', err);
                        alert(`${language.vendorApi.contextAlerts.noContextReturnedSubmitMsg}`);
                    }
                });
            }
            (async () => {
                try {
                    let completion_info = await updateCorpusSingle(postdata, false, false, loLanguage);
                    const first = completion_info.results?.[0] || {};
                    const displaymsg = first.rag_status || first.transcription_status || completion_info?.error || 'No status available';
                    alert(displaymsg);

                } catch (e) {
                    console.error(e);
                }

                //There is no need to continue with the rest, because updateGrid and updateCorpusSingle already handle the data to and from the backend
                if ((addMode && options.closeAfterAdd) || (!addMode && options.closeAfterEdit)) {
                    // close the edit/add dialog
                    $.jgrid.hideModal("#editmod"+grid_id,
                        {gb:"#gbox_"+grid_id,jqm:options.jqModal,onClose:options.onClose});
                }

                //Always update the grid so that it matches the actual corpus
                updateGrid(name, id);

                this.processing = true;
                return {};
            })();
        }

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

        var xerte = convertjqGridData(jqGrGridData[key + '_' + id], id);
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

        if (name == 'corpus'){
            function normalizePath(raw) {
                // strip any surrounding single or double quotes, and trim whitespaces
                raw = raw.replace(/^['"]+|['"]+$/g, '').trim();

                // 1) Full URLs with scheme (http:// or https://)
                if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(raw)) {
                    try {
                        const u = new URL(raw);
                        if (u.origin !== window.location.origin) {
                            // External URL => leave intact
                            return raw;
                        }
                        // Same-origin URL => strip after /RAG/corpus/ or preview.xml if present
                        const idxCorpus = u.pathname.indexOf('/RAG/corpus/');
                        const idxPreview = u.pathname.indexOf('preview.xml');
                        if (idxCorpus !== -1) {
                            return u.pathname.slice(idxCorpus + 1).replace(/^['"]+|['"]+$/g, '');
                        }
                        if (idxPreview !== -1) {
                            return u.pathname.slice(idxPreview).replace(/^['"]+|['"]+$/g, '');
                        }
                        return raw;
                    } catch {
                        alert(`${raw} ${language.vendorApi.contextAlerts.malformedContextUrlMsg}`);
                        throw new Error(`Malformed URL: ${raw}`);
                    }
                }

                // 2) Bare hostnames without scheme => user error
                if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/|$)/.test(raw)) {
                    alert(`${raw} ${language.vendorApi.contextAlerts.missingHttpMsg}`);
                    throw new Error(`Invalid URL: ${raw}`);
                }

                // 3) Anywhere the text "RAG/corpus/" or "preview.xml" appears, pull out from there
                const idxAny = raw.indexOf('RAG/corpus/');
                const idxPreviewAny = raw.indexOf('preview.xml');
                if (idxAny !== -1) {
                    // slice and strip quotes again just in case
                    return raw.slice(idxAny).replace(/^['"]+|['"]+$/g, '');
                }

                // 4) Nothing matched, error
                alert(`${raw} ${language.vendorApi.contextAlerts.unrecognisedContextPathMsg}`);
                throw new Error(`Unrecognized path: ${raw}`);
            }
            //Start a sync job
            async function corpusUpdate(grid, name, id) {
                const baseURL = rlopathvariable.substr(rlopathvariable.indexOf("USER-FILES"));

                const allRows = grid.map(row => {
                    const raw = row['col_2'];
                    row['col_2'] = normalizePath(raw);
                    return row;
                });

                const payload = { name, baseURL, gridData: allRows };

                //  Show wait cursor
                $('body, .featherlight, .featherlight-content').css("cursor", "wait");
                try {
                    let resp = await new Promise((resolve, reject) => {
                        $.ajax({
                            url: 'editor/ai/rag/syncCorpus_start.php',
                            method: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify(payload),
                            success: function(resp) {
                                resolve(resp);
                            },
                            error: function(xhr, status, err) {
                                alert(`${language.vendorApi.contextAlerts.syncErrorGenericMsg}`);
                                reject(err);
                            },
                            complete: function() {
                                //  Reset cursor no matter what
                                $('body, .featherlight, .featherlight-content').css("cursor", "default");
                            }
                        });
                    });

                    // 2) Now poll until the job is actually finished
                    const finalStatus = await pollJobStatus(resp.job_id, baseURL);

                    // 3) Return final status / completion info
                    return finalStatus;
                } finally {
                    // Reset cursor no matter what
                    $('body, .featherlight, .featherlight-content').css("cursor", "default");
                }
            }

            async function pollJobStatus(jobId, baseURL) {
                return new Promise((resolve, reject) => {

                    const statusUrl = "editor/ai/rag/syncCorpus_status.php?job_id=" +
                        encodeURIComponent(jobId) + "&baseURL=" +
                        encodeURIComponent(baseURL);

                    function checkStatus() {
                        $.ajax({
                            url: statusUrl,
                            method: "GET",
                            cache: false,
                            success: function (data) {

                                if (data.status === "processed") {
                                    const first = data['completion_info'].results?.[0] || {};
                                    resolve(data['completion_info']);
                                    return;
                                }

                                if (data.status === "error") {
                                    reject(data['completion_info']);
                                    return;
                                }

                                setTimeout(checkStatus, 3000);
                            },
                            error: function (xhr, status, err) {
                                console.log("Polling error:", err);
                                setTimeout(checkStatus, 5000);
                            }
                        });
                    }

                    // start polling
                    checkStatus();
                });
            }

            function updateGrid(name, id) {
                const baseURL = rlopathvariable.substr(rlopathvariable.indexOf("USER-FILES"));

                $.ajax({
                    url: 'editor/ai/rag/getCorpus.php',
                    method: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify({
                        name: name,
                        baseURL: baseURL,
                        type: name,
                        gridId: id,
                        format: "csv"
                    }),
                    success: function(resp) {
                        if (!resp?.corpus) {
                            alert(`${language.vendorApi.contextAlerts.noContextReturnedSubmitMsg}`);
                            return;
                        }
                        var gridId = '#' + resp.gridId + '_jqgrid';
                        $(gridId).jqGrid('clearGridData');
                        setAttributeValue(key, [resp.type], [resp.corpus]);
                        var rows = readyLocalJgGridData(key, resp.type);
                        $(gridId).jqGrid('setGridParam', {data: rows});
                        $(gridId).trigger('reloadGrid');

                        // show a count
                        let totalFiles = 0;
                        if (resp.corpus && typeof resp.corpus === "string") {
                            // Remove leading/trailing whitespace, split on newlines, filter out empty lines
                            totalFiles = resp.corpus.trim().split('\n').filter(line => line.trim() !== '').length;
                        }
                    },
                    error: function(xhr, status, err) {
                        console.error('Failed to fetch corpus:', err);
                        alert(`${language.vendorApi.contextAlerts.noContextReturnedSubmitMsg}`);
                    }
                });
            }

            (async () => {
                try {
                    await corpusUpdate(jqGrGridData[gridId], name, id);
                    updateGrid(name, id);
                } catch (e) {
                    console.error(e);
                }
            })();
        }

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
        parent.tree.showNodeData(key, true);
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
        parent.tree.showNodeData(key, true);
    },
    //pass id to sort data
    convertjqGridData = function(data, id)
    {
        if (id !== undefined) {
            var sortColumnName = $('#' + id + '_jqgrid').jqGrid('getGridParam','sortname');
            var sortOrder = $('#' + id + '_jqgrid').jqGrid('getGridParam','sortorder');
            var colName = Object.keys(data[0])[1];
            if (sortColumnName !== '' && sortOrder == 'asc') {
                data.sort((a,b) => (a[colName] > b[colName]) ? 1 : ((b[colName] > a[colName]) ? -1 : 0));
            } else if (sortColumnName !== '' && sortOrder == 'desc') {
                data.sort((a,b) => (a[colName] > b[colName]) ? -1 : ((b[colName] > a[colName]) ? 1 : 0));
            }
        }

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
        var file_loc = 'media';
        if (options.type === 'CorpusGrid'){
            file_loc = 'CorpusGrid';
        }

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
        lti_session = lti_session !== "" ? "&" + lti_session : "";
        var ckoptions = {
            filebrowserBrowseUrl : 'editor/elfinder/browse.php?mode=cke' + lti_session + '&type=media&uploadDir='+rlopathvariable+'&uploadURL='+rlourlvariable.substr(0, rlourlvariable.length-1) ,
            filebrowserImageBrowseUrl : 'editor/elfinder/browse.php?mode=cke' + lti_session + '&type=image&uploadDir='+rlopathvariable+'&uploadURL='+rlourlvariable.substr(0, rlourlvariable.length-1) ,
            filebrowserFlashBrowseUrl : 'editor/elfinder/browse.php?mode=cke' + lti_session + '&type=flash&uploadDir='+rlopathvariable+'&uploadURL='+rlourlvariable.substr(0, rlourlvariable.length-1) ,
            uploadUrl : 'editor/uploadImage.php?mode=dragdrop' + lti_session + '&uploadPath='+rlopathvariable+'&uploadURL='+rlourlvariable.substr(0, rlourlvariable.length-1) ,
            uploadAudioUrl : 'editor/uploadAudio.php?mode=record' + lti_session + '&uploadPath='+rlopathvariable+'&uploadURL='+rlourlvariable.substr(0, rlourlvariable.length-1),
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

        // if cellType is media or pageList then we will do something different
		const cellType = options.cellType != undefined ? options.cellType.split(',') : 'false';

		$('#' + ids[0].id + ' textarea:visible, #' + ids[0].id + ' input:visible').each(function(i) {
			var col_id = this.id;

            if (cellType != 'false' && i <= cellType.length-1 && (cellType[i] == "media" || cellType[i] == "pageList")) {
                if (cellType[i] == "media") {
                    // allow file upload - add the upload & preview buttons
                    if (!$(this).hasClass("media")) {
                        $(this)
                            .addClass("media")
                            .width("auto");

                        // add a button that opens media browser when clicked
                        $(this).parent().append('<button id="' + 'browse_' + col_id + '" title="' + language.compMedia.$tooltip + '" class="xerte_button media_browse"></button>');
                        $(this).parent().find("#browse_" + col_id)
                            .click(function () {
                                browseFile(col_id, file_loc);
                            })
                            .append($('<i>').addClass('fa').addClass('fa-lg').addClass('fa-upload').addClass('xerte-icon'));

                        // add a button that shows preview of file when clicked
                        $(this).parent().append('<button id="' + 'preview_' + col_id + '" title="' + language.compPreview.$tooltip + '" class="xerte_button"></button>');
                        $(this).parent().find("#preview_" + col_id)
                            .click(function () {
                                previewFile($(this).parents("tr").find(".CaptionTD").html(), $(this).parents("tr").find(".media")[0].value);
                            })
                            .append($('<i>').addClass('fa').addClass('fa-lg').addClass('fa-search').addClass('xerte-icon'));
                        $(this).parent().append('<button id="' + 'ai_' + col_id + '" title="' + language.compai.$tooltip + '" class="xerte_button"></button>');
                        $(this).parent().find("#ai_" + col_id)
                            .click(function () {
                                previewFile($(this).parents("tr").find(".CaptionTD").html(), $(this).parents("tr").find(".media")[0].value);
                            })
                            .append($('<i>').addClass('fa').addClass('fa-lg').addClass('fa-search').addClass('xerte-icon'));
                    }

                } else {
                    // allow Xerte page to be selected from a drop-down menu
                    $(this).parents("tr").find(".CaptionTD").attr("id", "label_" + col_id);

                    if (!$(this).hasClass("pageList")) {
                        $(this).addClass("pageList")

                        // add a select field containing all pages
                        const $pageSelect = $("<select id='" + col_id + "_pageBrowse' aria-labelledby='label_" + col_id + "' class='page_browse'>")
                            .change(function() {
                                // add info about what's been selected to the input field as this is where the saved data for this cell is
                                // saved in odd format as we want the page name, not the page ID to be visible in the datagrid
                                $("#" + col_id).val('<span data-pageID="' + this.value + '">' + $(this).find("option:eq(" + this.selectedIndex + ")").text() + '</span>');
                            });

                        // add empty entry
                        let $option = $('<option>').attr('value', "");
                        $option.append("&nbsp;");
                        $pageSelect.append($option);

                        $.each(getPageList(), function (page) {
                            $option = $('<option>').attr('value', this[1]);
                            $option.append(this[0]);
                            $pageSelect.append($option);
                        });

                        $(this).before($pageSelect);

                        // hide the normal input field but don't remove it
                        // not just using $(this).hide() as it then doesn't always show the correct info when editing multiple datagrid lines
                        $(this)
                            .attr({
                                "tabindex": "-1",
                                "aria-hidden": "true"
                            })
                            .css({
                                "visibility": "hidden",
                                "width": "0"
                            });
                    }

                    // ensure the correct, current item is selected
                    const thisValue = $(this.value).length > 0 && $(this.value).attr("data-pageID") != undefined ? $(this.value).attr("data-pageID") : "";
                    $("#" + col_id + "_pageBrowse option").each(function(i) {
                        if ((i==0 && thisValue == "") || $(this).attr("value") == thisValue) {
                            $(this).prop('selected', true);
                        } else {
                            $(this).prop('selected', false);
                        }
                    });
                }

            } else if ((wysiwyg.length == 1 && i > 0 && wysiwyg[0] != 'false' && wysiwyg[0] != undefined) || wysiwyg[i] != 'false' && wysiwyg[i] != undefined) {
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

        // there is some text to display when editing the grid - insert above the table
        if (options.gridTxt !== undefined && options.gridTxt != "" && $(".gridTxt").length == 0) {
            $("form.FormGrid table.EditTable").before('<div class="gridTxt">' + options.gridTxt + '<hr/></div>');
        }

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
                showAutoCompleteButton: true,

                autoRefresh: true

            };
            lti_session = lti_session !== "" ? "&" + lti_session : "";
            var ckoptions = {
                filebrowserBrowseUrl : 'editor/elfinder/browse.php?mode=cke' + lti_session + '&type=media&uploadDir='+rlopathvariable+'&uploadURL='+rlourlvariable.substr(0, rlourlvariable.length-1),
                filebrowserImageBrowseUrl : 'editor/elfinder/browse.php?mode=cke' + lti_session + '&type=image&uploadDir='+rlopathvariable+'&uploadURL='+rlourlvariable.substr(0, rlourlvariable.length-1) ,
                filebrowserFlashBrowseUrl : 'editor/elfinder/browse.php?mode=cke' + lti_session + '&type=flash&uploadDir='+rlopathvariable+'&uploadURL='+rlourlvariable.substr(0, rlourlvariable.length-1),
                uploadUrl : 'editor/uploadImage.php?mode=dragdrop' + lti_session + '&uploadPath='+rlopathvariable+'&uploadURL='+rlourlvariable.substr(0, rlourlvariable.length-1) ,
                uploadAudioUrl : 'editor/uploadAudio.php?mode=record' + lti_session + '&uploadPath='+rlopathvariable+'&uploadURL='+rlourlvariable.substr(0, rlourlvariable.length-1) ,
                mathJaxClass :  'mathjax',
                mathJaxLib :    'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_HTMLorMML-full',
                toolbarStartupExpanded : defaultToolBar,
                codemirror : codemirroroptions,
                extraAllowedContent: 'style',
                language : language.$code.substr(0,2),
				editorplaceholder: options.options.placeholder
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
            var strippedValue = val.substring(3);
            if (strippedValue.lastIndexOf('</p>') != strippedValue.length - 4)
            {
                // Strip extra newline
                strippedValue = strippedValue.substring(0, strippedValue.length-5);
            }
            else
            {
                strippedValue = strippedValue.substring(0, strippedValue.length-4);
            }
            return strippedValue.trim();
        }
        else
        {
            return val;
        }
    },

    convertTextInputs = function () {
        lti_session = lti_session !== "" ? "&" + lti_session : "";
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
						[ 'FontAwesome'],
						[ 'RemoveFormat'],
                        [ 'Sourcedialog' ]
                    ],
                    filebrowserBrowseUrl : 'editor/elfinder/browse.php?mode=cke' + lti_session + '&type=media&uploadDir='+rlopathvariable+'&uploadURL='+rlourlvariable.substr(0, rlourlvariable.length-1) ,
                    filebrowserImageBrowseUrl : 'editor/elfinder/browse.php?mode=cke' + lti_session + '&type=image&uploadDir='+rlopathvariable+'&uploadURL='+rlourlvariable.substr(0, rlourlvariable.length-1) ,
                    filebrowserFlashBrowseUrl : 'editor/elfinder/browse.php?mode=cke' + lti_session + '&type=flash&uploadDir='+rlopathvariable+'&uploadURL='+rlourlvariable.substr(0, rlourlvariable.length-1) ,
                    uploadUrl : 'editor/uploadImage.php?mode=dragdrop' + lti_session + '&uploadPath='+rlopathvariable+'&uploadURL='+rlourlvariable.substr(0, rlourlvariable.length-1) ,
                    uploadAudioUrl : 'editor/uploadAudio.php?mode=record' + lti_session + '&uploadPath='+rlopathvariable+'&uploadURL='+rlourlvariable.substr(0, rlourlvariable.length-1) ,
                    mathJaxClass :  'mathjax',
                    mathJaxLib :    'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_HTMLorMML-full',
                    //extraPlugins : 'sourcedialog,image3,fontawesome,rubytext,editorplaceholder',
                    extraPlugins : 'sourcedialog,image3,fontawesome,rubytext,editorplaceholder',
                    language : language.$code.substr(0,2),
					//editorplaceholder: options.options.placeholder
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

	convertIconPickers = function ()
    {
        $.each(iconpickers, function (i, options){
			IconPicker.Init({
				jsonUrl: 'editor/js/vendor/iconpicker/' + options.iconList + '.json',
				searchPlaceholder: language.fontawesome.search,
				showAllButton: language.fontawesome.showAll,
				cancelButton: language.fontawesome.cancel,
				noResultsFound: language.fontawesome.noResult,
				borderRadius: '0px'
			});

			IconPicker.Run('#' + options.id, function(e){
				// manually trigger input change after new icon selected - even though input changes it doesn't get triggered without this as element is hidden & not in focus
				$('#' + options.id).data('input').change();
			});
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

            var rows = readyLocalJgGridData(options.key, options.name);

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
            let cellType;
            if (gridoptions.cellType)
            {
                cellType = gridoptions.cellType.split(',');
            }
            let gridTxt;
            if (gridoptions.gridTxt)
            {
                gridTxt = gridoptions.gridTxt;
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

                col['cellType'] = (cellType !== undefined && cellType[i] !== undefined ? cellType[i] : null);
                col['gridTxt'] = gridTxt;

                if (i==0) {
                    col['sortable'] = true;
                } else {col['sortable'] = false;}

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
                editurl: 'editor/js/vendor/jqgrid/jqgrid_dummy.php' + '?' + lti_session,
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
                },
                onSortCol: function(index, iCol, sortorder) {
                    var xerte = convertjqGridData(jqGrGridData[key + '_' + id], id);
                    setAttributeValue(key, [name], [xerte])
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
                        .addClass("xerte_button grid_col_btns")
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
                    resizeDataGrids();
				});

				// make sure datagrid is correct width when first loaded
                resizeDataGrids();

				jqGridSetUp == true;
			}
        });
    },

    resizeDataGrids = function() {
        $("#mainPanel .ui-jqgrid").each(function() {
            $(this).hide();
            var newWidth = $(this).parent().width();
            $(this).show();
            $(this).find("table").jqGrid("setGridWidth", newWidth, true);
        });
    },

    readyLocalJgGridData = function(key, name){
        var data_lo = lo_data[key].attributes[name];
        // For lightboxes, on the very first load the attribute might not yet be there. We treat it as a empty table as a work-around.
        if (typeof data_lo === 'undefined' || data_lo === '') {
            data_lo = '|';
        }
        var rows = [];
        $.each(data_lo.split('||'), function(j, row){
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
        return rows;
    },

    convertTreeSelect = function ()
    {
        $.each(treeSelecters, function (i, options){
            new TreeSelect({
                parentHtmlContainer: document.querySelector('#' + options.parentID),
                value: options.value,
                options: options.treeSelectOptions,
                searchable: true,
                isGroupedValue: true,
                openLevel: 0,
                inputCallback: (value) => setAttributeValue(options.key, [options.name] ,[value.join("|")])
            })
        });
    }

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

    changeTreeNodeStatus = function(key, name, value)
    {
        // Get the node name
        if (name == "hidePage") {
            changeNodeStatus(key, "hidden", value == "true");
        }

        if (name == "hideContent") {
            changeNodeStatus(key, "hiddenContent", value == "true");
        }

        if (name == "password") {
            changeNodeStatus(key, "password", value != "");
        }

        if (name == "linkPage" || name == "linkPageChapter") {
            changeNodeStatus(key, "standalone", value == "true");
        }

        if (name == "milestone") {
            changeNodeStatus(key, "milestone", value == "true");
        }

        if (name == "unmarkForCompletion") {
            changeNodeStatus(key, "unmark", value == "true");
        }
    },

    setAttributeValue = function (key, names, values)
    {
        changeTreeNodeStatus(key, names[0], values[0]);

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
        loLanguage = value;
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
    }

    getComboboxOptionsForVendor = function (type){
        let labels = [];
        let option = [];
        if (vendor_options.hasOwnProperty(type)){
            for (let vendor in vendor_options[type]) {
                option.push(vendor);
                labels.push(vendor_options[type][vendor].label);
            }
        } else {
            //type is not in management helper table
            labels.push("No options available");
            option.push("NaN")
        }
        return [labels,option];
    }

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

        inputChanged = function (id, key, name, value, obj) {
            //console.log('inputChanged : ' + id + ': ' + key + ', ' +  name  + ', ' +  value);
            var actvalue = value;

            if (id.indexOf('textinput') >= 0 || id.indexOf('media') >= 0) {
                actvalue = value;
                actvalue = stripP(actvalue);
            }
            if (id.indexOf('color') >= 0) {
                if (actvalue.indexOf('#') == 0)
                    actvalue = actvalue.substr(1);
                actvalue = '0x' + actvalue;
            }
            if (actvalue.indexOf('FileLocation +') >= 0) {
                // Make sure the &#39; is translated to a '
                //console.log("Convert " + actvalue);
                actvalue = $('<textarea/>').html(actvalue).val();
                //console.log("    ..to " + actvalue);
            }
            setAttributeValue(key, [name], [actvalue]);
        },

        courseChanged = function (id, key, name, form_id, value, obj) {
            //console.log('inputChanged : ' + id + ': ' + key + ', ' +  name  + ', ' +  value);
            var actvalue = value;

            if (actvalue == language.course.FreeText.$label) {
                // Enable free text input box
                $("#" + id).css("width", "50%");
                $("#course_freetext_" + form_id).show();
                actvalue = $("#course_freetext_" + form_id).val();
                actvalue = stripP(actvalue);
            } else {
                $("#course_freetext_" + form_id).hide();
                $("#" + id).css("width", "");
            }

            var sel = $("#" + id + ".deprecated");
            if (sel.length > 0) {
                if (sel[0].selectedIndex == sel[0].length - 1) {
                    sel.addClass("deprecated_option_selected");
                } else {
                    sel.removeClass("deprecated_option_selected");
                }
            }
            setAttributeValue(key, [name], [actvalue]);
        },

        courseFreeTextChanged = function (id, key, name, form_id, value, obj) {
            //console.log('inputChanged : ' + id + ': ' + key + ', ' +  name  + ', ' +  value);
            var actvalue = value;

            if (id.indexOf('textinput') >= 0 || id.indexOf('media') >= 0) {
                actvalue = value;
                actvalue = stripP(actvalue);
            }
            if (id.indexOf('color') >= 0) {
                if (actvalue.indexOf('#') == 0)
                    actvalue = actvalue.substr(1);
                actvalue = '0x' + actvalue;
            }
            if (actvalue.indexOf('FileLocation +') >= 0) {
                // Make sure the &#39; is translated to a '
                //console.log("Convert " + actvalue);
                actvalue = $('<textarea/>').html(actvalue).val();
                //console.log("    ..to " + actvalue);
            }
            setAttributeValue(key, [name], [actvalue]);
        },

        browseFile = function (id, type, key, name, value, obj) {
            let tmp_loc = 'media';
            if (type === 'CorpusGrid' || type === 'mediaCorpus') {
                tmp_loc = 'RAG/corpus';
            }
            window.elFinder = {};
            window.elFinder.callBack = function (file) {
                // Actions with url parameter here
                var url = decodeURIComponent(file.url);
                pos = url.indexOf(rlourlvariable);
                if (pos >= 0) {
                    url = "FileLocation + '" + url.substr(rlourlvariable.length + 1) + "'";
                }
                $('#' + id).attr("value", url);

                // if this field is in a datagrid then we don't set attribute value immediately
                if (key !== undefined && name !== undefined) {
                    setAttributeValue(key, [name], [url]);
                }
                window.elFinder = null;
            };
            window.open('editor/elfinder/browse.php?type=media' + lti_session + '&lang=' + languagecodevariable.substr(0, 2) + '&uploadDir=' + rlopathvariable + '&uploadURL=' + rlourlvariable + '&loc=' + tmp_loc, 'Browse file', "height=600, width=800");
        },

        previewFile = function (alt, src, title) {
            var origSrc = src;
            src = src.indexOf("FileLocation + '") == 0 ? rlourlvariable + src.substring(("FileLocation + '").length, src.length - 1) : src;

            var previewType,
                $preview,
                fileFormats = [
                    {type: 'image', fileExt: ['jpg', 'jpeg', 'gif', 'png']},
                    {type: 'video', fileExt: ['mp4']},
                    {type: 'audio', fileExt: ['mp3']},
                    {type: 'pdf', fileExt: ['pdf']}
                ];

            $(fileFormats).each(function () {
                for (var i = 0; i < this.fileExt.length; i++) {
                    var ext = this.fileExt[i],
                        srcLowerC = src.toLowerCase();
                    if (srcLowerC.lastIndexOf('.' + ext) == srcLowerC.length - (ext.length + 1)) {
                        previewType = this.type;
                        return false;
                    }
                }
            });

            if (previewType == 'image') {
                $preview = $('<div/>');
                $('<img class="previewFile"/>')
                    .on("error", function () {
                        $('.featherlight .previewFile')
                            .after('<p>' + language.compPreview.$error + '</p>')
                            .remove();
                    })
                    .attr({
                        "src": src,
                        "alt": alt
                    })
                    .appendTo($preview);

            } else if (previewType == 'video') {
                $preview = $('<div/>');
                $('<video class="previewVideo" controls><source src="' + src + '"></video>').appendTo($preview);

            } else if (previewType == 'audio') {
                $preview = $('<div/>');
                $('<audio controls><source src="' + src + '"></video>').appendTo($preview);

            } else if (previewType == 'pdf') {
                $preview = {iframe: src};

            } else {
                var srcLowerC = origSrc.toLowerCase();
                if (srcLowerC.indexOf('<iframe') === 0) {
                    $preview = $('<div>' + src + '</div>');
			} else {
				$preview = $('<div><p>' + language.compPreview.$error + '</p></div>');
			}
		}

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
        alert("The flash based drawing editor is discontinued!");
    },

    /**
     * getPagelist in an array. the array has contains arrays of length 2, the first element is the name (or label
     * the second element is the value
     *
     * This is the format that ckEditor dialog expects for select lists
     * We use the same format in the displayDataType for the pagelist type.
     *
     * Also make sure we only take the text from the name, and not the full HTML
     */
	getPageList = function(settings)
	{
        if (settings == undefined) { settings = {}; }
        const thisKey = settings.key;
        let thisTarget = settings.listTarget;
        const thisType = settings.pageTypes != undefined ? settings.pageTypes.split(",") : [];

		var tree = $.jstree.reference("#treeview");
		var pages=[];

		// list of everything at same level or everything at parent's level
		if (thisTarget != undefined) {
			// 0 finds nodes at this level, 1 finds nodes at parent level, 2 finds nodes at parent's parent level....
            // for example, this is used on decision tree page where answers can link to other steps on the same page but not other pages in the project
			// * makes it include all the children too
			var children = false;
			if (thisTarget.indexOf('*') != -1) {
				children = true;
				thisTarget = thisTarget.replace('*','');
			}
			
			var level = Number(thisTarget);
			var lo_node = tree.get_node(tree.get_node(thisKey, false).parents[level], false);
			
			$.each(lo_node.children, function(i, key){
                // list pages of specified types only if pageType set, or all page types if not specified
                if (thisType.length === 0 || thisType.indexOf(getAttributeValue(lo_data[key]['attributes'], 'nodeName', [], key).value) > -1) {
                    var name = getAttributeValue(lo_data[key]['attributes'], 'name', [], key);
                    var linkID = getAttributeValue(lo_data[key]['attributes'], 'linkID', [], key);
                    var hidden = lo_data[key]['attributes'].hidePage || lo_data[key]['attributes'].hideContent;

                    if (linkID.found && linkID.value != "") {
                        var page = [];
                        // Also make sure we only take the text from the name, and not the full HTML
                        page.push((hidden == 'true' ? '-- ' + language.hidePage.$title + ' -- ' : '') + getTextFromHTML(name.value));
                        page.push(linkID.value);
                        pages.push(page);

                        // Now we do the children
                        if (children == true) {
                            var childNode = tree.get_node(key, false);
                            $.each(childNode.children, function (i, key) {
                                var name = getAttributeValue(lo_data[key]['attributes'], 'name', [], key);
                                var linkID = getAttributeValue(lo_data[key]['attributes'], 'linkID', [], key);
                                var hidden = lo_data[key]['attributes'].hidePage || lo_data[key]['attributes'].hideContent;

                                if (linkID.found && linkID.value != "") {
                                    var page = [];
                                    // Also make sure we only take the text from the name, and not the full HTML
                                    page.push("&nbsp;- " + (hidden == 'true' ? '-- ' + language.hidePage.$title + ' -- ' : '') + getTextFromHTML(name.value));
                                    page.push(linkID.value);
                                    pages.push(page);
                                }
                            });
                        }
                    }
                }
			});
			
		// list of all pages & their children (if deep linking allowed)
		} else if (moduleurlvariable == "modules/xerte/" || moduleurlvariable == "modules/site/") {
            if (thisType.length === 0) {
                pages = [
                    [language.XotLinkRelativePages.firstpage,'[first]'],
                    [language.XotLinkRelativePages.lastpage,'[last]'],
                    [language.XotLinkRelativePages.prevpage,'[previous]'],
                    [language.XotLinkRelativePages.nextpage,'[next]']
                ];
            }
			
			var lo_node = tree.get_node("treeroot", false);
			
			$.each(lo_node.children, function(i, key){
                function checkNode(key, checkChildren, child) {
                    // list pages of specified types only if pageType set, or all page types if not specified
                    if (thisType.length === 0 || thisType.indexOf(getAttributeValue(lo_data[key]['attributes'], 'nodeName', [], key).value) > -1) {
                        const name = getAttributeValue(lo_data[key]['attributes'], 'name', [], key);
                        const linkID = getAttributeValue(lo_data[key]['attributes'], 'linkID', [], key);
                        const hidden = lo_data[key]['attributes'].hidePage || lo_data[key]['attributes'].hideContent;

                        if (linkID.found && linkID.value != "") {
                            // Also make sure we only take the text from the name, and not the full HTML
                            const page = [];
                            const prependTxt = child ? "&nbsp;- " : "";
                            let extraTxt = hidden == 'true' ? '-- ' + language.hidePage.$title + ' -- ' : '';
                            extraTxt += lo_data[key].attributes.nodeName == 'chapter' ? "[" + language.chapter.$title + "] " : ''; // **
                            page.push(extraTxt + getTextFromHTML(prependTxt + name.value));
                            page.push(linkID.value);
                            pages.push(page);

                            // Now we do the children (if deeplinking is allowed)
                            if (checkChildren && wizard_data[getAttributeValue(lo_data[key]['attributes'], 'nodeName', [], key).value].menu_options.deepLink == "true") {
                                const childNode = tree.get_node(key, false);
                                $.each(childNode.children, function(k, key){
                                    checkNode(key, false, true);
                                });
                            }
                        }
                    }
                }

                checkNode(key, true);

                // list pages inside a chapter too
                if (lo_data[key].attributes.nodeName == "chapter") {
                    const childNode = tree.get_node(key, false);
                    $.each(childNode.children, function(j, key) {
                        checkNode(key, true);
                    });
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

    drawHotspot = function(html, url, hsattrs, hspattrs, id, forceRectangle, lp){
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

        canvas.on('mouse:down', function(){editHotspot(url, hsattrs, hspattrs, id, forceRectangle, lp, hspattrs.nodeName)});

        if (hsattrs.mode != undefined && hsattrs.mode == 'icon' && hsattrs.shape != undefined){
            var icon_shape = JSON.parse(hsattrs.shape);
            canvasWidth = $('#wizard_hscanvas_' + id).width()
            canvasHeight = $('#wizard_hscanvas_' + id).height()

            var icon_preview = new fabric.Circle({
                radius: icon_shape.radius/100 * canvasWidth,
                left: icon_shape.centerX/100 * canvasWidth,
                top: icon_shape.centerY/100 * canvasHeight,
                originX: 'center',
                originY: 'center',
                fill: 'rgba(255,0,0,0.5)',
                selectable: false,
                objectCaching: false,
                evented: false
            });
            canvas.add(icon_preview)
        } else {
            // Step 2. Create polygon in appropriate scale
            var scaledpoints = [];
            // Old way of specifying hotspot: x,y,w,h
            if (forceRectangle || (hsattrs.mode == undefined && hsattrs.x != undefined && hsattrs.y != undefined && hsattrs.w != undefined && hsattrs.h != undefined)) {
                // create polygon, start with topleft
                scaledpoints[0] = {x: parseFloat(hsattrs.x), y: parseFloat(hsattrs.y)};
                scaledpoints[1] = {x: parseFloat(hsattrs.x) + parseFloat(hsattrs.w), y: parseFloat(hsattrs.y)};
                scaledpoints[2] = {
                    x: parseFloat(hsattrs.x) + parseFloat(hsattrs.w),
                    y: parseFloat(hsattrs.y) + parseFloat(hsattrs.h)
                };
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

                        evented: false
                    });
                    // Step 3. Draw Polygon
                    canvas.add(poly);
                }
            }
        }
    };

    editHotspot = function (url, hsattrs, hspattrs, id, forceRectangle, lp, iconEnabled){
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
        var tmpbuttonholder = '<div class="hsbutton_holder" id="hsbutton_holder_'+ id + '">' +
            '<button id="rectangle_' + id + '" class="hseditModeButton" title="' + language.editHotspot.Buttons.Rectangle + '"><i class="fas fa-2x fa-vector-square"></i></button>' +
            '<button id="poly_'+ id + '" class="hseditModeButton" title="' + language.editHotspot.Buttons.Polygon + '"><i class="fas fa-2x fa-draw-polygon"></i></button>';

        if (iconEnabled != '' & iconEnabled == 'connectorHotspotImage'){
            tmpbuttonholder += '<button id="icon_' + id + '" class="hseditModeButton" title="' + language.editHotspot.Buttons.Icon + '"><i class="fas fa-2x fa-info-circle"></i></button>';
        }
        tmpbuttonholder += '<button id="reset_'+ id + '" class="hseditModeButton firstoption" title="' + language.editHotspot.Buttons.Reset + '" disabled><i class="fas fa-2x fa-undo-alt"></i></button>' +
            '<button id="' + id + '_cancel" name="cancel" class="hseditModeButton" title="' + language.Alert.cancellabel + '" style="float:right"><i class="fas fa-2x fa-xmark"></i></button>' +
            '<button id="' + id + '_ok" name="ok" class="hseditModeButton" title="' + language.Alert.oklabel + '" style="float:right"><i class="fas fa-2x fa-check"></i></button>' +
            '</div>';
        edit_img.append(tmpbuttonholder);

        edit_img.append('<div class="overlayWrapper" id="overlayWrapper_' + id + '"><canvas id="hscanvas_' + id + '" class="overlayCanvas"></canvas></div>');
        edit_img.append('<div class="hsinstructions" id="instructions_' + id + '"></div>');
        
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
                        $("#icon_" + id).removeClass("selected");
                        break;
                    case "polygon":
                        $("#poly_" + id).addClass("selected");
                        $("#rectangle_" + id).removeClass("selected");
                        $("#icon_" + id).removeClass("selected");
                        break;
                    case "icon":
                        $("#icon_" + id).addClass("selected");
                        $("#rectangle_" + id).removeClass("selected");
                        $("#poly_" + id).removeClass("selected");
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
                        // Old definition of hotspot
                        else if (forceRectangle || (hsattrs.x != undefined && hsattrs.y != undefined && hsattrs.w != undefined && hsattrs.h != undefined)) {
                            // Don't draw the optional empty value
                            if (hsattrs.x > 0 || hsattrs.y > 0 || hsattrs.w > 0 || hsattrs.h > 0) {
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
                        }
                        setDrawingModeButtonState(shape);
                        if (hs == null || (hsattrs.x == 0 && hsattrs.y == 0 && hsattrs.w == 0 && hsattrs.h == 0)) {
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
                    case "icon":
                        if (hsattrs.shape != undefined) {
                            var icon = JSON.parse(hsattrs.shape);
                            //calculate size in comparison to canvas
                            canvasWidth = $('.overlayCanvas').width()
                            canvasHeight = $('.overlayCanvas').height()

                            hs = new fabric.Circle({
                                radius: icon.radius/100 * canvasWidth,
                                left: icon.centerX/100 * canvasWidth,
                                top: icon.centerY/100 * canvasHeight,
                                originX: 'center',
                                originY: 'center',
                                fill: 'rgba(255,0,0,0.5)',
                                selectable: true,
                                borderColor: 'yellow',
                                objectCaching: false,
                                angle: icon.angle,

                            });

                            // tempIcon = new fabric.IText('\uf0c2', {
                            //     fill: 'white',
                            //     left: icon.centerX/100 * canvasWidth,
                            //     top: icon.centerY/100 * canvasHeight,
                            //     originX: 'center',
                            //     originY: 'center',
                            //     fontFamily:'FontAwesome',
                            //     objectCaching: false,
                            //     selectable: false,
                            // })
                            //hs = new fabric.Group([bg, tempIcon])
                            hs.setControlsVisibility({
                                mb: false,
                                ml: false,
                                mr: false,
                                mt: false,
                            })
                        }
                        setDrawingModeButtonState(icon);
                        if (hs == null) {
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
                        case "icon":
                            instructions += "<li>" + language.editHotspot.Instructions.icon + "</li>";
                            break;
                    }
                }
                instructions += "<li>" + language.editHotspot.Instructions.save + "</li>"
                + "</ul>";
                $("#instructions_" + id).html(instructions);
            };


            // Ok handler
            var okbutton = $('.hotspotEditor  button[name="ok"]');
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
                            var rect = {}, _rect = {};
                            canvasWidth = $('.overlayCanvas').width()
                            canvasHeight = $('.overlayCanvas').height()
                            _rect.top = (hs.top / canvasHeight) * 100;
                            _rect.left = (hs.left / canvasWidth) * 100;
                            _rect.width = (hs.getScaledWidth() / canvasWidth) * 100;
                            _rect.height = (hs.getScaledHeight() / canvasHeight) * 100;
                            _rect.angle = hs.angle;

                            rect.top = hs.top * scale;
                            rect.left = hs.left * scale;
                            rect.width = hs.getScaledWidth() * scale;
                            rect.height = hs.getScaledHeight() * scale;
                            rect.angle = hs.angle; 
                            var stringPoints = JSON.stringify(npoints);
                            var stringShape = JSON.stringify(rect);

                            if (forceRectangle) {
                                setAttributeValue(key, ["x", "y", "w", "h"], [rect.left, rect.top, rect.width, rect.height]);
                                if (lp) {
                                    setAttributeValue(key, ["_x", "_y", "_w", "_h"], [_rect.left, _rect.top, _rect.width, _rect.height]);
                                }
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
                    case "icon":
                        if (hs != null) {
                            var icon = {}
                            canvasWidth = $('.overlayCanvas').width()
                            canvasHeight = $('.overlayCanvas').height()
                            icon.centerX = (hs.left / canvasWidth) * 100;
                            icon.centerY = (hs.top / canvasHeight) * 100;
                            icon.radius = (hs.getRadiusY() / canvasWidth) * 100;
                            icon.angle = hs.angle;

                            setAttributeValue(key, ["points", "mode", "shape"], [JSON.stringify(icon), shape, JSON.stringify(icon)]);
                        }
                        else {
                                setAttributeValue(key, ["points", "mode", "shape"], ['[]', shape, '{}']);
                            }
                            break;
                }


                current.close();
                parent.tree.showNodeData(key);
            });

            // Add handler
            var addbutton = $('.hotspotEditor  button[name="add"]');
            addbutton.click(function (event){
                current.close();
            });

            // Cancel handler
            var cancelbutton = $('.hotspotEditor button[name="cancel"]');
            cancelbutton.click(function(event){
                var key = $("#inner_img_" + id).data("key");
                var current = $.featherlight.current();
                current.close();
                parent.tree.showNodeData(key);
            });

            // Switch to polygon mode
            var polygonbutton = $('.hotspotEditor  #poly_'+id);
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

            var rectanglebutton = $('.hotspotEditor #rectangle_'+id);
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

            var iconbutton = $('.hotspotEditor #icon_'+id);
            iconbutton.click(function (event) {
                if (shape != "icon") {
                    switchToIconMode();
                }

            });

            var switchToIconMode = function()
            {
                shape = "icon";
                setDrawingModeButtonState(shape);
                canvas.set({selection: false});
                canvas.remove(hs);
                canvas.renderAll();
                hs = null;
                setIconHandlers();
                disableReset();

            };

            // Reset handler
            var resetbutton = $('.hotspotEditor  #reset_'+id);
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
                    case "icon":
                        switchToIconMode();
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

            var setIconHandlers = function()
            {
                canvas.off('mouse:down');
                canvas.off('mouse:move');
                canvas.off('mouse:up');
                canvas.on('mouse:up', function(opt) {
                    IconMouseUp(opt)
                });
            };

            var IconMouseUp = function(o)
            {
                var pointer = canvas.getPointer(o.e);

                hs = new fabric.Circle({
                    radius: 80,
                    left: Math.abs(pointer.x),
                    top: Math.abs(pointer.y),
                    originX: 'center',
                    originY: 'center',
                    fill: 'rgba(255,0,0,0.5)',
                    selectable: true,
                    borderColor: 'yellow',
                });
                hs.setControlsVisibility({
                    mb: false,
                    ml: false,
                    mr: false,
                    mt: false,
                })

                canvas.off('mouse:up');
                canvas.set({selection: (forceRectangle ? true : false)});
                canvas.add(hs);
                canvas.renderAll();
                enableReset();
            };

            hs = initShape();
        }

    };
	
	draw360Hotspot = function(html, url, hsattrs, id, hspgattrs, hspattrs) {
        // Add Hotspot on the wizard page as preview on the thumbnail image
		
        // find image, set scale and wrap with overlayWrapper
        var img =  html.find('img'),
			width = img.width(),
			height = img.height();
		
        img.wrap('<div class="overlayWrapper" id="overlayWrapper_' + id + '"></div>');
        img.hide();

        // create canvas over img
        var canvasObj = $('<canvas>')
            .attr('id', 'wizard_hscanvas_' + id);
		
        $('#overlayWrapper_' + id).append(canvasObj);
		
        var canvas = new fabric.Canvas('wizard_hscanvas_' + id, { selection: false, interaction: false });
        canvas.setWidth(width);
        canvas.setHeight(height);
		
        fabric.Image.fromURL(url, function (bgimg) {
            bgimg.scaleToWidth(width);
            bgimg.scaleToHeight(height);
            canvas.setBackgroundImage(bgimg, canvas.renderAll.bind(canvas), { stretch: true });
        });

        // open editor when thumbnail is clicked
		canvas.on('mouse:down', function() { edit360Hotspot(url, hsattrs, id, hspgattrs, hspattrs) });
		
        // draw target
		var xy = {};
        if (hsattrs.p != '' && hsattrs.y != '') {
			// convert from pitch & yaw to image coordinates
			xy.x = Math.floor((hsattrs.y / 360 + 0.5) * width);
			xy.y = Math.floor((0.5 - hsattrs.p / 180) * height);
			
			canvas.add(new fabric.Circle({radius: 5,
				fill: 'rgba(255,0,0,0.5)',
				left: xy.x,
				top: xy.y,
				originX: 'center', 
				originY: 'center',
				selectable: false,
				objectCaching: false,
				evented:false
			}));
			
			for (var j=0; j<2; j++) {
				var x0 = j == 0 ? xy.x - 0.5 : xy.x - 3.5,
					y0 = j == 0 ? xy.y - 3.5 : xy.y - 0.5,
					x1 = j == 0 ? xy.x - 0.5 : xy.x + 3.5,
					y1 = j == 0 ? xy.y + 3.5 : xy.y - 0.5;
				
				canvas.add(new fabric.Line([x0, y0, x1, y1], {
					stroke: 'white',
					strokeWidth: 1,
					selectable: false,
					evented: false
				}));
			}
        }
    };

    edit360Hotspot = function (url, hsattrs, id, hspgattrs, hspattrs) {
		// set up contents of lightbox (buttons, panorama & instructions)
	    var $editImg = $("<div></div>")
			.attr('id', 'outer_img_' + id)
			.addClass('hotspotEditor');
		
		var btns = ['reset', 'ok', 'cancel'],
			btnLang = [language.edit360Hotspot.Buttons.Reset, language.Alert.oklabel, language.Alert.cancellabel],
			btnIcon = ['fa-undo-alt', 'fa-check-square', 'fa-window-close'];
		
        $editImg
			.data("id", id)
			.append('<div class="hsbutton_holder" id="hsbutton_holder_' + id + '" style="float: right;">');
		
		var $hsBtnHolder = $editImg.find('.hsbutton_holder');
		
		for (var i=0; i<btns.length; i++) {
			$('<button id="' + btns[i] + '_' + id + '" class="hseditModeButton" title="' + btnLang[i] + '"><i class="fas fa-2x ' + btnIcon[i] + '"></i></button>').appendTo($hsBtnHolder);
		}
		
		$editImg.append('<div id="panoramaHolder"><div id="panorama_' + id + '"></div><div class="hsinstructions" id="instructions_' + id + '"></div></div>');
		
		var instructions = language.edit360Hotspot.Instructions.header +
				'<ul id="defaultInstructions">' +
				'<li>' + language.edit360Hotspot.Instructions.line1 + '</li>' +
				'<li>' + language.edit360Hotspot.Instructions.line2 + '</li>' +
				'<li>' + language.edit360Hotspot.Instructions.reset + '</li>' +
				'<li>' + language.edit360Hotspot.Instructions.save + '</li>' +
				'</ul>';
		
		$editImg.find('#instructions_' + id).html(instructions);
		
		var currentHsDetails = {};
		
		// get the info about the icon appearance
		if (hsattrs.icon == '' || hsattrs.icon == undefined) { currentHsDetails.icon = 'fas fa-info'; } else { currentHsDetails.icon = hsattrs.icon; }
		if (hsattrs.orientation == '' || hsattrs.orientation == undefined) { currentHsDetails.orientation = '0'; } else { currentHsDetails.orientation = hsattrs.orientation; }
		
		// colours & size can be set at page or hs level
		if (hsattrs.colour1 == '' || hsattrs.colour1 == undefined || hsattrs.colour1 == '0x') {
			if (hspgattrs.colour1 == '' || hspgattrs.colour1 == undefined || hspgattrs.colour1 == '0x') {
				currentHsDetails.colour1 = 'black';
			} else {
				currentHsDetails.colour1 = hspgattrs.colour1;
			}
		} else {
			currentHsDetails.colour1 = hsattrs.colour1;
		}
		
		if (hsattrs.colour2 == '' || hsattrs.colour2 == undefined || hsattrs.colour2 == '0x') {
			if (hspgattrs.colour2 == '' || hspgattrs.colour2 == undefined || hspgattrs.colour2 == '0x') {
				currentHsDetails.colour2 = 'white';
			} else {
				currentHsDetails.colour2 = hspgattrs.colour2;
			}
		} else {
			currentHsDetails.colour2 = hsattrs.colour2;
		}
		
		if (hsattrs.size == '' || hsattrs.size == undefined) {
			if (hspgattrs.hsSize == '' || hspgattrs.hsSize == undefined) {
				currentHsDetails.size = '14';
			} else {
				currentHsDetails.size = hspgattrs.hsSize;
			}
		} else {
			currentHsDetails.size = hsattrs.size;
		}
		
		// correct the format of the colour codes (start with # rather than 0x)
		currentHsDetails.colour1 = currentHsDetails.colour1.indexOf('0x') === 0 ? currentHsDetails.colour1.replace("0x", "#") : currentHsDetails.colour1;
		currentHsDetails.colour2 = currentHsDetails.colour2.indexOf('0x') === 0 ? currentHsDetails.colour2.replace("0x", "#") : currentHsDetails.colour2;
		
		var panorama;
		
		// open lightbox
		$.featherlight($editImg, {
			closeOnClick: 'false',
			closeOnEsc: true,
			closeIcon: '',
			afterOpen: function () {
				
				// scale panorama
				var dimensions = [0.7 * $('body').width(), 0.7 * $('body').height() - $('#hsbutton_holder').height() - $('.hsinstructions').height()];
				
				$('#panorama_' + id).add('.hover')
					.width(dimensions[0])
					.height(dimensions[1]);
				
				$('#outer_img_' + id).width(dimensions[0]);
                //check if cubemap
                if (hspattrs.cubemapcb=="true") {
                    // set up cubemap panorama
                    panorama = pannellum.viewer('panorama_' + id, {
                        'type': 'cubemap',
                        'cubeMap': [makeAbsolute(hspattrs.front),makeAbsolute(hspattrs.right),makeAbsolute(hspattrs.back),makeAbsolute(hspattrs.left),makeAbsolute(hspattrs.top),makeAbsolute(hspattrs.bottom)],
                        'autoLoad': true,
                        'showFullscreenCtrl': false,
                        'compass': false,
                        'pitch': Number(hsattrs.p), // turn to look at existing hotspot (if there is one)
                        'yaw': Number(hsattrs.y)
                    })
                } else{
				// set up single image panorama
				panorama = pannellum.viewer('panorama_' + id, {
					'type': 'equirectangular',
					'panorama': url,
					'autoLoad': true,
					'showFullscreenCtrl': false,
					'compass': false,
					'pitch': Number(hsattrs.p), // turn to look at existing hotspot (if there is one)
					'yaw': Number(hsattrs.y)
				})};
				
				// add hotspot (if there is one!)
				if (hsattrs.p != '' && hsattrs.y != '') {
					panorama.on('load', function(event) {
						create360Hotspot(Number(hsattrs.p), Number(hsattrs.y),hspattrs);
					});
				}
				
				// move hotspot on mouse up (attempt to disregard dragging by looking at position of mouse down & making sure it was quite close)
				var downPos = [];
				
				panorama.on('mousedown', function(event) {
					downPos = panorama.mouseEventToCoords(event);
				});
				
				panorama.on('mouseup', function(event) {
					var coords = panorama.mouseEventToCoords(event);
					
					if (Math.abs(downPos[0]-coords[0]) < 0.01 && Math.abs(downPos[1]-coords[1]) < 0.01) {
						create360Hotspot(coords[0], coords[1]);
					}
				});
				
				// remove existing hotspot & draw a new one
				function create360Hotspot(pitch, yaw) {
					panorama.removeHotSpot('currentHs');
					
					currentHsDetails.pitch = pitch;
					currentHsDetails.yaw = yaw;
					var borderWidth = Number(currentHsDetails.size)/4;
					
					panorama.addHotSpot({
						'id': 'currentHs',
						'pitch': pitch,
						'yaw': yaw,
						'cssClass': 'hotspot360Icon'
					});
					
					// hotspot styles
					$('.hotspot360Icon')
						.append('<span class="icon360Holder"><span class="icon360"></span></span>')
						.css({
							height: (Number(currentHsDetails.size)*2+2) + 'px',
							width: (Number(currentHsDetails.size)*2+2) + 'px',
							background: currentHsDetails.colour1,
							'border-color': currentHsDetails.colour2,
							'border-width': borderWidth + 'px'
						})
						.hover(
							function() {
								$(this).css('box-shadow', '0px 0px ' + (Number(currentHsDetails.size)/2) + 'px ' + currentHsDetails.colour2);
							},
							function() {
								$(this).css('box-shadow', 'none');
							})
						.find('.icon360')
							.css({
								transform: 'rotate(' + currentHsDetails.orientation + 'deg)',
								'font-size': Number(currentHsDetails.size) + 'px',
								color: currentHsDetails.colour2
							})
							.addClass(currentHsDetails.icon);
				}
			}
		});
		
		// set up buttons
		var key = $('#inner_img_' + id).data('key');
		
		// reset button - clear hotspot & all the customised icon info
		$('.featherlight-content button#reset_' + id).click(function(event) {
			panorama.removeHotSpot('currentHs');
			currentHsDetails.pitch = '';
			currentHsDetails.yaw = '';
		});
		
		// OK button - save hotspot info & close lightbox
		$('.featherlight-content button#ok_' + id).click(function(event) {
			var current = $.featherlight.current();
			setAttributeValue(key, ['p', 'y'], [currentHsDetails.pitch, currentHsDetails.yaw]);
			current.close();
			parent.tree.showNodeData(key);
		});
		
		// cancel button - close lightbox without saving hotspot info
		$('.featherlight-content button#cancel_' + id).click(function(event) {
			var current = $.featherlight.current();
			current.close();
			parent.tree.showNodeData(key);
		});
    };
	
	edit360View = function (url, hsattrs, id, name, hspattrs) {
		// set up contents of lightbox (buttons, panorama & instructions)
	    var $editImg = $("<div></div>")
			.attr('id', 'outer_img_' + id)
			.addClass('hotspotEditor');
		
		var btns = ['reset', 'ok', 'cancel'],
			btnLang = [language.edit360View.Buttons.Reset, language.Alert.oklabel, language.Alert.cancellabel],
			btnIcon = ['fa-undo-alt', 'fa-check-square', 'fa-window-close'];
		
        $editImg
			.data("id", id)
			.append('<div class="hsbutton_holder" id="hsbutton_holder_' + id + '" style="float: right;">');
		
		var $hsBtnHolder = $editImg.find('.hsbutton_holder');
		
		for (var i=0; i<btns.length; i++) {
			$('<button id="' + btns[i] + '_' + id + '" class="hseditModeButton" title="' + btnLang[i] + '"><i class="fas fa-2x ' + btnIcon[i] + '"></i></button>').appendTo($hsBtnHolder);
		}
		
		$editImg.append('<div id="panoramaHolder"><div id="panorama_' + id + '"></div><div class="hsinstructions" id="instructions_' + id + '"></div></div>');
		
		var instructions = language.edit360View.Instructions.header +
				'<ul id="defaultInstructions">' +
				'<li>' + language.edit360View.Instructions.line1 + '</li>' +
				'<li>' + language.edit360View.Instructions.reset + '</li>' +
				'<li>' + language.edit360View.Instructions.save + '</li>' +
				'</ul>';
		
		$editImg.find('#instructions_' + id).html(instructions);
		
		var panorama;
		
		// open lightbox
		$.featherlight($editImg, {
			closeOnClick: 'false',
			closeOnEsc: true,
			closeIcon: '',
			afterOpen: function () {
				
				// scale panorama
				var dimensions = [0.7 * $('body').width(), 0.7 * $('body').height() - $('#hsbutton_holder').height() - $('.hsinstructions').height()];
				
				$('#panorama_' + id)
					.width(dimensions[0])
					.height(dimensions[1]);
				
				$('#outer_img_' + id).width(dimensions[0]);
				
				// get the info about the current position
				var initPitch = 0,
					initYaw = 0;
				if (hsattrs[name] != undefined && hsattrs[name].split('|').length == 2) {
					var info = hsattrs[name].split('|');
					initPitch = $.isNumeric(info[0]) ? Number(info[0]) : initPitch;
					initYaw = $.isNumeric(info[1]) ? Number(info[1]) : initYaw;
				}

                if (hspattrs.cubemapcb=="true") {
                    // set up cubemap panorama
                    panorama = pannellum.viewer('panorama_' + id, {
                        'type': 'cubemap',
                        'cubeMap': [makeAbsolute(hspattrs.front),makeAbsolute(hspattrs.right),makeAbsolute(hspattrs.back),makeAbsolute(hspattrs.left),makeAbsolute(hspattrs.top),makeAbsolute(hspattrs.bottom)],
                        'autoLoad': true,
                        'showFullscreenCtrl': false,
                        'compass': false,
                        'pitch': Number(hsattrs.p), // turn to look at existing hotspot (if there is one)
                        'yaw': Number(hsattrs.y)
                    })
                } else{
				// set up single image panorama
				panorama = pannellum.viewer('panorama_' + id, {
					'type': 'equirectangular',
					'panorama': url,
					'autoLoad': true,
					'compass': false,
					'showFullscreenCtrl': false,
					'pitch': initPitch,
					'yaw': initYaw
				})};
				
				// focus point on mouse up (attempt to disregard dragging by looking at position of mouse down & making sure it was quite close)
				var downPos = [];
				
				panorama.on('mousedown', function(event) {
					downPos = panorama.mouseEventToCoords(event);
				});
				
				panorama.on('mouseup', function(event) {
					var coords = panorama.mouseEventToCoords(event);
					
					if (Math.abs(downPos[0]-coords[0]) < 0.01 && Math.abs(downPos[1]-coords[1]) < 0.01) {
						panorama.setPitch(coords[0]).setYaw(coords[1]);
					}
				});
			}
		});
		
		// set up buttons
		var key = $('#' + id + '_btn').data('key');
		
		// reset button - return to default view
		$('.featherlight-content button#reset_' + id).click(function(event) {
			panorama
				.setPitch(0)
				.setYaw(0);
		});
		
		// OK button - save view info & close lightbox
		$('.featherlight-content button#ok_' + id).click(function(event) {
			var current = $.featherlight.current();
			setAttributeValue(key, [name], [panorama.getPitch() + '|' + panorama.getYaw()]); // view is saved to one attribute in format 'pitch|yaw'
			current.close();
			parent.tree.showNodeData(key);
		});
		
		// cancel button - close lightbox without saving view info
		$('.featherlight-content button#cancel_' + id).click(function(event) {
			var current = $.featherlight.current();
			current.close();
			parent.tree.showNodeData(key);
		});
    };

    triggerRedrawPage = function(key)
    {
        parent.tree.showNodeData(key, true);
    };
    lbShowAdvanced = function(key)
    {
        window.showAdvanced[key]['enabled'] = !window.showAdvanced[key]['enabled'];
        triggerRedrawForm(window.showAdvanced[key]['group'], key, "", "initialize");
    }

    lightboxSetUp = function(group, attributes, node_options, key, formState="") {

        let groupChildren = group.value.children;
        let title  = wizard_data[lo_data[key]['attributes'].nodeName].menu_options.menuItem;
        let lightboxHtml = $("<div></div>");
        let lightboxHeader = $("<div id=\"lb_header\" class=\"header\"></div>");
        lightboxHeader.append($("<div>").text(title));
        let lightboxBody = $("<form id='lightbox_" + group.name + "' class='lightbox-form'></form>");
        let lightboxAdvancedCbChecked = "";
        if (window.showAdvanced && window.showAdvanced[key] && window.showAdvanced[key]['enabled'])
        {
            lightboxAdvancedCbChecked = "checked";
        }
        let lightboxFooter = $("<div id=\"lb_footer\" class=\"footer\">\n" +
            "            <div id=\"checkbox_outer\"><table><tr><td id=\"checkbox_holder\">" +
            "            <input type=\"checkbox\" id=\"lb_advanced_cb\" title='" + language.chkShowAdvanced.$tooltip + "' " + lightboxAdvancedCbChecked + " disabled class='disabled' onchange='lbShowAdvanced(\"" + key + "\")'> <label id=\"lb_advanced_cb_span\" for=\"lb_advanced_cb\" class=\"disabled\">" + language.chkShowAdvanced.$label + "</label>" +
            "</td></tr></table></div>\n" +
            "        </div>");

        let lightboxTable = $("<table id='lightboxPanel' class='content'></table>");
        let lightboxId = "#lightbox_" + group.name;
        //let name = wizard_data[lo_data[key]['attributes'].nodeName].menu_options.menuItem;
        //lightboxHtml.append($("<div>").text(name));

        //build lightbox form content input by input
        for (var j = 0; j < groupChildren.length; j++) {

            //rebuild form
            displayParameter(
                lightboxId,
                groupChildren,
                groupChildren[j].name,
                formState,
                key,
                lightboxTable,
                group.value.lightbox
            );
        }
        lightboxBody.append(lightboxTable);
        lightboxHtml.append(lightboxHeader);
        lightboxHtml.append(lightboxBody);
        lightboxHtml.append(lightboxFooter);

        // ensure global is always present
        window.lightboxCKEditorIds = window.lightboxCKEditorIds || [];

        function destroyAllLightboxCKEditors() {
            if (window.lightboxCKEditorIds) {
                window.lightboxCKEditorIds.forEach(function(id) {
                    if (CKEDITOR.instances[id]) {
                        CKEDITOR.instances[id].destroy(true);
                    }
                });
                window.lightboxCKEditorIds = [];
            }
        }

        // Clean up old ck editors before initializing any new ones
        destroyAllLightboxCKEditors();

        $.featherlight(lightboxHtml, {
            persist: true,
            closeOnClick: false,
            closeOnEsc: false,
            afterOpen: function(event) {
                var attributes = lo_data[key]['attributes'];
                formState = { ...attributes };
                convertTextInputs();
                convertDataGrids();
                convertTreeSelect();
                convertTextAreas();
                $('body').addClass('fl-jqgrid-top');
            },
            afterClose: function (event){
                $('body').removeClass('fl-jqgrid-top');
            }
        });

    }

    triggerRedrawForm = function (group, key, groupChildren="", mode, alternative_button = "") {
        let currentNodeType = lo_data[key]['attributes'].nodeName;
        const fallbackChildren =
            wizard_data[currentNodeType].node_options.all
                .find(option => option.name === group).value.children;

        groupChildren = (groupChildren === "" ? fallbackChildren : groupChildren);
        //store current form state for rebuild
        let formState = {};
        let formInputValues = $('#lightbox_' + group + ' :input').add($('#lightbox_' + group + ' .inlinewysiwyg'));

        var attributes = lo_data[key]['attributes'];
        var lo_attributes = lo_data['treeroot']['attributes'];
        formState = { ...attributes };
        if (mode === 'initialize') {
            //if not exists or empty option =>
            for (let input = 0; input < groupChildren.length; input++) {
                //get data from previous ai generation
                if (attributes[groupChildren[input].name] !== undefined && attributes[groupChildren[input].name] !== ""){
                    formState[groupChildren[input].name] = attributes[groupChildren[input].name];
                } else if (groupChildren[input].value.defaultValue !== undefined) {
                    //get default values for form
                    formState[groupChildren[input].name] = groupChildren[input].value.defaultValue;
                } else {
                    formState[groupChildren[input].name] = "";
                }

                // inherit any fields.
                const inheritFieldRaw = groupChildren[input]?.value?.inheritField;
                const inheritFieldClean = groupChildren[input]?.value?.inheritFieldClean;

                // pick which key to inherit from, and remember whether we must clean
                let inheritKey;
                let shouldClean = false;

                if (inheritFieldRaw !== undefined && inheritFieldRaw !== "") {
                    inheritKey = inheritFieldRaw;
                } else if (inheritFieldClean !== undefined && inheritFieldClean !== "") {
                    inheritKey = inheritFieldClean;
                    shouldClean = true;
                }

                if (inheritKey) {
                    const groupName = groupChildren[input]?.name;

                    // determine candidate value
                    let value;
                    if (attributes[inheritKey] !== undefined && attributes[inheritKey] !== null) {
                        value = attributes[inheritKey];
                    } else if (lo_attributes[inheritKey] !== undefined && lo_attributes[inheritKey] !== null) {
                        value = lo_attributes[inheritKey];
                    }

                    // clean if requested by inheritFieldClean mode
                    if (shouldClean) {
                        value = toPlainText(value);
                    }

                    // assign only if the value is not empty ("", null, or undefined)
                    if (value !== undefined && value !== null && value !== "") {
                        formState[groupName] = value;
                        lo_data[key].attributes[groupName] = value;
                    }
                }
            }
        } else {
            //get current form values
            for (let input = 0; input < formInputValues.length ; input++) {
                if (formInputValues[input].getAttribute('type') === 'wysiwyg') {
                    formState[formInputValues[input].getAttribute('name')] = formInputValues[input].textContent;
                }
                if(formInputValues[input].className === 'ckeditor'){
                    formInputValues[input].value = formState[formInputValues[input].name];
                    //formState[formInputValues[input].name] = formState[formInputValues[input].name];
                }
                else {
                    formState[formInputValues[input].name] = formInputValues[input].type !== 'checkbox' ? formInputValues[input].value : String(formInputValues[input].checked);
                }
            }
        }

        if (alternative_button !== "") {
            formState["ishButton"] = alternative_button;
        }

        //remove current form and button handler
        $('#lightbox_' + group).remove();
        $('#lightboxbutton_' + group).off("click");
        let groupId = wizard_data[currentNodeType].node_options.all.find((option) => option.name == group);
        $.featherlight.close();
        lightboxSetUp(groupId, "", "", key, formState);
    };

    // helper: convert rich text / html-ish strings to plain text
    toPlainText = function (input) {
        if (input === undefined || input === null) return input;

        // Non-strings: keep as-is
        if (typeof input !== "string") return input;

        const s = input.trim();
        if (s === "") return "";

        // If it doesn't look like HTML, just normalize whitespace a bit
        if (!/[<>]/.test(s)) {
            return s.replace(/\s+/g, " ").trim();
        }

        // Browser env: safest plain-text extraction
        if (typeof document !== "undefined") {
            const el = document.createElement("div");
            el.innerHTML = s;

            // textContent drops tags and formatting; keeps readable text
            const text = (el.textContent || "").replace(/\u00A0/g, " "); // nbsp -> space
            return text.replace(/\s+/g, " ").trim();
        }

        // Non-browser fallback: strip tags + decode a few common entities
        return s
            .replace(/<\/p>\s*<p[^>]*>/gi, "\n")      // preserve paragraph breaks
            .replace(/<br\s*\/?>/gi, "\n")            // preserve line breaks
            .replace(/<[^>]+>/g, "")                  // strip remaining tags
            .replace(/&nbsp;/gi, " ")
            .replace(/&amp;/gi, "&")
            .replace(/&lt;/gi, "<")
            .replace(/&gt;/gi, ">")
            .replace(/&quot;/gi, '"')
            .replace(/&#39;/gi, "'")
            .replace(/\u00A0/g, " ")
            .replace(/[ \t]+\n/g, "\n")
            .replace(/\n{3,}/g, "\n\n")
            .replace(/[ \t]{2,}/g, " ")
            .trim();
    }

    validateFormInput = function (regexCondition, inputValue, name, fieldlabel) {
        let regex = new RegExp(regexCondition);
        const fieldReference = fieldlabel || name;
        if (!regex.test(inputValue.trim())) {
                const regexString = regexCondition.toString();
                let errorMsg= language.vendorApi.inputValidations.fieldFilledIncorrectlyMsg +` ${fieldReference}.`;

                if (regexString === '^\\d+$') {
                     errorMsg = language.vendorApi.inputValidations.fieldInvalidNumeralMsg + ` ${fieldReference}. ` + language.vendorApi.inputValidations.fieldInvalidNumeralExampleMsg;

                } else if (regexString === '^.+$') {
                    errorMsg = `${fieldReference} ` + language.vendorApi.inputValidations.mandatoryFieldMissingMsg;

                } else if (regexString === '^(\\s*[^,]+\\s*,\\s*)+[^,]+\\s*$') {
                    errorMsg = language.vendorApi.inputValidations.fieldInvalidCommaListMsg + ` ${fieldReference}. ` + language.vendorApi.inputValidations.fieldInvalidCommaListExampleMsg;
                }
            alert(errorMsg);
            return false;
        }
        return true;
    }
    vendorHasApiKey = function (vendorGroup, vendor) {
        function toBool(v) {
            if (typeof v === 'boolean') return v;
            if (typeof v === 'number') return v !== 0;
            if (typeof v === 'string') return v === '1' || v.toLowerCase() === 'true';
            return Boolean(v);
        }

        const v = vendor_options?.[vendorGroup]?.[vendor];
        if (!v) return false;

        const hasKey = toBool(v.has_key);
        const needsKey = toBool(v.needs_key);

        // If it doesn't need a key, it's always OK. If it needs a key, must have one.
        return !needsKey || hasKey;
    };

    //verifies if an API key is needed and if it exists.
    hasApiKeyInstalled = function (vendorGroup, vendor) {
        if (vendorHasApiKey(vendorGroup, vendor)) {
            return true;
        }
        alert(language.vendorApi.missingKey);
        return false;
    }

    getConstructorFromLightbox = function (html, group) {
        //new version
        let constructorObject = {};
        let formInputValues = $('#lightbox_' + group + ' :input').add($('#lightbox_' + group + ' .inlinewysiwyg'))

        let formValidation = true;

        formInputValues.each(function() {
            //ignore all buttons as they do not contain data
            //if (this.nodeName !== "BUTTON") {

                let formFieldValue = "";

                if ((this.getAttribute('type') === 'wysiwyg') || (this.getAttribute('class') === 'ckeditor')){
                    formFieldValue = this.textContent ;
                } else {
                    formFieldValue = this.value;
                }


                if (this.getAttribute('type') === "checkbox") {
                    formFieldValue = String(this.checked);
                }

                const isBlank = v =>
                    v == null || (typeof v === "string" && v.trim() === "");

                // Only resolve when the field is blank
                if (isBlank(formFieldValue)) {
                    const loAttrs = lo_data?.treeroot?.attributes ?? {};

                    // read attributes from the element
                    const overrideKey = this.getAttribute("overruleof") || this.getAttribute("overridefield");
                    const defaultPH  = this.getAttribute("defaultvalueph");

                    if (!isBlank(overrideKey)) {
                        const overrideVal = loAttrs[overrideKey];

                        // if overrideVal is set to 'custom' (string compare, case-insensitive)
                        if (typeof overrideVal === "string" && overrideVal.trim().toLowerCase() === "custom") {
                            const customKey = `${overrideKey}Custom`;
                            const customVal = loAttrs[customKey];

                            if (!isBlank(customVal)) {
                                formFieldValue = customVal;                 // use the custom value
                            } else if (!isBlank(defaultPH)) {
                                formFieldValue = defaultPH;                 // fallback to default placeholder
                            }
                        }
                        // otherwise, if overrideVal itself is non-blank, use it
                        else if (!isBlank(overrideVal)) {
                            formFieldValue = overrideVal;
                        }
                        // overrideVal missing/blank => fallback to default placeholder
                        else if (!isBlank(defaultPH)) {
                            formFieldValue = defaultPH;
                        }
                        // else: leave blank
                    }
                    // no overrideKey => fallback to default placeholder (if present)
                    else if (!isBlank(defaultPH)) {
                        formFieldValue = defaultPH;
                    }
                    // else: leave blank
                }

                function getVerificationPattern(ctx) {
                    // Get pattern for any non-CKEditor fields
                    let pattern = (ctx && typeof ctx.getAttribute === 'function')
                        ? ctx.getAttribute('pattern')
                        : undefined;
                    if (pattern !== undefined && pattern !== null) return pattern;

                    // Fallback: look up by id in the globals
                    const id = ctx && ctx.id;
                    if (!id) return undefined;

                    function lookup(arr) {
                        if (!Array.isArray(arr)) return undefined;
                        for (let i = 0; i < arr.length; i++) {
                            const item = arr[i];
                            if (item && item.id === id) {
                                // options.verification is the attribute that houses the regex pattern originally
                                return item.options.verification;
                            }
                        }
                        return undefined;
                    }

                    // we don’t know the type, so check both
                    return lookup(textareas_options) ?? lookup(textinputs_options);
                }

                let pattern = getVerificationPattern(this);
                if (pattern !== null && !validateFormInput(pattern, formFieldValue, this.getAttribute('name'), this?.getAttribute('label'))) {
                    //one of the validation fields has not been filled in correctly.
                    formValidation = false;
                    return false;
                }

                let formFieldName = this.getAttribute('name');
                if (formFieldName === undefined) {
                    formFieldName = "noName";
                }
                constructorObject[formFieldName] = formFieldValue;
            //}
        });

        //if form validation failed do not make request
        if (!formValidation) {
            $(this).prop('disabled', false);
            return false;
        }
        return constructorObject;
    }

    displayDataType = function (value, options, name, key, label, mode) {
		var html;
		var conditionTrigger = (typeof options.conditionTrigger != "undefined" && options.conditionTrigger == "true");
		switch(options.type.toLowerCase())
		{
			case 'checkbox':
				var id = 'checkbox_' + form_id_offset;
				form_id_offset++;
				html = $('<input>')
					.attr('id', id)
                    .attr('name', name)
					.attr('type',  "checkbox")
					.prop('checked', value && (value == 'true' || value == '1' || value == 'on'))
					.change({id:id, key:key, name:name, trigger:conditionTrigger, group:options.group}, function(event){
                            cbChanged(event.data.id, event.data.key, event.data.name, this.checked, this);
                        if (event.data.trigger)
                        {
                            if (mode === 'none') {
                                triggerRedrawPage(event.data.key);
                            } else {
                                triggerRedrawForm(event.data.group, event.data.key, "", "redraw")
                            }
                        }
					});
				if (options.extraCheckBoxLabel !== undefined && options.extraCheckBoxLabel.length > 0)
                {
                    // It is rather difficult to add an element after another that is not yet in DOM
                    // So create a dummy element, add everything to it and than get rid of it again
                    // Ref: https://stackoverflow.com/questions/10489328/jquerys-after-method-not-working-with-newly-created-elements
                    var div = $('<div>');
                    html.attr("name", id);
                    div.append(html);
                    var label = $('<label>')
                        .attr("for", name)
                        .append(options.extraCheckBoxLabel);
                    div.append(label);
                    html = div;
                }
				break;
            case 'combobox_image':
            case 'combobox_imagegen':
            case 'combobox_ai':
            case 'combobox':
				var id = 'select_' + form_id_offset;
				form_id_offset++;
                if (options.type.toLowerCase() === 'combobox') {
                    var s_options = options.options.split(',');
                    for (var i = 0; i < s_options.length; i++) {
                        s_options[i] = decodeURIComponent(s_options[i].replace(/%%/g, '%'));
                    }
                    var s_data = [];
                    if (options.data) {
                        s_data = options.data.split(',');
                    } else {
                        s_data = s_options;
                    }
                } else {
                    let vendor = options.type.split("_");
                    let vendor_options = getComboboxOptionsForVendor(vendor.length >= 2 ? vendor[1] : "");
                    s_options = vendor_options[0];
                    s_data = vendor_options[1];
                }

				html = $('<select>')
					.attr('id', id)
                    .attr('name', name)
					.change({id:id, key:key, name:name, group:options.group ,trigger:conditionTrigger}, function(event)
					{
                        //store data in xml
                        selectChanged(event.data.id, event.data.key, event.data.name, this.value, this);
                        if (event.data.trigger)
                        {
                            //no lightbox so redraw entire page
                            if (mode === "none") {
                                triggerRedrawPage(event.data.key);
                            } else {
                                //lightbox so redraw only the lightbox form.
                                triggerRedrawForm(event.data.group, event.data.key, "", "redraw");
                            }
                        }
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

                // Set the value after initialisation of ckeditor in case of use of textarea, pre and code tags
                // if value is in cdata and placeholder is used, the empty value will be undefined - change this to empty string
                const lcvalue = value == undefined && options.placeholder != undefined ? '' : value.toLowerCase();
                if (lcvalue.indexOf('<textarea') == -1
                    && lcvalue.indexOf('<pre>') == -1
                    && lcvalue.indexOf('<code>') == -1)
                    textvalue = value == undefined && options.placeholder != undefined ? '' : value;

                var textarea = "<textarea id=\"" + id + "\" name=\"" + name + "\" class=\"ckeditor\" style=\"";
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
				var min = Number(options.min);
				var max = Number(options.max);
				var step = Number(options.step);
				var intvalue = Number(value);
				if (!Modernizr.inputtypes.number)
				{
					var id = 'select_' + form_id_offset;
					form_id_offset++;
					html = $('<select>')
						.attr('id', id)
						.change({id:id, key:key, name:name, trigger:conditionTrigger}, function(event)
						{
							selectChanged(event.data.id, event.data.key, event.data.name, this.value, this);
                            if (event.data.trigger)
                            {
                                triggerRedrawPage(event.data.key);
                            }
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
						.change({id:id, key:key, name:name, trigger:conditionTrigger}, function(event)
						{
							if ((isNaN(max) || this.value <= max) && (isNaN(min) || this.value >= min)) {
								if (this.value == '') {
									if (isNaN(max) || isNaN(min)) {
										this.value = 0;
									} else {
										this.value = (min + max) / 2; // choose midpoint for NaN
									}
								}
								inputChanged(event.data.id, event.data.key, event.data.name, this.value, this);
								if (event.data.trigger)
                                {
                                    triggerRedrawPage(event.data.key);
                                }
							}
							else { // set to max or min if out of range
								if (this.value > max) {
									this.value = max;
								} else {
									this.value = min;
								}
							}
						})
                        .blur({id:id, key:key, name:name, trigger:conditionTrigger}, function(event) {
                            if ((isNaN(max) || this.value <= max) && (isNaN(min) || this.value >= min)) {
                                if (this.value == '') {
                                    if (isNaN(max) || isNaN(min)) {
                                        this.value = 0;
                                    } else {
                                        this.value = (min + max) / 2; // choose midpoint for NaN
                                    }
                                }
                                inputChanged(event.data.id, event.data.key, event.data.name, this.value, this);
                                if (event.data.trigger)
                                {
                                    triggerRedrawPage(event.data.key);
                                }
                            }
                            else { // set to max or min if out of range
                                if (this.value > max) {
                                    this.value = max;
                                } else {
                                    this.value = min;
                                }
                            }
                        });

				}
				break;
            case 'pagelist':
				// Implement differently than in the flash editor
				// Leave PageIDs untouched, and prefer to use the PageID over the linkID
				var id = 'select_' + form_id_offset;
				form_id_offset++;
				html = $('<select>')
					.attr('id', id)
					.change({id:id, key:key, name:name, trigger:conditionTrigger}, function(event)
					{
						selectChanged(event.data.id, event.data.key, event.data.name, this.value, this);
                        if (event.data.trigger)
                        {
                            triggerRedrawPage(event.data.key);
                        }
					});
				// Add empty entry
				var option = $('<option>')
					.attr('value', "");
				if (value=="")
					option.prop('selected', true);
				option.append("&nbsp;");
				html.append(option);
				// by default the drop down will list all pages (& relevant nested pages)
                // can also be set to target everything at this level or at this item's parent level
                // & also only show pages of particular type
				var pages = getPageList({ key: key, listTarget: options.listTarget, pageTypes: options.pageTypes });
				
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
									.change({id:id, key:key, name:name, trigger:conditionTrigger}, function(event) {
										catListChanged(event.data.id, event.data.key, event.data.name, html, this);
                                        if (event.data.trigger)
                                        {
                                            triggerRedrawPage(event.data.key);
                                        }
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
				if (colorvalue != null && colorvalue.indexOf("0x") == 0)
				{
					colorvalue = colorvalue.substr(2);
				}
				if (Modernizr.inputtypes.color && false) // TODO: I can't get this to work! The widget doesn't show the correct colour, turned off for now
				{
					html = $('<input>')
						.attr('id', id)
						.attr('type', 'color')
						.change({id:id, key:key, name:name, trigger:conditionTrigger}, function(event)
						{
							inputChanged(event.data.id, event.data.key, event.data.name, this.value, this);
                            if (event.data.trigger)
                            {
                                triggerRedrawPage(event.data.key);
                            }
						});
				}
				else
				{
					html = $('<input>')
						.attr('id', id)
						.addClass('color')
						.change({id:id, key:key, name:name, trigger:conditionTrigger}, function(event)
						{
							inputChanged(event.data.id, event.data.key, event.data.name, this.value, this);
                            if (event.data.trigger)
                            {
                                triggerRedrawPage(event.data.key);
                            }
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
					.change({id:id, key:key, name:name, trigger:conditionTrigger}, function(event)
					{
						changeLanguage(event.data.id, event.data.key, event.data.name, this.value, this);
                        if (event.data.trigger)
                        {
                            triggerRedrawPage(event.data.key);
                        }
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
				currtheme = 0;
				var select = $('<select>')
					.attr('id', id)
					.change({id:id, key:key, name:name, trigger:conditionTrigger}, function(event)
					{
						themeChanged(event.data.id, event.data.key, event.data.name, this.value, this);
                        if (event.data.trigger)
                        {
                            triggerRedrawPage(event.data.key);
                        }
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

                //used to display current value
                var setValue = value.split("|");
                var id = 'treeselect_' + form_id_offset;

                treeSelecters.push({id: id, options: options, value: setValue, parentID: 'category_div_' + form_id_offset, treeSelectOptions: category_list, key: key, name: name})
                form_id_offset++;
				// var currselected=false;
				// var select = $('<select>')
				// 	.attr('id', id)
				// 	.change({id:id, key:key, name:name, trigger:conditionTrigger}, function(event)
				// 	{
				// 		inputChanged(event.data.id, event.data.key, event.data.name, this.value, this);
                //         if (event.data.trigger)
                //         {
                //             triggerRedrawPage(event.data.key);
                //         }
				// 	});
				// // Add empty option
				// var option = $('<option>')
				// 	.attr('value', "");
				// if (value=="") {
				// 	option.prop('selected', true);
				// 	currselected=true;
				// }
				// option.append("");
				// select.append(option);
				// for (var i=0; i<category_list.length; i++) {
				// 	var option = $('<option>')
				// 		.attr('value', category_list[i].category_name);
				// 	if (category_list[i].category_name==value) {
				// 		option.prop('selected', true);
				// 		curreselected = true;
				// 	}
				// 	option.append(category_list[i].category_name);
				// 	select.append(option);
				// }
				// if (value != "" && !currselected)
				// {
				// 	//  Add current value as option, even though it is not in the list
				// 	var option = $('<option>')
				// 		.attr('value', value);
				// 	option.prop('selected', true);
				// 	option.append(value);
				// 	select.append(option);
				// }
				// html.append(select);
                form_id_offset++;
			break;
			case 'grouping':
				var id = 'select_' + form_id_offset;
				var html = $('<div>')
					.attr('id', 'grouping_div_' + form_id_offset);
				var currselected = false;
				var select = $('<select>')
					.attr('id', id)
					.change({id:id, key:key, name:name, trigger:conditionTrigger}, function(event)
					{
						inputChanged(event.data.id, event.data.key, event.data.name, this.value, this);
                        if (event.data.trigger)
                        {
                            triggerRedrawPage(event.data.key);
                        }
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
                form_id_offset++;
				break;
            case 'educationlevellist':
                var html = $('<div>')
                    .attr('id', 'educationlevel_div_' + form_id_offset);

                var setValue = value.split("|");
                var id = 'treeselect_' + form_id_offset;

                treeSelecters.push({id: id, options: options, value: setValue, parentID: 'educationlevel_div_' + form_id_offset, treeSelectOptions: educationlevel_list, key: key, name: name})
                form_id_offset++;
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
						.change({id:id, key:key, name:name, trigger:conditionTrigger}, function(event)
						{
							inputChanged(event.data.id, event.data.key, event.data.name, this.value, this);
                            if (event.data.trigger)
                            {
                                triggerRedrawPage(event.data.key);
                            }
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
						.change({id: id, key: key, name: name, trigger:conditionTrigger, form_id: form_id_offset}, function (event) {
							courseChanged(event.data.id, event.data.key, event.data.name, event.data.form_id, this.value, this);
                            if (event.data.trigger)
                            {
                                triggerRedrawPage(event.data.key);
                            }
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
							.change({id:id, key:key, name:name, trigger:conditionTrigger}, function(event)
							{
								inputChanged(event.data.id, event.data.key, event.data.name, this.value, this);
                                if (event.data.trigger)
                                {
                                    triggerRedrawPage(event.data.key);
                                }
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
                form_id_offset++;
                break;
            case 'locpicker':
			case 'hotspot':
            case 'flexhotspot':
				var id = 'hotspot_' + form_id_offset;
				form_id_offset++;
                // Furthermore, the hotspot image, and the hotspot color are in the parent (or if the parent is a hotspotGroup, in the parents parent
                // So, get the image, the highlight colour, and the coordinates here, and make a lightbox of a small image that is clickable
                var forceRectangle = !(options.type.toLowerCase() === "flexhotspot");
                var lp = (options.type.toLowerCase() === "locpicker");
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
                if (url != undefined) {
                    url = makeAbsolute(url);
                }

                // Create a white canvas to use in lieu of an image for location selector.
                else if (lp === true) {
                    var whiteImage = document.createElement("CANVAS");
                    var ctx = whiteImage.getContext("2d");
                    ctx.fillStyle = "#FFFFFF";
                    ctx.fillRect(0, 0, whiteImage.width, whiteImage.height);
                    url = whiteImage.toDataURL();
                    // Set a default value if using locpicker, so plugins can be rendered.
                    if (hsattrs.x == undefined || hsattrs.y == undefined){
                        setAttributeValue(key, ["x", "y", "w", "h"], [0, 0, 0, 0]);
                    }
                }
                // Create a div with the image in there (if there is an image) and overlayed on the image is the hotspot box
                if (url.substring(0,4) == "http" || lp === true)
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
                            drawHotspot(html, url, hsattrs, hspattrs, id, forceRectangle, lp);
                        }).click(function(){
                            editHotspot(url, hsattrs, hspattrs, id, forceRectangle, lp, hspattrs.nodeName);
                        });
                }
                else
                {
                    html.append("<span class=\"error\">" + language.editHotspot.Error.selectFile + "</span>");
                }

				break;
				
			case 'hotspot360':
				var id = 'hotspot360_' + form_id_offset;
				form_id_offset++;

                // Furthermore, the hotspot image, and the hotspot color are in the parent (or if the parent is a hotspotGroup, in the parents parent
                // So, get the image, the highlight colour, and the coordinates here, and make a lightbox of a small image that is clickable
				var hsattrs = lo_data[key].attributes;
                var hsparent = parent.tree.getParent(key);
                var hspattrs = lo_data[hsparent].attributes;
				var hspage = parent.tree.getParent(hsparent);
				var hspgattrs = lo_data[hspage].attributes;

				// Create the container
				html = $('<div>').attr('id', id);

				var url = hspattrs.file;
				// check if cubemap and if so use front for thumbnail
                if (hspattrs.cubemapcb=="true") {
                    url = hspattrs.front;
                }
                // Replace FileLocation + ' with full url
				url = makeAbsolute(url);

				// Create a div with the image in there (if there is an image) and overlayed on the image is the hotspot box
				if (url.substring(0,4) == "http")
				{
					html.addClass('clickableHotspot');
					html.append("<img>");
					var cur_key = key;
					html.find('img')
						.attr('id', 'inner_img_' + id)
						.attr("data-key", cur_key)
						.attr("src", url)
						.load(function(){
							$(this).css({width: '100%'});
							draw360Hotspot(html, url, hsattrs, id, hspgattrs, hspattrs);
						}).click(function(){
							edit360Hotspot(url, hsattrs, id, hspgattrs, hspattrs);
						});
				}
				else
				{
					html.append("<span class=\"error\">" + language.edit360Hotspot.Error.selectFile + "</span>");
				}

				break;
			
			case 'view360':
				var id = 'view360_' + form_id_offset;
				form_id_offset++;
				
				var hsattrs = lo_data[key].attributes;
                var hsparent = parent.tree.getParent(key);
                var hspattrs = lo_data[hsparent].attributes;
				
				// what image are we going to set view for? defaults to <file> unless file attr is set
				// e.g. file='parent' looks at this parent's <file>, file='scene' looks at <scene>, file='parent.scene' looks at this parent's <scene>
				var url = options.file == undefined ? hsattrs.file : (options.file == 'parent' ? hspattrs.file : false);
				if (url === false) {
					var info = options.file.split('.');
					if (info > 1 && info[0] == 'parent') {
						url = hspattrs[info[1]];
					} else {
						url = hsattrs[info[0]];
					}
				}
				
				// we might only have the linkID of the file we need - try to find the real file
				if (url.substring(0,12) != "FileLocation") {
					$.each(lo_data, function(key, value) {
						if (this.attributes.linkID == url) {
							url = this.attributes.file;
							return false;
						}
						
					});
					
				}
				
				// Replace FileLocation + ' with full url
				url = makeAbsolute(url);
				
				// Create the container
				html = $('<div>').attr('id', id);

				if (url.substring(0,4) == "http")
				{
					$('<button id="' + id + '_btn" class="xerte_button icon_browse"></button>')
						.html(language.edit360View.Buttons.Edit)
						.attr("data-key", key)
						.appendTo(html)
						.click(function(){
							edit360View(url, hsattrs, id, name, hspattrs);
						});
				}
				else
				{
					html.append("<span class=\"error\">" + language.edit360View.Error.selectFile + "</span>");
				}

				break;
            case 'mediacorpus':
			case 'media':
				var id = 'media_' + form_id_offset;
				form_id_offset++;
				// a textinput with a browse buttons next to the type-in
				var td1 = $('<td width="100%">')
					.append($('<input>')
						.attr('type', "text")
						.attr('id', id)
                        .attr('name', name)
                        .attr('placeholder', options.placeholder)
						.addClass('media')
						.change({id:id, key:key, name:name, group:options.group, trigger:conditionTrigger}, function(event)
						{
                            //On change, inputChanged should be triggered so that manually added paths or links also persist, for both normal media buttons an buttons in forms regardless of mode.
                            inputChanged(event.data.id, event.data.key, event.data.name, this.value, this);

                            if (event.data.trigger)
                            {
                                //no lightbox so redraw entire page
                                if (mode === "none") {
                                    triggerRedrawPage(event.data.key);
                                } else {
                                    //lightbox so redraw only the lightbox form.
                                    triggerRedrawForm(event.data.group, event.data.key, "", "redraw");
                                }
                            }
						})
						.attr('value', value));

				var td2 = $('<td>');
				var btnHolder = $('<div style="width:6.5em"></div>').appendTo(td2);
				btnHolder.append($('<button>')
					.attr('id', 'browse_' + id)
					.attr('title', language.compMedia.$tooltip)
                    .attr('type', 'button')
					.addClass("xerte_button")
					.addClass("media_browse")
					.click({id:id, key:key, name:name, type:options.type}, function(event)
					{
						browseFile(event.data.id, event.data.type ,event.data.key, event.data.name, this.value, this);
					})
					.append($('<i>').addClass('fa').addClass('fa-lg').addClass('fa-upload').addClass('xerte-icon')));

				btnHolder.append($('<button>')
					.attr('id', 'preview_' + id)
					.attr('title', language.compPreview.$tooltip)
                    .attr('type', 'button')
					.addClass("xerte_button")
					.click({id:id, key:key, name:name}, function(event)
					{
						previewFile(options.label, $(this).closest('tr').find('input')[0].value);
					})
					.append($('<i>').addClass('fa').addClass('fa-lg').addClass('fa-search').addClass('xerte-icon')));

                if (vendor_is_available('image','all') || (vendor_is_available('imagegen','all') && hasrole('aiuser'))){
                    btnHolder.append($('<button>')
                        .attr('id', 'lightboxbutton_' + options.group)
                        .attr('title', language.compai.$tooltip)
                        .attr('type', 'button')
                        .addClass("xerte_button")
                        .click({id:id, key:key, name:name, group: options.group}, function(event)
                        {
                            triggerRedrawForm("imgSearchAndHelpGroup", key, "", "initialize", event.data.name);
                        })
                        .append($('<i>').addClass('fa').addClass('fa-lg').addClass('fa-wand-magic').addClass('xerte-icon')));
                };

				html = $('<div>')
					.attr('id', 'container_' + id)
					.addClass('media_container');
				html.append($('<table width="100%">')
					.append($('<tr>')
						.append(td1)
						.append(td2)));
				break;
            case 'lightboxclosebutton':
                html = $('<button>', { id, class: 'lightboxclose_button', type: 'button' })
                    .text('Save and Close')
                    .on('click', { key, group: options.group }, function (event) {
                        event.preventDefault();
                        $.featherlight.close();
                    });
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

                // add button below grid - when clicked a lightbox opens where you can upload a CSV containing data for the grid
                $('<input type="button" name="csvUpload" value="' + language.UploadCSV.UploadCSVBtn.$label + '">')
                    .click(function() { csvUploadLb(name, id); })
                    .appendTo(html);

                function csvUploadLb(name, id) {
                    var $excel_form =
                        $(`<div><h3>${label}: ${language.UploadCSV.UploadCSVBtn.$label}</h3>
                    <form method="post" enctype="multipart/form-data" id="excel_upload_${name}" class="csvUpload">
                    <input type="file" name="fileToUpload" id="fileToUpload_${name}" accept=".csv" required>
                    <div class="csvMergeInfo">${language.UploadCSV.mergeOld.$label}<input type="checkbox" name="merge" value="Merge" id="csv_merge_${name}"></div>
                    <input type="submit" value="${language.UploadCSV.UploadCSVBtn.$label}">
                    <input type="hidden" name="colNum" value="${options.columns}">
                    <input type="hidden" name="type" value="${name}">
                    <input type="hidden" name="gridId" value="${id}">
                    </form></div>`);

                    $.featherlight($excel_form, {
                        afterOpen: function (e) {
                            // called if user has uploaded a file to populate a grid
                            this.$content.find('#excel_upload_' + name).submit(function (e) {
                                e.preventDefault();
                                var grid_id = '#' + id + '_jqgrid';
                                var current_grid_data = JSON.stringify($(grid_id).jqGrid("getRowData"))
                                var form_data = new FormData(this);
                                if ($('#csv_merge_' + name).is(":checked")) {
                                    form_data.append("merge", "Merge");
                                    form_data.append('old_data', current_grid_data);
                                }
                                upload_file(form_data, name);
                            });
                        }
                    });
                }

                function upload_file(form_data, name){
                    var conf = false;
                    $('#csv_merge_' + name).is(":checked") ? conf = confirm(language.UploadCSV.Info2.$label) : conf = confirm(language.UploadCSV.Info.$label);

                    if(conf) {
                        $.ajax({
                            type: 'POST',
                            dataType: 'text',
                            url: 'editor/upload_file_to_jqgrid_template.php' + '?' + lti_session,
                            data: form_data,
                            contentType: false,
                            processData: false,
                            success: data => {
                                return_data = JSON.parse(data);
                                var gridId = '#' + return_data.gridId + '_jqgrid';
                                $(gridId).jqGrid('clearGridData');
                                setAttributeValue(key, [return_data.type], [return_data.csv]);
                                var rows = readyLocalJgGridData(key, return_data.type);
                                $(gridId).jqGrid('setGridParam', {data: rows});
                                $(gridId).trigger('reloadGrid');
                                $.featherlight.current().close();
                            },
                            error: () => {
                                // error message here.
                            }
                        });
                    }
                }

                //return xml
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
						.change({id:id, key:key, name:name, trigger:conditionTrigger}, function(event)
						{
							inputChanged(event.data.id, event.data.key, event.data.name, this.value.length == 0 ? '' : (format == 0 ? this.value : new Date(this.value).toISOString()), this);
                            if (event.data.trigger)
                            {
                                triggerRedrawPage(event.data.key);
                            }
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
					.click({id:id, key:key, name:name, value:value, trigger:conditionTrigger}, function(event)
					{
						editDrawing(event.data.id, event.data.key, event.data.name, event.data.value);
					}
				)
					.append(language.edit.$label);
				break;
			
			case 'fontawesome':
				var id = 'icon_' + form_id_offset;
				form_id_offset++;
				html = $('<div>').attr('id', id);
				
				var $input = $('<input id="' + id + '_hiddenInput" class="icon_hiddenInput" type="text" value="' + value + '">')
					.appendTo(html)
					.data({
						'id': id,
						'key': key,
						'name': name
					})
					.change(function() {
						var $this = $(this);
						
						// if an icon hasn't already been chosen swap the 'select icon' button for the icon preview
						if ($('#' + $this.data('id') + '_btn').find('i').length == 0) {
							$('#' + $this.data('id') + '_btn').html('<i id="' + id + '_preview" class="fas fa-fw fa-lg ' + this.value + '" title="' + language.fontawesome.preview + ': ' + this.value + '"></i>');
						} else {
							$('#' + $this.data('id') + '_btn').find('i').attr('title', language.fontawesome.preview + ': ' + this.value);
						}
						
						inputChanged($this.data('id'), $this.data('key'), $this.data('name'), this.value);
					});
				
				$('<button id="' + id + '_btn" class="xerte_button icon_browse" data-iconpicker-input="input#' + id + '_hiddenInput" data-iconpicker-preview="i#' + id + '_preview"></button>')
					.data('input', $input)
					.html(value != undefined && value != '' ? '<i id="' + id + '_preview" class="fa-fw ' + value + '" title="' + language.fontawesome.preview + ': ' + value + '"></i>' : language.fontawesome.preview)
					.appendTo(html)
					.click(
						// manually set height/position of icon picker after it's been created
						function() {setTimeout(function() {
							var totalH = $('body').height() * 0.9;
							var availH = totalH - (parseInt($('.ip-icons-content').css('padding-top')) * 2) - $('.ip-icons-search').outerHeight(true) - $('.ip-icons-footer').outerHeight(true);
							
							$('.ip-icons-area').css('max-height', availH + 'px');
							$('#IconPickerModal')
								.css('top', $('body').height() * 0.05);
						}, 10);
					});

				iconpickers.push({id: id + '_btn', iconList: options.iconList});
				
				break;
            case 'info':
                break;
            case 'quickfillbutton':
                var qf_button_id = 'qfButton_' + form_id_offset;
                form_id_offset++;
                html = $('<button>')
                    .attr('id', qf_button_id)
                    .attr('class', 'quickfill_button xerte_button_c')
                    .attr('type', 'button')
                    .html('<i class="fa fa-arrows-rotate"></i> ' + language.assistents.QuickFillBtn.$label)
                    .click({key: key}, async function(event) {
                        const $btn = $(this);          // the button that was clicked
                        $(this).prop('disabled', true);
                        // Build the parameters object based on type. The nodes must match the actual node names of the xml in question.
                        var parameters;
                        var type = lo_data[key].attributes.nodeName;
                        //todo rework same as ai button to prevent huge switch statement
                        switch (type) {
                            case 'quiz':
                                parameters = {
                                    "question": lo_data[key].attributes["numberOfQuestions"] || "3",
                                    "option": lo_data[key].attributes["numberOfAnswers"] || "4",
                                }
                                break;
                            case 'tabNavExtra':
                                parameters = {
                                    "topic": lo_data[key].attributes["qfTopic"] || "3",
                                    "nestedTab": lo_data[key].attributes["qfNestedTab"] || "3",
                                    "nestedPage": lo_data[key].attributes["qfNestedPage"] || "5",
                                }
                                break;
                            case 'columnPage':
                                parameters = {
                                    "nestedColumnPage": lo_data[key].attributes["qfNestedColumnPage"] || "3",
                                }
                                break;
                            case 'audioSlideshow':
                                parameters = {
                                    "synchPoint": lo_data[key].attributes["qfSynchPoint"] || "3",
                                }
                                break;
                            case 'imageSequence':
                                parameters = {
                                    "case": lo_data[key].attributes["qfCase"] || "3",
                                    "imgSeries": lo_data[key].attributes["qfImgSeries"] || "3",
                                    "singleImg": lo_data[key].attributes["qfSingleImg"] || "5",
                                }
                                break;
                            case 'thumbnailViewer':
                                parameters = {
                                    "thumbnailImage": lo_data[key].attributes["qfThumbnailImage"] || "5",
                                }
                                break;
                            case 'SictTimeline':
                                parameters = {
                                    "timeLineText": lo_data[key].attributes["qfTimeLineText"] || "1",
                                    "timelineimage": lo_data[key].attributes["qfTimelineimage"] || "1",
                                    "timelinevideo ": lo_data[key].attributes["qfTimelinevideo"] || "1",
                                    "timeLineAudio": lo_data[key].attributes["qfTimeLineAudio"] || "1",
                                }
                                break;
                            case 'transcriptReader':
                                parameters = {
                                    "nestedSynch": lo_data[key].attributes["qfNestedSynch"] || "3",
                                }
                                break;
                            case 'flashCards':
                                parameters = {
                                    "card": lo_data[key].attributes["qfCard"] || "5",
                                }
                                break;
                            case 'list':
                                parameters = {
                                    "listItem": lo_data[key].attributes["qfListItem"] || "5",
                                }
                                break;
                            case 'nav':
                                parameters = {
                                    "navPage": lo_data[key].attributes["qfNavPage"] || "3",
                                }
                                break;
                            case 'perspectives':
                                parameters = {
                                    "movie": lo_data[key].attributes["qfMovie"] || "1",
                                    "sound": lo_data[key].attributes["qfSound"] || "1",
                                    "image": lo_data[key].attributes["qfImage"] || "1",
                                    "mpText": lo_data[key].attributes["qfMpText"] || "1",
                                }
                                break;
                            case 'annotatedDiagram':
                                parameters = {
                                    "flexhotspot": lo_data[key].attributes["qfFlexhotspot"] || "3",
                                }
                                break;
                            case 'hotspotGroup':
                                parameters = {
                                    "flexhotspot": lo_data[key].attributes["qfFlexhotspot"] || "3",
                                }
                                break;
                            case 'topXQ':
                                parameters = {
                                    "optionXQ": lo_data[key].attributes["qfOptionXQ"] || "5",
                                }
                                break;
                            case 'buttonSequence':
                                parameters = {
                                    "button": lo_data[key].attributes["qfButton"] || "5",
                                }
                                break;
                            case 'categories':
                                parameters = {
                                    "category": lo_data[key].attributes["qfCategory"] || "3",
                                    "item": lo_data[key].attributes["qfItem"] || "5",
                                }
                                break;
                            case 'decision':
                                parameters = {
                                    "resultStep": lo_data[key].attributes["qfResultStep"] || "1",
                                    "infoStep": lo_data[key].attributes["qfInfoStep"] || "1",
                                    "sliderStep": lo_data[key].attributes["qfSliderStep"] || "1",
                                    "sliderStepOption": lo_data[key].attributes["qfSliderStepOption"] || "4",
                                    "mcqStep": lo_data[key].attributes["qfMcqStep"] || "1",
                                    "mcqStepOption": lo_data[key].attributes["qfMcqStepOption"] || "4",
                                }
                                break;
                            case 'dialog':
                                parameters = {
                                    "dialogStep": lo_data[key].attributes["qfDialogStep"] || "5",
                                }
                                break;
                            case 'dictation':
                                parameters = {
                                    "nestedDictation": lo_data[key].attributes["qfNestedDictation"] || "3",
                                }
                                break;
                            case 'documentation':
                                parameters = {
                                    "page": lo_data[key].attributes["qfPage"] || "1",
                                }
                                break;
                            case 'page': //of documentation
                                parameters = {
                                    "media": lo_data[key].attributes["qfMedia"] || "1",
                                    "selectlist": lo_data[key].attributes["qfSelectlist"] || "1",
                                    "selectitem": lo_data[key].attributes["qfSelectitem"] || "5",
                                    "description": lo_data[key].attributes["qfDescription"] || "1",
                                    "tableDoc": lo_data[key].attributes["qfTableDoc"] || "1",
                                    "checkbox": lo_data[key].attributes["qfCheckbox"] || "1",
                                    "textArea": lo_data[key].attributes["qfTextArea"] || "1",
                                    "textBox": lo_data[key].attributes["qfTextBox"] || "1",
                                }
                                break;
                            case 'section': //of documentation
                                parameters = {
                                    "media": lo_data[key].attributes["qfMedia"] || "1",
                                    "selectlist": lo_data[key].attributes["qfSelectlist"] || "1",
                                    "selectitem": lo_data[key].attributes["qfSelectitem"] || "5",
                                    "description": lo_data[key].attributes["qfDescription"] || "1",
                                    "tableDoc": lo_data[key].attributes["qfTableDoc"] || "1",
                                    "checkbox": lo_data[key].attributes["qfCheckbox"] || "1",
                                    "textArea": lo_data[key].attributes["qfTextArea"] || "1",
                                    "textBox": lo_data[key].attributes["qfTextBox"] || "1",
                                }
                                break;
                            case 'dragDropLabel':
                                parameters = {
                                    "hotspot": lo_data[key].attributes["qfHotspot"] || "3",
                                }
                                break;
                            case 'hotspotImage':
                                parameters = {
                                    "flexhotspot": lo_data[key].attributes["qfFlexhotspot"] || "3",
                                }
                                break;
                            case 'hotSpotQuestion':
                                parameters = {
                                    "QHotSpot": lo_data[key].attributes["qfQHotSpot"] || "3",
                                }
                                break;
                            case 'interactiveText':
                                parameters = {
                                    "group": lo_data[key].attributes["qfGroup"] || "5",
                                }
                                break;
                            case 'ivOverlayPanel': //of interactiveVideo
                                parameters = {
                                    "ivSynchTextPlus": lo_data[key].attributes["qfIvSynchTextPlus"] || "3",
                                    "ivSynchMCQ": lo_data[key].attributes["qfIvSynchMCQ"] || "1",
                                    "ivSynchMCQOption": lo_data[key].attributes["qfIvSynchMCQOption"] || "4",
                                    "ivSynchXot": lo_data[key].attributes["qfIvSynchXot"] || "1",
                                    "ivSynchXotChange": lo_data[key].attributes["qfIvSynchXotChange"] || "3",
                                }
                                break;
                            case 'inventory':
                                parameters = {
                                    "invQuestion": lo_data[key].attributes["qfInvQuestion"] || "3",
                                    "invOption": lo_data[key].attributes["qfInvOption"] || "4",
                                }
                                break;
                            case 'textMatch':
                                parameters = {
                                    "sentence": lo_data[key].attributes["qfSentence"] || "3",
                                }
                                break;
                            case 'mcq':
                                parameters = {
                                    "option": lo_data[key].attributes["qfOption"] || "4",
                                }
                                break;
                            case 'opinion':
                                parameters = {
                                    "opinionClass": lo_data[key].attributes["qfOpinionClass"] || "3",
                                    "opinionQuestion": lo_data[key].attributes["qfOpinionQuestion"] || "3",
                                    "opinionOption": lo_data[key].attributes["qfOpinionOption"] || "4",
                                }
                                break;
                            case 'timeline':
                                parameters = {
                                    "timelinedate": lo_data[key].attributes["qfTimelinedate"] || "6",
                                }
                                break;
                            case 'memory':
                                parameters = {
                                    "matchItem": lo_data[key].attributes["qfMatchItem"] || "6",
                                }
                                break;
                            case 'crossword':
                                parameters = {
                                    "wordAndHint": lo_data[key].attributes["qfWordAndHint"] || "6",
                                }
                                break;
                            case 'links':
                                parameters = {
                                    "link": lo_data[key].attributes["qfLink"] || "3",
                                }
                                break;
                            case 'adaptiveContent':
                                parameters = {
                                    "interaction": lo_data[key].attributes["qfInteraction"] || "3",
                                    "interactionBlock": lo_data[key].attributes["qfInteractionBlock"] || "3",
                                }
                                break;
                            case 'mediaLesson':
                                parameters = {
                                    "panel": lo_data[key].attributes["qfPanel"] || "3",
                                }
                                break;
                            case 'mediaPanel': //of mediaLesson
                                parameters = {
                                    "synchXot": lo_data[key].attributes["qfSynchXot"] || "1",
                                    "synchXotChange": lo_data[key].attributes["qfSynchXotChange"] || "3",
                                    "synchWebpage": lo_data[key].attributes["qfSynchWebpage"] || "3",
                                    "synchMCQ": lo_data[key].attributes["qfSynchMCQ"] || "1",
                                    "synchMCQOption": lo_data[key].attributes["qfSynchMCQOption"] || "4",
                                    "synchSlides": lo_data[key].attributes["qfSynchSlides"] || "1",
                                    "synchSlide": lo_data[key].attributes["qfSynchSlide"] || "6",
                                    "synchTextPlus": lo_data[key].attributes["qfSynchTextPlus"] || "3",
                                    "synchEmpty": lo_data[key].attributes["qfSynchEmpty"] || "3",
                                    "synchCue": lo_data[key].attributes["qfSynchCue"] || "3",
                                };
                                break;
                            case 'panel': //of mediaLesson
                                parameters = {
                                    "synchXot": lo_data[key].attributes["qfSynchXot"] || "1",
                                    "synchXotChange": lo_data[key].attributes["qfSynchXotChange"] || "3",
                                    "synchWebpage": lo_data[key].attributes["qfSynchWebpage"] || "3",
                                    "synchMCQ": lo_data[key].attributes["qfSynchMCQ"] || "1",
                                    "synchMCQOption": lo_data[key].attributes["qfSynchMCQOption"] || "4",
                                    "synchSlides": lo_data[key].attributes["qfSynchSlides"] || "1",
                                    "synchSlide": lo_data[key].attributes["qfSynchSlide"] || "6",
                                    "synchTextPlus": lo_data[key].attributes["qfSynchTextPlus"] || "3",
                                    "synchEmpty": lo_data[key].attributes["qfSynchEmpty"] || "3",
                                    "synchMediaPlus": lo_data[key].attributes["qfSynchMediaPlus"] || "3",
                                    "synchCue": lo_data[key].attributes["qfSynchCue"] || "3",
                                };
                                break;
                        }
                        // Show a confirm dialog with a custom message
                        if (confirm(language.assistents.quickfill.QFConfirmRequest)) {
                            // User clicked "OK"
                            try {
                                await quick_fill(event, type, parameters);
                            } catch (error) {
                                console.log('Error occurred:', error);
                                alert(language.assistents.quickfill.QFError);
                            }
                        }
                        $btn.prop('disabled', false);
                    });
                break;
            case 'autotranslatebutton':
                var atr_button_id = 'atrButton_' + form_id_offset;
                form_id_offset++;
                html = $('<button>')
                    .attr('id', atr_button_id)
                    .attr('class', 'autotranslate_button xerte_button_c')
                    .html('<i class="fa fa-language"></i> ' + language.assistents.AutoTranslateBtn.$label)
                    .click({key: key}, async function(event) {
                        const $btn = $(this);          // the button that was clicked
                        $btn.prop('disabled', true);
                        var api = lo_data[key].attributes['translateApi'] || 'openai';
                        var baseUrl = rlopathvariable.substr(rlopathvariable.indexOf("USER-FILES"));
                        var targetLanguage = lo_data[key].attributes["targetLanguage"];
                        // Show a confirm dialog with a custom message
                        if (confirm("Depending on the size of the learning object, translation may take several minutes. Start translation?")) {
                            // User clicked "OK"
                            try {
                                await auto_translate(event, api, baseUrl, targetLanguage);
                            } catch (error) {
                                console.log('Error occurred:', error);
                                alert("Something went wrong. Please try using the translate feature again.");
                            } finally {
                                // Re-enable the button after the function completes (success or failure)
                                $btn.prop('disabled', false);
                            }
                        } else {
                            // User clicked "Cancel"
                            console.log("Translation canceled by the user.");
                            $btn.prop('disabled', false);
                        }

                    });
                break;
            case 'imgsearchandhelpbutton':
                var ish_id = 'ishButton_' + form_id_offset;
                form_id_offset++;
                html = $('<button>')
                    .attr('id', ish_id)
                    .attr('class', 'imgsh_button xerte_button_c')
                    .attr('value', value)
                    .attr('name', name)
                    .html('<i class="fa fa-arrows-rotate"></i> ' + language.assistents.ImgSearchBtn.$label)
                    .click({key: key, group: options.group, value: value}, function(event) {
                        const $btn = $(this);          // the button that was clicked
                        $btn.prop('disabled', true);
                        event.preventDefault();

                        triggerRedrawForm(options.group, key, "", "redraw");

                        function cleanTextField(input) {
                            if (typeof input !== "string") return input;

                            // 1. Decode HTML entities (&lt;p&gt; to <p>, etc)
                            const txt = document.createElement("textarea");
                            txt.innerHTML = input;
                            input = txt.value;

                            // 2. Strip HTML tags (<p>...</p>)
                            input = input.replace(/<[^>]*>/g, "");

                            // 3. Replace non-breaking spaces (decoded &nbsp;)
                            input = input.replace(/\u00A0/g, " ");

                            // 4. Replace literal "&nbsp;" if still present
                            input = input.replace(/&nbsp;/g, " ");

                            // 5. Normalize whitespace (remove extra spaces, tabs, newlines)
                            input = input.replace(/\s+/g, " ");

                            // 6. Trim leading/trailing whitespace
                            input = input.trim();

                            return input;
                        }

                        let constructorObject = getConstructorFromLightbox(html, event.data.group);
                        if (constructorObject === false) {return}
                        let api = constructorObject['imgApi'] !== undefined
                            ? constructorObject['imgApi']
                            : (constructorObject['imgGenApi'] !== undefined
                                ? constructorObject['imgGenApi']
                                : 'dalle3');
                        delete constructorObject.imgApi;

                        if (api==='dalle3'){
                            constructorObject['nri'] = '1';
                        }

                        let serviceType = constructorObject['serviceType'] ?? 'NaN';
                        delete constructorObject.serviceType;

                        var query;
                        //query select option for specific pages
                        let querySelect = constructorObject['imgQuerySelect'] !== undefined ? constructorObject['imgQuerySelect'] : 'custom';
                        delete constructorObject.imgQuerySelect;

                        switch (querySelect) {
                            case 'custom':
                                //general default option
                                query = constructorObject['imgQuery'] !== undefined ? constructorObject['imgQuery'] : "";
                                delete constructorObject.imgQuery;
                                if (!query || query.trim() === ""){
                                    query = null;
                                }
                                break;
                            case 'side1':
                                query = constructorObject['imgQuerySide1'] !== undefined ? constructorObject['imgQuerySide1'] : "";
                                delete constructorObject.side1;
                                if (!query || query.trim() === ""){
                                    query = null;
                                }
                                break;
                            case 'side2':
                                query = constructorObject['imgQuerySide2'] !== undefined ? constructorObject['imgQuerySide2'] : "";
                                delete constructorObject.side2;
                                if (!query || query.trim() === ""){
                                    query = null;
                                }
                                break;
                        }

                        let interpretPrompt = constructorObject['useAiInterpret'] !== undefined ? constructorObject['useAiInterpret'] : "false";
                        delete constructorObject.useAiInterpret;

                        let aiSettingsOverride = constructorObject['overrideAiSettings'] !== undefined ? constructorObject['overrideAiSettings'] : "true";
                        delete constructorObject.overrideAiSettings;

                        //'pixabayColors' is the expected field, so we create and let it inherit the dropdown value
                        if (constructorObject['pixabayColorsDropdown']!=='custom'){
                            constructorObject['pixabayColors'] = constructorObject['pixabayColorsDropdown'];
                        }

                        // pixabayColors inherits the dropdown value, so we have no need of it further
                        delete constructorObject['pixabayColorsDropdown'];

                        if (serviceType==='generate'){
                            if(!hasApiKeyInstalled('imagegen', api)){
                                $btn.prop('disabled', false);
                                return;
                            }
                        } else if (serviceType==='retrieve'){
                            if(!hasApiKeyInstalled('image', api)){
                                $btn.prop('disabled', false);
                                return;
                            }

                        } else {
                            if ((!hasApiKeyInstalled('image', api))&&(!hasApiKeyInstalled('imagegen', api))) {
                                $btn.prop('disabled', false);
                                return;
                            }
                        }

                        query = cleanTextField(query);

                        let loLang= lo_data['treeroot']['attributes']['language'];

                        img_search_and_help(query, api, rlopathvariable, interpretPrompt, aiSettingsOverride, constructorObject, event.data.key, event.data.value, loLang);
                        $btn.prop('disabled', false);
                    });
                break;
            case 'generatesuggestionbutton':
                var id = 'generatesuggestionbutton_' + form_id_offset;
                form_id_offset++;
                html = $('<button>')
                    .attr('id', id)
                    .attr('class', 'generate_suggestion_button xerte_button_c')
                    .html('<i class="fa fa-arrows-rotate"></i> ' + language.assistents.GenerateSuggestion.$btnlabel)
                    .click({key: key}, async function(event) {
                        const $btn = $(this);          // the button that was clicked
                        // Disable the button to prevent multiple clicks
                        $btn.prop('disabled', true);
                        var type = lo_data[key].attributes.nodeName; //get the node-type
                        var baseUrl = rlopathvariable.substr(rlopathvariable.indexOf("USER-FILES"));
                        var contextScope = lo_data[key].attributes.linkID; //ensures suggestions are made based on the active node where suggestion request comes from
                        var modelTemplate = "suggestion" //use suggestion to signal we want to use the suggestion prompt for this page
                        const sourceContext = (moduleurlvariable === "modules/site/") ? "bootstrap" :
                            (moduleurlvariable === "modules/xerte/") ? "standard" : "standard";
                        // Build the constructor object based on the type
                        var constructorObject = {
                            // "additionalInstructions": "Regarding what kind of suggestions I'm looking for, see: " + lo_data[key].attributes["additionalInstructions"],
                            "additionalInstructions": language.assistents.GenerateSuggestion.$instructionprompt + lo_data[key].attributes["additionalInstructions"],
                        };
                        if (confirm(language.vendorApi.overideSuggestionMsg)){
                            try {
                                    await ai_content_generator(event, constructorObject, type, lo_data[key].attributes["aiSelector"], null, null, sourceContext, false, baseUrl, true, lo_data[key].attributes.linkID, modelTemplate);
                            } catch (error) {
                                console.log('Error occurred:', error);
                                alert(language.vendorApi.genericAiAPiError);
                            } finally {
                                // Re-enable the button after the function completes (success or failure)
                                $btn.prop('disabled', false);
                            }
                        } else {
                            $btn.prop('disabled', false);
                        }

                    });
                break;
            case 'applysuggestionbutton':
                var id = 'applysuggestionbutton_' + form_id_offset;
                form_id_offset++;
                html = $('<button>')
                    .attr('id', id)
                    .attr('class', 'apply_suggestion_button')
                    .text('Apply suggestion')
                    .click({key: key}, async function(event) {
                        const $btn = $(this);          // the button that was clicked
                        // Disable the button to prevent multiple clicks
                        $btn.prop('disabled', true);
                        var type = lo_data[key].attributes.nodeName; //get the node-type
                        var baseUrl = rlopathvariable.substr(rlopathvariable.indexOf("USER-FILES"));
                        var contextScope = "local";
                        var modelTemplate = "construct" //use construct to signal we want a 2 part prompt which doesn't use user parameters
                        const sourceContext = (moduleurlvariable === "modules/site/") ? "bootstrap" :
                            (moduleurlvariable === "modules/xerte/") ? "standard" : "standard";
                        // Build the constructor object based on the type
                        var suggestionKey = lo_data[key].attributes["suggestSelect"];
                        var constructorObject = {
                            suggestion: suggestionKey && lo_data[key].attributes[suggestionKey] ? lo_data[key].attributes[suggestionKey] : null,
                        };

                        //adjust scope as needed per interactivity
                        switch (type) {
                            //for decision trees, we want to use only the decision tree itself as context
                            case 'decision':
                                contextScope = lo_data[key].attributes.linkID;
                                break;
                        }
                        if (confirm(language.vendorApi.useSuggestionMsg)){
                            try {
                                await ai_content_generator(event, constructorObject, type, lo_data[key].attributes["aiSelector"], null, null, sourceContext, false, baseUrl, true, contextScope, modelTemplate);
                            } catch (error) {
                                console.log('Error occurred:', error);
                                alert(language.vendorApi.genericAiAPiError);
                            } finally {
                                // Re-enable the button after the function completes (success or failure)
                            $btn.prop('disabled', false);
                            }
                        } else {
                            $btn.prop('disabled', false);
                        }

                    });
                break;
            case 'aibutton':
                var id = 'aibutton_' + form_id_offset;
                form_id_offset++;
                html = $('<button>')
                    .attr('id', id)
                    .attr('class', 'ai_button xerte_button_c')
                    .html('<i class="fa fa-wand-magic"></i> ' + language.assistents.AIBtn.$label)
                    .click({key: key, group: options.group}, async function(event) {
                        const $btn = $(this);          // the button that was clicke
                        // Disable the button to prevent multiple clicks
                        $btn.prop('disabled', true);
                        event.preventDefault();

                        if ($("#job-ui").length === 0) {
                            const jobUI = `
                              <div id="job-ui" style="margin-top:1em;">
                                <div id="job-starting" style="display:none;">
                                    <div id="job-spinner">⏳</div>
                                    <div id="job-status">${language.assistents.AIGenerationStatus.LLMStarting}</div>
                                    <div id="job-progress-container" style="width:100%;background:#eee;height:4px;">
                                      <div id="job-progress" style="width:0%;height:4px;background:#4caf50;"></div>
                                    </div>
                                </div>
                              </div>`;
                            $(this).after(jobUI);
                        }

                        let constructorObject = getConstructorFromLightbox(html, event.data.group);

                        if (constructorObject === false) {return}
                        if ("fileAccessPrompt" in constructorObject && constructorObject["fileAccessPrompt"] === 'true') {
                            constructorObject["access"] = "HAVE";
                        } else {
                            constructorObject["access"] = "DON'T HAVE";
                        }

                        //generic info here
                        let aiSettings = {};
                        aiSettings['key'] = event.data.key;
                        aiSettings['type'] = lo_data[key].attributes.nodeName;

                        aiSettings['language'] = lo_data['treeroot']['attributes']['language'];

                        aiSettings['modelSelection'] = constructorObject['aiSelector'] !== undefined ? constructorObject['aiSelector'] : 'No type selected';
                        delete constructorObject.aiSelector;

                        aiSettings['sourceContext'] = (moduleurlvariable === "modules/site/") ? "bootstrap" : "standard";

                        aiSettings['assisstantPrompt'] = constructorObject['assisstantPrompt'] !== undefined ? constructorObject['assisstantPrompt'] : false;
                        delete constructorObject.assisstantPrompt;

                        aiSettings['useContext'] = constructorObject['useContext'] !== undefined ? constructorObject['useContext'] : false;
                        delete constructorObject.useContext;

                        aiSettings['contextScope'] = "full"; //Currently supported: "full" for the entire learning object, OR the linkID value for the current node
                        aiSettings['modelTemplate'] = "standard";

                        //additional file/snippet stuff here
                        aiSettings['baseUrl'] = rlopathvariable.substr(rlopathvariable.indexOf("USER-FILES"));

                        aiSettings['fileUrl'] = constructorObject['file'] ? constructorObject['file'] : null;
                        delete constructorObject.fileUrl;

                        aiSettings['updateLoOnRequest'] = constructorObject['updateLoOnRequest'] !== undefined ? constructorObject['updateLoOnRequest'] : null;
                        delete constructorObject.updateLoOnRequest;

                        //TODO: this needs to handle defaults in all languages, not just English!
                        // Check if fileUrl is "Upload a file", empty, or just whitespace
                        if (aiSettings['fileUrl'] === "Upload a file or enter a video link here..." || aiSettings['fileUrl'] === "Select a file or enter a video link here..." || !aiSettings['fileUrl'] || aiSettings['fileUrl'].trim() === "") {
                            aiSettings['fileUrl'] = null;
                        }

                        let uploadPrompt = constructorObject['uploadPrompt'] !== undefined ? constructorObject['uploadPrompt'] : 'false';
                        delete constructorObject.uploadPrompt;

                        aiSettings['textSnippet'] = constructorObject['textSnippet'] !== undefined ? constructorObject['textSnippet'] : null;
                        delete constructorObject.textSnippet;
                        if (aiSettings['textSnippet'] === "Paste or write your snippet here..." || !aiSettings['textSnippet'] || aiSettings['textSnippet'].trim() === "") {
                            aiSettings['textSnippet'] = null;
                        }

                        // Update bar helpers

                        function addLLMJobBar() {
                            const $jobUI = $('#job-ui');
                            if (!$jobUI.length) return;

                            // Avoid duplicates if the user triggers multiple times
                            if ($('#llm-ui').length) return;

                            const llmUI = `
                            <div id="llm-ui" style="margin-top:.75em;">
                              <div id="llm-status">${language.assistents.AIGenerationStatus.LLMInProgress}</div>
                              <div id="llm-progress-container" style="width:100%;background:#eee;height:4px;">
                                <div id="llm-progress" style="width:25%;height:4px;background:#4caf50;"></div>
                              </div>
                            </div>`;
                            $jobUI.append(llmUI);
                        }

                        function startLLMFakeProgress() {
                            let pct = 25;
                            const $bar = $('#llm-progress');
                            const $status = $('#llm-status');

                            if (!$bar.length) return () => {};

                            $status.text(language.assistents.AIGenerationStatus.LLMInProgress);
                            $bar.css('width', pct + '%');

                            // creep up to a cap (don’t hit 100% until the await finishes)
                            const cap = 92;
                            const timer = setInterval(() => {
                                const remaining = cap - pct;
                                const step = Math.max(0.4, remaining * 0.08); // slows down near cap
                                pct = Math.min(cap, pct + step);
                                $bar.css('width', pct.toFixed(1) + '%');
                            }, 450);

                            return () => clearInterval(timer);
                        }

                        function finishLLMOk() {
                            $('#llm-progress').css('width', '100%');
                            $('#llm-status').text(language.assistents.AIGenerationStatus.LLMOk);
                        }

                        // Corpus sync and update functions:
                        /*
                        * Normalises the upload path provided and extracts the relevant portions.
                        *
                        * URLs with the same origin as site, as well as abstracted paths like 'FileLocation + path' will
                        * have the relevant portions after RAG/corpus extracted.
                        *
                        * Other URLs, such as video site URLs, are left the same.
                        * */
                        function normalizePath(raw) {
                            // strip any surrounding single or double quotes
                            raw = raw.replace(/^['"]+|['"]+$/g, '');

                            // 1) Full URLs with scheme (http:// or https://)
                            if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(raw)) {
                                try {
                                    const u = new URL(raw);
                                    if (u.origin !== window.location.origin) {
                                        // External URL => leave intact
                                        return raw;
                                    }
                                    // Same-origin URL => strip after /RAG/corpus/ if present
                                    const idx = u.pathname.indexOf('/RAG/corpus/');
                                    return (idx !== -1)
                                        ? u.pathname.slice(idx + 1).replace(/^['"]+|['"]+$/g, '')
                                        : raw;
                                } catch {
                                    alert(`${raw} ${language.vendorApi.contextAlerts.malformedContextUrlMsg}`);
                                    throw new Error(`Malformed URL: ${raw}`);
                                }
                            }

                            // 2) Bare hostnames without scheme => user error
                            if (/^[^\/]+\.[^\/]+(\/|$)/.test(raw)) {
                                alert(`${raw} ${language.vendorApi.contextAlerts.missingHttpMsg}`);
                                throw new Error(`Invalid URL: ${raw}`);
                            }

                            // 3) Anywhere the text "RAG/corpus/" appears, pull out from there
                            const idxAny = raw.indexOf('RAG/corpus/');
                            if (idxAny !== -1) {
                                // slice and strip quotes again just in case
                                return raw
                                    .slice(idxAny)
                                    .replace(/^['"]+|['"]+$/g, '');
                            }

                            // 4) Nothing matched → error
                            alert(`${raw} ${language.vendorApi.contextAlerts.unrecognisedContextPathMsg}`);
                            throw new Error(`Unrecognized path: ${raw}`);
                        }

                        /* Upload a single file to the corpus.
                        *
                        * To maintain the proper shape for the back-end function, we approximate a grid by creating
                        * one with a single row, based on the file indicated in the information source.
                        *
                        * If useLoInCorpus is true, we instead create an empty file list as there is no file URL,
                        * and pass useLoInCorpus to the final requests which signals that we intend to use the latest preview.xml.
                        *
                        */
                        async function updateCorpus(fileUrl, corpusGrid = false, useLoInCorpus, LOlanguage) {
                            const baseURL = rlopathvariable.substr(rlopathvariable.indexOf("USER-FILES"));

                            let singleRow;
                            if (!useLoInCorpus) {
                                singleRow = {
                                    col_1: "",
                                    col_2: normalizePath(fileUrl),
                                    col_3: "",
                                    col_4: ""
                                };
                            } else {
                                singleRow = {
                                    col_1: "",
                                    col_2: [],
                                    col_3: "",
                                    col_4: ""
                                };
                            }

                            const payload = { name, baseURL, gridData: [singleRow], corpusGrid, useLoInCorpus, LOlanguage};

                            $('body, .featherlight, .featherlight-content').css("cursor", "wait");

                            try {
                                // 1) Start the job and wait for the "start" response (job_id)
                                const resp = await new Promise((resolve, reject) => {
                                    $.ajax({
                                        url: 'editor/ai/rag/syncCorpus_start.php',
                                        method: 'POST',
                                        contentType: 'application/json',
                                        data: JSON.stringify(payload),

                                        success: function (resp) {
                                            $("#job-ui").show();
                                            $("#job-status").text(`${language.assistents.AIGenerationStatus.LLMSyncQueued}`);
                                            $("#job-progress").css("width", "0%");
                                            resolve(resp);
                                        },

                                        error: function (xhr, status, err) {
                                            console.error('Corpus sync failed:', err);
                                            alert(`${language.vendorApi.contextAlerts.syncErrorGenericMsg}`);
                                            reject(err);
                                        }
                                    });
                                });

                                // 2) Now poll until the job is really done
                                const finalStatus = await pollJobStatus(resp.job_id, baseURL);

                                // 3) Return the final completion info / status
                                return finalStatus;

                            } finally {
                                // always reset cursor
                                $('body, .featherlight, .featherlight-content').css("cursor", "default");
                            }
                        }

                        async function pollJobStatus(jobId, baseURL) {
                            return new Promise((resolve, reject) => {

                                const statusUrl = "editor/ai/rag/syncCorpus_status.php?job_id=" +
                                    encodeURIComponent(jobId) + "&baseURL=" +
                                    encodeURIComponent(baseURL);

                                $("#job-starting").show();
                                const statusEl = $("#job-status");
                                const spinner = $("#job-spinner");

                                function checkStatus() {
                                    $.ajax({
                                        url: statusUrl,
                                        method: "GET",
                                        cache: false,
                                        success: function (data) {

                                            // Update UI
                                            statusEl.text((data.stage || data.status || language.assistents.AIGenerationStatus.LLMLoaded) +
                                                " — " + (data.message || ""));

                                            if (data.progress !== undefined) {
                                                $("#job-progress").css("width", data.progress + "%");
                                            }

                                            if (data.status === "processed") {
                                                spinner.hide();
                                                const first = data['completion_info'].results?.[0] || {};
                                                const displaymsg =
                                                    first.rag_status ||
                                                    first.transcription_status ||
                                                    data['completion_info']?.error ||
                                                    'No status available';
                                                //alert(displaymsg);
                                                statusEl.text(`✅ ${language.assistents.AIGenerationStatus.LLMSyncComplete}`);
                                                resolve(data['completion_info']);
                                                return;
                                            }

                                            if (data.status === "error") {
                                                spinner.hide();
                                                statusEl.text(`❌ ${language.assistents.AIGenerationStatus.LLMSyncFailed} ` + (data.error || "unknown"));
                                                reject(data['completion_info']);
                                                return;
                                            }

                                            setTimeout(checkStatus, 3000);
                                        },
                                        error: function (xhr, status, err) {
                                            console.log("Polling error:", err);
                                            setTimeout(checkStatus, 5000);
                                        }
                                    });
                                }

                                // start polling
                                checkStatus();
                            });
                        }

                        /* Fetch existing corpus files, alongside descriptive data.
                         *
                         * Returns a Promise that resolves with the corpus data which itself is a json.
                         *
                         */
                        function fetchCorpus() {
                            const baseURL = rlopathvariable.substr(rlopathvariable.indexOf("USER-FILES"));
                            $('body, .featherlight, .featherlight-content').css("cursor", "wait");
                            return new Promise((resolve, reject) => {
                                $.ajax({
                                    url: 'editor/ai/rag/getCorpus.php',
                                    method: 'POST',
                                    contentType: 'application/json',
                                    dataType: 'json',
                                    data: JSON.stringify({
                                        name: "",
                                        baseURL: baseURL,
                                        type: "",
                                        gridId: "",
                                        format: "json"
                                    }),
                                    success: function(resp) {
                                        if (!resp?.corpus) {
                                            alert(`${language.vendorApi.contextAlerts.noContextReturnedSubmitMsg}`);
                                            reject(new Error('No corpus data'));
                                            return;
                                        }
                                        resolve(resp.corpus);
                                    },
                                    error: function(xhr, status, err) {
                                        console.error('Failed to fetch corpus:', err);
                                        alert(`${language.vendorApi.contextAlerts.noContextReturnedSubmitMsg}`);
                                        reject(err);
                                    },
                                    complete: function() {
                                        // Always reset cursor
                                        $('body, .featherlight, .featherlight-content').css("cursor", "default");
                                    }
                                });
                            });
                        }


                        /*
                        * Depending on the configuration, function does several things:
                        *
                        * If restrictCorpusToLo is true, inform the user that the latest LO preview will be processed and return true.
                        *
                        * If not, we first retrieve the existing corpus data and check the fileUrl found in the information
                        * source against the results.
                        *
                        * If the file is found, return it.
                        *
                        * If the file is not found, prompt the user whether they wish to process this file.
                        * Once the file is processed, return it.
                        *
                         */
                        async function doCorpusCheck(fileUrl, loSettings) {
                            const statusEl = $("#job-status");
                            if (loSettings['useLoInCorpus'] === true){
                                alert(`${language.vendorApi.contextAlerts.contextUpdatePreviewMsg}`);
                                await savepreviewPromise();
                                const data = await updateCorpus(fileUrl, false, true, loSettings['language']);
                                const first = data.results?.[0] || {};
                                const displaymsg =
                                    first.rag_status ||
                                    first.transcription_status ||
                                    resp?.error ||
                                    'No status available';
                                alert(displaymsg);
                                if ((data?.results?.[0]?.continue_request === 'false')|| (data.success === false)){
                                    return false;
                                }else{
                                    return true; //updated lo
                                }
                            } else if (!loSettings['restrictCorpusToLo']){
                                try {
                                    const corpusResp = await fetchCorpus(); // returns { hashes: [...] }
                                    const hashes = corpusResp.hashes || [];
                                    const match = hashes.find(
                                        hash => hash.metaData && hash.metaData.source === fileUrl
                                    );

                                    if (match) {
                                        alert(`${language.vendorApi.contextAlerts.contextFileFoundProceedMsg}`);
                                        statusEl.text(`✅ ${language.assistents.AIGenerationStatus.LLMSyncAlreadySynced}`);
                                        return match.metaData.source;  // file found
                                    } else {
                                        if (confirm(`${language.vendorApi.contextAlerts.contextInPageProcessPromptMsg}`)){
                                            let fileStatus = await updateCorpus(fileUrl, false, loSettings['useLoInCorpus'], loSettings['language']);
                                            const first = fileStatus.results?.[0] || {};
                                            const displaymsg =
                                                first.rag_status ||
                                                first.transcription_status ||
                                                resp?.error ||
                                                'No status available';
                                            alert(displaymsg);
                                            if ((fileStatus?.results?.[0]?.continue_request === 'false') || (fileStatus.success === false)) {
                                                return false;
                                            } else {
                                                return fileStatus?.results?.[0]?.id;
                                            }
                                        } else {
                                            // User cancelled
                                            return null; // or just let it be undefined
                                        }
                                    }
                                } catch (err) {
                                    console.error('Error checking corpus:', err);
                                    return null;
                                }
                            }

                        }
                        /*end function definitions*/

                         /* Before proceeding with ai request, we check if the user has indicated a file to upload to the corpus.
                         *
                         * If the file(s) is present in the corpus, we allow the request to continue whilst indicating which file(s) the user selected.
                         *
                         * If the file is not present, we alert the user; they can then choose to add the file to the corpus, after which they can make a request again.
                         */
                        let loSettings = {};
                        if (uploadPrompt == 'context'){
                            aiSettings['useCorpus'] = true;
                        }
                        loSettings['language'] = lo_data['treeroot']['attributes']['language'];

                        const requiredLoTypes = ['summary', 'orient'];
                        //useLoInCorpus->add the current learning object preview to corpus
                        //restrictCorpusToLo->make sure the only thing being used for knowledge retreival is the LO
                        if (requiredLoTypes.includes(aiSettings['type'])||uploadPrompt == 'lo'){
                            loSettings['useLoInCorpus'] = true;
                            loSettings['restrictCorpusToLo'] = true;
                        }
                        const requiredUploadTypes = ['ivOverlayPanel'];
                        if (requiredLoTypes.includes(aiSettings['type']) || requiredUploadTypes.includes(aiSettings['type']) ){
                            uploadPrompt = 'true';
                        }

                        if (loSettings['restrictCorpusToLo'] === true){
                            aiSettings['useCorpus'] = true;
                        }


                        if (hasApiKeyInstalled('ai', aiSettings['modelSelection']) && confirm(language.vendorApi.overideContentMsg)) {
                            try {
                                let fullUrl = null;
                                if ((uploadPrompt === 'true')&&(!(loSettings['useLoInCorpus'] && loSettings['restrictCorpusToLo']))) {
                                    if (aiSettings['fileUrl'] === null) {
                                        alert(`${language.vendorApi.contextAlerts.contextFileUploadMissingInput}`);
                                        return;
                                    }
                                    let cleanFileUrl = aiSettings['fileUrl'].replace("FileLocation + '", "").replace("'", "");
                                    fullUrl = baseUrl + cleanFileUrl;
                                } else if (aiSettings['textSnippet'] === null && aiSettings['uploadPrompt'] === 'trueText') {
                                    alert(`${language.vendorApi.contextAlerts.contextSnippetMissingInput}`);
                                    return;
                                }

                                if (loSettings['useLoInCorpus'] === true ||
                                    loSettings['restrictCorpusToLo'] === true ||
                                    aiSettings['fileUrl'] !== null){
                                    const fileUrl = aiSettings['fileUrl'];
                                    let fileStatus = null;
                                    $("#job-starting").show();
                                    fileStatus = await doCorpusCheck(fileUrl, loSettings);
                                    if (fileStatus === false){
                                        $btn.prop('disabled', false);
                                        return;
                                    } else if (loSettings['restrictCorpusToLo'] === true){
                                        aiSettings['fileList'] = [];
                                    }
                                    else {
                                        aiSettings['fileList'] = [normalizePath(fileStatus)];
                                    }
                                }

                                aiSettings['loSettings'] = loSettings;

                                aiSettings['fullUrl'] = fullUrl;
                                // Add a visual loading indicator to existing job sync bar, if any
                                addLLMJobBar();
                                const stopFake = startLLMFakeProgress();

                                await ai_content_generator(aiSettings, constructorObject);
                                stopFake();
                                finishLLMOk();
                            }
                            catch (error) {
                                console.log('Error occurred:', error);
                                //stopFake();
                                alert(language.vendorApi.genericAiAPiError);
                            } finally {
                                // Re-enable the button after the function completes (success or failure)
                                $btn.prop('disabled', false);
                            }
                        } else {
                            $btn.prop('disabled', false);
                        }
                        // Disable the job-ui as its no longer necessary sine the job finished
                        $("#job-ui").remove();
                        $btn.prop('disabled', false);
                    });
                break;
        case 'toggleadvanced':
				var id = 'toggleAdvanced_' + form_id_offset;
				form_id_offset++;
				let action = "show";
				if(window.showAdvanced[key]) {
					action = "hide";
				}
				html = $('<input type="checkbox">')
					.attr('id', id)
					.text(action + ' advanced options')
					.attr('title', 'click to show advanced options')
					.addClass('toggleAdvanced')
					.click(() => {
						window.showAdvanced[key] = !window.showAdvanced[key];
						triggerRedrawForm(options.group, key, "", "initialize");
					});
				if(window.showAdvanced[key]){
						html.attr("checked", "true");
				}
                break;
            case 'corpusgrid':
                //Based on datagrid with some specific changes for the purposes of AI usage itself
                var id = 'grid_' + form_id_offset;
                form_id_offset++;
                html = $('<div>')
                    .attr('id', id)
                    .addClass('corpusgrid')
                    .append($('<table>')
                        .attr('id', id + '_jqgrid'))
                    .append($('<div>')
                        .attr('id', id + '_nav'))
                    .append($('<div>')
                        .attr('id', id + '_addcolumns')
                        .addClass('jqgridAddColumnsContainer'));

            /*Retrieves the latest list of processed files for the corpus and updates the grid with the same values. */
            function updateGrid(name, id) {
                //the load happens on page load or instantiation, we don't need to do this for everything
                const baseURL = rlopathvariable.substr(rlopathvariable.indexOf("USER-FILES"));

                $.ajax({
                    url: 'editor/ai/rag/getCorpus.php',
                    method: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify({
                        name: name,
                        baseURL: baseURL,
                        type: name,
                        gridId: id,
                        format: "csv"
                    }),
                    success: function(resp) {
                        var gridId = '#' + resp.gridId + '_jqgrid';
                        $(gridId).jqGrid('clearGridData');
                        setAttributeValue(key, [resp.type], [resp.corpus]);
                        var rows = readyLocalJgGridData(key, resp.type);
                        $(gridId).jqGrid('setGridParam', {data: rows});
                        $(gridId).trigger('reloadGrid');

                        // show a count
                        let totalFiles = 0;
                        if (resp.corpus && typeof resp.corpus === "string") {
                            // Remove leading/trailing whitespace, split on newlines, filter out empty lines
                            totalFiles = resp.corpus.trim().split('\n').filter(line => line.trim() !== '').length;
                        }
                    },
                    error: function(xhr, status, err) {
                        console.error('Failed to fetch corpus:', err);
                        alert(`${language.vendorApi.contextAlerts.noContextReturnedSubmitMsg}`);
                    }
                });
            }
                updateGrid(name, id);

                //return xml
                datagrids.push({id: id, key: key, name: name, options: options});
                break;
            case 'lightboxbutton':
                //identifier of button is linked to group name instead of identifier.
                //this button is generated based on lightbox=='true' in a group
                var id = 'lightboxbutton_' + name;

                html = $('<button>')
                    .attr('id', id)
                    .attr('class', 'lightboxbutton')
                    //.text('language.lightbox.settingsButton');
                    .text('Open AI Settings');

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
                        .attr('name', name)
                        .attr('type', 'wysiwyg')
						.addClass('inlinewysiwyg')
						.attr('contenteditable', 'true');

                    // Do not always add a paragraph tag if the value already starts with a <p tag (with for example a class attribute)
                    if (value.indexOf('<p') === 0) {
                        html = html.append(value);
                    } else {
                        html = html.append('<p>' + value + '</p>');
                    }
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
						.attr('placeholder', options.placeholder)
                        .attr('name', name)
						.keyup({name: name, key: key, options: options}, function()
						{
							if (name == 'name') {
								// Rename the node
								var tree = $.jstree.reference("#treeview");
								tree.rename_node(tree.get_node(key, false), $(this).val());
							}
						})
						.change({id:id, key:key, name:name, trigger:conditionTrigger, group:options.group}, function(event)
						{
                            let fieldValue = this.value;
                            if (mode === "none") {
                                if (fieldValue !== "" && options.defaultValuePH !== undefined) {
                                    fieldValue = options.defaultValuePH;
                                }
                            }

                                inputChanged(event.data.id, event.data.key, event.data.name, fieldValue, this);
                            if (event.data.trigger)
                            {
                                //no lightbox so redraw entire page
                                if (mode === "none") {
                                    triggerRedrawPage(event.data.key);
                                } else {
                                    //lightbox so redraw only the lightbox form.
                                    triggerRedrawForm(event.data.group, event.data.key, "", "initialize");
                                }
                            }
						})
						.attr('value', value);
                    //adds regex used for validation of the lightbox form input field.
                    if (options.verification !== undefined && options.verification !== ""){
                        html.attr('pattern', options.verification)
                    }

                    if (options.defaultValuePH !== undefined && options.defaultValuePH !== "") {
                        html.attr('defaultvalueph', options.defaultValuePH)
                    }

                    if (options.overrideField !== undefined && options.overrideField !== "") {
                        html.attr('overridefield', options.overrideField)
                    }

                    if (options.label !== undefined && options.label !== ""){
                        html.attr('label', options.label)
                    }
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
    my.evaluateCondition = evaluateCondition;
    my.displayParameter = displayParameter;
	my.displayGroup = displayGroup;
    my.convertTextAreas = convertTextAreas;
    my.convertTextInputs = convertTextInputs;
    my.convertColorPickers = convertColorPickers;
	my.convertIconPickers = convertIconPickers;
    my.convertDataGrids = convertDataGrids;
    my.convertTreeSelect = convertTreeSelect;
    my.resizeDataGrids = resizeDataGrids;
    my.showToolBar = showToolBar;
    my.getIcon = getIcon;
    my.insertOptionalProperty = insertOptionalProperty;
    my.getPageList = getPageList;
    my.hideInlineEditor = hideInlineEditor;
    my.triggerRedrawForm = triggerRedrawForm;
    my.triggerRedrawPage = triggerRedrawPage;


    return parent;

})(jQuery, EDITOR || {});


