/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module enter/entercommand
 */
import { Command } from '@ckeditor/ckeditor5-core';
import type { ModelWriter } from '@ckeditor/ckeditor5-engine';
/**
 * Enter command used by the {@link module:enter/enter~Enter Enter feature} to handle the <kbd>Enter</kbd> keystroke.
 */
export declare class EnterCommand extends Command {
    /**
     * @inheritDoc
     */
    execute(): void;
    /**
     * Splits a block where the document selection is placed, in the way how the <kbd>Enter</kbd> key is expected to work:
     *
     * ```
     * <p>Foo[]bar</p>   ->   <p>Foo</p><p>[]bar</p>
     * <p>Foobar[]</p>   ->   <p>Foobar</p><p>[]</p>
     * <p>Fo[ob]ar</p>   ->   <p>Fo</p><p>[]ar</p>
     * ```
     *
     * In some cases, the split will not happen:
     *
     * ```
     * // The selection parent is a limit element:
     * <figcaption>A[bc]d</figcaption>   ->   <figcaption>A[]d</figcaption>
     *
     * // The selection spans over multiple elements:
     * <h>x[x</h><p>y]y<p>   ->   <h>x</h><p>[]y</p>
     * ```
     *
     * @param writer Writer to use when performing the enter action.
     * @returns Boolean indicating if the block was split.
     */
    enterBlock(writer: ModelWriter): boolean;
}
/**
 * Fired after the the {@link module:enter/entercommand~EnterCommand} is finished executing.
 *
 * @eventName ~EnterCommand#afterExecute
 */
export type EnterCommandAfterExecuteEvent = {
    name: 'afterExecute';
    args: [{
        writer: ModelWriter;
    }];
};
