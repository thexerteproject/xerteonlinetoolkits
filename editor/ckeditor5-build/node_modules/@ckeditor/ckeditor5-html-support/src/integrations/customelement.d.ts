/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module html-support/integrations/customelement
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { DataSchema } from '../dataschema.js';
import { DataFilter } from '../datafilter.js';
/**
 * Provides the General HTML Support for custom elements (not registered in the {@link module:html-support/dataschema~DataSchema}).
 */
export declare class CustomElementSupport extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof DataFilter, typeof DataSchema];
    /**
     * @inheritDoc
     */
    static get pluginName(): "CustomElementSupport";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
}
