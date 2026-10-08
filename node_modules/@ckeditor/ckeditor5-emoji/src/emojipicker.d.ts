/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module emoji/emojipicker
 */
import { ContextualBalloon, Dialog } from 'ckeditor5/src/ui.js';
import { Plugin } from 'ckeditor5/src/core.js';
import { Typing } from 'ckeditor5/src/typing.js';
import { EmojiRepository } from './emojirepository.js';
import { EmojiPickerView } from './ui/emojipickerview.js';
import { EmojiPickerFormView } from './ui/emojipickerformview.js';
import type { EmojiSkinToneId } from './emojiconfig.js';
import '../theme/emojipicker.css';
/**
 * The emoji picker plugin.
 *
 * Introduces the `'emoji'` dropdown.
 */
export declare class EmojiPicker extends Plugin {
    /**
     * The actions view displayed inside the balloon.
     */
    emojiPickerView: EmojiPickerView | undefined;
    /**
     * The form view displayed inside the balloon.
     */
    emojiPickerFormView: EmojiPickerFormView | undefined;
    /**
     * The contextual balloon plugin instance.
     */
    balloonPlugin: ContextualBalloon;
    /**
     * An instance of the {@link module:emoji/emojirepository~EmojiRepository} plugin.
     */
    emojiRepositoryPlugin: EmojiRepository;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof EmojiRepository, typeof ContextualBalloon, typeof Dialog, typeof Typing];
    /**
     * @inheritDoc
     */
    static get pluginName(): "EmojiPicker";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): Promise<void>;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Represents an active skin tone. Its value depends on the emoji UI plugin.
     *
     * Before opening the UI for the first time, the returned value is read from the editor configuration.
     * Otherwise, it reflects the user's intention.
     */
    get skinTone(): EmojiSkinToneId;
    /**
     * Displays the balloon with the emoji picker.
     *
     * @param [searchValue=''] A default query used to filer the grid when opening the UI.
     */
    showUI(searchValue?: string): void;
    /**
     * Creates a button for toolbar and menu bar that will show the emoji dialog.
     */
    private _createButton;
    /**
     * Creates an instance of the `EmojiPickerView` class that represents an emoji balloon.
     */
    private _createEmojiPickerView;
    /**
     * Creates an instance of the `EmojiPickerFormView` class that represents a balloon with the emoji picker.
     */
    private _createEmojiPickerFormView;
    /**
     * Hides the balloon with the emoji picker.
     *
     * @param updateFocus Whether to focus the editor after closing the emoji picker.
     */
    private _hideUI;
    /**
     * Registers converters.
     */
    private _setupConversion;
    /**
     * Returns positioning options for the {@link #balloonPlugin}. They control the way the balloon is attached
     * to the target element or selection.
     */
    private _getBalloonPositionData;
    /**
     * Displays a fake visual selection when the contextual balloon is displayed.
     *
     * This adds an 'emoji-picker' marker into the document that is rendered as a highlight on selected text fragment.
     */
    private _showFakeVisualSelection;
    /**
     * Hides the fake visual selection.
     */
    private _hideFakeVisualSelection;
}
