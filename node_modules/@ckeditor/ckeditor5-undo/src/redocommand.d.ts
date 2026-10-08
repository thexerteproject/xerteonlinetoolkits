/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module undo/redocommand
 */
import { UndoRedoBaseCommand } from './basecommand.js';
/**
 * The redo command stores {@link module:engine/model/batch~Batch batches} that were used to undo a batch by
 * {@link module:undo/undocommand~UndoCommand}. It is able to redo a previously undone batch by reversing the undoing
 * batches created by `UndoCommand`. The reversed batch is transformed by all the batches from
 * {@link module:engine/model/document~ModelDocument#history history} that happened after the reversed undo batch.
 *
 * The redo command also takes care of restoring the {@link module:engine/model/document~ModelDocument#selection document selection}.
 */
export declare class RedoCommand extends UndoRedoBaseCommand {
    /**
     * Executes the command. This method reverts the last {@link module:engine/model/batch~Batch batch} added to
     * the command's stack, applies the reverted and transformed version on the
     * {@link module:engine/model/document~ModelDocument document} and removes the batch from the stack.
     * Then, it restores the {@link module:engine/model/document~ModelDocument#selection document selection}.
     *
     * @fires execute
     */
    execute(): void;
}
