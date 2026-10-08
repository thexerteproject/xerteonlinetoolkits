/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/dialog/dialog
 */
import { type View } from '../view.js';
import { type Editor, Plugin } from '@ckeditor/ckeditor5-core';
import { DialogView, DialogViewPosition } from './dialogview.js';
import type { DialogActionButtonDefinition } from './dialogactionsview.js';
import type { KeystrokeHandlerOptions, Rect } from '@ckeditor/ckeditor5-utils';
/**
 * The dialog controller class. It is used to show and hide the {@link module:ui/dialog/dialogview~DialogView}.
 */
export declare class Dialog extends Plugin {
    /**
     * The name of the currently visible dialog view instance.
     *
     * @observable
     */
    id: string | null;
    /**
     * The currently visible dialog view instance.
     */
    view?: DialogView;
    /**
     * The `Dialog` plugin instance which most recently showed the dialog.
     *
     * Only one dialog can be visible at once, even if there are many editor instances on the page.
     * If an editor wants to show a dialog, it should first hide the dialog that is already opened.
     * But only the `Dialog` instance that showed the dialog is able able to properly hide it.
     * This is why we need to store it in a globally available space (static property).
     * This way every `Dialog` plugin in every editor is able to correctly close any open dialog window.
     */
    private static _visibleDialogPlugin;
    /**
     * A flag indicating whether the dialog is currently visible.
     *
     * @observable
     */
    isOpen: boolean;
    /**
     * A configurable callback called when the dialog is hidden.
     */
    private _onHide;
    /**
     * @inheritDoc
     */
    static get pluginName(): "Dialog";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Initiates listeners for the `show` and `hide` events emitted by this plugin.
     *
     * We could not simply decorate the {@link #show} and {@link #hide} methods to fire events,
     * because they would be fired in the wrong order &ndash; first would be `show` and then `hide`
     * (because showing the dialog actually starts with hiding the previously visible one).
     * Hence, we added private methods {@link #_show} and {@link #_hide} which are called on events
     * in the desired sequence.
     */
    private _initShowHideListeners;
    /**
     * Initiates keystroke handler for toggling the focus between the editor and the dialog view.
     */
    private _initFocusToggler;
    /**
     * Provides an integration between the root attaching and detaching and positioning of the view.
     */
    private _initMultiRootIntegration;
    /**
     * Displays a dialog window.
     *
     * This method requires a {@link ~DialogDefinition} that defines the dialog's content, title, icon, action buttons, etc.
     *
     * For example, the following definition will create a dialog with:
     * * A header consisting of an icon, a title, and a "Close" button (it is added by default).
     * * A content consisting of a view with a single paragraph.
     * * A footer consisting of two buttons: "Yes" and "No".
     *
     * ```js
     * // Create the view that will be used as the dialog's content.
     * const textView = new View( locale );
     *
     * textView.setTemplate( {
     * 	tag: 'div',
     * 	attributes: {
     * 		style: {
     * 			padding: 'var(--ck-spacing-large)',
     * 			whiteSpace: 'initial',
     * 			width: '100%',
     * 			maxWidth: '500px'
     * 		},
     * 		tabindex: -1
     * 	},
     * 	children: [
     * 		'Lorem ipsum dolor sit amet...'
     * 	]
     * } );
     *
     * // Show the dialog.
     * editor.plugins.get( 'Dialog' ).show( {
     *	id: 'myDialog',
     * 	icon: 'myIcon', // This should be an SVG string.
     * 	title: 'My dialog',
     * 	content: textView,
     * 	actionButtons: [
     *		{
     *			label: t( 'Yes' ),
     *			class: 'ck-button-action',
     *			withText: true,
     *			onExecute: () => dialog.hide()
     *		},
     *		{
     *			label: t( 'No' ),
     *			withText: true,
     *			onExecute: () => dialog.hide()
     *		}
     *	]
     * } );
     * ```
     *
     * By specifying the {@link ~DialogDefinition#onShow} and {@link ~DialogDefinition#onHide} callbacks
     * it is also possible to add callbacks that will be called when the dialog is shown or hidden.
     *
     * For example, the callbacks in the following definition:
     * * Disable the default behavior of the <kbd>Esc</kbd> key.
     * * Fire a custom event when the dialog gets hidden.
     *
     * ```js
     * editor.plugins.get( 'Dialog' ).show( {
     * 	// ...
     * 	onShow: dialog => {
     * 		dialog.view.on( 'close', ( evt, data ) => {
     * 			// Only prevent the event from the "Esc" key - do not affect the other ways of closing the dialog.
     * 			if ( data.source === 'escKeyPress' ) {
     * 				evt.stop();
     * 			}
     * 		} );
     * 	},
     * 	onHide: dialog => {
     * 		dialog.fire( 'dialogDestroyed' );
     * 	}
     * } );
     * ```
     *
     * Internally, calling this method:
     * 1. Hides the currently visible dialog (if any) calling the {@link #hide} method
     * (fires the {@link ~DialogHideEvent hide event}).
     * 2. Fires the {@link ~DialogShowEvent show event} which allows for adding callbacks that customize the
     * behavior of the dialog.
     * 3. Shows the dialog.
     */
    show(dialogDefinition: DialogDefinition): void;
    /**
     * Handles creating the {@link module:ui/dialog/dialogview~DialogView} instance and making it visible.
     */
    private _show;
    /**
     * Hides the dialog. This method is decorated to enable interacting on the {@link ~DialogHideEvent hide event}.
     *
     * See {@link #show}.
     */
    hide(): void;
    /**
     * Destroys the {@link module:ui/dialog/dialogview~DialogView} and cleans up the stored dialog state.
     */
    private _hide;
    /**
     * Makes the <body> unscrollable (e.g. when the modal shows up).
     */
    private _lockBodyScroll;
    /**
     * Makes the <body> scrollable again (e.g. once the modal hides).
     */
    private _unlockBodyScroll;
}
/**
 * The definition that describes a dialog window and its content. Passed to the {@link module:ui/dialog/dialog~Dialog#show} method.
 */
export interface DialogDefinition {
    /**
     * A unique identifier of the dialog. It allows for distinguishing between different dialogs and their visibility.
     * For instance, when open, the ID of the currently visible dialog is stored in {@link module:ui/dialog/dialog~Dialog#id}.
     *
     * The `id` is also passed along the {@link module:ui/dialog/dialog~DialogShowEvent} and {@link module:ui/dialog/dialog~DialogHideEvent}
     * events.
     */
    id: string;
    /**
     * The SVG string of an icon displayed in dialogs's header. Used only when {@link #title} is also set
     * and the header is displayed.
     *
     * See more in {@link module:ui/icon/iconview~IconView#content}.
     */
    icon?: string;
    /**
     * A title displayed in the dialogs's header. It also works as an accessible name of the dialog used by assistive technologies.
     *
     * When not set, the header is not displayed. Affects {@link #icon} and {@link #hasCloseButton}.
     */
    title?: string;
    /**
     * A flag indicating whether the dialog should have a close button in the header.
     * `true` by default. Works when {@link #title} is also set and the header is displayed.
     *
     * **Note**: If you hide the close button, make sure that the dialog can be closed in another way.
     */
    hasCloseButton?: boolean;
    /**
     * The content of the dialog. It can be a single {@link module:ui/view~View} or an array of views.
     */
    content?: View | Array<View>;
    /**
     * The action buttons displayed in the dialog's footer.
     */
    actionButtons?: Array<DialogActionButtonDefinition>;
    /**
     * An additional CSS class set on the outermost (`.ck.ck-dialog`) container element allowing for visual customization.
     */
    className?: string;
    /**
     * When set to `true`, the dialog will become a modal, that is, it will block the UI until it is closed.
     */
    isModal?: boolean;
    /**
     * Available dialog positions. By default `DialogViewPosition.EDITOR_CENTER` is used for {@link #isModal non-modals}
     * and `DialogViewPosition.SCREEN_CENTER` for modals.
     *
     * If set to a function, it will be called with the DOM root Rect and the dialog Rect as arguments.
     * It should return the coordinates of the dialog's position.
     *
     * {@link module:ui/dialog/dialogview#DialogViewPosition Learn more} about available positions.
     */
    position?: typeof DialogViewPosition[keyof typeof DialogViewPosition] | null | ((dialogRect: Rect, domRootRect?: Rect | null) => {
        left: number;
        top: number;
    } | null);
    /**
     * A callback called when the dialog shows up with a `low` priority. It allows for setting up the dialog's {@link #content}.
     */
    onShow?: (dialog: Dialog) => void;
    /**
     * A callback called when the dialog hides with a `low` priority.
     * It allows for cleaning up (for example, resetting) the dialog's {@link #content}.
     */
    onHide?: (dialog: Dialog) => void;
    /**
     * Options that will be passed to the {@link module:utils/keystrokehandler~KeystrokeHandler keystroke handler} of the dialog view.
     *
     * See {@link module:utils/keystrokehandler~KeystrokeHandlerOptions KeystrokeHandlerOptions} to learn more about the available options.
     */
    keystrokeHandlerOptions?: KeystrokeHandlerOptions;
}
/**
 * An event fired after {@link module:ui/dialog/dialog~Dialog#show} is called. You can use it to customize the behavior
 * of any dialog.
 *
 * ```js
 * import { DialogViewPosition } from 'ckeditor5/src/ui.js';
 *
 * // ...
 *
 * // Changes the position of the "Find and Replace" dialog.
 * editor.plugins.get( 'Dialog' ).on( 'show:findAndReplace', ( evt, data ) => {
 * 	Object.assign( data, { position: DialogViewPosition.EDITOR_BOTTOM_CENTER } );
 * }, { priority: 'high' } );
 * ```
 *
 * @eventName ~Dialog#show
 */
export type DialogShowEvent = {
    name: 'show' | `show:${string}`;
    args: [dialogDefinition: DialogDefinition];
};
/**
 * An event fired after {@link module:ui/dialog/dialog~Dialog#hide} is called. You can use it to customize the behavior
 * of any dialog.
 *
 * ```js
 * // Logs after the "Find and Replace" dialog gets hidden
 * editor.plugins.get( 'Dialog' ).on( 'hide:findAndReplace', () => {
 * 	console.log( 'The "Find and Replace" dialog was hidden.' );
 * } );
 * ```
 *
 * @eventName ~Dialog#hide
 */
export type DialogHideEvent = {
    name: 'hide' | `hide:${string}`;
    args: [];
};
