/**
 * Resize media widgets with the same corner handles used for images.
 * @license Apache-2.0
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { WidgetResize } from '@ckeditor/ckeditor5-widget';

export class XerteMediaResize extends Plugin {
	static get pluginName() {
		return 'XerteMediaResize';
	}

	static get requires() {
		return [ MediaEmbed, WidgetResize ];
	}

	afterInit() {
		const editor = this.editor;
		const resizers = editor.plugins.get( WidgetResize );

		editor.model.schema.extend( 'media', { allowAttributes: [ 'mediaWidth' ] } );

		// The media preview remains untouched. Only the outer figure changes size.
		editor.conversion.for( 'downcast' ).add( dispatcher => {
			dispatcher.on( 'attribute:mediaWidth:media', ( event, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, event.name ) ) {
					return;
				}

				const figure = conversionApi.mapper.toViewElement( data.item );
				if ( data.attributeNewValue ) {
					conversionApi.writer.setStyle( 'width', data.attributeNewValue, figure );
				} else {
					conversionApi.writer.removeStyle( 'width', figure );
				}
			} );
		} );

		// Attach a resizer to every editing widget, including widgets recreated by
		// paste, drag/drop, and source editing. WidgetResize removes stale resizers.
		editor.conversion.for( 'editingDowncast' ).add( dispatcher => {
			dispatcher.on( 'insert:media', ( event, data, conversionApi ) => {
				const modelElement = data.item;
				const viewElement = conversionApi.mapper.toViewElement( modelElement );
				if ( !viewElement || resizers.getResizerByViewElement( viewElement ) ) {
					return;
				}

				resizers.attachTo( {
					unit: '%',
					modelElement,
					viewElement,
					editor,
					getHandleHost: domWidget => domWidget,
					getResizeHost: domWidget => domWidget,
					isCentered: () => false,
					onCommit: width => {
						editor.model.change( writer => {
							writer.setAttribute( 'mediaWidth', width, modelElement );
						} );
					}
				} );
			}, { priority: 'low' } );
		} );
	}
}
