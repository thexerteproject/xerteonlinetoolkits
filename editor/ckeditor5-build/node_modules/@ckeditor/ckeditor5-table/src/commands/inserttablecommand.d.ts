/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/commands/inserttablecommand
 */
import { Command } from 'ckeditor5/src/core.js';
/**
 * The insert table command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'insertTable'` editor command.
 *
 * To insert a table at the current selection, execute the command and specify the dimensions:
 *
 * ```ts
 * editor.execute( 'insertTable', { rows: 20, columns: 5 } );
 * ```
 */
export declare class InsertTableCommand extends Command {
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command.
     *
     * Inserts a table with the given number of rows and columns into the editor.
     *
     * @param options.rows The number of rows to create in the inserted table. Default value is 2.
     * @param options.columns The number of columns to create in the inserted table. Default value is 2.
     * @param options.headingRows The number of heading rows. If not provided it will default to
     * {@link module:table/tableconfig~TableConfig#defaultHeadings `config.table.defaultHeadings.rows`} table config.
     * @param options.headingColumns The number of heading columns. If not provided it will default to
     * {@link module:table/tableconfig~TableConfig#defaultHeadings `config.table.defaultHeadings.columns`} table config.
     * @fires execute
     */
    execute(options?: {
        rows?: number;
        columns?: number;
        headingRows?: number;
        headingColumns?: number;
    }): void;
}
