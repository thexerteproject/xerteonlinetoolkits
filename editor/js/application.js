var wizard_data = {};
var lo_data = {};

jQuery(document).ready(function($) {
	
	var init = function() {

		//top buttons
		(function() {
			var insert_page = function() {
				alert("insert a page");
			},
			
			delete_page = function() {
				alert("delete a page");
			},
			
			duplicate_page = function() {
				alert("duplicate a page");
			},
			
			buttons = $('<div />').attr('id', 'top_buttons');
			$([
				{name:'Insert', icon:'img/insert.png', id:'insert_button', click:insert_page},
				{name:'Copy', icon:'http://cdn1.iconfinder.com/data/icons/uidesignicons/copy.png', id:'copy_button', click:duplicate_page},
				{name:'Delete', icon:'http://projects.dfid.gov.uk/images/ppi_structure/red_cross.gif', id:'delete_button', click:delete_page}
			])
			.each(function(index, value) {
				var button = $('<button>')
					.attr('id', value.id)
					.click(value.click)
					.append($('<img>').attr('src', value.icon).height(14))
					.append(value.name);
				buttons.append(button);
			});
			$('.ui-layout-west .header').append(buttons);
		})();

(function(){
	// load and parse the wizard xml
	$.ajax({
		type: "GET",
		url: "./data.xwd",
		dataType: "text",
		success: function(xml) {
		
			var wizard_xml = $($.parseXML(xml)).find("wizard"); 		
			
			// No longer needed
			/*$(wizard.find("learningObject").children()).each(function() {
				var $this = $(this);
				if ($this[0].nodeName != "newNodes") {
					var attributes = {};
					for (var i=0, a=$this[0].attributes; i<a.length; i++) {
						attributes[a[i].name] = a[i].value;
					}
					lo_options[$this[0].nodeName] = attributes;
				}
			});
			*/

			// Ok we've only taken the attributes but there are still child nodes
			// that we need 
			$(wizard_xml.children()).each(function(i) {
                console.log("Main node: " + $(this)[0].nodeName);
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
				//if ($(this)[0].nodeName == 'bullets') {

                var attributes = {};
                for (var j=0, a=$(this)[0].attributes; j<a.length; j++) {
                    console.log("  attr: " + a[j].name + ":" + a[j].value);
                    attributes[a[j].name] = a[j].value;
                }


				$($(this).children()).each(function() {
					console.log("   sub node: " + $(this)[0].nodeName);
					var node_params = {};
					for (var j=0, a=$(this)[0].attributes; j<a.length; j++) {
                        console.log("      attr: " + a[j].name + ":" + a[j].value);
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

				wizard_data[$(this)[0].nodeName] = {'menu_options' : menu_options, 'node_options' : node_options};
			});
			wizard_data.menus = String(wizard_xml[0].attributes["menus"].value).split(',');

		}

	});
})();




(function(){
	// get xml data and sorts it
	$.ajax({
		type: "GET",
		url: "./data.xml",
		dataType: "text",
		success: function(text) {
			// replace all line breaks in attributes with ascii code - otherwise these are replaced with spaces when parsed to xml
            var newString = FixLineBreaks(text);

			var tree_json = build_lo_data($($.parseXML(newString)).find("learningObject"), null);
            console.log(tree_json);
			var treeview = $('<div />').attr('id', 'treeview');
			$(".ui-layout-west .content").append(treeview);        			
			$("#treeview").jstree({
				"core" : {
					"data" : tree_json
				}
			})
			.bind('select_node.jstree', function(event, data) {
				console.log(event);
                console.log(data);

				showNodeData(data.node.id);

			});
			
			$("#treeview").jstree("select_node", "#treeroot");
		}
	});
})(); 



		//bottom buttons
		(function() {
			var up = function() {
				alert("move node up");
			},
			
			down = function() {
				alert("move node down");
			},
			
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
		})();

	};
	
	init();

});

