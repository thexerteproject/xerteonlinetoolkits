/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/colorpicker/colorpickerview
 */
import { type ColorPickerViewConfig } from './utils.js';
import type { HexColor } from '@ckeditor/ckeditor5-core';
import { type Locale } from '@ckeditor/ckeditor5-utils';
import { View } from '../view.js';
import { type InputTextView } from '../inputtext/inputtextview.js';
import { type ViewCollection } from '../viewcollection.js';
import { LabeledFieldView } from '../labeledfield/labeledfieldview.js';
import { HexBase } from 'vanilla-colorful/lib/entrypoints/hex';
import '../../theme/components/colorpicker/colorpicker.css';
declare global {
    interface HTMLElementTagNameMap {
        'hex-color-picker': HexBase;
    }
}
/**
 * A class which represents a color picker with an input field for defining custom colors.
 */
export declare class ColorPickerView extends View {
    /**
     * Element with saturation and hue sliders.
     */
    picker: HexBase;
    /**
     * Container for a `#` sign prefix and an input for displaying and defining custom colors
     * in HEX format.
     */
    hexInputRow: ColorPickerInputRowView;
    /**
     * Current color selected in the color picker. It can be set by the component itself
     * (through the palette or input) or from the outside (e.g. to reflect the current selection color).
     */
    color: string;
    /**
     * List of slider views of the color picker.
     */
    slidersView: ViewCollection<SliderView>;
    /**
     * An internal representation of a color.
     *
     * Since the picker uses a hex format, that's how we store it.
     *
     * Since this is unified color format it won't fire a change event if color is changed
     * from `#f00` to `#ff0000` (same value, different format).
     *
     * @observable
     * @private
     */
    _hexColor: string;
    /**
     * Debounced function updating the `color` property in the component
     * and firing the `ColorPickerColorSelectedEvent`. Executed whenever color in component
     * is changed by the user interaction (through the palette or input).
     *
     * @private
     */
    private _debounceColorPickerEvent;
    /**
     * A reference to the configuration of the color picker specified in the constructor.
     *
     * @private
     */
    private _config;
    /**
     * Creates a view of color picker.
     *
     * @param locale
     * @param config
     */
    constructor(locale: Locale | undefined, config?: ColorPickerViewConfig);
    /**
     * Renders color picker in the view.
     */
    render(): void;
    /**
     * Focuses the first pointer in color picker.
     *
     */
    focus(): void;
    /**
     * Creates collection of sliders in color picker.
     *
     * @private
     */
    private _createSlidersView;
    /**
     * Creates input row for defining custom colors in color picker.
     *
     * @private
     */
    private _createInputRow;
    /**
     * Creates the input where user can type or paste the color in hex format.
     *
     * @private
     */
    private _createColorInput;
    /**
     * Validates the view and returns `false` when some fields are invalid.
     */
    isValid(): boolean;
    /**
     * Cleans up the supplementary error and information text of input inside the {@link #hexInputRow}
     * bringing them back to the state when the form has been displayed for the first time.
     *
     * See {@link #isValid}.
     */
    resetValidationStatus(): void;
}
export declare class SliderView extends View {
    /**
     * @param element HTML element of slider in color picker.
     */
    constructor(element: HTMLElement);
    /**
     * Focuses element.
     */
    focus(): void;
}
export declare class ColorPickerInputRowView extends View {
    /**
     * A collection of row items (buttons, dropdowns, etc.).
     */
    readonly children: ViewCollection;
    /**
     * Hex input view element.
     */
    readonly inputView: LabeledFieldView<InputTextView>;
    /**
     * Creates an instance of the form row class.
     *
     * @param locale The locale instance.
     * @param inputView Hex color input element.
     */
    constructor(locale: Locale, inputView: LabeledFieldView<InputTextView>);
    /**
     * Returns false if color input value is not in hex format.
     */
    getParsedColor(): HexColor | null;
}
/**
 * An event fired whenever the color was selected through the color picker palette
 * or the color picker input.
 *
 * This even fires only when the user changes the color. It does not fire when the color
 * is changed programmatically, e.g. via
 * {@link module:ui/colorpicker/colorpickerview~ColorPickerView#color}.
 *
 * @eventName ~ColorPickerView#colorSelected
 */
export type ColorPickerColorSelectedEvent = {
    name: 'colorSelected';
    args: [
        {
            color: string;
        }
    ];
};
/**
 * Trim spaces from provided color and check if hex is valid.
 *
 * @param color Unsafe color string.
 * @returns Null if provided color is not hex value.
 * @export
 * @internal
 */
export declare function tryParseHexColor<S extends string>(color: S | null | undefined): HexColor<S> | null;
