/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module typing/utils/changebuffer
 */
import type { Model, Batch } from '@ckeditor/ckeditor5-engine';
/**
 * Change buffer allows to group atomic changes (like characters that have been typed) into
 * {@link module:engine/model/batch~Batch batches}.
 *
 * Batches represent single undo steps, hence changes added to one single batch are undone together.
 *
 * The buffer has a configurable limit of atomic changes that it can accommodate. After the limit was
 * exceeded (see {@link ~TypingChangeBuffer#input}), a new batch is created in {@link ~TypingChangeBuffer#batch}.
 *
 * To use the change buffer you need to let it know about the number of changes that were added to the batch:
 *
 * ```ts
 * const buffer = new ChangeBuffer( model, LIMIT );
 *
 * // Later on in your feature:
 * buffer.batch.insert( pos, insertedCharacters );
 * buffer.input( insertedCharacters.length );
 * ```
 */
export declare class TypingChangeBuffer {
    /**
     * The model instance.
     */
    readonly model: Model;
    /**
     * The maximum number of atomic changes which can be contained in one batch.
     */
    readonly limit: number;
    /**
     * Whether the buffer is locked. A locked buffer cannot be reset unless it gets unlocked.
     */
    private _isLocked;
    /**
     * The number of atomic changes in the buffer. Once it exceeds the {@link #limit},
     * the {@link #batch batch} is set to a new one.
     */
    private _size;
    /**
     * The current batch instance.
     */
    private _batch;
    /**
     * The callback to document the change event which later needs to be removed.
     */
    private readonly _changeCallback;
    /**
     * The callback to document selection `change:attribute` and `change:range` events which resets the buffer.
     */
    private readonly _selectionChangeCallback;
    /**
     * Creates a new instance of the change buffer.
     *
     * @param limit The maximum number of atomic changes which can be contained in one batch.
     */
    constructor(model: Model, limit?: number);
    /**
     * The current batch to which a feature should add its operations. Once the {@link #size}
     * is reached or exceeds the {@link #limit}, the batch is set to a new instance and the size is reset.
     */
    get batch(): Batch;
    /**
     * The number of atomic changes in the buffer. Once it exceeds the {@link #limit},
     * the {@link #batch batch} is set to a new one.
     */
    get size(): number;
    /**
     * The input number of changes into the buffer. Once the {@link #size} is
     * reached or exceeds the {@link #limit}, the batch is set to a new instance and the size is reset.
     *
     * @param changeCount The number of atomic changes to input.
     */
    input(changeCount: number): void;
    /**
     * Whether the buffer is locked. A locked buffer cannot be reset unless it gets unlocked.
     */
    get isLocked(): boolean;
    /**
     * Locks the buffer.
     */
    lock(): void;
    /**
     * Unlocks the buffer.
     */
    unlock(): void;
    /**
     * Destroys the buffer.
     */
    destroy(): void;
    /**
     * Resets the change buffer.
     *
     * @param ignoreLock Whether internal lock {@link #isLocked} should be ignored.
     */
    private _reset;
}
