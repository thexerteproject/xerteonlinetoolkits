/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/commands/setheaderrowcommand
 */
import { Command } from 'ckeditor5/src/core.js';
/**
 * The header row command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'setTableColumnHeader'` editor command.
 *
 * You can make the row containing the selected cell a [header](https://www.w3.org/TR/html50/tabular-data.html#the-th-element) by executing:
 *
 * ```ts
 * editor.execute( 'setTableRowHeader' );
 * ```
 *
 * **Note:** All preceding rows will also become headers. If the current row is already a header, executing this command
 * will make it a regular row back again (including the following rows).
 */
export declare class SetHeaderRowCommand extends Command {
    /**
     * Flag indicating whether the command is active. The command is active when the
     * {@link module:engine/model/selection~ModelSelection} is in a header row.
     *
     * @observable
     */
    value: boolean;
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command.
     *
     * When the selection is in a non-header row, the command will set the `headingRows` table attribute to cover that row.
     *
     * When the selection is already in a header row, it will set `headingRows` so the heading section will end before that row.
     *
     * @fires execute
     * @param options.forceValue If set, the command will set (`true`) or unset (`false`) the header rows according to
     * the `forceValue` parameter instead of the current model state.
     */
    execute(options?: {
        forceValue?: boolean;
    }): void;
    /**
     * Checks if a table cell is in the heading section.
     */
    private _isInHeading;
}
