/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command } from 'ckeditor5/src/core.js';
/**
 * The merge cells command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'mergeTableCells'` editor command.
 *
 * For example, to merge selected table cells:
 *
 * ```ts
 * editor.execute( 'mergeTableCells' );
 * ```
 */
export declare class MergeCellsCommand extends Command {
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command.
     *
     * @fires execute
     */
    execute(): void;
}
