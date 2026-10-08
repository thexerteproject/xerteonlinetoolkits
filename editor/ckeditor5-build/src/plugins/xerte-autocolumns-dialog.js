/**
 * Autocolumns dialog (legacy xotcolumns behaviour).
 * @license Apache-2.0
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { Widget, toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget';
import AutocolumnsIcon from '../icons/autocolumns.svg';

const DEFAULT_SETTINGS = {
	columns: 2,
	columnSpacing: 1,
	spacingUnits: 'em',
	rulerStyle: 'none',
	rulerThickness: 1,
	rulerColour: '#000000'
};

function parseAutocolumnsSettings( element ) {
	const settings = { ...DEFAULT_SETTINGS };
	if ( !element ) {
		return settings;
	}
	if ( element.is?.( 'element', 'xerteAutocolumns' ) ) {
		return { ...settings, ...element.getAttribute( 'autocolumnsSettings' ) };
	}
	const attributes = element.getAttribute( 'htmlDivAttributes' ) || {};
	const classes = attributes.classes || [];
	for ( let i = 1; i <= 5; i++ ) {
		if ( classes.includes( 'autocolumns' + i ) ) {
			settings.columns = i;
			break;
		}
	}
	const styles = attributes.styles || {};
	const gapMatch = ( styles[ 'column-gap' ] || '' ).match( /([\d.]+)(em|px)/i );
	if ( gapMatch ) {
		settings.columnSpacing = parseFloat( gapMatch[ 1 ] );
		settings.spacingUnits = gapMatch[ 2 ];
	}
	const ruleMatch = ( styles[ 'column-rule' ] || '' ).match( /([\d.]+)px\s+(\w+)\s+(#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|\w+)/i );
	if ( ruleMatch ) {
		settings.rulerThickness = parseFloat( ruleMatch[ 1 ] );
		settings.rulerStyle = ruleMatch[ 2 ];
		settings.rulerColour = ruleMatch[ 3 ];
	}
	return settings;
}

function autocolumnsAttributes( settings, previous = {} ) {
	return {
		...previous,
		classes: [ ...( previous.classes || [] ).filter( name => name !== 'autocolumns' && !/^autocolumns[1-5]$/.test( name ) ),
			'autocolumns', `autocolumns${ settings.columns }` ],
		styles: {
			...( previous.styles || {} ),
			'column-count': String( settings.columns ),
			'column-rule': `${ settings.rulerThickness }px ${ settings.rulerStyle } ${ settings.rulerColour }`,
			'column-gap': `${ settings.columnSpacing }${ settings.spacingUnits }`
		}
	};
}

function settingsFromView( viewElement ) {
	const classes = Array.from( viewElement.getClassNames() );
	const rule = viewElement.getStyle( 'column-rule' ) || [
		viewElement.getStyle( 'column-rule-width' ),
		viewElement.getStyle( 'column-rule-style' ),
		viewElement.getStyle( 'column-rule-color' )
	].filter( Boolean ).join( ' ' );
	const styles = {
		'column-gap': viewElement.getStyle( 'column-gap' ) || '',
		'column-rule': rule
	};
	return parseAutocolumnsSettings( {
		getAttribute: () => ( { classes, styles } )
	} );
}

function viewAttributes( settings ) {
	return {
		class: `autocolumns autocolumns${ settings.columns }`,
		style: `column-count: ${ settings.columns };` +
			`column-rule: ${ settings.rulerThickness }px ${ settings.rulerStyle } ${ settings.rulerColour };` +
			`column-gap: ${ settings.columnSpacing }${ settings.spacingUnits };`
	};
}

export class XerteAutocolumns extends Plugin {
	static get pluginName() {
		return 'XerteAutocolumns';
	}
	static get requires() {
		return [ Widget ];
	}

	init() {
		const editor = this.editor;
		editor.ui.componentFactory.add( 'autocolumns', locale => {
			const button = new ButtonView( locale );
			button.set( { label: editor.t( 'Autocolumns' ), icon: AutocolumnsIcon, tooltip: true } );
			button.on( 'execute', () => {
				runAutocolumnsDialog( editor ).catch( error => console.error( '[XerteAutocolumns]', error ) );
			} );
			return button;
		} );
		editor.model.schema.register( 'xerteAutocolumns', {
			inheritAllFrom: '$container',
			isBlock: true,
			isObject: true,
			allowAttributes: 'autocolumnsSettings'
		} );
		editor.conversion.for( 'upcast' ).elementToElement( {
			view: { name: 'div', classes: 'autocolumns' },
			model: ( viewElement, { writer } ) => writer.createElement( 'xerteAutocolumns', {
				autocolumnsSettings: settingsFromView( viewElement )
			} ),
			converterPriority: 'high'
		} );
		editor.conversion.for( 'editingDowncast' ).elementToStructure( {
			model: 'xerteAutocolumns',
			view: ( modelElement, { writer } ) => {
				const outer = writer.createContainerElement( 'div', { class: 'autocolumns-widget' } );
				const inner = writer.createEditableElement( 'div',
					viewAttributes( modelElement.getAttribute( 'autocolumnsSettings' ) || DEFAULT_SETTINGS ) );
				writer.insert( writer.createPositionAt( inner, 0 ), writer.createSlot() );
				writer.insert( writer.createPositionAt( outer, 0 ),
					toWidgetEditable( inner, writer, { label: editor.t( 'Autocolumns content' ) } ) );
				return toWidget( outer, writer, { label: editor.t( 'Autocolumns' ), hasSelectionHandle: true } );
			}
		} );
		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'xerteAutocolumns',
			view: ( modelElement, { writer } ) => writer.createContainerElement( 'div',
				viewAttributes( modelElement.getAttribute( 'autocolumnsSettings' ) || DEFAULT_SETTINGS ) )
		} );
		for ( const pipeline of [ 'editingDowncast', 'dataDowncast' ] ) {
			editor.conversion.for( pipeline ).add( dispatcher => {
				dispatcher.on( 'attribute:autocolumnsSettings:xerteAutocolumns', ( evt, data, api ) => {
					const mapped = api.mapper.toViewElement( data.item );
					const viewElement = pipeline === 'editingDowncast'
						? Array.from( mapped?.getChildren() || [] ).find( child => child.is( 'editableElement' ) )
						: mapped;
					if ( !viewElement ) {
						return;
					}
					const attributes = viewAttributes( data.attributeNewValue || DEFAULT_SETTINGS );
					if ( pipeline === 'editingDowncast' ) {
						const oldClasses = Array.from( viewElement.getClassNames() ).filter( name =>
							name === 'autocolumns' || /^autocolumns[1-5]$/.test( name ) );
						if ( oldClasses.length ) {
							api.writer.removeClass( oldClasses, viewElement );
						}
						api.writer.addClass( attributes.class.split( ' ' ), viewElement );
					} else {
						api.writer.setAttribute( 'class', attributes.class, viewElement );
					}
					api.writer.setAttribute( 'style', attributes.style, viewElement );
				} );
			} );
		}
	}
}

function findAutocolumnsElement( selection ) {
	let element = selection.getFirstPosition() && selection.getFirstPosition().parent;
	const selected = selection.getSelectedElement();
	if ( selected ) {
		element = selected;
	}
	while ( element && !element.is( 'rootElement' ) ) {
		if ( element.is( 'element', 'xerteAutocolumns' ) ||
			( element.is( 'element', 'htmlDiv' ) &&
				( element.getAttribute( 'htmlDivAttributes' )?.classes || [] ).includes( 'autocolumns' ) ) ) {
			return element;
		}
		element = element.parent;
	}
	return null;
}

function chooseAutocolumnsFromModal( initialSettings, canRemove, t ) {
	return new Promise( resolve => {
		const settings = { ...DEFAULT_SETTINGS, ...initialSettings };

		const overlay = document.createElement( 'div' );
		overlay.style.cssText = 'position:fixed;inset:0;background:rgba(17,24,39,0.45);z-index:2147483645;display:flex;align-items:center;justify-content:center;padding:20px;';

		const modal = document.createElement( 'div' );
		modal.setAttribute( 'role', 'dialog' );
		modal.style.cssText = 'background:#fff;border:1px solid #e5e7eb;border-radius:12px;width:480px;max-width:92vw;padding:18px;font-family:Segoe UI,Arial,sans-serif;';

		const title = document.createElement( 'div' );
		title.textContent = t( 'Autocolumn Settings' );
		title.style.cssText = 'font-weight:700;font-size:17px;margin-bottom:14px;';
		modal.appendChild( title );

		function addField( labelText, inputEl ) {
			const wrap = document.createElement( 'div' );
			wrap.style.marginBottom = '12px';
			const label = document.createElement( 'label' );
			label.textContent = labelText;
			label.style.cssText = 'display:block;margin-bottom:6px;font-size:13px;font-weight:600;';
			wrap.appendChild( label );
			wrap.appendChild( inputEl );
			modal.appendChild( wrap );
		}

		const columnsInput = document.createElement( 'input' );
		columnsInput.type = 'number';
		columnsInput.min = '1';
		columnsInput.max = '5';
		columnsInput.value = String( settings.columns );
		columnsInput.style.cssText = 'width:100%;padding:8px;box-sizing:border-box;';
		addField( t( 'Number of columns' ), columnsInput );

		const spacingInput = document.createElement( 'input' );
		spacingInput.type = 'number';
		spacingInput.min = '0';
		spacingInput.step = '0.1';
		spacingInput.value = String( settings.columnSpacing );
		spacingInput.style.cssText = 'width:100%;padding:8px;box-sizing:border-box;';
		addField( t( 'Spacing between columns' ), spacingInput );

		const rulerStyle = document.createElement( 'select' );
		rulerStyle.style.cssText = 'width:100%;padding:8px;box-sizing:border-box;';
		[ 'none', 'solid', 'double', 'dotted', 'dashed' ].forEach( style => {
			const opt = document.createElement( 'option' );
			opt.value = style;
			opt.textContent = t( style );
			rulerStyle.appendChild( opt );
		} );
		rulerStyle.value = settings.rulerStyle;
		addField( t( 'Line style' ), rulerStyle );

		const thicknessInput = document.createElement( 'input' );
		thicknessInput.type = 'number';
		thicknessInput.min = '0';
		thicknessInput.value = String( settings.rulerThickness );
		thicknessInput.style.cssText = 'width:100%;padding:8px;box-sizing:border-box;';
		addField( t( 'Line thickness (px)' ), thicknessInput );

		const colourInput = document.createElement( 'input' );
		colourInput.type = 'color';
		colourInput.value = settings.rulerColour.startsWith( '#' ) ? settings.rulerColour : '#000000';
		colourInput.style.cssText = 'width:100%;height:40px;padding:4px;box-sizing:border-box;';
		addField( t( 'Line colour' ), colourInput );

		const buttonRow = document.createElement( 'div' );
		buttonRow.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;margin-top:16px;';

		const cleanup = result => {
			document.removeEventListener( 'keydown', onKeyDown, true );
			if ( overlay.parentNode ) {
				overlay.parentNode.removeChild( overlay );
			}
			resolve( result );
		};

		if ( canRemove ) {
			const removeBtn = document.createElement( 'button' );
			removeBtn.type = 'button';
			removeBtn.textContent = t( 'Remove' );
			removeBtn.style.cssText = 'padding:9px 14px;margin-right:auto;border:1px solid #dc2626;background:#fff;color:#dc2626;cursor:pointer;';
			removeBtn.addEventListener( 'click', () => cleanup( { remove: true } ) );
			buttonRow.appendChild( removeBtn );
		}

		const cancelBtn = document.createElement( 'button' );
		cancelBtn.type = 'button';
		cancelBtn.textContent = t( 'Cancel' );
		cancelBtn.style.cssText = 'padding:9px 14px;border:1px solid #d1d5db;background:#fff;cursor:pointer;';

		const okBtn = document.createElement( 'button' );
		okBtn.type = 'button';
		okBtn.textContent = t( 'OK' );
		okBtn.style.cssText = 'padding:9px 14px;border:1px solid #2563eb;background:#2563eb;color:#fff;cursor:pointer;';

		const onKeyDown = event => {
			if ( event.key === 'Escape' ) {
				cleanup( null );
			}
		};

		cancelBtn.addEventListener( 'click', () => cleanup( null ) );
		okBtn.addEventListener( 'click', () => {
			cleanup( {
				columns: Math.min( 5, Math.max( 1, parseInt( columnsInput.value, 10 ) || 2 ) ),
				columnSpacing: parseFloat( spacingInput.value ) || 1,
				spacingUnits: 'em',
				rulerStyle: rulerStyle.value,
				rulerThickness: parseFloat( thicknessInput.value ) || 0,
				rulerColour: colourInput.value.toUpperCase()
			} );
		} );

		buttonRow.appendChild( cancelBtn );
		buttonRow.appendChild( okBtn );
		modal.appendChild( buttonRow );
		overlay.appendChild( modal );
		document.body.appendChild( overlay );
		overlay.addEventListener( 'click', e => { if ( e.target === overlay ) cleanup( null ); } );
		document.addEventListener( 'keydown', onKeyDown, true );
		columnsInput.focus();
	} );
}

export async function runAutocolumnsDialog( editor ) {
	const selection = editor.model.document.selection;
	const savedRange = selection.getFirstRange()?.clone();
	const existing = findAutocolumnsElement( selection );
	const initialSettings = existing ? parseAutocolumnsSettings( existing ) : DEFAULT_SETTINGS;
	const result = await chooseAutocolumnsFromModal( initialSettings, !!existing, editor.t );
	if ( !result ) {
		return;
	}

	if ( existing ) {
		editor.model.change( writer => {
			if ( !existing.parent ) {
				return;
			}
			if ( result.remove ) {
				const position = writer.createPositionBefore( existing );
				const children = Array.from( existing.getChildren() );
				writer.move( writer.createRangeIn( existing ), position );
				writer.remove( existing );
				if ( children.length ) {
					writer.setSelection( children[ 0 ], editor.model.schema.isObject( children[ 0 ] ) ? 'on' : 'in' );
				} else {
					writer.setSelection( position );
				}
			} else {
				if ( existing.is( 'element', 'xerteAutocolumns' ) ) {
					writer.setAttribute( 'autocolumnsSettings', result, existing );
				} else {
					writer.setAttribute( 'htmlDivAttributes',
						autocolumnsAttributes( result, existing.getAttribute( 'htmlDivAttributes' ) ), existing );
				}
				if ( savedRange ) {
					writer.setSelection( savedRange );
				}
			}
		} );
		editor.editing.view.focus();
		return;
	}

	editor.model.change( writer => {
		if ( savedRange ) {
			writer.setSelection( savedRange );
		}
		if ( savedRange?.isCollapsed ) {
			const block = editor.model.document.selection.getFirstPosition()?.parent;
			if ( block?.is( 'element' ) && editor.model.schema.isBlock( block ) &&
				editor.model.schema.checkChild( block.parent, 'xerteAutocolumns' ) ) {
				writer.setSelection( writer.createRangeOn( block ) );
			}
		}
		const content = editor.model.getSelectedContent( editor.model.document.selection );
		const wrapper = writer.createElement( 'xerteAutocolumns', {
			autocolumnsSettings: result
		} );
		if ( content.childCount ) {
			if ( Array.from( content.getChildren() ).every( child => child.is( '$text' ) ) ) {
				const paragraph = writer.createElement( 'paragraph' );
				writer.insert( content, paragraph );
				writer.insert( paragraph, wrapper );
			} else {
				writer.insert( content, wrapper );
			}
		} else {
			writer.insert( writer.createElement( 'paragraph' ), wrapper );
		}
		editor.model.insertContent( wrapper, editor.model.document.selection );
	} );
	editor.editing.view.focus();
}
