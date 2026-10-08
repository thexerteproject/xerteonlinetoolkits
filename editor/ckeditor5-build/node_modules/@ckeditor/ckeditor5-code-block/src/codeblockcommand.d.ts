/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command, type Editor } from 'ckeditor5/src/core.js';
/**
 * The code block command plugin.
 */
export declare class CodeBlockCommand extends Command {
    /**
     * Contains the last used language.
     */
    private _lastLanguage;
    /**
     * Contains language if any is selected, false otherwise.
     * @observable
     * @readonly
     */
    value: string | false;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command. When the command {@link #value is on}, all topmost code blocks within
     * the selection will be removed. If it is off, all selected blocks will be flattened and
     * wrapped by a code block.
     *
     * @fires execute
     * @param options Command options.
     * @param options.language The code block language.
     * @param options.forceValue If set, it will force the command behavior. If `true`, the command will apply a code block,
     * otherwise the command will remove the code block. If not set, the command will act basing on its current value.
     * @param options.usePreviousLanguageChoice If set on `true` and the `options.language` is not specified, the command
     * will apply the previous language (if the command was already executed) when inserting the `codeBlock` element.
     */
    execute(options?: {
        language?: string;
        forceValue?: boolean;
        usePreviousLanguageChoice?: boolean;
    }): void;
    /**
     * Checks the command's {@link #value}.
     *
     * @returns The current value.
     */
    private _getValue;
    /**
     * Checks whether the command can be enabled in the current context.
     *
     * @returns Whether the command should be enabled.
     */
    private _checkEnabled;
    private _applyCodeBlock;
    private _removeCodeBlock;
}
