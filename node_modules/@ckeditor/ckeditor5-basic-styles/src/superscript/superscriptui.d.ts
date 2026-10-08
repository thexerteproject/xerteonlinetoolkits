/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module basic-styles/superscript/superscriptui
 */
import { Plugin } from 'ckeditor5/src/core.js';
/**
 * The superscript UI feature. It introduces the Superscript button.
 */
export declare class SuperscriptUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "SuperscriptUI";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
}
