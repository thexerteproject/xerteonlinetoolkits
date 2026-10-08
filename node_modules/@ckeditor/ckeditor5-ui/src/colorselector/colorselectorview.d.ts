/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/colorselector/colorselectorview
 */
import { FocusCycler, type FocusableView } from '../focuscycler.js';
import { View } from '../view.js';
import { ViewCollection } from '../viewcollection.js';
import { FocusTracker, KeystrokeHandler, type Locale } from '@ckeditor/ckeditor5-utils';
import type { ColorPickerViewConfig } from '../colorpicker/utils.js';
import type { ColorDefinition } from '../colorgrid/colorgridview.js';
import type { Model } from '@ckeditor/ckeditor5-engine';
import { ColorGridsFragmentView } from './colorgridsfragmentview.js';
import { ColorPickerFragmentView } from './colorpickerfragmentview.js';
import '../../theme/components/colorselector/colorselector.css';
/**
 * The configurable color selector view class. It allows users to select colors from a predefined set of colors as well as from
 * a color picker.
 *
 * This meta-view is is made of two components (fragments):
 *
 * * {@link module:ui/colorselector/colorselectorview~ColorSelectorView#colorGridsFragmentView},
 * * {@link module:ui/colorselector/colorselectorview~ColorSelectorView#colorPickerFragmentView}.
 *
 * ```ts
 * const colorDefinitions = [
 * 	{ color: '#000', label: 'Black', options: { hasBorder: false } },
 * 	{ color: 'rgb(255, 255, 255)', label: 'White', options: { hasBorder: true } },
 * 	{ color: 'red', label: 'Red', options: { hasBorder: false } }
 * ];
 *
 * const selectorView = new ColorSelectorView( locale, {
 * 	colors: colorDefinitions,
 * 	columns: 5,
 * 	removeButtonLabel: 'Remove color',
 * 	documentColorsLabel: 'Document colors',
 * 	documentColorsCount: 4,
 * 	colorPickerViewConfig: {
 * 		format: 'hsl'
 * 	}
 * } );
 *
 * selectorView.appendUI();
 * selectorView.selectedColor = 'red';
 * selectorView.updateSelectedColors();
 *
 * selectorView.on<ColorSelectorExecuteEvent>( 'execute', ( evt, data ) => {
 * 	console.log( 'Color changed', data.value, data.source );
 * } );
 *
 * selectorView.on<ColorSelectorColorPickerShowEvent>( 'colorPicker:show', ( evt ) => {
 * 	console.log( 'Color picker showed up', evt );
 * } );
 *
 * selectorView.on<ColorSelectorColorPickerCancelEvent>( 'colorPicker:cancel', ( evt ) => {
 * 	console.log( 'Color picker cancel', evt );
 * } );
 *
 * selectorView.render();
 *
 * document.body.appendChild( selectorView.element );
 * ```
 */
