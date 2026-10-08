/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/listproperties/liststartcommand
 */
import { Command } from 'ckeditor5/src/core.js';
/**
 * The list start index command. It changes the `listStart` attribute of the selected list items,
 * letting the user to choose the starting point of an ordered list.
 * It is used by the {@link module:list/listproperties~ListProperties list properties feature}.
 */
export declare class ListStartCommand extends Command {
    /**
     * @inheritDoc
     */
    value: number | null;
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command.
     *
     * @fires execute
     * @param options Execute options.
     * @param options.startIndex The list start index.
     */
    execute({ startIndex }?: {
        startIndex?: number;
    }): void;
    /**
     * Checks the command's {@link #value}.
     *
     * @returns The current value.
     */
    private _getValue;
}
