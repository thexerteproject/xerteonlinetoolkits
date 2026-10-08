/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { toArray, priorities, CKEditorError, isValidAttributeName, uid, logWarning, global } from '@ckeditor/ckeditor5-utils/dist/index.js';
import { Matcher, StylesMap, ViewUpcastWriter, HtmlDataProcessor } from '@ckeditor/ckeditor5-engine/dist/index.js';
import { toWidget, Widget } from '@ckeditor/ckeditor5-widget/dist/index.js';
import { cloneDeep, startCase, mergeWith, isPlainObject, isEqual } from 'es-toolkit/compat';
import { Enter } from '@ckeditor/ckeditor5-enter/dist/index.js';

/**
* Helper function for the downcast converter. Updates attributes on the given view element.
*
* @param writer The view writer.
* @param oldViewAttributes The previous GHS attribute value.
* @param newViewAttributes The current GHS attribute value.
* @param viewElement The view element to update.
* @internal
*/ function updateViewAttributes(writer, oldViewAttributes, newViewAttributes, viewElement) {
    if (oldViewAttributes) {
        removeViewAttributes(writer, oldViewAttributes, viewElement);
    }
    if (newViewAttributes) {
        setViewAttributes(writer, newViewAttributes, viewElement);
    }
}
/**
 * Helper function for the downcast converter. Sets attributes on the given view element.
 *
 * @param writer The view writer.
 * @param viewAttributes The GHS attribute value.
 * @param viewElement The view element to update.
 * @internal
 */ function setViewAttributes(writer, viewAttributes, viewElement) {
    if (viewAttributes.attributes) {
        for (const [key, value] of Object.entries(viewAttributes.attributes)){
            writer.setAttribute(key, value, viewElement);
        }
    }
    if (viewAttributes.styles) {
        writer.setStyle(viewAttributes.styles, viewElement);
    }
    if (viewAttributes.classes) {
        writer.addClass(viewAttributes.classes, viewElement);
    }
}
/**
 * Helper function for the downcast converter. Removes attributes on the given view element.
 *
 * @param writer The view writer.
 * @param viewAttributes The GHS attribute value.
 * @param viewElement The view element to update.
 * @internal
 */ function removeViewAttributes(writer, viewAttributes, viewElement) {
    if (viewAttributes.attributes) {
        for (const [key] of Object.entries(viewAttributes.attributes)){
            writer.removeAttribute(key, viewElement);
        }
    }
    if (viewAttributes.styles) {
        for (const style of Object.keys(viewAttributes.styles)){
            writer.removeStyle(style, viewElement);
        }
    }
    if (viewAttributes.classes) {
        writer.removeClass(viewAttributes.classes, viewElement);
    }
}
/**
* Merges view element attribute objects.
*
* @internal
*/ function mergeViewElementAttributes(target, source) {
    const result = cloneDeep(target);
    let key = 'attributes';
    for(key in source){
        // Merge classes.
        if (key == 'classes') {
            result[key] = Array.from(new Set([
                ...target[key] || [],
                ...source[key]
            ]));
        } else {
            result[key] = {
                ...target[key],
                ...source[key]
            };
        }
    }
    return result;
}
function modifyGhsAttribute(writer, item, ghsAttributeName, subject, callback) {
    const oldValue = item.getAttribute(ghsAttributeName);
    const newValue = {};
    for (const kind of [
        'attributes',
        'styles',
        'classes'
    ]){
        // Properties other than `subject` should be assigned from `oldValue`.
        if (kind != subject) {
            if (oldValue && oldValue[kind]) {
                newValue[kind] = oldValue[kind];
            }
            continue;
        }
        // `callback` should be applied on property [`subject`].
        if (subject == 'classes') {
            const values = new Set(oldValue && oldValue.classes || []);
            callback(values);
            if (values.size) {
                newValue[kind] = Array.from(values);
            }
            continue;
        }
        const values = new Map(Object.entries(oldValue && oldValue[kind] || {}));
        callback(values);
        if (values.size) {
            newValue[kind] = Object.fromEntries(values);
        }
    }
    if (Object.keys(newValue).length) {
        if (item.is('documentSelection')) {
            writer.setSelectionAttribute(ghsAttributeName, newValue);
        } else {
            writer.setAttribute(ghsAttributeName, newValue, item);
        }
    } else if (oldValue) {
        if (item.is('documentSelection')) {
            writer.removeSelectionAttribute(ghsAttributeName);
        } else {
            writer.removeAttribute(ghsAttributeName, item);
        }
    }
}
/**
 * Strips the `styles`, and `classes` keys from the GHS attribute value on the given item.
 *
 * @internal
 */ function removeFormatting(ghsAttributeName, itemRange, writer) {
    for (const item of itemRange.getItems({
        shallow: true
    })){
        const value = item.getAttribute(ghsAttributeName);
        // Copy only attributes to the new attribute value.
        if (value && value.attributes && Object.keys(value.attributes).length) {
            // But reset the GHS attribute only when there is anything more than just attributes.
            if (Object.keys(value).length > 1) {
                writer.setAttribute(ghsAttributeName, {
                    attributes: value.attributes
                }, item);
            }
        } else {
            // There are no attributes, so remove the GHS attribute completely.
            writer.removeAttribute(ghsAttributeName, item);
        }
    }
}
/**
 * Transforms passed string to PascalCase format. Examples:
 * * `div` => `Div`
 * * `h1` => `H1`
 * * `table` => `Table`
 *
 * @internal
 */ function toPascalCase(data) {
    return startCase(data).replace(/ /g, '');
}
/**
 * Returns the attribute name of the model element that holds raw HTML attributes.
 *
 * @internal
 */ function getHtmlAttributeName(viewElementName) {
    return `html${toPascalCase(viewElementName)}Attributes`;
}

