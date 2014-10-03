// *******************
// *     Toolbox    *
// *******************
var EDITOR = (function ($, parent) {

    var my = parent.toolbox = {},
        defaultToolBar = false,
        jqGridsLastSel = {},
        jqGridsColSel = {},
        jqGrGridData = {},

    // Build the "insert page" menu
    create_insert_page_menu = function () {
        var getMenuItem = function (itemData) {
            var data = {
                href: '#',
                html: itemData.name,
                item: itemData.item
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
        $("#insert-buttons").html("");
        buttons = $('<div />').attr('id', 'insert_buttons');
        $([
            {name: language.insertDialog.insertBefore.$label, icon:'editor/img/insert-before.png', tooltip: language.insertDialog.insertBefore.$tooltip,  id:'insert_button_before', btnvalue: "before", click:insert_page_before},
            {name: language.insertDialog.insertAfter.$label, icon:'editor/img/insert-after.png', tooltip: language.insertDialog.insertAfter.$tooltip,  id:'insert_button_after', btnvalue: "after", click:insert_page_after},
            {name: language.insertDialog.insertAtEnd.$label, icon:'editor/img/insert-end.png', tooltip: language.insertDialog.insertAtEnd.$tooltip,  id:'insert_button_at_end', btnvalue: "end", click:insert_page_end}
        ])
            .each(function(index, value) {
                var button = $('<button>')
                    .attr('id', value.id)
                    .attr('title', value.tooltip)
                    .attr('value', value.btnvalue)
                    .addClass("xerte_button")
                    .click(value.click)
                    .append($('<img>').attr('src', value.icon).height(14))
                    .append(value.name);
                buttons.append(button);
            });
        $("#insert-buttons").append(buttons);
        $("#insert-buttons").append($('<input>')
            .attr('id', 'selected-item')
            .attr('type', 'hidden'));

        $("#insert-menu").append(
            $menu.menu({
                select: function(event, ui) {
                    if (ui.item.children().attr('hint') != undefined) {
                        $("#insert-info .thumb").attr("src", "modules/xerte/parent_templates/Nottingham/" + ui.item.children().attr('thumb'));
                        $("#insert-info span").text(ui.item.children().attr('hint'));
                        $("#selected-item").val(ui.item.children().attr('item'));
                        $("#insert-buttons").show();
                    }
                }
            })
        );
    },

    insert_page_before = function(){
        parent.tree.addNode($('#selected-item').val(), 'before');
        $( "#insert-dialog").dialog("close");
    }

    insert_page_after = function(){
        parent.tree.addNode($('#selected-item').val(), 'after');
        $( "#insert-dialog").dialog("close");
    }

    insert_page_end = function(){
        parent.tree.addNode($('#selected-item').val(), 'end');
        $( "#insert-dialog").dialog("close");
    }


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
        // Expand FileLocation + to full path, except for attributes of type media
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
            if (attroptions.type != 'media')
            {
                attributes[key] = makeAbsolute(attributes[key]);
            }
        });
        lo_data[key] = {};
        lo_data[key]['attributes'] = attributes;
        if (xmlData[0].firstChild && xmlData[0].firstChild.nodeType == 4)  // cdata-section
        {
            lo_data[key]['data'] = makeAbsolute(xmlData[0].firstChild.data);
        }

        // Build the JSON object for the treeview
        // For version 3 jsTree
        var treeLabel = xmlData[0].nodeName;
        if (xmlData[0].attributes['name'])
        {
            treeLabel = xmlData[0].attributes['name'].value;
        }
        else
        {
            if (wizard_data[treeLabel].menu_options.menuItem)
                treeLabel = wizard_data[treeLabel].menu_options.menuItem;
        }
        var this_json = {
            id : key,
            text : treeLabel,
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
        var options = (nodelabel ? wizard_data[name].menu_options : getOptionValue(all_options, name));
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
                            .attr('src', 'editor/img/optional.png')
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
            .prop('disabled', false);
    },

    insertOptionalProperty = function (key, name, defaultvalue)
    {
        // Place attribute
        lo_data[key]['attributes'][name] = defaultvalue;

        // Enable the optional parameter button
        $('#insert_opt_' + name)
            .switchClass('enabled', 'disabled')
            .prop('disabled', true);

        parent.tree.showNodeData(key);
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
            id_in_postdata = grid_id+"_id",
            rowid,
            addMode,
            oldValueOfSortColumn;

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
            while ($("#"+new_id).length !== 0) {
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
        delete data[idname];
        var colnr = parseInt(postdata[idname]) - 1;
        jqGrGridData[key][colnr] = data;
        var xerte = convertjqGridData(jqGrGridData[key]);
        setAttributeValue(key, [name], [xerte]);

        // prepare postdata for tree grid
        if(grid_p.treeGrid === true) {
            if(addMode) {
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
                grid.jqGrid("addChildNode",postdata['col_0'],grid_p.selrow,postdata);
            } else {
                grid.jqGrid("setTreeRow",postdata['col_0'],postdata);
            }
        } else {
            if (addMode) {
                grid.jqGrid("addRowData",postdata['col_0'],postdata, options.addedrow);
            } else {
                grid.jqGrid("setRowData",postdata['col_0'],postdata);
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

        // !!! the most important step: skip ajax request to the server
        this.processing = true;
        return {};

    },

    addColumn = function(id, key, name, colnr)
    {
        console.log('Add column');
        // get the default value of the new column
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
        $.each(jqGrGridData[key], function(i, row){
            var col = row.length-1;
            row['col_' + col] = defvalue;
        });
        var data = convertjqGridData(jqGrGridData[key]);
        setAttributeValue(key, [name], [data]);
        parent.tree.showNodeData(key);
    },

    delColumn = function(id, key, name, colnr)
    {
        console.log('Del column ' + colnr);
        // Modify data, and rebuild Xerte structure
        $.each(jqGrGridData[key], function(i, row){
             delete row['col_' + (colnr-1)];
        });
        var data = convertjqGridData(jqGrGridData[key]);
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
            $.each(row, function(j, field){
                if (j !== 'col_0')
                    xerte += '|';
                xerte += field;
            });
        })
        return xerte;
    }

    jqGridAfterShowForm = function(id, ids)
    {
        //the field name that needs to be edited with CKEditor is 'col_1'
        if( CKEDITOR.instances.col_1 )
        {
            try {
                CKEDITOR.instances.col_1.destroy();
            } catch(e) {
                CKEDITOR.remove( 'col_1' );
            }
            //CKEDITOR.instances.col_1 = null;
        }
        var ckoptions = {
            toolbarGroups : [
                { name: 'basicstyles', groups: [ 'basicstyles' ] },
                { name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
                { name: 'colors' },
                { name: 'insert' }],
            filebrowserBrowseUrl : 'editor/elfinder/browse.php?mode=cke&type=media',
            filebrowserImageBrowseUrl : 'editor/elfinder/browse.php?mode=cke&type=image',
            filebrowserFlashBrowseUrl : 'editor/elfinder/browse.php?mode=cke&type=flash',
            //filebrowserBrowseUrl : 'editor/kcfinder/browse.php?opener=ckeditor&type=media',
            //filebrowserImageBrowseUrl : 'editor/kcfinder/browse.php?opener=ckeditor&type=media',
            //filebrowserFlashBrowseUrl : 'editor/kcfinder/browse.php?opener=ckeditor&type=media',
            //filebrowserUploadUrl : 'editor/kcfinder/upload.php?opener=ckeditor&type=media',
            //filebrowserImageUploadUrl : 'editor/kcfinder/upload.php?opener=ckeditor&type=media',
            //filebrowserFlashUploadUrl : 'editor/kcfinder/upload.php?opener=ckeditor&type=media',
            mathJaxClass :  'mathjax',
            mathJaxLib :    '//cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_HTMLorMML-full',
            toolbarStartupExpanded : true,
            height : 200,
            resize_enabled: false
        };

        $('#col_1').ckeditor(function(){
            // JQGrid
            // we need to get selected row in case currently we are in Edit Mode
            var grid = $('#' + id + '_jqgrid');
            var selID = grid.getGridParam('selrow'); // get selected row
            // I don't know how to get the current mode is, in Editing or Add new?
            // then let's find out if
            //navigational buttons are hidden for both of it and selID == null <– Add mode ^0^
            if( !($('a#pData').is(':hidden') || $('a#nData').is(':hidden') && selID==null))
            { // then it must be edit?
                var va = grid.getRowData(selID);
                CKEDITOR.instances.col_1.setData( va['col_1'] );
            }
        }, ckoptions);

    },

    jqGridBeforeSubmit = function(data)
    {
        data['col_1'] = CKEDITOR.instances.col_1.getData();
        return [true, ""];
    },

    jqGridAfterclickPgButtons = function(id, whichbutton, formid, rowid)
    {
        var grid = $('#' + id + '_jqgrid');
        var va = grid.getRowData(rowid);
        CKEDITOR.instances.col_1.setData( va['col_1'] );
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
                filebrowserBrowseUrl : 'editor/elfinder/browse.php?mode=cke&type=media',
                filebrowserImageBrowseUrl : 'editor/elfinder/browse.php?mode=cke&type=image',
                filebrowserFlashBrowseUrl : 'editor/elfinder/browse.php?mode=cke&type=flash',
                // filebrowserBrowseUrl : 'editor/kcfinder/browse.php?opener=ckeditor&type=media',
                // filebrowserImageBrowseUrl : 'editor/kcfinder/browse.php?opener=ckeditor&type=media',
                // filebrowserFlashBrowseUrl : 'editor/kcfinder/browse.php?opener=ckeditor&type=media',
                // filebrowserUploadUrl : 'editor/kcfinder/upload.php?opener=ckeditor&type=media',
                // filebrowserImageUploadUrl : 'editor/kcfinder/upload.php?opener=ckeditor&type=media',
                // filebrowserFlashUploadUrl : 'editor/kcfinder/upload.php?opener=ckeditor&type=media',
                mathJaxClass :  'mathjax',
                mathJaxLib :    '//cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_HTMLorMML-full',
                toolbarStartupExpanded : defaultToolBar,
                codemirror : codemirroroptions,
                extraAllowedContent: 'style'
                //filebrowserBrowseUrl : 'editor/pdw_browser/index.php?editor=ckeditor&uploadpath='+mediavariable,
                //filebrowserImageBrowseUrl : 'editor/pdw_browser/index.php?editor=ckeditor&filter=image&uploadpath='+mediavariable,
                //filebrowserFlashBrowseUrl : 'editor/pdw_browser/index.php?editor=ckeditor&filter=flash&uploadpath='+mediavariable
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
                $('#'+options.id).ckeditor(function(){
                    // Editor is ready, attach onblur event
                    this.on('blur', function(){
                        // This is the call back when editor looses focus
                        //if (this.checkDirty())  Tom: CHECKDIRTY DOES NOT DO WHAT I EXPECTED!! It compares with the original value,
                        //                             i.e., modify a field (add a 2) this istriggered
                        //                                   remove the 2, this is NOT TRIGGERRED
                        //                                   modify, add a 2, triggered
                        //                                   change focus, come back in this filed, do NOT edit (just leave the 2, and change focus again: TRIGGERED
                        //{
                            inputChanged(options.id, options.key, options.name, this.getData(), this);
                        //}
                    });
                }, ckoptions);
            }
            else
            {
                // Start a codemirror window (without WYSIWYG)
                codemirroroptions['mode'] = "javascript";
                var textArea = document.getElementById(options.id);
                var codemirror = CodeMirror.fromTextArea(textArea, codemirroroptions);
                codemirror.on("blur", function(){
                    inputChanged(options.id, options.key, options.name, codemirror.getValue(), codemirror);
                });
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
            $('#'+options.id).ckeditor(function(){
                // Editor is ready, attach onblur event
                this.on('blur', function(){
                    // This is the call back when editor looses focus
                    //if (this.checkDirty())  // Se other comment about checkDirty()
                    //{
                        var thisValue = this.getData();
                        thisValue = thisValue.substr(0, thisValue.length-1); // Remove the extra linebreak

                        inputChanged(options.id, options.key, options.name, thisValue, this);
                    //}
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

                            if ($('#mainleveltitle'))
                            {
                                $('#mainleveltitle').html(thisValue);
                            }

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
                filebrowserBrowseUrl : 'editor/elfinder/browse.php?mode=cke&type=media',
                filebrowserImageBrowseUrl : 'editor/elfinder/browse.php?mode=cke&type=image',
                filebrowserFlashBrowseUrl : 'editor/elfinder/browse.php?mode=cke&type=flash',
                //filebrowserBrowseUrl : 'editor/kcfinder/browse.php?opener=ckeditor&type=media',
                //filebrowserImageBrowseUrl : 'editor/kcfinder/browse.php?opener=ckeditor&type=media',
                //filebrowserFlashBrowseUrl : 'editor/kcfinder/browse.php?opener=ckeditor&type=media',
                //filebrowserUploadUrl : 'editor/kcfinder/upload.php?opener=ckeditor&type=media',
                //filebrowserImageUploadUrl : 'editor/kcfinder/upload.php?opener=ckeditor&type=media',
                //filebrowserFlashUploadUrl : 'editor/kcfinder/upload.php?opener=ckeditor&type=media',
                mathJaxClass :  'mathjax',
                mathJaxLib :    '//cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_HTMLorMML-full'
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

    convertDataGrids = function ()
    {
        // Set up a jqGrid for local editing. This is not that trivial, because jqGrid is all setup to
        // send the data back to the server automatically.
        // cf. the source of http://www.ok-soft-gmbh.com/jqGrid/LocalFormEditing.htm as an excelent example
        jqGridsLastSel = {};
        jqGridsColSel = {};
        $.each(datagrids, function(i, options){
            // Get the data for this grid

            var data = lo_data[options.key].attributes[options.name];
            var rows = [];

            $.each(data.split('||'), function(i, row){
                var records = row.split('|');
                var record = {};
                $.each(records, function(i, field)
                {
                    record['col_' + i] = field;
                });
                rows.push(record);
            });
            var gridoptions = options.options;
            var id = options.id;
            var key = options.key;
            jqGridsLastSel[key] = -1;
            jqGridsColSel[key] = -1;
            jqGrGridData[key] = rows;
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
            }
            if (!showHeaders)
            {
                for(var i=0; i<nrCols; i++)
                {
                    headers.push((i+1) + '');
                }
            }
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
            var colModel  = [];
            for (var i=0; i<nrCols; i++)
            {
                var col = {};
                if (i==0)
                {
                    col['key'] = true;
                }
                col['name'] = 'col_' + i;
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
                // Do something special for second column of glossary
                if (options.name == 'glossary' && i == 1)
                {
                    col['edittype'] = 'textarea';
                    col['editoptions'] = {rows:"5",cols:"40"};
                    col['editrules'] = {edithidden:true};
                }
                colModel.push(col);
            }

            var editSettings,
                addSettings,
                delSettings;
            if (options.name == 'glossary')
            {
                // other set of options for the glossary
                // to be able to replace the editor of the descrition with ckEditor
                editSettings = {
                    height:450,
                    width:500,
                    jqModal:false,
                    reloadAfterSubmit:false,
                    closeOnEscape:true,
                    savekey: [true,13],
                    closeAfterEdit:true,
                    onclickSubmit: function(options, postdata){
                        return onclickJqGridSubmitLocal(id, key, name, options, postdata);
                    },
                    afterclickPgButtons: function (whichbutton, formid, rowid)
                    {
                        jqGridAfterclickPgButtons(id, whichbutton, formid, rowid);
                    },
                    //beforeSubmit: function(data)
                    //{
                    //    return jqGridBeforeSubmit(data);
                    //},
                    afterShowForm: function(ids){
                        jqGridAfterShowForm(id, ids);
                    }
                };
                addSettings = {
                    height:450,
                    width:500,
                    jqModal:false,
                    reloadAfterSubmit:false,
                    savekey: [true,13],
                    closeOnEscape:true,
                    closeAfterAdd:true,
                    onclickSubmit:function(options, postdata){
                        return onclickJqGridSubmitLocal(id, key, name, options, postdata);
                    },
                    //beforeSubmit: function(data)
                    //{
                    //    return jqGridBeforeSubmit(data);
                    //},
                    afterShowForm: function(ids){
                        jqGridAfterShowForm(id, ids);
                    }
                }
            }
            else
            {
                editSettings = {
                    jqModal:false,
                    reloadAfterSubmit:false,
                    closeOnEscape:true,
                    savekey: [true,13],
                    closeAfterEdit:true,
                    onclickSubmit: function(options, postdata){
                        return onclickJqGridSubmitLocal(id, key, name, options, postdata);
                    }
                };
                addSettings = {
                    jqModal:false,
                    reloadAfterSubmit:false,
                    savekey: [true,13],
                    closeOnEscape:true,
                    closeAfterAdd:true,
                    onclickSubmit:function(options, postdata){
                       return onclickJqGridSubmitLocal(id, key, name, options, postdata);
                    }
                }
            }
            delSettings = {
                // because I use "local" data I don't want to send the changes to the server
                // so I use "processing:true" setting and delete the row manually in onclickSubmit
                onclickSubmit: function(options, rowid) {
                    var grid_id = $.jgrid.jqID(grid[0].id),
                        grid_p = grid[0].p,
                        newPage = grid[0].p.page;

                    // delete the row
                    grid.delRowData(rowid);
                    $.jgrid.hideModal("#delmod"+grid_id,
                        {gb:"#gbox_"+grid_id,jqm:options.jqModal,onClose:options.onClose});

                    if (grid_p.lastpage > 1) {// on the multipage grid reload the grid
                        if (grid_p.reccount === 0 && newPage === grid_p.lastpage) {
                            // if after deliting there are no rows on the current page
                            // which is the last page of the grid
                            newPage--; // go to the previous page
                        }
                        // reload grid to make the row from the next page visable.
                        grid.trigger("reloadGrid", [{page:newPage}]);
                    }

                    return true;
                },
                processing:true
            };

            // Setup the grid
            var grid = $('#' + id + '_jqgrid');
            grid.jqGrid({
                datatype: 'local',
                data: rows,
                height: "100%",
                colNames: headers,
                colModel: colModel,
                rowNum: 10,
                rowList: [5,10,15,20,30],
                viewrecords: true,
                pager: '#' + id + '_nav',
                editurl: 'editor/js/vendor/jqgrid/jqgrid_dummy.php',
                //cellsubmit : 'clientArray',
                //editurl: 'clientArray',
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
                    if (id && id !== jqGridsLastSel[key]) {
                        // cancel editing of the previous selected row if it was in editing state.
                        // jqGrid hold intern savedRow array inside of jqGrid object,
                        // so it is safe to call restoreRow method with any id parameter
                        // if jqGrid not in editing state
                        if (jqGridsLastSel[key] !== -1) {
                            grid.jqGrid('restoreRow',jqGridsLastSel[key]);
                        }
                        jqGridsLastSel[key] = id;
                    }
                },
                onCellSelect: function(iRow, iCol, content, event) {
                    console.log("Select cell: " + iRow + ", " + iCol);
                    jqGridsColSel[key] = iCol;
                    var delbutton = $('#' + id + '_delcol');
                    delbutton.html("");
                    delbutton.append($('<img>').attr('src', 'editor/img/delete.gif').height(14))
                        .append(language.btnDelColumn.$label + ' ' + iCol);
                    delbutton.switchClass('disabled', 'enabled');
                    delbutton.prop('disabled', false);
                }

            });
            grid.jqGrid('navGrid', '#' + id + '_nav', {refresh:false}, editSettings, addSettings, delSettings, {multipleSearch:true,overlay:false});
            if (addCols)
            {
                buttons = $('#' + id + '_addcolumns');
                $([
                    {name: language.btnAddColumn.$label, tooltip: language.btnAddColumn.$tooltip, icon:'editor/img/insert.png', disabled: false, id: id + '_addcol', click:addColumn},
                    {name: language.btnDelColumn.$label, tooltip: language.btnDelColumn.$tooltip, icon:'editor/img/delete.gif', disabled: true, id: id + '_delcol', click:delColumn}
                ])
                .each(function(index, value) {
                    var button = $('<button>')
                        .attr('id', value.id)
                        .attr('title', value.tooltip)
                        .addClass("xerte_button")
                        .prop('disabled', value.disabled)
                        .addClass(value.disabled ? 'disabled' : 'enabled')
                        .click({id:id, key:key, name:name}, function(evt){
                            var par = evt.data;
                            value.click(par.id, par.key, par.name, jqGridsColSel[key]);
                        })
                        .append($('<img>').attr('src', value.icon).height(14))
                        .append(value.name);
                    buttons.append(button);
                });
                buttons.append($('<br>'));
            }
        });
    },

    //convertLightboxes = function ()
    //{
    //    $.each(lightboxes, function(i, options){
    //       $('#link_' + options.id).colorbox({inline:true, href:'#edit_' + options.id});
    //    });
    //},

    setAttributeValue = function (key, names, values)
    {
        console.log([key, names, values]);
        // Get the node name

        var node_name = lo_data[key]['attributes'].nodeName;

        var node_options = wizard_data[node_name].node_options;

        $.each(names, function(i, name){
            console.log("Setting sub attribute " + key + ", " + name + ": " + values[i]);
            if (node_options['cdata'] && node_options['cdata_name'] == name)
            {
                lo_data[key]['data'] = values[i];
            }
            else
            {
                if (name in lo_data[key]['attributes'])
                {
                    lo_data[key]['attributes'][name] = values[i];
                }
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


    selectChanged = function (id, key, name, value, obj)
    {
        //console.log(id + ': ' + key + ', ' +  name);

        setAttributeValue(key, [name], [value]);
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

    hotspotChanged = function(id, key, name, img, selection)
    {
        console.log("Hotspot edited: " + name + ", (" + selection.x1 + ", " + selection.y1 + "), (" + selection.x2 + ", " + selection.y2 + ")");
        var x = selection.x1,
            y = selection.y1,
            w = selection.width,
            h = selection.height;
        $('#' + id + '_x').val(x);
        $('#' + id + '_y').val(y);
        $('#' + id + '_w').val(w);
        $('#' + id + '_h').val(h);
        $('#' + id + '_set').val(1);
    },

    showHotSpotSelection = function(initialised, id, key, name, orgwidth, orgheight, hsx1, hsy1, hsx2, hsy2)
    {
        if (initialised)
        {
            // All the items exist
            $('#featherlight-content img').imgAreaSelect({
                x1: hsx1, y1: hsy1, x2: hsx2, y2: hsy2,
                handles: true,
                imageWidth: orgwidth,
                imageHeight: orgheight,

                parent: '#featherlight-content',
                persistent: true,
                onSelectEnd: function (img, selection) {
                    hotspotChanged(id, key, name, img, selection);
                }
            });

            // Only now are we able to bind call-backs to the correct buttons.
            $('#featherlight-content').unbind('click');
            var okbutton = $('#featherlight-content button[name="ok"]');
            okbutton.click({id:id, key:key, name:name}, function(event){
                var par = event.data;
                okHotSpotSelection(par.id, par.key, par.name);
            });

            var cancelbutton = $('#featherlight-content button[name="cancel"]');
            cancelbutton.click({id:id, key:key, name:name}, function(event){
                var par = event.data;
                cancelHotSpotSelection(par.id, par.key, par.name);
            });

        }
        else
        {
            setTimeout(function(){
                showHotSpotSelection(true, id, key, name, orgwidth, orgheight, hsx1, hsy1, hsx2, hsy2);
            }, 100);
        }
    },

    okHotSpotSelection = function(id, key, name)
    {
        var current = $.featherlight.current()
        var set = $('#' + id + '_set').val();
        if (set == 1)
        {
            var x = $('#' + id + '_x').val(),
                y = $('#' + id + '_y').val(),
                w = $('#' + id + '_w').val(),
                h = $('#' + id + '_h').val();

            setAttributeValue(key, ["x", "y", "w", "h"], [x, y, w, h]);
        }
        current.close();
        parent.tree.showNodeData(key);
    },

    cancelHotSpotSelection = function(id, key, name)
    {
        var current = $.featherlight.current()
        current.close();
        parent.tree.showNodeData(key);
    },

    closeHotSpotSelection = function(evt, key)
    {
        parent.tree.showNodeData(key);
    },

    browseFile = function (id, key, name, value, obj)
    {
        console.log('Browse file: ' + id + ': ' + key + ', ' +  name  + ', ' +  value);


        window.elFinder = {};
        window.elFinder.callBack = function(file) {
            // Actions with url parameter here
            var url = file.url;
            console.log('Browse file: url=' + url);
            pos = url.indexOf(rlourlvariable);
            if (pos >=0)
                url = "FileLocation + '" + url.substr(rlourlvariable.length) + "'";
            var newvalue = '<p>' + url + '</p>';
            $('#' + id).html(newvalue);
            setAttributeValue(key, [name], [url]);
            window.elFinder = null;
        };
        window.open('editor/elfinder/browse.php?type=media&lang=' + languagecodevariable.substr(0,2), 'Browse file', "height=600, width=800");

        /*
        window.KCFinder = {};
        window.KCFinder.callBack = function(url) {
            // Actions with url parameter here
            console.log('Browse file: url=' + url);
            // Check thumbs first!
            var pos = url.indexOf(rlourlvariable + ".thumbs/");
            if (pos >=0)
                url = "FileLocation + '" + url.substr(rlourlvariable.length) + "'";
            pos = url.indexOf(rlourlvariable);
            if (pos >=0)
                url = "FileLocation + '" + url.substr(rlourlvariable.length) + "'";
            var newvalue = '<p>' + url + '</p>';
            $('#' + id).html(newvalue);
            setAttributeValue(key, [name], [url]);
            window.KCFinder = null;
        };
        window.open('editor/kcfinder/browse.php?type=media', 'Browse file', "height=600, width=800");
        */
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
            .attr('value', rlopathvariable);

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
                    .attr('type',  "checkbox")
                    .click({id:id, key:key, name:name}, function(event){
                        cbChanged(event.data.id, event.data.key, event.data.name, this.checked, this);
                    });
                if (value || value == 'true')
                    html.prop('checked', true);
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
                        option.prop('selected', true);
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
                            option.prop('selected', true);
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
                        .change({id:id, key:key, name:name}, function(event)
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
                        selectChanged(event.data.id, event.data.key, event.data.name, this.value, this);
                    });
                // Add empty entry
                //html += "<option value=\"\"" + (value == "" ? " selected=\"selected\">" :  ">") + "&nbsp;</option>";
                var option = $('<option>')
                    .attr('value', "");
                if (value=="")
                    option.prop('selected', true);
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
                                option.prop('selected', true);
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
                                option.prop('selected', true);
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
                        option.prop('selected', true);
                    option.append(installed_languages[i].name);
                    html.append(option);
                }
                break;
            case 'hotspot':
                var id = 'hotspot_' + form_id_offset;
                form_id_offset++;

                // this is a special one. the attributes in the node are called x, y, w, h
                // Furthermore, the hotspot image, and the hotspot color are in the parent (or if the parent is a hotspotGroup, in the parents parent
                // So, get the image, the highlight colour, and the coordinates here, and make a lightbox of a small image that is clickable
                var hsattrs = lo_data[key].attributes;
                var hsparent = parent.tree.getParent(key);
                var hspattrs = lo_data[hsparent].attributes;
                var div = $('<div>')
                    .attr('id', 'inner_' + id)
                    .addClass('clickableHotspot')
                if (hspattrs.nodeName.toLowerCase() == "hotspotgroup")
                {
                    // go one further up
                    hsparent = parent.tree.getParent(hsparent);
                    hspattrs = lo_data[hsparent].attributes;
                }
                var url = hspattrs.url;
                // Replace FileLocation + ' with full url
                url = makeAbsolute(url);
                // Create a div with the image in there (if there is an image) and overlayed on the image is the hotspot box
                if (hspattrs.url != "")
                {
                    div.append($('<img>')
                        .attr('id', 'inner_img_' + id)
                        .attr('src', url)
                        .load(function(){
                            var orgwidth = this.naturalWidth;
                            var orgheight = this.naturalHeight;
                            var width = this.width;
                            var hsleft = parseInt(hsattrs.x),
                                hstop = parseInt(hsattrs.y),
                                hsbottom = orgheight - hstop - parseInt(hsattrs.h),
                                hsright = orgwidth - hsleft - parseInt(hsattrs.w);
                            var scale = width / orgwidth;
                            hsleft = Math.round(hsleft * scale);
                            hstop = Math.round(hstop * scale);
                            hsbottom = Math.round(hsbottom * scale);
                            hsright = Math.round(hsright * scale);

                            var cssobj = {
                                position:  "absolute",
                                left: hsleft + "px",
                                top:  hstop + "px",
                                right: hsright + "px",
                                bottom: hsbottom + "px",
                                background: "#ff0000",
                                opacity: "0.4"
                                 };

                            var hsdiv = $('<div>')
                                .attr('id', 'inner_hs_' + id)
                                .css(cssobj);
                            div.append(hsdiv);

                        })
                    );
                }
                else
                {
                    div = div.append("select image first");
                }

                // Ok, now create the content to be shown in the lightbox
                var editdiv = $('<div>')
                    .attr('id', 'edit_' + id)
                    .addClass('hotspotLightbox');
                var editimg = $('<img>')
                    .attr('id', 'edit_img_' + id)
                    .addClass('hotspotLightboxImg')
                    .attr('src', url)
                    .load(function()
                    {
                        var orgwidth = this.naturalWidth;
                        var orgheight = this.naturalHeight;
                        var hsx1 = parseInt(hsattrs.x),
                            hsy1 = parseInt(hsattrs.y),
                            hsx2 = hsx1 + parseInt(hsattrs.w),
                            hsy2 = hsy1 + parseInt(hsattrs.h);

                        /*
                        $('#edit_img_' + id).imgAreaSelect({
                            x1: hsx1, y1: hsy1, x2: hsx2, y2: hsy2,
                            handles: false,
                            imgeWidth: orgwidth,
                            imageHeight: orgheight,
                            parent: '#edit_' + id,
                            persistent: true,
                            onSelectEnd: function (img, selection) {
                                hotspotChanged(id, key, name, img, selection);
                            }
                        });

                        //$('#featherlight-content').unbind('click');
                        */


                        $('#link_' + id).featherlight({afterClose: function(evt){closeHotSpotSelection(evt, key);}});
                        $('#link_' + id).click({id:id, key:key, name:name, orgwidth:orgwidth, orgheight:orgheight, hsx1:hsx1, hsy1:hsy1, hsx2:hsx2, hsy2:hsy2}, function(event){
                            var par = event.data;
                            showHotSpotSelection(false, par.id, par.key, par.name, par.orgwidth, par.orgheight, par.hsx1, par.hsy1, par.hsx2, par.hsy2);
                        });

                    });
                editdiv.append(editimg);

                editdiv.append($('<div>')
                    .attr('id', id + '_edit_buttons')
                    .append($('<input>')
                        .attr('id', id + '_x')
                        .attr('type', 'hidden')
                    )
                    .append($('<input>')
                        .attr('id', id + '_y')
                        .attr('type', 'hidden')
                    )
                    .append($('<input>')
                        .attr('id', id + '_h')
                        .attr('type', 'hidden')
                    )
                    .append($('<input>')
                        .attr('id', id + '_w')
                        .attr('type', 'hidden')
                    )
                    .append($('<input>')
                        .attr('id', id + '_set')
                        .attr('type', 'hidden')
                        .attr('value', '0')
                    )
                    //.append(okbutton)
                    //.append(cancelbutton)
                    .append($('<button>')
                        .attr('id', id + '_ok')
                        .attr('name', 'ok')
                        .attr('type', 'button')
                        .addClass('editorbutton')
                        .append(language.Alert.oklabel)
                    )
                    .append($('<button>')
                        .attr('id', id + '_cancel')
                        .attr('name', 'cancel')
                        .attr('type', 'button')
                        .addClass('editorbutton')
                        .append(language.Alert.cancellabel)
                    )
                );

                //html = '<button id="' + id + '" onclick="hotspotEdit(\'' + id + '\', \'' + key + '\', \'' + name + '\')" >Edit ...</button>';
                html = $('<div>')
                    .attr('id', id)
                    //.attr('href', '#')
                    //.click({id:id, key:key, name:name}, function(event)
                    //{
                    //    hotspotEdit(event.data.id, event.data.key, event.data.name, this.value, this);
                    //})
                    .append(editdiv)
                    .append($('<a>')
                        .attr('id', 'link_' + id)
                        .attr('href', '#')
                        .attr('data-featherlight', '#edit_' + id)
                        .attr('title', language.edit.$tooltip)
                        .append(div))

                break;
            case 'media':
                var id = 'media_' + form_id_offset;
                form_id_offset++;
                // a textinput with a browse buttons next to the type-in
                var td1 = $('<td width="100%">')
                    .append($('<div>')
                    .attr('id', id)
                    .addClass('inputtext')
                    .attr('contenteditable', 'true')
                    .append($('<p>')
                        .append(value)));
                var td2 = $('<td>')
                    .append($('<button>')
                    .attr('id', 'browse_' + id)
                    .attr('title', language.compMedia.$tooltip)
                    .addClass("xerte_button")
                    .click({id:id, key:key, name:name}, function(event)
                    {
                        browseFile(event.data.id, event.data.key, event.data.name, this.value, this);
                    })
                    .append($('<img>').attr('src', 'editor/img/browse.png').height(14)));
                html = $('<div>')
                    .attr('id', 'container_' + id)
                    .addClass('media_container');
                html.append($('<table width="100%">')
                        .append($('<tr>')
                            .append(td1)
                            .append(td2)));
                textinputs_options.push({id: id, key: key, name: name, options: options});
                break;
            case 'datagrid':
                var id = 'grid_' + form_id_offset;
                form_id_offset++;
                html= $('<div>')
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
            case 'drawing': // Not implemented
                var id = 'drawing_' + form_id_offset;
                form_id_offset++;
                //html = '<button id="' + id + '" onclick="hotspotEdit(\'' + id + '\', \'' + key + '\', \'' + name + '\')" >Edit ...</button>';
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
            case 'datefield': // Not used??
            case 'webpage':  //Not used??
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
    my.convertDataGrids = convertDataGrids;
    my.showToolBar = showToolBar;
    my.getIcon = getIcon;
    my.insertOptionalProperty = insertOptionalProperty;

    return parent;

})(jQuery, EDITOR || {});

