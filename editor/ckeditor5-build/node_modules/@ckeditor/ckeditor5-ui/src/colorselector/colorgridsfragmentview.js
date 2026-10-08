/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/colorselector/colorgridsfragmentview
 */
import { View } from '../view.js';
import { ButtonView } from '../button/buttonview.js';
import { ColorGridView } from '../colorgrid/colorgridview.js';
import { ColorTileView } from '../colorgrid/colortileview.js';
import { Template } from '../template.js';
import { DocumentColorCollection } from './documentcolorcollection.js';
import { IconEraser, IconColorPalette } from '@ckeditor/ckeditor5-icons';
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
export class ColorGridsFragmentView extends View {
    /**
     * A collection of the children of the table.
     */
    items;
    /**
     * An array with objects representing colors to be displayed in the grid.
     */
    colorDefinitions;
    /**
     * Tracks information about the DOM focus in the list.
     */
    focusTracker;
    /**
     * The number of columns in the color grid.
     */
    columns;
    /**
     * Preserves the reference to {@link module:ui/colorselector/documentcolorcollection~DocumentColorCollection} used to collect
     * definitions that store the document colors.
     *
     * @readonly
     */
    documentColors;
    /**
     * The maximum number of colors in the document colors section.
     * If it equals 0, the document colors section is not added.
     *
     * @readonly
     */
    documentColorsCount;
    /**
     * Preserves the reference to {@link module:ui/colorgrid/colorgridview~ColorGridView} used to create
     * the default (static) color set.
     *
     * The property is loaded once the the parent dropdown is opened the first time.
     *
     * @readonly
     */
    staticColorsGrid;
    /**
     * Preserves the reference to {@link module:ui/colorgrid/colorgridview~ColorGridView} used to create
     * the document colors. It remains undefined if the document colors feature is disabled.
     *
     * The property is loaded once the the parent dropdown is opened the first time.
     *
     * @readonly
     */
    documentColorsGrid;
    /**
     * The "Color picker" button view.
     */
    colorPickerButtonView;
    /**
     * The "Remove color" button view.
     */
    removeColorButtonView;
    /**
     * A collection of views that can be focused in the view.
     *
     * @readonly
     */
    _focusables;
    /**
     * Document color section's label.
     *
     * @readonly
     */
    _documentColorsLabel;
    /**
     * The label of the button responsible for removing color attributes.
     */
    _removeButtonLabel;
    /**
     * The label of the button responsible for switching to the color picker component.
     */
    _colorPickerLabel;
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
    constructor(locale, { colors, columns, removeButtonLabel, documentColorsLabel, documentColorsCount, colorPickerLabel, focusTracker, focusables }) {
        super(locale);
        const bind = this.bindTemplate;
        this.set('isVisible', true);
        this.focusTracker = focusTracker;
        this.items = this.createCollection();
        this.colorDefinitions = colors;
        this.columns = columns;
        this.documentColors = new DocumentColorCollection();
        this.documentColorsCount = documentColorsCount;
        this._focusables = focusables;
        this._removeButtonLabel = removeButtonLabel;
        this._colorPickerLabel = colorPickerLabel;
        this._documentColorsLabel = documentColorsLabel;
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck-color-grids-fragment',
                    bind.if('isVisible', 'ck-hidden', value => !value)
                ]
            },
            children: this.items
        });
        this.removeColorButtonView = this._createRemoveColorButton();
        this.items.add(this.removeColorButtonView);
    }
    /**
     * Scans through the editor model and searches for text node attributes with the given attribute name.
     * Found entries are set as document colors.
     *
     * All the previously stored document colors will be lost in the process.
     *
     * @param model The model used as a source to obtain the document colors.
     * @param attributeName Determines the name of the related model's attribute for a given dropdown.
     */
    updateDocumentColors(model, attributeName) {
        const document = model.document;
        const maxCount = this.documentColorsCount;
        this.documentColors.clear();
        for (const root of document.getRoots()) {
            const range = model.createRangeIn(root);
            for (const node of range.getItems()) {
                if (node.is('$textProxy') && node.hasAttribute(attributeName)) {
                    this._addColorToDocumentColors(node.getAttribute(attributeName));
                    if (this.documentColors.length >= maxCount) {
                        return;
                    }
                }
            }
        }
    }
    /**
     * Refreshes the state of the selected color in one or both {@link module:ui/colorgrid/colorgridview~ColorGridView}s
     * available in the {@link module:ui/colorselector/colorselectorview~ColorSelectorView}. It guarantees that the selection will
     * occur only in one of them.
     */
    updateSelectedColors() {
        const documentColorsGrid = this.documentColorsGrid;
        const staticColorsGrid = this.staticColorsGrid;
        const selectedColor = this.selectedColor;
        staticColorsGrid.selectedColor = selectedColor;
        if (documentColorsGrid) {
            documentColorsGrid.selectedColor = selectedColor;
        }
    }
    /**
     * @inheritDoc
     */
    render() {
        super.render();
        this.staticColorsGrid = this._createStaticColorsGrid();
        this.items.add(this.staticColorsGrid);
        if (this.documentColorsCount) {
            // Create a label for document colors.
            const bind = Template.bind(this.documentColors, this.documentColors);
            const label = new View(this.locale);
            label.setTemplate({
                tag: 'span',
                attributes: {
                    class: [
                        'ck',
                        'ck-color-grid__label',
                        bind.if('isEmpty', 'ck-hidden')
                    ]
                },
                children: [
                    {
                        text: this._documentColorsLabel
                    }
                ]
            });
            this.items.add(label);
            this.documentColorsGrid = this._createDocumentColorsGrid();
            this.items.add(this.documentColorsGrid);
        }
        this._createColorPickerButton();
        this._addColorSelectorElementsToFocusTracker();
    }
    /**
     * Focuses the component.
     */
    focus() {
        this.removeColorButtonView.focus();
    }
    /**
     * @inheritDoc
     */
    destroy() {
        super.destroy();
    }
    /**
     * Handles displaying the color picker button (if it was previously created) and making it focusable.
     */
    addColorPickerButton() {
        if (this.colorPickerButtonView) {
            this.items.add(this.colorPickerButtonView);
            this.focusTracker.add(this.colorPickerButtonView.element);
            this._focusables.add(this.colorPickerButtonView);
        }
    }
    /**
     * Adds color selector elements to focus tracker.
     */
    _addColorSelectorElementsToFocusTracker() {
        this.focusTracker.add(this.removeColorButtonView.element);
        this._focusables.add(this.removeColorButtonView);
        if (this.staticColorsGrid) {
            this.focusTracker.add(this.staticColorsGrid.element);
            this._focusables.add(this.staticColorsGrid);
        }
        if (this.documentColorsGrid) {
            this.focusTracker.add(this.documentColorsGrid.element);
            this._focusables.add(this.documentColorsGrid);
        }
    }
    /**
     * Creates the button responsible for displaying the color picker component.
     */
    _createColorPickerButton() {
        this.colorPickerButtonView = new ButtonView();
        this.colorPickerButtonView.set({
            label: this._colorPickerLabel,
            withText: true,
            icon: IconColorPalette,
            class: 'ck-color-selector__color-picker'
        });
        this.colorPickerButtonView.on('execute', () => {
            this.fire('colorPicker:show');
        });
    }
    /**
     * Adds the remove color button as a child of the current view.
     */
    _createRemoveColorButton() {
        const buttonView = new ButtonView();
        buttonView.set({
            withText: true,
            icon: IconEraser,
            label: this._removeButtonLabel
        });
        buttonView.class = 'ck-color-selector__remove-color';
        buttonView.on('execute', () => {
            this.fire('execute', {
                value: null,
                source: 'removeColorButton'
            });
        });
        buttonView.render();
        return buttonView;
    }
    /**
     * Creates a static color grid based on the editor configuration.
     */
    _createStaticColorsGrid() {
        const colorGrid = new ColorGridView(this.locale, {
            colorDefinitions: this.colorDefinitions,
            columns: this.columns
        });
        colorGrid.on('execute', (evt, data) => {
            this.fire('execute', {
                value: data.value,
                source: 'staticColorsGrid'
            });
        });
        return colorGrid;
    }
    /**
     * Creates the document colors section view and binds it to {@link #documentColors}.
     */
    _createDocumentColorsGrid() {
        const bind = Template.bind(this.documentColors, this.documentColors);
        const documentColorsGrid = new ColorGridView(this.locale, {
            columns: this.columns
        });
        documentColorsGrid.extendTemplate({
            attributes: {
                class: bind.if('isEmpty', 'ck-hidden')
            }
        });
        documentColorsGrid.items.bindTo(this.documentColors).using(colorObj => {
            const colorTile = new ColorTileView();
            colorTile.set({
                color: colorObj.color,
                hasBorder: colorObj.options?.hasBorder
            });
            if (colorObj.label) {
                colorTile.set({
                    label: colorObj.label,
                    tooltip: true
                });
            }
            colorTile.on('execute', () => {
                this.fire('execute', {
                    value: colorObj.color,
                    source: 'documentColorsGrid'
                });
            });
            return colorTile;
        });
        // Selected color should be cleared when document colors became empty.
        this.documentColors.on('change:isEmpty', (evt, name, val) => {
            if (val) {
                documentColorsGrid.selectedColor = null;
            }
        });
        return documentColorsGrid;
    }
    /**
     * Adds a given color to the document colors list. If possible, the method will attempt to use
     * data from the {@link #colorDefinitions} (label, color options).
     *
     * @param color A string that stores the value of the recently applied color.
     */
    _addColorToDocumentColors(color) {
        const predefinedColor = this.colorDefinitions
            .find(definition => definition.color === color);
        if (!predefinedColor) {
            this.documentColors.add({
                color,
                label: color,
                options: {
                    hasBorder: false
                }
            });
        }
        else {
            this.documentColors.add(Object.assign({}, predefinedColor));
        }
    }
}
