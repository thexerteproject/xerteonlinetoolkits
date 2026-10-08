/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/tableproperties/commands/tablepropertycommand
 */
import type { Batch, ModelElement } from 'ckeditor5/src/engine.js';
import { Command, type Editor } from 'ckeditor5/src/core.js';
export interface TablePropertyCommandExecuteOptions {
    batch?: Batch;
    columnWidths?: string;
    table?: ModelElement;
    tableWidth?: string;
    value?: string;
}
/**
 * The table cell attribute command.
 *
 * This command is a base command for other table property commands.
 */
export declare class TablePropertyCommand extends Command {
    /**
     * The attribute that will be set by the command.
     */
    readonly attributeName: string;
    /**
     * The default value for the attribute.
     *
     * @readonly
     */
    protected _defaultValue: string | undefined;
    /**
     * The default value for the attribute for the content table.
     */
    private readonly _defaultContentTableValue;
    /**
     * The default value for the attribute for the layout table.
     */
    private readonly _defaultLayoutTableValue;
    /**
     * Creates a new `TablePropertyCommand` instance.
     *
     * @param editor An editor in which this command will be used.
     * @param attributeName Table cell attribute name.
     * @param defaultValue The default value of the attribute.
     */
    constructor(editor: Editor, attributeName: string, defaultValue?: string);
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command.
     *
     * @fires execute
     * @param options.value If set, the command will set the attribute on the selected table.
     * If not set, the command will remove the attribute from the selected table.
     * @param options.batch Pass the model batch instance to the command to aggregate changes,
     * for example, to allow a single undo step for multiple executions.
     */
    execute(options?: TablePropertyCommandExecuteOptions): void;
    /**
     * Returns the attribute value for a table.
     */
    protected _getValue(table: ModelElement): unknown;
    /**
     * Returns the proper model value. It can be used to add a default unit to numeric values.
     */
    protected _getValueToSet(value: string | number | undefined): unknown;
}
