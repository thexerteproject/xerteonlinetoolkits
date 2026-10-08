/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/colorselector/colorpickerfragmentview
 */
import { View } from '../view.js';
import { ButtonView } from '../button/buttonview.js';
import { ColorPickerView } from '../colorpicker/colorpickerview.js';
import { IconCancel, IconCheck } from '@ckeditor/ckeditor5-icons';
/**
 * One of the fragments of {@link module:ui/colorselector/colorselectorview~ColorSelectorView}.
 *
 * It allows users to select a color from a color picker.
 *
 * It consists of the following sub–components:
 *
 * * A color picker saturation and hue sliders,
 * * A text input accepting colors in HEX format,
 * * "Save" and "Cancel" action buttons.
 */
export class ColorPickerFragmentView extends View {
    /**
     * A collection of component's children.
     */
    items;
    /**
     * A view with saturation and hue sliders and color input.
     */
    colorPickerView;
    /**
     * The "Save" button view.
     */
    saveButtonView;
    /**
     * The "Cancel" button view.
     */
    cancelButtonView;
    /**
     * The action bar where are "Save" button and "Cancel" button.
     */
    actionBarView;
    /**
     * Tracks information about the DOM focus in the list.
     */
    focusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    keystrokes;
    /**
     * A collection of views that can be focused in the view.
     *
     * @readonly
     */
    _focusables;
    /**
     * A reference to the configuration of {@link #colorPickerView}. `false` when the view was
     * configured without a color picker.
     *
     * @readonly
     */
    _colorPickerViewConfig;
    /**
     * Creates an instance of the view.
     *
     * @param locale The localization services instance.
     * @param options Constructor options.
     * @param options.focusTracker Tracks information about the DOM focus in the list.
     * @param options.focusables A collection of views that can be focused in the view.
     * @param options.keystrokes An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     * @param options.colorPickerViewConfig The configuration of color picker feature. If set to `false`, the color picker
     * will not be rendered.
     */
    constructor(locale, { focusTracker, focusables, keystrokes, colorPickerViewConfig }) {
        super(locale);
        this.items = this.createCollection();
        this.focusTracker = focusTracker;
        this.keystrokes = keystrokes;
        this.set('isVisible', false);
        this.set('selectedColor', undefined);
        this._focusables = focusables;
        this._colorPickerViewConfig = colorPickerViewConfig;
        const bind = this.bindTemplate;
        const { saveButtonView, cancelButtonView } = this._createActionButtons();
        this.saveButtonView = saveButtonView;
        this.cancelButtonView = cancelButtonView;
        this.actionBarView = this._createActionBarView({ saveButtonView, cancelButtonView });
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck-color-picker-fragment',
                    bind.if('isVisible', 'ck-hidden', value => !value)
                ]
            },
            children: this.items
        });
    }
    /**
     * @inheritDoc
     */
    render() {
        super.render();
        const colorPickerView = new ColorPickerView(this.locale, {
            ...this._colorPickerViewConfig
        });
        this.colorPickerView = colorPickerView;
        this.colorPickerView.render();
        if (this.selectedColor) {
            colorPickerView.color = this.selectedColor;
        }
        this.listenTo(this, 'change:selectedColor', (evt, name, value) => {
            colorPickerView.color = value;
        });
        this.items.add(this.colorPickerView);
        this.items.add(this.actionBarView);
        this._addColorPickersElementsToFocusTracker();
        this._stopPropagationOnArrowsKeys();
        this._executeOnEnterPress();
        this._executeUponColorChange();
    }
    /**
     * @inheritDoc
     */
    destroy() {
        super.destroy();
    }
    /**
     * Focuses the color picker.
     */
    focus() {
        this.colorPickerView.focus();
    }
    /**
     * Reset validation messages.
     */
    resetValidationStatus() {
        this.colorPickerView.resetValidationStatus();
    }
    /**
     * When color picker is focused and "enter" is pressed it executes command.
     */
    _executeOnEnterPress() {
        this.keystrokes.set('enter', evt => {
            if (this.isVisible && this.focusTracker.focusedElement !== this.cancelButtonView.element && this.colorPickerView.isValid()) {
                this.fire('execute', {
                    value: this.selectedColor
                });
                evt.stopPropagation();
                evt.preventDefault();
            }
        });
    }
    /**
     * Removes default behavior of arrow keys in dropdown.
     */
    _stopPropagationOnArrowsKeys() {
        const stopPropagation = (data) => data.stopPropagation();
        this.keystrokes.set('arrowright', stopPropagation);
        this.keystrokes.set('arrowleft', stopPropagation);
        this.keystrokes.set('arrowup', stopPropagation);
        this.keystrokes.set('arrowdown', stopPropagation);
    }
    /**
     * Adds color picker elements to focus tracker.
     */
    _addColorPickersElementsToFocusTracker() {
        for (const slider of this.colorPickerView.slidersView) {
            this.focusTracker.add(slider.element);
            this._focusables.add(slider);
        }
        const input = this.colorPickerView.hexInputRow.children.get(1);
        if (input.element) {
            this.focusTracker.add(input.element);
            this._focusables.add(input);
        }
        this.focusTracker.add(this.saveButtonView.element);
        this._focusables.add(this.saveButtonView);
        this.focusTracker.add(this.cancelButtonView.element);
        this._focusables.add(this.cancelButtonView);
    }
    /**
     * Creates bar containing "Save" and "Cancel" buttons.
     */
    _createActionBarView({ saveButtonView, cancelButtonView }) {
        const actionBarRow = new View();
        const children = this.createCollection();
        children.add(saveButtonView);
        children.add(cancelButtonView);
        actionBarRow.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-color-selector_action-bar'
                ]
            },
            children
        });
        return actionBarRow;
    }
    /**
     * Creates "Save" and "Cancel" buttons.
     */
    _createActionButtons() {
        const locale = this.locale;
        const t = locale.t;
        const saveButtonView = new ButtonView(locale);
        const cancelButtonView = new ButtonView(locale);
        saveButtonView.set({
            icon: IconCheck,
            class: 'ck-button-save',
            type: 'button',
            withText: false,
            label: t('Accept')
        });
        cancelButtonView.set({
            icon: IconCancel,
            class: 'ck-button-cancel',
            type: 'button',
            withText: false,
            label: t('Cancel')
        });
        saveButtonView.on('execute', () => {
            if (this.colorPickerView.isValid()) {
                this.fire('execute', {
                    source: 'colorPickerSaveButton',
                    value: this.selectedColor
                });
            }
        });
        cancelButtonView.on('execute', () => {
            this.fire('colorPicker:cancel');
        });
        return {
            saveButtonView, cancelButtonView
        };
    }
    /**
     * Fires the `execute` event if color in color picker has been changed
     * by the user.
     */
    _executeUponColorChange() {
        this.colorPickerView.on('colorSelected', (evt, data) => {
            this.fire('execute', {
                value: data.color,
                source: 'colorPicker'
            });
            this.set('selectedColor', data.color);
        });
    }
}
