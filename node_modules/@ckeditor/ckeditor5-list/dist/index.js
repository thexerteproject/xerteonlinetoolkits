/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command, Plugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { Delete } from '@ckeditor/ckeditor5-typing/dist/index.js';
import { Enter } from '@ckeditor/ckeditor5-enter/dist/index.js';
import { toArray, first, uid, env, CKEditorError, FocusTracker, KeystrokeHandler, global, getCode, parseKeystroke, getLocalizedArrowKeyCodeDirection, createElement } from '@ckeditor/ckeditor5-utils/dist/index.js';
import { _normalizeFontSizeOptions } from '@ckeditor/ckeditor5-font/dist/index.js';
import { ClipboardPipeline } from '@ckeditor/ckeditor5-clipboard/dist/index.js';
import { ButtonView, MenuBarMenuListItemButtonView, View, ViewCollection, FocusCycler, addKeyboardHandlingForGrid, CollapsibleView, LabeledFieldView, createLabeledInputNumber, SwitchButtonView, createDropdown, SplitButtonView, MenuBarMenuView, focusChildOnDropdownOpen } from '@ckeditor/ckeditor5-ui/dist/index.js';
import { IconNumberedList, IconBulletedList, IconListStyleDisc, IconListStyleCircle, IconListStyleSquare, IconListStyleDecimal, IconListStyleDecimalLeadingZero, IconListStyleLowerRoman, IconListStyleUpperRoman, IconListStyleLowerLatin, IconListStyleUpperLatin, IconListStyleArabicIndic, IconTodoList } from '@ckeditor/ckeditor5-icons/dist/index.js';
import { pick } from 'es-toolkit/compat';
import { DomEventObserver, Matcher, ModelTreeWalker, getViewFillerOffset } from '@ckeditor/ckeditor5-engine/dist/index.js';

/**
 * Document list blocks iterator.
 *
 * @internal
 */ class ListWalker {
    /**
	 * The start list item block element.
	 */ _startElement;
    /**
	 * The reference indent. Initialized by the indent of the start block.
	 */ _referenceIndent;
    /**
	 * The iterating direction.
	 */ _isForward;
    /**
	 * Whether start block should be included in the result (if it's matching other criteria).
	 */ _includeSelf;
    /**
	 * Additional attributes that must be the same for each block.
	 */ _sameAttributes;
    /**
	 * Whether blocks with the same indent level as the start block should be included in the result.
	 */ _sameIndent;
    /**
	 * Whether blocks with a lower indent level than the start block should be included in the result.
	 */ _lowerIndent;
    /**
	 * Whether blocks with a higher indent level than the start block should be included in the result.
	 */ _higherIndent;
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
	 */ constructor(startElement, options){
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
	 */ static first(startElement, options) {
        const walker = new this(startElement, options);
        const iterator = walker[Symbol.iterator]();
        return first(iterator);
    }
    /**
	 * Iterable interface.
	 */ *[Symbol.iterator]() {
        const nestedItems = [];
        for (const { node } of new SiblingListBlocksIterator(this._getStartNode(), this._isForward ? 'forward' : 'backward')){
            const indent = node.getAttribute('listIndent');
            // Leaving a nested list.
            if (indent < this._referenceIndent) {
                // Abort searching blocks.
                if (!this._lowerIndent) {
                    break;
                }
                // While searching for lower indents, update the reference indent to find another parent in the next step.
                this._referenceIndent = indent;
            } else if (indent > this._referenceIndent) {
                // Ignore nested blocks.
                if (!this._higherIndent) {
                    continue;
                }
                // Collect nested blocks to verify if they are really nested, or it's a different item.
                if (!this._isForward) {
                    nestedItems.push(node);
                    continue;
                }
            } else {
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
                if (this._sameAttributes.some((attr)=>node.getAttribute(attr) !== this._startElement.getAttribute(attr))) {
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
	 */ _getStartNode() {
        if (this._includeSelf) {
            return this._startElement;
        }
        return this._isForward ? this._startElement.nextSibling : this._startElement.previousSibling;
    }
}
/**
 * Iterates sibling list blocks starting from the given node.
 *
 * @internal
 */ class SiblingListBlocksIterator {
    _node;
    _isForward;
    _previousNodesByIndent = [];
    _previous = null;
    _previousNodeIndent = null;
    /**
	 * @param node The model node.
	 * @param direction Iteration direction.
	 */ constructor(node, direction = 'forward'){
        this._node = node;
        this._isForward = direction === 'forward';
    }
    [Symbol.iterator]() {
        return this;
    }
    next() {
        if (!isListItemBlock(this._node)) {
            return {
                done: true,
                value: undefined
            };
        }
        const nodeIndent = this._node.getAttribute('listIndent');
        let previousNodeInList = null;
        if (this._previous) {
            const previousNodeIndent = this._previousNodeIndent;
            // Let's find previous node for the same indent.
            // We're going to need that when we get back to previous indent.
            if (nodeIndent > previousNodeIndent) {
                this._previousNodesByIndent[previousNodeIndent] = this._previous;
            } else if (nodeIndent < previousNodeIndent) {
                previousNodeInList = this._previousNodesByIndent[nodeIndent] || null;
                this._previousNodesByIndent.length = nodeIndent;
            } else {
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
        return {
            value,
            done: false
        };
    }
}
/**
 * The iterable protocol over the list elements.
 *
 * @internal
 */ class ListBlocksIterable {
    _listHead;
    /**
	 * @param listHead The head element of a list.
	 */ constructor(listHead){
        this._listHead = listHead;
    }
    /**
	 * List blocks iterator.
	 *
	 * Iterates over all blocks of a list.
	 */ [Symbol.iterator]() {
        return new SiblingListBlocksIterator(this._listHead);
    }
}

/**
 * The list item ID generator.
 *
 * @internal
 */ class ListItemUid {
    /**
	 * Returns the next ID.
	 *
	 * @internal
	 */ /* istanbul ignore next: static function definition -- @preserve */ static next() {
        return uid();
    }
}
/**
 * Returns true if the given model node is a list item block.
 *
 * @internal
 */ function isListItemBlock(node) {
    return !!node && node.is('element') && node.hasAttribute('listItemId');
}
/**
 * Returns an array with all elements that represents the same list item.
 *
 * It means that values for `listIndent`, and `listItemId` for all items are equal.
 *
 * @internal
 * @param listItem Starting list item element.
 * @param options.higherIndent Whether blocks with a higher indent level than the start block should be included
 * in the result.
 */ function getAllListItemBlocks(listItem, options = {}) {
    return [
        ...getListItemBlocks(listItem, {
            ...options,
            direction: 'backward'
        }),
        ...getListItemBlocks(listItem, {
            ...options,
            direction: 'forward'
        })
    ];
}
/**
 * Returns an array with elements that represents the same list item in the specified direction.
 *
 * It means that values for `listIndent` and `listItemId` for all items are equal.
 *
 * **Note**: For backward search the provided item is not included, but for forward search it is included in the result.
 *
 * @internal
 * @param listItem Starting list item element.
 * @param options.direction Walking direction.
 * @param options.higherIndent Whether blocks with a higher indent level than the start block should be included in the result.
 */ function getListItemBlocks(listItem, options = {}) {
    const isForward = options.direction == 'forward';
    const items = Array.from(new ListWalker(listItem, {
        ...options,
        includeSelf: isForward,
        sameIndent: true,
        sameAttributes: 'listItemId'
    }));
    return isForward ? items : items.reverse();
}
/**
 * Returns a list items nested inside the given list item.
 *
 * @internal
 */ function getNestedListBlocks(listItem) {
    return Array.from(new ListWalker(listItem, {
        direction: 'forward',
        higherIndent: true
    }));
}
/**
 * Returns array of all blocks/items of the same list as given block (same indent, same type and properties).
 *
 * @internal
 * @param listItem Starting list item element.
 * @param options Additional list walker options to modify the range of returned list items.
 */ function getListItems(listItem, options) {
    const backwardBlocks = new ListWalker(listItem, {
        sameIndent: true,
        sameAttributes: 'listType',
        ...options
    });
    const forwardBlocks = new ListWalker(listItem, {
        sameIndent: true,
        sameAttributes: 'listType',
        includeSelf: true,
        direction: 'forward',
        ...options
    });
    return [
        ...Array.from(backwardBlocks).reverse(),
        ...forwardBlocks
    ];
}
/**
 * Check if the given block is the first in the list item.
 *
 * @internal
 * @param listBlock The list block element.
 */ function isFirstBlockOfListItem(listBlock) {
    const previousSibling = ListWalker.first(listBlock, {
        sameIndent: true,
        sameAttributes: 'listItemId'
    });
    if (!previousSibling) {
        return true;
    }
    return false;
}
/**
 * Check if the given block is the last in the list item.
 *
 * @internal
 */ function isLastBlockOfListItem(listBlock) {
    const nextSibling = ListWalker.first(listBlock, {
        direction: 'forward',
        sameIndent: true,
        sameAttributes: 'listItemId'
    });
    if (!nextSibling) {
        return true;
    }
    return false;
}
/**
 * Expands the given list of selected blocks to include the leading and tailing blocks of partially selected list items.
 *
 * @internal
 * @param blocks The list of selected blocks.
 * @param options.withNested Whether should include nested list items.
 */ function expandListBlocksToCompleteItems(blocks, options = {}) {
    blocks = toArray(blocks);
    const higherIndent = options.withNested !== false;
    const allBlocks = new Set();
    for (const block of blocks){
        for (const itemBlock of getAllListItemBlocks(block, {
            higherIndent
        })){
            allBlocks.add(itemBlock);
        }
    }
    return sortBlocks(allBlocks);
}
/**
 * Expands the given list of selected blocks to include all the items of the lists they're in.
 *
 * @internal
 * @param blocks The list of selected blocks.
 */ function expandListBlocksToCompleteList(blocks) {
    blocks = toArray(blocks);
    const allBlocks = new Set();
    for (const block of blocks){
        for (const itemBlock of getListItems(block)){
            allBlocks.add(itemBlock);
        }
    }
    return sortBlocks(allBlocks);
}
/**
 * Splits the list item just before the provided list block.
 *
 * @internal
 * @param listBlock The list block element.
 * @param writer The model writer.
 * @returns The array of updated blocks.
 */ function splitListItemBefore(listBlock, writer) {
    const blocks = getListItemBlocks(listBlock, {
        direction: 'forward'
    });
    const id = ListItemUid.next();
    for (const block of blocks){
        writer.setAttribute('listItemId', id, block);
    }
    return blocks;
}
/**
 * Merges the list item with the parent list item.
 *
 * @internal
 * @param listBlock The list block element.
 * @param parentBlock The list block element to merge with.
 * @param writer The model writer.
 * @returns The array of updated blocks.
 */ function mergeListItemBefore(listBlock, parentBlock, writer) {
    const attributes = {};
    for (const [key, value] of parentBlock.getAttributes()){
        if (key.startsWith('list')) {
            attributes[key] = value;
        }
    }
    const blocks = getListItemBlocks(listBlock, {
        direction: 'forward'
    });
    for (const block of blocks){
        writer.setAttributes(attributes, block);
    }
    return blocks;
}
/**
 * Increases indentation of given list blocks.
 *
 * @internal
 * @param blocks The block or iterable of blocks.
 * @param writer The model writer.
 * @param options Additional options.
 * @param options.expand Whether should expand the list of blocks to include complete list items.
 * @param options.indentBy The number of levels the indentation should change (could be negative).
 * @param options.attributeNames List of attribute names to remove when a block leaves the list (when blockIndent < 0).
 */ function indentBlocks(blocks, writer, { expand, indentBy = 1, attributeNames }) {
    blocks = toArray(blocks);
    // Expand the selected blocks to contain the whole list items.
    const allBlocks = expand ? expandListBlocksToCompleteItems(blocks) : blocks;
    for (const block of allBlocks){
        const blockIndent = block.getAttribute('listIndent') + indentBy;
        if (blockIndent < 0) {
            removeListAttributes(block, writer, attributeNames);
        } else {
            writer.setAttribute('listIndent', blockIndent, block);
        }
    }
    return allBlocks;
}
/**
 * Decreases indentation of given list of blocks. If the indentation of some blocks matches the indentation
 * of surrounding blocks, they get merged together.
 *
 * @internal
 * @param blocks The block or iterable of blocks.
 * @param writer The model writer.
 * @param options Additional options.
 * @param options.attributeNames List of attribute names to remove when a block leaves the list (when blockIndent < 0).
 */ function outdentBlocksWithMerge(blocks, writer, { attributeNames }) {
    blocks = toArray(blocks);
    // Expand the selected blocks to contain the whole list items.
    const allBlocks = expandListBlocksToCompleteItems(blocks);
    const visited = new Set();
    const referenceIndent = Math.min(...allBlocks.map((block)=>block.getAttribute('listIndent')));
    const parentBlocks = new Map();
    // Collect parent blocks before the list structure gets altered.
    for (const block of allBlocks){
        parentBlocks.set(block, ListWalker.first(block, {
            lowerIndent: true
        }));
    }
    for (const block of allBlocks){
        if (visited.has(block)) {
            continue;
        }
        visited.add(block);
        const blockIndent = block.getAttribute('listIndent') - 1;
        if (blockIndent < 0) {
            removeListAttributes(block, writer, attributeNames);
            continue;
        }
        // Merge with parent list item while outdenting and indent matches reference indent.
        if (block.getAttribute('listIndent') == referenceIndent) {
            const mergedBlocks = mergeListItemIfNotLast(block, parentBlocks.get(block), writer);
            // All list item blocks are updated while merging so add those to visited set.
            for (const mergedBlock of mergedBlocks){
                visited.add(mergedBlock);
            }
            // The indent level was updated while merging so continue to next block.
            if (mergedBlocks.length) {
                continue;
            }
        }
        writer.setAttribute('listIndent', blockIndent, block);
    }
    return sortBlocks(visited);
}
/**
 * Removes all list attributes from the given blocks.
 *
 * @internal
 * @param blocks The block or iterable of blocks.
 * @param writer The model writer.
 * @param attributeNames List of attribute names to remove.
 * @returns Array of altered blocks.
 */ function removeListAttributes(blocks, writer, attributeNames) {
    blocks = toArray(blocks);
    // Convert simple list items to plain paragraphs.
    for (const block of blocks){
        if (block.is('element', 'listItem')) {
            writer.rename(block, 'paragraph');
        }
    }
    // Remove list attributes.
    for (const block of blocks){
        for (const attributeKey of block.getAttributeKeys()){
            if (attributeNames.includes(attributeKey)) {
                writer.removeAttribute(attributeKey, block);
            }
        }
    }
    return blocks;
}
/**
 * Checks whether the given blocks are related to a single list item.
 *
 * @internal
 * @param blocks The list block elements.
 */ function isSingleListItem(blocks) {
    if (!blocks.length) {
        return false;
    }
    const firstItemId = blocks[0].getAttribute('listItemId');
    if (!firstItemId) {
        return false;
    }
    return !blocks.some((item)=>item.getAttribute('listItemId') != firstItemId);
}
/**
 * Modifies the indents of list blocks following the given list block so the indentation is valid after
 * the given block is no longer a list item.
 *
 * @internal
 * @param lastBlock The last list block that has become a non-list element.
 * @param writer The model writer.
 * @returns Array of altered blocks.
 */ function outdentFollowingItems(lastBlock, writer) {
    const changedBlocks = [];
    // Start from the model item that is just after the last turned-off item.
    let currentIndent = Number.POSITIVE_INFINITY;
    // Correct indent of all items after the last turned off item.
    // Rules that should be followed:
    // 1. All direct sub-items of turned-off item should become indent 0, because the first item after it
    //    will be the first item of a new list. Other items are at the same level, so should have same 0 index.
    // 2. All items with indent lower than indent of turned-off item should become indent 0, because they
    //    should not end up as a child of any of list items that they were not children of before.
    // 3. All other items should have their indent changed relatively to it's parent.
    //
    // For example:
    // 1  * --------
    // 2     * --------
    // 3        * --------			<-- this is turned off.
    // 4           * --------		<-- this has to become indent = 0, because it will be first item on a new list.
    // 5              * --------	<-- this should be still be a child of item above, so indent = 1.
    // 6        * --------			<-- this has to become indent = 0, because it should not be a child of any of items above.
    // 7           * --------		<-- this should be still be a child of item above, so indent = 1.
    // 8     * --------				<-- this has to become indent = 0.
    // 9        * --------			<-- this should still be a child of item above, so indent = 1.
    // 10          * --------		<-- this should still be a child of item above, so indent = 2.
    // 11          * --------		<-- this should still be at the same level as item above, so indent = 2.
    // 12 * --------				<-- this and all below are left unchanged.
    // 13    * --------
    // 14       * --------
    //
    // After turning off 3 the list becomes:
    //
    // 1  * --------
    // 2     * --------
    //
    // 3  --------
    //
    // 4  * --------
    // 5     * --------
    // 6  * --------
    // 7     * --------
    // 8  * --------
    // 9     * --------
    // 10       * --------
    // 11       * --------
    // 12 * --------
    // 13    * --------
    // 14       * --------
    //
    // Thanks to this algorithm no lists are mismatched and no items get unexpected children/parent, while
    // those parent-child connection which are possible to maintain are still maintained. It's worth noting
    // that this is the same effect that we would be get by multiple use of outdent command. However doing
    // it like this is much more efficient because it's less operation (less memory usage, easier OT) and
    // less conversion (faster).
    for (const { node } of new SiblingListBlocksIterator(lastBlock.nextSibling)){
        // Check each next list item, as long as its indent is higher than 0.
        const indent = node.getAttribute('listIndent');
        // If the indent is 0 we are not going to change anything anyway.
        if (indent == 0) {
            break;
        }
        // We check if that's item indent is lower than current relative indent.
        if (indent < currentIndent) {
            // If it is, current relative indent becomes that indent.
            currentIndent = indent;
        }
        // Fix indent relatively to current relative indent.
        // Note, that if we just changed the current relative indent, the newIndent will be equal to 0.
        const newIndent = indent - currentIndent;
        writer.setAttribute('listIndent', newIndent, node);
        changedBlocks.push(node);
    }
    return changedBlocks;
}
/**
 * Returns the array of given blocks sorted by model indexes (document order).
 *
 * @internal
 */ function sortBlocks(blocks) {
    return Array.from(blocks).filter((block)=>block.root.rootName !== '$graveyard').sort((a, b)=>a.index - b.index);
}
/**
 * Returns a selected block object. If a selected object is inline or when there is no selected
 * object, `null` is returned.
 *
 * @internal
 * @param model The instance of editor model.
 * @returns Selected block object or `null`.
 */ function getSelectedBlockObject(model) {
    const selectedElement = model.document.selection.getSelectedElement();
    if (!selectedElement) {
        return null;
    }
    if (model.schema.isObject(selectedElement) && model.schema.isBlock(selectedElement)) {
        return selectedElement;
    }
    return null;
}
/**
 * Checks whether the given block can be replaced by a listItem.
 *
 * Note that this is possible only when multiBlock = false option is set in feature config.
 *
 * @param block A block to be tested.
 * @param schema The schema of the document.
 * @internal
 */ function canBecomeSimpleListItem(block, schema) {
    return schema.checkChild(block.parent, 'listItem') && schema.checkChild(block, '$text') && !schema.isObject(block);
}
/**
 * Returns true if listType is of type `numbered` or `customNumbered`.
 *
 * @internal
 */ function isNumberedListType(listType) {
    return listType == 'numbered' || listType == 'customNumbered';
}
/**
 * Checks if the given list item is the first item in the list.
 *
 * This function checks if there's any other list item before the given list item
 * at the same indent level with the same list type.
 */ function isFirstListItemInList(listItem) {
    const previousItem = ListWalker.first(listItem, {
        sameIndent: true,
        sameAttributes: 'listType'
    });
    return !previousItem;
}
/**
 * Merges a given block to the given parent block if parent is a list item and there is no more blocks in the same item.
 */ function mergeListItemIfNotLast(block, parentBlock, writer) {
    const parentItemBlocks = getListItemBlocks(parentBlock, {
        direction: 'forward'
    });
    // Merge with parent only if outdented item wasn't the last one in its parent.
    // Merge:
    // * a			->		* a
    //   * [b]		->		  b
    //   c			->		  c
    // Don't merge:
    // * a			->		* a
    //   * [b]		-> 		* b
    // * c			->		* c
    if (parentItemBlocks.pop().index > block.index) {
        return mergeListItemBefore(block, parentBlock, writer);
    }
    return [];
}

/**
 * The document list indent command. It is used by the {@link module:list/list~List list feature}.
 */ class ListIndentCommand extends Command {
    /**
	 * Determines by how much the command will change the list item's indent attribute.
	 */ _direction;
    /**
	 * Creates an instance of the command.
	 *
	 * @param editor The editor instance.
	 * @param indentDirection The direction of indent. If it is equal to `backward`, the command
	 * will outdent a list item.
	 */ constructor(editor, indentDirection){
        super(editor);
        this._direction = indentDirection;
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        this.isEnabled = this._checkEnabled();
    }
    /**
	 * Indents or outdents (depending on the {@link #constructor}'s `indentDirection` parameter) selected list items.
	 *
	 * @fires execute
	 * @fires afterExecute
	 */ execute() {
        const editor = this.editor;
        const model = editor.model;
        const blocks = getSelectedListBlocks(model.document.selection);
        const listEditing = editor.plugins.get('ListEditing');
        const attributeNames = listEditing.getListAttributeNames();
        model.change((writer)=>{
            const changedBlocks = [];
            // Handle selection contained in the single list item and starting in the following blocks.
            if (isSingleListItem(blocks) && !isFirstBlockOfListItem(blocks[0])) {
                // Allow increasing indent of following list item blocks.
                if (this._direction == 'forward') {
                    changedBlocks.push(...indentBlocks(blocks, writer, {
                        attributeNames
                    }));
                }
                // For indent make sure that indented blocks have a new ID.
                // For outdent just split blocks from the list item (give them a new IDs).
                changedBlocks.push(...splitListItemBefore(blocks[0], writer));
            } else {
                // Now just update the attributes of blocks.
                if (this._direction == 'forward') {
                    changedBlocks.push(...indentBlocks(blocks, writer, {
                        expand: true,
                        attributeNames
                    }));
                } else {
                    changedBlocks.push(...outdentBlocksWithMerge(blocks, writer, {
                        attributeNames
                    }));
                }
            }
            // Align the list item type to match the previous list item (from the same list).
            for (const block of changedBlocks){
                // This block become a plain block (for example a paragraph).
                if (!block.hasAttribute('listType')) {
                    continue;
                }
                const previousItemBlock = ListWalker.first(block, {
                    sameIndent: true
                });
                if (previousItemBlock) {
                    writer.setAttribute('listType', previousItemBlock.getAttribute('listType'), block);
                }
            }
            this._fireAfterExecute(changedBlocks);
        });
    }
    /**
	 * Fires the `afterExecute` event.
	 *
	 * @param changedBlocks The changed list elements.
	 */ _fireAfterExecute(changedBlocks) {
        this.fire('afterExecute', sortBlocks(new Set(changedBlocks)));
    }
    /**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @returns Whether the command should be enabled.
	 */ _checkEnabled() {
        // Check whether any of position's ancestor is a list item.
        let blocks = getSelectedListBlocks(this.editor.model.document.selection);
        let firstBlock = blocks[0];
        // If selection is not in a list item, the command is disabled.
        if (!firstBlock) {
            return false;
        }
        // If we are outdenting it is enough to be in list item. Every list item can always be outdented.
        if (this._direction == 'backward') {
            return true;
        }
        // A single block of a list item is selected, so it could be indented as a sublist.
        if (isSingleListItem(blocks) && !isFirstBlockOfListItem(blocks[0])) {
            return true;
        }
        blocks = expandListBlocksToCompleteItems(blocks);
        firstBlock = blocks[0];
        // Check if there is any list item before selected items that could become a parent of selected items.
        const siblingItem = ListWalker.first(firstBlock, {
            sameIndent: true
        });
        if (!siblingItem) {
            return false;
        }
        if (siblingItem.getAttribute('listType') == firstBlock.getAttribute('listType')) {
            return true;
        }
        return false;
    }
}
/**
 * Returns an array of selected blocks truncated to the first non list block element.
 */ function getSelectedListBlocks(selection) {
    const blocks = Array.from(selection.getSelectedBlocks());
    const firstNonListBlockIndex = blocks.findIndex((block)=>!isListItemBlock(block));
    if (firstNonListBlockIndex != -1) {
        blocks.length = firstNonListBlockIndex;
    }
    return blocks;
}

/**
 * The list command. It is used by the {@link module:list/list~List list feature}.
 */ class ListCommand extends Command {
    /**
	 * The type of the list created by the command.
	 */ type;
    /**
	 * List Walker options that change the range of the list items to be changed when the selection is collapsed within a list item.
	 *
	 * In a multi-level list, when the selection is collapsed within a list item, instead of changing only the list items of the same list
	 * type and current indent level, the entire list structure is changed (all list items at all indent levels of any list type).
	 */ _listWalkerOptions;
    /**
	 * Creates an instance of the command.
	 *
	 * @param editor The editor instance.
	 * @param type List type that will be handled by this command.
	 */ constructor(editor, type, options = {}){
        super(editor);
        this.type = type;
        this._listWalkerOptions = options.multiLevel ? {
            higherIndent: true,
            lowerIndent: true,
            sameAttributes: []
        } : undefined;
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        this.value = this._getValue();
        this.isEnabled = this._checkEnabled();
    }
    /**
	 * Executes the list command.
	 *
	 * @fires execute
	 * @fires afterExecute
	 * @param options Command options.
	 * @param options.forceValue If set, it will force the command behavior. If `true`, the command will try to convert the
	 * selected items and potentially the neighbor elements to the proper list items. If set to `false` it will convert selected elements
	 * to paragraphs. If not set, the command will toggle selected elements to list items or paragraphs, depending on the selection.
	 * @param options.additionalAttributes Additional attributes that are set for list items when the command is executed.
	 */ execute(options = {}) {
        const model = this.editor.model;
        const document = model.document;
        const selectedBlockObject = getSelectedBlockObject(model);
        const blocks = Array.from(document.selection.getSelectedBlocks()).filter((block)=>model.schema.checkAttribute(block, 'listType') || canBecomeSimpleListItem(block, model.schema));
        // Whether we are turning off some items.
        const turnOff = options.forceValue !== undefined ? !options.forceValue : this.value;
        model.change((writer)=>{
            if (turnOff) {
                const lastBlock = blocks[blocks.length - 1];
                const listEditing = this.editor.plugins.get('ListEditing');
                const attributeNames = listEditing.getListAttributeNames();
                // Split the first block from the list item.
                const itemBlocks = getListItemBlocks(lastBlock, {
                    direction: 'forward'
                });
                const changedBlocks = [];
                if (itemBlocks.length > 1) {
                    changedBlocks.push(...splitListItemBefore(itemBlocks[1], writer));
                }
                // Strip list attributes.
                changedBlocks.push(...removeListAttributes(blocks, writer, attributeNames));
                // Outdent items following the selected list item.
                changedBlocks.push(...outdentFollowingItems(lastBlock, writer));
                this._fireAfterExecute(changedBlocks);
            } else if ((selectedBlockObject || document.selection.isCollapsed) && isListItemBlock(blocks[0])) {
                const changedBlocks = getListItems(selectedBlockObject || blocks[0], this._listWalkerOptions);
                for (const block of changedBlocks){
                    writer.setAttributes({
                        ...options.additionalAttributes,
                        listType: this.type
                    }, block);
                }
                this._fireAfterExecute(changedBlocks);
            } else {
                const changedBlocks = [];
                for (const block of blocks){
                    // Promote the given block to the list item.
                    if (!block.hasAttribute('listType')) {
                        // Rename block to a simple list item if this option is enabled.
                        if (!block.is('element', 'listItem') && canBecomeSimpleListItem(block, model.schema)) {
                            writer.rename(block, 'listItem');
                        }
                        writer.setAttributes({
                            ...options.additionalAttributes,
                            listIndent: 0,
                            listItemId: ListItemUid.next(),
                            listType: this.type
                        }, block);
                        changedBlocks.push(block);
                    } else {
                        for (const node of expandListBlocksToCompleteItems(block, {
                            withNested: false
                        })){
                            if (node.getAttribute('listType') != this.type) {
                                writer.setAttributes({
                                    ...options.additionalAttributes,
                                    listType: this.type
                                }, node);
                                changedBlocks.push(node);
                            }
                        }
                    }
                }
                this._fireAfterExecute(changedBlocks);
            }
        });
    }
    /**
	 * Fires the `afterExecute` event.
	 *
	 * @param changedBlocks The changed list elements.
	 */ _fireAfterExecute(changedBlocks) {
        this.fire('afterExecute', sortBlocks(new Set(changedBlocks)));
    }
    /**
	 * Checks the command's {@link #value}.
	 *
	 * @returns The current value.
	 */ _getValue() {
        const selection = this.editor.model.document.selection;
        const blocks = Array.from(selection.getSelectedBlocks());
        if (!blocks.length) {
            return false;
        }
        for (const block of blocks){
            if (block.getAttribute('listType') != this.type) {
                return false;
            }
        }
        return true;
    }
    /**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @returns Whether the command should be enabled.
	 */ _checkEnabled() {
        const model = this.editor.model;
        const schema = model.schema;
        const selection = model.document.selection;
        const blocks = Array.from(selection.getSelectedBlocks());
        if (!blocks.length) {
            return false;
        }
        // If command value is true it means that we are in list item, so the command should be enabled.
        if (this.value) {
            return true;
        }
        for (const block of blocks){
            if (schema.checkAttribute(block, 'listType') || canBecomeSimpleListItem(block, schema)) {
                return true;
            }
        }
        return false;
    }
}

/**
 * The document list merge command. It is used by the {@link module:list/list~List list feature}.
 */ class ListMergeCommand extends Command {
    /**
	 * Whether list item should be merged before or after the selected block.
	 */ _direction;
    /**
	 * Creates an instance of the command.
	 *
	 * @param editor The editor instance.
	 * @param direction Whether list item should be merged before or after the selected block.
	 */ constructor(editor, direction){
        super(editor);
        this._direction = direction;
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        this.isEnabled = this._checkEnabled();
    }
    /**
	 * Merges list blocks together (depending on the {@link #constructor}'s `direction` parameter).
	 *
	 * @fires execute
	 * @fires afterExecute
	 * @param options Command options.
	 * @param options.shouldMergeOnBlocksContentLevel When set `true`, merging will be performed together
	 * with {@link module:engine/model/model~Model#deleteContent} to get rid of the inline content in the selection or take advantage
	 * of the heuristics in `deleteContent()` that helps convert lists into paragraphs in certain cases.
	 */ execute({ shouldMergeOnBlocksContentLevel = false } = {}) {
        const editor = this.editor;
        const model = editor.model;
        const selection = model.document.selection;
        const changedBlocks = [];
        const listEditing = editor.plugins.get('ListEditing');
        const attributeNames = listEditing.getListAttributeNames();
        model.change((writer)=>{
            const { firstElement, lastElement } = this._getMergeSubjectElements(selection, shouldMergeOnBlocksContentLevel);
            const firstIndent = firstElement.getAttribute('listIndent') || 0;
            const lastIndent = lastElement.getAttribute('listIndent');
            const lastElementId = lastElement.getAttribute('listItemId');
            if (firstIndent != lastIndent) {
                const nestedLastElementBlocks = getNestedListBlocks(lastElement);
                changedBlocks.push(...indentBlocks([
                    lastElement,
                    ...nestedLastElementBlocks
                ], writer, {
                    indentBy: firstIndent - lastIndent,
                    // If outdenting, the entire sub-tree that follows must be included.
                    expand: firstIndent < lastIndent,
                    attributeNames
                }));
            }
            if (shouldMergeOnBlocksContentLevel) {
                let sel = selection;
                if (selection.isCollapsed) {
                    sel = writer.createSelection(writer.createRange(writer.createPositionAt(firstElement, 'end'), writer.createPositionAt(lastElement, 0)));
                }
                // Delete selected content. Replace entire content only for non-collapsed selection.
                model.deleteContent(sel, {
                    doNotResetEntireContent: selection.isCollapsed
                });
                // Get the last "touched" element after deleteContent call (can't use the lastElement because
                // it could get merged into the firstElement while deleting content).
                const lastElementAfterDelete = sel.getLastPosition().parent;
                // Check if the element after it was in the same list item and adjust it if needed.
                const nextSibling = lastElementAfterDelete.nextSibling;
                changedBlocks.push(lastElementAfterDelete);
                if (nextSibling && nextSibling !== lastElement && nextSibling.getAttribute('listItemId') == lastElementId) {
                    changedBlocks.push(...mergeListItemBefore(nextSibling, lastElementAfterDelete, writer));
                }
            } else {
                changedBlocks.push(...mergeListItemBefore(lastElement, firstElement, writer));
            }
            this._fireAfterExecute(changedBlocks);
        });
    }
    /**
	 * Fires the `afterExecute` event.
	 *
	 * @param changedBlocks The changed list elements.
	 */ _fireAfterExecute(changedBlocks) {
        this.fire('afterExecute', sortBlocks(new Set(changedBlocks)));
    }
    /**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @returns Whether the command should be enabled.
	 */ _checkEnabled() {
        const model = this.editor.model;
        const selection = model.document.selection;
        const selectedBlockObject = getSelectedBlockObject(model);
        if (selection.isCollapsed || selectedBlockObject) {
            const positionParent = selectedBlockObject || selection.getFirstPosition().parent;
            if (!isListItemBlock(positionParent)) {
                return false;
            }
            const siblingNode = this._direction == 'backward' ? positionParent.previousSibling : positionParent.nextSibling;
            if (!siblingNode) {
                return false;
            }
            if (isSingleListItem([
                positionParent,
                siblingNode
            ])) {
                return false;
            }
        } else {
            const lastPosition = selection.getLastPosition();
            const firstPosition = selection.getFirstPosition();
            // If deleting within a single block of a list item, there's no need to merge anything.
            // The default delete should be executed instead.
            if (lastPosition.parent === firstPosition.parent) {
                return false;
            }
            if (!isListItemBlock(lastPosition.parent)) {
                return false;
            }
        }
        return true;
    }
    /**
	 * Returns the boundary elements the merge should be executed for. These are not necessarily selection's first
	 * and last position parents but sometimes sibling or even further blocks depending on the context.
	 *
	 * @param selection The selection the merge is executed for.
	 * @param shouldMergeOnBlocksContentLevel When `true`, merge is performed together with
	 * {@link module:engine/model/model~Model#deleteContent} to remove the inline content within the selection.
	 */ _getMergeSubjectElements(selection, shouldMergeOnBlocksContentLevel) {
        const model = this.editor.model;
        const selectedBlockObject = getSelectedBlockObject(model);
        let firstElement, lastElement;
        if (selection.isCollapsed || selectedBlockObject) {
            const positionParent = selectedBlockObject || selection.getFirstPosition().parent;
            const isFirstBlock = isFirstBlockOfListItem(positionParent);
            if (this._direction == 'backward') {
                lastElement = positionParent;
                if (isFirstBlock && !shouldMergeOnBlocksContentLevel) {
                    // For the "c" as an anchorElement:
                    //  * a
                    //    * b
                    //  * [c]  <-- this block should be merged with "a"
                    // It should find "a" element to merge with:
                    //  * a
                    //    * b
                    //    c
                    firstElement = ListWalker.first(positionParent, {
                        sameIndent: true,
                        lowerIndent: true
                    });
                } else {
                    firstElement = positionParent.previousSibling;
                }
            } else {
                // In case of the forward merge there is no case as above, just merge with next sibling.
                firstElement = positionParent;
                lastElement = positionParent.nextSibling;
            }
        } else {
            firstElement = selection.getFirstPosition().parent;
            lastElement = selection.getLastPosition().parent;
        }
        return {
            firstElement: firstElement,
            lastElement: lastElement
        };
    }
}

/**
 * The document list split command that splits the list item at the selection.
 *
 * It is used by the {@link module:list/list~List list feature}.
 */ class ListSplitCommand extends Command {
    /**
	 * Whether list item should be split before or after the selected block.
	 */ _direction;
    /**
	 * Creates an instance of the command.
	 *
	 * @param editor The editor instance.
	 * @param direction Whether list item should be split before or after the selected block.
	 */ constructor(editor, direction){
        super(editor);
        this._direction = direction;
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        this.isEnabled = this._checkEnabled();
    }
    /**
	 * Splits the list item at the selection.
	 *
	 * @fires execute
	 * @fires afterExecute
	 */ execute() {
        const editor = this.editor;
        editor.model.change((writer)=>{
            const changedBlocks = splitListItemBefore(this._getStartBlock(), writer);
            this._fireAfterExecute(changedBlocks);
        });
    }
    /**
	 * Fires the `afterExecute` event.
	 *
	 * @param changedBlocks The changed list elements.
	 */ _fireAfterExecute(changedBlocks) {
        this.fire('afterExecute', sortBlocks(new Set(changedBlocks)));
    }
    /**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @returns Whether the command should be enabled.
	 */ _checkEnabled() {
        const selection = this.editor.model.document.selection;
        const block = this._getStartBlock();
        return selection.isCollapsed && isListItemBlock(block) && !isFirstBlockOfListItem(block);
    }
    /**
	 * Returns the model element that is the main focus of the command (according to the current selection and command direction).
	 */ _getStartBlock() {
        const doc = this.editor.model.document;
        const positionParent = doc.selection.getFirstPosition().parent;
        return this._direction == 'before' ? positionParent : positionParent.nextSibling;
    }
}

/**
 * The list item bold integration plugin.
 */ class ListItemBoldIntegration extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ListItemBoldIntegration';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ListEditing
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const ListFormatting = editor.plugins.get('ListFormatting');
        const listEditing = editor.plugins.get(ListEditing);
        if (!editor.plugins.has('BoldEditing') || !this.editor.config.get('list.enableListItemMarkerFormatting')) {
            return;
        }
        ListFormatting.registerFormatAttribute('bold', 'listItemBold');
        // Register the downcast strategy in init() so that the attribute name is registered before the list editing
        // registers its converters.
        // This ensures that the attribute is recognized by downcast strategies and bogus paragraphs are handled correctly.
        listEditing.registerDowncastStrategy({
            scope: 'item',
            attributeName: 'listItemBold',
            setAttributeOnDowncast (writer, value, viewElement, options) {
                if (value) {
                    writer.addClass('ck-list-marker-bold', viewElement);
                    // See: https://github.com/ckeditor/ckeditor5/issues/18790.
                    if (env.isSafari && !(options && options.dataPipeline)) {
                        writer.setStyle('--ck-content-list-marker-dummy-bold', '0', viewElement);
                    }
                }
            }
        });
    }
    /**
	 * @inheritDoc
	 */ afterInit() {
        const editor = this.editor;
        const model = editor.model;
        if (!editor.plugins.has('BoldEditing') || !this.editor.config.get('list.enableListItemMarkerFormatting')) {
            return;
        }
        model.schema.extend('$listItem', {
            allowAttributes: 'listItemBold'
        });
        model.schema.setAttributeProperties('listItemBold', {
            isFormatting: true
        });
        model.schema.addAttributeCheck((context)=>{
            const item = context.last;
            if (!item.getAttribute('listItemId')) {
                return false;
            }
        }, 'listItemBold');
        editor.conversion.for('upcast').attributeToAttribute({
            model: 'listItemBold',
            view: {
                name: 'li',
                classes: 'ck-list-marker-bold'
            }
        });
    }
}

/**
 * The list item italic integration plugin.
 */ class ListItemItalicIntegration extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ListItemItalicIntegration';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ListEditing
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const ListFormatting = editor.plugins.get('ListFormatting');
        const listEditing = editor.plugins.get(ListEditing);
        if (!editor.plugins.has('ItalicEditing') || !this.editor.config.get('list.enableListItemMarkerFormatting')) {
            return;
        }
        ListFormatting.registerFormatAttribute('italic', 'listItemItalic');
        // Register the downcast strategy in init() so that the attribute name is registered before the list editing
        // registers its converters.
        // This ensures that the attribute is recognized by downcast strategies and bogus paragraphs are handled correctly.
        listEditing.registerDowncastStrategy({
            scope: 'item',
            attributeName: 'listItemItalic',
            setAttributeOnDowncast (writer, value, viewElement, options) {
                if (value) {
                    writer.addClass('ck-list-marker-italic', viewElement);
                    // See: https://github.com/ckeditor/ckeditor5/issues/18790.
                    if (env.isSafari && !(options && options.dataPipeline)) {
                        writer.setStyle('--ck-content-list-marker-dummy-italic', '0', viewElement);
                    }
                }
            }
        });
    }
    /**
	 * @inheritDoc
	 */ afterInit() {
        const editor = this.editor;
        const model = editor.model;
        if (!editor.plugins.has('ItalicEditing') || !this.editor.config.get('list.enableListItemMarkerFormatting')) {
            return;
        }
        model.schema.extend('$listItem', {
            allowAttributes: 'listItemItalic'
        });
        model.schema.setAttributeProperties('listItemItalic', {
            isFormatting: true
        });
        model.schema.addAttributeCheck((context)=>{
            const item = context.last;
            if (!item.getAttribute('listItemId')) {
                return false;
            }
        }, 'listItemItalic');
        editor.conversion.for('upcast').attributeToAttribute({
            model: 'listItemItalic',
            view: {
                name: 'li',
                classes: 'ck-list-marker-italic'
            }
        });
    }
}

/**
 * The list item font size integration plugin.
 */ class ListItemFontSizeIntegration extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ListItemFontSizeIntegration';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ListEditing
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const ListFormatting = editor.plugins.get('ListFormatting');
        const listEditing = editor.plugins.get(ListEditing);
        if (!editor.plugins.has('FontSizeEditing') || !this.editor.config.get('list.enableListItemMarkerFormatting')) {
            return;
        }
        const normalizedFontSizeOptions = _normalizeFontSizeOptions(editor.config.get('fontSize.options'));
        ListFormatting.registerFormatAttribute('fontSize', 'listItemFontSize');
        // Register the downcast strategy in init() so that the attribute name is registered before the list editing
        // registers its converters.
        // This ensures that the attribute is recognized by downcast strategies and bogus paragraphs are handled correctly.
        listEditing.registerDowncastStrategy({
            scope: 'item',
            attributeName: 'listItemFontSize',
            setAttributeOnDowncast (writer, value, viewElement, options) {
                if (value) {
                    const fontSizeOption = normalizedFontSizeOptions.find((option)=>option.model == value);
                    if (fontSizeOption && fontSizeOption.view && typeof fontSizeOption.view != 'string') {
                        if (fontSizeOption.view.styles) {
                            writer.addClass('ck-list-marker-font-size', viewElement);
                            writer.setStyle('--ck-content-list-marker-font-size', fontSizeOption.view.styles['font-size'], viewElement);
                        } else if (fontSizeOption.view.classes) {
                            writer.addClass(`ck-list-marker-font-size-${value}`, viewElement);
                            // See: https://github.com/ckeditor/ckeditor5/issues/18790.
                            if (env.isSafari && !(options && options.dataPipeline)) {
                                writer.setStyle('--ck-content-list-marker-dummy-font-size', '0', viewElement);
                            }
                        }
                    } else {
                        writer.addClass('ck-list-marker-font-size', viewElement);
                        writer.setStyle('--ck-content-list-marker-font-size', value, viewElement);
                    }
                }
            }
        });
    }
    /**
	 * @inheritDoc
	 */ afterInit() {
        const editor = this.editor;
        const model = editor.model;
        if (!editor.plugins.has('FontSizeEditing') || !this.editor.config.get('list.enableListItemMarkerFormatting')) {
            return;
        }
        model.schema.extend('$listItem', {
            allowAttributes: 'listItemFontSize'
        });
        model.schema.setAttributeProperties('listItemFontSize', {
            isFormatting: true
        });
        model.schema.addAttributeCheck((context)=>{
            const item = context.last;
            if (!item.getAttribute('listItemId')) {
                return false;
            }
        }, 'listItemFontSize');
        editor.conversion.for('upcast').elementToAttribute({
            model: {
                key: 'listItemFontSize',
                value: (viewElement)=>viewElement.getStyle('--ck-content-list-marker-font-size')
            },
            view: {
                name: 'li',
                classes: 'ck-list-marker-font-size',
                styles: {
                    '--ck-content-list-marker-font-size': /.*/
                }
            }
        });
        const fontSizeOptions = _normalizeFontSizeOptions(editor.config.get('fontSize.options'));
        for (const option of fontSizeOptions){
            if (option.model && option.view) {
                editor.conversion.for('upcast').elementToAttribute({
                    model: {
                        key: 'listItemFontSize',
                        value: option.model
                    },
                    view: {
                        name: 'li',
                        classes: `ck-list-marker-font-size-${option.model}`
                    }
                });
            }
        }
    }
}

/**
 * The list item font color integration plugin.
 */ class ListItemFontColorIntegration extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ListItemFontColorIntegration';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ListEditing
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const ListFormatting = editor.plugins.get('ListFormatting');
        const listEditing = editor.plugins.get(ListEditing);
        if (!editor.plugins.has('FontColorEditing') || !this.editor.config.get('list.enableListItemMarkerFormatting')) {
            return;
        }
        ListFormatting.registerFormatAttribute('fontColor', 'listItemFontColor');
        // Register the downcast strategy in init() so that the attribute name is registered before the list editing
        // registers its converters.
        // This ensures that the attribute is recognized by downcast strategies and bogus paragraphs are handled correctly.
        listEditing.registerDowncastStrategy({
            scope: 'item',
            attributeName: 'listItemFontColor',
            setAttributeOnDowncast (writer, value, viewElement) {
                if (value) {
                    writer.addClass('ck-list-marker-color', viewElement);
                    writer.setStyle('--ck-content-list-marker-color', value, viewElement);
                }
            }
        });
    }
    /**
	 * @inheritDoc
	 */ afterInit() {
        const editor = this.editor;
        const model = editor.model;
        if (!editor.plugins.has('FontColorEditing') || !this.editor.config.get('list.enableListItemMarkerFormatting')) {
            return;
        }
        model.schema.extend('$listItem', {
            allowAttributes: 'listItemFontColor'
        });
        model.schema.setAttributeProperties('listItemFontColor', {
            isFormatting: true
        });
        model.schema.addAttributeCheck((context)=>{
            const item = context.last;
            if (!item.getAttribute('listItemId')) {
                return false;
            }
        }, 'listItemFontColor');
        editor.conversion.for('upcast').attributeToAttribute({
            model: {
                key: 'listItemFontColor',
                value: (viewElement)=>{
                    return viewElement.getStyle('--ck-content-list-marker-color');
                }
            },
            view: {
                name: 'li',
                classes: 'ck-list-marker-color',
                styles: {
                    '--ck-content-list-marker-color': /.*/
                }
            }
        });
    }
}

