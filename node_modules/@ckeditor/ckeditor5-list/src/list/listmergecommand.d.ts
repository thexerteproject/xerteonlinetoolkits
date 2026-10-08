/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/list/listmergecommand
 */
import { Command, type Editor } from 'ckeditor5/src/core.js';
import type { ModelElement } from 'ckeditor5/src/engine.js';
/**
 * The document list merge command. It is used by the {@link module:list/list~List list feature}.
 */
export declare class ListMergeCommand extends Command {
    /**
     * Whether list item should be merged before or after the selected block.
     */
    private readonly _direction;
    /**
     * Creates an instance of the command.
     *
     * @param editor The editor instance.
     * @param direction Whether list item should be merged before or after the selected block.
     */
    constructor(editor: Editor, direction: 'forward' | 'backward');
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Merges list blocks together (depending on the {@link #constructor}'s `direction` parameter).
     *
     * @fires execute
     * @fires afterExecute
     * @param options Command options.
     * @param options.shouldMergeOnBlocksContentLevel When set `true`, merging will be performed together
     * with {@link module:engine/model/model~Model#deleteContent} to get rid of the inline content in the selection or take advantage
     * of the heuristics in `deleteContent()` that helps convert lists into paragraphs in certain cases.
     */
    execute({ shouldMergeOnBlocksContentLevel }?: {
        shouldMergeOnBlocksContentLevel?: boolean;
    }): void;
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
     * Returns the boundary elements the merge should be executed for. These are not necessarily selection's first
     * and last position parents but sometimes sibling or even further blocks depending on the context.
     *
     * @param selection The selection the merge is executed for.
     * @param shouldMergeOnBlocksContentLevel When `true`, merge is performed together with
     * {@link module:engine/model/model~Model#deleteContent} to remove the inline content within the selection.
     */
    private _getMergeSubjectElements;
}
/**
 * Event fired by the {@link ~ListMergeCommand#execute} method.
 *
 * It allows to execute an action after executing the {@link module:list/list/listcommand~ListCommand#execute}
 * method, for example adjusting attributes of changed list items.
 *
 * @internal
 * @eventName ~ListMergeCommand#afterExecute
 */
export type ListMergeCommandAfterExecuteEvent = {
    name: 'afterExecute';
    args: [changedBlocks: Array<ModelElement>];
};
