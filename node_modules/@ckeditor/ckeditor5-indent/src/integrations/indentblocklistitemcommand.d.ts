/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module indent/integrations/indentblocklistitemcommand
 */
import { Command, type Editor } from 'ckeditor5/src/core.js';
import type { IndentBehavior } from '../indentcommandbehavior/indentbehavior.js';
/**
 * The indent block list item command.
 *
 * The command is registered by the {@link module:indent/integrations/indentblocklistintegration~IndentBlockListIntegration} as
 * `'indentBlockListItem'` for indenting list items and `'outdentBlockListItem'` for outdenting list items.
 *
 * It's only possible to reset the block indentation of a list item to `0`.
 * This means that if a list item has negative block indentation, the command will only allow forward indentation
 * to make it possible to reset it to `0` and if a list item has positive block indentation, the command
 * will only allow backward indentation to make it possible to reset it to `0`.
 *
 * To increase block indentation of the list item, execute the command:
 *
 * ```ts
 * editor.execute( 'indentBlockListItem' );
 * ```
 *
 * To decrease block indentation of the list item, execute the command:
 *
 * ```ts
 * editor.execute( 'outdentBlockListItem' );
 * ```
 */
export declare class IndentBlockListItemCommand extends Command {
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
     * @inheritDoc
     */
    execute(): void;
    /**
     * Returns an array of list items which block indentation should be changed.
     */
    private _getAffectedListItems;
    /**
     * Returns `true` if changing the block indentation is allowed for the given list item.
     *
     * Indentation of a list item is only allowed if it moves toward zero. This means that:
     * - when currentIndent = 0, the command should be disabled
     * - when currentIndent < 0, only forward indentation should be allowed
     * - when currentIndent > 0, only backward indentation should be allowed
     *
     * For classes-based indentation, the command should be enabled if there is a class to be removed.
     */
    private _isIndentationChangeAllowed;
}
