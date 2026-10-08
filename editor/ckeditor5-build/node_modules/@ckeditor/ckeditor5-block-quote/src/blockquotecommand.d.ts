/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module block-quote/blockquotecommand
 */
import { Command } from 'ckeditor5/src/core.js';
/**
 * The block quote command plugin.
 *
 * @extends module:core/command~Command
 */
export declare class BlockQuoteCommand extends Command {
    /**
     * Whether the selection starts in a block quote.
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
     * Executes the command. When the command {@link #value is on}, all top-most block quotes within
     * the selection will be removed. If it is off, all selected blocks will be wrapped with
     * a block quote.
     *
     * @fires execute
     * @param options Command options.
     * @param options.forceValue If set, it will force the command behavior. If `true`, the command will apply a block quote,
     * otherwise the command will remove the block quote. If not set, the command will act basing on its current value.
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
     * Removes the quote from given blocks.
     *
     * If blocks which are supposed to be "unquoted" are in the middle of a quote,
     * start it or end it, then the quote will be split (if needed) and the blocks
     * will be moved out of it, so other quoted blocks remained quoted.
     */
    private _removeQuote;
    /**
     * Applies the quote to given blocks.
     */
    private _applyQuote;
}
