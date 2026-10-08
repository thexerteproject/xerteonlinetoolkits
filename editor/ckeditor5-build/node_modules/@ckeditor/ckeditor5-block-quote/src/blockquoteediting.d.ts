/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module block-quote/blockquoteediting
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { Enter } from 'ckeditor5/src/enter.js';
import { Delete } from 'ckeditor5/src/typing.js';
/**
 * The block quote editing.
 *
 * Introduces the `'blockQuote'` command and the `'blockQuote'` model element.
 *
 * @extends module:core/plugin~Plugin
 */
export declare class BlockQuoteEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "BlockQuoteEditing";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof Enter, typeof Delete];
    /**
     * @inheritDoc
     */
    init(): void;
}
