/**
 * Preserve explicit image heights alongside CKEditor's native resizedWidth.
 *
 * CKEditor deliberately treats width+height styles on the same block element
 * as intrinsic dimensions during upcast. Storing height on the inner image and
 * marking the widget keeps explicit width+height round-trippable, while leaving
 * native resizedWidth conversion responsible for the image_resized class.
 * @license Apache-2.0
 */
export function registerImageHeightConversion( editor ) {
	const imageUtils = editor.plugins.get( 'ImageUtils' );
	for ( const pipeline of [ 'editingDowncast', 'dataDowncast' ] ) {
		editor.conversion.for( pipeline ).add( dispatcher => {
			for ( const imageType of [ 'imageBlock', 'imageInline' ] ) {
				dispatcher.on( `attribute:resizedHeight:${ imageType }`, ( event, data, api ) => {
					if ( !api.consumable.consume( data.item, event.name ) ) return;
					const viewImage = api.mapper.toViewElement( data.item );
					const img = imageUtils.findViewImgElement( viewImage );
					if ( data.attributeNewValue ) {
						api.writer.removeStyle( 'height', viewImage );
						if ( img ) api.writer.setStyle( 'height', data.attributeNewValue, img );
						api.writer.addClass( 'xerte-image-explicit-height', viewImage );
					} else {
						api.writer.removeStyle( 'height', viewImage );
						if ( img ) api.writer.removeStyle( 'height', img );
						api.writer.removeClass( 'xerte-image-explicit-height', viewImage );
					}
				}, { priority: 'highest' } );
			}
		} );
	}

	editor.conversion.for( 'upcast' ).add( dispatcher => {
		const restoreExplicitDimensions = ( event, data, api ) => {
			if ( !data.viewItem.hasClass( 'xerte-image-explicit-height' ) || !data.modelRange ) return;
			const image = Array.from( data.modelRange.getItems() ).find( item => item.is( 'element', 'imageBlock' ) || item.is( 'element', 'imageInline' ) );
			if ( !image ) return;
			const img = data.viewItem.is( 'element', 'img' ) ? data.viewItem : findViewDescendant( data.viewItem, child => child.is( 'element', 'img' ) );
			const width = data.viewItem.getStyle( 'width' );
			const height = img?.getStyle( 'height' ) || data.viewItem.getStyle( 'height' );
			if ( width ) api.writer.setAttribute( 'resizedWidth', width, image );
			if ( height ) api.writer.setAttribute( 'resizedHeight', height, image );
			api.consumable.consume( data.viewItem, { classes: 'xerte-image-explicit-height' } );
		};
		dispatcher.on( 'element:figure', restoreExplicitDimensions, { priority: 'low' } );
		dispatcher.on( 'element:img', restoreExplicitDimensions, { priority: 'low' } );
	} );
}

function findViewDescendant( element, predicate ) {
	for ( const child of element.getChildren() ) {
		if ( predicate( child ) ) return child;
		if ( child.is( 'element' ) ) {
			const found = findViewDescendant( child, predicate );
			if ( found ) return found;
		}
	}
	return null;
}

