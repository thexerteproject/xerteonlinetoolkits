/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/tablewalker
 */
import type { ModelElement, ModelPosition } from 'ckeditor5/src/engine.js';
/**
 * An object with configuration for `TableWalker`.
 */
export interface TableWalkerOptions {
    /**
     * A row index for which this iterator will output cells. Can't be used together with `startRow` and `endRow`.
     */
    row?: number | null;
    /**
     * A row index from which this iterator should start. Can't be used together with `row`. Default value is 0.
     */
    startRow?: number;
    /**
     * A row index at which this iterator should end. Can't be used together with `row`.
     */
    endRow?: number;
    /**
     * A column index for which this iterator will output cells. Can't be used together with `startColumn` and `endColumn`.
     */
    column?: number;
    /**
     * A column index from which this iterator should start. Can't be used together with `column`. Default value is 0.
     */
    startColumn?: number;
    /**
     * A column index at which this iterator should end. Can't be used together with `column`.
     */
    endColumn?: number;
    /**
     * Also return values for spanned cells. Default value is false.
     */
    includeAllSlots?: boolean;
}
/**
 * The table iterator class. It allows to iterate over table cells. For each cell the iterator yields
 * {@link module:table/tablewalker~TableSlot} with proper table cell attributes.
 */
export declare class TableWalker implements IterableIterator<TableSlot> {
    /**
     * The walker's table element.
     *
     * @internal
     */
    readonly _table: ModelElement;
    /**
     * A row index from which this iterator will start.
     */
    private readonly _startRow;
    /**
     * A row index at which this iterator will end.
     */
    private readonly _endRow?;
    /**
     * If set, the table walker will only output cells from a given column and following ones or cells that overlap them.
     */
    private readonly _startColumn;
    /**
     * If set, the table walker will only output cells up to a given column.
     */
    private readonly _endColumn?;
    /**
     * Enables output of spanned cells that are normally not yielded.
     */
    private readonly _includeAllSlots;
    /**
     * Row indexes to skip from the iteration.
     */
    private readonly _skipRows;
    /**
     * The current row index.
     *
     * @internal
     */
    _row: number;
    /**
     * The index of the current row element in the table.
     *
     * @internal
     */
    _rowIndex: number;
    /**
     * The current column index.
     *
     * @internal
     */
    _column: number;
    /**
     * The cell index in a parent row. For spanned cells when {@link #_includeAllSlots} is set to `true`,
     * this represents the index of the next table cell.
     *
     * @internal
     */
    _cellIndex: number;
    /**
     * Holds a map of spanned cells in a table.
     */
    private readonly _spannedCells;
    /**
     * Index of the next column where a cell is anchored.
     */
    private _nextCellAtColumn;
    /**
     * Indicates whether the iterator jumped to (or close to) the start row, ignoring rows that don't need to be traversed.
     */
    private _jumpedToStartRow;
    /**
     * Creates an instance of the table walker.
     *
     * The table walker iterates internally by traversing the table from row index = 0 and column index = 0.
     * It walks row by row and column by column in order to output values defined in the constructor.
     * By default it will output only the locations that are occupied by a cell. To include also spanned rows and columns,
     * pass the `includeAllSlots` option to the constructor.
     *
     * The most important values of the iterator are column and row indexes of a cell.
     *
     * See {@link module:table/tablewalker~TableSlot} what values are returned by the table walker.
     *
     * To iterate over a given row:
     *
     * ```ts
     * const tableWalker = new TableWalker( table, { startRow: 1, endRow: 2 } );
     *
     * for ( const tableSlot of tableWalker ) {
     *   console.log( 'A cell at row', tableSlot.row, 'and column', tableSlot.column );
     * }
     * ```
     *
     * For instance the code above for the following table:
     *
     *  +----+----+----+----+----+----+
     *  | 00      | 02 | 03 | 04 | 05 |
     *  |         +----+----+----+----+
     *  |         | 12      | 14 | 15 |
     *  |         +----+----+----+    +
     *  |         | 22           |    |
     *  |----+----+----+----+----+    +
     *  | 30 | 31 | 32 | 33 | 34 |    |
     *  +----+----+----+----+----+----+
     *
     * will log in the console:
     *
     *  'A cell at row 1 and column 2'
     *  'A cell at row 1 and column 4'
     *  'A cell at row 1 and column 5'
     *  'A cell at row 2 and column 2'
     *
     * To also iterate over spanned cells:
     *
     * ```ts
     * const tableWalker = new TableWalker( table, { row: 1, includeAllSlots: true } );
     *
     * for ( const tableSlot of tableWalker ) {
     *   console.log( 'Slot at', tableSlot.row, 'x', tableSlot.column, ':', tableSlot.isAnchor ? 'is anchored' : 'is spanned' );
     * }
     * ```
     *
     * will log in the console for the table from the previous example:
     *
     *  'Cell at 1 x 0 : is spanned'
     *  'Cell at 1 x 1 : is spanned'
     *  'Cell at 1 x 2 : is anchored'
     *  'Cell at 1 x 3 : is spanned'
     *  'Cell at 1 x 4 : is anchored'
     *  'Cell at 1 x 5 : is anchored'
     *
     * **Note**: Option `row` is a shortcut that sets both `startRow` and `endRow` to the same row.
     * (Use either `row` or `startRow` and `endRow` but never together). Similarly the `column` option sets both `startColumn`
     * and `endColumn` to the same column (Use either `column` or `startColumn` and `endColumn` but never together).
     *
     * @param table A table over which the walker iterates.
     * @param options An object with configuration.
     * @param options.row A row index for which this iterator will output cells. Can't be used together with `startRow` and `endRow`.
     * @param options.startRow A row index from which this iterator should start. Can't be used together with `row`. Default value is 0.
     * @param options.endRow A row index at which this iterator should end. Can't be used together with `row`.
     * @param options.column A column index for which this iterator will output cells.
     * Can't be used together with `startColumn` and `endColumn`.
     * @param options.startColumn A column index from which this iterator should start.
     * Can't be used together with `column`. Default value is 0.
     * @param options.endColumn A column index at which this iterator should end. Can't be used together with `column`.
     * @param options.includeAllSlots Also return values for spanned cells. Default value is "false".
     */
    constructor(table: ModelElement, options?: TableWalkerOptions);
    /**
     * Iterable interface.
     */
    [Symbol.iterator](): IterableIterator<TableSlot>;
    /**
     * Gets the next table walker's value.
     *
     * @returns The next table walker's value.
     */
    next(): IteratorResult<TableSlot, undefined>;
    /**
     * Marks a row to skip in the next iteration. It will also skip cells from the current row if there are any cells from the current row
     * to output.
     *
     * @param row The row index to skip.
     */
    skipRow(row: number): void;
    /**
     * Advances internal cursor to the next row.
     */
    private _advanceToNextRow;
    /**
     * Checks if the current row is over {@link #_endRow}.
     */
    private _isOverEndRow;
    /**
     * Checks if the current cell is over {@link #_endColumn}
     */
    private _isOverEndColumn;
    /**
     * A common method for formatting the iterator's output value.
     *
     * @param cell The table cell to output.
     * @param anchorRow The row index of a cell anchor slot.
     * @param anchorColumn The column index of a cell anchor slot.
     */
    private _formatOutValue;
    /**
     * Checks if the current slot should be skipped.
     */
    private _shouldSkipSlot;
    /**
     * Returns the cell element that is spanned over the current cell location.
     */
    private _getSpanned;
    /**
     * Updates spanned cells map relative to the current cell location and its span dimensions.
     *
     * @param cell A cell that is spanned.
     * @param rowspan Cell height.
     * @param colspan Cell width.
     */
    private _recordSpans;
    /**
     * Marks the cell location as spanned by another cell.
     *
     * @param row The row index of the cell location.
     * @param column The column index of the cell location.
     * @param data A spanned cell details (cell element, anchor row and column).
     */
    private _markSpannedCell;
    /**
     * Checks if part of the table can be skipped.
     */
    private _canJumpToStartRow;
    /**
     * Sets the current row to `this._startRow` or the first row before it that has the number of cells
     * equal to the number of columns in the table.
     *
     * Example:
     * 	+----+----+----+
     *  | 00 | 01 | 02 |
     *  |----+----+----+
     *  | 10      | 12 |
     *  |         +----+
     *  |         | 22 |
     *  |         +----+
     *  |         | 32 | <--- Start row
     *  +----+----+----+
     *  | 40 | 41 | 42 |
     *  +----+----+----+
     *
     * If the 4th row is a `this._startRow`, this method will:
     * 1.) Count the number of columns this table has based on the first row (3 columns in this case).
     * 2.) Check if the 4th row contains 3 cells. It doesn't, so go to the row before it.
     * 3.) Check if the 3rd row contains 3 cells. It doesn't, so go to the row before it.
     * 4.) Check if the 2nd row contains 3 cells. It does, so set the current row to that row.
     *
     * Setting the current row this way is necessary to let the `next()`  method loop over the cells
     * spanning multiple rows or columns and update the `this._spannedCells` property.
     */
    private _jumpToNonSpannedRowClosestToStartRow;
    /**
     * Returns a number of columns in a row taking `colspan` into consideration.
     */
    private _getRowLength;
}
/**
 * An object returned by {@link module:table/tablewalker~TableWalker} when traversing table cells.
 */
