/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module undo/basecommand
 */
import { Command, type Editor } from '@ckeditor/ckeditor5-core';
import { type Batch, type Operation, type ModelRange } from '@ckeditor/ckeditor5-engine';
/**
 * Base class for the undo feature commands: {@link module:undo/undocommand~UndoCommand} and {@link module:undo/redocommand~RedoCommand}.
 */
export declare abstract class UndoRedoBaseCommand extends Command {
    /**
     * Stack of items stored by the command. These are pairs of:
     *
     * * {@link module:engine/model/batch~Batch batch} saved by the command,
     * * {@link module:engine/model/selection~ModelSelection selection} state at the moment of saving the batch.
     */
    protected _stack: Array<{
        batch: Batch;
        selection: {
            ranges: Array<ModelRange>;
            isBackward: boolean;
        };
    }>;
    /**
     * Stores all batches that were created by this command.
     *
     * @internal
     */
    _createdBatches: WeakSet<Batch>;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Returns all batches created by this command.
     */
    get createdBatches(): WeakSet<Batch>;
    /**
     * Stores a batch in the command, together with the selection state of the {@link module:engine/model/document~ModelDocument document}
     * created by the editor which this command is registered to.
     *
     * @param batch The batch to add.
     */
    addBatch(batch: Batch): void;
    /**
     * Removes all items from the stack.
     */
    clearStack(): void;
    /**
     * Restores the {@link module:engine/model/document~ModelDocument#selection document selection} state after a batch was undone.
     *
     * @param ranges Ranges to be restored.
     * @param isBackward A flag describing whether the restored range was selected forward or backward.
     * @param operations Operations which has been applied since selection has been stored.
     */
    protected _restoreSelection(ranges: Array<ModelRange>, isBackward: boolean, operations: Array<Operation>): void;
    /**
     * Undoes a batch by reversing that batch, transforming reversed batch and finally applying it.
     * This is a helper method for {@link #execute}.
     *
     * @param batchToUndo The batch to be undone.
     * @param undoingBatch The batch that will contain undoing changes.
     */
    protected _undo(batchToUndo: Batch, undoingBatch: Batch): void;
}
/**
 * Fired when execution of the undo or redo command reverts some batch.
 *
 * @eventName ~UndoRedoBaseCommand#revert
 */
export type UndoRedoBaseCommandRevertEvent = {
    name: 'revert';
    args: [batch: Batch, undoingBatch: Batch];
};
