/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command } from 'ckeditor5/src/core.js';
import { first } from 'ckeditor5/src/utils.js';
/**
 * The remove format command.
 *
 * It is used by the {@link module:remove-format/removeformat~RemoveFormat remove format feature}
 * to clear the formatting in the selection.
 *
 * ```ts
 * editor.execute( 'removeFormat' );
 * ```
 */
export class RemoveFormatCommand extends Command {
    /**
     * List of all registered custom attribute handlers.
     */
    _customAttributesHandlers = [];
    /**
     * @inheritDoc
     */
    refresh() {
        const model = this.editor.model;
        this.isEnabled = !!first(this._getFormattingItems(model.document.selection));
    }
    /**
     * @inheritDoc
     */
    execute() {
        const model = this.editor.model;
        model.change(writer => {
            for (const item of this._getFormattingItems(model.document.selection)) {
                if (item.is('selection')) {
                    for (const attributeName of this._getFormattingAttributes(item)) {
                        writer.removeSelectionAttribute(attributeName);
                    }
                }
                else {
                    // Workaround for items with multiple removable attributes. See
                    // https://github.com/ckeditor/ckeditor5-remove-format/pull/1#pullrequestreview-220515609
                    const itemRange = writer.createRangeOn(item);
                    for (const attributeName of this._getFormattingAttributes(item)) {
                        this._removeFormatting(attributeName, item, itemRange, writer);
                    }
                }
            }
        });
    }
    /**
     * Registers a custom attribute handler that will be used to determine if an attribute is formatting and how to remove it.
     *
     * @internal
     */
    registerCustomAttribute(isFormatting, removeFormatting) {
        this._customAttributesHandlers.push({
            isFormatting,
            removeFormatting
        });
    }
    /**
     * Helper method that removes a formatting attribute from an item either using custom callbacks or writer remove attribute.
     */
    _removeFormatting(attributeName, item, itemRange, writer) {
        let customHandled = false;
        for (const { isFormatting, removeFormatting } of this._customAttributesHandlers) {
            if (isFormatting(attributeName, item)) {
                removeFormatting(attributeName, itemRange, writer);
                customHandled = true;
            }
        }
        if (!customHandled) {
            writer.removeAttribute(attributeName, itemRange);
        }
    }
    /**
     * Returns an iterable of items in a selection (including the selection itself) that have formatting model
     * attributes to be removed by the feature.
     */
    *_getFormattingItems(selection) {
        const model = this.editor.model;
        const schema = model.schema;
        const itemHasRemovableFormatting = (item) => {
            return !!first(this._getFormattingAttributes(item));
        };
        // Check formatting on selected items.
        for (const curRange of selection.getRanges()) {
            for (const item of curRange.getItems()) {
                // Ignore last block if range ends at the beginning of it.
                if (schema.isBlock(item) && curRange.end.isTouching(model.createPositionAt(item, 0))) {
                    continue;
                }
                if (itemHasRemovableFormatting(item)) {
                    yield item;
                }
            }
        }
        // Check formatting from selected blocks (to include partly selected blocks).
        for (const block of selection.getSelectedBlocks()) {
            if (itemHasRemovableFormatting(block)) {
                yield block;
            }
        }
        // Finally the selection might be formatted as well, so make sure to check it.
        if (itemHasRemovableFormatting(selection)) {
            yield selection;
        }
    }
    /**
     * Returns an iterable of formatting attributes of a given model item.
     *
     * **Note:** Formatting items have the `isFormatting` property set to `true`.
     *
     * @returns The names of formatting attributes found in a given item.
     */
    *_getFormattingAttributes(item) {
        const schema = this.editor.model.schema;
        for (const [attributeName] of item.getAttributes()) {
            for (const { isFormatting } of this._customAttributesHandlers) {
                if (isFormatting(attributeName, item)) {
                    yield attributeName;
                }
            }
            const attributeProperties = schema.getAttributeProperties(attributeName);
            if (attributeProperties && attributeProperties.isFormatting) {
                yield attributeName;
            }
        }
    }
}
