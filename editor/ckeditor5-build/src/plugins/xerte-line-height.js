/**
 * Apply Xerte's legacy line-height values to inline text.
 * @license Apache-2.0
 */
import { Command, Plugin } from '@ckeditor/ckeditor5-core';
import { Collection } from '@ckeditor/ckeditor5-utils';
import { UIModel, addListToDropdown, createDropdown } from '@ckeditor/ckeditor5-ui';

const LINE_HEIGHT = 'lineHeight';
const BLOCK_LINE_HEIGHT = 'xerteBlockLineHeight';

export const XERTE_LINE_HEIGHT_VALUES = [
	'1rem',
	'1.1rem',
	'1.2rem',
	'1.3rem',
	'1.4rem',
	'1.5rem',
	'1.6rem',
	'1.7rem',
	'1.8rem',
	'1.9rem',
	'2rem',
	'2.5rem',
	'3rem',
	'3.5rem',
	'4rem'
];

const LINE_HEIGHT_ICON = '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M6 4h11v2H6V4zm0 5h11v2H6V9zm0 5h11v2H6v-2zM2.7 3l2 2-2 2V5.7H1V4.3h1.7V3zm0 10l2 2-2 2v-1.3H1v-1.4h1.7V13z"/></svg>';

class LineHeightCommand extends Command {
	refresh() {
		const model = this.editor.model;
		this.value = model.document.selection.getAttribute( LINE_HEIGHT );
		this.isEnabled = model.schema.checkAttributeInSelection( model.document.selection, LINE_HEIGHT );
	}

	execute( options = {} ) {
		const model = this.editor.model;
		const selection = model.document.selection;
		const value = options.value;

		model.change( writer => {
			// Line height is naturally a block-level property. Keep it on each selected
			// block so values below the editor's default 1.5 line height remain visible.
			for ( const block of selection.getSelectedBlocks() ) {
				if ( value ) {
					writer.setAttribute( BLOCK_LINE_HEIGHT, value, block );
				} else {
					writer.removeAttribute( BLOCK_LINE_HEIGHT, block );
				}
			}

			// Also retain the inline attribute and legacy span in saved data so older
			// Xerte installations continue to understand the formatting.
			if ( selection.isCollapsed ) {
				if ( value ) {
					writer.setSelectionAttribute( LINE_HEIGHT, value );
				} else {
					writer.removeSelectionAttribute( LINE_HEIGHT );
				}
				return;
			}

			for ( const range of model.schema.getValidRanges( selection.getRanges(), LINE_HEIGHT ) ) {
				if ( value ) {
					writer.setAttribute( LINE_HEIGHT, value, range );
				} else {
					writer.removeAttribute( LINE_HEIGHT, range );
				}
			}
		} );
	}
}

export class XerteLineHeight extends Plugin {
	static get pluginName() {
		return 'XerteLineHeight';
	}

	init() {
		const editor = this.editor;

		editor.model.schema.extend( '$text', { allowAttributes: LINE_HEIGHT } );
		editor.model.schema.extend( '$block', { allowAttributes: BLOCK_LINE_HEIGHT } );
		editor.model.schema.setAttributeProperties( LINE_HEIGHT, {
			isFormatting: true,
			copyOnEnter: true
		} );

		const view = {};
		for ( const value of XERTE_LINE_HEIGHT_VALUES ) {
			view[ value ] = {
				name: 'span',
				styles: { 'line-height': value }
			};
		}

		editor.conversion.attributeToElement( {
			model: {
				key: LINE_HEIGHT,
				values: XERTE_LINE_HEIGHT_VALUES
			},
			view
		} );

		const blockView = {};
		for ( const value of XERTE_LINE_HEIGHT_VALUES ) {
			blockView[ value ] = {
				key: 'style',
				value: { 'line-height': value }
			};
		}

		editor.conversion.attributeToAttribute( {
			model: {
				key: BLOCK_LINE_HEIGHT,
				values: XERTE_LINE_HEIGHT_VALUES
			},
			view: blockView
		} );

		editor.commands.add( LINE_HEIGHT, new LineHeightCommand( editor ) );

		editor.ui.componentFactory.add( LINE_HEIGHT, locale => {
			const command = editor.commands.get( LINE_HEIGHT );
			const dropdown = createDropdown( locale );
			const items = new Collection();

			for ( const value of XERTE_LINE_HEIGHT_VALUES ) {
				const model = new UIModel( {
					label: value,
					lineHeight: value,
					role: 'menuitemradio',
					withText: true
				} );
				model.bind( 'isOn' ).to( command, 'value', current => current === value );
				items.add( { type: 'button', model } );
			}

			addListToDropdown( dropdown, items, {
				role: 'menu',
				ariaLabel: editor.t( 'Line Height' )
			} );
			dropdown.buttonView.set( {
				label: editor.t( 'Line Height' ),
				icon: LINE_HEIGHT_ICON,
				tooltip: true
			} );
			dropdown.bind( 'isEnabled' ).to( command, 'isEnabled' );
			dropdown.on( 'execute', event => {
				const value = event.source.lineHeight;
				editor.execute( LINE_HEIGHT, {
					value: command.value === value ? undefined : value
				} );
				editor.editing.view.focus();
			} );

			return dropdown;
		} );
	}
}
