/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { ModelPosition } from './position.js';
import { type ModelItem } from './item.js';
import { type ModelRange } from './range.js';
/**
 * Position iterator class. It allows to iterate forward and backward over the document.
 */
export declare class ModelTreeWalker implements Iterable<ModelTreeWalkerValue> {
    /**
     * Walking direction. Defaults `'forward'`.
     */
    readonly direction: ModelTreeWalkerDirection;
    /**
     * Iterator boundaries.
     *
     * When the iterator is walking `'forward'` on the end of boundary or is walking `'backward'`
     * on the start of boundary, then `{ done: true }` is returned.
     *
     * If boundaries are not defined they are set before first and after last child of the root node.
     */
    readonly boundaries: ModelRange | null;
    /**
     * Flag indicating whether all consecutive characters with the same attributes should be
     * returned as one {@link module:engine/model/textproxy~ModelTextProxy} (`true`) or one by one (`false`).
     */
    readonly singleCharacters: boolean;
    /**
     * Flag indicating whether iterator should enter elements or not. If the iterator is shallow child nodes of any
     * iterated node will not be returned along with `elementEnd` tag.
     */
    readonly shallow: boolean;
    /**
     * Flag indicating whether iterator should ignore `elementEnd` tags. If the option is true walker will not
     * return a parent node of the start position. If this option is `true` each {@link module:engine/model/element~ModelElement} will
     * be returned once, while if the option is `false` they might be returned twice:
     * for `'elementStart'` and `'elementEnd'`.
     */
    readonly ignoreElementEnd: boolean;
    /**
     * Iterator position. This is always static position, even if the initial position was a
     * {@link module:engine/model/liveposition~ModelLivePosition live position}. If start position is not defined then position depends
     * on {@link #direction}. If direction is `'forward'` position starts form the beginning, when direction
     * is `'backward'` position starts from the end.
     */
    private _position;
    /**
     * Start boundary cached for optimization purposes.
     */
    private _boundaryStartParent;
    /**
     * End boundary cached for optimization purposes.
     */
    private _boundaryEndParent;
    /**
     * Parent of the most recently visited node. Cached for optimization purposes.
     */
    private _visitedParent;
    /**
     * Creates a range iterator. All parameters are optional, but you have to specify either `boundaries` or `startPosition`.
     *
     * @param options Object with configuration.
     */
    constructor(options: ModelTreeWalkerOptions);
    /**
     * Iterable interface.
     *
     * @returns {Iterable.<module:engine/model/treewalker~ModelTreeWalkerValue>}
     */
    [Symbol.iterator](): IterableIterator<ModelTreeWalkerValue>;
    /**
     * Iterator position. This is always static position, even if the initial position was a
     * {@link module:engine/model/liveposition~ModelLivePosition live position}. If start position is not defined then position depends
     * on {@link #direction}. If direction is `'forward'` position starts form the beginning, when direction
     * is `'backward'` position starts from the end.
     */
    get position(): ModelPosition;
    /**
     * Moves {@link #position} in the {@link #direction} skipping values as long as the callback function returns `true`.
     *
     * For example:
     *
     * ```ts
     * walker.skip( value => value.type == 'text' ); // <paragraph>[]foo</paragraph> -> <paragraph>foo[]</paragraph>
     * walker.skip( () => true ); // Move the position to the end: <paragraph>[]foo</paragraph> -> <paragraph>foo</paragraph>[]
     * walker.skip( () => false ); // Do not move the position.
     * ```
     *
     * @param skip Callback function. Gets {@link module:engine/model/treewalker~ModelTreeWalkerValue} and should
     * return `true` if the value should be skipped or `false` if not.
     */
    skip(skip: (value: ModelTreeWalkerValue) => boolean): void;
    /**
     * Moves tree walker {@link #position} to provided `position`. Tree walker will
     * continue traversing from that position.
     *
     * Note: in contrary to {@link ~ModelTreeWalker#skip}, this method does not iterate over the nodes along the way.
     * It simply sets the current tree walker position to a new one.
     * From the performance standpoint, it is better to use {@link ~ModelTreeWalker#jumpTo} rather than {@link ~ModelTreeWalker#skip}.
     *
     * If the provided position is before the start boundary, the position will be
     * set to the start boundary. If the provided position is after the end boundary,
     * the position will be set to the end boundary.
     * This is done to prevent the treewalker from traversing outside the boundaries.
     *
     * @param position Position to jump to.
     */
    jumpTo(position: ModelPosition): void;
    /**
     * Gets the next tree walker's value.
     */
    next(): IteratorResult<ModelTreeWalkerValue>;
    /**
     * Makes a step forward in model. Moves the {@link #position} to the next position and returns the encountered value.
     */
    private _next;
    /**
     * Makes a step backward in model. Moves the {@link #position} to the previous position and returns the encountered value.
     */
    private _previous;
}
/**
 * Type of the step made by {@link module:engine/model/treewalker~ModelTreeWalker}.
 * Possible values: `'elementStart'` if walker is at the beginning of a node, `'elementEnd'` if walker is at the end of node,
 * or `'text'` if walker traversed over text.
 */
