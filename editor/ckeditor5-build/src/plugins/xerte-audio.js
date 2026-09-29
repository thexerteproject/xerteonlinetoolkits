/**
 * HTML5 audio widget compatible with Xerte's CKEditor 4 content.
 * @license Apache-2.0
 */
import { Plugin, Command } from '@ckeditor/ckeditor5-core';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { Widget, toWidget } from '@ckeditor/ckeditor5-widget';
import { browseMedia } from './xerte-browse-media.js';
import { uploadAudio } from './xerte-upload-adapter.js';

const defaults = { src: '', align: 'center', autoplay: false, noDownload: false, title: '' };
const alignments = new Set( [ 'none', 'left', 'center', 'right' ] );

function settingsFromView( div ) {
	const audio = Array.from( div.getChildren() ).find( child => child.is( 'element', 'audio' ) );
	if ( !audio || !audio.getAttribute( 'src' ) ) return null;
	const align = div.getStyle( 'float' ) || div.getStyle( 'text-align' ) || 'none';
	return {
		src: audio.getAttribute( 'src' ),
		align: alignments.has( align ) ? align : 'none',
		autoplay: audio.hasAttribute( 'autoplay' ),
		noDownload: ( audio.getAttribute( 'controlslist' ) || '' ).split( /\s+/ ).includes( 'nodownload' ),
		title: audio.getAttribute( 'title' ) || ''
	};
}

function findAudio( selection ) {
	const selected = selection.getSelectedElement();
	if ( selected?.is( 'element', 'xerteAudio' ) ) return selected;
	let parent = selection.getFirstPosition()?.parent;
	while ( parent && !parent.is( 'rootElement' ) ) {
		if ( parent.is( 'element', 'xerteAudio' ) ) return parent;
		parent = parent.parent;
	}
	return null;
}

function syncView( writer, div, settings ) {
	for ( const style of [ 'text-align', 'float', 'margin-left', 'margin-right' ] ) writer.removeStyle( style, div );
	if ( settings.align !== 'none' ) writer.setStyle( 'text-align', settings.align, div );
	if ( settings.align === 'left' || settings.align === 'right' ) {
		writer.setStyle( 'float', settings.align, div );
		writer.setStyle( settings.align === 'left' ? 'margin-right' : 'margin-left', '10px', div );
	}
	const audio = Array.from( div.getChildren() ).find( child => child.is( 'element', 'audio' ) );
	if ( !audio ) return;
	writer.setAttribute( 'src', settings.src, audio );
	writer.setAttribute( 'controls', 'controls', audio );
	for ( const [ name, value ] of [ [ 'autoplay', settings.autoplay ], [ 'controlslist', settings.noDownload ], [ 'title', settings.title ] ] ) {
		if ( value ) writer.setAttribute( name, name === 'controlslist' ? 'nodownload' : name === 'autoplay' ? 'autoplay' : value, audio );
		else writer.removeAttribute( name, audio );
	}
}

function audioView( model, writer, editing, t = value => value ) {
	const settings = { ...defaults, ...model.getAttribute( 'audioSettings' ) };
	const div = writer.createContainerElement( 'div', { class: 'ckeditor-html5-audio' } );
	const audio = writer.createEmptyElement( 'audio', editing ? { 'data-cke-ignore-events': 'true' } : {} );
	writer.insert( writer.createPositionAt( div, 0 ), audio );
	syncView( writer, div, settings );
	return editing ? toWidget( div, writer, { label: t( 'Audio' ), hasSelectionHandle: true } ) : div;
}

export class InsertXerteAudioCommand extends Command {
	refresh() {
		this.value = findAudio( this.editor.model.document.selection )?.getAttribute( 'audioSettings' ) || null;
		const position = this.editor.model.document.selection.getFirstPosition();
		this.isEnabled = !!this.value || !!( position && this.editor.model.schema.findAllowedParent( position, 'xerteAudio' ) );
	}

	execute( options ) {
		const settings = { ...defaults, ...options };
		if ( !settings.src ) return;
		settings.align = alignments.has( settings.align ) ? settings.align : 'none';
		const editor = this.editor;
		editor.model.change( writer => {
			const existing = findAudio( editor.model.document.selection );
			if ( existing ) writer.setAttribute( 'audioSettings', settings, existing );
			else editor.model.insertObject( writer.createElement( 'xerteAudio', { audioSettings: settings } ), null, null, { setSelection: 'on' } );
		} );
	}
}

export class XerteAudio extends Plugin {
	static get pluginName() { return 'XerteAudio'; }
	static get requires() { return [ Widget ]; }

