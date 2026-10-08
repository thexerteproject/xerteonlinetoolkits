/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module find-and-replace/findandreplaceediting
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { type Collection } from 'ckeditor5/src/utils.js';
import { type FindAttributes } from './findcommand.js';
import { FindAndReplaceState, type FindCallback } from './findandreplacestate.js';
import { FindAndReplaceUtils } from './findandreplaceutils.js';
import type { FindResultType } from './findandreplace.js';
import '../theme/findandreplace.css';
/**
 * Implements the editing part for find and replace plugin. For example conversion, commands etc.
 */
export declare class FindAndReplaceEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof FindAndReplaceUtils];
    /**
     * @inheritDoc
     */
    static get pluginName(): "FindAndReplaceEditing";
    /**
     * @inheritDoc
     * @internal
     */
    static get licenseFeatureCode(): string;
    /**
     * @inheritDoc
     */
    static get isPremiumPlugin(): true;
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * An object storing the find and replace state within a given editor instance.
     */
    state?: FindAndReplaceState;
    /**
     * A flag that indicates that the user has started a search and the editor is listening for changes
     * to the text on which it will perform an automatic search. Among other things, the mode is activated
     * when the user first clicks 'Find' button and then later deactivated when the modal or search dropdown is closed.
     *
     * @internal
     */
    _isSearchActive: boolean;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Initiate a search.
     */
    find(callbackOrText: string | FindCallback, findAttributes?: FindAttributes): Collection<FindResultType>;
    /**
     * Stops active results from updating, and clears out the results.
     */
    stop(): void;
    /**
     * Sets up the commands.
     */
    private _defineCommands;
    /**
     * Sets up the marker downcast converters for search results highlighting.
     */
    private _defineConverters;
    /**
     * Reacts to document changes in order to update search list.
     */
    private _onDocumentChange;
}
