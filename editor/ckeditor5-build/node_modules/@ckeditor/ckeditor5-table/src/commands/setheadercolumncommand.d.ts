/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/commands/setheadercolumncommand
 */
import { Command } from 'ckeditor5/src/core.js';
/**
 * The header column command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'setTableColumnHeader'` editor command.
 *
 * You can make the column containing the selected cell a [header](https://www.w3.org/TR/html50/tabular-data.html#the-th-element)
 * by executing:
 *
 * ```ts
 * editor.execute( 'setTableColumnHeader' );
 * ```
 *
 * **Note:** All preceding columns will also become headers. If the current column is already a header, executing this command
 * will make it a regular column back again (including the following columns).
 */
export declare class SetHeaderColumnCommand extends Command {
    /**
     * Flag indicating whether the command is active. The command is active when the
     * {@link module:engine/model/selection~ModelSelection} is in a header column.
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
     * When the selection is in a non-header column, the command will set the `headingColumns` table attribute to cover that column.
     *
     * When the selection is already in a header column, it will set `headingColumns` so the heading section will end before that column.
     *
     * @fires execute
     * @param options.forceValue If set, the command will set (`true`) or unset (`false`) the header columns according to
     * the `forceValue` parameter instead of the current model state.
     */
    execute(options?: {
        forceValue?: boolean;
    }): void;
}