export type ModelTreeWalkerValueType = 'elementStart' | 'elementEnd' | 'text';
/**
 * Object returned by {@link module:engine/model/treewalker~ModelTreeWalker} when traversing tree model.
 */
export interface ModelTreeWalkerValue {
    type: ModelTreeWalkerValueType;
    /**
     * Item between old and new positions of {@link module:engine/model/treewalker~ModelTreeWalker}.
     */
    item: ModelItem;
    /**
     * Previous position of the iterator.
     * * Forward iteration: For `'elementEnd'` it is the last position inside the element. For all other types it is the
     * position before the item.
     * * Backward iteration: For `'elementStart'` it is the first position inside the element. For all other types it is
     * the position after item.
     */
    previousPosition: ModelPosition;
    /**
     * Next position of the iterator.
     * * Forward iteration: For `'elementStart'` it is the first position inside the element. For all other types it is
     * the position after the item.
     * * Backward iteration: For `'elementEnd'` it is last position inside element. For all other types it is the position
     * before the item.
     */
    nextPosition: ModelPosition;
    /**
     * Length of the item. For `'elementStart'` it is 1. For `'text'` it is the length of the text. For `'elementEnd'` it is `undefined`.
     */
    length?: number;
}
/**
 * Tree walking direction.
 */
export type ModelTreeWalkerDirection = 'forward' | 'backward';
/**
 * The configuration of TreeWalker.
 *
 * All parameters are optional, but you have to specify either `boundaries` or `startPosition`.
 */
export interface ModelTreeWalkerOptions {
    /**
     * Walking direction.
     *
     * @default 'forward'
     */
    direction?: ModelTreeWalkerDirection;
    /**
     * Range to define boundaries of the iterator.
     */
    boundaries?: ModelRange | null;
    /**
     * Starting position.
     */
    startPosition?: ModelPosition;
    /**
     * Flag indicating whether all consecutive characters with the same attributes
     * should be returned one by one as multiple {@link module:engine/model/textproxy~ModelTextProxy} (`true`) objects or as one
     * {@link module:engine/model/textproxy~ModelTextProxy} (`false`).
     */
    singleCharacters?: boolean;
    /**
     * Flag indicating whether iterator should enter elements or not. If the
     * iterator is shallow child nodes of any iterated node will not be returned along with `elementEnd` tag.
     */
    shallow?: boolean;
    /**
     * Flag indicating whether iterator should ignore `elementEnd` tags.
     * If the option is true walker will not return a parent node of start position. If this option is `true`
     * each {@link module:engine/model/element~ModelElement} will be returned once, while if the option is `false` they might be returned
     * twice: for `'elementStart'` and `'elementEnd'`.
     */
    ignoreElementEnd?: boolean;
}
