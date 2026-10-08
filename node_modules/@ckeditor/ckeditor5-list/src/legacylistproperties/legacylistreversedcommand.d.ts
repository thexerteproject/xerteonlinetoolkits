/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/legacylistproperties/legacylistreversedcommand
 */
import { Command } from 'ckeditor5/src/core.js';
/**
 * The reversed list command. It changes the `listReversed` attribute of the selected list items. As a result, the list order will be
 * reversed.
 * It is used by the {@link module:list/legacylistproperties~LegacyListProperties legacy list properties feature}.
 */
export declare class LegacyListReversedCommand extends Command {
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
     *
     * @returns The current value.
     */
    private _getValue;
}
