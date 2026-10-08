/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module font/fontcommand
 */
import { Command } from 'ckeditor5/src/core.js';
import { ModelDocumentSelection } from 'ckeditor5/src/engine.js';
/**
 * The base font command.
 */
export class FontCommand extends Command {
    /**
     * A model attribute on which this command operates.
     */
    attributeKey;
    /**
     * Creates an instance of the command.
     *
     * @param editor Editor instance.
     * @param attributeKey The name of a model attribute on which this command operates.
     */
    constructor(editor, attributeKey) {
        super(editor);
        this.attributeKey = attributeKey;
    }
    /**
     * @inheritDoc
     */
    refresh() {
        const model = this.editor.model;
        const doc = model.document;
        this.value = doc.selection.getAttribute(this.attributeKey);
        this.isEnabled = model.schema.checkAttributeInSelection(doc.selection, this.attributeKey);
    }
    /**
     * Executes the command. Applies the `value` of the {@link #attributeKey} to the selection.
     * If no `value` is passed, it removes the attribute from the selection.
     *
     * @param options Options for the executed command.
     * @param options.value The value to apply.
     * @fires execute
     */
    execute(options = {}) {
        const model = this.editor.model;
        const document = model.document;
        const selection = document.selection;
        const value = options.value;
        const batch = options.batch;
        const updateAttribute = (writer) => {
            if (selection.isCollapsed) {
                if (value) {
                    writer.setSelectionAttribute(this.attributeKey, value);
                }
                else {
                    writer.removeSelectionAttribute(this.attributeKey);
                }
            }
            else {
                const ranges = model.schema.getValidRanges(selection.getRanges(), this.attributeKey, {
                    includeEmptyRanges: true
                });
                for (const range of ranges) {
                    let itemOrRange = range;
                    let attributeKey = this.attributeKey;
                    if (range.isCollapsed) {
                        itemOrRange = range.start.parent;
                        attributeKey = ModelDocumentSelection._getStoreAttributeKey(this.attributeKey);
                    }
                    if (value) {
                        writer.setAttribute(attributeKey, value, itemOrRange);
                    }
                    else {
                        writer.removeAttribute(attributeKey, itemOrRange);
                    }
                }
            }
        };
        // In some scenarios, you may want to use a single undo step for multiple changes (e.g. in color picker).
        if (batch) {
            model.enqueueChange(batch, writer => {
                updateAttribute(writer);
            });
        }
        else {
            model.change(writer => {
                updateAttribute(writer);
            });
        }
    }
}
