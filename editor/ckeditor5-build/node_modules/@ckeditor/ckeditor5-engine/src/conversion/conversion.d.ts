/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/conversion/conversion
 */
import { type ArrayOrItem, type PriorityString } from '@ckeditor/ckeditor5-utils';
import { UpcastHelpers } from './upcasthelpers.js';
import { DowncastHelpers, type DowncastAttributeCreatorFunction, type DowncastAttributeDescriptor } from './downcasthelpers.js';
import { type DowncastDispatcher } from './downcastdispatcher.js';
import { type UpcastDispatcher } from './upcastdispatcher.js';
import { type ViewElementDefinition } from '../view/elementdefinition.js';
import type { MatcherPattern } from '../view/matcher.js';
/**
 * A utility class that helps add converters to upcast and downcast dispatchers.
 *
 * We recommend reading the {@glink framework/deep-dive/conversion/intro editor conversion} guide first to
 * understand the core concepts of the conversion mechanisms.
 *
 * An instance of the conversion manager is available in the
 * {@link module:core/editor/editor~Editor#conversion `editor.conversion`} property
 * and by default has the following groups of dispatchers (i.e. directions of conversion):
 *
 * * `downcast` (editing and data downcasts)
 * * `editingDowncast`
 * * `dataDowncast`
 * * `upcast`
 *
 * # One-way converters
 *
 * To add a converter to a specific group, use the {@link module:engine/conversion/conversion~Conversion#for `for()`}
 * method:
 *
 * ```ts
 * // Add a converter to editing downcast and data downcast.
 * editor.conversion.for( 'downcast' ).elementToElement( config ) );
 *
 * // Add a converter to the data pipepline only:
 * editor.conversion.for( 'dataDowncast' ).elementToElement( dataConversionConfig ) );
 *
 * // And a slightly different one for the editing pipeline:
 * editor.conversion.for( 'editingDowncast' ).elementToElement( editingConversionConfig ) );
 * ```
 *
 * See {@link module:engine/conversion/conversion~Conversion#for `for()`} method documentation to learn more about
 * available conversion helpers and how to use your custom ones.
 *
 * # Two-way converters
 *
 * Besides using one-way converters via the `for()` method, you can also use other methods available in this
 * class to add two-way converters (upcast and downcast):
 *
 * * {@link module:engine/conversion/conversion~Conversion#elementToElement `elementToElement()`} &ndash;
 * Model element to view element and vice versa.
 * * {@link module:engine/conversion/conversion~Conversion#attributeToElement `attributeToElement()`} &ndash;
 * Model attribute to view element and vice versa.
 * * {@link module:engine/conversion/conversion~Conversion#attributeToAttribute `attributeToAttribute()`} &ndash;
 * Model attribute to view attribute and vice versa.
 */
