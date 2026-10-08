/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/search/searchresultsview
 */
import { View } from '../view.js';
import { FocusTracker } from '@ckeditor/ckeditor5-utils';
import { FocusCycler } from '../focuscycler.js';
/**
 * A sub-component of {@link module:ui/search/text/searchtextview~SearchTextView}. It hosts the filtered and the information views.
 */
export class SearchResultsView extends View {
    /**
     * Tracks information about the DOM focus in the view.
     *
     * @readonly
     */
    focusTracker;
    /**
     * The collection of the child views inside of the list item {@link #element}.
     *
     * @readonly
     */
    children;
    /**
     * Provides the focus management (keyboard navigation) in the view.
     *
     * @readonly
     */
    _focusCycler;
    /**
     * @inheritDoc
     */
    constructor(locale) {
        super(locale);
        this.children = this.createCollection();
        this.focusTracker = new FocusTracker();
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-search__results'
                ],
                tabindex: -1
            },
            children: this.children
        });
        this._focusCycler = new FocusCycler({
            focusables: this.children,
            focusTracker: this.focusTracker
        });
    }
    /**
     * @inheritDoc
     */
    render() {
        super.render();
        for (const child of this.children) {
            this.focusTracker.add(child.element);
        }
    }
    /**
     * Focuses the view.
     */
    focus() {
        this._focusCycler.focusFirst();
    }
    /**
     * Focuses the first child view.
     */
    focusFirst() {
        this._focusCycler.focusFirst();
    }
    /**
     * Focuses the last child view.
     */
    focusLast() {
        this._focusCycler.focusLast();
    }
}
