/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { type MatchClassPatterns, type MatcherPattern, type MatchPropertyPatterns } from '../view/matcher.js';
import { ConversionHelpers } from './conversionhelpers.js';
import type { UpcastDispatcher, UpcastConversionApi, UpcastConversionData } from './upcastdispatcher.js';
import { type ModelElement } from '../model/element.js';
import type { ViewDocumentFragment, ViewElement, ViewText } from '../index.js';
import { type Mapper } from './mapper.js';
import { type Model } from '../model/model.js';
import { type ViewSelection } from '../view/selection.js';
import { type ViewDocumentSelection } from '../view/documentselection.js';
import { type EventInfo, type PriorityString } from '@ckeditor/ckeditor5-utils';
/**
 * Contains the {@link module:engine/view/view view} to {@link module:engine/model/model model} converters for
 * {@link module:engine/conversion/upcastdispatcher~UpcastDispatcher}.
 *
 * @module engine/conversion/upcasthelpers
 */
/**
 * Upcast conversion helper functions.
 *
 * Learn more about {@glink framework/deep-dive/conversion/upcast upcast helpers}.
 *
 * @extends module:engine/conversion/conversionhelpers~ConversionHelpers
 */
export declare class UpcastHelpers extends ConversionHelpers<UpcastDispatcher> {
    /**
     * View element to model element conversion helper.
     *
     * This conversion results in creating a model element. For example,
     * view `<p>Foo</p>` becomes `<paragraph>Foo</paragraph>` in the model.
     *
     * Keep in mind that the element will be inserted only if it is allowed
     * by {@link module:engine/model/schema~ModelSchema schema} configuration.
     *
     * ```ts
     * editor.conversion.for( 'upcast' ).elementToElement( {
     * 	view: 'p',
     * 	model: 'paragraph'
     * } );
     *
     * editor.conversion.for( 'upcast' ).elementToElement( {
     * 	view: 'p',
     * 	model: 'paragraph',
     * 	converterPriority: 'high'
     * } );
     *
     * editor.conversion.for( 'upcast' ).elementToElement( {
     * 	view: {
     * 		name: 'p',
     * 		classes: 'fancy'
     * 	},
     * 	model: 'fancyParagraph'
     * } );
     *
     * editor.conversion.for( 'upcast' ).elementToElement( {
     * 	view: {
     * 		name: 'p',
     * 		classes: 'heading'
     * 	},
     * 	model: ( viewElement, conversionApi ) => {
     * 		const modelWriter = conversionApi.writer;
     *
     * 		return modelWriter.createElement( 'heading', { level: viewElement.getAttribute( 'data-level' ) } );
     * 	}
     * } );
     * ```
     *
     * See {@link module:engine/conversion/conversion~Conversion#for `conversion.for()`} to learn how to add a converter
     * to the conversion process.
     *
     * @param config Conversion configuration.
     * @param config.view Pattern matching all view elements which should be converted. If not set, the converter
     * will fire for every view element.
     * @param config.model Name of the model element, a model element instance or a function that takes a view element
     * and {@link module:engine/conversion/upcastdispatcher~UpcastConversionApi upcast conversion API}
     * and returns a model element. The model element will be inserted in the model.
     * @param config.converterPriority Converter priority.
     */
    elementToElement(config: {
        view: MatcherPattern;
        model: string | UpcastElementCreatorFunction;
        converterPriority?: PriorityString;
    }): this;
    /**
     * View element to model attribute conversion helper.
     *
     * This conversion results in setting an attribute on a model node. For example, view `<strong>Foo</strong>` becomes
     * `Foo` {@link module:engine/model/text~ModelText model text node} with `bold` attribute set to `true`.
     *
     * This helper is meant to set a model attribute on all the elements that are inside the converted element:
     *
     * ```
     * <strong>Foo</strong>   -->   <strong><p>Foo</p></strong>   -->   <paragraph><$text bold="true">Foo</$text></paragraph>
     * ```
     *
     * Above is a sample of HTML code, that goes through autoparagraphing (first step) and then is converted (second step).
     * Even though `<strong>` is over `<p>` element, `bold="true"` was added to the text. See
     * {@link module:engine/conversion/upcasthelpers~UpcastHelpers#attributeToAttribute} for comparison.
     *
     * Keep in mind that the attribute will be set only if it is allowed by
     * {@link module:engine/model/schema~ModelSchema schema} configuration.
     *
     * ```ts
     * editor.conversion.for( 'upcast' ).elementToAttribute( {
     * 	view: 'strong',
     * 	model: 'bold'
     * } );
     *
     * editor.conversion.for( 'upcast' ).elementToAttribute( {
     * 	view: 'strong',
     * 	model: 'bold',
     * 	converterPriority: 'high'
     * } );
     *
     * editor.conversion.for( 'upcast' ).elementToAttribute( {
     * 	view: {
     * 		name: 'span',
     * 		classes: 'bold'
     * 	},
     * 	model: 'bold'
     * } );
     *
     * editor.conversion.for( 'upcast' ).elementToAttribute( {
     * 	view: {
     * 		name: 'span',
     * 		classes: [ 'styled', 'styled-dark' ]
     * 	},
     * 	model: {
     * 		key: 'styled',
     * 		value: 'dark'
     * 	}
     * } );
     *
     * editor.conversion.for( 'upcast' ).elementToAttribute( {
     * 	view: {
     * 		name: 'span',
     * 		styles: {
     * 			'font-size': /[\s\S]+/
     * 		}
     * 	},
     * 	model: {
     * 		key: 'fontSize',
     * 		value: ( viewElement, conversionApi ) => {
     * 			const fontSize = viewElement.getStyle( 'font-size' );
     * 			const value = fontSize.substr( 0, fontSize.length - 2 );
     *
     * 			if ( value <= 10 ) {
     * 				return 'small';
     * 			} else if ( value > 12 ) {
     * 				return 'big';
     * 			}
     *
     * 			return null;
     * 		}
     * 	}
     * } );
     * ```
     *
     * See {@link module:engine/conversion/conversion~Conversion#for `conversion.for()`} to learn how to add a converter
     * to the conversion process.
     *
     * @param config Conversion configuration.
     * @param config.view Pattern matching all view elements which should be converted.
     * @param config.model Model attribute key or an object with `key` and `value` properties, describing
     * the model attribute. `value` property may be set as a function that takes a view element and
     * {@link module:engine/conversion/upcastdispatcher~UpcastConversionApi upcast conversion API} and returns the value.
     * If `String` is given, the model attribute value will be set to `true`.
     * @param config.converterPriority Converter priority. Defaults to `low`.
     */
    elementToAttribute(config: {
        view: MatcherPattern;
        model: string | {
            key: string;
            value?: unknown;
        };
        converterPriority?: PriorityString;
    }): this;
    /**
     * View attribute to model attribute conversion helper.
     *
     * This conversion results in setting an attribute on a model node. For example, view `<img src="foo.jpg"></img>` becomes
     * `<imageBlock source="foo.jpg"></imageBlock>` in the model.
     *
     * This helper is meant to convert view attributes from view elements which got converted to the model, so the view attribute
     * is set only on the corresponding model node:
     *
     * ```
     * <div class="dark"><div>foo</div></div>    -->    <div dark="true"><div>foo</div></div>
     * ```
     *
     * Above, `class="dark"` attribute is added only to the `<div>` elements that has it. This is in contrast to
     * {@link module:engine/conversion/upcasthelpers~UpcastHelpers#elementToAttribute} which sets attributes for
     * all the children in the model:
     *
     * ```
     * <strong>Foo</strong>   -->   <strong><p>Foo</p></strong>   -->   <paragraph><$text bold="true">Foo</$text></paragraph>
     * ```
     *
     * Above is a sample of HTML code, that goes through autoparagraphing (first step) and then is converted (second step).
     * Even though `<strong>` is over `<p>` element, `bold="true"` was added to the text.
     *
     * Keep in mind that the attribute will be set only if it is allowed by
     * {@link module:engine/model/schema~ModelSchema schema} configuration.
     *
     * ```ts
     * editor.conversion.for( 'upcast' ).attributeToAttribute( {
     * 	view: 'src',
     * 	model: 'source'
     * } );
     *
     * editor.conversion.for( 'upcast' ).attributeToAttribute( {
     * 	view: { key: 'src' },
     * 	model: 'source'
     * } );
     *
     * editor.conversion.for( 'upcast' ).attributeToAttribute( {
     * 	view: { key: 'src' },
     * 	model: 'source',
     * 	converterPriority: 'normal'
     * } );
     *
     * editor.conversion.for( 'upcast' ).attributeToAttribute( {
     * 	view: {
     * 		key: 'data-style',
     * 		value: /[\s\S]+/
     * 	},
     * 	model: 'styled'
     * } );
     *
     * editor.conversion.for( 'upcast' ).attributeToAttribute( {
     * 	view: {
     * 		name: 'img',
     * 		key: 'class',
     * 		value: 'styled-dark'
     * 	},
     * 	model: {
     * 		key: 'styled',
     * 		value: 'dark'
     * 	}
     * } );
     *
     * editor.conversion.for( 'upcast' ).attributeToAttribute( {
     * 	view: {
     * 		key: 'class',
     * 		value: /styled-[\S]+/
     * 	},
     * 	model: {
     * 		key: 'styled'
     * 		value: ( viewElement, conversionApi ) => {
     * 			const regexp = /styled-([\S]+)/;
     * 			const match = viewElement.getAttribute( 'class' ).match( regexp );
     *
     * 			return match[ 1 ];
     * 		}
     * 	}
     * } );
     * ```
     *
     * Converting styles works a bit differently as it requires `view.styles` to be an object and by default
     * a model attribute will be set to `true` by such a converter. You can set the model attribute to any value by providing the `value`
     * callback that returns the desired value.
     *
     * ```ts
     * // Default conversion of font-weight style will result in setting bold attribute to true.
     * editor.conversion.for( 'upcast' ).attributeToAttribute( {
     * 	view: {
     * 		styles: {
     * 			'font-weight': 'bold'
     * 		}
     * 	},
     * 	model: 'bold'
     * } );
     *
     * // This converter will pass any style value to the `lineHeight` model attribute.
     * editor.conversion.for( 'upcast' ).attributeToAttribute( {
     * 	view: {
     * 		styles: {
     * 			'line-height': /[\s\S]+/
     * 		}
     * 	},
     * 	model: {
     * 		key: 'lineHeight',
     * 		value: ( viewElement, conversionApi ) => viewElement.getStyle( 'line-height' )
     * 	}
     * } );
     * ```
     *
     * See {@link module:engine/conversion/conversion~Conversion#for `conversion.for()`} to learn how to add a converter
     * to the conversion process.
     *
     * @param config Conversion configuration.
     * @param config.view Specifies which view attribute will be converted. If a `String` is passed,
     * attributes with given key will be converted. If an `Object` is passed, it must have a required `key` property,
     * specifying view attribute key, and may have an optional `value` property, specifying view attribute value and optional `name`
     * property specifying a view element name from/on which the attribute should be converted. `value` can be given as a `String`,
     * a `RegExp` or a function callback, that takes view attribute value as the only parameter and returns `Boolean`.
     * @param config.model Model attribute key or an object with `key` and `value` properties, describing
     * the model attribute. `value` property may be set as a function that takes a view element and
     * {@link module:engine/conversion/upcastdispatcher~UpcastConversionApi upcast conversion API} and returns the value.
     * If `String` is given, the model attribute value will be same as view attribute value.
     * @param config.converterPriority Converter priority. Defaults to `low`.
     */
    attributeToAttribute(config: {
        view: string | {
            key: string;
            value?: string | RegExp | Array<string> | Record<string, string> | Record<string, RegExp> | ((value: unknown) => boolean);
            name?: string;
        } | {
            name?: string | RegExp;
            styles?: MatchPropertyPatterns;
            classes?: MatchClassPatterns;
            attributes?: MatchPropertyPatterns;
        };
        model: string | {
            key: string;
            value: unknown | ((viewElement: ViewElement, conversionApi: UpcastConversionApi, data: UpcastConversionData<ViewElement>) => unknown);
        };
        converterPriority?: PriorityString;
    }): this;
    /**
     * View element to model marker conversion helper.
     *
     * This conversion results in creating a model marker. For example, if the marker was stored in a view as an element:
     * `<p>Fo<span data-marker="comment" data-comment-id="7"></span>o</p><p>B<span data-marker="comment" data-comment-id="7"></span>ar</p>`,
     * after the conversion is done, the marker will be available in
     * {@link module:engine/model/model~Model#markers model document markers}.
     *
     * **Note**: When this helper is used in the data upcast in combination with
     * {@link module:engine/conversion/downcasthelpers~DowncastHelpers#markerToData `#markerToData()`} in the data downcast,
     * then invalid HTML code (e.g. a span between table cells) may be produced by the latter converter.
     *
     * In most of the cases, the {@link #dataToMarker} should be used instead.
     *
     * ```ts
     * editor.conversion.for( 'upcast' ).elementToMarker( {
     * 	view: 'marker-search',
     * 	model: 'search'
     * } );
     *
     * editor.conversion.for( 'upcast' ).elementToMarker( {
     * 	view: 'marker-search',
     * 	model: 'search',
     * 	converterPriority: 'high'
     * } );
     *
     * editor.conversion.for( 'upcast' ).elementToMarker( {
     * 	view: 'marker-search',
     * 	model: ( viewElement, conversionApi ) => 'comment:' + viewElement.getAttribute( 'data-comment-id' )
     * } );
     *
     * editor.conversion.for( 'upcast' ).elementToMarker( {
     * 	view: {
     * 		name: 'span',
     * 		attributes: {
     * 			'data-marker': 'search'
     * 		}
     * 	},
     * 	model: 'search'
     * } );
     * ```
     *
     * See {@link module:engine/conversion/conversion~Conversion#for `conversion.for()`} to learn how to add a converter
     * to the conversion process.
     *
     * @param config Conversion configuration.
     * @param config.view Pattern matching all view elements which should be converted.
     * @param config.model Name of the model marker, or a function that takes a view element and returns
     * a model marker name.
     * @param config.converterPriority Converter priority.
     */
    elementToMarker(config: {
        view: MatcherPattern;
        model: string | UpcastMarkerFromElementCreatorFunction;
        converterPriority?: PriorityString;
    }): this;
    /**
     * View-to-model marker conversion helper.
     *
     * Converts view data created by {@link module:engine/conversion/downcasthelpers~DowncastHelpers#markerToData `#markerToData()`}
     * back to a model marker.
     *
     * This converter looks for specific view elements and view attributes that mark marker boundaries. See
     * {@link module:engine/conversion/downcasthelpers~DowncastHelpers#markerToData `#markerToData()`} to learn what view data
     * is expected by this converter.
     *
     * The `config.view` property is equal to the marker group name to convert.
     *
     * By default, this converter creates markers with the `group:name` name convention (to match the default `markerToData` conversion).
     *
     * The conversion configuration can take a function that will generate a marker name.
     * If such function is set as the `config.model` parameter, it is passed the `name` part from the view element or attribute and it is
     * expected to return a string with the marker name.
     *
     * Basic usage:
     *
     * ```ts
     * // Using the default conversion.
     * // In this case, all markers from the `comment` group will be converted.
     * // The conversion will look for `<comment-start>` and `<comment-end>` tags and
     * // `data-comment-start-before`, `data-comment-start-after`,
     * // `data-comment-end-before` and `data-comment-end-after` attributes.
     * editor.conversion.for( 'upcast' ).dataToMarker( {
     * 	view: 'comment'
     * } );
     * ```
     *
     * An example of a model that may be generated by this conversion:
     *
     * ```
     * // View:
     * <p>Foo<comment-start name="commentId:uid"></comment-start>bar</p>
     * <figure data-comment-end-after="commentId:uid" class="image"><img src="abc.jpg" /></figure>
     *
     * // Model:
     * <paragraph>Foo[bar</paragraph>
     * <imageBlock src="abc.jpg"></imageBlock>]
     * ```
     *
     * Where `[]` are boundaries of a marker that will receive the `comment:commentId:uid` name.
     *
     * Other examples of usage:
     *
     * ```ts
     * // Using a custom function which is the same as the default conversion:
     * editor.conversion.for( 'upcast' ).dataToMarker( {
     * 	view: 'comment',
     * 	model: ( name, conversionApi ) => 'comment:' + name,
     * } );
     *
     * // Using the converter priority:
     * editor.conversion.for( 'upcast' ).dataToMarker( {
     * 	view: 'comment',
     * 	model: ( name, conversionApi ) => 'comment:' + name,
     * 	converterPriority: 'high'
     * } );
     * ```
     *
     * See {@link module:engine/conversion/conversion~Conversion#for `conversion.for()`} to learn how to add a converter
     * to the conversion process.
     *
     * @param config Conversion configuration.
     * @param config.view The marker group name to convert.
     * @param config.model A function that takes the `name` part from the view element or attribute and
     * {@link module:engine/conversion/upcastdispatcher~UpcastConversionApi upcast conversion API} and returns the marker name.
     * @param config.converterPriority Converter priority.
     */
    dataToMarker(config: {
        view: string;
        model?: UpcastMarkerFromAttributeCreatorFunction;
        converterPriority?: PriorityString;
    }): this;
}
/**
 * Function factory, creates a converter that converts
 * {@link module:engine/view/documentfragment~ViewDocumentFragment view document fragment}
 * or all children of {@link module:engine/view/element~ViewElement} into
 * {@link module:engine/model/documentfragment~ModelDocumentFragment model document fragment}.
 * This is the "entry-point" converter for upcast (view to model conversion). This converter starts the conversion of all children
 * of passed view document fragment. Those children {@link module:engine/view/node~ViewNode view nodes} are then
 * handled by other converters.
 *
 * This also a "default", last resort converter for all view elements that has not been converted by other converters.
 * When a view element is being converted to the model but it does not have converter specified, that view element
 * will be converted to {@link module:engine/model/documentfragment~ModelDocumentFragment model document fragment} and returned.
 *
 * @returns Universal converter for view {@link module:engine/view/documentfragment~ViewDocumentFragment fragments} and
 * {@link module:engine/view/element~ViewElement elements} that returns
 * {@link module:engine/model/documentfragment~ModelDocumentFragment model fragment} with children of converted view item.
 *
 * @internal
 */
