/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module find-and-replace/findcommand
*/
import { Command, type Editor } from 'ckeditor5/src/core.js';
import type { Collection } from 'ckeditor5/src/utils.js';
import type { FindAndReplaceState, FindCallback } from './findandreplacestate.js';
import type { FindResultType } from './findandreplace.js';
/**
 * The find command. It is used by the {@link module:find-and-replace/findandreplace~FindAndReplace find and replace feature}.
 */
export declare class FindCommand extends Command {
    /**
     * The find and replace state object used for command operations.
     */
    private _state;
    /**
     * Creates a new `FindCommand` instance.
     *
     * @param editor The editor on which this command will be used.
     * @param state An object to hold plugin state.
     */
    constructor(editor: Editor, state: FindAndReplaceState);
    /**
     * Executes the command.
     *
     * @param callbackOrText
     * @param options Options object.
     * @param options.matchCase If set to `true`, the letter case will be matched.
     * @param options.wholeWords If set to `true`, only whole words that match `callbackOrText` will be matched.
     *
     * @fires execute
     */
    execute(callbackOrText: string | FindCallback, { matchCase, wholeWords }?: FindAttributes): {
        results: Collection<FindResultType>;
        findCallback: FindCallback;
    };
}
/**
 * The options object for the find command.
 */
export type FindAttributes = {
    matchCase?: boolean;
    wholeWords?: boolean;
};
