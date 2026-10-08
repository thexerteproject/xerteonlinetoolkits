/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module typing/deletecommand
 */
import { Command, type Editor } from '@ckeditor/ckeditor5-core';
import type { ModelDocumentSelection, ModelSelection } from '@ckeditor/ckeditor5-engine';
import { TypingChangeBuffer } from './utils/changebuffer.js';
/**
 * The delete command. Used by the {@link module:typing/delete~Delete delete feature} to handle the <kbd>Delete</kbd> and
 * <kbd>Backspace</kbd> keys.
 */
export declare class DeleteCommand extends Command {
    /**
     * The directionality of the delete describing in what direction it should
     * consume the content when the selection is collapsed.
     */
    readonly direction: 'forward' | 'backward';
    /**
     * Delete's change buffer used to group subsequent changes into batches.
     */
    private readonly _buffer;
    /**
     * Creates an instance of the command.
     *
     * @param direction The directionality of the delete describing in what direction it
     * should consume the content when the selection is collapsed.
     */
    constructor(editor: Editor, direction: 'forward' | 'backward');
    /**
     * The current change buffer.
     */
    get buffer(): TypingChangeBuffer;
    /**
     * Executes the delete command. Depending on whether the selection is collapsed or not, deletes its content
     * or a piece of content in the {@link #direction defined direction}.
     *
     * @fires execute
     * @param options The command options.
     * @param options.unit See {@link module:engine/model/utils/modifyselection~modifySelection}'s options.
     * @param options.sequence A number describing which subsequent delete event it is without the key being released.
     * See the {@link module:engine/view/document~ViewDocument#event:delete} event data.
     * @param options.selection Selection to remove. If not set, current model selection will be used.
     */
    execute(options?: {
        unit?: 'character' | 'codePoint' | 'word';
        sequence?: number;
        selection?: ModelSelection | ModelDocumentSelection;
    }): void;
    /**
     * If the user keeps <kbd>Backspace</kbd> or <kbd>Delete</kbd> key pressed, the content of the current
     * editable will be cleared. However, this will not yet lead to resetting the remaining block to a paragraph
     * (which happens e.g. when the user does <kbd>Ctrl</kbd> + <kbd>A</kbd>, <kbd>Backspace</kbd>).
     *
     * But, if the user pressed the key in an empty editable for the first time,
     * we want to replace the entire content with a paragraph if:
     *
     * * the current limit element is empty,
     * * the paragraph is allowed in the limit element,
     * * the limit doesn't already have a paragraph inside.
     *
     * See https://github.com/ckeditor/ckeditor5-typing/issues/61.
     *
     * @param sequence A number describing which subsequent delete event it is without the key being released.
     */
    private _shouldEntireContentBeReplacedWithParagraph;
    /**
     * The entire content is replaced with the paragraph. Selection is moved inside the paragraph.
     *
     * @param writer The model writer.
     */
    private _replaceEntireContentWithParagraph;
    /**
     * Checks if the selection is inside an empty element that is the first child of the limit element
     * and should be replaced with a paragraph.
     *
     * @param selection The selection.
     * @param sequence A number describing which subsequent delete event it is without the key being released.
     */
    private _shouldReplaceFirstBlockWithParagraph;
}
