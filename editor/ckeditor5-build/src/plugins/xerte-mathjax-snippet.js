/**
 * Inserts a MathJax span (replaces legacy extmathjax widget for typical LaTeX snippets).
 * @license Apache-2.0
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { IconHtml } from 'ckeditor5/src/icons.js';

export class XerteMathJaxSnippet extends Plugin {
	static get pluginName() {
		return 'XerteMathJaxSnippet';
	}

	init() {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'xerteMathJax', locale => {
			const view = new ButtonView( locale );
			view.set( {
				label: editor.t( 'MathJax' ),
				icon: IconHtml,
				tooltip: true
			} );
			view.on( 'execute', () => {
				const tex = window.prompt( editor.t( 'LaTeX / math (wrapped in span.mathjax)' ), '' );
				if ( tex === null ) {
					return;
				}
				const inner = escapeTexForSpan( tex );
				const html = `<span class="mathjax">${ inner }</span>`;
				editor.model.change( () => {
					const viewFragment = editor.data.processor.toView( html );
					const modelFragment = editor.data.toModel( viewFragment );
					editor.model.insertContent( modelFragment );
				} );
			} );
			return view;
		} );
	}
}

function escapeTexForSpan( s ) {
	return String( s )
		.replace( /&/g, '&amp;' )
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' );
}
