/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/commands/insertcolumncommand
 */
import { Command, type Editor } from 'ckeditor5/src/core.js';
/**
 * The insert column command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'insertTableColumnLeft'` and
 * `'insertTableColumnRight'` editor commands.
 *
 * To insert a column to the left of the selected cell, execute the following command:
 *
 * ```ts
 * editor.execute( 'insertTableColumnLeft' );
 * ```
 *
 * To insert a column to the right of the selected cell, execute the following command:
 *
 * ```ts
 * editor.execute( 'insertTableColumnRight' );
 * ```
 */
export declare class InsertColumnCommand extends Command {
    /**
     * The order of insertion relative to the column in which the caret is located.
     */
    readonly order: 'left' | 'right';
    /**
     * Creates a new `InsertColumnCommand` instance.
     *
     * @param editor An editor on which this command will be used.
     * @param options.order The order of insertion relative to the column in which the caret is located.
     * Possible values: `"left"` and `"right"`. Default value is "right".
     */
    constructor(editor: Editor, options?: {
        order?: 'left' | 'right';
    });
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command.
     *
     * Depending on the command's {@link #order} value, it inserts a column to the `'left'` or `'right'` of the column
     * in which the selection is set.
     *
     * @fires execute
     */
    execute(): void;
}
