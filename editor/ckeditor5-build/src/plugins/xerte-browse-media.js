/**
 * @license Apache-2.0
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { IconBrowseFiles } from 'ckeditor5/src/icons.js';

function isImageUrl( url ) {
	const m = url.match( /\.([a-z0-9]+)(?:\?|$)/i );
	if ( !m ) {
		return false;
	}
	return [ 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp' ].includes( m[ 1 ].toLowerCase() );
}

export class XerteBrowseMedia extends Plugin {
	static get pluginName() {
		return 'XerteBrowseMedia';
	}

	init() {
		const editor = this.editor;
		const browseUrl = editor.config.get( 'xerteBrowseMediaUrl' );
		if ( !browseUrl ) {
			return;
		}

		editor.ui.componentFactory.add( 'xerteBrowseMedia', locale => {
			const view = new ButtonView( locale );
			view.set( {
				label: editor.t( 'Browse server' ),
				icon: IconBrowseFiles,
				tooltip: true
			} );
			view.on( 'execute', () => {
				browseMedia( browseUrl ).then( url => {
					if ( !url ) {
						return;
					}
					editor.model.change( () => {
						if ( isImageUrl( url ) ) {
							editor.execute( 'insertImage', { source: url } );
						} else {
							const label = decodeURIComponent( url.split( '/' ).pop() || url );
							const linkCmd = editor.commands.get( 'link' );
							if ( linkCmd && linkCmd.isEnabled ) {
								editor.execute( 'link', url, {}, label );
							} else {
								const html = `<p><a href="${ escapeAttr( url ) }">${ escapeHtml( label ) }</a></p>`;
								const viewFragment = editor.data.processor.toView( html );
								const modelFragment = editor.data.toModel( viewFragment );
								editor.model.insertContent( modelFragment );
							}
						}
					} );
				} );
			} );
			return view;
		} );
	}
}

export function browseMedia( browseUrl ) {
	return new Promise( resolve => {
		const previous = window.__xerteCke5FilePickerResolve;
		let finished = false;
		let timer;
		const finish = url => {
			if ( finished ) return;
			finished = true;
			clearInterval( timer );
			window.__xerteCke5FilePickerResolve = previous || null;
			resolve( url || null );
		};
		window.__xerteCke5FilePickerResolve = finish;
		const popup = window.open( browseUrl, 'XerteBrowseMedia', 'height=600,width=800' );
		if ( !popup ) {
			finish( null );
			return;
		}
		timer = setInterval( () => {
			if ( popup.closed ) finish( null );
		}, 500 );
	} );
}

function escapeHtml( s ) {
	return String( s )
		.replace( /&/g, '&amp;' )
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' )
		.replace( /"/g, '&quot;' );
}

function escapeAttr( s ) {
	return String( s )
		.replace( /&/g, '&amp;' )
		.replace( /"/g, '&quot;' )
		.replace( /</g, '&lt;' );
}
