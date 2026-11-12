/**
 * Restores the useful CKEditor 4 link target choices in CKEditor 5.
 * @license Apache-2.0
 */
import { Command, Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { IconWeb } from 'ckeditor5/src/icons.js';
import { findAttributeRange } from 'ckeditor5/src/typing.js';
import { priorities } from 'ckeditor5/src/utils.js';
import { openLightboxDialog } from './xerte-lightbox.js';
import { hideForXertePageLink } from './xerte-page-link.js';

const MODEL_ATTRIBUTE = 'linkXerteTarget';
const STANDARD_TARGETS = new Set( [ '_blank', '_parent', '_top' ] );

class XerteLinkTargetCommand extends Command {
	refresh() {
		const link = getSelectedLink( this.editor );
		this.isEnabled = !!link;
		this.value = link ? link.item.getAttribute( MODEL_ATTRIBUTE ) || '' : '';
	}

	execute( target ) {
		const link = getSelectedLink( this.editor );
		if ( !link ) return;

		this.editor.model.change( writer => {
			if ( target ) writer.setAttribute( MODEL_ATTRIBUTE, target, link.range );
			else writer.removeAttribute( MODEL_ATTRIBUTE, link.range );
		} );
	}
}

export class XerteLinkTarget extends Plugin {
	static get pluginName() {
		return 'XerteLinkTarget';
	}

	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		schema.extend( '$text', { allowAttributes: MODEL_ATTRIBUTE } );
		for ( const name of [ 'imageBlock', 'imageInline', 'fontAwesomeIcon' ] ) {
			if ( schema.isRegistered( name ) ) schema.extend( name, { allowAttributes: MODEL_ATTRIBUTE } );
		}

		editor.commands.add( 'xerteLinkTarget', new XerteLinkTargetCommand( editor ) );
		registerUpcast( editor );
		registerInlineDowncast( editor );
		registerBlockImageDowncast( editor );
		registerCleanup( editor );
		registerNewLinkDefault( editor );

		editor.ui.componentFactory.add( 'xerteLinkTarget', locale => {
			const command = editor.commands.get( 'xerteLinkTarget' );
			const button = new ButtonView( locale );
			button.set( { label: editor.t( 'Link target' ), icon: IconWeb, tooltip: true } );
			button.bind( 'isEnabled' ).to( command, 'isEnabled' );
			hideForXertePageLink( editor, button );
			button.on( 'execute', () => openTargetDialog( editor ) );
			return button;
		} );
	}
}

function getSelectedLink( editor ) {
	const selection = editor.model.document.selection;
	const selected = selection.getSelectedElement();
	if ( selected?.hasAttribute( 'linkHref' ) ) {
		return { item: selected, range: editor.model.createRangeOn( selected ) };
	}
	const href = selection.getAttribute( 'linkHref' );
	const position = selection.getFirstPosition();
	if ( !href || !position ) return null;
	const range = findAttributeRange( position, 'linkHref', href, editor.model );
	const item = range.start.textNode || range.start.nodeAfter;
	return item ? { item, range } : null;
}

function registerUpcast( editor ) {
	editor.conversion.for( 'upcast' ).add( dispatcher => {
		dispatcher.on( 'element:a', ( event, data, api ) => {
			const target = data.viewItem.getAttribute( 'target' );
			if ( !target || target === '_lightbox' ) return;
			const attributes = [ 'target' ];
			if ( target === '_blank' && data.viewItem.getAttribute( 'rel' ) === 'noopener noreferrer' ) {
				attributes.push( 'rel' );
			}
			if ( !api.consumable.consume( data.viewItem, { attributes } ) ) return;
			if ( !data.modelRange ) {
				Object.assign( data, api.convertChildren( data.viewItem, data.modelCursor ) );
			}

			if ( data.modelRange && !data.modelRange.isCollapsed ) {
				api.writer.setAttribute( MODEL_ATTRIBUTE, target, data.modelRange );
			} else if ( data.modelCursor?.parent?.hasAttribute( 'linkHref' ) ) {
				api.writer.setAttribute( MODEL_ATTRIBUTE, target, data.modelCursor.parent );
			}
		// Run after LinkImage and before General HTML Support.
		}, { priority: priorities.normal - 1 } );
	} );
}

function targetAttributes( target ) {
	return target === '_blank' ?
		{ target, rel: 'noopener noreferrer' } : { target };
}

function registerInlineDowncast( editor ) {
	for ( const pipeline of [ 'dataDowncast', 'editingDowncast' ] ) {
		editor.conversion.for( pipeline ).attributeToElement( {
			model: MODEL_ATTRIBUTE,
			view: ( target, { writer } ) => {
				const link = writer.createAttributeElement( 'a', targetAttributes( target ), { priority: 5 } );
				writer.setCustomProperty( 'link', true, link );
				return link;
			}
		} );
	}
}

