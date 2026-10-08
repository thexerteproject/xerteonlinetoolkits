/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module html-support/converters
 */
import type { Editor } from 'ckeditor5/src/core.js';
import type { ViewAttributeElement, DowncastConversionApi, DowncastDispatcher, ViewDowncastWriter, ModelElement, DowncastElementCreatorFunction, UpcastConversionApi, UpcastDispatcher, ViewElement } from 'ckeditor5/src/engine.js';
import { type DataFilter } from './datafilter.js';
import type { HtmlSupportDataSchemaBlockElementDefinition, HtmlSupportDataSchemaDefinition, HtmlSupportDataSchemaInlineElementDefinition } from './dataschema.js';
/**
 * View-to-model conversion helper for object elements.
 *
 * Preserves object element content in `htmlContent` attribute.
 *
 * @returns Returns a conversion callback.
 * @internal
*/
export declare function viewToModelObjectConverter({ model: modelName }: HtmlSupportDataSchemaDefinition): (viewElement: ViewElement, conversionApi: UpcastConversionApi) => ModelElement;
/**
 * Conversion helper converting an object element to an HTML object widget.
 *
 * @returns Returns a conversion callback.
 * @internal
*/
export declare function toObjectWidgetConverter(editor: Editor, { view: viewName, isInline }: HtmlSupportDataSchemaInlineElementDefinition): DowncastElementCreatorFunction;
/**
* Creates object view element from the given model element.
*
* @internal
*/
export declare function createObjectView(viewName: string, modelElement: ModelElement, writer: ViewDowncastWriter): ViewElement;
/**
 * View-to-attribute conversion helper preserving inline element attributes on `$text`.
 *
 * @returns Returns a conversion callback.
 * @internal
*/
export declare function viewToAttributeInlineConverter({ view: viewName, model: attributeKey, allowEmpty }: HtmlSupportDataSchemaInlineElementDefinition, dataFilter: DataFilter): (dispatcher: UpcastDispatcher) => void;
/**
 * Conversion helper converting an empty inline model element to an HTML element or widget.
 *
 * @internal
 */
export declare function emptyInlineModelElementToViewConverter({ model: attributeKey, view: viewName }: HtmlSupportDataSchemaInlineElementDefinition, asWidget?: boolean): DowncastElementCreatorFunction;
/**
 * Attribute-to-view conversion helper applying attributes to view element preserved on `$text`.
 *
 * @returns Returns a conversion callback.
 * @internal
*/
export declare function attributeToViewInlineConverter({ priority, view: viewName }: HtmlSupportDataSchemaInlineElementDefinition): (attributeValue: any, conversionApi: DowncastConversionApi) => ViewAttributeElement | undefined;
/**
 * View-to-model conversion helper preserving allowed attributes on block element.
 *
 * All matched attributes will be preserved on `html*Attributes` attribute.
 *
 * @returns Returns a conversion callback.
 * @internal
*/
export declare function viewToModelBlockAttributeConverter({ view: viewName }: HtmlSupportDataSchemaBlockElementDefinition, dataFilter: DataFilter): (dispatcher: UpcastDispatcher) => void;
/**
 * Model-to-view conversion helper applying attributes preserved in `html*Attributes` attribute
 * for block elements.
 *
 * @returns Returns a conversion callback.
 * @internal
*/
export declare function modelToViewBlockAttributeConverter({ view: viewName, model: modelName }: HtmlSupportDataSchemaBlockElementDefinition): (dispatcher: DowncastDispatcher) => void;
