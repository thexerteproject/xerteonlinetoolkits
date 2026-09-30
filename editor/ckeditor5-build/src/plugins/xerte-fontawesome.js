/**
 * Font Awesome inline widget and picker for Xerte's CKEditor 5 build.
 * @license Apache-2.0
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import { DomEventObserver } from '@ckeditor/ckeditor5-engine';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { Widget, toWidget } from '@ckeditor/ckeditor5-widget';
import fontAwesomeCatalogue from '../fontawesome-icons.json';

// Matches the white flag on a dark background used by Xerte's CKEditor 4 plugin.
const TOOLBAR_ICON = '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><rect x=".5" y=".5" width="15" height="15" rx="3" fill="#111"/><path d="M4 12.8V3.2c2.8-1.7 4.7 1.5 8-.2v6.4c-3.3 1.7-5.2-1.5-8 .2" fill="#fff"/><path d="M3.2 2.5h1.4v11H3.2z" fill="#fff"/></svg>';

const ICONS = fontAwesomeCatalogue.icons;

//Matches the way font-awesome was implemented with CKEditor 4 in that the full class name is exposed
function legacyClassLabel( classes ) {
	const iconName = classes.split( /\s+/ ).find( value => /^fa-/.test( value ) && !/^(fa-(solid|regular|brands|fw|spin|pulse))$/.test( value ) );
	return iconName ? 'fa ' + iconName : classes;
}

function iconAttributesFromView( viewElement ) {
	const classes = Array.from( viewElement.getClassNames() );
	return {
		iconClass: classes.join( ' ' ),
		iconTitle: viewElement.getAttribute( 'title' ) || '',
		iconStyle: viewElement.getAttribute( 'style' ) || ''
	};
}

function iconAttributesFromWrapper( viewElement ) {
	const icon = Array.from( viewElement.getChildren() ).find( child => child.is?.( 'element', 'i' ) );
	const attributes = icon ? iconAttributesFromView( icon ) : { iconClass: 'fas fa-star', iconTitle: '', iconStyle: '' };
	if ( !attributes.iconTitle ) {
		const description = Array.from( viewElement.getChildren() ).find( child => child.is?.( 'element', 'span' ) );
		attributes.iconTitle = description ? Array.from( description.getChildren() ).map( child => child.data || '' ).join( '' ) : '';
	}
	return attributes;
}

function viewAttributesFromModel( modelElement ) {
	const attributes = { class: modelElement.getAttribute( 'iconClass' ) || 'fas fa-star' };
	const title = modelElement.getAttribute( 'iconTitle' );
	const style = modelElement.getAttribute( 'iconStyle' );
	if ( title ) attributes.title = title;
	if ( style ) attributes.style = style;
	attributes['aria-hidden'] = title ? 'false' : 'true';
	return attributes;
}

function createIconView( modelElement, writer, editing = false, t = value => value ) {
	const iconAttributes = viewAttributesFromModel( modelElement );
	// The hidden text preserves the accessible output produced by Xerte's CKEditor 4 plugin.
	iconAttributes['aria-hidden'] = 'true';
	const title = modelElement.getAttribute( 'iconTitle' ) || '';
	const icon = writer.createEmptyElement( 'i', iconAttributes );
	const children = [ icon ];
	if ( title ) {
		children.push( writer.createContainerElement( 'span', {
			style: 'position:absolute; left:-10000px; top:auto; width:1px; height:1px; overflow:hidden;'
		}, [ writer.createText( title ) ] ) );
	}
	const wrapper = writer.createContainerElement( 'span', { class: 'fav2' }, children );
	return editing ? toWidget( wrapper, writer, { label: title || t( 'Font Awesome icon' ) } ) : wrapper;
}

function styleWithColour( style, colour ) {
	const declarations = String( style || '' ).split( ';' ).map( item => item.trim() ).filter( item => item && !/^color\s*:/i.test( item ) );
	if ( colour.toLowerCase() !== '#000000' ) declarations.push( 'color: ' + colour );
	return declarations.length ? declarations.join( '; ' ) + ';' : '';
}

function selectedIcon( editor ) {
	const selected = editor.model.document.selection.getSelectedElement();
	return selected && selected.is( 'element', 'fontAwesomeIcon' ) ? selected : null;
}

function input( type, value ) {
	const element = document.createElement( 'input' );
	element.type = type;
	element.value = value || '';
	element.style.cssText = 'width:100%;padding:7px;box-sizing:border-box;';
	return element;
}

function openPicker( initial, t ) {
	return new Promise( resolve => {
		const overlay = document.createElement( 'div' );
		overlay.className = 'xerte-fontawesome-overlay';
		overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483645;background:rgba(17,24,39,.48);display:flex;align-items:center;justify-content:center;padding:20px;';
		const dialog = document.createElement( 'div' );
		dialog.setAttribute( 'role', 'dialog' );
		dialog.setAttribute( 'aria-modal', 'true' );
		dialog.setAttribute( 'aria-label', t( 'Insert Font Awesome icon' ) );
		dialog.style.cssText = 'width:720px;max-width:94vw;max-height:90vh;overflow:auto;background:#fff;border-radius:8px;padding:18px;font:14px Segoe UI,Arial,sans-serif;box-shadow:0 12px 36px #0005;';
		const heading = document.createElement( 'h2' );
		heading.style.cssText = 'margin:0 0 12px;font-size:19px';
		heading.textContent = t( 'Font Awesome icon' );
		dialog.appendChild( heading );

		const search = input( 'search', '' );
		search.placeholder = t( 'Search icons' );
		search.setAttribute( 'aria-label', t( 'Search icons' ) );
		const grid = document.createElement( 'div' );
		grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(52px,1fr));gap:5px;height:280px;overflow:auto;margin:10px 0;border:1px solid #ddd;padding:8px;';
		let chosenClass = initial.iconClass || 'fas fa-star';

		const render = () => {
			const query = search.value.trim().toLowerCase();
			grid.replaceChildren();
			ICONS.filter( icon => !query || icon.search.includes( query ) || icon.classes.includes( query ) ).forEach( icon => {
				const button = document.createElement( 'button' );
				button.type = 'button';
				button.title = legacyClassLabel( icon.classes );
				button.setAttribute( 'aria-label', `${ icon.label } (${ button.title })` );
				button.style.cssText = 'height:44px;border:1px solid #ddd;background:#fff;cursor:pointer;font-size:20px;';
				if ( icon.classes === chosenClass ) button.style.outline = '3px solid #2563eb';
				const preview = document.createElement( 'i' );
				preview.className = icon.classes;
				button.appendChild( preview );
				button.addEventListener( 'click', () => { chosenClass = icon.classes; render(); } );
				grid.appendChild( button );
			} );
		};
		search.addEventListener( 'input', render );
		dialog.append( search, grid );

		const fields = document.createElement( 'div' );
		fields.style.cssText = 'display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:10px;';
		const title = input( 'text', initial.iconTitle );
		const colour = input( 'color', initial.colour || '#000000' );
		const size = document.createElement( 'select' );
		size.style.cssText = 'width:100%;padding:7px;';
		[ '', 'fa-xs', 'fa-sm', 'fa-lg', 'fa-2x', 'fa-3x', 'fa-4x', 'fa-5x', 'fa-10x' ].forEach( value => size.add( new Option( value || t( 'Normal' ), value ) ) );
		size.value = initial.size || '';
		const rotation = document.createElement( 'select' );
		rotation.style.cssText = 'width:100%;padding:7px;';
		[ '', 'fa-rotate-90', 'fa-rotate-180', 'fa-rotate-270' ].forEach( value => rotation.add( new Option( value ? value.replace( 'fa-rotate-', '' ) + '\u00b0' : t( 'Normal' ), value ) ) );
		rotation.value = initial.rotation || '';
		[ [ t( 'Description' ), title ], [ t( 'Colour' ), colour ], [ t( 'Size' ), size ], [ t( 'Rotation' ), rotation ] ].forEach( pair => {
			const label = document.createElement( 'label' );
			label.textContent = pair[ 0 ];
			label.style.fontWeight = '600';
			label.appendChild( pair[ 1 ] );
			fields.appendChild( label );
		} );
		dialog.appendChild( fields );

		const options = document.createElement( 'div' );
		options.style.cssText = 'display:flex;flex-wrap:wrap;gap:12px;margin-top:14px;';
		const checks = {};
		[ [ 'spin', t( 'Spin' ) ], [ 'pulse', t( 'Pulse' ) ], [ 'fw', t( 'Fixed width' ) ], [ 'border', t( 'Border' ) ], [ 'flip-horizontal', t( 'Flip horizontal' ) ], [ 'flip-vertical', t( 'Flip vertical' ) ] ].forEach( pair => {
			const label = document.createElement( 'label' );
			const checkbox = document.createElement( 'input' );
			checkbox.type = 'checkbox';
			checkbox.checked = ( initial.iconClass || '' ).includes( 'fa-' + pair[ 0 ] );
			checks[ pair[ 0 ] ] = checkbox;
			label.append( checkbox, ' ' + pair[ 1 ] );
			options.appendChild( label );
		} );
		dialog.appendChild( options );

		const actions = document.createElement( 'div' );
		actions.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;margin-top:18px;';
		const cleanup = result => { document.removeEventListener( 'keydown', keydown, true ); overlay.remove(); resolve( result ); };
		const keydown = event => { if ( event.key === 'Escape' ) cleanup( null ); };
		const cancel = document.createElement( 'button' );
		cancel.type = 'button'; cancel.textContent = t( 'Cancel' ); cancel.style.cssText = 'padding:8px 14px;';
		cancel.addEventListener( 'click', () => cleanup( null ) );
		const ok = document.createElement( 'button' );
		ok.type = 'button'; ok.textContent = initial.editing ? t( 'Update' ) : t( 'Insert' ); ok.style.cssText = 'padding:8px 14px;background:#2563eb;color:#fff;border:1px solid #2563eb;';
		ok.addEventListener( 'click', () => {
			let classes = chosenClass.split( /\s+/ ).filter( value => !/^fa-(xs|sm|lg|\d+x|spin|pulse|fw|border|flip-horizontal|flip-vertical|rotate-(?:90|180|270))$/.test( value ) );
			if ( size.value ) classes.push( size.value );
			if ( rotation.value ) classes.push( rotation.value );
			Object.keys( checks ).forEach( key => { if ( checks[ key ].checked ) classes.push( 'fa-' + key ); } );
			cleanup( { iconClass: classes.join( ' ' ), iconTitle: title.value.trim(), iconStyle: styleWithColour( initial.iconStyle, colour.value ) } );
		} );
		actions.append( cancel, ok );
		dialog.appendChild( actions );
		overlay.appendChild( dialog );
		document.body.appendChild( overlay );
		overlay.addEventListener( 'click', event => { if ( event.target === overlay ) cleanup( null ); } );
		document.addEventListener( 'keydown', keydown, true );
		render();
		search.focus();
	} );
}

class DoubleClickObserver extends DomEventObserver {
	domEventType = 'dblclick';
	onDomEvent( domEvent ) {
		this.fire( 'dblclick', domEvent );
	}
}

async function editFontAwesomeIcon( editor, existing = selectedIcon( editor ) ) {
	const currentClass = existing?.getAttribute( 'iconClass' ) || '';
	const style = existing?.getAttribute( 'iconStyle' ) || '';
	const result = await openPicker( {
		editing: !!existing,
		iconClass: currentClass,
		iconTitle: existing?.getAttribute( 'iconTitle' ) || '',
		iconStyle: style,
		colour: style.match( /color:\s*(#[0-9a-f]{6})/i )?.[ 1 ] || '#000000',
		size: currentClass.match( /\bfa-(?:xs|sm|lg|\d+x)\b/ )?.[ 0 ] || '',
		rotation: currentClass.match( /\bfa-rotate-(?:90|180|270)\b/ )?.[ 0 ] || ''
	}, editor.t );
	if ( !result ) return;
	editor.model.change( writer => {
		if ( existing ) {
			// The icon's classes, title and style live on children of the editing-view
			// wrapper. Replacing the object makes CKEditor run the element converters
			// again and keeps the data and editing views in sync. Preserve attributes
			// owned by other features, such as link and lightbox settings.
			const existingAttributes = Object.fromEntries( existing.getAttributes() );
			const replacement = writer.createElement( 'fontAwesomeIcon', {
				...existingAttributes,
				...result
			} );
			writer.insert( replacement, writer.createPositionBefore( existing ) );
			writer.remove( existing );
			writer.setSelection( replacement, 'on' );
		} else {
			editor.model.insertObject( writer.createElement( 'fontAwesomeIcon', result ), null, null, { setSelection: 'on' } );
		}
	} );
}

class XerteFontAwesomeEditing extends Plugin {
	static get requires() { return [ Widget ]; }
	init() {
		const editor = this.editor;
		editor.model.schema.register( 'fontAwesomeIcon', {
			isInline: true, isObject: true, allowWhere: '$text',
			allowAttributes: [ 'iconClass', 'iconTitle', 'iconStyle' ]
		} );
		editor.conversion.for( 'upcast' ).elementToElement( {
			view: { name: 'span', classes: 'fav2' },
			model: ( viewElement, { writer } ) => writer.createElement( 'fontAwesomeIcon', iconAttributesFromWrapper( viewElement ) )
		} );
		editor.conversion.for( 'upcast' ).elementToElement( {
			view: { name: 'i', classes: /^(fa|fas|far|fab|fa-)/ },
			model: ( viewElement, { writer } ) => writer.createElement( 'fontAwesomeIcon', iconAttributesFromView( viewElement ) )
		} );
		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'fontAwesomeIcon',
			view: ( modelElement, { writer } ) => createIconView( modelElement, writer )
		} );
		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'fontAwesomeIcon',
			view: ( modelElement, { writer } ) => createIconView( modelElement, writer, true, editor.t )
		} );
	}
}

class XerteFontAwesomeUI extends Plugin {
	init() {
		const editor = this.editor;
		editor.editing.view.addObserver( DoubleClickObserver );
		this.listenTo( editor.editing.view.document, 'dblclick', ( event, data ) => {
			const domTarget = data.domEvent.target;
			const wrapper = domTarget?.closest?.( 'span.fav2' );
			if ( !wrapper ) return;
			const viewElement = editor.editing.view.domConverter.domToView( wrapper );
			const modelElement = viewElement && editor.editing.mapper.toModelElement( viewElement );
			if ( !modelElement?.is( 'element', 'fontAwesomeIcon' ) ) return;
			data.preventDefault();
			editor.model.change( writer => writer.setSelection( modelElement, 'on' ) );
			editFontAwesomeIcon( editor, modelElement );
		} );
		editor.ui.componentFactory.add( 'fontAwesome', locale => {
			const button = new ButtonView( locale );
			button.set( { label: editor.t( 'Insert Font Awesome' ), icon: TOOLBAR_ICON, tooltip: true } );
			button.on( 'execute', () => editFontAwesomeIcon( editor ) );
			return button;
		} );
	}
}

export class XerteFontAwesome extends Plugin {
	static get requires() { return [ XerteFontAwesomeEditing, XerteFontAwesomeUI ]; }
	static get pluginName() { return 'XerteFontAwesome'; }
}
