/**
 * Media-properties dialog UI.
 * @license Apache-2.0
 */

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
		form.style.cssText = 'box-sizing:border-box;width:min(520px,calc(100vw - 32px));padding:20px;background:#fff;color:#222;border-radius:5px;box-shadow:0 10px 35px #0006;font:14px Arial,sans-serif';
		const heading = document.createElement( 'h2' );
		heading.id = headingId;
		heading.textContent = editor.t( 'Media properties' );
		heading.style.cssText = 'margin:0 0 16px;font-size:18px';
		form.appendChild( heading );
		const title = addField( form, editor.t( 'Title' ), media.getAttribute( 'mediaTitle' ) || '' );
		const aria = addField( form, editor.t( 'ARIA label' ), media.getAttribute( 'mediaAriaLabel' ) || '' );
		const dimensions = document.createElement( 'div' );
		dimensions.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:12px';
		const width = addField( dimensions, editor.t( 'Width (px or %)' ), media.getAttribute( 'mediaWidth' ) || '' );
		const height = addField( dimensions, editor.t( 'Height (px)' ), media.getAttribute( 'mediaHeight' ) || '' );
		form.appendChild( dimensions );
		const alignLabel = document.createElement( 'label' );
		alignLabel.textContent = editor.t( 'Alignment' );
		alignLabel.style.cssText = 'display:block;margin:12px 0 4px';
		const align = document.createElement( 'select' );
		align.style.cssText = 'box-sizing:border-box;width:100%;padding:8px';
		for ( const [ value, label ] of [ [ '', 'Default' ], [ 'left', 'Left' ], [ 'center', 'Center' ], [ 'right', 'Right' ] ] ) {
			const option = document.createElement( 'option' );
			option.value = value;
			option.textContent = editor.t( label );
			option.selected = value === ( media.getAttribute( 'mediaAlign' ) || '' );
			align.appendChild( option );
		}
		alignLabel.appendChild( align );
		form.appendChild( alignLabel );
		const actions = document.createElement( 'div' );
		actions.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;margin-top:18px';
		const reset = makeButton( editor.t( 'Default size' ), 'button' );
		const cancel = makeButton( editor.t( 'Cancel' ), 'button' );
		const save = makeButton( editor.t( 'Save' ), 'submit' );
		actions.append( reset, cancel, save );
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
			if ( event.key !== 'Escape' ) return;
			event.preventDefault();
			event.stopPropagation();
			finish( null );
		};
		reset.addEventListener( 'click', () => { width.value = ''; height.value = ''; } );
		cancel.addEventListener( 'click', () => finish( null ) );
		form.addEventListener( 'submit', event => {
			event.preventDefault();
			if ( !validDimension( width.value, true ) || !validDimension( height.value, false ) ) {
				window.alert( editor.t( 'Enter a positive number, optionally followed by px or %.' ) );
				return;
			}
			finish( {
				mediaTitle: title.value.trim(), mediaAriaLabel: aria.value.trim(),
				mediaWidth: normalizeDimension( width.value ), mediaHeight: normalizeDimension( height.value ),
				mediaAlign: align.value
			} );
		} );
		overlay.addEventListener( 'click', event => {
			if ( event.target === overlay ) finish( null );
		} );
		document.addEventListener( 'keydown', onKeydown, true );
		title.focus();
	} );
}

function addField( parent, labelText, value ) {
	const label = document.createElement( 'label' );
	label.textContent = labelText;
	label.style.cssText = 'display:block;margin:12px 0 4px';
	const input = document.createElement( 'input' );
	input.type = 'text'; input.value = value;
	input.style.cssText = 'box-sizing:border-box;width:100%;padding:8px;border:1px solid #888;border-radius:3px';
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

function normalizeDimension( value ) {
	const clean = value.trim().toLowerCase();
	return clean && !/(?:px|%)$/.test( clean ) ? `${ clean }px` : clean;
}

