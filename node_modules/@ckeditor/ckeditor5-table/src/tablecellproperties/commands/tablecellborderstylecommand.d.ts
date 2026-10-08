/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/tablecellproperties/commands/tablecellborderstylecommand
 */
import type { Editor } from 'ckeditor5/src/core.js';
import type { ModelElement } from 'ckeditor5/src/engine.js';
import { TableCellPropertyCommand } from './tablecellpropertycommand.js';
/**
 * The table cell border style command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * the `'tableCellBorderStyle'` editor command.
 *
 * To change the border style of selected cells, execute the command:
 *
 * ```ts
 * editor.execute( 'tableCellBorderStyle', {
 *   value: 'dashed'
 * } );
 * ```
 */
export declare class TableCellBorderStyleCommand extends TableCellPropertyCommand {
    /**
     * Creates a new `TableCellBorderStyleCommand` instance.
     *
     * @param editor An editor in which this command will be used.
     * @param defaultValue The default value of the attribute.
     */
    constructor(editor: Editor, defaultValue: string);
    /**
     * @inheritDoc
     */
    protected _getAttribute(tableCell: ModelElement): unknown;
}
