/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module restricted-editing/restrictededitingexceptioncommand
 */
import { Command } from 'ckeditor5/src/core.js';
/**
 * The command that toggles exceptions from the restricted editing on text.
 */
export class RestrictedEditingExceptionCommand extends Command {
    /**
     * @inheritDoc
     */
    refresh() {
        const model = this.editor.model;
        const doc = model.document;
        this.value = !!doc.selection.getAttribute('restrictedEditingException');
        this.isEnabled = model.schema.checkAttributeInSelection(doc.selection, 'restrictedEditingException');
    }
    /**
     * @inheritDoc
     */
    execute(options = {}) {
        const model = this.editor.model;
        const document = model.document;
        const selection = document.selection;
        const valueToSet = (options.forceValue === undefined) ? !this.value : options.forceValue;
        model.change(writer => {
            const ranges = model.schema.getValidRanges(selection.getRanges(), 'restrictedEditingException');
            if (selection.isCollapsed) {
                if (valueToSet) {
                    writer.setSelectionAttribute('restrictedEditingException', valueToSet);
                }
                else {
                    const isSameException = (value) => {
                        return value.item.getAttribute('restrictedEditingException') === this.value;
                    };
                    const focus = selection.focus;
                    const exceptionStart = focus.getLastMatchingPosition(isSameException, { direction: 'backward' });
                    const exceptionEnd = focus.getLastMatchingPosition(isSameException);
                    writer.removeSelectionAttribute('restrictedEditingException');
                    if (!(focus.isEqual(exceptionStart) || focus.isEqual(exceptionEnd))) {
                        writer.removeAttribute('restrictedEditingException', writer.createRange(exceptionStart, exceptionEnd));
                    }
                }
            }
            else {
                for (const range of ranges) {
                    if (valueToSet) {
                        writer.setAttribute('restrictedEditingException', valueToSet, range);
                    }
                    else {
                        writer.removeAttribute('restrictedEditingException', range);
                    }
                }
            }
        });
    }
}
