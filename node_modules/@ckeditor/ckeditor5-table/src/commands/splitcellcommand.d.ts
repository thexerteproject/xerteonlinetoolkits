/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/commands/splitcellcommand
 */
import { Command, type Editor } from 'ckeditor5/src/core.js';
/**
 * The split cell command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'splitTableCellVertically'`
 * and `'splitTableCellHorizontally'`  editor commands.
 *
 * You can split any cell vertically or horizontally by executing this command. For example, to split the selected table cell vertically:
 *
 * ```ts
 * editor.execute( 'splitTableCellVertically' );
 * ```
 */
export declare class SplitCellCommand extends Command {
    /**
     * The direction that indicates which cell will be split.
     */
    readonly direction: 'horizontally' | 'vertically';
    /**
     * Creates a new `SplitCellCommand` instance.
     *
     * @param editor The editor on which this command will be used.
     * @param options.direction Indicates whether the command should split cells `'horizontally'` or `'vertically'`.
     */
    constructor(editor: Editor, options?: {
        direction?: 'horizontally' | 'vertically';
    });
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * @inheritDoc
     */
    execute(): void;
}
