/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { type Locale } from 'ckeditor5/src/utils.js';
import type { ViewDowncastWriter, ViewElement } from 'ckeditor5/src/engine.js';
import type { MediaEmbedConfig, MediaEmbedProvider } from './mediaembedconfig.js';
import type { MediaOptions } from './utils.js';
/**
 * A bridge between the raw media content provider definitions and the editor view content.
 *
 * It helps translating media URLs to corresponding {@link module:engine/view/element~ViewElement view elements}.
 *
 * Mostly used by the {@link module:media-embed/mediaembedediting~MediaEmbedEditing} plugin.
 */
export declare class MediaRegistry {
    /**
     * The {@link module:utils/locale~Locale} instance.
     */
    locale: Locale;
    /**
     * The media provider definitions available for the registry. Usually corresponding with the
     * {@link module:media-embed/mediaembedconfig~MediaEmbedConfig media configuration}.
     */
    providerDefinitions: Array<MediaEmbedProvider>;
    /**
     * Creates an instance of the {@link module:media-embed/mediaregistry~MediaRegistry} class.
     *
     * @param locale The localization services instance.
     * @param config The configuration of the media embed feature.
     */
    constructor(locale: Locale, config: MediaEmbedConfig);
    /**
     * Checks whether the passed URL is representing a certain media type allowed in the editor.
     *
     * @param url The URL to be checked
     */
    hasMedia(url: string): boolean;
    /**
     * For the given media URL string and options, it returns the {@link module:engine/view/element~ViewElement view element}
     * representing that media.
     *
     * **Note:** If no URL is specified, an empty view element is returned.
     *
     * @param writer The view writer used to produce a view element.
     * @param url The URL to be translated into a view element.
     */
    getMediaViewElement(writer: ViewDowncastWriter, url: string, options: MediaOptions): ViewElement;
    /**
     * Returns a `Media` instance for the given URL.
     *
     * @param url The URL of the media.
     * @returns The `Media` instance or `null` when there is none.
     */
    private _getMedia;
    /**
     * Tries to match `url` to `pattern`.
     *
     * @param url The URL of the media.
     * @param pattern The pattern that should accept the media URL.
     */
    private _getUrlMatches;
}
