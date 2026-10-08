/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { TablePropertyCommand } from './tablepropertycommand.js';
import { addDefaultUnitToNumericValue, getSingleValue } from '../../utils/table-properties.js';
/**
 * The table width border command.
 *
 * The command is registered by the {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing} as
 * the `'tableBorderWidth'` editor command.
 *
 * To change the border width of the selected table, execute the command:
 *
 * ```ts
 * editor.execute( 'tableBorderWidth', {
 *   value: '5px'
 * } );
 * ```
 *
 * **Note**: This command adds the default `'px'` unit to numeric values. Executing:
 *
 * ```ts
 * editor.execute( 'tableBorderWidth', {
 *   value: '5'
 * } );
 * ```
 *
 * will set the `borderWidth` attribute to `'5px'` in the model.
 */
export class TableBorderWidthCommand extends TablePropertyCommand {
    /**
     * Creates a new `TableBorderWidthCommand` instance.
     *
     * @param editor An editor in which this command will be used.
     * @param defaultValue The default value of the attribute.
     */
    constructor(editor, defaultValue) {
        super(editor, 'tableBorderWidth', defaultValue);
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
