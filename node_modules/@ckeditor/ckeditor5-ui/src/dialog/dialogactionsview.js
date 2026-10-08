/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/dialog/dialogactionsview
 */
import { FocusTracker, KeystrokeHandler } from '@ckeditor/ckeditor5-utils';
import { ButtonView } from '../button/buttonview.js';
import { View } from '../view.js';
import { ViewCollection } from '../viewcollection.js';
import { FocusCycler } from '../focuscycler.js';
import '../../theme/components/dialog/dialogactions.css';
/**
 * A dialog actions view class. It contains button views which are used to execute dialog actions.
 */
export class DialogActionsView extends View {
    /**
     * A collection of button views.
     */
    children;
    /**
     * A keystroke handler instance.
     */
    keystrokes;
    /**
     * A focus cycler instance.
     */
    focusCycler;
    /**
     * A focus tracker instance.
     */
    _focusTracker;
    /**
     * A collection of focusable views.
     */
    _focusables;
    /**
     * @inheritDoc
     */
    constructor(locale) {
        super(locale);
        this.children = this.createCollection();
        this.keystrokes = new KeystrokeHandler();
        this._focusTracker = new FocusTracker();
        this._focusables = new ViewCollection();
        this.focusCycler = new FocusCycler({
            focusables: this._focusables,
            focusTracker: this._focusTracker,
            keystrokeHandler: this.keystrokes,
            actions: {
                // Navigate form fields backwards using the Shift + Tab keystroke.
                focusPrevious: 'shift + tab',
                // Navigate form fields forwards using the Tab key.
                focusNext: 'tab'
            }
        });
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-dialog__actions'
                ]
            },
            children: this.children
        });
    }
    /**
     * @inheritDoc
     */
    render() {
        super.render();
        this.keystrokes.listenTo(this.element);
    }
    /**
     * Creates the button views based on the given definitions.
     * Then adds them to the {@link #children} collection and to the focus cycler.
     */
    setButtons(definitions) {
        for (const definition of definitions) {
            const button = new ButtonView(this.locale);
            let property;
            button.on('execute', () => definition.onExecute());
            if (definition.onCreate) {
                definition.onCreate(button);
            }
            for (property in definition) {
                if (property != 'onExecute' && property != 'onCreate') {
                    button.set(property, definition[property]);
                }
            }
            this.children.add(button);
        }
        this._updateFocusCyclableItems();
    }
    /**
     * @inheritDoc
     */
    focus(direction) {
        if (direction === -1) {
            this.focusCycler.focusLast();
        }
        else {
            this.focusCycler.focusFirst();
        }
    }
    /**
     * Adds all elements from the {@link #children} collection to the {@link #_focusables} collection
     * and to the {@link #_focusTracker} instance.
     */
    _updateFocusCyclableItems() {
        Array.from(this.children).forEach(v => {
            this._focusables.add(v);
            this._focusTracker.add(v.element);
        });
    }
}
