/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/list/utils/listwalker
 */
import { type ArrayOrItem } from 'ckeditor5/src/utils.js';
import { type ListElement } from './model.js';
import type { ModelElement, ModelNode } from 'ckeditor5/src/engine.js';
/**
 * Document list blocks iterator.
 *
 * @internal
 */
export declare class ListWalker {
    /**
     * The start list item block element.
     */
    private _startElement;
    /**
     * The reference indent. Initialized by the indent of the start block.
     */
    private _referenceIndent;
    /**
     * The iterating direction.
     */
    private _isForward;
    /**
     * Whether start block should be included in the result (if it's matching other criteria).
     */
    private _includeSelf;
    /**
     * Additional attributes that must be the same for each block.
     */
    private _sameAttributes;
    /**
     * Whether blocks with the same indent level as the start block should be included in the result.
     */
    private _sameIndent;
    /**
     * Whether blocks with a lower indent level than the start block should be included in the result.
     */
    private _lowerIndent;
    /**
     * Whether blocks with a higher indent level than the start block should be included in the result.
     */
    private _higherIndent;
    /**
     * Creates a document list iterator.
     *
     * @param startElement The start list item block element.
     * @param options.direction The iterating direction.
     * @param options.includeSelf Whether start block should be included in the result (if it's matching other criteria).
     * @param options.sameAttributes Additional attributes that must be the same for each block.
     * @param options.sameIndent Whether blocks with the same indent level as the start block should be included
     * in the result.
     * @param options.lowerIndent Whether blocks with a lower indent level than the start block should be included
     * in the result.
     * @param options.higherIndent Whether blocks with a higher indent level than the start block should be included
     * in the result.
     */
    constructor(startElement: ModelNode, options: ListWalkerOptions);
    /**
     * Performs only first step of iteration and returns the result.
     *
     * @param startElement The start list item block element.
     * @param options.direction The iterating direction.
     * @param options.includeSelf Whether start block should be included in the result (if it's matching other criteria).
     * @param options.sameAttributes Additional attributes that must be the same for each block.
     * @param options.sameIndent Whether blocks with the same indent level as the start block should be included
     * in the result.
     * @param options.lowerIndent Whether blocks with a lower indent level than the start block should be included
     * in the result.
     * @param options.higherIndent Whether blocks with a higher indent level than the start block should be included
     * in the result.
     */
    static first(startElement: ModelNode, options: ListWalkerOptions): ListElement | null;
    /**
     * Iterable interface.
     */
    [Symbol.iterator](): Iterator<ListElement>;
    /**
     * Returns the model element to start iterating.
     */
    private _getStartNode;
}
/**
 * Iterates sibling list blocks starting from the given node.
 *
 * @internal
 */
export declare class SiblingListBlocksIterator implements IterableIterator<ListIteratorValue> {
    private _node;
    private _isForward;
    private _previousNodesByIndent;
    private _previous;
    private _previousNodeIndent;
    /**
     * @param node The model node.
     * @param direction Iteration direction.
     */
    constructor(node: ModelNode | null, direction?: 'forward' | 'backward');
    [Symbol.iterator](): IterableIterator<ListIteratorValue>;
    next(): IteratorResult<ListIteratorValue>;
}
/**
 * The iterable protocol over the list elements.
 *
 * @internal
 */
export declare class ListBlocksIterable {
    private _listHead;
    /**
     * @param listHead The head element of a list.
     */
    constructor(listHead: ModelElement);
    /**
     * List blocks iterator.
     *
     * Iterates over all blocks of a list.
     */
    [Symbol.iterator](): Iterator<ListIteratorValue>;
}
/**
 * Object returned by `SiblingListBlocksIterator` when traversing a list.
 *
 * @internal
 */
export interface ListIteratorValue {
    /**
     * The current list node.
     */
    node: ListElement;
    /**
     * The previous list node.
     */
    previous: ListElement | null;
    /**
     * The previous list node at the same indent as current node.
     */
    previousNodeInList: ListElement | null;
}
/**
 * Document list blocks iterator options.
 *
 * @internal
 */
export type ListWalkerOptions = {
    direction?: 'forward' | 'backward';
    includeSelf?: boolean;
    sameAttributes?: ArrayOrItem<string>;
    sameIndent?: boolean;
    lowerIndent?: boolean;
    higherIndent?: boolean;
};
