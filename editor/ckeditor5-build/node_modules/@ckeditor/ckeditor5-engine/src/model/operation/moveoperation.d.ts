/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/model/operation/moveoperation
 */
import { Operation } from './operation.js';
import { ModelPosition } from '../position.js';
import type { ModelSelectable } from '../selection.js';
import { type ModelDocument } from '../document.js';
/**
 * Operation to move a range of {@link module:engine/model/item~ModelItem model items}
 * to given {@link module:engine/model/position~ModelPosition target position}.
 */
export declare class MoveOperation extends Operation {
    /**
     * Position before the first {@link module:engine/model/item~ModelItem model item} to move.
     */
    sourcePosition: ModelPosition;
    /**
     * Offset size of moved range.
     */
    howMany: number;
    /**
     * Position at which moved nodes will be inserted.
     */
    targetPosition: ModelPosition;
    /**
     * Creates a move operation.
     *
     * @param sourcePosition Position before the first {@link module:engine/model/item~ModelItem model item} to move.
     * @param howMany Offset size of moved range. Moved range will start from `sourcePosition` and end at
     * `sourcePosition` with offset shifted by `howMany`.
     * @param targetPosition Position at which moved nodes will be inserted.
     * @param baseVersion Document {@link module:engine/model/document~ModelDocument#version} on which operation
     * can be applied or `null` if the operation operates on detached (non-document) tree.
     */
    constructor(sourcePosition: ModelPosition, howMany: number, targetPosition: ModelPosition, baseVersion: number | null);
    /**
     * @inheritDoc
     */
    get type(): 'move' | 'remove' | 'reinsert';
    /**
     * @inheritDoc
     */
    get affectedSelectable(): ModelSelectable;
    /**
     * Creates and returns an operation that has the same parameters as this operation.
     */
    clone(): MoveOperation;
    /**
     * Returns the start position of the moved range after it got moved. This may be different than
     * {@link module:engine/model/operation/moveoperation~MoveOperation#targetPosition} in some cases, i.e. when a range is moved
     * inside the same parent but {@link module:engine/model/operation/moveoperation~MoveOperation#targetPosition targetPosition}
     * is after {@link module:engine/model/operation/moveoperation~MoveOperation#sourcePosition sourcePosition}.
     *
     * ```
     *  vv              vv
     * abcdefg ===> adefbcg
     *      ^          ^
     *      targetPos  movedRangeStart
     *      offset 6   offset 4
     *```
     */
    getMovedRangeStart(): ModelPosition;
    /**
     * See {@link module:engine/model/operation/operation~Operation#getReversed `Operation#getReversed()`}.
     */
    getReversed(): Operation;
    /**
     * @inheritDoc
     * @internal
     */
    _validate(): void;
    /**
     * @inheritDoc
     * @internal
     */
    _execute(): void;
    /**
     * @inheritDoc
     */
    toJSON(): unknown;
    /**
     * @inheritDoc
     */
    static get className(): string;
    /**
     * Creates `MoveOperation` object from deserialized object, i.e. from parsed JSON string.
     *
     * @param json Deserialized JSON object.
     * @param document Document on which this operation will be applied.
     */
    static fromJSON(json: any, document: ModelDocument): MoveOperation;
}
