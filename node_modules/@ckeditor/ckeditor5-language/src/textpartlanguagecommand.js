/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command } from 'ckeditor5/src/core.js';
import { ModelDocumentSelection } from 'ckeditor5/src/engine.js';
import { stringifyLanguageAttribute } from './utils.js';
/**
 * The text part language command plugin.
 */
export class TextPartLanguageCommand extends Command {
    /**
     * @inheritDoc
     */
    refresh() {
        const model = this.editor.model;
        const doc = model.document;
        this.value = this._getValueFromFirstAllowedNode();
        this.isEnabled = model.schema.checkAttributeInSelection(doc.selection, 'language');
    }
    /**
     * Executes the command. Applies the attribute to the selection or removes it from the selection.
     *
     * If `languageCode` is set to `false` or a `null` value, it will remove attributes. Otherwise, it will set
     * the attribute in the `{@link #value value}` format.
     *
     * The execution result differs, depending on the {@link module:engine/model/document~ModelDocument#selection}:
     *
     * * If the selection is on a range, the command applies the attribute to all nodes in that range
     * (if they are allowed to have this attribute by the {@link module:engine/model/schema~ModelSchema schema}).
     * * If the selection is collapsed in a non-empty node, the command applies the attribute to the
     * {@link module:engine/model/document~ModelDocument#selection} itself (note that typed characters copy attributes from the selection).
     * * If the selection is collapsed in an empty node, the command applies the attribute to the parent node of the selection (note
     * that the selection inherits all attributes from a node if it is in an empty node).
     *
     * @fires execute
     * @param options Command options.
     * @param options.languageCode The language code to be applied to the model.
     * @param options.textDirection The language text direction.
     */
    execute({ languageCode, textDirection } = {}) {
        const model = this.editor.model;
        const doc = model.document;
        const selection = doc.selection;
        const value = languageCode ? stringifyLanguageAttribute(languageCode, textDirection) : false;
        model.change(writer => {
            if (selection.isCollapsed) {
                if (value) {
                    writer.setSelectionAttribute('language', value);
                }
                else {
                    writer.removeSelectionAttribute('language');
                }
            }
            else {
                const ranges = model.schema.getValidRanges(selection.getRanges(), 'language', {
                    includeEmptyRanges: true
                });
                for (const range of ranges) {
                    let itemOrRange = range;
                    let attributeKey = 'language';
                    if (range.isCollapsed) {
                        itemOrRange = range.start.parent;
                        attributeKey = ModelDocumentSelection._getStoreAttributeKey('language');
                    }
                    if (value) {
                        writer.setAttribute(attributeKey, value, itemOrRange);
                    }
                    else {
                        writer.removeAttribute(attributeKey, itemOrRange);
                    }
                }
            }
        });
    }
    /**
     * Returns the attribute value of the first node in the selection that allows the attribute.
     * For a collapsed selection it returns the selection attribute.
     *
     * @returns The attribute value.
     */
    _getValueFromFirstAllowedNode() {
        const model = this.editor.model;
        const schema = model.schema;
        const selection = model.document.selection;
        if (selection.isCollapsed) {
            return selection.getAttribute('language') || false;
        }
        for (const range of selection.getRanges()) {
            for (const item of range.getItems()) {
                if (schema.checkAttribute(item, 'language')) {
                    return item.getAttribute('language') || false;
                }
            }
        }
        return false;
    }
}
