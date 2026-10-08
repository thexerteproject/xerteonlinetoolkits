/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/tablecellproperties/commands/tablecelltypecommand
 */
import type { Editor } from 'ckeditor5/src/core.js';
import type { ModelElement, ModelWriter } from 'ckeditor5/src/engine.js';
import { TableUtils } from '../../tableutils.js';
import { TableCellPropertyCommand } from './tablecellpropertycommand.js';
/**
 * The table cell type command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * the `'tableCellType'` editor command.
 *
 * To change the type of selected cells, execute the command:
 *
 * ```ts
 * editor.execute( 'tableCellType', {
 *   value: 'header'
 * } );
 * ```
 *
 * The `value` can be either `'header'` or `'data'`.
 * It'll return `undefined` if multiple types are selected.
 */
export declare class TableCellTypeCommand extends TableCellPropertyCommand {
    /**
     * Creates a new `TableCellTypeCommand` instance.
     *
     * @param editor An editor in which this command will be used.
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Returns the attribute value for a table cell.
     */
    protected _getAttribute(tableCell: ModelElement | undefined): unknown;
}
/**
 * Type of the table cell.
 */
export type TableCellType = 'data' | 'header';
/**
 * Updates the `headingRows` and `headingColumns` attributes of the given tables
 * based on the `tableCellType` of their cells.
 */
export declare function updateTablesHeadingAttributes(tableUtils: TableUtils, writer: ModelWriter, tables: Iterable<ModelElement>): boolean;