export declare function convertToModelFragment(): (evt: EventInfo, data: UpcastConversionData<ViewElement | ViewDocumentFragment>, conversionApi: UpcastConversionApi) => void;
/**
 * Function factory, creates a converter that converts
 * {@link module:engine/view/text~ViewText} to {@link module:engine/model/text~ModelText}.
 *
 * @returns {@link module:engine/view/text~ViewText View text} converter.
 * @internal
 */
export declare function convertText(): (evt: EventInfo, data: UpcastConversionData<ViewText>, { schema, consumable, writer }: UpcastConversionApi) => void;
/**
 * Function factory, creates a callback function which converts a {@link module:engine/view/selection~ViewSelection
 * view selection} taken from the {@link module:engine/view/document~ViewDocument#event:selectionChange} event
 * and sets in on the {@link module:engine/model/document~ModelDocument#selection model}.
 *
 * **Note**: because there is no view selection change dispatcher nor any other advanced view selection to model
 * conversion mechanism, the callback should be set directly on view document.
 *
 * ```ts
 * view.document.on( 'selectionChange', convertSelectionChange( modelDocument, mapper ) );
 * ```
 *
 * @param model Data model.
 * @param mapper Conversion mapper.
 * @returns {@link module:engine/view/document~ViewDocument#event:selectionChange} callback function.
 * @internal
 */
export declare function convertSelectionChange(model: Model, mapper: Mapper): (evt: EventInfo, data: {
    newSelection: ViewSelection | ViewDocumentSelection;
}) => void;
export type UpcastElementCreatorFunction = (viewElement: ViewElement, conversionApi: UpcastConversionApi) => ModelElement | null;
export type UpcastAttributeCreatorFunction = (modelElement: ModelElement, conversionApi: UpcastConversionApi) => unknown;
export type UpcastMarkerFromElementCreatorFunction = (viewElement: ViewElement, conversionApi: UpcastConversionApi) => string;
export type UpcastMarkerFromAttributeCreatorFunction = (attributeValue: string, conversionApi: UpcastConversionApi) => string;
