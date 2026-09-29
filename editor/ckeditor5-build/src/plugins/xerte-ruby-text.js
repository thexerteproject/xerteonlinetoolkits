/**
 * Ruby text editing for the HTML produced by the CKEditor 4 rubytext plugin.
 * @license Apache-2.0
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { toWidget } from '@ckeditor/ckeditor5-widget';

function textContent( node ) {
	if ( node.is( '$text' ) ) {
		return node.data;
	}
	let text = '';
	if ( node.getChildren ) {
		for ( const child of node.getChildren() ) {
			text += textContent( child );
		}
	}
	return text;
}

function readRuby( ruby ) {
	let baseText = '';
	let rubyText = '';
	for ( const child of ruby.getChildren() ) {
		if ( child.is( 'element', 'rt' ) ) {
			rubyText += textContent( child );
		} else if ( child.is( 'element', 'rb' ) ) {
			baseText += textContent( child );
		} else if ( !child.is( 'element', 'rp' ) ) {
			baseText += textContent( child );
		}
	}
	return { baseText, rubyText };
}

function rubyView( writer, modelElement ) {
	const ruby = writer.createContainerElement( 'ruby' );
	const rb = writer.createContainerElement( 'rb' );
	const rt = writer.createContainerElement( 'rt' );
	writer.insert( writer.createPositionAt( rb, 0 ), writer.createText( modelElement.getAttribute( 'baseText' ) || '' ) );
	writer.insert( writer.createPositionAt( rt, 0 ), writer.createText( modelElement.getAttribute( 'rubyText' ) || '' ) );
	writer.insert( writer.createPositionAt( ruby, 0 ), rb );
	writer.insert( writer.createPositionAt( ruby, 1 ), rt );
	return ruby;
}

function selectedText( editor ) {
	let text = '';
	for ( const range of editor.model.document.selection.getRanges() ) {
		for ( const item of range.getItems() ) {
			if ( item.is( '$textProxy' ) ) {
				text += item.data;
			}
		}
	}
	return text;
}

function editRuby( baseText, rubyText, t ) {
	return new Promise( resolve => {
		const overlay = document.createElement( 'div' );
		overlay.style.cssText = 'position:fixed;inset:0;z-index:100000;background:#0008;display:flex;align-items:center;justify-content:center';
		const dialog = document.createElement( 'div' );
		dialog.setAttribute( 'role', 'dialog' );
		dialog.setAttribute( 'aria-modal', 'true' );
		dialog.setAttribute( 'aria-label', t( 'Phonetic Guide / Ruby Text' ) );
		dialog.style.cssText = 'background:white;color:#222;padding:20px;border-radius:6px;box-shadow:0 12px 32px #0004;width:min(360px,90vw);font:14px Arial,sans-serif';
		const title = document.createElement( 'h2' );
		title.textContent = t( 'Phonetic Guide / Ruby Text' );
		title.style.cssText = 'font-size:18px;margin:0 0 16px';
		dialog.appendChild( title );

		function input( labelText, value ) {
			const label = document.createElement( 'label' );
			label.textContent = labelText;
			label.style.cssText = 'display:block;margin:12px 0 4px';
			const field = document.createElement( 'input' );
			field.type = 'text';
			field.value = value || '';
			field.style.cssText = 'box-sizing:border-box;width:100%;padding:8px;border:1px solid #aaa;border-radius:3px';
			label.appendChild( field );
			dialog.appendChild( label );
			return field;
		}

		const base = input( t( 'Text' ), baseText );
		const pronunciation = input( t( 'Pronunciation (shown above)' ), rubyText );
		const previewLabel = document.createElement( 'div' );
		previewLabel.textContent = t( 'Preview' );
		previewLabel.style.cssText = 'margin:18px 0 8px;color:#555';
		dialog.appendChild( previewLabel );
		const preview = document.createElement( 'div' );
		preview.style.cssText = 'min-height:50px;padding:14px;text-align:center;border:1px solid #ddd;font-size:22px';
		const ruby = document.createElement( 'ruby' );
		const rb = document.createElement( 'rb' );
		const rt = document.createElement( 'rt' );
		ruby.append( rb, rt );
		preview.appendChild( ruby );
		dialog.appendChild( preview );
		const actions = document.createElement( 'div' );
		actions.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;margin-top:18px';
		const cancel = document.createElement( 'button' );
		cancel.type = 'button';
		cancel.textContent = t( 'Cancel' );
		const save = document.createElement( 'button' );
		save.type = 'button';
		save.textContent = t( 'Insert' );
		for ( const button of [ cancel, save ] ) {
			button.style.cssText = 'padding:8px 12px;cursor:pointer';
			actions.appendChild( button );
		}
		dialog.appendChild( actions );
		overlay.appendChild( dialog );
		document.body.appendChild( overlay );

		const update = () => {
			rb.textContent = base.value;
			rt.textContent = pronunciation.value;
			save.disabled = !base.value.trim() || !pronunciation.value.trim();
		};
		const close = result => {
			document.removeEventListener( 'keydown', onKeyDown, true );
			overlay.remove();
			resolve( result );
		};
		const onKeyDown = event => {
			if ( event.key === 'Escape' ) {
				event.preventDefault();
				close( null );
			} else if ( event.key === 'Enter' && !save.disabled ) {
				event.preventDefault();
				close( { baseText: base.value, rubyText: pronunciation.value } );
			}
		};
		base.addEventListener( 'input', update );
		pronunciation.addEventListener( 'input', update );
		cancel.addEventListener( 'click', () => close( null ) );
		save.addEventListener( 'click', () => close( { baseText: base.value, rubyText: pronunciation.value } ) );
		overlay.addEventListener( 'click', event => {
			if ( event.target === overlay ) {
				close( null );
			}
		} );
		document.addEventListener( 'keydown', onKeyDown, true );
		update();
		( base.value ? pronunciation : base ).focus();
	} );
}

export class XerteRubyText extends Plugin {
	static get pluginName() {
		return 'XerteRubyText';
	}

	init() {
		const editor = this.editor;
		editor.model.schema.register( 'xerteRubyText', {
			isInline: true,
			isObject: true,
			allowWhere: '$text',
			allowAttributes: [ 'baseText', 'rubyText' ]
		} );

		editor.conversion.for( 'upcast' ).elementToElement( {
			view: 'ruby',
			model: ( viewElement, { writer } ) => writer.createElement( 'xerteRubyText', readRuby( viewElement ) ),
			converterPriority: 'high'
		} );
		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'xerteRubyText',
			view: ( modelElement, { writer } ) => rubyView( writer, modelElement )
		} );
		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'xerteRubyText',
			view: ( modelElement, { writer } ) => toWidget( rubyView( writer, modelElement ), writer, {
				label: editor.t( 'Ruby text' )
			} )
		} );

		editor.ui.componentFactory.add( 'xerteRubyText', locale => {
			const button = new ButtonView( locale );
			button.set( { label: editor.t( 'Ruby' ), withText: true, tooltip: true } );
			button.on( 'execute', async () => {
				const existing = editor.model.document.selection.getSelectedElement();
				const ruby = existing && existing.is( 'element', 'xerteRubyText' ) ? existing : null;
				const selectionRange = editor.model.document.selection.getFirstRange();
				const values = await editRuby(
					ruby ? ruby.getAttribute( 'baseText' ) : selectedText( editor ),
					ruby ? ruby.getAttribute( 'rubyText' ) : '',
					editor.t
				);
				if ( !values ) {
					return;
				}
				editor.model.change( writer => {
					if ( ruby ) {
						const position = writer.createPositionBefore( ruby );
						writer.remove( ruby );
						const replacement = writer.createElement( 'xerteRubyText', values );
						writer.insert( replacement, position );
						writer.setSelection( replacement, 'on' );
					} else {
						editor.model.insertObject( writer.createElement( 'xerteRubyText', values ), selectionRange, null, { setSelection: 'on' } );
					}
				} );
				editor.editing.view.focus();
			} );
			return button;
		} );
	}
}
