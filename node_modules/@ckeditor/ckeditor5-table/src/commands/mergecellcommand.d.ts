/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/commands/mergecellcommand
 */
import type { ModelNode } from 'ckeditor5/src/engine.js';
import { Command, type Editor } from 'ckeditor5/src/core.js';
import type { ArrowKeyCodeDirection } from 'ckeditor5/src/utils.js';
/**
 * The merge cell command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'mergeTableCellRight'`, `'mergeTableCellLeft'`,
 * `'mergeTableCellUp'` and `'mergeTableCellDown'` editor commands.
 *
 * To merge a table cell at the current selection with another cell, execute the command corresponding with the preferred direction.
 *
 * For example, to merge with a cell to the right:
 *
 * ```ts
 * editor.execute( 'mergeTableCellRight' );
 * ```
 *
 * **Note**: If a table cell has a different [`rowspan`](https://www.w3.org/TR/html50/tabular-data.html#attr-tdth-rowspan)
 * (for `'mergeTableCellRight'` and `'mergeTableCellLeft'`) or [`colspan`](https://www.w3.org/TR/html50/tabular-data.html#attr-tdth-colspan)
 * (for `'mergeTableCellUp'` and `'mergeTableCellDown'`), the command will be disabled.
 */
export declare class MergeCellCommand extends Command {
    /**
     * The direction that indicates which cell will be merged with the currently selected one.
     */
    readonly direction: ArrowKeyCodeDirection;
    /**
     * Whether the merge is horizontal (left/right) or vertical (up/down).
     */
    readonly isHorizontal: boolean;
    /**
     * @inheritDoc
     */
    value: ModelNode | undefined;
    /**
     * Creates a new `MergeCellCommand` instance.
     *
     * @param editor The editor on which this command will be used.
     * @param options.direction Indicates which cell to merge with the currently selected one.
     * Possible values are: `'left'`, `'right'`, `'up'` and `'down'`.
     */
    constructor(editor: Editor, options: {
        direction: ArrowKeyCodeDirection;
    });
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command.
     *
     * Depending on the command's {@link #direction} value, it will merge the cell that is to the `'left'`, `'right'`, `'up'` or `'down'`.
     *
     * @fires execute
     */
    execute(): void;
    /**
     * Returns a cell that can be merged with the current cell depending on the command's direction.
     */
    private _getMergeableCell;
}
