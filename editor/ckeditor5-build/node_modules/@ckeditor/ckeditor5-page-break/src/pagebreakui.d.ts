/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module page-break/pagebreakui
 */
import { Plugin } from 'ckeditor5/src/core.js';
/**
 * The page break UI plugin.
 */
export declare class PageBreakUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "PageBreakUI";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Creates a button for page break command to use either in toolbar or in menu bar.
     */
    private _createButton;
}
