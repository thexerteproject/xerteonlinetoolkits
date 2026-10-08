/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module html-support/integrations/mediaembed
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { DataFilter } from '../datafilter.js';
import { DataSchema } from '../dataschema.js';
import { updateViewAttributes, getHtmlAttributeName } from '../utils.js';
import { getDescendantElement } from './integrationutils.js';
/**
 * Provides the General HTML Support integration with {@link module:media-embed/mediaembed~MediaEmbed Media Embed} feature.
 */
export class MediaEmbedElementSupport extends Plugin {
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
        return 'MediaEmbedElementSupport';
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
        // Stop here if MediaEmbed plugin is not provided or the integrator wants to output markup with previews as
        // we do not support filtering previews.
        if (!editor.plugins.has('MediaEmbed') || editor.config.get('mediaEmbed.previewsInData')) {
            return;
        }
        const schema = editor.model.schema;
        const conversion = editor.conversion;
        const dataFilter = this.editor.plugins.get(DataFilter);
        const dataSchema = this.editor.plugins.get(DataSchema);
        const mediaElementName = editor.config.get('mediaEmbed.elementName');
        // Overwrite GHS schema definition for a given elementName.
        dataSchema.registerBlockElement({
            model: 'media',
            view: mediaElementName
        });
        dataFilter.on('register:figure', () => {
            conversion.for('upcast').add(viewToModelFigureAttributesConverter(dataFilter));
        });
        dataFilter.on(`register:${mediaElementName}`, (evt, definition) => {
            if (definition.model !== 'media') {
                return;
            }
            schema.extend('media', {
                allowAttributes: [
                    getHtmlAttributeName(mediaElementName),
                    'htmlFigureAttributes'
                ]
            });
            conversion.for('upcast').add(viewToModelMediaAttributesConverter(dataFilter, mediaElementName));
            conversion.for('dataDowncast').add(modelToViewMediaAttributeConverter(mediaElementName));
            evt.stop();
        });
    }
}
function viewToModelMediaAttributesConverter(dataFilter, mediaElementName) {
    const upcastMedia = (evt, data, conversionApi) => {
        const viewMediaElement = data.viewItem;
        preserveElementAttributes(viewMediaElement, getHtmlAttributeName(mediaElementName));
        function preserveElementAttributes(viewElement, attributeName) {
            const viewAttributes = dataFilter.processViewAttributes(viewElement, conversionApi);
            if (viewAttributes) {
                conversionApi.writer.setAttribute(attributeName, viewAttributes, data.modelRange);
            }
        }
    };
    return (dispatcher) => {
        dispatcher.on(`element:${mediaElementName}`, upcastMedia, { priority: 'low' });
    };
}
/**
 * View-to-model conversion helper preserving allowed attributes on {@link module:media-embed/mediaembed~MediaEmbed MediaEmbed}
 * feature model element from figure view element.
 *
 * @returns Returns a conversion callback.
 */
function viewToModelFigureAttributesConverter(dataFilter) {
    return (dispatcher) => {
        dispatcher.on('element:figure', (evt, data, conversionApi) => {
            const viewFigureElement = data.viewItem;
            if (!data.modelRange || !viewFigureElement.hasClass('media')) {
                return;
            }
            const viewAttributes = dataFilter.processViewAttributes(viewFigureElement, conversionApi);
            if (viewAttributes) {
                conversionApi.writer.setAttribute('htmlFigureAttributes', viewAttributes, data.modelRange);
            }
        }, { priority: 'low' });
    };
}
function modelToViewMediaAttributeConverter(mediaElementName) {
    return (dispatcher) => {
        addAttributeConversionDispatcherHandler(mediaElementName, getHtmlAttributeName(mediaElementName));
        addAttributeConversionDispatcherHandler('figure', 'htmlFigureAttributes');
        function addAttributeConversionDispatcherHandler(elementName, attributeName) {
            dispatcher.on(`attribute:${attributeName}:media`, (evt, data, conversionApi) => {
                if (!conversionApi.consumable.consume(data.item, evt.name)) {
                    return;
                }
                const { attributeOldValue, attributeNewValue } = data;
                const containerElement = conversionApi.mapper.toViewElement(data.item);
                const viewElement = getDescendantElement(conversionApi.writer, containerElement, elementName);
                updateViewAttributes(conversionApi.writer, attributeOldValue, attributeNewValue, viewElement);
            });
        }
    };
}
