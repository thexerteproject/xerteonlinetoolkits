/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module media-embed/automediaembed
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { ModelLiveRange, ModelLivePosition } from 'ckeditor5/src/engine.js';
import { Clipboard } from 'ckeditor5/src/clipboard.js';
import { Delete } from 'ckeditor5/src/typing.js';
import { Undo } from 'ckeditor5/src/undo.js';
import { global } from 'ckeditor5/src/utils.js';
import { MediaEmbedEditing } from './mediaembedediting.js';
import { insertMedia } from './utils.js';
const URL_REGEXP = /^(?:http(s)?:\/\/)?[\w-]+\.[\w-.~:/?#[\]@!$&'()*+,;=%]+$/;
/**
 * The auto-media embed plugin. It recognizes media links in the pasted content and embeds
 * them shortly after they are injected into the document.
 */
export class AutoMediaEmbed extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires() {
        return [Clipboard, Delete, Undo];
    }
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'AutoMediaEmbed';
    }
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin() {
        return true;
    }
    /**
     * The paste–to–embed `setTimeout` ID. Stored as a property to allow
     * cleaning of the timeout.
     */
    _timeoutId;
    /**
     * The position where the `<media>` element will be inserted after the timeout,
     * determined each time the new content is pasted into the document.
     */
    _positionToInsert;
    /**
     * @inheritDoc
     */
    constructor(editor) {
        super(editor);
        this._timeoutId = null;
        this._positionToInsert = null;
    }
    /**
     * @inheritDoc
     */
    init() {
        const editor = this.editor;
        const modelDocument = editor.model.document;
        // We need to listen on `Clipboard#inputTransformation` because we need to save positions of selection.
        // After pasting, the content between those positions will be checked for a URL that could be transformed
        // into media.
        const clipboardPipeline = editor.plugins.get('ClipboardPipeline');
        this.listenTo(clipboardPipeline, 'inputTransformation', () => {
            const firstRange = modelDocument.selection.getFirstRange();
            const leftLivePosition = ModelLivePosition.fromPosition(firstRange.start);
            leftLivePosition.stickiness = 'toPrevious';
            const rightLivePosition = ModelLivePosition.fromPosition(firstRange.end);
            rightLivePosition.stickiness = 'toNext';
            modelDocument.once('change:data', () => {
                this._embedMediaBetweenPositions(leftLivePosition, rightLivePosition);
                leftLivePosition.detach();
                rightLivePosition.detach();
            }, { priority: 'high' });
        });
        const undoCommand = editor.commands.get('undo');
        undoCommand.on('execute', () => {
            if (this._timeoutId) {
                global.window.clearTimeout(this._timeoutId);
                this._positionToInsert.detach();
                this._timeoutId = null;
                this._positionToInsert = null;
            }
        }, { priority: 'high' });
    }
    /**
     * Analyzes the part of the document between provided positions in search for a URL representing media.
     * When the URL is found, it is automatically converted into media.
     *
     * @param leftPosition Left position of the selection.
     * @param rightPosition Right position of the selection.
     */
    _embedMediaBetweenPositions(leftPosition, rightPosition) {
        const editor = this.editor;
        const mediaRegistry = editor.plugins.get(MediaEmbedEditing).registry;
        // TODO: Use marker instead of ModelLiveRange & LivePositions.
        const urlRange = new ModelLiveRange(leftPosition, rightPosition);
        const walker = urlRange.getWalker({ ignoreElementEnd: true });
        let url = '';
        for (const node of walker) {
            if (node.item.is('$textProxy')) {
                url += node.item.data;
            }
        }
        url = url.trim();
        // If the URL does not match to universal URL regexp, let's skip that.
        if (!url.match(URL_REGEXP)) {
            urlRange.detach();
            return;
        }
        // If the URL represents a media, let's use it.
        if (!mediaRegistry.hasMedia(url)) {
            urlRange.detach();
            return;
        }
        const mediaEmbedCommand = editor.commands.get('mediaEmbed');
        // Do not anything if media element cannot be inserted at the current position (#47).
        if (!mediaEmbedCommand.isEnabled) {
            urlRange.detach();
            return;
        }
        // Position won't be available in the `setTimeout` function so let's clone it.
        this._positionToInsert = ModelLivePosition.fromPosition(leftPosition);
        // This action mustn't be executed if undo was called between pasting and auto-embedding.
        this._timeoutId = global.window.setTimeout(() => {
            editor.model.change(writer => {
                this._timeoutId = null;
                writer.remove(urlRange);
                urlRange.detach();
                let insertionPosition = null;
                // Check if position where the media element should be inserted is still valid.
                // Otherwise leave it as undefined to use document.selection - default behavior of model.insertContent().
                if (this._positionToInsert.root.rootName !== '$graveyard') {
                    insertionPosition = this._positionToInsert;
                }
                insertMedia(editor.model, url, insertionPosition, false);
                this._positionToInsert.detach();
                this._positionToInsert = null;
            });
            editor.plugins.get(Delete).requestUndoOnBackspace();
        }, 100);
    }
}
