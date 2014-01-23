function lo_key_exists(key) {
	for (var lo_key in lo_data) if (lo_key == key) return true;
	return false;
}

function generate_lo_key() {
	var key;
	do {
		key = "ID_";
		for (var i=0; i<10; i++) key += String(parseInt(Math.random()*10));
	} while (lo_key_exists(key));
	return key;
}

// ** Recursive function to traverse the xml and build 
function build_lo_data(xmlData, parent_id) {

	// First lets generate a unique key
	var key = generate_lo_key();

	// Parse the attributes and store in the data store
	var attributes = [{ name: 'nodeName', value: xmlData[0].nodeName }];
	$(xmlData[0].attributes).each(function() {
		attributes.push({name: this.name, value: this.value});
	});
	lo_data[key] = attributes;

	// Build the JSON object for then treeview
	var this_json = {
		data: {
			title : (xmlData[0].attributes['name'] ? xmlData[0].attributes['name'].value : xmlData[0].nodeName),
			icon : 'img/page_types/' + xmlData[0].nodeName + '.png'
		},
		metadata: {
			id: key,
			parent_id: parent_id
		}
	};
	
	// if we are at top level then make sure it's open and display node data
	if (parent_id == null) {
		this_json.state = "open";
		//showNodeData(key);
	}
	
	if (xmlData.children()[0]) {
		this_json.children = [];
		
		xmlData.children().each(function(i) {
			this_json.children.push( build_lo_data($(this), key) );
		});
	}
	
	return this_json;
}

function showNodeData(key) {
	var attributes = lo_data[key];
	
	// Get the node name
	var node_name = '';var i=attributes.length;
	while(i--) { if (attributes[i].name == 'nodeName') node_name = attributes[i].value; }
	
	var node_options = wizard_data[node_name].node_options;

	$("#mainContent").html("");
	for (var i=0; i<attributes.length; i++) {
		if ($.inArray(attributes[i].name, ['nodeName', 'linkID', 'pageID']) < 0) {
			var attribute_name = attributes[i].name;
			var attribute_value = attributes[i].value;
			
			var options = node_options[attribute_name];
			var output_string = '<p>';
			if (options.optional == 'true') output_string += '<img src="img/optional.gif" />&nbsp;';
			output_string += '<strong>' + options.label + '</strong> : ';
			output_string += displayDataType(attribute_value, options);
			output_string += '</p>';
			$('#mainContent').append(output_string);
		}
	}
}

function displayDataType(value, options) {
	var html;					//console.log(options);
	switch(options.type)
	{
		case 'CheckBox':
			html = '<input type="checkbox" checked="' + (value=='true'?true:false) + '" />';
			break;
		case 'ComboBox':
			html = '<select>';
			for (var i=0; i<options.options.split(',').length; i++) {
				html += "<option value=\"" + options.options.split(',')[i] + "\">" + (options.data ? options.data.split(',')[i] : options.options.split(',')[i]) + "</option>";
			}
			html += '</select>';
			break;
		case 'TextArea':
			html = "<br /><textarea style=\"width:100%;";
			if (options.height) html += "height:" + options.height + "px";
			html += "\">" + value + "</textarea>";
			break;
		case 'NumericStepper':
			//html = "<select>";
			console.log({min: options.min, max: options.max, step: options.step});
			//for (var i=options.min; i<options.max; i += options.step) {
			//	html += "<option value=\"" + i + "\">" + i + "</option>";
			//}
			//html += "</select>";
			//break;
		default:
			 html = "<input type=\"text\" value=\"" + value + "\" />";
	}
	return html;
}