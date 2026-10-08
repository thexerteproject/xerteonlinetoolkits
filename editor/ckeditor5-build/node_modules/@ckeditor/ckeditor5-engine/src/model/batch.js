/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/model/batch
 */
import { logWarning } from '@ckeditor/ckeditor5-utils';
/**
 * A batch instance groups model changes ({@link module:engine/model/operation/operation~Operation operations}). All operations
 * grouped in a single batch can be reverted together, so you can also think about a batch as of a single undo step. If you want
 * to extend a given undo step, you can add more changes to the batch using {@link module:engine/model/model~Model#enqueueChange}:
 *
 * ```ts
 * model.enqueueChange( batch, writer => {
 * 	writer.insertText( 'foo', paragraph, 'end' );
 * } );
 * ```
 *
 * @see module:engine/model/model~Model#enqueueChange
 * @see module:engine/model/model~Model#change
 */
export class Batch {
    /**
     * An array of operations that compose this batch.
     */
    operations;
    /**
     * Whether the batch can be undone through the undo feature.
     */
    isUndoable;
    /**
     * Whether the batch includes operations created locally (`true`) or operations created on other, remote editors (`false`).
     */
    isLocal;
    /**
     * Whether the batch was created by the undo feature and undoes other operations.
     */
    isUndo;
    /**
     * Whether the batch includes operations connected with typing.
     */
    isTyping;
    /**
     * Creates a batch instance.
     *
     * @see module:engine/model/model~Model#enqueueChange
     * @see module:engine/model/model~Model#change
     * @param type A set of flags that specify the type of the batch. Batch type can alter how some of the features work
     * when encountering a given `Batch` instance (for example, when a feature listens to applied operations).
     */
    constructor(type = {}) {
        if (typeof type === 'string') {
            type = type === 'transparent' ? { isUndoable: false } : {};
            /**
             * The string value for a `type` property of the `Batch` constructor has been deprecated and will be removed in the near future.
             * Please refer to the {@link module:engine/model/batch~Batch#constructor `Batch` constructor API documentation} for more
             * information.
             *
             * @error batch-constructor-deprecated-string-type
             */
            logWarning('batch-constructor-deprecated-string-type');
        }
        const { isUndoable = true, isLocal = true, isUndo = false, isTyping = false } = type;
        this.operations = [];
        this.isUndoable = isUndoable;
        this.isLocal = isLocal;
        this.isUndo = isUndo;
        this.isTyping = isTyping;
    }
    /**
     * Returns the base version of this batch, which is equal to the base version of the first operation in the batch.
     * If there are no operations in the batch or neither operation has the base version set, it returns `null`.
     */
    get baseVersion() {
        for (const op of this.operations) {
            if (op.baseVersion !== null) {
                return op.baseVersion;
            }
        }
        return null;
    }
    /**
     * Adds an operation to the batch instance.
     *
     * @param operation An operation to add.
     * @returns The added operation.
     */
    addOperation(operation) {
        if (operation.isDocumentOperation) {
            // Store only document operations in the batch.
            // Non-document operations are temporary and should be discarded after they are applied.
            operation.batch = this;
            this.operations.push(operation);
        }
        return operation;
    }
}
