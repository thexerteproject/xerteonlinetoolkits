/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module find-and-replace/replacecommand
*/
import type { FindResultType } from './findandreplace.js';
import { FindReplaceCommandBase } from './replacecommandbase.js';
/**
 * The replace command. It is used by the {@link module:find-and-replace/findandreplace~FindAndReplace find and replace feature}.
 */
export declare class ReplaceCommand extends FindReplaceCommandBase {
    /**
     * Replace a given find result by a string or a callback.
     *
     * @param result A single result from the find command.
     *
     * @fires execute
     */
    execute(replacementText: string, result: FindResultType): void;
}
