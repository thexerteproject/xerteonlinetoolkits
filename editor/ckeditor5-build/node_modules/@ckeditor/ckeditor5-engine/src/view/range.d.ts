/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/range
 */
import { ViewTypeCheckable } from './typecheckable.js';
import { ViewPosition } from './position.js';
import { type ViewDocumentFragment } from './documentfragment.js';
import { type ViewElement } from './element.js';
import { type ViewItem } from './item.js';
import { type ViewNode } from './node.js';
import { ViewTreeWalker, type ViewTreeWalkerValue, type ViewTreeWalkerOptions } from './treewalker.js';
/**
 * Range in the view tree. A range is represented by its start and end {@link module:engine/view/position~ViewPosition positions}.
 *
 * In order to create a new position instance use the `createPosition*()` factory methods available in:
 *
 * * {@link module:engine/view/view~EditingView}
 * * {@link module:engine/view/downcastwriter~ViewDowncastWriter}
 * * {@link module:engine/view/upcastwriter~ViewUpcastWriter}
 */
export declare class ViewRange extends ViewTypeCheckable implements Iterable<ViewTreeWalkerValue> {
    /**
     * Start position.
     */
    readonly start: ViewPosition;
    /**
     * End position.
     */
    readonly end: ViewPosition;
    /**
     * Creates a range spanning from `start` position to `end` position.
     *
     * **Note:** Constructor creates it's own {@link module:engine/view/position~ViewPosition} instances basing on passed values.
     *
     * @param start Start position.
     * @param end End position. If not set, range will be collapsed at the `start` position.
     */
    constructor(start: ViewPosition, end?: ViewPosition | null);
    /**
     * Iterable interface.
     *
     * Iterates over all {@link module:engine/view/item~ViewItem view items} that are in this range and returns
     * them together with additional information like length or {@link module:engine/view/position~ViewPosition positions},
     * grouped as {@link module:engine/view/treewalker~ViewTreeWalkerValue}.
     *
     * This iterator uses {@link module:engine/view/treewalker~ViewTreeWalker TreeWalker} with `boundaries` set to this range and
     * `ignoreElementEnd` option
     * set to `true`.
     */
    [Symbol.iterator](): IterableIterator<ViewTreeWalkerValue>;
    /**
     * Returns whether the range is collapsed, that is it start and end positions are equal.
     */
    get isCollapsed(): boolean;
    /**
     * Returns whether this range is flat, that is if {@link module:engine/view/range~ViewRange#start start} position and
     * {@link module:engine/view/range~ViewRange#end end} position are in the same
     * {@link module:engine/view/position~ViewPosition#parent parent}.
     */
    get isFlat(): boolean;
    /**
     * Range root element.
     */
    get root(): ViewNode | ViewDocumentFragment;
    /**
     * Creates a maximal range that has the same content as this range but is expanded in both ways (at the beginning
     * and at the end).
     *
     * For example:
     *
     * ```html
     * <p>Foo</p><p><b>{Bar}</b></p> -> <p>Foo</p>[<p><b>Bar</b>]</p>
     * <p><b>foo</b>{bar}<span></span></p> -> <p><b>foo[</b>bar<span></span>]</p>
     * ```
     *
     * Note that in the sample above:
     *
     * - `<p>` have type of {@link module:engine/view/containerelement~ViewContainerElement},
     * - `<b>` have type of {@link module:engine/view/attributeelement~ViewAttributeElement},
     * - `<span>` have type of {@link module:engine/view/uielement~ViewUIElement}.
     *
     * @returns Enlarged range.
     */
    getEnlarged(): ViewRange;
    /**
     * Creates a minimum range that has the same content as this range but is trimmed in both ways (at the beginning
     * and at the end).
     *
     * For example:
     *
     * ```html
     * <p>Foo</p>[<p><b>Bar</b>]</p> -> <p>Foo</p><p><b>{Bar}</b></p>
     * <p><b>foo[</b>bar<span></span>]</p> -> <p><b>foo</b>{bar}<span></span></p>
     * ```
     *
     * Note that in the sample above:
     *
     * - `<p>` have type of {@link module:engine/view/containerelement~ViewContainerElement},
     * - `<b>` have type of {@link module:engine/view/attributeelement~ViewAttributeElement},
     * - `<span>` have type of {@link module:engine/view/uielement~ViewUIElement}.
     *
     * @returns Shrunk range.
     */
    getTrimmed(): ViewRange;
    /**
     * Two ranges are equal if their start and end positions are equal.
     *
     * @param otherRange Range to compare with.
     * @returns `true` if ranges are equal, `false` otherwise
     */
    isEqual(otherRange: ViewRange): boolean;
    /**
     * Checks whether this range contains given {@link module:engine/view/position~ViewPosition position}.
     *
     * @param position Position to check.
     * @returns `true` if given {@link module:engine/view/position~ViewPosition position} is contained in this range, `false` otherwise.
     */
    containsPosition(position: ViewPosition): boolean;
    /**
     * Checks whether this range contains given {@link module:engine/view/range~ViewRange range}.
     *
     * @param otherRange Range to check.
     * @param loose Whether the check is loose or strict. If the check is strict (`false`), compared range cannot
     * start or end at the same position as this range boundaries. If the check is loose (`true`), compared range can start, end or
     * even be equal to this range. Note that collapsed ranges are always compared in strict mode.
     * @returns `true` if given {@link module:engine/view/range~ViewRange range} boundaries are contained by this range, `false`
     * otherwise.
     */
    containsRange(otherRange: ViewRange, loose?: boolean): boolean;
    /**
     * Computes which part(s) of this {@link module:engine/view/range~ViewRange range} is not a part of given
     * {@link module:engine/view/range~ViewRange range}.
     * Returned array contains zero, one or two {@link module:engine/view/range~ViewRange ranges}.
     *
     * Examples:
     *
     * ```ts
     * let foo = downcastWriter.createText( 'foo' );
     * let img = downcastWriter.createContainerElement( 'img' );
     * let bar = downcastWriter.createText( 'bar' );
     * let p = downcastWriter.createContainerElement( 'p', null, [ foo, img, bar ] );
     *
     * let range = view.createRange( view.createPositionAt( foo, 2 ), view.createPositionAt( bar, 1 ); // "o", img, "b" are in range.
     * let otherRange = view.createRange( // "oo", img, "ba" are in range.
     * 	view.createPositionAt( foo, 1 ),
     * 	view.createPositionAt( bar, 2 )
     * );
     * let transformed = range.getDifference( otherRange );
     * // transformed array has no ranges because `otherRange` contains `range`
     *
     * otherRange = view.createRange( view.createPositionAt( foo, 1 ), view.createPositionAt( p, 2 ); // "oo", img are in range.
     * transformed = range.getDifference( otherRange );
     * // transformed array has one range: from ( p, 2 ) to ( bar, 1 )
     *
     * otherRange = view.createRange( view.createPositionAt( p, 1 ), view.createPositionAt( p, 2 ) ); // img is in range.
     * transformed = range.getDifference( otherRange );
     * // transformed array has two ranges: from ( foo, 1 ) to ( p, 1 ) and from ( p, 2 ) to ( bar, 1 )
     * ```
     *
     * @param otherRange Range to differentiate against.
     * @returns The difference between ranges.
     */
    getDifference(otherRange: ViewRange): Array<ViewRange>;
    /**
     * Returns an intersection of this {@link module:engine/view/range~ViewRange range}
     * and given {@link module:engine/view/range~ViewRange range}.
     * Intersection is a common part of both of those ranges. If ranges has no common part, returns `null`.
     *
     * Examples:
     *
     * ```ts
     * let foo = downcastWriter.createText( 'foo' );
     * let img = downcastWriter.createContainerElement( 'img' );
     * let bar = downcastWriter.createText( 'bar' );
     * let p = downcastWriter.createContainerElement( 'p', null, [ foo, img, bar ] );
     *
     * let range = view.createRange( view.createPositionAt( foo, 2 ), view.createPositionAt( bar, 1 ); // "o", img, "b" are in range.
     * let otherRange = view.createRange( view.createPositionAt( foo, 1 ), view.createPositionAt( p, 2 ); // "oo", img are in range.
     * let transformed = range.getIntersection( otherRange ); // range from ( foo, 1 ) to ( p, 2 ).
     *
     * otherRange = view.createRange( view.createPositionAt( bar, 1 ), view.createPositionAt( bar, 3 ); "ar" is in range.
     * transformed = range.getIntersection( otherRange ); // null - no common part.
     * ```
     *
     * @param otherRange Range to check for intersection.
     * @returns A common part of given ranges or `null` if ranges have no common part.
     */
    getIntersection(otherRange: ViewRange): ViewRange | null;
    /**
     * Creates a {@link module:engine/view/treewalker~ViewTreeWalker TreeWalker} instance with this range as a boundary.
     *
     * @param options Object with configuration options. See {@link module:engine/view/treewalker~ViewTreeWalker}.
     */
    getWalker(options?: ViewTreeWalkerOptions): ViewTreeWalker;
    /**
     * Returns a {@link module:engine/view/node~ViewNode} or {@link module:engine/view/documentfragment~ViewDocumentFragment}
     * which is a common ancestor of range's both ends (in which the entire range is contained).
     */
    getCommonAncestor(): ViewNode | ViewDocumentFragment | null;
    /**
     * Returns an {@link module:engine/view/element~ViewElement Element} contained by the range.
     * The element will be returned when it is the **only** node within the range and **fully–contained**
     * at the same time.
     */
    getContainedElement(): ViewElement | null;
    /**
     * Clones this range.
     */
    clone(): ViewRange;
    /**
     * Returns an iterator that iterates over all {@link module:engine/view/item~ViewItem view items} that are in this range and returns
     * them.
     *
     * This method uses {@link module:engine/view/treewalker~ViewTreeWalker} with `boundaries` set to this range
     * and `ignoreElementEnd` option set to `true`. However it returns only {@link module:engine/view/item~ViewItem items},
     * not {@link module:engine/view/treewalker~ViewTreeWalkerValue}.
     *
     * You may specify additional options for the tree walker. See {@link module:engine/view/treewalker~ViewTreeWalker} for
     * a full list of available options.
     *
     * @param options Object with configuration options. See {@link module:engine/view/treewalker~ViewTreeWalker}.
     */
    getItems(options?: ViewTreeWalkerOptions): IterableIterator<ViewItem>;
    /**
     * Returns an iterator that iterates over all {@link module:engine/view/position~ViewPosition positions} that are boundaries or
     * contained in this range.
     *
     * This method uses {@link module:engine/view/treewalker~ViewTreeWalker} with `boundaries` set to this range. However it returns only
     * {@link module:engine/view/position~ViewPosition positions}, not {@link module:engine/view/treewalker~ViewTreeWalkerValue}.
     *
     * You may specify additional options for the tree walker. See {@link module:engine/view/treewalker~ViewTreeWalker} for
     * a full list of available options.
     *
     * @param options Object with configuration options. See {@link module:engine/view/treewalker~ViewTreeWalker}.
     */
    getPositions(options?: ViewTreeWalkerOptions): IterableIterator<ViewPosition>;
    /**
     * Checks and returns whether this range intersects with the given range.
     *
     * @param otherRange Range to compare with.
     * @returns True if ranges intersect.
     */
    isIntersecting(otherRange: ViewRange): boolean;
    /**
     * Converts `ViewRange` instance to plain object and returns it.
     *
     * @returns `ViewRange` instance converted to plain object.
     */
    toJSON(): unknown;
    /**
     * Creates a range from the given parents and offsets.
     *
     * @internal
     * @param startElement Start position parent element.
     * @param startOffset Start position offset.
     * @param endElement End position parent element.
     * @param endOffset End position offset.
     * @returns Created range.
     */
    static _createFromParentsAndOffsets(startElement: ViewElement | ViewDocumentFragment, startOffset: number, endElement: ViewElement | ViewDocumentFragment, endOffset: number): ViewRange;
    /**
     * Creates a new range, spreading from specified {@link module:engine/view/position~ViewPosition position} to a position moved by
     * given `shift`. If `shift` is a negative value, shifted position is treated as the beginning of the range.
     *
     * @internal
     * @param position Beginning of the range.
     * @param shift How long the range should be.
     */
    static _createFromPositionAndShift(position: ViewPosition, shift: number): ViewRange;
    /**
     * Creates a range inside an {@link module:engine/view/element~ViewElement element} which starts before the first child of
     * that element and ends after the last child of that element.
     *
     * @internal
     * @param element Element which is a parent for the range.
     */
    static _createIn(element: ViewElement | ViewDocumentFragment): ViewRange;
    /**
     * Creates a range that starts before given {@link module:engine/view/item~ViewItem view item} and ends after it.
     *
     * @internal
     */
    static _createOn(item: ViewItem): ViewRange;
}
