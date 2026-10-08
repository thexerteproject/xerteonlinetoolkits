/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin, Command } from '@ckeditor/ckeditor5-core/dist/index.js';
import { logWarning, version, FocusTracker, KeystrokeHandler, global, Collection } from '@ckeditor/ckeditor5-utils/dist/index.js';
import { Typing } from '@ckeditor/ckeditor5-typing/dist/index.js';
import fuzzysort from 'fuzzysort';
import { groupBy, escapeRegExp } from 'es-toolkit/compat';
import { View, addKeyboardHandlingForGrid, ButtonView, FocusCycler, SearchTextView, createLabeledInputText, createDropdown, UIModel, addListToDropdown, SearchInfoView, ViewCollection, isFocusable, isViewWithFocusCycler, FormHeaderView, ContextualBalloon, Dialog, MenuBarMenuListItemButtonView, clickOutsideHandler } from '@ckeditor/ckeditor5-ui/dist/index.js';
import { IconPreviousArrow, IconEmoji } from '@ckeditor/ckeditor5-icons/dist/index.js';

/**
 * @license Copyright (c) 2023, Koala Interactive SAS
 * For licensing, see https://github.com/koala-interactive/is-emoji-supported/blob/master/LICENSE.md
 */ /**
 * @module emoji/utils/isemojisupported
 */ /**
 * Checks if the two pixels parts are the same using canvas.
 *
 * @internal
 */ function isEmojiSupported(unicode) {
    const ctx = getCanvas();
    /* istanbul ignore next -- @preserve */ if (!ctx) {
        return false;
    }
    const CANVAS_HEIGHT = 25;
    const CANVAS_WIDTH = 20;
    const textSize = Math.floor(CANVAS_HEIGHT / 2);
    // Initialize canvas context.
    ctx.font = textSize + 'px Arial, Sans-Serif';
    ctx.textBaseline = 'top';
    ctx.canvas.width = CANVAS_WIDTH * 2;
    ctx.canvas.height = CANVAS_HEIGHT;
    ctx.clearRect(0, 0, CANVAS_WIDTH * 2, CANVAS_HEIGHT);
    // Draw in red on the left.
    ctx.fillStyle = '#FF0000';
    ctx.fillText(unicode, 0, 22);
    // Draw in blue on right.
    ctx.fillStyle = '#0000FF';
    ctx.fillText(unicode, CANVAS_WIDTH, 22);
    const a = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
    const count = a.length;
    let i = 0;
    // Search the first visible pixel.
    for(; i < count && !a[i + 3]; i += 4);
    // No visible pixel.
    /* istanbul ignore next -- @preserve */ if (i >= count) {
        return false;
    }
    // Emoji has immutable color, so we check the color of the emoji in two different colors.
    // the result show be the same.
    const x = CANVAS_WIDTH + i / 4 % CANVAS_WIDTH;
    const y = Math.floor(i / 4 / CANVAS_WIDTH);
    const b = ctx.getImageData(x, y, 1, 1).data;
    /* istanbul ignore next -- @preserve */ if (a[i] !== b[0] || a[i + 2] !== b[2]) {
        return false;
    }
    //Some emojis consist of different ones, so they will show multiple characters if they are not supported.
    /* istanbul ignore next -- @preserve */ if (ctx.measureText(unicode).width >= CANVAS_WIDTH) {
        return false;
    }
    // Supported.
    return true;
}
function getCanvas() {
    try {
        return document.createElement('canvas').getContext('2d', {
            willReadFrequently: true
        });
    } catch  {
        /* istanbul ignore next -- @preserve */ return null;
    }
}

/**
 * @module emoji/emojiutils
 */ const SKIN_TONE_MAP = {
    0: 'default',
    1: 'light',
    2: 'medium-light',
    3: 'medium',
    4: 'medium-dark',
    5: 'dark'
};
/**
 * A map representing an emoji and its release version.
 * It's used to identify a user's minimal supported emoji level.
 * We skip versions with older patches, such as 15.0 instead of 15.1 etc.
 */ const EMOJI_SUPPORT_LEVEL = {
    '🪎': 17,
    '🫩': 16,
    '🫨': 15.1,
    '🫠': 14,
    '😶‍🌫️': 13.1,
    '🧑‍💻': 12.1,
    '🥰': 11,
    '🤪': 5,
    '⚕️': 4,
    '🤣': 3,
    '👋🏽': 2,
    '😀': 1,
    '😐': 0.7,
    '😂': 0.6 // Face with Tears of Joy.
};
const BASELINE_EMOJI_WIDTH = 24;
/**
 * The Emoji utilities plugin.
 */ class EmojiUtils extends Plugin {
    /**
	 * Used for testing whether the environment supports the given emoji.
	 */ _emojiCanvas = null;
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'EmojiUtils';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        this._emojiCanvas = document.createElement('canvas').getContext('2d');
    }
    /**
	 * Checks if the emoji is supported by verifying the emoji version supported by the system first.
	 * Then checks if emoji contains a zero width joiner (ZWJ), and if yes, then checks if it is supported by the system.
	 */ isEmojiSupported(item, emojiSupportedVersionByOs, container) {
        const isEmojiVersionSupported = item.version <= emojiSupportedVersionByOs;
        if (!isEmojiVersionSupported) {
            return false;
        }
        if (!this.hasZwj(item.emoji)) {
            return true;
        }
        return this.isEmojiZwjSupported(item, container);
    }
    /**
	 * Checks the supported emoji version by the OS, by sampling some representatives from different emoji releases.
	 */ getEmojiSupportedVersionByOs() {
        for (const [emoji, emojiVersion] of Object.entries(EMOJI_SUPPORT_LEVEL)){
            if (EmojiUtils._isEmojiSupported(emoji)) {
                return emojiVersion;
            }
        }
        return 0;
    }
    /**
	 * Check for ZWJ (zero width joiner) character.
	 */ hasZwj(emoji) {
        return emoji.includes('\u200d');
    }
    /**
	 * Checks whether the emoji is supported in the operating system.
	 */ isEmojiZwjSupported(item, container) {
        // On Windows, some supported emoji are ~50% bigger than the baseline emoji, but what we really want to guard
        // against are the ones that are 2x the size, because those are truly broken (person with red hair = person with
        // floating red wig, black cat = cat with black square, polar bear = bear with snowflake, etc.)
        // So here we set the threshold at 1.8 times the size of the baseline emoji.
        const canvasWidth = this.getNodeWidthUsingCanvas(container, item.emoji);
        // Checking emoji using canvas is much faster, so always try it first. Unfortunately canvas has worse emoji coverage.
        if (canvasWidth < BASELINE_EMOJI_WIDTH * 1.8) {
            return true;
        }
        const domWidth = this.getNodeWidth(container, item.emoji);
        // Checking emoji using DOM is much slower, so use it as a fallback.
        return domWidth < BASELINE_EMOJI_WIDTH * 1.8;
    }
    /**
	 * Returns the width of the provided node.
	 */ getNodeWidth(container, node) {
        const span = document.createElement('span');
        span.textContent = node;
        container.appendChild(span);
        const nodeWidth = span.offsetWidth;
        container.removeChild(span);
        return nodeWidth;
    }
    /**
	 * Returns the width of the provided node.
	 *
	 * This is a faster alternative to `getNodeWidth` method, which works for great majority of emojis.
	 */ getNodeWidthUsingCanvas(container, node) {
        const style = getComputedStyle(container);
        this._emojiCanvas.font = [
            style.fontStyle,
            style.fontVariant,
            style.fontWeight,
            `${BASELINE_EMOJI_WIDTH}px`,
            `"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", ${style.fontFamily}`
        ].join(' ');
        return Math.ceil(this._emojiCanvas.measureText(node).width);
    }
    /**
	 * Creates a div for emoji width testing purposes.
	 */ createEmojiWidthTestingContainer() {
        const container = document.createElement('div');
        container.setAttribute('aria-hidden', 'true');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.whiteSpace = 'nowrap';
        container.style.fontSize = BASELINE_EMOJI_WIDTH + 'px';
        return container;
    }
    /**
	 * Adds default skin tone property to each emoji. If emoji defines other skin tones, they are added as well.
	 */ normalizeEmojiSkinTone(item) {
        const entry = {
            ...item,
            skins: {
                default: item.emoji
            }
        };
        if (item.skins) {
            item.skins.forEach((skin)=>{
                const skinTone = SKIN_TONE_MAP[skin.tone];
                entry.skins[skinTone] = skin.emoji;
            });
        }
        return entry;
    }
    /**
	 * Checks whether the emoji belongs to a group that is allowed.
	 */ isEmojiCategoryAllowed(item) {
        // Category group=2 contains skin tones only, which we do not want to render.
        return item.group !== 2;
    }
    /**
	 * A function used to determine if emoji is supported by detecting pixels.
	 *
	 * Referenced for unit testing purposes. Kept in a separate file because of licensing.
	 */ static _isEmojiSupported = isEmojiSupported;
}

