/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/list/utils/listwalker
 */
import { first, toArray } from 'ckeditor5/src/utils.js';
import { isListItemBlock } from './model.js';
/**
 * Document list blocks iterator.
 *
 * @internal
 */
export class ListWalker {
    /**
     * The start list item block element.
     */
    _startElement;
    /**
     * The reference indent. Initialized by the indent of the start block.
     */
    _referenceIndent;
    /**
     * The iterating direction.
     */
    _isForward;
    /**
     * Whether start block should be included in the result (if it's matching other criteria).
     */
    _includeSelf;
    /**
     * Additional attributes that must be the same for each block.
     */
    _sameAttributes;
    /**
     * Whether blocks with the same indent level as the start block should be included in the result.
     */
    _sameIndent;
    /**
     * Whether blocks with a lower indent level than the start block should be included in the result.
     */
    _lowerIndent;
    /**
     * Whether blocks with a higher indent level than the start block should be included in the result.
     */
    _higherIndent;
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
    constructor(startElement, options) {
        this._startElement = startElement;
        this._referenceIndent = startElement.getAttribute('listIndent');
        this._isForward = options.direction == 'forward';
        this._includeSelf = !!options.includeSelf;
        this._sameAttributes = toArray(options.sameAttributes || []);
        this._sameIndent = !!options.sameIndent;
        this._lowerIndent = !!options.lowerIndent;
        this._higherIndent = !!options.higherIndent;
    }
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
    static first(startElement, options) {
        const walker = new this(startElement, options);
        const iterator = walker[Symbol.iterator]();
        return first(iterator);
    }
    /**
     * Iterable interface.
     */
    *[Symbol.iterator]() {
        const nestedItems = [];
        for (const { node } of new SiblingListBlocksIterator(this._getStartNode(), this._isForward ? 'forward' : 'backward')) {
            const indent = node.getAttribute('listIndent');
            // Leaving a nested list.
            if (indent < this._referenceIndent) {
                // Abort searching blocks.
                if (!this._lowerIndent) {
                    break;
                }
                // While searching for lower indents, update the reference indent to find another parent in the next step.
                this._referenceIndent = indent;
            }
            // Entering a nested list.
            else if (indent > this._referenceIndent) {
                // Ignore nested blocks.
                if (!this._higherIndent) {
                    continue;
                }
                // Collect nested blocks to verify if they are really nested, or it's a different item.
                if (!this._isForward) {
                    nestedItems.push(node);
                    continue;
                }
            }
            // Same indent level block.
            else {
                // Ignore same indent block.
                if (!this._sameIndent) {
                    // While looking for nested blocks, stop iterating while encountering first same indent block.
                    if (this._higherIndent) {
                        // No more nested blocks so yield nested items.
                        if (nestedItems.length) {
                            yield* nestedItems;
                            nestedItems.length = 0;
                        }
                        break;
                    }
                    continue;
                }
                // Abort if item has any additionally specified attribute different.
                if (this._sameAttributes.some(attr => node.getAttribute(attr) !== this._startElement.getAttribute(attr))) {
                    break;
                }
            }
            // There is another block for the same list item so the nested items were in the same list item.
            if (nestedItems.length) {
                yield* nestedItems;
                nestedItems.length = 0;
            }
            yield node;
        }
    }
    /**
     * Returns the model element to start iterating.
     */
    _getStartNode() {
        if (this._includeSelf) {
            return this._startElement;
        }
        return this._isForward ?
            this._startElement.nextSibling :
            this._startElement.previousSibling;
    }
}
/**
 * Iterates sibling list blocks starting from the given node.
 *
 * @internal
 */
export class SiblingListBlocksIterator {
    _node;
    _isForward;
    _previousNodesByIndent = [];
    _previous = null;
    _previousNodeIndent = null;
    /**
     * @param node The model node.
     * @param direction Iteration direction.
     */
    constructor(node, direction = 'forward') {
        this._node = node;
        this._isForward = direction === 'forward';
    }
    [Symbol.iterator]() {
        return this;
    }
    next() {
        if (!isListItemBlock(this._node)) {
            return { done: true, value: undefined };
        }
        const nodeIndent = this._node.getAttribute('listIndent');
        let previousNodeInList = null;
        if (this._previous) {
            const previousNodeIndent = this._previousNodeIndent;
            // Let's find previous node for the same indent.
            // We're going to need that when we get back to previous indent.
            if (nodeIndent > previousNodeIndent) {
                this._previousNodesByIndent[previousNodeIndent] = this._previous;
            }
            // Restore the one for given indent.
            else if (nodeIndent < previousNodeIndent) {
                previousNodeInList = this._previousNodesByIndent[nodeIndent] || null;
                this._previousNodesByIndent.length = nodeIndent;
            }
            // Same indent.
            else {
                previousNodeInList = this._previous;
            }
        }
        const value = {
            node: this._node,
            previous: this._previous,
            previousNodeInList
        };
        this._previous = this._node;
        this._previousNodeIndent = nodeIndent;
        this._node = this._isForward ? this._node.nextSibling : this._node.previousSibling;
        return { value, done: false };
    }
}
/**
 * The iterable protocol over the list elements.
 *
 * @internal
 */
export class ListBlocksIterable {
    _listHead;
    /**
     * @param listHead The head element of a list.
     */
    constructor(listHead) {
        this._listHead = listHead;
    }
    /**
     * List blocks iterator.
     *
     * Iterates over all blocks of a list.
     */
    [Symbol.iterator]() {
        return new SiblingListBlocksIterator(this._listHead);
    }
}
