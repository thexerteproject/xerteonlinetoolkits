/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/utils/structure
 */
import type { ModelElement, ModelWriter, ViewElement } from 'ckeditor5/src/engine.js';
import { type TableSlot } from '../tablewalker.js';
import { type TableUtils } from '../tableutils.js';
/**
 * Returns a cropped table according to given dimensions.

 * To return a cropped table that starts at first row and first column and end in third row and column:
 *
 * ```ts
 * const croppedTable = cropTableToDimensions( table, {
 *   startRow: 1,
 *   endRow: 3,
 *   startColumn: 1,
 *   endColumn: 3
 * }, writer );
 * ```
 *
 * Calling the code above for the table below:
 *
 *        0   1   2   3   4                      0   1   2
 *      ┌───┬───┬───┬───┬───┐
 *   0  │ a │ b │ c │ d │ e │
 *      ├───┴───┤   ├───┴───┤                  ┌───┬───┬───┐
 *   1  │ f     │   │ g     │                  │   │   │ g │  0
 *      ├───┬───┴───┼───┬───┤   will return:   ├───┴───┼───┤
 *   2  │ h │ i     │ j │ k │                  │ i     │ j │  1
 *      ├───┤       ├───┤   │                  │       ├───┤
 *   3  │ l │       │ m │   │                  │       │ m │  2
 *      ├───┼───┬───┤   ├───┤                  └───────┴───┘
 *   4  │ n │ o │ p │   │ q │
 *      └───┴───┴───┴───┴───┘
 *
 * @internal
 */
export declare function cropTableToDimensions(sourceTable: ModelElement, cropDimensions: {
    startRow: number;
    startColumn: number;
    endRow: number;
    endColumn: number;
}, writer: ModelWriter): ModelElement;
/**
 * Returns slot info of cells that starts above and overlaps a given row.
 *
 * In a table below, passing `overlapRow = 3`
 *
 *     ┌───┬───┬───┬───┬───┐
 *  0  │ a │ b │ c │ d │ e │
 *     │   ├───┼───┼───┼───┤
 *  1  │   │ f │ g │ h │ i │
 *     ├───┤   ├───┼───┤   │
 *  2  │ j │   │ k │ l │   │
 *     │   │   │   ├───┼───┤
 *  3  │   │   │   │ m │ n │  <- overlap row to check
 *     ├───┼───┤   │   ├───│
 *  4  │ o │ p │   │   │ q │
 *     └───┴───┴───┴───┴───┘
 *
 * will return slot info for cells: "j", "f", "k".
 *
 * @internal
 * @param table The table to check.
 * @param overlapRow The index of the row to check.
 * @param startRow row to start analysis. Use it when it is known that the cells above that row will not overlap. Default value is 0.
 */
export declare function getVerticallyOverlappingCells(table: ModelElement, overlapRow: number, startRow?: number): Array<TableSlot>;
/**
 * Splits the table cell horizontally.
 *
 * @internal
 * @returns Created table cell, if any were created.
 */
export declare function splitHorizontally(tableCell: ModelElement, splitRow: number, writer: ModelWriter): ModelElement | null;
/**
 * Returns slot info of cells that starts before and overlaps a given column.
 *
 * In a table below, passing `overlapColumn = 3`
 *
 *    0   1   2   3   4
 *  ┌───────┬───────┬───┐
 *  │ a     │ b     │ c │
 *  │───┬───┴───────┼───┤
 *  │ d │ e         │ f │
 *  ├───┼───┬───────┴───┤
 *  │ g │ h │ i         │
 *  ├───┼───┼───┬───────┤
 *  │ j │ k │ l │ m     │
 *  ├───┼───┴───┼───┬───┤
 *  │ n │ o     │ p │ q │
 *  └───┴───────┴───┴───┘
 *                ^
 *                Overlap column to check
 *
 * will return slot info for cells: "b", "e", "i".
 *
 * @internal
 * @param table The table to check.
 * @param overlapColumn The index of the column to check.
 */
export declare function getHorizontallyOverlappingCells(table: ModelElement, overlapColumn: number): Array<TableSlot>;
/**
 * Splits the table cell vertically.
 *
 * @internal
 * @param columnIndex The table cell column index.
 * @param splitColumn The index of column to split cell on.
 * @returns Created table cell.
 */
export declare function splitVertically(tableCell: ModelElement, columnIndex: number, splitColumn: number, writer: ModelWriter): ModelElement;
/**
 * Adjusts table cell dimensions to not exceed limit row and column.
 *
 * If table cell width (or height) covers a column (or row) that is after a limit column (or row)
 * this method will trim "colspan" (or "rowspan") attribute so the table cell will fit in a defined limits.
 *
 * @internal
 */
