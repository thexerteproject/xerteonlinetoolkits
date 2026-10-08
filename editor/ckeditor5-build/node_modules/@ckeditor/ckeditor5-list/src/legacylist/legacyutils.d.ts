/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/legacylist/legacyutils
 */
import { type DowncastConversionApi, type ViewDowncastWriter, type ModelElement, type ModelItem, type Model, type ModelPosition, type ViewContainerElement, type ViewElement, type ViewItem, type ViewPosition } from 'ckeditor5/src/engine.js';
/**
 * Creates a list item {@link module:engine/view/containerelement~ViewContainerElement}.
 *
 * @internal
 * @param writer The writer instance.
 */
export declare function createViewListItemElement(writer: ViewDowncastWriter): ViewContainerElement;
/**
 * Helper function that creates a `<ul><li></li></ul>` or (`<ol>`) structure out of the given `modelItem` model `listItem` element.
 * Then, it binds the created view list item (`<li>`) with the model `listItem` element.
 * The function then returns the created view list item (`<li>`).
 *
 * @internal
 * @param modelItem Model list item.
 * @param conversionApi Conversion interface.
 * @returns View list element.
 */
export declare function generateLiInUl(modelItem: ModelItem, conversionApi: DowncastConversionApi): ViewContainerElement;
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
 */
export declare function injectViewList(modelItem: ModelElement, injectedItem: ViewContainerElement, conversionApi: DowncastConversionApi, model: Model): void;
/**
 * Helper function that takes two parameters that are expected to be view list elements, and merges them.
 * The merge happens only if both parameters are list elements of the same type (the same element name and the same class attributes).
 *
 * @internal
 * @param viewWriter The writer instance.
 * @param firstList The first element to compare.
 * @param secondList The second element to compare.
 * @returns The position after merge or `null` when there was no merge.
 */
export declare function mergeViewLists(viewWriter: ViewDowncastWriter, firstList: ViewItem, secondList: ViewItem): ViewPosition | null;
/**
 * Helper function that for a given `view.Position`, returns a `view.Position` that is after all `view.UIElement`s that
 * are after the given position.
 *
 * For example:
 * `<container:p>foo^<ui:span></ui:span><ui:span></ui:span>bar</container:p>`
 * For position ^, the position before "bar" will be returned.
 *
 * @internal
 */
export declare function positionAfterUiElements(viewPosition: ViewPosition): ViewPosition;
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
 */
export declare function getSiblingListItem(modelItem: ModelItem | null, options: {
    sameIndent?: boolean;
    smallerIndent?: boolean;
    listIndent?: number;
    direction?: 'forward' | 'backward';
}): ModelElement | null;
/**
 * Returns a first list view element that is direct child of the given view element.
 *
 * @internal
 */
export declare function findNestedList(viewElement: ViewElement): ViewElement | null;
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
 */
export declare function getSiblingNodes(position: ModelPosition, direction: 'forward' | 'backward'): Array<ModelElement>;
/**
 * Returns an array with all `listItem` elements in the model selection.
 *
 * It returns all the items even if only a part of the list is selected, including items that belong to nested lists.
 * If no list is selected, it returns an empty array.
 * The order of the elements is not specified.
 *
 * @internal
 */
export declare function getSelectedListItems(model: Model): Array<ModelElement>;
/**
 * Checks whether the given list-style-type is supported by numbered or bulleted list.
 *
 * @internal
 */
export declare function getListTypeFromListStyleType(listStyleType: string): 'bulleted' | 'numbered' | null;
