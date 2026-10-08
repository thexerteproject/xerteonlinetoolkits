/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module basic-styles/italic/italicui
 */
import { Plugin } from 'ckeditor5/src/core.js';
/**
 * The italic UI feature. It introduces the Italic button.
 */
export declare class ItalicUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "ItalicUI";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
}