// An endpoint from which the emoji data will be downloaded during plugin initialization.
// The `{version}` placeholder is replaced with the value from editor config.
const DEFAULT_EMOJI_DATABASE_URL = 'https://cdn.ckeditor.com/ckeditor5/data/emoji/{version}/en.json';
const DEFAULT_EMOJI_VERSION = 16;
/**
 * The emoji repository plugin.
 *
 * Loads the emoji repository from URL during plugin initialization and provides utility methods to search it.
 */ class EmojiRepository extends Plugin {
    /**
	 * Emoji repository in a configured version.
	 */ _items;
    /**
	 * The resolved URL from which the emoji repository is downloaded.
	 */ _url;
    /**
	 * A promise resolved after downloading the emoji collection.
	 * The promise resolves with `true` when the repository is successfully downloaded or `false` otherwise.
	 */ _repositoryPromise;
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            EmojiUtils
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'EmojiRepository';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        editor.config.define('emoji', {
            version: undefined,
            skinTone: 'default',
            definitionsUrl: undefined,
            useCustomFont: false
        });
        this._url = this._getUrl();
        this._repositoryPromise = new Promise((resolve)=>{
            this._repositoryPromiseResolveCallback = resolve;
        });
        this._items = null;
    }
    /**
	 * @inheritDoc
	 */ async init() {
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
			 */ logWarning('emoji-repository-empty');
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
	 */ getEmojiByQuery(searchQuery) {
        if (!this._items) {
            return [];
        }
        const searchQueryTokens = searchQuery.split(/\s/).filter(Boolean);
        // Perform the search only if there is at least two non-white characters next to each other.
        const shouldSearch = searchQueryTokens.some((token)=>token.length >= 2);
        if (!shouldSearch) {
            return [];
        }
        return fuzzysort.go(searchQuery, this._items, {
            threshold: 0.6,
            keys: [
                'emoticon',
                'annotation',
                (emojiEntry)=>{
                    // Instead of searching over all tags, let's use only those that matches the query.
                    // It enables searching in tags with the space character in names.
                    const searchQueryTokens = searchQuery.split(/\s/).filter(Boolean);
                    const matchedTags = searchQueryTokens.flatMap((tok)=>{
                        return emojiEntry.tags?.filter((t)=>t.startsWith(tok));
                    });
                    return matchedTags.join();
                }
            ]
        }).map((result)=>result.obj);
    }
    /**
	 * Groups all emojis by categories.
	 * If the emoji repository is not loaded, it returns an empty array.
	 *
	 * @returns An array of emoji entries grouped by categories.
	 */ getEmojiCategories() {
        const repository = this._getItems();
        if (!repository) {
            return [];
        }
        const { t } = this.editor.locale;
        const categories = [
            {
                title: t('Smileys & Expressions'),
                icon: '😄',
                groupId: 0
            },
            {
                title: t('Gestures & People'),
                icon: '👋',
                groupId: 1
            },
            {
                title: t('Animals & Nature'),
                icon: '🐻',
                groupId: 3
            },
            {
                title: t('Food & Drinks'),
                icon: '🍎',
                groupId: 4
            },
            {
                title: t('Travel & Places'),
                icon: '🚘',
                groupId: 5
            },
            {
                title: t('Activities'),
                icon: '🏀',
                groupId: 6
            },
            {
                title: t('Objects'),
                icon: '💡',
                groupId: 7
            },
            {
                title: t('Symbols'),
                icon: '🔵',
                groupId: 8
            },
            {
                title: t('Flags'),
                icon: '🏁',
                groupId: 9
            }
        ];
        const groups = groupBy(repository, (item)=>item.group);
        return categories.map((category)=>{
            return {
                ...category,
                items: groups[category.groupId]
            };
        });
    }
    /**
	 * Returns an array of available skin tones.
	 */ getSkinTones() {
        const { t } = this.editor.locale;
        return [
            {
                id: 'default',
                icon: '👋',
                tooltip: t('Default skin tone')
            },
            {
                id: 'light',
                icon: '👋🏻',
                tooltip: t('Light skin tone')
            },
            {
                id: 'medium-light',
                icon: '👋🏼',
                tooltip: t('Medium Light skin tone')
            },
            {
                id: 'medium',
                icon: '👋🏽',
                tooltip: t('Medium skin tone')
            },
            {
                id: 'medium-dark',
                icon: '👋🏾',
                tooltip: t('Medium Dark skin tone')
            },
            {
                id: 'dark',
                icon: '👋🏿',
                tooltip: t('Dark skin tone')
            }
        ];
    }
    /**
	 * Indicates whether the emoji repository has been successfully downloaded and the plugin is operational.
	 */ isReady() {
        return this._repositoryPromise;
    }
    /**
	 * Returns the URL from which the emoji repository is downloaded. If the URL is not provided
	 * in the configuration, the default URL is used with the version from the configuration.
	 *
	 * If both the URL and version are provided, a warning is logged.
	 */ _getUrl() {
        const { definitionsUrl, version: version$1 } = this.editor.config.get('emoji');
        if (!definitionsUrl || definitionsUrl === 'cdn') {
            // URL was not provided or is set to 'cdn', so we use the default CDN URL.
            const urlVersion = version$1 || DEFAULT_EMOJI_VERSION;
            const url = new URL(DEFAULT_EMOJI_DATABASE_URL.replace('{version}', urlVersion.toString()));
            url.searchParams.set('editorVersion', version);
            return url;
        }
        if (version$1) {
            /**
			 * Both {@link module:emoji/emojiconfig~EmojiConfig#definitionsUrl `emoji.definitionsUrl`} and
			 * {@link module:emoji/emojiconfig~EmojiConfig#version `emoji.version`} configuration options
			 * are set. Only the `emoji.definitionsUrl` option will be used.
			 *
			 * The `emoji.version` option will be ignored and should be removed from the configuration.
			 *
			 * @error emoji-repository-redundant-version
			 */ logWarning('emoji-repository-redundant-version');
        }
        return new URL(definitionsUrl);
    }
    /**
	 * Warn users on self-hosted installations that this plugin uses a CDN to fetch the emoji repository.
	 */ _warnAboutCdnUse() {
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
		 */ logWarning('emoji-repository-cdn-use');
    }
    /**
	 * Returns the emoji repository in a configured version if it is a non-empty array. Returns `null` otherwise.
	 */ _getItems() {
        const repository = EmojiRepository._results[this._url.href];
        return repository && repository.length ? repository : null;
    }
    /**
	 * Loads the emoji repository. If the repository is already loaded, it returns the cached result.
	 * Otherwise, it fetches the repository from the URL and adds it to the cache.
	 */ async _loadAndCacheEmoji() {
        if (EmojiRepository._results[this._url.href]) {
            // The repository has already been downloaded.
            return;
        }
        const result = await fetch(this._url, {
            cache: 'force-cache'
        }).then((response)=>{
            if (!response.ok) {
                return [];
            }
            return response.json();
        }).catch(()=>{
            return [];
        });
        EmojiRepository._results[this._url.href] = this._normalizeEmoji(result);
    }
    /**
	 * Normalizes the raw data fetched from CDN. By normalization, we meant:
	 *
	 *  * Filter out unsupported emoji (these that will not render correctly),
	 *  * Prepare skin tone variants if an emoji defines them.
	 */ _normalizeEmoji(data) {
        const editor = this.editor;
        const useCustomFont = editor.config.get('emoji.useCustomFont');
        const emojiUtils = editor.plugins.get('EmojiUtils');
        const insertableEmoji = data.filter((item)=>emojiUtils.isEmojiCategoryAllowed(item));
        // When using a custom font, the feature does not filter any emoji.
        if (useCustomFont) {
            return insertableEmoji.map((item)=>emojiUtils.normalizeEmojiSkinTone(item));
        }
        const emojiSupportedVersionByOs = emojiUtils.getEmojiSupportedVersionByOs();
        const container = emojiUtils.createEmojiWidthTestingContainer();
        document.body.appendChild(container);
        const results = insertableEmoji.filter((item)=>emojiUtils.isEmojiSupported(item, emojiSupportedVersionByOs, container)).map((item)=>emojiUtils.normalizeEmojiSkinTone(item));
        container.remove();
        return results;
    }
    /**
	 * Versioned emoji repository.
	 */ static _results = {};
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

const EMOJI_MENTION_MARKER = ':';
const EMOJI_SHOW_ALL_OPTION_ID = ':__EMOJI_SHOW_ALL:';
const EMOJI_HINT_OPTION_ID = ':__EMOJI_HINT:';
/**
 * The emoji mention plugin.
 *
 * Introduces the autocomplete of emojis while typing.
 */ class EmojiMention extends Plugin {
    /**
	 * Defines a number of displayed items in the auto complete dropdown.
	 *
	 * It includes the "Show all emoji..." option if the `EmojiPicker` plugin is loaded.
	 */ _emojiDropdownLimit;
    /**
	 * Defines a skin tone that is set in the emoji config.
	 */ _skinTone;
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            EmojiRepository,
            Typing,
            'Mention'
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'EmojiMention';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        this.editor.config.define('emoji', {
            dropdownLimit: 6
        });
        this._emojiDropdownLimit = editor.config.get('emoji.dropdownLimit');
        this._skinTone = editor.config.get('emoji.skinTone');
        this._setupMentionConfiguration(editor);
    }
    /**
	 * Initializes the configuration for emojis in the mention feature.
	 * If the marker used by emoji mention is already registered, it displays a warning.
	 * If emoji mention configuration is detected, it does not register it for a second time.
	 */ _setupMentionConfiguration(editor) {
        const mergeFieldsPrefix = editor.config.get('mergeFields.prefix');
        const mentionFeedsConfigs = editor.config.get('mention.feeds');
        const isEmojiMarkerUsedByMergeFields = mergeFieldsPrefix ? mergeFieldsPrefix[0] === EMOJI_MENTION_MARKER : false;
        const isEmojiMarkerUsedByMention = mentionFeedsConfigs.filter((config)=>!config._isEmojiMarker).some((config)=>config.marker === EMOJI_MENTION_MARKER);
        if (isEmojiMarkerUsedByMention || isEmojiMarkerUsedByMergeFields) {
            /**
			 * The `marker` in the `emoji` config is already used by other plugin configuration.
			 *
			 * @error emoji-config-marker-already-used
			 * @param {string} marker Used marker.
			 */ logWarning('emoji-config-marker-already-used', {
                marker: EMOJI_MENTION_MARKER
            });
            return;
        }
        const isEmojiConfigDefined = mentionFeedsConfigs.some((config)=>config._isEmojiMarker);
        if (isEmojiConfigDefined) {
            return;
        }
        const emojiMentionFeedConfig = {
            _isEmojiMarker: true,
            marker: EMOJI_MENTION_MARKER,
            dropdownLimit: this._emojiDropdownLimit,
            itemRenderer: this._customItemRendererFactory(this.editor.t),
            feed: this._queryEmojiCallbackFactory()
        };
        this.editor.config.set('mention.feeds', [
            ...mentionFeedsConfigs,
            emojiMentionFeedConfig
        ]);
    }
    /**
	 * @inheritDoc
	 */ async init() {
        const editor = this.editor;
        this.emojiPickerPlugin = editor.plugins.has('EmojiPicker') ? editor.plugins.get('EmojiPicker') : null;
        this.emojiRepositoryPlugin = editor.plugins.get('EmojiRepository');
        this._isEmojiRepositoryAvailable = await this.emojiRepositoryPlugin.isReady();
        // Override the `mention` command listener if the emoji repository is ready.
        if (this._isEmojiRepositoryAvailable) {
            editor.once('ready', this._overrideMentionExecuteListener.bind(this));
        }
    }
    /**
	 * Returns the `itemRenderer()` callback for mention config.
	 */ _customItemRendererFactory(t) {
        return (item)=>{
            const itemElement = document.createElement('button');
            itemElement.classList.add('ck');
            itemElement.classList.add('ck-button');
            itemElement.classList.add('ck-button_with-text');
            itemElement.id = `mention-list-item-id${item.id.slice(0, -1)}`;
            itemElement.type = 'button';
            itemElement.tabIndex = -1;
            const labelElement = document.createElement('span');
            labelElement.classList.add('ck');
            labelElement.classList.add('ck-button__label');
            itemElement.appendChild(labelElement);
            if (item.id === EMOJI_HINT_OPTION_ID) {
                itemElement.classList.add('ck-list-item-button');
                itemElement.classList.add('ck-disabled');
                labelElement.textContent = t('Keep on typing to see the emoji.');
            } else if (item.id === EMOJI_SHOW_ALL_OPTION_ID) {
                labelElement.textContent = t('Show all emoji...');
            } else {
                labelElement.textContent = `${item.text} ${item.id}`;
            }
            return itemElement;
        };
    }
    /**
	 * Overrides the default mention execute listener to insert an emoji as plain text instead.
	 */ _overrideMentionExecuteListener() {
        const editor = this.editor;
        editor.commands.get('mention').on('execute', (event, data)=>{
            const eventData = data[0];
            // Ignore non-emoji auto-complete actions.
            if (eventData.marker !== EMOJI_MENTION_MARKER) {
                return;
            }
            // Do not propagate the event.
            event.stop();
            // Do nothing when executing after selecting a hint message.
            if (eventData.mention.id === EMOJI_HINT_OPTION_ID) {
                return;
            }
            // Trigger the picker UI.
            if (eventData.mention.id === EMOJI_SHOW_ALL_OPTION_ID) {
                const text = [
                    ...eventData.range.getItems()
                ].filter((item)=>item.is('$textProxy')).map((item)=>item.data).reduce((result, text)=>result + text, '');
                editor.model.change((writer)=>{
                    editor.model.deleteContent(writer.createSelection(eventData.range));
                });
                const emojiPickerPlugin = this.emojiPickerPlugin;
                emojiPickerPlugin.showUI(text.slice(1));
                setTimeout(()=>{
                    emojiPickerPlugin.emojiPickerView.focus();
                });
            } else {
                editor.execute('insertText', {
                    text: eventData.mention.text,
                    range: eventData.range
                });
            }
        }, {
            priority: 'high'
        });
    }
    /**
	 * Returns the `feed()` callback for mention config.
	 */ _queryEmojiCallbackFactory() {
        return (searchQuery)=>{
            // Do not show anything when a query starts with a space.
            if (searchQuery.startsWith(' ')) {
                return [];
            }
            // Do not show anything when a query starts with a marker character.
            if (searchQuery.startsWith(EMOJI_MENTION_MARKER)) {
                return [];
            }
            // If the repository plugin is not available, return an empty feed to avoid confusion. See: #17842.
            if (!this._isEmojiRepositoryAvailable) {
                return [];
            }
            const emojis = this.emojiRepositoryPlugin.getEmojiByQuery(searchQuery).map((emoji)=>{
                let text = emoji.skins[this._skinTone] || emoji.skins.default;
                if (this.emojiPickerPlugin) {
                    text = emoji.skins[this.emojiPickerPlugin.skinTone] || emoji.skins.default;
                }
                return {
                    id: `:${emoji.annotation}:`,
                    text
                };
            });
            if (!this.emojiPickerPlugin) {
                return emojis.slice(0, this._emojiDropdownLimit);
            }
            const actionItem = {
                id: searchQuery.length > 1 ? EMOJI_SHOW_ALL_OPTION_ID : EMOJI_HINT_OPTION_ID
            };
            return [
                ...emojis.slice(0, this._emojiDropdownLimit - 1),
                actionItem
            ];
        };
    }
}

