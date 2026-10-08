/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/legacylist/legacylistutils
 */
import type { ModelElement, Model, ModelPosition } from 'ckeditor5/src/engine.js';
import { Plugin } from 'ckeditor5/src/core.js';
/**
 * A set of helpers related to legacy lists.
 */
export declare class LegacyListUtils extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "LegacyListUtils";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * Checks whether the given list-style-type is supported by numbered or bulleted list.
     */
    getListTypeFromListStyleType(listStyleType: string): 'bulleted' | 'numbered' | null;
    /**
     * Returns an array with all `listItem` elements in the model selection.
     *
     * It returns all the items even if only a part of the list is selected, including items that belong to nested lists.
     * If no list is selected, it returns an empty array.
     * The order of the elements is not specified.
     */
    getSelectedListItems(model: Model): Array<ModelElement>;
    /**
     * Returns an array with all `listItem` elements that represent the same list.
     *
     * It means that values of `listIndent`, `listType`, `listStyle`, `listReversed` and `listStart` for all items are equal.
     *
     * Additionally, if the `position` is inside a list item, that list item will be returned as well.
     *
     * @param position Starting position.
     * @param direction Walking direction.
     */
    getSiblingNodes(position: ModelPosition, direction: 'forward' | 'backward'): Array<ModelElement>;
}
