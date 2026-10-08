/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin } from 'ckeditor5/src/core.js';
export class AdjacentListsSupport extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'AdjacentListsSupport';
    }
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin() {
        return true;
    }
    /**
     * @inheritDoc
     */
    init() {
        const editor = this.editor;
        const model = editor.model;
        model.schema.register('listSeparator', {
            allowWhere: '$block',
            isBlock: true
        });
        editor.conversion.for('upcast')
            // Add a list separator element between similar list elements on upcast.
            .add(dispatcher => {
            dispatcher.on('element:ol', listSeparatorUpcastConverter());
            dispatcher.on('element:ul', listSeparatorUpcastConverter());
        })
            // View-to-model transformation.
            .elementToElement({
            model: 'listSeparator',
            view: 'ck-list-separator'
        });
        // The list separator element should exist in the view, but should be invisible (hidden).
        editor.conversion.for('editingDowncast').elementToElement({
            model: 'listSeparator',
            view: {
                name: 'div',
                classes: ['ck-list-separator', 'ck-hidden']
            }
        });
        // The list separator element should not exist in the output data.
        editor.conversion.for('dataDowncast').elementToElement({
            model: 'listSeparator',
            view: (modelElement, conversionApi) => {
                const viewElement = conversionApi.writer.createContainerElement('ck-list-separator');
                conversionApi.writer.setCustomProperty('dataPipeline:transparentRendering', true, viewElement);
                viewElement.getFillerOffset = () => null;
                return viewElement;
            }
        });
    }
}
/**
 * Inserts a list separator element between two lists of the same type (`ol` + `ol` or `ul` + `ul`).
 */
function listSeparatorUpcastConverter() {
    return (evt, data, conversionApi) => {
        const element = data.viewItem;
        const nextSibling = element.nextSibling;
        if (!nextSibling) {
            return;
        }
        if (element.name !== nextSibling.name) {
            return;
        }
        if (!data.modelRange) {
            Object.assign(data, conversionApi.convertChildren(data.viewItem, data.modelCursor));
        }
        const writer = conversionApi.writer;
        const modelElement = writer.createElement('listSeparator');
        // Try to insert a list separator element on the current model cursor position.
        if (!conversionApi.safeInsert(modelElement, data.modelCursor)) {
            return;
        }
        const parts = conversionApi.getSplitParts(modelElement);
        // Extend the model range with the range of the created list separator element.
        data.modelRange = writer.createRange(data.modelRange.start, writer.createPositionAfter(parts[parts.length - 1]));
        conversionApi.updateConversionResult(modelElement, data);
    };
}
