/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { type ViewDocument } from 'ckeditor5/src/engine.js';
import type { PasteFromOfficeNormalizer, PasteFromOfficeNormalizerData } from '../normalizer.js';
/**
 * Normalizer for the content pasted from Microsoft Word.
 */
export declare class PasteFromOfficeMSWordNormalizer implements PasteFromOfficeNormalizer {
    readonly document: ViewDocument;
    readonly hasMultiLevelListPlugin: boolean;
    readonly hasTablePropertiesPlugin: boolean;
    readonly hasExtendedTableBlockAlignment: boolean;
    /**
     * Creates a new `PasteFromOfficeMSWordNormalizer` instance.
     *
     * @param document View document.
     */
    constructor(document: ViewDocument, hasMultiLevelListPlugin?: boolean, hasTablePropertiesPlugin?: boolean, hasExtendedTableBlockAlignment?: boolean);
    /**
     * @inheritDoc
     */
    isActive(htmlString: string): boolean;
    /**
     * @inheritDoc
     */
    execute(data: PasteFromOfficeNormalizerData): void;
}
