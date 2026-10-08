/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module indent/integrations/indentblocklistcommand
 */
import { Command, type Editor } from 'ckeditor5/src/core.js';
import type { IndentBehavior } from '../indentcommandbehavior/indentbehavior.js';
/**
 * The indent block list command.
 *
 * The command is registered by the {@link module:indent/integrations/indentblocklistintegration~IndentBlockListIntegration} as
 * `'indentBlockList'` for indenting lists and `'outdentBlockList'` for outdenting lists.
 *
 * To increase/decrease block indentation of the list the selection must be at the start of the first top–level list item
 * in the list.
 *
 * To increase block indentation of the list, execute the command:
 *
 * ```ts
 * editor.execute( 'indentBlockList' );
 * ```
 *
 * To decrease block indentation of the list, execute the command:
 *
 * ```ts
 * editor.execute( 'outdentBlockList' );
 * ```
 */
export declare class IndentBlockListCommand extends Command {
    /**
     * The command's indentation behavior.
     */
    private readonly _indentBehavior;
    /**
     * Creates an instance of the command.
     */
    constructor(editor: Editor, indentBehavior: IndentBehavior);
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command.
     *
     * @fires execute
     * @param options Command options.
     * @param options.firstListOnly When `true`, indentation is applied only to the first list at the beginning of the selection.
     * When `false` or omitted, indentation is applied to all lists of the selection.
     */
    execute(options?: {
        firstListOnly?: boolean;
    }): void;
    /**
     * Returns the list item at the beginning of the current selection if it is the first top–level list item in the list.
     * Otherwise, returns `null`.
     */
    private _getFirstListItemIfSelectionIsAtListStart;
}