/**
 * The list item font family integration plugin.
 */ class ListItemFontFamilyIntegration extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ListItemFontFamilyIntegration';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ListEditing
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const ListFormatting = editor.plugins.get('ListFormatting');
        const listEditing = editor.plugins.get(ListEditing);
        if (!editor.plugins.has('FontFamilyEditing') || !this.editor.config.get('list.enableListItemMarkerFormatting')) {
            return;
        }
        ListFormatting.registerFormatAttribute('fontFamily', 'listItemFontFamily');
        // Register the downcast strategy in init() so that the attribute name is registered before the list editing
        // registers its converters.
        // This ensures that the attribute is recognized by downcast strategies and bogus paragraphs are handled correctly.
        listEditing.registerDowncastStrategy({
            scope: 'item',
            attributeName: 'listItemFontFamily',
            setAttributeOnDowncast (writer, value, viewElement) {
                // There is no need of removing the style because downcast strategies handles it automatically.
                if (value) {
                    writer.addClass('ck-list-marker-font-family', viewElement);
                    writer.setStyle('--ck-content-list-marker-font-family', value, viewElement);
                }
            }
        });
    }
    /**
	 * @inheritDoc
	 */ afterInit() {
        const editor = this.editor;
        const model = editor.model;
        if (!editor.plugins.has('FontFamilyEditing') || !this.editor.config.get('list.enableListItemMarkerFormatting')) {
            return;
        }
        model.schema.extend('$listItem', {
            allowAttributes: 'listItemFontFamily'
        });
        model.schema.setAttributeProperties('listItemFontFamily', {
            isFormatting: true
        });
        model.schema.addAttributeCheck((context)=>{
            const item = context.last;
            if (!item.getAttribute('listItemId')) {
                return false;
            }
        }, 'listItemFontFamily');
        editor.conversion.for('upcast').attributeToAttribute({
            model: {
                key: 'listItemFontFamily',
                value: (viewElement)=>{
                    return viewElement.getStyle('--ck-content-list-marker-font-family');
                }
            },
            view: {
                name: 'li',
                classes: 'ck-list-marker-font-family',
                styles: {
                    '--ck-content-list-marker-font-family': /.*/
                }
            }
        });
    }
}

/**
 * The list formatting plugin.
 *
 * It enables integration with formatting plugins to style the list marker.
 * The list marker is styled based on the consistent formatting applied to the content of the list item.
 *
 * The list of supported formatting plugins includes:
 * * Font color.
 * * Font size.
 * * Font family.
 * * Bold.
 * * Italic.
 */ class ListFormatting extends Plugin {
    /**
	 * The list of loaded formatting.
	 */ _loadedFormatting = {};
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ListFormatting';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ListItemBoldIntegration,
            ListItemItalicIntegration,
            ListItemFontSizeIntegration,
            ListItemFontColorIntegration,
            ListItemFontFamilyIntegration
        ];
    }
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        editor.config.define('list.enableListItemMarkerFormatting', true);
    }
    /**
	 * @inheritDoc
	 */ afterInit() {
        if (!this.editor.config.get('list.enableListItemMarkerFormatting')) {
            return;
        }
        this._registerPostfixerForListItemFormatting();
    }
    /**
	 * Registers a postfixer that ensures that the list item formatting attribute is consistent with the formatting
	 * applied to the content of the list item.
	 */ _registerPostfixerForListItemFormatting() {
        const model = this.editor.model;
        model.document.registerPostFixer((writer)=>{
            const changes = model.document.differ.getChanges();
            const modifiedListItems = new Set();
            let returnValue = false;
            for (const entry of changes){
                if (entry.type === 'attribute') {
                    if (entry.attributeKey == 'listItemId' || entry.attributeKey == 'listType' || this._isInlineOrSelectionFormatting(entry.attributeKey) || Object.values(this._loadedFormatting).includes(entry.attributeKey)) {
                        if (isListItemBlock(entry.range.start.nodeAfter)) {
                            modifiedListItems.add(entry.range.start.nodeAfter);
                        } else if (isListItemBlock(entry.range.start.parent)) {
                            modifiedListItems.add(entry.range.start.parent);
                        }
                    }
                } else {
                    if (isListItemBlock(entry.position.nodeAfter)) {
                        modifiedListItems.add(entry.position.nodeAfter);
                    }
                    if (isListItemBlock(entry.position.nodeBefore)) {
                        modifiedListItems.add(entry.position.nodeBefore);
                    }
                    if (isListItemBlock(entry.position.parent)) {
                        modifiedListItems.add(entry.position.parent);
                    }
                    if (entry.type == 'insert' && entry.name != '$text') {
                        const range = writer.createRangeIn(entry.position.nodeAfter);
                        for (const item of range.getItems()){
                            if (isListItemBlock(item)) {
                                modifiedListItems.add(item);
                            }
                        }
                    }
                }
            }
            for (const listItem of modifiedListItems){
                const formats = getListItemConsistentFormat(model, listItem, Object.keys(this._loadedFormatting));
                for (const [formatAttributeName, formatValue] of Object.entries(formats)){
                    const listItemFormatAttributeName = this._loadedFormatting[formatAttributeName];
                    if (formatValue && setFormattingToListItem(writer, listItem, listItemFormatAttributeName, formatValue)) {
                        returnValue = true;
                    } else if (!formatValue && removeFormattingFromListItem(writer, listItem, listItemFormatAttributeName)) {
                        returnValue = true;
                    }
                }
            }
            return returnValue;
        });
    }
    /**
	 * Registers an integration between a default attribute (e.g., `fontFamily`) and a new attribute
	 * intended specifically for list item elements (e.g., `listItemFontFamily`).
	 *
	 * These attributes are later used by the postfixer logic to determine whether to add the new attribute
	 * to the list item element, based on whether there is a consistent default formatting attribute
	 * applied within its content.
	 */ registerFormatAttribute(formatAttribute, listItemFormatAttribute) {
        this._loadedFormatting[formatAttribute] = listItemFormatAttribute;
    }
    /**
	 * Returns true if the given model attribute name is a supported inline formatting attribute.
	 */ _isInlineOrSelectionFormatting(attributeKey) {
        return attributeKey.replace(/^selection:/, '') in this._loadedFormatting;
    }
}
/**
 * Returns the consistent format of the list item element.
 * If the list item contains multiple blocks, it checks only the first block.
 */ function getListItemConsistentFormat(model, listItem, attributeKeys) {
    if (isFirstBlockOfListItem(listItem)) {
        return getSingleListItemConsistentFormat(model, listItem, attributeKeys);
    }
    // Always the first block of the list item should be checked for consistent formatting.
    const listItemBlocks = getAllListItemBlocks(listItem);
    return getSingleListItemConsistentFormat(model, listItemBlocks[0], attributeKeys);
}
/**
 * Returns the consistent format of a single list item element.
 */ function getSingleListItemConsistentFormat(model, listItem, attributeKeys) {
    // Only bulleted and numbered lists can have formatting (to-do lists are not supported).
    // Do not check internals of limit elements (for example, do not check table cells).
    if (!isNumberedOrBulletedList(listItem) || model.schema.isLimit(listItem)) {
        return Object.fromEntries(attributeKeys.map((attributeKey)=>[
                attributeKey
            ]));
    }
    if (listItem.isEmpty) {
        return Object.fromEntries(attributeKeys.map((attributeKey)=>[
                attributeKey,
                listItem.getAttribute(`selection:${attributeKey}`)
            ]));
    }
    const attributesToCheck = new Set(attributeKeys);
    const valuesMap = {};
    const range = model.createRangeIn(listItem);
    const walker = range.getWalker({
        ignoreElementEnd: true
    });
    for (const { item } of walker){
        for (const attributeKey of attributesToCheck){
            if (model.schema.checkAttribute(item, attributeKey)) {
                const formatAttribute = item.getAttribute(attributeKey);
                if (formatAttribute === undefined) {
                    attributesToCheck.delete(attributeKey);
                    valuesMap[attributeKey] = undefined;
                } else if (valuesMap[attributeKey] === undefined) {
                    // First item inside a list item block.
                    valuesMap[attributeKey] = formatAttribute;
                } else if (valuesMap[attributeKey] !== formatAttribute) {
                    // Following items in the same block of a list item.
                    attributesToCheck.delete(attributeKey);
                    valuesMap[attributeKey] = undefined;
                }
            } else if (!(attributeKey in valuesMap)) {
                // Store it so a format would be removed when all items in the given list item does not allow that formatting.
                valuesMap[attributeKey] = undefined;
            }
        }
        // End early if all attributes have been checked and are inconsistent.
        if (!attributesToCheck.size) {
            break;
        }
        // Jump over inline limit elements as we expect only outside them to be the same formatting.
        if (model.schema.isLimit(item)) {
            walker.jumpTo(model.createPositionAfter(item));
        }
    }
    return valuesMap;
}
/**
 * Adds the specified formatting attribute to the list item element.
 */ function setFormattingToListItem(writer, listItem, attributeKey, attributeValue) {
    // Multi-block items should have consistent formatting.
    const listItemBlocks = getAllListItemBlocks(listItem);
    let wasChanged = false;
    for (const listItem of listItemBlocks){
        if (!listItem.hasAttribute(attributeKey) || listItem.getAttribute(attributeKey) !== attributeValue) {
            writer.setAttribute(attributeKey, attributeValue, listItem);
            wasChanged = true;
        }
    }
    return wasChanged;
}
/**
 * Removes the specified formatting attribute from the list item element.
 */ function removeFormattingFromListItem(writer, listItem, attributeKey) {
    // Multi-block items should have consistent formatting.
    const listItemBlocks = getAllListItemBlocks(listItem);
    let wasChanged = false;
    for (const listItem of listItemBlocks){
        if (listItem.hasAttribute(attributeKey)) {
            writer.removeAttribute(attributeKey, listItem);
            wasChanged = true;
        }
    }
    return wasChanged;
}
/**
 * Checks if the given list type is a numbered or bulleted list.
 */ function isNumberedOrBulletedList(listItem) {
    return [
        'numbered',
        'bulleted',
        'customNumbered',
        'customBulleted'
    ].includes(listItem.getAttribute('listType'));
}

/**
 * A set of helpers related to document lists.
 */ class ListUtils extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ListUtils';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * Expands the given list of selected blocks to include all the items of the lists they're in.
	 *
	 * @param blocks The list of selected blocks.
	 */ expandListBlocksToCompleteList(blocks) {
        return expandListBlocksToCompleteList(blocks);
    }
    /**
	 * Check if the given block is the first in the list item.
	 *
	 * @param listBlock The list block element.
	 */ isFirstBlockOfListItem(listBlock) {
        return isFirstBlockOfListItem(listBlock);
    }
    /**
	 * Returns true if the given model node is a list item block.
	 *
	 * @param node A model node.
	 */ isListItemBlock(node) {
        return isListItemBlock(node);
    }
    /**
	 * Expands the given list of selected blocks to include the leading and tailing blocks of partially selected list items.
	 *
	 * @param blocks The list of selected blocks.
	 * @param options.withNested Whether should include nested list items.
	 */ expandListBlocksToCompleteItems(blocks, options = {}) {
        return expandListBlocksToCompleteItems(blocks, options);
    }
    /**
	 * Returns true if listType is of type `numbered` or `customNumbered`.
	 */ isNumberedListType(listType) {
        return isNumberedListType(listType);
    }
    /**
	 * Returns true if the given list item is the first item in the list.
	 */ isFirstListItemInList(listItem) {
        return isFirstListItemInList(listItem);
    }
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */ /**
 * @module list/list/utils/view
 */ /**
 * Checks if view element is a list type (ul or ol).
 *
 * @internal
 */ function isListView(viewElement) {
    return viewElement.is('element', 'ol') || viewElement.is('element', 'ul');
}
/**
 * Checks if view element is a list item (li).
 *
 * @internal
 */ function isListItemView(viewElement) {
    return viewElement.is('element', 'li');
}
/**
 * Calculates the indent value for a list item. Handles HTML compliant and non-compliant lists.
 *
 * Also, fixes non HTML compliant lists indents:
 *
 * ```
 * before:                                     fixed list:
 * OL                                          OL
 * |-> LI (parent LIs: 0)                      |-> LI     (indent: 0)
 *     |-> OL                                  |-> OL
 *         |-> OL                                  |
 *         |   |-> OL                              |
 *         |       |-> OL                          |
 *         |           |-> LI (parent LIs: 1)      |-> LI (indent: 1)
 *         |-> LI (parent LIs: 1)                  |-> LI (indent: 1)
 *
 * before:                                     fixed list:
 * OL                                          OL
 * |-> OL                                      |
 *     |-> OL                                  |
 *          |-> OL                             |
 *              |-> LI (parent LIs: 0)         |-> LI        (indent: 0)
 *
 * before:                                     fixed list:
 * OL                                          OL
 * |-> LI (parent LIs: 0)                      |-> LI         (indent: 0)
 * |-> OL                                          |-> OL
 *     |-> LI (parent LIs: 0)                          |-> LI (indent: 1)
 * ```
 *
 * @internal
 */ function getIndent$1(listItem) {
    let indent = 0;
    let parent = listItem.parent;
    while(parent){
        // Each LI in the tree will result in an increased indent for HTML compliant lists.
        if (isListItemView(parent)) {
            indent++;
        } else {
            // If however the list is nested in other list we should check previous sibling of any of the list elements...
            const previousSibling = parent.previousSibling;
            // ...because the we might need increase its indent:
            //		before:                           fixed list:
            //		OL                                OL
            //		|-> LI (parent LIs: 0)            |-> LI         (indent: 0)
            //		|-> OL                                |-> OL
            //		    |-> LI (parent LIs: 0)                |-> LI (indent: 1)
            if (previousSibling && isListItemView(previousSibling)) {
                indent++;
            }
        }
        parent = parent.parent;
    }
    return indent;
}
/**
 * Creates a list attribute element (ol or ul).
 *
 * @internal
 */ function createListElement(writer, indent, type, id = getViewElementIdForListType(type, indent)) {
    // Negative priorities so that restricted editing attribute won't wrap lists.
    return writer.createAttributeElement(getViewElementNameForListType(type), null, {
        priority: 2 * indent / 100 - 100,
        id
    });
}
/**
 * Creates a list item attribute element (li).
 *
 * @internal
 */ function createListItemElement(writer, indent, id) {
    // Negative priorities so that restricted editing attribute won't wrap list items.
    return writer.createAttributeElement('li', null, {
        priority: (2 * indent + 1) / 100 - 100,
        id
    });
}
/**
 * Returns a view element name for the given list type.
 *
 * @internal
 */ function getViewElementNameForListType(type) {
    return type == 'numbered' || type == 'customNumbered' ? 'ol' : 'ul';
}
/**
 * Returns a view element ID for the given list type and indent.
 *
 * @internal
 */ function getViewElementIdForListType(type, indent) {
    return `list-${type}-${indent}`;
}

/**
 * Based on the provided positions looks for the list head and stores it in the provided map.
 *
 * @internal
 * @param position The search starting position.
 * @param itemToListHead The map from list item element to the list head element.
 * @param visited A set of elements that were already visited.
 */ function findAndAddListHeadToMap(position, itemToListHead, visited) {
    const previousNode = position.nodeBefore;
    if (!isListItemBlock(previousNode)) {
        const item = position.nodeAfter;
        if (isListItemBlock(item)) {
            itemToListHead.add(item);
        }
    } else {
        let listHead = previousNode;
        // Previously, the loop below was defined like this:
        //
        // 		for ( { node: listHead } of new SiblingListBlocksIterator( listHead, 'backward' ) )
        //
        // Unfortunately, such a destructuring is incorrectly transpiled by Babel and the loop never ends.
        // See: https://github.com/ckeditor/ckeditor5-react/issues/345.
        for (const { node } of new SiblingListBlocksIterator(listHead, 'backward')){
            listHead = node;
            if (visited.has(listHead)) {
                return;
            }
            visited.add(listHead);
            if (itemToListHead.has(previousNode)) {
                return;
            }
        }
        itemToListHead.add(listHead);
    }
}
/**
 * Scans the list starting from the given list head element and fixes items' indentation.
 *
 * @internal
 * @param listNodes The iterable of list nodes.
 * @param writer The model writer.
 * @returns Whether the model was modified.
 */ function fixListIndents(listNodes, writer) {
    let maxIndent = 0; // Guards local sublist max indents that need fixing.
    let prevIndent = -1; // Previous item indent.
    let fixBy = null;
    let applied = false;
    for (const { node } of listNodes){
        const itemIndent = node.getAttribute('listIndent');
        if (itemIndent > maxIndent) {
            let newIndent;
            if (fixBy === null) {
                fixBy = itemIndent - maxIndent;
                newIndent = maxIndent;
            } else {
                if (fixBy > itemIndent) {
                    fixBy = itemIndent;
                }
                newIndent = itemIndent - fixBy;
            }
            if (newIndent > prevIndent + 1) {
                newIndent = prevIndent + 1;
            }
            writer.setAttribute('listIndent', newIndent, node);
            applied = true;
            prevIndent = newIndent;
        } else {
            fixBy = null;
            maxIndent = itemIndent + 1;
            prevIndent = itemIndent;
        }
    }
    return applied;
}
/**
 * Scans the list starting from the given list head element and fixes items' types.
 *
 * @internal
 * @param listNodes The iterable of list nodes.
 * @param seenIds The set of already known IDs.
 * @param writer The model writer.
 * @returns Whether the model was modified.
 */ function fixListItemIds(listNodes, seenIds, writer) {
    const visited = new Set();
    let applied = false;
    for (const { node } of listNodes){
        if (visited.has(node)) {
            continue;
        }
        let listType = node.getAttribute('listType');
        let listItemId = node.getAttribute('listItemId');
        // Use a new ID if this one was spot earlier (even in other list).
        if (seenIds.has(listItemId)) {
            listItemId = ListItemUid.next();
        }
        seenIds.add(listItemId);
        // Make sure that all items in a simple list have unique IDs.
        if (node.is('element', 'listItem')) {
            if (node.getAttribute('listItemId') != listItemId) {
                writer.setAttribute('listItemId', listItemId, node);
                applied = true;
            }
            continue;
        }
        for (const block of getListItemBlocks(node, {
            direction: 'forward'
        })){
            visited.add(block);
            // Use a new ID if a block of a bigger list item has different type.
            if (block.getAttribute('listType') != listType) {
                listItemId = ListItemUid.next();
                listType = block.getAttribute('listType');
            }
            if (block.getAttribute('listItemId') != listItemId) {
                writer.setAttribute('listItemId', listItemId, block);
                applied = true;
            }
        }
    }
    return applied;
}

/**
 * Returns the upcast converter for list items. It's supposed to work after the block converters (content inside list items) are converted.
 *
 * @internal
 */ function listItemUpcastConverter() {
    return (evt, data, conversionApi)=>{
        const { writer, schema } = conversionApi;
        if (!data.modelRange) {
            return;
        }
        const items = Array.from(data.modelRange.getItems({
            shallow: true
        })).filter((item)=>schema.checkAttribute(item, 'listItemId'));
        if (!items.length) {
            return;
        }
        const listItemId = data.viewItem.getAttribute('data-list-item-id') || ListItemUid.next();
        conversionApi.consumable.consume(data.viewItem, {
            attributes: 'data-list-item-id'
        });
        const listIndent = getIndent$1(data.viewItem);
        let listType = data.viewItem.parent && data.viewItem.parent.is('element', 'ol') ? 'numbered' : 'bulleted';
        // Preserve list type if was already set (for example by to-do list feature).
        const firstItemListType = items[0].getAttribute('listType');
        if (firstItemListType) {
            listType = firstItemListType;
        }
        const attributes = {
            listItemId,
            listIndent,
            listType
        };
        for (const item of items){
            // Set list attributes only on same level items, those nested deeper are already handled by the recursive conversion.
            if (!item.hasAttribute('listItemId')) {
                writer.setAttributes(attributes, item);
            }
        }
        if (items.length > 1) {
            // Make sure that list item that contain only nested list will preserve paragraph for itself:
            //	<ul>
            //		<li>
            //			<p></p>  <-- this one must be kept
            //			<ul>
            //				<li></li>
            //			</ul>
            //		</li>
            //	</ul>
            if (items[1].getAttribute('listItemId') != attributes.listItemId) {
                conversionApi.keepEmptyElement(items[0]);
            }
        }
    };
}
/**
 * Returns a model document change:data event listener that triggers conversion of related items if needed.
 *
 * @internal
 * @param model The editor model.
 * @param editing The editing controller.
 * @param attributeNames The list of all model list attributes (including registered strategies).
 * @param listEditing The document list editing plugin.
 */ function reconvertItemsOnDataChange(model, editing, attributeNames, listEditing) {
    return ()=>{
        const changes = model.document.differ.getChanges();
        const itemsToRefresh = [];
        const itemToListHead = new Set();
        const changedItems = new Set();
        const visited = new Set();
        for (const entry of changes){
            if (entry.type == 'insert' && entry.name != '$text') {
                findAndAddListHeadToMap(entry.position, itemToListHead, visited);
                // Insert of a non-list item.
                if (!entry.attributes.has('listItemId')) {
                    findAndAddListHeadToMap(entry.position.getShiftedBy(entry.length), itemToListHead, visited);
                } else {
                    changedItems.add(entry.position.nodeAfter);
                }
            } else if (entry.type == 'remove' && entry.attributes.has('listItemId')) {
                findAndAddListHeadToMap(entry.position, itemToListHead, visited);
            } else if (entry.type == 'attribute') {
                const item = entry.range.start.nodeAfter;
                if (attributeNames.includes(entry.attributeKey)) {
                    findAndAddListHeadToMap(entry.range.start, itemToListHead, visited);
                    if (entry.attributeNewValue === null) {
                        findAndAddListHeadToMap(entry.range.start.getShiftedBy(1), itemToListHead, visited);
                        // Check if paragraph should be converted from bogus to plain paragraph.
                        if (doesItemBlockRequiresRefresh(item)) {
                            itemsToRefresh.push(item);
                        }
                    } else {
                        changedItems.add(item);
                    }
                } else if (isListItemBlock(item)) {
                    // Some other attribute was changed on the list item,
                    // check if paragraph does not need to be converted to bogus or back.
                    if (doesItemBlockRequiresRefresh(item)) {
                        itemsToRefresh.push(item);
                    }
                }
            }
        }
        for (const listHead of itemToListHead.values()){
            itemsToRefresh.push(...collectListItemsToRefresh(listHead, changedItems));
        }
        for (const item of new Set(itemsToRefresh)){
            editing.reconvertItem(item);
        }
    };
    function collectListItemsToRefresh(listHead, changedItems) {
        const itemsToRefresh = [];
        const visited = new Set();
        const stack = [];
        for (const { node, previous } of new SiblingListBlocksIterator(listHead)){
            if (visited.has(node)) {
                continue;
            }
            const itemIndent = node.getAttribute('listIndent');
            // Current node is at the lower indent so trim the stack.
            if (previous && itemIndent < previous.getAttribute('listIndent')) {
                stack.length = itemIndent + 1;
            }
            // Update the stack for the current indent level.
            stack[itemIndent] = {
                modelAttributes: Object.fromEntries(Array.from(node.getAttributes()).filter(([key])=>attributeNames.includes(key))),
                modelElement: node
            };
            // Find all blocks of the current node.
            const blocks = getListItemBlocks(node, {
                direction: 'forward'
            });
            for (const block of blocks){
                visited.add(block);
                // Check if bogus vs plain paragraph needs refresh.
                if (doesItemBlockRequiresRefresh(block, blocks)) {
                    itemsToRefresh.push(block);
                } else if (doesItemWrappingRequiresRefresh(block, stack, changedItems)) {
                    itemsToRefresh.push(block);
                }
            }
        }
        return itemsToRefresh;
    }
    function doesItemBlockRequiresRefresh(item, blocks) {
        const viewElement = editing.mapper.toViewElement(item);
        if (!viewElement) {
            return false;
        }
        if (isItemBlockInsideStructureSlot(viewElement)) {
            return true;
        }
        const needsRefresh = listEditing.fire('checkElement', {
            modelElement: item,
            viewElement
        });
        if (needsRefresh) {
            return true;
        }
        if (!item.is('element', 'paragraph') && !item.is('element', 'listItem')) {
            return false;
        }
        const useBogus = shouldUseBogusParagraph(item, attributeNames, blocks);
        if (useBogus && viewElement.is('element', 'p')) {
            return true;
        } else if (!useBogus && viewElement.is('element', 'span')) {
            return true;
        }
        return false;
    }
    function isItemBlockInsideStructureSlot(viewElement) {
        viewElement = viewElement.parent;
        while(viewElement.is('attributeElement') && [
            'ol',
            'ul',
            'li'
        ].includes(viewElement.name)){
            viewElement = viewElement.parent;
        }
        // List item inside elementToStructure slot parent without mapping then it requires refresh for correct positions
        // as structure child elements does not have mapping from model and position would land in wrong place.
        if (viewElement.getCustomProperty('$structureSlotParent') && !editing.mapper.toModelElement(viewElement)) {
            return true;
        }
        return false;
    }
    function doesItemWrappingRequiresRefresh(item, stack, changedItems) {
        // Items directly affected by some "change" don't need a refresh, they will be converted by their own changes.
        if (changedItems.has(item)) {
            return false;
        }
        const viewElement = editing.mapper.toViewElement(item);
        let indent = stack.length - 1;
        // Traverse down the stack to the root to verify if all ULs, OLs, and LIs are as expected.
        for(let element = viewElement.parent; !element.is('editableElement'); element = element.parent){
            const isListItemElement = isListItemView(element);
            const isListElement = isListView(element);
            if (!isListElement && !isListItemElement) {
                continue;
            }
            const eventName = `checkAttributes:${isListItemElement ? 'item' : 'list'}`;
            const needsRefresh = listEditing.fire(eventName, {
                viewElement: element,
                modelAttributes: stack[indent].modelAttributes,
                modelReferenceElement: stack[indent].modelElement
            });
            if (needsRefresh) {
                break;
            }
            if (isListElement) {
                indent--;
                // Don't need to iterate further if we already know that the item is wrapped appropriately.
                if (indent < 0) {
                    return false;
                }
            }
        }
        return true;
    }
}
/**
 * Returns the list item downcast converter.
 *
 * @internal
 * @param attributeNames A list of attribute names that should be converted if they are set.
 * @param strategies The strategies.
 * @param model The model.
 */ function listItemDowncastConverter(attributeNames, strategies, model, { dataPipeline } = {}) {
    const consumer = createAttributesConsumer(attributeNames, strategies);
    return (evt, data, conversionApi)=>{
        const { writer, mapper, consumable } = conversionApi;
        const listItem = data.item;
        if (!attributeNames.includes(data.attributeKey)) {
            return;
        }
        // Test if attributes on the converted items are not consumed.
        if (!consumer(listItem, consumable)) {
            return;
        }
        const options = {
            ...conversionApi.options,
            dataPipeline
        };
        // Use positions mapping instead of mapper.toViewElement( listItem ) to find outermost view element.
        // This is for cases when mapping is using inner view element like in the code blocks (pre > code).
        const viewElement = findMappedViewElement(listItem, mapper, model, writer);
        // Remove custom item marker.
        removeCustomMarkerElements(viewElement, writer, mapper);
        // Unwrap element from current list wrappers.
        unwrapListItemBlock(viewElement, writer);
        // Insert custom item marker.
        const viewRange = insertCustomMarkerElements(listItem, viewElement, strategies, writer, options);
        // Then wrap them with the new list wrappers (UL, OL, LI).
        wrapListItemBlock(listItem, viewRange, strategies, writer, options);
    };
}
/**
 * The 'remove' downcast converter for custom markers.
 *
 * @internal
 */ function listItemDowncastRemoveConverter(schema) {
    return (evt, data, conversionApi)=>{
        const { writer, mapper } = conversionApi;
        const elementName = evt.name.split(':')[1];
        // Do not remove marker if the deleted element is some inline object inside paragraph.
        // See https://github.com/ckeditor/ckeditor5-internal/issues/3680.
        if (!schema.checkAttribute(elementName, 'listItemId')) {
            return;
        }
        // Find the view range start position by mapping the model position at which the remove happened.
        const viewStart = mapper.toViewPosition(data.position);
        const modelEnd = data.position.getShiftedBy(data.length);
        const viewEnd = mapper.toViewPosition(modelEnd, {
            isPhantom: true
        });
        // Trim the range to remove in case some UI elements are on the view range boundaries.
        const viewRange = writer.createRange(viewStart, viewEnd).getTrimmed();
        // Use positions mapping instead of mapper.toViewElement( listItem ) to find outermost view element.
        // This is for cases when mapping is using inner view element like in the code blocks (pre > code).
        const viewElement = viewRange.end.nodeBefore;
        /* istanbul ignore next -- @preserve */ if (!viewElement) {
            return;
        }
        // Remove custom item marker.
        removeCustomMarkerElements(viewElement, writer, mapper);
    };
}
/**
 * Returns the bogus paragraph view element creator. A bogus paragraph is used if a list item contains only a single block or nested list.
 *
 * @internal
 * @param attributeNames The list of all model list attributes (including registered strategies).
 */ function bogusParagraphCreator(attributeNames, { dataPipeline } = {}) {
    return (modelElement, { writer })=>{
        // Convert only if a bogus paragraph should be used.
        if (!shouldUseBogusParagraph(modelElement, attributeNames)) {
            return null;
        }
        if (!dataPipeline) {
            return writer.createContainerElement('span', {
                class: 'ck-list-bogus-paragraph'
            });
        }
        // Using `<p>` in case there are some markers on it and transparentRendering will render it anyway.
        const viewElement = writer.createContainerElement('p');
        writer.setCustomProperty('dataPipeline:transparentRendering', true, viewElement);
        return viewElement;
    };
}
/**
 * Helper for mapping mode to view elements. It's using positions mapping instead of mapper.toViewElement( element )
 * to find outermost view element. This is for cases when mapping is using inner view element like in the code blocks (pre > code).
 *
 * @internal
 * @param element The model element.
 * @param mapper The mapper instance.
 * @param model The model.
 * @param writer The view downcast writer.
 */ function findMappedViewElement(element, mapper, model, writer) {
    const modelRange = model.createRangeOn(element);
    const viewRange = mapper.toViewRange(modelRange).getTrimmed();
    const viewWalker = viewRange.getWalker();
    for (const { item } of viewWalker){
        if (item.is('element') && item.getCustomProperty('listItemMarker')) {
            viewWalker.jumpTo(writer.createPositionAfter(item));
        } else if (item.is('element') && !item.getCustomProperty('listItemWrapper')) {
            return item;
        }
    }
}
/**
 * The model to view custom position mapping for cases when marker is injected at the beginning of a block.
 *
 * @internal
 */ function createModelToViewPositionMapper(strategies, view) {
    return (evt, data)=>{
        if (data.modelPosition.offset > 0) {
            return;
        }
        const positionParent = data.modelPosition.parent;
        if (!isListItemBlock(positionParent)) {
            return;
        }
        if (!strategies.some((strategy)=>strategy.scope == 'itemMarker' && strategy.canInjectMarkerIntoElement && strategy.canInjectMarkerIntoElement(positionParent))) {
            return;
        }
        const viewElement = data.mapper.toViewElement(positionParent);
        const viewRange = view.createRangeIn(viewElement);
        const viewWalker = viewRange.getWalker();
        let positionAfterLastMarker = viewRange.start;
        for (const { item } of viewWalker){
            // Walk only over the non-mapped elements (UIElements, ViewAttributeElements, $text, or any other element without mapping).
            if (item.is('element') && data.mapper.toModelElement(item) || item.is('$textProxy')) {
                break;
            }
            if (item.is('element') && item.getCustomProperty('listItemMarker')) {
                positionAfterLastMarker = view.createPositionAfter(item);
                // Jump over the content of the marker (this is not needed for UIElement but required for other element types).
                viewWalker.skip(({ previousPosition })=>!previousPosition.isEqual(positionAfterLastMarker));
            }
        }
        data.viewPosition = positionAfterLastMarker;
    };
}
/**
 * Removes a custom marker elements and item wrappers related to that marker.
 */ function removeCustomMarkerElements(viewElement, viewWriter, mapper) {
    // Remove item wrapper.
    while(viewElement.parent.is('attributeElement') && viewElement.parent.getCustomProperty('listItemWrapper')){
        viewWriter.unwrap(viewWriter.createRangeOn(viewElement), viewElement.parent);
    }
    // Remove custom item markers.
    const markersToRemove = [];
    // Markers before a block.
    collectMarkersToRemove(viewWriter.createPositionBefore(viewElement).getWalker({
        direction: 'backward'
    }));
    // Markers inside a block.
    collectMarkersToRemove(viewWriter.createRangeIn(viewElement).getWalker());
    for (const marker of markersToRemove){
        viewWriter.remove(marker);
    }
    function collectMarkersToRemove(viewWalker) {
        for (const { item } of viewWalker){
            // Walk only over the non-mapped elements (UIElements, ViewAttributeElements, $text, or any other element without mapping).
            if (item.is('element') && mapper.toModelElement(item)) {
                break;
            }
            if (item.is('element') && item.getCustomProperty('listItemMarker')) {
                markersToRemove.push(item);
            }
        }
    }
}
/**
 * Inserts a custom marker elements and wraps first block of a list item if marker requires it.
 */ function insertCustomMarkerElements(listItem, viewElement, strategies, writer, { dataPipeline }) {
    let viewRange = writer.createRangeOn(viewElement);
    // Marker can be inserted only before the first block of a list item.
    if (!isFirstBlockOfListItem(listItem)) {
        return viewRange;
    }
    for (const strategy of strategies){
        if (strategy.scope != 'itemMarker') {
            continue;
        }
        // Create the custom marker element and inject it before the first block of the list item.
        const markerElement = strategy.createElement(writer, listItem, {
            dataPipeline
        });
        if (!markerElement) {
            continue;
        }
        writer.setCustomProperty('listItemMarker', true, markerElement);
        if (strategy.canInjectMarkerIntoElement && strategy.canInjectMarkerIntoElement(listItem)) {
            writer.insert(writer.createPositionAt(viewElement, 0), markerElement);
        } else {
            writer.insert(viewRange.start, markerElement);
            viewRange = writer.createRange(writer.createPositionBefore(markerElement), writer.createPositionAfter(viewElement));
        }
        // Wrap the marker and optionally the first block with an attribute element (label for to-do lists).
        if (!strategy.createWrapperElement || !strategy.canWrapElement) {
            continue;
        }
        const wrapper = strategy.createWrapperElement(writer, listItem, {
            dataPipeline
        });
        writer.setCustomProperty('listItemWrapper', true, wrapper);
        // The whole block can be wrapped...
        if (strategy.canWrapElement(listItem)) {
            viewRange = writer.wrap(viewRange, wrapper);
        } else {
            // ... or only the marker element (if the block is downcasted to heading or block widget).
            viewRange = writer.wrap(writer.createRangeOn(markerElement), wrapper);
            viewRange = writer.createRange(viewRange.start, writer.createPositionAfter(viewElement));
        }
    }
    return viewRange;
}
/**
 * Unwraps all ol, ul, and li attribute elements that are wrapping the provided view element.
 */ function unwrapListItemBlock(viewElement, viewWriter) {
    let attributeElement = viewElement.parent;
    while(attributeElement.is('attributeElement') && [
        'ul',
        'ol',
        'li'
    ].includes(attributeElement.name)){
        const parentElement = attributeElement.parent;
        viewWriter.unwrap(viewWriter.createRangeOn(viewElement), attributeElement);
        attributeElement = parentElement;
    }
}
/**
 * Wraps the given list item with appropriate attribute elements for ul, ol, and li.
 */ function wrapListItemBlock(listItem, viewRange, strategies, writer, options) {
    if (!listItem.hasAttribute('listIndent')) {
        return;
    }
    const listItemIndent = listItem.getAttribute('listIndent');
    let currentListItem = listItem;
    for(let indent = listItemIndent; indent >= 0; indent--){
        const listItemViewElement = createListItemElement(writer, indent, currentListItem.getAttribute('listItemId'));
        const listViewElement = createListElement(writer, indent, currentListItem.getAttribute('listType'));
        for (const strategy of strategies){
            if ((strategy.scope == 'list' || strategy.scope == 'item') && currentListItem.hasAttribute(strategy.attributeName)) {
                strategy.setAttributeOnDowncast(writer, currentListItem.getAttribute(strategy.attributeName), strategy.scope == 'list' ? listViewElement : listItemViewElement, options, currentListItem);
            }
        }
        viewRange = writer.wrap(viewRange, listItemViewElement);
        viewRange = writer.wrap(viewRange, listViewElement);
        if (indent == 0) {
            break;
        }
        currentListItem = ListWalker.first(currentListItem, {
            lowerIndent: true
        });
        // There is no list item with lower indent, this means this is a document fragment containing
        // only a part of nested list (like copy to clipboard) so we don't need to try to wrap it further.
        if (!currentListItem) {
            break;
        }
    }
}
// Returns the function that is responsible for consuming attributes that are set on the model node.
function createAttributesConsumer(attributeNames, strategies) {
    const nonConsumingAttributes = strategies.filter((strategy)=>strategy.consume === false).map((strategy)=>strategy.attributeName);
    return (node, consumable)=>{
        const events = [];
        // Collect all set attributes that are triggering conversion.
        for (const attributeName of attributeNames){
            if (node.hasAttribute(attributeName) && !nonConsumingAttributes.includes(attributeName)) {
                events.push(`attribute:${attributeName}`);
            }
        }
        if (!events.every((event)=>consumable.test(node, event) !== false)) {
            return false;
        }
        events.forEach((event)=>consumable.consume(node, event));
        return true;
    };
}
// Whether the given item should be rendered as a bogus paragraph.
function shouldUseBogusParagraph(item, attributeNames, blocks = getAllListItemBlocks(item)) {
    if (!isListItemBlock(item)) {
        return false;
    }
    for (const attributeKey of item.getAttributeKeys()){
        // Ignore selection attributes stored on block elements.
        if (attributeKey.startsWith('selection:') || attributeKey == 'htmlEmptyBlock') {
            continue;
        }
        // Don't use bogus paragraph if there are attributes from other features.
        if (!attributeNames.includes(attributeKey)) {
            return false;
        }
    }
    return blocks.length < 2;
}

