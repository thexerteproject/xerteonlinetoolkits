/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module block-quote/blockquoteui
 */
import { Plugin } from 'ckeditor5/src/core.js';
import '../theme/blockquote.css';
/**
 * The block quote UI plugin.
 *
 * It introduces the `'blockQuote'` button.
 *
 * @extends module:core/plugin~Plugin
 */
export declare class BlockQuoteUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "BlockQuoteUI";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Creates a button for block quote command to use either in toolbar or in menu bar.
     */
    private _createButton;
}
