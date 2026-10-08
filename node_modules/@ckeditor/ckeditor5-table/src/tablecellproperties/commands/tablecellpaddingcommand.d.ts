/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/tablecellproperties/commands/tablecellpaddingcommand
 */
import type { Editor } from 'ckeditor5/src/core.js';
import type { ModelElement } from 'ckeditor5/src/engine.js';
import { TableCellPropertyCommand } from './tablecellpropertycommand.js';
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
export declare class TableCellPaddingCommand extends TableCellPropertyCommand {
    /**
     * Creates a new `TableCellPaddingCommand` instance.
     *
     * @param editor An editor in which this command will be used.
     * @param defaultValue The default value of the attribute.
     */
    constructor(editor: Editor, defaultValue: string);
    /**
     * @inheritDoc
     */
    protected _getAttribute(tableCell: ModelElement): unknown;
    /**
     * @inheritDoc
     */
    protected _getValueToSet(value: string | number | undefined): unknown;
}
