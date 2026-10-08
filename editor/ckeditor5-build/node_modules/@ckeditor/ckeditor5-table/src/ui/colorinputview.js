/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/ui/colorinputview
 */
import { View, InputTextView, createDropdown, FocusCycler, ViewCollection, ColorSelectorView } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler } from 'ckeditor5/src/utils.js';
import '../../theme/colorinput.css';
/**
 * The color input view class. It allows the user to type in a color (hex, rgb, etc.)
 * or choose it from the configurable color palette with a preview.
 *
 * @internal
 */
export class ColorInputView extends View {
    /**
     * A cached reference to the options passed to the constructor.
     */
    options;
    /**
     * Tracks information about the DOM focus in the view.
     */
    focusTracker;
    /**
     * Helps cycling over focusable children in the input view.
     */
    focusCycler;
    /**
     * A collection of views that can be focused in the view.
     */
    _focusables;
    /**
     * An instance of the dropdown allowing to select a color from a grid.
     */
    dropdownView;
    /**
     * An instance of the input allowing the user to type a color value.
     */
    inputView;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    keystrokes;
    /**
     * The flag that indicates whether the user is still typing.
     * If set to true, it means that the text input field ({@link #inputView}) still has the focus.
     * So, we should interrupt the user by replacing the input's value.
     */
    _stillTyping;
    /**
     * Creates an instance of the color input view.
     *
     * @param locale The locale instance.
     * @param options The input options.
     * @param options.colorDefinitions The colors to be displayed in the palette inside the input's dropdown.
     * @param options.columns The number of columns in which the colors will be displayed.
     * @param options.defaultColorValue If specified, the color input view will replace the "Remove color" button with
     * the "Restore default" button. Instead of clearing the input field, the default color value will be set.
     */
    constructor(locale, options) {
        super(locale);
        this.set('value', '');
        this.set('isReadOnly', false);
        this.set('isFocused', false);
        this.set('isEmpty', true);
        this.options = options;
        this.focusTracker = new FocusTracker();
        this._focusables = new ViewCollection();
        this.dropdownView = this._createDropdownView();
        this.inputView = this._createInputTextView();
        this.keystrokes = new KeystrokeHandler();
        this._stillTyping = false;
        this.focusCycler = new FocusCycler({
            focusables: this._focusables,
            focusTracker: this.focusTracker,
            keystrokeHandler: this.keystrokes,
            actions: {
                // Navigate items backwards using the <kbd>Shift</kbd> + <kbd>Tab</kbd> keystroke.
                focusPrevious: 'shift + tab',
                // Navigate items forwards using the <kbd>Tab</kbd> key.
                focusNext: 'tab'
            }
        });
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-input-color'
                ]
            },
            children: [
                this.dropdownView,
                this.inputView
            ]
        });
        this.on('change:value', (evt, name, inputValue) => this._setInputValue(inputValue));
    }
    /**
     * @inheritDoc
     */
    render() {
        super.render();
        [this.inputView, this.dropdownView.buttonView].forEach(view => {
            this.focusTracker.add(view.element);
            this._focusables.add(view);
        });
        this.keystrokes.listenTo(this.element);
    }
    /**
     * Focuses the view.
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
     * @inheritDoc
     */
    destroy() {
        super.destroy();
        this.focusTracker.destroy();
        this.keystrokes.destroy();
    }
    /**
     * Creates and configures the {@link #dropdownView}.
     */
    _createDropdownView() {
        const locale = this.locale;
        const t = locale.t;
        const bind = this.bindTemplate;
        const colorSelector = this._createColorSelector(locale);
        const dropdown = createDropdown(locale);
        const colorPreview = new View();
        colorPreview.setTemplate({
            tag: 'span',
            attributes: {
                class: [
                    'ck',
                    'ck-input-color__button__preview'
                ],
                style: {
                    backgroundColor: bind.to('value')
                }
            },
            children: [{
                    tag: 'span',
                    attributes: {
                        class: [
                            'ck',
                            'ck-input-color__button__preview__no-color-indicator',
                            bind.if('value', 'ck-hidden', value => value != '')
                        ]
                    }
                }]
        });
        dropdown.buttonView.extendTemplate({
            attributes: {
                class: 'ck-input-color__button'
            }
        });
        dropdown.buttonView.children.add(colorPreview);
        dropdown.buttonView.label = t('Color picker');
        dropdown.buttonView.tooltip = true;
        dropdown.panelPosition = locale.uiLanguageDirection === 'rtl' ? 'se' : 'sw';
        dropdown.panelView.children.add(colorSelector);
        dropdown.bind('isEnabled').to(this, 'isReadOnly', value => !value);
        dropdown.on('change:isOpen', (evt, name, isVisible) => {
            if (isVisible) {
                colorSelector.updateSelectedColors();
                colorSelector.showColorGridsFragment();
            }
        });
        return dropdown;
    }
    /**
     * Creates and configures an instance of {@link module:ui/inputtext/inputtextview~InputTextView}.
     *
     * @returns A configured instance to be set as {@link #inputView}.
     */
    _createInputTextView() {
        const locale = this.locale;
        const inputView = new InputTextView(locale);
        inputView.extendTemplate({
            on: {
                blur: inputView.bindTemplate.to('blur')
            }
        });
        inputView.value = this.value;
        inputView.bind('isReadOnly', 'hasError').to(this);
        this.bind('isFocused', 'isEmpty').to(inputView);
        inputView.on('input', () => {
            const inputValue = inputView.element.value;
            // Check if the value matches one of our defined colors' label.
            const mappedColor = this.options.colorDefinitions.find(def => inputValue === def.label);
            this._stillTyping = true;
            this.value = mappedColor && mappedColor.color || inputValue;
        });
        inputView.on('blur', () => {
            this._stillTyping = false;
            this._setInputValue(inputView.element.value);
        });
        inputView.delegate('input').to(this);
        return inputView;
    }
    /**
     * Creates and configures the panel with "color grid" and "color picker" inside the {@link #dropdownView}.
     */
    _createColorSelector(locale) {
        const t = locale.t;
        const defaultColor = this.options.defaultColorValue || '';
        const removeColorButtonLabel = defaultColor ? t('Restore default') : t('Remove color');
        const colorSelector = new ColorSelectorView(locale, {
            colors: this.options.colorDefinitions,
            columns: this.options.columns,
            removeButtonLabel: removeColorButtonLabel,
            colorPickerLabel: t('Color picker'),
            colorPickerViewConfig: this.options.colorPickerConfig === false ? false : {
                ...this.options.colorPickerConfig,
                hideInput: true
            }
        });
        colorSelector.appendUI();
        colorSelector.on('execute', (evt, data) => {
            if (data.source === 'colorPickerSaveButton') {
                this.dropdownView.isOpen = false;
                return;
            }
            this.value = data.value || defaultColor;
            // Trigger the listener that actually applies the set value.
            this.fire('input');
            if (data.source !== 'colorPicker') {
                this.dropdownView.isOpen = false;
            }
        });
        /**
         * Color is saved before changes in color picker. In case "cancel button" is pressed
         * this color will be applied.
         */
        let backupColor = this.value;
        colorSelector.on('colorPicker:cancel', () => {
            /**
             * Revert color to previous value before changes in color picker.
             */
            this.value = backupColor;
            this.fire('input');
            this.dropdownView.isOpen = false;
        });
        colorSelector.colorGridsFragmentView.colorPickerButtonView.on('execute', () => {
            /**
             * Save color value before changes in color picker.
             */
            backupColor = this.value;
        });
        colorSelector.bind('selectedColor').to(this, 'value');
        return colorSelector;
    }
    /**
     * Sets {@link #inputView}'s value property to the color value or color label,
     * if there is one and the user is not typing.
     *
     * Handles cases like:
     *
     * * Someone picks the color in the grid.
     * * The color is set from the plugin level.
     *
     * @param inputValue Color value to be set.
     */
    _setInputValue(inputValue) {
        if (!this._stillTyping) {
            const normalizedInputValue = normalizeColor(inputValue);
            // Check if the value matches one of our defined colors.
            const mappedColor = this.options.colorDefinitions.find(def => normalizedInputValue === normalizeColor(def.color));
            if (mappedColor) {
                this.inputView.value = mappedColor.label;
            }
            else {
                this.inputView.value = inputValue || '';
            }
        }
    }
}
/**
 * Normalizes color value, by stripping extensive whitespace.
 * For example., transforms:
 * * `   rgb(  25 50    0 )` to `rgb(25 50 0)`,
 * * "\t  rgb(  25 ,  50,0 )		" to `rgb(25 50 0)`.
 *
 * @param colorString The value to be normalized.
 */
function normalizeColor(colorString) {
    return colorString
        // Remove any whitespace right after `(` or `,`.
        .replace(/([(,])\s+/g, '$1')
        // Remove any whitespace at the beginning or right before the end, `)`, `,`, or another whitespace.
        .replace(/^\s+|\s+(?=[),\s]|$)/g, '')
        // Then, replace `,` or whitespace with a single space.
        .replace(/,|\s/g, ' ');
}
