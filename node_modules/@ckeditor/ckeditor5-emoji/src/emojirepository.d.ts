/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { type Editor, Plugin } from 'ckeditor5/src/core.js';
import { EmojiUtils } from './emojiutils.js';
import type { EmojiSkinToneId } from './emojiconfig.js';
/**
 * The emoji repository plugin.
 *
 * Loads the emoji repository from URL during plugin initialization and provides utility methods to search it.
 */
export declare class EmojiRepository extends Plugin {
    /**
     * A callback to resolve the {@link #_repositoryPromise} to control the return value of this promise.
     */
    private _repositoryPromiseResolveCallback;
    /**
     * Emoji repository in a configured version.
     */
    private _items;
    /**
     * The resolved URL from which the emoji repository is downloaded.
     */
    private readonly _url;
    /**
     * A promise resolved after downloading the emoji collection.
     * The promise resolves with `true` when the repository is successfully downloaded or `false` otherwise.
     */
    private readonly _repositoryPromise;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof EmojiUtils];
    /**
     * @inheritDoc
     */
    static get pluginName(): "EmojiRepository";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    init(): Promise<void>;
    /**
     * Returns an array of emoji entries that match the search query.
     * If the emoji repository is not loaded this method returns an empty array.
     *
     * @param searchQuery A search query to match emoji.
     * @returns An array of emoji entries that match the search query.
     */
    getEmojiByQuery(searchQuery: string): Array<EmojiEntry>;
    /**
     * Groups all emojis by categories.
     * If the emoji repository is not loaded, it returns an empty array.
     *
     * @returns An array of emoji entries grouped by categories.
     */
    getEmojiCategories(): Array<EmojiCategory>;
    /**
     * Returns an array of available skin tones.
     */
    getSkinTones(): Array<EmojiSkinTone>;
    /**
     * Indicates whether the emoji repository has been successfully downloaded and the plugin is operational.
     */
    isReady(): Promise<boolean>;
    /**
     * Returns the URL from which the emoji repository is downloaded. If the URL is not provided
     * in the configuration, the default URL is used with the version from the configuration.
     *
     * If both the URL and version are provided, a warning is logged.
     */
    private _getUrl;
    /**
     * Warn users on self-hosted installations that this plugin uses a CDN to fetch the emoji repository.
     */
    private _warnAboutCdnUse;
    /**
     * Returns the emoji repository in a configured version if it is a non-empty array. Returns `null` otherwise.
     */
    private _getItems;
    /**
     * Loads the emoji repository. If the repository is already loaded, it returns the cached result.
     * Otherwise, it fetches the repository from the URL and adds it to the cache.
     */
    private _loadAndCacheEmoji;
    /**
     * Normalizes the raw data fetched from CDN. By normalization, we meant:
     *
     *  * Filter out unsupported emoji (these that will not render correctly),
     *  * Prepare skin tone variants if an emoji defines them.
     */
    private _normalizeEmoji;
    /**
     * Versioned emoji repository.
     */
    private static _results;
}
/**
 * Represents a single group of the emoji category, e.g., "Smileys & Expressions".
 */
export type EmojiCategory = {
    /**
     * A name of the category.
     */
    title: string;
    /**
     * An example emoji representing items belonging to the category.
     */
    icon: string;
    /**
     * Group id used to assign {@link #items}.
     */
    groupId: number;
    /**
     * An array of emojis.
     */
    items: Array<EmojiEntry>;
};
/**
 * Represents a single item fetched from the CDN.
 */
export type EmojiCdnResource = {
    annotation: string;
    emoji: string;
    group: number;
    order: number;
    version: number;
    emoticon?: string;
    shortcodes?: Array<string>;
    skins?: Array<{
        emoji: string;
        tone: number;
        version: number;
    }>;
    tags?: Array<string>;
};
/**
 * Represents a single emoji item used by the Emoji feature.
 */
export type EmojiEntry = Omit<EmojiCdnResource, 'skins'> & {
    skins: EmojiMap;
};
/**
 * Represents mapping between a skin tone and its corresponding emoji.
 *
 * The `default` key is always present. Additional values are assigned only if an emoji supports skin tones.
 */
export type EmojiMap = {
    [K in Exclude<EmojiSkinToneId, 'default'>]?: string;
} & {
    default: string;
};
/**
 * Represents an emoji skin tone variant.
 */
export type EmojiSkinTone = {
    id: EmojiSkinToneId;
    icon: string;
    tooltip: string;
};
/**
 * Unable to load the emoji repository from the URL.
 *
 * If the URL works properly and there is no disruption of communication, please check your
 * {@glink getting-started/setup/csp Content Security Policy (CSP)} setting and make sure
 * the URL connection is allowed by the editor.
 *
 * @error emoji-repository-load-failed
 */
