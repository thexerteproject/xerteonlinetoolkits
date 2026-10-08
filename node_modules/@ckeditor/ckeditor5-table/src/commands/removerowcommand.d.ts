/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/commands/removerowcommand
 */
import { Command } from 'ckeditor5/src/core.js';
/**
 * The remove row command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'removeTableRow'` editor command.
 *
 * To remove the row containing the selected cell, execute the command:
 *
 * ```ts
 * editor.execute( 'removeTableRow' );
 * ```
 */
export declare class RemoveRowCommand extends Command {
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * @inheritDoc
     */
    execute(): void;
}
