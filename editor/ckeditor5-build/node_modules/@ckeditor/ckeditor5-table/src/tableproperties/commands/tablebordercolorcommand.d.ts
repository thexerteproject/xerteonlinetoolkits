/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/tableproperties/commands/tablebordercolorcommand
 */
import type { ModelElement } from 'ckeditor5/src/engine.js';
import type { Editor } from 'ckeditor5/src/core.js';
import { TablePropertyCommand } from './tablepropertycommand.js';
/**
 * The table border color command.
 *
 * The command is registered by the {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing} as
 * the `'tableBorderColor'` editor command.
 *
 * To change the border color of the selected table, execute the command:
 *
 * ```ts
 * editor.execute( 'tableBorderColor', {
 *   value: '#f00'
 * } );
 * ```
 */
export declare class TableBorderColorCommand extends TablePropertyCommand {
    /**
     * Creates a new `TableBorderColorCommand` instance.
     *
     * @param editor An editor in which this command will be used.
     * @param defaultValue The default value of the attribute.
     */
    constructor(editor: Editor, defaultValue: string);
    /**
     * @inheritDoc
     */
    protected _getValue(table: ModelElement): unknown;
}
