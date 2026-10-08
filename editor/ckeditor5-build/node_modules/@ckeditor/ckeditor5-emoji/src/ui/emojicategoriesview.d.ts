/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module emoji/ui/emojicategoriesview
 */
import { ButtonView, View, FocusCycler, type ViewCollection } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';
import type { EmojiCategory } from '../emojirepository.js';
import '../../theme/emojicategories.css';
/**
 * A class representing the navigation part of the emoji UI.
 * It is responsible allowing the user to select a particular emoji category.
 */
export declare class EmojiCategoriesView extends View {
    /**
     * Currently selected emoji category name.
     */
    categoryName: string;
    /**
     * Tracks information about the DOM focus in the grid.
     */
    readonly focusTracker: FocusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * Helps cycling over focusable children in the input view.
     */
    readonly focusCycler: FocusCycler;
    /**
     * A collection of the categories buttons.
     */
    readonly buttonViews: ViewCollection<ButtonView>;
    /**
     * @inheritDoc
     */
    constructor(locale: Locale, { emojiCategories, categoryName }: {
        emojiCategories: Array<EmojiCategory>;
        categoryName: string;
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
     * @inheritDoc
     */
    focus(): void;
    /**
     * Marks all categories buttons as enabled (clickable).
     */
    enableCategories(): void;
    /**
     * Marks all categories buttons as disabled (non-clickable).
     */
    disableCategories(): void;
    /**
     * Creates a button representing a category item.
     */
    private _createCategoryButton;
}
