/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module media-embed/automediaembed
 */
import { type Editor, Plugin } from 'ckeditor5/src/core.js';
import { Clipboard } from 'ckeditor5/src/clipboard.js';
import { Delete } from 'ckeditor5/src/typing.js';
import { Undo } from 'ckeditor5/src/undo.js';
/**
 * The auto-media embed plugin. It recognizes media links in the pasted content and embeds
 * them shortly after they are injected into the document.
 */
export declare class AutoMediaEmbed extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof Clipboard, typeof Delete, typeof Undo];
    /**
     * @inheritDoc
     */
    static get pluginName(): "AutoMediaEmbed";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * The paste–to–embed `setTimeout` ID. Stored as a property to allow
     * cleaning of the timeout.
     */
    private _timeoutId;
    /**
     * The position where the `<media>` element will be inserted after the timeout,
     * determined each time the new content is pasted into the document.
     */
    private _positionToInsert;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Analyzes the part of the document between provided positions in search for a URL representing media.
     * When the URL is found, it is automatically converted into media.
     *
     * @param leftPosition Left position of the selection.
     * @param rightPosition Right position of the selection.
     */
    private _embedMediaBetweenPositions;
}
