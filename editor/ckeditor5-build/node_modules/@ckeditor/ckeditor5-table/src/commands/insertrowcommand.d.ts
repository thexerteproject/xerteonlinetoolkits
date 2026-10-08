/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/commands/insertrowcommand
 */
import { Command, type Editor } from 'ckeditor5/src/core.js';
/**
 * The insert row command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'insertTableRowBelow'` and
 * `'insertTableRowAbove'` editor commands.
 *
 * To insert a row below the selected cell, execute the following command:
 *
 * ```ts
 * editor.execute( 'insertTableRowBelow' );
 * ```
 *
 * To insert a row above the selected cell, execute the following command:
 *
 * ```ts
 * editor.execute( 'insertTableRowAbove' );
 * ```
 */
export declare class InsertRowCommand extends Command {
    /**
     * The order of insertion relative to the row in which the caret is located.
     */
    readonly order: 'above' | 'below';
    /**
     * Creates a new `InsertRowCommand` instance.
     *
     * @param editor The editor on which this command will be used.
     * @param options.order The order of insertion relative to the row in which the caret is located.
     * Possible values: `"above"` and `"below"`. Default value is "below"
     */
    constructor(editor: Editor, options?: {
        order?: 'above' | 'below';
    });
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command.
     *
     * Depending on the command's {@link #order} value, it inserts a row `'below'` or `'above'` the row in which selection is set.
     *
     * @fires execute
     */
    execute(): void;
}
