/**
 * Media widget resizing, alignment and accessible metadata controls.
 * @license Apache-2.0
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';
import { MediaEmbed, MediaEmbedToolbar } from '@ckeditor/ckeditor5-media-embed';
import { WidgetResize } from '@ckeditor/ckeditor5-widget';
import { IconMedia, IconPencil } from 'ckeditor5/src/icons.js';
import { showMediaPropertiesDialog } from './xerte-media-properties-dialog.js';

const mediaAttributes = [ 'mediaWidth', 'mediaHeight', 'mediaAlign', 'mediaTitle', 'mediaAriaLabel' ];
const originalRenderers = new WeakMap();

export class XerteMediaResize extends Plugin {
	static get pluginName() { return 'XerteMediaResize'; }
	static get requires() { return [ MediaEmbed, MediaEmbedToolbar, WidgetResize ]; }

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
						if ( figure ) refreshMediaPreview( api.writer, figure, data.item );
					} );
				}
				dispatcher.on( 'attribute:url:media', ( event, data, api ) => {
					const figure = api.mapper.toViewElement( data.item );
					if ( figure ) refreshMediaPreview( api.writer, figure, data.item );
				}, { priority: 'low' } );
			} );
		}
	}

	_registerPropertiesButton() {
		const editor = this.editor;
		// Replace the URL-only insertion control while retaining legacy toolbar mappings.
		for ( const [ name, View ] of [ [ 'mediaEmbed', ButtonView ], [ 'menuBar:mediaEmbed', MenuBarMenuListItemButtonView ] ] ) {
			editor.ui.componentFactory.add( name, locale => {
				const button = new View( locale );
				button.set( { label: editor.t( 'Insert media' ), icon: IconMedia, tooltip: true } );
				button.bind( 'isEnabled' ).to( editor.commands.get( 'mediaEmbed' ), 'isEnabled' );
				button.on( 'execute', () => openMediaPropertiesDialog( editor ) );
				return button;
			} );
		}
		editor.ui.componentFactory.add( 'xerteMediaProperties', locale => {
			const button = new ButtonView( locale );
			button.set( { label: editor.t( 'Media properties' ), icon: IconPencil, tooltip: true } );
			button.bind( 'isEnabled' ).to( editor, 'isReadOnly', value => !value );
			button.on( 'execute', () => openMediaPropertiesDialog( editor ) );
			return button;
		} );
	}
}

// Provider HTML lives inside a RawElement, outside CKEditor's view tree.
// Recreate that preview with its original renderer so settings also reach the
// iframe, survive URL changes, and appear in serialized learning-object HTML.
function refreshMediaPreview( writer, figure, media ) {
	const preview = Array.from( figure.getChildren() ).find( child => child.is( 'rawElement' ) );
	if ( !preview ) return;
	const render = originalRenderers.get( preview ) || preview.render;
	const values = Object.fromEntries( mediaAttributes.map( key => [ key, media.getAttribute( key ) ] ) );
	const replacement = writer.createRawElement( preview.name, preview.getAttributes(), ( dom, converter ) => {
		render.call( preview, dom, converter );
		for ( const iframe of dom.querySelectorAll( 'iframe' ) ) {
			if ( values.mediaTitle ) iframe.setAttribute( 'title', values.mediaTitle );
			if ( values.mediaAriaLabel ) iframe.setAttribute( 'aria-label', values.mediaAriaLabel );
			if ( values.mediaHeight ) {
				const container = iframe.parentElement;
				if ( container !== dom ) {
					container.style.height = values.mediaHeight;
					container.style.paddingBottom = '0';
				}
				iframe.style.height = values.mediaHeight;
			}
		}
	} );
	for ( const [ key, value ] of preview.getCustomProperties() ) writer.setCustomProperty( key, value, replacement );
	originalRenderers.set( replacement, render );
	writer.insert( writer.createPositionBefore( preview ), replacement );
	writer.remove( preview );
}

export async function openMediaPropertiesDialog( editor, media = editor.model.document.selection.getSelectedElement() ) {
	if ( editor.isReadOnly ) return;
	if ( !media?.is( 'element', 'media' ) ) media = null;
	const ranges = Array.from( editor.model.document.selection.getRanges(), range => range.clone() );
	const values = await showMediaPropertiesDialog( editor, media );
	if ( values && !editor.isReadOnly && ( !media || media.root.rootName !== '$graveyard' ) ) {
		editor.model.change( writer => {
			writer.setSelection( media || ranges, media ? 'on' : undefined );
			editor.execute( 'mediaEmbed', values.url );
			const target = editor.model.document.selection.getSelectedElement();
			if ( !target?.is( 'element', 'media' ) ) return;
			for ( const attribute of mediaAttributes ) {
				if ( values[ attribute ] ) writer.setAttribute( attribute, values[ attribute ], target );
				else writer.removeAttribute( attribute, target );
			}
		} );
	}
	editor.editing.view.focus();
}

export function mediaFromDomTarget( editor, target ) {
	const root = editor.editing.view.getDomRoot();
	let node = target?.nodeType === Node.TEXT_NODE ? target.parentElement : target;
	while ( node && node !== root ) {
		if ( node.matches?.( 'figure.media' ) ) {
			const view = editor.editing.view.domConverter.domToView( node );
			const model = view && editor.editing.mapper.toModelElement( view );
			return model?.is( 'element', 'media' ) ? model : null;
		}
		node = node.parentElement;
	}
	return null;
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
