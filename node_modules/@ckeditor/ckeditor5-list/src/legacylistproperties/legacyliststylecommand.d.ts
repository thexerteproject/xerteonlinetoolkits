/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/legacylistproperties/legacyliststylecommand
 */
import { Command, type Editor } from 'ckeditor5/src/core.js';
/**
 * The list style command. It changes the `listStyle` attribute of the selected list items.
 *
 * If the list type (numbered or bulleted) can be inferred from the passed style type,
 * the command tries to convert selected items to a list of that type.
 * It is used by the {@link module:list/legacylistproperties~LegacyListProperties legacy list properties feature}.
 */
export declare class LegacyListStyleCommand extends Command {
    isStyleTypeSupported: undefined;
    /**
     * @inheritDoc
     * @readonly
     */
    value: string | null;
    /**
     * The default type of the list style.
     */
    readonly defaultType: string;
    /**
     * Creates an instance of the command.
     *
     * @param editor The editor instance.
     * @param defaultType The list type that will be used by default if the value was not specified during
     * the command execution.
     */
    constructor(editor: Editor, defaultType: string);
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command.
     *
     * @fires execute
     * @param options.type The type of the list style, e.g. `'disc'` or `'square'`. If `null` is specified, the default
     * style will be applied.
     */
    execute(options?: {
        type?: string | null;
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
    /**
     * Checks if the provided list style is valid. Also changes the selection to a list if it's not set yet.
     *
     * @param options Additional options.
     * @param options.type The type of the list style. If `null` is specified, the function does nothing.
    */
    private _tryToConvertItemsToList;
}
