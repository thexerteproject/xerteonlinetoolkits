/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module find-and-replace/replaceallcommand
 */
import { Collection } from 'ckeditor5/src/utils.js';
import type { FindResultType } from './findandreplace.js';
import { FindReplaceCommandBase } from './replacecommandbase.js';
/**
 * The replace all command. It is used by the {@link module:find-and-replace/findandreplace~FindAndReplace find and replace feature}.
 */
export declare class ReplaceAllCommand extends FindReplaceCommandBase {
    /**
     * Replaces all the occurrences of `textToReplace` with a given `newText` string.
     *
     * ```ts
     *	replaceAllCommand.execute( 'replaceAll', 'new text replacement', 'text to replace' );
     * ```
     *
     * Alternatively you can call it from editor instance:
     *
     * ```ts
     *	editor.execute( 'replaceAll', 'new text', 'old text' );
     * ```
     *
     * @param newText Text that will be inserted to the editor for each match.
     * @param textToReplace Text to be replaced or a collection of matches
     * as returned by the find command.
     *
     * @fires module:core/command~Command#event:execute
     */
    execute(newText: string, textToReplace: string | Collection<FindResultType>): void;
}
