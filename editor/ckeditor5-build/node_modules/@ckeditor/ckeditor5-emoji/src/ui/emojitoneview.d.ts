/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module emoji/ui/emojitoneview
 */
import { View, type DropdownView } from 'ckeditor5/src/ui.js';
import { type Locale } from 'ckeditor5/src/utils.js';
import type { EmojiSkinToneId } from '../emojiconfig.js';
import type { EmojiSkinTone } from '../emojirepository.js';
import '../../theme/emojitone.css';
/**
 * A view responsible for selecting a skin tone for an emoji.
 */
export declare class EmojiToneView extends View {
    /**
     * Active skin tone.
     *
     * @observable
     */
    skinTone: EmojiSkinToneId;
    /**
     * A dropdown element for selecting an active skin tone.
     */
    readonly dropdownView: DropdownView;
    /**
     * An array of available skin tones.
     */
    private readonly _skinTones;
    /**
     * @inheritDoc
     */
    constructor(locale: Locale, { skinTone, skinTones }: {
        skinTone: EmojiSkinToneId;
        skinTones: Array<EmojiSkinTone>;
    });
    /**
     * @inheritDoc
     */
    focus(): void;
    /**
     * Helper method for receiving an object describing the active skin tone.
     */
    private _getSkinTone;
}