/**
 * A list of base list model attributes.
 */ const LIST_BASE_ATTRIBUTES = [
    'listType',
    'listIndent',
    'listItemId'
];
/**
 * The editing part of the document-list feature. It handles creating, editing and removing lists and list items.
 */ class ListEditing extends Plugin {
    /**
	 * The list of registered downcast strategies.
	 */ _downcastStrategies = [];
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ListEditing';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            Enter,
            Delete,
            ListUtils,
            ClipboardPipeline,
            ListFormatting
        ];
    }
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        editor.config.define('list.multiBlock', true);
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const model = editor.model;
        const multiBlock = editor.config.get('list.multiBlock');
        if (editor.plugins.has('LegacyListEditing')) {
            /**
			 * The `List` feature cannot be loaded together with the `LegacyList` plugin.
			 *
			 * @error list-feature-conflict
			 * @param {string} conflictPlugin Name of the plugin.
			 */ throw new CKEditorError('list-feature-conflict', this, {
                conflictPlugin: 'LegacyListEditing'
            });
        }
        model.schema.register('$listItem', {
            allowAttributes: LIST_BASE_ATTRIBUTES
        });
        if (multiBlock) {
            model.schema.extend('$container', {
                allowAttributesOf: '$listItem'
            });
            model.schema.extend('$block', {
                allowAttributesOf: '$listItem'
            });
            model.schema.extend('$blockObject', {
                allowAttributesOf: '$listItem'
            });
        } else {
            model.schema.register('listItem', {
                inheritAllFrom: '$block',
                allowAttributesOf: '$listItem'
            });
        }
        for (const attribute of LIST_BASE_ATTRIBUTES){
            model.schema.setAttributeProperties(attribute, {
                copyOnReplace: true
            });
        }
        // Register commands.
        editor.commands.add('numberedList', new ListCommand(editor, 'numbered'));
        editor.commands.add('bulletedList', new ListCommand(editor, 'bulleted'));
        editor.commands.add('customNumberedList', new ListCommand(editor, 'customNumbered', {
            multiLevel: true
        }));
        editor.commands.add('customBulletedList', new ListCommand(editor, 'customBulleted', {
            multiLevel: true
        }));
        editor.commands.add('indentList', new ListIndentCommand(editor, 'forward'));
        editor.commands.add('outdentList', new ListIndentCommand(editor, 'backward'));
        editor.commands.add('splitListItemBefore', new ListSplitCommand(editor, 'before'));
        editor.commands.add('splitListItemAfter', new ListSplitCommand(editor, 'after'));
        if (multiBlock) {
            editor.commands.add('mergeListItemBackward', new ListMergeCommand(editor, 'backward'));
            editor.commands.add('mergeListItemForward', new ListMergeCommand(editor, 'forward'));
        }
        this._setupDeleteIntegration();
        this._setupEnterIntegration();
        this._setupTabIntegration();
        this._setupClipboardIntegration();
        this._setupAccessibilityIntegration();
        this._setupListItemIdConversionStrategy();
    }
    /**
	 * @inheritDoc
	 */ afterInit() {
        const editor = this.editor;
        const commands = editor.commands;
        const indent = commands.get('indent');
        const outdent = commands.get('outdent');
        if (indent) {
            // Priority is high due to integration with `IndentBlock` plugin. We want to indent list first and if it's not possible
            // user can indent content with `IndentBlock` plugin.
            indent.registerChildCommand(commands.get('indentList'), {
                priority: 'high'
            });
        }
        if (outdent) {
            // Priority is lowest due to integration with `IndentBlock` and `IndentCode` plugins.
            // First we want to allow user to outdent all indendations from other features then he can oudent list item.
            outdent.registerChildCommand(commands.get('outdentList'), {
                priority: 'lowest'
            });
        }
        // Register conversion and model post-fixer after other plugins had a chance to register their attribute strategies.
        this._setupModelPostFixing();
        this._setupConversion();
    }
    /**
	 * Registers a downcast strategy.
	 *
	 * **Note**: Strategies must be registered in the `Plugin#init()` phase so that it can be applied
	 * in the `ListEditing#afterInit()`.
	 *
	 * @param strategy The downcast strategy to register.
	 */ registerDowncastStrategy(strategy) {
        this._downcastStrategies.push(strategy);
    }
    /**
	 * Returns list of model attribute names that should affect downcast conversion.
	 */ getListAttributeNames() {
        return [
            ...LIST_BASE_ATTRIBUTES,
            ...this._downcastStrategies.map((strategy)=>strategy.attributeName)
        ];
    }
    /**
	 * Attaches the listener to the {@link module:engine/view/document~ViewDocument#event:delete} event and handles backspace/delete
	 * keys in and around document lists.
	 */ _setupDeleteIntegration() {
        const editor = this.editor;
        const mergeBackwardCommand = editor.commands.get('mergeListItemBackward');
        const mergeForwardCommand = editor.commands.get('mergeListItemForward');
        this.listenTo(editor.editing.view.document, 'delete', (evt, data)=>{
            const selection = editor.model.document.selection;
            // Let the Widget plugin take care of block widgets while deleting (https://github.com/ckeditor/ckeditor5/issues/11346).
            if (getSelectedBlockObject(editor.model)) {
                return;
            }
            editor.model.change(()=>{
                const firstPosition = selection.getFirstPosition();
                if (selection.isCollapsed && data.direction == 'backward') {
                    if (!firstPosition.isAtStart) {
                        return;
                    }
                    const positionParent = firstPosition.parent;
                    if (!isListItemBlock(positionParent)) {
                        return;
                    }
                    const previousBlock = ListWalker.first(positionParent, {
                        sameAttributes: 'listType',
                        sameIndent: true
                    });
                    // Outdent the first block of a first list item.
                    if (!previousBlock && positionParent.getAttribute('listIndent') === 0) {
                        if (!isLastBlockOfListItem(positionParent)) {
                            editor.execute('splitListItemAfter');
                        }
                        editor.execute('outdentList');
                    } else {
                        if (!mergeBackwardCommand || !mergeBackwardCommand.isEnabled) {
                            return;
                        }
                        mergeBackwardCommand.execute({
                            shouldMergeOnBlocksContentLevel: shouldMergeOnBlocksContentLevel(editor.model, 'backward')
                        });
                    }
                    data.preventDefault();
                    evt.stop();
                } else {
                    // Collapsed selection should trigger forward merging only if at the end of a block.
                    if (selection.isCollapsed && !selection.getLastPosition().isAtEnd) {
                        return;
                    }
                    if (!mergeForwardCommand || !mergeForwardCommand.isEnabled) {
                        return;
                    }
                    mergeForwardCommand.execute({
                        shouldMergeOnBlocksContentLevel: shouldMergeOnBlocksContentLevel(editor.model, 'forward')
                    });
                    data.preventDefault();
                    evt.stop();
                }
            });
        }, {
            context: 'li'
        });
    }
    /**
	 * Attaches a listener to the {@link module:engine/view/document~ViewDocument#event:enter} event and handles enter key press
	 * in document lists.
	 */ _setupEnterIntegration() {
        const editor = this.editor;
        const model = editor.model;
        const commands = editor.commands;
        const enterCommand = commands.get('enter');
        // Overwrite the default Enter key behavior: outdent or split the list in certain cases.
        this.listenTo(editor.editing.view.document, 'enter', (evt, data)=>{
            const doc = model.document;
            const positionParent = doc.selection.getFirstPosition().parent;
            if (doc.selection.isCollapsed && isListItemBlock(positionParent) && positionParent.isEmpty && !data.isSoft) {
                const isFirstBlock = isFirstBlockOfListItem(positionParent);
                const isLastBlock = isLastBlockOfListItem(positionParent);
                // * a      →      * a
                // * []     →      []
                if (isFirstBlock && isLastBlock) {
                    editor.execute('outdentList');
                    data.preventDefault();
                    evt.stop();
                } else if (isFirstBlock && !isLastBlock) {
                    editor.execute('splitListItemAfter');
                    data.preventDefault();
                    evt.stop();
                } else if (isLastBlock) {
                    editor.execute('splitListItemBefore');
                    data.preventDefault();
                    evt.stop();
                }
            }
        }, {
            context: 'li'
        });
        // In some cases, after the default block splitting, we want to modify the new block to become a new list item
        // instead of an additional block in the same list item.
        this.listenTo(enterCommand, 'afterExecute', ()=>{
            const splitCommand = commands.get('splitListItemBefore');
            // The command has not refreshed because the change block related to EnterCommand#execute() is not over yet.
            // Let's keep it up to date and take advantage of ListSplitCommand#isEnabled.
            splitCommand.refresh();
            if (!splitCommand.isEnabled) {
                return;
            }
            const doc = editor.model.document;
            const positionParent = doc.selection.getLastPosition().parent;
            const listItemBlocks = getAllListItemBlocks(positionParent);
            // Keep in mind this split happens after the default enter handler was executed. For instance:
            //
            // │       Initial state       │    After default enter    │   Here in #afterExecute   │
            // ├───────────────────────────┼───────────────────────────┼───────────────────────────┤
            // │          * a[]            │           * a             │           * a             │
            // │                           │             []            │           * []            │
            if (listItemBlocks.length === 2) {
                splitCommand.execute();
            }
        });
    }
    /**
	 * Attaches a listener to the {@link module:engine/view/document~ViewDocument#event:tab} event and handles tab key and tab+shift keys
	 * presses in document lists.
	 */ _setupTabIntegration() {
        const editor = this.editor;
        this.listenTo(editor.editing.view.document, 'tab', (evt, data)=>{
            const commandName = data.shiftKey ? 'outdentList' : 'indentList';
            const command = this.editor.commands.get(commandName);
            if (command.isEnabled) {
                editor.execute(commandName);
                data.stopPropagation();
                data.preventDefault();
                evt.stop();
            }
        }, {
            context: 'li'
        });
    }
    /**
	 * Registers the conversion helpers for the document-list feature.
	 */ _setupConversion() {
        const editor = this.editor;
        const model = editor.model;
        const attributeNames = this.getListAttributeNames();
        const multiBlock = editor.config.get('list.multiBlock');
        const elementName = multiBlock ? 'paragraph' : 'listItem';
        editor.conversion.for('upcast')// Convert <li> to a generic paragraph (or listItem element) so the content of <li> is always inside a block.
        // Setting the listType attribute to let other features (to-do list) know that this is part of a list item.
        // This is also important to properly handle simple lists so that paragraphs inside a list item won't break the list item.
        // <li>  <-- converted to listItem
        //   <p></p> <-- should be also converted to listItem, so it won't split and replace the listItem generated from the above li.
        .elementToElement({
            view: 'li',
            model: (viewElement, { writer })=>writer.createElement(elementName, {
                    listType: ''
                })
        })// Convert paragraph to the list block (without list type defined yet).
        // This is important to properly handle bogus paragraph and to-do lists.
        // Most of the time the bogus paragraph should not appear in the data of to-do list,
        // but if there is any marker or an attribute on the paragraph then the bogus paragraph
        // is preserved in the data, and we need to be able to detect this case.
        .elementToElement({
            view: 'p',
            model: (viewElement, { writer })=>{
                if (viewElement.parent && viewElement.parent.is('element', 'li')) {
                    return writer.createElement(elementName, {
                        listType: ''
                    });
                }
                return null;
            },
            converterPriority: 'high'
        }).add((dispatcher)=>{
            dispatcher.on('element:li', listItemUpcastConverter());
        });
        if (!multiBlock) {
            editor.conversion.for('downcast').elementToElement({
                model: 'listItem',
                view: 'p'
            });
        }
        editor.conversion.for('editingDowncast').elementToElement({
            model: elementName,
            view: bogusParagraphCreator(attributeNames),
            converterPriority: 'high'
        }).add((dispatcher)=>{
            dispatcher.on('attribute', listItemDowncastConverter(attributeNames, this._downcastStrategies, model));
            dispatcher.on('remove', listItemDowncastRemoveConverter(model.schema));
        });
        editor.conversion.for('dataDowncast').elementToElement({
            model: elementName,
            view: bogusParagraphCreator(attributeNames, {
                dataPipeline: true
            }),
            converterPriority: 'high'
        }).add((dispatcher)=>{
            dispatcher.on('attribute', listItemDowncastConverter(attributeNames, this._downcastStrategies, model, {
                dataPipeline: true
            }));
        });
        const modelToViewPositionMapper = createModelToViewPositionMapper(this._downcastStrategies, editor.editing.view);
        editor.editing.mapper.on('modelToViewPosition', modelToViewPositionMapper);
        editor.data.mapper.on('modelToViewPosition', modelToViewPositionMapper);
        this.listenTo(model.document, 'change:data', reconvertItemsOnDataChange(model, editor.editing, attributeNames, this), {
            priority: 'high'
        });
        // For LI verify if an ID of the attribute element is correct.
        this.on('checkAttributes:item', (evt, { viewElement, modelAttributes })=>{
            if (viewElement.id != modelAttributes.listItemId) {
                evt.return = true;
                evt.stop();
            }
        });
        // For UL and OL check if the name and ID of element is correct.
        this.on('checkAttributes:list', (evt, { viewElement, modelAttributes })=>{
            if (viewElement.name != getViewElementNameForListType(modelAttributes.listType) || viewElement.id != getViewElementIdForListType(modelAttributes.listType, modelAttributes.listIndent)) {
                evt.return = true;
                evt.stop();
            }
        });
    }
    /**
	 * Registers model post-fixers.
	 */ _setupModelPostFixing() {
        const model = this.editor.model;
        const attributeNames = this.getListAttributeNames();
        // Register list fixing.
        // First the low level handler.
        model.document.registerPostFixer((writer)=>modelChangePostFixer$1(model, writer, attributeNames, this));
        // Then the callbacks for the specific lists.
        // The indentation fixing must be the first one...
        this.on('postFixer', (evt, { listNodes, writer })=>{
            evt.return = fixListIndents(listNodes, writer) || evt.return;
        }, {
            priority: 'high'
        });
        // ...then the item ids... and after that other fixers that rely on the correct indentation and ids.
        this.on('postFixer', (evt, { listNodes, writer, seenIds })=>{
            evt.return = fixListItemIds(listNodes, seenIds, writer) || evt.return;
        }, {
            priority: 'high'
        });
    }
    /**
	 * Integrates the feature with the clipboard via {@link module:engine/model/model~Model#insertContent} and
	 * {@link module:engine/model/model~Model#getSelectedContent}.
	 */ _setupClipboardIntegration() {
        const model = this.editor.model;
        const clipboardPipeline = this.editor.plugins.get('ClipboardPipeline');
        this.listenTo(model, 'insertContent', createModelIndentPasteFixer(model), {
            priority: 'high'
        });
        // To enhance the UX, the editor should not copy list attributes to the clipboard if the selection
        // started and ended in the same list item.
        //
        // If the selection was enclosed in a single list item, there is a good chance the user did not want it
        // copied as a list item but plain blocks.
        //
        // This avoids pasting orphaned list items instead of paragraphs, for instance, straight into the root.
        //
        //	                       ┌─────────────────────┬───────────────────┐
        //	                       │ Selection           │ Clipboard content │
        //	                       ├─────────────────────┼───────────────────┤
        //	                       │ [* <Widget />]      │ <Widget />        │
        //	                       ├─────────────────────┼───────────────────┤
        //	                       │ [* Foo]             │ Foo               │
        //	                       ├─────────────────────┼───────────────────┤
        //	                       │ * Foo [bar] baz     │ bar               │
        //	                       ├─────────────────────┼───────────────────┤
        //	                       │ * Fo[o              │ o                 │
        //	                       │   ba]r              │ ba                │
        //	                       ├─────────────────────┼───────────────────┤
        //	                       │ * Fo[o              │ * o               │
        //	                       │ * ba]r              │ * ba              │
        //	                       ├─────────────────────┼───────────────────┤
        //	                       │ [* Foo              │ * Foo             │
        //	                       │  * bar]             │ * bar             │
        //	                       └─────────────────────┴───────────────────┘
        //
        // See https://github.com/ckeditor/ckeditor5/issues/11608, https://github.com/ckeditor/ckeditor5/issues/14969
        this.listenTo(clipboardPipeline, 'outputTransformation', (evt, data)=>{
            model.change((writer)=>{
                // Remove last block if it's empty.
                const allContentChildren = Array.from(data.content.getChildren());
                const lastItem = allContentChildren[allContentChildren.length - 1];
                if (allContentChildren.length > 1 && lastItem.is('element') && lastItem.isEmpty) {
                    const contentChildrenExceptLastItem = allContentChildren.slice(0, -1);
                    if (contentChildrenExceptLastItem.every(isListItemBlock)) {
                        writer.remove(lastItem);
                    }
                }
                // Copy/cut only content of a list item (for drag-drop move the whole list item).
                if (data.method == 'copy' || data.method == 'cut') {
                    const allChildren = Array.from(data.content.getChildren());
                    const isSingleListItemSelected = isSingleListItem(allChildren);
                    if (isSingleListItemSelected) {
                        removeListAttributes(allChildren, writer, this.getListAttributeNames());
                    }
                }
            });
        });
    }
    /**
	 * Informs editor accessibility features about keystrokes brought by the plugin.
	 */ _setupAccessibilityIntegration() {
        const editor = this.editor;
        const t = editor.t;
        editor.accessibility.addKeystrokeInfoGroup({
            id: 'list',
            label: t('Keystrokes that can be used in a list'),
            keystrokes: [
                {
                    label: t('Increase list item indent'),
                    keystroke: 'Tab'
                },
                {
                    label: t('Decrease list item indent'),
                    keystroke: 'Shift+Tab'
                }
            ]
        });
    }
    /**
	 * Convert `listItemId` attribute to `data-list-item-id` attribute on the view element in both downcast pipelines.
	 */ _setupListItemIdConversionStrategy() {
        this.registerDowncastStrategy({
            scope: 'item',
            attributeName: 'listItemId',
            setAttributeOnDowncast (writer, attributeValue, viewElement, options) {
                if (options && (options.skipListItemIds || options.isClipboardPipeline)) {
                    return;
                }
                writer.setAttribute('data-list-item-id', attributeValue, viewElement);
            }
        });
    }
}
/**
 * Post-fixer that reacts to changes on document and fixes incorrect model states (invalid `listItemId` and `listIndent` values).
 *
 * In the example below, there is a correct list structure.
 * Then the middle element is removed so the list structure will become incorrect:
 *
 * ```xml
 * <paragraph listType="bulleted" listItemId="a" listIndent=0>Item 1</paragraph>
 * <paragraph listType="bulleted" listItemId="b" listIndent=1>Item 2</paragraph>   <--- this is removed.
 * <paragraph listType="bulleted" listItemId="c" listIndent=2>Item 3</paragraph>
 * ```
 *
 * The list structure after the middle element is removed:
 *
 * ```xml
 * <paragraph listType="bulleted" listItemId="a" listIndent=0>Item 1</paragraph>
 * <paragraph listType="bulleted" listItemId="c" listIndent=2>Item 3</paragraph>
 * ```
 *
 * Should become:
 *
 * ```xml
 * <paragraph listType="bulleted" listItemId="a" listIndent=0>Item 1</paragraph>
 * <paragraph listType="bulleted" listItemId="c" listIndent=1>Item 3</paragraph>   <--- note that indent got post-fixed.
 * ```
 *
 * @param model The data model.
 * @param writer The writer to do changes with.
 * @param attributeNames The list of all model list attributes (including registered strategies).
 * @param ListEditing The document list editing plugin.
 * @returns `true` if any change has been applied, `false` otherwise.
 */ function modelChangePostFixer$1(model, writer, attributeNames, listEditing) {
    const changes = model.document.differ.getChanges();
    const visited = new Set();
    const itemToListHead = new Set();
    const multiBlock = listEditing.editor.config.get('list.multiBlock');
    let applied = false;
    for (const entry of changes){
        if (entry.type == 'insert' && entry.name != '$text') {
            const item = entry.position.nodeAfter;
            // Remove attributes in case of renamed element.
            if (!model.schema.checkAttribute(item, 'listItemId')) {
                for (const attributeName of Array.from(item.getAttributeKeys())){
                    if (attributeNames.includes(attributeName)) {
                        writer.removeAttribute(attributeName, item);
                        applied = true;
                    }
                }
            }
            findAndAddListHeadToMap(entry.position, itemToListHead, visited);
            // Insert of a non-list item - check if there is a list after it.
            if (!entry.attributes.has('listItemId')) {
                findAndAddListHeadToMap(entry.position.getShiftedBy(entry.length), itemToListHead, visited);
            }
            // Check if there is no nested list.
            for (const { item: innerItem, previousPosition } of model.createRangeIn(item)){
                if (isListItemBlock(innerItem)) {
                    findAndAddListHeadToMap(previousPosition, itemToListHead, visited);
                }
            }
        } else if (entry.type == 'remove') {
            findAndAddListHeadToMap(entry.position, itemToListHead, visited);
        } else if (entry.type == 'attribute' && attributeNames.includes(entry.attributeKey)) {
            findAndAddListHeadToMap(entry.range.start, itemToListHead, visited);
            if (entry.attributeNewValue === null) {
                findAndAddListHeadToMap(entry.range.start.getShiftedBy(1), itemToListHead, visited);
            }
        }
        // Make sure that there is no left over listItem element without attributes or a block with list attributes that is not a listItem.
        if (!multiBlock && entry.type == 'attribute' && LIST_BASE_ATTRIBUTES.includes(entry.attributeKey)) {
            const element = entry.range.start.nodeAfter;
            if (entry.attributeNewValue === null && element && element.is('element', 'listItem')) {
                writer.rename(element, 'paragraph');
                applied = true;
            } else if (entry.attributeOldValue === null && element && element.is('element') && element.name != 'listItem') {
                writer.rename(element, 'listItem');
                applied = true;
            }
        }
    }
    // Make sure that IDs are not shared by split list.
    const seenIds = new Set();
    for (const listHead of itemToListHead.values()){
        applied = listEditing.fire('postFixer', {
            listNodes: new ListBlocksIterable(listHead),
            listHead,
            writer,
            seenIds
        }) || applied;
    }
    return applied;
}
/**
 * A fixer for pasted content that includes list items.
 *
 * It fixes indentation of pasted list items so the pasted items match correctly to the context they are pasted into.
 *
 * Example:
 *
 * ```xml
 * <paragraph listType="bulleted" listItemId="a" listIndent="0">A</paragraph>
 * <paragraph listType="bulleted" listItemId="b" listIndent="1">B^</paragraph>
 * // At ^ paste:  <paragraph listType="numbered" listItemId="x" listIndent="0">X</paragraph>
 * //              <paragraph listType="numbered" listItemId="y" listIndent="1">Y</paragraph>
 * <paragraph listType="bulleted" listItemId="c" listIndent="2">C</paragraph>
 * ```
 *
 * Should become:
 *
 * ```xml
 * <paragraph listType="bulleted" listItemId="a" listIndent="0">A</paragraph>
 * <paragraph listType="bulleted" listItemId="b" listIndent="1">BX</paragraph>
 * <paragraph listType="bulleted" listItemId="y" listIndent="2">Y/paragraph>
 * <paragraph listType="bulleted" listItemId="c" listIndent="2">C</paragraph>
 * ```
 */ function createModelIndentPasteFixer(model) {
    return (evt, [content, selectable])=>{
        const items = content.is('documentFragment') ? Array.from(content.getChildren()) : [
            content
        ];
        if (!items.length) {
            return;
        }
        const selection = selectable ? model.createSelection(selectable) : model.document.selection;
        const position = selection.getFirstPosition();
        // Get a reference list item. Attributes of the inserted list items will be fixed according to that item.
        let refItem;
        if (isListItemBlock(position.parent)) {
            refItem = position.parent;
        } else if (isListItemBlock(position.nodeBefore) && isListItemBlock(position.nodeAfter)) {
            refItem = position.nodeBefore;
        } else {
            return; // Content is not copied into a list.
        }
        model.change((writer)=>{
            const refType = refItem.getAttribute('listType');
            const refIndent = refItem.getAttribute('listIndent');
            const firstElementIndent = items[0].getAttribute('listIndent') || 0;
            const indentDiff = Math.max(refIndent - firstElementIndent, 0);
            for (const item of items){
                const isListItem = isListItemBlock(item);
                if (refItem.is('element', 'listItem') && item.is('element', 'paragraph')) {
                    /**
					 * When paragraphs or a plain text list is pasted into a simple list, convert
					 * the `<paragraphs>' to `<listItem>' to avoid breaking the target list.
					 *
					 * See https://github.com/ckeditor/ckeditor5/issues/13826.
					 */ writer.rename(item, 'listItem');
                }
                writer.setAttributes({
                    listIndent: (isListItem ? item.getAttribute('listIndent') : 0) + indentDiff,
                    listItemId: isListItem ? item.getAttribute('listItemId') : ListItemUid.next(),
                    listType: refType
                }, item);
            }
        });
    };
}
/**
 * Decides whether the merge should be accompanied by the model's `deleteContent()`, for instance, to get rid of the inline
 * content in the selection or take advantage of the heuristics in `deleteContent()` that helps convert lists into paragraphs
 * in certain cases.
 */ function shouldMergeOnBlocksContentLevel(model, direction) {
    const selection = model.document.selection;
    if (!selection.isCollapsed) {
        return !getSelectedBlockObject(model);
    }
    if (direction === 'forward') {
        return true;
    }
    const firstPosition = selection.getFirstPosition();
    const positionParent = firstPosition.parent;
    const previousSibling = positionParent.previousSibling;
    if (model.schema.isObject(previousSibling)) {
        return false;
    }
    if (previousSibling.isEmpty) {
        return true;
    }
    return isSingleListItem([
        positionParent,
        previousSibling
    ]);
}

/**
 * Helper method for creating toolbar and menu buttons and linking them with an appropriate command.
 *
 * @internal
 * @param editor The editor instance to which the UI component will be added.
 * @param commandName The name of the command.
 * @param label The button label.
 * @param icon The source of the icon.
 */ function createUIComponents(editor, commandName, label, icon) {
    editor.ui.componentFactory.add(commandName, ()=>{
        const buttonView = _createButton(ButtonView, editor, commandName, label, icon);
        buttonView.set({
            tooltip: true,
            isToggleable: true
        });
        return buttonView;
    });
    editor.ui.componentFactory.add(`menuBar:${commandName}`, ()=>{
        const buttonView = _createButton(MenuBarMenuListItemButtonView, editor, commandName, label, icon);
        buttonView.set({
            role: 'menuitemcheckbox',
            isToggleable: true
        });
        return buttonView;
    });
}
/**
 * Creates a button to use either in toolbar or in menu bar.
 */ function _createButton(ButtonClass, editor, commandName, label, icon) {
    const command = editor.commands.get(commandName);
    const view = new ButtonClass(editor.locale);
    view.set({
        label,
        icon
    });
    // Bind button model to command.
    view.bind('isOn', 'isEnabled').to(command, 'value', 'isEnabled');
    // Execute the command.
    view.on('execute', ()=>{
        editor.execute(commandName);
        editor.editing.view.focus();
    });
    return view;
}

/**
 * The list UI feature. It introduces the `'numberedList'` and `'bulletedList'` buttons that
 * allow to convert paragraphs to and from list items and indent or outdent them.
 */ class ListUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ListUI';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const t = this.editor.t;
        // Create button numberedList.
        if (!this.editor.ui.componentFactory.has('numberedList')) {
            createUIComponents(this.editor, 'numberedList', t('Numbered List'), IconNumberedList);
        }
        // Create button bulletedList.
        if (!this.editor.ui.componentFactory.has('bulletedList')) {
            createUIComponents(this.editor, 'bulletedList', t('Bulleted List'), IconBulletedList);
        }
    }
}

/**
 * The list feature.
 *
 * This is a "glue" plugin that loads the {@link module:list/list/listediting~ListEditing  list
 * editing feature} and {@link module:list/list/listui~ListUI list UI feature}.
 */ class List extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ListEditing,
            ListUI
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'List';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

