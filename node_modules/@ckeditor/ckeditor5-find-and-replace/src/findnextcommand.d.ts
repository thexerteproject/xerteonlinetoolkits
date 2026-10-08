/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module find-and-replace/findnextcommand
*/
import { Command, type Editor } from 'ckeditor5/src/core.js';
import { type FindAndReplaceState } from './findandreplacestate.js';
/**
 * The find next command. Moves the highlight to the next search result.
 *
 * It is used by the {@link module:find-and-replace/findandreplace~FindAndReplace find and replace feature}.
 */
export declare class FindNextCommand extends Command {
    /**
     * The find and replace state object used for command operations.
     */
    protected _state: FindAndReplaceState;
    /**
     * Creates a new `FindNextCommand` instance.
     *
     * @param editor The editor on which this command will be used.
     * @param state An object to hold plugin state.
     */
    constructor(editor: Editor, state: FindAndReplaceState);
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * @inheritDoc
     */
    execute(): void;
}
