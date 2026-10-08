/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { type Operation } from './operation.js';
import { type ModelDocument } from '../document.js';
/**
 * Transforms operation `a` by operation `b`.
 *
 * @param a Operation to be transformed.
 * @param b Operation to transform by.
 * @param context Transformation context for this transformation.
 * @returns Transformation result.
 * @internal
 */
export declare function transform(a: Operation, b: Operation, context?: TransformationContext): Array<Operation>;
/**
 * Performs a transformation of two sets of operations - `operationsA` and `operationsB`. The transformation is two-way -
 * both transformed `operationsA` and transformed `operationsB` are returned.
 *
 * Note, that the first operation in each set should base on the same document state (
 * {@link module:engine/model/document~ModelDocument#version document version}).
 *
 * It is assumed that `operationsA` are "more important" during conflict resolution between two operations.
 *
 * New copies of both passed arrays and operations inside them are returned. Passed arguments are not altered.
 *
 * Base versions of the transformed operations sets are updated accordingly. For example, assume that base versions are `4`
 * and there are `3` operations in `operationsA` and `5` operations in `operationsB`. Then:
 *
 * * transformed `operationsA` will start from base version `9` (`4` base version + `5` operations B),
 * * transformed `operationsB` will start from base version `7` (`4` base version + `3` operations A).
 *
 * If no operation was broken into two during transformation, then both sets will end up with an operation that bases on version `11`:
 *
 * * transformed `operationsA` start from `9` and there are `3` of them, so the last will have `baseVersion` equal to `11`,
 * * transformed `operationsB` start from `7` and there are `5` of them, so the last will have `baseVersion` equal to `11`.
 *
 * @param operationsA
 * @param operationsB
 * @param options Additional transformation options.
 * @param options.document Document which the operations change.
 * @param options.useRelations Whether during transformation relations should be used (used during undo for better conflict resolution).
 * @param options.padWithNoOps Whether additional {@link module:engine/model/operation/nooperation~NoOperation}s
 * should be added to the transformation results to force the same last base version for both transformed sets (in case
 * if some operations got broken into multiple operations during transformation).
 * @param options.forceWeakRemove If set to `false`, remove operation will be always stronger than move operation,
 * so the removed nodes won't end up back in the document root. When set to `true`, context data will be used.
 * @returns Transformation result.
 */
export declare function transformOperationSets(operationsA: Array<Operation>, operationsB: Array<Operation>, options: {
    document: ModelDocument;
    useRelations?: boolean;
    padWithNoOps?: boolean;
    forceWeakRemove?: boolean;
}): TransformOperationSetsResult;
/**
 * The result of {@link module:engine/model/operation/transform~transformOperationSets}.
 */
export interface TransformOperationSetsResult {
    /**
     * Transformed `operationsA`.
     */
    operationsA: Array<Operation>;
    /**
     * Transformed `operationsB`.
     */
    operationsB: Array<Operation>;
    /**
     * A map that links transformed operations to original operations. The keys are the transformed
     * operations and the values are the original operations from the input (`operationsA` and `operationsB`).
     */
    originalOperations: Map<Operation, Operation>;
}
/**
 * Holds additional contextual information about a transformed pair of operations (`a` and `b`). Those information
 * can be used for better conflict resolving.
 *
 * @internal
 */
export type TransformationContext = {
    /**
     * Whether `a` is strong operation in this transformation, or weak.
     */
    aIsStrong?: boolean;
    /**
     * Whether `a` operation was undone.
     */
    aWasUndone?: boolean;
    /**
     * Whether `b` operation was undone.
     */
    bWasUndone?: boolean;
    /**
     * The relation between `a` operation and an operation undone by `b` operation.
     */
    abRelation?: any;
    /**
     * The relation between `b` operation and an operation undone by `a` operation.
     */
    baRelation?: any;
    forceWeakRemove?: boolean;
};
