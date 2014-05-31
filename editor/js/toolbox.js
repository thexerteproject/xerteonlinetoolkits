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
            type : xmlData[0].nodeName
        }
        console.log(this_json);

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
        var options = (nodelabel ? {type : name} : getOptionValue(all_options, name));
        var label = (nodelabel ? nodelabel : options.label);
        if (options != null)
        {
            //var output_string;
            var tr = $('<tr>');
            if (options.optional == 'true')
            {
                tr.attr('id', 'opt_'+ name)
                    .addClass("wizardattribute")
                    .append($('<td>')
                        .addClass("wizardoptional")
                        .append($('<img>')
                            .attr('id', 'optbtn_' + name)
                            .attr('src', 'editor/img/optional.gif')
                            .addClass("optional"))
                    );
                //output_string += '<tr id="opt_'+ name +'" class="wizardattribute">';
                //output_string += '<td class="wizardoptional"><img id="optbtn_'+ name +'" src="editor/img/optional.gif" class="optional" />&nbsp;</td>';
            }
            else
            {
                tr.attr('id', 'param_'+ name)
                    .addClass("wizardattribute")
                    .append($('<td>')
                        .addClass("wizardparameter"));
                //output_string += '<tr class="wizardattribute">';
                //output_string += '<td class="wizardparameter"></td>';
            }
            tr.append($('<td>')
                .addClass("wizardlabel")
                .append(label))
                .append($('<td>')
                    .addClass("wizardvalue")
                    .append(displayDataType(value, options, name, key)));
            //output_string += '<td class="wizardlabel">' + label + ' : </td>';
            //output_string += '<td class="wizardvalue">' + displayDataType(value, options, name, key) + '</td>';
            //output_string += '</tr>';
            $(id).append(tr);
            if (options.optional == 'true') {
                $("#optbtn_"+ name).on("click", function () {
                    var this_name = name;
                    removeOptionalProperty(this_name);
                });
            }
        }
    },


    removeOptionalProperty = function (name) {
    	if (!confirm('Are you sure?')) {
            return;
        }

        // Need to remove row from the screen
        var $row = $("#opt_" + name).remove();

        // Find the property in the data store
        var key = parent.tree.getSelectedNodeKeys();

        if (name in lo_data[key]["attributes"])
        {
            delete lo_data[key]["attributes"][name];
        };
        
        console.log(lo_data[key]["attributes"]);

        // Enable the optional parameter button
        $('#insert_opt_' + name)
            .switchClass('disabled', 'enabled')
            .attr('enabled', true);
    },

    insertOptionalProperty = function (key, name, defaultvalue)
    {

        // Place attribute
        lo_data[key]['attributes'][name] = defaultvalue;

        // Enable the optional parameter button
        $('#insert_opt_' + name)
            .switchClass('enabled', 'disabled')
            .attr('enabled', false);

        parent.tree.showNodeData(key);
    },

    convertTextAreas = function ()
    {
        $.each(textareas_options, function (i, options) {
            var ckoptions = {
                filebrowserBrowseUrl : 'editor/kcfinder/browse.php?opener=ckeditor&type=media',
                filebrowserImageBrowseUrl : 'editor/kcfinder/browse.php?opener=ckeditor&type=media',
                filebrowserFlashBrowseUrl : 'editor/kcfinder/browse.php?opener=ckeditor&type=media',
                filebrowserUploadUrl : 'editor/kcfinder/upload.php?opener=ckeditor&type=media',
                filebrowserImageUploadUrl : 'editor/kcfinder/upload.php?opener=ckeditor&type=media',
                filebrowserFlashUploadUrl : 'editor/kcfinder/upload.php?opener=ckeditor&type=media',
                //filebrowserBrowseUrl : 'editor/pdw_browser/index.php?editor=ckeditor&uploadpath='+mediavariable,
                //filebrowserImageBrowseUrl : 'editor/pdw_browser/index.php?editor=ckeditor&filter=image&uploadpath='+mediavariable,
                //filebrowserFlashBrowseUrl : 'editor/pdw_browser/index.php?editor=ckeditor&filter=flash&uploadpath='+mediavariable
            };

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
                        inputChanged(options.id, options.key, options.name, this.getData(), this);
                    }
                })
            }, ckoptions);
        });
    },


    // Clean up the text - must be a better way of doing this
    stripP = function (val) {
        var strippedValue = val.substr(3);
        strippedValue = strippedValue.substr(0, strippedValue.length-4);
        return strippedValue.trim();
    },


    convertTextInputs = function () {
        $.each(textinputs_options, function (i, options) {
            $('#'+options.id).ckeditor(function(){
                // Editor is ready, attach onblur event
                this.on('blur', function(){
                    // This is the call back when editor looses focus
                    if (this.checkDirty())
                    {
                        var thisValue = this.getData();
                        thisValue = thisValue.substr(0, thisValue.length-1); // Remove the extra linebreak

                        inputChanged(options.id, options.key, options.name, thisValue, this);
                    }
                });
                var lastValue = "";
                this.on('change', function(event) {
                    if (options.name == 'name') {
                        var thisValue = this.getData();
                        thisValue = stripP(thisValue.substr(0, thisValue.length-1));
                        if (lastValue != thisValue) {
                            lastValue = thisValue;

                            // Rename the node
                            var tree = $.jstree.reference("#treeview");
                            tree.rename_node(tree.get_node(options.key, false), thisValue);
                        }
                    }
                });
                // Fix for known issue in webkit browsers that cahnge contenteditable when an outer div is hidden
                this.on('focus', function () {
                    this.setReadOnly(false);
                });
            }, { toolbarGroups : [
                { name: 'basicstyles', groups: [ 'basicstyles' ] },
                { name: 'colors' }],
                filebrowserBrowseUrl : 'editor/kcfinder/browse.php?opener=ckeditor&type=media',
                filebrowserImageBrowseUrl : 'editor/kcfinder/browse.php?opener=ckeditor&type=media',
                filebrowserFlashBrowseUrl : 'editor/kcfinder/browse.php?opener=ckeditor&type=media',
                filebrowserUploadUrl : 'editor/kcfinder/upload.php?opener=ckeditor&type=media',
                filebrowserImageUploadUrl : 'editor/kcfinder/upload.php?opener=ckeditor&type=media',
                filebrowserFlashUploadUrl : 'editor/kcfinder/upload.php?opener=ckeditor&type=media',
                //filebrowserBrowseUrl : 'editor/pdw_browser/index.php?editor=ckeditor&uploadpath='+mediavariable,
                //filebrowserImageBrowseUrl : 'editor/pdw_browser/index.php?editor=ckeditor&filter=image&uploadpath='+mediavariable,
                //filebrowserFlashBrowseUrl : 'editor/pdw_browser/index.php?editor=ckeditor&filter=flash&uploadpath='+mediavariable
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
        console.log([key, name, value]);
        // Get the node name
        var node_name = lo_data[key]['attributes'].nodeName;

        var node_options = wizard_data[node_name].node_options;

        if (node_options['cdata'] && node_options['cdata_name'] == name)
        {
            lo_data[key]['data'] = value;
        }
        else
        {
            if (name in lo_data[key]['attributes'])
            {
                lo_data[key]['attributes'][name] = value;
            }
        }
    },


    cbChanged = function (id, key, name, value, obj)
    {
        //console.log(id + ': ' + key + ', ' +  name);
        //var value = $('#' + id).is(':checked');
        //if (value)
        //{
        //    value = 'true';
        //}
        //else
        //{
        //    value = 'false';
        //}
        setAttributeValue(key, name, value);
    },


    selectChanged = function (id, key, name, value, obj)
    {
        //console.log(id + ': ' + key + ', ' +  name);

        setAttributeValue(key, name, value);
    },


    inputChanged = function (id, key, name, value, obj)
    {
        console.log(id + ': ' + key + ', ' +  name  + ', ' +  value);
        var actvalue = value;

        if (id.indexOf('textinput') >= 0)
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
        setAttributeValue(key, name, actvalue);
    },


    displayDataType = function (value, options, name, key) {
        var html;                   //console.log(options);

        switch(options.type.toLowerCase())
        {
            case 'checkbox':
                var id = 'checkbox_' + form_id_offset;
                form_id_offset++;
                //html = '<input id="' + id + '" type="checkbox" ' + (value=='true'? 'checked' : '') + ' onchange="parent.toolbox.cbChanged(\'' + id + '\', \'' + key + '\', \'' + name + '\')" />';
                html = $('<input>')
                    .attr('id', id)
                    .attr('type',  "checkbox");
                if (value == 'true')
                    html.attr('checked', 'checked')
                        .click({id:id, key:key, name:name}, function(event){
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
                //html = '<select id="' + id + '" onchange="parent.toolbox.selectChanged(\'' + id + '\', \'' + key + '\', \'' + name + '\')" >';
                //for (var i=0; i<s_options.length; i++) {
                //    html += "<option value=\"" + s_data[i] + (s_data[i]==value ? "\" selected=\"selected\">" : "\">") + s_options[i] + "</option>";
                //}
                //html += '</select>';
                html = $('<select>')
                    .attr('id', id)
                    .click({id:id, key:key, name:name}, function(event)
                    {
                        selectChanged(event.data.id, event.data.key, event.data.name, this.value, this);
                    });
                for (var i=0; i<s_options.length; i++) {
                    var option = $('<option>')
                        .attr('value', s_data[i]);
                    if (s_data[i]==value)
                        option.attr('selected', 'selected');
                    option.append(s_options[i]);
                    html.append(option);
                }

                break;
            case 'text':
            case 'script':
            case 'html':
            case 'textarea':
                var id = "textarea_" + form_id_offset;
                form_id_offset++;
                //html = "<div style=\"width:100%\"><textarea id=\"" + id + "\" class=\"ckeditor\" style=\"";
                //if (options.height) html += "height:" + options.height + "px";
                //html += "\">" + value + "</textarea></div>";


                //Something weird is going on here If I build the textarea using jquery, then the ckeditor doesn't work anymore
                // So I use html to build the text area and append that to the div
                //var textarea = $('<textarea>')
                //    .attr('id', id)
                //    .addClass("ckeditor");
                //if (options.height)
                //    textarea.attr('style', "height:" + options.height + "px");
                //textarea.append(value);

                textarea = "<textarea id=\"" + id + "\" class=\"ckeditor\" style=\"";
                if (options.height) html += "height:" + options.height + "px";
                textarea += "\">" + value + "</textarea>";

                html = $('<div>')
                    .attr('style', 'width:100%')
                    .append(textarea);
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
                    //html = '<select id="' + id + '" onchange="parent.toolbox.selectChanged(\'' + id + '\', \'' + key + '\', \'' + name + '\')" >';
                    //for (var i=min; i<=max; i += step) {
                    //    html += "<option value=\"" + i + (intvalue==i ? "\" selected=\"selected\">" :  "\">") + i + "</option>";
                    //}
                    //html += "</select>";
                    html = $('<select>')
                        .attr('id', id)
                        .click({id:id, key:key, name:name}, function(event)
                        {
                            selectChanged(event.data.id, event.data.key, event.data.name, this.value, this);
                        });
                    for (var i=min; i<max; i += step) {
                        var option = $('<option>')
                            .attr('value', i);
                        if (intvalue==i)
                            option.attr('selected', 'selected');
                        option.append(i);
                        html.append(option);
                    }

                }
                else
                {
                    var id = 'numericstepper_' + form_id_offset;
                    form_id_offset++;
                    //html = '<input id="' + id + '" type="number" min="' + min + '" max="' + max + '" step="' + step + '" value="' + value + '" onchange="parent.toolbox.inputChanged(\'' + id + '\', \'' + key + '\', \'' + name + '\')" >';
                    html = $('<input>')
                        .attr('id', id)
                        .attr('type', 'number')
                        .attr('min', min)
                        .attr('max', max)
                        .attr('step', step)
                        .attr('value', value)
                        .click({id:id, key:key, name:name}, function(event)
                        {
                            inputChanged(event.data.id, event.data.key, event.data.name, this.value, this);
                        });
                }
                break;
            case 'pagelist':
                // Implement differently then in the flash editor
                // Leave PageIDs untouched, and prefer to use the PageID over the linkID
                var id = 'select_' + form_id_offset;
                form_id_offset++;
                //html = '<select id="' + id + '" onchange="parent.toolbox.selectChanged(\'' + id + '\', \'' + key + '\', \'' + name + '\')" >';
                html = $('<select>')
                    .attr('id', id)
                    .click({id:id, key:key, name:name}, function(event)
                    {
                        selectChanged(event.data.id, event.data.key, event.data.name, this.val(), this);
                    });
                // Add empty entry
                //html += "<option value=\"\"" + (value == "" ? " selected=\"selected\">" :  ">") + "&nbsp;</option>";
                var option = $('<option>')
                    .attr('value', "");
                if (value=="")
                    option.attr('selected', 'selected');
                option.append("&nbsp;");
                html.append(option);
                $.each(lo_data, function(i, data){
                    var name = getAttributeValue(data['attributes'], 'name', [], i);
                    var pageID = getAttributeValue(data['attributes'], 'pageID', [], i);
                    var linkID = getAttributeValue(data['attributes'], 'linkID', [], i);
                    if ((pageID.found && pageID.value != "") || (linkID.found && linkID.value != ""))
                    {
                        if (pageID.found)
                        {
                            //html += "<option value=\"" + pageID.value
                            //    + (value ==  pageID.value || value == linkID.value ? "\" selected=\"selected\">" :  "\">")
                            //    + name.value + "</option>";
                            option = $('<option>')
                                .attr('value', pageID.value);
                            if (value==pageID.value || value==linkID.value)
                                option.attr('selected', 'selected');
                            option.append(name.value);
                            html.append(option);
                        }
                        else
                        {
                            //html += "<option value=\"" + linkID.value
                            //    + (value == linkID.value ? "\" selected=\"selected\">" :  "\">")
                            //   + name.value + "</option>";
                            option = $('<option>')
                                .attr('value', linkID.value);
                            if (value==linkID.value)
                                option.attr('selected', 'selected');
                            option.append(name.value);
                            html.append(option);
                        }
                    }
                });
                //html += "</select>";
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

                    //html = '<input id='+ id + ' type="color" value="' + colorvalue + '" onblur="parent.toolbox.inputChanged(\'' + id + '\', \'' + key + '\', \'' + name + '\')">';
                    html = $('<input>')
                        .attr('id', id)
                        .attr('type', 'color')
                        .attr('value', colorvalue)
                        .change({id:id, key:key, name:name}, function(event)
                        {
                            inputChanged(event.data.id, event.data.key, event.data.name, this.value, this);
                        });
                }
                else
                {
                    //html = '<input id='+ id + ' class="color" value="' + colorvalue + '" onblur="parent.toolbox.inputChanged(\'' + id + '\', \'' + key + '\', \'' + name + '\',' + this +  ')">';
                    html = $('<input>')
                        .attr('id', id)
                        .addClass('color')
                        .attr('value', colorvalue)
                        .change({id:id, key:key, name:name}, function(event)
                        {
                            inputChanged(event.data.id, event.data.key, event.data.name, this.value, this);
                        });
                    colorpickers.push({id: id, value: colorvalue, options: options});
                }
                break;
            case 'languagelist':
                var id = 'select_' + form_id_offset;
                form_id_offset++;
                //html = '<select id="' + id + '" onchange="parent.toolbox.selectChanged(\'' + id + '\', \'' + key + '\', \'' + name + '\')" >';
                //for (var i=0; i<installed_languages.length; i++) {
                //    html += "<option value=\"" + installed_languages[i].code + (installed_languages[i].code==value ? "\" selected=\"selected\">" : "\">") + installed_languages[i].name + "</option>";
                //}
                //html += '</select>';
                html = $('<select>')
                    .attr('id', id)
                    .click({id:id, key:key, name:name}, function(event)
                    {
                        selectChanged(event.data.id, event.data.key, event.data.name, this.value, this);
                    });
                for (var i=0; i<installed_languages.length; i++) {
                    var option = $('<option>')
                        .attr('value', installed_languages[i].code);
                    if (installed_languages[i].code==value)
                        option.attr('selected', 'selected');
                    option.append(installed_languages[i].name);
                    html.append(option);
                }
                break;
            case 'hotspot':
                // this is a special one. the attributes in the node are called x, y, w, h
                var id = 'button_' + form_id_offset;
                form_id_offset++;
                //html = '<button id="' + id + '" onclick="hotspotEdit(\'' + id + '\', \'' + key + '\', \'' + name + '\')" >Edit ...</button>';
                html = $('<input>')
                    .attr('id', id)
                    .click({id:id, key:key, name:name}, function(event)
                    {
                        inputChanged(event.data.id, event.data.key, event.data.name, this.value, this);
                    })
                    .attr('title', language.edit.$tooltip)
                    .append(language.edit.$label);
                break;
            case 'drawing':
            case 'datefield':
            case 'datagrid':
            case 'webpage':
            case 'media':
            default:

                 //html = "<input type=\"text\" value=\"" + value + "\" />";
                var id = 'textinput_' + form_id_offset;
                form_id_offset++;
                //html = "<div id=\"" + id + "\" class=\"inputtext\" contenteditable=\"true\" ><p>" + value + "</p></div>";
                html = $('<div>')
                    .attr('id', id)
                    .addClass('inputtext')
                    .attr('contenteditable', 'true')
                    .append($('<p>')
                        .append(value));
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
    my.getIcon = getIcon;
    my.insertOptionalProperty = insertOptionalProperty;

    return parent;

})(jQuery, EDITOR || {});