/**
 * View-to-model conversion helper for object elements.
 *
 * Preserves object element content in `htmlContent` attribute.
 *
 * @returns Returns a conversion callback.
 * @internal
*/ function viewToModelObjectConverter({ model: modelName }) {
    return (viewElement, conversionApi)=>{
        // Let's keep element HTML and its attributes, so we can rebuild element in downcast conversions.
        return conversionApi.writer.createElement(modelName, {
            htmlContent: viewElement.getCustomProperty('$rawContent')
        });
    };
}
/**
 * Conversion helper converting an object element to an HTML object widget.
 *
 * @returns Returns a conversion callback.
 * @internal
*/ function toObjectWidgetConverter(editor, { view: viewName, isInline }) {
    const t = editor.t;
    return (modelElement, { writer })=>{
        const widgetLabel = t('HTML object');
        const viewElement = createObjectView(viewName, modelElement, writer);
        const viewAttributes = modelElement.getAttribute(getHtmlAttributeName(viewName));
        writer.addClass('html-object-embed__content', viewElement);
        if (viewAttributes) {
            setViewAttributes(writer, viewAttributes, viewElement);
        }
        // Widget cannot be a raw element because the widget system would not be able
        // to add its UI to it. Thus, we need separate view container.
        const viewContainer = writer.createContainerElement(isInline ? 'span' : 'div', {
            class: 'html-object-embed',
            'data-html-object-embed-label': widgetLabel
        }, viewElement);
        return toWidget(viewContainer, writer, {
            label: widgetLabel
        });
    };
}
/**
* Creates object view element from the given model element.
*
* @internal
*/ function createObjectView(viewName, modelElement, writer) {
    return writer.createRawElement(viewName, null, (domElement, domConverter)=>{
        domConverter.setContentOf(domElement, modelElement.getAttribute('htmlContent'));
    });
}
/**
 * View-to-attribute conversion helper preserving inline element attributes on `$text`.
 *
 * @returns Returns a conversion callback.
 * @internal
*/ function viewToAttributeInlineConverter({ view: viewName, model: attributeKey, allowEmpty }, dataFilter) {
    return (dispatcher)=>{
        dispatcher.on(`element:${viewName}`, (evt, data, conversionApi)=>{
            let viewAttributes = dataFilter.processViewAttributes(data.viewItem, conversionApi);
            // Do not apply the attribute if the element itself is already consumed and there are no view attributes to store.
            if (!viewAttributes && !conversionApi.consumable.test(data.viewItem, {
                name: true
            })) {
                return;
            }
            // Otherwise, we might need to convert it to an empty object just to preserve element itself,
            // for example `<cite>` => <$text htmlCite="{}">.
            viewAttributes = viewAttributes || {};
            // Consume the element itself if it wasn't consumed by any other converter.
            conversionApi.consumable.consume(data.viewItem, {
                name: true
            });
            // Since we are converting to attribute we need a range on which we will set the attribute.
            // If the range is not created yet, we will create it.
            if (!data.modelRange) {
                data = Object.assign(data, conversionApi.convertChildren(data.viewItem, data.modelCursor));
            }
            // Convert empty inline element if allowed and has any attributes.
            if (allowEmpty && data.modelRange.isCollapsed && Object.keys(viewAttributes).length) {
                const modelElement = conversionApi.writer.createElement('htmlEmptyElement');
                if (!conversionApi.safeInsert(modelElement, data.modelCursor)) {
                    return;
                }
                const parts = conversionApi.getSplitParts(modelElement);
                data.modelRange = conversionApi.writer.createRange(data.modelRange.start, conversionApi.writer.createPositionAfter(parts[parts.length - 1]));
                conversionApi.updateConversionResult(modelElement, data);
                setAttributeOnItem(modelElement, viewAttributes, conversionApi);
                return;
            }
            // Set attribute on each item in range according to the schema.
            for (const node of data.modelRange.getItems()){
                setAttributeOnItem(node, viewAttributes, conversionApi);
            }
        }, {
            priority: 'low'
        });
    };
    function setAttributeOnItem(node, viewAttributes, conversionApi) {
        if (conversionApi.schema.checkAttribute(node, attributeKey)) {
            // Node's children are converted recursively, so node can already include model attribute.
            // We want to extend it, not replace.
            const nodeAttributes = node.getAttribute(attributeKey);
            const attributesToAdd = mergeViewElementAttributes(viewAttributes, nodeAttributes || {});
            conversionApi.writer.setAttribute(attributeKey, attributesToAdd, node);
        }
    }
}
/**
 * Conversion helper converting an empty inline model element to an HTML element or widget.
 *
 * @internal
 */ function emptyInlineModelElementToViewConverter({ model: attributeKey, view: viewName }, asWidget) {
    return (item, { writer, consumable })=>{
        if (!item.hasAttribute(attributeKey)) {
            return null;
        }
        const viewElement = writer.createContainerElement(viewName);
        const attributeValue = item.getAttribute(attributeKey);
        consumable.consume(item, `attribute:${attributeKey}`);
        setViewAttributes(writer, attributeValue, viewElement);
        viewElement.getFillerOffset = ()=>null;
        return asWidget ? toWidget(viewElement, writer) : viewElement;
    };
}
/**
 * Attribute-to-view conversion helper applying attributes to view element preserved on `$text`.
 *
 * @returns Returns a conversion callback.
 * @internal
*/ function attributeToViewInlineConverter({ priority, view: viewName }) {
    return (attributeValue, conversionApi)=>{
        if (!attributeValue) {
            return;
        }
        const { writer } = conversionApi;
        const viewElement = writer.createAttributeElement(viewName, null, {
            priority
        });
        setViewAttributes(writer, attributeValue, viewElement);
        return viewElement;
    };
}
/**
 * View-to-model conversion helper preserving allowed attributes on block element.
 *
 * All matched attributes will be preserved on `html*Attributes` attribute.
 *
 * @returns Returns a conversion callback.
 * @internal
*/ function viewToModelBlockAttributeConverter({ view: viewName }, dataFilter) {
    return (dispatcher)=>{
        dispatcher.on(`element:${viewName}`, (evt, data, conversionApi)=>{
            // Converting an attribute of an element that has not been converted to anything does not make sense
            // because there will be nowhere to set that attribute on. At this stage, the element should've already
            // been converted. A collapsed range can show up in to-do lists (<input>) or complex widgets (e.g. table).
            // (https://github.com/ckeditor/ckeditor5/issues/11000).
            if (!data.modelRange || data.modelRange.isCollapsed) {
                return;
            }
            const viewAttributes = dataFilter.processViewAttributes(data.viewItem, conversionApi);
            if (!viewAttributes) {
                return;
            }
            conversionApi.writer.setAttribute(getHtmlAttributeName(data.viewItem.name), viewAttributes, data.modelRange);
        }, {
            priority: 'low'
        });
    };
}
/**
 * Model-to-view conversion helper applying attributes preserved in `html*Attributes` attribute
 * for block elements.
 *
 * @returns Returns a conversion callback.
 * @internal
*/ function modelToViewBlockAttributeConverter({ view: viewName, model: modelName }) {
    return (dispatcher)=>{
        dispatcher.on(`attribute:${getHtmlAttributeName(viewName)}:${modelName}`, (evt, data, conversionApi)=>{
            if (!conversionApi.consumable.consume(data.item, evt.name)) {
                return;
            }
            const { attributeOldValue, attributeNewValue } = data;
            const viewWriter = conversionApi.writer;
            const viewElement = conversionApi.mapper.toViewElement(data.item);
            updateViewAttributes(viewWriter, attributeOldValue, attributeNewValue, viewElement);
        });
    };
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */ /**
 * @module html-support/schemadefinitions
 */ /**
 * Skipped elements due to HTML deprecation:
 * * noframes (not sure if we should provide support for this element. CKE4 is not supporting frameset and frame,
 *   but it will unpack <frameset><noframes>foobar</noframes></frameset> to <noframes>foobar</noframes>, so there
 *   may be some content loss. Although using noframes as a standalone element seems invalid)
 * * keygen (this one is also empty)
 * * applet (support is limited mostly to old IE)
 * * basefont (this one is also empty)
 * * isindex (basically no support for modern browsers at all)
 *
 * Skipped elements due to lack empty element support:
 * * hr
 * * area
 * * br
 * * command
 * * map
 * * wbr
 * * colgroup -> col
 *
 * Skipped elements due to complexity:
 * * datalist with option elements used as a data source for input[list] element
 *
 * Skipped elements as they are handled as an object content:
 * * track
 * * source
 * * option
 * * param
 * * optgroup
 *
 * Skipped full page HTML elements:
 * * body
 * * html
 * * title
 * * head
 * * meta
 * * link
 * * etc...
 *
 * Skipped hidden elements:
 * noscript
 *
 * When adding elements to this list, update the feature guide listing, too.
 *
 * @internal
 */ const defaultConfig = {
    block: [
        // Existing features.
        {
            model: 'codeBlock',
            view: 'pre'
        },
        {
            model: 'paragraph',
            view: 'p'
        },
        {
            model: 'blockQuote',
            view: 'blockquote'
        },
        {
            model: 'listItem',
            view: 'li'
        },
        {
            model: 'pageBreak',
            view: 'div'
        },
        {
            model: 'rawHtml',
            view: 'div'
        },
        {
            model: 'table',
            view: 'table'
        },
        {
            model: 'tableRow',
            view: 'tr'
        },
        {
            model: 'tableCell',
            view: 'td'
        },
        {
            model: 'tableCell',
            view: 'th'
        },
        {
            model: 'tableColumnGroup',
            view: 'colgroup'
        },
        {
            model: 'tableColumn',
            view: 'col'
        },
        {
            model: 'caption',
            view: 'caption'
        },
        {
            model: 'caption',
            view: 'figcaption'
        },
        {
            model: 'imageBlock',
            view: 'img'
        },
        {
            model: 'imageInline',
            view: 'img'
        },
        {
            model: 'horizontalLine',
            view: 'hr'
        },
        // Compatibility features.
        {
            model: 'htmlP',
            view: 'p',
            modelSchema: {
                inheritAllFrom: '$block'
            }
        },
        {
            model: 'htmlBlockquote',
            view: 'blockquote',
            modelSchema: {
                inheritAllFrom: '$container'
            }
        },
        {
            model: 'htmlTable',
            view: 'table',
            modelSchema: {
                allowWhere: '$block',
                isBlock: true
            }
        },
        {
            model: 'htmlTbody',
            view: 'tbody',
            modelSchema: {
                allowIn: 'htmlTable',
                isBlock: false
            }
        },
        {
            model: 'htmlThead',
            view: 'thead',
            modelSchema: {
                allowIn: 'htmlTable',
                isBlock: false
            }
        },
        {
            model: 'htmlTfoot',
            view: 'tfoot',
            modelSchema: {
                allowIn: 'htmlTable',
                isBlock: false
            }
        },
        {
            model: 'htmlCaption',
            view: 'caption',
            modelSchema: {
                allowIn: 'htmlTable',
                allowChildren: '$text',
                isBlock: false
            }
        },
        {
            model: 'htmlColgroup',
            view: 'colgroup',
            modelSchema: {
                allowIn: 'htmlTable',
                allowChildren: 'col',
                isBlock: false
            }
        },
        {
            model: 'htmlCol',
            view: 'col',
            modelSchema: {
                allowIn: 'htmlColgroup',
                isBlock: false
            }
        },
        {
            model: 'htmlTr',
            view: 'tr',
            modelSchema: {
                allowIn: [
                    'htmlTable',
                    'htmlThead',
                    'htmlTbody'
                ],
                isLimit: true
            }
        },
        // TODO can also include text.
        {
            model: 'htmlTd',
            view: 'td',
            modelSchema: {
                allowIn: 'htmlTr',
                allowContentOf: '$container',
                isLimit: true,
                isBlock: false
            }
        },
        // TODO can also include text.
        {
            model: 'htmlTh',
            view: 'th',
            modelSchema: {
                allowIn: 'htmlTr',
                allowContentOf: '$container',
                isLimit: true,
                isBlock: false
            }
        },
        // TODO can also include text.
        {
            model: 'htmlFigure',
            view: 'figure',
            modelSchema: {
                inheritAllFrom: '$container',
                isBlock: false
            }
        },
        // TODO can also include other block elements.
        {
            model: 'htmlFigcaption',
            view: 'figcaption',
            modelSchema: {
                allowIn: 'htmlFigure',
                allowChildren: '$text',
                isBlock: false
            }
        },
        // TODO can also include text.
        {
            model: 'htmlAddress',
            view: 'address',
            modelSchema: {
                inheritAllFrom: '$container',
                isBlock: false
            }
        },
        // TODO can also include text.
        {
            model: 'htmlAside',
            view: 'aside',
            modelSchema: {
                inheritAllFrom: '$container',
                isBlock: false
            }
        },
        // TODO can also include text.
        {
            model: 'htmlMain',
            view: 'main',
            modelSchema: {
                inheritAllFrom: '$container',
                isBlock: false
            }
        },
        // TODO can also include text.
        {
            model: 'htmlDetails',
            view: 'details',
            modelSchema: {
                inheritAllFrom: '$container',
                isBlock: false
            }
        },
        {
            model: 'htmlSummary',
            view: 'summary',
            modelSchema: {
                allowChildren: [
                    'htmlH1',
                    'htmlH2',
                    'htmlH3',
                    'htmlH4',
                    'htmlH5',
                    'htmlH6',
                    '$text'
                ],
                allowIn: 'htmlDetails',
                isBlock: false
            }
        },
        {
            model: 'htmlDiv',
            view: 'div',
            paragraphLikeModel: 'htmlDivParagraph',
            modelSchema: {
                inheritAllFrom: '$container'
            }
        },
        // TODO can also include text.
        {
            model: 'htmlFieldset',
            view: 'fieldset',
            modelSchema: {
                inheritAllFrom: '$container',
                isBlock: false
            }
        },
        // TODO can also include h1-h6.
        {
            model: 'htmlLegend',
            view: 'legend',
            modelSchema: {
                allowIn: 'htmlFieldset',
                allowChildren: '$text'
            }
        },
        // TODO can also include text.
        {
            model: 'htmlHeader',
            view: 'header',
            modelSchema: {
                inheritAllFrom: '$container',
                isBlock: false
            }
        },
        // TODO can also include text.
        {
            model: 'htmlFooter',
            view: 'footer',
            modelSchema: {
                inheritAllFrom: '$container',
                isBlock: false
            }
        },
        // TODO can also include text.
        {
            model: 'htmlForm',
            view: 'form',
            modelSchema: {
                inheritAllFrom: '$container',
                isBlock: true
            }
        },
        {
            model: 'htmlHgroup',
            view: 'hgroup',
            modelSchema: {
                allowIn: [
                    '$root',
                    '$container'
                ],
                allowChildren: [
                    'paragraph',
                    'htmlP',
                    'htmlH1',
                    'htmlH2',
                    'htmlH3',
                    'htmlH4',
                    'htmlH5',
                    'htmlH6'
                ],
                isBlock: false
            }
        },
        {
            model: 'htmlH1',
            view: 'h1',
            modelSchema: {
                inheritAllFrom: '$block'
            }
        },
        {
            model: 'htmlH2',
            view: 'h2',
            modelSchema: {
                inheritAllFrom: '$block'
            }
        },
        {
            model: 'htmlH3',
            view: 'h3',
            modelSchema: {
                inheritAllFrom: '$block'
            }
        },
        {
            model: 'htmlH4',
            view: 'h4',
            modelSchema: {
                inheritAllFrom: '$block'
            }
        },
        {
            model: 'htmlH5',
            view: 'h5',
            modelSchema: {
                inheritAllFrom: '$block'
            }
        },
        {
            model: 'htmlH6',
            view: 'h6',
            modelSchema: {
                inheritAllFrom: '$block'
            }
        },
        {
            model: '$htmlList',
            modelSchema: {
                allowWhere: '$container',
                allowChildren: [
                    '$htmlList',
                    'htmlLi'
                ],
                isBlock: false
            }
        },
        {
            model: 'htmlDir',
            view: 'dir',
            modelSchema: {
                inheritAllFrom: '$htmlList'
            }
        },
        {
            model: 'htmlMenu',
            view: 'menu',
            modelSchema: {
                inheritAllFrom: '$htmlList'
            }
        },
        {
            model: 'htmlUl',
            view: 'ul',
            modelSchema: {
                inheritAllFrom: '$htmlList'
            }
        },
        {
            model: 'htmlOl',
            view: 'ol',
            modelSchema: {
                inheritAllFrom: '$htmlList'
            }
        },
        // TODO can also include other block elements.
        {
            model: 'htmlLi',
            view: 'li',
            modelSchema: {
                allowIn: '$htmlList',
                allowChildren: '$text',
                isBlock: false
            }
        },
        {
            model: 'htmlPre',
            view: 'pre',
            modelSchema: {
                inheritAllFrom: '$block'
            }
        },
        {
            model: 'htmlArticle',
            view: 'article',
            modelSchema: {
                inheritAllFrom: '$container',
                isBlock: false
            }
        },
        {
            model: 'htmlSection',
            view: 'section',
            modelSchema: {
                inheritAllFrom: '$container',
                isBlock: false
            }
        },
        // TODO can also include text.
        {
            model: 'htmlNav',
            view: 'nav',
            modelSchema: {
                inheritAllFrom: '$container',
                isBlock: false
            }
        },
        {
            model: 'htmlDl',
            view: 'dl',
            modelSchema: {
                allowWhere: '$container',
                allowChildren: [
                    'htmlDt',
                    'htmlDd',
                    'htmlDiv'
                ],
                isBlock: false
            }
        },
        {
            model: 'htmlDt',
            view: 'dt',
            modelSchema: {
                allowChildren: '$block',
                allowIn: 'htmlDiv',
                isBlock: false
            }
        },
        {
            model: 'htmlDd',
            view: 'dd',
            modelSchema: {
                allowChildren: '$block',
                allowIn: 'htmlDiv',
                isBlock: false
            }
        },
        {
            model: 'htmlCenter',
            view: 'center',
            modelSchema: {
                inheritAllFrom: '$container',
                isBlock: false
            }
        },
        {
            model: 'htmlHr',
            view: 'hr',
            isEmpty: true,
            modelSchema: {
                inheritAllFrom: '$blockObject'
            }
        }
    ],
    inline: [
        // Existing features (attribute set on an existing model element).
        {
            model: 'htmlLiAttributes',
            view: 'li',
            appliesToBlock: true,
            coupledAttribute: 'listItemId'
        },
        {
            model: 'htmlOlAttributes',
            view: 'ol',
            appliesToBlock: true,
            coupledAttribute: 'listItemId'
        },
        {
            model: 'htmlUlAttributes',
            view: 'ul',
            appliesToBlock: true,
            coupledAttribute: 'listItemId'
        },
        {
            model: 'htmlFigureAttributes',
            view: 'figure',
            appliesToBlock: 'table'
        },
        {
            model: 'htmlTheadAttributes',
            view: 'thead',
            appliesToBlock: 'table'
        },
        {
            model: 'htmlTbodyAttributes',
            view: 'tbody',
            appliesToBlock: 'table'
        },
        {
            model: 'htmlFigureAttributes',
            view: 'figure',
            appliesToBlock: 'imageBlock'
        },
        // Compatibility features.
        {
            model: 'htmlAcronym',
            view: 'acronym',
            attributeProperties: {
                copyOnEnter: true,
                isFormatting: true
            }
        },
        {
            model: 'htmlTt',
            view: 'tt',
            attributeProperties: {
                copyOnEnter: true,
                isFormatting: true
            }
        },
        {
            model: 'htmlFont',
            view: 'font',
            attributeProperties: {
                copyOnEnter: true,
                isFormatting: true
            }
        },
        {
            model: 'htmlTime',
            view: 'time',
            attributeProperties: {
                copyOnEnter: true,
                isFormatting: true
            }
        },
        {
            model: 'htmlVar',
            view: 'var',
            attributeProperties: {
                copyOnEnter: true,
                isFormatting: true
            }
        },
        {
            model: 'htmlBig',
            view: 'big',
            attributeProperties: {
                copyOnEnter: true,
                isFormatting: true
            }
        },
        {
            model: 'htmlSmall',
            view: 'small',
            attributeProperties: {
                copyOnEnter: true,
                isFormatting: true
            }
        },
        {
            model: 'htmlSamp',
            view: 'samp',
            attributeProperties: {
                copyOnEnter: true,
                isFormatting: true
            }
        },
        {
            model: 'htmlQ',
            view: 'q',
            attributeProperties: {
                copyOnEnter: true,
                isFormatting: true
            }
        },
        {
            model: 'htmlOutput',
            view: 'output',
            attributeProperties: {
                copyOnEnter: true,
                isFormatting: true
            }
        },
        {
            model: 'htmlKbd',
            view: 'kbd',
            attributeProperties: {
                copyOnEnter: true,
                isFormatting: true
            }
        },
        {
            model: 'htmlBdi',
            view: 'bdi',
            attributeProperties: {
                copyOnEnter: true,
                isFormatting: true
            }
        },
        {
            model: 'htmlBdo',
            view: 'bdo',
            attributeProperties: {
                copyOnEnter: true,
                isFormatting: true
            }
        },
        {
            model: 'htmlAbbr',
            view: 'abbr',
            attributeProperties: {
                copyOnEnter: true,
                isFormatting: true
            }
        },
        {
            model: 'htmlA',
            view: 'a',
            priority: 5,
            coupledAttribute: 'linkHref',
            attributeProperties: {
                isFormatting: true
            }
        },
        {
            model: 'htmlStrong',
            view: 'strong',
            coupledAttribute: 'bold',
            attributeProperties: {
                copyOnEnter: true,
                isFormatting: true
            }
        },
        {
            model: 'htmlB',
            view: 'b',
            coupledAttribute: 'bold',
            attributeProperties: {
                copyOnEnter: true,
                isFormatting: true
            }
        },
        {
            model: 'htmlI',
            view: 'i',
            coupledAttribute: 'italic',
            attributeProperties: {
                copyOnEnter: true,
                isFormatting: true
            }
        },
        {
            model: 'htmlEm',
            view: 'em',
            coupledAttribute: 'italic',
            attributeProperties: {
                copyOnEnter: true,
                isFormatting: true
            }
        },
        {
            model: 'htmlS',
            view: 's',
            coupledAttribute: 'strikethrough',
            attributeProperties: {
                copyOnEnter: true,
                isFormatting: true
            }
        },
        // TODO According to HTML-spec can behave as div-like element, although CKE4 only handles it as an inline element.
        {
            model: 'htmlDel',
            view: 'del',
            coupledAttribute: 'strikethrough',
            attributeProperties: {
                copyOnEnter: true,
                isFormatting: true
            }
        },
        // TODO According to HTML-spec can behave as div-like element, although CKE4 only handles it as an inline element.
        {
            model: 'htmlIns',
            view: 'ins',
            attributeProperties: {
                copyOnEnter: true,
                isFormatting: true
            }
        },
        {
            model: 'htmlU',
            view: 'u',
            coupledAttribute: 'underline',
            attributeProperties: {
                copyOnEnter: true,
                isFormatting: true
            }
        },
        {
            model: 'htmlSub',
            view: 'sub',
            coupledAttribute: 'subscript',
            attributeProperties: {
                copyOnEnter: true,
                isFormatting: true
            }
        },
        {
            model: 'htmlSup',
            view: 'sup',
            coupledAttribute: 'superscript',
            attributeProperties: {
                copyOnEnter: true,
                isFormatting: true
            }
        },
        {
            model: 'htmlCode',
            view: 'code',
            coupledAttribute: 'code',
            attributeProperties: {
                copyOnEnter: true,
                isFormatting: true
            }
        },
        {
            model: 'htmlMark',
            view: 'mark',
            attributeProperties: {
                copyOnEnter: true,
                isFormatting: true
            }
        },
        {
            model: 'htmlSpan',
            view: 'span',
            attributeProperties: {
                copyOnEnter: true,
                isFormatting: true
            }
        },
        {
            model: 'htmlCite',
            view: 'cite',
            attributeProperties: {
                copyOnEnter: true,
                isFormatting: true
            }
        },
        {
            model: 'htmlLabel',
            view: 'label',
            attributeProperties: {
                copyOnEnter: true,
                isFormatting: true
            }
        },
        {
            model: 'htmlDfn',
            view: 'dfn',
            attributeProperties: {
                copyOnEnter: true,
                isFormatting: true
            }
        },
        // Objects.
        {
            model: 'htmlObject',
            view: 'object',
            isObject: true,
            modelSchema: {
                inheritAllFrom: '$inlineObject'
            }
        },
        {
            model: 'htmlIframe',
            view: 'iframe',
            isObject: true,
            modelSchema: {
                inheritAllFrom: '$inlineObject'
            }
        },
        {
            model: 'htmlInput',
            view: 'input',
            isObject: true,
            modelSchema: {
                inheritAllFrom: '$inlineObject'
            }
        },
        {
            model: 'htmlButton',
            view: 'button',
            isObject: true,
            modelSchema: {
                inheritAllFrom: '$inlineObject'
            }
        },
        {
            model: 'htmlTextarea',
            view: 'textarea',
            isObject: true,
            modelSchema: {
                inheritAllFrom: '$inlineObject'
            }
        },
        {
            model: 'htmlSelect',
            view: 'select',
            isObject: true,
            modelSchema: {
                inheritAllFrom: '$inlineObject'
            }
        },
        {
            model: 'htmlVideo',
            view: 'video',
            isObject: true,
            modelSchema: {
                inheritAllFrom: '$inlineObject'
            }
        },
        {
            model: 'htmlEmbed',
            view: 'embed',
            isObject: true,
            modelSchema: {
                inheritAllFrom: '$inlineObject'
            }
        },
        {
            model: 'htmlOembed',
            view: 'oembed',
            isObject: true,
            modelSchema: {
                inheritAllFrom: '$inlineObject'
            }
        },
        {
            model: 'htmlAudio',
            view: 'audio',
            isObject: true,
            modelSchema: {
                inheritAllFrom: '$inlineObject'
            }
        },
        {
            model: 'htmlImg',
            view: 'img',
            isObject: true,
            modelSchema: {
                inheritAllFrom: '$inlineObject'
            }
        },
        {
            model: 'htmlCanvas',
            view: 'canvas',
            isObject: true,
            modelSchema: {
                inheritAllFrom: '$inlineObject'
            }
        },
        // TODO it could be probably represented as non-object element, although it has graphical representation,
        // so probably makes more sense to keep it as an object.
        {
            model: 'htmlMeter',
            view: 'meter',
            isObject: true,
            modelSchema: {
                inheritAllFrom: '$inlineObject'
            }
        },
        // TODO it could be probably represented as non-object element, although it has graphical representation,
        // so probably makes more sense to keep it as an object.
        {
            model: 'htmlProgress',
            view: 'progress',
            isObject: true,
            modelSchema: {
                inheritAllFrom: '$inlineObject'
            }
        },
        {
            model: 'htmlScript',
            view: 'script',
            modelSchema: {
                allowWhere: [
                    '$text',
                    '$block'
                ],
                isInline: true
            }
        },
        {
            model: 'htmlStyle',
            view: 'style',
            modelSchema: {
                allowWhere: [
                    '$text',
                    '$block'
                ],
                isInline: true
            }
        },
        {
            model: 'htmlCustomElement',
            view: '$customElement',
            modelSchema: {
                allowWhere: [
                    '$text',
                    '$block'
                ],
                allowAttributesOf: '$inlineObject',
                isInline: true
            }
        }
    ]
};

/**
 * Holds representation of the extended HTML document type definitions to be used by the
 * editor in HTML support.
 *
 * Data schema is represented by data schema definitions.
 *
 * To add new definition for block element,
 * use {@link module:html-support/dataschema~DataSchema#registerBlockElement} method:
 *
 * ```ts
 * dataSchema.registerBlockElement( {
 * 	view: 'section',
 * 	model: 'my-section',
 * 	modelSchema: {
 * 		inheritAllFrom: '$block'
 * 	}
 * } );
 * ```
 *
 * To add new definition for inline element,
 * use {@link module:html-support/dataschema~DataSchema#registerInlineElement} method:
 *
 * ```
 * dataSchema.registerInlineElement( {
 * 	view: 'span',
 * 	model: 'my-span',
 * 	attributeProperties: {
 * 		copyOnEnter: true
 * 	}
 * } );
 * ```
 */ class DataSchema extends Plugin {
    /**
	 * A map of registered data schema definitions.
	 */ _definitions = [];
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'DataSchema';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        for (const definition of defaultConfig.block){
            this.registerBlockElement(definition);
        }
        for (const definition of defaultConfig.inline){
            this.registerInlineElement(definition);
        }
    }
    /**
	 * Add new data schema definition describing block element.
	 */ registerBlockElement(definition) {
        this._definitions.push({
            ...definition,
            isBlock: true
        });
    }
    /**
	 * Add new data schema definition describing inline element.
	 */ registerInlineElement(definition) {
        this._definitions.push({
            ...definition,
            isInline: true
        });
    }
    /**
	 * Updates schema definition describing block element with new properties.
	 *
	 * Creates new scheme if it doesn't exist.
	 * Array properties are concatenated with original values.
	 *
	 * @param definition Definition update.
	 */ extendBlockElement(definition) {
        this._extendDefinition({
            ...definition,
            isBlock: true
        });
    }
    /**
	 * Updates schema definition describing inline element with new properties.
	 *
	 * Creates new scheme if it doesn't exist.
	 * Array properties are concatenated with original values.
	 *
	 * @param definition Definition update.
	 */ extendInlineElement(definition) {
        this._extendDefinition({
            ...definition,
            isInline: true
        });
    }
    /**
	 * Returns all definitions matching the given view name.
	 *
	 * @param includeReferences Indicates if this method should also include definitions of referenced models.
	 */ getDefinitionsForView(viewName, includeReferences = false) {
        const definitions = new Set();
        for (const definition of this._getMatchingViewDefinitions(viewName)){
            if (includeReferences) {
                for (const reference of this._getReferences(definition.model)){
                    definitions.add(reference);
                }
            }
            definitions.add(definition);
        }
        return definitions;
    }
    /**
	 * Returns definitions matching the given model name.
	 */ getDefinitionsForModel(modelName) {
        return this._definitions.filter((definition)=>definition.model == modelName);
    }
    /**
	 * Returns definitions matching the given view name.
	 */ _getMatchingViewDefinitions(viewName) {
        return this._definitions.filter((def)=>def.view && testViewName(viewName, def.view));
    }
    /**
	 * Resolves all definition references registered for the given data schema definition.
	 *
	 * @param modelName Data schema model name.
	 */ *_getReferences(modelName) {
        const inheritProperties = [
            'inheritAllFrom',
            'inheritTypesFrom',
            'allowWhere',
            'allowContentOf',
            'allowAttributesOf'
        ];
        const definitions = this._definitions.filter((definition)=>definition.model == modelName);
        for (const { modelSchema } of definitions){
            if (!modelSchema) {
                continue;
            }
            for (const property of inheritProperties){
                for (const referenceName of toArray(modelSchema[property] || [])){
                    const definitions = this._definitions.filter((definition)=>definition.model == referenceName);
                    for (const definition of definitions){
                        if (referenceName !== modelName) {
                            yield* this._getReferences(definition.model);
                            yield definition;
                        }
                    }
                }
            }
        }
    }
    /**
	 * Updates schema definition with new properties.
	 *
	 * Creates new scheme if it doesn't exist.
	 * Array properties are concatenated with original values.
	 *
	 * @param definition Definition update.
	 */ _extendDefinition(definition) {
        const currentDefinitions = Array.from(this._definitions.entries()).filter(([, currentDefinition])=>currentDefinition.model == definition.model);
        if (currentDefinitions.length == 0) {
            this._definitions.push(definition);
            return;
        }
        for (const [idx, currentDefinition] of currentDefinitions){
            this._definitions[idx] = mergeWith({}, currentDefinition, definition, (target, source)=>{
                return Array.isArray(target) ? target.concat(source) : undefined;
            });
        }
    }
}
/**
 * Test view name against the given pattern.
 */ function testViewName(pattern, viewName) {
    if (typeof pattern === 'string') {
        return pattern === viewName;
    }
    if (pattern instanceof RegExp) {
        return pattern.test(viewName);
    }
    return false;
}

