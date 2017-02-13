/**
 * Copyright (c) 2014, CKSource - Frederico Knabben. All rights reserved.
 * Copyright (c) 2015, Tom Reijnders
 * Licensed under the terms of the MIT License (see LICENSE.md).
 *
 * Plugin to insert internal page links into Xerte
 * based on basic sample plugin inserting abbreviation elements into the CKEditor editing area.
 *
 * Created out of the CKEditor Plugin SDK:
 * http://docs.ckeditor.com/#!/guide/plugin_sdk_sample_1
 */

// Register the plugin within the editor.
CKEDITOR.plugins.add('xotlink', {

	// Register the icons.
	icons: 'xotlink',

	// The plugin initialization logic goes inside this method.
	init: function(editor) {

		// Define an editor command that opens our dialog window.
		editor.addCommand('xotlink', new CKEDITOR.dialogCommand( 'xotlinkDialog', {

			// Allow the 'a' tag with an href attribute.
			allowedContent: 'a[href]',

			// Require the 'a' tag to be allowed for the feature to work
			requiredContent: 'a'
		} ) );

		editor.on('selectionChange', function (evt) {
			if (editor.readOnly) return;

			var element = evt.data.path.lastElement && evt.data.path.lastElement.getAscendant('a', true);
			var linkCommand = editor.getCommand('link');
			var xotLinkCommand = editor.getCommand('xotlink');
			if (element && element.getName() == 'a' && element.getAttribute('href') && element.getChildCount()) {
				var attr = element.getAttribute('onclick') ? element.getAttribute('onclick') : element.getAttribute('data-cke-pa-onclick');
				if (attr && attr.indexOf('(')) {
					if (attr.split('(')[0] == 'x_navigateToPage') {
						linkCommand.setState(CKEDITOR.TRISTATE_DISABLED);
						xotLinkCommand.setState(CKEDITOR.TRISTATE_OFF);
					}
					else {
						linkCommand.setState(CKEDITOR.TRISTATE_OFF);
						xotLinkCommand.setState(CKEDITOR.TRISTATE_OFF);
					}
				}
				else {
					linkCommand.setState(CKEDITOR.TRISTATE_OFF);
					xotLinkCommand.setState(CKEDITOR.TRISTATE_DISABLED);
				}
			}
			else {
				linkCommand.setState(CKEDITOR.TRISTATE_OFF);
				xotLinkCommand.setState(CKEDITOR.TRISTATE_OFF);
			}
		});

		// Create a toolbar button that executes the above command.
		editor.ui.addButton('xotlink', {

			// The text part of the button (if available) and the tooltip.
			label: 'Xerte Page Link',

			// The command to execute on click.
			command: 'xotlink',

			// The button placement in the toolbar (toolbar group name).
			toolbar: 'links'
		});

		if (editor.contextMenu) {
			
			//editor.addMenuGroup( 'xotGroup' );
			editor.addMenuItem('addXotLinkItem', {
				label: 'Insert Xerte Page Link',
				icon: this.path + 'icons/xotlink.png',
				command: 'xotlink',
				group: 'link',
				order: -10
			});
			
			editor.addMenuItem('editXotLinkItem', {
				label: 'Edit Xerte Page Link',
				icon: this.path + 'icons/xotlink.png',
				command: 'xotlink',
				group: 'link',
				order: -11
			});

            editor.contextMenu.addListener(function(element, selection, path) {
            	if (!element || element.isReadOnly())
					return null;

				var element = selection.getStartElement();

				if (element) {
					element = element.getAscendant('a', true);
				}

				if (element) {
					var attr = element.getAttribute('onclick') ? element.getAttribute('onclick') : element.getAttribute('data-cke-pa-onclick');
					if (attr && attr.indexOf("(")) {
						if (attr.split('(')[0] == 'x_navigateToPage') {
							// Xerte Page Link clicked
							return {editXotLinkItem: CKEDITOR.TRISTATE_OFF};
						}
					}
				}
				else {
					// No link clicked
					return {addXotLinkItem: CKEDITOR.TRISTATE_OFF};
				}

				return null;
            });
		}

		// Register our dialog file -- this.path is the plugin folder path.
		CKEDITOR.dialog.add('xotlinkDialog', this.path + 'dialogs/xotlink.js');
	}
});