/**
 * The list start index command. It changes the `listStart` attribute of the selected list items,
 * letting the user to choose the starting point of an ordered list.
 * It is used by the {@link module:list/listproperties~ListProperties list properties feature}.
 */ class ListStartCommand extends Command {
    /**
	 * @inheritDoc
	 */ refresh() {
        const value = this._getValue();
        this.value = value;
        this.isEnabled = value != null;
    }
    /**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param options Execute options.
	 * @param options.startIndex The list start index.
	 */ execute({ startIndex = 1 } = {}) {
        const model = this.editor.model;
        const document = model.document;
        let blocks = Array.from(document.selection.getSelectedBlocks()).filter((block)=>isListItemBlock(block) && isNumberedListType(block.getAttribute('listType')));
        blocks = expandListBlocksToCompleteList(blocks);
        model.change((writer)=>{
            for (const block of blocks){
                writer.setAttribute('listStart', startIndex >= 0 ? startIndex : 1, block);
            }
        });
    }
    /**
	 * Checks the command's {@link #value}.
	 *
	 * @returns The current value.
	 */ _getValue() {
        const model = this.editor.model;
        const document = model.document;
        const block = first(document.selection.getSelectedBlocks());
        if (block && isListItemBlock(block) && isNumberedListType(block.getAttribute('listType'))) {
            return block.getAttribute('listStart');
        }
        return null;
    }
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */ /**
* @module list/listproperties/utils/style
*/ const LIST_STYLE_TO_LIST_TYPE = {};
const LIST_STYLE_TO_TYPE_ATTRIBUTE = {};
const TYPE_ATTRIBUTE_TO_LIST_STYLE = {};
const LIST_STYLE_TYPES = [
    {
        listStyle: 'disc',
        typeAttribute: 'disc',
        listType: 'bulleted'
    },
    {
        listStyle: 'circle',
        typeAttribute: 'circle',
        listType: 'bulleted'
    },
    {
        listStyle: 'square',
        typeAttribute: 'square',
        listType: 'bulleted'
    },
    {
        listStyle: 'decimal',
        typeAttribute: '1',
        listType: 'numbered'
    },
    {
        listStyle: 'decimal-leading-zero',
        typeAttribute: null,
        listType: 'numbered'
    },
    {
        listStyle: 'lower-roman',
        typeAttribute: 'i',
        listType: 'numbered'
    },
    {
        listStyle: 'upper-roman',
        typeAttribute: 'I',
        listType: 'numbered'
    },
    {
        listStyle: 'lower-alpha',
        typeAttribute: 'a',
        listType: 'numbered'
    },
    {
        listStyle: 'upper-alpha',
        typeAttribute: 'A',
        listType: 'numbered'
    },
    {
        listStyle: 'lower-latin',
        typeAttribute: 'a',
        listType: 'numbered'
    },
    {
        listStyle: 'upper-latin',
        typeAttribute: 'A',
        listType: 'numbered'
    },
    {
        listStyle: 'arabic-indic',
        typeAttribute: null,
        listType: 'numbered'
    }
];
for (const { listStyle, typeAttribute, listType } of LIST_STYLE_TYPES){
    LIST_STYLE_TO_LIST_TYPE[listStyle] = listType;
    LIST_STYLE_TO_TYPE_ATTRIBUTE[listStyle] = typeAttribute;
    if (typeAttribute) {
        TYPE_ATTRIBUTE_TO_LIST_STYLE[typeAttribute] = listStyle;
    }
}
/**
 * Gets all the style types supported by given list type.
 *
 * @internal
 */ function getAllSupportedStyleTypes() {
    return LIST_STYLE_TYPES.map((x)=>x.listStyle);
}
/**
 * Checks whether the given list-style-type is supported by numbered or bulleted list.
 *
 * @internal
 */ function getListTypeFromListStyleType$1(listStyleType) {
    return LIST_STYLE_TO_LIST_TYPE[listStyleType] || null;
}
/**
 * Converts `type` attribute of `<ul>` or `<ol>` elements to `list-style-type` equivalent.
 *
 * @internal
 */ function getListStyleTypeFromTypeAttribute(value) {
    return TYPE_ATTRIBUTE_TO_LIST_STYLE[value] || null;
}
/**
 * Converts `list-style-type` style to `type` attribute of `<ul>` or `<ol>` elements.
 *
 * @internal
 */ function getTypeAttributeFromListStyleType(value) {
    return LIST_STYLE_TO_TYPE_ATTRIBUTE[value] || null;
}
/**
 * Normalizes list style by converting aliases to their canonical form.
 *
 * @internal
 * @param listStyle The list style value to normalize.
 * @returns The canonical form of the list style.
 *
 * @example
 * normalizeListStyle( 'lower-alpha' ); // Returns 'lower-latin'
 * normalizeListStyle( 'upper-alpha' ); // Returns 'upper-latin'
 * normalizeListStyle( 'disc' ); // Returns 'disc'
 */ function normalizeListStyle(listStyle) {
    switch(listStyle){
        case 'lower-alpha':
            return 'lower-latin';
        case 'upper-alpha':
            return 'upper-latin';
        default:
            return listStyle;
    }
}

/**
 * The list style command. It changes `listStyle` attribute of the selected list items,
 * letting the user choose styles for the list item markers.
 * It is used by the {@link module:list/listproperties~ListProperties list properties feature}.
 */ class ListStyleCommand extends Command {
    /**
	 * The default type of the list style.
	 */ defaultType;
    /**
	 * The list of supported style types by this command.
	 */ _supportedTypes;
    /**
	 * Creates an instance of the command.
	 *
	 * @param editor The editor instance.
	 * @param defaultType The list type that will be used by default if the value was not specified during
	 * the command execution.
	 * @param supportedTypes The list of supported style types by this command.
	 */ constructor(editor, defaultType, supportedTypes){
        super(editor);
        this.defaultType = defaultType;
        this._supportedTypes = supportedTypes;
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        this.value = this._getValue();
        this.isEnabled = this._checkEnabled();
    }
    /**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param options.type The type of the list style, e.g. `'disc'` or `'square'`. If `null` is specified, the default
	 * style will be applied.
	 */ execute(options = {}) {
        const model = this.editor.model;
        const document = model.document;
        model.change((writer)=>{
            this._tryToConvertItemsToList(options);
            let blocks = Array.from(document.selection.getSelectedBlocks()).filter((block)=>block.hasAttribute('listType'));
            if (!blocks.length) {
                return;
            }
            blocks = expandListBlocksToCompleteList(blocks);
            for (const block of blocks){
                writer.setAttribute('listStyle', options.type || this.defaultType, block);
            }
        });
    }
    /**
	 * Checks if the given style type is supported by this plugin.
	 */ isStyleTypeSupported(value) {
        if (!this._supportedTypes) {
            return true;
        }
        return this._supportedTypes.includes(value);
    }
    /**
	 * Checks the command's {@link #value}.
	 *
	 * @returns The current value.
	 */ _getValue() {
        const listItem = first(this.editor.model.document.selection.getSelectedBlocks());
        if (isListItemBlock(listItem)) {
            return listItem.getAttribute('listStyle');
        }
        return null;
    }
    /**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @returns Whether the command should be enabled.
	 */ _checkEnabled() {
        const editor = this.editor;
        const numberedList = editor.commands.get('numberedList');
        const bulletedList = editor.commands.get('bulletedList');
        return numberedList.isEnabled || bulletedList.isEnabled;
    }
    /**
	 * Check if the provided list style is valid. Also change the selection to a list if it's not set yet.
	 *
	 * @param options.type The type of the list style. If `null` is specified, the function does nothing.
	*/ _tryToConvertItemsToList(options) {
        if (!options.type) {
            return;
        }
        const listType = getListTypeFromListStyleType$1(options.type);
        if (!listType) {
            return;
        }
        const editor = this.editor;
        const commandName = `${listType}List`;
        const command = editor.commands.get(commandName);
        if (!command.value) {
            editor.execute(commandName);
        }
    }
}

/**
 * The list reversed command. It changes the `listReversed` attribute of the selected list items,
 * letting the user to choose the order of an ordered list.
 * It is used by the {@link module:list/listproperties~ListProperties list properties feature}.
 */ class ListReversedCommand extends Command {
    /**
	 * @inheritDoc
	 */ refresh() {
        const value = this._getValue();
        this.value = value;
        this.isEnabled = value != null;
    }
    /**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param options.reversed Whether the list should be reversed.
	 */ execute(options = {}) {
        const model = this.editor.model;
        const document = model.document;
        let blocks = Array.from(document.selection.getSelectedBlocks()).filter((block)=>isListItemBlock(block) && block.getAttribute('listType') == 'numbered');
        blocks = expandListBlocksToCompleteList(blocks);
        model.change((writer)=>{
            for (const block of blocks){
                writer.setAttribute('listReversed', !!options.reversed, block);
            }
        });
    }
    /**
	 * Checks the command's {@link #value}.
	 */ _getValue() {
        const model = this.editor.model;
        const document = model.document;
        const block = first(document.selection.getSelectedBlocks());
        if (isListItemBlock(block) && block.getAttribute('listType') == 'numbered') {
            return block.getAttribute('listReversed');
        }
        return null;
    }
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */ /**
 * @module list/listproperties/converters
 */ /**
 * Returns a converter that consumes the `style`, `reversed`, and `start` attributes.
 * In `style`, it searches for the `list-style-type` definition.
 * If not found, the `"default"` value will be used.
 *
 * @internal
 * @param strategy
 */ function listPropertiesUpcastConverter(strategy) {
    return (evt, data, conversionApi)=>{
        const { writer, schema, consumable } = conversionApi;
        // If there is no view consumable to consume, set the default attribute value to be able to reconvert nested lists on parent change.
        // So abort converting if attribute was directly consumed.
        if (consumable.test(data.viewItem, strategy.viewConsumables) === false) {
            return;
        }
        if (!data.modelRange) {
            Object.assign(data, conversionApi.convertChildren(data.viewItem, data.modelCursor));
        }
        let applied = false;
        for (const item of data.modelRange.getItems({
            shallow: true
        })){
            if (!schema.checkAttribute(item, strategy.attributeName)) {
                continue;
            }
            if (!strategy.appliesToListItem(item)) {
                continue;
            }
            // Set list attributes only on same level items, those nested deeper are already handled by the recursive conversion.
            if (item.hasAttribute(strategy.attributeName)) {
                continue;
            }
            writer.setAttribute(strategy.attributeName, strategy.getAttributeOnUpcast(data.viewItem), item);
            applied = true;
        }
        if (applied) {
            consumable.consume(data.viewItem, strategy.viewConsumables);
        }
    };
}

/**
 * A set of helpers related to document lists.
 */ class ListPropertiesUtils extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ListPropertiesUtils';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * Gets all the style types supported by given list type.
	 */ getAllSupportedStyleTypes() {
        return getAllSupportedStyleTypes();
    }
    /**
	 * Checks whether the given list-style-type is supported by numbered or bulleted list.
	 */ getListTypeFromListStyleType(listStyleType) {
        return getListTypeFromListStyleType$1(listStyleType);
    }
    /**
	 * Converts `type` attribute of `<ul>` or `<ol>` elements to `list-style-type` equivalent.
	 */ getListStyleTypeFromTypeAttribute(value) {
        return getListStyleTypeFromTypeAttribute(value);
    }
    /**
	 * Converts `list-style-type` style to `type` attribute of `<ul>` or `<ol>` elements.
	 */ getTypeAttributeFromListStyleType(value) {
        return getTypeAttributeFromListStyleType(value);
    }
}

/**
 * Normalizes {@link module:list/listconfig~ListPropertiesConfig} in the configuration of the list properties feature.
 * The structure of normalized list properties options looks as follows:
 *
 * ```ts
 * {
 * 	styles: {
 * 		listTypes: [ 'bulleted', 'numbered' ],
 * 		useAttribute: false
 * 	},
 * 	startIndex: true,
 * 	reversed: true
 * }
 * ```
 *
 * @internal
 * @param config The list properties {@link module:list/listconfig~ListPropertiesConfig config}.
 * @returns An object with normalized list properties options.
 */ function getNormalizedConfig(config) {
    const { startIndex, reversed, styles } = config;
    return {
        styles: getNormalizedStylesConfig(styles),
        startIndex: startIndex || false,
        reversed: reversed || false
    };
}
/**
 * Normalizes styles in the configuration of the list properties feature.
 * The structure of normalized list properties options looks as follows:
 *
 * ```ts
 * {
 * 	listTypes: [ 'bulleted', 'numbered' ],
 * 	useAttribute: false
 * }
 * ```
 *
 * @param styles The list properties styles.
 * @returns An object with normalized list properties styles.
 */ function getNormalizedStylesConfig(styles) {
    const normalizedConfig = {
        listTypes: [
            'bulleted',
            'numbered'
        ],
        useAttribute: false,
        listStyleTypes: {
            numbered: [
                'decimal',
                'decimal-leading-zero',
                'lower-roman',
                'upper-roman',
                'lower-latin',
                'upper-latin'
            ],
            bulleted: [
                'disc',
                'circle',
                'square'
            ]
        }
    };
    if (styles === true) {
        return normalizedConfig;
    }
    if (!styles) {
        normalizedConfig.listTypes = [];
        normalizedConfig.listStyleTypes = {};
    } else if (Array.isArray(styles) || typeof styles == 'string') {
        normalizedConfig.listTypes = toArray(styles);
        normalizedConfig.listStyleTypes = pick(normalizedConfig.listStyleTypes, normalizedConfig.listTypes);
    } else {
        normalizedConfig.listTypes = styles.listTypes ? toArray(styles.listTypes) : normalizedConfig.listTypes;
        normalizedConfig.useAttribute = !!styles.useAttribute;
        if (styles.listStyleTypes) {
            normalizedConfig.listStyleTypes = styles.listStyleTypes;
        } else {
            normalizedConfig.listStyleTypes = pick(normalizedConfig.listStyleTypes, normalizedConfig.listTypes);
        }
    }
    return normalizedConfig;
}

const DEFAULT_LIST_TYPE$1 = 'default';
/**
 * The document list properties engine feature.
 *
 * It registers the `'listStyle'`, `'listReversed'` and `'listStart'` commands if they are enabled in the configuration.
 * Read more in {@link module:list/listconfig~ListPropertiesConfig}.
 */ class ListPropertiesEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ListEditing,
            ListPropertiesUtils
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ListPropertiesEditing';
    }
    /**
	 * @inheritDoc
	 * @internal
	 */ static get licenseFeatureCode() {
        return 'LP';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get isPremiumPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        editor.config.define('list.properties', {
            styles: true,
            startIndex: false,
            reversed: false
        });
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const model = editor.model;
        const listEditing = editor.plugins.get(ListEditing);
        const enabledProperties = editor.config.get('list.properties');
        const strategies = createAttributeStrategies$1(enabledProperties);
        for (const strategy of strategies){
            strategy.addCommand(editor);
            model.schema.extend('$listItem', {
                allowAttributes: strategy.attributeName
            });
            // Register downcast strategy.
            listEditing.registerDowncastStrategy({
                scope: 'list',
                attributeName: strategy.attributeName,
                setAttributeOnDowncast (writer, attributeValue, viewElement) {
                    strategy.setAttributeOnDowncast(writer, attributeValue, viewElement);
                }
            });
        }
        // Set up conversion.
        editor.conversion.for('upcast').add((dispatcher)=>{
            for (const strategy of strategies){
                dispatcher.on('element:ol', listPropertiesUpcastConverter(strategy));
                dispatcher.on('element:ul', listPropertiesUpcastConverter(strategy));
            }
        });
        // Verify if the list view element (ul or ol) requires refreshing.
        listEditing.on('checkAttributes:list', (evt, { viewElement, modelAttributes, modelReferenceElement })=>{
            for (const strategy of strategies){
                if (!strategy.appliesToListItem(modelReferenceElement)) {
                    continue;
                }
                if (strategy.getAttributeOnUpcast(viewElement) != modelAttributes[strategy.attributeName]) {
                    evt.return = true;
                    evt.stop();
                }
            }
        });
        // Reset list properties after indenting list items.
        this.listenTo(editor.commands.get('indentList'), 'afterExecute', (evt, changedBlocks)=>{
            model.change((writer)=>{
                for (const node of changedBlocks){
                    for (const strategy of strategies){
                        if (strategy.appliesToListItem(node)) {
                            // Just reset the attribute.
                            // If there is a previous indented list that this node should be merged into,
                            // the postfixer will unify all the attributes of both sub-lists.
                            writer.setAttribute(strategy.attributeName, strategy.defaultValue, node);
                        }
                    }
                }
            });
        });
        // Add or remove list properties attributes depending on the list type.
        listEditing.on('postFixer', (evt, { listNodes, writer })=>{
            for (const { node } of listNodes){
                for (const strategy of strategies){
                    // Check if attribute is valid.
                    if (strategy.hasValidAttribute(node)) {
                        continue;
                    }
                    // Add missing default property attributes...
                    if (strategy.appliesToListItem(node)) {
                        writer.setAttribute(strategy.attributeName, strategy.defaultValue, node);
                    } else {
                        writer.removeAttribute(strategy.attributeName, node);
                    }
                    evt.return = true;
                }
            }
        });
        // Make sure that all items in a single list (items at the same level & listType) have the same properties.
        listEditing.on('postFixer', (evt, { listNodes, writer })=>{
            for (const { node, previousNodeInList } of listNodes){
                // This is a first item of a nested list.
                if (!previousNodeInList) {
                    continue;
                }
                // This is a first block of a list of a different type.
                if (previousNodeInList.getAttribute('listType') != node.getAttribute('listType')) {
                    continue;
                }
                // Copy properties from the previous one.
                for (const strategy of strategies){
                    const { attributeName } = strategy;
                    if (!strategy.appliesToListItem(node)) {
                        continue;
                    }
                    const value = previousNodeInList.getAttribute(attributeName);
                    if (node.getAttribute(attributeName) != value) {
                        writer.setAttribute(attributeName, value, node);
                        evt.return = true;
                    }
                }
            }
        });
    }
}
/**
 * Creates an array of strategies for dealing with enabled listItem attributes.
 */ function createAttributeStrategies$1(enabledProperties) {
    const strategies = [];
    const normalizedConfig = getNormalizedConfig(enabledProperties);
    if (enabledProperties.styles) {
        const useAttribute = normalizedConfig.styles.useAttribute;
        strategies.push({
            attributeName: 'listStyle',
            defaultValue: DEFAULT_LIST_TYPE$1,
            viewConsumables: {
                styles: 'list-style-type'
            },
            addCommand (editor) {
                let supportedTypes = getAllSupportedStyleTypes();
                if (useAttribute) {
                    supportedTypes = supportedTypes.filter((styleType)=>!!getTypeAttributeFromListStyleType(styleType));
                }
                editor.commands.add('listStyle', new ListStyleCommand(editor, DEFAULT_LIST_TYPE$1, supportedTypes));
            },
            appliesToListItem (item) {
                return item.getAttribute('listType') == 'numbered' || item.getAttribute('listType') == 'bulleted';
            },
            hasValidAttribute (item) {
                if (!this.appliesToListItem(item)) {
                    return !item.hasAttribute('listStyle');
                }
                if (!item.hasAttribute('listStyle')) {
                    return false;
                }
                const value = item.getAttribute('listStyle');
                if (value == DEFAULT_LIST_TYPE$1) {
                    return true;
                }
                return getListTypeFromListStyleType$1(value) == item.getAttribute('listType');
            },
            setAttributeOnDowncast (writer, listStyle, element) {
                if (listStyle && listStyle !== DEFAULT_LIST_TYPE$1) {
                    if (useAttribute) {
                        const value = getTypeAttributeFromListStyleType(listStyle);
                        if (value) {
                            writer.setAttribute('type', value, element);
                            return;
                        }
                    } else {
                        writer.setStyle('list-style-type', listStyle, element);
                        return;
                    }
                }
                writer.removeStyle('list-style-type', element);
                writer.removeAttribute('type', element);
            },
            getAttributeOnUpcast (listParent) {
                const style = listParent.getStyle('list-style-type');
                if (style) {
                    return normalizeListStyle(style);
                }
                const attribute = listParent.getAttribute('type');
                if (attribute) {
                    return getListStyleTypeFromTypeAttribute(attribute);
                }
                return DEFAULT_LIST_TYPE$1;
            }
        });
    }
    if (enabledProperties.reversed) {
        strategies.push({
            attributeName: 'listReversed',
            defaultValue: false,
            viewConsumables: {
                attributes: 'reversed'
            },
            addCommand (editor) {
                editor.commands.add('listReversed', new ListReversedCommand(editor));
            },
            appliesToListItem (item) {
                return item.getAttribute('listType') == 'numbered';
            },
            hasValidAttribute (item) {
                return this.appliesToListItem(item) == item.hasAttribute('listReversed');
            },
            setAttributeOnDowncast (writer, listReversed, element) {
                if (listReversed) {
                    writer.setAttribute('reversed', 'reversed', element);
                } else {
                    writer.removeAttribute('reversed', element);
                }
            },
            getAttributeOnUpcast (listParent) {
                return listParent.hasAttribute('reversed');
            }
        });
    }
    if (enabledProperties.startIndex) {
        strategies.push({
            attributeName: 'listStart',
            defaultValue: 1,
            viewConsumables: {
                attributes: 'start'
            },
            addCommand (editor) {
                editor.commands.add('listStart', new ListStartCommand(editor));
            },
            appliesToListItem (item) {
                return isNumberedListType(item.getAttribute('listType'));
            },
            hasValidAttribute (item) {
                return this.appliesToListItem(item) == item.hasAttribute('listStart');
            },
            setAttributeOnDowncast (writer, listStart, element) {
                if (listStart == 0 || listStart > 1) {
                    writer.setAttribute('start', listStart, element);
                } else {
                    writer.removeAttribute('start', element);
                }
            },
            getAttributeOnUpcast (listParent) {
                const startAttributeValue = listParent.getAttribute('start');
                return startAttributeValue >= 0 ? startAttributeValue : 1;
            }
        });
    }
    return strategies;
}

/**
 * The list properties view to be displayed in the list dropdown.
 *
 * Contains a grid of available list styles and, for numbered list, also the list start index and reversed fields.
 *
 * @internal
 */ class ListPropertiesView extends View {
    /**
	 * A collection of the child views.
	 */ children;
    /**
	 * A view that renders the grid of list styles.
	 */ stylesView = null;
    /**
	 * A collapsible view that hosts additional list property fields ({@link #startIndexFieldView} and
	 * {@link #reversedSwitchButtonView}) to visually separate them from the {@link #stylesView grid of styles}.
	 *
	 * **Note**: Only present when:
	 * * the view represents **numbered** list properties,
	 * * and the {@link #stylesView} is rendered,
	 * * and either {@link #startIndexFieldView} or {@link #reversedSwitchButtonView} is rendered.
	 *
	 * @readonly
	 */ additionalPropertiesCollapsibleView = null;
    /**
	 * A labeled number field allowing the user to set the start index of the list.
	 *
	 * **Note**: Only present when the view represents **numbered** list properties.
	 *
	 * @readonly
	 */ startIndexFieldView = null;
    /**
	 * A switch button allowing the user to make the edited list reversed.
	 *
	 * **Note**: Only present when the view represents **numbered** list properties.
	 *
	 * @readonly
	 */ reversedSwitchButtonView = null;
    /**
	 * Tracks information about the DOM focus in the view.
	 */ focusTracker = new FocusTracker();
    /**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */ keystrokes = new KeystrokeHandler();
    /**
	 * A collection of views that can be focused in the properties view.
	 */ focusables = new ViewCollection();
    /**
	 * Helps cycling over {@link #focusables} in the view.
	 */ focusCycler;
    /**
	 * Creates an instance of the list properties view.
	 *
	 * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
	 * @param options Options of the view.
	 * @param options.enabledProperties An object containing the configuration of enabled list property names.
	 * Allows conditional rendering the sub-components of the properties view.
	 * @param options.styleButtonViews A list of style buttons to be rendered
	 * inside the styles grid. The grid will not be rendered when `enabledProperties` does not include the `'styles'` key.
	 * @param options.styleGridAriaLabel An assistive technologies label set on the grid of styles (if the grid is rendered).
	 */ constructor(locale, { enabledProperties, styleButtonViews, styleGridAriaLabel }){
        super(locale);
        const elementCssClasses = [
            'ck',
            'ck-list-properties'
        ];
        this.children = this.createCollection();
        this.focusCycler = new FocusCycler({
            focusables: this.focusables,
            focusTracker: this.focusTracker,
            keystrokeHandler: this.keystrokes,
            actions: {
                // Navigate #children backwards using the <kbd>Shift</kbd> + <kbd>Tab</kbd> keystroke.
                focusPrevious: 'shift + tab',
                // Navigate #children forwards using the <kbd>Tab</kbd> key.
                focusNext: 'tab'
            }
        });
        // The rendering of the styles grid is conditional. When there is no styles grid, the view will render without collapsible
        // for numbered list properties, hence simplifying the layout.
        if (styleButtonViews && styleButtonViews.length) {
            this.stylesView = this._createStylesView(styleButtonViews, styleGridAriaLabel);
            this.children.add(this.stylesView);
        } else {
            elementCssClasses.push('ck-list-properties_without-styles');
        }
        // The rendering of the numbered list property views is also conditional. It only makes sense for the numbered list
        // dropdown. The unordered list does not have such properties.
        if (enabledProperties.startIndex || enabledProperties.reversed) {
            this._addNumberedListPropertyViews(enabledProperties);
            elementCssClasses.push('ck-list-properties_with-numbered-properties');
        }
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: elementCssClasses
            },
            children: this.children
        });
    }
    /**
	 * @inheritDoc
	 */ render() {
        super.render();
        if (this.stylesView) {
            this.focusables.add(this.stylesView);
            this.focusTracker.add(this.stylesView.element);
            // Register the collapsible toggle button to the focus system.
            if (this.startIndexFieldView || this.reversedSwitchButtonView) {
                this.focusables.add(this.children.last.buttonView);
                this.focusTracker.add(this.children.last.buttonView.element);
            }
            for (const item of this.stylesView.children){
                this.stylesView.focusTracker.add(item.element);
            }
            addKeyboardHandlingForGrid({
                keystrokeHandler: this.stylesView.keystrokes,
                focusTracker: this.stylesView.focusTracker,
                gridItems: this.stylesView.children,
                // Note: The styles view has a different number of columns depending on whether the other properties
                // are enabled in the dropdown or not (https://github.com/ckeditor/ckeditor5/issues/12340)
                numberOfColumns: ()=>global.window.getComputedStyle(this.stylesView.element).getPropertyValue('grid-template-columns').split(' ').length,
                uiLanguageDirection: this.locale && this.locale.uiLanguageDirection
            });
        }
        if (this.startIndexFieldView) {
            this.focusables.add(this.startIndexFieldView);
            this.focusTracker.add(this.startIndexFieldView.element);
            const stopPropagation = (data)=>data.stopPropagation();
            // Since the form is in the dropdown panel which is a child of the toolbar, the toolbar's
            // keystroke handler would take over the key management in the input. We need to prevent
            // this ASAP. Otherwise, the basic caret movement using the arrow keys will be impossible.
            this.keystrokes.set('arrowright', stopPropagation);
            this.keystrokes.set('arrowleft', stopPropagation);
            this.keystrokes.set('arrowup', stopPropagation);
            this.keystrokes.set('arrowdown', stopPropagation);
        }
        if (this.reversedSwitchButtonView) {
            this.focusables.add(this.reversedSwitchButtonView);
            this.focusTracker.add(this.reversedSwitchButtonView.element);
        }
        // Start listening for the keystrokes coming from #element.
        this.keystrokes.listenTo(this.element);
    }
    /**
	 * @inheritDoc
	 */ focus() {
        this.focusCycler.focusFirst();
    }
    /**
	 * @inheritDoc
	 */ focusLast() {
        this.focusCycler.focusLast();
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        this.focusTracker.destroy();
        this.keystrokes.destroy();
    }
    /**
	 * Creates the list styles grid.
	 *
	 * @param styleButtons Buttons to be placed in the grid.
	 * @param styleGridAriaLabel The assistive technology label of the grid.
	 */ _createStylesView(styleButtons, styleGridAriaLabel) {
        const stylesView = new View(this.locale);
        stylesView.children = stylesView.createCollection();
        stylesView.children.addMany(styleButtons);
        stylesView.setTemplate({
            tag: 'div',
            attributes: {
                'aria-label': styleGridAriaLabel,
                class: [
                    'ck',
                    'ck-list-styles-list'
                ]
            },
            children: stylesView.children
        });
        stylesView.children.delegate('execute').to(this);
        stylesView.focus = function() {
            // If there is a button that is already on, focus it.
            // It's counterintuitive to focus the first button when there is already a button on.
            for (const child of this.children){
                if (child instanceof ButtonView && child.isOn) {
                    child.focus();
                    return;
                }
            }
            // ... otherwise focus the first button.
            this.children.first.focus();
        };
        stylesView.focusTracker = new FocusTracker();
        stylesView.keystrokes = new KeystrokeHandler();
        stylesView.render();
        stylesView.keystrokes.listenTo(stylesView.element);
        return stylesView;
    }
    /**
	 * Renders {@link #startIndexFieldView} and/or {@link #reversedSwitchButtonView} depending on the configuration of the properties view.
	 *
	 * @param enabledProperties An object containing the configuration of enabled list property names
	 * (see {@link #constructor}).
	 */ _addNumberedListPropertyViews(enabledProperties) {
        const t = this.locale.t;
        const numberedPropertyViews = [];
        if (enabledProperties.startIndex) {
            this.startIndexFieldView = this._createStartIndexField();
            numberedPropertyViews.push(this.startIndexFieldView);
        }
        if (enabledProperties.reversed) {
            this.reversedSwitchButtonView = this._createReversedSwitchButton();
            numberedPropertyViews.push(this.reversedSwitchButtonView);
        }
        // When there are some style buttons, pack the numbered list properties into a collapsible to separate them.
        if (this.stylesView) {
            this.additionalPropertiesCollapsibleView = new CollapsibleView(this.locale, numberedPropertyViews);
            this.additionalPropertiesCollapsibleView.set({
                label: t('List properties'),
                isCollapsed: true
            });
            // Don't enable the collapsible view unless either start index or reversed field is enabled (e.g. when no list is selected).
            this.additionalPropertiesCollapsibleView.buttonView.bind('isEnabled').toMany(numberedPropertyViews, 'isEnabled', (...areEnabled)=>areEnabled.some((isEnabled)=>isEnabled));
            // Automatically collapse the additional properties collapsible when either start index or reversed field gets disabled.
            this.additionalPropertiesCollapsibleView.buttonView.on('change:isEnabled', (evt, data, isEnabled)=>{
                if (!isEnabled) {
                    this.additionalPropertiesCollapsibleView.isCollapsed = true;
                }
            });
            this.children.add(this.additionalPropertiesCollapsibleView);
        } else {
            this.children.addMany(numberedPropertyViews);
        }
    }
    /**
	 * Creates the list start index labeled field.
	 */ _createStartIndexField() {
        const t = this.locale.t;
        const startIndexFieldView = new LabeledFieldView(this.locale, createLabeledInputNumber);
        startIndexFieldView.set({
            label: t('Start at'),
            class: 'ck-numbered-list-properties__start-index'
        });
        startIndexFieldView.fieldView.set({
            min: 0,
            step: 1,
            value: 1,
            inputMode: 'numeric'
        });
        startIndexFieldView.fieldView.on('input', ()=>{
            const inputElement = startIndexFieldView.fieldView.element;
            const startIndex = inputElement.valueAsNumber;
            if (Number.isNaN(startIndex)) {
                // Number inputs allow for the entry of characters that may result in NaN,
                // such as 'e', '+', '123e', '2-'.
                startIndexFieldView.errorText = t('Invalid start index value.');
                return;
            }
            if (!inputElement.checkValidity()) {
                startIndexFieldView.errorText = t('Start index must be greater than 0.');
            } else {
                this.fire('listStart', {
                    startIndex
                });
            }
        });
        return startIndexFieldView;
    }
    /**
	 * Creates the reversed list switch button.
	 */ _createReversedSwitchButton() {
        const t = this.locale.t;
        const reversedButtonView = new SwitchButtonView(this.locale);
        reversedButtonView.set({
            withText: true,
            label: t('Reversed order'),
            class: 'ck-numbered-list-properties__reversed-order'
        });
        reversedButtonView.delegate('execute').to(this, 'listReversed');
        return reversedButtonView;
    }
}

/**
 * The list properties UI plugin. It introduces the extended `'bulletedList'` and `'numberedList'` toolbar
 * buttons that allow users to control such aspects of list as the marker, start index or order.
 *
 * **Note**: Buttons introduced by this plugin override implementations from the {@link module:list/list/listui~ListUI}
 * (because they share the same names).
 */ class ListPropertiesUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ListPropertiesUI';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    init() {
        const editor = this.editor;
        const t = editor.locale.t;
        const propertiesConfig = editor.config.get('list.properties');
        const normalizedConfig = getNormalizedConfig(propertiesConfig);
        const stylesListTypes = normalizedConfig.styles.listTypes;
        // Note: When this plugin does not register the "bulletedList" dropdown due to properties configuration,
        // a simple button will be still registered under the same name by ListUI as a fallback. This should happen
        // in most editor configuration because the List plugin automatically requires ListUI.
        if (stylesListTypes.includes('bulleted')) {
            const styleDefinitions = [
                {
                    label: t('Toggle the disc list style'),
                    tooltip: t('Disc'),
                    type: 'disc',
                    icon: IconListStyleDisc
                },
                {
                    label: t('Toggle the circle list style'),
                    tooltip: t('Circle'),
                    type: 'circle',
                    icon: IconListStyleCircle
                },
                {
                    label: t('Toggle the square list style'),
                    tooltip: t('Square'),
                    type: 'square',
                    icon: IconListStyleSquare
                }
            ];
            const buttonLabel = t('Bulleted List');
            const styleGridAriaLabel = t('Bulleted list styles toolbar');
            const commandName = 'bulletedList';
            editor.ui.componentFactory.add(commandName, getDropdownViewCreator({
                editor,
                normalizedConfig,
                parentCommandName: commandName,
                buttonLabel,
                buttonIcon: IconBulletedList,
                styleGridAriaLabel,
                styleDefinitions
            }));
            // Add the menu bar item for bulleted list.
            editor.ui.componentFactory.add(`menuBar:${commandName}`, getMenuBarStylesMenuCreator({
                editor,
                normalizedConfig,
                parentCommandName: commandName,
                buttonLabel,
                styleGridAriaLabel,
                styleDefinitions
            }));
        }
        // Note: When this plugin does not register the "numberedList" dropdown due to properties configuration,
        // a simple button will be still registered under the same name by ListUI as a fallback. This should happen
        // in most editor configuration because the List plugin automatically requires ListUI.
        if (stylesListTypes.includes('numbered') || propertiesConfig.startIndex || propertiesConfig.reversed) {
            const styleDefinitions = [
                {
                    label: t('Toggle the decimal list style'),
                    tooltip: t('Decimal'),
                    type: 'decimal',
                    icon: IconListStyleDecimal
                },
                {
                    label: t('Toggle the decimal with leading zero list style'),
                    tooltip: t('Decimal with leading zero'),
                    type: 'decimal-leading-zero',
                    icon: IconListStyleDecimalLeadingZero
                },
                {
                    label: t('Toggle the lower–roman list style'),
                    tooltip: t('Lower–roman'),
                    type: 'lower-roman',
                    icon: IconListStyleLowerRoman
                },
                {
                    label: t('Toggle the upper–roman list style'),
                    tooltip: t('Upper-roman'),
                    type: 'upper-roman',
                    icon: IconListStyleUpperRoman
                },
                {
                    label: t('Toggle the lower–latin list style'),
                    tooltip: t('Lower-latin'),
                    type: 'lower-latin',
                    icon: IconListStyleLowerLatin
                },
                {
                    label: t('Toggle the upper–latin list style'),
                    tooltip: t('Upper-latin'),
                    type: 'upper-latin',
                    icon: IconListStyleUpperLatin
                },
                {
                    label: t('Toggle the arabic-indic list style'),
                    tooltip: t('Arabic-indic'),
                    type: 'arabic-indic',
                    icon: IconListStyleArabicIndic
                }
            ];
            const buttonLabel = t('Numbered List');
            const styleGridAriaLabel = t('Numbered list styles toolbar');
            const commandName = 'numberedList';
            editor.ui.componentFactory.add(commandName, getDropdownViewCreator({
                editor,
                normalizedConfig,
                parentCommandName: commandName,
                buttonLabel,
                buttonIcon: IconNumberedList,
                styleGridAriaLabel,
                styleDefinitions
            }));
            // Menu bar menu does not display list start index or reverse UI. If there are no styles enabled,
            // the menu makes no sense and should be omitted.
            if (stylesListTypes.includes('numbered')) {
                editor.ui.componentFactory.add(`menuBar:${commandName}`, getMenuBarStylesMenuCreator({
                    editor,
                    normalizedConfig,
                    parentCommandName: commandName,
                    buttonLabel,
                    styleGridAriaLabel,
                    styleDefinitions
                }));
            }
        }
    }
}
/**
 * A helper that returns a function that creates a split button with a toolbar in the dropdown,
 * which in turn contains buttons allowing users to change list styles in the context of the current selection.
 *
 * @param options.editor
 * @param options.normalizedConfig List properties configuration.
 * @param options.parentCommandName The name of the higher-order editor command associated with
 * the set of particular list styles (e.g. "bulletedList" for "disc", "circle", and "square" styles).
 * @param options.buttonLabel Label of the main part of the split button.
 * @param options.buttonIcon The SVG string of an icon for the main part of the split button.
 * @param options.styleGridAriaLabel The ARIA label for the styles grid in the split button dropdown.
 * @param options.styleDefinitions Definitions of the style buttons.
 * @returns A function that can be passed straight into {@link module:ui/componentfactory~ComponentFactory#add}.
 */ function getDropdownViewCreator({ editor, normalizedConfig, parentCommandName, buttonLabel, buttonIcon, styleGridAriaLabel, styleDefinitions }) {
    const parentCommand = editor.commands.get(parentCommandName);
    return (locale)=>{
        const dropdownView = createDropdown(locale, SplitButtonView);
        const mainButtonView = dropdownView.buttonView;
        dropdownView.bind('isEnabled').to(parentCommand);
        dropdownView.class = 'ck-list-styles-dropdown';
        // Main button was clicked.
        mainButtonView.on('execute', ()=>{
            editor.execute(parentCommandName);
            editor.editing.view.focus();
        });
        mainButtonView.set({
            label: buttonLabel,
            icon: buttonIcon,
            tooltip: true,
            isToggleable: true
        });
        mainButtonView.bind('isOn').to(parentCommand, 'value', (value)=>!!value);
        dropdownView.once('change:isOpen', ()=>{
            const listPropertiesView = createListPropertiesView({
                editor,
                normalizedConfig,
                dropdownView,
                parentCommandName,
                styleGridAriaLabel,
                styleDefinitions
            });
            dropdownView.panelView.children.add(listPropertiesView);
        });
        // Focus the editable after executing the command.
        // Overrides a default behaviour where the focus is moved to the dropdown button (#12125).
        dropdownView.on('execute', ()=>{
            editor.editing.view.focus();
        });
        return dropdownView;
    };
}
/**
 * A helper that returns a function (factory) that creates individual buttons used by users to change styles
 * of lists.
 *
 * @param options.editor
 * @param options.listStyleCommand The instance of the `ListStylesCommand` class.
 * @param options.parentCommandName The name of the higher-order command associated with a
 * particular list style (e.g. "bulletedList" is associated with "square" and "numberedList" is associated with "roman").
 * @returns A function that can be passed straight into {@link module:ui/componentfactory~ComponentFactory#add}.
 */ function getStyleButtonCreator({ editor, listStyleCommand, parentCommandName }) {
    const locale = editor.locale;
    const parentCommand = editor.commands.get(parentCommandName);
    return ({ label, type, icon, tooltip })=>{
        const button = new ButtonView(locale);
        button.set({
            label,
            icon,
            tooltip
        });
        button.bind('isOn').to(listStyleCommand, 'value', (value)=>value === type);
        button.on('execute', ()=>{
            // If the content the selection is anchored to is a list, let's change its style.
            if (parentCommand.value) {
                // Remove the list when the current list style is the same as the one that would normally be applied.
                if (listStyleCommand.value === type) {
                    editor.execute(parentCommandName);
                } else if (listStyleCommand.value !== type) {
                    editor.execute('listStyle', {
                        type
                    });
                }
            } else {
                editor.model.change(()=>{
                    editor.execute('listStyle', {
                        type
                    });
                });
            }
        });
        return button;
    };
}
/**
 * A helper that creates the properties view for the individual style dropdown.
 *
 * @param options.editor Editor instance.
 * @param options.normalizedConfig List properties configuration.
 * @param options.dropdownView Styles dropdown view that hosts the properties view.
 * @param options.parentCommandName The name of the higher-order editor command associated with
 * the set of particular list styles (e.g. "bulletedList" for "disc", "circle", and "square" styles).
 * @param options.styleDefinitions Definitions of the style buttons.
 * @param options.styleGridAriaLabel An assistive technologies label set on the grid of styles (if the grid is rendered).
 */ function createListPropertiesView({ editor, normalizedConfig, dropdownView, parentCommandName, styleDefinitions, styleGridAriaLabel }) {
    const locale = editor.locale;
    const enabledProperties = {
        ...normalizedConfig,
        ...parentCommandName != 'numberedList' ? {
            startIndex: false,
            reversed: false
        } : null
    };
    const listType = parentCommandName.replace('List', '');
    let styleButtonViews = null;
    if (normalizedConfig.styles.listTypes.includes(listType)) {
        const listStyleCommand = editor.commands.get('listStyle');
        const styleButtonCreator = getStyleButtonCreator({
            editor,
            parentCommandName,
            listStyleCommand
        });
        const configuredListStylesTypes = normalizedConfig.styles.listStyleTypes;
        let filteredDefinitions = styleDefinitions;
        if (configuredListStylesTypes) {
            const allowedTypes = configuredListStylesTypes[listType];
            if (allowedTypes) {
                filteredDefinitions = styleDefinitions.filter((def)=>allowedTypes.includes(def.type));
            }
        }
        const isStyleTypeSupported = getStyleTypeSupportChecker(listStyleCommand);
        styleButtonViews = filteredDefinitions.filter(isStyleTypeSupported).map(styleButtonCreator);
    }
    const listPropertiesView = new ListPropertiesView(locale, {
        styleGridAriaLabel,
        enabledProperties,
        styleButtonViews
    });
    if (normalizedConfig.styles.listTypes.includes(listType)) {
        // Accessibility: focus the first active style when opening the dropdown.
        focusChildOnDropdownOpen(dropdownView, ()=>{
            return listPropertiesView.stylesView.children.find((child)=>child.isOn);
        });
    }
    if (enabledProperties.startIndex) {
        const listStartCommand = editor.commands.get('listStart');
        listPropertiesView.startIndexFieldView.bind('isEnabled').to(listStartCommand);
        listPropertiesView.startIndexFieldView.fieldView.bind('value').to(listStartCommand);
        listPropertiesView.on('listStart', (evt, data)=>editor.execute('listStart', data));
    }
    if (enabledProperties.reversed) {
        const listReversedCommand = editor.commands.get('listReversed');
        listPropertiesView.reversedSwitchButtonView.bind('isEnabled').to(listReversedCommand);
        listPropertiesView.reversedSwitchButtonView.bind('isOn').to(listReversedCommand, 'value', (value)=>!!value);
        listPropertiesView.on('listReversed', ()=>{
            const isReversed = listReversedCommand.value;
            editor.execute('listReversed', {
                reversed: !isReversed
            });
        });
    }
    // Make sure applying styles closes the dropdown.
    listPropertiesView.delegate('execute').to(dropdownView);
    return listPropertiesView;
}
/**
 * A helper that creates the list style submenu for menu bar.
 *
 * @param editor Editor instance.
 * @param normalizedConfig List properties configuration.
 * @param parentCommandName Name of the list command.
 * @param buttonLabel Label of the menu button.
 * @param styleGridAriaLabel ARIA label of the styles grid.
 */ function getMenuBarStylesMenuCreator({ editor, normalizedConfig, parentCommandName, buttonLabel, styleGridAriaLabel, styleDefinitions }) {
    return (locale)=>{
        const menuView = new MenuBarMenuView(locale);
        const listCommand = editor.commands.get(parentCommandName);
        const listStyleCommand = editor.commands.get('listStyle');
        const isStyleTypeSupported = getStyleTypeSupportChecker(listStyleCommand);
        const styleButtonCreator = getStyleButtonCreator({
            editor,
            parentCommandName,
            listStyleCommand
        });
        const configuredListStylesTypes = normalizedConfig.styles.listStyleTypes;
        let filteredDefinitions = styleDefinitions;
        if (configuredListStylesTypes) {
            const listType = listCommand.type;
            const allowedTypes = configuredListStylesTypes[listType];
            if (allowedTypes) {
                filteredDefinitions = styleDefinitions.filter((def)=>allowedTypes.includes(def.type));
            }
        }
        const styleButtonViews = filteredDefinitions.filter(isStyleTypeSupported).map(styleButtonCreator);
        const listPropertiesView = new ListPropertiesView(locale, {
            styleGridAriaLabel,
            enabledProperties: {
                ...normalizedConfig,
                // Disable list start index and reversed in the menu bar.
                startIndex: false,
                reversed: false
            },
            styleButtonViews
        });
        listPropertiesView.delegate('execute').to(menuView);
        menuView.buttonView.set({
            label: buttonLabel,
            icon: parentCommandName === 'bulletedList' ? IconBulletedList : IconNumberedList
        });
        menuView.panelView.children.add(listPropertiesView);
        menuView.bind('isEnabled').to(listCommand, 'isEnabled');
        menuView.on('execute', ()=>{
            editor.editing.view.focus();
        });
        return menuView;
    };
}
function getStyleTypeSupportChecker(listStyleCommand) {
    if (typeof listStyleCommand.isStyleTypeSupported == 'function') {
        return (styleDefinition)=>listStyleCommand.isStyleTypeSupported(styleDefinition.type);
    } else {
        return ()=>true;
    }
}