/**
 * Allows to validate elements and element attributes registered by {@link module:html-support/dataschema~DataSchema}.
 *
 * To enable registered element in the editor, use {@link module:html-support/datafilter~DataFilter#allowElement} method:
 *
 * ```ts
 * dataFilter.allowElement( 'section' );
 * ```
 *
 * You can also allow or disallow specific element attributes:
 *
 * ```ts
 * // Allow `data-foo` attribute on `section` element.
 * dataFilter.allowAttributes( {
 * 	name: 'section',
 * 	attributes: {
 * 		'data-foo': true
 * 	}
 * } );
 *
 * // Disallow `color` style attribute on 'section' element.
 * dataFilter.disallowAttributes( {
 * 	name: 'section',
 * 	styles: {
 * 		color: /[\s\S]+/
 * 	}
 * } );
 * ```
 *
 * To apply the information about allowed and disallowed attributes in custom integration plugin,
 * use the {@link module:html-support/datafilter~DataFilter#processViewAttributes `processViewAttributes()`} method.
 */ class DataFilter extends Plugin {
    /**
	 * An instance of the {@link module:html-support/dataschema~DataSchema}.
	 */ _dataSchema;
    /**
	 * {@link module:engine/view/matcher~Matcher Matcher} instance describing rules upon which
	 * content attributes should be allowed.
	 */ _allowedAttributes;
    /**
	 * {@link module:engine/view/matcher~Matcher Matcher} instance describing rules upon which
	 * content attributes should be disallowed.
	 */ _disallowedAttributes;
    /**
	 * Allowed element definitions by {@link module:html-support/datafilter~DataFilter#allowElement} method.
	*/ _allowedElements;
    /**
	 * Disallowed element names by {@link module:html-support/datafilter~DataFilter#disallowElement} method.
	 */ _disallowedElements;
    /**
	 * Indicates if {@link module:engine/controller/datacontroller~DataController editor's data controller}
	 * data has been already initialized.
	*/ _dataInitialized;
    /**
	 * Cached map of coupled attributes. Keys are the feature attributes names
	 * and values are arrays with coupled GHS attributes names.
	 */ _coupledAttributes;
    constructor(editor){
        super(editor);
        this._dataSchema = editor.plugins.get('DataSchema');
        this._allowedAttributes = new Matcher();
        this._disallowedAttributes = new Matcher();
        this._allowedElements = new Set();
        this._disallowedElements = new Set();
        this._dataInitialized = false;
        this._coupledAttributes = null;
        this._registerElementsAfterInit();
        this._registerElementHandlers();
        this._registerCoupledAttributesPostFixer();
        this._registerAssociatedHtmlAttributesPostFixer();
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'DataFilter';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            DataSchema,
            Widget
        ];
    }
    /**
	 * Load a configuration of one or many elements, where their attributes should be allowed.
	 *
	 * **Note**: Rules will be applied just before next data pipeline data init or set.
	 *
	 * @param config Configuration of elements that should have their attributes accepted in the editor.
	 */ loadAllowedConfig(config) {
        for (const pattern of config){
            // MatcherPattern allows omitting `name` to widen the search of elements.
            // Let's keep it consistent and match every element if a `name` has not been provided.
            const elementName = pattern.name || /[\s\S]+/;
            const rules = splitRules(pattern);
            this.allowElement(elementName);
            rules.forEach((pattern)=>this.allowAttributes(pattern));
        }
    }
    /**
	 * Load a configuration of one or many elements, where their attributes should be disallowed.
	 *
	 * **Note**: Rules will be applied just before next data pipeline data init or set.
	 *
	 * @param config Configuration of elements that should have their attributes rejected from the editor.
	 */ loadDisallowedConfig(config) {
        for (const pattern of config){
            // MatcherPattern allows omitting `name` to widen the search of elements.
            // Let's keep it consistent and match every element if a `name` has not been provided.
            const elementName = pattern.name || /[\s\S]+/;
            const rules = splitRules(pattern);
            // Disallow element itself if there is no other rules.
            if (rules.length == 0) {
                this.disallowElement(elementName);
            } else {
                rules.forEach((pattern)=>this.disallowAttributes(pattern));
            }
        }
    }
    /**
	 * Load a configuration of one or many elements, where when empty should be allowed.
	 *
	 * **Note**: It modifies DataSchema so must be loaded before registering filtering rules.
	 *
	 * @param config Configuration of elements that should be preserved even if empty.
	 */ loadAllowedEmptyElementsConfig(config) {
        for (const elementName of config){
            this.allowEmptyElement(elementName);
        }
    }
    /**
	 * Allow the given element in the editor context.
	 *
	 * This method will only allow elements described by the {@link module:html-support/dataschema~DataSchema} used
	 * to create data filter.
	 *
	 * **Note**: Rules will be applied just before next data pipeline data init or set.
	 *
	 * @param viewName String or regular expression matching view name.
	 */ allowElement(viewName) {
        for (const definition of this._dataSchema.getDefinitionsForView(viewName, true)){
            this._addAllowedElement(definition);
            // Reset cached map to recalculate it on the next usage.
            this._coupledAttributes = null;
        }
    }
    /**
	 * Disallow the given element in the editor context.
	 *
	 * This method will only disallow elements described by the {@link module:html-support/dataschema~DataSchema} used
	 * to create data filter.
	 *
	 * @param viewName String or regular expression matching view name.
	 */ disallowElement(viewName) {
        for (const definition of this._dataSchema.getDefinitionsForView(viewName, false)){
            this._disallowedElements.add(definition.view);
        }
    }
    /**
	 * Allow the given empty element in the editor context.
	 *
	 * This method will only allow elements described by the {@link module:html-support/dataschema~DataSchema} used
	 * to create data filter.
	 *
	 * **Note**: It modifies DataSchema so must be called before registering filtering rules.
	 *
	 * @param viewName String or regular expression matching view name.
	 */ allowEmptyElement(viewName) {
        for (const definition of this._dataSchema.getDefinitionsForView(viewName, true)){
            if (definition.isInline) {
                this._dataSchema.extendInlineElement({
                    ...definition,
                    allowEmpty: true
                });
            }
        }
    }
    /**
	 * Allow the given attributes for view element allowed by {@link #allowElement} method.
	 *
	 * @param config Pattern matching all attributes which should be allowed.
	 */ allowAttributes(config) {
        this._allowedAttributes.add(config);
    }
    /**
	 * Disallow the given attributes for view element allowed by {@link #allowElement} method.
	 *
	 * @param config Pattern matching all attributes which should be disallowed.
	 */ disallowAttributes(config) {
        this._disallowedAttributes.add(config);
    }
    /**
	 * Processes all allowed and disallowed attributes on the view element by consuming them and returning the allowed ones.
	 *
	 * This method applies the configuration set up by {@link #allowAttributes `allowAttributes()`}
	 * and {@link #disallowAttributes `disallowAttributes()`} over the given view element by consuming relevant attributes.
	 * It returns the allowed attributes that were found on the given view element for further processing by integration code.
	 *
	 * ```ts
	 * dispatcher.on( 'element:myElement', ( evt, data, conversionApi ) => {
	 * 	// Get rid of disallowed and extract all allowed attributes from a viewElement.
	 * 	const viewAttributes = dataFilter.processViewAttributes( data.viewItem, conversionApi );
	 * 	// Do something with them, i.e. store inside a model as a dictionary.
	 * 	if ( viewAttributes ) {
	 * 		conversionApi.writer.setAttribute( 'htmlAttributesOfMyElement', viewAttributes, data.modelRange );
	 * 	}
	 * } );
	 * ```
	 *
	 * @see module:engine/conversion/viewconsumable~ViewConsumable#consume
	 *
	 * @returns Object with following properties:
	 * - attributes Set with matched attribute names.
	 * - styles Set with matched style names.
	 * - classes Set with matched class names.
	 */ processViewAttributes(viewElement, conversionApi) {
        const { consumable } = conversionApi;
        // Make sure that the disabled attributes are handled before the allowed attributes are called.
        // For example, for block images the <figure> converter triggers conversion for <img> first and then for other elements, i.e. <a>.
        matchAndConsumeAttributes(viewElement, this._disallowedAttributes, consumable);
        return prepareGHSAttribute(viewElement, matchAndConsumeAttributes(viewElement, this._allowedAttributes, consumable));
    }
    /**
	 * Adds allowed element definition and fires registration event.
	 */ _addAllowedElement(definition) {
        if (this._allowedElements.has(definition)) {
            return;
        }
        this._allowedElements.add(definition);
        // For attribute based integrations (table figure, document lists, etc.) register related element definitions.
        if ('appliesToBlock' in definition && typeof definition.appliesToBlock == 'string') {
            for (const relatedDefinition of this._dataSchema.getDefinitionsForModel(definition.appliesToBlock)){
                if (relatedDefinition.isBlock) {
                    this._addAllowedElement(relatedDefinition);
                }
            }
        }
        // We need to wait for all features to be initialized before we can register
        // element, so we can access existing features model schemas.
        // If the data has not been initialized yet, _registerElementsAfterInit() method will take care of
        // registering elements.
        if (this._dataInitialized) {
            // Defer registration to the next data pipeline data set so any disallow rules could be applied
            // even if added after allow rule (disallowElement).
            this.editor.data.once('set', ()=>{
                this._fireRegisterEvent(definition);
            }, {
                // With the highest priority listener we are able to register elements right before
                // running data conversion.
                priority: priorities.highest + 1
            });
        }
    }
    /**
	 * Registers elements allowed by {@link module:html-support/datafilter~DataFilter#allowElement} method
	 * once {@link module:engine/controller/datacontroller~DataController editor's data controller} is initialized.
	*/ _registerElementsAfterInit() {
        this.editor.data.on('init', ()=>{
            this._dataInitialized = true;
            for (const definition of this._allowedElements){
                this._fireRegisterEvent(definition);
            }
        }, {
            // With highest priority listener we are able to register elements right before
            // running data conversion. Also:
            // * Make sure that priority is higher than the one used by `RealTimeCollaborationClient`,
            // as RTC is stopping event propagation.
            // * Make sure no other features hook into this event before GHS because otherwise the
            // downcast conversion (for these features) could run before GHS registered its converters
            // (https://github.com/ckeditor/ckeditor5/issues/11356).
            priority: priorities.highest + 1
        });
    }
    /**
	 * Registers default element handlers.
	 */ _registerElementHandlers() {
        this.on('register', (evt, definition)=>{
            const schema = this.editor.model.schema;
            // Object element should be only registered for new features.
            // If the model schema is already registered, it should be handled by
            // #_registerBlockElement() or #_registerObjectElement() attribute handlers.
            if (definition.isObject && !schema.isRegistered(definition.model)) {
                this._registerObjectElement(definition);
            } else if (definition.isBlock) {
                this._registerBlockElement(definition);
            } else if (definition.isInline) {
                this._registerInlineElement(definition);
            } else {
                /**
				 * The definition cannot be handled by the data filter.
				 *
				 * Make sure that the registered definition is correct.
				 *
				 * @error data-filter-invalid-definition
				 */ throw new CKEditorError('data-filter-invalid-definition', null, definition);
            }
            evt.stop();
        }, {
            priority: 'lowest'
        });
    }
    /**
	 * Registers a model post-fixer that is removing coupled GHS attributes of inline elements. Those attributes
	 * are removed if a coupled feature attribute is removed.
	 *
	 * For example, consider following HTML:
	 *
	 * ```html
	 * <a href="foo.html" id="myId">bar</a>
	 * ```
	 *
	 * Which would be upcasted to following text node in the model:
	 *
	 * ```html
	 * <$text linkHref="foo.html" htmlA="{ attributes: { id: 'myId' } }">bar</$text>
	 * ```
	 *
	 * When the user removes the link from that text (using UI), only `linkHref` attribute would be removed:
	 *
	 * ```html
	 * <$text htmlA="{ attributes: { id: 'myId' } }">bar</$text>
	 * ```
	 *
	 * The `htmlA` attribute would stay in the model and would cause GHS to generate an `<a>` element.
	 * This is incorrect from UX point of view, as the user wanted to remove the whole link (not only `href`).
	 */ _registerCoupledAttributesPostFixer() {
        const model = this.editor.model;
        const selection = model.document.selection;
        model.document.registerPostFixer((writer)=>{
            const changes = model.document.differ.getChanges();
            let changed = false;
            const coupledAttributes = this._getCoupledAttributesMap();
            for (const change of changes){
                // Handle only attribute removals.
                if (change.type != 'attribute' || change.attributeNewValue !== null) {
                    continue;
                }
                // Find a list of coupled GHS attributes.
                const attributeKeys = coupledAttributes.get(change.attributeKey);
                if (!attributeKeys) {
                    continue;
                }
                // Remove the coupled GHS attributes on the same range as the feature attribute was removed.
                for (const { item } of change.range.getWalker()){
                    for (const attributeKey of attributeKeys){
                        if (item.hasAttribute(attributeKey)) {
                            writer.removeAttribute(attributeKey, item);
                            changed = true;
                        }
                    }
                }
            }
            return changed;
        });
        this.listenTo(selection, 'change:attribute', (evt, { attributeKeys })=>{
            const removeAttributes = new Set();
            const coupledAttributes = this._getCoupledAttributesMap();
            for (const attributeKey of attributeKeys){
                // Handle only attribute removals.
                if (selection.hasAttribute(attributeKey)) {
                    continue;
                }
                // Find a list of coupled GHS attributes.
                const coupledAttributeKeys = coupledAttributes.get(attributeKey);
                if (!coupledAttributeKeys) {
                    continue;
                }
                for (const coupledAttributeKey of coupledAttributeKeys){
                    if (selection.hasAttribute(coupledAttributeKey)) {
                        removeAttributes.add(coupledAttributeKey);
                    }
                }
            }
            if (removeAttributes.size == 0) {
                return;
            }
            model.change((writer)=>{
                for (const attributeKey of removeAttributes){
                    writer.removeSelectionAttribute(attributeKey);
                }
            });
        });
    }
    /**
	 * Removes `html*Attributes` attributes from incompatible elements.
	 *
	 * For example, consider the following HTML:
	 *
	 * ```html
	 * <heading2 htmlH2Attributes="...">foobar[]</heading2>
	 * ```
	 *
	 * Pressing `enter` creates a new `paragraph` element that inherits
	 * the `htmlH2Attributes` attribute from `heading2`.
	 *
	 * ```html
	 * <heading2 htmlH2Attributes="...">foobar</heading2>
	 * <paragraph htmlH2Attributes="...">[]</paragraph>
	 * ```
	 *
	 * This postfixer ensures that this doesn't happen, and that elements can
	 * only have `html*Attributes` associated with them,
	 * e.g.: `htmlPAttributes` for `<p>`, `htmlDivAttributes` for `<div>`, etc.
	 *
	 * With it enabled, pressing `enter` at the end of `<heading2>` will create
	 * a new paragraph without the `htmlH2Attributes` attribute.
	 *
	 * ```html
	 * <heading2 htmlH2Attributes="...">foobar</heading2>
	 * <paragraph>[]</paragraph>
	 * ```
	 */ _registerAssociatedHtmlAttributesPostFixer() {
        const model = this.editor.model;
        model.document.registerPostFixer((writer)=>{
            const changes = model.document.differ.getChanges();
            let changed = false;
            for (const change of changes){
                if (change.type !== 'insert' || change.name === '$text') {
                    continue;
                }
                for (const attr of change.attributes.keys()){
                    if (!attr.startsWith('html') || !attr.endsWith('Attributes')) {
                        continue;
                    }
                    if (!model.schema.checkAttribute(change.name, attr)) {
                        writer.removeAttribute(attr, change.position.nodeAfter);
                        changed = true;
                    }
                }
            }
            return changed;
        });
    }
    /**
	 * Collects the map of coupled attributes. The returned map is keyed by the feature attribute name
	 * and coupled GHS attribute names are stored in the value array.
	 */ _getCoupledAttributesMap() {
        if (this._coupledAttributes) {
            return this._coupledAttributes;
        }
        this._coupledAttributes = new Map();
        for (const definition of this._allowedElements){
            if (definition.coupledAttribute && definition.model) {
                const attributeNames = this._coupledAttributes.get(definition.coupledAttribute);
                if (attributeNames) {
                    attributeNames.push(definition.model);
                } else {
                    this._coupledAttributes.set(definition.coupledAttribute, [
                        definition.model
                    ]);
                }
            }
        }
        return this._coupledAttributes;
    }
    /**
	 * Fires `register` event for the given element definition.
	 */ _fireRegisterEvent(definition) {
        if (definition.view && this._disallowedElements.has(definition.view)) {
            return;
        }
        this.fire(definition.view ? `register:${definition.view}` : 'register', definition);
    }
    /**
	 * Registers object element and attribute converters for the given data schema definition.
	 */ _registerObjectElement(definition) {
        const editor = this.editor;
        const schema = editor.model.schema;
        const conversion = editor.conversion;
        const { view: viewName, model: modelName } = definition;
        schema.register(modelName, definition.modelSchema);
        /* istanbul ignore next: paranoid check -- @preserve */ if (!viewName) {
            return;
        }
        schema.extend(definition.model, {
            allowAttributes: [
                getHtmlAttributeName(viewName),
                'htmlContent'
            ]
        });
        // Store element content in special `$rawContent` custom property to
        // avoid editor's data filtering mechanism.
        editor.data.registerRawContentMatcher({
            name: viewName
        });
        conversion.for('upcast').elementToElement({
            view: viewName,
            model: viewToModelObjectConverter(definition),
            // With a `low` priority, `paragraph` plugin auto-paragraphing mechanism is executed. Make sure
            // this listener is called before it. If not, some elements will be transformed into a paragraph.
            // `+ 2` is used to take priority over `_addDefaultH1Conversion` in the Heading plugin.
            converterPriority: priorities.low + 2
        });
        conversion.for('upcast').add(viewToModelBlockAttributeConverter(definition, this));
        conversion.for('editingDowncast').elementToStructure({
            model: {
                name: modelName,
                attributes: [
                    getHtmlAttributeName(viewName)
                ]
            },
            view: toObjectWidgetConverter(editor, definition)
        });
        conversion.for('dataDowncast').elementToElement({
            model: modelName,
            view: (modelElement, { writer })=>{
                return createObjectView(viewName, modelElement, writer);
            }
        });
        conversion.for('dataDowncast').add(modelToViewBlockAttributeConverter(definition));
    }
    /**
	 * Registers block element and attribute converters for the given data schema definition.
	 */ _registerBlockElement(definition) {
        const editor = this.editor;
        const schema = editor.model.schema;
        const conversion = editor.conversion;
        const { view: viewName, model: modelName } = definition;
        if (!schema.isRegistered(definition.model)) {
            // Do not register converters and empty schema for editor existing feature
            // as empty schema won't allow element anywhere in the model.
            if (!definition.modelSchema) {
                return;
            }
            schema.register(definition.model, definition.modelSchema);
            if (!viewName) {
                return;
            }
            conversion.for('upcast').elementToElement({
                model: modelName,
                view: viewName,
                // With a `low` priority, `paragraph` plugin auto-paragraphing mechanism is executed. Make sure
                // this listener is called before it. If not, some elements will be transformed into a paragraph.
                // `+ 2` is used to take priority over `_addDefaultH1Conversion` in the Heading plugin.
                converterPriority: priorities.low + 2
            });
            conversion.for('downcast').elementToElement({
                model: modelName,
                view: (modelElement, { writer })=>definition.isEmpty ? writer.createEmptyElement(viewName) : writer.createContainerElement(viewName)
            });
        }
        if (!viewName) {
            return;
        }
        schema.extend(definition.model, {
            allowAttributes: getHtmlAttributeName(viewName)
        });
        conversion.for('upcast').add(viewToModelBlockAttributeConverter(definition, this));
        conversion.for('downcast').add(modelToViewBlockAttributeConverter(definition));
    }
    /**
	 * Registers inline element and attribute converters for the given data schema definition.
	 *
	 * Extends `$text` model schema to allow the given definition model attribute and its properties.
	 */ _registerInlineElement(definition) {
        const editor = this.editor;
        const schema = editor.model.schema;
        const conversion = editor.conversion;
        const attributeKey = definition.model;
        // This element is stored in the model as an attribute on a block element, for example Lists.
        if (definition.appliesToBlock) {
            return;
        }
        schema.extend('$text', {
            allowAttributes: attributeKey
        });
        if (definition.attributeProperties) {
            schema.setAttributeProperties(attributeKey, definition.attributeProperties);
        }
        conversion.for('upcast').add(viewToAttributeInlineConverter(definition, this));
        conversion.for('downcast').attributeToElement({
            model: attributeKey,
            view: attributeToViewInlineConverter(definition)
        });
        if (!definition.allowEmpty) {
            return;
        }
        schema.setAttributeProperties(attributeKey, {
            copyFromObject: false
        });
        if (!schema.isRegistered('htmlEmptyElement')) {
            schema.register('htmlEmptyElement', {
                inheritAllFrom: '$inlineObject'
            });
            // Helper function to check if an element has any HTML attributes.
            const hasHtmlAttributes = (element)=>Array.from(element.getAttributeKeys()).some((key)=>key.startsWith('html'));
            // Register a post-fixer that removes htmlEmptyElement when its htmlXX attribute is removed.
            // See: https://github.com/ckeditor/ckeditor5/issues/18089
            editor.model.document.registerPostFixer((writer)=>{
                const changes = editor.model.document.differ.getChanges();
                const elementsToRemove = new Set();
                for (const change of changes){
                    if (change.type === 'remove') {
                        continue;
                    }
                    // Look for removal of html* attributes.
                    if (change.type === 'attribute' && change.attributeNewValue === null) {
                        // Find htmlEmptyElement instances in the range that lost their html attribute.
                        for (const { item } of change.range){
                            if (item.is('element', 'htmlEmptyElement') && !hasHtmlAttributes(item)) {
                                elementsToRemove.add(item);
                            }
                        }
                    }
                    // Look for insertion of htmlEmptyElement.
                    if (change.type === 'insert' && change.position.nodeAfter) {
                        const insertedElement = change.position.nodeAfter;
                        for (const { item } of writer.createRangeOn(insertedElement)){
                            if (item.is('element', 'htmlEmptyElement') && !hasHtmlAttributes(item)) {
                                elementsToRemove.add(item);
                            }
                        }
                    }
                }
                for (const element of elementsToRemove){
                    writer.remove(element);
                }
                return elementsToRemove.size > 0;
            });
        }
        editor.data.htmlProcessor.domConverter.registerInlineObjectMatcher((element)=>{
            // Element must be empty and have any attribute.
            if (element.name == definition.view && element.isEmpty && Array.from(element.getAttributeKeys()).length) {
                return {
                    name: true
                };
            }
            return null;
        });
        conversion.for('editingDowncast').elementToElement({
            model: 'htmlEmptyElement',
            view: emptyInlineModelElementToViewConverter(definition, true)
        });
        conversion.for('dataDowncast').elementToElement({
            model: 'htmlEmptyElement',
            view: emptyInlineModelElementToViewConverter(definition)
        });
    }
}
/**
 * Matches and consumes matched attributes.
 *
 * @returns Object with following properties:
 * - attributes Array with matched attribute names.
 * - classes Array with matched class names.
 * - styles Array with matched style names.
 */ function matchAndConsumeAttributes(viewElement, matcher, consumable) {
    const matches = matcher.matchAll(viewElement) || [];
    const stylesProcessor = viewElement.document.stylesProcessor;
    return matches.reduce((result, { match })=>{
        for (const [key, token] of match.attributes || []){
            // Verify and consume styles.
            if (key == 'style') {
                const style = token;
                // Check longer forms of the same style as those could be matched
                // but not present in the element directly.
                // Consider only longhand (or longer than current notation) so that
                // we do not include all sides of the box if only one side is allowed.
                const sortedRelatedStyles = stylesProcessor.getRelatedStyles(style).filter((relatedStyle)=>relatedStyle.split('-').length > style.split('-').length).sort((a, b)=>b.split('-').length - a.split('-').length);
                for (const relatedStyle of sortedRelatedStyles){
                    if (consumable.consume(viewElement, {
                        styles: [
                            relatedStyle
                        ]
                    })) {
                        result.styles.push(relatedStyle);
                    }
                }
                // Verify and consume style as specified in the matcher.
                if (consumable.consume(viewElement, {
                    styles: [
                        style
                    ]
                })) {
                    result.styles.push(style);
                }
            } else if (key == 'class') {
                const className = token;
                if (consumable.consume(viewElement, {
                    classes: [
                        className
                    ]
                })) {
                    result.classes.push(className);
                }
            } else {
                // Verify and consume other attributes.
                if (consumable.consume(viewElement, {
                    attributes: [
                        key
                    ]
                })) {
                    result.attributes.push(key);
                }
            }
        }
        return result;
    }, {
        attributes: [],
        classes: [],
        styles: []
    });
}
/**
 * Prepares the GHS attribute value as an object with element attributes' values.
 */ function prepareGHSAttribute(viewElement, { attributes, classes, styles }) {
    if (!attributes.length && !classes.length && !styles.length) {
        return null;
    }
    return {
        ...attributes.length && {
            attributes: getAttributes(viewElement, attributes)
        },
        ...styles.length && {
            styles: getReducedStyles(viewElement, styles)
        },
        ...classes.length && {
            classes
        }
    };
}
/**
 * Returns attributes as an object with names and values.
 */ function getAttributes(viewElement, attributes) {
    const attributesObject = {};
    for (const key of attributes){
        const value = viewElement.getAttribute(key);
        if (value !== undefined && isValidAttributeName(key)) {
            attributesObject[key] = value;
        }
    }
    return attributesObject;
}
/**
 * Returns styles as an object reduced to shorthand notation without redundant entries.
 */ function getReducedStyles(viewElement, styles) {
    // Use StyleMap to reduce style value to the minimal form (without shorthand and long-hand notation and duplication).
    const stylesMap = new StylesMap(viewElement.document.stylesProcessor);
    for (const key of styles){
        const styleValue = viewElement.getStyle(key);
        if (styleValue !== undefined) {
            stylesMap.set(key, styleValue);
        }
    }
    return Object.fromEntries(stylesMap.getStylesEntries());
}
/**
 * Matcher by default has to match **all** patterns to count it as an actual match. Splitting the pattern
 * into separate patterns means that any matched pattern will be count as a match.
 *
 * @param pattern Pattern to split.
 * @param attributeName Name of the attribute to split (e.g. 'attributes', 'classes', 'styles').
 */ function splitPattern(pattern, attributeName) {
    const { name } = pattern;
    const attributeValue = pattern[attributeName];
    if (isPlainObject(attributeValue)) {
        return Object.entries(attributeValue).map(([key, value])=>({
                name,
                [attributeName]: {
                    [key]: value
                }
            }));
    }
    if (Array.isArray(attributeValue)) {
        return attributeValue.map((value)=>({
                name,
                [attributeName]: [
                    value
                ]
            }));
    }
    return [
        pattern
    ];
}
/**
 * Rules are matched in conjunction (AND operation), but we want to have a match if *any* of the rules is matched (OR operation).
 * By splitting the rules we force the latter effect.
 */ function splitRules(rules) {
    const { name, attributes, classes, styles } = rules;
    const splitRules = [];
    if (attributes) {
        splitRules.push(...splitPattern({
            name,
            attributes
        }, 'attributes'));
    }
    if (classes) {
        splitRules.push(...splitPattern({
            name,
            classes
        }, 'classes'));
    }
    if (styles) {
        splitRules.push(...splitPattern({
            name,
            styles
        }, 'styles'));
    }
    return splitRules;
}

