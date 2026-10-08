/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/autocomplete/autocompleteview
*/
import { type PositioningFunction, type Locale } from '@ckeditor/ckeditor5-utils';
import { SearchTextView, type SearchTextViewConfig } from '../search/text/searchtextview.js';
import { type SearchResultsView } from '../search/searchresultsview.js';
import { type InputBase } from '../input/inputbase.js';
import '../../theme/components/autocomplete/autocomplete.css';
/**
 * The autocomplete component's view class. It extends the {@link module:ui/search/text/searchtextview~SearchTextView} class
 * with a floating {@link #resultsView} that shows up when the user starts typing and hides when they blur
 * the component.
 */
export declare class AutocompleteView<TQueryFieldView extends InputBase<HTMLInputElement | HTMLTextAreaElement>> extends SearchTextView<TQueryFieldView> {
    /**
     * The configuration of the autocomplete view.
     */
    protected _config: AutocompleteViewConfig<TQueryFieldView>;
    resultsView: AutocompleteResultsView;
    /**
     * @inheritDoc
     */
    constructor(locale: Locale, config: AutocompleteViewConfig<TQueryFieldView>);
    /**
     * Updates the position of the results view on demand.
     */
    private _updateResultsViewWidthAndPosition;
    /**
     * Updates the visibility of the results view on demand.
     */
    private _updateResultsVisibility;
    /**
     * Positions for the autocomplete results view. Two positions are defined by default:
     * * `s` - below the search field,
     * * `n` - above the search field.
     */
    static defaultResultsPositions: Array<PositioningFunction>;
    /**
     * A function used to calculate the optimal position for the dropdown panel.
     */
    private static _getOptimalPosition;
}
/**
 * An interface describing additional properties of the floating search results view used by the autocomplete plugin.
 */
export interface AutocompleteResultsView extends SearchResultsView {
    /**
     * Controls the visibility of the results view.
     *
     * @observable
     */
    isVisible: boolean;
    /**
     * Controls the position (CSS class suffix) of the results view.
     *
     * @internal
    */
    _position?: string;
    /**
     * The observable property determining the CSS width of the results view.
     *
     * @internal
     */
    _width: number;
}
export interface AutocompleteViewConfig<TConfigInputCreator extends InputBase<HTMLInputElement | HTMLTextAreaElement>> extends SearchTextViewConfig<TConfigInputCreator> {
    /**
     * When set `true`, the query view will be reset when the autocomplete view loses focus.
     */
    resetOnBlur?: boolean;
    /**
     * Minimum number of characters that need to be typed before the search is performed.
     *
     * @default 0
     */
    queryMinChars?: number;
}
