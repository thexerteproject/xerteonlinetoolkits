/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command, type Editor } from 'ckeditor5/src/core.js';
/**
 * The list indent command. It is used by the {@link module:list/legacylist~LegacyList legacy list feature}.
 */
export declare class LegacyIndentCommand extends Command {
    /**
     * Determines by how much the command will change the list item's indent attribute.
     */
    private readonly _indentBy;
    /**
     * Creates an instance of the command.
     *
     * @param editor The editor instance.
     * @param indentDirection The direction of indent. If it is equal to `backward`, the command will outdent a list item.
     */
    constructor(editor: Editor, indentDirection: 'forward' | 'backward');
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Indents or outdents (depending on the {@link #constructor}'s `indentDirection` parameter) selected list items.
     *
     * @fires execute
     */
    execute(): void;
    /**
     * Checks whether the command can be enabled in the current context.
     *
     * @returns Whether the command should be enabled.
     */
    private _checkEnabled;
}
