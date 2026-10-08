/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module markdown-gfm/pastefrommarkdownexperimental
 */
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { ClipboardPipeline } from 'ckeditor5/src/clipboard.js';
/**
 * The GitHub Flavored Markdown (GFM) paste plugin.
 *
 * For a detailed overview, check the {@glink features/pasting/paste-markdown Paste Markdown feature} guide.
 */
export declare class PasteFromMarkdownExperimental extends Plugin {
    /**
     * @internal
     */
    private _gfmDataProcessor;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    static get pluginName(): "PasteFromMarkdownExperimental";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ClipboardPipeline];
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Determines if the code copied from a website in the `text/html` type can be parsed as Markdown.
     * It removes any OS-specific HTML tags, for example, <meta> on macOS and <!--StartFragment--> on Windows.
     * Then removes a single wrapper HTML tag or wrappers for sibling tags, and if there are no more tags left,
     * returns the remaining text. Returns null if there are any remaining HTML tags detected.
     *
     * @param htmlString Clipboard content in the `text/html` type format.
     */
    private _parseMarkdownFromHtml;
    /**
     * Removes OS-specific tags.
     *
     * @param htmlString Clipboard content in the `text/html` type format.
     */
    private _removeOsSpecificTags;
    /**
     * If the input HTML string contains any first-level formatting tags
     * like <b>, <strong>, or <i>, we should not treat it as Markdown.
     *
     * @param htmlString Clipboard content.
     */
    private _containsOnlyAllowedFirstLevelTags;
    /**
     * Removes multiple HTML wrapper tags from a list of sibling HTML tags.
     *
     * @param htmlString Clipboard content without any OS-specific tags.
     */
    private _removeFirstLevelWrapperTagsAndBrs;
    /**
     * Determines if a string contains any HTML tags.
     */
    private _containsAnyRemainingHtmlTags;
    /**
     * Replaces the reserved HTML entities with the actual characters.
     *
     * @param htmlString Clipboard content without any tags.
     */
    private _replaceHtmlReservedEntitiesWithCharacters;
}
