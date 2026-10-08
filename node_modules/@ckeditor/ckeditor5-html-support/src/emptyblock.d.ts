/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin } from 'ckeditor5/src/core.js';
/**
 * This plugin allows for preserving empty block elements in the editor content
 * instead of automatically filling them with block fillers (`&nbsp;`).
 *
 * This is useful when you want to:
 *
 * * Preserve empty block elements exactly as they were in the source HTML.
 * * Allow for styling empty blocks with CSS (block fillers can interfere with height/margin).
 * * Maintain compatibility with external systems that expect empty blocks to remain empty.
 *
 * Known limitations:
 *
 * * Empty blocks may not work correctly with revision history features.
 * * Keyboard navigation through the document might behave unexpectedly, especially when
 *   navigating through structures like lists and tables.
 *
 * For example, this allows for HTML like:
 *
 * ```html
 * <p></p>
 * <p class="spacer"></p>
 * <td></td>
 * ```
 * to remain empty instead of being converted to:
 *
 * ```html
 * <p>&nbsp;</p>
 * <p class="spacer">&nbsp;</p>
 * <td>&nbsp;</td>
 * ```
 */
export declare class EmptyBlock extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "EmptyBlock";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    afterInit(): void;
    /**
     * Handle clipboard paste events:
     *
     * * It does not affect *copying* content from the editor, only *pasting*.
     * * When content is pasted from another editor instance with `<p></p>`,
     *   the `&nbsp;` filler is added, so the getData result is `<p>&nbsp;</p>`.
     * * When content is pasted from the same editor instance with `<p></p>`,
     *   the `&nbsp;` filler is not added, so the getData result is `<p></p>`.
     */
    private _registerClipboardPastingHandler;
}
