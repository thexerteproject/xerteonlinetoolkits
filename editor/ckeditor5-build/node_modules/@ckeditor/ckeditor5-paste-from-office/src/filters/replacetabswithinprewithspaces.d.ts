/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module paste-from-office/filters/replacetabswithinprewithspaces
 */
import type { ViewDocumentFragment, ViewUpcastWriter } from 'ckeditor5/src/engine.js';
/**
 * Replaces tab characters with spaces in text nodes that are inside elements styled with `white-space: pre-wrap`.
 *
 * This is a workaround for incorrect detection of pre-like formatting in the DOM converter for pasted Google Docs documents.
 * When an element uses `white-space: pre-wrap`, the editor reduces tab characters to a single space, causing
 * inconsistent spacing in pasted content. This function replaces tabs with spaces to ensure visual consistency.
 * This is intended as a temporary solution.
 *
 * See: https://github.com/ckeditor/ckeditor5/issues/18995
 *
 * @param documentFragment The `data.content` element obtained from the clipboard.
 * @param writer The upcast writer used to manipulate the view structure.
 * @param tabWidth The number of spaces to replace each tab with. Defaults to 8.
 * @internal
 */
export declare function replaceTabsWithinPreWithSpaces(documentFragment: ViewDocumentFragment, writer: ViewUpcastWriter, tabWidth: number): void;