/**
 * Command that shows the emoji user interface.
 */ class EmojiCommand extends Command {
    /**
	 * Updates the command's {@link #isEnabled} based on the current selection.
	 */ refresh() {
        const editor = this.editor;
        const model = editor.model;
        const schema = model.schema;
        const selection = model.document.selection;
        this.isEnabled = schema.checkChild(selection.getFirstPosition(), '$text');
    }
    /**
	 * Opens emoji user interface for the current document selection.
	 *
	 * @fires execute
	 * @param [searchValue=''] A default query used to filer the grid when opening the UI.
	 */ execute(searchValue = '') {
        const emojiPickerPlugin = this.editor.plugins.get('EmojiPicker');
        emojiPickerPlugin.showUI(searchValue);
    }
}

/**
 * A grid of emoji tiles. It allows browsing emojis and selecting them to be inserted into the content.
 */ class EmojiGridView extends View {
    /**
	 * A collection of the child tile views. Each tile represents a particular emoji.
	 */ tiles;
    /**
	 * Tracks information about the DOM focus in the grid.
	 */ focusTracker;
    /**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */ keystrokes;
    /**
	 * An array containing all emojis grouped by their categories.
	 */ emojiCategories;
    /**
	 * A collection of all already created tile views. Each tile represents a particular emoji.
	 * The cached tiles collection is used for efficiency purposes to avoid re-creating a particular
	 * tile again when the grid view has changed.
	 */ cachedTiles;
    /**
	 * A callback used to filter grid items by a specified query.
	 */ _getEmojiByQuery;
    /**
	 * @inheritDoc
	 */ constructor(locale, { categoryName, emojiCategories, getEmojiByQuery, skinTone }){
        super(locale);
        this.set('isEmpty', true);
        this.set('categoryName', categoryName);
        this.set('skinTone', skinTone);
        this.tiles = this.createCollection();
        this.cachedTiles = this.createCollection();
        this.focusTracker = new FocusTracker();
        this.keystrokes = new KeystrokeHandler();
        this._getEmojiByQuery = getEmojiByQuery;
        this.emojiCategories = emojiCategories;
        const bind = this.bindTemplate;
        this.setTemplate({
            tag: 'div',
            children: [
                {
                    tag: 'div',
                    attributes: {
                        role: 'grid',
                        class: [
                            'ck',
                            'ck-emoji__grid'
                        ]
                    },
                    children: this.tiles
                }
            ],
            attributes: {
                role: 'tabpanel',
                class: [
                    'ck',
                    'ck-emoji__tiles',
                    // To avoid issues with focus cycling, ignore a grid when it's empty.
                    bind.if('isEmpty', 'ck-hidden', (value)=>value)
                ]
            }
        });
        addKeyboardHandlingForGrid({
            keystrokeHandler: this.keystrokes,
            focusTracker: this.focusTracker,
            gridItems: this.tiles,
            numberOfColumns: ()=>global.window.getComputedStyle(this.element.firstChild) // Responsive `.ck-emoji-grid__tiles`.
                .getPropertyValue('grid-template-columns').split(' ').length,
            uiLanguageDirection: this.locale && this.locale.uiLanguageDirection
        });
    }
    /**
	 * @inheritDoc
	 */ render() {
        super.render();
        this.keystrokes.listenTo(this.element);
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        this.keystrokes.destroy();
        this.focusTracker.destroy();
    }
    /**
	 * Focuses the first focusable in {@link ~EmojiGridView#tiles} if available.
	 */ focus() {
        const firstTile = this.tiles.first;
        if (firstTile) {
            firstTile.focus();
        }
    }
    /**
	 * Filters the grid view by the given regular expression.
	 *
	 * It filters either by the pattern or an emoji category, but never both.
	 *
	 * @param pattern Expression to search or `null` when filter by category name.
	 */ filter(pattern) {
        const { matchingItems, allItems } = pattern ? this._getItemsByQuery(pattern.source) : this._getItemsByCategory();
        this._updateGrid(matchingItems);
        this.set('isEmpty', matchingItems.length === 0);
        return {
            resultsCount: matchingItems.length,
            totalItemsCount: allItems.length
        };
    }
    /**
	 * Filters emojis to show based on the specified query phrase.
	 *
	 * @param query A query used to filter the grid.
	 */ _getItemsByQuery(query) {
        return {
            matchingItems: this._getEmojiByQuery(query),
            allItems: this.emojiCategories.flatMap((group)=>group.items)
        };
    }
    /**
	 * Returns emojis that belong to the specified category.
	 */ _getItemsByCategory() {
        const emojiCategory = this.emojiCategories.find((item)=>item.title === this.categoryName);
        const { items } = emojiCategory;
        return {
            matchingItems: items,
            allItems: items
        };
    }
    /**
	 * Updates the grid by removing the existing items and insert the new ones.
	 *
	 * @param items An array of items to insert.
	 */ _updateGrid(items) {
        // Clean-up.
        [
            ...this.tiles
        ].forEach((item)=>{
            this.focusTracker.remove(item);
            this.tiles.remove(item);
        });
        items// Create tiles from matching results.
        .map((item)=>{
            const emoji = item.skins[this.skinTone] || item.skins.default;
            return this.cachedTiles.get(emoji) || this._createTile(emoji, item.annotation);
        })// Insert new elements.
        .forEach((item)=>{
            this.tiles.add(item);
            this.focusTracker.add(item);
        });
    }
    /**
	 * Creates a new tile for the grid. Created tile is added to the {@link #cachedTiles} collection for further usage, if needed.
	 *
	 * @param emoji The emoji itself.
	 * @param name The name of the emoji (e.g. "Smiling Face with Smiling Eyes").
	 */ _createTile(emoji, name) {
        const tile = new ButtonView(this.locale);
        tile.viewUid = emoji;
        tile.extendTemplate({
            attributes: {
                class: [
                    'ck-emoji__tile'
                ]
            }
        });
        tile.set({
            label: emoji,
            tooltip: name,
            withText: true,
            ariaLabel: name,
            // To improve accessibility, disconnect a button and its label connection so that screen
            // readers can read the `[aria-label]` attribute directly from the more descriptive button.
            ariaLabelledBy: undefined
        });
        tile.on('execute', ()=>{
            this.fire('execute', {
                name,
                emoji
            });
        });
        this.cachedTiles.add(tile);
        return tile;
    }
}

