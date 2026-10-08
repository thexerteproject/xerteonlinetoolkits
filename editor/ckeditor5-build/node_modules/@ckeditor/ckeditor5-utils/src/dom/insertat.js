/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module utils/dom/insertat
 */
/**
 * Inserts node to the parent at given index.
 *
 * @param parentElement Parent element.
 * @param index Insertions index.
 * @param nodeToInsert Node to insert.
 */
export function insertAt(parentElement, index, nodeToInsert) {
    parentElement.insertBefore(nodeToInsert, parentElement.childNodes[index] || null);
}
