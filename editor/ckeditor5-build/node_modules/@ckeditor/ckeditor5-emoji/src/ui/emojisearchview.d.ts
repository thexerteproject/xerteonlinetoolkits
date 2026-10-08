/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { SearchTextView, View, type SearchInfoView } from 'ckeditor5/src/ui.js';
import type { Locale } from 'ckeditor5/src/utils.js';
import { type EmojiGridView } from './emojigridview.js';
/**
 * A view responsible for providing an input element that allows filtering emoji by the provided query.
 */
export declare class EmojiSearchView extends View {
    /**
     * The find in text input view that stores the searched string.
     */
    readonly inputView: SearchTextView;
    /**
     * An instance of the `EmojiGridView`.
     */
    readonly gridView: EmojiGridView;
    /**
     * @inheritDoc
     */
    constructor(locale: Locale, { gridView, resultsView }: {
        gridView: EmojiGridView;
        resultsView: SearchInfoView;
    });
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Searches the {@link #gridView} for the given query.
     *
     * @param query The search query string.
     */
    search(query: string): void;
    /**
     * Allows defining the default value in the search text field.
     *
     * @param value The new value.
     */
    setInputValue(value: string): void;
    /**
     * Returns an input provided by a user in the search text field.
     */
    getInputValue(): string;
    /**
     * @inheritDoc
     */
    focus(): void;
}
