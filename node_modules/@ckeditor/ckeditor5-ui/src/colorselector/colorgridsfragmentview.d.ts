/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/colorselector/colorgridsfragmentview
 */
import { View } from '../view.js';
import { ButtonView } from '../button/buttonview.js';
import { ColorGridView, type ColorDefinition } from '../colorgrid/colorgridview.js';
import { DocumentColorCollection } from './documentcolorcollection.js';
import type { Model } from '@ckeditor/ckeditor5-engine';
import type { FocusTracker, Locale } from '@ckeditor/ckeditor5-utils';
import { type ViewCollection } from '../viewcollection.js';
import type { FocusableView } from '../focuscycler.js';
/**
 * One of the fragments of {@link module:ui/colorselector/colorselectorview~ColorSelectorView}.
 *
 * It provides a UI that allows users to select colors from the a predefined set and from existing document colors.
 *
 * It consists of the following sub–components:
 *
 * * A "Remove color" button,
 * * A static {@link module:ui/colorgrid/colorgridview~ColorGridView} of colors defined in the configuration,
 * * A dynamic {@link module:ui/colorgrid/colorgridview~ColorGridView} of colors used in the document.
 * * If color picker is configured, the "Color Picker" button is visible too.
 */
export declare class ColorGridsFragmentView extends View {
    /**
     * A collection of the children of the table.
     */
    readonly items: ViewCollection;
    /**
     * An array with objects representing colors to be displayed in the grid.
     */
    colorDefinitions: Array<ColorDefinition>;
    /**
     * Tracks information about the DOM focus in the list.
     */
    readonly focusTracker: FocusTracker;
    /**
     * The number of columns in the color grid.
     */
    columns: number;
    /**
     * Preserves the reference to {@link module:ui/colorselector/documentcolorcollection~DocumentColorCollection} used to collect
     * definitions that store the document colors.
     *
     * @readonly
     */
    documentColors: DocumentColorCollection;
    /**
     * The maximum number of colors in the document colors section.
     * If it equals 0, the document colors section is not added.
     *
     * @readonly
     */
    documentColorsCount?: number;
    /**
     * Keeps the value of the command associated with the table for the current selection.
     */
    selectedColor: string;
    /**
     * Preserves the reference to {@link module:ui/colorgrid/colorgridview~ColorGridView} used to create
     * the default (static) color set.
     *
     * The property is loaded once the the parent dropdown is opened the first time.
     *
     * @readonly
     */
    staticColorsGrid: ColorGridView | undefined;
    /**
     * Preserves the reference to {@link module:ui/colorgrid/colorgridview~ColorGridView} used to create
     * the document colors. It remains undefined if the document colors feature is disabled.
     *
     * The property is loaded once the the parent dropdown is opened the first time.
     *
     * @readonly
     */
    documentColorsGrid: ColorGridView | undefined;
    /**
     * The "Color picker" button view.
     */
    colorPickerButtonView?: ButtonView;
    /**
     * The "Remove color" button view.
     */
    removeColorButtonView: ButtonView;
    /**
     * The property which is responsible for is component visible or not.
     */
    isVisible: boolean;
    /**
     * A collection of views that can be focused in the view.
     *
     * @readonly
     */
    protected _focusables: ViewCollection<FocusableView>;
    /**
     * Document color section's label.
     *
     * @readonly
     */
    private _documentColorsLabel?;
    /**
     * The label of the button responsible for removing color attributes.
     */
    private _removeButtonLabel;
    /**
     * The label of the button responsible for switching to the color picker component.
     */
    private _colorPickerLabel;
    /**
     * Creates an instance of the view.
     *
     * @param locale The localization services instance.
     * @param options Constructor options.
     * @param options.colors An array with definitions of colors to be displayed in the table.
     * @param options.columns The number of columns in the color grid.
     * @param options.removeButtonLabel The label of the button responsible for removing the color.
     * @param options.colorPickerLabel The label of the button responsible for color picker appearing.
     * @param options.documentColorsLabel The label for the section with the document colors.
     * @param options.documentColorsCount The number of colors in the document colors section inside the color dropdown.
     * @param options.focusTracker Tracks information about the DOM focus in the list.
     * @param options.focusables A collection of views that can be focused in the view.
     */
    constructor(locale: Locale, { colors, columns, removeButtonLabel, documentColorsLabel, documentColorsCount, colorPickerLabel, focusTracker, focusables }: {
        colors: Array<ColorDefinition>;
        columns: number;
        removeButtonLabel: string;
        colorPickerLabel: string;
        documentColorsLabel?: string;
        documentColorsCount?: number;
        focusTracker: FocusTracker;
        focusables: ViewCollection<FocusableView>;
    });
    /**
     * Scans through the editor model and searches for text node attributes with the given attribute name.
     * Found entries are set as document colors.
     *
     * All the previously stored document colors will be lost in the process.
     *
     * @param model The model used as a source to obtain the document colors.
     * @param attributeName Determines the name of the related model's attribute for a given dropdown.
     */
    updateDocumentColors(model: Model, attributeName: string): void;
    /**
     * Refreshes the state of the selected color in one or both {@link module:ui/colorgrid/colorgridview~ColorGridView}s
     * available in the {@link module:ui/colorselector/colorselectorview~ColorSelectorView}. It guarantees that the selection will
     * occur only in one of them.
     */
    updateSelectedColors(): void;
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * Focuses the component.
     */
    focus(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Handles displaying the color picker button (if it was previously created) and making it focusable.
     */
    addColorPickerButton(): void;
    /**
     * Adds color selector elements to focus tracker.
     */
    private _addColorSelectorElementsToFocusTracker;
    /**
     * Creates the button responsible for displaying the color picker component.
     */
    private _createColorPickerButton;
    /**
     * Adds the remove color button as a child of the current view.
     */
    private _createRemoveColorButton;
    /**
     * Creates a static color grid based on the editor configuration.
     */
    private _createStaticColorsGrid;
    /**
     * Creates the document colors section view and binds it to {@link #documentColors}.
     */
    private _createDocumentColorsGrid;
    /**
     * Adds a given color to the document colors list. If possible, the method will attempt to use
     * data from the {@link #colorDefinitions} (label, color options).
     *
     * @param color A string that stores the value of the recently applied color.
     */
    private _addColorToDocumentColors;
}
