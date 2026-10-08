/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/list/utils/view
 */
import type { ViewDowncastWriter, ViewAttributeElement, ViewDocumentFragment, ViewElement, ViewNode } from 'ckeditor5/src/engine.js';
import { type ListType } from '../listediting.js';
/**
 * Checks if view element is a list type (ul or ol).
 *
 * @internal
 */
export declare function isListView(viewElement: ViewNode | ViewDocumentFragment): viewElement is ViewElement & {
    name: 'ul' | 'ol';
};
/**
 * Checks if view element is a list item (li).
 *
 * @internal
 */
export declare function isListItemView(viewElement: ViewNode | ViewDocumentFragment): viewElement is ViewElement & {
    name: 'li';
};
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
 */
export declare function getIndent(listItem: ViewElement): number;
/**
 * Creates a list attribute element (ol or ul).
 *
 * @internal
 */
export declare function createListElement(writer: ViewDowncastWriter, indent: number, type: ListType, id?: string): ViewAttributeElement;
/**
 * Creates a list item attribute element (li).
 *
 * @internal
 */
export declare function createListItemElement(writer: ViewDowncastWriter, indent: number, id: string): ViewAttributeElement;
/**
 * Returns a view element name for the given list type.
 *
 * @internal
 */
export declare function getViewElementNameForListType(type?: ListType): 'ol' | 'ul';
/**
 * Returns a view element ID for the given list type and indent.
 *
 * @internal
 */
export declare function getViewElementIdForListType(type?: ListType, indent?: number): string;