/**
 * A class representing the navigation part of the emoji UI.
 * It is responsible allowing the user to select a particular emoji category.
 */ class EmojiCategoriesView extends View {
    /**
	 * Tracks information about the DOM focus in the grid.
	 */ focusTracker;
    /**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */ keystrokes;
    /**
	 * Helps cycling over focusable children in the input view.
	 */ focusCycler;
    /**
	 * A collection of the categories buttons.
	 */ buttonViews;
    /**
	 * @inheritDoc
	 */ constructor(locale, { emojiCategories, categoryName }){
        super(locale);
        this.buttonViews = this.createCollection(emojiCategories.map((emojiCategory)=>this._createCategoryButton(emojiCategory)));
        this.focusTracker = new FocusTracker();
        this.keystrokes = new KeystrokeHandler();
        this.focusCycler = new FocusCycler({
            focusables: this.buttonViews,
            focusTracker: this.focusTracker,
            keystrokeHandler: this.keystrokes,
            actions: {
                focusPrevious: 'arrowleft',
                focusNext: 'arrowright'
            }
        });
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-emoji__categories-list'
                ],
                role: 'tablist'
            },
            children: this.buttonViews
        });
        this.on('change:categoryName', (event, name, newValue, oldValue)=>{
            const oldCategoryButton = this.buttonViews.find((button)=>button.tooltip === oldValue);
            if (oldCategoryButton) {
                oldCategoryButton.isOn = false;
            }
            const newCategoryButton = this.buttonViews.find((button)=>button.tooltip === newValue);
            newCategoryButton.isOn = true;
        });
        this.set('categoryName', categoryName);
    }
    /**
	 * @inheritDoc
	 */ render() {
        super.render();
        this.buttonViews.forEach((buttonView)=>{
            this.focusTracker.add(buttonView);
        });
        this.keystrokes.listenTo(this.element);
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        this.focusTracker.destroy();
        this.keystrokes.destroy();
        this.buttonViews.destroy();
    }
    /**
	 * @inheritDoc
	 */ focus() {
        this.buttonViews.first.focus();
    }
    /**
	 * Marks all categories buttons as enabled (clickable).
	 */ enableCategories() {
        this.buttonViews.forEach((buttonView)=>{
            buttonView.isEnabled = true;
        });
    }
    /**
	 * Marks all categories buttons as disabled (non-clickable).
	 */ disableCategories() {
        this.buttonViews.forEach((buttonView)=>{
            buttonView.set({
                class: '',
                isEnabled: false,
                isOn: false
            });
        });
    }
    /**
	 * Creates a button representing a category item.
	 */ _createCategoryButton(emojiCategory) {
        const buttonView = new ButtonView();
        const bind = buttonView.bindTemplate;
        // A `[role="tab"]` element requires also the `[aria-selected]` attribute with its state.
        buttonView.extendTemplate({
            attributes: {
                'aria-selected': bind.to('isOn', (value)=>value.toString()),
                class: [
                    'ck-emoji__category-item'
                ]
            }
        });
        buttonView.set({
            ariaLabel: emojiCategory.title,
            label: emojiCategory.icon,
            role: 'tab',
            tooltip: emojiCategory.title,
            withText: true,
            // To improve accessibility, disconnect a button and its label connection so that screen
            // readers can read the `[aria-label]` attribute directly from the more descriptive button.
            ariaLabelledBy: undefined
        });
        buttonView.on('execute', ()=>{
            this.categoryName = emojiCategory.title;
        });
        buttonView.on('change:isEnabled', ()=>{
            if (buttonView.isEnabled && buttonView.tooltip === this.categoryName) {
                buttonView.isOn = true;
            }
        });
        return buttonView;
    }
}