declare class TableSlot {
    /**
     * The current table cell.
     */
    readonly cell: ModelElement;
    /**
     * The row index of a table slot.
     */
    readonly row: number;
    /**
     * The column index of a table slot.
     */
    readonly column: number;
    /**
     * The row index of a cell anchor slot.
     */
    readonly cellAnchorRow: number;
    /**
     * The column index of a cell anchor slot.
     */
    readonly cellAnchorColumn: number;
    /**
     * The index of the current cell in the parent row.
     */
    private readonly _cellIndex;
    /**
     * The index of the current row element in the table.
     */
    private readonly _rowIndex;
    /**
     * The table element.
     */
    private readonly _table;
    /**
     * Creates an instance of the table walker value.
     *
     * @param tableWalker The table walker instance.
     * @param cell The current table cell.
     * @param anchorRow The row index of a cell anchor slot.
     * @param anchorColumn The column index of a cell anchor slot.
     */
    constructor(tableWalker: TableWalker, cell: ModelElement, anchorRow: number, anchorColumn: number);
    /**
     * Whether the cell is anchored in the current slot.
     */
    get isAnchor(): boolean;
    /**
     * The width of a cell defined by a `colspan` attribute. If the model attribute is not present, it is set to `1`.
     */
    get cellWidth(): number;
    /**
     * The height of a cell defined by a `rowspan` attribute. If the model attribute is not present, it is set to `1`.
     */
    get cellHeight(): number;
    /**
     * The index of the current row element in the table.
     */
    get rowIndex(): number;
    /**
     * Returns the {@link module:engine/model/position~ModelPosition} before the table slot.
     */
    getPositionBefore(): ModelPosition;
}
export { TableSlot };
/**
 * This `TableSlot`'s getter (property) was removed in CKEditor 5 v20.0.0.
 *
 * Check out the new `TableWalker`'s API in the documentation.
 *
 * @error tableslot-getter-removed
 * @param getterName
 */
