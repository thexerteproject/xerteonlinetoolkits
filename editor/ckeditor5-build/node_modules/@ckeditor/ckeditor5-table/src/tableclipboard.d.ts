/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { ClipboardPipeline, ClipboardMarkersUtils } from 'ckeditor5/src/clipboard.js';
import { Plugin } from 'ckeditor5/src/core.js';
import type { ModelDocumentFragment, ModelElement, ModelItem, Model, ModelPosition, ModelWriter } from 'ckeditor5/src/engine.js';
import { TableSelection } from './tableselection.js';
import { type TableSlot } from './tablewalker.js';
import { TableUtils } from './tableutils.js';
/**
 * This plugin adds support for copying/cutting/pasting fragments of tables.
 * It is loaded automatically by the {@link module:table/table~Table} plugin.
 */
export declare class TableClipboard extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "TableClipboard";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ClipboardMarkersUtils, typeof ClipboardPipeline, typeof TableSelection, typeof TableUtils];
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Sets up listening for events from the clipboard pipeline to properly handle
     * table content merging during paste/drop operations.
     *
     * When a user is dragging and dropping a table, we want to insert the entire table into
     * a table cell instead of merging table contents. For paste and other events,
     * the normal table merge behavior is applied.
     */
    private _listenToContentInsertion;
    /**
     * Copies table content to a clipboard on "copy" & "cut" events.
     *
     * @param evt An object containing information about the handled event.
     * @param data Clipboard event data.
     */
    private _onCopyCut;
    /**
     * Overrides default {@link module:engine/model/model~Model#insertContent `model.insertContent()`} method to handle pasting table inside
     * selected table fragment.
     *
     * Depending on selected table fragment:
     * - If a selected table fragment is smaller than paste table it will crop pasted table to match dimensions.
     * - If dimensions are equal it will replace selected table fragment with a pasted table contents.
     *
     * @param content The content to insert.
     * @param selectable The selection into which the content should be inserted.
     * If not provided the current model document selection will be used.
     */
    private _onInsertContent;
    /**
     * Inserts provided `selectedTableCells` into `pastedTable`.
     */
    private _replaceSelectedCells;
    /**
     * Replaces the part of selectedTable with pastedTable.
     */
    private _replaceSelectedCellsWithPasted;
    /**
     * Replaces a single table slot.
     *
     * @returns Inserted table cell or null if slot should remain empty.
     * @private
     */
    _replaceTableSlotCell(tableSlot: TableSlot, cellToInsert: ModelElement | null, insertPosition: ModelPosition, writer: ModelWriter): ModelElement | null;
    /**
     * Extracts the table for pasting into a table.
     *
     * @param content The content to insert.
     * @param model The editor model.
     */
    getTableIfOnlyTableInContent(content: ModelDocumentFragment | ModelItem, model: Model): ModelElement | null;
}