/**
 * The list properties feature.
 *
 * This is a "glue" plugin that loads the
 * {@link module:list/listproperties/listpropertiesediting~ListPropertiesEditing list properties
 * editing feature} and the {@link module:list/listproperties/listpropertiesui~ListPropertiesUI list properties UI feature}.
 */ class ListProperties extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ListPropertiesEditing,
            ListPropertiesUI
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ListProperties';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

/**
 * The check to-do command.
 *
 * The command is registered by the {@link module:list/todolist/todolistediting~TodoListEditing} as
 * the `checkTodoList` editor command.
 */ class CheckTodoListCommand extends Command {
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        // Refresh command before executing to be sure all values are up to date.
        // It is needed when selection has changed before command execution, in the same change block.
        this.on('execute', ()=>{
            this.refresh();
        }, {
            priority: 'highest'
        });
    }
    /**
	 * Updates the command's {@link #value} and {@link #isEnabled} properties based on the current selection.
	 */ refresh() {
        const selectedElements = this._getSelectedItems();
        this.value = this._getValue(selectedElements);
        this.isEnabled = !!selectedElements.length;
    }
    /**
	 * Executes the command.
	 *
	 * @param options.forceValue If set, it will force the command behavior. If `true`, the command will apply
	 * the attribute. Otherwise, the command will remove the attribute. If not set, the command will look for its current
	 * value to decide what it should do.
	 */ execute(options = {}) {
        this.editor.model.change((writer)=>{
            const selectedElements = this._getSelectedItems();
            const value = options.forceValue === undefined ? !this._getValue(selectedElements) : options.forceValue;
            for (const element of selectedElements){
                if (value) {
                    writer.setAttribute('todoListChecked', true, element);
                } else {
                    writer.removeAttribute('todoListChecked', element);
                }
            }
        });
    }
    /**
	 * Returns a value for the command.
	 */ _getValue(selectedElements) {
        return selectedElements.every((element)=>element.getAttribute('todoListChecked'));
    }
    /**
	 * Gets all to-do list items selected by the {@link module:engine/model/selection~ModelSelection}.
	 */ _getSelectedItems() {
        const model = this.editor.model;
        const schema = model.schema;
        const selectionRange = model.document.selection.getFirstRange();
        const startElement = selectionRange.start.parent;
        const elements = [];
        if (schema.checkAttribute(startElement, 'todoListChecked')) {
            elements.push(...getAllListItemBlocks(startElement));
        }
        for (const item of selectionRange.getItems({
            shallow: true
        })){
            if (schema.checkAttribute(item, 'todoListChecked') && !elements.includes(item)) {
                elements.push(...getAllListItemBlocks(item));
            }
        }
        return elements;
    }
}

/**
 * Observes all to-do list checkboxes state changes.
 *
 * Note that this observer is not available by default. To make it available it needs to be added to
 * {@link module:engine/view/view~EditingView} by {@link module:engine/view/view~EditingView#addObserver} method.
 *
 * @internal
 */ class TodoCheckboxChangeObserver extends DomEventObserver {
    /**
	 * @inheritDoc
	 */ domEventType = [
        'change'
    ];
    /**
	 * @inheritDoc
	 */ onDomEvent(domEvent) {
        if (domEvent.target) {
            const viewTarget = this.view.domConverter.mapDomToView(domEvent.target);
            if (viewTarget && viewTarget.is('element', 'input') && viewTarget.getAttribute('type') == 'checkbox' && viewTarget.findAncestor({
                classes: 'todo-list__label'
            })) {
                this.fire('todoCheckboxChange', domEvent);
            }
        }
    }
}

const ITEM_TOGGLE_KEYSTROKE$1 = /* #__PURE__ */ parseKeystroke('Ctrl+Enter');
/**
 * The engine of the to-do list feature. It handles creating, editing and removing to-do lists and their items.
 *
 * It registers the entire functionality of the {@link module:list/list/listediting~ListEditing list editing plugin}
 * and extends it with the commands:
 *
 * - `'todoList'`,
 * - `'checkTodoList'`,
 */ class TodoListEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TodoListEditing';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ListEditing
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const model = editor.model;
        const editing = editor.editing;
        const listEditing = editor.plugins.get(ListEditing);
        const multiBlock = editor.config.get('list.multiBlock');
        const elementName = multiBlock ? 'paragraph' : 'listItem';
        editor.commands.add('todoList', new ListCommand(editor, 'todo'));
        editor.commands.add('checkTodoList', new CheckTodoListCommand(editor));
        editing.view.addObserver(TodoCheckboxChangeObserver);
        model.schema.extend('$listItem', {
            allowAttributes: 'todoListChecked'
        });
        model.schema.addAttributeCheck((context)=>{
            const item = context.last;
            // Don't allow `todoListChecked` attribute on elements which are not todo list items.
            if (!item.getAttribute('listItemId') || item.getAttribute('listType') != 'todo') {
                return false;
            }
        }, 'todoListChecked');
        editor.conversion.for('upcast').add((dispatcher)=>{
            // Upcast of to-do list item is based on a checkbox at the beginning of a <li> to keep compatibility with markdown input.
            dispatcher.on('element:input', todoItemInputConverter());
            // Priority is set to low to allow generic list item converter to run first.
            dispatcher.on('element:li', todoListItemUpcastConverter(), {
                priority: 'low'
            });
            // Consume other elements that are normally generated in data downcast, so they won't get captured by GHS.
            dispatcher.on('element:label', elementUpcastConsumingConverter({
                name: 'label',
                classes: 'todo-list__label'
            }));
            dispatcher.on('element:label', elementUpcastConsumingConverter({
                name: 'label',
                classes: [
                    'todo-list__label',
                    'todo-list__label_without-description'
                ]
            }));
            dispatcher.on('element:span', elementUpcastConsumingConverter({
                name: 'span',
                classes: 'todo-list__label__description'
            }));
            dispatcher.on('element:ul', attributeUpcastConsumingConverter({
                name: 'ul',
                classes: 'todo-list'
            }));
        });
        editor.conversion.for('downcast').elementToElement({
            model: elementName,
            view: (element, { writer })=>{
                if (isDescriptionBlock(element, listEditing.getListAttributeNames())) {
                    return writer.createContainerElement('span', {
                        class: 'todo-list__label__description'
                    });
                }
            },
            converterPriority: 'highest'
        });
        listEditing.registerDowncastStrategy({
            scope: 'list',
            attributeName: 'listType',
            setAttributeOnDowncast (writer, value, element) {
                if (value == 'todo') {
                    writer.addClass('todo-list', element);
                } else {
                    writer.removeClass('todo-list', element);
                }
            }
        });
        listEditing.registerDowncastStrategy({
            scope: 'itemMarker',
            attributeName: 'todoListChecked',
            createElement (writer, modelElement, { dataPipeline }) {
                if (modelElement.getAttribute('listType') != 'todo') {
                    return null;
                }
                const viewElement = writer.createUIElement('input', {
                    type: 'checkbox',
                    ...modelElement.getAttribute('todoListChecked') ? {
                        checked: 'checked'
                    } : null,
                    ...dataPipeline ? {
                        disabled: 'disabled'
                    } : {
                        tabindex: '-1'
                    }
                });
                if (dataPipeline) {
                    return viewElement;
                }
                const wrapper = writer.createContainerElement('span', {
                    contenteditable: 'false'
                }, viewElement);
                wrapper.getFillerOffset = ()=>null;
                return wrapper;
            },
            canWrapElement (modelElement) {
                return isDescriptionBlock(modelElement, listEditing.getListAttributeNames());
            },
            createWrapperElement (writer, modelElement, { dataPipeline }) {
                const classes = [
                    'todo-list__label'
                ];
                if (!isDescriptionBlock(modelElement, listEditing.getListAttributeNames())) {
                    classes.push('todo-list__label_without-description');
                }
                return writer.createAttributeElement(dataPipeline ? 'label' : 'span', {
                    class: classes.join(' ')
                });
            }
        });
        // Verifies if a to-do list block requires reconversion of a first item downcasted as an item description.
        listEditing.on('checkElement', (evt, { modelElement, viewElement })=>{
            const isFirstTodoModelParagraphBlock = isDescriptionBlock(modelElement, listEditing.getListAttributeNames());
            const hasViewClass = viewElement.hasClass('todo-list__label__description');
            if (hasViewClass != isFirstTodoModelParagraphBlock) {
                evt.return = true;
                evt.stop();
            }
        });
        // Verifies if a to-do list block requires reconversion of a checkbox element
        // (for example there is a new paragraph inserted as a first block of a list item).
        listEditing.on('checkElement', (evt, { modelElement, viewElement })=>{
            const isFirstTodoModelItemBlock = modelElement.getAttribute('listType') == 'todo' && isFirstBlockOfListItem(modelElement);
            let hasViewItemMarker = false;
            const viewWalker = editor.editing.view.createPositionBefore(viewElement).getWalker({
                direction: 'backward'
            });
            for (const { item } of viewWalker){
                if (item.is('element') && editor.editing.mapper.toModelElement(item)) {
                    break;
                }
                if (item.is('element', 'input') && item.getAttribute('type') == 'checkbox') {
                    hasViewItemMarker = true;
                }
            }
            if (hasViewItemMarker != isFirstTodoModelItemBlock) {
                evt.return = true;
                evt.stop();
            }
        });
        // Make sure that all blocks of the same list item have the same todoListChecked attribute.
        listEditing.on('postFixer', (evt, { listNodes, writer })=>{
            for (const { node, previousNodeInList } of listNodes){
                // This is a first item of a nested list.
                if (!previousNodeInList) {
                    continue;
                }
                if (previousNodeInList.getAttribute('listItemId') != node.getAttribute('listItemId')) {
                    continue;
                }
                const previousHasAttribute = previousNodeInList.hasAttribute('todoListChecked');
                const nodeHasAttribute = node.hasAttribute('todoListChecked');
                if (nodeHasAttribute && !previousHasAttribute) {
                    writer.removeAttribute('todoListChecked', node);
                    evt.return = true;
                } else if (!nodeHasAttribute && previousHasAttribute) {
                    writer.setAttribute('todoListChecked', true, node);
                    evt.return = true;
                }
            }
        });
        // Make sure that todoListChecked attribute is only present for to-do list items.
        model.document.registerPostFixer((writer)=>{
            const changes = model.document.differ.getChanges();
            let wasFixed = false;
            for (const change of changes){
                if (change.type == 'attribute' && change.attributeKey == 'listType') {
                    const element = change.range.start.nodeAfter;
                    if (change.attributeOldValue == 'todo' && element.hasAttribute('todoListChecked')) {
                        writer.removeAttribute('todoListChecked', element);
                        wasFixed = true;
                    }
                } else if (change.type == 'insert' && change.name != '$text') {
                    for (const { item } of writer.createRangeOn(change.position.nodeAfter)){
                        if (item.is('element') && item.getAttribute('listType') != 'todo' && item.hasAttribute('todoListChecked')) {
                            writer.removeAttribute('todoListChecked', item);
                            wasFixed = true;
                        }
                    }
                }
            }
            return wasFixed;
        });
        // Toggle check state of selected to-do list items on keystroke.
        this.listenTo(editing.view.document, 'keydown', (evt, data)=>{
            if (getCode(data) === ITEM_TOGGLE_KEYSTROKE$1) {
                editor.execute('checkTodoList');
                evt.stop();
            }
        }, {
            priority: 'high'
        });
        // Toggle check state of a to-do list item clicked on the checkbox.
        this.listenTo(editing.view.document, 'todoCheckboxChange', (evt, data)=>{
            const viewTarget = data.target;
            if (!viewTarget || !viewTarget.is('element', 'input')) {
                return;
            }
            const viewPositionAfter = editing.view.createPositionAfter(viewTarget);
            const modelPositionAfter = editing.mapper.toModelPosition(viewPositionAfter);
            const modelElement = modelPositionAfter.parent;
            if (modelElement && isListItemBlock(modelElement) && modelElement.getAttribute('listType') == 'todo') {
                this._handleCheckmarkChange(modelElement);
            }
        });
        // Jump at the start/end of the next node on right arrow key press, when selection is before the checkbox.
        //
        // <blockquote><p>Foo{}</p></blockquote>
        // <ul><li><checkbox/>Bar</li></ul>
        //
        // press: `->`
        //
        // <blockquote><p>Foo</p></blockquote>
        // <ul><li><checkbox/>{}Bar</li></ul>
        //
        this.listenTo(editing.view.document, 'arrowKey', jumpOverCheckmarkOnSideArrowKeyPress$1(model, editor.locale), {
            context: '$text'
        });
        // Map view positions inside the checkbox and wrappers to the position in the first block of the list item.
        this.listenTo(editing.mapper, 'viewToModelPosition', (evt, data)=>{
            const viewParent = data.viewPosition.parent;
            const isStartOfListItem = viewParent.is('attributeElement', 'li') && data.viewPosition.offset == 0;
            const isStartOfListLabel = isLabelElement(viewParent) && data.viewPosition.offset <= 1;
            const isInInputWrapper = viewParent.is('element', 'span') && viewParent.getAttribute('contenteditable') == 'false' && isLabelElement(viewParent.parent);
            if (!isStartOfListItem && !isStartOfListLabel && !isInInputWrapper) {
                return;
            }
            const nodeAfter = data.modelPosition.nodeAfter;
            if (nodeAfter && nodeAfter.getAttribute('listType') == 'todo') {
                data.modelPosition = model.createPositionAt(nodeAfter, 0);
            }
        }, {
            priority: 'low'
        });
        this._initAriaAnnouncements();
    }
    /**
	 * Handles the checkbox element change, moves the selection to the corresponding model item to make it possible
	 * to toggle the `todoListChecked` attribute using the command, and restores the selection position.
	 *
	 * Some say it's a hack :) Moving the selection only for executing the command on a certain node and restoring it after,
	 * is not a clear solution. We need to design an API for using commands beyond the selection range.
	 * See https://github.com/ckeditor/ckeditor5/issues/1954.
	 */ _handleCheckmarkChange(listItem) {
        const editor = this.editor;
        const model = editor.model;
        const previousSelectionRanges = Array.from(model.document.selection.getRanges());
        model.change((writer)=>{
            writer.setSelection(listItem, 'end');
            editor.execute('checkTodoList');
            writer.setSelection(previousSelectionRanges);
        });
    }
    /**
	 * Observe when user enters or leaves todo list and set proper aria value in global live announcer.
	 * This allows screen readers to indicate when the user has entered and left the specified todo list.
	 *
	 * @internal
	 */ _initAriaAnnouncements() {
        const { model, ui, t } = this.editor;
        let lastFocusedCodeBlock = null;
        if (!ui) {
            return;
        }
        model.document.selection.on('change:range', ()=>{
            const focusParent = model.document.selection.focus.parent;
            const lastElementIsTodoList = isTodoListItemElement(lastFocusedCodeBlock);
            const currentElementIsTodoList = isTodoListItemElement(focusParent);
            if (lastElementIsTodoList && !currentElementIsTodoList) {
                ui.ariaLiveAnnouncer.announce(t('Leaving a to-do list'));
            } else if (!lastElementIsTodoList && currentElementIsTodoList) {
                ui.ariaLiveAnnouncer.announce(t('Entering a to-do list'));
            }
            lastFocusedCodeBlock = focusParent;
        });
    }
}
/**
 * Returns an upcast converter for to-do list items.
 */ function todoListItemUpcastConverter() {
    return (evt, data, conversionApi)=>{
        const { writer, schema } = conversionApi;
        if (!data.modelRange) {
            return;
        }
        // Group to-do list items by their listItemId attribute to ensure that all items of the same list item have the same checked state.
        const groupedItems = Array.from(data.modelRange.getItems({
            shallow: true
        })).filter((item)=>item.getAttribute('listType') === 'todo' && schema.checkAttribute(item, 'listItemId')).reduce((acc, item)=>{
            const listItemId = item.getAttribute('listItemId');
            if (!acc.has(listItemId)) {
                acc.set(listItemId, getAllListItemBlocks(item));
            }
            return acc;
        }, new Map());
        // During the upcast, we need to ensure that all items of the same list have the same checked state. From time to time
        // the checked state of the items can be different when the user pastes content from the clipboard with <input type="checkbox">
        // that has checked state set to true. In such cases, we need to ensure that all items of the same list have the same checked state.
        // See more: https://github.com/ckeditor/ckeditor5/issues/15602
        for (const [, items] of groupedItems.entries()){
            if (items.some((item)=>item.getAttribute('todoListChecked'))) {
                for (const item of items){
                    writer.setAttribute('todoListChecked', true, item);
                }
            }
        }
    };
}
/**
 * Returns an upcast converter that detects a to-do list checkbox and marks the list item as a to-do list.
 */ function todoItemInputConverter() {
    return (evt, data, conversionApi)=>{
        const modelCursor = data.modelCursor;
        const modelItem = modelCursor.parent;
        const viewItem = data.viewItem;
        if (!conversionApi.consumable.test(viewItem, {
            name: true
        })) {
            return;
        }
        if (viewItem.getAttribute('type') != 'checkbox' || !modelCursor.isAtStart || !modelItem.hasAttribute('listType')) {
            return;
        }
        conversionApi.consumable.consume(viewItem, {
            name: true
        });
        const writer = conversionApi.writer;
        writer.setAttribute('listType', 'todo', modelItem);
        if (data.viewItem.hasAttribute('checked')) {
            writer.setAttribute('todoListChecked', true, modelItem);
        }
        data.modelRange = writer.createRange(modelCursor);
    };
}
/**
 * Returns an upcast converter that consumes element matching the given matcher pattern.
 */ function elementUpcastConsumingConverter(matcherPattern) {
    const matcher = new Matcher(matcherPattern);
    return (evt, data, conversionApi)=>{
        const matcherResult = matcher.match(data.viewItem);
        if (!matcherResult) {
            return;
        }
        if (!conversionApi.consumable.consume(data.viewItem, matcherResult.match)) {
            return;
        }
        Object.assign(data, conversionApi.convertChildren(data.viewItem, data.modelCursor));
    };
}
/**
 * Returns an upcast converter that consumes attributes matching the given matcher pattern.
 */ function attributeUpcastConsumingConverter(matcherPattern) {
    const matcher = new Matcher(matcherPattern);
    return (evt, data, conversionApi)=>{
        const matcherResult = matcher.match(data.viewItem);
        if (!matcherResult) {
            return;
        }
        const match = matcherResult.match;
        match.name = false;
        conversionApi.consumable.consume(data.viewItem, match);
    };
}
/**
 * Returns true if the given list item block should be converted as a description block of a to-do list item.
 */ function isDescriptionBlock(modelElement, listAttributeNames) {
    return (modelElement.is('element', 'paragraph') || modelElement.is('element', 'listItem')) && modelElement.getAttribute('listType') == 'todo' && isFirstBlockOfListItem(modelElement) && hasOnlyListAttributes(modelElement, listAttributeNames);
}
/**
 * Returns true if only attributes from the given list are present on the model element.
 */ function hasOnlyListAttributes(modelElement, attributeNames) {
    for (const attributeKey of modelElement.getAttributeKeys()){
        // Ignore selection attributes stored on block elements.
        if (attributeKey.startsWith('selection:')) {
            continue;
        }
        if (!attributeNames.includes(attributeKey)) {
            return false;
        }
    }
    return true;
}
/**
 * Jump at the start and end of a to-do list item.
 */ function jumpOverCheckmarkOnSideArrowKeyPress$1(model, locale) {
    return (eventInfo, domEventData)=>{
        const direction = getLocalizedArrowKeyCodeDirection(domEventData.keyCode, locale.contentLanguageDirection);
        const schema = model.schema;
        const selection = model.document.selection;
        if (!selection.isCollapsed) {
            return;
        }
        const position = selection.getFirstPosition();
        const parent = position.parent;
        // Right arrow before a to-do list item.
        if (direction == 'right' && position.isAtEnd) {
            const newRange = schema.getNearestSelectionRange(model.createPositionAfter(parent), 'forward');
            if (!newRange) {
                return;
            }
            const newRangeParent = newRange.start.parent;
            if (newRangeParent && isListItemBlock(newRangeParent) && newRangeParent.getAttribute('listType') == 'todo') {
                model.change((writer)=>writer.setSelection(newRange));
                domEventData.preventDefault();
                domEventData.stopPropagation();
                eventInfo.stop();
            }
        } else if (direction == 'left' && position.isAtStart && isListItemBlock(parent) && parent.getAttribute('listType') == 'todo') {
            const newRange = schema.getNearestSelectionRange(model.createPositionBefore(parent), 'backward');
            if (!newRange) {
                return;
            }
            model.change((writer)=>writer.setSelection(newRange));
            domEventData.preventDefault();
            domEventData.stopPropagation();
            eventInfo.stop();
        }
    };
}
/**
 * Returns true if the given element is a label element of a to-do list item.
 */ function isLabelElement(viewElement) {
    return !!viewElement && viewElement.is('attributeElement') && viewElement.hasClass('todo-list__label');
}
/**
 * Returns true if the given element is a list item model element of a to-do list.
 */ function isTodoListItemElement(element) {
    if (!element) {
        return false;
    }
    if (!element.is('element', 'paragraph') && !element.is('element', 'listItem')) {
        return false;
    }
    return element.getAttribute('listType') == 'todo';
}

/**
 * The to-do list UI feature. It introduces the `'todoList'` button that
 * allows to convert elements to and from to-do list items and to indent or outdent them.
 */ class TodoListUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TodoListUI';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const t = this.editor.t;
        createUIComponents(this.editor, 'todoList', t('To-do List'), IconTodoList);
    }
}

/**
 * The to-do list feature.
 *
 * This is a "glue" plugin that loads the {@link module:list/todolist/todolistediting~TodoListEditing to-do list
 * editing feature} and the {@link module:list/todolist/todolistui~TodoListUI to-do list UI feature}.
 */ class TodoList extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            TodoListEditing,
            TodoListUI
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TodoList';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

/**
 * The list command. It is used by the {@link module:list/legacylist~LegacyList legacy list feature}.
 */ class LegacyListCommand extends Command {
    /**
	 * The type of the list created by the command.
	 */ type;
    /**
	 * Creates an instance of the command.
	 *
	 * @param editor The editor instance.
	 * @param type List type that will be handled by this command.
	 */ constructor(editor, type){
        super(editor);
        this.type = type;
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        this.value = this._getValue();
        this.isEnabled = this._checkEnabled();
    }
    /**
	 * Executes the list command.
	 *
	 * @fires execute
	 * @param options Command options.
	 * @param options.forceValue If set, it will force the command behavior. If `true`, the command will try to convert the
	 * selected items and potentially the neighbor elements to the proper list items. If set to `false`, it will convert selected elements
	 * to paragraphs. If not set, the command will toggle selected elements to list items or paragraphs, depending on the selection.
	 */ execute(options = {}) {
        const model = this.editor.model;
        const document = model.document;
        const blocks = Array.from(document.selection.getSelectedBlocks()).filter((block)=>checkCanBecomeListItem(block, model.schema));
        // Whether we are turning off some items.
        const turnOff = options.forceValue !== undefined ? !options.forceValue : this.value;
        // If we are turning off items, we are going to rename them to paragraphs.
        model.change((writer)=>{
            // If part of a list got turned off, we need to handle (outdent) all of sub-items of the last turned-off item.
            // To be sure that model is all the time in a good state, we first fix items below turned-off item.
            if (turnOff) {
                // Start from the model item that is just after the last turned-off item.
                let next = blocks[blocks.length - 1].nextSibling;
                let currentIndent = Number.POSITIVE_INFINITY;
                let changes = [];
                // Correct indent of all items after the last turned off item.
                // Rules that should be followed:
                // 1. All direct sub-items of turned-off item should become indent 0, because the first item after it
                //    will be the first item of a new list. Other items are at the same level, so should have same 0 index.
                // 2. All items with indent lower than indent of turned-off item should become indent 0, because they
                //    should not end up as a child of any of list items that they were not children of before.
                // 3. All other items should have their indent changed relatively to it's parent.
                //
                // For example:
                // 1  * --------
                // 2     * --------
                // 3        * --------			<-- this is turned off.
                // 4           * --------		<-- this has to become indent = 0, because it will be first item on a new list.
                // 5              * --------	<-- this should be still be a child of item above, so indent = 1.
                // 6        * --------			<-- this has to become indent = 0, because it should not be a child of any of items above.
                // 7           * --------		<-- this should be still be a child of item above, so indent = 1.
                // 8     * --------				<-- this has to become indent = 0.
                // 9        * --------			<-- this should still be a child of item above, so indent = 1.
                // 10          * --------		<-- this should still be a child of item above, so indent = 2.
                // 11          * --------		<-- this should still be at the same level as item above, so indent = 2.
                // 12 * --------				<-- this and all below are left unchanged.
                // 13    * --------
                // 14       * --------
                //
                // After turning off 3 the list becomes:
                //
                // 1  * --------
                // 2     * --------
                //
                // 3  --------
                //
                // 4  * --------
                // 5     * --------
                // 6  * --------
                // 7     * --------
                // 8  * --------
                // 9     * --------
                // 10       * --------
                // 11       * --------
                // 12 * --------
                // 13    * --------
                // 14       * --------
                //
                // Thanks to this algorithm no lists are mismatched and no items get unexpected children/parent, while
                // those parent-child connection which are possible to maintain are still maintained. It's worth noting
                // that this is the same effect that we would be get by multiple use of outdent command. However doing
                // it like this is much more efficient because it's less operation (less memory usage, easier OT) and
                // less conversion (faster).
                while(next && next.name == 'listItem' && next.getAttribute('listIndent') !== 0){
                    // Check each next list item, as long as its indent is bigger than 0.
                    // If the indent is 0 we are not going to change anything anyway.
                    const indent = next.getAttribute('listIndent');
                    // We check if that's item indent is lower as current relative indent.
                    if (indent < currentIndent) {
                        // If it is, current relative indent becomes that indent.
                        currentIndent = indent;
                    }
                    // Fix indent relatively to current relative indent.
                    // Note, that if we just changed the current relative indent, the newIndent will be equal to 0.
                    const newIndent = indent - currentIndent;
                    // Save the entry in changes array. We do not apply it at the moment, because we will need to
                    // reverse the changes so the last item is changed first.
                    // This is to keep model in correct state all the time.
                    changes.push({
                        element: next,
                        listIndent: newIndent
                    });
                    // Find next item.
                    next = next.nextSibling;
                }
                changes = changes.reverse();
                for (const item of changes){
                    writer.setAttribute('listIndent', item.listIndent, item.element);
                }
            }
            // If we are turning on, we might change some items that are already `listItem`s but with different type.
            // Changing one nested list item to other type should also trigger changing all its siblings so the
            // whole nested list is of the same type.
            // Example (assume changing to numbered list):
            // * ------				<-- do not fix, top level item
            //   * ------			<-- fix, because latter list item of this item's list is changed
            //      * ------		<-- do not fix, item is not affected (different list)
            //   * ------			<-- fix, because latter list item of this item's list is changed
            //      * ------		<-- fix, because latter list item of this item's list is changed
            //      * ---[--		<-- already in selection
            //   * ------			<-- already in selection
            //   * ------			<-- already in selection
            // * ------				<-- already in selection, but does not cause other list items to change because is top-level
            //   * ---]--			<-- already in selection
            //   * ------			<-- fix, because preceding list item of this item's list is changed
            //      * ------		<-- do not fix, item is not affected (different list)
            // * ------				<-- do not fix, top level item
            if (!turnOff) {
                // Find lowest indent among selected items. This will be indicator what is the indent of
                // top-most list affected by the command.
                let lowestIndent = Number.POSITIVE_INFINITY;
                for (const item of blocks){
                    if (item.is('element', 'listItem') && item.getAttribute('listIndent') < lowestIndent) {
                        lowestIndent = item.getAttribute('listIndent');
                    }
                }
                // Do not execute the fix for top-level lists.
                lowestIndent = lowestIndent === 0 ? 1 : lowestIndent;
                // Fix types of list items that are "before" the selected blocks.
                _fixType(blocks, true, lowestIndent);
                // Fix types of list items that are "after" the selected blocks.
                _fixType(blocks, false, lowestIndent);
            }
            // Phew! Now it will be easier :).
            // For each block element that was in the selection, we will either: turn it to list item,
            // turn it to paragraph, or change it's type. Or leave it as it is.
            // Do it in reverse as there might be multiple blocks (same as with changing indents).
            for (const element of blocks.reverse()){
                if (turnOff && element.name == 'listItem') {
                    // We are turning off and the element is a `listItem` - it should be converted to `paragraph`.
                    // List item specific attributes are removed by post fixer.
                    writer.rename(element, 'paragraph');
                } else if (!turnOff && element.name != 'listItem') {
                    // We are turning on and the element is not a `listItem` - it should be converted to `listItem`.
                    // The order of operations is important to keep model in correct state.
                    writer.setAttributes({
                        listType: this.type,
                        listIndent: 0
                    }, element);
                    writer.rename(element, 'listItem');
                } else if (!turnOff && element.name == 'listItem' && element.getAttribute('listType') != this.type) {
                    // We are turning on and the element is a `listItem` but has different type - change it's type and
                    // type of it's all siblings that have same indent.
                    writer.setAttribute('listType', this.type, element);
                }
            }
            /**
			 * Event fired by the {@link #execute} method.
			 *
			 * It allows to execute an action after executing the {@link ~ListCommand#execute} method, for example adjusting
			 * attributes of changed blocks.
			 *
			 * @protected
			 * @event _executeCleanup
			 */ this.fire('_executeCleanup', blocks);
        });
    }
    /**
	 * Checks the command's {@link #value}.
	 *
	 * @returns The current value.
	 */ _getValue() {
        // Check whether closest `listItem` ancestor of the position has a correct type.
        const listItem = first(this.editor.model.document.selection.getSelectedBlocks());
        return !!listItem && listItem.is('element', 'listItem') && listItem.getAttribute('listType') == this.type;
    }
    /**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @returns Whether the command should be enabled.
	 */ _checkEnabled() {
        // If command value is true it means that we are in list item, so the command should be enabled.
        if (this.value) {
            return true;
        }
        const selection = this.editor.model.document.selection;
        const schema = this.editor.model.schema;
        const firstBlock = first(selection.getSelectedBlocks());
        if (!firstBlock) {
            return false;
        }
        // Otherwise, check if list item can be inserted at the position start.
        return checkCanBecomeListItem(firstBlock, schema);
    }
}
/**
 * Helper function used when one or more list item have their type changed. Fixes type of other list items
 * that are affected by the change (are in same lists) but are not directly in selection. The function got extracted
 * not to duplicated code, as same fix has to be performed before and after selection.
 *
 * @param blocks Blocks that are in selection.
 * @param isBackward Specified whether fix will be applied for blocks before first selected block (`true`)
 * or blocks after last selected block (`false`).
 * @param lowestIndent Lowest indent among selected blocks.
 */ function _fixType(blocks, isBackward, lowestIndent) {
    // We need to check previous sibling of first changed item and next siblings of last changed item.
    const startingItem = isBackward ? blocks[0] : blocks[blocks.length - 1];
    if (startingItem.is('element', 'listItem')) {
        let item = startingItem[isBackward ? 'previousSibling' : 'nextSibling'];
        // During processing items, keeps the lowest indent of already processed items.
        // This saves us from changing too many items.
        // Following example is for going forward as it is easier to read, however same applies to going backward.
        // * ------
        //   * ------
        //     * --[---
        //   * ------		<-- `lowestIndent` should be 1
        //     * --]---		<-- `startingItem`, `currentIndent` = 2, `lowestIndent` == 1
        //     * ------		<-- should be fixed, `indent` == 2 == `currentIndent`
        //   * ------		<-- should be fixed, set `currentIndent` to 1, `indent` == 1 == `currentIndent`
        //     * ------		<-- should not be fixed, item is in different list, `indent` = 2, `indent` != `currentIndent`
        //   * ------		<-- should be fixed, `indent` == 1 == `currentIndent`
        // * ------			<-- break loop (`indent` < `lowestIndent`)
        let currentIndent = startingItem.getAttribute('listIndent');
        // Look back until a list item with indent lower than reference `lowestIndent`.
        // That would be the parent of nested sublist which contains item having `lowestIndent`.
        while(item && item.is('element', 'listItem') && item.getAttribute('listIndent') >= lowestIndent){
            if (currentIndent > item.getAttribute('listIndent')) {
                currentIndent = item.getAttribute('listIndent');
            }
            // Found an item that is in the same nested sublist.
            if (item.getAttribute('listIndent') == currentIndent) {
                // Just add the item to selected blocks like it was selected by the user.
                blocks[isBackward ? 'unshift' : 'push'](item);
            }
            item = item[isBackward ? 'previousSibling' : 'nextSibling'];
        }
    }
}
/**
 * Checks whether the given block can be replaced by a listItem.
 *
 * @param block A block to be tested.
 * @param schema The schema of the document.
 */ function checkCanBecomeListItem(block, schema) {
    return schema.checkChild(block.parent, 'listItem') && !schema.isObject(block);
}

