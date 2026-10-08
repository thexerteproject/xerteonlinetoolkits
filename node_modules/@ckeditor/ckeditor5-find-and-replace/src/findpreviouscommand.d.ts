/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module find-and-replace/findpreviouscommand
*/
import { FindNextCommand } from './findnextcommand.js';
/**
 * The find previous command. Moves the highlight to the previous search result.
 *
 * It is used by the {@link module:find-and-replace/findandreplace~FindAndReplace find and replace feature}.
 */
export declare class FindPreviousCommand extends FindNextCommand {
    /**
     * @inheritDoc
     */
    execute(): void;
}
