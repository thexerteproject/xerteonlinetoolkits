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
// *     Language    *
// *******************
var EDITOR = (function ($, parent) {

    var my = parent.language = {},
        toolbox = parent.toolbox,
        selected_language = {},
        fallback_language = {},

    parse_wizard_xml = function (wizard_xml) {

        var compare = function(a,b) {
            if (a.name < b.name)
                return -1;
            if (a.name > b.name)
                return 1;
            return 0;
        };

        // Build the page menu object
        var j, temp_menu_data = [], info = "",
            categories = String(wizard_xml[0].attributes.menus.value).split(',');

        for (j=0; j<categories.length; j++) {
            temp_menu_data.push(
                {
                    "name"      : categories[j],
                    "submenu"   : []
                }
            );
        }
        menu_data = {"menu": temp_menu_data};

        // Parse the xml
        $(wizard_xml.children()).each(function(i) {
            var main_node = $(this)[0].nodeName;
            //console.log("Main node: " + main_node);
            var menu_options = {};
            for (var j=0, a=$(this)[0].attributes; j<a.length; j++) {
                menu_options[a[j].name] = a[j].value;
            }

            // newnodes (+ defaults)
            var new_nodes = [];
            var new_nodes_defaults = []
            $($(this).children('newNodes').children()).each( function () {
                new_nodes.push(this.nodeName);
                new_nodes_defaults.push($(this)[0].firstChild.data);
            });

            // info
            info = "";
            if ($(this).children('info').length > 0)
            {
                info = $(this).children('info')[0].firstChild.data;
            }
            // collect and organize the options
            var node_options = {};
            var all_options = [];
            var name_option = [];
            var normal_options = [];
            var opt_options  = [];
            var lang_options = [];

            var attributes = {};
            for (var j=0, a=$(this)[0].attributes; j<a.length; j++) {
                if (a[j].name == 'menu') is_menu = true;
                //console.log("  attr: " + a[j].name + ":" + a[j].value);
                attributes[a[j].name] = a[j].value;
            }

            // If we have a menu item then lets store it for the menu
            if (attributes.menu != undefined) {
                var lookup = ((function (item) {
                    var i = menu_data.menu.length;
                    while (i--) if (menu_data.menu[i].name == item) return i;
                    return -1;
                })(attributes.menu));

                if (lookup > -1) {
                    var item = {
                        "item"  : main_node,
                        "name"  : attributes.menuItem,
                        "hint"  : attributes.hint,
                        "thumb" : attributes.thumb,
                        "icon"  : attributes.icon
                    }
                    if (attributes.deprecated)
                    {
                        item["deprecated"] = attributes.deprecated;
                    }
                    menu_data.menu[lookup].submenu.push(
                        item
                    );
                }
            }

            // Sort menuItems
            for (i in menu_data.menu)
            {
                menu_data.menu[i].submenu.sort(compare);
            }

            $($(this).children()).each(function() {
                //console.log("   sub node: " + $(this)[0].nodeName);
                var node_params = {};
                for (var j=0, a=$(this)[0].attributes; j<a.length; j++) {
                    //console.log("      attr: " + a[j].name + ":" + a[j].value);
                    node_params[a[j].name] = a[j].value;
                }
                all_options.push({name: $(this)[0].nodeName, value: node_params});
            });

            // search attribute name and put that as the first one
            $(all_options).each(function(key, option) {
                if (option.name == 'name')
                {
                    name_option.push(option);
                }
            });

            // if attr.type in text,html,drawing
            var cdataoption = {};
            if (attributes['type'] == 'text'
                || attributes['type'] == 'script'
                || attributes['type'] == 'html'
                || attributes['type'] == 'drawing'
                || attributes['type'] == 'hotspot'
                || attributes['type'] == 'custom')
            {
                node_options['cdata'] = true;
                node_options['cdata_name'] = $(this)[0].nodeName;
                cdataoption = {name: $(this)[0].nodeName, value: attributes};
                normal_options.push(cdataoption);
            }

            // do the rest of the options
            $(all_options).each(function(key, option) {
                if (option.value['optional'])
                {
                    opt_options.push(option);
                }
                else if (option.value['language'])
                {
                    lang_options.push(option);
                }
                else
                {
                    if (option.name != 'name')
                    {
                        normal_options.push(option);
                    }
                }
            });
            // Add cdata also to all_options
            if (node_options['cdata_name'])
            {
                all_options.push(cdataoption);
            }

            node_options['name'] = name_option;
            node_options['normal'] = normal_options;
            node_options['language'] = lang_options;
            node_options['optional'] = opt_options;
            node_options['all'] = all_options;

            wizard_data[main_node] = {menu_options : menu_options,  new_nodes: new_nodes, new_nodes_defaults: new_nodes_defaults, node_options : node_options, info : info};
        });
        //wizard_data.menus = String(wizard_xml[0].attributes["menus"].value).split(',');

    },


    process_language_file = function (xml) {
       console.log(languagecodevariable + " language file is loaded...");

        // Parse the file
        var x2js = new X2JS({
            // XML attributes. Default is "_"
            attributePrefix : "$"
        });
        selected_language = x2js.xml_str2json(xml).language;
        waittomerge();
    },

    process_language_fallback = function (xml) {
        console.log("en_GB fall-back language file is loaded...");
        // Parse the file
        var x2js = new X2JS({
            // XML attributes. Default is "_"
            attributePrefix : "$"
        });
        fallback_language = x2js.xml_str2json(xml).language;
        waittomerge();
    },

    merge_language_files = function () {
        // Merge the two language files
        if (languagecodevariable !=  'en-GB')
        {
            //merge into language_def
            language = $.extend(true, {}, fallback_language, selected_language);
        }
        else
        {
            // set language_def
            language = selected_language;
        }
        console.log("language files are merged:");
        console.log(language);

        waitonlanguage();
    },

    process_data_xwd = function (xml) {
        console.log("data.xwd is loaded...");

        var wizard_xml = $($.parseXML(xml)).find("wizard");

        parse_wizard_xml(wizard_xml);

        waitonlanguage();
    },

    process_config_file = function (xml) {
        console.log("config file is loaded...");

        // Used by the language selection box, ref. EDITOR.displayDataType (toolbox.js)
        installed_languages = [];
        // Parse the file
        var config_xml = $($.parseXML(xml)).find("languages");
        $(config_xml.children()).each(function(i) {
            var attributes = {};
            for (var j=0, a=$(this)[0].attributes; j<a.length; j++) {
                attributes[a[j].name] = a[j].value;
            }
            installed_languages.push( { code: attributes['code'], name: attributes['name'] });
        });

        waitonlanguage();
    },

    foreign_language_files = [
        {
            "u" : xwd_file_url,
            "c" : process_data_xwd,
            "merge" : false
        },
        {
            "u" : editorlanguagefile,
            "c" : process_language_file,
            "merge" : true
        },
        {
            "u" : "languages/wizard_en-GB.xml",
            "c" : process_language_fallback,
            "merge" : true
        },
        {
            "u" : "languages/language-config.xml",
            "c" : process_config_file,
            "merge" : false
        }
    ],

    en_language_files = [
        {
            "u" : xwd_file_url,
            "c" : process_data_xwd,
            "merge" : false
        },
        {
            "u" : editorlanguagefile,
            "c" : process_language_file,
            "merge" : true
        },
        {
            "u" : "languages/language-config.xml",
            "c" : process_config_file,
            "merge" : false
        }
    ],

    waittomerge = function (){
        var count = 0;
        var total = 0;
        $(language_files).each(function() {
            count += (this.loaded && this.merge) ? 1 : 0;
            total += (this.merge ? 1 : 0);
        });

        if (count == total) {
            merge_language_files();
        }
    }

    waitonlanguage = function () {
        var count = 0;
        $(language_files).each(function() {
            count += (this.loaded) ? 1 : 0;
        });

        if (count == language_files.length) {
            proceed();
        }
    },

    proceed = function () {
        parent.data.wait(1, {});
        parent.layout.setup();
        toolbox.create_insert_page_menu();
        $('#loader').hide();
    },

    init = function () {
        // Start loading of the xml files
        language_files = (languagecodevariable=='en-GB' ? en_language_files : foreign_language_files);
        $(language_files).each(function() {
            var _this = this;
            $.ajax({
                type: "GET",
                url: _this.u,
                dataType: "text",
                success: function (data) { //console.log("**** " + _this.u); console.log(data);
                    _this.loaded = true;
                    _this.c(data);
                }
            });
        });
    };

    init();
    return parent;

})(jQuery, EDITOR || {});