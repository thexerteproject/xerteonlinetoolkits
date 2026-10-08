/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module horizontal-line/horizontallineui
 */
import { Plugin } from 'ckeditor5/src/core.js';
/**
 * The horizontal line UI plugin.
 */
export declare class HorizontalLineUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "HorizontalLineUI";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Creates a button for horizontal line command to use either in toolbar or in menu bar.
     */
    private _createButton;
}
