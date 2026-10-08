/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/tableproperties/commands/tableborderwidthcommand
 */
import type { ModelElement } from 'ckeditor5/src/engine.js';
import type { Editor } from 'ckeditor5/src/core.js';
import { TablePropertyCommand } from './tablepropertycommand.js';
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
export declare class TableBorderWidthCommand extends TablePropertyCommand {
    /**
     * Creates a new `TableBorderWidthCommand` instance.
     *
     * @param editor An editor in which this command will be used.
     * @param defaultValue The default value of the attribute.
     */
    constructor(editor: Editor, defaultValue: string);
    /**
     * @inheritDoc
     */
    protected _getValue(table: ModelElement): string | undefined;
    /**
     * @inheritDoc
     */
    protected _getValueToSet(value: string | number | undefined): unknown;
}
