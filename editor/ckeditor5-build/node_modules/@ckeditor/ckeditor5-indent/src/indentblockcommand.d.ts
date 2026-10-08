/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module indent/indentblockcommand
 */
import { Command, type Editor } from 'ckeditor5/src/core.js';
import type { IndentBehavior } from './indentcommandbehavior/indentbehavior.js';
/**
 * The indent block command.
 *
 * The command is registered by the {@link module:indent/indentblock~IndentBlock} as `'indentBlock'` for indenting blocks and
 * `'outdentBlock'` for outdenting blocks.
 *
 * To increase block indentation at the current selection, execute the command:
 *
 * ```ts
 * editor.execute( 'indentBlock' );
 * ```
 *
 * To decrease block indentation at the current selection, execute the command:
 *
 * ```ts
 * editor.execute( 'outdentBlock' );
 * ```
 */
export declare class IndentBlockCommand extends Command {
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
     * Returns blocks from selection that should have blockIndent selection set.
     */
    private _getBlocksToChange;
    /**
     * Returns false if indentation cannot be applied, i.e.:
     * - for blocks disallowed by schema declaration
     * - for blocks in Document Lists (disallowed forward indentation only). See https://github.com/ckeditor/ckeditor5/issues/14155.
     * Otherwise returns true.
     */
    private _isIndentationChangeAllowed;
}
