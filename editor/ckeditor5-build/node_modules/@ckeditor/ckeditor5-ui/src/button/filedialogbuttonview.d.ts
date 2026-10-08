/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/button/filedialogbuttonview
 */
import { View } from '../view.js';
import { ButtonView } from './buttonview.js';
import type { Constructor, Mixed } from '@ckeditor/ckeditor5-utils';
import { ListItemButtonView } from './listitembuttonview.js';
declare const FileDialogButtonView_base: Mixed<typeof ButtonView, FileDialogButtonViewBase>;
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
export declare class FileDialogButtonView extends /* #__PURE__ */ FileDialogButtonView_base {
}
declare const FileDialogListItemButtonView_base: Mixed<typeof ListItemButtonView, FileDialogButtonViewBase>;
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
export declare class FileDialogListItemButtonView extends /* #__PURE__ */ FileDialogListItemButtonView_base {
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
export declare function FileDialogViewMixin<Base extends Constructor<ButtonView>>(view: Base): Mixed<Base, FileDialogButtonViewBase>;
/**
 * Represents the base view for a file dialog button component.
 */
export type FileDialogButtonViewBase = View & {
    /**
     * Accepted file types. Can be provided in form of file extensions, media type or one of:
     * * `audio/*`,
     * * `video/*`,
     * * `image/*`.
     *
     * @observable
     */
    acceptedType: string;
    /**
     * Indicates if multiple files can be selected. Defaults to `true`.
     *
     * @observable
     */
    allowMultipleFiles: boolean;
};
/**
 * Fired when file dialog is closed with file selected.
 *
 * ```ts
 * view.on( 'done', ( evt, files ) => {
 * 	for ( const file of files ) {
 * 		console.log( 'Selected file', file );
 * 	}
 * }
 * ```
 */
export type FileInputViewDoneEvent = {
    name: 'done';
    args: [files: FileList];
};
export {};