/**
 * A view responsible for providing an input element that allows filtering emoji by the provided query.
 */ class EmojiSearchView extends View {
    /**
	 * The find in text input view that stores the searched string.
	 */ inputView;
    /**
	 * An instance of the `EmojiGridView`.
	 */ gridView;
    /**
	 * @inheritDoc
	 */ constructor(locale, { gridView, resultsView }){
        super(locale);
        this.gridView = gridView;
        const t = locale.t;
        this.inputView = new SearchTextView(this.locale, {
            queryView: {
                label: t('Find an emoji (min. 2 characters)'),
                creator: createLabeledInputText
            },
            filteredView: this.gridView,
            infoView: {
                instance: resultsView
            }
        });
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-search'
                ],
                tabindex: '-1'
            },
            children: [
                this.inputView.queryView
            ]
        });
        // Pass through the `search` event to handle it by a parent view.
        this.inputView.delegate('search').to(this);
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        this.inputView.destroy();
    }
    /**
	 * Searches the {@link #gridView} for the given query.
	 *
	 * @param query The search query string.
	 */ search(query) {
        const regExp = query ? new RegExp(escapeRegExp(query), 'ig') : null;
        const filteringResults = this.gridView.filter(regExp);
        this.inputView.fire('search', {
            query,
            ...filteringResults
        });
    }
    /**
	 * Allows defining the default value in the search text field.
	 *
	 * @param value The new value.
	 */ setInputValue(value) {
        if (!value) {
            this.inputView.queryView.fieldView.reset();
        } else {
            this.inputView.queryView.fieldView.value = value;
        }
    }
    /**
	 * Returns an input provided by a user in the search text field.
	 */ getInputValue() {
        return this.inputView.queryView.fieldView.element.value;
    }
    /**
	 * @inheritDoc
	 */ focus() {
        this.inputView.focus();
    }
}