export declare function trimTableCellIfNeeded(tableCell: ModelElement, cellRow: number, cellColumn: number, limitRow: number, limitColumn: number, writer: ModelWriter): void;
/**
 * Removes columns that have no cells anchored.
 *
 * In table below:
 *
 *     +----+----+----+----+----+----+----+
 *     | 00 | 01      | 03 | 04      | 06 |
 *     +----+----+----+----+         +----+
 *     | 10 | 11      | 13 |         | 16 |
 *     +----+----+----+----+----+----+----+
 *     | 20 | 21      | 23 | 24      | 26 |
 *     +----+----+----+----+----+----+----+
 *                  ^--- empty ---^
 *
 * Will remove columns 2 and 5.
 *
 * **Note:** This is a low-level helper method for clearing invalid model state when doing table modifications.
 * To remove a column from a table use {@link module:table/tableutils~TableUtils#removeColumns `TableUtils.removeColumns()`}.
 *
 * @internal
 * @returns True if removed some columns.
 */
export declare function removeEmptyColumns(table: ModelElement, tableUtils: TableUtils): boolean;
/**
 * Removes rows that have no cells anchored.
 *
 * In table below:
 *
 *     +----+----+----+
 *     | 00 | 01 | 02 |
 *     +----+----+----+
 *     | 10 | 11 | 12 |
 *     +    +    +    +
 *     |    |    |    | <-- empty
 *     +----+----+----+
 *     | 30 | 31 | 32 |
 *     +----+----+----+
 *     | 40      | 42 |
 *     +         +    +
 *     |         |    | <-- empty
 *     +----+----+----+
 *     | 60 | 61 | 62 |
 *     +----+----+----+
 *
 * Will remove rows 2 and 5.
 *
 * **Note:** This is a low-level helper method for clearing invalid model state when doing table modifications.
 * To remove a row from a table use {@link module:table/tableutils~TableUtils#removeRows `TableUtils.removeRows()`}.
 *
 * @internal
 * @returns True if removed some rows.
 */
export declare function removeEmptyRows(table: ModelElement, tableUtils: TableUtils): boolean;
/**
 * Removes rows and columns that have no cells anchored.
 *
 * In table below:
 *
 *     +----+----+----+----+
 *     | 00      | 02      |
 *     +----+----+         +
 *     | 10      |         |
 *     +----+----+----+----+
 *     | 20      | 22 | 23 |
 *     +         +    +    +
 *     |         |    |    | <-- empty row
 *     +----+----+----+----+
 *             ^--- empty column
 *
 * Will remove row 3 and column 1.
 *
 * **Note:** This is a low-level helper method for clearing invalid model state when doing table modifications.
 * To remove a rows from a table use {@link module:table/tableutils~TableUtils#removeRows `TableUtils.removeRows()`} and
 * {@link module:table/tableutils~TableUtils#removeColumns `TableUtils.removeColumns()`} to remove a column.
 *
 * @internal
 */
export declare function removeEmptyRowsColumns(table: ModelElement, tableUtils: TableUtils): void;
/**
 * Returns adjusted last row index if selection covers part of a row with empty slots (spanned by other cells).
 * The `dimensions.lastRow` is equal to last row index but selection might be bigger.
 *
 * This happens *only* on rectangular selection so we analyze a case like this:
 *
 *        +---+---+---+---+
 *      0 | a | b | c | d |
 *        +   +   +---+---+
 *      1 |   | e | f | g |
 *        +   +---+   +---+
 *      2 |   | h |   | i | <- last row, each cell has rowspan = 2,
 *        +   +   +   +   +    so we need to return 3, not 2
 *      3 |   |   |   |   |
 *        +---+---+---+---+
 *
 * @internal
 * @returns Adjusted last row index.
 */
export declare function adjustLastRowIndex(table: ModelElement, dimensions: {
    firstRow: number;
    firstColumn: number;
    lastRow: number;
    lastColumn: number;
}): number;
/**
 * Returns adjusted last column index if selection covers part of a column with empty slots (spanned by other cells).
 * The `dimensions.lastColumn` is equal to last column index but selection might be bigger.
 *
 * This happens *only* on rectangular selection so we analyze a case like this:
 *
 *       0   1   2   3
 *     +---+---+---+---+
 *     | a             |
 *     +---+---+---+---+
 *     | b | c | d     |
 *     +---+---+---+---+
 *     | e     | f     |
 *     +---+---+---+---+
 *     | g | h         |
 *     +---+---+---+---+
 *               ^
 *              last column, each cell has colspan = 2, so we need to return 3, not 2
 *
 * @internal
 * @returns Adjusted last column index.
 */
export declare function adjustLastColumnIndex(table: ModelElement, dimensions: {
    firstRow: number;
    firstColumn: number;
    lastRow: number;
    lastColumn: number;
}): number;
/**
 * Get view `<table>` element from the wrapper.
 */
export declare function getViewTableFromWrapper(wrapperView: ViewElement): ViewElement | undefined;
