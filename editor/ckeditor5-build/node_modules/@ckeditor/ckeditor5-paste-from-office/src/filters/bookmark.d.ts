/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module paste-from-office/filters/bookmark
 */
import { type ViewUpcastWriter, type ViewDocumentFragment } from 'ckeditor5/src/engine.js';
/**
 * Transforms `<a>` elements which are bookmarks by moving their children after the element.
 *
 * @internal
 */
export declare function transformBookmarks(documentFragment: ViewDocumentFragment, writer: ViewUpcastWriter): void;
