/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module emoji/ui/emojipickerview
 */
import { FocusCycler, SearchInfoView, View } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler } from 'ckeditor5/src/utils.js';
import { EmojiGridView } from './emojigridview.js';
import { EmojiCategoriesView } from './emojicategoriesview.js';
import { EmojiSearchView } from './emojisearchview.js';
import { EmojiToneView } from './emojitoneview.js';
/**
 * A view that glues pieces of the emoji panel together.
 */
export class EmojiPickerView extends View {
    /**
     * A collection of the focusable children of the view.
     */
    items;
    /**
     * Tracks information about the DOM focus in the view.
     */
    focusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    keystrokes;
    /**
     * Helps cycling over focusable {@link #items} in the view.
     */
    focusCycler;
    /**
     * An instance of the `EmojiSearchView`.
     */
    searchView;
    /**
     * An instance of the `EmojiToneView`.
     */
    toneView;
    /**
     * An instance of the `EmojiCategoriesView`.
     */
    categoriesView;
    /**
     * An instance of the `EmojiGridView`.
     */
    gridView;
    /**
     * An instance of the `EmojiGridView`.
     */
    infoView;
    /**
     * @inheritDoc
     */
    constructor(locale, { emojiCategories, getEmojiByQuery, skinTone, skinTones }) {
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
                        class: ['ck', 'ck-emoji__search']
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
                        class: ['ck', 'ck-search__results']
                    }
                }
            ],
            attributes: {
                tabindex: '-1',
                class: ['ck', 'ck-emoji', 'ck-search']
            }
        });
        this._setupEventListeners();
    }
    /**
     * @inheritDoc
     */
    render() {
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
     */
    destroy() {
        super.destroy();
        this.focusTracker.destroy();
        this.keystrokes.destroy();
    }
    /**
     * Focuses the search input.
     */
    focus() {
        this.searchView.focus();
    }
    /**
     * Initializes interactions between sub-views.
     */
    _setupEventListeners() {
        const t = this.locale.t;
        // Disable the category switcher when filtering by a query.
        this.searchView.on('search', (evt, data) => {
            if (data.query) {
                this.categoriesView.disableCategories();
            }
            else {
                this.categoriesView.enableCategories();
            }
        });
        // Show a user-friendly message depending on the search query.
        this.searchView.on('search', (evt, data) => {
            if (data.query.length === 1) {
                this.infoView.set({
                    primaryText: t('Keep on typing to see the emoji.'),
                    secondaryText: t('The query must contain at least two characters.'),
                    isVisible: true
                });
            }
            else if (!data.resultsCount) {
                this.infoView.set({
                    primaryText: t('No emojis were found matching "%0".', data.query),
                    secondaryText: t('Please try a different phrase or check the spelling.'),
                    isVisible: true
                });
            }
            else {
                this.infoView.set({
                    isVisible: false
                });
            }
        });
        // Emit an update event to react to balloon dimensions changes.
        this.searchView.on('search', () => {
            this.fire('update');
            this.gridView.element.scrollTo(0, 0);
        });
        // Update the grid of emojis when the selected category is changed.
        this.categoriesView.on('change:categoryName', (ev, args, categoryName) => {
            this.gridView.categoryName = categoryName;
            this.searchView.search('');
        });
        // Update the grid of emojis when the selected skin tone is changed.
        // In such a case, the displayed emoji should use an updated skin tone value.
        this.toneView.on('change:skinTone', (evt, propertyName, newValue) => {
            this.gridView.skinTone = newValue;
            this.searchView.search(this.searchView.getInputValue());
        });
    }
}
