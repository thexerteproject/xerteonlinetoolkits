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
				const height = figure && figure.getStyle( 'height' );
				const iframe = findDescendant( viewElement, element => element.is( 'element', 'iframe' ) );
				const attributes = { url };
				if ( validDimension( width, true ) ) attributes.mediaWidth = width;
				if ( validDimension( height, false ) ) attributes.mediaHeight = height;
				const title = figure && ( figure.getAttribute( 'data-xerte-media-title' ) || figure.getAttribute( 'title' ) ) || iframe && iframe.getAttribute( 'title' );
				const ariaLabel = figure && ( figure.getAttribute( 'data-xerte-media-aria-label' ) || figure.getAttribute( 'aria-label' ) ) || iframe && iframe.getAttribute( 'aria-label' );
				const align = figure && figure.getAttribute( 'data-xerte-media-align' ) || alignmentFromStyles( figure );
				if ( title ) attributes.mediaTitle = title;
				if ( ariaLabel ) attributes.mediaAriaLabel = ariaLabel;
				if ( align ) attributes.mediaAlign = align;

				return writer.createElement( 'media', attributes );
			},
			converterPriority: 'high'
		} );
	}
}

function validDimension( value, allowPercent ) {
	return value && new RegExp( `^(?:[1-9]\\d*(?:\\.\\d+)?)(?:px${ allowPercent ? '|%' : '' })$`, 'i' ).test( value );
}

function alignmentFromStyles( figure ) {
	if ( !figure ) return null;
	if ( figure.getStyle( 'float' ) === 'left' ) return 'left';
	if ( figure.getStyle( 'float' ) === 'right' ) return 'right';
	if ( figure.getStyle( 'margin-left' ) === 'auto' && figure.getStyle( 'margin-right' ) === 'auto' ) return 'center';
	return null;
}

function findDescendant( element, predicate ) {
	for ( const child of element.getChildren() ) {
		if ( predicate( child ) ) return child;
		if ( child.is( 'element' ) ) {
			const found = findDescendant( child, predicate );
			if ( found ) return found;
		}
	}
	return null;
}
