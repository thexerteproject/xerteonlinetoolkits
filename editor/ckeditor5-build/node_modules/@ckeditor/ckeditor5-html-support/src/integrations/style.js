/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module html-support/integrations/style
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { createObjectView, modelToViewBlockAttributeConverter, viewToModelBlockAttributeConverter, viewToModelObjectConverter } from '../converters.js';
import { DataFilter } from '../datafilter.js';
/**
 * Provides the General HTML Support for `style` elements.
 */
export class StyleElementSupport extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires() {
        return [DataFilter];
    }
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'StyleElementSupport';
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
        const dataFilter = this.editor.plugins.get(DataFilter);
        dataFilter.on('register:style', (evt, definition) => {
            const editor = this.editor;
            const schema = editor.model.schema;
            const conversion = editor.conversion;
            schema.register('htmlStyle', definition.modelSchema);
            schema.extend('htmlStyle', {
                allowAttributes: ['htmlStyleAttributes', 'htmlContent'],
                isContent: true
            });
            editor.data.registerRawContentMatcher({
                name: 'style'
            });
            conversion.for('upcast').elementToElement({
                view: 'style',
                model: viewToModelObjectConverter(definition)
            });
            conversion.for('upcast').add(viewToModelBlockAttributeConverter(definition, dataFilter));
            conversion.for('downcast').elementToElement({
                model: 'htmlStyle',
                view: (modelElement, { writer }) => {
                    return createObjectView('style', modelElement, writer);
                }
            });
            conversion.for('downcast')
                .add(modelToViewBlockAttributeConverter(definition));
            evt.stop();
        });
    }
}
