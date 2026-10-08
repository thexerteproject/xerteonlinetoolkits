/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/model/operation/moveoperation
 */
import { Operation } from './operation.js';
import { ModelPosition } from '../position.js';
import { ModelRange } from '../range.js';
import { _move } from './utils.js';
import { CKEditorError, compareArrays } from '@ckeditor/ckeditor5-utils';
// @if CK_DEBUG_ENGINE // const ModelRange = require( '../range' ).default;
/**
 * Operation to move a range of {@link module:engine/model/item~ModelItem model items}
 * to given {@link module:engine/model/position~ModelPosition target position}.
 */
export class MoveOperation extends Operation {
    /**
     * Position before the first {@link module:engine/model/item~ModelItem model item} to move.
     */
    sourcePosition;
    /**
     * Offset size of moved range.
     */
    howMany;
    /**
     * Position at which moved nodes will be inserted.
     */
    targetPosition;
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
    constructor(sourcePosition, howMany, targetPosition, baseVersion) {
        super(baseVersion);
        this.sourcePosition = sourcePosition.clone();
        // `'toNext'` because `sourcePosition` is a bit like a start of the moved range.
        this.sourcePosition.stickiness = 'toNext';
        this.howMany = howMany;
        this.targetPosition = targetPosition.clone();
        this.targetPosition.stickiness = 'toNone';
    }
    /**
     * @inheritDoc
     */
    get type() {
        if (this.targetPosition.root.rootName == this.sourcePosition.root.rootName) {
            return 'move';
        }
        else if (this.targetPosition.root.rootName == '$graveyard') {
            return 'remove';
        }
        else if (this.sourcePosition.root.rootName == '$graveyard') {
            return 'reinsert';
        }
        return 'move';
    }
    /**
     * @inheritDoc
     */
    get affectedSelectable() {
        return [
            ModelRange._createFromPositionAndShift(this.sourcePosition, this.howMany),
            ModelRange._createFromPositionAndShift(this.targetPosition, 0)
        ];
    }
    /**
     * Creates and returns an operation that has the same parameters as this operation.
     */
    clone() {
        return new MoveOperation(this.sourcePosition, this.howMany, this.targetPosition, this.baseVersion);
    }
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
    getMovedRangeStart() {
        return this.targetPosition._getTransformedByDeletion(this.sourcePosition, this.howMany);
    }
    /**
     * See {@link module:engine/model/operation/operation~Operation#getReversed `Operation#getReversed()`}.
     */
    getReversed() {
        const newTargetPosition = this.sourcePosition._getTransformedByInsertion(this.targetPosition, this.howMany);
        return new MoveOperation(this.getMovedRangeStart(), this.howMany, newTargetPosition, this.baseVersion + 1);
    }
    /**
     * @inheritDoc
     * @internal
     */
    _validate() {
        const sourceElement = this.sourcePosition.parent;
        const targetElement = this.targetPosition.parent;
        const sourceOffset = this.sourcePosition.offset;
        const targetOffset = this.targetPosition.offset;
        // Validate whether move operation has correct parameters.
        // Validation is pretty complex but move operation is one of the core ways to manipulate the document state.
        // We expect that many errors might be connected with one of scenarios described below.
        if (sourceOffset + this.howMany > sourceElement.maxOffset) {
            /**
             * The nodes which should be moved do not exist.
             *
             * @error move-operation-nodes-do-not-exist
             */
            throw new CKEditorError('move-operation-nodes-do-not-exist', this);
        }
        else if (sourceElement === targetElement && sourceOffset < targetOffset && targetOffset < sourceOffset + this.howMany) {
            /**
             * Trying to move a range of nodes into the middle of that range.
             *
             * @error move-operation-range-into-itself
             */
            throw new CKEditorError('move-operation-range-into-itself', this);
        }
        else if (this.sourcePosition.root == this.targetPosition.root) {
            if (compareArrays(this.sourcePosition.getParentPath(), this.targetPosition.getParentPath()) == 'prefix') {
                const i = this.sourcePosition.path.length - 1;
                if (this.targetPosition.path[i] >= sourceOffset && this.targetPosition.path[i] < sourceOffset + this.howMany) {
                    /**
                     * Trying to move a range of nodes into one of nodes from that range.
                     *
                     * @error move-operation-node-into-itself
                     */
                    throw new CKEditorError('move-operation-node-into-itself', this);
                }
            }
        }
    }
    /**
     * @inheritDoc
     * @internal
     */
    _execute() {
        _move(ModelRange._createFromPositionAndShift(this.sourcePosition, this.howMany), this.targetPosition);
    }
    /**
     * @inheritDoc
     */
    toJSON() {
        const json = super.toJSON();
        json.sourcePosition = this.sourcePosition.toJSON();
        json.targetPosition = this.targetPosition.toJSON();
        return json;
    }
    /**
     * @inheritDoc
     */
    static get className() {
        return 'MoveOperation';
    }
    /**
     * Creates `MoveOperation` object from deserialized object, i.e. from parsed JSON string.
     *
     * @param json Deserialized JSON object.
     * @param document Document on which this operation will be applied.
     */
    static fromJSON(json, document) {
        const sourcePosition = ModelPosition.fromJSON(json.sourcePosition, document);
        const targetPosition = ModelPosition.fromJSON(json.targetPosition, document);
        return new this(sourcePosition, json.howMany, targetPosition, json.baseVersion);
    }
}
