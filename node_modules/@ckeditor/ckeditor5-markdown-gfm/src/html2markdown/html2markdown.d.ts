/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
export declare class MarkdownGfmHtmlToMd {
    private _processor;
    private _keepRawTags;
    constructor();
    keep(tagName: string): void;
    parse(html: string): string;
    /**
     * Returns handlers for raw HTML tags that should be kept in the Markdown output.
     */
    private _getRawTagsHandlers;
    private _buildProcessor;
}
