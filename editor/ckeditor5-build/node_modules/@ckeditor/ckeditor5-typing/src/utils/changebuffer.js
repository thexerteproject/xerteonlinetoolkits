/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
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
export class TypingChangeBuffer {
    /**
     * The model instance.
     */
    model;
    /**
     * The maximum number of atomic changes which can be contained in one batch.
     */
    limit;
    /**
     * Whether the buffer is locked. A locked buffer cannot be reset unless it gets unlocked.
     */
    _isLocked;
    /**
     * The number of atomic changes in the buffer. Once it exceeds the {@link #limit},
     * the {@link #batch batch} is set to a new one.
     */
    _size;
    /**
     * The current batch instance.
     */
    _batch = null;
    /**
     * The callback to document the change event which later needs to be removed.
     */
    _changeCallback;
    /**
     * The callback to document selection `change:attribute` and `change:range` events which resets the buffer.
     */
    _selectionChangeCallback;
    /**
     * Creates a new instance of the change buffer.
     *
     * @param limit The maximum number of atomic changes which can be contained in one batch.
     */
    constructor(model, limit = 20) {
        this.model = model;
        this._size = 0;
        this.limit = limit;
        this._isLocked = false;
        // The function to be called in order to notify the buffer about batches which appeared in the document.
        // The callback will check whether it is a new batch and in that case the buffer will be flushed.
        //
        // The reason why the buffer needs to be flushed whenever a new batch appears is that the changes added afterwards
        // should be added to a new batch. For instance, when the user types, then inserts an image, and then types again,
        // the characters typed after inserting the image should be added to a different batch than the characters typed before.
        this._changeCallback = (evt, batch) => {
            if (batch.isLocal && batch.isUndoable && batch !== this._batch) {
                this._reset(true);
            }
        };
        this._selectionChangeCallback = () => {
            this._reset();
        };
        this.model.document.on('change', this._changeCallback);
        this.model.document.selection.on('change:range', this._selectionChangeCallback);
        this.model.document.selection.on('change:attribute', this._selectionChangeCallback);
    }
    /**
     * The current batch to which a feature should add its operations. Once the {@link #size}
     * is reached or exceeds the {@link #limit}, the batch is set to a new instance and the size is reset.
     */
    get batch() {
        if (!this._batch) {
            this._batch = this.model.createBatch({ isTyping: true });
        }
        return this._batch;
    }
    /**
     * The number of atomic changes in the buffer. Once it exceeds the {@link #limit},
     * the {@link #batch batch} is set to a new one.
     */
    get size() {
        return this._size;
    }
    /**
     * The input number of changes into the buffer. Once the {@link #size} is
     * reached or exceeds the {@link #limit}, the batch is set to a new instance and the size is reset.
     *
     * @param changeCount The number of atomic changes to input.
     */
    input(changeCount) {
        this._size += changeCount;
        if (this._size >= this.limit) {
            this._reset(true);
        }
    }
    /**
     * Whether the buffer is locked. A locked buffer cannot be reset unless it gets unlocked.
     */
    get isLocked() {
        return this._isLocked;
    }
    /**
     * Locks the buffer.
     */
    lock() {
        this._isLocked = true;
    }
    /**
     * Unlocks the buffer.
     */
    unlock() {
        this._isLocked = false;
    }
    /**
     * Destroys the buffer.
     */
    destroy() {
        this.model.document.off('change', this._changeCallback);
        this.model.document.selection.off('change:range', this._selectionChangeCallback);
        this.model.document.selection.off('change:attribute', this._selectionChangeCallback);
    }
    /**
     * Resets the change buffer.
     *
     * @param ignoreLock Whether internal lock {@link #isLocked} should be ignored.
     */
    _reset(ignoreLock = false) {
        if (!this.isLocked || ignoreLock) {
            this._batch = null;
            this._size = 0;
        }
    }
}
