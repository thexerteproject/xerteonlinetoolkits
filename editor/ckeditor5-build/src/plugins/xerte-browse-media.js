/**
 * @license Apache-2.0
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { IconBrowseFiles, IconImage } from 'ckeditor5/src/icons.js';
import { displayDimension } from './xerte-image-dimensions.js';
import { registerImageHeightConversion } from './xerte-image-height-conversion.js';
import { showImagePropertiesDialog } from './xerte-image-properties-dialog.js';

export class XerteBrowseMedia extends Plugin {
	static get pluginName() {
		return 'XerteBrowseMedia';
	}

	init() {
		const editor = this.editor;
		registerImageHeightConversion( editor );
		const browseUrl = editor.config.get( 'xerteBrowseMediaUrl' );
		const browseImageUrl = editor.config.get( 'xerteBrowseImageUrl' );

		if ( browseImageUrl ) {
			editor.ui.componentFactory.add( 'xerteBrowseImage', locale => {
				const view = new ButtonView( locale );
				view.set( {
					label: editor.t( 'Insert image with file manager' ),
					icon: IconImage,
					tooltip: true
				} );
				view.on( 'execute', () => openImagePropertiesDialog( editor ) );
				return view;
			} );

			editor.ui.componentFactory.add( 'xerteImageProperties', locale => {
				const view = new ButtonView( locale );
				view.set( { label: editor.t( 'Image properties' ), icon: IconImage, tooltip: true } );
				view.on( 'execute', () => openImagePropertiesDialog( editor, selectedImage( editor ) ) );
				return view;
			} );

			const onDoubleClick = event => {
				const image = imageFromDomTarget( editor, event.target );
				if ( !image || editor.isReadOnly ) return;
				event.preventDefault();
				editor.model.change( writer => writer.setSelection( image, 'on' ) );
				openImagePropertiesDialog( editor, image );
			};
			let boundRoot = null;
			const bindDoubleClick = () => {
				const root = editor.editing.view.getDomRoot();
				if ( !root || root === boundRoot ) return;
				boundRoot?.removeEventListener( 'dblclick', onDoubleClick );
				root.addEventListener( 'dblclick', onDoubleClick );
				boundRoot = root;
			};
			editor.ui.once( 'ready', bindDoubleClick );
			editor.once( 'ready', bindDoubleClick );
			editor.on( 'destroy', () => boundRoot?.removeEventListener( 'dblclick', onDoubleClick ) );
		}

		if ( !browseUrl ) return;

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
					} );
				} );
			} );
			return view;
		} );
	}
}

export function openImagePropertiesDialog( editor, image = null ) {
	image = image || selectedImage( editor );
	const browseUrl = editor.config.get( 'xerteBrowseImageUrl' );
	const resizedWidth = image?.getAttribute( 'resizedWidth' );
	const resizedHeight = image?.getAttribute( 'resizedHeight' );
	const initial = image ? {
		url: image.getAttribute( 'src' ) || '',
		alt: image.getAttribute( 'alt' ) || '',
		width: displayDimension( resizedWidth || image.getAttribute( 'width' ) ),
		height: displayDimension( resizedHeight || ( resizedWidth ? '' : image.getAttribute( 'height' ) ) ),
		naturalWidth: Number( image.getAttribute( 'width' ) ) || 0,
		naturalHeight: Number( image.getAttribute( 'height' ) ) || 0,
		alignment: alignmentFromImage( image ),
		captioned: hasCaption( image )
	} : { url: '', alt: '', width: '', height: '', naturalWidth: 0, naturalHeight: 0, alignment: 'none', captioned: false };

	return showImagePropertiesDialog( editor, initial, () => browseMedia( browseUrl ) ).then( values => {
		if ( !values ) return null;
		applyImageProperties( editor, image, values );
		return true;
	} );
}

function applyImageProperties( editor, image, values ) {
	if ( image ) editor.model.change( writer => writer.setSelection( image, 'on' ) );
	else {
		editor.execute( 'insertImage', { source: { src: values.url, alt: values.alt, width: values.naturalWidth || undefined, height: values.naturalHeight || undefined } } );
		image = selectedImage( editor );
	}
	if ( !image ) return;
	editor.model.change( writer => {
		writer.setAttribute( 'src', values.url, image );
		writer.setAttribute( 'alt', values.alt, image );
		if ( values.naturalWidth ) writer.setAttribute( 'width', values.naturalWidth, image );
		else if ( values.sourceChanged ) writer.removeAttribute( 'width', image );
		if ( values.naturalHeight ) writer.setAttribute( 'height', values.naturalHeight, image );
		else if ( values.sourceChanged ) writer.removeAttribute( 'height', image );
		if ( values.width ) writer.setAttribute( 'resizedWidth', values.width, image ); else writer.removeAttribute( 'resizedWidth', image );
		if ( values.height ) writer.setAttribute( 'resizedHeight', values.height, image ); else writer.removeAttribute( 'resizedHeight', image );
		writer.setSelection( image, 'on' );
	} );
	const styles = { none: 'block', left: 'alignLeft', center: 'alignCenter', right: 'alignRight' };
	if ( editor.commands.get( 'imageStyle' )?.isEnabled ) editor.execute( 'imageStyle', { value: styles[ values.alignment ] } );
	image = selectedImage( editor );
	if ( image && hasCaption( image ) !== values.captioned && editor.commands.get( 'toggleImageCaption' )?.isEnabled ) editor.execute( 'toggleImageCaption' );
	editor.editing.view.focus();
}

function selectedImage( editor ) {
	return editor.plugins.get( 'ImageUtils' ).getClosestSelectedImageElement( editor.model.document.selection );
}

export function imageFromDomTarget( editor, target ) {
	const root = editor.editing.view.getDomRoot();
	let node = target?.nodeType === Node.TEXT_NODE ? target.parentElement : target;
	while ( node && node !== root ) {
		if ( node.matches?.( 'figure.image, .image-inline' ) ) {
			const view = editor.editing.view.domConverter.domToView( node );
			const model = view && editor.editing.mapper.toModelElement( view );
			return model && ( model.is( 'element', 'imageBlock' ) || model.is( 'element', 'imageInline' ) ) ? model : null;
		}
		node = node.parentElement;
	}
	return null;
}

function alignmentFromImage( image ) {
	const style = image.getAttribute( 'imageStyle' );
	if ( style === 'alignLeft' || style === 'alignBlockLeft' ) return 'left';
	if ( style === 'alignRight' || style === 'alignBlockRight' || style === 'side' ) return 'right';
	if ( style === 'alignCenter' ) return 'center';
	return 'none';
}

function hasCaption( image ) {
	return image.is( 'element', 'imageBlock' ) && Array.from( image.getChildren() ).some( child => child.is( 'element', 'caption' ) );
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
