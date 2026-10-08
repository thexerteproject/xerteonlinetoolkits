/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module paste-from-office/normalizers/googledocsnormalizer
 */
import { type ViewDocument } from 'ckeditor5/src/engine.js';
import type { PasteFromOfficeNormalizer, PasteFromOfficeNormalizerData } from '../normalizer.js';
/**
 * Normalizer for the content pasted from Google Docs.
 *
 * @internal
 */
export declare class GoogleDocsNormalizer implements PasteFromOfficeNormalizer {
    readonly document: ViewDocument;
    /**
     * Creates a new `GoogleDocsNormalizer` instance.
     *
     * @param document View document.
     */
    constructor(document: ViewDocument);
    /**
     * @inheritDoc
     */
    isActive(htmlString: string): boolean;
    /**
     * @inheritDoc
     */
    execute(data: PasteFromOfficeNormalizerData): void;
}
