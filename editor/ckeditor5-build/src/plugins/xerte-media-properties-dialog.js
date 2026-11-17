/**
 * Media-properties dialog UI.
 * @license Apache-2.0
 */
import { displayDimension, normalizeDimension } from './xerte-image-dimensions.js';

let dialogSequence = 0;

export function showMediaPropertiesDialog( editor, media ) {
	return new Promise( resolve => {
		const previouslyFocused = document.activeElement;
		const overlay = document.createElement( 'div' );
		overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#0008;display:flex;align-items:center;justify-content:center';
		const form = document.createElement( 'form' );
		const headingId = `xerte-media-properties-heading-${ ++dialogSequence }`;
		form.setAttribute( 'role', 'dialog' );
		form.setAttribute( 'aria-modal', 'true' );
		form.setAttribute( 'aria-labelledby', headingId );
		form.style.cssText = 'box-sizing:border-box;width:min(520px,calc(100vw - 24px));max-height:calc(100vh - 24px);overflow:auto;background:#fff;color:#222;border-radius:3px;box-shadow:0 10px 35px #0006;font:14px Arial,sans-serif';
		const heading = document.createElement( 'h2' );
		heading.id = headingId;
		heading.textContent = editor.t( media ? 'Media properties' : 'Insert media' );
		heading.style.cssText = 'margin:0;padding:12px 14px;border-bottom:1px solid #ccc;font-size:16px';
		form.appendChild( heading );
		const body = document.createElement( 'div' ); body.style.cssText = 'padding:14px';
		form.appendChild( body );
		media = media || { getAttribute: () => '' };
		const url = addField( body, editor.t( 'URL' ), media.getAttribute( 'url' ) || '' );
		url.required = true;
		const title = addField( body, editor.t( 'Title' ), media.getAttribute( 'mediaTitle' ) || '' );
		const aria = addField( body, editor.t( 'ARIA label' ), media.getAttribute( 'mediaAriaLabel' ) || '' );
		const dimensions = document.createElement( 'div' );
		dimensions.style.cssText = 'display:flex;gap:12px;align-items:end;margin-top:12px;flex-wrap:wrap';
		const width = addField( dimensions, editor.t( 'Width' ), displayDimension( media.getAttribute( 'mediaWidth' ) ), '90px' );
		const height = addField( dimensions, editor.t( 'Height' ), displayDimension( media.getAttribute( 'mediaHeight' ) ), '90px' );
		width.placeholder = 'px / %'; height.placeholder = 'px';
		const reset = makeButton( '↻', 'button' );
		reset.title = editor.t( 'Reset size' ); reset.setAttribute( 'aria-label', editor.t( 'Reset size' ) );
		dimensions.appendChild( reset ); body.appendChild( dimensions );
		const help = document.createElement( 'div' );
		help.textContent = editor.t( 'Width: pixels or % (e.g. 640 or 75%). Leave height blank to keep the original proportions.' );
		help.style.cssText = 'margin-top:8px;color:#555;font-size:12px'; body.appendChild( help );
		const align = document.createElement( 'fieldset' );
		align.style.cssText = 'border:0;padding:0;margin:14px 0 0';
		const legend = document.createElement( 'legend' ); legend.textContent = editor.t( 'Alignment' ); align.appendChild( legend );
		for ( const [ value, label ] of [ [ '', 'None' ], [ 'left', 'Align Left' ], [ 'center', 'Align Center' ], [ 'right', 'Align Right' ] ] ) {
			const choice = document.createElement( 'label' ); choice.style.cssText = 'display:inline-flex;gap:4px;align-items:center;margin:6px 12px 0 0';
			const radio = document.createElement( 'input' ); radio.type = 'radio'; radio.name = 'xerte-media-alignment'; radio.value = value;
			radio.checked = value === ( media.getAttribute( 'mediaAlign' ) || '' );
			choice.append( radio, document.createTextNode( editor.t( label ) ) ); align.appendChild( choice );
		}
		body.appendChild( align );
		const actions = document.createElement( 'div' );
		actions.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;padding:10px 14px;border-top:1px solid #ccc;background:#f7f7f7';
		const cancel = makeButton( editor.t( 'Cancel' ), 'button' );
		const save = makeButton( editor.t( 'OK' ), 'submit' );
		save.style.cssText = 'background:#07883d;color:#fff;border:0;padding:7px 18px;font-weight:bold';
		actions.append( save, cancel );
		form.appendChild( actions );
		overlay.appendChild( form );
		document.body.appendChild( overlay );

		let finished = false;
		const finish = value => {
			if ( finished ) return;
			finished = true;
			document.removeEventListener( 'keydown', onKeydown, true );
			overlay.remove();
			if ( previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected ) previouslyFocused.focus();
			resolve( value );
		};
		const onKeydown = event => {
			if ( event.key === 'Tab' ) {
				const controls = Array.from( form.querySelectorAll( 'input:not([type=radio]), input[type=radio]:checked, select, button' ) );
				const first = controls[ 0 ], last = controls[ controls.length - 1 ];
				if ( event.shiftKey && document.activeElement === first ) {
					event.preventDefault(); last.focus();
				} else if ( !event.shiftKey && document.activeElement === last ) {
					event.preventDefault(); first.focus();
				}
			}
			if ( event.key !== 'Escape' ) return;
			event.preventDefault();
			event.stopPropagation();
			finish( null );
		};
		reset.addEventListener( 'click', () => { width.value = ''; height.value = ''; } );
		cancel.addEventListener( 'click', () => finish( null ) );
		form.addEventListener( 'submit', event => {
			event.preventDefault();
			if ( !editor.plugins.get( 'MediaEmbedEditing' ).registry.hasMedia( url.value.trim() ) ) {
				url.setCustomValidity( editor.t( 'This media URL is not supported.' ) );
				url.reportValidity();
				return;
			}
			if ( !validDimension( width.value, true ) || !validDimension( height.value, false ) ) {
				window.alert( editor.t( 'Enter a positive number, optionally followed by px or %.' ) );
				return;
			}
			finish( {
				url: url.value.trim(),
				mediaTitle: title.value.trim(), mediaAriaLabel: aria.value.trim(),
				mediaWidth: normalizeDimension( width.value ), mediaHeight: normalizeDimension( height.value ),
				mediaAlign: form.elements[ 'xerte-media-alignment' ].value
			} );
		} );
		overlay.addEventListener( 'click', event => {
			if ( event.target === overlay ) finish( null );
		} );
		document.addEventListener( 'keydown', onKeydown, true );
		url.addEventListener( 'input', () => url.setCustomValidity( '' ) );
		url.focus();
	} );
}

function addField( parent, labelText, value, width = 'auto' ) {
	const label = document.createElement( 'label' );
	label.textContent = labelText;
	label.style.cssText = `display:block;width:${ width };margin-top:10px`;
	const input = document.createElement( 'input' );
	input.type = 'text'; input.value = value;
	input.style.cssText = 'box-sizing:border-box;width:100%;height:34px;padding:6px;border:1px solid #aaa';
	label.appendChild( input ); parent.appendChild( label );
	return input;
}

function makeButton( text, type ) {
	const button = document.createElement( 'button' );
	button.type = type; button.textContent = text;
	return button;
}

function validDimension( value, allowPercent ) {
	return !value.trim() || new RegExp( `^(?:[1-9]\\d*(?:\\.\\d+)?)(?:px${ allowPercent ? '|%' : '' })?$`, 'i' ).test( value.trim() );
}

