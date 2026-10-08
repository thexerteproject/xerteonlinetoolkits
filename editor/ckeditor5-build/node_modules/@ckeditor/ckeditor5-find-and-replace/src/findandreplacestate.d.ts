/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module find-and-replace/findandreplacestate
 */
import type { Model, ModelItem } from 'ckeditor5/src/engine.js';
import { Collection } from 'ckeditor5/src/utils.js';
import type { FindResultType } from './findandreplace.js';
declare const FindAndReplaceState_base: {
    new (): import("ckeditor5/src/utils.js").Observable;
    prototype: import("ckeditor5/src/utils.js").Observable;
};
/**
 * The object storing find and replace plugin state for a given editor instance.
 */
export declare class FindAndReplaceState extends /* #__PURE__ */ FindAndReplaceState_base {
    /**
     * A collection of find matches.
     *
     * @observable
     */
    results: Collection<FindResultType>;
    /**
     * Currently highlighted search result in {@link #results matched results}.
     *
     * @readonly
     * @observable
     */
    highlightedResult: FindResultType | null;
    /**
     * Currently highlighted search result offset in {@link #results matched results}.
     *
     * @readonly
     * @observable
     */
    highlightedOffset: number;
    /**
     * Searched text value.
     *
     * @readonly
     * @observable
     */
    searchText: string;
    /**
     *  The most recent search callback used by the feature to find matches.
     *  It is used to re-run the search when user modifies the editor content.
     *
     * @readonly
     * @observable
     */
    lastSearchCallback: FindCallback | null;
    /**
     * Replace text value.
     *
     * @readonly
     * @observable
     */
    replaceText: string;
    /**
     * Indicates whether the matchCase checkbox has been checked.
     *
     * @readonly
     * @observable
     */
    matchCase: boolean;
    /**
     * Indicates whether the matchWholeWords checkbox has been checked.
     *
     * @readonly
     * @observable
     */
    matchWholeWords: boolean;
    /**
     * Creates an instance of the state.
     */
    constructor(model: Model);
    /**
     * Cleans the state up and removes markers from the model.
     */
    clear(model: Model): void;
    /**
     * Refreshes the highlight result offset based on it's index within the result list.
     */
    refreshHighlightOffset(model: Model): void;
}
/**
 * Sorts search results by marker positions. Make sure that the results are sorted in the same order as they appear in the document
 * to avoid issues with the `find next` command. Apparently, the order of the results in the state might be different than the order
 * of the markers in the model.
 *
 * @internal
 */
export declare function sortSearchResultsByMarkerPositions(model: Model, results: Array<FindResultType>): Array<FindResultType>;
/**
 * The callback function used to find matches in the document.
 */
export type FindCallback = ({ item, text }: {
    item: ModelItem;
    text: string;
}) => FindCallbackResultObject | FindCallbackResult;
/**
 * Represents the result of a find callback.
 *
 * The `searchText` attribute in the result object is used to determine if the search text has changed.
 * If returned `searchText` is different than the last search text, the search results will be invalidated
 * while searching for next item and the search will start from the beginning of the document.
 */
export type FindCallbackResultObject = {
    results: Array<FindResultType>;
    searchText: string;
};
/**
 * Represents the result of a find callback.
 *
 * @deprecated Use `FindCallbackResultObject` instead.
 */
export type FindCallbackResult = Array<FindResultType>;
export {};
