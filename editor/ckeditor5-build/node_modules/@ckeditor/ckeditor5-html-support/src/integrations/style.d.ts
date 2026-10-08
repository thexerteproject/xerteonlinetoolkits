/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module html-support/integrations/style
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { DataFilter } from '../datafilter.js';
/**
 * Provides the General HTML Support for `style` elements.
 */
export declare class StyleElementSupport extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof DataFilter];
    /**
     * @inheritDoc
     */
    static get pluginName(): "StyleElementSupport";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
}
