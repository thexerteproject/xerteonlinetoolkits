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
	overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483645;background:#0008;display:flex;align-items:center;justify-content:center;padding:20px';
	const form = document.createElement( 'form' );
	form.setAttribute( 'role', 'dialog' );
	form.setAttribute( 'aria-label', t( 'Audio properties' ) );
	form.style.cssText = 'background:#fff;color:#222;max-width:95vw;width:480px;padding:20px;border-radius:8px;font:14px Arial,sans-serif';
	const heading = document.createElement( 'h2' );
	heading.textContent = t( 'Audio' );
	form.appendChild( heading );
	function field( text, input ) {
		const label = document.createElement( 'label' );
		label.style.cssText = 'display:block;margin:12px 0';
		label.append( document.createTextNode( text + ' ' ), input );
		form.appendChild( label );
		return input;
	}
	const url = field( t( 'URL' ), document.createElement( 'input' ) );
	url.type = 'url'; url.required = true; url.value = initial.src; url.style.width = '100%';
	const browse = document.createElement( 'button' );
	browse.type = 'button'; browse.textContent = t( 'Browse server' );
	browse.disabled = !editor.config.get( 'xerteBrowseMediaUrl' );
	browse.onclick = async () => {
		const chosen = await browseMedia( editor.config.get( 'xerteBrowseMediaUrl' ) );
		if ( chosen ) url.value = chosen;
	};
	form.appendChild( browse );
	const file = field( t( 'Upload audio' ), document.createElement( 'input' ) );
	file.type = 'file'; file.accept = 'audio/*,.mp3,.ogg,.wav,.webm';
	file.disabled = !editor.config.get( 'xerteUploadAudioUrl' );
	const align = field( t( 'Alignment' ), document.createElement( 'select' ) );
	for ( const value of alignments ) {
		const option = document.createElement( 'option' ); option.value = value; option.textContent = value;
		align.appendChild( option );
	}
	align.value = initial.align;
	const autoplay = field( t( 'Autoplay (browser may block it)' ), document.createElement( 'input' ) );
	autoplay.type = 'checkbox'; autoplay.checked = initial.autoplay;
	const noDownload = field( t( 'Hide download control (browser dependent)' ), document.createElement( 'input' ) );
	noDownload.type = 'checkbox'; noDownload.checked = initial.noDownload;
	const title = field( t( 'Advisory title' ), document.createElement( 'input' ) );
	title.type = 'text'; title.value = initial.title; title.style.width = '100%';
	const status = document.createElement( 'div' ); status.setAttribute( 'role', 'alert' ); form.appendChild( status );
	const cancel = document.createElement( 'button' ); cancel.type = 'button'; cancel.textContent = t( 'Cancel' );
	cancel.onclick = () => overlay.remove();
	const save = document.createElement( 'button' ); save.type = 'submit'; save.textContent = t( 'Save' );
	form.append( cancel, save );
	form.onsubmit = async event => {
		event.preventDefault();
		save.disabled = true;
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
			save.disabled = false;
		}
	};
	overlay.appendChild( form ); document.body.appendChild( overlay ); url.focus();
}