/**
 * The list indent command. It is used by the {@link module:list/legacylist~LegacyList legacy list feature}.
 */ class LegacyIndentCommand extends Command {
    /**
	 * Determines by how much the command will change the list item's indent attribute.
	 */ _indentBy;
    /**
	 * Creates an instance of the command.
	 *
	 * @param editor The editor instance.
	 * @param indentDirection The direction of indent. If it is equal to `backward`, the command will outdent a list item.
	 */ constructor(editor, indentDirection){
        super(editor);
        this._indentBy = indentDirection == 'forward' ? 1 : -1;
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        this.isEnabled = this._checkEnabled();
    }
    /**
	 * Indents or outdents (depending on the {@link #constructor}'s `indentDirection` parameter) selected list items.
	 *
	 * @fires execute
	 */ execute() {
        const model = this.editor.model;
        const doc = model.document;
        let itemsToChange = Array.from(doc.selection.getSelectedBlocks());
        model.change((writer)=>{
            const lastItem = itemsToChange[itemsToChange.length - 1];
            // Indenting a list item should also indent all the items that are already sub-items of indented item.
            let next = lastItem.nextSibling;
            // Check all items after last indented item, as long as their indent is bigger than indent of that item.
            while(next && next.name == 'listItem' && next.getAttribute('listIndent') > lastItem.getAttribute('listIndent')){
                itemsToChange.push(next);
                next = next.nextSibling;
            }
            // We need to be sure to keep model in correct state after each small change, because converters
            // bases on that state and assumes that model is correct.
            // Because of that, if the command outdents items, we will outdent them starting from the last item, as
            // it is safer.
            if (this._indentBy < 0) {
                itemsToChange = itemsToChange.reverse();
            }
            for (const item of itemsToChange){
                const indent = item.getAttribute('listIndent') + this._indentBy;
                // If indent is lower than 0, it means that the item got outdented when it was not indented.
                // This means that we need to convert that list item to paragraph.
                if (indent < 0) {
                    // To keep the model as correct as possible, first rename listItem, then remove attributes,
                    // as listItem without attributes is very incorrect and will cause problems in converters.
                    // No need to remove attributes, will be removed by post fixer.
                    writer.rename(item, 'paragraph');
                } else {
                    writer.setAttribute('listIndent', indent, item);
                }
            }
            // It allows to execute an action after executing the `~IndentCommand#execute` method, for example adjusting
            // attributes of changed list items.
            this.fire('_executeCleanup', itemsToChange);
        });
    }
    /**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @returns Whether the command should be enabled.
	 */ _checkEnabled() {
        // Check whether any of position's ancestor is a list item.
        const listItem = first(this.editor.model.document.selection.getSelectedBlocks());
        // If selection is not in a list item, the command is disabled.
        if (!listItem || !listItem.is('element', 'listItem')) {
            return false;
        }
        if (this._indentBy > 0) {
            // Cannot indent first item in it's list. Check if before `listItem` is a list item that is in same list.
            // To be in the same list, the item has to have same attributes and cannot be "split" by an item with lower indent.
            const indent = listItem.getAttribute('listIndent');
            const type = listItem.getAttribute('listType');
            let prev = listItem.previousSibling;
            while(prev && prev.is('element', 'listItem') && prev.getAttribute('listIndent') >= indent){
                if (prev.getAttribute('listIndent') == indent) {
                    // The item is on the same level.
                    // If it has same type, it means that we found a preceding sibling from the same list.
                    // If it does not have same type, it means that `listItem` is on different list (this can happen only
                    // on top level lists, though).
                    return prev.getAttribute('listType') == type;
                }
                prev = prev.previousSibling;
            }
            // Could not find similar list item, this means that `listItem` is first in its list.
            return false;
        }
        // If we are outdenting it is enough to be in list item. Every list item can always be outdented.
        return true;
    }
}

/**
 * Creates a list item {@link module:engine/view/containerelement~ViewContainerElement}.
 *
 * @internal
 * @param writer The writer instance.
 */ function createViewListItemElement(writer) {
    const viewItem = writer.createContainerElement('li');
    viewItem.getFillerOffset = getListItemFillerOffset;
    return viewItem;
}
/**
 * Helper function that creates a `<ul><li></li></ul>` or (`<ol>`) structure out of the given `modelItem` model `listItem` element.
 * Then, it binds the created view list item (`<li>`) with the model `listItem` element.
 * The function then returns the created view list item (`<li>`).
 *
 * @internal
 * @param modelItem Model list item.
 * @param conversionApi Conversion interface.
 * @returns View list element.
 */ function generateLiInUl(modelItem, conversionApi) {
    const mapper = conversionApi.mapper;
    const viewWriter = conversionApi.writer;
    const listType = modelItem.getAttribute('listType') == 'numbered' ? 'ol' : 'ul';
    const viewItem = createViewListItemElement(viewWriter);
    const viewList = viewWriter.createContainerElement(listType, null);
    viewWriter.insert(viewWriter.createPositionAt(viewList, 0), viewItem);
    mapper.bindElements(modelItem, viewItem);
    return viewItem;
}
/**
 * Helper function that inserts a view list at a correct place and merges it with its siblings.
 * It takes a model list item element (`modelItem`) and a corresponding view list item element (`injectedItem`). The view list item
 * should be in a view list element (`<ul>` or `<ol>`) and should be its only child.
 * See comments below to better understand the algorithm.
 *
 * @internal
 * @param modelItem Model list item.
 * @param injectedItem
 * @param conversionApi Conversion interface.
 * @param model The model instance.
 */ function injectViewList(modelItem, injectedItem, conversionApi, model) {
    const injectedList = injectedItem.parent;
    const mapper = conversionApi.mapper;
    const viewWriter = conversionApi.writer;
    // The position where the view list will be inserted.
    let insertPosition = mapper.toViewPosition(model.createPositionBefore(modelItem));
    // 1. Find the previous list item that has the same or smaller indent. Basically we are looking for the first model item
    // that is a "parent" or "sibling" of the injected model item.
    // If there is no such list item, it means that the injected list item is the first item in "its list".
    const refItem = getSiblingListItem(modelItem.previousSibling, {
        sameIndent: true,
        smallerIndent: true,
        listIndent: modelItem.getAttribute('listIndent')
    });
    const prevItem = modelItem.previousSibling;
    if (refItem && refItem.getAttribute('listIndent') == modelItem.getAttribute('listIndent')) {
        // There is a list item with the same indent - we found the same-level sibling.
        // Break the list after it. The inserted view item will be added in the broken space.
        const viewItem = mapper.toViewElement(refItem);
        insertPosition = viewWriter.breakContainer(viewWriter.createPositionAfter(viewItem));
    } else {
        // There is no list item with the same indent. Check the previous model item.
        if (prevItem && prevItem.name == 'listItem') {
            // If it is a list item, it has to have a lower indent.
            // It means that the inserted item should be added to it as its nested item.
            insertPosition = mapper.toViewPosition(model.createPositionAt(prevItem, 'end'));
            // There could be some not mapped elements (eg. span in to-do list) but we need to insert
            // a nested list directly inside the li element.
            const mappedViewAncestor = mapper.findMappedViewAncestor(insertPosition);
            const nestedList = findNestedList(mappedViewAncestor);
            // If there already is some nested list, then use it's position.
            if (nestedList) {
                insertPosition = viewWriter.createPositionBefore(nestedList);
            } else {
                // Else just put new list on the end of list item content.
                insertPosition = viewWriter.createPositionAt(mappedViewAncestor, 'end');
            }
        } else {
            // The previous item is not a list item (or does not exist at all).
            // Just map the position and insert the view item at the mapped position.
            insertPosition = mapper.toViewPosition(model.createPositionBefore(modelItem));
        }
    }
    insertPosition = positionAfterUiElements(insertPosition);
    // Insert the view item.
    viewWriter.insert(insertPosition, injectedList);
    // 2. Handle possible children of the injected model item.
    if (prevItem && prevItem.name == 'listItem') {
        const prevView = mapper.toViewElement(prevItem);
        const walkerBoundaries = viewWriter.createRange(viewWriter.createPositionAt(prevView, 0), insertPosition);
        const walker = walkerBoundaries.getWalker({
            ignoreElementEnd: true
        });
        for (const value of walker){
            if (value.item.is('element', 'li')) {
                const breakPosition = viewWriter.breakContainer(viewWriter.createPositionBefore(value.item));
                const viewList = value.item.parent;
                const targetPosition = viewWriter.createPositionAt(injectedItem, 'end');
                mergeViewLists(viewWriter, targetPosition.nodeBefore, targetPosition.nodeAfter);
                viewWriter.move(viewWriter.createRangeOn(viewList), targetPosition);
                // This is bad, but those lists will be removed soon anyway.
                walker._position = breakPosition;
            }
        }
    } else {
        const nextViewList = injectedList.nextSibling;
        if (nextViewList && (nextViewList.is('element', 'ul') || nextViewList.is('element', 'ol'))) {
            let lastSubChild = null;
            for (const child of nextViewList.getChildren()){
                const modelChild = mapper.toModelElement(child);
                if (modelChild && modelChild.getAttribute('listIndent') > modelItem.getAttribute('listIndent')) {
                    lastSubChild = child;
                } else {
                    break;
                }
            }
            if (lastSubChild) {
                viewWriter.breakContainer(viewWriter.createPositionAfter(lastSubChild));
                viewWriter.move(viewWriter.createRangeOn(lastSubChild.parent), viewWriter.createPositionAt(injectedItem, 'end'));
            }
        }
    }
    // Merge the inserted view list with its possible neighbor lists.
    mergeViewLists(viewWriter, injectedList, injectedList.nextSibling);
    mergeViewLists(viewWriter, injectedList.previousSibling, injectedList);
}
function mergeViewLists(viewWriter, firstList, secondList) {
    // Check if two lists are going to be merged.
    if (!firstList || !secondList || firstList.name != 'ul' && firstList.name != 'ol') {
        return null;
    }
    // Both parameters are list elements, so compare types now.
    if (firstList.name != secondList.name || firstList.getAttribute('class') !== secondList.getAttribute('class')) {
        return null;
    }
    return viewWriter.mergeContainers(viewWriter.createPositionAfter(firstList));
}
/**
 * Helper function that for a given `view.Position`, returns a `view.Position` that is after all `view.UIElement`s that
 * are after the given position.
 *
 * For example:
 * `<container:p>foo^<ui:span></ui:span><ui:span></ui:span>bar</container:p>`
 * For position ^, the position before "bar" will be returned.
 *
 * @internal
 */ function positionAfterUiElements(viewPosition) {
    return viewPosition.getLastMatchingPosition((value)=>value.item.is('uiElement'));
}
/**
 * Helper function that searches for a previous list item sibling of a given model item that meets the given criteria
 * passed by the options object.
 *
 * @internal
 * @param options Search criteria.
 * @param options.sameIndent Whether the sought sibling should have the same indentation.
 * @param options.smallerIndent Whether the sought sibling should have a smaller indentation.
 * @param options.listIndent The reference indentation.
 * @param options.direction Walking direction.
 */ function getSiblingListItem(modelItem, options) {
    const sameIndent = !!options.sameIndent;
    const smallerIndent = !!options.smallerIndent;
    const indent = options.listIndent;
    let item = modelItem;
    while(item && item.name == 'listItem'){
        const itemIndent = item.getAttribute('listIndent');
        if (sameIndent && indent == itemIndent || smallerIndent && indent > itemIndent) {
            return item;
        }
        if (options.direction === 'forward') {
            item = item.nextSibling;
        } else {
            item = item.previousSibling;
        }
    }
    return null;
}
/**
 * Returns a first list view element that is direct child of the given view element.
 *
 * @internal
 */ function findNestedList(viewElement) {
    for (const node of viewElement.getChildren()){
        if (node.name == 'ul' || node.name == 'ol') {
            return node;
        }
    }
    return null;
}
/**
 * Returns an array with all `listItem` elements that represent the same list.
 *
 * It means that values of `listIndent`, `listType`, `listStyle`, `listReversed` and `listStart` for all items are equal.
 *
 * Additionally, if the `position` is inside a list item, that list item will be returned as well.
 *
 * @internal
 * @param position Starting position.
 * @param direction Walking direction.
 */ function getSiblingNodes(position, direction) {
    const items = [];
    const listItem = position.parent;
    const walkerOptions = {
        ignoreElementEnd: false,
        startPosition: position,
        shallow: true,
        direction
    };
    const limitIndent = listItem.getAttribute('listIndent');
    const nodes = [
        ...new ModelTreeWalker(walkerOptions)
    ].filter((value)=>value.item.is('element')).map((value)=>value.item);
    for (const element of nodes){
        // If found something else than `listItem`, we're out of the list scope.
        if (!element.is('element', 'listItem')) {
            break;
        }
        // If current parsed item has lower indent that element that the element that was a starting point,
        // it means we left a nested list. Abort searching items.
        //
        // ■ List item 1.       [listIndent=0]
        //     ○ List item 2.[] [listIndent=1], limitIndent = 1,
        //     ○ List item 3.   [listIndent=1]
        // ■ List item 4.       [listIndent=0]
        //
        // Abort searching when leave nested list.
        if (element.getAttribute('listIndent') < limitIndent) {
            break;
        }
        // ■ List item 1.[]     [listIndent=0] limitIndent = 0,
        //     ○ List item 2.   [listIndent=1]
        //     ○ List item 3.   [listIndent=1]
        // ■ List item 4.       [listIndent=0]
        //
        // Ignore nested lists.
        if (element.getAttribute('listIndent') > limitIndent) {
            continue;
        }
        // ■ List item 1.[]  [listType=bulleted]
        // 1. List item 2.   [listType=numbered]
        // 2.List item 3.    [listType=numbered]
        //
        // Abort searching when found a different kind of a list.
        if (element.getAttribute('listType') !== listItem.getAttribute('listType')) {
            break;
        }
        // ■ List item 1.[]  [listType=bulleted]
        // ■ List item 2.    [listType=bulleted]
        // ○ List item 3.    [listType=bulleted]
        // ○ List item 4.    [listType=bulleted]
        //
        // Abort searching when found a different list style,
        if (element.getAttribute('listStyle') !== listItem.getAttribute('listStyle')) {
            break;
        }
        // ... different direction
        if (element.getAttribute('listReversed') !== listItem.getAttribute('listReversed')) {
            break;
        }
        // ... and different start index
        if (element.getAttribute('listStart') !== listItem.getAttribute('listStart')) {
            break;
        }
        if (direction === 'backward') {
            items.unshift(element);
        } else {
            items.push(element);
        }
    }
    return items;
}
/**
 * Returns an array with all `listItem` elements in the model selection.
 *
 * It returns all the items even if only a part of the list is selected, including items that belong to nested lists.
 * If no list is selected, it returns an empty array.
 * The order of the elements is not specified.
 *
 * @internal
 */ function getSelectedListItems(model) {
    const document = model.document;
    // For all selected blocks find all list items that are being selected
    // and update the `listStyle` attribute in those lists.
    let listItems = [
        ...document.selection.getSelectedBlocks()
    ].filter((element)=>element.is('element', 'listItem')).map((element)=>{
        const position = model.change((writer)=>writer.createPositionAt(element, 0));
        return [
            ...getSiblingNodes(position, 'backward'),
            ...getSiblingNodes(position, 'forward')
        ];
    }).flat();
    // Since `getSelectedBlocks()` can return items that belong to the same list, and
    // `getSiblingNodes()` returns the entire list, we need to remove duplicated items.
    listItems = [
        ...new Set(listItems)
    ];
    return listItems;
}
const BULLETED_LIST_STYLE_TYPES = [
    'disc',
    'circle',
    'square'
];
// There's a lot of them (https://www.w3.org/TR/css-counter-styles-3/#typedef-counter-style).
// Let's support only those that can be selected by ListPropertiesUI.
const NUMBERED_LIST_STYLE_TYPES = [
    'decimal',
    'decimal-leading-zero',
    'lower-roman',
    'upper-roman',
    'lower-latin',
    'upper-latin'
];
/**
 * Checks whether the given list-style-type is supported by numbered or bulleted list.
 *
 * @internal
 */ function getListTypeFromListStyleType(listStyleType) {
    if (BULLETED_LIST_STYLE_TYPES.includes(listStyleType)) {
        return 'bulleted';
    }
    if (NUMBERED_LIST_STYLE_TYPES.includes(listStyleType)) {
        return 'numbered';
    }
    return null;
}
/**
 * Implementation of getFillerOffset for view list item element.
 *
 * @returns Block filler offset or `null` if block filler is not needed.
 */ function getListItemFillerOffset() {
    const hasOnlyLists = !this.isEmpty && (this.getChild(0).name == 'ul' || this.getChild(0).name == 'ol');
    if (this.isEmpty || hasOnlyLists) {
        return 0;
    }
    return getViewFillerOffset.call(this);
}

/**
 * A set of helpers related to legacy lists.
 */ class LegacyListUtils extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'LegacyListUtils';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * Checks whether the given list-style-type is supported by numbered or bulleted list.
	 */ getListTypeFromListStyleType(listStyleType) {
        return getListTypeFromListStyleType(listStyleType);
    }
    /**
	 * Returns an array with all `listItem` elements in the model selection.
	 *
	 * It returns all the items even if only a part of the list is selected, including items that belong to nested lists.
	 * If no list is selected, it returns an empty array.
	 * The order of the elements is not specified.
	 */ getSelectedListItems(model) {
        return getSelectedListItems(model);
    }
    /**
	 * Returns an array with all `listItem` elements that represent the same list.
	 *
	 * It means that values of `listIndent`, `listType`, `listStyle`, `listReversed` and `listStart` for all items are equal.
	 *
	 * Additionally, if the `position` is inside a list item, that list item will be returned as well.
	 *
	 * @param position Starting position.
	 * @param direction Walking direction.
	 */ getSiblingNodes(position, direction) {
        return getSiblingNodes(position, direction);
    }
}

/**
 * A model-to-view converter for the `listItem` model element insertion.
 *
 * It creates a `<ul><li></li><ul>` (or `<ol>`) view structure out of a `listItem` model element, inserts it at the correct
 * position, and merges the list with surrounding lists (if available).
 *
 * @internal
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:insert
 * @param model Model instance.
 */ function modelViewInsertion$1(model) {
    return (evt, data, conversionApi)=>{
        const consumable = conversionApi.consumable;
        if (!consumable.test(data.item, 'insert') || !consumable.test(data.item, 'attribute:listType') || !consumable.test(data.item, 'attribute:listIndent')) {
            return;
        }
        consumable.consume(data.item, 'insert');
        consumable.consume(data.item, 'attribute:listType');
        consumable.consume(data.item, 'attribute:listIndent');
        const modelItem = data.item;
        const viewItem = generateLiInUl(modelItem, conversionApi);
        injectViewList(modelItem, viewItem, conversionApi, model);
    };
}
/**
 * A model-to-view converter for the `listItem` model element removal.
 *
 * @internal
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:remove
 * @param model Model instance.
 * @returns Returns a conversion callback.
 */ function modelViewRemove(model) {
    return (evt, data, conversionApi)=>{
        const viewPosition = conversionApi.mapper.toViewPosition(data.position);
        const viewStart = viewPosition.getLastMatchingPosition((value)=>!value.item.is('element', 'li'));
        const viewItem = viewStart.nodeAfter;
        const viewWriter = conversionApi.writer;
        // 1. Break the container after and before the list item.
        // This will create a view list with one view list item - the one to remove.
        viewWriter.breakContainer(viewWriter.createPositionBefore(viewItem));
        viewWriter.breakContainer(viewWriter.createPositionAfter(viewItem));
        // 2. Remove the list with the item to remove.
        const viewList = viewItem.parent;
        const viewListPrev = viewList.previousSibling;
        const removeRange = viewWriter.createRangeOn(viewList);
        const removed = viewWriter.remove(removeRange);
        // 3. Merge the whole created by breaking and removing the list.
        if (viewListPrev && viewListPrev.nextSibling) {
            mergeViewLists(viewWriter, viewListPrev, viewListPrev.nextSibling);
        }
        // 4. Bring back nested list that was in the removed <li>.
        const modelItem = conversionApi.mapper.toModelElement(viewItem);
        hoistNestedLists(modelItem.getAttribute('listIndent') + 1, data.position, removeRange.start, viewItem, conversionApi, model);
        // 5. Unbind removed view item and all children.
        for (const child of viewWriter.createRangeIn(removed).getItems()){
            conversionApi.mapper.unbindViewElement(child);
        }
        evt.stop();
    };
}
/**
 * A model-to-view converter for the `type` attribute change on the `listItem` model element.
 *
 * This change means that the `<li>` element parent changes from `<ul>` to `<ol>` (or vice versa). This is accomplished
 * by breaking view elements and changing their name. The next {@link module:list/legacylist/legacyconverters~modelViewMergeAfterChangeType}
 * converter will attempt to merge split nodes.
 *
 * Splitting this conversion into 2 steps makes it possible to add an additional conversion in the middle.
 * Check {@link module:list/legacytodolist/legacytodolistconverters~modelViewChangeType} to see an example of it.
 *
 * @internal
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute
 */ const modelViewChangeType$1 = (evt, data, conversionApi)=>{
    if (!conversionApi.consumable.test(data.item, evt.name)) {
        return;
    }
    const viewItem = conversionApi.mapper.toViewElement(data.item);
    const viewWriter = conversionApi.writer;
    // Break the container after and before the list item.
    // This will create a view list with one view list item -- the one that changed type.
    viewWriter.breakContainer(viewWriter.createPositionBefore(viewItem));
    viewWriter.breakContainer(viewWriter.createPositionAfter(viewItem));
    // Change name of the view list that holds the changed view item.
    // We cannot just change name property, because that would not render properly.
    const viewList = viewItem.parent;
    const listName = data.attributeNewValue == 'numbered' ? 'ol' : 'ul';
    viewWriter.rename(listName, viewList);
};
/**
 * A model-to-view converter that attempts to merge nodes split by {@link module:list/legacylist/legacyconverters~modelViewChangeType}.
 *
 * @internal
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute
 */ const modelViewMergeAfterChangeType = (evt, data, conversionApi)=>{
    conversionApi.consumable.consume(data.item, evt.name);
    const viewItem = conversionApi.mapper.toViewElement(data.item);
    const viewList = viewItem.parent;
    const viewWriter = conversionApi.writer;
    // Merge the changed view list with other lists, if possible.
    mergeViewLists(viewWriter, viewList, viewList.nextSibling);
    mergeViewLists(viewWriter, viewList.previousSibling, viewList);
};
/**
 * A model-to-view converter for the `listIndent` attribute change on the `listItem` model element.
 *
 * @internal
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute
 * @param model Model instance.
 * @returns Returns a conversion callback.
 */ function modelViewChangeIndent(model) {
    return (evt, data, conversionApi)=>{
        if (!conversionApi.consumable.consume(data.item, 'attribute:listIndent')) {
            return;
        }
        const viewItem = conversionApi.mapper.toViewElement(data.item);
        const viewWriter = conversionApi.writer;
        // 1. Break the container after and before the list item.
        // This will create a view list with one view list item -- the one that changed type.
        viewWriter.breakContainer(viewWriter.createPositionBefore(viewItem));
        viewWriter.breakContainer(viewWriter.createPositionAfter(viewItem));
        // 2. Extract view list with changed view list item and merge "hole" possibly created by breaking and removing elements.
        const viewList = viewItem.parent;
        const viewListPrev = viewList.previousSibling;
        const removeRange = viewWriter.createRangeOn(viewList);
        viewWriter.remove(removeRange);
        if (viewListPrev && viewListPrev.nextSibling) {
            mergeViewLists(viewWriter, viewListPrev, viewListPrev.nextSibling);
        }
        // 3. Bring back nested list that was in the removed <li>.
        hoistNestedLists(data.attributeOldValue + 1, data.range.start, removeRange.start, viewItem, conversionApi, model);
        // 4. Inject view list like it is newly inserted.
        injectViewList(data.item, viewItem, conversionApi, model);
        // 5. Consume insertion of children inside the item. They are already handled by re-building the item in view.
        for (const child of data.item.getChildren()){
            conversionApi.consumable.consume(child, 'insert');
        }
    };
}
/**
 * A special model-to-view converter introduced by the {@link module:list/legacylist~LegacyList list feature}. This converter is fired for
 * insert change of every model item, and should be fired before the actual converter. The converter checks whether the inserted
 * model item is a non-`listItem` element. If it is, and it is inserted inside a view list, the converter breaks the
 * list so the model element is inserted to the view parent element corresponding to its model parent element.
 *
 * The converter prevents such situations:
 *
 * ```xml
 * // Model:                        // View:
 * <listItem>foo</listItem>         <ul>
 * <listItem>bar</listItem>             <li>foo</li>
 *                                      <li>bar</li>
 *                                  </ul>
 *
 * // After change:                 // Correct view guaranteed by this converter:
 * <listItem>foo</listItem>         <ul><li>foo</li></ul><p>xxx</p><ul><li>bar</li></ul>
 * <paragraph>xxx</paragraph>       // Instead of this wrong view state:
 * <listItem>bar</listItem>         <ul><li>foo</li><p>xxx</p><li>bar</li></ul>
 * ```
 *
 * @internal
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:insert
 */ const modelViewSplitOnInsert = (evt, data, conversionApi)=>{
    if (!conversionApi.consumable.test(data.item, evt.name)) {
        return;
    }
    if (data.item.name != 'listItem') {
        let viewPosition = conversionApi.mapper.toViewPosition(data.range.start);
        const viewWriter = conversionApi.writer;
        const lists = [];
        // Break multiple ULs/OLs if there are.
        //
        // Imagine following list:
        //
        // 1 --------
        //   1.1 --------
        //     1.1.1 --------
        //     1.1.2 --------
        //     1.1.3 --------
        //       1.1.3.1 --------
        //   1.2 --------
        //     1.2.1 --------
        // 2 --------
        //
        // Insert paragraph after item 1.1.1:
        //
        // 1 --------
        //   1.1 --------
        //     1.1.1 --------
        //
        // Lorem ipsum.
        //
        //     1.1.2 --------
        //     1.1.3 --------
        //       1.1.3.1 --------
        //   1.2 --------
        //     1.2.1 --------
        // 2 --------
        //
        // In this case 1.1.2 has to become beginning of a new list.
        // We need to break list before 1.1.2 (obvious), then we need to break list also before 1.2.
        // Then we need to move those broken pieces one after another and merge:
        //
        // 1 --------
        //   1.1 --------
        //     1.1.1 --------
        //
        // Lorem ipsum.
        //
        // 1.1.2 --------
        //   1.1.3 --------
        //     1.1.3.1 --------
        // 1.2 --------
        //   1.2.1 --------
        // 2 --------
        //
        while(viewPosition.parent.name == 'ul' || viewPosition.parent.name == 'ol'){
            viewPosition = viewWriter.breakContainer(viewPosition);
            if (viewPosition.parent.name != 'li') {
                break;
            }
            // Remove lists that are after inserted element.
            // They will be brought back later, below the inserted element.
            const removeStart = viewPosition;
            const removeEnd = viewWriter.createPositionAt(viewPosition.parent, 'end');
            // Don't remove if there is nothing to remove.
            if (!removeStart.isEqual(removeEnd)) {
                const removed = viewWriter.remove(viewWriter.createRange(removeStart, removeEnd));
                lists.push(removed);
            }
            viewPosition = viewWriter.createPositionAfter(viewPosition.parent);
        }
        // Bring back removed lists.
        if (lists.length > 0) {
            for(let i = 0; i < lists.length; i++){
                const previousList = viewPosition.nodeBefore;
                const insertedRange = viewWriter.insert(viewPosition, lists[i]);
                viewPosition = insertedRange.end;
                // Don't merge first list! We want a split in that place (this is why this converter is introduced).
                if (i > 0) {
                    const mergePos = mergeViewLists(viewWriter, previousList, previousList.nextSibling);
                    // If `mergePos` is in `previousList` it means that the lists got merged.
                    // In this case, we need to fix insert position.
                    if (mergePos && mergePos.parent == previousList) {
                        viewPosition.offset--;
                    }
                }
            }
            // Merge last inserted list with element after it.
            mergeViewLists(viewWriter, viewPosition.nodeBefore, viewPosition.nodeAfter);
        }
    }
};
/**
 * A special model-to-view converter introduced by the {@link module:list/legacylist~LegacyList list feature}. This converter takes care of
 * merging view lists after something is removed or moved from near them.
 *
 * Example:
 *
 * ```xml
 * // Model:                        // View:
 * <listItem>foo</listItem>         <ul><li>foo</li></ul>
 * <paragraph>xxx</paragraph>       <p>xxx</p>
 * <listItem>bar</listItem>         <ul><li>bar</li></ul>
 *
 * // After change:                 // Correct view guaranteed by this converter:
 * <listItem>foo</listItem>         <ul>
 * <listItem>bar</listItem>             <li>foo</li>
 *                                      <li>bar</li>
 *                                  </ul>
 * ```
 *
 * @internal
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:remove
 */ const modelViewMergeAfter = (evt, data, conversionApi)=>{
    const viewPosition = conversionApi.mapper.toViewPosition(data.position);
    const viewItemPrev = viewPosition.nodeBefore;
    const viewItemNext = viewPosition.nodeAfter;
    // Merge lists if something (remove, move) was done from inside of list.
    // Merging will be done only if both items are view lists of the same type.
    // The check is done inside the helper function.
    mergeViewLists(conversionApi.writer, viewItemPrev, viewItemNext);
};
/**
 * A view-to-model converter that converts the `<li>` view elements into the `listItem` model elements.
 *
 * To set correct values of the `listType` and `listIndent` attributes the converter:
 * * checks `<li>`'s parent,
 * * stores and increases the `conversionApi.store.indent` value when `<li>`'s sub-items are converted.
 *
 * @internal
 * @see module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:element
 */ const viewModelConverter = (evt, data, conversionApi)=>{
    if (conversionApi.consumable.consume(data.viewItem, {
        name: true
    })) {
        const writer = conversionApi.writer;
        // 1. Create `listItem` model element.
        const listItem = writer.createElement('listItem');
        // 2. Handle `listItem` model element attributes.
        const indent = getIndent(data.viewItem);
        writer.setAttribute('listIndent', indent, listItem);
        // Set 'bulleted' as default. If this item is pasted into a context,
        const type = data.viewItem.parent && data.viewItem.parent.name == 'ol' ? 'numbered' : 'bulleted';
        writer.setAttribute('listType', type, listItem);
        if (!conversionApi.safeInsert(listItem, data.modelCursor)) {
            return;
        }
        const nextPosition = viewToModelListItemChildrenConverter(listItem, data.viewItem.getChildren(), conversionApi);
        // Result range starts before the first item and ends after the last.
        data.modelRange = writer.createRange(data.modelCursor, nextPosition);
        conversionApi.updateConversionResult(listItem, data);
    }
};
/**
 * A view-to-model converter for the `<ul>` and `<ol>` view elements that cleans the input view of garbage.
 * This is mostly to clean whitespaces from between the `<li>` view elements inside the view list element, however, also
 * incorrect data can be cleared if the view was incorrect.
 *
 * @internal
 * @see module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:element
 */ const cleanList = (evt, data, conversionApi)=>{
    if (conversionApi.consumable.test(data.viewItem, {
        name: true
    })) {
        // Caching children because when we start removing them iterating fails.
        const children = Array.from(data.viewItem.getChildren());
        for (const child of children){
            const isWrongElement = !(child.is('element', 'li') || isList(child));
            if (isWrongElement) {
                child._remove();
            }
        }
    }
};
/**
 * A view-to-model converter for the `<li>` elements that cleans whitespace formatting from the input view.
 *
 * @internal
 * @see module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:element
 */ const cleanListItem = (evt, data, conversionApi)=>{
    if (conversionApi.consumable.test(data.viewItem, {
        name: true
    })) {
        if (data.viewItem.childCount === 0) {
            return;
        }
        const children = [
            ...data.viewItem.getChildren()
        ];
        let foundList = false;
        for (const child of children){
            if (foundList && !isList(child)) {
                child._remove();
            }
            if (isList(child)) {
                // If this is a <ul> or <ol>, do not process it, just mark that we already visited list element.
                foundList = true;
            }
        }
    }
};
/**
 * Returns a callback for model position to view position mapping for {@link module:engine/conversion/mapper~Mapper}. The callback fixes
 * positions between the `listItem` elements that would be incorrectly mapped because of how list items are represented in the model
 * and in the view.
 *
 * @internal
 */ function modelToViewPosition(view) {
    return (evt, data)=>{
        if (data.isPhantom) {
            return;
        }
        const modelItem = data.modelPosition.nodeBefore;
        if (modelItem && modelItem.is('element', 'listItem')) {
            const viewItem = data.mapper.toViewElement(modelItem);
            const topmostViewList = viewItem.getAncestors().find(isList);
            const walker = view.createPositionAt(viewItem, 0).getWalker();
            for (const value of walker){
                if (value.type == 'elementStart' && value.item.is('element', 'li')) {
                    data.viewPosition = value.previousPosition;
                    break;
                } else if (value.type == 'elementEnd' && value.item == topmostViewList) {
                    data.viewPosition = value.nextPosition;
                    break;
                }
            }
        }
    };
}
/**
 * The callback for view position to model position mapping for {@link module:engine/conversion/mapper~Mapper}. The callback fixes
 * positions between the `<li>` elements that would be incorrectly mapped because of how list items are represented in the model
 * and in the view.
 *
 * @internal
 * @see module:engine/conversion/mapper~Mapper#event:viewToModelPosition
 * @param model Model instance.
 * @returns Returns a conversion callback.
 */ function viewToModelPosition(model) {
    return (evt, data)=>{
        const viewPos = data.viewPosition;
        const viewParent = viewPos.parent;
        const mapper = data.mapper;
        if (viewParent.name == 'ul' || viewParent.name == 'ol') {
            // Position is directly in <ul> or <ol>.
            if (!viewPos.isAtEnd) {
                // If position is not at the end, it must be before <li>.
                // Get that <li>, map it to `listItem` and set model position before that `listItem`.
                const modelNode = mapper.toModelElement(viewPos.nodeAfter);
                data.modelPosition = model.createPositionBefore(modelNode);
            } else {
                // Position is at the end of <ul> or <ol>, so there is no <li> after it to be mapped.
                // There is <li> before the position, but we cannot just map it to `listItem` and set model position after it,
                // because that <li> may contain nested items.
                // We will check "model length" of that <li>, in other words - how many `listItem`s are in that <li>.
                const modelNode = mapper.toModelElement(viewPos.nodeBefore);
                const modelLength = mapper.getModelLength(viewPos.nodeBefore);
                // Then we get model position before mapped `listItem` and shift it accordingly.
                data.modelPosition = model.createPositionBefore(modelNode).getShiftedBy(modelLength);
            }
            evt.stop();
        } else if (viewParent.name == 'li' && viewPos.nodeBefore && (viewPos.nodeBefore.name == 'ul' || viewPos.nodeBefore.name == 'ol')) {
            // In most cases when view position is in <li> it is in text and this is a correct position.
            // However, if position is after <ul> or <ol> we have to fix it -- because in model <ul>/<ol> are not in the `listItem`.
            const modelNode = mapper.toModelElement(viewParent);
            // Check all <ul>s and <ol>s that are in the <li> but before mapped position.
            // Get model length of those elements and then add it to the offset of `listItem` mapped to the original <li>.
            let modelLength = 1; // Starts from 1 because the original <li> has to be counted in too.
            let viewList = viewPos.nodeBefore;
            while(viewList && isList(viewList)){
                modelLength += mapper.getModelLength(viewList);
                viewList = viewList.previousSibling;
            }
            data.modelPosition = model.createPositionBefore(modelNode).getShiftedBy(modelLength);
            evt.stop();
        }
    };
}
/**
 * Post-fixer that reacts to changes on document and fixes incorrect model states.
 *
 * In the example below, there is a correct list structure.
 * Then the middle element is removed so the list structure will become incorrect:
 *
 * ```xml
 * <listItem listType="bulleted" listIndent=0>Item 1</listItem>
 * <listItem listType="bulleted" listIndent=1>Item 2</listItem>   <--- this is removed.
 * <listItem listType="bulleted" listIndent=2>Item 3</listItem>
 * ```
 *
 * The list structure after the middle element is removed:
 *
 * ```xml
 * <listItem listType="bulleted" listIndent=0>Item 1</listItem>
 * <listItem listType="bulleted" listIndent=2>Item 3</listItem>
 * ```
 *
 * Should become:
 *
 * ```xml
 * <listItem listType="bulleted" listIndent=0>Item 1</listItem>
 * <listItem listType="bulleted" listIndent=1>Item 3</listItem>   <--- note that indent got post-fixed.
 * ```
 *
 * @internal
 * @param model The data model.
 * @param writer The writer to do changes with.
 * @returns `true` if any change has been applied, `false` otherwise.
 */ function modelChangePostFixer(model, writer) {
    const changes = model.document.differ.getChanges();
    const itemToListHead = new Map();
    let applied = false;
    for (const entry of changes){
        if (entry.type == 'insert' && entry.name == 'listItem') {
            _addListToFix(entry.position);
        } else if (entry.type == 'insert' && entry.name != 'listItem') {
            if (entry.name != '$text') {
                // In case of renamed element.
                const item = entry.position.nodeAfter;
                if (item.hasAttribute('listIndent')) {
                    writer.removeAttribute('listIndent', item);
                    applied = true;
                }
                if (item.hasAttribute('listType')) {
                    writer.removeAttribute('listType', item);
                    applied = true;
                }
                if (item.hasAttribute('listStyle')) {
                    writer.removeAttribute('listStyle', item);
                    applied = true;
                }
                if (item.hasAttribute('listReversed')) {
                    writer.removeAttribute('listReversed', item);
                    applied = true;
                }
                if (item.hasAttribute('listStart')) {
                    writer.removeAttribute('listStart', item);
                    applied = true;
                }
                for (const innerItem of Array.from(model.createRangeIn(item)).filter((e)=>e.item.is('element', 'listItem'))){
                    _addListToFix(innerItem.previousPosition);
                }
            }
            const posAfter = entry.position.getShiftedBy(entry.length);
            _addListToFix(posAfter);
        } else if (entry.type == 'remove' && entry.name == 'listItem') {
            _addListToFix(entry.position);
        } else if (entry.type == 'attribute' && entry.attributeKey == 'listIndent') {
            _addListToFix(entry.range.start);
        } else if (entry.type == 'attribute' && entry.attributeKey == 'listType') {
            _addListToFix(entry.range.start);
        }
    }
    for (const listHead of itemToListHead.values()){
        _fixListIndents(listHead);
        _fixListTypes(listHead);
    }
    return applied;
    function _addListToFix(position) {
        const previousNode = position.nodeBefore;
        if (!previousNode || !previousNode.is('element', 'listItem')) {
            const item = position.nodeAfter;
            if (item && item.is('element', 'listItem')) {
                itemToListHead.set(item, item);
            }
        } else {
            let listHead = previousNode;
            if (itemToListHead.has(listHead)) {
                return;
            }
            for(// Cache previousSibling and reuse for performance reasons. See #6581.
            let previousSibling = listHead.previousSibling; previousSibling && previousSibling.is('element', 'listItem'); previousSibling = listHead.previousSibling){
                listHead = previousSibling;
                if (itemToListHead.has(listHead)) {
                    return;
                }
            }
            itemToListHead.set(previousNode, listHead);
        }
    }
    function _fixListIndents(item) {
        let maxIndent = 0;
        let fixBy = null;
        while(item && item.is('element', 'listItem')){
            const itemIndent = item.getAttribute('listIndent');
            if (itemIndent > maxIndent) {
                let newIndent;
                if (fixBy === null) {
                    fixBy = itemIndent - maxIndent;
                    newIndent = maxIndent;
                } else {
                    if (fixBy > itemIndent) {
                        fixBy = itemIndent;
                    }
                    newIndent = itemIndent - fixBy;
                }
                writer.setAttribute('listIndent', newIndent, item);
                applied = true;
            } else {
                fixBy = null;
                maxIndent = item.getAttribute('listIndent') + 1;
            }
            item = item.nextSibling;
        }
    }
    function _fixListTypes(item) {
        let typesStack = [];
        let prev = null;
        while(item && item.is('element', 'listItem')){
            const itemIndent = item.getAttribute('listIndent');
            if (prev && prev.getAttribute('listIndent') > itemIndent) {
                typesStack = typesStack.slice(0, itemIndent + 1);
            }
            if (itemIndent != 0) {
                if (typesStack[itemIndent]) {
                    const type = typesStack[itemIndent];
                    if (item.getAttribute('listType') != type) {
                        writer.setAttribute('listType', type, item);
                        applied = true;
                    }
                } else {
                    typesStack[itemIndent] = item.getAttribute('listType');
                }
            }
            prev = item;
            item = item.nextSibling;
        }
    }
}
/**
 * A fixer for pasted content that includes list items.
 *
 * It fixes indentation of pasted list items so the pasted items match correctly to the context they are pasted into.
 *
 * Example:
 *
 * ```xml
 * <listItem listType="bulleted" listIndent=0>A</listItem>
 * <listItem listType="bulleted" listIndent=1>B^</listItem>
 * // At ^ paste:  <listItem listType="bulleted" listIndent=4>X</listItem>
 * //              <listItem listType="bulleted" listIndent=5>Y</listItem>
 * <listItem listType="bulleted" listIndent=2>C</listItem>
 * ```
 *
 * Should become:
 *
 * ```xml
 * <listItem listType="bulleted" listIndent=0>A</listItem>
 * <listItem listType="bulleted" listIndent=1>BX</listItem>
 * <listItem listType="bulleted" listIndent=2>Y/listItem>
 * <listItem listType="bulleted" listIndent=2>C</listItem>
 * ```
 *
 * @internal
 */ const modelIndentPasteFixer = function(evt, [content, selectable]) {
    const model = this;
    // Check whether inserted content starts from a `listItem`. If it does not, it means that there are some other
    // elements before it and there is no need to fix indents, because even if we insert that content into a list,
    // that list will be broken.
    // Note: we also need to handle singular elements because inserting item with indent 0 into 0,1,[],2
    // would create incorrect model.
    let item = content.is('documentFragment') ? content.getChild(0) : content;
    let selection;
    if (!selectable) {
        selection = model.document.selection;
    } else {
        selection = model.createSelection(selectable);
    }
    if (item && item.is('element', 'listItem')) {
        // Get a reference list item. Inserted list items will be fixed according to that item.
        const pos = selection.getFirstPosition();
        let refItem = null;
        if (pos.parent.is('element', 'listItem')) {
            refItem = pos.parent;
        } else if (pos.nodeBefore && pos.nodeBefore.is('element', 'listItem')) {
            refItem = pos.nodeBefore;
        }
        // If there is `refItem` it means that we do insert list items into an existing list.
        if (refItem) {
            // First list item in `data` has indent equal to 0 (it is a first list item). It should have indent equal
            // to the indent of reference item. We have to fix the first item and all of it's children and following siblings.
            // Indent of all those items has to be adjusted to reference item.
            const indentChange = refItem.getAttribute('listIndent');
            // Fix only if there is anything to fix.
            if (indentChange > 0) {
                // Adjust indent of all "first" list items in inserted data.
                while(item && item.is('element', 'listItem')){
                    item._setAttribute('listIndent', item.getAttribute('listIndent') + indentChange);
                    item = item.nextSibling;
                }
            }
        }
    }
};
/**
 * Helper function that converts children of a given `<li>` view element into corresponding model elements.
 * The function maintains proper order of elements if model `listItem` is split during the conversion
 * due to block children conversion.
 *
 * @param listItemModel List item model element to which converted children will be inserted.
 * @param viewChildren View elements which will be converted.
 * @param conversionApi Conversion interface to be used by the callback.
 * @returns Position on which next elements should be inserted after children conversion.
 */ function viewToModelListItemChildrenConverter(listItemModel, viewChildren, conversionApi) {
    const { writer, schema } = conversionApi;
    // A position after the last inserted `listItem`.
    let nextPosition = writer.createPositionAfter(listItemModel);
    // Check all children of the converted `<li>`. At this point we assume there are no "whitespace" view text nodes
    // in view list, between view list items. This should be handled by `<ul>` and `<ol>` converters.
    for (const child of viewChildren){
        if (child.name == 'ul' || child.name == 'ol') {
            // If the children is a list, we will insert its conversion result after currently handled `listItem`.
            // Then, next insertion position will be set after all the new list items (and maybe other elements if
            // something split list item).
            //
            // If this is a list, we expect that some `listItem`s and possibly other blocks will be inserted, however `.modelCursor`
            // should be set after last `listItem` (or block). This is why it feels safe to use it as `nextPosition`
            nextPosition = conversionApi.convertItem(child, nextPosition).modelCursor;
        } else {
            // If this is not a list, try inserting content at the end of the currently handled `listItem`.
            const result = conversionApi.convertItem(child, writer.createPositionAt(listItemModel, 'end'));
            // It may end up that the current `listItem` becomes split (if that content cannot be inside `listItem`). For example:
            //
            // <li><p>Foo</p></li>
            //
            // will be converted to:
            //
            // <listItem></listItem><paragraph>Foo</paragraph><listItem></listItem>
            //
            const convertedChild = result.modelRange.start.nodeAfter;
            const wasSplit = convertedChild && convertedChild.is('element') && !schema.checkChild(listItemModel, convertedChild.name);
            if (wasSplit) {
                // As `lastListItem` got split, we need to update it to the second part of the split `listItem` element.
                //
                // `modelCursor` should be set to a position where the conversion should continue. There are multiple possible scenarios
                // that may happen. Usually, `modelCursor` (marked as `#` below) would point to the second list item after conversion:
                //
                //		`<li><p>Foo</p></li>` -> `<listItem></listItem><paragraph>Foo</paragraph><listItem>#</listItem>`
                //
                // However, in some cases, like auto-paragraphing, the position is placed at the end of the block element:
                //
                //		`<li><div>Foo</div></li>` -> `<listItem></listItem><paragraph>Foo#</paragraph><listItem></listItem>`
                //
                // or after an element if another element broken auto-paragraphed element:
                //
                //		`<li><div><h2>Foo</h2></div></li>` -> `<listItem></listItem><heading1>Foo</heading1>#<listItem></listItem>`
                //
                // We need to check for such cases and use proper list item and position based on it.
                //
                if (result.modelCursor.parent.is('element', 'listItem')) {
                    // (1).
                    listItemModel = result.modelCursor.parent;
                } else {
                    // (2), (3).
                    listItemModel = findNextListItem(result.modelCursor);
                }
                nextPosition = writer.createPositionAfter(listItemModel);
            }
        }
    }
    return nextPosition;
}
/**
 * Helper function that seeks for a next list item starting from given `startPosition`.
 */ function findNextListItem(startPosition) {
    const treeWalker = new ModelTreeWalker({
        startPosition
    });
    let value;
    do {
        value = treeWalker.next();
    }while (!value.value.item.is('element', 'listItem'))
    return value.value.item;
}
/**
 * Helper function that takes all children of given `viewRemovedItem` and moves them in a correct place, according
 * to other given parameters.
 */ function hoistNestedLists(nextIndent, modelRemoveStartPosition, viewRemoveStartPosition, viewRemovedItem, conversionApi, model) {
    // Find correct previous model list item element.
    // The element has to have either same or smaller indent than given reference indent.
    // This will be the model element which will get nested items (if it has smaller indent) or sibling items (if it has same indent).
    // Keep in mind that such element might not be found, if removed item was the first item.
    const prevModelItem = getSiblingListItem(modelRemoveStartPosition.nodeBefore, {
        sameIndent: true,
        smallerIndent: true,
        listIndent: nextIndent
    });
    const mapper = conversionApi.mapper;
    const viewWriter = conversionApi.writer;
    // Indent of found element or `null` if the element has not been found.
    const prevIndent = prevModelItem ? prevModelItem.getAttribute('listIndent') : null;
    let insertPosition;
    if (!prevModelItem) {
        // If element has not been found, simply insert lists at the position where the removed item was:
        //
        // Lorem ipsum.
        // 1 --------           <--- this is removed, no previous list item, put nested items in place of removed item.
        //   1.1 --------       <--- this is reference indent.
        //     1.1.1 --------
        //     1.1.2 --------
        //   1.2 --------
        //
        // Becomes:
        //
        // Lorem ipsum.
        // 1.1 --------
        //   1.1.1 --------
        //   1.1.2 --------
        // 1.2 --------
        insertPosition = viewRemoveStartPosition;
    } else if (prevIndent == nextIndent) {
        // If element has been found and has same indent as reference indent it means that nested items should
        // become siblings of found element:
        //
        // 1 --------
        //   1.1 --------
        //   1.2 --------       <--- this is `prevModelItem`.
        // 2 --------           <--- this is removed, previous list item has indent same as reference indent.
        //   2.1 --------       <--- this is reference indent, this and 2.2 should become siblings of 1.2.
        //   2.2 --------
        //
        // Becomes:
        //
        // 1 --------
        //   1.1 --------
        //   1.2 --------
        //   2.1 --------
        //   2.2 --------
        const prevViewList = mapper.toViewElement(prevModelItem).parent;
        insertPosition = viewWriter.createPositionAfter(prevViewList);
    } else {
        // If element has been found and has smaller indent as reference indent it means that nested items
        // should become nested items of found item:
        //
        // 1 --------           <--- this is `prevModelItem`.
        //   1.1 --------       <--- this is removed, previous list item has indent smaller than reference indent.
        //     1.1.1 --------   <--- this is reference indent, this and 1.1.1 should become nested items of 1.
        //     1.1.2 --------
        //   1.2 --------
        //
        // Becomes:
        //
        // 1 --------
        //   1.1.1 --------
        //   1.1.2 --------
        //   1.2 --------
        //
        // Note: in this case 1.1.1 have indent 2 while 1 have indent 0. In model that should not be possible,
        // because following item may have indent bigger only by one. But this is fixed by postfixer.
        const modelPosition = model.createPositionAt(prevModelItem, 'end');
        insertPosition = mapper.toViewPosition(modelPosition);
    }
    insertPosition = positionAfterUiElements(insertPosition);
    // Handle multiple lists. This happens if list item has nested numbered and bulleted lists. Following lists
    // are inserted after the first list (no need to recalculate insertion position for them).
    for (const child of [
        ...viewRemovedItem.getChildren()
    ]){
        if (isList(child)) {
            insertPosition = viewWriter.move(viewWriter.createRangeOn(child), insertPosition).end;
            mergeViewLists(viewWriter, child, child.nextSibling);
            mergeViewLists(viewWriter, child.previousSibling, child);
        }
    }
}
/**
 * Checks if view element is a list type (ul or ol).
 */ function isList(viewElement) {
    return viewElement.is('element', 'ol') || viewElement.is('element', 'ul');
}
/**
 * Calculates the indent value for a list item. Handles HTML compliant and non-compliant lists.
 *
 * Also, fixes non HTML compliant lists indents:
 *
 * ```
 * before:                                     fixed list:
 * OL                                          OL
 * |-> LI (parent LIs: 0)                      |-> LI     (indent: 0)
 *     |-> OL                                  |-> OL
 *         |-> OL                                  |
 *         |   |-> OL                              |
 *         |       |-> OL                          |
 *         |           |-> LI (parent LIs: 1)      |-> LI (indent: 1)
 *         |-> LI (parent LIs: 1)                  |-> LI (indent: 1)
 *
 * before:                                     fixed list:
 * OL                                          OL
 * |-> OL                                      |
 *     |-> OL                                  |
 *          |-> OL                             |
 *              |-> LI (parent LIs: 0)         |-> LI        (indent: 0)
 *
 * before:                                     fixed list:
 * OL                                          OL
 * |-> LI (parent LIs: 0)                      |-> LI         (indent: 0)
 * |-> OL                                          |-> OL
 *     |-> LI (parent LIs: 0)                          |-> LI (indent: 1)
 * ```
 */ function getIndent(listItem) {
    let indent = 0;
    let parent = listItem.parent;
    while(parent){
        // Each LI in the tree will result in an increased indent for HTML compliant lists.
        if (parent.is('element', 'li')) {
            indent++;
        } else {
            // If however the list is nested in other list we should check previous sibling of any of the list elements...
            const previousSibling = parent.previousSibling;
            // ...because the we might need increase its indent:
            //		before:                           fixed list:
            //		OL                                OL
            //		|-> LI (parent LIs: 0)            |-> LI         (indent: 0)
            //		|-> OL                                |-> OL
            //		    |-> LI (parent LIs: 0)                |-> LI (indent: 1)
            if (previousSibling && previousSibling.is('element', 'li')) {
                indent++;
            }
        }
        parent = parent.parent;
    }
    return indent;
}

