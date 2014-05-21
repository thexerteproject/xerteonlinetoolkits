// *******************
// *     Toolbox    *
// *******************
var EDITOR = (function ($, parent) {

    var my = parent.toolbox = {},

    // Build the "insert page" menu
    create_insert_page_menu = function () {
        var getMenuItem = function (itemData) {
            var data = {
                href: '#',
                html: itemData.name
            };

            if (itemData.hint != undefined) {
                data.hint = itemData.hint;
            }

            if (itemData.thumb != undefined) {
                data.thumb = itemData.thumb;
            }

            if (itemData.icon != undefined) {
                data.icon = itemData.icon;
            }

            var item = $("<li>").append(
                $("<a>", data)
            );

            if (itemData.submenu != undefined) {
                var subList = $("<ul>");
                $.each(itemData.submenu, function () {
                    subList.append(getMenuItem(this));
                });
                item.append(subList);
            }
            return item;
        };

        var $menu = $("<ul>", {
            id: 'menu'
        });
        $.each(menu_data.menu, function () {
            $menu.append(
                getMenuItem(this)
            );
        });
        $("#insert-menu").append(
            $menu.menu({
                select: function(event, ui) {
                    if (ui.item.children().attr('hint') != undefined) {
                        $("#insert-info img").attr("src", "modules/xerte/parent_templates/Nottingham/" + ui.item.children().attr('thumb'));
                        $("#insert-info span").text(ui.item.children().attr('hint'));
                        $("#insert-buttons").show();
                    }
                }
            })
        );
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


    // ** Recursive function to traverse the xml and build
    build_lo_data = function (xmlData, parent_id) {

        // First lets generate a unique key
        var key = generate_lo_key();
        if (parent_id == null)
        {
            key = 'treeroot';
        }

        // Parse the attributes and store in the data store
        var attributes = [{ name: 'nodeName', value: xmlData[0].nodeName }];
        $(xmlData[0].attributes).each(function() {
            attributes.push({name: this.name, value: this.value});
        });
        lo_data[key] = {};
        lo_data[key]['attributes'] = attributes;
        if (xmlData[0].firstChild && xmlData[0].firstChild.nodeType == 4)  // cdata-section
        {
            lo_data[key]['data'] = xmlData[0].firstChild.data;
        }

        // Build the JSON object for the treeview
        // For version 3 jsTree
        var this_json = {
            id : key,
            text : (xmlData[0].attributes['name'] ? xmlData[0].attributes['name'].value : xmlData[0].nodeName),
            icon : 'editor/img/page_types/' + xmlData[0].nodeName + '.png'
        }

        // if we are at top level then make sure it's open and display node data
        if (parent_id == null) {
            this_json.state = { opened : true };
            //showNodeData(key);
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


    getAttributeValue = function (attributes, name, options, key)
    {
        var attribute_value;
        var attr_found = false;

        // find the value
        for (var j=0; !attr_found && j<attributes.length; j++) {
            if (attributes[j].name == name)
            {
                attribute_value = attributes[j].value;
                attr_found = true;
            }
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


    displayParameter = function (id, all_options, name, value, key)
    {
        var options = getOptionValue(all_options, name);
        if (options != null)
        {
            var output_string = '<tr class="wizardattribute">';
            if (options.optional == 'true')
            {
                output_string += '<td class="wizardoptional"><img id="opt_'+ name +'" src="editor/img/optional.gif" class="optional" />&nbsp;</td>';
            }
            else
            {
                output_string += '<td class="wizardparameter"></td>';
            }
            output_string += '<td class="wizardlabel">' + options.label + ' : </td>';
            output_string += '<td class="wizardvalue">' + displayDataType(value, options, name, key) + '</td>';
            output_string += '</tr>';
            $(id).append(output_string);
            if (options.optional == 'true') {
                $("#opt_"+ name).on("click", function () {
                    var this_name = name;
                    removeOptionalProperty(this_name);
                });
            }
        }
    },


    removeOptionalProperty = function (name) {
        console.log("Handler for removing optional properties called: " + name);

        // Need to remove row from the screen and
        // Also need to remove property from the data store
    },


    convertTextAreas = function ()
    {
        $.each(textareas_options, function (i, options) {
            var ckoptions = {};

            if (options.options.height)
            {
                var height = parseInt(options.options.height) + 20;
                ckoptions['height'] = height;
            }
            if (options.options.type == 'script')
            {
                // enable source mode of ckeditor
            }
            $('#'+options.id).ckeditor(function(){
                // Editor is ready, attach onblur event
                this.on('blur', function(){
                    // This is the call back when editor looses focus
                    if (this.checkDirty())
                    {
                        inputChanged(options.id, options.key, options.name, this.getData());
                    }
                })
            }, ckoptions);
        });
    },


    convertTextInputs = function ()
    {
        $.each(textinputs_options, function (i, options) {
            $('div.inputtext').ckeditor(function(){
                // Editor is ready, attach onblur event
                this.on('blur', function(){
                    // This is the call back when editor looses focus
                    if (this.checkDirty())
                    {
                        var thisValue = this.getData();
                        thisValue = thisValue.substr(0, thisValue.length-1); // Remove the extra linebreak

                        if (options.name = 'name') {
                            // Get cleaned up text - must be a better way of doing this
                            var strippedValue = thisValue.substr(3);
                            strippedValue = strippedValue.substr(0, strippedValue.length-4);
                            strippedValue = strippedValue.trim();

                            // Rename the node
                            var tree = $.jstree.reference("#treeview");
                            tree.rename_node(tree.get_node(options.key, false), strippedValue);
                        }

                        inputChanged(options.id, options.key, options.name, thisValue);
                    }
                })
            }, { toolbarGroups : [
                { name: 'basicstyles', groups: [ 'basicstyles' ] },
                { name: 'colors' }]
            });
        });
    },


    convertColorPickers = function ()
    {
        $.each(colorpickers, function (i, options){
            var myPicker = new jscolor.color(document.getElementById(options.id), {})
            myPicker.fromString(options.value)  // now you can access API via 'myPicker' variable

        });
    },

    setAttributeValue = function (key, name, value)
    {
        var attributes = lo_data[key]['attributes'];
        // Get the node name
        var node_name = '';var i=attributes.length;
        for(var i=0; i< attributes.length; i++)
        {
            if (attributes[i].name == 'nodeName')
            {
                node_name = attributes[i].value;
                break;
            }
        }

        var node_options = wizard_data[node_name].node_options;

        if (node_options['cdata'] && node_options['cdata_name'] == name)
        {
            lo_data[key]['data'] = value;
        }
        else
        {
            var attr_found = false;

            // find the value
            for (var j=0; !attr_found && j<attributes.length; j++) {
                if (attributes[j].name == name)
                {
                    attributes[j].value = value;
                    attr_found = true;
                }
            }
        }
    },


    cbChanged = function (id, key, name)
    {
        //console.log(id + ': ' + key + ', ' +  name);
        var value = $('#' + id).is(':checked');
        if (value)
        {
            value = 'true';
        }
        else
        {
            value = 'false';
        }
        setAttributeValue(key, name, value);
    },


    selectChanged = function (id, key, name)
    {
        //console.log(id + ': ' + key + ', ' +  name);
        var value = $('#' + id).val();
        setAttributeValue(key, name, value);
    },


    inputChanged = function (id, key, name, passedValue)
    {
        //console.log(id + ': ' + key + ', ' +  name  + ', ' +  passedValue);
        var value, valuePassed = (arguments.length == 4);

        if (id.indexOf('textinput') >= 0)
        {
            value = (valuePassed) ? passedValue : $('#' + id).html();
            value = value.substr(3);
            value = value.substr(0, value.length-4);
            value.trim();
        }
        else
        {
            value = $('#' + id).val();
        }

        if (id.indexOf('color')>=0)
        {
            value = value.substr(1);
            value = '0x' + value;
        }
        setAttributeValue(key, name, value);
    },


    displayDataType = function (value, options, name, key) {
        var html;                   //console.log(options);

        switch(options.type.toLowerCase())
        {
            case 'checkbox':
                var id = 'checkbox_' + form_id_offset;
                form_id_offset++;
                html = '<input id="' + id + '" type="checkbox" ' + (value=='true'? 'checked' : '') + ' onchange="cbChanged(\'' + id + '\', \'' + key + '\', \'' + name + '\')" />';
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
                html = '<select id="' + id + '" onchange="selectChanged(\'' + id + '\', \'' + key + '\', \'' + name + '\')" >';
                for (var i=0; i<s_options.length; i++) {
                    html += "<option value=\"" + s_options[i] + (s_options[i]==value ? "\" selected=\"selected\">" : "\">") + (options.data ? s_data[i] : s_options[i]) + "</option>";
                }
                html += '</select>';
                break;
            case 'text':
            case 'script':
            case 'html':
            case 'textarea':
                var id = "textarea_" + form_id_offset;
                form_id_offset++;
                html = "<div style=\"width:1000px\"><textarea id=\"" + id + "\" class=\"ckeditor\" onchange=\"inputChanged('" + id + "', '" + key + "', '" + name + "')\" style=\"";
                if (options.height) html += "height:" + options.height + "px";
                html += "\">" + value + "</textarea></div>";
                textareas_options.push({id: id, key: key, name: name, options: options});
                break;
            case 'numericstepper':
                var min = parseInt(options.min);
                var max = parseInt(options.max);
                var step = parseInt(options.step);
                var intvalue = parseInt(value);
                //console.log({min: min, max: max, step: step});
                if (!Modernizr.inputtypes.number)
                {
                    var id = 'select_' + form_id_offset;
                    form_id_offset++;
                    html = '<select id="' + id + '" onchange="selectChanged(\'' + id + '\', \'' + key + '\', \'' + name + '\')" >';
                    for (var i=min; i<=max; i += step) {
                        html += "<option value=\"" + i + (intvalue==i ? "\" selected=\"selected\">" :  "\">") + i + "</option>";
                    }
                    html += "</select>";
                }
                else
                {
                    var id = 'numericstepper_' + form_id_offset;
                    form_id_offset++;
                    html = '<input id="' + id + '" type="number" min="' + min + '" max="' + max + '" step="' + step + '" value="' + value + '" onchange="inputChanged(\'' + id + '\', \'' + key + '\', \'' + name + '\')" >';
                }
                break;
            case 'pagelist':
                // Implement differently then in the flash editor
                // Leave PageIDs untouched, and prefer to use the PageID over the linkID
                var id = 'select_' + form_id_offset;
                form_id_offset++;
                html = '<select id="' + id + '" onchange="selectChanged(\'' + id + '\', \'' + key + '\', \'' + name + '\')" >';
                // Add empty entry
                html += "<option value=\"\"" + (value == "" ? " selected=\"selected\">" :  ">") + "&nbsp;</option>";
                $.each(lo_data, function(i, data){
                    var name = getAttributeValue(data['attributes'], 'name', [], i);
                    var pageID = getAttributeValue(data['attributes'], 'pageID', [], i);
                    var linkID = getAttributeValue(data['attributes'], 'linkID', [], i);
                    if ((pageID.found && pageID.value != "") || (linkID.found && linkID.value != ""))
                    {
                        if (pageID.found)
                        {
                            html += "<option value=\"" + pageID.value
                                + (value ==  pageID.value || value == linkID.value ? "\" selected=\"selected\">" :  "\">")
                                + name.value + "</option>";
                        }
                        else
                        {
                            html += "<option value=\"" + linkID.value
                                + (value == linkID.value ? "\" selected=\"selected\">" :  "\">")
                                + name.value + "</option>";
                        }
                    }
                });
                html += "</select>";
                break;
            case 'colourpicker':
                var colorvalue = value;
                var id = 'colorpicker_' + form_id_offset;
                form_id_offset++;
                if (colorvalue.indexOf("0x") == 0)
                {
                    colorvalue ='#' + colorvalue.substr(2);
                }
                if (Modernizr.inputtypes.color)
                {
                    html = '<input id='+ id + ' type="color" value="' + colorvalue + '" onchange="inputChanged(\'' + id + '\', \'' + key + '\', \'' + name + '\')">';
                }
                else
                {
                    html = '<input id='+ id + ' class="color" value="' + colorvalue + '" onchange="inputChanged(\'' + id + '\', \'' + key + '\', \'' + name + '\')">';
                    colorpickers.push({id: id, value: colorvalue, options: options});
                }
                break;
            case 'hotspot':
            case 'drawing':
            case 'languagelist':
            case 'datefield':
            case 'datagrid':
            case 'webpage':
            case 'media':
            default:

                 //html = "<input type=\"text\" value=\"" + value + "\" />";
                var id = 'textinput_' + form_id_offset;
                form_id_offset++;
                html = "<div id=\"" + id + "\" class=\"inputtext\" contenteditable=\"true\" ><p>" + value + "</p></div>";
                textinputs_options.push({id: id, key: key, name: name, options: options});
        }
        return html;
    };

    // Add the functions that need to be public
    my.build_lo_data = build_lo_data;
    my.create_insert_page_menu = create_insert_page_menu;
    my.getAttributeValue = getAttributeValue;
    my.displayParameter = displayParameter;
    my.convertTextAreas = convertTextAreas;
    my.convertTextInputs = convertTextInputs;
    my.convertColorPickers = convertColorPickers;

    return parent;

})(jQuery, EDITOR || {});

