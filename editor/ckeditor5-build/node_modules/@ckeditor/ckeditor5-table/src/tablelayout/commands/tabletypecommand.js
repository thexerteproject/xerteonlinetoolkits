/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/tablelayout/commands/tabletypecommand
 */
import { Command } from 'ckeditor5/src/core.js';
import { getSelectionAffectedTable } from '../../utils/common.js';
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
export class TableTypeCommand extends Command {
    /**
     * @inheritDoc
     */
    refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;
        const selectedTable = getSelectionAffectedTable(selection);
        if (selectedTable) {
            this.isEnabled = true;
            this.value = selectedTable.getAttribute('tableType');
        }
        else {
            this.isEnabled = false;
            this.value = null;
        }
    }
    /**
     * Executes the command.
     *
     * Set table type by the given table type parameter.
     *
     * @param tableType The type of table it should become.
     * @fires execute
     */
    execute(tableType) {
        const editor = this.editor;
        const model = editor.model;
        const selection = model.document.selection;
        const table = getSelectionAffectedTable(selection);
        const currentTableType = table.getAttribute('tableType');
        if (currentTableType === tableType) {
            return;
        }
        model.change(writer => {
            writer.setAttribute('tableType', tableType, table);
            model.schema.removeDisallowedAttributes([table], writer);
            const tableChildren = table.getChildren();
            // Check if all children are allowed for the new table type.
            for (const child of tableChildren) {
                if (!model.schema.checkChild(table, child)) {
                    writer.remove(child);
                }
            }
        });
    }
}
