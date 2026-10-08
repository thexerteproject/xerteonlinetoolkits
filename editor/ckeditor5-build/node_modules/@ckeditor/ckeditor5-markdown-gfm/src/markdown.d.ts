/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module markdown-gfm/markdown
 */
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
/**
 * The GitHub Flavored Markdown (GFM) plugin.
 *
 * For a detailed overview, check the {@glink features/markdown Markdown feature} guide.
 */
export declare class Markdown extends Plugin {
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    static get pluginName(): "Markdown";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
}
