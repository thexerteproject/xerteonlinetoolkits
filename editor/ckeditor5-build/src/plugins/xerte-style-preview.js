import { Plugin } from '@ckeditor/ckeditor5-core';
import '../xerte-style-preview.css';

// Keep the theme's appearance without importing its layout rules into the toolbar.
const previewProperties = [
	'background-color', 'color', 'direction', 'font-family', 'font-size', 'font-style', 'font-weight', 'letter-spacing',
	'text-decoration', 'text-shadow', 'text-transform', 'border-radius', 'box-shadow',
	'border-top', 'border-right', 'border-bottom', 'border-left', 'outline', 'padding', 'quotes'
];
const quoteMarkProperties = [ 'content', 'color', 'font', 'margin', 'vertical-align' ];
const bubbleTailProperties = [ 'content', 'position', 'inset', 'width', 'height', 'margin', 'border-width', 'border-style', 'border-color' ];
const visibleRows = panel => Array.from( panel.querySelectorAll( '.ck-style-grid__button:not([hidden])' ) );

function setupStyleList( view, rtl ) {
	const panel = view.element;
	view.focus = () => visibleRows( panel )[ 0 ]?.focus();
	view.focusLast = () => visibleRows( panel ).at( -1 )?.focus();
	panel.addEventListener( 'keydown', event => {
		if ( event.key === 'Tab' ) {
			// Let Tab leave the list instead of focusing a hidden group.
			event.stopPropagation();
			return;
		}
		if ( ![ 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight' ].includes( event.key ) ||
			event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ) return;
		const rows = visibleRows( panel );
		const index = rows.indexOf( event.target.closest( '.ck-style-grid__button' ) );
		if ( index === -1 ) return;
		const backwards = event.key === 'ArrowUp' || event.key === ( rtl ? 'ArrowRight' : 'ArrowLeft' );
		rows[ ( index + ( backwards ? -1 : 1 ) + rows.length ) % rows.length ].focus();
		event.preventDefault();
		event.stopPropagation();
	}, true );
}

function filterStyles( panel, editor, definitions ) {
	const command = editor.commands.get( 'style' );
	const inQuote = editor.commands.get( 'blockQuote' )?.value;
	const inBulletList = editor.commands.get( 'bulletedList' )?.value;
	for ( const row of panel.querySelectorAll( '.ck-style-grid__button' ) ) {
		const name = row.querySelector( '.ck-button__label' ).textContent;
		const definition = definitions.get( name );
		row.hidden = !command.enabledStyles.includes( name ) ||
			( definition?.existingOnly && !command.value.includes( name ) ) ||
			( definition?.wrap === 'blockQuote' && !inQuote ) ||
			( !!definition?.list && !inBulletList );
	}
	for ( const group of panel.querySelectorAll( '.ck-style-panel__style-group' ) ) {
		group.hidden = !visibleRows( group ).length;
	}
}

function updatePreviews( panel, editable, definitions ) {
	if ( !editable?.isConnected ) return;
	const doc = editable.ownerDocument;
	const view = doc.defaultView;
	const probe = doc.createElement( 'div' );
	probe.className = editable.className;
	probe.classList.remove( 'ck-hidden' );
	probe.setAttribute( 'aria-hidden', 'true' );
	probe.style.cssText = 'position:fixed!important;inset:0 auto auto 0;width:100%;height:0!important;min-height:0!important;overflow:hidden!important;visibility:hidden!important;';

	const previews = [];
	for ( const row of visibleRows( panel ) ) {
		const label = row.querySelector( '.ck-button__label' );
		const preview = row.querySelector( '.ck-style-grid__button__preview' );
		let sample = preview?.firstElementChild;
		if ( !label || !sample ) continue;
		const definition = definitions.get( label.textContent );
		// CKEditor 4 showed object styles as text labels, not empty IMG or TABLE tags.
		const objectStyle = definition?.models || definition?.list;
		if ( objectStyle && !sample.matches( 'span:not([class])' ) ) {
			sample = panel.ownerDocument.createElement( 'span' );
			preview.replaceChildren( sample );
		}
		const reference = doc.importNode( sample, false );
		reference.removeAttribute( 'style' );
		reference.textContent = label.textContent;
		if ( !objectStyle ) {
			for ( const [ name, value ] of Object.entries( definition?.attributes || {} ) ) reference.setAttribute( name, value );
			for ( const [ name, value ] of Object.entries( definition?.styles || {} ) ) reference.style.setProperty( name, value );
		}
		if ( reference.matches( 'span, q' ) ) {
			const paragraph = doc.createElement( 'p' );
			paragraph.append( reference );
			probe.append( paragraph );
		} else {
			probe.append( reference );
		}
		previews.push( { row, preview, sample, reference } );
	}

	if ( !previews.length ) return;
	editable.after( probe );
	try {
		// Use the editor canvas behind transparent samples so dark themes stay readable.
		let background = 'white';
		for ( let element = probe; element; element = element.parentElement ) {
			const color = view.getComputedStyle( element ).backgroundColor;
			if ( color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent' ) {
				background = color;
				break;
			}
		}
		const styles = previews.map( ( { reference } ) => {
			const computed = view.getComputedStyle( reference );
			const properties = previewProperties.map( property => [ property, computed.getPropertyValue( property ) ] );
			if ( reference.matches( 'blockquote, q' ) ) {
				properties.push( [ 'line-height', computed.lineHeight ], [ 'text-align', computed.textAlign ] );
				for ( const position of [ 'before', 'after' ] ) {
					const mark = view.getComputedStyle( reference, '::' + position );
					for ( const property of quoteMarkProperties ) {
						properties.push( [ '--xerte-quote-' + position + '-' + property, mark.getPropertyValue( property ) ] );
					}
				}
			} else if ( reference.matches( '[class*="speech-bubble"]' ) ) {
				const tail = view.getComputedStyle( reference, '::after' );
				properties.push(
					[ 'margin-left', computed.marginLeft ], [ 'margin-right', computed.marginRight ],
					[ 'margin-bottom', Math.max( 0, -parseFloat( tail.marginBottom ) || 0 ) + 'px' ]
				);
				for ( const property of bubbleTailProperties ) {
					properties.push( [ '--xerte-tail-' + property, tail.getPropertyValue( property ) ] );
				}
			}
			return properties;
		} );
		previews.forEach( ( { row, preview, sample, reference }, index ) => {
			preview.style.setProperty( '--xerte-style-canvas', background );
			sample.textContent = reference.textContent;
			for ( const [ property, value ] of styles[ index ] ) sample.style.setProperty( property, value );
			row.classList.add( 'xerte-style-name-preview' );
		} );
	} finally {
		probe.remove();
	}
}

export class XerteStylePreview extends Plugin {
	static get pluginName() { return 'XerteStylePreview'; }

	init() {
		const { editor } = this;
		this.listenTo( editor, 'ready', () => {
			const dropdown = editor.ui.view.toolbar?.items.find( item => /\bck-style-dropdown\b/.test( item.class ) );
			if ( !dropdown ) return;
			const definitions = new Map( ( editor.config.get( 'style.definitions' ) || [] ).map( style => [ style.name, style ] ) );
			const refresh = () => {
				if ( !dropdown.isOpen ) return;
				const panel = dropdown.panelView.children.first;
				filterStyles( panel.element, editor, definitions );
				updatePreviews( panel.element, editor.ui.getEditableElement(), definitions );
			};
			// CKEditor creates the panel on first open. Set up and filter the list before its low-priority focus handler runs.
			dropdown.once( 'change:isOpen', () => {
				setupStyleList( dropdown.panelView.children.first, editor.locale.uiLanguageDirection === 'rtl' );
			} );
			this.listenTo( dropdown, 'change:isOpen', refresh );
			if ( editor.plugins.has( 'XerteIframeEditing' ) ) {
				this.listenTo( editor.plugins.get( 'XerteIframeEditing' ), 'stylesheetsChanged', refresh );
			}
		} );
	}
}
