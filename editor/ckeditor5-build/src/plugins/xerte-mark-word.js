/**
 * Wrap selected text in the current main delimiter (legacy xotmarkword behavior).
 * @license Apache-2.0
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { IconPencil } from 'ckeditor5/src/icons.js';

function getMainDelimiter() {
	try {
		const root = document.getElementById( 'opt_mainDelimiter' );
		if ( root ) {
			const input = root.querySelector( '.wizardvalue input' );
			if ( input && input.value ) {
				return String( input.value );
			}
		}
	} catch ( e ) {
		// Ignore and fallback.
	}
	return '|';
}

function getTextFromRange( range ) {
	let text = '';
	for ( const item of range.getItems() ) {
		if ( item.is( '$textProxy' ) ) {
			text += item.data;
		}
	}
	return text;
}

function trimTrailingSpaceFromRange( writer, range ) {
	const text = getTextFromRange( range );
	if ( !text.endsWith( ' ' ) ) {
		return range;
	}
	const end = range.end;
	if ( end.offset === 0 ) {
		return range;
	}
	return writer.createRange( range.start, writer.createPositionAt( end.parent, end.offset - 1 ) );
}

/**
 * @param {import('@ckeditor/ckeditor5-core').Editor} editor
 * @param {Array|null} [savedRanges] - From context menu; restores selection before insert.
 * @param {string|null} [savedText] - Selected text captured when the context menu opened.
 */
export function runXerteMarkWord( editor, savedRanges = null, savedText = null ) {
	const delimiter = getMainDelimiter();

	editor.model.change( writer => {
		if ( savedRanges && savedRanges.length ) {
			writer.setSelection( savedRanges );
		}

		let range = editor.model.document.selection.getFirstRange();
		if ( !range || range.isCollapsed ) {
			return;
		}

		let cleanText = savedText != null && savedText !== ''
			? String( savedText )
			: getTextFromRange( range );

		if ( !cleanText ) {
			return;
		}

		if ( cleanText.endsWith( ' ' ) ) {
			cleanText = cleanText.slice( 0, -1 );
			range = trimTrailingSpaceFromRange( writer, range );
		}

		if ( !cleanText ) {
			return;
		}

		const marked = `${ delimiter }${ cleanText }${ delimiter }`;
		const insertPos = range.start;
		writer.remove( range );
		writer.insertText( marked, insertPos );
	} );

	editor.editing.view.focus();
}

export class XerteMarkWord extends Plugin {
	static get pluginName() {
		return 'XerteMarkWord';
	}

	init() {
		const editor = this.editor;
		editor.ui.componentFactory.add( 'xotMarkWord', locale => {
			const view = new ButtonView( locale );
			view.set( {
				label: editor.t( 'Mark Word' ),
				icon: IconPencil,
				tooltip: true
			} );

			view.on( 'execute', () => {
				runXerteMarkWord( editor );
			} );

			return view;
		} );
	}
}
