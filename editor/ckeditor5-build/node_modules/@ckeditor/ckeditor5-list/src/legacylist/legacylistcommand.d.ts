/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command, type Editor } from 'ckeditor5/src/core.js';
import { type ListType } from '../list/listediting.js';
/**
 * The list command. It is used by the {@link module:list/legacylist~LegacyList legacy list feature}.
 */
export declare class LegacyListCommand extends Command {
    /**
     * The type of the list created by the command.
     */
    readonly type: ListType;
    /**
     * A flag indicating whether the command is active, which means that the selection starts in a list of the same type.
     *
     * @readonly
     */
    value: boolean;
    /**
     * Creates an instance of the command.
     *
     * @param editor The editor instance.
     * @param type List type that will be handled by this command.
     */
    constructor(editor: Editor, type: ListType);
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the list command.
     *
     * @fires execute
     * @param options Command options.
     * @param options.forceValue If set, it will force the command behavior. If `true`, the command will try to convert the
     * selected items and potentially the neighbor elements to the proper list items. If set to `false`, it will convert selected elements
     * to paragraphs. If not set, the command will toggle selected elements to list items or paragraphs, depending on the selection.
     */
    execute(options?: {
        forceValue?: boolean;
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
}