/**
 * Provides the General HTML Support integration with {@link module:code-block/codeblock~CodeBlock Code Block} feature.
 */ class CodeBlockElementSupport extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            DataFilter
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'CodeBlockElementSupport';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        if (!this.editor.plugins.has('CodeBlockEditing')) {
            return;
        }
        const dataFilter = this.editor.plugins.get(DataFilter);
        dataFilter.on('register:pre', (evt, definition)=>{
            if (definition.model !== 'codeBlock') {
                return;
            }
            const editor = this.editor;
            const schema = editor.model.schema;
            const conversion = editor.conversion;
            // Extend codeBlock to allow attributes required by attribute filtration.
            schema.extend('codeBlock', {
                allowAttributes: [
                    'htmlPreAttributes',
                    'htmlContentAttributes'
                ]
            });
            conversion.for('upcast').add(viewToModelCodeBlockAttributeConverter(dataFilter));
            conversion.for('downcast').add(modelToViewCodeBlockAttributeConverter());
            evt.stop();
        });
    }
}
/**
 * View-to-model conversion helper preserving allowed attributes on {@link module:code-block/codeblock~CodeBlock Code Block}
 * feature model element.
 *
 * Attributes are preserved as a value of `html*Attributes` model attribute.
 * @param dataFilter
 * @returns Returns a conversion callback.
 */ function viewToModelCodeBlockAttributeConverter(dataFilter) {
    return (dispatcher)=>{
        dispatcher.on('element:code', (evt, data, conversionApi)=>{
            const viewCodeElement = data.viewItem;
            const viewPreElement = viewCodeElement.parent;
            if (!viewPreElement || !viewPreElement.is('element', 'pre')) {
                return;
            }
            preserveElementAttributes(viewPreElement, 'htmlPreAttributes');
            preserveElementAttributes(viewCodeElement, 'htmlContentAttributes');
            function preserveElementAttributes(viewElement, attributeName) {
                const viewAttributes = dataFilter.processViewAttributes(viewElement, conversionApi);
                if (viewAttributes) {
                    conversionApi.writer.setAttribute(attributeName, viewAttributes, data.modelRange);
                }
            }
        }, {
            priority: 'low'
        });
    };
}
/**
 * Model-to-view conversion helper applying attributes from {@link module:code-block/codeblock~CodeBlock Code Block}
 * feature model element.
 * @returns Returns a conversion callback.
 */ function modelToViewCodeBlockAttributeConverter() {
    return (dispatcher)=>{
        dispatcher.on('attribute:htmlPreAttributes:codeBlock', (evt, data, conversionApi)=>{
            if (!conversionApi.consumable.consume(data.item, evt.name)) {
                return;
            }
            const { attributeOldValue, attributeNewValue } = data;
            const viewCodeElement = conversionApi.mapper.toViewElement(data.item);
            const viewPreElement = viewCodeElement.parent;
            updateViewAttributes(conversionApi.writer, attributeOldValue, attributeNewValue, viewPreElement);
        });
        dispatcher.on('attribute:htmlContentAttributes:codeBlock', (evt, data, conversionApi)=>{
            if (!conversionApi.consumable.consume(data.item, evt.name)) {
                return;
            }
            const { attributeOldValue, attributeNewValue } = data;
            const viewCodeElement = conversionApi.mapper.toViewElement(data.item);
            updateViewAttributes(conversionApi.writer, attributeOldValue, attributeNewValue, viewCodeElement);
        });
    };
}

