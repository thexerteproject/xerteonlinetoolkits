/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module paste-from-office/filters/removexmlns
 */
import type { ViewUpcastWriter, ViewDocumentFragment } from 'ckeditor5/src/engine.js';
/**
 * Removes the `xmlns` attribute from table pasted from Google Sheets.
 *
 * @param documentFragment element `data.content` obtained from clipboard
 * @internal
 */
export declare function removeXmlns(documentFragment: ViewDocumentFragment, writer: ViewUpcastWriter): void;
