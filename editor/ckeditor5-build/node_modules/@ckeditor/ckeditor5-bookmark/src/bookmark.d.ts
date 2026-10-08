/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module bookmark/bookmark
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { Widget } from 'ckeditor5/src/widget.js';
import { BookmarkUI } from './bookmarkui.js';
import { BookmarkEditing } from './bookmarkediting.js';
/**
 * The bookmark feature.
 *
 * For a detailed overview, check the {@glink features/bookmarks Bookmarks} feature guide.
 */
export declare class Bookmark extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "Bookmark";
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof BookmarkEditing, typeof BookmarkUI, typeof Widget];
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
}
