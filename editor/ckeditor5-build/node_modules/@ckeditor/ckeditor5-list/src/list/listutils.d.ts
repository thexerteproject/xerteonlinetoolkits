/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/list/listutils
 */
import type { ModelElement, ModelNode } from 'ckeditor5/src/engine.js';
import type { ArrayOrItem } from 'ckeditor5/src/utils.js';
import { Plugin } from 'ckeditor5/src/core.js';
import { type ListElement } from './utils/model.js';
import type { ListType } from './listediting.js';
/**
 * A set of helpers related to document lists.
 */
export declare class ListUtils extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "ListUtils";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * Expands the given list of selected blocks to include all the items of the lists they're in.
     *
     * @param blocks The list of selected blocks.
     */
    expandListBlocksToCompleteList(blocks: ArrayOrItem<ModelElement>): Array<ModelElement>;
    /**
     * Check if the given block is the first in the list item.
     *
     * @param listBlock The list block element.
     */
    isFirstBlockOfListItem(listBlock: ModelElement): boolean;
    /**
     * Returns true if the given model node is a list item block.
     *
     * @param node A model node.
     */
    isListItemBlock(node: ModelNode | null): node is ListElement;
    /**
     * Expands the given list of selected blocks to include the leading and tailing blocks of partially selected list items.
     *
     * @param blocks The list of selected blocks.
     * @param options.withNested Whether should include nested list items.
     */
    expandListBlocksToCompleteItems(blocks: ArrayOrItem<ModelElement>, options?: {
        withNested?: boolean;
    }): Array<ModelElement>;
    /**
     * Returns true if listType is of type `numbered` or `customNumbered`.
     */
    isNumberedListType(listType: ListType): boolean;
    /**
     * Returns true if the given list item is the first item in the list.
     */
    isFirstListItemInList(listItem: ModelElement): boolean;
}