/**
 * A view responsible for selecting a skin tone for an emoji.
 */ class EmojiToneView extends View {
    /**
	 * A dropdown element for selecting an active skin tone.
	 */ dropdownView;
    /**
	 * An array of available skin tones.
	 */ _skinTones;
    /**
	 * @inheritDoc
	 */ constructor(locale, { skinTone, skinTones }){
        super(locale);
        this.set('skinTone', skinTone);
        this._skinTones = skinTones;
        const t = locale.t;
        const accessibleLabel = t('Select skin tone');
        const dropdownView = createDropdown(locale);
        const itemDefinitions = new Collection();
        for (const { id, icon, tooltip } of this._skinTones){
            const def = {
                type: 'button',
                model: new UIModel({
                    value: id,
                    label: icon,
                    ariaLabel: tooltip,
                    tooltip,
                    tooltipPosition: 'e',
                    role: 'menuitemradio',
                    withText: true,
                    // To improve accessibility, disconnect a button and its label connection so that screen
                    // readers can read the `[aria-label]` attribute directly from the more descriptive button.
                    ariaLabelledBy: undefined
                })
            };
            def.model.bind('isOn').to(this, 'skinTone', (value)=>value === id);
            itemDefinitions.add(def);
        }
        addListToDropdown(dropdownView, itemDefinitions, {
            ariaLabel: accessibleLabel,
            role: 'menu'
        });
        dropdownView.buttonView.set({
            label: this._getSkinTone().icon,
            ariaLabel: accessibleLabel,
            ariaLabelledBy: undefined,
            isOn: false,
            withText: true,
            tooltip: accessibleLabel
        });
        this.dropdownView = dropdownView;
        // Execute command when an item from the dropdown is selected.
        this.listenTo(dropdownView, 'execute', (evt)=>{
            this.skinTone = evt.source.value;
        });
        dropdownView.buttonView.bind('label').to(this, 'skinTone', ()=>{
            return this._getSkinTone().icon;
        });
        dropdownView.buttonView.bind('ariaLabel').to(this, 'skinTone', ()=>{
            // Render a current state, but also what the dropdown does.
            return `${this._getSkinTone().tooltip}, ${accessibleLabel}`;
        });
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-emoji__skin-tone'
                ]
            },
            children: [
                dropdownView
            ]
        });
    }
    /**
	 * @inheritDoc
	 */ focus() {
        this.dropdownView.buttonView.focus();
    }
    /**
	 * Helper method for receiving an object describing the active skin tone.
	 */ _getSkinTone() {
        return this._skinTones.find((tone)=>tone.id === this.skinTone);
    }
}

/**
 * A view that glues pieces of the emoji panel together.
 */ class EmojiPickerView extends View {
    /**
	 * A collection of the focusable children of the view.
	 */ items;
    /**
	 * Tracks information about the DOM focus in the view.
	 */ focusTracker;
    /**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */ keystrokes;
    /**
	 * Helps cycling over focusable {@link #items} in the view.
	 */ focusCycler;
    /**
	 * An instance of the `EmojiSearchView`.
	 */ searchView;
    /**
	 * An instance of the `EmojiToneView`.
	 */ toneView;
    /**
	 * An instance of the `EmojiCategoriesView`.
	 */ categoriesView;
    /**
	 * An instance of the `EmojiGridView`.
	 */ gridView;
    /**
	 * An instance of the `EmojiGridView`.
	 */ infoView;
    /**
	 * @inheritDoc
	 */ constructor(locale, { emojiCategories, getEmojiByQuery, skinTone, skinTones }){
        super(locale);
        const categoryName = emojiCategories[0].title;
        this.gridView = new EmojiGridView(locale, {
            categoryName,
            emojiCategories,
            getEmojiByQuery,
            skinTone
        });
        this.infoView = new SearchInfoView();
        this.searchView = new EmojiSearchView(locale, {
            gridView: this.gridView,
            resultsView: this.infoView
        });
        this.categoriesView = new EmojiCategoriesView(locale, {
            emojiCategories,
            categoryName
        });
        this.toneView = new EmojiToneView(locale, {
            skinTone,
            skinTones
        });
        this.items = this.createCollection([
            this.searchView,
            this.toneView,
            this.categoriesView,
            this.gridView,
            this.infoView
        ]);
        this.focusTracker = new FocusTracker();
        this.keystrokes = new KeystrokeHandler();
        this.focusCycler = new FocusCycler({
            focusables: this.items,
            focusTracker: this.focusTracker,
            keystrokeHandler: this.keystrokes,
            actions: {
                focusPrevious: 'shift + tab',
                focusNext: 'tab'
            }
        });
        this.setTemplate({
            tag: 'div',
            children: [
                {
                    tag: 'div',
                    children: [
                        this.searchView,
                        this.toneView
                    ],
                    attributes: {
                        class: [
                            'ck',
                            'ck-emoji__search'
                        ]
                    }
                },
                this.categoriesView,
                this.gridView,
                {
                    tag: 'div',
                    children: [
                        this.infoView
                    ],
                    attributes: {
                        class: [
                            'ck',
                            'ck-search__results'
                        ]
                    }
                }
            ],
            attributes: {
                tabindex: '-1',
                class: [
                    'ck',
                    'ck-emoji',
                    'ck-search'
                ]
            }
        });
        this._setupEventListeners();
    }
    /**
	 * @inheritDoc
	 */ render() {
        super.render();
        this.focusTracker.add(this.searchView.element);
        this.focusTracker.add(this.toneView.element);
        this.focusTracker.add(this.categoriesView.element);
        this.focusTracker.add(this.gridView.element);
        this.focusTracker.add(this.infoView.element);
        // Start listening for the keystrokes coming from #element.
        this.keystrokes.listenTo(this.element);
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        this.focusTracker.destroy();
        this.keystrokes.destroy();
    }
    /**
	 * Focuses the search input.
	 */ focus() {
        this.searchView.focus();
    }
    /**
	 * Initializes interactions between sub-views.
	 */ _setupEventListeners() {
        const t = this.locale.t;
        // Disable the category switcher when filtering by a query.
        this.searchView.on('search', (evt, data)=>{
            if (data.query) {
                this.categoriesView.disableCategories();
            } else {
                this.categoriesView.enableCategories();
            }
        });
        // Show a user-friendly message depending on the search query.
        this.searchView.on('search', (evt, data)=>{
            if (data.query.length === 1) {
                this.infoView.set({
                    primaryText: t('Keep on typing to see the emoji.'),
                    secondaryText: t('The query must contain at least two characters.'),
                    isVisible: true
                });
            } else if (!data.resultsCount) {
                this.infoView.set({
                    primaryText: t('No emojis were found matching "%0".', data.query),
                    secondaryText: t('Please try a different phrase or check the spelling.'),
                    isVisible: true
                });
            } else {
                this.infoView.set({
                    isVisible: false
                });
            }
        });
        // Emit an update event to react to balloon dimensions changes.
        this.searchView.on('search', ()=>{
            this.fire('update');
            this.gridView.element.scrollTo(0, 0);
        });
        // Update the grid of emojis when the selected category is changed.
        this.categoriesView.on('change:categoryName', (ev, args, categoryName)=>{
            this.gridView.categoryName = categoryName;
            this.searchView.search('');
        });
        // Update the grid of emojis when the selected skin tone is changed.
        // In such a case, the displayed emoji should use an updated skin tone value.
        this.toneView.on('change:skinTone', (evt, propertyName, newValue)=>{
            this.gridView.skinTone = newValue;
            this.searchView.search(this.searchView.getInputValue());
        });
    }
}