export declare class ColorSelectorView extends View {
    /**
     * Tracks information about the DOM focus in the list.
     */
    readonly focusTracker: FocusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * A collection of components.
     */
    readonly items: ViewCollection;
    /**
     * A fragment that allows users to select colors from the a predefined set and from existing document colors.
     */
    readonly colorGridsFragmentView: ColorGridsFragmentView;
    /**
     * A fragment that allows users to select a color from a color picker.
     */
    readonly colorPickerFragmentView: ColorPickerFragmentView;
    /**
     * Keeps the value of the command associated with the component for the current selection.
     */
    selectedColor?: string;
    /**
     * Reflects the visibility state of the color grids fragment.
     *
     * @internal
     */
    _isColorGridsFragmentVisible: boolean;
    /**
     * Reflects the visibility state of the color picker fragment.
     *
     * @internal
     */
    _isColorPickerFragmentVisible: boolean;
    /**
     * Helps cycling over focusable {@link #items} in the list.
     *
     * @readonly
     */
    protected _focusCycler: FocusCycler;
    /**
     * A collection of views that can be focused in the view.
     *
     * @readonly
     */
    protected _focusables: ViewCollection<FocusableView>;
    /**
     * The configuration of color picker sub-component.
     */
    private _colorPickerViewConfig;
    /**
     * Creates a view to be inserted as a child of {@link module:ui/dropdown/dropdownview~DropdownView}.
     *
     * @param locale The localization services instance.
     * @param options Constructor options.
     * @param options.colors An array with definitions of colors to be displayed in the table.
     * @param options.columns The number of columns in the color grid.
     * @param options.removeButtonLabel The label of the button responsible for removing the color.
     * @param options.colorPickerLabel The label of the button responsible for color picker appearing.
     * @param options.documentColorsLabel The label for the section with the document colors.
     * @param options.documentColorsCount The number of colors in the document colors section inside the color dropdown.
     * @param options.colorPickerViewConfig The configuration of color picker feature. If set to `false`, the color picker will be hidden.
     */
    constructor(locale: Locale, { colors, columns, removeButtonLabel, documentColorsLabel, documentColorsCount, colorPickerLabel, colorPickerViewConfig }: {
        colors: Array<ColorDefinition>;
        columns: number;
        removeButtonLabel: string;
        documentColorsLabel?: string;
        documentColorsCount?: number;
        colorPickerLabel: string;
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
     * Renders the internals of the component on demand:
     * * {@link #colorPickerFragmentView},
     * * {@link #colorGridsFragmentView}.
     *
     * It allows for deferring component initialization to improve the performance.
     *
     * See {@link #showColorPickerFragment}, {@link #showColorGridsFragment}.
     */
    appendUI(): void;
    /**
     * Shows the {@link #colorPickerFragmentView} and hides the {@link #colorGridsFragmentView}.
     *
     * **Note**: It requires {@link #appendUI} to be called first.
     *
     * See {@link #showColorGridsFragment}, {@link ~ColorSelectorView#event:colorPicker:show}.
     */
    showColorPickerFragment(): void;
    /**
     * Shows the {@link #colorGridsFragmentView} and hides the {@link #colorPickerFragmentView}.
     *
     * See {@link #showColorPickerFragment}.
     *
     * **Note**: It requires {@link #appendUI} to be called first.
     */
    showColorGridsFragment(): void;
    /**
     * Focuses the first focusable element in {@link #items}.
     */
    focus(): void;
    /**
     * Focuses the last focusable element in {@link #items}.
     */
    focusLast(): void;
    /**
     * Scans through the editor model and searches for text node attributes with the given `attributeName`.
     * Found entries are set as document colors in {@link #colorGridsFragmentView}.
     *
     * All the previously stored document colors will be lost in the process.
     *
     * @param model The model used as a source to obtain the document colors.
     * @param attributeName Determines the name of the related model's attribute for a given dropdown.
     */
    updateDocumentColors(model: Model, attributeName: string): void;
    /**
     * Refreshes the state of the selected color in one or both grids located in {@link #colorGridsFragmentView}.
     *
     * It guarantees that the selection will occur only in one of them.
     */
    updateSelectedColors(): void;
    /**
     * Appends the view containing static and document color grid views.
     */
    private _appendColorGridsFragment;
    /**
     * Appends the view with the color picker.
     */
    private _appendColorPickerFragment;
}
/**
 * Fired whenever the color was changed. There are multiple sources of this event and you can distinguish them
 * using the `source` property passed along this event.
 *
 * @eventName ~ColorSelectorView#execute
 */
export type ColorSelectorExecuteEvent = {
    name: 'execute';
    args: [
        {
            value: string;
            source: 'staticColorsGrid' | 'documentColorsGrid' | 'removeColorButton' | 'colorPicker' | 'colorPickerSaveButton';
        }
    ];
};
/**
 * Fired when the user pressed the "Cancel" button in the
 * {@link module:ui/colorselector/colorselectorview~ColorSelectorView#colorPickerFragmentView}.
 *
 * @eventName ~ColorSelectorView#colorPicker:cancel
 */
export type ColorSelectorColorPickerCancelEvent = {
    name: 'colorPicker:cancel';
    args: [];
};
/**
 * Fired whenever {@link module:ui/colorselector/colorselectorview~ColorSelectorView#colorPickerFragmentView} is shown.
 *
 * See {@link ~ColorSelectorView#showColorPickerFragment}.
 *
 * @eventName ~ColorSelectorView#colorPicker:show
 */
export type ColorSelectorColorPickerShowEvent = {
    name: 'colorPicker:show';
    args: [];
};
