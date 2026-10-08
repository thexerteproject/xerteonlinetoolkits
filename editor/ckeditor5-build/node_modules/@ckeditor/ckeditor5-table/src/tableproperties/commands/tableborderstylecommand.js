/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { TablePropertyCommand } from './tablepropertycommand.js';
import { getSingleValue } from '../../utils/table-properties.js';
/**
 * The table style border command.
 *
 * The command is registered by the {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing} as
 * the `'tableBorderStyle'` editor command.
 *
 * To change the border style of the selected table, execute the command:
 *
 * ```ts
 * editor.execute( 'tableBorderStyle', {
 *   value: 'dashed'
 * } );
 * ```
 */
export class TableBorderStyleCommand extends TablePropertyCommand {
    /**
     * Creates a new `TableBorderStyleCommand` instance.
     *
     * @param editor An editor in which this command will be used.
     * @param defaultValue The default value of the attribute.
     */
    constructor(editor, defaultValue) {
        super(editor, 'tableBorderStyle', defaultValue);
    }
    /**
     * @inheritDoc
     */
    _getValue(table) {
        if (!table) {
            return;
        }
        const value = getSingleValue(table.getAttribute(this.attributeName));
        if (value === this._defaultValue) {
            return;
        }
        return value;
    }
}
