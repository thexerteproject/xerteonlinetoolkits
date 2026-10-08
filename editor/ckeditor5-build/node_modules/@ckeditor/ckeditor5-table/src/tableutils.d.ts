/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin } from 'ckeditor5/src/core.js';
import type { ModelDocumentSelection, ModelElement, ModelRange, ModelSelection, ModelWriter } from 'ckeditor5/src/engine.js';
import { TableWalker, type TableWalkerOptions } from './tablewalker.js';
export type TableIndexesObject = {
    first: number;
    last: number;
};
/**
 * The table utilities plugin.
 */
export declare class TableUtils extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "TableUtils";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Returns the table cell location as an object with table row and table column indexes.
     *
     * For instance, in the table below:
     *
     *      0   1   2   3
     *    +---+---+---+---+
     *  0 | a     | b | c |
     *    +       +   +---+
     *  1 |       |   | d |
     *    +---+---+   +---+
     *  2 | e     |   | f |
     *    +---+---+---+---+
     *
     * the method will return:
     *
     * ```ts
     * const cellA = table.getNodeByPath( [ 0, 0 ] );
     * editor.plugins.get( 'TableUtils' ).getCellLocation( cellA );
     * // will return { row: 0, column: 0 }
     *
     * const cellD = table.getNodeByPath( [ 1, 0 ] );
     * editor.plugins.get( 'TableUtils' ).getCellLocation( cellD );
     * // will return { row: 1, column: 3 }
     * ```
     *
     * @returns Returns a `{row, column}` object.
     */
    getCellLocation(tableCell: ModelElement): {
        row: number;
        column: number;
    };
    /**
     * Creates an empty table with a proper structure. The table needs to be inserted into the model,
     * for example, by using the {@link module:engine/model/model~Model#insertContent} function.
     *
     * ```ts
     * model.change( ( writer ) => {
     *   // Create a table of 2 rows and 7 columns:
     *   const table = tableUtils.createTable( writer, { rows: 2, columns: 7 } );
     *
     *   // Insert a table to the model at the best position taking the current selection:
     *   model.insertContent( table );
     * }
     * ```
     *
     * @param writer The model writer.
     * @param options.rows The number of rows to create. Default value is 2.
     * @param options.columns The number of columns to create. Default value is 2.
     * @param options.headingRows The number of heading rows. Default value is 0.
     * @param options.headingColumns The number of heading columns. Default value is 0.
     * @returns The created table element.
     */
    createTable(writer: ModelWriter, options: {
        rows?: number;
        columns?: number;
        headingRows?: number;
        headingColumns?: number;
    }): ModelElement;
    /**
     * Inserts rows into a table.
     *
     * ```ts
     * editor.plugins.get( 'TableUtils' ).insertRows( table, { at: 1, rows: 2 } );
     * ```
     *
     * Assuming the table on the left, the above code will transform it to the table on the right:
     *
     *  row index
     *    0 +---+---+---+       `at` = 1,      +---+---+---+ 0
     *      | a | b | c |       `rows` = 2,    | a | b | c |
     *    1 +   +---+---+   <-- insert here    +   +---+---+ 1
     *      |   | d | e |                      |   |   |   |
     *    2 +   +---+---+       will give:     +   +---+---+ 2
     *      |   | f | g |                      |   |   |   |
     *    3 +---+---+---+                      +   +---+---+ 3
     *                                         |   | d | e |
     *                                         +   +---+---+ 4
     *                                         +   + f | g |
     *                                         +---+---+---+ 5
     *
     * @param table The table model element where the rows will be inserted.
     * @param options.at The row index at which the rows will be inserted.  Default value is 0.
     * @param options.rows The number of rows to insert.  Default value is 1.
     * @param options.copyStructureFromAbove The flag for copying row structure. Note that
     * the row structure will not be copied if this option is not provided.
     */
    insertRows(table: ModelElement, options?: {
        at?: number;
        rows?: number;
        copyStructureFromAbove?: boolean;
    }): void;
    /**
     * Inserts columns into a table.
     *
     * ```ts
     * editor.plugins.get( 'TableUtils' ).insertColumns( table, { at: 1, columns: 2 } );
     * ```
     *
     * Assuming the table on the left, the above code will transform it to the table on the right:
     *
     *  0   1   2   3                   0   1   2   3   4   5
     *  +---+---+---+                   +---+---+---+---+---+
     *  | a     | b |                   | a             | b |
     *  +       +---+                   +               +---+
     *  |       | c |                   |               | c |
     *  +---+---+---+     will give:    +---+---+---+---+---+
     *  | d | e | f |                   | d |   |   | e | f |
     *  +---+   +---+                   +---+---+---+   +---+
     *  | g |   | h |                   | g |   |   |   | h |
     *  +---+---+---+                   +---+---+---+---+---+
     *  | i         |                   | i                 |
     *  +---+---+---+                   +---+---+---+---+---+
     *      ^---- insert here, `at` = 1, `columns` = 2
     *
     * @param table The table model element where the columns will be inserted.
     * @param options.at The column index at which the columns will be inserted. Default value is 0.
     * @param options.columns The number of columns to insert. Default value is 1.
     */
    insertColumns(table: ModelElement, options?: {
        at?: number;
        columns?: number;
    }): void;
    /**
     * Removes rows from the given `table`.
     *
     * This method re-calculates the table geometry including `rowspan` attribute of table cells overlapping removed rows
     * and table headings values.
     *
     * ```ts
     * editor.plugins.get( 'TableUtils' ).removeRows( table, { at: 1, rows: 2 } );
     * ```
     *
     * Executing the above code in the context of the table on the left will transform its structure as presented on the right:
     *
     *  row index
     *      ┌───┬───┬───┐        `at` = 1        ┌───┬───┬───┐
     *    0 │ a │ b │ c │        `rows` = 2      │ a │ b │ c │ 0
     *      │   ├───┼───┤                        │   ├───┼───┤
     *    1 │   │ d │ e │  <-- remove from here  │   │ d │ g │ 1
     *      │   │   ├───┤        will give:      ├───┼───┼───┤
     *    2 │   │   │ f │                        │ h │ i │ j │ 2
     *      │   │   ├───┤                        └───┴───┴───┘
     *    3 │   │   │ g │
     *      ├───┼───┼───┤
     *    4 │ h │ i │ j │
     *      └───┴───┴───┘
     *
     * @param options.at The row index at which the removing rows will start.
     * @param options.rows The number of rows to remove. Default value is 1.
     */
    removeRows(table: ModelElement, options: {
        at: number;
        rows?: number;
    }): void;
    /**
     * Removes columns from the given `table`.
     *
     * This method re-calculates the table geometry including the `colspan` attribute of table cells overlapping removed columns
     * and table headings values.
     *
     * ```ts
     * editor.plugins.get( 'TableUtils' ).removeColumns( table, { at: 1, columns: 2 } );
     * ```
     *
     * Executing the above code in the context of the table on the left will transform its structure as presented on the right:
     *
     *    0   1   2   3   4                       0   1   2
     *  ┌───────────────┬───┐                   ┌───────┬───┐
     *  │ a             │ b │                   │ a     │ b │
     *  │               ├───┤                   │       ├───┤
     *  │               │ c │                   │       │ c │
     *  ├───┬───┬───┬───┼───┤     will give:    ├───┬───┼───┤
     *  │ d │ e │ f │ g │ h │                   │ d │ g │ h │
     *  ├───┼───┼───┤   ├───┤                   ├───┤   ├───┤
     *  │ i │ j │ k │   │ l │                   │ i │   │ l │
     *  ├───┴───┴───┴───┴───┤                   ├───┴───┴───┤
     *  │ m                 │                   │ m         │
     *  └───────────────────┘                   └───────────┘
     *        ^---- remove from here, `at` = 1, `columns` = 2
     *
     * @param options.at The row index at which the removing columns will start.
     * @param options.columns The number of columns to remove.
     */
    removeColumns(table: ModelElement, options: {
        at: number;
        columns?: number;
    }): void;
    /**
     * Divides a table cell vertically into several ones.
     *
     * The cell will be visually split into more cells by updating colspans of other cells in a column
     * and inserting cells (columns) after that cell.
     *
     * In the table below, if cell "a" is split into 3 cells:
     *
     *  +---+---+---+
     *  | a | b | c |
     *  +---+---+---+
     *  | d | e | f |
     *  +---+---+---+
     *
     * it will result in the table below:
     *
     *  +---+---+---+---+---+
     *  | a |   |   | b | c |
     *  +---+---+---+---+---+
     *  | d         | e | f |
     *  +---+---+---+---+---+
     *
     * So cell "d" will get its `colspan` updated to `3` and 2 cells will be added (2 columns will be created).
     *
     * Splitting a cell that already has a `colspan` attribute set will distribute the cell `colspan` evenly and the remainder
     * will be left to the original cell:
     *
     *  +---+---+---+
     *  | a         |
     *  +---+---+---+
     *  | b | c | d |
     *  +---+---+---+
     *
     * Splitting cell "a" with `colspan=3` into 2 cells will create 1 cell with a `colspan=a` and cell "a" that will have `colspan=2`:
     *
     *  +---+---+---+
     *  | a     |   |
     *  +---+---+---+
     *  | b | c | d |
     *  +---+---+---+
     */
    splitCellVertically(tableCell: ModelElement, numberOfCells?: number): void;
    /**
     * Divides a table cell horizontally into several ones.
     *
     * The cell will be visually split into more cells by updating rowspans of other cells in the row and inserting rows with a single cell
     * below.
     *
     * If in the table below cell "b" is split into 3 cells:
     *
     *  +---+---+---+
     *  | a | b | c |
     *  +---+---+---+
     *  | d | e | f |
     *  +---+---+---+
     *
     * It will result in the table below:
     *
     *  +---+---+---+
     *  | a | b | c |
     *  +   +---+   +
     *  |   |   |   |
     *  +   +---+   +
     *  |   |   |   |
     *  +---+---+---+
     *  | d | e | f |
     *  +---+---+---+
     *
     * So cells "a" and "b" will get their `rowspan` updated to `3` and 2 rows with a single cell will be added.
     *
     * Splitting a cell that already has a `rowspan` attribute set will distribute the cell `rowspan` evenly and the remainder
     * will be left to the original cell:
     *
     *  +---+---+---+
     *  | a | b | c |
     *  +   +---+---+
     *  |   | d | e |
     *  +   +---+---+
     *  |   | f | g |
     *  +   +---+---+
     *  |   | h | i |
     *  +---+---+---+
     *
     * Splitting cell "a" with `rowspan=4` into 3 cells will create 2 cells with a `rowspan=1` and cell "a" will have `rowspan=2`:
     *
     *  +---+---+---+
     *  | a | b | c |
     *  +   +---+---+
     *  |   | d | e |
     *  +---+---+---+
     *  |   | f | g |
     *  +---+---+---+
     *  |   | h | i |
     *  +---+---+---+
     */
    splitCellHorizontally(tableCell: ModelElement, numberOfCells?: number): void;
    /**
     * Returns the number of columns for a given table.
     *
     * ```ts
     * editor.plugins.get( 'TableUtils' ).getColumns( table );
     * ```
     *
     * @param table The table to analyze.
     */
    getColumns(table: ModelElement): number;
    /**
     * Returns the number of rows for a given table. Any other element present in the table model is omitted.
     *
     * ```ts
     * editor.plugins.get( 'TableUtils' ).getRows( table );
     * ```
     *
     * @param table The table to analyze.
     */
    getRows(table: ModelElement): number;
    /**
     * Creates an instance of the table walker.
     *
     * The table walker iterates internally by traversing the table from row index = 0 and column index = 0.
     * It walks row by row and column by column in order to output values defined in the options.
     * By default it will output only the locations that are occupied by a cell. To include also spanned rows and columns,
     * pass the `includeAllSlots` option.
     *
     * @internal
     * @param table A table over which the walker iterates.
     * @param options An object with configuration.
     */
    createTableWalker(table: ModelElement, options?: TableWalkerOptions): TableWalker;
    /**
     * Returns all model table cells that are fully selected (from the outside)
     * within the provided model selection's ranges.
     *
     * To obtain the cells selected from the inside, use
     * {@link #getTableCellsContainingSelection}.
     */
    getSelectedTableCells(selection: ModelSelection | ModelDocumentSelection): Array<ModelElement>;
    /**
     * Sets the number of heading rows for the given `table`.
     *
     * @param writer The model writer.
     * @param table The table model element.
     * @param headingRows The number of heading rows to set.
     * @param options Additional options.
     * @param options.shallow If set to `true` it will only update the `headingRows` attribute
     * without updating the cell types in the table. Default is `false`.
     * @param options.resetFormerHeadingCells If set to `true`, it will check if the rows that are no longer in the heading section
     * should be updated to body cells. Default is `true`.
     * @param options.autoExpand If set to `true`, it will check if the following rows look like a header and expand the heading section.
     * Default is `true`.
     */
    setHeadingRowsCount(writer: ModelWriter, table: ModelElement, headingRows: number, options?: {
        shallow?: boolean;
        resetFormerHeadingCells?: boolean;
        autoExpand?: boolean;
    }): void;
    /**
     * Sets the number of heading columns for the given `table`.
     *
     * @param writer The model writer to use.
     * @param table The table model element.
     * @param headingColumns The number of heading columns to set.
     * @param options Additional options.
     * @param options.shallow If set to `true` it will only update the `headingColumns` attribute
     * without updating the cell types in the table. Default is `false`.
     * @param options.resetFormerHeadingCells If set to `true`, it will check if the columns that are no longer in the heading section
     * should be updated to body cells. Default is `true`.
     * @param options.autoExpand If set to `true`, it will check if the following columns look like a header and expand the heading section.
     * Default is `true`.
     */
    setHeadingColumnsCount(writer: ModelWriter, table: ModelElement, headingColumns: number, options?: {
        shallow?: boolean;
        resetFormerHeadingCells?: boolean;
        autoExpand?: boolean;
    }): void;
    /**
     * Returns all model table cells that the provided model selection's ranges
     * {@link module:engine/model/range~ModelRange#start} inside.
     *
     * To obtain the cells selected from the outside, use
     * {@link #getSelectedTableCells}.
     */
    getTableCellsContainingSelection(selection: ModelSelection | ModelDocumentSelection): Array<ModelElement>;
    /**
     * Returns all model table cells that are either completely selected
     * by selection ranges or host selection range
     * {@link module:engine/model/range~ModelRange#start start positions} inside them.
     *
     * Combines {@link #getTableCellsContainingSelection} and
     * {@link #getSelectedTableCells}.
     */
    getSelectionAffectedTableCells(selection: ModelSelection | ModelDocumentSelection): Array<ModelElement>;
    /**
     * Returns an object with the `first` and `last` row index contained in the given `tableCells`.
     *
     * ```ts
     * const selectedTableCells = getSelectedTableCells( editor.model.document.selection );
     *
     * const { first, last } = getRowIndexes( selectedTableCells );
     *
     * console.log( `Selected rows: ${ first } to ${ last }` );
     * ```
     *
     * @returns Returns an object with the `first` and `last` table row indexes.
     */
    getRowIndexes(tableCells: Array<ModelElement>): TableIndexesObject;
    /**
     * Returns an object with the `first` and `last` column index contained in the given `tableCells`.
     *
     * ```ts
     * const selectedTableCells = getSelectedTableCells( editor.model.document.selection );
     *
     * const { first, last } = getColumnIndexes( selectedTableCells );
     *
     * console.log( `Selected columns: ${ first } to ${ last }` );
     * ```
     *
     * @returns Returns an object with the `first` and `last` table column indexes.
     */
    getColumnIndexes(tableCells: Array<ModelElement>): TableIndexesObject;
    /**
     * Checks if the selection contains cells that do not exceed rectangular selection.
     *
     * In a table below:
     *
     *  ┌───┬───┬───┬───┐
     *  │ a │ b │ c │ d │
     *  ├───┴───┼───┤   │
     *  │ e     │ f │   │
     *  │       ├───┼───┤
     *  │       │ g │ h │
     *  └───────┴───┴───┘
     *
     * Valid selections are these which create a solid rectangle (without gaps), such as:
     *   - a, b (two horizontal cells)
     *   - c, f (two vertical cells)
     *   - a, b, e (cell "e" spans over four cells)
     *   - c, d, f (cell d spans over a cell in the row below)
     *
     * While an invalid selection would be:
     *   - a, c (the unselected cell "b" creates a gap)
     *   - f, g, h (cell "d" spans over a cell from the row of "f" cell - thus creates a gap)
     */
    isSelectionRectangular(selectedTableCells: Array<ModelElement>): boolean;
    /**
     * Returns array of sorted ranges.
     */
    sortRanges(ranges: Iterable<ModelRange>): Array<ModelRange>;
    /**
     * Helper method to get an object with `first` and `last` indexes from an unsorted array of indexes.
     */
    private _getFirstLastIndexesObject;
    /**
     * Checks if the selection does not mix a header (column or row) with other cells.
     *
     * For instance, in the table below valid selections consist of cells with the same letter only.
     * So, a-a (same heading row and column) or d-d (body cells) are valid while c-d or a-b are not.
     *
     * header columns
     *    ↓   ↓
     *  ┌───┬───┬───┬───┐
     *  │ a │ a │ b │ b │  ← header row
     *  ├───┼───┼───┼───┤
     *  │ c │ c │ d │ d │
     *  ├───┼───┼───┼───┤
     *  │ c │ c │ d │ d │
     *  └───┴───┴───┴───┘
     */
    private _areCellInTheSameTableSection;
    /**
     * Unified check if table rows/columns indexes are in the same heading/body section.
     */
    private _areIndexesInSameSection;
}
