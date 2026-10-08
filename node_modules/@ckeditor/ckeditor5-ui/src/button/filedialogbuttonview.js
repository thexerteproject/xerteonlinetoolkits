/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/button/filedialogbuttonview
 */
import { View } from '../view.js';
import { ButtonView } from './buttonview.js';
import { ListItemButtonView } from './listitembuttonview.js';
/**
 * The file dialog button view.
 *
 * This component provides a button that opens the native file selection dialog.
 * It can be used to implement the UI of a file upload feature.
 *
 * ```ts
 * const view = new FileDialogButtonView( locale );
 *
 * view.set( {
 * 	acceptedType: 'image/*',
 * 	allowMultipleFiles: true
 * 	label: t( 'Insert image' ),
 * 	icon: imageIcon,
 * 	tooltip: true
 * } );
 *
 * view.on( 'done', ( evt, files ) => {
 * 	for ( const file of Array.from( files ) ) {
 * 		console.log( 'Selected file', file );
 * 	}
 * } );
 * ```
 */
export class FileDialogButtonView extends /* #__PURE__ */ FileDialogViewMixin(ButtonView) {
}
/**
 * The file dialog button view used in a lists.
 *
 * This component provides a button that opens the native file selection dialog.
 * It can be used to implement the UI of a file upload feature.
 *
* ```ts
 * const view = new FileDialogListItemButtonView( locale );
 *
 * view.set( {
 * 	acceptedType: 'image/*',
 * 	allowMultipleFiles: true
 * 	label: t( 'Insert image' ),
 * 	icon: imageIcon,
 * 	tooltip: true
 * } );
 *
 * view.on( 'done', ( evt, files ) => {
 * 	for ( const file of Array.from( files ) ) {
 * 		console.log( 'Selected file', file );
 * 	}
 * } );
 * ```
 */
export class FileDialogListItemButtonView extends /* #__PURE__ */ FileDialogViewMixin(ListItemButtonView) {
}
/**
 * Mixin function that enhances a base button view class with file dialog functionality. It is used
 * to create a button view class that opens the native select file dialog when clicked.
 *
 * The enhanced view includes a button and a hidden file input. When the button is clicked, the file dialog is opened.
 * The mixin adds properties and methods to the base class to handle the file selection.
 *
 * @param view The base class to be enhanced with file dialog functionality.
 * @returns A new class that extends the base class and includes the file dialog functionality.
 */
export function FileDialogViewMixin(view) {
    class FileDialogView extends view {
        /**
         * A hidden `<input>` view used to execute file dialog.
         */
        _fileInputView;
        /**
         * @inheritDoc
         */
        constructor(...args) {
            super(...args);
            this._fileInputView = new FileInputView(this.locale);
            this._fileInputView.bind('acceptedType').to(this);
            this._fileInputView.bind('allowMultipleFiles').to(this);
            this._fileInputView.delegate('done').to(this);
            this.on('execute', () => {
                this._fileInputView.open();
            });
            this.extendTemplate({
                attributes: {
                    class: 'ck-file-dialog-button'
                }
            });
        }
        /**
         * @inheritDoc
         */
        render() {
            super.render();
            this.children.add(this._fileInputView);
        }
    }
    return FileDialogView;
}
/**
 * The hidden file input view class.
 */
class FileInputView extends View {
    /**
     * @inheritDoc
     */
    constructor(locale) {
        super(locale);
        this.set('acceptedType', undefined);
        this.set('allowMultipleFiles', false);
        const bind = this.bindTemplate;
        this.setTemplate({
            tag: 'input',
            attributes: {
                class: [
                    'ck-hidden'
                ],
                type: 'file',
                tabindex: '-1',
                accept: bind.to('acceptedType'),
                multiple: bind.to('allowMultipleFiles')
            },
            on: {
                // Removing from code coverage since we cannot programmatically set input element files.
                change: bind.to(/* istanbul ignore next -- @preserve */ () => {
                    if (this.element?.files?.length) {
                        this.fire('done', this.element.files);
                    }
                    this.element.value = '';
                })
            }
        });
    }
    /**
     * Opens file dialog.
     */
    open() {
        this.element.click();
    }
}
