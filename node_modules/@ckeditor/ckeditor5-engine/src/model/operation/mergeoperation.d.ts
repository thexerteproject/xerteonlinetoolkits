/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/model/operation/mergeoperation
 */
import { Operation } from './operation.js';
import { ModelPosition } from '../position.js';
import { ModelRange } from '../range.js';
import { type ModelDocument } from '../document.js';
import type { ModelSelectable } from '../selection.js';
/**
 * Operation to merge two {@link module:engine/model/element~ModelElement elements}.
 *
 * The merged element is the parent of {@link ~MergeOperation#sourcePosition} and it is merged into the parent of
 * {@link ~MergeOperation#targetPosition}. All nodes from the merged element are moved to {@link ~MergeOperation#targetPosition}.
 *
 * The merged element is moved to the graveyard at {@link ~MergeOperation#graveyardPosition}.
 */
export declare class MergeOperation extends Operation {
    /**
     * Position inside the merged element. All nodes from that element after that position will be moved to {@link #targetPosition}.
     */
    sourcePosition: ModelPosition;
    /**
     * Summary offset size of nodes which will be moved from the merged element to the new parent.
     */
    howMany: number;
    /**
     * Position which the nodes from the merged elements will be moved to.
     */
    targetPosition: ModelPosition;
    /**
     * Position in graveyard to which the merged element will be moved.
     */
    graveyardPosition: ModelPosition;
    /**
     * Creates a merge operation.
     *
     * @param sourcePosition Position inside the merged element. All nodes from that
     * element after that position will be moved to {@link #targetPosition}.
     * @param howMany Summary offset size of nodes which will be moved from the merged element to the new parent.
     * @param targetPosition Position which the nodes from the merged elements will be moved to.
     * @param graveyardPosition Position in graveyard to which the merged element will be moved.
     * @param baseVersion Document {@link module:engine/model/document~ModelDocument#version} on which operation
     * can be applied or `null` if the operation operates on detached (non-document) tree.
     */
    constructor(sourcePosition: ModelPosition, howMany: number, targetPosition: ModelPosition, graveyardPosition: ModelPosition, baseVersion: number | null);
    /**
     * @inheritDoc
     */
    get type(): 'merge';
    /**
     * Position before the merged element (which will be deleted).
     */
    get deletionPosition(): ModelPosition;
    /**
     * Artificial range that contains all the nodes from the merged element that will be moved to {@link ~MergeOperation#sourcePosition}.
     * The range starts at {@link ~MergeOperation#sourcePosition} and ends in the same parent, at `POSITIVE_INFINITY` offset.
     */
    get movedRange(): ModelRange;
    /**
     * @inheritDoc
     */
    get affectedSelectable(): ModelSelectable;
    /**
     * Creates and returns an operation that has the same parameters as this operation.
     */
    clone(): MergeOperation;
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
     * Creates `MergeOperation` object from deserialized object, i.e. from parsed JSON string.
     *
     * @param json Deserialized JSON object.
     * @param document Document on which this operation will be applied.
     */
    static fromJSON(json: any, document: ModelDocument): MergeOperation;
}
