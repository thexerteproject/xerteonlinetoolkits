/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/tablecolumnresize/converters
 */
import type { DowncastDispatcher, UpcastDispatcher } from 'ckeditor5/src/engine.js';
import { type TableUtils } from '../tableutils.js';
/**
 * Returns a upcast helper that ensures the number of `<tableColumn>` elements corresponds to the actual number of columns in the table,
 * because the input data might have too few or too many <col> elements.
 *
 * @internal
 */
export declare function upcastColgroupElement(tableUtilsPlugin: TableUtils): (dispatcher: UpcastDispatcher) => void;
/**
 * Returns downcast helper for adding `ck-table-resized` class if there is a `<tableColumnGroup>` element inside the table.
 *
 * @internal
 */
export declare function downcastTableResizedClass(): (dispatcher: DowncastDispatcher) => void;
/**
 * Returns a upcast helper that removes the `ck-table-resized` class from the table element.
 *
 * @internal
 */
export declare function upcastTableResizedClass(): (dispatcher: UpcastDispatcher) => void;
