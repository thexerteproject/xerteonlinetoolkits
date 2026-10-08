/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module find-and-replace/findandreplaceutils
 */
import type { ModelItem, Model, ModelRange } from 'ckeditor5/src/engine.js';
import { Plugin } from 'ckeditor5/src/core.js';
import { Collection } from 'ckeditor5/src/utils.js';
import type { FindResultType } from './findandreplace.js';
/**
 * A set of helpers related to find and replace.
 */
export declare class FindAndReplaceUtils extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "FindAndReplaceUtils";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * Executes findCallback and updates search results list.
     *
     * @param range The model range to scan for matches.
     * @param model The model.
     * @param findCallback The callback that should return `true` if provided text matches the search term.
     * @param startResults An optional collection of find matches that the function should
     * start with. This would be a collection returned by a previous `updateFindResultFromRange()` call.
     * @returns A collection of objects describing find match.
     *
     * An example structure:
     *
     * ```js
     * {
     *	id: resultId,
     *	label: foundItem.label,
     *	marker
     *	}
     * ```
     */
    updateFindResultFromRange(range: ModelRange, model: Model, findCallback: ({ item, text }: {
        item: ModelItem;
        text: string;
    }) => Array<FindResultType> | {
        results: Array<FindResultType>;
    }, startResults: Collection<FindResultType> | null): Collection<FindResultType>;
    /**
     * Returns text representation of a range. The returned text length should be the same as range length.
     * In order to achieve this, this function will replace inline elements (text-line) as new line character ("\n").
     *
     * @param range The model range.
     * @returns The text content of the provided range.
     */
    rangeToText(range: ModelRange): string;
    /**
     * Creates a text matching callback for a specified search term and matching options.
     *
     * @param searchTerm The search term.
     * @param options Matching options.
     * 	- options.matchCase=false If set to `true` letter casing will be ignored.
     * 	- options.wholeWords=false If set to `true` only whole words that match `callbackOrText` will be matched.
     */
    findByTextCallback(searchTerm: string, options: {
        matchCase?: boolean;
        wholeWords?: boolean;
    }): ({ item, text }: {
        item: ModelItem;
        text: string;
    }) => Array<FindResultType>;
}
