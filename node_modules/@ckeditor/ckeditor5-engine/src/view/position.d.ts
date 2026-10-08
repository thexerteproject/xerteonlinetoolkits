/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/position
 */
import { ViewTypeCheckable } from './typecheckable.js';
import { ViewEditableElement } from './editableelement.js';
import { type ViewDocumentFragment } from './documentfragment.js';
import { type ViewItem } from './item.js';
import { type ViewNode } from './node.js';
import { ViewTreeWalker, type ViewTreeWalkerValue, type ViewTreeWalkerOptions } from './treewalker.js';
/**
 * Position in the view tree. Position is represented by its parent node and an offset in this parent.
 *
 * In order to create a new position instance use the `createPosition*()` factory methods available in:
 *
 * * {@link module:engine/view/view~EditingView}
 * * {@link module:engine/view/downcastwriter~ViewDowncastWriter}
 * * {@link module:engine/view/upcastwriter~ViewUpcastWriter}
 */
export declare class ViewPosition extends ViewTypeCheckable {
    /**
     * Position parent.
     */
    readonly parent: ViewNode | ViewDocumentFragment;
    /**
     * Position offset.
     */
    offset: number;
    /**
     * Creates a position.
     *
     * @param parent Position parent.
     * @param offset Position offset.
     */
    constructor(parent: ViewNode | ViewDocumentFragment, offset: number);
    /**
     * Node directly after the position. Equals `null` when there is no node after position or position is located
     * inside text node.
     */
    get nodeAfter(): ViewNode | null;
    /**
     * Node directly before the position. Equals `null` when there is no node before position or position is located
     * inside text node.
     */
    get nodeBefore(): ViewNode | null;
    /**
     * Is `true` if position is at the beginning of its {@link module:engine/view/position~ViewPosition#parent parent}, `false` otherwise.
     */
    get isAtStart(): boolean;
    /**
     * Is `true` if position is at the end of its {@link module:engine/view/position~ViewPosition#parent parent}, `false` otherwise.
     */
    get isAtEnd(): boolean;
    /**
     * Position's root, that is the root of the position's parent element.
     */
    get root(): ViewNode | ViewDocumentFragment;
    /**
     * {@link module:engine/view/editableelement~ViewEditableElement ViewEditableElement} instance that contains this position, or `null` if
     * position is not inside an editable element.
     */
    get editableElement(): ViewEditableElement | null;
    /**
     * Returns a new instance of Position with offset incremented by `shift` value.
     *
     * @param shift How position offset should get changed. Accepts negative values.
     * @returns Shifted position.
     */
    getShiftedBy(shift: number): ViewPosition;
    /**
     * Gets the farthest position which matches the callback using
     * {@link module:engine/view/treewalker~ViewTreeWalker TreeWalker}.
     *
     * For example:
     *
     * ```ts
     * getLastMatchingPosition( value => value.type == 'text' ); // <p>{}foo</p> -> <p>foo[]</p>
     * getLastMatchingPosition( value => value.type == 'text', { direction: 'backward' } ); // <p>foo[]</p> -> <p>{}foo</p>
     * getLastMatchingPosition( value => false ); // Do not move the position.
     * ```
     *
     * @param skip Callback function. Gets {@link module:engine/view/treewalker~ViewTreeWalkerValue} and should
     * return `true` if the value should be skipped or `false` if not.
     * @param options Object with configuration options. See {@link module:engine/view/treewalker~ViewTreeWalker}.
     * @returns The position after the last item which matches the `skip` callback test.
     */
    getLastMatchingPosition(skip: (value: ViewTreeWalkerValue) => boolean, options?: ViewTreeWalkerOptions): ViewPosition;
    /**
     * Returns ancestors array of this position, that is this position's parent and it's ancestors.
     *
     * @returns Array with ancestors.
     */
    getAncestors(): Array<ViewNode | ViewDocumentFragment>;
    /**
     * Returns a {@link module:engine/view/node~ViewNode} or {@link module:engine/view/documentfragment~ViewDocumentFragment}
     * which is a common ancestor of both positions.
     */
    getCommonAncestor(position: ViewPosition): ViewNode | ViewDocumentFragment | null;
    /**
     * Checks whether this position equals given position.
     *
     * @param otherPosition Position to compare with.
     * @returns True if positions are same.
     */
    isEqual(otherPosition: ViewPosition): boolean;
    /**
     * Checks whether this position is located before given position. When method returns `false` it does not mean that
     * this position is after give one. Two positions may be located inside separate roots and in that situation this
     * method will still return `false`.
     *
     * @see module:engine/view/position~ViewPosition#isAfter
     * @see module:engine/view/position~ViewPosition#compareWith
     * @param otherPosition Position to compare with.
     * @returns Returns `true` if this position is before given position.
     */
    isBefore(otherPosition: ViewPosition): boolean;
    /**
     * Checks whether this position is located after given position. When method returns `false` it does not mean that
     * this position is before give one. Two positions may be located inside separate roots and in that situation this
     * method will still return `false`.
     *
     * @see module:engine/view/position~ViewPosition#isBefore
     * @see module:engine/view/position~ViewPosition#compareWith
     * @param otherPosition Position to compare with.
     * @returns Returns `true` if this position is after given position.
     */
    isAfter(otherPosition: ViewPosition): boolean;
    /**
     * Checks whether this position is before, after or in same position that other position. Two positions may be also
     * different when they are located in separate roots.
     *
     * @param otherPosition Position to compare with.
     */
    compareWith(otherPosition: ViewPosition): ViewPositionRelation;
    /**
     * Creates a {@link module:engine/view/treewalker~ViewTreeWalker TreeWalker} instance with this positions as a start position.
     *
     * @param options Object with configuration options. See {@link module:engine/view/treewalker~ViewTreeWalker}
     */
    getWalker(options?: ViewTreeWalkerOptions): ViewTreeWalker;
    /**
     * Clones this position.
     */
    clone(): ViewPosition;
    /**
     * Converts `ViewPosition` instance to plain object and returns it.
     *
     * @returns `ViewPosition` instance converted to plain object.
     */
    toJSON(): unknown;
    /**
     * Creates position at the given location. The location can be specified as:
     *
     * * a {@link module:engine/view/position~ViewPosition position},
     * * parent element and offset (offset defaults to `0`),
     * * parent element and `'end'` (sets position at the end of that element),
     * * {@link module:engine/view/item~ViewItem view item} and `'before'` or `'after'` (sets position before or after given view item).
     *
     * This method is a shortcut to other constructors such as:
     *
     * * {@link module:engine/view/position~ViewPosition._createBefore},
     * * {@link module:engine/view/position~ViewPosition._createAfter}.
     *
     * @internal
     * @param offset Offset or one of the flags. Used only when first parameter is a {@link module:engine/view/item~ViewItem view item}.
     */
    static _createAt(itemOrPosition: ViewItem | ViewPosition, offset?: ViewPositionOffset): ViewPosition;
    /**
     * Creates a new position after given view item.
     *
     * @internal
     * @param item View item after which the position should be located.
     */
    static _createAfter(item: ViewItem): ViewPosition;
    /**
     * Creates a new position before given view item.
     *
     * @internal
     * @param item View item before which the position should be located.
     */
    static _createBefore(item: ViewItem): ViewPosition;
}
/**
 * A flag indicating whether this position is `'before'` or `'after'` or `'same'` as given position.
 * If positions are in different roots `'different'` flag is returned.
 */
export type ViewPositionRelation = 'before' | 'after' | 'same' | 'different';
/**
 * Offset or one of the flags.
 */
export type ViewPositionOffset = number | 'before' | 'after' | 'end';