/**
 * Provides the General HTML Support integration for elements which can behave like sectioning element (e.g. article) or
 * element accepting only inline content (e.g. paragraph).
 *
 * The distinction between this two content models is important for choosing correct schema model and proper content conversion.
 * As an example, it ensures that:
 *
 * * children elements paragraphing is enabled for sectioning elements only,
 * * element and its content can be correctly handled by editing view (splitting and merging elements),
 * * model element HTML is semantically correct and easier to work with.
 *
 * If element contains any block element, it will be treated as a sectioning element and registered using
 * {@link module:html-support/dataschema~HtmlSupportDataSchemaDefinition#model} and
 * {@link module:html-support/dataschema~HtmlSupportDataSchemaDefinition#modelSchema} in editor schema.
 * Otherwise, it will be registered under
 * {@link module:html-support/dataschema~HtmlSupportDataSchemaBlockElementDefinition#paragraphLikeModel} model
 * name with model schema accepting only inline content (inheriting from `$block`).
 */ class DualContentModelElementSupport extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            DataFilter
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'DualContentModelElementSupport';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const dataFilter = this.editor.plugins.get(DataFilter);
        dataFilter.on('register', (evt, definition)=>{
            const blockDefinition = definition;
            const editor = this.editor;
            const schema = editor.model.schema;
            const conversion = editor.conversion;
            if (!blockDefinition.paragraphLikeModel) {
                return;
            }
            // Can only apply to newly registered features.
            if (schema.isRegistered(blockDefinition.model) || schema.isRegistered(blockDefinition.paragraphLikeModel)) {
                return;
            }
            const paragraphLikeModelDefinition = {
                model: blockDefinition.paragraphLikeModel,
                view: blockDefinition.view
            };
            schema.register(blockDefinition.model, blockDefinition.modelSchema);
            schema.register(paragraphLikeModelDefinition.model, {
                inheritAllFrom: '$block'
            });
            conversion.for('upcast').elementToElement({
                view: blockDefinition.view,
                model: (viewElement, { writer })=>{
                    if (this._hasBlockContent(viewElement)) {
                        return writer.createElement(blockDefinition.model);
                    }
                    return writer.createElement(paragraphLikeModelDefinition.model);
                },
                // With a `low` priority, `paragraph` plugin auto-paragraphing mechanism is executed. Make sure
                // this listener is called before it. If not, some elements will be transformed into a paragraph.
                converterPriority: priorities.low + 0.5
            });
            conversion.for('downcast').elementToElement({
                view: blockDefinition.view,
                model: blockDefinition.model
            });
            this._addAttributeConversion(blockDefinition);
            conversion.for('downcast').elementToElement({
                view: paragraphLikeModelDefinition.view,
                model: paragraphLikeModelDefinition.model
            });
            this._addAttributeConversion(paragraphLikeModelDefinition);
            evt.stop();
        });
    }
    /**
	 * Checks whether the given view element includes any other block element.
	 */ _hasBlockContent(viewElement) {
        const view = this.editor.editing.view;
        const blockElements = view.domConverter.blockElements;
        // Traversing the viewElement subtree looking for block elements.
        // Especially for the cases like <div><a href="#"><p>foo</p></a></div>.
        // https://github.com/ckeditor/ckeditor5/issues/11513
        for (const viewItem of view.createRangeIn(viewElement).getItems()){
            if (viewItem.is('element') && blockElements.includes(viewItem.name)) {
                return true;
            }
        }
        return false;
    }
    /**
	 * Adds attribute filtering conversion for the given data schema.
	 */ _addAttributeConversion(definition) {
        const editor = this.editor;
        const conversion = editor.conversion;
        const dataFilter = editor.plugins.get(DataFilter);
        editor.model.schema.extend(definition.model, {
            allowAttributes: getHtmlAttributeName(definition.view)
        });
        conversion.for('upcast').add(viewToModelBlockAttributeConverter(definition, dataFilter));
        conversion.for('downcast').add(modelToViewBlockAttributeConverter(definition));
    }
}

/**
 * Provides the General HTML Support integration with {@link module:heading/heading~Heading Heading} feature.
 */ class HeadingElementSupport extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            DataSchema,
            Enter
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'HeadingElementSupport';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        if (!editor.plugins.has('HeadingEditing')) {
            return;
        }
        const options = editor.config.get('heading.options');
        this.registerHeadingElements(editor, options);
    }
    /**
	 * Registers all elements supported by HeadingEditing to enable custom attributes for those elements.
	 */ registerHeadingElements(editor, options) {
        const dataSchema = editor.plugins.get(DataSchema);
        const headerModels = [];
        for (const option of options){
            if ('model' in option && 'view' in option) {
                dataSchema.registerBlockElement({
                    view: option.view,
                    model: option.model
                });
                headerModels.push(option.model);
            }
        }
        dataSchema.extendBlockElement({
            model: 'htmlHgroup',
            modelSchema: {
                allowChildren: headerModels
            }
        });
        dataSchema.extendBlockElement({
            model: 'htmlSummary',
            modelSchema: {
                allowChildren: headerModels
            }
        });
    }
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */ /**
 * @module html-support/integrations/integrationutils
 */ /**
 * Returns the first view element descendant matching the given view name.
 * Includes view element itself.
 *
 * @internal
 */ function getDescendantElement(writer, containerElement, elementName) {
    const range = writer.createRangeOn(containerElement);
    for (const { item } of range.getWalker()){
        if (item.is('element', elementName)) {
            return item;
        }
    }
}

/**
 * Provides the General HTML Support integration with the {@link module:image/image~Image Image} feature.
 */ class ImageElementSupport extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            DataFilter
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImageElementSupport';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        // At least one image plugin should be loaded for the integration to work properly.
        if (!editor.plugins.has('ImageInlineEditing') && !editor.plugins.has('ImageBlockEditing')) {
            return;
        }
        const schema = editor.model.schema;
        const conversion = editor.conversion;
        const dataFilter = editor.plugins.get(DataFilter);
        dataFilter.on('register:figure', ()=>{
            conversion.for('upcast').add(viewToModelFigureAttributeConverter$1(dataFilter));
        });
        dataFilter.on('register:img', (evt, definition)=>{
            if (definition.model !== 'imageBlock' && definition.model !== 'imageInline') {
                return;
            }
            if (schema.isRegistered('imageBlock')) {
                schema.extend('imageBlock', {
                    allowAttributes: [
                        'htmlImgAttributes',
                        // Figure and Link don't have model counterpart.
                        // We will preserve attributes on image model element using these attribute keys.
                        'htmlFigureAttributes',
                        'htmlLinkAttributes'
                    ]
                });
            }
            if (schema.isRegistered('imageInline')) {
                schema.extend('imageInline', {
                    allowAttributes: [
                        // `htmlA` is needed for standard GHS link integration.
                        'htmlA',
                        'htmlImgAttributes'
                    ]
                });
            }
            conversion.for('upcast').add(viewToModelImageAttributeConverter(dataFilter));
            conversion.for('downcast').add(modelToViewImageAttributeConverter());
            if (editor.plugins.has('LinkImage')) {
                conversion.for('upcast').add(viewToModelLinkImageAttributeConverter(dataFilter, editor));
            }
            evt.stop();
        });
    }
}
/**
 * View-to-model conversion helper preserving allowed attributes on the {@link module:image/image~Image Image}
 * feature model element.
 *
 * @returns Returns a conversion callback.
 */ function viewToModelImageAttributeConverter(dataFilter) {
    return (dispatcher)=>{
        dispatcher.on('element:img', (evt, data, conversionApi)=>{
            if (!data.modelRange) {
                return;
            }
            const viewImageElement = data.viewItem;
            const viewAttributes = dataFilter.processViewAttributes(viewImageElement, conversionApi);
            if (viewAttributes) {
                conversionApi.writer.setAttribute('htmlImgAttributes', viewAttributes, data.modelRange);
            }
        }, {
            priority: 'low'
        });
    };
}
/**
 * View-to-model conversion helper preserving allowed attributes on {@link module:image/image~Image Image}
 * feature model element from link view element.
 *
 * @returns Returns a conversion callback.
 */ function viewToModelLinkImageAttributeConverter(dataFilter, editor) {
    const imageUtils = editor.plugins.get('ImageUtils');
    return (dispatcher)=>{
        dispatcher.on('element:a', (evt, data, conversionApi)=>{
            const viewLink = data.viewItem;
            const viewImage = imageUtils.findViewImgElement(viewLink);
            if (!viewImage) {
                return;
            }
            const modelImage = data.modelCursor.parent;
            if (!modelImage.is('element', 'imageBlock')) {
                return;
            }
            const viewAttributes = dataFilter.processViewAttributes(viewLink, conversionApi);
            if (viewAttributes) {
                conversionApi.writer.setAttribute('htmlLinkAttributes', viewAttributes, modelImage);
            }
        }, {
            priority: 'low'
        });
    };
}
/**
 * View-to-model conversion helper preserving allowed attributes on {@link module:image/image~Image Image}
 * feature model element from figure view element.
 *
 * @returns Returns a conversion callback.
 */ function viewToModelFigureAttributeConverter$1(dataFilter) {
    return (dispatcher)=>{
        dispatcher.on('element:figure', (evt, data, conversionApi)=>{
            const viewFigureElement = data.viewItem;
            if (!data.modelRange || !viewFigureElement.hasClass('image')) {
                return;
            }
            const viewAttributes = dataFilter.processViewAttributes(viewFigureElement, conversionApi);
            if (viewAttributes) {
                conversionApi.writer.setAttribute('htmlFigureAttributes', viewAttributes, data.modelRange);
            }
        }, {
            priority: 'low'
        });
    };
}
/**
 * A model-to-view conversion helper applying attributes from the {@link module:image/image~Image Image}
 * feature.
 * @returns Returns a conversion callback.
 */ function modelToViewImageAttributeConverter() {
    return (dispatcher)=>{
        addInlineAttributeConversion('htmlImgAttributes');
        addBlockAttributeConversion('img', 'htmlImgAttributes');
        addBlockAttributeConversion('figure', 'htmlFigureAttributes');
        addBlockAttributeConversion('a', 'htmlLinkAttributes');
        function addInlineAttributeConversion(attributeName) {
            dispatcher.on(`attribute:${attributeName}:imageInline`, (evt, data, conversionApi)=>{
                if (!conversionApi.consumable.consume(data.item, evt.name)) {
                    return;
                }
                const { attributeOldValue, attributeNewValue } = data;
                const viewElement = conversionApi.mapper.toViewElement(data.item);
                updateViewAttributes(conversionApi.writer, attributeOldValue, attributeNewValue, viewElement);
            }, {
                priority: 'low'
            });
        }
        function addBlockAttributeConversion(elementName, attributeName) {
            dispatcher.on(`attribute:${attributeName}:imageBlock`, (evt, data, conversionApi)=>{
                if (!conversionApi.consumable.test(data.item, evt.name)) {
                    return;
                }
                const { attributeOldValue, attributeNewValue } = data;
                const containerElement = conversionApi.mapper.toViewElement(data.item);
                const viewElement = getDescendantElement(conversionApi.writer, containerElement, elementName);
                if (viewElement) {
                    updateViewAttributes(conversionApi.writer, attributeOldValue, attributeNewValue, viewElement);
                    conversionApi.consumable.consume(data.item, evt.name);
                }
            }, {
                priority: 'low'
            });
            if (elementName === 'a') {
                // To have a link element in the view, we need to attach a converter to the `linkHref` attribute as well.
                dispatcher.on('attribute:linkHref:imageBlock', (evt, data, conversionApi)=>{
                    if (!conversionApi.consumable.consume(data.item, 'attribute:htmlLinkAttributes:imageBlock')) {
                        return;
                    }
                    const containerElement = conversionApi.mapper.toViewElement(data.item);
                    const viewElement = getDescendantElement(conversionApi.writer, containerElement, 'a');
                    setViewAttributes(conversionApi.writer, data.item.getAttribute('htmlLinkAttributes'), viewElement);
                }, {
                    priority: 'low'
                });
            }
        }
    };
}

