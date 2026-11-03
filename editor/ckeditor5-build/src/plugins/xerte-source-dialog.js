/**
 * Source dialog for inline editors (legacy CKEditor 4 Sourcedialog behaviour).
 * @license Apache-2.0
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView, Dialog, View } from '@ckeditor/ckeditor5-ui';
import { IconSource } from '@ckeditor/ckeditor5-icons';

class SourceDialogView extends View {
	constructor( locale ) {
		super( locale );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-xerte-source-dialog' ],
				style: {
					padding: 'var(--ck-spacing-large)',
					width: 'min(80vw, 700px)'
				}
			},
			children: [
				{
					tag: 'textarea',
					attributes: {
						class: [ 'ck', 'ck-input', 'ck-xerte-source-dialog__textarea' ],
						rows: 12,
						spellcheck: 'false',
						'aria-label': 'Source code editing area',
						style: {
							boxSizing: 'border-box',
							fontFamily: 'monospace',
							minHeight: '12em',
							resize: 'vertical',
							width: '100%'
						}
					}
				}
			]
		} );
	}

	render() {
		super.render();
		this.textarea = this.element.querySelector( 'textarea' );
	}

	setValue( value ) {
		this.textarea.value = value;
	}

	getValue() {
		return this.textarea.value;
	}

	focus() {
		this.textarea.focus();
	}
}

export class XerteSourceDialog extends Plugin {
	static get pluginName() {
		return 'XerteSourceDialog';
	}

	static get requires() {
		return [ Dialog ];
	}

	init() {
		const editor = this.editor;
		const t = editor.locale.t;

		editor.ui.componentFactory.add( 'xerteSourceDialog', locale => {
			const button = new ButtonView( locale );
			button.set( {
				label: t( 'Source' ),
				icon: IconSource,
				tooltip: true
			} );
			button.bind( 'isEnabled' ).to( editor, 'isReadOnly', isReadOnly => !isReadOnly );
			this.listenTo( button, 'execute', () => this._showDialog() );
			return button;
		} );
	}

	_showDialog() {
		const editor = this.editor;
		const dialog = editor.plugins.get( 'Dialog' );
		const t = editor.locale.t;
		const view = new SourceDialogView( editor.locale );

		view.render();
		view.setValue( editor.getData() );

		dialog.show( {
			id: 'xerteSourceDialog',
			icon: IconSource,
			title: t( 'Source' ),
			isModal: true,
			content: view,
			actionButtons: [
				{
					label: t( 'Cancel' ),
					withText: true,
					onExecute: () => dialog.hide()
				},
				{
					label: t( 'Save' ),
					class: 'ck-button-action',
					withText: true,
					onExecute: () => {
						editor.setData( view.getValue() );
						dialog.hide();
						editor.editing.view.focus();
					}
				}
			]
		} );
	}
}
