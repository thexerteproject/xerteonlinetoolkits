/**
 * Toggle the legacy Xerte <mark> element on selected text.
 * @license Apache-2.0
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import { AttributeCommand } from '@ckeditor/ckeditor5-basic-styles';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { IconMarker } from 'ckeditor5/src/icons.js';

const MARK_ATTRIBUTE = 'mark';

export class XerteMarkTag extends Plugin {
	static get pluginName() {
		return 'XerteMarkTag';
	}

	init() {
		const editor = this.editor;

		editor.model.schema.extend( '$text', { allowAttributes: MARK_ATTRIBUTE } );

		editor.conversion.attributeToElement( {
			model: MARK_ATTRIBUTE,
			view: 'mark'
		} );

		editor.commands.add( 'markTag', new AttributeCommand( editor, MARK_ATTRIBUTE ) );

		editor.ui.componentFactory.add( 'markTag', locale => {
			const command = editor.commands.get( 'markTag' );
			const button = new ButtonView( locale );

			button.set( {
				label: editor.t( 'Marked Text' ),
				icon: IconMarker,
				isToggleable: true,
				tooltip: true
			} );

			button.bind( 'isEnabled' ).to( command, 'isEnabled' );
			button.bind( 'isOn' ).to( command, 'value' );
			button.on( 'execute', () => editor.execute( 'markTag' ) );

			return button;
		} );
	}
}