/**
 * Provides the General HTML Support integration with {@link module:media-embed/mediaembed~MediaEmbed Media Embed} feature.
 */ class MediaEmbedElementSupport extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            DataFilter
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'MediaEmbedElementSupport';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
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
        dataFilter.on('register:figure', ()=>{
            conversion.for('upcast').add(viewToModelFigureAttributesConverter(dataFilter));
        });
        dataFilter.on(`register:${mediaElementName}`, (evt, definition)=>{
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
    const upcastMedia = (evt, data, conversionApi)=>{
        const viewMediaElement = data.viewItem;
        preserveElementAttributes(viewMediaElement, getHtmlAttributeName(mediaElementName));
        function preserveElementAttributes(viewElement, attributeName) {
            const viewAttributes = dataFilter.processViewAttributes(viewElement, conversionApi);
            if (viewAttributes) {
                conversionApi.writer.setAttribute(attributeName, viewAttributes, data.modelRange);
            }
        }
    };
    return (dispatcher)=>{
        dispatcher.on(`element:${mediaElementName}`, upcastMedia, {
            priority: 'low'
        });
    };
}
/**
 * View-to-model conversion helper preserving allowed attributes on {@link module:media-embed/mediaembed~MediaEmbed MediaEmbed}
 * feature model element from figure view element.
 *
 * @returns Returns a conversion callback.
 */ function viewToModelFigureAttributesConverter(dataFilter) {
    return (dispatcher)=>{
        dispatcher.on('element:figure', (evt, data, conversionApi)=>{
            const viewFigureElement = data.viewItem;
            if (!data.modelRange || !viewFigureElement.hasClass('media')) {
                return;
            }
            const viewAttributes = dataFilter.processViewAttributes(viewFigureElement, conversionApi);
            if (viewAttributes) {
                conversionApi.writer.setAttribute('htmlFigureAttributes', viewAttributes, data.modelRange);
            }
        }, {
            priority: 'low'
        });
    };
}
function modelToViewMediaAttributeConverter(mediaElementName) {
    return (dispatcher)=>{
        addAttributeConversionDispatcherHandler(mediaElementName, getHtmlAttributeName(mediaElementName));
        addAttributeConversionDispatcherHandler('figure', 'htmlFigureAttributes');
        function addAttributeConversionDispatcherHandler(elementName, attributeName) {
            dispatcher.on(`attribute:${attributeName}:media`, (evt, data, conversionApi)=>{
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

/**
 * Provides the General HTML Support for `script` elements.
 */ class ScriptElementSupport extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            DataFilter
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ScriptElementSupport';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const dataFilter = this.editor.plugins.get(DataFilter);
        dataFilter.on('register:script', (evt, definition)=>{
            const editor = this.editor;
            const schema = editor.model.schema;
            const conversion = editor.conversion;
            schema.register('htmlScript', definition.modelSchema);
            schema.extend('htmlScript', {
                allowAttributes: [
                    'htmlScriptAttributes',
                    'htmlContent'
                ],
                isContent: true
            });
            editor.data.registerRawContentMatcher({
                name: 'script'
            });
            conversion.for('upcast').elementToElement({
                view: 'script',
                model: viewToModelObjectConverter(definition)
            });
            conversion.for('upcast').add(viewToModelBlockAttributeConverter(definition, dataFilter));
            conversion.for('downcast').elementToElement({
                model: 'htmlScript',
                view: (modelElement, { writer })=>{
                    return createObjectView('script', modelElement, writer);
                }
            });
            conversion.for('downcast').add(modelToViewBlockAttributeConverter(definition));
            evt.stop();
        });
    }
}

const STYLE_ATTRIBUTES_TO_PROPAGATE = [
    'width',
    'max-width',
    'min-width',
    'height',
    'min-height',
    'max-height'
];
/**
 * Provides the General HTML Support integration with {@link module:table/table~Table Table} feature.
 */ class TableElementSupport extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            DataFilter
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TableElementSupport';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        if (!editor.plugins.has('TableEditing')) {
            return;
        }
        const schema = editor.model.schema;
        const conversion = editor.conversion;
        const dataFilter = editor.plugins.get(DataFilter);
        const tableUtils = editor.plugins.get('TableUtils');
        dataFilter.on('register:figure', ()=>{
            conversion.for('upcast').add(viewToModelFigureAttributeConverter(dataFilter));
        });
        dataFilter.on('register:table', (evt, definition)=>{
            if (definition.model !== 'table') {
                return;
            }
            schema.extend('table', {
                allowAttributes: [
                    'htmlTableAttributes',
                    // Figure, thead and tbody elements don't have model counterparts.
                    // We will be preserving attributes on table element using these attribute keys.
                    'htmlFigureAttributes',
                    'htmlTheadAttributes',
                    'htmlTbodyAttributes'
                ]
            });
            conversion.for('upcast').add(viewToModelTableAttributeConverter(dataFilter));
            conversion.for('downcast').add(modelToViewTableAttributeConverter());
            editor.model.document.registerPostFixer(createHeadingRowsPostFixer(editor.model, tableUtils));
            evt.stop();
        });
    }
}
/**
 * Creates a model post-fixer for thead and tbody GHS related attributes.
 */ function createHeadingRowsPostFixer(model, tableUtils) {
    return (writer)=>{
        const changes = model.document.differ.getChanges();
        let wasFixed = false;
        for (const change of changes){
            if (change.type != 'attribute' || change.attributeKey != 'headingRows') {
                continue;
            }
            const table = change.range.start.nodeAfter;
            const hasTHeadAttributes = table.getAttribute('htmlTheadAttributes');
            const hasTBodyAttributes = table.getAttribute('htmlTbodyAttributes');
            if (hasTHeadAttributes && !change.attributeNewValue) {
                writer.removeAttribute('htmlTheadAttributes', table);
                wasFixed = true;
            } else if (hasTBodyAttributes && change.attributeNewValue == tableUtils.getRows(table)) {
                writer.removeAttribute('htmlTbodyAttributes', table);
                wasFixed = true;
            }
        }
        return wasFixed;
    };
}
/**
 * View-to-model conversion helper preserving allowed attributes on {@link module:table/table~Table Table}
 * feature model element.
 *
 * @returns Returns a conversion callback.
 */ function viewToModelTableAttributeConverter(dataFilter) {
    return (dispatcher)=>{
        dispatcher.on('element:table', (evt, data, conversionApi)=>{
            if (!data.modelRange) {
                return;
            }
            const viewTableElement = data.viewItem;
            // Prevent `table` class on both <table> and <figure> elements simultaneously.
            conversionApi.consumable.consume(viewTableElement, {
                classes: 'table'
            });
            preserveElementAttributes(viewTableElement, 'htmlTableAttributes');
            for (const childNode of viewTableElement.getChildren()){
                if (childNode.is('element', 'thead')) {
                    preserveElementAttributes(childNode, 'htmlTheadAttributes');
                }
                if (childNode.is('element', 'tbody')) {
                    preserveElementAttributes(childNode, 'htmlTbodyAttributes');
                }
            }
            function preserveElementAttributes(viewElement, attributeName) {
                const viewAttributes = dataFilter.processViewAttributes(viewElement, conversionApi);
                if (viewAttributes) {
                    conversionApi.writer.setAttribute(attributeName, viewAttributes, data.modelRange);
                }
            }
        }, {
            priority: 'low'
        });
    };
}
/**
 * View-to-model conversion helper preserving allowed attributes on {@link module:table/table~Table Table}
 * feature model element from figure view element.
 *
 * @returns Returns a conversion callback.
 */ function viewToModelFigureAttributeConverter(dataFilter) {
    return (dispatcher)=>{
        dispatcher.on('element:figure', (evt, data, conversionApi)=>{
            const viewFigureElement = data.viewItem;
            if (!data.modelRange || !viewFigureElement.hasClass('table')) {
                return;
            }
            const viewAttributes = dataFilter.processViewAttributes(viewFigureElement, conversionApi);
            if (viewAttributes) {
                conversionApi.writer.setAttribute('htmlFigureAttributes', viewAttributes, data.modelRange);
            }
        }, {
            priority: 'low'
        });
    };
}
/**
 * Model-to-view conversion helper applying attributes from {@link module:table/table~Table Table}
 * feature.
 *
 * @returns Returns a conversion callback.
 */ function modelToViewTableAttributeConverter() {
    return (dispatcher)=>{
        addAttributeConversionDispatcherHandler('table', 'htmlTableAttributes');
        addAttributeConversionDispatcherHandler('figure', 'htmlFigureAttributes');
        addAttributeConversionDispatcherHandler('thead', 'htmlTheadAttributes');
        addAttributeConversionDispatcherHandler('tbody', 'htmlTbodyAttributes');
        function addAttributeConversionDispatcherHandler(elementName, attributeName) {
            dispatcher.on(`attribute:${attributeName}:table`, (evt, data, conversionApi)=>{
                if (!conversionApi.consumable.test(data.item, evt.name)) {
                    return;
                }
                const containerElement = conversionApi.mapper.toViewElement(data.item);
                const viewElement = getDescendantElement(conversionApi.writer, containerElement, elementName);
                if (!viewElement) {
                    return;
                }
                conversionApi.consumable.consume(data.item, evt.name);
                // Downcast selected styles to a figure element instead of a table element.
                if (attributeName === 'htmlTableAttributes' && containerElement !== viewElement) {
                    const oldAttributes = splitAttributesForFigureAndTable(data.attributeOldValue);
                    const newAttributes = splitAttributesForFigureAndTable(data.attributeNewValue);
                    updateViewAttributes(conversionApi.writer, oldAttributes.tableAttributes, newAttributes.tableAttributes, viewElement);
                    updateViewAttributes(conversionApi.writer, oldAttributes.figureAttributes, newAttributes.figureAttributes, containerElement);
                } else {
                    updateViewAttributes(conversionApi.writer, data.attributeOldValue, data.attributeNewValue, viewElement);
                }
            });
        }
    };
}
/**
 * Splits styles based on the `STYLE_ATTRIBUTES_TO_PROPAGATE` pattern that should be moved to the parent element
 * and those that should remain on element.
 */ function splitAttributesForFigureAndTable(data) {
    const figureAttributes = {};
    const tableAttributes = {
        ...data
    };
    if (!data || !('styles' in data)) {
        return {
            figureAttributes,
            tableAttributes
        };
    }
    tableAttributes.styles = {};
    for (const [key, value] of Object.entries(data.styles)){
        if (STYLE_ATTRIBUTES_TO_PROPAGATE.includes(key)) {
            figureAttributes.styles = {
                ...figureAttributes.styles,
                [key]: value
            };
        } else {
            tableAttributes.styles = {
                ...tableAttributes.styles,
                [key]: value
            };
        }
    }
    return {
        figureAttributes,
        tableAttributes
    };
}

/**
 * Provides the General HTML Support for `style` elements.
 */ class StyleElementSupport extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            DataFilter
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'StyleElementSupport';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const dataFilter = this.editor.plugins.get(DataFilter);
        dataFilter.on('register:style', (evt, definition)=>{
            const editor = this.editor;
            const schema = editor.model.schema;
            const conversion = editor.conversion;
            schema.register('htmlStyle', definition.modelSchema);
            schema.extend('htmlStyle', {
                allowAttributes: [
                    'htmlStyleAttributes',
                    'htmlContent'
                ],
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
                view: (modelElement, { writer })=>{
                    return createObjectView('style', modelElement, writer);
                }
            });
            conversion.for('downcast').add(modelToViewBlockAttributeConverter(definition));
            evt.stop();
        });
    }
}

/**
 * Provides the General HTML Support integration with the {@link module:list/list~List List} feature.
 */ class ListElementSupport extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            DataFilter
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ListElementSupport';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        if (!editor.plugins.has('ListEditing')) {
            return;
        }
        const schema = editor.model.schema;
        const conversion = editor.conversion;
        const dataFilter = editor.plugins.get(DataFilter);
        const listEditing = editor.plugins.get('ListEditing');
        const listUtils = editor.plugins.get('ListUtils');
        const viewElements = [
            'ul',
            'ol',
            'li'
        ];
        // Register downcast strategy.
        // Note that this must be done before document list editing registers conversion in afterInit.
        listEditing.registerDowncastStrategy({
            scope: 'item',
            attributeName: 'htmlLiAttributes',
            setAttributeOnDowncast: setViewAttributes
        });
        listEditing.registerDowncastStrategy({
            scope: 'list',
            attributeName: 'htmlUlAttributes',
            setAttributeOnDowncast: setViewAttributes
        });
        listEditing.registerDowncastStrategy({
            scope: 'list',
            attributeName: 'htmlOlAttributes',
            setAttributeOnDowncast: setViewAttributes
        });
        dataFilter.on('register', (evt, definition)=>{
            if (!viewElements.includes(definition.view)) {
                return;
            }
            evt.stop();
            // Do not register same converters twice.
            if (schema.checkAttribute('$block', 'htmlLiAttributes')) {
                return;
            }
            const allowAttributes = viewElements.map((element)=>getHtmlAttributeName(element));
            schema.extend('$listItem', {
                allowAttributes
            });
            conversion.for('upcast').add((dispatcher)=>{
                dispatcher.on('element:ul', viewToModelListAttributeConverter('htmlUlAttributes', dataFilter), {
                    priority: 'low'
                });
                dispatcher.on('element:ol', viewToModelListAttributeConverter('htmlOlAttributes', dataFilter), {
                    priority: 'low'
                });
                dispatcher.on('element:li', viewToModelListAttributeConverter('htmlLiAttributes', dataFilter), {
                    priority: 'low'
                });
            });
        });
        // Make sure that all items in a single list (items at the same level & listType) have the same properties.
        listEditing.on('postFixer', (evt, { listNodes, writer })=>{
            for (const { node, previousNodeInList } of listNodes){
                // This is a first item of a nested list.
                if (!previousNodeInList) {
                    continue;
                }
                if (previousNodeInList.getAttribute('listType') == node.getAttribute('listType')) {
                    const attribute = getAttributeFromListType(previousNodeInList.getAttribute('listType'));
                    const value = previousNodeInList.getAttribute(attribute);
                    if (!isEqual(node.getAttribute(attribute), value) && writer.model.schema.checkAttribute(node, attribute)) {
                        writer.setAttribute(attribute, value, node);
                        evt.return = true;
                    }
                }
                if (previousNodeInList.getAttribute('listItemId') == node.getAttribute('listItemId')) {
                    const value = previousNodeInList.getAttribute('htmlLiAttributes');
                    if (!isEqual(node.getAttribute('htmlLiAttributes'), value) && writer.model.schema.checkAttribute(node, 'htmlLiAttributes')) {
                        writer.setAttribute('htmlLiAttributes', value, node);
                        evt.return = true;
                    }
                }
            }
        });
        // Remove `ol` attributes from `ul` elements and vice versa.
        listEditing.on('postFixer', (evt, { listNodes, writer })=>{
            for (const { node } of listNodes){
                const listType = node.getAttribute('listType');
                if (!listUtils.isNumberedListType(listType) && node.getAttribute('htmlOlAttributes')) {
                    writer.removeAttribute('htmlOlAttributes', node);
                    evt.return = true;
                }
                if (listUtils.isNumberedListType(listType) && node.getAttribute('htmlUlAttributes')) {
                    writer.removeAttribute('htmlUlAttributes', node);
                    evt.return = true;
                }
            }
        });
    }
    /**
	 * @inheritDoc
	 */ afterInit() {
        const editor = this.editor;
        if (!editor.commands.get('indentList')) {
            return;
        }
        // Reset list attributes after indenting list items.
        const indentList = editor.commands.get('indentList');
        this.listenTo(indentList, 'afterExecute', (evt, changedBlocks)=>{
            editor.model.change((writer)=>{
                for (const node of changedBlocks){
                    const attribute = getAttributeFromListType(node.getAttribute('listType'));
                    if (!editor.model.schema.checkAttribute(node, attribute)) {
                        continue;
                    }
                    // Just reset the attribute.
                    // If there is a previous indented list that this node should be merged into,
                    // the postfixer will unify all the attributes of both sub-lists.
                    writer.setAttribute(attribute, {}, node);
                }
            });
        });
    }
}
/**
 * View-to-model conversion helper preserving allowed attributes on {@link TODO}
 * feature model element.
 *
 * @returns Returns a conversion callback.
 */ function viewToModelListAttributeConverter(attributeName, dataFilter) {
    return (evt, data, conversionApi)=>{
        const viewElement = data.viewItem;
        if (!data.modelRange) {
            Object.assign(data, conversionApi.convertChildren(data.viewItem, data.modelCursor));
        }
        const viewAttributes = dataFilter.processViewAttributes(viewElement, conversionApi);
        for (const item of data.modelRange.getItems({
            shallow: true
        })){
            // Apply only to list item blocks.
            if (!item.hasAttribute('listItemId')) {
                continue;
            }
            // Set list attributes only on same level items, those nested deeper are already handled
            // by the recursive conversion.
            if (item.hasAttribute('htmlUlAttributes') || item.hasAttribute('htmlOlAttributes')) {
                continue;
            }
            if (conversionApi.writer.model.schema.checkAttribute(item, attributeName)) {
                conversionApi.writer.setAttribute(attributeName, viewAttributes || {}, item);
            }
        }
    };
}
/**
 * Returns HTML attribute name based on provided list type.
 */ function getAttributeFromListType(listType) {
    return listType === 'numbered' || listType == 'customNumbered' ? 'htmlOlAttributes' : 'htmlUlAttributes';
}