	init() {
		const editor = this.editor;
		editor.model.schema.register( 'xerteAudio', {
			inheritAllFrom: '$blockObject',
			allowAttributes: [ 'audioSettings' ]
		} );
		editor.commands.add( 'insertXerteAudio', new InsertXerteAudioCommand( editor ) );
		editor.conversion.for( 'upcast' ).elementToElement( {
			view: { name: 'div', classes: 'ckeditor-html5-audio' },
			model: ( view, { writer } ) => {
				const settings = settingsFromView( view );
				return settings ? writer.createElement( 'xerteAudio', { audioSettings: settings } ) : null;
			},
			converterPriority: 'highest'
		} );
		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'xerteAudio', view: ( model, { writer } ) => audioView( model, writer, false )
		} );
		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'xerteAudio', view: ( model, { writer } ) => audioView( model, writer, true, editor.t )
		} );
		for ( const pipeline of [ 'dataDowncast', 'editingDowncast' ] ) {
			editor.conversion.for( pipeline ).add( dispatcher => {
				dispatcher.on( 'attribute:audioSettings:xerteAudio', ( event, data, api ) => {
					if ( !api.consumable.consume( data.item, event.name ) ) return;
					const div = api.mapper.toViewElement( data.item );
					if ( div ) syncView( api.writer, div, { ...defaults, ...data.attributeNewValue } );
				} );
			} );
		}
		editor.ui.componentFactory.add( 'xerteAudio', locale => {
			const button = new ButtonView( locale );
			button.set( { label: editor.t( 'Audio' ), withText: true, tooltip: true } );
			button.bind( 'isEnabled' ).to( editor.commands.get( 'insertXerteAudio' ), 'isEnabled' );
			button.on( 'execute', () => openAudioDialog( editor ) );
			return button;
		} );
	}
}