/**
 * The emoji picker form view.
 */ class EmojiPickerFormView extends View {
    /**
	 * The Back button view displayed in the header.
	 */ backButtonView;
    /**
	 * Tracks information about DOM focus in the form.
	 */ focusTracker = new FocusTracker();
    /**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */ keystrokes = new KeystrokeHandler();
    /**
	 * A collection of child views.
	 */ children;
    /**
	 * A collection of views that can be focused in the form.
	 */ _focusables = new ViewCollection();
    /**
	 * Helps cycling over {@link #_focusables} in the form.
	 */ _focusCycler;
    /**
	 * Creates an instance of the {@link module:emoji/ui/emojipickerformview~EmojiPickerFormView} class.
	 *
	 * Also see {@link #render}.
	 *
	 * @param locale The localization services instance.
	 */ constructor(locale){
        super(locale);
        this.backButtonView = this._createBackButton();
        this.children = this.createCollection([
            this._createHeaderView()
        ]);
        this._focusCycler = new FocusCycler({
            focusables: this._focusables,
            focusTracker: this.focusTracker,
            keystrokeHandler: this.keystrokes,
            actions: {
                // Navigate form fields backward using the Shift + Tab keystroke.
                focusPrevious: 'shift + tab',
                // Navigate form fields forwards using the Tab key.
                focusNext: 'tab'
            }
        });
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-form',
                    'ck-emoji-picker-form',
                    'ck-responsive-form'
                ],
                // https://github.com/ckeditor/ckeditor5-link/issues/90
                tabindex: '-1'
            },
            children: this.children
        });
    }
    /**
	 * @inheritDoc
	 */ render() {
        super.render();
        const childViews = [
            ...this.children.filter(isFocusable),
            this.backButtonView
        ];
        childViews.forEach((v)=>{
            // Register the view as focusable.
            this._focusables.add(v);
            // Register the view in the focus tracker.
            this.focusTracker.add(v.element);
            // Register the view in the focus cycler to avoid nested focus cycles traps.
            if (isViewWithFocusCycler(v)) {
                this._focusCycler.chain(v.focusCycler);
            }
        });
        // Start listening for the keystrokes coming from #element.
        this.keystrokes.listenTo(this.element);
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        this.focusTracker.destroy();
        this.keystrokes.destroy();
    }
    /**
	 * Focuses the fist {@link #_focusables} in the form.
	 */ focus() {
        this._focusCycler.focusFirst();
    }
    /**
	 * Creates a back button view that cancels the form.
	 */ _createBackButton() {
        const t = this.locale.t;
        const backButton = new ButtonView(this.locale);
        backButton.set({
            class: 'ck-button-back',
            label: t('Back'),
            icon: IconPreviousArrow,
            tooltip: true
        });
        backButton.delegate('execute').to(this, 'cancel');
        return backButton;
    }
    /**
	 * Creates a header view for the form.
	 */ _createHeaderView() {
        const t = this.locale.t;
        const header = new FormHeaderView(this.locale, {
            label: t('Emoji picker')
        });
        header.children.add(this.backButtonView, 0);
        return header;
    }
}

