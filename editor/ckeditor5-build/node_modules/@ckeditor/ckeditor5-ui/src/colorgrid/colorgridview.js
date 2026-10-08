/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/colorgrid/colorgridview
 */
import { View } from '../view.js';
import { ColorTileView } from './colortileview.js';
import { addKeyboardHandlingForGrid } from '../bindings/addkeyboardhandlingforgrid.js';
import { FocusTracker, KeystrokeHandler } from '@ckeditor/ckeditor5-utils';
import '../../theme/components/colorgrid/colorgrid.css';
/**
 * A grid of {@link module:ui/colorgrid/colortileview~ColorTileView color tiles}.
 */
export class ColorGridView extends View {
    /**
     * A number of columns for the tiles grid.
     */
    columns;
    /**
     * Collection of the child tile views.
     */
    items;
    /**
     * Tracks information about DOM focus in the grid.
     */
    focusTracker;
    /**
     * Instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    keystrokes;
    /**
     * Creates an instance of a color grid containing {@link module:ui/colorgrid/colortileview~ColorTileView tiles}.
     *
     * @fires execute
     * @param locale The localization services instance.
     * @param options Component configuration
     * @param options.colorDefinitions Array with definitions
     * required to create the {@link module:ui/colorgrid/colortileview~ColorTileView tiles}.
     * @param options.columns A number of columns to display the tiles.
     */
    constructor(locale, options) {
        super(locale);
        const colorDefinitions = options && options.colorDefinitions ? options.colorDefinitions : [];
        this.columns = options?.columns || 5;
        const viewStyleAttribute = {
            gridTemplateColumns: `repeat( ${this.columns}, 1fr)`
        };
        this.set('selectedColor', undefined);
        this.items = this.createCollection();
        this.focusTracker = new FocusTracker();
        this.keystrokes = new KeystrokeHandler();
        this.items.on('add', (evt, colorTile) => {
            colorTile.isOn = colorTile.color === this.selectedColor;
        });
        colorDefinitions.forEach(color => {
            const colorTile = new ColorTileView();
            colorTile.set({
                color: color.color,
                label: color.label,
                tooltip: true,
                hasBorder: color.options.hasBorder
            });
            colorTile.on('execute', () => {
                this.fire('execute', {
                    value: color.color,
                    hasBorder: color.options.hasBorder,
                    label: color.label
                });
            });
            this.items.add(colorTile);
        });
        this.setTemplate({
            tag: 'div',
            children: this.items,
            attributes: {
                class: [
                    'ck',
                    'ck-color-grid'
                ],
                style: viewStyleAttribute
            }
        });
        this.on('change:selectedColor', (evt, name, selectedColor) => {
            for (const item of this.items) {
                item.isOn = item.color === selectedColor;
            }
        });
    }
    /**
     * Focuses the first focusable in {@link #items}.
     */
    focus() {
        if (this.items.length) {
            this.items.first.focus();
        }
    }
    /**
     * Focuses the last focusable in {@link #items}.
     */
    focusLast() {
        if (this.items.length) {
            this.items.last.focus();
        }
    }
    /**
     * @inheritDoc
     */
    render() {
        super.render();
        // Items added before rendering should be known to the #focusTracker.
        for (const item of this.items) {
            this.focusTracker.add(item.element);
        }
        this.items.on('add', (evt, item) => {
            this.focusTracker.add(item.element);
        });
        this.items.on('remove', (evt, item) => {
            this.focusTracker.remove(item.element);
        });
        // Start listening for the keystrokes coming from #element.
        this.keystrokes.listenTo(this.element);
        addKeyboardHandlingForGrid({
            keystrokeHandler: this.keystrokes,
            focusTracker: this.focusTracker,
            gridItems: this.items,
            numberOfColumns: this.columns,
            uiLanguageDirection: this.locale?.uiLanguageDirection
        });
    }
    /**
     * @inheritDoc
     */
    destroy() {
        super.destroy();
        this.focusTracker.destroy();
        this.keystrokes.destroy();
    }
}
