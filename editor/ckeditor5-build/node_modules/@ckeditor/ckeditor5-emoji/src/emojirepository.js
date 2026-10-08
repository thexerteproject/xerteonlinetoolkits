/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module emoji/emojirepository
 */
import fuzzysort from 'fuzzysort';
import { groupBy } from 'es-toolkit/compat';
import { Plugin } from 'ckeditor5/src/core.js';
import { logWarning, version as editorVersion } from 'ckeditor5/src/utils.js';
import { EmojiUtils } from './emojiutils.js';
// An endpoint from which the emoji data will be downloaded during plugin initialization.
// The `{version}` placeholder is replaced with the value from editor config.
const DEFAULT_EMOJI_DATABASE_URL = 'https://cdn.ckeditor.com/ckeditor5/data/emoji/{version}/en.json';
const DEFAULT_EMOJI_VERSION = 16;
/**
 * The emoji repository plugin.
 *
 * Loads the emoji repository from URL during plugin initialization and provides utility methods to search it.
 */
export class EmojiRepository extends Plugin {
    /**
     * Emoji repository in a configured version.
     */
    _items;
    /**
     * The resolved URL from which the emoji repository is downloaded.
     */
    _url;
    /**
     * A promise resolved after downloading the emoji collection.
     * The promise resolves with `true` when the repository is successfully downloaded or `false` otherwise.
     */
    _repositoryPromise;
    /**
     * @inheritDoc
     */
    static get requires() {
        return [EmojiUtils];
    }
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'EmojiRepository';
    }
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin() {
        return true;
    }
    /**
     * @inheritDoc
     */
    constructor(editor) {
        super(editor);
        editor.config.define('emoji', {
            version: undefined,
            skinTone: 'default',
            definitionsUrl: undefined,
            useCustomFont: false
        });
        this._url = this._getUrl();
        this._repositoryPromise = new Promise(resolve => {
            this._repositoryPromiseResolveCallback = resolve;
        });
        this._items = null;
    }
    /**
     * @inheritDoc
     */
    async init() {
        this._warnAboutCdnUse();
        await this._loadAndCacheEmoji();
        this._items = this._getItems();
        if (!this._items) {
            /**
             * Unable to identify the available emoji to display.
             *
             * See the {@glink features/emoji#troubleshooting troubleshooting} section in the {@glink features/emoji Emoji feature} guide
             * for more details.
             *
             * @error emoji-repository-empty
             */
            logWarning('emoji-repository-empty');
            return this._repositoryPromiseResolveCallback(false);
        }
        return this._repositoryPromiseResolveCallback(true);
    }
    /**
     * Returns an array of emoji entries that match the search query.
     * If the emoji repository is not loaded this method returns an empty array.
     *
     * @param searchQuery A search query to match emoji.
     * @returns An array of emoji entries that match the search query.
     */
    getEmojiByQuery(searchQuery) {
        if (!this._items) {
            return [];
        }
        const searchQueryTokens = searchQuery.split(/\s/).filter(Boolean);
        // Perform the search only if there is at least two non-white characters next to each other.
        const shouldSearch = searchQueryTokens.some(token => token.length >= 2);
        if (!shouldSearch) {
            return [];
        }
        return fuzzysort
            .go(searchQuery, this._items, {
            threshold: 0.6,
            keys: [
                'emoticon',
                'annotation',
                (emojiEntry) => {
                    // Instead of searching over all tags, let's use only those that matches the query.
                    // It enables searching in tags with the space character in names.
                    const searchQueryTokens = searchQuery.split(/\s/).filter(Boolean);
                    const matchedTags = searchQueryTokens.flatMap(tok => {
                        return emojiEntry.tags?.filter(t => t.startsWith(tok));
                    });
                    return matchedTags.join();
                }
            ]
        })
            .map(result => result.obj);
    }
    /**
     * Groups all emojis by categories.
     * If the emoji repository is not loaded, it returns an empty array.
     *
     * @returns An array of emoji entries grouped by categories.
     */
    getEmojiCategories() {
        const repository = this._getItems();
        if (!repository) {
            return [];
        }
        const { t } = this.editor.locale;
        const categories = [
            { title: t('Smileys & Expressions'), icon: '😄', groupId: 0 },
            { title: t('Gestures & People'), icon: '👋', groupId: 1 },
            { title: t('Animals & Nature'), icon: '🐻', groupId: 3 },
            { title: t('Food & Drinks'), icon: '🍎', groupId: 4 },
            { title: t('Travel & Places'), icon: '🚘', groupId: 5 },
            { title: t('Activities'), icon: '🏀', groupId: 6 },
            { title: t('Objects'), icon: '💡', groupId: 7 },
            { title: t('Symbols'), icon: '🔵', groupId: 8 },
            { title: t('Flags'), icon: '🏁', groupId: 9 }
        ];
        const groups = groupBy(repository, item => item.group);
        return categories.map(category => {
            return {
                ...category,
                items: groups[category.groupId]
            };
        });
    }
    /**
     * Returns an array of available skin tones.
     */
    getSkinTones() {
        const { t } = this.editor.locale;
        return [
            { id: 'default', icon: '👋', tooltip: t('Default skin tone') },
            { id: 'light', icon: '👋🏻', tooltip: t('Light skin tone') },
            { id: 'medium-light', icon: '👋🏼', tooltip: t('Medium Light skin tone') },
            { id: 'medium', icon: '👋🏽', tooltip: t('Medium skin tone') },
            { id: 'medium-dark', icon: '👋🏾', tooltip: t('Medium Dark skin tone') },
            { id: 'dark', icon: '👋🏿', tooltip: t('Dark skin tone') }
        ];
    }
    /**
     * Indicates whether the emoji repository has been successfully downloaded and the plugin is operational.
     */
    isReady() {
        return this._repositoryPromise;
    }
    /**
     * Returns the URL from which the emoji repository is downloaded. If the URL is not provided
     * in the configuration, the default URL is used with the version from the configuration.
     *
     * If both the URL and version are provided, a warning is logged.
     */
    _getUrl() {
        const { definitionsUrl, version } = this.editor.config.get('emoji');
        if (!definitionsUrl || definitionsUrl === 'cdn') {
            // URL was not provided or is set to 'cdn', so we use the default CDN URL.
            const urlVersion = version || DEFAULT_EMOJI_VERSION;
            const url = new URL(DEFAULT_EMOJI_DATABASE_URL.replace('{version}', urlVersion.toString()));
            url.searchParams.set('editorVersion', editorVersion);
            return url;
        }
        if (version) {
            /**
             * Both {@link module:emoji/emojiconfig~EmojiConfig#definitionsUrl `emoji.definitionsUrl`} and
             * {@link module:emoji/emojiconfig~EmojiConfig#version `emoji.version`} configuration options
             * are set. Only the `emoji.definitionsUrl` option will be used.
             *
             * The `emoji.version` option will be ignored and should be removed from the configuration.
             *
             * @error emoji-repository-redundant-version
             */
            logWarning('emoji-repository-redundant-version');
        }
        return new URL(definitionsUrl);
    }
    /**
     * Warn users on self-hosted installations that this plugin uses a CDN to fetch the emoji repository.
     */
    _warnAboutCdnUse() {
        const editor = this.editor;
        const config = editor.config.get('emoji');
        const licenseKey = editor.config.get('licenseKey');
        const distributionChannel = window[Symbol.for('cke distribution')];
        if (licenseKey === 'GPL') {
            // Don't warn GPL users.
            return;
        }
        if (distributionChannel === 'cloud') {
            // Don't warn cloud users, because they already use our CDN.
            return;
        }
        if (config && config.definitionsUrl) {
            // Don't warn users who have configured their own definitions URL.
            return;
        }
        /**
         * It was detected that your installation uses a commercial license key,
         * and the default {@glink features/emoji#emoji-source CKEditor CDN for Emoji plugin data}.
         *
         * To avoid this, you can use the {@link module:emoji/emojiconfig~EmojiConfig#definitionsUrl `emoji.definitionsUrl`}
         * configuration option to provide a URL to your own emoji repository.
         *
         * If you want to suppress this warning, while using the default CDN, set this configuration option to `cdn`.
         *
         * @error emoji-repository-cdn-use
         */
        logWarning('emoji-repository-cdn-use');
    }
    /**
     * Returns the emoji repository in a configured version if it is a non-empty array. Returns `null` otherwise.
     */
    _getItems() {
        const repository = EmojiRepository._results[this._url.href];
        return repository && repository.length ? repository : null;
    }
    /**
     * Loads the emoji repository. If the repository is already loaded, it returns the cached result.
     * Otherwise, it fetches the repository from the URL and adds it to the cache.
     */
    async _loadAndCacheEmoji() {
        if (EmojiRepository._results[this._url.href]) {
            // The repository has already been downloaded.
            return;
        }
        const result = await fetch(this._url, { cache: 'force-cache' })
            .then(response => {
            if (!response.ok) {
                return [];
            }
            return response.json();
        })
            .catch(() => {
            return [];
        });
        EmojiRepository._results[this._url.href] = this._normalizeEmoji(result);
    }
    /**
     * Normalizes the raw data fetched from CDN. By normalization, we meant:
     *
     *  * Filter out unsupported emoji (these that will not render correctly),
     *  * Prepare skin tone variants if an emoji defines them.
     */
    _normalizeEmoji(data) {
        const editor = this.editor;
        const useCustomFont = editor.config.get('emoji.useCustomFont');
        const emojiUtils = editor.plugins.get('EmojiUtils');
        const insertableEmoji = data.filter(item => emojiUtils.isEmojiCategoryAllowed(item));
        // When using a custom font, the feature does not filter any emoji.
        if (useCustomFont) {
            return insertableEmoji.map(item => emojiUtils.normalizeEmojiSkinTone(item));
        }
        const emojiSupportedVersionByOs = emojiUtils.getEmojiSupportedVersionByOs();
        const container = emojiUtils.createEmojiWidthTestingContainer();
        document.body.appendChild(container);
        const results = insertableEmoji
            .filter(item => emojiUtils.isEmojiSupported(item, emojiSupportedVersionByOs, container))
            .map(item => emojiUtils.normalizeEmojiSkinTone(item));
        container.remove();
        return results;
    }
    /**
     * Versioned emoji repository.
     */
    static _results = {};
}
/**
 * Unable to load the emoji repository from the URL.
 *
 * If the URL works properly and there is no disruption of communication, please check your
 * {@glink getting-started/setup/csp Content Security Policy (CSP)} setting and make sure
 * the URL connection is allowed by the editor.
 *
 * @error emoji-repository-load-failed
 */
