/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module find-and-replace/replacecommandbase
*/
import { Command, type Editor } from 'ckeditor5/src/core.js';
import type { FindResultType } from './findandreplace.js';
import { type FindAndReplaceState } from './findandreplacestate.js';
export declare abstract class FindReplaceCommandBase extends Command {
    /**
     * The find and replace state object used for command operations.
     */
    protected _state: FindAndReplaceState;
    /**
     * Creates a new `ReplaceCommand` instance.
     *
     * @param editor Editor on which this command will be used.
     * @param state An object to hold plugin state.
     */
    constructor(editor: Editor, state: FindAndReplaceState);
    abstract execute(...args: Array<unknown>): void;
    /**
     * Common logic for both `replace` commands.
     * Replace a given find result by a string or a callback.
     *
     * @param result A single result from the find command.
     */
    protected _replace(replacementText: string, result: FindResultType): void;
}