export declare class Conversion {
    /**
     * Maps dispatchers group name to ConversionHelpers instances.
     */
    private readonly _helpers;
    private readonly _downcast;
    private readonly _upcast;
    /**
     * Creates a new conversion instance.
     */
    constructor(downcastDispatchers: ArrayOrItem<DowncastDispatcher>, upcastDispatchers: ArrayOrItem<UpcastDispatcher>);
    addAlias(alias: `${string}Downcast`, dispatcher: DowncastDispatcher): void;
    addAlias(alias: `${string}Upcast`, dispatcher: UpcastDispatcher): void;
    addAlias(alias: string, dispatcher: DowncastDispatcher | UpcastDispatcher): void;
    for(groupName: 'downcast' | 'dataDowncast' | 'editingDowncast'): DowncastHelpers;
    for(groupName: 'upcast'): UpcastHelpers;
    for<T extends string>(groupName: T): ConversionType<T>;
    /**
     * Sets up converters between the model and the view that convert a model element to a view element (and vice versa).
     * For example, the model `<paragraph>Foo</paragraph>` is turned into `<p>Foo</p>` in the view.
     *
     * ```ts
     * // A simple conversion from the `paragraph` model element to the `<p>` view element (and vice versa).
     * editor.conversion.elementToElement( { model: 'paragraph', view: 'p' } );
     *
     * // Override other converters by specifying a converter definition with a higher priority.
     * editor.conversion.elementToElement( { model: 'paragraph', view: 'div', converterPriority: 'high' } );
     *
     * // View specified as an object instead of a string.
     * editor.conversion.elementToElement( {
     * 	model: 'fancyParagraph',
     * 	view: {
     * 		name: 'p',
     * 		classes: 'fancy'
     * 	}
     * } );
     *
     * // Use `upcastAlso` to define other view elements that should also be converted to a `paragraph` element.
     * editor.conversion.elementToElement( {
     * 	model: 'paragraph',
     * 	view: 'p',
     * 	upcastAlso: [
     * 		'div',
     * 		{
     * 			// Any element with the `display: block` style.
     * 			styles: {
     * 				display: 'block'
     * 			}
     * 		}
     * 	]
     * } );
     *
     * // `upcastAlso` set as callback enables a conversion of a wide range of different view elements.
     * editor.conversion.elementToElement( {
     * 	model: 'heading',
     * 	view: 'h2',
     * 	// Convert "heading-like" paragraphs to headings.
     * 	upcastAlso: viewElement => {
     * 		const fontSize = viewElement.getStyle( 'font-size' );
     *
     * 		if ( !fontSize ) {
     * 			return null;
     * 		}
     *
     * 		const match = fontSize.match( /(\d+)\s*px/ );
     *
     * 		if ( !match ) {
     * 			return null;
     * 		}
     *
     * 		const size = Number( match[ 1 ] );
     *
     * 		if ( size > 26 ) {
     * 			// Returned value can be an object with the matched properties.
     * 			// These properties will be "consumed" during the conversion.
     * 			// See `engine.view.Matcher~MatcherPattern` and `engine.view.Matcher#match` for more details.
     *
     * 			return { name: true, styles: [ 'font-size' ] };
     * 		}
     *
     * 		return null;
     * 	}
     * } );
     * ```
     *
     * `definition.model` is a `String` with a model element name to convert from or to.
     *
     * @param definition The converter definition.
     */
    elementToElement(definition: {
        model: string;
        view: ViewElementDefinition;
        upcastAlso?: ArrayOrItem<ViewElementDefinition | MatcherPattern>;
        converterPriority?: PriorityString;
    }): void;
    /**
     * Sets up converters between the model and the view that convert a model attribute to a view element (and vice versa).
     * For example, a model text node with `"Foo"` as data and the `bold` attribute will be turned to `<strong>Foo</strong>` in the view.
     *
     * ```ts
     * // A simple conversion from the `bold=true` attribute to the `<strong>` view element (and vice versa).
     * editor.conversion.attributeToElement( { model: 'bold', view: 'strong' } );
     *
     * // Override other converters by specifying a converter definition with a higher priority.
     * editor.conversion.attributeToElement( { model: 'bold', view: 'b', converterPriority: 'high' } );
     *
     * // View specified as an object instead of a string.
     * editor.conversion.attributeToElement( {
     * 	model: 'bold',
     * 	view: {
     * 		name: 'span',
     * 		classes: 'bold'
     * 	}
     * } );
     *
     * // Use `config.model.name` to define the conversion only from a given node type, `$text` in this case.
     * // The same attribute on different elements may then be handled by a different converter.
     * editor.conversion.attributeToElement( {
     * 	model: {
     * 		key: 'textDecoration',
     * 		values: [ 'underline', 'lineThrough' ],
     * 		name: '$text'
     * 	},
     * 	view: {
     * 		underline: {
     * 			name: 'span',
     * 			styles: {
     * 				'text-decoration': 'underline'
     * 			}
     * 		},
     * 		lineThrough: {
     * 			name: 'span',
     * 			styles: {
     * 				'text-decoration': 'line-through'
     * 			}
     * 		}
     * 	}
     * } );
     *
     * // Use `upcastAlso` to define other view elements that should also be converted to the `bold` attribute.
     * editor.conversion.attributeToElement( {
     * 	model: 'bold',
     * 	view: 'strong',
     * 	upcastAlso: [
     * 		'b',
     * 		{
     * 			name: 'span',
     * 			classes: 'bold'
     * 		},
     * 		{
     * 			name: 'span',
     * 			styles: {
     * 				'font-weight': 'bold'
     * 			}
     * 		},
     * 		viewElement => {
     * 			const fontWeight = viewElement.getStyle( 'font-weight' );
     *
     * 			if ( viewElement.is( 'element', 'span' ) && fontWeight && /\d+/.test() && Number( fontWeight ) > 500 ) {
     * 				// Returned value can be an object with the matched properties.
     * 				// These properties will be "consumed" during the conversion.
     * 				// See `engine.view.Matcher~MatcherPattern` and `engine.view.Matcher#match` for more details.
     *
     * 				return {
     * 					name: true,
     * 					styles: [ 'font-weight' ]
     * 				};
     * 			}
     * 		}
     * 	]
     * } );
     *
     * // Conversion from and to a model attribute key whose value is an enum (`fontSize=big|small`).
     * // `upcastAlso` set as callback enables a conversion of a wide range of different view elements.
     * editor.conversion.attributeToElement( {
     * 	model: {
     * 		key: 'fontSize',
     * 		values: [ 'big', 'small' ]
     * 	},
     * 	view: {
     * 		big: {
     * 			name: 'span',
     * 			styles: {
     * 				'font-size': '1.2em'
     * 			}
     * 		},
     * 		small: {
     * 			name: 'span',
     * 			styles: {
     * 				'font-size': '0.8em'
     * 			}
     * 		}
     * 	},
     * 	upcastAlso: {
     * 		big: viewElement => {
     * 			const fontSize = viewElement.getStyle( 'font-size' );
     *
     * 			if ( !fontSize ) {
     * 				return null;
     * 			}
     *
     * 			const match = fontSize.match( /(\d+)\s*px/ );
     *
     * 			if ( !match ) {
     * 				return null;
     * 			}
     *
     * 			const size = Number( match[ 1 ] );
     *
     * 			if ( viewElement.is( 'element', 'span' ) && size > 10 ) {
     * 				// Returned value can be an object with the matched properties.
     * 				// These properties will be "consumed" during the conversion.
     * 				// See `engine.view.Matcher~MatcherPattern` and `engine.view.Matcher#match` for more details.
     *
     * 				return { name: true, styles: [ 'font-size' ] };
     * 			}
     *
     * 			return null;
     * 		},
     * 		small: viewElement => {
     * 			const fontSize = viewElement.getStyle( 'font-size' );
     *
     * 			if ( !fontSize ) {
     * 				return null;
     * 			}
     *
     * 			const match = fontSize.match( /(\d+)\s*px/ );
     *
     * 			if ( !match ) {
     * 				return null;
     * 			}
     *
     * 			const size = Number( match[ 1 ] );
     *
     * 			if ( viewElement.is( 'element', 'span' ) && size < 10 ) {
     * 				// Returned value can be an object with the matched properties.
     * 				// These properties will be "consumed" during the conversion.
     * 				// See `engine.view.Matcher~MatcherPattern` and `engine.view.Matcher#match` for more details.
     *
     * 				return { name: true, styles: [ 'font-size' ] };
     * 			}
     *
     * 			return null;
     * 		}
     * 	}
     * } );
     * ```
     *
     * The `definition.model` parameter specifies which model attribute should be converted from or to. It can be a `{ key, value }` object
     * describing the attribute key and value to convert or a `String` specifying just the attribute key (in such a case
     * `value` is set to `true`).
     *
     * @param definition The converter definition.
     */
    attributeToElement<TValues extends string>(definition: {
        model: string | {
            key: string;
            name?: string;
        };
        view: ViewElementDefinition;
        upcastAlso?: ArrayOrItem<MatcherPattern>;
        converterPriority?: PriorityString;
    } | {
        model: {
            key: string;
            name?: string;
            values: Array<TValues>;
        };
        view: Record<TValues, ViewElementDefinition>;
        upcastAlso?: Record<TValues, ArrayOrItem<MatcherPattern>>;
        converterPriority?: PriorityString;
    }): void;
    /**
     * Sets up converters between the model and the view that convert a model attribute to a view attribute (and vice versa). For example,
     * `<imageBlock src='foo.jpg'></imageBlock>` is converted to `<img src='foo.jpg'></img>` (the same attribute key and value).
     * This type of converters is intended to be used with {@link module:engine/model/element~ModelElement model element} nodes.
     * To convert the text attributes,
     * the {@link module:engine/conversion/conversion~Conversion#attributeToElement `attributeToElement converter`}should be set up.
     *
     * ```ts
     * // A simple conversion from the `source` model attribute to the `src` view attribute (and vice versa).
     * editor.conversion.attributeToAttribute( { model: 'source', view: 'src' } );
     *
     * // Attribute values are strictly specified.
     * editor.conversion.attributeToAttribute( {
     * 	model: {
     * 		name: 'imageInline',
     * 		key: 'aside',
     * 		values: [ 'aside' ]
     * 	},
     * 	view: {
     * 		aside: {
     * 			name: 'img',
     * 			key: 'class',
     * 			value: [ 'aside', 'half-size' ]
     * 		}
     * 	}
     * } );
     *
     * // Set the style attribute.
     * editor.conversion.attributeToAttribute( {
     * 	model: {
     * 		name: 'imageInline',
     * 		key: 'aside',
     * 		values: [ 'aside' ]
     * 	},
     * 	view: {
     * 		aside: {
     * 			name: 'img',
     * 			key: 'style',
     * 			value: {
     * 				float: 'right',
     * 				width: '50%',
     * 				margin: '5px'
     * 			}
     * 		}
     * 	}
     * } );
     *
     * // Conversion from and to a model attribute key whose value is an enum (`align=right|center`).
     * // Use `upcastAlso` to define other view elements that should also be converted to the `align=right` attribute.
     * editor.conversion.attributeToAttribute( {
     * 	model: {
     * 		key: 'align',
     * 		values: [ 'right', 'center' ]
     * 	},
     * 	view: {
     * 		right: {
     * 			key: 'class',
     * 			value: 'align-right'
     * 		},
     * 		center: {
     * 			key: 'class',
     * 			value: 'align-center'
     * 		}
     * 	},
     * 	upcastAlso: {
     * 		right: {
     * 			styles: {
     * 				'text-align': 'right'
     * 			}
     * 		},
     * 		center: {
     * 			styles: {
     * 				'text-align': 'center'
     * 			}
     * 		}
     * 	}
     * } );
     * ```
     *
     * The `definition.model` parameter specifies which model attribute should be converted from and to.
     * It can be a `{ key, [ values ], [ name ] }` object or a `String`, which will be treated like `{ key: definition.model }`.
     * The `key` property is the model attribute key to convert from and to.
     * The `values` are the possible model attribute values. If the `values` parameter is not set, the model attribute value
     * will be the same as the view attribute value.
     * If `name` is set, the conversion will be set up only for model elements with the given name.
     *
     * The `definition.view` parameter specifies which view attribute should be converted from and to.
     * It can be a `{ key, value, [ name ] }` object or a `String`, which will be treated like `{ key: definition.view }`.
     * The `key` property is the view attribute key to convert from and to.
     * The `value` is the view attribute value to convert from and to. If `definition.value` is not set, the view attribute value will be
     * the same as the model attribute value.
     * If `key` is `'class'`, `value` can be a `String` or an array of `String`s.
     * If `key` is `'style'`, `value` is an object with key-value pairs.
     * In other cases, `value` is a `String`.
     * If `name` is set, the conversion will be set up only for model elements with the given name.
     * If `definition.model.values` is set, `definition.view` is an object that assigns values from `definition.model.values`
     * to `{ key, value, [ name ] }` objects.
     *
     * `definition.upcastAlso` specifies which other matching view elements should also be upcast to the given model configuration.
     * If `definition.model.values` is set, `definition.upcastAlso` should be an object assigning values from `definition.model.values`
     * to {@link module:engine/view/matcher~MatcherPattern}s or arrays of {@link module:engine/view/matcher~MatcherPattern}s.
     *
     * **Note:** `definition.model` and `definition.view` form should be mirrored, so the same types of parameters should
     * be given in both parameters.
     *
     * @param definition The converter definition.
     * @param definition.model The model attribute to convert from and to.
     * @param definition.view The view attribute to convert from and to.
     * @param definition.upcastAlso Any view element matching `definition.upcastAlso` will also be converted to the given model attribute.
     * `definition.upcastAlso` is used only if `config.model.values` is specified.
     */
    attributeToAttribute<TValues extends string>(definition: {
        model: string | {
            key: string;
            name?: string;
        };
        view: string | (DowncastAttributeDescriptor & {
            name?: string;
        });
        upcastAlso?: ArrayOrItem<string | (DowncastAttributeDescriptor & {
            name?: string;
        }) | DowncastAttributeCreatorFunction>;
        converterPriority?: PriorityString;
    } | {
        model: {
            key: string;
            name?: string;
            values: Array<TValues>;
        };
        view: Record<TValues, (DowncastAttributeDescriptor & {
            name?: string;
        })>;
        upcastAlso?: Record<TValues, (DowncastAttributeDescriptor & {
            name?: string;
        }) | DowncastAttributeCreatorFunction>;
        converterPriority?: PriorityString;
    }): void;
    /**
     * Creates and caches conversion helpers for given dispatchers group.
     *
     * @param options Group name.
     * @param options.name Group name.
     * @param options.dispatchers Dispatchers to register.
     * @param options.isDowncast Whether downcast group.
     */
    private _createConversionHelpers;
}
export type ConversionType<T extends string> = T extends `${string}Downcast` ? DowncastHelpers : T extends `${string}Upcast` ? UpcastHelpers : DowncastHelpers | UpcastHelpers;