/**
 * The engine of the list feature. It handles creating, editing and removing lists and list items.
 *
 * It registers the `'numberedList'`, `'bulletedList'`, `'indentList'` and `'outdentList'` commands.
 */ class LegacyListEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'LegacyListEditing';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            Enter,
            Delete,
            LegacyListUtils
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        // Schema.
        // Note: in case `$block` will ever be allowed in `listItem`, keep in mind that this feature
        // uses `Selection#getSelectedBlocks()` without any additional processing to obtain all selected list items.
        // If there are blocks allowed inside list item, algorithms using `getSelectedBlocks()` will have to be modified.
        editor.model.schema.register('listItem', {
            inheritAllFrom: '$block',
            allowAttributes: [
                'listType',
                'listIndent'
            ]
        });
        // Converters.
        const data = editor.data;
        const editing = editor.editing;
        editor.model.document.registerPostFixer((writer)=>modelChangePostFixer(editor.model, writer));
        editing.mapper.registerViewToModelLength('li', getViewListItemLength);
        data.mapper.registerViewToModelLength('li', getViewListItemLength);
        editing.mapper.on('modelToViewPosition', modelToViewPosition(editing.view));
        editing.mapper.on('viewToModelPosition', viewToModelPosition(editor.model));
        data.mapper.on('modelToViewPosition', modelToViewPosition(editing.view));
        editor.conversion.for('editingDowncast').add((dispatcher)=>{
            dispatcher.on('insert', modelViewSplitOnInsert, {
                priority: 'high'
            });
            dispatcher.on('insert:listItem', modelViewInsertion$1(editor.model));
            dispatcher.on('attribute:listType:listItem', modelViewChangeType$1, {
                priority: 'high'
            });
            dispatcher.on('attribute:listType:listItem', modelViewMergeAfterChangeType, {
                priority: 'low'
            });
            dispatcher.on('attribute:listIndent:listItem', modelViewChangeIndent(editor.model));
            dispatcher.on('remove:listItem', modelViewRemove(editor.model));
            dispatcher.on('remove', modelViewMergeAfter, {
                priority: 'low'
            });
        });
        editor.conversion.for('dataDowncast').add((dispatcher)=>{
            dispatcher.on('insert', modelViewSplitOnInsert, {
                priority: 'high'
            });
            dispatcher.on('insert:listItem', modelViewInsertion$1(editor.model));
        });
        editor.conversion.for('upcast').add((dispatcher)=>{
            dispatcher.on('element:ul', cleanList, {
                priority: 'high'
            });
            dispatcher.on('element:ol', cleanList, {
                priority: 'high'
            });
            dispatcher.on('element:li', cleanListItem, {
                priority: 'high'
            });
            dispatcher.on('element:li', viewModelConverter);
        });
        // Fix indentation of pasted items.
        editor.model.on('insertContent', modelIndentPasteFixer, {
            priority: 'high'
        });
        // Register commands for numbered and bulleted list.
        editor.commands.add('numberedList', new LegacyListCommand(editor, 'numbered'));
        editor.commands.add('bulletedList', new LegacyListCommand(editor, 'bulleted'));
        // Register commands for indenting.
        editor.commands.add('indentList', new LegacyIndentCommand(editor, 'forward'));
        editor.commands.add('outdentList', new LegacyIndentCommand(editor, 'backward'));
        const viewDocument = editing.view.document;
        // Overwrite default Enter key behavior.
        // If Enter key is pressed with selection collapsed in empty list item, outdent it instead of breaking it.
        this.listenTo(viewDocument, 'enter', (evt, data)=>{
            const doc = this.editor.model.document;
            const positionParent = doc.selection.getLastPosition().parent;
            if (doc.selection.isCollapsed && positionParent.name == 'listItem' && positionParent.isEmpty) {
                this.editor.execute('outdentList');
                data.preventDefault();
                evt.stop();
            }
        }, {
            context: 'li'
        });
        // Overwrite default Backspace key behavior.
        // If Backspace key is pressed with selection collapsed on first position in first list item, outdent it. #83
        this.listenTo(viewDocument, 'delete', (evt, data)=>{
            // Check conditions from those that require less computations like those immediately available.
            if (data.direction !== 'backward') {
                return;
            }
            const selection = this.editor.model.document.selection;
            if (!selection.isCollapsed) {
                return;
            }
            const firstPosition = selection.getFirstPosition();
            if (!firstPosition.isAtStart) {
                return;
            }
            const positionParent = firstPosition.parent;
            if (positionParent.name !== 'listItem') {
                return;
            }
            const previousIsAListItem = positionParent.previousSibling && positionParent.previousSibling.name === 'listItem';
            if (previousIsAListItem) {
                return;
            }
            this.editor.execute('outdentList');
            data.preventDefault();
            evt.stop();
        }, {
            context: 'li'
        });
        this.listenTo(editor.editing.view.document, 'tab', (evt, data)=>{
            const commandName = data.shiftKey ? 'outdentList' : 'indentList';
            const command = this.editor.commands.get(commandName);
            if (command.isEnabled) {
                editor.execute(commandName);
                data.stopPropagation();
                data.preventDefault();
                evt.stop();
            }
        }, {
            context: 'li'
        });
    }
    /**
	 * @inheritDoc
	 */ afterInit() {
        const commands = this.editor.commands;
        const indent = commands.get('indent');
        const outdent = commands.get('outdent');
        if (indent) {
            indent.registerChildCommand(commands.get('indentList'));
        }
        if (outdent) {
            outdent.registerChildCommand(commands.get('outdentList'));
        }
    }
}
function getViewListItemLength(element) {
    let length = 1;
    for (const child of element.getChildren()){
        if (child.name == 'ul' || child.name == 'ol') {
            for (const item of child.getChildren()){
                length += getViewListItemLength(item);
            }
        }
    }
    return length;
}

/**
 * The legacy list feature.
 *
 * This is a "glue" plugin that loads the {@link module:list/legacylist/legacylistediting~LegacyListEditing legacy list editing feature}
 * and {@link module:list/list/listui~ListUI list UI feature}.
 */ class LegacyList extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            LegacyListEditing,
            ListUI
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'LegacyList';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

/**
 * The list style command. It changes the `listStyle` attribute of the selected list items.
 *
 * If the list type (numbered or bulleted) can be inferred from the passed style type,
 * the command tries to convert selected items to a list of that type.
 * It is used by the {@link module:list/legacylistproperties~LegacyListProperties legacy list properties feature}.
 */ class LegacyListStyleCommand extends Command {
    /**
	 * The default type of the list style.
	 */ defaultType;
    /**
	 * Creates an instance of the command.
	 *
	 * @param editor The editor instance.
	 * @param defaultType The list type that will be used by default if the value was not specified during
	 * the command execution.
	 */ constructor(editor, defaultType){
        super(editor);
        this.defaultType = defaultType;
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        this.value = this._getValue();
        this.isEnabled = this._checkEnabled();
    }
    /**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param options.type The type of the list style, e.g. `'disc'` or `'square'`. If `null` is specified, the default
	 * style will be applied.
	 */ execute(options = {}) {
        this._tryToConvertItemsToList(options);
        const model = this.editor.model;
        const listItems = getSelectedListItems(model);
        if (!listItems.length) {
            return;
        }
        model.change((writer)=>{
            for (const item of listItems){
                writer.setAttribute('listStyle', options.type || this.defaultType, item);
            }
        });
    }
    /**
	 * Checks the command's {@link #value}.
	 *
	 * @returns The current value.
	 */ _getValue() {
        const listItem = this.editor.model.document.selection.getFirstPosition().parent;
        if (listItem && listItem.is('element', 'listItem')) {
            return listItem.getAttribute('listStyle');
        }
        return null;
    }
    /**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @returns Whether the command should be enabled.
	 */ _checkEnabled() {
        const editor = this.editor;
        const numberedList = editor.commands.get('numberedList');
        const bulletedList = editor.commands.get('bulletedList');
        return numberedList.isEnabled || bulletedList.isEnabled;
    }
    /**
	 * Checks if the provided list style is valid. Also changes the selection to a list if it's not set yet.
	 *
	 * @param options Additional options.
	 * @param options.type The type of the list style. If `null` is specified, the function does nothing.
	*/ _tryToConvertItemsToList(options) {
        if (!options.type) {
            return;
        }
        const listType = getListTypeFromListStyleType(options.type);
        /* istanbul ignore next -- @preserve */ if (!listType) {
            return;
        }
        const editor = this.editor;
        const commandName = `${listType}List`;
        const command = editor.commands.get(commandName);
        if (!command.value) {
            editor.execute(commandName);
        }
    }
}

/**
 * The reversed list command. It changes the `listReversed` attribute of the selected list items. As a result, the list order will be
 * reversed.
 * It is used by the {@link module:list/legacylistproperties~LegacyListProperties legacy list properties feature}.
 */ class LegacyListReversedCommand extends Command {
    /**
	 * @inheritDoc
	 */ refresh() {
        const value = this._getValue();
        this.value = value;
        this.isEnabled = value != null;
    }
    /**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param options.reversed Whether the list should be reversed.
	 */ execute(options = {}) {
        const model = this.editor.model;
        const listItems = getSelectedListItems(model).filter((item)=>item.getAttribute('listType') == 'numbered');
        model.change((writer)=>{
            for (const item of listItems){
                writer.setAttribute('listReversed', !!options.reversed, item);
            }
        });
    }
    /**
	 * Checks the command's {@link #value}.
	 *
	 * @returns The current value.
	 */ _getValue() {
        const listItem = this.editor.model.document.selection.getFirstPosition().parent;
        if (listItem && listItem.is('element', 'listItem') && listItem.getAttribute('listType') == 'numbered') {
            return listItem.getAttribute('listReversed');
        }
        return null;
    }
}

/**
 * The list start index command. It changes the `listStart` attribute of the selected list items.
 * It is used by the {@link module:list/legacylistproperties~LegacyListProperties legacy list properties feature}.
 */ class LegacyListStartCommand extends Command {
    /**
	 * @inheritDoc
	 */ refresh() {
        const value = this._getValue();
        this.value = value;
        this.isEnabled = value != null;
    }
    /**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param options Execute options.
	 * @param options.startIndex The list start index.
	 */ execute({ startIndex = 1 } = {}) {
        const model = this.editor.model;
        const listItems = getSelectedListItems(model).filter((item)=>item.getAttribute('listType') == 'numbered');
        model.change((writer)=>{
            for (const item of listItems){
                writer.setAttribute('listStart', startIndex >= 0 ? startIndex : 1, item);
            }
        });
    }
    /**
	 * Checks the command's {@link #value}.
	 *
	 * @returns The current value.
	 */ _getValue() {
        const listItem = this.editor.model.document.selection.getFirstPosition().parent;
        if (listItem && listItem.is('element', 'listItem') && listItem.getAttribute('listType') == 'numbered') {
            return listItem.getAttribute('listStart');
        }
        return null;
    }
}

const DEFAULT_LIST_TYPE = 'default';
/**
 * The engine of the list properties feature.
 *
 * It sets the value for the `listItem` attribute of the {@link module:list/legacylist~LegacyList `<listItem>`} element that
 * allows modifying the list style type.
 *
 * It registers the `'listStyle'`, `'listReversed'` and `'listStart'` commands if they are enabled in the configuration.
 * Read more in {@link module:list/listconfig~ListPropertiesConfig}.
 */ class LegacyListPropertiesEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            LegacyListEditing
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'LegacyListPropertiesEditing';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        editor.config.define('list', {
            properties: {
                styles: true,
                startIndex: false,
                reversed: false
            }
        });
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const model = editor.model;
        const enabledProperties = editor.config.get('list.properties');
        const strategies = createAttributeStrategies(enabledProperties);
        // Extend schema.
        model.schema.extend('listItem', {
            allowAttributes: strategies.map((s)=>s.attributeName)
        });
        for (const strategy of strategies){
            strategy.addCommand(editor);
        }
        // Fix list attributes when modifying their nesting levels (the `listIndent` attribute).
        this.listenTo(editor.commands.get('indentList'), '_executeCleanup', fixListAfterIndentListCommand(editor, strategies));
        this.listenTo(editor.commands.get('outdentList'), '_executeCleanup', fixListAfterOutdentListCommand(editor, strategies));
        this.listenTo(editor.commands.get('bulletedList'), '_executeCleanup', restoreDefaultListStyle(editor));
        this.listenTo(editor.commands.get('numberedList'), '_executeCleanup', restoreDefaultListStyle(editor));
        // Register a post-fixer that ensures that the attributes is specified in each `listItem` element.
        model.document.registerPostFixer(fixListAttributesOnListItemElements(editor, strategies));
        // Set up conversion.
        editor.conversion.for('upcast').add(upcastListItemAttributes(strategies));
        editor.conversion.for('downcast').add(downcastListItemAttributes(strategies));
        // Handle merging two separated lists into the single one.
        this._mergeListAttributesWhileMergingLists(strategies);
    }
    /**
	 * @inheritDoc
	 */ afterInit() {
        const editor = this.editor;
        // Enable post-fixer that removes the attributes from to-do list items only if the "TodoList" plugin is on.
        // We need to registry the hook here since the `TodoList` plugin can be added after the `ListPropertiesEditing`.
        if (editor.commands.get('todoList')) {
            editor.model.document.registerPostFixer(removeListItemAttributesFromTodoList(editor));
        }
    }
    /**
	 * Starts listening to {@link module:engine/model/model~Model#deleteContent} and checks whether two lists will be merged into a single
	 * one after deleting the content.
	 *
	 * The purpose of this action is to adjust the `listStyle`, `listReversed` and `listStart` values
	 * for the list that was merged.
	 *
	 * Consider the following model's content:
	 *
	 * ```xml
	 * <listItem listIndent="0" listType="bulleted" listStyle="square">UL List item 1</listItem>
	 * <listItem listIndent="0" listType="bulleted" listStyle="square">UL List item 2</listItem>
	 * <paragraph>[A paragraph.]</paragraph>
	 * <listItem listIndent="0" listType="bulleted" listStyle="circle">UL List item 1</listItem>
	 * <listItem listIndent="0" listType="bulleted" listStyle="circle">UL List item 2</listItem>
	 * ```
	 *
	 * After removing the paragraph element, the second list will be merged into the first one.
	 * We want to inherit the `listStyle` attribute for the second list from the first one.
	 *
	 * ```xml
	 * <listItem listIndent="0" listType="bulleted" listStyle="square">UL List item 1</listItem>
	 * <listItem listIndent="0" listType="bulleted" listStyle="square">UL List item 2</listItem>
	 * <listItem listIndent="0" listType="bulleted" listStyle="square">UL List item 1</listItem>
	 * <listItem listIndent="0" listType="bulleted" listStyle="square">UL List item 2</listItem>
	 * ```
	 *
	 * See https://github.com/ckeditor/ckeditor5/issues/7879.
	 *
	 * @param attributeStrategies Strategies for the enabled attributes.
	 */ _mergeListAttributesWhileMergingLists(attributeStrategies) {
        const editor = this.editor;
        const model = editor.model;
        // First the outer-most`listItem` in the first list reference.
        // If found, the lists should be merged and this `listItem` provides the attributes
        // and it is also a starting point when searching for items in the second list.
        let firstMostOuterItem;
        // Check whether the removed content is between two lists.
        this.listenTo(model, 'deleteContent', (evt, [selection])=>{
            const firstPosition = selection.getFirstPosition();
            const lastPosition = selection.getLastPosition();
            // Typing or removing content in a single item. Aborting.
            if (firstPosition.parent === lastPosition.parent) {
                return;
            }
            // An element before the content that will be removed is not a list.
            if (!firstPosition.parent.is('element', 'listItem')) {
                return;
            }
            const nextSibling = lastPosition.parent.nextSibling;
            // An element after the content that will be removed is not a list.
            if (!nextSibling || !nextSibling.is('element', 'listItem')) {
                return;
            }
            // Find the outermost list item based on the `listIndent` attribute. We can't assume that `listIndent=0`
            // because the selection can be hooked in nested lists.
            //
            // <listItem listIndent="0" listType="bulleted" listStyle="square">UL List item 1</listItem>
            // <listItem listIndent="1" listType="bulleted" listStyle="square">UL List [item 1.1</listItem>
            // <listItem listIndent="0" listType="bulleted" listStyle="circle">[]UL List item 1.</listItem>
            // <listItem listIndent="1" listType="bulleted" listStyle="circle">UL List ]item 1.1</listItem>
            //
            // After deleting the content, we would like to inherit the "square" attribute for the last element:
            //
            // <listItem listIndent="0" listType="bulleted" listStyle="square">UL List item 1</listItem>
            // <listItem listIndent="1" listType="bulleted" listStyle="square">UL List []item 1.1</listItem>
            const mostOuterItemList = getSiblingListItem(firstPosition.parent, {
                sameIndent: true,
                listIndent: nextSibling.getAttribute('listIndent')
            });
            // The outermost list item may not exist while removing elements between lists with different value
            // of the `listIndent` attribute. In such a case we don't want to update anything. See: #8073.
            if (!mostOuterItemList) {
                return;
            }
            if (mostOuterItemList.getAttribute('listType') === nextSibling.getAttribute('listType')) {
                firstMostOuterItem = mostOuterItemList;
            }
        }, {
            priority: 'high'
        });
        // If so, update the `listStyle` attribute for the second list.
        this.listenTo(model, 'deleteContent', ()=>{
            if (!firstMostOuterItem) {
                return;
            }
            model.change((writer)=>{
                // Find the first most-outer item list in the merged list.
                // A case when the first list item in the second list was merged into the last item in the first list.
                //
                // <listItem listIndent="0" listType="bulleted" listStyle="square">UL List item 1</listItem>
                // <listItem listIndent="0" listType="bulleted" listStyle="square">UL List item 2</listItem>
                // <listItem listIndent="0" listType="bulleted" listStyle="circle">[]UL List item 1</listItem>
                // <listItem listIndent="0" listType="bulleted" listStyle="circle">UL List item 2</listItem>
                const secondListMostOuterItem = getSiblingListItem(firstMostOuterItem.nextSibling, {
                    sameIndent: true,
                    listIndent: firstMostOuterItem.getAttribute('listIndent'),
                    direction: 'forward'
                });
                // If the selection ends in a non-list element, there are no <listItem>s that would require adjustments.
                // See: #8642.
                if (!secondListMostOuterItem) {
                    firstMostOuterItem = null;
                    return;
                }
                const items = [
                    secondListMostOuterItem,
                    ...getSiblingNodes(writer.createPositionAt(secondListMostOuterItem, 0), 'forward')
                ];
                for (const listItem of items){
                    for (const strategy of attributeStrategies){
                        if (strategy.appliesToListItem(listItem)) {
                            const attributeName = strategy.attributeName;
                            const value = firstMostOuterItem.getAttribute(attributeName);
                            writer.setAttribute(attributeName, value, listItem);
                        }
                    }
                }
            });
            firstMostOuterItem = null;
        }, {
            priority: 'low'
        });
    }
}
/**
 * Creates an array of strategies for dealing with enabled listItem attributes.
 */ function createAttributeStrategies(enabledProperties) {
    const strategies = [];
    if (enabledProperties.styles) {
        strategies.push({
            attributeName: 'listStyle',
            defaultValue: DEFAULT_LIST_TYPE,
            addCommand (editor) {
                editor.commands.add('listStyle', new LegacyListStyleCommand(editor, DEFAULT_LIST_TYPE));
            },
            appliesToListItem () {
                return true;
            },
            setAttributeOnDowncast (writer, listStyle, element) {
                if (listStyle && listStyle !== DEFAULT_LIST_TYPE) {
                    writer.setStyle('list-style-type', listStyle, element);
                } else {
                    writer.removeStyle('list-style-type', element);
                }
            },
            getAttributeOnUpcast (listParent) {
                return normalizeListStyle(listParent.getStyle('list-style-type')) || DEFAULT_LIST_TYPE;
            }
        });
    }
    if (enabledProperties.reversed) {
        strategies.push({
            attributeName: 'listReversed',
            defaultValue: false,
            addCommand (editor) {
                editor.commands.add('listReversed', new LegacyListReversedCommand(editor));
            },
            appliesToListItem (item) {
                return item.getAttribute('listType') == 'numbered';
            },
            setAttributeOnDowncast (writer, listReversed, element) {
                if (listReversed) {
                    writer.setAttribute('reversed', 'reversed', element);
                } else {
                    writer.removeAttribute('reversed', element);
                }
            },
            getAttributeOnUpcast (listParent) {
                return listParent.hasAttribute('reversed');
            }
        });
    }
    if (enabledProperties.startIndex) {
        strategies.push({
            attributeName: 'listStart',
            defaultValue: 1,
            addCommand (editor) {
                editor.commands.add('listStart', new LegacyListStartCommand(editor));
            },
            appliesToListItem (item) {
                return item.getAttribute('listType') == 'numbered';
            },
            setAttributeOnDowncast (writer, listStart, element) {
                if (listStart == 0 || listStart > 1) {
                    writer.setAttribute('start', listStart, element);
                } else {
                    writer.removeAttribute('start', element);
                }
            },
            getAttributeOnUpcast (listParent) {
                const startAttributeValue = listParent.getAttribute('start');
                return startAttributeValue >= 0 ? startAttributeValue : 1;
            }
        });
    }
    return strategies;
}
/**
 * Returns a converter consumes the `style`, `reversed` and `start` attribute.
 * In `style` it searches for the `list-style-type` definition.
 * If not found, the `"default"` value will be used.
 */ function upcastListItemAttributes(attributeStrategies) {
    return (dispatcher)=>{
        dispatcher.on('element:li', (evt, data, conversionApi)=>{
            // https://github.com/ckeditor/ckeditor5/issues/13858
            if (!data.modelRange) {
                return;
            }
            const listParent = data.viewItem.parent;
            const listItem = data.modelRange.start.nodeAfter || data.modelRange.end.nodeBefore;
            for (const strategy of attributeStrategies){
                if (strategy.appliesToListItem(listItem)) {
                    const listStyle = strategy.getAttributeOnUpcast(listParent);
                    conversionApi.writer.setAttribute(strategy.attributeName, listStyle, listItem);
                }
            }
        }, {
            priority: 'low'
        });
    };
}
/**
 * Returns a converter that adds `reversed`, `start` attributes and adds `list-style-type` definition as a value for the `style` attribute.
 * The `"default"` values are removed and not present in the view/data.
 */ function downcastListItemAttributes(attributeStrategies) {
    return (dispatcher)=>{
        for (const strategy of attributeStrategies){
            dispatcher.on(`attribute:${strategy.attributeName}:listItem`, (evt, data, conversionApi)=>{
                const viewWriter = conversionApi.writer;
                const currentElement = data.item;
                const previousElement = getSiblingListItem(currentElement.previousSibling, {
                    sameIndent: true,
                    listIndent: currentElement.getAttribute('listIndent'),
                    direction: 'backward'
                });
                const viewItem = conversionApi.mapper.toViewElement(currentElement);
                // A case when elements represent different lists. We need to separate their container.
                if (!areRepresentingSameList(currentElement, previousElement)) {
                    viewWriter.breakContainer(viewWriter.createPositionBefore(viewItem));
                }
                strategy.setAttributeOnDowncast(viewWriter, data.attributeNewValue, viewItem.parent);
            }, {
                priority: 'low'
            });
        }
    };
    /**
	 * Checks whether specified list items belong to the same list.
	 */ function areRepresentingSameList(listItem1, listItem2) {
        return listItem2 && listItem1.getAttribute('listType') === listItem2.getAttribute('listType') && listItem1.getAttribute('listIndent') === listItem2.getAttribute('listIndent') && listItem1.getAttribute('listStyle') === listItem2.getAttribute('listStyle') && listItem1.getAttribute('listReversed') === listItem2.getAttribute('listReversed') && listItem1.getAttribute('listStart') === listItem2.getAttribute('listStart');
    }
}
/**
 * When indenting list, nested list should clear its value for the attributes or inherit from nested lists.
 *
 * ■ List item 1.
 * ■ List item 2.[]
 * ■ List item 3.
 * editor.execute( 'indentList' );
 *
 * ■ List item 1.
 *     ○ List item 2.[]
 * ■ List item 3.
 */ function fixListAfterIndentListCommand(editor, attributeStrategies) {
    return (evt, changedItems)=>{
        const root = changedItems[0];
        const rootIndent = root.getAttribute('listIndent');
        const itemsToUpdate = changedItems.filter((item)=>item.getAttribute('listIndent') === rootIndent);
        // A case where a few list items are indented must be checked separately
        // since `getSiblingListItem()` returns the first changed element.
        // ■ List item 1.
        //     ○ [List item 2.
        //     ○ List item 3.]
        // ■ List item 4.
        //
        // List items: `2` and `3` should be adjusted.
        let previousSibling = null;
        if (root.previousSibling.getAttribute('listIndent') + 1 !== rootIndent) {
            previousSibling = getSiblingListItem(root.previousSibling, {
                sameIndent: true,
                direction: 'backward',
                listIndent: rootIndent
            });
        }
        editor.model.change((writer)=>{
            for (const item of itemsToUpdate){
                for (const strategy of attributeStrategies){
                    if (strategy.appliesToListItem(item)) {
                        const valueToSet = previousSibling == null ? strategy.defaultValue : previousSibling.getAttribute(strategy.attributeName);
                        writer.setAttribute(strategy.attributeName, valueToSet, item);
                    }
                }
            }
        });
    };
}
/**
 * When outdenting a list, a nested list should copy attribute values
 * from the previous sibling list item including the same value for the `listIndent` value.
 *
 * ■ List item 1.
 *     ○ List item 2.[]
 * ■ List item 3.
 *
 * editor.execute( 'outdentList' );
 *
 * ■ List item 1.
 * ■ List item 2.[]
 * ■ List item 3.
 */ function fixListAfterOutdentListCommand(editor, attributeStrategies) {
    return (evt, changedItems)=>{
        changedItems = changedItems.reverse().filter((item)=>item.is('element', 'listItem'));
        if (!changedItems.length) {
            return;
        }
        const indent = changedItems[0].getAttribute('listIndent');
        const listType = changedItems[0].getAttribute('listType');
        let listItem = changedItems[0].previousSibling;
        // ■ List item 1.
        //     ○ List item 2.
        //     ○ List item 3.[]
        // ■ List item 4.
        //
        // After outdenting a list, `List item 3` should inherit the `listStyle` attribute from `List item 1`.
        //
        // ■ List item 1.
        //     ○ List item 2.
        // ■ List item 3.[]
        // ■ List item 4.
        if (listItem.is('element', 'listItem')) {
            while(listItem.getAttribute('listIndent') !== indent){
                listItem = listItem.previousSibling;
            }
        } else {
            listItem = null;
        }
        // Outdenting such a list should restore values based on `List item 4`.
        // ■ List item 1.[]
        //     ○ List item 2.
        //     ○ List item 3.
        // ■ List item 4.
        if (!listItem) {
            listItem = changedItems[changedItems.length - 1].nextSibling;
        }
        // And such a list should not modify anything.
        // However, `listItem` can indicate a node below the list. Be sure that we have the `listItem` element.
        // ■ List item 1.[]
        //     ○ List item 2.
        //     ○ List item 3.
        // <paragraph>The later if check.</paragraph>
        if (!listItem || !listItem.is('element', 'listItem')) {
            return;
        }
        // Do not modify the list if found `listItem` represents other type of list than outdented list items.
        if (listItem.getAttribute('listType') !== listType) {
            return;
        }
        editor.model.change((writer)=>{
            const itemsToUpdate = changedItems.filter((item)=>item.getAttribute('listIndent') === indent);
            for (const item of itemsToUpdate){
                for (const strategy of attributeStrategies){
                    if (strategy.appliesToListItem(item)) {
                        const attributeName = strategy.attributeName;
                        const valueToSet = listItem.getAttribute(attributeName);
                        writer.setAttribute(attributeName, valueToSet, item);
                    }
                }
            }
        });
    };
}
/**
 * Each `listItem` element must have specified the `listStyle`, `listReversed` and `listStart` attributes
 * if they are enabled and supported by its `listType`.
 * This post-fixer checks whether inserted elements `listItem` elements should inherit the attribute values from
 * their sibling nodes or should use the default values.
 *
 * Paragraph[]
 * ■ List item 1. // [listStyle="square", listType="bulleted"]
 * ■ List item 2. // ...
 * ■ List item 3. // ...
 *
 * editor.execute( 'bulletedList' )
 *
 * ■ Paragraph[]  // [listStyle="square", listType="bulleted"]
 * ■ List item 1. // [listStyle="square", listType="bulleted"]
 * ■ List item 2.
 * ■ List item 3.
 *
 * It also covers a such change:
 *
 * [Paragraph 1
 * Paragraph 2]
 * ■ List item 1. // [listStyle="square", listType="bulleted"]
 * ■ List item 2. // ...
 * ■ List item 3. // ...
 *
 * editor.execute( 'numberedList' )
 *
 * 1. [Paragraph 1 // [listStyle="default", listType="numbered"]
 * 2. Paragraph 2] // [listStyle="default", listType="numbered"]
 * ■ List item 1.  // [listStyle="square", listType="bulleted"]
 * ■ List item 2.  // ...
 * ■ List item 3.  // ...
 */ function fixListAttributesOnListItemElements(editor, attributeStrategies) {
    return (writer)=>{
        let wasFixed = false;
        const insertedListItems = getChangedListItems(editor.model.document.differ.getChanges()).filter((item)=>{
            // Don't touch todo lists. They are handled in another post-fixer.
            return item.getAttribute('listType') !== 'todo';
        });
        if (!insertedListItems.length) {
            return wasFixed;
        }
        // Check whether the last inserted element is next to the `listItem` element.
        //
        // ■ Paragraph[]  // <-- The inserted item.
        // ■ List item 1.
        let existingListItem = insertedListItems[insertedListItems.length - 1].nextSibling;
        // If it doesn't, maybe the `listItem` was inserted at the end of the list.
        //
        // ■ List item 1.
        // ■ Paragraph[]  // <-- The inserted item.
        if (!existingListItem || !existingListItem.is('element', 'listItem')) {
            existingListItem = insertedListItems[0].previousSibling;
            if (existingListItem) {
                const indent = insertedListItems[0].getAttribute('listIndent');
                // But we need to find a `listItem` with the `listIndent=0` attribute.
                // If doesn't, maybe the `listItem` was inserted at the end of the list.
                //
                // ■ List item 1.
                //     ○ List item 2.
                // ■ Paragraph[]  // <-- The inserted item.
                while(existingListItem.is('element', 'listItem') && existingListItem.getAttribute('listIndent') !== indent){
                    existingListItem = existingListItem.previousSibling;
                    // If the item does not exist, most probably there is no other content in the editor. See: #8072.
                    if (!existingListItem) {
                        break;
                    }
                }
            }
        }
        for (const strategy of attributeStrategies){
            const attributeName = strategy.attributeName;
            for (const item of insertedListItems){
                if (!strategy.appliesToListItem(item)) {
                    writer.removeAttribute(attributeName, item);
                    continue;
                }
                if (!item.hasAttribute(attributeName)) {
                    if (shouldInheritListType(existingListItem, item, strategy)) {
                        writer.setAttribute(attributeName, existingListItem.getAttribute(attributeName), item);
                    } else {
                        writer.setAttribute(attributeName, strategy.defaultValue, item);
                    }
                    wasFixed = true;
                } else {
                    // Adjust the `listStyle`, `listReversed` and `listStart`
                    // attributes for inserted (pasted) items. See #8160.
                    //
                    // ■ List item 1. // [listStyle="square", listType="bulleted"]
                    //     ○ List item 1.1. // [listStyle="circle", listType="bulleted"]
                    //     ○ [] (selection is here)
                    //
                    // Then, pasting a list with different attributes (listStyle, listType):
                    //
                    // 1. First. // [listStyle="decimal", listType="numbered"]
                    // 2. Second // [listStyle="decimal", listType="numbered"]
                    //
                    // The `listType` attribute will be corrected by the `ListEditing` converters.
                    // We need to adjust the `listStyle` attribute. Expected structure:
                    //
                    // ■ List item 1. // [listStyle="square", listType="bulleted"]
                    //     ○ List item 1.1. // [listStyle="circle", listType="bulleted"]
                    //     ○ First. // [listStyle="circle", listType="bulleted"]
                    //     ○ Second // [listStyle="circle", listType="bulleted"]
                    const previousSibling = item.previousSibling;
                    if (shouldInheritListTypeFromPreviousItem(previousSibling, item, strategy.attributeName)) {
                        writer.setAttribute(attributeName, previousSibling.getAttribute(attributeName), item);
                        wasFixed = true;
                    }
                }
            }
        }
        return wasFixed;
    };
}
/**
 * Checks whether the `listStyle`, `listReversed` and `listStart` attributes
 * should be copied from the `baseItem` element.
 *
 * The attribute should be copied if the inserted element does not have defined it and
 * the value for the element is other than default in the base element.
 */ function shouldInheritListType(baseItem, itemToChange, attributeStrategy) {
    if (!baseItem) {
        return false;
    }
    const baseListAttribute = baseItem.getAttribute(attributeStrategy.attributeName);
    if (!baseListAttribute) {
        return false;
    }
    if (baseListAttribute == attributeStrategy.defaultValue) {
        return false;
    }
    if (baseItem.getAttribute('listType') !== itemToChange.getAttribute('listType')) {
        return false;
    }
    return true;
}
/**
 * Checks whether the `listStyle`, `listReversed` and `listStart` attributes
 * should be copied from previous list item.
 *
 * The attribute should be copied if there's a mismatch of styles of the pasted list into a nested list.
 * Top-level lists are not normalized as we allow side-by-side list of different types.
 */ function shouldInheritListTypeFromPreviousItem(previousItem, itemToChange, attributeName) {
    if (!previousItem || !previousItem.is('element', 'listItem')) {
        return false;
    }
    if (itemToChange.getAttribute('listType') !== previousItem.getAttribute('listType')) {
        return false;
    }
    const previousItemIndent = previousItem.getAttribute('listIndent');
    if (previousItemIndent < 1 || previousItemIndent !== itemToChange.getAttribute('listIndent')) {
        return false;
    }
    const previousItemListAttribute = previousItem.getAttribute(attributeName);
    if (!previousItemListAttribute || previousItemListAttribute === itemToChange.getAttribute(attributeName)) {
        return false;
    }
    return true;
}
/**
 * Removes the `listStyle`, `listReversed` and `listStart` attributes from "todo" list items.
 */ function removeListItemAttributesFromTodoList(editor) {
    return (writer)=>{
        const todoListItems = getChangedListItems(editor.model.document.differ.getChanges()).filter((item)=>{
            // Handle the todo lists only. The rest is handled in another post-fixer.
            return item.getAttribute('listType') === 'todo' && (item.hasAttribute('listStyle') || item.hasAttribute('listReversed') || item.hasAttribute('listStart'));
        });
        if (!todoListItems.length) {
            return false;
        }
        for (const item of todoListItems){
            writer.removeAttribute('listStyle', item);
            writer.removeAttribute('listReversed', item);
            writer.removeAttribute('listStart', item);
        }
        return true;
    };
}
/**
 * Restores the `listStyle` attribute after changing the list type.
 */ function restoreDefaultListStyle(editor) {
    return (evt, changedItems)=>{
        changedItems = changedItems.filter((item)=>item.is('element', 'listItem'));
        editor.model.change((writer)=>{
            for (const item of changedItems){
                // Remove the attribute. Post-fixer will restore the proper value.
                writer.removeAttribute('listStyle', item);
            }
        });
    };
}
/**
 * Returns the `listItem` that was inserted or changed.
 *
 * @param changes The changes list returned by the differ.
 */ function getChangedListItems(changes) {
    const items = [];
    for (const change of changes){
        const item = getItemFromChange(change);
        if (item && item.is('element', 'listItem')) {
            items.push(item);
        }
    }
    return items;
}
function getItemFromChange(change) {
    if (change.type === 'attribute') {
        return change.range.start.nodeAfter;
    }
    if (change.type === 'insert') {
        return change.position.nodeAfter;
    }
    return null;
}

