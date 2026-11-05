/**
 * CKEditor 4-style link form with an explicit protocol and file browser.
 * @license Apache-2.0
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { IconLink } from 'ckeditor5/src/icons.js';
import { browseMedia } from './xerte-browse-media.js';
import { composeHref, splitHref } from './xerte-link-utils.js';
import { hideForXertePageLink } from './xerte-page-link.js';

export class XerteLinkDialog extends Plugin {
	static get pluginName() {
		return 'XerteLinkDialog';
	}

	init() {
		const editor = this.editor;
		for ( const [ name, label ] of [ [ 'xerteLink', 'Link' ], [ 'xerteEditLink', 'Edit link' ] ] ) {
			editor.ui.componentFactory.add( name, locale => {
				const command = editor.commands.get( 'link' );
				const button = new ButtonView( locale );
				button.set( { label: editor.t( label ), icon: IconLink, tooltip: true } );
				button.bind( 'isEnabled' ).to( command, 'isEnabled' );
				button.bind( 'isOn' ).to( command, 'value', value => !!value );
				if ( name === 'xerteEditLink' ) hideForXertePageLink( editor, button );
				button.on( 'execute', () => openLinkDialog( editor ) );
				return button;
			} );
		}
	}
}

function openLinkDialog( editor ) {
	const t = editor.t;
	const current = splitHref( editor.commands.get( 'link' ).value );
	const overlay = document.createElement( 'div' );
	overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483645;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:20px';
	const form = document.createElement( 'form' );
	form.setAttribute( 'role', 'dialog' );
	form.setAttribute( 'aria-modal', 'true' );
	form.setAttribute( 'aria-label', t( current.address ? 'Edit link' : 'Create link' ) );
	form.style.cssText = 'box-sizing:border-box;width:620px;max-width:95vw;padding:20px;border:1px solid #dbe2ea;border-radius:12px;background:#fff;color:#172033;box-shadow:0 24px 65px rgba(15,23,42,.3);font:14px system-ui,-apple-system,Segoe UI,Arial,sans-serif';
	const heading = document.createElement( 'h2' );
	heading.textContent = t( current.address ? 'Edit link' : 'Create link' );
	heading.style.cssText = 'margin:0 0 18px;font-size:18px';
	form.appendChild( heading );

	const label = document.createElement( 'label' );
	label.textContent = t( 'Link address' );
	label.style.cssText = 'display:block;margin-bottom:6px;font-size:13px;font-weight:600;color:#334155';
	form.appendChild( label );
	const row = document.createElement( 'div' );
	row.style.cssText = 'display:grid;grid-template-columns:125px minmax(0,1fr) auto;gap:8px';
	const protocol = document.createElement( 'select' );
	for ( const [ value, text ] of [
		[ 'https://', 'https://' ], [ 'http://', 'http://' ], [ 'mailto:', 'mailto:' ], [ '', t( 'Other / relative' ) ]
	] ) protocol.add( new Option( text, value ) );
	protocol.value = current.protocol || ( current.address ? '' : 'https://' );
	const address = document.createElement( 'input' );
	address.type = 'text';
	address.value = current.address;
	address.placeholder = protocol.value === 'mailto:' ? 'name@example.com' : 'www.example.com';
	address.setAttribute( 'aria-label', t( 'Link address' ) );
	const browse = document.createElement( 'button' );
	browse.type = 'button';
	browse.textContent = t( 'Browse server' );
	browse.disabled = !editor.config.get( 'xerteBrowseMediaUrl' );
	for ( const element of [ protocol, address ] ) element.style.cssText = 'box-sizing:border-box;width:100%;padding:9px 10px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;color:#172033;font:inherit';
	browse.style.cssText = 'padding:8px 12px;border:1px solid #94a3b8;border-radius:8px;background:#f8fafc;color:#334155;font:600 14px system-ui;cursor:pointer;white-space:nowrap';
	row.append( protocol, address, browse ); form.appendChild( row );

	protocol.addEventListener( 'change', () => {
		address.placeholder = protocol.value === 'mailto:' ? 'name@example.com' : protocol.value ? 'www.example.com' : t( 'Full or relative URL' );
	} );
	browse.addEventListener( 'click', async () => {
		const url = await browseMedia( editor.config.get( 'xerteBrowseMediaUrl' ) );
		if ( !url ) return;
		const selected = splitHref( url );
		protocol.value = selected.protocol;
		address.value = selected.address;
		address.focus();
	} );

	const buttons = document.createElement( 'div' );
	buttons.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;margin-top:20px;padding-top:16px;border-top:1px solid #e5e7eb';
	const cancel = makeButton( t( 'Cancel' ), '#fff', '#475569' );
	const save = makeButton( t( 'Save' ), '#2563eb', '#fff' );
	save.type = 'submit'; buttons.append( cancel, save ); form.appendChild( buttons );
	const close = () => { overlay.remove(); editor.editing.view.focus(); };
	cancel.addEventListener( 'click', close );
	overlay.addEventListener( 'click', event => { if ( event.target === overlay ) close(); } );
	overlay.addEventListener( 'keydown', event => { if ( event.key === 'Escape' ) close(); } );
	form.addEventListener( 'submit', event => {
		event.preventDefault();
		const value = address.value.trim();
		if ( !value ) { address.focus(); return; }
		editor.execute( 'link', composeHref( protocol.value, value ) );
		close();
	} );
	overlay.appendChild( form ); document.body.appendChild( overlay ); address.focus();
}

function makeButton( text, background, color ) {
	const button = document.createElement( 'button' );
	button.type = 'button'; button.textContent = text;
	button.style.cssText = `min-height:38px;padding:8px 14px;border:1px solid #cbd5e1;border-radius:8px;background:${ background };color:${ color };font:600 14px system-ui,-apple-system,Segoe UI,Arial,sans-serif;cursor:pointer`;
	return button;
}
