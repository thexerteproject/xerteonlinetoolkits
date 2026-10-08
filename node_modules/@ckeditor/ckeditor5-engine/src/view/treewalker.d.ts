/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { ViewPosition } from './position.js';
import { type ViewItem } from './item.js';
import { type ViewRange } from './range.js';
/**
 * Position iterator class. It allows to iterate forward and backward over the document.
 */
export declare class ViewTreeWalker implements IterableIterator<ViewTreeWalkerValue> {
    /**
     * Walking direction. Defaults `'forward'`.
     */
    readonly direction: ViewTreeWalkerDirection;
    /**
     * Iterator boundaries.
     *
     * When the iterator is walking `'forward'` on the end of boundary or is walking `'backward'`
     * on the start of boundary, then `{ done: true }` is returned.
     *
     * If boundaries are not defined they are set before first and after last child of the root node.
     */
    readonly boundaries: ViewRange | null;
    /**
     * Flag indicating whether all characters from {@link module:engine/view/text~ViewText} should be returned as one
     * {@link module:engine/view/text~ViewText} or one by one as {@link module:engine/view/textproxy~ViewTextProxy}.
     */
    readonly singleCharacters: boolean;
    /**
     * Flag indicating whether iterator should enter elements or not. If the iterator is shallow child nodes of any
     * iterated node will not be returned along with `elementEnd` tag.
     */
    readonly shallow: boolean;
    /**
     * Flag indicating whether iterator should ignore `elementEnd` tags. If set to `true`, walker will not
     * return a parent node of the start position. Each {@link module:engine/view/element~ViewElement} will be returned once.
     * When set to `false` each element might be returned twice: for `'elementStart'` and `'elementEnd'`.
     */
    readonly ignoreElementEnd: boolean;
    /**
     * Iterator position. If start position is not defined then position depends on {@link #direction}. If direction is
     * `'forward'` position starts form the beginning, when direction is `'backward'` position starts from the end.
     */
    private _position;
    /**
     * Start boundary parent.
     */
    private readonly _boundaryStartParent;
    /**
     * End boundary parent.
     */
    private readonly _boundaryEndParent;
    /**
     * Creates a range iterator. All parameters are optional, but you have to specify either `boundaries` or `startPosition`.
     *
     * @param options Object with configuration.
     */
    constructor(options?: ViewTreeWalkerOptions);
    /**
     * Iterable interface.
     */
    [Symbol.iterator](): IterableIterator<ViewTreeWalkerValue>;
    /**
     * Iterator position. If start position is not defined then position depends on {@link #direction}. If direction is
     * `'forward'` position starts form the beginning, when direction is `'backward'` position starts from the end.
     */
    get position(): ViewPosition;
    /**
     * Moves {@link #position} in the {@link #direction} skipping values as long as the callback function returns `true`.
     *
     * For example:
     *
     * ```ts
     * walker.skip( value => value.type == 'text' ); // <p>{}foo</p> -> <p>foo[]</p>
     * walker.skip( value => true ); // Move the position to the end: <p>{}foo</p> -> <p>foo</p>[]
     * walker.skip( value => false ); // Do not move the position.
     * ```
     *
     * @param skip Callback function. Gets {@link module:engine/view/treewalker~ViewTreeWalkerValue} and should
     * return `true` if the value should be skipped or `false` if not.
     */
    skip(skip: (value: ViewTreeWalkerValue) => boolean): void;
    /**
     * Moves tree walker {@link #position} to provided `position`. Tree walker will
     * continue traversing from that position.
     *
     * Note: in contrary to {@link ~ViewTreeWalker#skip}, this method does not iterate over the nodes along the way.
     * It simply sets the current tree walker position to a new one.
     * From the performance standpoint, it is better to use {@link ~ViewTreeWalker#jumpTo} rather than {@link ~ViewTreeWalker#skip}.
     *
     * If the provided position is before the start boundary, the position will be
     * set to the start boundary. If the provided position is after the end boundary,
     * the position will be set to the end boundary.
     * This is done to prevent the treewalker from traversing outside the boundaries.
     *
     * @param position Position to jump to.
     */
    jumpTo(position: ViewPosition): void;
    /**
     * Gets the next tree walker's value.
     *
     * @returns Object implementing iterator interface, returning
     * information about taken step.
     */
    next(): IteratorResult<ViewTreeWalkerValue, undefined>;
    /**
     * Makes a step forward in view. Moves the {@link #position} to the next position and returns the encountered value.
     */
    private _next;
    /**
     * Makes a step backward in view. Moves the {@link #position} to the previous position and returns the encountered value.
     */
    private _previous;
    /**
     * Format returned data and adjust `previousPosition` and `nextPosition` if
     * reach the bound of the {@link module:engine/view/text~ViewText}.
     *
     * @param type Type of step.
     * @param item Item between old and new position.
     * @param previousPosition Previous position of iterator.
     * @param nextPosition Next position of iterator.
     * @param length Length of the item.
     */
    private _formatReturnValue;
}
/**
 * Type of the step made by {@link module:engine/view/treewalker~ViewTreeWalker}.
 * Possible values: `'elementStart'` if walker is at the beginning of a node, `'elementEnd'` if walker is at the end
 * of node, or `'text'` if walker traversed over single and multiple characters.
 * For {@link module:engine/view/text~ViewText} `elementStart` and `elementEnd` is not returned.
 */
