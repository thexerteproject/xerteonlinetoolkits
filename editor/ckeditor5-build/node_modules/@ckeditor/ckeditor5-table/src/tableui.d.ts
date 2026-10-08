/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/tableui
 */
import { Plugin } from 'ckeditor5/src/core.js';
/**
 * The table UI plugin. It introduces:
 *
 * * The `'insertTable'` dropdown,
 * * The `'menuBar:insertTable'` menu bar menu,
 * * The `'tableColumn'` dropdown,
 * * The `'tableRow'` dropdown,
 * * The `'mergeTableCells'` split button.
 *
 * The `'tableColumn'`, `'tableRow'` and `'mergeTableCells'` dropdowns work best with {@link module:table/tabletoolbar~TableToolbar}.
 */
export declare class TableUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "TableUI";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Creates a dropdown view from a set of options.
     *
     * @param label The dropdown button label.
     * @param icon An icon for the dropdown button.
     * @param options The list of options for the dropdown.
     */
    private _prepareDropdown;
    /**
     * Creates a dropdown view with a {@link module:ui/dropdown/button/splitbuttonview~SplitButtonView} for
     * merge (and split)–related commands.
     *
     * @param label The dropdown button label.
     * @param icon An icon for the dropdown button.
     * @param options The list of options for the dropdown.
     */
    private _prepareMergeSplitButtonDropdown;
    /**
     * Injects a {@link module:ui/list/listview~ListView} into the passed dropdown with buttons
     * which execute editor commands as configured in passed options.
     *
     * @param options The list of options for the dropdown.
     * @returns Commands the list options are interacting with.
     */
    private _fillDropdownWithListOptions;
}