/**
 * Provides the General HTML Support integration with the {@link module:horizontal-line/horizontalline~HorizontalLine} feature.
 */ class HorizontalLineElementSupport extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            DataFilter
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'HorizontalLineElementSupport';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        if (!editor.plugins.has('HorizontalLineEditing')) {
            return;
        }
        const schema = editor.model.schema;
        const conversion = editor.conversion;
        const dataFilter = editor.plugins.get(DataFilter);
        dataFilter.on('register:hr', (evt, definition)=>{
            if (definition.model !== 'horizontalLine') {
                return;
            }
            schema.extend('horizontalLine', {
                allowAttributes: [
                    'htmlHrAttributes'
                ]
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
 */ function modelToViewHorizontalLineAttributeConverter() {
    return (dispatcher)=>{
        dispatcher.on('attribute:htmlHrAttributes:horizontalLine', (evt, data, conversionApi)=>{
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
        }, {
            priority: 'low'
        });
    };
}

/**
 * Provides the General HTML Support integration for `iframe` elements with a mandatory sandbox attribute.
 */ class IframeElementSupport extends Plugin {
    /**
     * @inheritDoc
     */ static get requires() {
        return [
            DataFilter
        ];
    }
    /**
     * @inheritDoc
     */ static get pluginName() {
        return 'IframeElementSupport';
    }
    /**
     * @inheritDoc
     */ static get isOfficialPlugin() {
        return true;
    }
    /**
     * @inheritDoc
     */ init() {
        this.editor.config.define('htmlSupport.htmlIframeSandbox', true);
        this._setupSandboxConversion();
    }
    /**
	 * Sets up the conversion to enforce the sandbox attribute on `iframe` elements.
	 */ _setupSandboxConversion() {
        const { plugins, config, conversion } = this.editor;
        const dataFilter = plugins.get(DataFilter);
        const iframeSandboxConfig = config.get('htmlSupport.htmlIframeSandbox');
        if (iframeSandboxConfig === false) {
            return;
        }
        const allowedSandboxFlags = Array.isArray(iframeSandboxConfig) ? Array.from(iframeSandboxConfig) : [];
        dataFilter.on('register:iframe', (_, definition)=>{
            conversion.for('editingDowncast').add((dispatcher)=>{
                dispatcher.on(`insert:${definition.model}`, (_, data, conversionApi)=>{
                    const { mapper, writer } = conversionApi;
                    const viewElement = mapper.toViewElement(data.item);
                    for (const { item } of writer.createRangeOn(viewElement)){
                        if (!item.is('element', 'iframe')) {
                            continue;
                        }
                        if (item.hasAttribute('sandbox')) {
                            // If there is an existing sandbox attribute, read and filter out disallowed values.
                            const sandboxValues = new Set();
                            const existingSandbox = item.getAttribute('sandbox');
                            for (const value of existingSandbox.trim().split(/\s+/)){
                                if (allowedSandboxFlags.includes(value)) {
                                    sandboxValues.add(value);
                                }
                            }
                            writer.setAttribute('sandbox', Array.from(sandboxValues).join(' '), item);
                        } else {
                            // If there was no existing sandbox attribute, just use the configured one.
                            writer.setAttribute('sandbox', allowedSandboxFlags.join(' '), item);
                        }
                    }
                }, {
                    priority: 'lowest'
                });
            });
        });
    }
}

/**
 * Provides the General HTML Support for custom elements (not registered in the {@link module:html-support/dataschema~DataSchema}).
 */ class CustomElementSupport extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            DataFilter,
            DataSchema
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'CustomElementSupport';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const dataFilter = this.editor.plugins.get(DataFilter);
        const dataSchema = this.editor.plugins.get(DataSchema);
        dataFilter.on('register:$customElement', (evt, definition)=>{
            evt.stop();
            const editor = this.editor;
            const schema = editor.model.schema;
            const conversion = editor.conversion;
            const unsafeElements = editor.editing.view.domConverter.unsafeElements;
            const preLikeElements = editor.data.htmlProcessor.domConverter.preElements;
            schema.register(definition.model, definition.modelSchema);
            schema.extend(definition.model, {
                allowAttributes: [
                    'htmlElementName',
                    'htmlCustomElementAttributes',
                    'htmlContent'
                ],
                isContent: true
            });
            // For the `<template>` element we use only raw-content because DOM API exposes its content
            // only as a document fragment in the `content` property (or innerHTML).
            editor.data.htmlProcessor.domConverter.registerRawContentMatcher({
                name: 'template'
            });
            // Being executed on the low priority, it will catch all elements that were not caught by other converters.
            conversion.for('upcast').elementToElement({
                view: /.*/,
                model: (viewElement, conversionApi)=>{
                    // Do not try to convert $comment fake element.
                    if (viewElement.name == '$comment') {
                        return null;
                    }
                    // It is ignored intentionally because CI runs on latest Chrome.
                    /* istanbul ignore next -- @preserve */ if (!isValidElementName(viewElement.name)) {
                        return null;
                    }
                    // Allow for fallback only if this element is not defined in data schema to make sure
                    // that this will handle only custom elements not registered in the data schema.
                    if (dataSchema.getDefinitionsForView(viewElement.name).size) {
                        return null;
                    }
                    // Make sure that this element will not render in the editing view.
                    if (!unsafeElements.includes(viewElement.name)) {
                        unsafeElements.push(viewElement.name);
                    }
                    // Make sure that whitespaces will not be trimmed or replaced by nbsps while stringify content.
                    if (!preLikeElements.includes(viewElement.name)) {
                        preLikeElements.push(viewElement.name);
                    }
                    const modelElement = conversionApi.writer.createElement(definition.model, {
                        htmlElementName: viewElement.name
                    });
                    const htmlAttributes = dataFilter.processViewAttributes(viewElement, conversionApi);
                    if (htmlAttributes) {
                        conversionApi.writer.setAttribute('htmlCustomElementAttributes', htmlAttributes, modelElement);
                    }
                    let htmlContent;
                    // For the `<template>` element we use only raw-content because DOM API exposes its content
                    // only as a document fragment in the `content` property.
                    if (viewElement.is('element', 'template') && viewElement.getCustomProperty('$rawContent')) {
                        htmlContent = viewElement.getCustomProperty('$rawContent');
                    } else {
                        // Store the whole element in the attribute so that ViewDomConverter
                        // will be able to use the pre like element context.
                        const viewWriter = new ViewUpcastWriter(viewElement.document);
                        const documentFragment = viewWriter.createDocumentFragment(viewElement);
                        const domFragment = editor.data.htmlProcessor.domConverter.viewToDom(documentFragment);
                        const domElement = domFragment.firstChild;
                        while(domElement.firstChild){
                            domFragment.appendChild(domElement.firstChild);
                        }
                        domElement.remove();
                        htmlContent = editor.data.htmlProcessor.htmlWriter.getHtml(domFragment);
                    }
                    conversionApi.writer.setAttribute('htmlContent', htmlContent, modelElement);
                    // Consume the content of the element.
                    for (const { item } of editor.editing.view.createRangeIn(viewElement)){
                        conversionApi.consumable.consume(item, {
                            name: true
                        });
                    }
                    return modelElement;
                },
                converterPriority: 'low'
            });
            // Because this element is unsafe (DomConverter#unsafeElements), it will render as a transparent <span> but it must
            // be rendered anyway for the mapping between the model and the view to exist.
            conversion.for('editingDowncast').elementToElement({
                model: {
                    name: definition.model,
                    attributes: [
                        'htmlElementName',
                        'htmlCustomElementAttributes',
                        'htmlContent'
                    ]
                },
                view: (modelElement, { writer })=>{
                    const viewName = modelElement.getAttribute('htmlElementName');
                    const viewElement = writer.createRawElement(viewName);
                    if (modelElement.hasAttribute('htmlCustomElementAttributes')) {
                        setViewAttributes(writer, modelElement.getAttribute('htmlCustomElementAttributes'), viewElement);
                    }
                    return viewElement;
                }
            });
            conversion.for('dataDowncast').elementToElement({
                model: {
                    name: definition.model,
                    attributes: [
                        'htmlElementName',
                        'htmlCustomElementAttributes',
                        'htmlContent'
                    ]
                },
                view: (modelElement, { writer })=>{
                    const viewName = modelElement.getAttribute('htmlElementName');
                    const htmlContent = modelElement.getAttribute('htmlContent');
                    const viewElement = writer.createRawElement(viewName, null, (domElement, domConverter)=>{
                        domConverter.setContentOf(domElement, htmlContent);
                    });
                    if (modelElement.hasAttribute('htmlCustomElementAttributes')) {
                        setViewAttributes(writer, modelElement.getAttribute('htmlCustomElementAttributes'), viewElement);
                    }
                    return viewElement;
                }
            });
        });
    }
}
/**
 * Returns true if name is valid for a DOM element name.
 */ function isValidElementName(name) {
    try {
        document.createElement(name);
    } catch  {
        // It is ignored intentionally because CI runs on latest Chrome.
        /* istanbul ignore next -- @preserve */ return false;
    }
    return true;
}

/**
 * The General HTML Support feature.
 *
 * This is a "glue" plugin which initializes the {@link module:html-support/datafilter~DataFilter data filter} configuration
 * and features integration with the General HTML Support.
 */ class GeneralHtmlSupport extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'GeneralHtmlSupport';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            DataFilter,
            CodeBlockElementSupport,
            DualContentModelElementSupport,
            HeadingElementSupport,
            ImageElementSupport,
            MediaEmbedElementSupport,
            ScriptElementSupport,
            TableElementSupport,
            StyleElementSupport,
            ListElementSupport,
            HorizontalLineElementSupport,
            IframeElementSupport,
            CustomElementSupport
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const dataFilter = editor.plugins.get(DataFilter);
        // Load the allowed empty inline elements' configuration.
        // Note that this modifies DataSchema so must be loaded before registering filtering rules.
        dataFilter.loadAllowedEmptyElementsConfig(editor.config.get('htmlSupport.allowEmpty') || []);
        // Load the filtering configuration.
        dataFilter.loadAllowedConfig(editor.config.get('htmlSupport.allow') || []);
        dataFilter.loadDisallowedConfig(editor.config.get('htmlSupport.disallow') || []);
    }
    /**
	 * @inheritDoc
	 */ afterInit() {
        const removeFormatCommand = this.editor.commands.get('removeFormat');
        removeFormatCommand?.registerCustomAttribute((attributeName)=>attributeName.startsWith('html') && attributeName.endsWith('Attributes'), removeFormatting);
    }
    /**
	 * Returns a GHS model attribute name related to a given view element name.
	 *
	 * @internal
	 * @param viewElementName A view element name.
	 */ getGhsAttributeNameForElement(viewElementName) {
        const dataSchema = this.editor.plugins.get('DataSchema');
        const definitions = Array.from(dataSchema.getDefinitionsForView(viewElementName, false));
        const inlineDefinition = definitions.find((definition)=>definition.isInline && !definitions[0].isObject);
        if (inlineDefinition) {
            return inlineDefinition.model;
        }
        return getHtmlAttributeName(viewElementName);
    }
    /**
	 * Updates GHS model attribute for a specified view element name, so it includes the given class name.
	 *
	 * @internal
	 * @param viewElementName A view element name.
	 * @param className The css class to add.
	 * @param selectable The selection or element to update.
	 */ addModelHtmlClass(viewElementName, className, selectable) {
        const model = this.editor.model;
        const ghsAttributeName = this.getGhsAttributeNameForElement(viewElementName);
        model.change((writer)=>{
            for (const item of getItemsToUpdateGhsAttribute(model, selectable, ghsAttributeName)){
                modifyGhsAttribute(writer, item, ghsAttributeName, 'classes', (classes)=>{
                    for (const value of toArray(className)){
                        classes.add(value);
                    }
                });
            }
        });
    }
    /**
	 * Updates GHS model attribute for a specified view element name, so it does not include the given class name.
	 *
	 * @internal
	 * @param viewElementName A view element name.
	 * @param className The css class to remove.
	 * @param selectable The selection or element to update.
	 */ removeModelHtmlClass(viewElementName, className, selectable) {
        const model = this.editor.model;
        const ghsAttributeName = this.getGhsAttributeNameForElement(viewElementName);
        model.change((writer)=>{
            for (const item of getItemsToUpdateGhsAttribute(model, selectable, ghsAttributeName)){
                modifyGhsAttribute(writer, item, ghsAttributeName, 'classes', (classes)=>{
                    for (const value of toArray(className)){
                        classes.delete(value);
                    }
                });
            }
        });
    }
    /**
	 * Updates GHS model attribute for a specified view element name, so it includes the given attribute.
	 *
	 * @param viewElementName A view element name.
	 * @param attributes The object with attributes to set.
	 * @param selectable The selection or element to update.
	 */ setModelHtmlAttributes(viewElementName, attributes, selectable) {
        const model = this.editor.model;
        const ghsAttributeName = this.getGhsAttributeNameForElement(viewElementName);
        model.change((writer)=>{
            for (const item of getItemsToUpdateGhsAttribute(model, selectable, ghsAttributeName)){
                modifyGhsAttribute(writer, item, ghsAttributeName, 'attributes', (attributesMap)=>{
                    for (const [key, value] of Object.entries(attributes)){
                        attributesMap.set(key, value);
                    }
                });
            }
        });
    }
    /**
	 * Updates GHS model attribute for a specified view element name, so it does not include the given attribute.
	 *
	 * @param viewElementName A view element name.
	 * @param attributeName The attribute name (or names) to remove.
	 * @param selectable The selection or element to update.
	 */ removeModelHtmlAttributes(viewElementName, attributeName, selectable) {
        const model = this.editor.model;
        const ghsAttributeName = this.getGhsAttributeNameForElement(viewElementName);
        model.change((writer)=>{
            for (const item of getItemsToUpdateGhsAttribute(model, selectable, ghsAttributeName)){
                modifyGhsAttribute(writer, item, ghsAttributeName, 'attributes', (attributesMap)=>{
                    for (const key of toArray(attributeName)){
                        attributesMap.delete(key);
                    }
                });
            }
        });
    }
    /**
	 * Updates GHS model attribute for a specified view element name, so it includes a given style.
	 *
	 * @param viewElementName A view element name.
	 * @param styles The object with styles to set.
	 * @param selectable The selection or element to update.
	 */ setModelHtmlStyles(viewElementName, styles, selectable) {
        const model = this.editor.model;
        const ghsAttributeName = this.getGhsAttributeNameForElement(viewElementName);
        model.change((writer)=>{
            for (const item of getItemsToUpdateGhsAttribute(model, selectable, ghsAttributeName)){
                modifyGhsAttribute(writer, item, ghsAttributeName, 'styles', (stylesMap)=>{
                    for (const [key, value] of Object.entries(styles)){
                        stylesMap.set(key, value);
                    }
                });
            }
        });
    }
    /**
	 * Updates GHS model attribute for a specified view element name, so it does not include a given style.
	 *
	 * @param viewElementName A view element name.
	 * @param properties The style (or styles list) to remove.
	 * @param selectable The selection or element to update.
	 */ removeModelHtmlStyles(viewElementName, properties, selectable) {
        const model = this.editor.model;
        const ghsAttributeName = this.getGhsAttributeNameForElement(viewElementName);
        model.change((writer)=>{
            for (const item of getItemsToUpdateGhsAttribute(model, selectable, ghsAttributeName)){
                modifyGhsAttribute(writer, item, ghsAttributeName, 'styles', (stylesMap)=>{
                    for (const key of toArray(properties)){
                        stylesMap.delete(key);
                    }
                });
            }
        });
    }
}
/**
 * Returns an iterator over an items in the selectable that accept given GHS attribute.
 */ function* getItemsToUpdateGhsAttribute(model, selectable, ghsAttributeName) {
    if (!selectable) {
        return;
    }
    if (!(Symbol.iterator in selectable) && selectable.is('documentSelection') && selectable.isCollapsed) {
        if (model.schema.checkAttributeInSelection(selectable, ghsAttributeName)) {
            yield selectable;
        }
    } else {
        for (const range of getValidRangesForSelectable(model, selectable, ghsAttributeName)){
            yield* range.getItems({
                shallow: true
            });
        }
    }
}
/**
 * Translates a given selectable to an iterable of ranges.
 */ function getValidRangesForSelectable(model, selectable, ghsAttributeName) {
    if (!(Symbol.iterator in selectable) && (selectable.is('node') || selectable.is('$text') || selectable.is('$textProxy'))) {
        if (model.schema.checkAttribute(selectable, ghsAttributeName)) {
            return [
                model.createRangeOn(selectable)
            ];
        } else {
            return [];
        }
    } else {
        return model.schema.getValidRanges(model.createSelection(selectable).getRanges(), ghsAttributeName);
    }
}

/**
 * The HTML comment feature. It preserves the HTML comments (`<!-- -->`) in the editor data.
 *
 * For a detailed overview, check the {@glink features/html/html-comments HTML comment feature documentation}.
 */ class HtmlComment extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'HtmlComment';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const loadedCommentsContent = new Map();
        editor.data.processor.skipComments = false;
        // Allow storing comment's content as the $root attribute with the name `$comment:<unique id>`.
        editor.model.schema.addAttributeCheck((context, attributeName)=>{
            if (context.endsWith('$root') && attributeName.startsWith('$comment')) {
                return true;
            }
        });
        // Convert the `$comment` view element to `$comment:<unique id>` marker and store its content (the comment itself) as a $root
        // attribute. The comment content is needed in the `dataDowncast` pipeline to re-create the comment node.
        editor.conversion.for('upcast').elementToMarker({
            view: '$comment',
            model: (viewElement)=>{
                const markerUid = uid();
                const markerName = `$comment:${markerUid}`;
                const commentContent = viewElement.getCustomProperty('$rawContent');
                loadedCommentsContent.set(markerName, commentContent);
                return markerName;
            }
        });
        // Convert the `$comment` marker to `$comment` UI element with `$rawContent` custom property containing the comment content.
        editor.conversion.for('dataDowncast').markerToElement({
            model: '$comment',
            view: (modelElement, { writer })=>{
                let root = undefined;
                for (const rootName of this.editor.model.document.getRootNames()){
                    root = this.editor.model.document.getRoot(rootName);
                    if (root.hasAttribute(modelElement.markerName)) {
                        break;
                    }
                }
                const markerName = modelElement.markerName;
                const commentContent = root.getAttribute(markerName);
                const comment = writer.createUIElement('$comment');
                writer.setCustomProperty('$rawContent', commentContent, comment);
                return comment;
            }
        });
        // Remove comments' markers and their corresponding $root attributes, which are moved to the graveyard.
        editor.model.document.registerPostFixer((writer)=>{
            let changed = false;
            const markers = editor.model.document.differ.getChangedMarkers().filter((marker)=>marker.name.startsWith('$comment:'));
            for (const marker of markers){
                const { oldRange, newRange } = marker.data;
                if (oldRange && newRange && oldRange.root == newRange.root) {
                    continue;
                }
                if (oldRange) {
                    // The comment marker was moved from one root to another (most probably to the graveyard).
                    // Remove the related attribute from the previous root.
                    const oldRoot = oldRange.root;
                    if (oldRoot.hasAttribute(marker.name)) {
                        writer.removeAttribute(marker.name, oldRoot);
                        changed = true;
                    }
                }
                if (newRange) {
                    const newRoot = newRange.root;
                    if (newRoot.rootName == '$graveyard') {
                        // Comment marker was moved to the graveyard -- remove it entirely.
                        writer.removeMarker(marker.name);
                        changed = true;
                    } else if (!newRoot.hasAttribute(marker.name)) {
                        // Comment marker was just added or was moved to another root - updated roots attributes.
                        //
                        // Added fallback to `''` for the comment content in case if someone incorrectly added just the marker "by hand"
                        // and forgot to add the root attribute or add them in different change blocks.
                        //
                        // It caused an infinite loop in one of the unit tests.
                        writer.setAttribute(marker.name, loadedCommentsContent.get(marker.name) || '', newRoot);
                        changed = true;
                    }
                }
            }
            return changed;
        });
        // Delete all comment markers from the document before setting new data.
        editor.data.on('set', ()=>{
            for (const commentMarker of editor.model.markers.getMarkersGroup('$comment')){
                this.removeHtmlComment(commentMarker.name);
            }
        }, {
            priority: 'high'
        });
        // Delete all comment markers that are within a removed range.
        // Delete all comment markers at the limit element boundaries if the whole content of the limit element is removed.
        editor.model.on('deleteContent', (evt, [selection])=>{
            for (const range of selection.getRanges()){
                const limitElement = editor.model.schema.getLimitElement(range);
                const firstPosition = editor.model.createPositionAt(limitElement, 0);
                const lastPosition = editor.model.createPositionAt(limitElement, 'end');
                let affectedCommentIDs;
                if (firstPosition.isTouching(range.start) && lastPosition.isTouching(range.end)) {
                    affectedCommentIDs = this.getHtmlCommentsInRange(editor.model.createRange(firstPosition, lastPosition));
                } else {
                    affectedCommentIDs = this.getHtmlCommentsInRange(range, {
                        skipBoundaries: true
                    });
                }
                for (const commentMarkerID of affectedCommentIDs){
                    this.removeHtmlComment(commentMarkerID);
                }
            }
        }, {
            priority: 'high'
        });
    }
    /**
	 * Creates an HTML comment on the specified position and returns its ID.
	 *
	 * *Note*: If two comments are created at the same position, the second comment will be inserted before the first one.
	 *
	 * @returns Comment ID. This ID can be later used to e.g. remove the comment from the content.
	 */ createHtmlComment(position, content) {
        const id = uid();
        const editor = this.editor;
        const model = editor.model;
        const root = model.document.getRoot(position.root.rootName);
        const markerName = `$comment:${id}`;
        return model.change((writer)=>{
            const range = writer.createRange(position);
            writer.addMarker(markerName, {
                usingOperation: true,
                affectsData: true,
                range
            });
            writer.setAttribute(markerName, content, root);
            return markerName;
        });
    }
    /**
	 * Removes an HTML comment with the given comment ID.
	 *
	 * It does nothing and returns `false` if the comment with the given ID does not exist.
	 * Otherwise it removes the comment and returns `true`.
	 *
	 * Note that a comment can be removed also by removing the content around the comment.
	 *
	 * @param commentID The ID of the comment to be removed.
	 * @returns `true` when the comment with the given ID was removed, `false` otherwise.
	 */ removeHtmlComment(commentID) {
        const editor = this.editor;
        const marker = editor.model.markers.get(commentID);
        if (!marker) {
            return false;
        }
        editor.model.change((writer)=>{
            writer.removeMarker(marker);
        });
        return true;
    }
    /**
	 * Gets the HTML comment data for the comment with a given ID.
	 *
	 * Returns `null` if the comment does not exist.
	 */ getHtmlCommentData(commentID) {
        const editor = this.editor;
        const marker = editor.model.markers.get(commentID);
        if (!marker) {
            return null;
        }
        let content = '';
        for (const root of this.editor.model.document.getRoots()){
            if (root.hasAttribute(commentID)) {
                content = root.getAttribute(commentID);
                break;
            }
        }
        return {
            content,
            position: marker.getStart()
        };
    }
    /**
	 * Gets all HTML comments in the given range.
	 *
	 * By default, it includes comments at the range boundaries.
	 *
	 * @param range The range to search for HTML comments.
	 * @param options Additional options.
	 * @param options.skipBoundaries When set to `true` the range boundaries will be skipped.
	 * @returns HTML comment IDs
	 */ getHtmlCommentsInRange(range, { skipBoundaries = false } = {}) {
        const includeBoundaries = !skipBoundaries;
        // Unfortunately, MarkerCollection#getMarkersAtPosition() filters out collapsed markers.
        return Array.from(this.editor.model.markers.getMarkersGroup('$comment')).filter((marker)=>isCommentMarkerInRange(marker, range)).map((marker)=>marker.name);
        function isCommentMarkerInRange(commentMarker, range) {
            const position = commentMarker.getRange().start;
            return (position.isAfter(range.start) || includeBoundaries && position.isEqual(range.start)) && (position.isBefore(range.end) || includeBoundaries && position.isEqual(range.end));
        }
    }
}

