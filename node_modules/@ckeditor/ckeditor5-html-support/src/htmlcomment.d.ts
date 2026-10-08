/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module html-support/htmlcomment
 */
import type { ModelPosition, ModelRange } from 'ckeditor5/src/engine.js';
import { Plugin } from 'ckeditor5/src/core.js';
/**
 * The HTML comment feature. It preserves the HTML comments (`<!-- -->`) in the editor data.
 *
 * For a detailed overview, check the {@glink features/html/html-comments HTML comment feature documentation}.
 */
export declare class HtmlComment extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "HtmlComment";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Creates an HTML comment on the specified position and returns its ID.
     *
     * *Note*: If two comments are created at the same position, the second comment will be inserted before the first one.
     *
     * @returns Comment ID. This ID can be later used to e.g. remove the comment from the content.
     */
    createHtmlComment(position: ModelPosition, content: string): string;
    /**
     * Removes an HTML comment with the given comment ID.
     *
     * It does nothing and returns `false` if the comment with the given ID does not exist.
     * Otherwise it removes the comment and returns `true`.
     *
     * Note that a comment can be removed also by removing the content around the comment.
     *
     * @param commentID The ID of the comment to be removed.
     * @returns `true` when the comment with the given ID was removed, `false` otherwise.
     */
    removeHtmlComment(commentID: string): boolean;
    /**
     * Gets the HTML comment data for the comment with a given ID.
     *
     * Returns `null` if the comment does not exist.
     */
    getHtmlCommentData(commentID: string): HtmlCommentData | null;
    /**
     * Gets all HTML comments in the given range.
     *
     * By default, it includes comments at the range boundaries.
     *
     * @param range The range to search for HTML comments.
     * @param options Additional options.
     * @param options.skipBoundaries When set to `true` the range boundaries will be skipped.
     * @returns HTML comment IDs
     */
    getHtmlCommentsInRange(range: ModelRange, { skipBoundaries }?: {
        skipBoundaries?: boolean | undefined;
    }): Array<string>;
}
/**
 * An interface for the HTML comments data.
 *
 * It consists of the {@link module:engine/model/position~ModelPosition `position`} and `content`.
 */
export interface HtmlCommentData {
    position: ModelPosition;
    content: string;
}
