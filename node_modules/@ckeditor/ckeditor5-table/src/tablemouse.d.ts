/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/tablemouse
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { TableSelection } from './tableselection.js';
import { TableUtils } from './tableutils.js';
/**
 * This plugin enables a table cells' selection with the mouse.
 * It is loaded automatically by the {@link module:table/table~Table} plugin.
 */
export declare class TableMouse extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "TableMouse";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof TableSelection, typeof TableUtils];
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Enables making cells selection by <kbd>Shift</kbd>+click. Creates a selection from the cell which previously held
     * the selection to the cell which was clicked. It can be the same cell, in which case it selects a single cell.
     */
    private _enableShiftClickSelection;
    /**
     * Enables making cells selection by dragging.
     *
     * The selection is made only on mousemove. Mouse tracking is started on mousedown.
     * However, the cells selection is enabled only after the mouse cursor left the anchor cell.
     * Thanks to that normal text selection within one cell works just fine. However, you can still select
     * just one cell by leaving the anchor cell and moving back to it.
     */
    private _enableMouseDragSelection;
    /**
     * Returns the model table cell element based on the target element of the passed DOM event.
     *
     * @returns Returns the table cell or `undefined`.
     */
    private _getModelTableCellFromDomEvent;
}
