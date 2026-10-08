/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module emoji/ui/emojigridview
 */
import { ButtonView, type FilteredView, View, type ViewCollection } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';
import type { EmojiCategory, EmojiEntry } from '../emojirepository.js';
import type { EmojiSkinToneId } from '../emojiconfig.js';
import '../../theme/emojigrid.css';
/**
 * A grid of emoji tiles. It allows browsing emojis and selecting them to be inserted into the content.
 */
export declare class EmojiGridView extends View<HTMLDivElement> implements FilteredView {
    /**
     * Defines the active category name.
     *
     * @observable
     */
    categoryName: string;
    /**
     * Active skin tone.
     *
     * @observable
     */
    skinTone: EmojiSkinToneId;
    /**
     * Set to `true` when the {@link #tiles} collection does not contain items to display.
     *
     * @observable
     */
    isEmpty: boolean;
    /**
     * A collection of the child tile views. Each tile represents a particular emoji.
     */
    readonly tiles: ViewCollection<ButtonView>;
    /**
     * Tracks information about the DOM focus in the grid.
     */
    readonly focusTracker: FocusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * An array containing all emojis grouped by their categories.
     */
    readonly emojiCategories: Array<EmojiCategory>;
    /**
     * A collection of all already created tile views. Each tile represents a particular emoji.
     * The cached tiles collection is used for efficiency purposes to avoid re-creating a particular
     * tile again when the grid view has changed.
     */
    readonly cachedTiles: ViewCollection<ButtonView>;
    /**
     * A callback used to filter grid items by a specified query.
     */
    private readonly _getEmojiByQuery;
    /**
     * @inheritDoc
     */
    constructor(locale: Locale, { categoryName, emojiCategories, getEmojiByQuery, skinTone }: {
        categoryName: string;
        emojiCategories: Array<EmojiCategory>;
        getEmojiByQuery: EmojiSearchQueryCallback;
        skinTone: EmojiSkinToneId;
    });
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Focuses the first focusable in {@link ~EmojiGridView#tiles} if available.
     */
    focus(): void;
    /**
     * Filters the grid view by the given regular expression.
     *
     * It filters either by the pattern or an emoji category, but never both.
     *
     * @param pattern Expression to search or `null` when filter by category name.
     */
    filter(pattern: RegExp | null): {
        resultsCount: number;
        totalItemsCount: number;
    };
    /**
     * Filters emojis to show based on the specified query phrase.
     *
     * @param query A query used to filter the grid.
     */
    private _getItemsByQuery;
    /**
     * Returns emojis that belong to the specified category.
     */
    private _getItemsByCategory;
    /**
     * Updates the grid by removing the existing items and insert the new ones.
     *
     * @param items An array of items to insert.
     */
    private _updateGrid;
    /**
     * Creates a new tile for the grid. Created tile is added to the {@link #cachedTiles} collection for further usage, if needed.
     *
     * @param emoji The emoji itself.
     * @param name The name of the emoji (e.g. "Smiling Face with Smiling Eyes").
     */
    private _createTile;
}
/**
 * A callback used to filter grid items by a specified query.
 */
export type EmojiSearchQueryCallback = (query: string) => Array<EmojiEntry>;
/**
 * Fired when any of {@link ~EmojiGridView#tiles grid tiles} is clicked.
 *
 * @eventName ~EmojiGridView#execute
 * @param data Additional information about the event.
 */
export type EmojiGridViewExecuteEvent = {
    name: 'execute';
    args: [data: EmojiGridViewEventData];
};
export type EmojiGridViewEventData = {
    /**
     * The name of the emoji (e.g. "Smiling Face with Smiling Eyes").
     */
    name: string;
    /**
     * The emoji itself.
     */
    emoji: string;
};
