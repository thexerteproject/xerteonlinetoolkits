/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/model/operation/nooperation
 */
import { Operation } from './operation.js';
import type { ModelSelectable } from '../selection.js';
/**
 * Operation which is doing nothing ("empty operation", "do-nothing operation", "noop"). This is an operation,
 * which when executed does not change the tree model. It still has some parameters defined for transformation purposes.
 *
 * In most cases this operation is a result of transforming operations. When transformation returns
 * {@link module:engine/model/operation/nooperation~NoOperation} it means that changes done by the transformed operation
 * have already been applied.
 */
export declare class NoOperation extends Operation {
    get type(): 'noop';
    /**
     * @inheritDoc
     */
    get affectedSelectable(): ModelSelectable;
    /**
     * Creates and returns an operation that has the same parameters as this operation.
     */
    clone(): NoOperation;
    /**
     * See {@link module:engine/model/operation/operation~Operation#getReversed `Operation#getReversed()`}.
     */
    getReversed(): Operation;
    /** @internal */
    _execute(): void;
    /**
     * @inheritDoc
     */
    static get className(): string;
}
