/**
 * Keep CKEditor 5 media previews editable after paste and drag/drop.
 * @license Apache-2.0
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';

export class XerteMediaEmbedRoundTrip extends Plugin {
	static get pluginName() {
		return 'XerteMediaEmbedRoundTrip';
	}

	static get requires() {
		return [ MediaEmbed ];
	}

	afterInit() {
		const editor = this.editor;
		const registry = editor.plugins.get( 'MediaEmbedEditing' ).registry;

		// With previewsInData enabled, a media widget is serialized as a
		// div[data-oembed-url] containing provider HTML. In this build the
		// normal-priority upcast can lose the media object during paste/drop,
		// leaving a bare iframe without its aspect-ratio wrapper. Convert the
		// URL-bearing div before generic HTML converters handle its children.
		editor.conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'div',
				attributes: { 'data-oembed-url': true }
			},
			model: ( viewElement, { writer } ) => {
				const url = viewElement.getAttribute( 'data-oembed-url' );
				if ( !url || !registry.hasMedia( url ) ) {
					return null;
				}

				const figure = viewElement.parent;
				const width = figure && figure.is( 'element', 'figure' ) && figure.hasClass( 'media' ) ? figure.getStyle( 'width' ) : null;
				const attributes = { url };
				if ( width && /^(?:[1-9]\d?(?:\.\d+)?|100)%$/.test( width ) ) {
					attributes.mediaWidth = width;
				}

				return writer.createElement( 'media', attributes );
			},
			converterPriority: 'high'
		} );
	}
}
