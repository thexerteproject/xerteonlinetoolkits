/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/search/text/searchtextview
*/
import { FocusTracker, KeystrokeHandler } from '@ckeditor/ckeditor5-utils';
import { View } from '../../view.js';
import { SearchTextQueryView } from './searchtextqueryview.js';
import { SearchInfoView } from '../searchinfoview.js';
import { SearchResultsView } from '../searchresultsview.js';
import { FocusCycler } from '../../focuscycler.js';
import { escapeRegExp } from 'es-toolkit/compat';
import '../../../theme/components/search/search.css';
/**
 * A search component that allows filtering of an arbitrary view based on a search query
 * specified by the user in a text field.
 *
 *```ts
 * // This view must specify the `filter()` and `focus()` methods.
 * const filteredView = ...;
 *
 * const searchView = new SearchTextView( locale, {
 * 	searchFieldLabel: 'Search list items',
 * 	filteredView
 * } );
 *
 * view.render();
 *
 * document.body.append( view.element );
 * ```
 */
export class SearchTextView extends View {
    /**
     * Tracks information about the DOM focus in the view.
     *
     * @readonly
     */
    focusTracker;
    /**
     * An instance of the keystroke handler managing user interaction and accessibility.
     *
     * @readonly
     */
    keystrokes;
    /**
     * A view hosting the {@link #filteredView} passed in the configuration and the {@link #infoView}.
     */
    resultsView;
    /**
     * The view that is filtered by the search query.
     */
    filteredView;
    /**
     * The view that displays the information about the search results.
     */
    infoView;
    /**
     * The view that allows the user to enter the search query.
     */
    queryView;
    /**
     * Provides the focus management (keyboard navigation) between {@link #queryView} and {@link #filteredView}.
     *
     * @readonly
     */
    focusCycler;
    /**
     * The cached configuration object.
     *
     * @internal
     */
    _config;
    /**
     * Creates an instance of the {@link module:ui/search/text/searchtextview~SearchTextView} class.
     *
     * @param locale The localization services instance.
     * @param config Configuration of the view.
     */
    constructor(locale, config) {
        super(locale);
        this._config = config;
        this.filteredView = config.filteredView;
        this.queryView = this._createSearchTextQueryView();
        this.focusTracker = new FocusTracker();
        this.keystrokes = new KeystrokeHandler();
        this.resultsView = new SearchResultsView(locale);
        this.children = this.createCollection();
        this.focusableChildren = this.createCollection([this.queryView, this.resultsView]);
        this.set('isEnabled', true);
        this.set('resultsCount', 0);
        this.set('totalItemsCount', 0);
        if (config.infoView && config.infoView.instance) {
            this.infoView = config.infoView.instance;
        }
        else {
            this.infoView = new SearchInfoView();
            this._enableDefaultInfoViewBehavior();
            this.on('render', () => {
                // Initial search that determines if there are any searchable items
                // and displays the corresponding info text.
                this.search('');
            });
        }
        this.resultsView.children.addMany([this.infoView, this.filteredView]);
        this.focusCycler = new FocusCycler({
            focusables: this.focusableChildren,
            focusTracker: this.focusTracker,
            keystrokeHandler: this.keystrokes,
            actions: {
                // Navigate form fields backwards using the Shift + Tab keystroke.
                focusPrevious: 'shift + tab',
                // Navigate form fields forwards using the Tab key.
                focusNext: 'tab'
            }
        });
        this.on('search', (evt, { resultsCount, totalItemsCount }) => {
            this.resultsCount = resultsCount;
            this.totalItemsCount = totalItemsCount;
        });
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-search',
                    config.class || null
                ],
                tabindex: '-1'
            },
            children: this.children
        });
    }
    /**
     * @inheritDoc
     */
    render() {
        super.render();
        this.children.addMany([
            this.queryView,
            this.resultsView
        ]);
        const stopPropagation = (data) => data.stopPropagation();
        for (const focusableChild of this.focusableChildren) {
            this.focusTracker.add(focusableChild.element);
        }
        // Start listening for the keystrokes coming from #element.
        this.keystrokes.listenTo(this.element);
        // Since the form is in the dropdown panel which is a child of the toolbar, the toolbar's
        // keystroke handler would take over the key management in the URL input. We need to prevent
        // this ASAP. Otherwise, the basic caret movement using the arrow keys will be impossible.
        this.keystrokes.set('arrowright', stopPropagation);
        this.keystrokes.set('arrowleft', stopPropagation);
        this.keystrokes.set('arrowup', stopPropagation);
        this.keystrokes.set('arrowdown', stopPropagation);
    }
    /**
     * Focuses the {@link #queryView}.
     */
    focus() {
        this.queryView.focus();
    }
    /**
     * Resets the component to its initial state.
     */
    reset() {
        this.queryView.reset();
        this.search('');
        this.filteredView.element.scrollTo(0, 0);
    }
    /**
     * Searches the {@link #filteredView} for the given query.
     *
     * @internal
     * @param query The search query string.
     */
    search(query) {
        const regExp = query ? new RegExp(escapeRegExp(query), 'ig') : null;
        const filteringResults = this.filteredView.filter(regExp);
        this.fire('search', { query, ...filteringResults });
    }
    /**
     * Creates a search field view based on configured creator..
     */
    _createSearchTextQueryView() {
        const queryView = new SearchTextQueryView(this.locale, this._config.queryView);
        this.listenTo(queryView.fieldView, 'input', () => {
            this.search(queryView.fieldView.element.value);
        });
        queryView.on('reset', () => this.reset());
        queryView.bind('isEnabled').to(this);
        return queryView;
    }
    /**
     * Initializes the default {@link #infoView} behavior with default text labels when no custom info view
     * was specified in the view config.
     */
    _enableDefaultInfoViewBehavior() {
        const t = this.locale.t;
        const infoView = this.infoView;
        this.on('search', (evt, data) => {
            if (!data.resultsCount) {
                const defaultTextConfig = this._config.infoView && this._config.infoView.text;
                let primaryText, secondaryText;
                if (data.totalItemsCount) {
                    if (defaultTextConfig?.notFound) {
                        primaryText = defaultTextConfig.notFound.primary;
                        secondaryText = defaultTextConfig.notFound.secondary;
                    }
                    else {
                        primaryText = t('No results found');
                        secondaryText = '';
                    }
                }
                else {
                    if (defaultTextConfig?.noSearchableItems) {
                        primaryText = defaultTextConfig.noSearchableItems.primary;
                        secondaryText = defaultTextConfig.noSearchableItems.secondary;
                    }
                    else {
                        primaryText = t('No searchable items');
                        secondaryText = '';
                    }
                }
                infoView.set({
                    primaryText: normalizeInfoText(primaryText, data),
                    secondaryText: normalizeInfoText(secondaryText, data),
                    isVisible: true
                });
            }
            else {
                infoView.set({
                    isVisible: false
                });
            }
        });
        function normalizeInfoText(text, { query, resultsCount, totalItemsCount }) {
            return typeof text === 'function' ? text(query, resultsCount, totalItemsCount) : text;
        }
    }
}
