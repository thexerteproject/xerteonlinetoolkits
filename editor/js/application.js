var wizard_data = {};
var lo_data = {};
var menu_data = [];


// *******************
// *     Language    *
// *******************
var EDITOR = (function ($, parent) {

    var my = parent.language = {},
        toolbox = parent.toolbox,

    parse_wizard_xml = function (wizard_xml) {
        // Build the page menu object
        var j, temp_menu_data = [],
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

            var node_options = {};
            var all_options = [];
            var name_option = [];
            var normal_options = [];
            var opt_options  = [];
            var adv_options  = [];
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
                    menu_data.menu[lookup].submenu.push(
                        {
                            "name"  : attributes.menuItem,
                            "hint"  : attributes.hint,
                            "thumb" : attributes.thumb,
                            "icon"  : attributes.icon
                        }
                    );
                }
            }

            $($(this).children()).each(function() {
                //console.log("   sub node: " + $(this)[0].nodeName);
                var node_params = {};
                for (var j=0, a=$(this)[0].attributes; j<a.length; j++) {
                    //console.log("      attr: " + a[j].name + ":" + a[j].value);
                    node_params[a[j].name] = a[j].value;
                }
                all_options.push({name: [$(this)[0].nodeName], value: node_params});
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
                else if (option.value['advanced'])
                {
                    adv_options.push(option);
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
            node_options['advanced'] = adv_options;
            node_options['language'] = lang_options;
            node_options['optional'] = opt_options;
            node_options['all'] = all_options;

            wizard_data[main_node] = {'menu_options' : menu_options, 'node_options' : node_options};
        });
        //wizard_data.menus = String(wizard_xml[0].attributes["menus"].value).split(',');

        toolbox.create_insert_page_menu();
    },


    process_language_file = function (xml) {
        console.log("language file is loaded...");

        // Parse the file

        wait();
    },

    process_data_xwd = function (xml) {
        console.log("data.xwd is loaded...");

        var wizard_xml = $($.parseXML(xml)).find("wizard");

        parse_wizard_xml(wizard_xml);

        wait();
    },

    process_config_file = function (xml) {
        console.log("config file is loaded...");

        // Parse the file

        wait();
    },

    language_files = [
        {
            "u" : "languages/wizard_" + languagecodevariable + ".xml",
            "c" : process_language_file
        },
        {
            "u" : originalpathvariable + "wizards/" + languagecodevariable + "/data.xwd",
            "c" : process_data_xwd
        },
        {
            "u" : "languages/language-config.xml",
            "c" : process_config_file
        }
    ],

    wait = function () {
        var count = 0;
        $(language_files).each(function() {
            count += (this.loaded) ? 1 : 0;
        });

        if (count == language_files.length) {
            proceed();
        }
    },

    proceed = function () {
        parent.tree.do_buttons();
    },

    init = function () {
        // Start loading of the xml files
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
