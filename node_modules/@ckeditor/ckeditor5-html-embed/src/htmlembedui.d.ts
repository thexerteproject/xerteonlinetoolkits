/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module html-embed/htmlembedui
 */
import { Plugin } from 'ckeditor5/src/core.js';
/**
 * The HTML embed UI plugin.
 */
export declare class HtmlEmbedUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "HtmlEmbedUI";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Creates a button for html embed command to use either in toolbar or in menu bar.
     */
    private _createButton;
}
