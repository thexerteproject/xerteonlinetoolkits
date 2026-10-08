/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module typing/inserttextcommand
 */
import { Command, type Editor } from '@ckeditor/ckeditor5-core';
import { TypingChangeBuffer } from './utils/changebuffer.js';
import type { ModelDocumentSelection, ModelRange, ModelSelection } from '@ckeditor/ckeditor5-engine';
/**
 * The insert text command. Used by the {@link module:typing/input~Input input feature} to handle typing.
 */
export declare class InsertTextCommand extends Command {
    /**
     * Typing's change buffer used to group subsequent changes into batches.
     */
    private readonly _buffer;
    /**
     * Creates an instance of the command.
     *
     * @param undoStepSize The maximum number of atomic changes
     * which can be contained in one batch in the command buffer.
     */
    constructor(editor: Editor, undoStepSize: number);
    /**
     * The current change buffer.
     */
    get buffer(): TypingChangeBuffer;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Executes the input command. It replaces the content within the given range with the given text.
     * Replacing is a two step process, first the content within the range is removed and then the new text is inserted
     * at the beginning of the range (which after the removal is a collapsed range).
     *
     * @fires execute
     * @param options The command options.
     */
    execute(options?: InsertTextCommandOptions): void;
}
/**
 * Interface with parameters for executing InsertTextCommand.
 *
 * Both `range` and `selection` parameters are used for defining selection but should not be used together.
 * If both are defined, only `selection` will be considered.
 */
export interface InsertTextCommandOptions {
    /**
     * The text to be inserted.
     */
    text?: string;
    /**
     * The selection in which the text is inserted.
     * Inserting a text into a selection deletes the current content within selection ranges. If the selection is not specified,
     * the current selection in the model will be used instead.
     */
    selection?: ModelSelection | ModelDocumentSelection;
    /**
     * The range in which the text is inserted. Defaults to the first range in the current selection.
     */
    range?: ModelRange;
    /**
     * The range where the selection should be placed after the insertion.
     * If not specified, the selection will be placed right after the inserted text.
     */
    resultRange?: ModelRange;
}
export interface InsertTextCommandExecuteEvent {
    name: 'execute';
    args: [
        data: [options: InsertTextCommandOptions]
    ];
}
