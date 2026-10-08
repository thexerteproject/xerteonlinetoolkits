/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module emoji/emoji
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { EmojiMention } from './emojimention.js';
import { EmojiPicker } from './emojipicker.js';
/**
 * The emoji plugin.
 *
 * This is a "glue" plugin which loads the following plugins:
 *
 * * {@link module:emoji/emojimention~EmojiMention},
 * * {@link module:emoji/emojipicker~EmojiPicker},
 */
export declare class Emoji extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof EmojiMention, typeof EmojiPicker];
    /**
     * @inheritDoc
     */
    static get pluginName(): "Emoji";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
}
