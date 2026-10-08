/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/list/listsplitcommand
 */
import type { ModelElement } from 'ckeditor5/src/engine.js';
import { Command, type Editor } from 'ckeditor5/src/core.js';
/**
 * The document list split command that splits the list item at the selection.
 *
 * It is used by the {@link module:list/list~List list feature}.
 */
export declare class ListSplitCommand extends Command {
    /**
     * Whether list item should be split before or after the selected block.
     */
    private readonly _direction;
    /**
     * Creates an instance of the command.
     *
     * @param editor The editor instance.
     * @param direction Whether list item should be split before or after the selected block.
     */
    constructor(editor: Editor, direction: 'before' | 'after');
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Splits the list item at the selection.
     *
     * @fires execute
     * @fires afterExecute
     */
    execute(): void;
    /**
     * Fires the `afterExecute` event.
     *
     * @param changedBlocks The changed list elements.
     */
    private _fireAfterExecute;
    /**
     * Checks whether the command can be enabled in the current context.
     *
     * @returns Whether the command should be enabled.
     */
    private _checkEnabled;
    /**
     * Returns the model element that is the main focus of the command (according to the current selection and command direction).
     */
    private _getStartBlock;
}
/**
 * Event fired by the {@link ~ListSplitCommand#execute} method.
 *
 * It allows to execute an action after executing the {@link module:list/list/listcommand~ListCommand#execute}
 * method, for example adjusting attributes of changed list items.
 *
 * @internal
 * @eventName ~ListSplitCommand#afterExecute
 */
export type ListSplitCommandAfterExecuteEvent = {
    name: 'afterExecute';
    args: [changedBlocks: Array<ModelElement>];
};
