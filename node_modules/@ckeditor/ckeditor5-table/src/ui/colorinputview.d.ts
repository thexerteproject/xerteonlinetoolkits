/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/ui/colorinputview
 */
import { View, InputTextView, FocusCycler, ViewCollection, type ColorDefinition, type DropdownView, type ColorPickerConfig, type FocusableView } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';
import '../../theme/colorinput.css';
/**
 * The options for the color input view.
 *
 * @internal
 */
export type ColorInputViewOptions = {
    colorDefinitions: Array<ColorDefinition>;
    columns: number;
    defaultColorValue?: string;
    colorPickerConfig: false | ColorPickerConfig;
};
/**
 * The color input view class. It allows the user to type in a color (hex, rgb, etc.)
 * or choose it from the configurable color palette with a preview.
 *
 * @internal
 */
export declare class ColorInputView extends View implements FocusableView {
    /**
     * The value of the input.
     *
     * @observable
     * @default ''
     */
    value: string;
    /**
     * Controls whether the input view is in read-only mode.
     *
     * @observable
     * @default false
     */
    isReadOnly: boolean;
    /**
     * An observable flag set to `true` when the input is focused by the user.
     * `false` otherwise.
     *
     * @observable
     * @default false
     */
    readonly isFocused: boolean;
    /**
     * An observable flag set to `true` when the input contains no text.
     *
     * @observable
     * @default true
     */
    readonly isEmpty: boolean;
    /**
     * @observable
     */
    hasError: boolean;
    /**
     * A cached reference to the options passed to the constructor.
     */
    options: ColorInputViewOptions;
    /**
     * Tracks information about the DOM focus in the view.
     */
    readonly focusTracker: FocusTracker;
    /**
     * Helps cycling over focusable children in the input view.
     */
    readonly focusCycler: FocusCycler;
    /**
     * A collection of views that can be focused in the view.
     */
    protected readonly _focusables: ViewCollection<FocusableView>;
    /**
     * An instance of the dropdown allowing to select a color from a grid.
     */
    dropdownView: DropdownView;
    /**
     * An instance of the input allowing the user to type a color value.
     */
    inputView: InputTextView;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * The flag that indicates whether the user is still typing.
     * If set to true, it means that the text input field ({@link #inputView}) still has the focus.
     * So, we should interrupt the user by replacing the input's value.
     */
    protected _stillTyping: boolean;
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
    constructor(locale: Locale, options: ColorInputViewOptions);
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * Focuses the view.
     */
    focus(direction: 1 | -1): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Creates and configures the {@link #dropdownView}.
     */
    private _createDropdownView;
    /**
     * Creates and configures an instance of {@link module:ui/inputtext/inputtextview~InputTextView}.
     *
     * @returns A configured instance to be set as {@link #inputView}.
     */
    private _createInputTextView;
    /**
     * Creates and configures the panel with "color grid" and "color picker" inside the {@link #dropdownView}.
     */
    private _createColorSelector;
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
    private _setInputValue;
}
