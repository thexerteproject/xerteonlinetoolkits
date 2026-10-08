/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module font/ui/colorui
 */
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { type FONT_BACKGROUND_COLOR, type FONT_COLOR } from '../utils.js';
/**
 * The color UI plugin which isolates the common logic responsible for displaying dropdowns with color grids.
 *
 * It is used to create the `'fontBackgroundColor'` and `'fontColor'` dropdowns, each hosting
 * a {@link module:ui/colorselector/colorselectorview~ColorSelectorView}.
 */
export declare class FontColorUIBase extends Plugin {
    /**
     * The name of the command which will be executed when a color tile is clicked.
     */
    commandName: typeof FONT_BACKGROUND_COLOR | typeof FONT_COLOR;
    /**
     * The name of this component in the {@link module:ui/componentfactory~ComponentFactory}.
     * Also the configuration scope name in `editor.config`.
     */
    componentName: typeof FONT_BACKGROUND_COLOR | typeof FONT_COLOR;
    /**
     * The SVG icon used by the dropdown.
     */
    icon: string;
    /**
     * The label used by the dropdown.
     */
    dropdownLabel: string;
    /**
     * The number of columns in the color grid.
     */
    columns: number;
    /**
     * Keeps all changes in color picker in one batch while dropdown is open.
     */
    private _undoStepBatch;
    /**
     * Creates a plugin which introduces a dropdown with a pre–configured
     * {@link module:ui/colorselector/colorselectorview~ColorSelectorView}.
     *
     * @param editor An editor instance.
     * @param config The configuration object.
     * @param config.commandName The name of the command which will be executed when a color tile is clicked.
     * @param config.componentName The name of the dropdown in the {@link module:ui/componentfactory~ComponentFactory}
     * and the configuration scope name in `editor.config`.
     * @param config.icon The SVG icon used by the dropdown.
     * @param config.dropdownLabel The label used by the dropdown.
     */
    constructor(editor: Editor, { commandName, componentName, icon, dropdownLabel }: {
        commandName: typeof FONT_BACKGROUND_COLOR | typeof FONT_COLOR;
        componentName: typeof FONT_BACKGROUND_COLOR | typeof FONT_COLOR;
        icon: string;
        dropdownLabel: string;
    });
    /**
    * @inheritDoc
    */
    init(): void;
}
