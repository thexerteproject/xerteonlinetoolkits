/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module html-support/htmlpagedataprocessor
 */
import { HtmlDataProcessor, type ViewDocumentFragment } from 'ckeditor5/src/engine.js';
/**
 * The full page HTML data processor class.
 * This data processor implementation uses HTML as input and output data.
 */
export declare class HtmlPageDataProcessor extends HtmlDataProcessor {
    /**
     * @inheritDoc
     */
    toView(data: string): ViewDocumentFragment;
    /**
     * @inheritDoc
     */
    toData(viewFragment: ViewDocumentFragment): string;
}
