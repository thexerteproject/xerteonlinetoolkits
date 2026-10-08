/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module media-embed/mediaembedtoolbar
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { WidgetToolbarRepository } from 'ckeditor5/src/widget.js';
import './mediaembedconfig.js';
/**
 * The media embed toolbar plugin. It creates a toolbar for media embed that shows up when the media element is selected.
 *
 * Instances of toolbar components (e.g. buttons) are created based on the
 * {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#toolbar `media.toolbar` configuration option}.
 */
export declare class MediaEmbedToolbar extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof WidgetToolbarRepository];
    /**
     * @inheritDoc
     */
    static get pluginName(): "MediaEmbedToolbar";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    afterInit(): void;
}
