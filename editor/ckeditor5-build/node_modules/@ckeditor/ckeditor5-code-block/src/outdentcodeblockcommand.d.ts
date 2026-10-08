/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command, type Editor } from 'ckeditor5/src/core.js';
/**
 * The code block indentation decrease command plugin.
 */
export declare class OutdentCodeBlockCommand extends Command {
    /**
     * A sequence of characters removed from the line when the command is executed.
     */
    private readonly _indentSequence;
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command. When the command {@link #isEnabled is enabled}, the indentation of the
     * code lines in the selection will be decreased.
     *
     * @fires execute
     */
    execute(): void;
    /**
     * Checks whether the command can be enabled in the current context.
     *
     * @private
     * @returns {Boolean} Whether the command should be enabled.
     */
    private _checkEnabled;
}
