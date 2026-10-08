/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module paste-from-office/filters/br
 */
import { type ViewUpcastWriter, type ViewDocumentFragment } from 'ckeditor5/src/engine.js';
/**
 * Transforms `<br>` elements that are siblings to some block element into a paragraphs.
 *
 * @param documentFragment The view structure to be transformed.
 * @internal
 */
export declare function transformBlockBrsToParagraphs(documentFragment: ViewDocumentFragment, writer: ViewUpcastWriter): void;
