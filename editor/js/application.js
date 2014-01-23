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
				var menu_options = {};
				for (var i=0, a=$(this)[0].attributes; i<a.length; i++) {
					menu_options[a[i].name] = a[i].value;
				}
				
				var node_options = {};
				//if ($(this)[0].nodeName == 'bullets') {
				$($(this).children()).each(function() {
					//console.log($(this)[0].nodeName);
					var node_params = {};
					for (var i=0, a=$(this)[0].attributes; i<a.length; i++) {
						node_params[a[i].name] = a[i].value;
					}
					node_options[$(this)[0].nodeName] = node_params;
				});
				//}
				
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
			var indexAttr = [];	 // contains objects [startIndex, endIndex] of attributes
			var indexCData = []; // contains objects [startIndex, endIndex] of CDATA
			var start = true;
			var pos = text.indexOf('<![CDATA[');
			while(pos > -1) { // find all CDATA and ignore them when searching for attributes
				if (start == true) {
					var cData = new Object();
					cData.start = pos;
					indexCData.push(cData);
					start = false;
					pos = text.indexOf(']]>', pos+1);
				} else {
					indexCData[indexCData.length - 1].end = pos;
					start = true;
					pos = text.indexOf('<![CDATA[', pos+1);
				}
			}
			
			start = true;
			pos = text.indexOf('"');
			while(pos > -1) {
				var attribute = true;
				for (var i=0; i<indexCData.length; i++) {
					if (indexCData[i].start < pos && indexCData[i].end > pos) {
						attribute = false; // ignore as in CDATA
					}
				}
				if (attribute == true) {
					if (start == true) {
						start = false;
						var attr = new Object();
						attr.start = pos;
						indexAttr.push(attr);
					} else {
						start = true;
						indexAttr[indexAttr.length-1].end = pos;
					}
				}
				pos = text.indexOf('"', pos+1);
			}
			
			var newString = "";
			for (var i=0; i<indexAttr.length; i++) {
				if (i == 0) {
					newString += text.substring(0, indexAttr[i].start);
				} else {
					newString += text.substring(indexAttr[i - 1].end, indexAttr[i].start);
				}
				newString += text.substring(indexAttr[i].start, indexAttr[i].end).replace(/(\n|\r|\r\n)/g, "&#10;");
				if (i == indexAttr.length - 1) {
					newString += text.substring(indexAttr[i].end, text.length);
				}
			}
			
			var tree_json = build_lo_data($($.parseXML(newString)).find("learningObject"), null);

			var treeview = $('<div />').attr('id', 'treeview');
			$(".ui-layout-west .content").append(treeview);        			
			$("#treeview").jstree({ 
				"json_data" : {
					"data" : tree_json,
					"progressive_render" : true
				},
				"plugins" : [ "themes", "json_data", "ui" ]
			})
			.bind('select_node.jstree', function(event, data) {
				console.log(data.rslt.obj.data("id"));
				showNodeData(data.rslt.obj.data("id"));

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

