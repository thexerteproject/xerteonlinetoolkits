/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/listproperties/liststylecommand
 */
import { Command, type Editor } from 'ckeditor5/src/core.js';
/**
 * The list style command. It changes `listStyle` attribute of the selected list items,
 * letting the user choose styles for the list item markers.
 * It is used by the {@link module:list/listproperties~ListProperties list properties feature}.
 */
export declare class ListStyleCommand extends Command {
    /**
     * @inheritDoc
     */
    value: string | null;
    /**
     * The default type of the list style.
     */
    readonly defaultType: string;
    /**
     * The list of supported style types by this command.
     */
    private _supportedTypes;
    /**
     * Creates an instance of the command.
     *
     * @param editor The editor instance.
     * @param defaultType The list type that will be used by default if the value was not specified during
     * the command execution.
     * @param supportedTypes The list of supported style types by this command.
     */
    constructor(editor: Editor, defaultType: string, supportedTypes?: Array<string>);
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
     * Checks if the given style type is supported by this plugin.
     */
    isStyleTypeSupported(value: string): boolean;
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
     * Check if the provided list style is valid. Also change the selection to a list if it's not set yet.
     *
     * @param options.type The type of the list style. If `null` is specified, the function does nothing.
    */
    private _tryToConvertItemsToList;
}