/**
 * The full page HTML data processor class.
 * This data processor implementation uses HTML as input and output data.
 */ class HtmlPageDataProcessor extends HtmlDataProcessor {
    /**
	 * @inheritDoc
	 */ toView(data) {
        // Ignore content that is not a full page source.
        if (!/<(?:html|body|head|meta)(?:\s[^>]*)?>/i.test(data.trim().slice(0, 10_000))) {
            return super.toView(data);
        }
        // Store doctype and xml declaration in a separate properties as they can't be stringified later.
        let docType = '';
        let xmlDeclaration = '';
        data = data.trim().replace(/<\?xml\s[^?]*\?>/i, (match)=>{
            xmlDeclaration = match;
            return '';
        });
        data = data.trim().replace(/^<!DOCTYPE\s[^>]*?>/i, (match)=>{
            docType = match;
            return '';
        });
        // Convert input HTML data to DOM DocumentFragment.
        const domFragment = this._toDom(data);
        // Convert DOM DocumentFragment to view DocumentFragment.
        const viewFragment = this.domConverter.domToView(domFragment, {
            skipComments: this.skipComments
        });
        const writer = new ViewUpcastWriter(viewFragment.document);
        // Using the DOM document with body content extracted as a skeleton of the page.
        writer.setCustomProperty('$fullPageDocument', domFragment.ownerDocument.documentElement.outerHTML, viewFragment);
        // List of `<style>` elements extracted from document's `<head>` element.
        const headStylesElements = Array.from(domFragment.ownerDocument.querySelectorAll('head style'));
        writer.setCustomProperty('$fullPageHeadStyles', headStylesElements, viewFragment);
        if (docType) {
            writer.setCustomProperty('$fullPageDocType', docType, viewFragment);
        }
        if (xmlDeclaration) {
            writer.setCustomProperty('$fullPageXmlDeclaration', xmlDeclaration, viewFragment);
        }
        return viewFragment;
    }
    /**
	 * @inheritDoc
	 */ toData(viewFragment) {
        let data = super.toData(viewFragment);
        const page = viewFragment.getCustomProperty('$fullPageDocument');
        const docType = viewFragment.getCustomProperty('$fullPageDocType');
        const xmlDeclaration = viewFragment.getCustomProperty('$fullPageXmlDeclaration');
        if (page) {
            data = page.replace(/<\/body\s*>/, data + '$&');
            if (docType) {
                data = docType + '\n' + data;
            }
            if (xmlDeclaration) {
                data = xmlDeclaration + '\n' + data;
            }
        }
        return data;
    }
}

/**
 * The full page editing feature. It preserves the whole HTML page in the editor data.
 */ class FullPage extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'FullPage';
    }
    /**
	 * @inheritDoc
	 * @internal
	 */ static get licenseFeatureCode() {
        return 'FPH';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get isPremiumPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        editor.config.define('htmlSupport.fullPage', {
            allowRenderStylesFromHead: false,
            sanitizeCss: (rawCss)=>{
                /**
				 * When using the Full page with the `config.htmlSupport.fullPage.allowRenderStylesFromHead` set to `true`,
				 * it is strongly recommended to define a sanitize function that will clean up the CSS
				 * which is present in the `<head>` in editors content in order to avoid XSS vulnerability.
				 *
				 * For a detailed overview, check the {@glink features/html/full-page-html Full page HTML feature} documentation.
				 *
				 * @error css-full-page-provide-sanitize-function
				 */ logWarning('css-full-page-provide-sanitize-function');
                return {
                    css: rawCss,
                    hasChanged: false
                };
            }
        });
        editor.data.processor = new HtmlPageDataProcessor(editor.data.viewDocument);
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const properties = [
            '$fullPageDocument',
            '$fullPageDocType',
            '$fullPageXmlDeclaration',
            '$fullPageHeadStyles'
        ];
        editor.model.schema.extend('$root', {
            allowAttributes: properties
        });
        // Apply custom properties from view document fragment to the model root attributes.
        editor.data.on('toModel', (evt, [viewElementOrFragment])=>{
            const root = editor.model.document.getRoot();
            editor.model.change((writer)=>{
                for (const name of properties){
                    const value = viewElementOrFragment.getCustomProperty(name);
                    if (value) {
                        writer.setAttribute(name, value, root);
                    }
                }
            });
            if (isAllowedRenderStylesFromHead(editor)) {
                this._renderStylesFromHead(root);
            }
        }, {
            priority: 'low'
        });
        // Apply root attributes to the view document fragment.
        editor.data.on('toView', (evt, [modelElementOrFragment])=>{
            if (!modelElementOrFragment.is('rootElement')) {
                return;
            }
            const root = modelElementOrFragment;
            const viewFragment = evt.return;
            if (!root.hasAttribute('$fullPageDocument')) {
                return;
            }
            const writer = new ViewUpcastWriter(viewFragment.document);
            for (const name of properties){
                const value = root.getAttribute(name);
                if (value) {
                    writer.setCustomProperty(name, value, viewFragment);
                }
            }
        }, {
            priority: 'low'
        });
        // Clear root attributes related to full page editing on editor content reset.
        editor.data.on('set', ()=>{
            const root = editor.model.document.getRoot();
            editor.model.change((writer)=>{
                for (const name of properties){
                    if (root.hasAttribute(name)) {
                        writer.removeAttribute(name, root);
                    }
                }
            });
        }, {
            priority: 'high'
        });
        // Make sure that document is returned even if there is no content in the page body.
        editor.data.on('get', (evt, args)=>{
            if (!args[0]) {
                args[0] = {};
            }
            args[0].trim = false;
        }, {
            priority: 'high'
        });
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        if (isAllowedRenderStylesFromHead(this.editor)) {
            this._removeStyleElementsFromDom();
        }
    }
    /**
	 * Checks if in the document exists any `<style>` elements injected by the plugin and removes them,
	 * so these could be re-rendered later.
	 * There is used `data-full-page-style-id` attribute to recognize styles injected by the feature.
	 */ _removeStyleElementsFromDom() {
        const existingStyleElements = Array.from(global.document.querySelectorAll(`[data-full-page-style-id="${this.editor.id}"]`));
        for (const style of existingStyleElements){
            style.remove();
        }
    }
    /**
	 * Extracts `<style>` elements from the full page data and renders them in the main document `<head>`.
	 * CSS content is sanitized before rendering.
	 */ _renderStyleElementsInDom(root) {
        const editor = this.editor;
        // Get `<style>` elements list from the `<head>` from the full page data.
        const styleElements = root.getAttribute('$fullPageHeadStyles');
        if (!styleElements) {
            return;
        }
        const sanitizeCss = editor.config.get('htmlSupport.fullPage.sanitizeCss');
        // Add `data-full-page-style-id` attribute to the `<style>` element and render it in `<head>` in the main document.
        for (const style of styleElements){
            style.setAttribute('data-full-page-style-id', editor.id);
            // Sanitize the CSS content before rendering it in the editor.
            const sanitizedCss = sanitizeCss(style.innerText);
            if (sanitizedCss.hasChanged) {
                style.innerText = sanitizedCss.css;
            }
            global.document.head.append(style);
        }
    }
    /**
	 * Removes existing `<style>` elements injected by the plugin and renders new ones from the full page data.
	 */ _renderStylesFromHead(root) {
        this._removeStyleElementsFromDom();
        this._renderStyleElementsInDom(root);
    }
}
/**
 * Normalize the Full page configuration option `allowRenderStylesFromHead`.
 */ function isAllowedRenderStylesFromHead(editor) {
    return editor.config.get('htmlSupport.fullPage.allowRenderStylesFromHead');
}

const EMPTY_BLOCK_MODEL_ATTRIBUTE = 'htmlEmptyBlock';
/**
 * This plugin allows for preserving empty block elements in the editor content
 * instead of automatically filling them with block fillers (`&nbsp;`).
 *
 * This is useful when you want to:
 *
 * * Preserve empty block elements exactly as they were in the source HTML.
 * * Allow for styling empty blocks with CSS (block fillers can interfere with height/margin).
 * * Maintain compatibility with external systems that expect empty blocks to remain empty.
 *
 * Known limitations:
 *
 * * Empty blocks may not work correctly with revision history features.
 * * Keyboard navigation through the document might behave unexpectedly, especially when
 *   navigating through structures like lists and tables.
 *
 * For example, this allows for HTML like:
 *
 * ```html
 * <p></p>
 * <p class="spacer"></p>
 * <td></td>
 * ```
 * to remain empty instead of being converted to:
 *
 * ```html
 * <p>&nbsp;</p>
 * <p class="spacer">&nbsp;</p>
 * <td>&nbsp;</td>
 * ```
 */ class EmptyBlock extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'EmptyBlock';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ afterInit() {
        const { model, conversion, plugins, config } = this.editor;
        const schema = model.schema;
        const preserveEmptyBlocksInEditingView = config.get('htmlSupport.preserveEmptyBlocksInEditingView');
        schema.extend('$block', {
            allowAttributes: [
                EMPTY_BLOCK_MODEL_ATTRIBUTE
            ]
        });
        schema.extend('$container', {
            allowAttributes: [
                EMPTY_BLOCK_MODEL_ATTRIBUTE
            ]
        });
        if (schema.isRegistered('tableCell')) {
            schema.extend('tableCell', {
                allowAttributes: [
                    EMPTY_BLOCK_MODEL_ATTRIBUTE
                ]
            });
        }
        if (preserveEmptyBlocksInEditingView) {
            conversion.for('downcast').add(createEmptyBlockDowncastConverter());
        } else {
            conversion.for('dataDowncast').add(createEmptyBlockDowncastConverter());
        }
        conversion.for('upcast').add(createEmptyBlockUpcastConverter(schema));
        if (plugins.has('ClipboardPipeline')) {
            this._registerClipboardPastingHandler();
        }
    }
    /**
	 * Handle clipboard paste events:
	 *
	 * * It does not affect *copying* content from the editor, only *pasting*.
	 * * When content is pasted from another editor instance with `<p></p>`,
	 *   the `&nbsp;` filler is added, so the getData result is `<p>&nbsp;</p>`.
	 * * When content is pasted from the same editor instance with `<p></p>`,
	 *   the `&nbsp;` filler is not added, so the getData result is `<p></p>`.
	 */ _registerClipboardPastingHandler() {
        const clipboardPipeline = this.editor.plugins.get('ClipboardPipeline');
        this.listenTo(clipboardPipeline, 'contentInsertion', (evt, data)=>{
            if (data.sourceEditorId === this.editor.id) {
                return;
            }
            this.editor.model.change((writer)=>{
                for (const { item } of writer.createRangeIn(data.content)){
                    if (item.is('element') && item.hasAttribute(EMPTY_BLOCK_MODEL_ATTRIBUTE)) {
                        writer.removeAttribute(EMPTY_BLOCK_MODEL_ATTRIBUTE, item);
                    }
                }
            });
        });
    }
}
/**
 * Creates a downcast converter for handling empty blocks.
 * This converter prevents filler elements from being added to elements marked as empty blocks.
 */ function createEmptyBlockDowncastConverter() {
    return (dispatcher)=>{
        dispatcher.on(`attribute:${EMPTY_BLOCK_MODEL_ATTRIBUTE}`, (evt, data, conversionApi)=>{
            const { mapper, consumable } = conversionApi;
            const { item } = data;
            if (!consumable.consume(item, evt.name)) {
                return;
            }
            const viewElement = mapper.toViewElement(item);
            if (viewElement && data.attributeNewValue) {
                viewElement.getFillerOffset = ()=>null;
            }
        });
    };
}
/**
 * Creates an upcast converter for handling empty blocks.
 * The converter detects empty elements and marks them with the empty block attribute.
 */ function createEmptyBlockUpcastConverter(schema) {
    return (dispatcher)=>{
        dispatcher.on('element', (evt, data, conversionApi)=>{
            const { viewItem, modelRange } = data;
            if (!viewItem.is('element') || !viewItem.isEmpty || viewItem.getCustomProperty('$hasBlockFiller')) {
                return;
            }
            // Handle element itself.
            const modelElement = modelRange && modelRange.start.nodeAfter;
            if (!modelElement || !schema.checkAttribute(modelElement, EMPTY_BLOCK_MODEL_ATTRIBUTE)) {
                return;
            }
            conversionApi.writer.setAttribute(EMPTY_BLOCK_MODEL_ATTRIBUTE, true, modelElement);
            // Handle an auto-paragraphed bogus paragraph inside empty element.
            if (modelElement.childCount != 1) {
                return;
            }
            const firstModelChild = modelElement.getChild(0);
            if (firstModelChild.is('element', 'paragraph') && schema.checkAttribute(firstModelChild, EMPTY_BLOCK_MODEL_ATTRIBUTE)) {
                conversionApi.writer.setAttribute(EMPTY_BLOCK_MODEL_ATTRIBUTE, true, firstModelChild);
            }
        }, {
            priority: 'lowest'
        });
    };
}

export { CodeBlockElementSupport, CustomElementSupport, DataFilter, DataSchema, DualContentModelElementSupport, EmptyBlock, FullPage, GeneralHtmlSupport, HeadingElementSupport, HorizontalLineElementSupport, HtmlComment, HtmlPageDataProcessor, IframeElementSupport, ImageElementSupport, ListElementSupport, MediaEmbedElementSupport, ScriptElementSupport, StyleElementSupport, TableElementSupport, defaultConfig as _HTML_SUPPORT_SCHEMA_DEFINITIONS, attributeToViewInlineConverter as _attributeToInlineHtmlSupportConverter, createObjectView as _createObjectHtmlSupportView, emptyInlineModelElementToViewConverter as _emptyInlineModelElementToViewHtmlSupportConverter, getHtmlAttributeName as _getHtmlSupportAttributeName, getDescendantElement as _getHtmlSupportDescendantElement, mergeViewElementAttributes as _mergeHtmlSupportViewElementAttributes, modelToViewBlockAttributeConverter as _modelToViewBlockAttributeHtmlSupportConverter, modifyGhsAttribute as _modifyHtmlSupportGhsAttribute, removeViewAttributes as _removeHtmlSupportViewAttributes, setViewAttributes as _setHtmlSupportViewAttributes, toPascalCase as _toHtmlSupportPascalCase, toObjectWidgetConverter as _toObjectWidgetHtmlSupportConverter, updateViewAttributes as _updateHtmlSupportViewAttributes, viewToAttributeInlineConverter as _viewToAttributeInlineHtmlSupportConverter, viewToModelBlockAttributeConverter as _viewToModelBlockAttributeHtmlSupportConverter, viewToModelObjectConverter as _viewToModelObjectContentHtmlSupportConverter };
//# sourceMappingURL=index.js.map
