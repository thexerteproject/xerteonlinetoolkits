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
CKEDITOR.plugins.add( 'xotlink', {

	// Register the icons.
	icons: 'xotlink',

	// The plugin initialization logic goes inside this method.
	init: function( editor ) {

		// Define an editor command that opens our dialog window.
		editor.addCommand( 'xotlink', new CKEDITOR.dialogCommand( 'xotlinkDialog', {

			// Allow the abbr tag with an optional title attribute.
			allowedContent: 'a[href]',

			// Require the abbr tag to be allowed for the feature to work.
			requiredContent: 'a'


		} ) );

		// Create a toolbar button that executes the above command.
		editor.ui.addButton( 'xotlink', {

			// The text part of the button (if available) and the tooltip.
			label: 'Xerte Page Link',

			// The command to execute on click.
			command: 'xotlink',

			// The button placement in the toolbar (toolbar group name).
			toolbar: 'links'
		});

		if ( editor.contextMenu ) {
			
			if ( editor.contextMenu ) {
                editor.addMenuGroup( 'xotGroup' );
                editor.addMenuItem( 'xotlinkItem', {
                    label: 'Xerte Page link',
                    icon: this.path + 'icons/xotlink.png',
                    command: 'xotlink',
                    group: 'xotGroup'
                });
            }
            editor.contextMenu.addListener( function( element ) {
                var selection = editor.getSelection();
                //alert( selection.getType() );
                if (selection.getSelectedText() != "")
                    return { xotlinkItem: CKEDITOR.TRISTATE_OFF };
            });
		}

		// Register our dialog file -- this.path is the plugin folder path.
		CKEDITOR.dialog.add( 'xotlinkDialog', this.path + 'dialogs/xotlink.js' );
	}
});
