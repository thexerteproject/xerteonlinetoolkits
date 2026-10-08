/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { TableCellPropertyCommand } from './tablecellpropertycommand.js';
import { addDefaultUnitToNumericValue, getSingleValue } from '../../utils/table-properties.js';
/**
 * The table cell padding command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * the `'tableCellPadding'` editor command.
 *
 * To change the padding of selected cells, execute the command:
 *
 * ```ts
 * editor.execute( 'tableCellPadding', {
 *   value: '5px'
 * } );
 * ```
 *
 * **Note**: This command adds the default `'px'` unit to numeric values. Executing:
 *
 * ```ts
 * editor.execute( 'tableCellPadding', {
 *   value: '5'
 * } );
 * ```
 *
 * will set the `padding` attribute to `'5px'` in the model.
 */
export class TableCellPaddingCommand extends TableCellPropertyCommand {
    /**
     * Creates a new `TableCellPaddingCommand` instance.
     *
     * @param editor An editor in which this command will be used.
     * @param defaultValue The default value of the attribute.
     */
    constructor(editor, defaultValue) {
        super(editor, 'tableCellPadding', defaultValue);
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
    /**
     * @inheritDoc
     */
    _getValueToSet(value) {
        const newValue = addDefaultUnitToNumericValue(value, 'px');
        if (newValue === this._defaultValue) {
            return;
        }
        return newValue;
    }
}
