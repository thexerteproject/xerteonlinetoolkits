/********************************************************************
 *	Define Editor - these blocks can thus be split between files
 ********************************************************************/
var EDITOR = (function ($, _this) {

	// *** PUBLIC ***
    //_this.PROPERTY = some_value;
    //_this.METHOD = function () { };
    _this.wizard_data = {};
	_this.lo_data = {};
	_this.menu_data = [];

    // *** PRIVATE ***
    //var PROPERTY = some_value;
    //var METHOD = function () { };
    
    _this.start = function () {
    	// Start asynchronous loading of the data files
    	_this.DATAXML.begin("./data.xml");
    	_this.DATAXWD.begin("./data.xwd");
    };
    
    _this.continue = function () { // This will be called once each asynchronous task completes
    	if ( _this.wizard_data == {} && _this.lo_data == {} ) return; // Both files not loaded
    	
    	console.log("Both files loaded and parsed");
    };

    return _this;

}(jQuery, {}));




/*********************************
 *   Code to deal with data.xml
 *********************************/
EDITOR = (function ($, _parent) {

    var _this = _parent.DATAXML = _parent.DATAXML || {};
    
	// *** PUBLIC ***
    //_this.PROPERTY = some_value;
    //_this.METHOD = function () { };

    // *** PRIVATE ***
    //var PROPERTY = some_value;
    //var METHOD = function () { };

	// ** Recursive function to traverse the xml and build 
	var build_lo_data = function (xmlData, parent_node_id) {

		// First lets generate a unique key
		var key = (parent_node_id == null) ? 'treeroot' : (function () {
			var key,
				lo_data = _parent.lo_data,
				lo_key_exists = function (key) {
					for (var lo_key in lo_data) if (lo_key == key) return true;
					return false;
				};

			do {
				key = 'ID_' + Math.random().toString().slice(2,11); console.log(key); // Quicker and 9 digits is plenty
			} while (lo_key_exists(key));

			return key;
		})();

		// Parse the attributes and store in the data store
		var attributes = [{ name: 'nodeName', value: xmlData[0].nodeName }];
		$(xmlData[0].attributes).each(function() {
			attributes.push({name: this.name, value: this.value});
		});
		_parent.lo_data[key] = {};
		_parent.lo_data[key]['attributes'] = attributes;
		if (xmlData[0].firstChild && xmlData[0].firstChild.nodeType == 4)  // cdata-section
		{
			_parent.lo_data[key]['data'] = xmlData[0].firstChild.data;
		}

		// Build the JSON object for the treeview
		// For version 3 jsTree
		 var this_json = {
			 id : key,
			 text : (xmlData[0].attributes['name'] ? xmlData[0].attributes['name'].value : xmlData[0].nodeName),
			 icon : 'img/page_types/' + xmlData[0].nodeName + '.png'
		 }

		 // if we are at top level then make sure it's open and display node data
		 if (parent_node_id == null) {
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

	// replace all line breaks in attributes with ascii code - otherwise these are replaced with spaces when parsed to xml
	fix_line_breaks = function (text) {
		var 	split_up = text.split(/<\!\[CDATA\[|\]\]>/),
			temp, i, j, len, len2;

		for (i=0, len=split_up.length; i<len; i+=2) {
			temp = split_up[i].split('"');
			for (j=1, len2=temp.length; j<len2; j+=2) {
				temp[j] = temp[j].replace(/(\n|\r|\r\n)/g, "&#10;");
			}
			split_up[i] = temp.join('"');
		}

		// Put the CDATA blocks back...
		temp = [];
		for (i=0, len=split_up.length-1; i<len; i+=2) {
			temp.push(split_up[i] + "<![CDATA[" + split_up[i+1]);
		}
		temp.push(split_up[i]);

		return temp.join("]]>");
	},
	
	// Called when the XML loads
    process_xml = function (text) {
		// replace all line breaks in attributes with ascii code - otherwise these are replaced with spaces when parsed to xml
		var newString = fix_line_breaks(text);
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

			//showNodeData(data.node.id);

		});

		$("#treeview").jstree("select_node", "#treeroot");
		_parent.continue();
    };
    
    // Initialiser
    _this.begin = function (path) {
			$.ajax({
				type: "GET",
				url: path,
				dataType: "text",
				success: process_xml
			});
    };

    return _parent;

}(jQuery, EDITOR || {}));





/*********************************
 *   Code to deal with xwd file
 *********************************/
EDITOR = (function ($, _parent) {

    var _this = _parent.DATAXWD = _parent.DATAXWD || {};

    // *** Public ***
    //_this.PROPERTY = some_value;
    //_this.METHOD = function () { };  
  
    // *** Private ***
    //var PROPERTY = some_value;
    //var METHOD = function () { };
    var process_xml = function (data) {
		var wizard_xml = $($.parseXML(data)).find("wizard");

		// Build the page menu object
		var	j, temp_menu_data = [],
			categories = String(wizard_xml[0].attributes.menus.value).split(',');

		for (j=0; j<categories.length; j++) {
			temp_menu_data.push(
				{
					"name"		: categories[j],
					"submenu"	: []
				}
			);
		}
		_parent.menu_data = {"menu": temp_menu_data};

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
				console.log("  attr: " + a[j].name + ":" + a[j].value);
				attributes[a[j].name] = a[j].value;
			}
	
			// If we have a menu item then lets store it for the menu
			if (attributes.menu != undefined) {
				var lookup = ((function (item) {
					var i = _parent.menu_data.menu.length;
					while (i--) if (_parent.menu_data.menu[i].name == item) return i;
					return -1;
				})(attributes.menu));
		
				if (lookup > -1) {
					_parent.menu_data.menu[lookup].submenu.push(
						{
							"name"	: attributes.menuItem,
							"hint"	: attributes.hint,
							"thumb"	: attributes.thumb,
							"icon"	: attributes.icon
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

			_parent.wizard_data[main_node] = {'menu_options' : menu_options, 'node_options' : node_options};
		});

		_parent.continue();
    };
    
    // Initialiser
    _this.begin = function (path) {
		$.ajax({
			type: "GET",
			url: path,
			dataType: "text",
			success: process_xml
		});
    };

    return _parent;

}(jQuery, EDITOR || {}));



// Start the EDITOR !
EDITOR.start();

