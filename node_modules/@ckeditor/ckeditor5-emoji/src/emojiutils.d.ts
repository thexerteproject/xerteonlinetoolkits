/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin } from 'ckeditor5/src/core.js';
import type { EmojiCdnResource, EmojiEntry } from './emojirepository.js';
/**
 * The Emoji utilities plugin.
 */
export declare class EmojiUtils extends Plugin {
    /**
     * Used for testing whether the environment supports the given emoji.
     */
    private _emojiCanvas;
    /**
     * @inheritDoc
     */
    static get pluginName(): "EmojiUtils";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Checks if the emoji is supported by verifying the emoji version supported by the system first.
     * Then checks if emoji contains a zero width joiner (ZWJ), and if yes, then checks if it is supported by the system.
     */
    isEmojiSupported(item: EmojiCdnResource, emojiSupportedVersionByOs: number, container: HTMLDivElement): boolean;
    /**
     * Checks the supported emoji version by the OS, by sampling some representatives from different emoji releases.
     */
    getEmojiSupportedVersionByOs(): number;
    /**
     * Check for ZWJ (zero width joiner) character.
     */
    hasZwj(emoji: string): boolean;
    /**
     * Checks whether the emoji is supported in the operating system.
     */
    isEmojiZwjSupported(item: EmojiCdnResource, container: HTMLDivElement): boolean;
    /**
     * Returns the width of the provided node.
     */
    getNodeWidth(container: HTMLDivElement, node: string): number;
    /**
     * Returns the width of the provided node.
     *
     * This is a faster alternative to `getNodeWidth` method, which works for great majority of emojis.
     */
    getNodeWidthUsingCanvas(container: HTMLDivElement, node: string): number;
    /**
     * Creates a div for emoji width testing purposes.
     */
    createEmojiWidthTestingContainer(): HTMLDivElement;
    /**
     * Adds default skin tone property to each emoji. If emoji defines other skin tones, they are added as well.
     */
    normalizeEmojiSkinTone(item: EmojiCdnResource): EmojiEntry;
    /**
     * Checks whether the emoji belongs to a group that is allowed.
     */
    isEmojiCategoryAllowed(item: EmojiCdnResource): boolean;
    /**
     * A function used to determine if emoji is supported by detecting pixels.
     *
     * Referenced for unit testing purposes. Kept in a separate file because of licensing.
     */
    private static _isEmojiSupported;
}
