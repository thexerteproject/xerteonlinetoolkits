/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module typing/inserttextcommand
 */
import { Command } from '@ckeditor/ckeditor5-core';
import { TypingChangeBuffer } from './utils/changebuffer.js';
/**
 * The insert text command. Used by the {@link module:typing/input~Input input feature} to handle typing.
 */
export class InsertTextCommand extends Command {
    /**
     * Typing's change buffer used to group subsequent changes into batches.
     */
    _buffer;
    /**
     * Creates an instance of the command.
     *
     * @param undoStepSize The maximum number of atomic changes
     * which can be contained in one batch in the command buffer.
     */
    constructor(editor, undoStepSize) {
        super(editor);
        this._buffer = new TypingChangeBuffer(editor.model, undoStepSize);
        // Since this command may execute on different selectable than selection, it should be checked directly in execute block.
        this._isEnabledBasedOnSelection = false;
    }
    /**
     * The current change buffer.
     */
    get buffer() {
        return this._buffer;
    }
    /**
     * @inheritDoc
     */
    destroy() {
        super.destroy();
        this._buffer.destroy();
    }
    /**
     * Executes the input command. It replaces the content within the given range with the given text.
     * Replacing is a two step process, first the content within the range is removed and then the new text is inserted
     * at the beginning of the range (which after the removal is a collapsed range).
     *
     * @fires execute
     * @param options The command options.
     */
    execute(options = {}) {
        const model = this.editor.model;
        const doc = model.document;
        const text = options.text || '';
        const textInsertions = text.length;
        let selection = doc.selection;
        if (options.selection) {
            selection = options.selection;
        }
        else if (options.range) {
            selection = model.createSelection(options.range);
        }
        // Stop executing if selectable is in non-editable place.
        if (!model.canEditAt(selection)) {
            return;
        }
        const resultRange = options.resultRange;
        model.enqueueChange(this._buffer.batch, writer => {
            this._buffer.lock();
            // Store selection attributes before deleting old content to preserve formatting and link.
            // This unifies the behavior between ModelDocumentSelection and Selection provided as input option.
            const selectionAttributes = Array.from(doc.selection.getAttributes());
            model.deleteContent(selection);
            if (text) {
                model.insertContent(writer.createText(text, selectionAttributes), selection);
            }
            if (resultRange) {
                writer.setSelection(resultRange);
            }
            else if (!selection.is('documentSelection')) {
                writer.setSelection(selection);
            }
            this._buffer.unlock();
            this._buffer.input(textInsertions);
        });
    }
}
