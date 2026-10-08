/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/model/range
 */
import { ModelTypeCheckable } from './typecheckable.js';
import { ModelPosition } from './position.js';
import { ModelTreeWalker, type ModelTreeWalkerOptions, type ModelTreeWalkerValue } from './treewalker.js';
import { type ModelDocument } from './document.js';
import { type ModelDocumentFragment } from './documentfragment.js';
import { type ModelElement } from './element.js';
import { type InsertOperation } from './operation/insertoperation.js';
import { type ModelItem } from './item.js';
import { type MergeOperation } from './operation/mergeoperation.js';
import { type MoveOperation } from './operation/moveoperation.js';
import { type Operation } from './operation/operation.js';
import { type SplitOperation } from './operation/splitoperation.js';
/**
 * Represents a range in the model tree.
 *
 * A range is defined by its {@link module:engine/model/range~ModelRange#start} and {@link module:engine/model/range~ModelRange#end}
 * positions.
 *
 * You can create range instances via its constructor or the `createRange*()` factory methods of
 * {@link module:engine/model/model~Model} and {@link module:engine/model/writer~ModelWriter}.
 */
export declare class ModelRange extends ModelTypeCheckable implements Iterable<ModelTreeWalkerValue> {
    /**
     * Start position.
     */
    readonly start: ModelPosition;
    /**
     * End position.
     */
    readonly end: ModelPosition;
    /**
     * Creates a range spanning from `start` position to `end` position.
     *
     * @param start The start position.
     * @param end The end position. If not set, the range will be collapsed at the `start` position.
     */
    constructor(start: ModelPosition, end?: ModelPosition | null);
    /**
     * Iterable interface.
     *
     * Iterates over all {@link module:engine/model/item~ModelItem items} that are in this range and returns
     * them together with additional information like length or {@link module:engine/model/position~ModelPosition positions},
     * grouped as {@link module:engine/model/treewalker~ModelTreeWalkerValue}.
     * It iterates over all {@link module:engine/model/textproxy~ModelTextProxy text contents} that are inside the range
     * and all the {@link module:engine/model/element~ModelElement}s that are entered into when iterating over this range.
     *
     * This iterator uses {@link module:engine/model/treewalker~ModelTreeWalker} with `boundaries` set to this range
     * and `ignoreElementEnd` option set to `true`.
     */
    [Symbol.iterator](): IterableIterator<ModelTreeWalkerValue>;
    /**
     * Describes whether the range is collapsed, that is if {@link #start} and
     * {@link #end} positions are equal.
     */
    get isCollapsed(): boolean;
    /**
     * Describes whether this range is flat, that is if {@link #start} position and
     * {@link #end} position are in the same {@link module:engine/model/position~ModelPosition#parent}.
     */
    get isFlat(): boolean;
    /**
     * Range root element.
     */
    get root(): ModelElement | ModelDocumentFragment;
    /**
     * Checks whether this range contains given {@link module:engine/model/position~ModelPosition position}.
     *
     * @param position Position to check.
     * @returns `true` if given {@link module:engine/model/position~ModelPosition position} is contained
     * in this range,`false` otherwise.
     */
    containsPosition(position: ModelPosition): boolean;
    /**
     * Checks whether this range contains given {@link ~ModelRange range}.
     *
     * @param otherRange Range to check.
     * @param loose Whether the check is loose or strict. If the check is strict (`false`), compared range cannot
     * start or end at the same position as this range boundaries. If the check is loose (`true`), compared range can start, end or
     * even be equal to this range. Note that collapsed ranges are always compared in strict mode.
     * @returns {Boolean} `true` if given {@link ~ModelRange range} boundaries are contained by this range, `false` otherwise.
     */
    containsRange(otherRange: ModelRange, loose?: boolean): boolean;
    /**
     * Checks whether given {@link module:engine/model/item~ModelItem} is inside this range.
     */
    containsItem(item: ModelItem): boolean;
    /**
     * Two ranges are equal if their {@link #start} and {@link #end} positions are equal.
     *
     * @param otherRange Range to compare with.
     * @returns `true` if ranges are equal, `false` otherwise.
     */
    isEqual(otherRange: ModelRange): boolean;
    /**
     * Checks and returns whether this range intersects with given range.
     *
     * @param otherRange Range to compare with.
     * @returns `true` if ranges intersect, `false` otherwise.
     */
    isIntersecting(otherRange: ModelRange): boolean;
    /**
     * Computes which part(s) of this {@link ~ModelRange range} is not a part of given {@link ~ModelRange range}.
     * Returned array contains zero, one or two {@link ~ModelRange ranges}.
     *
     * Examples:
     *
     * ```ts
     * let range = model.createRange(
     * 	model.createPositionFromPath( root, [ 2, 7 ] ),
     * 	model.createPositionFromPath( root, [ 4, 0, 1 ] )
     * );
     * let otherRange = model.createRange( model.createPositionFromPath( root, [ 1 ] ), model.createPositionFromPath( root, [ 5 ] ) );
     * let transformed = range.getDifference( otherRange );
     * // transformed array has no ranges because `otherRange` contains `range`
     *
     * otherRange = model.createRange( model.createPositionFromPath( root, [ 1 ] ), model.createPositionFromPath( root, [ 3 ] ) );
     * transformed = range.getDifference( otherRange );
     * // transformed array has one range: from [ 3 ] to [ 4, 0, 1 ]
     *
     * otherRange = model.createRange( model.createPositionFromPath( root, [ 3 ] ), model.createPositionFromPath( root, [ 4 ] ) );
     * transformed = range.getDifference( otherRange );
     * // transformed array has two ranges: from [ 2, 7 ] to [ 3 ] and from [ 4 ] to [ 4, 0, 1 ]
     * ```
     *
     * @param otherRange Range to differentiate against.
     * @returns The difference between ranges.
     */
    getDifference(otherRange: ModelRange): Array<ModelRange>;
    /**
     * Returns an intersection of this {@link ~ModelRange range} and given {@link ~ModelRange range}.
     * Intersection is a common part of both of those ranges. If ranges has no common part, returns `null`.
     *
     * Examples:
     *
     * ```ts
     * let range = model.createRange(
     * 	model.createPositionFromPath( root, [ 2, 7 ] ),
     * 	model.createPositionFromPath( root, [ 4, 0, 1 ] )
     * );
     * let otherRange = model.createRange( model.createPositionFromPath( root, [ 1 ] ), model.createPositionFromPath( root, [ 2 ] ) );
     * let transformed = range.getIntersection( otherRange ); // null - ranges have no common part
     *
     * otherRange = model.createRange( model.createPositionFromPath( root, [ 3 ] ), model.createPositionFromPath( root, [ 5 ] ) );
     * transformed = range.getIntersection( otherRange ); // range from [ 3 ] to [ 4, 0, 1 ]
     * ```
     *
     * @param otherRange Range to check for intersection.
     * @returns A common part of given ranges or `null` if ranges have no common part.
     */
    getIntersection(otherRange: ModelRange): ModelRange | null;
    /**
     * Returns a range created by joining this {@link ~ModelRange range} with the given {@link ~ModelRange range}.
     * If ranges have no common part, returns `null`.
     *
     * Examples:
     *
     * ```ts
     * let range = model.createRange(
     * 	model.createPositionFromPath( root, [ 2, 7 ] ),
     * 	model.createPositionFromPath( root, [ 4, 0, 1 ] )
     * );
     * let otherRange = model.createRange(
     * 	model.createPositionFromPath( root, [ 1 ] ),
     * 	model.createPositionFromPath( root, [ 2 ] )
     * );
     * let transformed = range.getJoined( otherRange ); // null - ranges have no common part
     *
     * otherRange = model.createRange(
     * 	model.createPositionFromPath( root, [ 3 ] ),
     * 	model.createPositionFromPath( root, [ 5 ] )
     * );
     * transformed = range.getJoined( otherRange ); // range from [ 2, 7 ] to [ 5 ]
     * ```
     *
     * @param otherRange Range to be joined.
     * @param loose Whether the intersection check is loose or strict. If the check is strict (`false`),
     * ranges are tested for intersection or whether start/end positions are equal. If the check is loose (`true`),
     * compared range is also checked if it's {@link module:engine/model/position~ModelPosition#isTouching touching} current range.
     * @returns A sum of given ranges or `null` if ranges have no common part.
     */
    getJoined(otherRange: ModelRange, loose?: boolean): ModelRange | null;
    /**
     * Computes and returns the smallest set of {@link #isFlat flat} ranges, that covers this range in whole.
     *
     * See an example of a model structure (`[` and `]` are range boundaries):
     *
     * ```
     * root                                                            root
     *  |- element DIV                         DIV             P2              P3             DIV
     *  |   |- element H                   H        P1        f o o           b a r       H         P4
     *  |   |   |- "fir[st"             fir[st     lorem                               se]cond     ipsum
     *  |   |- element P1
     *  |   |   |- "lorem"                                              ||
     *  |- element P2                                                   ||
     *  |   |- "foo"                                                    VV
     *  |- element P3
     *  |   |- "bar"                                                   root
     *  |- element DIV                         DIV             [P2             P3]             DIV
     *  |   |- element H                   H       [P1]       f o o           b a r        H         P4
     *  |   |   |- "se]cond"            fir[st]    lorem                               [se]cond     ipsum
     *  |   |- element P4
     *  |   |   |- "ipsum"
     * ```
     *
     * As it can be seen, letters contained in the range are: `stloremfoobarse`, spread across different parents.
     * We are looking for minimal set of flat ranges that contains the same nodes.
     *
     * Minimal flat ranges for above range `( [ 0, 0, 3 ], [ 3, 0, 2 ] )` will be:
     *
     * ```
     * ( [ 0, 0, 3 ], [ 0, 0, 5 ] ) = "st"
     * ( [ 0, 1 ], [ 0, 2 ] ) = element P1 ("lorem")
     * ( [ 1 ], [ 3 ] ) = element P2, element P3 ("foobar")
     * ( [ 3, 0, 0 ], [ 3, 0, 2 ] ) = "se"
     * ```
     *
     * **Note:** if an {@link module:engine/model/element~ModelElement element} is not wholly contained in this range, it won't be returned
     * in any of the returned flat ranges. See in the example how `H` elements at the beginning and at the end of the range
     * were omitted. Only their parts that were wholly in the range were returned.
     *
     * **Note:** this method is not returning flat ranges that contain no nodes.
     *
     * @returns Array of flat ranges covering this range.
     */
    getMinimalFlatRanges(): Array<ModelRange>;
    /**
     * Creates a {@link module:engine/model/treewalker~ModelTreeWalker TreeWalker} instance with this range as a boundary.
     *
     * For example, to iterate over all items in the entire document root:
     *
     * ```ts
     * // Create a range spanning over the entire root content:
     * const range = editor.model.createRangeIn( editor.model.document.getRoot() );
     *
     * // Iterate over all items in this range:
     * for ( const value of range.getWalker() ) {
     * 	console.log( value.item );
     * }
     * ```
     *
     * @param options Object with configuration options. See {@link module:engine/model/treewalker~ModelTreeWalker}.
     */
    getWalker(options?: ModelTreeWalkerOptions): ModelTreeWalker;
    /**
     * Returns an iterator that iterates over all {@link module:engine/model/item~ModelItem items} that are in this range and returns
     * them.
     *
     * This method uses {@link module:engine/model/treewalker~ModelTreeWalker} with `boundaries` set to this range and
     * `ignoreElementEnd` option set to `true`. However it returns only {@link module:engine/model/item~ModelItem model items},
     * not {@link module:engine/model/treewalker~ModelTreeWalkerValue}.
     *
     * You may specify additional options for the tree walker. See {@link module:engine/model/treewalker~ModelTreeWalker} for
     * a full list of available options.
     *
     * @param options Object with configuration options. See {@link module:engine/model/treewalker~ModelTreeWalker}.
     */
    getItems(options?: ModelTreeWalkerOptions): IterableIterator<ModelItem>;
    /**
     * Returns an iterator that iterates over all {@link module:engine/model/position~ModelPosition positions} that are boundaries or
     * contained in this range.
     *
     * This method uses {@link module:engine/model/treewalker~ModelTreeWalker} with `boundaries` set to this range. However it returns only
     * {@link module:engine/model/position~ModelPosition positions}, not {@link module:engine/model/treewalker~ModelTreeWalkerValue}.
     *
     * You may specify additional options for the tree walker. See {@link module:engine/model/treewalker~ModelTreeWalker} for
     * a full list of available options.
     *
     * @param options Object with configuration options. See {@link module:engine/model/treewalker~ModelTreeWalker}.
     */
    getPositions(options?: ModelTreeWalkerOptions): IterableIterator<ModelPosition>;
    /**
     * Returns a range that is a result of transforming this range by given `operation`.
     *
     * **Note:** transformation may break one range into multiple ranges (for example, when a part of the range is
     * moved to a different part of document tree). For this reason, an array is returned by this method and it
     * may contain one or more `Range` instances.
     *
     * @param operation Operation to transform range by.
     * @returns Range which is the result of transformation.
     */
    getTransformedByOperation(operation: Operation): Array<ModelRange>;
    /**
     * Returns a range that is a result of transforming this range by multiple `operations`.
     *
     * @see ~ModelRange#getTransformedByOperation
     * @param operations Operations to transform the range by.
     * @returns Range which is the result of transformation.
     */
    getTransformedByOperations(operations: Iterable<Operation>): Array<ModelRange>;
    /**
     * Returns an {@link module:engine/model/element~ModelElement} or {@link module:engine/model/documentfragment~ModelDocumentFragment}
     * which is a common ancestor of the range's both ends (in which the entire range is contained).
     */
    getCommonAncestor(): ModelElement | ModelDocumentFragment | null;
    /**
     * Returns an {@link module:engine/model/element~ModelElement Element} contained by the range.
     * The element will be returned when it is the **only** node within the range and **fully–contained**
     * at the same time.
     */
    getContainedElement(): ModelElement | null;
    /**
     * Converts `Range` to plain object and returns it.
     *
     * @returns `Range` converted to plain object.
     */
    toJSON(): unknown;
    /**
     * Returns a new range that is equal to current range.
     */
    clone(): this;
    /**
     * Returns a result of transforming a copy of this range by insert operation.
     *
     * One or more ranges may be returned as a result of this transformation.
     *
     * @internal
     */
    _getTransformedByInsertOperation(operation: InsertOperation, spread?: boolean): Array<ModelRange>;
    /**
     * Returns a result of transforming a copy of this range by move operation.
     *
     * One or more ranges may be returned as a result of this transformation.
     *
     * @internal
     */
    _getTransformedByMoveOperation(operation: MoveOperation, spread?: boolean): Array<ModelRange>;
    /**
     * Returns a result of transforming a copy of this range by split operation.
     *
     * Always one range is returned. The transformation is done in a way to not break the range.
     *
     * @internal
     */
    _getTransformedBySplitOperation(operation: SplitOperation): ModelRange;
    /**
     * Returns a result of transforming a copy of this range by merge operation.
     *
     * Always one range is returned. The transformation is done in a way to not break the range.
     *
     * @internal
     */
    _getTransformedByMergeOperation(operation: MergeOperation): ModelRange;
    /**
     * Returns an array containing one or two {@link ~ModelRange ranges} that are a result of transforming this
     * {@link ~ModelRange range} by inserting `howMany` nodes at `insertPosition`. Two {@link ~ModelRange ranges} are
     * returned if the insertion was inside this {@link ~ModelRange range} and `spread` is set to `true`.
     *
     * Examples:
     *
     * ```ts
     * let range = model.createRange(
     * 	model.createPositionFromPath( root, [ 2, 7 ] ),
     * 	model.createPositionFromPath( root, [ 4, 0, 1 ] )
     * );
     * let transformed = range._getTransformedByInsertion( model.createPositionFromPath( root, [ 1 ] ), 2 );
     * // transformed array has one range from [ 4, 7 ] to [ 6, 0, 1 ]
     *
     * transformed = range._getTransformedByInsertion( model.createPositionFromPath( root, [ 4, 0, 0 ] ), 4 );
     * // transformed array has one range from [ 2, 7 ] to [ 4, 0, 5 ]
     *
     * transformed = range._getTransformedByInsertion( model.createPositionFromPath( root, [ 3, 2 ] ), 4 );
     * // transformed array has one range, which is equal to original range
     *
     * transformed = range._getTransformedByInsertion( model.createPositionFromPath( root, [ 3, 2 ] ), 4, true );
     * // transformed array has two ranges: from [ 2, 7 ] to [ 3, 2 ] and from [ 3, 6 ] to [ 4, 0, 1 ]
     * ```
     *
     * @internal
     * @param insertPosition Position where nodes are inserted.
     * @param howMany How many nodes are inserted.
     * @param spread Flag indicating whether this range should be spread if insertion
     * was inside the range. Defaults to `false`.
     * @returns Result of the transformation.
     */
    _getTransformedByInsertion(insertPosition: ModelPosition, howMany: number, spread?: boolean): Array<ModelRange>;
    /**
     * Returns an array containing {@link ~ModelRange ranges} that are a result of transforming this
     * {@link ~ModelRange range} by moving `howMany` nodes from `sourcePosition` to `targetPosition`.
     *
     * @internal
     * @param sourcePosition Position from which nodes are moved.
     * @param targetPosition Position to where nodes are moved.
     * @param howMany How many nodes are moved.
     * @param spread Whether the range should be spread if the move points inside the range.
     * @returns  Result of the transformation.
     */
    _getTransformedByMove(sourcePosition: ModelPosition, targetPosition: ModelPosition, howMany: number, spread?: boolean): Array<ModelRange>;
    /**
     * Returns a copy of this range that is transformed by deletion of `howMany` nodes from `deletePosition`.
     *
     * If the deleted range is intersecting with the transformed range, the transformed range will be shrank.
     *
     * If the deleted range contains transformed range, `null` will be returned.
     *
     * @internal
     * @param deletePosition Position from which nodes are removed.
     * @param howMany How many nodes are removed.
     * @returns Result of the transformation.
     */
    _getTransformedByDeletion(deletePosition: ModelPosition, howMany: number): ModelRange | null;
    /**
     * Creates a new range, spreading from specified {@link module:engine/model/position~ModelPosition position} to a position moved by
     * given `shift`. If `shift` is a negative value, shifted position is treated as the beginning of the range.
     *
     * @internal
     * @param position Beginning of the range.
     * @param shift How long the range should be.
     */
    static _createFromPositionAndShift(position: ModelPosition, shift: number): ModelRange;
    /**
     * Creates a range inside an {@link module:engine/model/element~ModelElement element} which starts before the first child of
     * that element and ends after the last child of that element.
     *
     * @internal
     * @param element Element which is a parent for the range.
     */
    static _createIn(element: ModelElement | ModelDocumentFragment): ModelRange;
    /**
     * Creates a range that starts before given {@link module:engine/model/item~ModelItem model item} and ends after it.
     *
     * @internal
     */
    static _createOn(item: ModelItem): ModelRange;
    /**
     * Combines all ranges from the passed array into a one range. At least one range has to be passed.
     * Passed ranges must not have common parts.
     *
     * The first range from the array is a reference range. If other ranges start or end on the exactly same position where
     * the reference range, they get combined into one range.
     *
     * ```
     * [  ][]  [    ][ ][             ][ ][]  [  ]  // Passed ranges, shown sorted
     * [    ]                                       // The result of the function if the first range was a reference range.
     *         [                           ]        // The result of the function if the third-to-seventh range was a reference range.
     *                                        [  ]  // The result of the function if the last range was a reference range.
     * ```
     *
     * @internal
     * @param ranges Ranges to combine.
     * @returns Combined range.
     */
    static _createFromRanges(ranges: Array<ModelRange>): ModelRange;
    /**
     * Creates a `Range` instance from given plain object (i.e. parsed JSON string).
     *
     * @param json Plain object to be converted to `Range`.
     * @param doc Document object that will be range owner.
     * @returns `Range` instance created using given plain object.
     */
    static fromJSON(json: any, doc: ModelDocument): ModelRange;
}
