/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { Typing } from 'ckeditor5/src/typing.js';
import { EmojiRepository } from './emojirepository.js';
import { type EmojiPicker } from './emojipicker.js';
/**
 * The emoji mention plugin.
 *
 * Introduces the autocomplete of emojis while typing.
 */
export declare class EmojiMention extends Plugin {
    /**
     * An instance of the {@link module:emoji/emojipicker~EmojiPicker} plugin if it is loaded in the editor.
     */
    emojiPickerPlugin: EmojiPicker | null;
    /**
     * An instance of the {@link module:emoji/emojirepository~EmojiRepository} plugin.
     */
    emojiRepositoryPlugin: EmojiRepository;
    /**
     * A flag that informs if the {@link module:emoji/emojirepository~EmojiRepository} plugin is loaded correctly.
     */
    private _isEmojiRepositoryAvailable;
    /**
     * Defines a number of displayed items in the auto complete dropdown.
     *
     * It includes the "Show all emoji..." option if the `EmojiPicker` plugin is loaded.
     */
    private readonly _emojiDropdownLimit;
    /**
     * Defines a skin tone that is set in the emoji config.
     */
    private readonly _skinTone;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof EmojiRepository, typeof Typing, "Mention"];
    /**
     * @inheritDoc
     */
    static get pluginName(): "EmojiMention";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * Initializes the configuration for emojis in the mention feature.
     * If the marker used by emoji mention is already registered, it displays a warning.
     * If emoji mention configuration is detected, it does not register it for a second time.
     */
    private _setupMentionConfiguration;
    /**
     * @inheritDoc
     */
    init(): Promise<void>;
    /**
     * Returns the `itemRenderer()` callback for mention config.
     */
    private _customItemRendererFactory;
    /**
     * Overrides the default mention execute listener to insert an emoji as plain text instead.
     */
    private _overrideMentionExecuteListener;
    /**
     * Returns the `feed()` callback for mention config.
     */
    private _queryEmojiCallbackFactory;
}
