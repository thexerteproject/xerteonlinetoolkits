/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/dataprocessor/basichtmlwriter
 */
import { type DataProcessorHtmlWriter } from './htmlwriter.js';
/**
 * Basic HTML writer. It uses the native `innerHTML` property for basic conversion
 * from a document fragment to an HTML string.
 *
 * @internal
 */
export declare class BasicHtmlWriter implements DataProcessorHtmlWriter {
    /**
     * Returns an HTML string created from the document fragment.
     */
    getHtml(fragment: DocumentFragment): string;
}
