/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { TableCellPropertyCommand } from './tablecellpropertycommand.js';
import { getSingleValue } from '../../utils/table-properties.js';
/**
 * The table cell border color command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * the `'tableCellBorderColor'` editor command.
 *
 * To change the border color of selected cells, execute the command:
 *
 * ```ts
 * editor.execute( 'tableCellBorderColor', {
 *   value: '#f00'
 * } );
 * ```
 */
export class TableCellBorderColorCommand extends TableCellPropertyCommand {
    /**
     * Creates a new `TableCellBorderColorCommand` instance.
     *
     * @param editor An editor in which this command will be used.
     * @param defaultValue The default value of the attribute.
     */
    constructor(editor, defaultValue) {
        super(editor, 'tableCellBorderColor', defaultValue);
    }
    /**
     * @inheritDoc
     */
    _getAttribute(tableCell) {
        if (!tableCell) {
            return;
        }
        const value = getSingleValue(tableCell.getAttribute(this.attributeName));
        if (value === this._defaultValue) {
            return;
        }
        return value;
    }
}
