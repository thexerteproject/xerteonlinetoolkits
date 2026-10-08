/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/search/text/searchtextview
*/
import { FocusTracker, KeystrokeHandler, type Locale } from '@ckeditor/ckeditor5-utils';
import { View } from '../../view.js';
import { SearchTextQueryView, type SearchTextQueryViewConfig } from './searchtextqueryview.js';
import { SearchResultsView } from '../searchresultsview.js';
import { FocusCycler, type FocusableView } from '../../focuscycler.js';
import { type FilteredView } from '../filteredview.js';
import { type ViewCollection } from '../../viewcollection.js';
import { type InputBase } from '../../input/inputbase.js';
import { type InputTextView } from '../../inputtext/inputtextview.js';
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
export declare class SearchTextView<TQueryFieldView extends InputBase<HTMLInputElement | HTMLTextAreaElement> = InputTextView> extends View {
    /**
     * Tracks information about the DOM focus in the view.
     *
     * @readonly
     */
    focusTracker: FocusTracker;
    /**
     * An instance of the keystroke handler managing user interaction and accessibility.
     *
     * @readonly
     */
    keystrokes: KeystrokeHandler;
    /**
     * A view hosting the {@link #filteredView} passed in the configuration and the {@link #infoView}.
     */
    resultsView: SearchResultsView;
    /**
     * The view that is filtered by the search query.
     */
    filteredView: FilteredView;
    /**
     * The view that displays the information about the search results.
     */
    infoView: FocusableView | undefined;
    /**
     * The view that allows the user to enter the search query.
     */
    queryView: SearchTextQueryView<TQueryFieldView>;
    /**
     * Controls whether the component is in read-only mode.
     *
     * @default true
     * @observable
     */
    isEnabled: boolean;
    /**
     * The number of results found for the current search query. Updated upon the {@link #search} event.
     *
     * @default 0
     * @observable
     */
    resultsCount: number;
    /**
     * The number of the items that can be searched in the {@link #filteredView}. Updated upon the {@link #search} event.
     *
     * @default 0
     * @observable
     */
    totalItemsCount: number;
    /**
     * The collection of children of the view.
     *
     * @readonly
     */
    readonly children: ViewCollection;
    /**
     * The collection of focusable children of the view. Used by the focus management logic.
     *
     * @readonly
     */
    readonly focusableChildren: ViewCollection<FocusableView>;
    locale: Locale;
    /**
     * Provides the focus management (keyboard navigation) between {@link #queryView} and {@link #filteredView}.
     *
     * @readonly
     */
    focusCycler: FocusCycler;
    /**
     * The cached configuration object.
     *
     * @internal
     */
    protected _config: SearchTextViewConfig<TQueryFieldView>;
    /**
     * Creates an instance of the {@link module:ui/search/text/searchtextview~SearchTextView} class.
     *
     * @param locale The localization services instance.
     * @param config Configuration of the view.
     */
    constructor(locale: Locale, config: SearchTextViewConfig<TQueryFieldView>);
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * Focuses the {@link #queryView}.
     */
    focus(): void;
    /**
     * Resets the component to its initial state.
     */
    reset(): void;
    /**
     * Searches the {@link #filteredView} for the given query.
     *
     * @internal
     * @param query The search query string.
     */
    search(query: string): void;
    /**
     * Creates a search field view based on configured creator..
     */
    private _createSearchTextQueryView;
    /**
     * Initializes the default {@link #infoView} behavior with default text labels when no custom info view
     * was specified in the view config.
     */
    private _enableDefaultInfoViewBehavior;
}
/**
 * The configuration of the {@link module:ui/search/text/searchtextview~SearchTextView} class.
 */
export interface SearchTextViewConfig<TConfigSearchField extends InputBase<HTMLInputElement | HTMLTextAreaElement>> {
    /**
     * The configuration of the view's query field.
     */
    queryView: SearchTextQueryViewConfig<TConfigSearchField>;
    /**
     * The view that is filtered by the search query.
     */
    filteredView: FilteredView;
    /**
     * The view that displays the information about the search results.
     */
    infoView?: {
        /**
         * The view that displays the information about the search results. If not specified,
         * {@link module:ui/search/searchinfoview~SearchInfoView} is used.
         */
        instance?: FocusableView;
        /**
         * The configuration of text labels displayed in the {@link #infoView} in different states
         * of the search component.
         *
         * **Note**: This configuration is only used when the {@link #infoView} is **not** specified.
         * In other cases, please use the {@link module:ui/search/searchview~SearchTextViewSearchEvent} to bring about
         * your own info text logic.
         */
        text?: {
            notFound?: {
                primary: SearchTextViewDefaultInfoText;
                secondary?: SearchTextViewDefaultInfoText;
            };
            noSearchableItems?: {
                primary: SearchTextViewDefaultInfoText;
                secondary?: SearchTextViewDefaultInfoText;
            };
        };
    };
    /**
     * The custom CSS class name to be added to the search view element.
     */
    class?: string;
}
/**
 * Describes value of a info text configuration in {@link module:ui/search/text/searchtextview~SearchTextViewConfig}.
 * A string or a function that returns a string with the information about the search results.
 */
export type SearchTextViewDefaultInfoText = string | ((query: string, resultsCount: number, totalItemsCount: number) => string);
/**
 * An event fired when the search query changes fired by {@link module:ui/search/text/searchtextview~SearchTextView#search}.
 *
 * @eventName ~SearchTextView#search
 */
export type SearchTextViewSearchEvent = {
    name: 'search';
    args: [SearchTextViewSearchEventData];
};
export type SearchTextViewSearchEventData = {
    /**
     * The search query string.
     */
    query: string;
    /**
     * The number of results found for the current search query.
     */
    resultsCount: number;
    /**
     * The number of the items that can be searched.
     */
    totalItemsCount: number;
};