export type ViewTreeWalkerValueType = 'elementStart' | 'elementEnd' | 'text';
/**
 * Object returned by {@link module:engine/view/treewalker~ViewTreeWalker} when traversing tree view.
 */
export interface ViewTreeWalkerValue {
    /**
     * Type of the step made by {@link module:engine/view/treewalker~ViewTreeWalker}.
     */
    type: ViewTreeWalkerValueType;
    /**
     * Item between the old and the new positions of the tree walker.
     */
    item: ViewItem;
    /**
     * Previous position of the iterator.
     * * Forward iteration: For `'elementEnd'` it is the last position inside the element. For all other types it is the
     * position before the item.
     * * Backward iteration: For `'elementStart'` it is the first position inside the element. For all other types it is
     * the position after item.
     * * If the position is at the beginning or at the end of the {@link module:engine/view/text~ViewText} it is always moved from the
     * inside of the text to its parent just before or just after that text.
     */
    previousPosition: ViewPosition;
    /**
     * Next position of the iterator.
     * * Forward iteration: For `'elementStart'` it is the first position inside the element. For all other types it is
     * the position after the item.
     * * Backward iteration: For `'elementEnd'` it is last position inside element. For all other types it is the position
     * before the item.
     * * If the position is at the beginning or at the end of the {@link module:engine/view/text~ViewText} it is always moved from the
     * inside of the text to its parent just before or just after that text.
     */
    nextPosition: ViewPosition;
    /**
     * Length of the item. For `'elementStart'` it is `1`. For `'text'` it is
     * the length of that text. For `'elementEnd'` it is `undefined`.
     */
    length?: number;
}
/**
 * Tree walking direction.
 */
export type ViewTreeWalkerDirection = 'forward' | 'backward';
/**
 * The configuration of {@link ~ViewTreeWalker}.
 */
export interface ViewTreeWalkerOptions {
    /**
     * Walking direction.
     *
     * @default 'forward'
     */
    direction?: ViewTreeWalkerDirection;
    /**
     * Range to define boundaries of the iterator.
     */
    boundaries?: ViewRange | null;
    /**
     * Starting position.
     */
    startPosition?: ViewPosition;
    /**
     * Flag indicating whether all characters from
     * {@link module:engine/view/text~ViewText} should be returned as one
     * {@link module:engine/view/text~ViewText} (`false`) or one by one as
     * {@link module:engine/view/textproxy~ViewTextProxy} (`true`).
     */
    singleCharacters?: boolean;
    /**
     * Flag indicating whether iterator should enter elements or not. If the
     * iterator is shallow child nodes of any iterated node will not be returned along with `elementEnd` tag.
     */
    shallow?: boolean;
    /**
     * Flag indicating whether iterator should ignore `elementEnd`
     * tags. If the option is true walker will not return a parent node of start position. If this option is `true`
     * each {@link module:engine/view/element~ViewElement} will be returned once, while if the option is `false` they might be returned
     * twice: for `'elementStart'` and `'elementEnd'`.
     */
    ignoreElementEnd?: boolean;
}
