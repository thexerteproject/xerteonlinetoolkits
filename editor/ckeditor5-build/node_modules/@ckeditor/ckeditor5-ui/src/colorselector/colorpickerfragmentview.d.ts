/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/colorselector/colorpickerfragmentview
 */
import { View } from '../view.js';
import { ButtonView } from '../button/buttonview.js';
import { type ViewCollection } from '../viewcollection.js';
import type { FocusableView } from '../focuscycler.js';
import { ColorPickerView } from '../colorpicker/colorpickerview.js';
import type { FocusTracker, KeystrokeHandler, Locale } from '@ckeditor/ckeditor5-utils';
import type { ColorPickerViewConfig } from '../colorpicker/utils.js';
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
export declare class ColorPickerFragmentView extends View {
    /**
     * A collection of component's children.
     */
    readonly items: ViewCollection;
    /**
     * A view with saturation and hue sliders and color input.
     */
    colorPickerView?: ColorPickerView;
    /**
     * The "Save" button view.
     */
    saveButtonView: ButtonView;
    /**
     * The "Cancel" button view.
     */
    cancelButtonView: ButtonView;
    /**
     * The action bar where are "Save" button and "Cancel" button.
     */
    actionBarView: View;
    /**
     * Tracks information about the DOM focus in the list.
     */
    readonly focusTracker: FocusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * Indicates whether the component is visible or not.
     */
    isVisible: boolean;
    /**
     * Keeps the value of the command associated with the component for the current selection.
     */
    selectedColor?: string;
    /**
     * A collection of views that can be focused in the view.
     *
     * @readonly
     */
    protected _focusables: ViewCollection<FocusableView>;
    /**
     * A reference to the configuration of {@link #colorPickerView}. `false` when the view was
     * configured without a color picker.
     *
     * @readonly
     */
    private _colorPickerViewConfig;
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
    constructor(locale: Locale, { focusTracker, focusables, keystrokes, colorPickerViewConfig }: {
        focusTracker: FocusTracker;
        focusables: ViewCollection<FocusableView>;
        keystrokes: KeystrokeHandler;
        colorPickerViewConfig: ColorPickerViewConfig | false;
    });
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Focuses the color picker.
     */
    focus(): void;
    /**
     * Reset validation messages.
     */
    resetValidationStatus(): void;
    /**
     * When color picker is focused and "enter" is pressed it executes command.
     */
    private _executeOnEnterPress;
    /**
     * Removes default behavior of arrow keys in dropdown.
     */
    private _stopPropagationOnArrowsKeys;
    /**
     * Adds color picker elements to focus tracker.
     */
    private _addColorPickersElementsToFocusTracker;
    /**
     * Creates bar containing "Save" and "Cancel" buttons.
     */
    private _createActionBarView;
    /**
     * Creates "Save" and "Cancel" buttons.
     */
    private _createActionButtons;
    /**
     * Fires the `execute` event if color in color picker has been changed
     * by the user.
     */
    private _executeUponColorChange;
}
