/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module emoji/ui/emojigridview
 */
import { addKeyboardHandlingForGrid, ButtonView, View } from 'ckeditor5/src/ui.js';
import { FocusTracker, global, KeystrokeHandler } from 'ckeditor5/src/utils.js';
import '../../theme/emojigrid.css';
/**
 * A grid of emoji tiles. It allows browsing emojis and selecting them to be inserted into the content.
 */
export class EmojiGridView extends View {
    /**
     * A collection of the child tile views. Each tile represents a particular emoji.
     */
    tiles;
    /**
     * Tracks information about the DOM focus in the grid.
     */
    focusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    keystrokes;
    /**
     * An array containing all emojis grouped by their categories.
     */
    emojiCategories;
    /**
     * A collection of all already created tile views. Each tile represents a particular emoji.
     * The cached tiles collection is used for efficiency purposes to avoid re-creating a particular
     * tile again when the grid view has changed.
     */
    cachedTiles;
    /**
     * A callback used to filter grid items by a specified query.
     */
    _getEmojiByQuery;
    /**
     * @inheritDoc
     */
    constructor(locale, { categoryName, emojiCategories, getEmojiByQuery, skinTone }) {
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
                    bind.if('isEmpty', 'ck-hidden', value => value)
                ]
            }
        });
        addKeyboardHandlingForGrid({
            keystrokeHandler: this.keystrokes,
            focusTracker: this.focusTracker,
            gridItems: this.tiles,
            numberOfColumns: () => global.window
                .getComputedStyle(this.element.firstChild) // Responsive `.ck-emoji-grid__tiles`.
                .getPropertyValue('grid-template-columns')
                .split(' ')
                .length,
            uiLanguageDirection: this.locale && this.locale.uiLanguageDirection
        });
    }
    /**
     * @inheritDoc
     */
    render() {
        super.render();
        this.keystrokes.listenTo(this.element);
    }
    /**
     * @inheritDoc
     */
    destroy() {
        super.destroy();
        this.keystrokes.destroy();
        this.focusTracker.destroy();
    }
    /**
     * Focuses the first focusable in {@link ~EmojiGridView#tiles} if available.
     */
    focus() {
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
     */
    filter(pattern) {
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
     */
    _getItemsByQuery(query) {
        return {
            matchingItems: this._getEmojiByQuery(query),
            allItems: this.emojiCategories.flatMap(group => group.items)
        };
    }
    /**
     * Returns emojis that belong to the specified category.
     */
    _getItemsByCategory() {
        const emojiCategory = this.emojiCategories.find(item => item.title === this.categoryName);
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
     */
    _updateGrid(items) {
        // Clean-up.
        [...this.tiles].forEach(item => {
            this.focusTracker.remove(item);
            this.tiles.remove(item);
        });
        items
            // Create tiles from matching results.
            .map(item => {
            const emoji = item.skins[this.skinTone] || item.skins.default;
            return this.cachedTiles.get(emoji) || this._createTile(emoji, item.annotation);
        })
            // Insert new elements.
            .forEach(item => {
            this.tiles.add(item);
            this.focusTracker.add(item);
        });
    }
    /**
     * Creates a new tile for the grid. Created tile is added to the {@link #cachedTiles} collection for further usage, if needed.
     *
     * @param emoji The emoji itself.
     * @param name The name of the emoji (e.g. "Smiling Face with Smiling Eyes").
     */
    _createTile(emoji, name) {
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
        tile.on('execute', () => {
            this.fire('execute', { name, emoji });
        });
        this.cachedTiles.add(tile);
        return tile;
    }
}
