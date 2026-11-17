/**
 * Image properties form and browser-only state.
 * @license Apache-2.0
 */
import { normalizeDimension, proportionalDimension } from './xerte-image-dimensions.js';

export function showImagePropertiesDialog( editor, initial, browseImage ) {
	return new Promise( resolve => {
		const previouslyFocused = document.activeElement;
		const overlay = document.createElement( 'div' );
		overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#0008;display:flex;align-items:center;justify-content:center';
		const dialog = document.createElement( 'form' );
		const headingId = `xerte-image-properties-${ Date.now() }`;
		dialog.setAttribute( 'role', 'dialog' );
		dialog.setAttribute( 'aria-modal', 'true' );
		dialog.setAttribute( 'aria-labelledby', headingId );
		dialog.style.cssText = 'box-sizing:border-box;width:min(520px,calc(100vw - 24px));background:#fff;color:#222;border-radius:3px;box-shadow:0 10px 35px #0006;font:14px Arial,sans-serif;overflow:hidden';
		const heading = document.createElement( 'h2' );
		heading.id = headingId;
		heading.textContent = editor.t( 'Image Properties' );
		heading.style.cssText = 'margin:0;padding:12px 14px;border-bottom:1px solid #ccc;font-size:16px';
		const body = document.createElement( 'div' ); body.style.cssText = 'padding:14px';
		const urlRow = document.createElement( 'div' ); urlRow.style.cssText = 'display:grid;grid-template-columns:1fr auto;gap:10px;align-items:end';
		const url = labeledInput( urlRow, editor.t( 'URL' ), initial.url );
		const browse = document.createElement( 'button' ); browse.type = 'button'; browse.textContent = editor.t( 'Browse Server' ); browse.style.cssText = 'height:34px';
		urlRow.appendChild( browse ); body.appendChild( urlRow );
		const alt = labeledInput( body, editor.t( 'Alternative Text' ), initial.alt );
		const sizeRow = document.createElement( 'div' ); sizeRow.style.cssText = 'display:flex;gap:12px;align-items:end;margin-top:12px';
		const width = labeledInput( sizeRow, editor.t( 'Width' ), initial.width, '80px' );
		const height = labeledInput( sizeRow, editor.t( 'Height' ), initial.height, '80px' );
		let ratioLocked = true;
		let naturalWidth = initial.naturalWidth || 0;
		let naturalHeight = initial.naturalHeight || 0;
		let dimensionSource = initial.url;
		let dimensionRequest = 0;
		let resetToOriginal = false;
		const lock = document.createElement( 'button' ); lock.type = 'button'; lock.textContent = '🔒'; lock.title = editor.t( 'Lock ratio' ); lock.setAttribute( 'aria-pressed', 'true' );
		const reset = document.createElement( 'button' ); reset.type = 'button'; reset.textContent = '↻'; reset.title = editor.t( 'Reset size' );
		sizeRow.append( lock, reset ); body.appendChild( sizeRow );
		const alignment = document.createElement( 'fieldset' ); alignment.style.cssText = 'border:0;padding:0;margin:14px 0 0';
		const legend = document.createElement( 'legend' ); legend.textContent = editor.t( 'Alignment' ); alignment.appendChild( legend );
		for ( const [ value, label ] of [ [ 'none', 'None' ], [ 'left', 'Align Left' ], [ 'center', 'Align Center' ], [ 'right', 'Align Right' ] ] ) {
			const choice = document.createElement( 'label' ); choice.style.cssText = 'display:inline-flex;gap:4px;align-items:center;margin:6px 12px 0 0';
			const radio = document.createElement( 'input' ); radio.type = 'radio'; radio.name = 'xerte-image-alignment'; radio.value = value; radio.checked = initial.alignment === value;
			choice.append( radio, document.createTextNode( editor.t( label ) ) ); alignment.appendChild( choice );
		}
		body.appendChild( alignment );
		const captionLabel = document.createElement( 'label' ); captionLabel.style.cssText = 'display:flex;gap:6px;align-items:center;margin-top:12px';
		const captioned = document.createElement( 'input' ); captioned.type = 'checkbox'; captioned.checked = initial.captioned;
		captionLabel.append( captioned, document.createTextNode( editor.t( 'Captioned image' ) ) ); body.appendChild( captionLabel );
		const actions = document.createElement( 'div' );
		actions.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;padding:10px 14px;border-top:1px solid #ccc;background:#f7f7f7';
		const cancel = document.createElement( 'button' ); cancel.type = 'button'; cancel.textContent = editor.t( 'Cancel' );
		const ok = document.createElement( 'button' ); ok.type = 'submit'; ok.textContent = editor.t( 'OK' ); ok.style.cssText = 'background:#07883d;color:#fff;border:0;padding:7px 18px;font-weight:bold';
		actions.append( ok, cancel ); dialog.append( heading, body, actions ); overlay.appendChild( dialog ); document.body.appendChild( overlay );

		const loadDimensions = async ( source, replaceFields = true ) => {
			const request = ++dimensionRequest;
			const dimensions = await loadImageDimensions( source );
			if ( request !== dimensionRequest || source !== url.value.trim() || !dimensions ) return null;
			naturalWidth = dimensions.width; naturalHeight = dimensions.height;
			dimensionSource = source;
			if ( replaceFields ) { width.value = dimensions.width; height.value = dimensions.height; }
			return dimensions;
		};
		if ( initial.url ) loadDimensions( initial.url, !initial.width && !initial.height );
		browse.addEventListener( 'click', async () => {
			const chosen = await browseImage();
			if ( chosen ) { resetToOriginal = false; url.value = chosen; await loadDimensions( chosen ); alt.focus(); }
		} );
		url.addEventListener( 'change', () => { resetToOriginal = false; loadDimensions( url.value.trim() ); } );
		lock.addEventListener( 'click', () => {
			ratioLocked = !ratioLocked; lock.textContent = ratioLocked ? '🔒' : '🔓'; lock.setAttribute( 'aria-pressed', String( ratioLocked ) );
		} );
		width.addEventListener( 'input', () => { resetToOriginal = false; syncRatioField( width, height, naturalWidth, naturalHeight, ratioLocked ); } );
		height.addEventListener( 'input', () => { resetToOriginal = false; syncRatioField( height, width, naturalHeight, naturalWidth, ratioLocked ); } );
		reset.addEventListener( 'click', async () => { if ( await loadDimensions( url.value.trim() ) ) resetToOriginal = true; } );

		let finished = false;
		const finish = value => {
			if ( finished ) return;
			finished = true;
			document.removeEventListener( 'keydown', onKeydown, true );
			overlay.remove();
			previouslyFocused?.focus?.();
			resolve( value );
		};
		const onKeydown = event => {
			if ( event.key === 'Escape' ) { event.preventDefault(); event.stopPropagation(); finish( null ); }
		};
		dialog.addEventListener( 'submit', event => {
			event.preventDefault();
			const source = url.value.trim();
			if ( !source ) { url.focus(); return; }
			const widthValue = resetToOriginal ? null : normalizeDimension( width.value );
			const heightValue = resetToOriginal ? null : normalizeDimension( height.value );
			if ( !resetToOriginal && width.value && !widthValue ) { width.focus(); return; }
			if ( !resetToOriginal && height.value && !heightValue ) { height.focus(); return; }
			finish( {
				url: source, alt: alt.value.trim(), width: widthValue, height: heightValue,
				alignment: dialog.elements[ 'xerte-image-alignment' ].value,
				captioned: captioned.checked,
				naturalWidth: dimensionSource === source ? naturalWidth : 0,
				naturalHeight: dimensionSource === source ? naturalHeight : 0,
				sourceChanged: source !== initial.url
			} );
		} );
		cancel.addEventListener( 'click', () => finish( null ) );
		overlay.addEventListener( 'click', event => { if ( event.target === overlay ) finish( null ); } );
		document.addEventListener( 'keydown', onKeydown, true );
		url.focus();
	} );
}

function labeledInput( parent, text, value, width = 'auto' ) {
	const label = document.createElement( 'label' ); label.textContent = text; label.style.cssText = `display:block;width:${ width };margin-top:10px`;
	const input = document.createElement( 'input' ); input.type = 'text'; input.value = value || ''; input.style.cssText = 'box-sizing:border-box;width:100%;height:34px;padding:6px;border:1px solid #aaa';
	label.appendChild( input ); parent.appendChild( label ); return input;
}

function loadImageDimensions( url ) {
	return new Promise( resolve => {
		if ( !url ) { resolve( null ); return; }
		const image = new Image();
		image.onload = () => resolve( { width: image.naturalWidth, height: image.naturalHeight } );
		image.onerror = () => resolve( null ); image.src = url;
	} );
}

function syncRatioField( source, target, sourceNatural, targetNatural, locked ) {
	if ( !locked ) return;
	const proportional = proportionalDimension( source.value, sourceNatural, targetNatural );
	if ( proportional ) target.value = proportional;
}

