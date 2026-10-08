/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module emoji/ui/emojisearchview
 */
import { escapeRegExp } from 'es-toolkit/compat';
import { createLabeledInputText, SearchTextView, View } from 'ckeditor5/src/ui.js';
/**
 * A view responsible for providing an input element that allows filtering emoji by the provided query.
 */
export class EmojiSearchView extends View {
    /**
     * The find in text input view that stores the searched string.
     */
    inputView;
    /**
     * An instance of the `EmojiGridView`.
     */
    gridView;
    /**
     * @inheritDoc
     */
    constructor(locale, { gridView, resultsView }) {
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
     */
    destroy() {
        super.destroy();
        this.inputView.destroy();
    }
    /**
     * Searches the {@link #gridView} for the given query.
     *
     * @param query The search query string.
     */
    search(query) {
        const regExp = query ? new RegExp(escapeRegExp(query), 'ig') : null;
        const filteringResults = this.gridView.filter(regExp);
        this.inputView.fire('search', { query, ...filteringResults });
    }
    /**
     * Allows defining the default value in the search text field.
     *
     * @param value The new value.
     */
    setInputValue(value) {
        if (!value) {
            this.inputView.queryView.fieldView.reset();
        }
        else {
            this.inputView.queryView.fieldView.value = value;
        }
    }
    /**
     * Returns an input provided by a user in the search text field.
     */
    getInputValue() {
        return this.inputView.queryView.fieldView.element.value;
    }
    /**
     * @inheritDoc
     */
    focus() {
        this.inputView.focus();
    }
}
