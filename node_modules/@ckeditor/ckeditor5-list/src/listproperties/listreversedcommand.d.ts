/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/listproperties/listreversedcommand
 */
import { Command } from 'ckeditor5/src/core.js';
/**
 * The list reversed command. It changes the `listReversed` attribute of the selected list items,
 * letting the user to choose the order of an ordered list.
 * It is used by the {@link module:list/listproperties~ListProperties list properties feature}.
 */
export declare class ListReversedCommand extends Command {
    /**
     * @inheritDoc
     */
    value: boolean | null;
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command.
     *
     * @fires execute
     * @param options.reversed Whether the list should be reversed.
     */
    execute(options?: {
        reversed?: boolean;
    }): void;
    /**
     * Checks the command's {@link #value}.
     */
    private _getValue;
}
