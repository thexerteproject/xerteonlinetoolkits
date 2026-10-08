/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/tablelayout/commands/tabletypecommand
 */
import { Command } from 'ckeditor5/src/core.js';
import type { TableType } from '../../tableconfig.js';
/**
 * The set table type command.
 *
 * The command is registered by {@link module:table/tablelayout/tablelayoutediting~TableLayoutEditing}
 * as the `'tableType'` editor command.
 *
 * To set the table type at the current selection, execute the command and specify the table type:
 *
 * ```ts
 * editor.execute( 'tableType', 'layout' );
 * ```
 */
export declare class TableTypeCommand extends Command {
    /**
     * The table type of selected table.
     *
     * @observable
     * @readonly
     */
    value: TableType | null;
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command.
     *
     * Set table type by the given table type parameter.
     *
     * @param tableType The type of table it should become.
     * @fires execute
     */
    execute(tableType: TableType): void;
}
