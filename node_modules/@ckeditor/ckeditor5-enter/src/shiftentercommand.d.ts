/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module enter/shiftentercommand
 */
import { Command } from '@ckeditor/ckeditor5-core';
import type { ModelWriter } from '@ckeditor/ckeditor5-engine';
/**
 * ShiftEnter command. It is used by the {@link module:enter/shiftenter~ShiftEnter ShiftEnter feature} to handle
 * the <kbd>Shift</kbd>+<kbd>Enter</kbd> keystroke.
 */
export declare class ShiftEnterCommand extends Command {
    /**
     * @inheritDoc
     */
    execute(): void;
    /**
     * @inheritDoc
     */
    refresh(): void;
}
/**
 * Fired after the the {@link module:enter/shiftentercommand~ShiftEnterCommand} is finished executing.
 *
 * @eventName ~ShiftEnterCommand#afterExecute
 */
export type ShiftEnterCommandAfterExecuteEvent = {
    name: 'afterExecute';
    args: [{
        writer: ModelWriter;
    }];
};
