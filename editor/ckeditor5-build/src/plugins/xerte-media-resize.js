/**
 * Media widget resizing, alignment and accessible metadata controls.
 * @license Apache-2.0
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { WidgetResize } from '@ckeditor/ckeditor5-widget';
import { IconPencil } from 'ckeditor5/src/icons.js';
import { showMediaPropertiesDialog } from './xerte-media-properties-dialog.js';

const mediaAttributes = [ 'mediaWidth', 'mediaHeight', 'mediaAlign', 'mediaTitle', 'mediaAriaLabel' ];

export class XerteMediaResize extends Plugin {
	static get pluginName() { return 'XerteMediaResize'; }
	static get requires() { return [ MediaEmbed, WidgetResize ]; }

	afterInit() {
		const editor = this.editor;
		const resizers = editor.plugins.get( WidgetResize );
		editor.model.schema.extend( 'media', { allowAttributes: mediaAttributes } );
		this._registerConverters();
		this._registerPropertiesButton();

		editor.conversion.for( 'editingDowncast' ).add( dispatcher => {
			dispatcher.on( 'insert:media', ( event, data, conversionApi ) => {
				const modelElement = data.item;
				const viewElement = conversionApi.mapper.toViewElement( modelElement );
				if ( !viewElement || resizers.getResizerByViewElement( viewElement ) ) return;
				resizers.attachTo( {
					unit: 'px', modelElement, viewElement, editor,
					getHandleHost: domWidget => domWidget,
					getResizeHost: domWidget => domWidget,
					isCentered: () => ( modelElement.getAttribute( 'mediaAlign' ) || 'center' ) === 'center',
					onCommit: width => editor.model.change( writer => writer.setAttribute( 'mediaWidth', width, modelElement ) )
				} );
			}, { priority: 'low' } );
		} );
	}

	_registerConverters() {
		for ( const pipeline of [ 'editingDowncast', 'dataDowncast' ] ) {
			this.editor.conversion.for( pipeline ).add( dispatcher => {
				for ( const attribute of mediaAttributes ) {
					dispatcher.on( `attribute:${ attribute }:media`, ( event, data, api ) => {
						if ( !api.consumable.consume( data.item, event.name ) ) return;
						const figure = api.mapper.toViewElement( data.item );
						if ( figure ) applyMediaAttribute( api.writer, figure, attribute, data.attributeNewValue );
					} );
				}
			} );
		}
	}

	_registerPropertiesButton() {
		const editor = this.editor;
		editor.ui.componentFactory.add( 'xerteMediaProperties', locale => {
			const button = new ButtonView( locale );
			button.set( { label: editor.t( 'Media properties' ), icon: IconPencil, tooltip: true } );
			button.on( 'execute', async () => {
				const media = editor.model.document.selection.getSelectedElement();
				if ( !media || !media.is( 'element', 'media' ) ) return;
				const values = await showMediaPropertiesDialog( editor, media );
				if ( !values ) return;
				editor.model.change( writer => {
					for ( const attribute of mediaAttributes ) {
						const value = values[ attribute ];
						if ( value ) writer.setAttribute( attribute, value, media );
						else writer.removeAttribute( attribute, media );
					}
				} );
				editor.editing.view.focus();
			} );
			return button;
		} );
	}
}

function applyMediaAttribute( writer, figure, attribute, value ) {
	const iframe = findDescendant( figure, element => element.is( 'element', 'iframe' ) );
	if ( attribute === 'mediaWidth' ) setStyle( writer, figure, 'width', value );
	if ( attribute === 'mediaHeight' ) {
		setStyle( writer, figure, 'height', value );
		if ( iframe ) setAttribute( writer, iframe, 'height', value ? String( value ).replace( /px$/, '' ) : null );
	}
	if ( attribute === 'mediaAlign' ) {
		writer.removeStyle( [ 'float', 'margin-left', 'margin-right' ], figure );
		if ( value === 'left' ) writer.setStyle( { float: 'left', 'margin-left': '0', 'margin-right': '1.5em' }, figure );
		else if ( value === 'right' ) writer.setStyle( { float: 'right', 'margin-left': '1.5em', 'margin-right': '0' }, figure );
		else if ( value === 'center' ) writer.setStyle( { 'margin-left': 'auto', 'margin-right': 'auto' }, figure );
	}
	if ( attribute === 'mediaTitle' ) {
		setAttribute( writer, figure, 'data-xerte-media-title', value );
		setAttribute( writer, figure, 'title', value );
		if ( iframe ) setAttribute( writer, iframe, 'title', value );
	}
	if ( attribute === 'mediaAriaLabel' ) {
		setAttribute( writer, figure, 'data-xerte-media-aria-label', value );
		setAttribute( writer, figure, 'aria-label', value );
		if ( iframe ) setAttribute( writer, iframe, 'aria-label', value );
	}
	if ( attribute === 'mediaAlign' ) setAttribute( writer, figure, 'data-xerte-media-align', value );
}

function setStyle( writer, element, name, value ) {
	if ( value ) writer.setStyle( name, value, element );
	else writer.removeStyle( name, element );
}

function setAttribute( writer, element, name, value ) {
	if ( value ) writer.setAttribute( name, value, element );
	else writer.removeAttribute( name, element );
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