const VISUAL_SELECTION_MARKER_NAME = 'emoji-picker';
/**
 * The emoji picker plugin.
 *
 * Introduces the `'emoji'` dropdown.
 */ class EmojiPicker extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            EmojiRepository,
            ContextualBalloon,
            Dialog,
            Typing
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'EmojiPicker';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ async init() {
        const editor = this.editor;
        this.balloonPlugin = editor.plugins.get('ContextualBalloon');
        this.emojiRepositoryPlugin = editor.plugins.get('EmojiRepository');
        // Skip registering a button in the toolbar and list item in the menu bar if the emoji repository is not ready.
        if (!await this.emojiRepositoryPlugin.isReady()) {
            return;
        }
        const command = new EmojiCommand(editor);
        editor.commands.add('emoji', command);
        editor.ui.componentFactory.add('emoji', ()=>{
            const button = this._createButton(ButtonView, command);
            button.set({
                tooltip: true
            });
            return button;
        });
        editor.ui.componentFactory.add('menuBar:emoji', ()=>{
            return this._createButton(MenuBarMenuListItemButtonView, command);
        });
        this._setupConversion();
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        if (this.emojiPickerView) {
            this.emojiPickerView.destroy();
        }
    }
    /**
	 * Represents an active skin tone. Its value depends on the emoji UI plugin.
	 *
	 * Before opening the UI for the first time, the returned value is read from the editor configuration.
	 * Otherwise, it reflects the user's intention.
	 */ get skinTone() {
        if (!this.emojiPickerView) {
            return this.editor.config.get('emoji.skinTone');
        }
        return this.emojiPickerView.gridView.skinTone;
    }
    /**
	 * Displays the balloon with the emoji picker.
	 *
	 * @param [searchValue=''] A default query used to filer the grid when opening the UI.
	 */ showUI(searchValue = '') {
        // Show visual selection on a text when the contextual balloon is displayed.
        // See #17654.
        this._showFakeVisualSelection();
        if (!this.emojiPickerView) {
            this.emojiPickerView = this._createEmojiPickerView();
        }
        if (searchValue) {
            this.emojiPickerView.searchView.setInputValue(searchValue);
        }
        this.emojiPickerView.searchView.search(searchValue);
        if (!this.emojiPickerFormView) {
            this.emojiPickerFormView = this._createEmojiPickerFormView();
        }
        if (!this.balloonPlugin.hasView(this.emojiPickerFormView)) {
            // Show back button if there is another balloon view visible.
            this.emojiPickerFormView.backButtonView.isVisible = !!this.balloonPlugin.visibleView;
            this.balloonPlugin.add({
                view: this.emojiPickerFormView,
                position: this._getBalloonPositionData(),
                balloonClassName: 'ck-emoji-picker-balloon'
            });
        }
        this.emojiPickerView.focus();
    }
    /**
	 * Creates a button for toolbar and menu bar that will show the emoji dialog.
	 */ _createButton(ViewClass, command) {
        const buttonView = new ViewClass(this.editor.locale);
        const t = this.editor.locale.t;
        buttonView.bind('isEnabled').to(command, 'isEnabled');
        buttonView.set({
            label: t('Emoji'),
            icon: IconEmoji,
            isToggleable: true
        });
        buttonView.on('execute', ()=>{
            this.editor.editing.view.scrollToTheSelection();
            this.showUI();
        });
        return buttonView;
    }
    /**
	 * Creates an instance of the `EmojiPickerView` class that represents an emoji balloon.
	 */ _createEmojiPickerView() {
        const emojiPickerView = new EmojiPickerView(this.editor.locale, {
            emojiCategories: this.emojiRepositoryPlugin.getEmojiCategories(),
            skinTone: this.editor.config.get('emoji.skinTone'),
            skinTones: this.emojiRepositoryPlugin.getSkinTones(),
            getEmojiByQuery: (query)=>{
                return this.emojiRepositoryPlugin.getEmojiByQuery(query);
            }
        });
        // Insert an emoji on a tile click.
        this.listenTo(emojiPickerView.gridView, 'execute', (evt, data)=>{
            const editor = this.editor;
            const textToInsert = data.emoji;
            this._hideUI();
            editor.execute('insertText', {
                text: textToInsert
            });
        });
        return emojiPickerView;
    }
    /**
	 * Creates an instance of the `EmojiPickerFormView` class that represents a balloon with the emoji picker.
	 */ _createEmojiPickerFormView() {
        const emojiPickerFormView = new EmojiPickerFormView(this.editor.locale);
        emojiPickerFormView.children.add(this.emojiPickerView);
        // Update the balloon position when layout is changed.
        this.listenTo(this.emojiPickerView, 'update', ()=>{
            if (this.balloonPlugin.visibleView === emojiPickerFormView) {
                this.balloonPlugin.updatePosition();
            }
        });
        // Close the dialog when the back button is clicked.
        this.listenTo(emojiPickerFormView, 'cancel', ()=>{
            this._hideUI();
        });
        // Close the panel on `Esc` key press when the **actions have focus**.
        emojiPickerFormView.keystrokes.set('Esc', (data, cancel)=>{
            this._hideUI();
            cancel();
        });
        // Close the dialog when clicking outside of it.
        clickOutsideHandler({
            emitter: emojiPickerFormView,
            contextElements: [
                this.balloonPlugin.view.element
            ],
            callback: ()=>{
                // Focusing on the editable during a click outside the balloon panel might
                // cause the selection to move to the beginning of the editable, so we avoid
                // focusing on it during this action.
                // See: https://github.com/ckeditor/ckeditor5/issues/18253
                this._hideUI(false);
            },
            activator: ()=>this.balloonPlugin.visibleView === emojiPickerFormView
        });
        return emojiPickerFormView;
    }
    /**
	 * Hides the balloon with the emoji picker.
	 *
	 * @param updateFocus Whether to focus the editor after closing the emoji picker.
	 */ _hideUI(updateFocus = true) {
        this.balloonPlugin.remove(this.emojiPickerFormView);
        this.emojiPickerView.searchView.setInputValue('');
        if (updateFocus) {
            this.editor.editing.view.focus();
        }
        this._hideFakeVisualSelection();
    }
    /**
	 * Registers converters.
	 */ _setupConversion() {
        const editor = this.editor;
        // Renders a fake visual selection marker on an expanded selection.
        editor.conversion.for('editingDowncast').markerToHighlight({
            model: VISUAL_SELECTION_MARKER_NAME,
            view: {
                classes: [
                    'ck-fake-emoji-selection'
                ]
            }
        });
        // Renders a fake visual selection marker on a collapsed selection.
        editor.conversion.for('editingDowncast').markerToElement({
            model: VISUAL_SELECTION_MARKER_NAME,
            view: (data, { writer })=>{
                if (!data.markerRange.isCollapsed) {
                    return null;
                }
                const markerElement = writer.createUIElement('span');
                writer.addClass([
                    'ck-fake-emoji-selection',
                    'ck-fake-emoji-selection_collapsed'
                ], markerElement);
                return markerElement;
            }
        });
    }
    /**
	 * Returns positioning options for the {@link #balloonPlugin}. They control the way the balloon is attached
	 * to the target element or selection.
	 */ _getBalloonPositionData() {
        const view = this.editor.editing.view;
        const viewDocument = view.document;
        // Set a target position by converting view selection range to DOM.
        const target = ()=>view.domConverter.viewRangeToDom(viewDocument.selection.getFirstRange());
        return {
            target
        };
    }
    /**
	 * Displays a fake visual selection when the contextual balloon is displayed.
	 *
	 * This adds an 'emoji-picker' marker into the document that is rendered as a highlight on selected text fragment.
	 */ _showFakeVisualSelection() {
        const model = this.editor.model;
        model.change((writer)=>{
            const range = model.document.selection.getFirstRange();
            if (model.markers.has(VISUAL_SELECTION_MARKER_NAME)) {
                writer.updateMarker(VISUAL_SELECTION_MARKER_NAME, {
                    range
                });
            } else {
                if (range.start.isAtEnd) {
                    const startPosition = range.start.getLastMatchingPosition(({ item })=>!model.schema.isContent(item), {
                        boundaries: range
                    });
                    writer.addMarker(VISUAL_SELECTION_MARKER_NAME, {
                        usingOperation: false,
                        affectsData: false,
                        range: writer.createRange(startPosition, range.end)
                    });
                } else {
                    writer.addMarker(VISUAL_SELECTION_MARKER_NAME, {
                        usingOperation: false,
                        affectsData: false,
                        range
                    });
                }
            }
        });
    }
    /**
	 * Hides the fake visual selection.
	 */ _hideFakeVisualSelection() {
        const model = this.editor.model;
        if (model.markers.has(VISUAL_SELECTION_MARKER_NAME)) {
            model.change((writer)=>{
                writer.removeMarker(VISUAL_SELECTION_MARKER_NAME);
            });
        }
    }
}

/**
 * The emoji plugin.
 *
 * This is a "glue" plugin which loads the following plugins:
 *
 * * {@link module:emoji/emojimention~EmojiMention},
 * * {@link module:emoji/emojipicker~EmojiPicker},
 */ class Emoji extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            EmojiMention,
            EmojiPicker
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'Emoji';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

export { Emoji, EmojiCategoriesView, EmojiCommand, EmojiGridView, EmojiMention, EmojiPicker, EmojiPickerFormView, EmojiPickerView, EmojiRepository, EmojiSearchView, EmojiToneView, EmojiUtils, isEmojiSupported as _isEmojiSupported };
//# sourceMappingURL=index.js.map
