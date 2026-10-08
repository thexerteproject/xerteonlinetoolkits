/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module html-support/integrations/horizontalline
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { DataFilter } from '../datafilter.js';
import { updateViewAttributes } from '../utils.js';
import { getDescendantElement } from './integrationutils.js';
import { viewToModelBlockAttributeConverter } from '../converters.js';
/**
 * Provides the General HTML Support integration with the {@link module:horizontal-line/horizontalline~HorizontalLine} feature.
 */
export class HorizontalLineElementSupport extends Plugin {
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
        return 'HorizontalLineElementSupport';
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
        if (!editor.plugins.has('HorizontalLineEditing')) {
            return;
        }
        const schema = editor.model.schema;
        const conversion = editor.conversion;
        const dataFilter = editor.plugins.get(DataFilter);
        dataFilter.on('register:hr', (evt, definition) => {
            if (definition.model !== 'horizontalLine') {
                return;
            }
            schema.extend('horizontalLine', {
                allowAttributes: ['htmlHrAttributes']
            });
            conversion.for('upcast').add(viewToModelBlockAttributeConverter(definition, dataFilter));
            conversion.for('downcast').add(modelToViewHorizontalLineAttributeConverter());
            evt.stop();
        });
    }
}
/**
 * A model-to-view conversion helper applying attributes from the
 * {@link module:horizontal-line/horizontalline~HorizontalLine HorizontalLine} feature.
 *
 * @returns Returns a conversion callback.
 */
function modelToViewHorizontalLineAttributeConverter() {
    return (dispatcher) => {
        dispatcher.on('attribute:htmlHrAttributes:horizontalLine', (evt, data, conversionApi) => {
            if (!conversionApi.consumable.test(data.item, evt.name)) {
                return;
            }
            const { attributeOldValue, attributeNewValue } = data;
            const containerElement = conversionApi.mapper.toViewElement(data.item);
            const viewElement = getDescendantElement(conversionApi.writer, containerElement, 'hr');
            if (viewElement) {
                updateViewAttributes(conversionApi.writer, attributeOldValue, attributeNewValue, viewElement);
                conversionApi.consumable.consume(data.item, evt.name);
            }
        }, { priority: 'low' });
    };
}
