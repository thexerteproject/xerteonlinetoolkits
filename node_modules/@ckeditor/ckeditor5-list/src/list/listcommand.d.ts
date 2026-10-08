/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/list/listcommand
 */
import type { ModelElement } from 'ckeditor5/src/engine.js';
import { Command, type Editor } from 'ckeditor5/src/core.js';
import type { ListType } from './listediting.js';
/**
 * The list command. It is used by the {@link module:list/list~List list feature}.
 */
export declare class ListCommand extends Command {
    /**
     * The type of the list created by the command.
     */
    readonly type: ListType;
    /**
     * A flag indicating whether the command is active, which means that the selection starts in a list of the same type.
     *
     * @observable
     * @readonly
     */
    value: boolean;
    /**
     * List Walker options that change the range of the list items to be changed when the selection is collapsed within a list item.
     *
     * In a multi-level list, when the selection is collapsed within a list item, instead of changing only the list items of the same list
     * type and current indent level, the entire list structure is changed (all list items at all indent levels of any list type).
     */
    private readonly _listWalkerOptions?;
    /**
     * Creates an instance of the command.
     *
     * @param editor The editor instance.
     * @param type List type that will be handled by this command.
     */
    constructor(editor: Editor, type: ListType, options?: {
        multiLevel?: boolean;
    });
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the list command.
     *
     * @fires execute
     * @fires afterExecute
     * @param options Command options.
     * @param options.forceValue If set, it will force the command behavior. If `true`, the command will try to convert the
     * selected items and potentially the neighbor elements to the proper list items. If set to `false` it will convert selected elements
     * to paragraphs. If not set, the command will toggle selected elements to list items or paragraphs, depending on the selection.
     * @param options.additionalAttributes Additional attributes that are set for list items when the command is executed.
     */
    execute(options?: {
        forceValue?: boolean;
        additionalAttributes?: Record<string, unknown>;
    }): void;
    /**
     * Fires the `afterExecute` event.
     *
     * @param changedBlocks The changed list elements.
     */
    private _fireAfterExecute;
    /**
     * Checks the command's {@link #value}.
     *
     * @returns The current value.
     */
    private _getValue;
    /**
     * Checks whether the command can be enabled in the current context.
     *
     * @returns Whether the command should be enabled.
     */
    private _checkEnabled;
}
/**
 * Event fired by the {@link ~ListCommand#execute} method.
 *
 * It allows to execute an action after executing the {@link ~ListCommand#execute} method,
 * for example adjusting attributes of changed list items.
 *
 * @internal
 * @eventName ~ListCommand#afterExecute
 */
export type ListCommandAfterExecuteEvent = {
    name: 'afterExecute';
    args: [changedBlocks: Array<ModelElement>];
};
