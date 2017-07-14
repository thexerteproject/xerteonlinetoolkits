/**
 * Copyright (c) 2014, CKSource - Frederico Knabben. All rights reserved.
 * Licensed under the terms of the MIT License (see LICENSE.md).
 *
 * The ruby text plugin dialog window definition (based on xertelink dialog)
 *
 * Created out of the CKEditor Plugin SDK:
 * http://docs.ckeditor.com/#!/guide/plugin_sdk_sample_1
 */

CKEDITOR.editor.prototype.getSelectedHtml = function() {
	
	var selection = this.getSelection();
	
	if (selection) {
		var bookmarks = selection.createBookmarks(),
			range = selection.getRanges()[ 0 ],
			fragment = range.clone().cloneContents();
		
		selection.selectBookmarks( bookmarks );
		
		var retval = "",
			childList = fragment.getChildren(),
			childCount = childList.count();
		
		for (var i=0; i<childCount; i++) {
			var child = childList.getItem(i);
			retval += ( child.getOuterHtml ? child.getOuterHtml() : child.getText() );
		}
		
		return retval;
	}
};

// Our dialog definition.
CKEDITOR.dialog.add('rubytextDialog', function(editor) {
	
	return {
		// Basic properties of the dialog window: title, minimum size.
		title: 'Phonetic Guide / Ruby Text', // ** translate?
		minWidth: 300,
		minHeight: 100,

		// Dialog window content definition.
		contents: [
			{
				id: 'rubyInfo',

				// The text fields:
				elements: [
					{
						type:'text',
						id:'rbText',
						label:'Text', // ** translate?
						//validate: CKEDITOR.dialog.validate.notEmpty('Text field cannot be empty'),
						
						// Called by the main setupContent method call on dialog initialization
						setup: function(element) {
							// starts with selected text in field (or existing rb text if not new)
							if (element) {
								var myText = '';
								for (var i=0; i<element.$.children.length; i++) {
									if (element.$.children[i].nodeName == 'RB') {
										myText = element.$.children[i].innerHTML;
										break;
									}
								}
								this.setValue(myText);
							}
						},
						
						// Called by the main commitContent method call on dialog confirmation
						commit: function(element) {
							var elementExists = false;
							for (var i=0; i<element.$.children.length; i++) {
								if (element.$.children[i].nodeName == 'RB') {
									element.$.children[i].innerHTML = this.getValue();
									elementExists = true;
									break;
								}
							}
							if (elementExists == false) {
								element.$.innerHTML += '<rb>' + this.getValue() + '</rb>';
							}
						}
					},
					{
						type: 'text',
						id: 'rtText',
						label:'Ruby Text', // ** translate?
						//validate: CKEDITOR.dialog.validate.notEmpty('Ruby text field cannot be empty'),

						
						// Called by the main setupContent method call on dialog initialization
						setup: function(element) {
							// starts with existing rt text if not new
							if (element) {
								var myText = '';
								for (var i=0; i<element.$.children.length; i++) {
									if (element.$.children[i].nodeName == 'RT') {
										myText = element.$.children[i].innerHTML;
										break;
									}
								}
								this.setValue(myText);
							}
						},

						// Called by the main commitContent method call on dialog confirmation
						commit: function( element ) {
							var elementExists = false;
							for (var i=0; i<element.$.children.length; i++) {
								if (element.$.children[i].nodeName == 'RT') {
									element.$.children[i].innerHTML = this.getValue();
									elementExists = true;
									break;
								}
							}
							if (elementExists == false) {
								element.$.innerHTML += '<rt>' + this.getValue() + '</rt>';
							}
						}
					}
				]
			},
		],

		// Invoked when the dialog is loaded.
		onShow: function() {
			// Get the selection from the editor.
			var selection = editor.getSelection();
			// Get the element at the start of the selection.
			var element = selection.getStartElement();
			// make sure it's the ruby tag selected not the rt or rb
			element = element.getAscendant('rb', true) != null || element.getAscendant('rt', true) != null ? element.getAscendant('ruby', true) : element;

			// Create a new <ruby> element if it does not exist
			if (!element || element.getName() != 'ruby') {
				
				element = editor.document.createElement('ruby');
                element.setHtml('<rb>' + editor.getSelectedHtml() + '</rb>');
				
				// Flag the insertion mode for later use (whether new <ruby> tag is going to be created)
				this.insertMode = true;
			} else {
				this.insertMode = false;
			}

			// Store the reference to the <ruby> element in an internal property, for later use.
			this.element = element;

			// Invoke the setup methods of all dialog window elements, so they can load the element attributes.
			this.setupContent(this.element);
		},

		// This method is invoked once a user clicks the OK button, confirming the dialog.
		onOk: function() {
			// The context of this function is the dialog object itself.
			// http://docs.ckeditor.com/#!/api/CKEDITOR.dialog
			var dialog = this;

			// Create a new <ruby> element.
			var ruby = this.element;

			// Invoke the commit methods of all dialog window elements, so the <ruby> element gets modified.
			this.commitContent(ruby);

			// Finally, if in insert mode, insert the element into the editor at the caret position.
			if (this.insertMode) {
				editor.insertElement(ruby);
			}
		}
	};
});
