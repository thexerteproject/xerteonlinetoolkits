/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module restricted-editing/restrictededitingexceptionblockcommand
 */
import { Command } from 'ckeditor5/src/core.js';
/**
 * The command that toggles exception blocks for the restricted editing.
 */
export declare class RestrictedEditingExceptionBlockCommand extends Command {
    /**
     * Whether the selection starts in a block exception.
     *
     * @observable
     * @readonly
     */
    value: boolean;
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Wraps or unwraps the selected blocks with non-restricted area.
     *
     * @fires execute
     * @param options Command options.
     * @param options.forceValue If set, it will force the command behavior. If `true`, the command will apply a block exception,
     * otherwise the command will remove the block exception. If not set, the command will act basing on its current value.
     */
    execute(options?: {
        forceValue?: boolean;
    }): void;
    /**
     * Checks the command's {@link #value}.
     */
    private _getValue;
    /**
     * Checks whether the command can be enabled in the current context.
     *
     * @returns Whether the command should be enabled.
     */
    private _checkEnabled;
    /**
     * Unwraps the exception from given blocks.
     *
     * If blocks which are supposed to be unwrapped are in the middle of an exception,
     * start it or end it, then the exception will be split (if needed) and the blocks
     * will be moved out of it, so other exception blocks remained wrapped.
     */
    private _removeException;
    /**
     * Applies the exception to given blocks.
     */
    private _applyException;
}
