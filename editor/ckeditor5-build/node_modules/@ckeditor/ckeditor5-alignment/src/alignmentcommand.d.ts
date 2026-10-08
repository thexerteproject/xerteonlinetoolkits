/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module alignment/alignmentcommand
 */
import { Command } from 'ckeditor5/src/core.js';
import type { AlignmentSupportedOption } from './alignmentconfig.js';
/**
 * The alignment command plugin.
 */
export declare class AlignmentCommand extends Command {
    /**
     * A value of the current block's alignment.
     *
     * @observable
     * @readonly
     */
    value: AlignmentSupportedOption;
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command. Applies the alignment `value` to the selected blocks.
     * If no `value` is passed, the `value` is the default one or it is equal to the currently selected block's alignment attribute,
     * the command will remove the attribute from the selected blocks.
     *
     * @param options Options for the executed command.
     * @param options.value The value to apply.
     * @fires execute
     */
    execute(options?: {
        value?: AlignmentSupportedOption;
    }): void;
    /**
     * Checks whether a block can have alignment set.
     *
     * @param block The block to be checked.
     */
    private _canBeAligned;
}
