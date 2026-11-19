/**
 * Link properties with an explicit protocol, file browser and target settings.
 * @license Apache-2.0
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { ModelLivePosition } from '@ckeditor/ckeditor5-engine';
import { IconLink } from 'ckeditor5/src/icons.js';
import { findAttributeRange } from 'ckeditor5/src/typing.js';
import { browseMedia } from './xerte-browse-media.js';
import { composeHref, splitHref } from './xerte-link-utils.js';
import { hideForXertePageLink } from './xerte-page-link.js';
import { createLightboxFields } from './xerte-lightbox.js';

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

export function openLinkDialog( editor ) {
	const t = editor.t;
	const current = splitHref( editor.commands.get( 'link' ).value );
	const lightbox = editor.commands.get( 'xerteLightbox' ).value;
	const storedTarget = editor.commands.get( 'xerteLinkTarget' ).value || '';
	const currentTarget = lightbox ? '_lightbox' : current.address ? storedTarget : '_blank';
	const overlay = document.createElement( 'div' );
	overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483645;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:20px';
	const form = document.createElement( 'form' );
	form.setAttribute( 'role', 'dialog' );
	form.setAttribute( 'aria-modal', 'true' );
	form.setAttribute( 'aria-label', t( current.address ? 'Edit link' : 'Create link' ) );
	form.style.cssText = 'box-sizing:border-box;width:620px;max-width:95vw;max-height:calc(100vh - 40px);overflow:auto;padding:20px;border:1px solid #dbe2ea;border-radius:12px;background:#fff;color:#172033;box-shadow:0 24px 65px rgba(15,23,42,.3);font:14px system-ui,-apple-system,Segoe UI,Arial,sans-serif';
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

	const targetLabel = document.createElement( 'label' );
	targetLabel.textContent = t( 'Link target' );
	targetLabel.style.cssText = 'display:block;margin-top:18px;font-size:13px;font-weight:600;color:#334155';
	const target = document.createElement( 'select' );
	target.name = 'target';
	target.style.cssText = protocol.style.cssText + ';margin-top:6px';
	for ( const [ value, text ] of [
		[ '', 'Same window' ], [ '_blank', 'New window/tab' ], [ '_parent', 'Parent window' ],
		[ '_top', 'Topmost window' ], [ '_lightbox', 'Lightbox' ]
	] ) target.add( new Option( t( text ), value ) );
	// Retain explicit _self and named-frame targets when editing existing links.
	if ( currentTarget && !Array.from( target.options ).some( option => option.value === currentTarget ) ) {
		target.add( new Option( currentTarget === '_self' ? t( 'Same window' ) : `${ t( 'Existing named frame' ) }: ${ currentTarget }`, currentTarget ) );
	}
	target.value = currentTarget;
	targetLabel.appendChild( target );
	form.appendChild( targetLabel );
	const lightboxFields = createLightboxFields( editor, lightbox );
	lightboxFields.element.style.cssText = 'margin-top:16px;padding-top:16px;border-top:1px solid #e5e7eb';
	const updateTarget = () => {
		lightboxFields.element.hidden = target.value !== '_lightbox';
		// Hidden fields must not prevent saving an ordinary window target.
		for ( const input of lightboxFields.element.querySelectorAll( 'input, select' ) ) input.disabled = target.value !== '_lightbox';
	};
	target.addEventListener( 'change', updateTarget );
	updateTarget();
	form.appendChild( lightboxFields.element );

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
		saveLinkProperties( editor, composeHref( protocol.value, value ), target.value,
			target.value === '_lightbox' ? lightboxFields.getValue() : null );
		close();
	} );
	overlay.appendChild( form ); document.body.appendChild( overlay ); address.focus();
}

function saveLinkProperties( editor, href, target, lightbox ) {
	const model = editor.model;
	const selection = model.document.selection;
	let ranges = Array.from( selection.getRanges() );
	if ( selection.isCollapsed && selection.hasAttribute( 'linkHref' ) ) {
		ranges = [ findAttributeRange( selection.getFirstPosition(), 'linkHref', selection.getAttribute( 'linkHref' ), model ) ];
	}
	// Track both inserted URLs and existing link text when the link command
	// replaces text or moves the caret outside the link. Save everything in one undo step.
	const positions = ranges.map( range => ( {
		start: ModelLivePosition.fromPosition( range.start, 'toPrevious' ),
		end: ModelLivePosition.fromPosition( range.end, 'toNext' )
	} ) );
	try {
		model.change( writer => {
			editor.execute( 'link', href );
			for ( const position of positions ) {
				const range = model.createRange( position.start.toPosition(), position.end.toPosition() );
				for ( const [ attribute, value ] of [
					[ 'linkXerteTarget', target === '_lightbox' ? '' : target ], [ 'linkXerteLightbox', lightbox ]
				] ) {
					for ( const validRange of model.schema.getValidRanges( [ range ], attribute ) ) {
						if ( value ) writer.setAttribute( attribute, value, validRange );
						else writer.removeAttribute( attribute, validRange );
					}
				}
			}
		} );
	} finally {
		for ( const position of positions ) { position.start.detach(); position.end.detach(); }
	}
}

function makeButton( text, background, color ) {
	const button = document.createElement( 'button' );
	button.type = 'button'; button.textContent = text;
	button.style.cssText = `min-height:38px;padding:8px 14px;border:1px solid #cbd5e1;border-radius:8px;background:${ background };color:${ color };font:600 14px system-ui,-apple-system,Segoe UI,Arial,sans-serif;cursor:pointer`;
	return button;
}