function registerBlockImageDowncast( editor ) {
	for ( const pipeline of [ 'dataDowncast', 'editingDowncast' ] ) {
		editor.conversion.for( pipeline ).add( dispatcher => {
			dispatcher.on( `attribute:${ MODEL_ATTRIBUTE }:imageBlock`, ( event, data, api ) => {
				if ( !api.consumable.consume( data.item, event.name ) ) return;
				const figure = api.mapper.toViewElement( data.item );
				const link = figure && Array.from( figure.getChildren() ).find( child => child.is( 'element', 'a' ) );
				if ( !link ) return;
				api.writer.removeAttribute( 'target', link );
				api.writer.removeAttribute( 'rel', link );
				if ( data.attributeNewValue ) {
					for ( const [ name, value ] of Object.entries( targetAttributes( data.attributeNewValue ) ) ) {
						api.writer.setAttribute( name, value, link );
					}
				}
			}, { priority: 'low' } );
		} );
	}
}

function registerNewLinkDefault( editor ) {
	const linkCommand = editor.commands.get( 'link' );
	if ( !linkCommand ) return;
	linkCommand.on( 'execute', () => {
		const additions = editor.model.document.differ.getChanges().filter( change =>
			change.type === 'attribute' && change.attributeKey === 'linkHref' &&
			!change.attributeOldValue && change.attributeNewValue
		);
		if ( !additions.length ) return;
		editor.model.change( writer => {
			for ( const change of additions ) writer.setAttribute( MODEL_ATTRIBUTE, '_blank', change.range );
		} );
	}, { priority: 'lowest' } );
}

function registerCleanup( editor ) {
	const model = editor.model;
	model.document.registerPostFixer( writer => {
		let changed = false;
		for ( const change of model.document.differ.getChanges() ) {
			if ( change.type !== 'attribute' || change.attributeKey !== 'linkHref' || change.attributeNewValue ) continue;
			for ( const item of change.range.getItems() ) {
				if ( item.hasAttribute( MODEL_ATTRIBUTE ) ) {
					writer.removeAttribute( MODEL_ATTRIBUTE, item );
					changed = true;
				}
			}
		}
		return changed;
	} );
}

function openTargetDialog( editor ) {
	const targetCommand = editor.commands.get( 'xerteLinkTarget' );
	const lightboxCommand = editor.commands.get( 'xerteLightbox' );
	const storedTarget = targetCommand.value || '';
	const current = lightboxCommand.value ? '_lightbox' : storedTarget === '_self' ? '' : storedTarget;
	const overlay = document.createElement( 'div' );
	overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483645;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:20px';
	const form = document.createElement( 'form' );
	form.setAttribute( 'role', 'dialog' );
	form.setAttribute( 'aria-modal', 'true' );
	form.style.cssText = 'box-sizing:border-box;width:440px;max-width:95vw;padding:20px;border:1px solid #dbe2ea;border-radius:12px;background:#fff;color:#172033;box-shadow:0 24px 65px rgba(15,23,42,.3);font:14px system-ui,-apple-system,Segoe UI,Arial,sans-serif';
	form.innerHTML = '<h2 style="margin:0 0 18px;font-size:18px">Link target</h2>';

	const select = document.createElement( 'select' );
	select.style.cssText = 'box-sizing:border-box;width:100%;padding:9px 10px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;color:#172033;font:inherit';
	for ( const [ value, label ] of [
		[ '', 'Same window' ], [ '_blank', 'New window/tab' ], [ '_parent', 'Parent window' ],
		[ '_top', 'Topmost window' ], [ '_lightbox', 'Lightbox' ]
	] ) select.add( new Option( editor.t( label ), value ) );

	const isCustom = current && current !== '_lightbox' && !STANDARD_TARGETS.has( current );
	if ( isCustom ) select.add( new Option( `${ editor.t( 'Existing named frame' ) }: ${ current }`, current ) );
	select.value = current;
	form.appendChild( select );

	const buttons = document.createElement( 'div' );
	buttons.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;margin-top:20px;padding-top:16px;border-top:1px solid #e5e7eb';
	const cancel = makeButton( editor.t( 'Cancel' ), '#fff', '#475569' );
	const save = makeButton( editor.t( 'Save' ), '#2563eb', '#fff' );
	save.type = 'submit';
	buttons.append( cancel, save ); form.appendChild( buttons ); overlay.appendChild( form ); document.body.appendChild( overlay );
	const close = () => { overlay.remove(); editor.editing.view.focus(); };
	cancel.addEventListener( 'click', close );
	overlay.addEventListener( 'click', event => { if ( event.target === overlay ) close(); } );
	overlay.addEventListener( 'keydown', event => { if ( event.key === 'Escape' ) close(); } );
	const showLightboxSettings = () => {
		close();
		openLightboxDialog( editor, lightboxCommand.value );
	};
	select.addEventListener( 'change', () => {
		if ( select.value === '_lightbox' ) showLightboxSettings();
	} );
	form.addEventListener( 'submit', event => {
		event.preventDefault();
		let target = select.value;
		if ( target === '_lightbox' ) {
			showLightboxSettings();
			return;
		}
		editor.execute( 'xerteLightbox', null );
		editor.execute( 'xerteLinkTarget', target );
		close();
	} );
	select.focus();
}

function makeButton( text, background, color ) {
	const button = document.createElement( 'button' );
	button.type = 'button'; button.textContent = text;
	button.style.cssText = `min-height:38px;padding:8px 14px;border:1px solid #cbd5e1;border-radius:8px;background:${ background };color:${ color };font:600 14px system-ui,-apple-system,Segoe UI,Arial,sans-serif;cursor:pointer`;
	return button;
}