/**
 * The legacy list properties feature.
 *
 * This is a "glue" plugin that loads the {@link module:list/legacylistproperties/legacylistpropertiesediting~LegacyListPropertiesEditing
 * legacy list properties editing feature} and the
 * {@link module:list/listproperties/listpropertiesui~ListPropertiesUI list properties UI feature}.
 */ class LegacyListProperties extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            LegacyListPropertiesEditing,
            ListPropertiesUI
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'LegacyListProperties';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

const attributeKey = 'todoListChecked';
/**
 * The check to-do command.
 *
 * The command is registered by the {@link module:list/legacytodolist/legacytodolistediting~LegacyTodoListEditing} as
 * the `checkTodoList` editor command and it is also available via aliased `todoListCheck` name.
 */ class LegacyCheckTodoListCommand extends Command {
    /**
	 * A list of to-do list items selected by the {@link module:engine/model/selection~ModelSelection}.
	 *
	 * @internal
	 */ _selectedElements;
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        this._selectedElements = [];
        // Refresh command before executing to be sure all values are up to date.
        // It is needed when selection has changed before command execution, in the same change block.
        this.on('execute', ()=>{
            this.refresh();
        }, {
            priority: 'highest'
        });
    }
    /**
	 * Updates the command's {@link #value} and {@link #isEnabled} properties based on the current selection.
	 */ refresh() {
        this._selectedElements = this._getSelectedItems();
        this.value = this._selectedElements.every((element)=>!!element.getAttribute(attributeKey));
        this.isEnabled = !!this._selectedElements.length;
    }
    /**
	 * Gets all to-do list items selected by the {@link module:engine/model/selection~ModelSelection}.
	 */ _getSelectedItems() {
        const model = this.editor.model;
        const schema = model.schema;
        const selectionRange = model.document.selection.getFirstRange();
        const startElement = selectionRange.start.parent;
        const elements = [];
        if (schema.checkAttribute(startElement, attributeKey)) {
            elements.push(startElement);
        }
        for (const item of selectionRange.getItems()){
            if (schema.checkAttribute(item, attributeKey) && !elements.includes(item)) {
                elements.push(item);
            }
        }
        return elements;
    }
    /**
	 * Executes the command.
	 *
	 * @param options.forceValue If set, it will force the command behavior. If `true`, the command will apply
	 * the attribute. Otherwise, the command will remove the attribute. If not set, the command will look for its current
	 * value to decide what it should do.
	 */ execute(options = {}) {
        this.editor.model.change((writer)=>{
            for (const element of this._selectedElements){
                const value = options.forceValue === undefined ? !this.value : options.forceValue;
                if (value) {
                    writer.setAttribute(attributeKey, true, element);
                } else {
                    writer.removeAttribute(attributeKey, element);
                }
            }
        });
    }
}

/**
 * A model-to-view converter for the `listItem` model element insertion.
 *
 * It converts the `listItem` model element to an unordered list with a {@link module:engine/view/uielement~ViewUIElement checkbox element}
 * at the beginning of each list item. It also merges the list with surrounding lists (if available).
 *
 * It is used by {@link module:engine/controller/editingcontroller~EditingController}.
 *
 * @internal
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:insert
 * @param model Model instance.
 * @param onCheckboxChecked Callback function.
 * @returns Returns a conversion callback.
 */ function modelViewInsertion(model, onCheckboxChecked) {
    return (evt, data, conversionApi)=>{
        const consumable = conversionApi.consumable;
        if (!consumable.test(data.item, 'insert') || !consumable.test(data.item, 'attribute:listType') || !consumable.test(data.item, 'attribute:listIndent')) {
            return;
        }
        if (data.item.getAttribute('listType') != 'todo') {
            return;
        }
        const modelItem = data.item;
        consumable.consume(modelItem, 'insert');
        consumable.consume(modelItem, 'attribute:listType');
        consumable.consume(modelItem, 'attribute:listIndent');
        consumable.consume(modelItem, 'attribute:todoListChecked');
        const viewWriter = conversionApi.writer;
        const viewItem = generateLiInUl(modelItem, conversionApi);
        const isChecked = !!modelItem.getAttribute('todoListChecked');
        const checkmarkElement = createCheckmarkElement(modelItem, viewWriter, isChecked, onCheckboxChecked);
        const span = viewWriter.createContainerElement('span', {
            class: 'todo-list__label__description'
        });
        viewWriter.addClass('todo-list', viewItem.parent);
        viewWriter.insert(viewWriter.createPositionAt(viewItem, 0), checkmarkElement);
        viewWriter.insert(viewWriter.createPositionAfter(checkmarkElement), span);
        injectViewList(modelItem, viewItem, conversionApi, model);
    };
}
/**
 * A model-to-view converter for the `listItem` model element insertion.
 *
 * It is used by {@link module:engine/controller/datacontroller~DataController}.
 *
 * @internal
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:insert
 * @param model Model instance.
 * @returns Returns a conversion callback.
 */ function dataModelViewInsertion(model) {
    return (evt, data, conversionApi)=>{
        const consumable = conversionApi.consumable;
        if (!consumable.test(data.item, 'insert') || !consumable.test(data.item, 'attribute:listType') || !consumable.test(data.item, 'attribute:listIndent')) {
            return;
        }
        if (data.item.getAttribute('listType') != 'todo') {
            return;
        }
        const modelItem = data.item;
        consumable.consume(modelItem, 'insert');
        consumable.consume(modelItem, 'attribute:listType');
        consumable.consume(modelItem, 'attribute:listIndent');
        consumable.consume(modelItem, 'attribute:todoListChecked');
        const viewWriter = conversionApi.writer;
        const viewItem = generateLiInUl(modelItem, conversionApi);
        viewWriter.addClass('todo-list', viewItem.parent);
        const label = viewWriter.createContainerElement('label', {
            class: 'todo-list__label'
        });
        const checkbox = viewWriter.createEmptyElement('input', {
            type: 'checkbox',
            disabled: 'disabled'
        });
        const span = viewWriter.createContainerElement('span', {
            class: 'todo-list__label__description'
        });
        if (modelItem.getAttribute('todoListChecked')) {
            viewWriter.setAttribute('checked', 'checked', checkbox);
        }
        viewWriter.insert(viewWriter.createPositionAt(viewItem, 0), label);
        viewWriter.insert(viewWriter.createPositionAt(label, 0), checkbox);
        viewWriter.insert(viewWriter.createPositionAfter(checkbox), span);
        injectViewList(modelItem, viewItem, conversionApi, model);
    };
}
/**
 * A view-to-model converter for the checkbox element inside a view list item.
 *
 * It changes the `listType` of the model `listItem` to a `todo` value.
 * When a view checkbox element is marked as checked, an additional `todoListChecked="true"` attribute is added to the model item.
 *
 * It is used by {@link module:engine/controller/datacontroller~DataController}.
 *
 * @internal
 * @see module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:element
 */ const dataViewModelCheckmarkInsertion = (evt, data, conversionApi)=>{
    const modelCursor = data.modelCursor;
    const modelItem = modelCursor.parent;
    const viewItem = data.viewItem;
    if (viewItem.getAttribute('type') != 'checkbox' || modelItem.name != 'listItem' || !modelCursor.isAtStart) {
        return;
    }
    if (!conversionApi.consumable.consume(viewItem, {
        name: true
    })) {
        return;
    }
    const writer = conversionApi.writer;
    writer.setAttribute('listType', 'todo', modelItem);
    if (data.viewItem.hasAttribute('checked')) {
        writer.setAttribute('todoListChecked', true, modelItem);
    }
    data.modelRange = writer.createRange(modelCursor);
};
/**
 * A model-to-view converter for the `listType` attribute change on the `listItem` model element.
 *
 * This change means that the `<li>` element parent changes to `<ul class="todo-list">` and a
 * {@link module:engine/view/uielement~ViewUIElement checkbox UI element} is added at the beginning
 * of the list item element (or vice versa).
 *
 * This converter is preceded by {@link module:list/legacylist/legacyconverters~modelViewChangeType} and followed by
 * {@link module:list/legacylist/legacyconverters~modelViewMergeAfterChangeType} to handle splitting and merging surrounding lists
 * of the same type.
 *
 * It is used by {@link module:engine/controller/editingcontroller~EditingController}.
 *
 * @internal
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute
 * @param onCheckedChange Callback fired after clicking the checkbox UI element.
 * @param view Editing view controller.
 * @returns Returns a conversion callback.
 */ function modelViewChangeType(onCheckedChange, view) {
    return (evt, data, conversionApi)=>{
        if (!conversionApi.consumable.consume(data.item, evt.name)) {
            return;
        }
        const viewItem = conversionApi.mapper.toViewElement(data.item);
        const viewWriter = conversionApi.writer;
        const labelElement = findLabel(viewItem, view);
        if (data.attributeNewValue == 'todo') {
            const isChecked = !!data.item.getAttribute('todoListChecked');
            const checkmarkElement = createCheckmarkElement(data.item, viewWriter, isChecked, onCheckedChange);
            const span = viewWriter.createContainerElement('span', {
                class: 'todo-list__label__description'
            });
            const itemRange = viewWriter.createRangeIn(viewItem);
            const nestedList = findNestedList(viewItem);
            const descriptionStart = positionAfterUiElements(itemRange.start);
            const descriptionEnd = nestedList ? viewWriter.createPositionBefore(nestedList) : itemRange.end;
            const descriptionRange = viewWriter.createRange(descriptionStart, descriptionEnd);
            viewWriter.addClass('todo-list', viewItem.parent);
            viewWriter.move(descriptionRange, viewWriter.createPositionAt(span, 0));
            viewWriter.insert(viewWriter.createPositionAt(viewItem, 0), checkmarkElement);
            viewWriter.insert(viewWriter.createPositionAfter(checkmarkElement), span);
        } else if (data.attributeOldValue == 'todo') {
            const descriptionSpan = findDescription(viewItem, view);
            viewWriter.removeClass('todo-list', viewItem.parent);
            viewWriter.remove(labelElement);
            viewWriter.move(viewWriter.createRangeIn(descriptionSpan), viewWriter.createPositionBefore(descriptionSpan));
            viewWriter.remove(descriptionSpan);
        }
    };
}
/**
 * A model-to-view converter for the `todoListChecked` attribute change on the `listItem` model element.
 *
 * It marks the {@link module:engine/view/uielement~ViewUIElement checkbox UI element} as checked.
 *
 * It is used by {@link module:engine/controller/editingcontroller~EditingController}.
 *
 * @internal
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute
 * @param onCheckedChange Callback fired after clicking the checkbox UI element.
 * @returns Returns a conversion callback.
 */ function modelViewChangeChecked(onCheckedChange) {
    return (evt, data, conversionApi)=>{
        // Do not convert `todoListChecked` attribute when to-do list item has changed to other list item.
        // This attribute will be removed by the model post fixer.
        if (data.item.getAttribute('listType') != 'todo') {
            return;
        }
        if (!conversionApi.consumable.consume(data.item, 'attribute:todoListChecked')) {
            return;
        }
        const { mapper, writer: viewWriter } = conversionApi;
        const isChecked = !!data.item.getAttribute('todoListChecked');
        const viewItem = mapper.toViewElement(data.item);
        // Because of m -> v position mapper we can be sure checkbox is always at the beginning.
        const oldCheckmarkElement = viewItem.getChild(0);
        const newCheckmarkElement = createCheckmarkElement(data.item, viewWriter, isChecked, onCheckedChange);
        viewWriter.insert(viewWriter.createPositionAfter(oldCheckmarkElement), newCheckmarkElement);
        viewWriter.remove(oldCheckmarkElement);
    };
}
/**
 * A model-to-view position at zero offset mapper.
 *
 * This helper ensures that position inside todo-list in the view is mapped after the checkbox.
 *
 * It only handles the position at the beginning of a list item as other positions are properly mapped be the default mapper.
 *
 * @internal
 */ function mapModelToViewPosition(view) {
    return (evt, data)=>{
        const modelPosition = data.modelPosition;
        const parent = modelPosition.parent;
        if (!parent.is('element', 'listItem') || parent.getAttribute('listType') != 'todo') {
            return;
        }
        const viewLi = data.mapper.toViewElement(parent);
        const descSpan = findDescription(viewLi, view);
        if (descSpan) {
            data.viewPosition = data.mapper.findPositionIn(descSpan, modelPosition.offset);
        }
    };
}
/**
 * Creates a checkbox UI element.
 */ function createCheckmarkElement(modelItem, viewWriter, isChecked, onChange) {
    const uiElement = viewWriter.createUIElement('label', {
        class: 'todo-list__label',
        contenteditable: false
    }, function(domDocument) {
        const checkbox = createElement(document, 'input', {
            type: 'checkbox',
            tabindex: '-1'
        });
        if (isChecked) {
            checkbox.setAttribute('checked', 'checked');
        }
        checkbox.addEventListener('change', ()=>onChange(modelItem));
        const domElement = this.toDomElement(domDocument);
        domElement.appendChild(checkbox);
        return domElement;
    });
    return uiElement;
}
// Helper method to find label element inside li.
function findLabel(viewItem, view) {
    const range = view.createRangeIn(viewItem);
    for (const value of range){
        if (value.item.is('uiElement', 'label')) {
            return value.item;
        }
    }
}
function findDescription(viewItem, view) {
    const range = view.createRangeIn(viewItem);
    for (const value of range){
        if (value.item.is('containerElement', 'span') && value.item.hasClass('todo-list__label__description')) {
            return value.item;
        }
    }
}

const ITEM_TOGGLE_KEYSTROKE = /* #__PURE__ */ parseKeystroke('Ctrl+Enter');
/**
 * The engine of the to-do list feature. It handles creating, editing and removing to-do lists and their items.
 *
 * It registers the entire functionality of the {@link module:list/legacylist/legacylistediting~LegacyListEditing legacy list editing
 * plugin} and extends it with the commands:
 *
 * - `'todoList'`,
 * - `'checkTodoList'`,
 * - `'todoListCheck'` as an alias for `checkTodoList` command.
 */ class LegacyTodoListEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'LegacyTodoListEditing';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            LegacyListEditing
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const { editing, data, model } = editor;
        // Extend schema.
        model.schema.extend('listItem', {
            allowAttributes: [
                'todoListChecked'
            ]
        });
        // Disallow todoListChecked attribute on other nodes than listItem with to-do listType.
        model.schema.addAttributeCheck((context, attributeName)=>{
            const item = context.last;
            if (attributeName == 'todoListChecked' && item.name == 'listItem' && item.getAttribute('listType') != 'todo') {
                return false;
            }
        });
        // Register `todoList` command.
        editor.commands.add('todoList', new LegacyListCommand(editor, 'todo'));
        const checkTodoListCommand = new LegacyCheckTodoListCommand(editor);
        // Register `checkTodoList` command and add `todoListCheck` command as an alias for backward compatibility.
        editor.commands.add('checkTodoList', checkTodoListCommand);
        editor.commands.add('todoListCheck', checkTodoListCommand);
        // Define converters.
        data.downcastDispatcher.on('insert:listItem', dataModelViewInsertion(model), {
            priority: 'high'
        });
        data.upcastDispatcher.on('element:input', dataViewModelCheckmarkInsertion, {
            priority: 'high'
        });
        editing.downcastDispatcher.on('insert:listItem', modelViewInsertion(model, (listItem)=>this._handleCheckmarkChange(listItem)), {
            priority: 'high'
        });
        editing.downcastDispatcher.on('attribute:listType:listItem', modelViewChangeType((listItem)=>this._handleCheckmarkChange(listItem), editing.view));
        editing.downcastDispatcher.on('attribute:todoListChecked:listItem', modelViewChangeChecked((listItem)=>this._handleCheckmarkChange(listItem)));
        editing.mapper.on('modelToViewPosition', mapModelToViewPosition(editing.view));
        data.mapper.on('modelToViewPosition', mapModelToViewPosition(editing.view));
        // Jump at the end of the previous node on left arrow key press, when selection is after the checkbox.
        //
        // <blockquote><p>Foo</p></blockquote>
        // <ul><li><checkbox/>{}Bar</li></ul>
        //
        // press: `<-`
        //
        // <blockquote><p>Foo{}</p></blockquote>
        // <ul><li><checkbox/>Bar</li></ul>
        //
        this.listenTo(editing.view.document, 'arrowKey', jumpOverCheckmarkOnSideArrowKeyPress(model, editor.locale), {
            context: 'li'
        });
        // Toggle check state of selected to-do list items on keystroke.
        this.listenTo(editing.view.document, 'keydown', (evt, data)=>{
            if (getCode(data) === ITEM_TOGGLE_KEYSTROKE) {
                editor.execute('checkTodoList');
                evt.stop();
            }
        }, {
            priority: 'high'
        });
        // Remove `todoListChecked` attribute when a host element is no longer a to-do list item.
        const listItemsToFix = new Set();
        this.listenTo(model, 'applyOperation', (evt, args)=>{
            const operation = args[0];
            if (operation.type == 'rename' && operation.oldName == 'listItem') {
                const item = operation.position.nodeAfter;
                if (item.hasAttribute('todoListChecked')) {
                    listItemsToFix.add(item);
                }
            } else if (operation.type == 'changeAttribute' && operation.key == 'listType' && operation.oldValue === 'todo') {
                for (const item of operation.range.getItems()){
                    if (item.hasAttribute('todoListChecked') && item.getAttribute('listType') !== 'todo') {
                        listItemsToFix.add(item);
                    }
                }
            }
        });
        model.document.registerPostFixer((writer)=>{
            let hasChanged = false;
            for (const listItem of listItemsToFix){
                writer.removeAttribute('todoListChecked', listItem);
                hasChanged = true;
            }
            listItemsToFix.clear();
            return hasChanged;
        });
        this._initAriaAnnouncements();
    }
    /**
	 * Handles the checkbox element change, moves the selection to the corresponding model item to make it possible
	 * to toggle the `todoListChecked` attribute using the command, and restores the selection position.
	 *
	 * Some say it's a hack :) Moving the selection only for executing the command on a certain node and restoring it after,
	 * is not a clear solution. We need to design an API for using commands beyond the selection range.
	 * See https://github.com/ckeditor/ckeditor5/issues/1954.
	 */ _handleCheckmarkChange(listItem) {
        const editor = this.editor;
        const model = editor.model;
        const previousSelectionRanges = Array.from(model.document.selection.getRanges());
        model.change((writer)=>{
            writer.setSelection(listItem, 'end');
            editor.execute('checkTodoList');
            writer.setSelection(previousSelectionRanges);
        });
    }
    /**
	 * Observe when user enters or leaves todo list and set proper aria value in global live announcer.
	 * This allows screen readers to indicate when the user has entered and left the specified todo list.
	 *
	 * @internal
	 */ _initAriaAnnouncements() {
        const { model, ui, t } = this.editor;
        let lastFocusedCodeBlock = null;
        if (!ui) {
            return;
        }
        model.document.selection.on('change:range', ()=>{
            const focusParent = model.document.selection.focus.parent;
            const lastElementIsTodoList = isLegacyTodoListItemElement(lastFocusedCodeBlock);
            const currentElementIsTodoList = isLegacyTodoListItemElement(focusParent);
            if (lastElementIsTodoList && !currentElementIsTodoList) {
                ui.ariaLiveAnnouncer.announce(t('Leaving a to-do list'));
            } else if (!lastElementIsTodoList && currentElementIsTodoList) {
                ui.ariaLiveAnnouncer.announce(t('Entering a to-do list'));
            }
            lastFocusedCodeBlock = focusParent;
        });
    }
}
/**
 * Handles the left/right (LTR/RTL content) arrow key and moves the selection at the end of the previous block element
 * if the selection is just after the checkbox element. In other words, it jumps over the checkbox element when
 * moving the selection to the left/right (LTR/RTL).
 *
 * @returns Callback for 'keydown' events.
 */ function jumpOverCheckmarkOnSideArrowKeyPress(model, locale) {
    return (eventInfo, domEventData)=>{
        const direction = getLocalizedArrowKeyCodeDirection(domEventData.keyCode, locale.contentLanguageDirection);
        if (direction != 'left') {
            return;
        }
        const schema = model.schema;
        const selection = model.document.selection;
        if (!selection.isCollapsed) {
            return;
        }
        const position = selection.getFirstPosition();
        const parent = position.parent;
        if (parent.name === 'listItem' && parent.getAttribute('listType') == 'todo' && position.isAtStart) {
            const newRange = schema.getNearestSelectionRange(model.createPositionBefore(parent), 'backward');
            if (newRange) {
                model.change((writer)=>writer.setSelection(newRange));
            }
            domEventData.preventDefault();
            domEventData.stopPropagation();
            eventInfo.stop();
        }
    };
}
/**
 * Returns true if the given element is a list item model element of a to-do list.
 */ function isLegacyTodoListItemElement(element) {
    return !!element && element.is('element', 'listItem') && element.getAttribute('listType') === 'todo';
}

/**
 * The legacy to-do list feature.
 *
 * This is a "glue" plugin that loads the {@link module:list/legacytodolist/legacytodolistediting~LegacyTodoListEditing legacy to-do list
 * editing feature} and the {@link module:list/todolist/todolistui~TodoListUI to-do list UI feature}.
 */ class LegacyTodoList extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            LegacyTodoListEditing,
            TodoListUI
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'LegacyTodoList';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

class AdjacentListsSupport extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'AdjacentListsSupport';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const model = editor.model;
        model.schema.register('listSeparator', {
            allowWhere: '$block',
            isBlock: true
        });
        editor.conversion.for('upcast')// Add a list separator element between similar list elements on upcast.
        .add((dispatcher)=>{
            dispatcher.on('element:ol', listSeparatorUpcastConverter());
            dispatcher.on('element:ul', listSeparatorUpcastConverter());
        })// View-to-model transformation.
        .elementToElement({
            model: 'listSeparator',
            view: 'ck-list-separator'
        });
        // The list separator element should exist in the view, but should be invisible (hidden).
        editor.conversion.for('editingDowncast').elementToElement({
            model: 'listSeparator',
            view: {
                name: 'div',
                classes: [
                    'ck-list-separator',
                    'ck-hidden'
                ]
            }
        });
        // The list separator element should not exist in the output data.
        editor.conversion.for('dataDowncast').elementToElement({
            model: 'listSeparator',
            view: (modelElement, conversionApi)=>{
                const viewElement = conversionApi.writer.createContainerElement('ck-list-separator');
                conversionApi.writer.setCustomProperty('dataPipeline:transparentRendering', true, viewElement);
                viewElement.getFillerOffset = ()=>null;
                return viewElement;
            }
        });
    }
}
/**
 * Inserts a list separator element between two lists of the same type (`ol` + `ol` or `ul` + `ul`).
 */ function listSeparatorUpcastConverter() {
    return (evt, data, conversionApi)=>{
        const element = data.viewItem;
        const nextSibling = element.nextSibling;
        if (!nextSibling) {
            return;
        }
        if (element.name !== nextSibling.name) {
            return;
        }
        if (!data.modelRange) {
            Object.assign(data, conversionApi.convertChildren(data.viewItem, data.modelCursor));
        }
        const writer = conversionApi.writer;
        const modelElement = writer.createElement('listSeparator');
        // Try to insert a list separator element on the current model cursor position.
        if (!conversionApi.safeInsert(modelElement, data.modelCursor)) {
            return;
        }
        const parts = conversionApi.getSplitParts(modelElement);
        // Extend the model range with the range of the created list separator element.
        data.modelRange = writer.createRange(data.modelRange.start, writer.createPositionAfter(parts[parts.length - 1]));
        conversionApi.updateConversionResult(modelElement, data);
    };
}

export { AdjacentListsSupport, CheckTodoListCommand, LegacyCheckTodoListCommand, LegacyIndentCommand, LegacyList, LegacyListCommand, LegacyListEditing, LegacyListProperties, LegacyListPropertiesEditing, LegacyListReversedCommand, LegacyListStartCommand, LegacyListStyleCommand, LegacyListUtils, LegacyTodoList, LegacyTodoListEditing, List, ListCommand, ListEditing, ListFormatting, ListIndentCommand, ListItemBoldIntegration, ListItemFontColorIntegration, ListItemFontFamilyIntegration, ListItemFontSizeIntegration, ListItemItalicIntegration, ListMergeCommand, ListProperties, ListPropertiesEditing, ListPropertiesUI, ListPropertiesUtils, ListReversedCommand, ListSplitCommand, ListStartCommand, ListStyleCommand, ListUI, ListUtils, TodoList, TodoListEditing, TodoListUI, ListBlocksIterable as _ListBlocksIterable, ListPropertiesView as _ListPropertiesView, ListWalker as _ListWalker, SiblingListBlocksIterator as _SiblingListBlocksIterator, TodoCheckboxChangeObserver as _TodoCheckboxChangeObserver, canBecomeSimpleListItem as _canBecomeSimpleListItem, createListElement as _createListElement, createListItemElement as _createListItemElement, createUIComponents as _createListUIComponents, createModelToViewPositionMapper as _createModelToViewListPositionMapper, expandListBlocksToCompleteItems as _expandListBlocksToCompleteItems, expandListBlocksToCompleteList as _expandListBlocksToCompleteList, findAndAddListHeadToMap as _findAndAddListHeadToMap, findMappedViewElement as _findMappedListItemViewElement, fixListIndents as _fixListIndents, fixListItemIds as _fixListItemIds, getAllListItemBlocks as _getAllListItemBlocks, getAllSupportedStyleTypes as _getAllSupportedListStyleTypes, getIndent$1 as _getListIndent, getListItemBlocks as _getListItemBlocks, getListItems as _getListItems, getListStyleTypeFromTypeAttribute as _getListStyleTypeFromTypeAttribute, getListTypeFromListStyleType$1 as _getListTypeFromListStyleType, getNestedListBlocks as _getNestedListBlocks, getNormalizedConfig as _getNormalizedListConfig, getSelectedBlockObject as _getSelectedBlockObject, getTypeAttributeFromListStyleType as _getTypeAttributeFromListStyleType, getViewElementIdForListType as _getViewElementIdForListType, getViewElementNameForListType as _getViewElementNameForListType, indentBlocks as _indentListBlocks, isFirstBlockOfListItem as _isFirstBlockOfListItem, isLastBlockOfListItem as _isLastBlockOfListItem, isListItemBlock as _isListItemBlock, isListItemView as _isListItemView, isListView as _isListView, isNumberedListType as _isNumberedListType, isSingleListItem as _isSingleListItem, bogusParagraphCreator as _listItemBogusParagraphCreator, listItemDowncastConverter as _listItemDowncastConverter, listItemDowncastRemoveConverter as _listItemDowncastRemoveConverter, listItemUpcastConverter as _listItemUpcastConverter, listPropertiesUpcastConverter as _listPropertiesUpcastConverter, mergeListItemBefore as _mergeListItemBefore, normalizeListStyle as _normalizeListStyle, outdentFollowingItems as _outdentFollowingListItems, outdentBlocksWithMerge as _outdentListBlocksWithMerge, reconvertItemsOnDataChange as _reconvertListItemsOnDataChange, removeListAttributes as _removeListAttributes, sortBlocks as _sortListBlocks, splitListItemBefore as _splitListItemBefore };
//# sourceMappingURL=index.js.map
