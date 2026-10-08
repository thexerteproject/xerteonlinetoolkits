/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/model/operation/detachoperation
 */
import { Operation } from './operation.js';
import { type ModelPosition } from '../position.js';
import type { ModelSelectable } from '../selection.js';
/**
 * Operation to permanently remove node from detached root.
 * Note this operation is only a local operation and won't be send to the other clients.
 *
 * @internal
 */
export declare class DetachOperation extends Operation {
    /**
     * Position before the first {@link module:engine/model/item~ModelItem model item} to detach.
     */
    sourcePosition: ModelPosition;
    /**
     * Offset size of moved range.
     */
    howMany: number;
    clone: never;
    getReversed: never;
    /**
     * Creates an insert operation.
     *
     * @param sourcePosition Position before the first {@link module:engine/model/item~ModelItem model item} to move.
     * @param howMany Offset size of moved range. Moved range will start from `sourcePosition` and end at
     * `sourcePosition` with offset shifted by `howMany`.
     */
    constructor(sourcePosition: ModelPosition, howMany: number);
    /**
     * @inheritDoc
     */
    get type(): 'detach';
    /**
     * @inheritDoc
     */
    get affectedSelectable(): ModelSelectable;
    /**
     * @inheritDoc
     */
    toJSON(): unknown;
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
    static get className(): string;
}