function openAudioDialog( editor ) {
	const t = editor.t;
	const initial = { ...defaults, ...editor.commands.get( 'insertXerteAudio' ).value };
	const overlay = document.createElement( 'div' );
	overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483645;background:rgba(15,23,42,.62);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:20px';
	const form = document.createElement( 'form' );
	form.setAttribute( 'role', 'dialog' );
	form.setAttribute( 'aria-modal', 'true' );
	form.setAttribute( 'aria-label', t( 'Audio properties' ) );
	form.style.cssText = 'box-sizing:border-box;background:#fff;color:#172033;max-width:95vw;width:520px;border:1px solid rgba(148,163,184,.35);border-radius:16px;box-shadow:0 24px 65px rgba(15,23,42,.32);overflow:hidden;font:14px system-ui,-apple-system,Segoe UI,Arial,sans-serif';

	const header = document.createElement( 'div' );
	header.style.cssText = 'display:flex;align-items:center;gap:12px;padding:18px 20px;border-bottom:1px solid #e7ebf1;background:linear-gradient(135deg,#f8fafc,#eef3f9)';
	const icon = document.createElement( 'div' );
	icon.setAttribute( 'aria-hidden', 'true' );
	icon.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>';
	icon.style.cssText = 'width:40px;height:40px;border-radius:12px;background:#2563eb;color:#fff;display:grid;place-items:center;box-shadow:0 6px 14px rgba(37,99,235,.25);flex:none';
	const heading = document.createElement( 'h2' );
	heading.textContent = t( 'Audio' );
	heading.style.cssText = 'font-size:18px;line-height:1.2;margin:0;flex:1';
	const close = document.createElement( 'button' );
	close.type = 'button'; close.textContent = '×'; close.setAttribute( 'aria-label', t( 'Close' ) );
	close.style.cssText = 'width:34px;height:34px;border:0;border-radius:9px;background:transparent;color:#64748b;font-size:25px;line-height:1;cursor:pointer';
	header.append( icon, heading, close );
	form.appendChild( header );

	const content = document.createElement( 'div' );
	content.style.cssText = 'padding:20px';
	form.appendChild( content );
	function field( text, input, parent = content ) {
		const label = document.createElement( 'label' );
		label.style.cssText = 'display:block;font-size:13px;font-weight:650;color:#334155';
		label.append( document.createTextNode( text ), input );
		parent.appendChild( label );
		return input;
	}
	const inputStyle = 'box-sizing:border-box;width:100%;margin-top:7px;padding:10px 11px;border:1px solid #cbd5e1;border-radius:9px;background:#fff;color:#172033;font:inherit;outline:none';
	const sourceBox = document.createElement( 'div' );
	sourceBox.style.cssText = 'padding:16px;border:1px solid #dfe5ee;border-radius:12px;background:#f8fafc';
	content.appendChild( sourceBox );
	const urlRow = document.createElement( 'div' );
	urlRow.style.cssText = 'display:grid;grid-template-columns:minmax(0,1fr) auto;gap:9px;align-items:end';
	sourceBox.appendChild( urlRow );
	const url = field( t( 'URL' ), document.createElement( 'input' ), urlRow );
	url.type = 'url'; url.value = initial.src; url.style.cssText = inputStyle;
	const browse = document.createElement( 'button' );
	browse.type = 'button'; browse.textContent = t( 'Browse server' );
	browse.style.cssText = 'min-height:40px;padding:8px 13px;border:1px solid #cbd5e1;border-radius:9px;background:#fff;color:#334155;font:600 13px system-ui,-apple-system,Segoe UI,Arial,sans-serif;cursor:pointer';
	browse.disabled = !editor.config.get( 'xerteBrowseMediaUrl' );
	browse.onclick = async () => {
		const chosen = await browseMedia( editor.config.get( 'xerteBrowseMediaUrl' ) );
		if ( chosen ) url.value = chosen;
	};
	urlRow.appendChild( browse );
	const separator = document.createElement( 'div' );
	separator.textContent = t( 'or' );
	separator.style.cssText = 'display:flex;align-items:center;gap:10px;margin:13px 0;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:.06em';
	separator.insertAdjacentHTML( 'afterbegin', '<span style="height:1px;background:#dfe5ee;flex:1"></span>' );
	separator.insertAdjacentHTML( 'beforeend', '<span style="height:1px;background:#dfe5ee;flex:1"></span>' );
	sourceBox.appendChild( separator );
	const file = field( t( 'Upload audio' ), document.createElement( 'input' ), sourceBox );
	file.type = 'file'; file.accept = 'audio/*,.mp3,.ogg,.wav,.webm';
	file.disabled = !editor.config.get( 'xerteUploadAudioUrl' );
	file.style.cssText = inputStyle + ';padding:7px 9px;background:#fff';

	const details = document.createElement( 'div' );
	details.style.cssText = 'display:grid;grid-template-columns:150px minmax(0,1fr);gap:14px;margin-top:18px';
	content.appendChild( details );
	const align = field( t( 'Alignment' ), document.createElement( 'select' ), details );
	for ( const value of alignments ) {
		const option = document.createElement( 'option' ); option.value = value; option.textContent = t( value );
		align.appendChild( option );
	}
	align.value = initial.align; align.style.cssText = inputStyle;
	const title = field( t( 'Advisory title' ), document.createElement( 'input' ), details );
	title.type = 'text'; title.value = initial.title; title.style.cssText = inputStyle;

	const options = document.createElement( 'div' );
	options.style.cssText = 'display:grid;gap:9px;margin-top:17px;padding:13px 15px;border:1px solid #e2e8f0;border-radius:10px;background:#fff';
	content.appendChild( options );
	function checkbox( text, checked ) {
		const label = document.createElement( 'label' );
		label.style.cssText = 'display:flex;align-items:flex-start;gap:9px;color:#475569;cursor:pointer;line-height:1.35';
		const input = document.createElement( 'input' );
		input.type = 'checkbox'; input.checked = checked; input.style.cssText = 'margin:2px 0 0;accent-color:#2563eb';
		label.append( input, document.createTextNode( text ) ); options.appendChild( label );
		return input;
	}
	const autoplay = checkbox( t( 'Autoplay (browser may block it)' ), initial.autoplay );
	const noDownload = checkbox( t( 'Hide download control (browser dependent)' ), initial.noDownload );
	const status = document.createElement( 'div' );
	status.setAttribute( 'role', 'alert' );
	status.style.cssText = 'display:none;margin-top:14px;padding:10px 12px;border:1px solid #fecaca;border-radius:9px;background:#fff7f7;color:#b91c1c';
	content.appendChild( status );

	const footer = document.createElement( 'div' );
	footer.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;margin-top:18px;padding-top:16px;border-top:1px solid #e7ebf1';
	const cancel = document.createElement( 'button' ); cancel.type = 'button'; cancel.textContent = t( 'Cancel' );
	cancel.style.cssText = 'min-height:38px;padding:8px 14px;border:1px solid transparent;border-radius:9px;background:transparent;color:#64748b;font:600 14px system-ui,-apple-system,Segoe UI,Arial,sans-serif;cursor:pointer';
	const save = document.createElement( 'button' ); save.type = 'submit'; save.textContent = t( 'Save' );
	save.style.cssText = 'min-height:38px;padding:8px 16px;border:1px solid #2563eb;border-radius:9px;background:#2563eb;color:#fff;font:600 14px system-ui,-apple-system,Segoe UI,Arial,sans-serif;cursor:pointer;box-shadow:0 4px 10px rgba(37,99,235,.2)';
	footer.append( cancel, save ); content.appendChild( footer );
	const dismiss = () => { overlay.remove(); editor.editing.view.focus(); };
	cancel.onclick = dismiss; close.onclick = dismiss;
	overlay.addEventListener( 'click', event => { if ( event.target === overlay ) dismiss(); } );
	overlay.addEventListener( 'keydown', event => { if ( event.key === 'Escape' ) dismiss(); } );
	form.onsubmit = async event => {
		event.preventDefault();
		status.style.display = 'none';
		if ( !url.value.trim() && !file.files.length ) {
			status.textContent = t( 'Choose an audio file or enter a URL.' );
			status.style.display = 'block';
			return;
		}
		save.disabled = true;
		save.style.opacity = '.65';
		try {
			let src = url.value.trim();
			if ( file.files.length ) src = await uploadAudio( file.files[ 0 ], editor.config.get( 'xerteUploadAudioUrl' ), { t } );
			editor.execute( 'insertXerteAudio', {
				src, align: align.value, autoplay: autoplay.checked,
				noDownload: noDownload.checked, title: title.value
			} );
			overlay.remove();
			editor.editing.view.focus();
		} catch ( error ) {
			status.textContent = error.message || String( error );
			status.style.display = 'block';
			save.disabled = false;
			save.style.opacity = '1';
		}
	};
	overlay.appendChild( form ); document.body.appendChild( overlay ); url.focus();
}
