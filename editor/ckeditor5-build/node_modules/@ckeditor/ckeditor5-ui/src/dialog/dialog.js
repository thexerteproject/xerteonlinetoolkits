/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import { DialogView, DialogViewPosition } from './dialogview.js';
/**
 * The dialog controller class. It is used to show and hide the {@link module:ui/dialog/dialogview~DialogView}.
 */
export class Dialog extends Plugin {
    /**
     * The currently visible dialog view instance.
     */
    view;
    /**
     * The `Dialog` plugin instance which most recently showed the dialog.
     *
     * Only one dialog can be visible at once, even if there are many editor instances on the page.
     * If an editor wants to show a dialog, it should first hide the dialog that is already opened.
     * But only the `Dialog` instance that showed the dialog is able able to properly hide it.
     * This is why we need to store it in a globally available space (static property).
     * This way every `Dialog` plugin in every editor is able to correctly close any open dialog window.
     */
    static _visibleDialogPlugin;
    /**
     * A configurable callback called when the dialog is hidden.
     */
    _onHide;
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'Dialog';
    }
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin() {
        return true;
    }
    /**
     * @inheritDoc
     */
    constructor(editor) {
        super(editor);
        const t = editor.t;
        this._initShowHideListeners();
        this._initFocusToggler();
        this._initMultiRootIntegration();
        this.set({
            id: null,
            isOpen: false
        });
        // Add the information about the keystroke to the accessibility database.
        editor.accessibility.addKeystrokeInfos({
            categoryId: 'navigation',
            keystrokes: [{
                    label: t('Move focus in and out of an active dialog window'),
                    keystroke: 'Ctrl+F6',
                    mayRequireFn: true
                }]
        });
    }
    /**
     * @inheritDoc
     */
    destroy() {
        super.destroy();
        if (Dialog._visibleDialogPlugin === this) {
            this._unlockBodyScroll();
        }
    }
    /**
     * Initiates listeners for the `show` and `hide` events emitted by this plugin.
     *
     * We could not simply decorate the {@link #show} and {@link #hide} methods to fire events,
     * because they would be fired in the wrong order &ndash; first would be `show` and then `hide`
     * (because showing the dialog actually starts with hiding the previously visible one).
     * Hence, we added private methods {@link #_show} and {@link #_hide} which are called on events
     * in the desired sequence.
     */
    _initShowHideListeners() {
        this.on('show', (evt, args) => {
            this._show(args);
        });
        // 'low' priority allows to add custom callback between `_show()` and `onShow()`.
        this.on('show', (evt, args) => {
            if (args.onShow) {
                args.onShow(this);
            }
        }, { priority: 'low' });
        this.on('hide', () => {
            if (Dialog._visibleDialogPlugin) {
                Dialog._visibleDialogPlugin._hide();
            }
        });
        // 'low' priority allows to add custom callback between `_hide()` and `onHide()`.
        this.on('hide', () => {
            if (this._onHide) {
                this._onHide(this);
                this._onHide = undefined;
            }
        }, { priority: 'low' });
    }
    /**
     * Initiates keystroke handler for toggling the focus between the editor and the dialog view.
     */
    _initFocusToggler() {
        const editor = this.editor;
        editor.keystrokes.set('Ctrl+F6', (data, cancel) => {
            if (!this.isOpen || this.view.isModal) {
                return;
            }
            if (this.view.focusTracker.isFocused) {
                editor.editing.view.focus();
            }
            else {
                this.view.focus();
            }
            cancel();
        });
    }
    /**
     * Provides an integration between the root attaching and detaching and positioning of the view.
     */
    _initMultiRootIntegration() {
        const model = this.editor.model;
        model.document.on('change:data', () => {
            if (!this.view) {
                return;
            }
            const changedRoots = model.document.differ.getChangedRoots();
            for (const changes of changedRoots) {
                if (changes.state) {
                    this.view.updatePosition();
                }
            }
        });
    }
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
    show(dialogDefinition) {
        this.hide();
        this.fire(`show:${dialogDefinition.id}`, dialogDefinition);
    }
    /**
     * Handles creating the {@link module:ui/dialog/dialogview~DialogView} instance and making it visible.
     */
    _show({ id, icon, title, hasCloseButton = true, content, actionButtons, className, isModal, position, onHide, keystrokeHandlerOptions }) {
        const editor = this.editor;
        this.view = new DialogView(editor.locale, {
            getCurrentDomRoot: () => {
                return editor.editing.view.getDomRoot(editor.model.document.selection.anchor.root.rootName);
            },
            getViewportOffset: () => {
                return editor.ui.viewportOffset;
            },
            keystrokeHandlerOptions
        });
        const view = this.view;
        view.on('close', () => {
            this.hide();
        });
        editor.ui.view.body.add(view);
        editor.keystrokes.listenTo(view.element);
        // Unless the user specified a position, modals should always be centered on the screen.
        // Otherwise, let's keep dialogs centered in the editing root by default.
        if (!position) {
            position = isModal ? DialogViewPosition.SCREEN_CENTER : DialogViewPosition.EDITOR_CENTER;
        }
        if (isModal) {
            this._lockBodyScroll();
        }
        view.set({
            position,
            _isVisible: true,
            className,
            isModal
        });
        view.setupParts({
            icon,
            title,
            hasCloseButton,
            content,
            actionButtons
        });
        this.id = id;
        if (onHide) {
            this._onHide = onHide;
        }
        this.isOpen = true;
        Dialog._visibleDialogPlugin = this;
    }
    /**
     * Hides the dialog. This method is decorated to enable interacting on the {@link ~DialogHideEvent hide event}.
     *
     * See {@link #show}.
     */
    hide() {
        if (Dialog._visibleDialogPlugin) {
            Dialog._visibleDialogPlugin.fire(`hide:${Dialog._visibleDialogPlugin.id}`);
        }
    }
    /**
     * Destroys the {@link module:ui/dialog/dialogview~DialogView} and cleans up the stored dialog state.
     */
    _hide() {
        if (!this.view) {
            return;
        }
        const editor = this.editor;
        const view = this.view;
        if (view.isModal) {
            this._unlockBodyScroll();
        }
        // Reset the content view to prevent its children from being destroyed in the standard
        // View#destroy() (and collections) chain. If the content children were left in there,
        // they would have to be re-created by the feature using the dialog every time the dialog
        // shows up.
        if (view.contentView) {
            view.contentView.reset();
        }
        editor.ui.view.body.remove(view);
        editor.ui.focusTracker.remove(view.element);
        editor.keystrokes.stopListening(view.element);
        view.destroy();
        editor.editing.view.focus();
        this.id = null;
        this.isOpen = false;
        Dialog._visibleDialogPlugin = null;
    }
    /**
     * Makes the <body> unscrollable (e.g. when the modal shows up).
     */
    _lockBodyScroll() {
        document.documentElement.classList.add('ck-dialog-scroll-locked');
    }
    /**
     * Makes the <body> scrollable again (e.g. once the modal hides).
     */
    _unlockBodyScroll() {
        document.documentElement.classList.remove('ck-dialog-scroll-locked');
    }
}
