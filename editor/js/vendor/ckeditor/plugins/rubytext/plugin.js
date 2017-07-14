/**
 * Copyright (c) 2014, CKSource - Frederico Knabben. All rights reserved.
 * Copyright (c) 2015, Tom Reijnders
 * Licensed under the terms of the MIT License (see LICENSE.md).
 *
 * Plugin to insert ruby text (phonetic guide) into Xerte
 * based on xertelink plugin & basic sample plugin inserting abbreviation elements into the CKEditor editing area.
 *
 * Created out of the CKEditor Plugin SDK:
 * http://docs.ckeditor.com/#!/guide/plugin_sdk_sample_1
 */

// Register the plugin within the editor.
CKEDITOR.plugins.add('rubytext', {
	
	icons: 'rubytext',
	
	// The plugin initialization logic goes inside this method.
	init: function(editor) {
		// Define an editor command that opens our dialog window.
		editor.addCommand('rubytext', new CKEDITOR.dialogCommand('rubytextDialog', {
			// Allow the 'ruby' tag & require the 'ruby' tag to be there for the feature to work
			allowedContent: 'ruby',
			requiredContent: 'ruby'
		}));

		// Create a toolbar button that executes the above command.
		editor.ui.addButton('rubytext', {
			label: 'Phonetic Guide / Ruby Text', // ** translate?
			command: 'rubytext',
			toolbar: 'basicstyles'
		});

		// Register our dialog file -- this.path is the plugin folder path.
		CKEDITOR.dialog.add('rubytextDialog', this.path + 'dialogs/rubytext.js');
	}
});
