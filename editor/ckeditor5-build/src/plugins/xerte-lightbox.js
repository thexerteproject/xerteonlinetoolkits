/**
 * Adds Featherlight settings to CKEditor links without introducing a second
 * link model.
 * @license Apache-2.0
 */
import { Command, Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { IconFullscreenEnter } from 'ckeditor5/src/icons.js';
import { findAttributeRange } from 'ckeditor5/src/typing.js';
import { priorities } from 'ckeditor5/src/utils.js';
import {
	normalizeLightbox,
	readLightboxAttributes,
	writeLightboxAttributes
} from './xerte-lightbox-utils.js';

const MODEL_ATTRIBUTE = 'linkXerteLightbox';
const LIGHTBOX_ATTRIBUTES = [
	'data-featherlight',
	'data-image-alt',
	'data-featherlight-iframe-width',
	'data-featherlight-iframe-height',
	'data-featherlight-iframe-style'
];

class XerteLightboxCommand extends Command {
	refresh() {
		const target = getSelectedLink( this.editor );
		this.isEnabled = !!target;
		this.value = target ? target.item.getAttribute( MODEL_ATTRIBUTE ) || null : null;
	}

	execute( settings ) {
		const target = getSelectedLink( this.editor );
		if ( !target ) {
			return;
		}

		this.editor.model.change( writer => {
			if ( settings ) {
				writer.setAttribute( MODEL_ATTRIBUTE, normalizeLightbox( settings ), target.range );
			} else {
				writer.removeAttribute( MODEL_ATTRIBUTE, target.range );
			}
		} );
	}
}

function getSelectedLink( editor ) {
	const selection = editor.model.document.selection;
	const selectedElement = selection.getSelectedElement();

	if ( selectedElement && selectedElement.hasAttribute( 'linkHref' ) ) {
		return {
			item: selectedElement,
			range: editor.model.createRangeOn( selectedElement )
		};
	}

	const href = selection.getAttribute( 'linkHref' );
	const position = selection.getFirstPosition();
	if ( !href || !position ) {
		return null;
	}

	const range = findAttributeRange( position, 'linkHref', href, editor.model );
	const item = range.start.textNode || range.start.nodeAfter;
	return item ? { item, range } : null;
}

export class XerteLightbox extends Plugin {
	static get pluginName() {
		return 'XerteLightbox';
	}

	init() {
		const editor = this.editor;
		const schema = editor.model.schema;

		schema.extend( '$text', { allowAttributes: MODEL_ATTRIBUTE } );
		for ( const imageName of [ 'imageBlock', 'imageInline' ] ) {
			if ( schema.isRegistered( imageName ) ) {
				schema.extend( imageName, { allowAttributes: MODEL_ATTRIBUTE } );
			}
		}

		registerCleanup( editor );

		editor.commands.add( 'xerteLightbox', new XerteLightboxCommand( editor ) );
		editor.ui.componentFactory.add( 'xerteLightbox', locale => {
			const command = editor.commands.get( 'xerteLightbox' );
			const button = new ButtonView( locale );
			button.set( {
				label: editor.t( 'Lightbox settings' ),
				icon: IconFullscreenEnter,
				tooltip: true
			} );
			button.bind( 'isEnabled' ).to( command, 'isEnabled' );
			button.on( 'execute', () => openLightboxDialog( editor, command.value ) );
			return button;
		} );
	}

	afterInit() {
		// LinkImage installs its converters in afterInit(). Registering after it
		// guarantees that linked images already have linkHref when we read them.
		const schema = this.editor.model.schema;
		if ( schema.isRegistered( 'fontAwesomeIcon' ) ) {
			schema.extend( 'fontAwesomeIcon', {
				allowAttributes: [ 'linkHref', MODEL_ATTRIBUTE ]
			} );
		}

		registerUpcast( this.editor );
		registerInlineDowncast( this.editor );
		registerBlockImageDowncast( this.editor );
	}
}

function registerUpcast( editor ) {
	editor.conversion.for( 'upcast' ).add( dispatcher => {
		dispatcher.on( 'element:a', ( event, data, api ) => {
			const viewLink = data.viewItem;
			const settings = readLightboxAttributes( viewLink );
			if ( !settings ) {
				return;
			}

			const attributesToConsume = LIGHTBOX_ATTRIBUTES.filter( name => viewLink.hasAttribute( name ) );
			if ( viewLink.getAttribute( 'target' ) === '_lightbox' ) {
				attributesToConsume.push( 'target' );
			}
			api.consumable.consume( viewLink, { attributes: attributesToConsume } );

			if ( data.modelRange && !data.modelRange.isCollapsed ) {
				api.writer.setAttribute( MODEL_ATTRIBUTE, settings, data.modelRange );
				return;
			}

			const modelElement = data.modelCursor && data.modelCursor.parent;
			if ( modelElement && modelElement.hasAttribute( 'linkHref' ) ) {
				api.writer.setAttribute( MODEL_ATTRIBUTE, settings, modelElement );
			}
		}, { priority: 'high' } );
	} );
}

function registerInlineDowncast( editor ) {
	for ( const pipeline of [ 'dataDowncast', 'editingDowncast' ] ) {
		editor.conversion.for( pipeline ).add( dispatcher => {
			const createElement = ( writer, settings ) => {
				const element = writer.createAttributeElement(
					'a',
					writeLightboxAttributes( settings ),
					{ priority: 5 }
				);
				writer.setCustomProperty( 'link', true, element );
				return element;
			};

			dispatcher.on( `attribute:${ MODEL_ATTRIBUTE }`, ( event, data, api ) => {
				if ( !data.item.is( 'selection' ) && !api.schema.isInline( data.item ) ) {
					return;
				}
				if ( !api.consumable.consume( data.item, event.name ) ) {
					return;
				}

				if ( data.attributeOldValue ) {
					api.writer.unwrap(
						api.mapper.toViewRange( data.range ),
						createElement( api.writer, data.attributeOldValue )
					);
				}

				if ( data.attributeNewValue ) {
					api.writer.wrap(
						api.mapper.toViewRange( data.range ),
						createElement( api.writer, data.attributeNewValue )
					);
				}
			}, { priority: priorities.high - 2 } );
		} );
	}
}

function registerBlockImageDowncast( editor ) {
	for ( const pipeline of [ 'dataDowncast', 'editingDowncast' ] ) {
		editor.conversion.for( pipeline ).add( dispatcher => {
			dispatcher.on( `attribute:${ MODEL_ATTRIBUTE }:imageBlock`, ( event, data, api ) => {
				if ( !api.consumable.consume( data.item, event.name ) ) {
					return;
				}

				const figure = api.mapper.toViewElement( data.item );
				const link = figure && Array.from( figure.getChildren() )
					.find( child => child.is( 'element', 'a' ) );
				if ( !link ) {
					return;
				}

				for ( const name of LIGHTBOX_ATTRIBUTES ) {
					api.writer.removeAttribute( name, link );
				}
				for ( const [ name, value ] of Object.entries( writeLightboxAttributes( data.attributeNewValue ) ) ) {
					api.writer.setAttribute( name, value, link );
				}
			}, { priority: 'low' } );
		} );
	}
}

function registerCleanup( editor ) {
	const model = editor.model;
	model.document.registerPostFixer( writer => {
		let changed = false;

		for ( const change of model.document.differ.getChanges() ) {
			if ( change.type !== 'attribute' || change.attributeKey !== 'linkHref' || change.attributeNewValue ) {
				continue;
			}

			for ( const item of change.range.getItems() ) {
				if ( item.hasAttribute( MODEL_ATTRIBUTE ) ) {
					writer.removeAttribute( MODEL_ATTRIBUTE, item );
					changed = true;
				}
			}
		}

		return changed;
	} );
}

function openLightboxDialog( editor, currentValue ) {
	const t = editor.t;
	const initial = normalizeLightbox( currentValue || { type: 'iframe' } );
	const overlay = document.createElement( 'div' );
	overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483645;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:20px';

	const form = document.createElement( 'form' );
	form.setAttribute( 'role', 'dialog' );
	form.setAttribute( 'aria-modal', 'true' );
	form.setAttribute( 'aria-label', t( 'Lightbox settings' ) );
	form.style.cssText = 'box-sizing:border-box;width:480px;max-width:95vw;padding:20px;border:1px solid #dbe2ea;border-radius:12px;background:#fff;color:#172033;box-shadow:0 24px 65px rgba(15,23,42,.3);font:14px system-ui,-apple-system,Segoe UI,Arial,sans-serif';

	const heading = document.createElement( 'h2' );
	heading.textContent = t( 'Lightbox settings' );
	heading.style.cssText = 'margin:0 0 18px;font-size:18px';
	form.appendChild( heading );

	const inputStyle = 'box-sizing:border-box;width:100%;margin-top:6px;padding:9px 10px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;color:#172033;font:inherit';
	const field = ( labelText, input, parent = form ) => {
		const label = document.createElement( 'label' );
		label.style.cssText = 'display:block;font-size:13px;font-weight:600;color:#334155';
		label.append( document.createTextNode( labelText ), input );
		parent.appendChild( label );
		return input;
	};

	const type = field( t( 'Lightbox type' ), document.createElement( 'select' ) );
	for ( const [ value, label ] of [ [ 'iframe', t( 'Embedded page' ) ], [ 'image', t( 'Image' ) ] ] ) {
		const option = document.createElement( 'option' );
		option.value = value;
		option.textContent = label;
		type.appendChild( option );
	}
	type.value = initial.type;
	type.style.cssText = inputStyle;

	const imageOptions = document.createElement( 'div' );
	imageOptions.style.marginTop = '16px';
	const alt = field( t( 'Image alternative text' ), document.createElement( 'input' ), imageOptions );
	alt.type = 'text';
	alt.value = initial.alt;
	alt.style.cssText = inputStyle;
	form.appendChild( imageOptions );

	const iframeOptions = document.createElement( 'div' );
	iframeOptions.style.cssText = 'display:grid;grid-template-columns:1fr 90px 1fr 90px;gap:10px;margin-top:16px;align-items:end';
	const width = field( t( 'Width' ), document.createElement( 'input' ), iframeOptions );
	const widthUnit = field( t( 'Unit' ), createUnitSelect( 'width', t ), iframeOptions );
	const height = field( t( 'Height' ), document.createElement( 'input' ), iframeOptions );
	const heightUnit = field( t( 'Unit' ), createUnitSelect( 'height', t ), iframeOptions );
	for ( const input of [ width, height ] ) {
		input.type = 'number'; input.min = '0'; input.step = 'any'; input.style.cssText = inputStyle;
	}
	width.value = initial.width ? initial.width.value : '';
	height.value = initial.height ? initial.height.value : '';
	widthUnit.value = initial.width ? initial.width.unit : 'vw';
	heightUnit.value = initial.height ? initial.height.unit : 'vh';
	widthUnit.style.cssText = inputStyle;
	heightUnit.style.cssText = inputStyle;
	form.appendChild( iframeOptions );

	const dimensionShortcuts = document.createElement( 'div' );
	dimensionShortcuts.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px 20px;margin-top:12px;color:#475569';
	const matchDimensions = createCheckbox( t( 'Match width and height' ) );
	const matchUnits = createCheckbox( t( 'Use the same unit' ) );
	dimensionShortcuts.append( matchDimensions.label, matchUnits.label );
	iframeOptions.insertAdjacentElement( 'afterend', dimensionShortcuts );

	matchDimensions.input.checked = !!width.value && width.value === height.value;
	matchUnits.input.checked = unitsMatch( widthUnit.value, heightUnit.value );
	let synchronizingDimensions = false;
	const synchronize = ( source, destination ) => {
		if ( synchronizingDimensions ) {
			return;
		}
		synchronizingDimensions = true;
		destination.value = source.value;
		synchronizingDimensions = false;
	};
	width.addEventListener( 'input', () => {
		if ( matchDimensions.input.checked ) synchronize( width, height );
	} );
	height.addEventListener( 'input', () => {
		if ( matchDimensions.input.checked ) synchronize( height, width );
	} );
	widthUnit.addEventListener( 'change', () => {
		if ( matchUnits.input.checked ) heightUnit.value = matchingUnit( widthUnit.value, 'height' );
	} );
	heightUnit.addEventListener( 'change', () => {
		if ( matchUnits.input.checked ) widthUnit.value = matchingUnit( heightUnit.value, 'width' );
	} );
	matchDimensions.input.addEventListener( 'change', () => {
		if ( matchDimensions.input.checked ) {
			synchronize( width.value ? width : height, width.value ? height : width );
		}
	} );
	matchUnits.input.addEventListener( 'change', () => {
		if ( matchUnits.input.checked ) heightUnit.value = matchingUnit( widthUnit.value, 'height' );
	} );

	const buttons = document.createElement( 'div' );
	buttons.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;margin-top:20px;padding-top:16px;border-top:1px solid #e5e7eb';
	const remove = dialogButton( t( 'Remove lightbox' ), '#fff', '#b91c1c' );
	remove.style.marginRight = 'auto';
	remove.hidden = !currentValue;
	const cancel = dialogButton( t( 'Cancel' ), '#fff', '#475569' );
	const save = dialogButton( t( 'Save' ), '#2563eb', '#fff' );
	save.type = 'submit';
	buttons.append( remove, cancel, save );
	form.appendChild( buttons );

	const updateVisibility = () => {
		imageOptions.hidden = type.value !== 'image';
		iframeOptions.hidden = type.value !== 'iframe';
		dimensionShortcuts.hidden = type.value !== 'iframe';
	};
	const close = () => {
		overlay.remove();
		editor.editing.view.focus();
	};

	type.addEventListener( 'change', updateVisibility );
	cancel.addEventListener( 'click', close );
	remove.addEventListener( 'click', () => {
		editor.execute( 'xerteLightbox', null );
		close();
	} );
	overlay.addEventListener( 'click', event => { if ( event.target === overlay ) close(); } );
	overlay.addEventListener( 'keydown', event => { if ( event.key === 'Escape' ) close(); } );
	form.addEventListener( 'submit', event => {
		event.preventDefault();
		editor.execute( 'xerteLightbox', {
			type: type.value,
			alt: alt.value.trim(),
			width: width.value ? { value: width.value, unit: widthUnit.value } : null,
			height: height.value ? { value: height.value, unit: heightUnit.value } : null,
			extraStyles: initial.extraStyles
		} );
		close();
	} );

	overlay.appendChild( form );
	document.body.appendChild( overlay );
	updateVisibility();
	type.focus();
}

function createUnitSelect( dimension, t ) {
	const select = document.createElement( 'select' );
	const previewUnit = dimension === 'width' ? 'vw' : 'vh';
	const otherViewportUnit = dimension === 'width' ? 'vh' : 'vw';
	const options = [
		[ previewUnit, '%' ],
		[ '%', t( 'Container % (legacy)' ) ],
		[ 'px', 'px' ],
		[ otherViewportUnit, otherViewportUnit ]
	];
	for ( const [ unit, label ] of options ) {
		const option = document.createElement( 'option' );
		option.value = unit;
		option.textContent = label;
		select.appendChild( option );
	}
	return select;
}

function unitsMatch( widthUnit, heightUnit ) {
	return widthUnit === heightUnit || ( widthUnit === 'vw' && heightUnit === 'vh' );
}

function matchingUnit( sourceUnit, destinationDimension ) {
	if ( sourceUnit === 'vw' || sourceUnit === 'vh' ) {
		return destinationDimension === 'width' ? 'vw' : 'vh';
	}
	return sourceUnit;
}

function createCheckbox( text ) {
	const label = document.createElement( 'label' );
	label.style.cssText = 'display:flex;align-items:center;gap:7px;cursor:pointer';
	const input = document.createElement( 'input' );
	input.type = 'checkbox';
	input.style.cssText = 'margin:0;accent-color:#2563eb';
	label.append( input, document.createTextNode( text ) );
	return { label, input };
}

function dialogButton( text, background, color ) {
	const button = document.createElement( 'button' );
	button.type = 'button';
	button.textContent = text;
	button.style.cssText = `min-height:38px;padding:8px 14px;border:1px solid #cbd5e1;border-radius:8px;background:${ background };color:${ color };font:600 14px system-ui,-apple-system,Segoe UI,Arial,sans-serif;cursor:pointer`;
	return button;
}
