/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module restricted-editing/restrictededitingexceptionautocommand
 */
import { Command, type Editor } from 'ckeditor5/src/core.js';
/**
 * The command that toggles exceptions from the restricted editing on text or on blocks.
 */
export declare class RestrictedEditingExceptionAutoCommand extends Command {
    /**
     * A flag indicating whether the command is active.
     *
     * @readonly
     */
    value: boolean;
    /**
     * The inline exception command.
     */
    private readonly _inlineCommand;
    /**
     * The block exception command.
     */
    private readonly _blockCommand;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * @inheritDoc
     */
    execute(): void;
}
