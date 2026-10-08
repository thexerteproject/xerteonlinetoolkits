/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module paste-from-office/pastefromoffice
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { ClipboardPipeline } from 'ckeditor5/src/clipboard.js';
/**
 * The Paste from Office plugin.
 *
 * This plugin handles content pasted from Office apps and transforms it (if necessary)
 * to a valid structure which can then be understood by the editor features.
 *
 * Transformation is made by a set of predefined {@link module:paste-from-office/normalizer~PasteFromOfficeNormalizer normalizers}.
 * This plugin includes following normalizers:
 * * {@link module:paste-from-office/normalizers/mswordnormalizer~PasteFromOfficeMSWordNormalizer Microsoft Word normalizer}
 * * {@link module:paste-from-office/normalizers/googledocsnormalizer~GoogleDocsNormalizer Google Docs normalizer}
 *
 * For more information about this feature check the {@glink api/paste-from-office package page}.
 */
export declare class PasteFromOffice extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "PasteFromOffice";
    /**
     * @inheritDoc
     * @internal
     */
    static get licenseFeatureCode(): string;
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get isPremiumPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ClipboardPipeline];
    /**
     * @inheritDoc
     */
    init(): void;
}
