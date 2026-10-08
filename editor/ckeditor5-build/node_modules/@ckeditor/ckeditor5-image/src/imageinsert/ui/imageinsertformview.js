/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module image/imageinsert/ui/imageinsertformview
 */
import { View, ViewCollection, submitHandler, FocusCycler, CollapsibleView } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler } from 'ckeditor5/src/utils.js';
import '../../../theme/imageinsert.css';
/**
 * The view displayed in the insert image dropdown.
 *
 * See {@link module:image/imageinsert/imageinsertui~ImageInsertUI}.
 *
 * @internal
 */
export class ImageInsertFormView extends View {
    /**
     * Tracks information about DOM focus in the form.
     */
    focusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    keystrokes;
    /**
     * A collection of views that can be focused in the form.
     */
    _focusables;
    /**
     * Helps cycling over {@link #_focusables} in the form.
     */
    _focusCycler;
    /**
     * A collection of the defined integrations for inserting the images.
     */
    children;
    /**
     * Creates a view for the dropdown panel of {@link module:image/imageinsert/imageinsertui~ImageInsertUI}.
     *
     * @param locale The localization services instance.
     * @param integrations An integrations object that contains components (or tokens for components) to be shown in the panel view.
     */
    constructor(locale, integrations = []) {
        super(locale);
        this.focusTracker = new FocusTracker();
        this.keystrokes = new KeystrokeHandler();
        this._focusables = new ViewCollection();
        this.children = this.createCollection();
        this._focusCycler = new FocusCycler({
            focusables: this._focusables,
            focusTracker: this.focusTracker,
            keystrokeHandler: this.keystrokes,
            actions: {
                // Navigate form fields backwards using the Shift + Tab keystroke.
                focusPrevious: 'shift + tab',
                // Navigate form fields forwards using the Tab key.
                focusNext: 'tab'
            }
        });
        for (const view of integrations) {
            this.children.add(view);
            this._focusables.add(view);
            if (view instanceof CollapsibleView) {
                this._focusables.addMany(view.children);
            }
        }
        this.setTemplate({
            tag: 'form',
            attributes: {
                class: [
                    'ck',
                    'ck-image-insert-form'
                ],
                tabindex: -1
            },
            children: this.children
        });
    }
    /**
     * @inheritDoc
     */
    render() {
        super.render();
        submitHandler({
            view: this
        });
        for (const view of this._focusables) {
            this.focusTracker.add(view.element);
        }
        // Start listening for the keystrokes coming from #element.
        this.keystrokes.listenTo(this.element);
        const stopPropagation = (data) => data.stopPropagation();
        // Since the form is in the dropdown panel which is a child of the toolbar, the toolbar's
        // keystroke handler would take over the key management in the URL input. We need to prevent
        // this ASAP. Otherwise, the basic caret movement using the arrow keys will be impossible.
        this.keystrokes.set('arrowright', stopPropagation);
        this.keystrokes.set('arrowleft', stopPropagation);
        this.keystrokes.set('arrowup', stopPropagation);
        this.keystrokes.set('arrowdown', stopPropagation);
    }
    /**
     * @inheritDoc
     */
    destroy() {
        super.destroy();
        this.focusTracker.destroy();
        this.keystrokes.destroy();
    }
    /**
     * Focuses the first {@link #_focusables focusable} in the form.
     */
    focus() {
        this._focusCycler.focusFirst();
    }
}
