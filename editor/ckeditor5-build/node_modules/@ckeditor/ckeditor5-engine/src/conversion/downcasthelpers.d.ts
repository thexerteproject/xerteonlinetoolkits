/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * Contains downcast (model-to-view) converters for {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher}.
 *
 * @module engine/conversion/downcasthelpers
 */
import { ModelRange } from '../model/range.js';
import { ModelSelection } from '../model/selection.js';
import { ModelDocumentSelection } from '../model/documentselection.js';
import { ModelElement } from '../model/element.js';
import { ModelPosition } from '../model/position.js';
import { ViewAttributeElement } from '../view/attributeelement.js';
import { ConversionHelpers } from './conversionhelpers.js';
import type { DowncastDispatcher, DowncastConversionApi } from './downcastdispatcher.js';
import { type ModelConsumable } from './modelconsumable.js';
import { type ModelNode } from '../model/node.js';
import { type ModelItem } from '../model/item.js';
import { type ModelTextProxy } from '../model/textproxy.js';
import { type ModelText } from '../model/text.js';
import { type ViewDowncastWriter } from '../view/downcastwriter.js';
import { type ViewElementDefinition } from '../view/elementdefinition.js';
import { type ViewUIElement } from '../view/uielement.js';
import { type ViewElement } from '../view/element.js';
import { type EventInfo, type PriorityString } from '@ckeditor/ckeditor5-utils';
/**
 * Downcast conversion helper functions.
 *
 * Learn more about {@glink framework/deep-dive/conversion/downcast downcast helpers}.
 *
 * @extends module:engine/conversion/conversionhelpers~ConversionHelpers
 */
export declare class DowncastHelpers extends ConversionHelpers<DowncastDispatcher> {
    /**
     * Model element to view element conversion helper.
     *
     * This conversion results in creating a view element. For example, model `<paragraph>Foo</paragraph>` becomes `<p>Foo</p>` in the view.
     *
     * ```ts
     * editor.conversion.for( 'downcast' ).elementToElement( {
     * 	model: 'paragraph',
     * 	view: 'p'
     * } );
     *
     * editor.conversion.for( 'downcast' ).elementToElement( {
     * 	model: 'paragraph',
     * 	view: 'div',
     * 	converterPriority: 'high'
     * } );
     *
     * editor.conversion.for( 'downcast' ).elementToElement( {
     * 	model: 'fancyParagraph',
     * 	view: {
     * 		name: 'p',
     * 		classes: 'fancy'
     * 	}
     * } );
     *
     * editor.conversion.for( 'downcast' ).elementToElement( {
     * 	model: 'heading',
     * 	view: ( modelElement, conversionApi ) => {
     * 		const { writer } = conversionApi;
     *
     * 		return writer.createContainerElement( 'h' + modelElement.getAttribute( 'level' ) );
     * 	}
     * } );
     * ```
     *
     * The element-to-element conversion supports the reconversion mechanism. It can be enabled by using either the `attributes` or
     * the `children` props on a model description. You will find a couple examples below.
     *
     * In order to reconvert an element if any of its direct children have been added or removed, use the `children` property on a `model`
     * description. For example, this model:
     *
     * ```xml
     * <box>
     * 	<paragraph>Some text.</paragraph>
     * </box>
     * ```
     *
     * will be converted into this structure in the view:
     *
     * ```html
     * <div class="box" data-type="single">
     * 	<p>Some text.</p>
     * </div>
     * ```
     *
     * But if more items were inserted in the model:
     *
     * ```xml
     * <box>
     * 	<paragraph>Some text.</paragraph>
     * 	<paragraph>Other item.</paragraph>
     * </box>
     * ```
     *
     * it will be converted into this structure in the view (note the element `data-type` change):
     *
     * ```html
     * <div class="box" data-type="multiple">
     * 	<p>Some text.</p>
     * 	<p>Other item.</p>
     * </div>
     * ```
     *
     * Such a converter would look like this (note that the `paragraph` elements are converted separately):
     *
     * ```ts
     * editor.conversion.for( 'downcast' ).elementToElement( {
     * 	model: {
     * 		name: 'box',
     * 		children: true
     * 	},
     * 	view: ( modelElement, conversionApi ) => {
     * 		const { writer } = conversionApi;
     *
     * 		return writer.createContainerElement( 'div', {
     * 			class: 'box',
     * 			'data-type': modelElement.childCount == 1 ? 'single' : 'multiple'
     * 		} );
     * 	}
     * } );
     * ```
     *
     * In order to reconvert element if any of its attributes have been updated, use the `attributes` property on a `model`
     * description. For example, this model:
     *
     * ```xml
     * <heading level="2">Some text.</heading>
     * ```
     *
     * will be converted into this structure in the view:
     *
     * ```html
     * <h2>Some text.</h2>
     * ```
     *
     * But if the `heading` element's `level` attribute has been updated to `3` for example, then
     * it will be converted into this structure in the view:
     *
     * ```html
     * <h3>Some text.</h3>
     * ```
     *
     * Such a converter would look as follows:
     *
     * ```ts
     * editor.conversion.for( 'downcast' ).elementToElement( {
     * 	model: {
     * 		name: 'heading',
     * 		attributes: 'level'
     * 	},
     * 	view: ( modelElement, conversionApi ) => {
     * 		const { writer } = conversionApi;
     *
     * 		return writer.createContainerElement( 'h' + modelElement.getAttribute( 'level' ) );
     * 	}
     * } );
     * ```
     *
     * See {@link module:engine/conversion/conversion~Conversion#for `conversion.for()`} to learn how to add a converter
     * to the conversion process.
     *
     * You can read more about the element-to-element conversion in the
     * {@glink framework/deep-dive/conversion/downcast downcast conversion} guide.
     *
     * @param config Conversion configuration.
     * @param config.model The description or a name of the model element to convert.
     * @param config.view A view element definition or a function that takes the model element and
     * {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi downcast conversion API}
     * as parameters and returns a view container element.
     * @param config.converterPriority Converter priority.
     */
    elementToElement(config: {
        model: string | {
            name: string;
            attributes?: string | Array<string>;
            children?: boolean;
        };
        view: ViewElementDefinition | DowncastElementCreatorFunction;
        converterPriority?: PriorityString;
    }): this;
    /**
     * The model element to view structure (several elements) conversion helper.
     *
     * This conversion results in creating a view structure with one or more slots defined for the child nodes.
     * For example, a model `<table>` may become this structure in the view:
     *
     * ```html
     * <figure class="table">
     * 	<table>
     * 		<tbody>${ slot for table rows }</tbody>
     * 	</table>
     * </figure>
     * ```
     *
     * The children of the model's `<table>` element will be inserted into the `<tbody>` element.
     * If the `elementToElement()` helper was used, the children would be inserted into the `<figure>`.
     *
     * Imagine a table feature where for this model structure:
     *
     * ```xml
     * <table headingRows="1">
     * 	<tableRow> ... table cells 1 ... </tableRow>
     * 	<tableRow> ... table cells 2 ... </tableRow>
     * 	<tableRow> ... table cells 3 ... </tableRow>
     * 	<caption>Caption text</caption>
     * </table>
     * ```
     *
     * we want to generate this view structure:
     *
     * ```html
     * <figure class="table">
     * 	<table>
     * 		<thead>
     * 			<tr> ... table cells 1 ... </tr>
     * 		</thead>
     * 		<tbody>
     * 			<tr> ... table cells 2 ... </tr>
     * 			<tr> ... table cells 3 ... </tr>
     * 		</tbody>
     * 	</table>
     * 	<figcaption>Caption text</figcaption>
     * </figure>
     * ```
     *
     * The converter has to take the `headingRows` attribute into consideration when allocating the `<tableRow>` elements
     * into the `<tbody>` and `<thead>` elements. Hence, we need two slots and need to define proper filter callbacks for them.
     *
     * Additionally, all elements other than `<tableRow>` should be placed outside the `<table>` tag.
     * In the example above, this will handle the table caption.
     *
     * Such a converter would look like this:
     *
     * ```ts
     * editor.conversion.for( 'downcast' ).elementToStructure( {
     * 	model: {
     * 		name: 'table',
     * 		attributes: [ 'headingRows' ]
     * 	},
     * 	view: ( modelElement, conversionApi ) => {
     * 		const { writer } = conversionApi;
     *
     * 		const figureElement = writer.createContainerElement( 'figure', { class: 'table' } );
     * 		const tableElement = writer.createContainerElement( 'table' );
     *
     * 		writer.insert( writer.createPositionAt( figureElement, 0 ), tableElement );
     *
     * 		const headingRows = modelElement.getAttribute( 'headingRows' ) || 0;
     *
     * 		if ( headingRows > 0 ) {
     * 			const tableHead = writer.createContainerElement( 'thead' );
     *
     * 			const headSlot = writer.createSlot( node => node.is( 'element', 'tableRow' ) && node.index < headingRows );
     *
     * 			writer.insert( writer.createPositionAt( tableElement, 'end' ), tableHead );
     * 			writer.insert( writer.createPositionAt( tableHead, 0 ), headSlot );
     * 		}
     *
     * 		if ( headingRows < tableUtils.getRows( table ) ) {
     * 			const tableBody = writer.createContainerElement( 'tbody' );
     *
     * 			const bodySlot = writer.createSlot( node => node.is( 'element', 'tableRow' ) && node.index >= headingRows );
     *
     * 			writer.insert( writer.createPositionAt( tableElement, 'end' ), tableBody );
     * 			writer.insert( writer.createPositionAt( tableBody, 0 ), bodySlot );
     * 		}
     *
     * 		const restSlot = writer.createSlot( node => !node.is( 'element', 'tableRow' ) );
     *
     * 		writer.insert( writer.createPositionAt( figureElement, 'end' ), restSlot );
     *
     * 		return figureElement;
     * 	}
     * } );
     * ```
     *
     * Note: The children of a model element that's being converted must be allocated in the same order in the view
     * in which they are placed in the model.
     *
     * See {@link module:engine/conversion/conversion~Conversion#for `conversion.for()`} to learn how to add a converter
     * to the conversion process.
     *
     * @param config Conversion configuration.
     * @param config.model The description or a name of the model element to convert.
     * @param config.view A function that takes the model element and
     * {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi downcast conversion API} as parameters
     * and returns a view container element with slots for model child nodes to be converted into.
     * @param config.converterPriority Converter priority.
     */
    elementToStructure(config: {
        model: string | {
            name: string;
            attributes?: string | Array<string>;
        };
        view: DowncastStructureCreatorFunction;
        converterPriority?: PriorityString;
    }): this;
    /**
     * Model attribute to view element conversion helper.
     *
     * This conversion results in wrapping view nodes with a view attribute element. For example, a model text node with
     * `"Foo"` as data and the `bold` attribute becomes `<strong>Foo</strong>` in the view.
     *
     * ```ts
     * editor.conversion.for( 'downcast' ).attributeToElement( {
     * 	model: 'bold',
     * 	view: 'strong'
     * } );
     *
     * editor.conversion.for( 'downcast' ).attributeToElement( {
     * 	model: 'bold',
     * 	view: 'b',
     * 	converterPriority: 'high'
     * } );
     *
     * editor.conversion.for( 'downcast' ).attributeToElement( {
     * 	model: 'invert',
     * 	view: {
     * 		name: 'span',
     * 		classes: [ 'font-light', 'bg-dark' ]
     * 	}
     * } );
     *
     * editor.conversion.for( 'downcast' ).attributeToElement( {
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
     * 	}
     * } );
     *
     * editor.conversion.for( 'downcast' ).attributeToElement( {
     * 	model: 'bold',
     * 	view: ( modelAttributeValue, conversionApi ) => {
     * 		const { writer } = conversionApi;
     *
     * 		return writer.createAttributeElement( 'span', {
     * 			style: 'font-weight:' + modelAttributeValue
     * 		} );
     * 	}
     * } );
     *
     * editor.conversion.for( 'downcast' ).attributeToElement( {
     * 	model: {
     * 		key: 'color',
     * 		name: '$text'
     * 	},
     * 	view: ( modelAttributeValue, conversionApi ) => {
     * 		const { writer } = conversionApi;
     *
     * 		return writer.createAttributeElement( 'span', {
     * 			style: 'color:' + modelAttributeValue
     * 		} );
     * 	}
     * } );
     * ```
     *
     * See {@link module:engine/conversion/conversion~Conversion#for `conversion.for()`} to learn how to add a converter
     * to the conversion process.
     *
     * @param config Conversion configuration.
     * @param config.model The key of the attribute to convert from or a `{ key, values }` object. `values` is an array
     * of `String`s with possible values if the model attribute is an enumerable.
     * @param config.view A view element definition or a function
     * that takes the model attribute value and
     * {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi downcast conversion API} as parameters and returns a view
     * attribute element. If `config.model.values` is given, `config.view` should be an object assigning values from `config.model.values`
     * to view element definitions or functions.
     * @param config.converterPriority Converter priority.
     */
    attributeToElement<TValues extends string>(config: {
        model: string | {
            key: string;
            name?: string;
        };
        view: ViewElementDefinition | DowncastAttributeElementCreatorFunction;
        converterPriority?: PriorityString;
    } | {
        model: {
            key: string;
            name?: string;
            values: Array<TValues>;
        };
        view: Record<TValues, ViewElementDefinition | DowncastAttributeElementCreatorFunction>;
        converterPriority?: PriorityString;
    }): this;
    /**
     * Model attribute to view attribute conversion helper.
     *
     * This conversion results in adding an attribute to a view node, basing on an attribute from a model node. For example,
     * `<imageInline src='foo.jpg'></imageInline>` is converted to `<img src='foo.jpg'></img>`.
     *
     * ```ts
     * editor.conversion.for( 'downcast' ).attributeToAttribute( {
     * 	model: 'source',
     * 	view: 'src'
     * } );
     *
     * editor.conversion.for( 'downcast' ).attributeToAttribute( {
     * 	model: 'source',
     * 	view: 'href',
     * 	converterPriority: 'high'
     * } );
     *
     * editor.conversion.for( 'downcast' ).attributeToAttribute( {
     * 	model: {
     * 		name: 'imageInline',
     * 		key: 'source'
     * 	},
     * 	view: 'src'
     * } );
     *
     * editor.conversion.for( 'downcast' ).attributeToAttribute( {
     * 	model: {
     * 		name: 'styled',
     * 		values: [ 'dark', 'light' ]
     * 	},
     * 	view: {
     * 		dark: {
     * 			key: 'class',
     * 			value: [ 'styled', 'styled-dark' ]
     * 		},
     * 		light: {
     * 			key: 'class',
     * 			value: [ 'styled', 'styled-light' ]
     * 		}
     * 	}
     * } );
     *
     * editor.conversion.for( 'downcast' ).attributeToAttribute( {
     * 	model: 'styled',
     * 	view: modelAttributeValue => ( {
     * 		key: 'class',
     * 		value: 'styled-' + modelAttributeValue
     * 	} )
     * } );
     * ```
     *
     * **Note**: Downcasting to a style property requires providing `value` as an object:
     *
     * ```ts
     * editor.conversion.for( 'downcast' ).attributeToAttribute( {
     * 	model: 'lineHeight',
     * 	view: modelAttributeValue => ( {
     * 		key: 'style',
     * 		value: {
     * 			'line-height': modelAttributeValue,
     * 			'border-bottom': '1px dotted #ba2'
     * 		}
     * 	} )
     * } );
     * ```
     *
     * See {@link module:engine/conversion/conversion~Conversion#for `conversion.for()`} to learn how to add a converter
     * to the conversion process.
     *
     * @param config Conversion configuration.
     * @param config.model The key of the attribute to convert from or a `{ key, values, [ name ] }` object describing
     * the attribute key, possible values and, optionally, an element name to convert from.
     * @param config.view A view attribute key, or a `{ key, value }` object or a function that takes the model attribute value and
     * {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi downcast conversion API}
     * as parameters and returns a `{ key, value }` object. If the `key` is `'class'`, the `value` can be a `String` or an
     * array of `String`s. If the `key` is `'style'`, the `value` is an object with key-value pairs. In other cases, `value` is a `String`.
     * If `config.model.values` is set, `config.view` should be an object assigning values from `config.model.values` to
     * `{ key, value }` objects or a functions.
     * @param config.converterPriority Converter priority.
     */
    attributeToAttribute<TValues extends string>(config: {
        model: string | {
            key: string;
            name?: string;
        };
        view: string | DowncastAttributeDescriptor | DowncastAttributeCreatorFunction;
        converterPriority?: PriorityString;
    } | {
        model: {
            key: string;
            name?: string;
            values?: Array<TValues>;
        };
        view: Record<TValues, DowncastAttributeDescriptor | DowncastAttributeCreatorFunction>;
        converterPriority?: PriorityString;
    }): this;
    /**
     * Model marker to view element conversion helper.
     *
     * **Note**: This method should be used mainly for editing the downcast and it is recommended
     * to use the {@link #markerToData `#markerToData()`} helper instead.
     *
     * This helper may produce invalid HTML code (e.g. a span between table cells).
     * It should only be used when you are sure that the produced HTML will be semantically correct.
     *
     * This conversion results in creating a view element on the boundaries of the converted marker. If the converted marker
     * is collapsed, only one element is created. For example, a model marker set like this: `<paragraph>F[oo b]ar</paragraph>`
     * becomes `<p>F<span data-marker="search"></span>oo b<span data-marker="search"></span>ar</p>` in the view.
     *
     * ```ts
     * editor.conversion.for( 'editingDowncast' ).markerToElement( {
     * 	model: 'search',
     * 	view: 'marker-search'
     * } );
     *
     * editor.conversion.for( 'editingDowncast' ).markerToElement( {
     * 	model: 'search',
     * 	view: 'search-result',
     * 	converterPriority: 'high'
     * } );
     *
     * editor.conversion.for( 'editingDowncast' ).markerToElement( {
     * 	model: 'search',
     * 	view: {
     * 		name: 'span',
     * 		attributes: {
     * 			'data-marker': 'search'
     * 		}
     * 	}
     * } );
     *
     * editor.conversion.for( 'editingDowncast' ).markerToElement( {
     * 	model: 'search',
     * 	view: ( markerData, conversionApi ) => {
     * 		const { writer } = conversionApi;
     *
     * 		return writer.createUIElement( 'span', {
     * 			'data-marker': 'search',
     * 			'data-start': markerData.isOpening
     * 		} );
     * 	}
     * } );
     * ```
     *
     * If a function is passed as the `config.view` parameter, it will be used to generate both boundary elements. The function
     * receives the `data` object and {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi downcast conversion API}
     * as a parameters and should return an instance of the
     * {@link module:engine/view/uielement~ViewUIElement view UI element}. The `data` object and
     * {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi `conversionApi`} are passed from
     * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:addMarker}. Additionally,
     * the `data.isOpening` parameter is passed, which is set to `true` for the marker start boundary element, and `false` for
     * the marker end boundary element.
     *
     * See {@link module:engine/conversion/conversion~Conversion#for `conversion.for()`} to learn how to add a converter
     * to the conversion process.
     *
     * @param config Conversion configuration.
     * @param config.model The name of the model marker (or model marker group) to convert.
     * @param config.view A view element definition or a function that takes the model marker data and
     * {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi downcast conversion API} as a parameters
     * and returns a view UI element.
     * @param config.converterPriority Converter priority.
     */
    markerToElement(config: {
        model: string;
        view: ViewElementDefinition | DowncastMarkerElementCreatorFunction;
        converterPriority?: PriorityString;
    }): this;
    /**
     * Model marker to highlight conversion helper.
     *
     * This conversion results in creating a highlight on view nodes. For this kind of conversion,
     * the {@link module:engine/conversion/downcasthelpers~DowncastHighlightDescriptor} should be provided.
     *
     * For text nodes, a `<span>` {@link module:engine/view/attributeelement~ViewAttributeElement} is created and it wraps all text nodes
     * in the converted marker range. For example, a model marker set like this: `<paragraph>F[oo b]ar</paragraph>` becomes
     * `<p>F<span class="comment">oo b</span>ar</p>` in the view.
     *
     * {@link module:engine/view/containerelement~ViewContainerElement} may provide a custom way of handling highlight. Most often,
     * the element itself is given classes and attributes described in the highlight descriptor (instead of being wrapped in `<span>`).
     * For example, a model marker set like this:
     * `[<imageInline src="foo.jpg"></imageInline>]` becomes `<img src="foo.jpg" class="comment"></img>` in the view.
     *
     * For container elements, the conversion is two-step. While the converter processes the highlight descriptor and passes it
     * to a container element, it is the container element instance itself that applies values from the highlight descriptor.
     * So, in a sense, the converter takes care of stating what should be applied on what, while the element decides how to apply that.
     *
     * ```ts
     * editor.conversion.for( 'downcast' ).markerToHighlight( { model: 'comment', view: { classes: 'comment' } } );
     *
     * editor.conversion.for( 'downcast' ).markerToHighlight( {
     * 	model: 'comment',
     * 	view: { classes: 'comment' },
     * 	converterPriority: 'high'
     * } );
     *
     * editor.conversion.for( 'downcast' ).markerToHighlight( {
     * 	model: 'comment',
     * 	view: ( data, conversionApi ) => {
     * 		// Assuming that the marker name is in a form of comment:commentType:commentId.
     * 		const [ , commentType, commentId ] = data.markerName.split( ':' );
     *
     * 		return {
     * 			classes: [ 'comment', 'comment-' + commentType ],
     * 			attributes: { 'data-comment-id': commentId }
     * 		};
     * 	}
     * } );
     * ```
     *
     * If a function is passed as the `config.view` parameter, it will be used to generate the highlight descriptor. The function
     * receives the `data` object and {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi downcast conversion API}
     * as the parameters and should return a
     * {@link module:engine/conversion/downcasthelpers~DowncastHighlightDescriptor highlight descriptor}.
     * The `data` object properties are passed from {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:addMarker}.
     *
     * See {@link module:engine/conversion/conversion~Conversion#for `conversion.for()`} to learn how to add a converter
     * to the conversion process.
     *
     * @param config Conversion configuration.
     * @param config.model The name of the model marker (or model marker group) to convert.
     * @param config.view A highlight descriptor that will be used for highlighting or a function that takes the model marker data and
     * {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi downcast conversion API} as a parameters
     * and returns a highlight descriptor.
     * @param config.converterPriority Converter priority.
     */
    markerToHighlight(config: {
        model: string;
        view: DowncastHighlightDescriptor | DowncastHighlightDescriptorCreatorFunction;
        converterPriority?: PriorityString;
    }): this;
    /**
     * Model marker converter for data downcast.
     *
     * This conversion creates a representation for model marker boundaries in the view:
     *
     * * If the marker boundary is before or after a model element, a view attribute is set on a corresponding view element.
     * * In other cases, a view element with the specified tag name is inserted at the corresponding view position.
     *
     * Typically, the marker names use the `group:uniqueId:otherData` convention. For example: `comment:e34zfk9k2n459df53sjl34:zx32c`.
     * The default configuration for this conversion is that the first part is the `group` part and the rest of
     * the marker name becomes the `name` part.
     *
     * Tag and attribute names and values are generated from the marker name:
     *
     * * The templates for attributes are `data-[group]-start-before="[name]"`, `data-[group]-start-after="[name]"`,
     * `data-[group]-end-before="[name]"` and `data-[group]-end-after="[name]"`.
     * * The templates for view elements are `<[group]-start name="[name]">` and `<[group]-end name="[name]">`.
     *
     * Attributes mark whether the given marker's start or end boundary is before or after the given element.
     * The `data-[group]-start-before` and `data-[group]-end-after` attributes are favored.
     * The other two are used when the former two cannot be used.
     *
     * The conversion configuration can take a function that will generate different group and name parts.
     * If such a function is set as the `config.view` parameter, it is passed a marker name and it is expected to return an object with two
     * properties: `group` and `name`. If the function returns a falsy value, the conversion will not take place.
     *
     * Basic usage:
     *
     * ```ts
     * // Using the default conversion.
     * // In this case, all markers with names starting with 'comment:' will be converted.
     * // The `group` parameter will be set to `comment`.
     * // The `name` parameter will be the rest of the marker name (without the `:`).
     * editor.conversion.for( 'dataDowncast' ).markerToData( {
     * 	model: 'comment'
     * } );
     * ```
     *
     * An example of a view that may be generated by this conversion (assuming a marker with the name `comment:commentId:uid` marked
     * by `[]`):
     *
     * ```
     * // Model:
     * <paragraph>Foo[bar</paragraph>
     * <imageBlock src="abc.jpg"></imageBlock>]
     *
     * // View:
     * <p>Foo<comment-start name="commentId:uid"></comment-start>bar</p>
     * <figure data-comment-end-after="commentId:uid" class="image"><img src="abc.jpg" /></figure>
     * ```
     *
     * In the example above, the comment starts before "bar" and ends after the image.
     *
     * If the `name` part is empty, the following view may be generated:
     *
     * ```html
     * <p>Foo <myMarker-start></myMarker-start>bar</p>
     * <figure data-myMarker-end-after="" class="image"><img src="abc.jpg" /></figure>
     * ```
     *
     * **Note:** A situation where some markers have the `name` part and some do not, is incorrect and should be avoided.
     *
     * Examples where `data-group-start-after` and `data-group-end-before` are used:
     *
     * ```
     * // Model:
     * <blockQuote>[]<paragraph>Foo</paragraph></blockQuote>
     *
     * // View:
     * <blockquote><p data-group-end-before="name" data-group-start-before="name">Foo</p></blockquote>
     * ```
     *
     * Similarly, when a marker is collapsed after the last element:
     *
     * ```
     * // Model:
     * <blockQuote><paragraph>Foo</paragraph>[]</blockQuote>
     *
     * // View:
     * <blockquote><p data-group-end-after="name" data-group-start-after="name">Foo</p></blockquote>
     * ```
     *
     * When there are multiple markers from the same group stored in the same attribute of the same element, their
     * name parts are put together in the attribute value, for example: `data-group-start-before="name1,name2,name3"`.
     *
     * Other examples of usage:
     *
     * ```ts
     * // Using a custom function which is the same as the default conversion:
     * editor.conversion.for( 'dataDowncast' ).markerToData( {
     * 	model: 'comment',
     * 	view: markerName => ( {
     * 		group: 'comment',
     * 		name: markerName.substr( 8 ) // Removes 'comment:' part.
     * 	} )
     * } );
     *
     * // Using the converter priority:
     * editor.conversion.for( 'dataDowncast' ).markerToData( {
     * 	model: 'comment',
     * 	view: markerName => ( {
     * 		group: 'comment',
     * 		name: markerName.substr( 8 ) // Removes 'comment:' part.
     * 	} ),
     * 	converterPriority: 'high'
     * } );
     * ```
     *
     * This kind of conversion is useful for saving data into the database, so it should be used in the data conversion pipeline.
     *
     * See the {@link module:engine/conversion/conversion~Conversion#for `conversion.for()`} API guide to learn how to
     * add a converter to the conversion process.
     *
     * @param config Conversion configuration.
     * @param config.model The name of the model marker (or the model marker group) to convert.
     * @param config.view A function that takes the model marker name and
     * {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi downcast conversion API} as the parameters
     * and returns an object with the `group` and `name` properties.
     * @param config.converterPriority Converter priority.
     */
    markerToData(config: {
        model: string;
        view?: DowncastMarkerDataCreatorFunction;
        converterPriority?: PriorityString;
    }): this;
}
/**
 * Function factory that creates a default downcast converter for text insertion changes.
 *
 * The converter automatically consumes the corresponding value from the consumables list and stops the event (see
 * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher}).
 *
 * ```ts
 * modelDispatcher.on( 'insert:$text', insertText() );
 * ```
 *
 * @returns Insert text event converter.
 * @internal
 */
export declare function insertText(): (evt: EventInfo, data: {
    item: ModelText | ModelTextProxy;
    range: ModelRange;
}, conversionApi: DowncastConversionApi) => void;
/**
 * Function factory that creates a default downcast converter for triggering attributes and children conversion.
 *
 * @returns The converter.
 * @internal
 */
export declare function insertAttributesAndChildren(): (evt: unknown, data: {
    item: ModelItem;
    reconversion?: boolean;
}, conversionApi: DowncastConversionApi) => void;
/**
 * Function factory that creates a default downcast converter for node remove changes.
 *
 * ```ts
 * modelDispatcher.on( 'remove', remove() );
 * ```
 *
 * @returns Remove event converter.
 * @internal
 */
export declare function remove(): (evt: unknown, data: {
    position: ModelPosition;
    length: number;
    reconversion?: boolean;
}, conversionApi: DowncastConversionApi) => void;
/**
 * Creates a `<span>` {@link module:engine/view/attributeelement~ViewAttributeElement view attribute element} from the information
 * provided by the {@link module:engine/conversion/downcasthelpers~DowncastHighlightDescriptor highlight descriptor} object. If the priority
 * is not provided in the descriptor, the default priority will be used.
 *
 * @internal
 */
export declare function createViewElementFromDowncastHighlightDescriptor(writer: ViewDowncastWriter, descriptor: DowncastHighlightDescriptor): ViewAttributeElement;
/**
 * Function factory that creates a converter which converts a non-collapsed
 * {@link module:engine/model/selection~ModelSelection model selection}
 * to a {@link module:engine/view/documentselection~ViewDocumentSelection view selection}. The converter consumes appropriate
 * value from the `consumable` object and maps model positions from the selection to view positions.
 *
 * ```ts
 * modelDispatcher.on( 'selection', convertRangeSelection() );
 * ```
 *
 * @returns Selection converter.
 * @internal
 */
export declare function convertRangeSelection(): (evt: EventInfo, data: {
    selection: ModelSelection | ModelDocumentSelection;
}, conversionApi: DowncastConversionApi) => void;
/**
 * Function factory that creates a converter which converts a collapsed
 * {@link module:engine/model/selection~ModelSelection model selection} to
 * a {@link module:engine/view/documentselection~ViewDocumentSelection view selection}. The converter consumes appropriate
 * value from the `consumable` object, maps the model selection position to the view position and breaks
 * {@link module:engine/view/attributeelement~ViewAttributeElement attribute elements} at the selection position.
 *
 * ```ts
 * modelDispatcher.on( 'selection', convertCollapsedSelection() );
 * ```
 *
 * An example of the view state before and after converting the collapsed selection:
 *
 * ```
 *    <p><strong>f^oo<strong>bar</p>
 * -> <p><strong>f</strong>^<strong>oo</strong>bar</p>
 * ```
 *
 * By breaking attribute elements like `<strong>`, the selection is in a correct element. Then, when the selection attribute is
 * converted, broken attributes might be merged again, or the position where the selection is may be wrapped
 * with different, appropriate attribute elements.
 *
 * See also {@link module:engine/conversion/downcasthelpers~cleanSelection} which does a clean-up
 * by merging attributes.
 *
 * @returns Selection converter.
 * @internal
 */
export declare function convertCollapsedSelection(): (evt: EventInfo, data: {
    selection: ModelSelection | ModelDocumentSelection;
}, conversionApi: DowncastConversionApi) => void;
/**
 * Function factory that creates a converter which cleans artifacts after the previous
 * {@link module:engine/model/selection~ModelSelection model selection} conversion. It removes all empty
 * {@link module:engine/view/attributeelement~ViewAttributeElement view attribute elements} and merges
 * sibling attributes at all start and end positions of all ranges.
 *
 * ```
 *    <p><strong>^</strong></p>
 * -> <p>^</p>
 *
 *    <p><strong>foo</strong>^<strong>bar</strong>bar</p>
 * -> <p><strong>foo^bar<strong>bar</p>
 *
 *    <p><strong>foo</strong><em>^</em><strong>bar</strong>bar</p>
 * -> <p><strong>foo^bar<strong>bar</p>
 * ```
 *
 * This listener should be assigned before any converter for the new selection:
 *
 * ```ts
 * modelDispatcher.on( 'cleanSelection', cleanSelection() );
 * ```
 *
 * See {@link module:engine/conversion/downcasthelpers~convertCollapsedSelection}
 * which does the opposite by breaking attributes in the selection position.
 *
 * @returns Selection converter.
 * @internal
 */
export declare function cleanSelection(): (evt: EventInfo, data: unknown, conversionApi: DowncastConversionApi) => void;
/**
 * Function factory that creates a converter which converts the set/change/remove attribute changes from the model to the view.
 * It can also be used to convert selection attributes. In that case, an empty attribute element will be created and the
 * selection will be put inside it.
 *
 * Attributes from the model are converted to a view element that will be wrapping these view nodes that are bound to
 * model elements having the given attribute. This is useful for attributes like `bold` that may be set on text nodes in the model
 * but are represented as an element in the view:
 *
 * ```
 * [paragraph]              MODEL ====> VIEW        <p>
 * 	|- a {bold: true}                             |- <b>
 * 	|- b {bold: true}                             |   |- ab
 * 	|- c                                          |- c
 * 	```
 *
 * Passed `Function` will be provided with the attribute value and then all the parameters of the
 * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute `attribute` event}.
 * It is expected that the function returns an {@link module:engine/view/element~ViewElement}.
 * The result of the function will be the wrapping element.
 * When the provided `Function` does not return any element, no conversion will take place.
 *
 * The converter automatically consumes the corresponding value from the consumables list and stops the event (see
 * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher}).
 *
 * ```ts
 * modelDispatcher.on( 'attribute:bold', wrap( ( modelAttributeValue, { writer } ) => {
 * 	return writer.createAttributeElement( 'strong' );
 * } );
 * ```
 *
 * @internal
 * @param elementCreator Function returning a view element that will be used for wrapping.
 * @returns Set/change attribute converter.
 */
export declare function wrap(elementCreator: DowncastAttributeElementCreatorFunction): (evt: EventInfo, data: {
    item: ModelItem | ModelSelection | ModelDocumentSelection;
    range: ModelRange;
    attributeKey: string;
    attributeOldValue: unknown;
    attributeNewValue: unknown;
}, conversionApi: DowncastConversionApi) => void;
/**
 * Function factory that creates a converter which converts node insertion changes from the model to the view.
 * The function passed will be provided with all the parameters of the dispatcher's
 * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:insert `insert` event}.
 * It is expected that the function returns an {@link module:engine/view/element~ViewElement}.
 * The result of the function will be inserted into the view.
 *
 * The converter automatically consumes the corresponding value from the consumables list and binds the model and view elements.
 *
 * ```ts
 * downcastDispatcher.on(
 * 	'insert:myElem',
 * 	insertElement( ( modelItem, { writer } ) => {
 * 		const text = writer.createText( 'myText' );
 * 		const myElem = writer.createElement( 'myElem', { myAttr: 'my-' + modelItem.getAttribute( 'myAttr' ) }, text );
 *
 * 		// Do something fancy with `myElem` using `modelItem` or other parameters.
 *
 * 		return myElem;
 * 	}
 * ) );
 * ```
 *
 * @internal
 * @param  elementCreator Function returning a view element, which will be inserted.
 * @param consumer Function defining element consumption process.
 * By default this function just consume passed item insertion.
 * @returns Insert element event converter.
 */
export declare function insertElement(elementCreator: DowncastElementCreatorFunction, consumer?: ConsumerFunction): (evt: unknown, data: {
    item: ModelElement;
    range: ModelRange;
    reconversion?: boolean;
}, conversionApi: DowncastConversionApi) => void;
/**
 * Function factory that creates a converter which converts a single model node insertion to a view structure.
 *
 * It is expected that the passed element creator function returns an {@link module:engine/view/element~ViewElement} with attached slots
 * created with `writer.createSlot()` to indicate where child nodes should be converted.
 *
 * @see module:engine/conversion/downcasthelpers~DowncastHelpers#elementToStructure
 *
 * @internal
 * @param elementCreator Function returning a view structure, which will be inserted.
 * @param consumer A callback that is expected to consume all the consumables
 * that were used by the element creator.
 * @returns Insert element event converter.
*/
export declare function insertStructure(elementCreator: DowncastStructureCreatorFunction, consumer: ConsumerFunction): (evt: unknown, data: {
    item: ModelElement;
    range: ModelRange;
    reconversion?: boolean;
}, conversionApi: DowncastConversionApi) => void;
/**
 * Function factory that creates a converter which converts marker adding change to the
 * {@link module:engine/view/uielement~ViewUIElement view UI element}.
 *
 * The view UI element that will be added to the view depends on the passed parameter. See {@link ~insertElement}.
 * In case of a non-collapsed range, the UI element will not wrap nodes but separate elements will be placed at the beginning
 * and at the end of the range.
 *
 * This converter binds created UI elements with the marker name using {@link module:engine/conversion/mapper~Mapper#bindElementToMarker}.
 *
 * @internal
 * @param elementCreator A view UI element or a function returning the view element that will be inserted.
 * @returns Insert element event converter.
 */
export declare function insertUIElement(elementCreator: DowncastMarkerElementCreatorFunction): (evt: EventInfo, data: {
    markerRange: ModelRange;
    markerName: string;
    isOpening?: boolean;
}, conversionApi: DowncastConversionApi) => void;
/**
 * An object describing how the marker highlight should be represented in the view.
 *
 * Each text node contained in a highlighted range will be wrapped in a `<span>`
 * {@link module:engine/view/attributeelement~ViewAttributeElement view attribute element} with CSS class(es), attributes and a priority
 * described by this object.
 *
 * Additionally, each {@link module:engine/view/containerelement~ViewContainerElement container element} can handle displaying the highlight
 * separately by providing the `addHighlight` and `removeHighlight` custom properties. In this case:
 *
 *  * The `DowncastHighlightDescriptor` object is passed to the `addHighlight` function upon conversion and
 *  should be used to apply the highlight to the element.
 *  * The descriptor `id` is passed to the `removeHighlight` function upon conversion and should be used to remove the highlight with the
 *  given ID from the element.
 */
export interface DowncastHighlightDescriptor {
    /**
     * A CSS class or an array of classes to set. If the descriptor is used to
     * create an {@link module:engine/view/attributeelement~ViewAttributeElement attribute element} over text nodes,
     * these classes will be set on that attribute element. If the descriptor is applied to an element, usually these
     * classes will be set on that element, however, this depends on how the element converts the descriptor.
     */
    classes: string | Array<string>;
    /**
     * Descriptor identifier. If not provided, it defaults to the converted marker's name.
     */
    id?: string;
    /**
     * Descriptor priority. If not provided, it defaults to `10`. If the descriptor is used to create
     * an {@link module:engine/view/attributeelement~ViewAttributeElement attribute element}, it will be that element's
     * {@link module:engine/view/attributeelement~ViewAttributeElement#priority priority}. If the descriptor is applied to an element,
     * the priority will be used to determine which descriptor is more important.
     */
    priority?: number;
    /**
     * Attributes to set. If the descriptor is used to create
     * an {@link module:engine/view/attributeelement~ViewAttributeElement attribute element} over text nodes, these attributes will be set
     * on that attribute element. If the descriptor is applied to an element, usually these attributes will be set on that element, however,
     * this depends on how the element converts the descriptor.
     */
    attributes?: Record<string, string>;
}
/**
 * A filtering function used to choose model child nodes to be downcasted into the specific view
 * {@link module:engine/view/downcastwriter~ViewDowncastWriter#createSlot "slot"} while executing the
 * {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToStructure `elementToStructure()`} converter.
 *
 * @callback module:engine/conversion/downcasthelpers~DowncastSlotFilter
 *
 * @param node A model node.
 * @returns Whether the provided model node should be downcasted into this slot.
 *
 * @see module:engine/view/downcastwriter~ViewDowncastWriter#createSlot
 * @see module:engine/conversion/downcasthelpers~DowncastHelpers#elementToStructure
 * @see module:engine/conversion/downcasthelpers~insertStructure
 */
export type DowncastSlotFilter = (node: ModelNode) => boolean;
/**
 * A view element creator function that takes the model element and {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi
 * downcast conversion API} as parameters and returns a view container element.
 *
 * @callback module:engine/conversion/downcasthelpers~DowncastElementCreatorFunction
 *
 * @param element The model element to be converted to the view structure.
 * @param conversionApi The conversion interface.
 * @param data Additional information about the change (same as for
 * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:insert `insert`} event).
 * @param data.item Inserted item.
 * @param data.range Range spanning over inserted item.
 * @returns The view element.
 *
 * @see module:engine/conversion/downcasthelpers~DowncastHelpers#elementToElement
 * @see module:engine/conversion/downcasthelpers~insertElement
 */
export type DowncastElementCreatorFunction = (element: ModelElement, conversionApi: DowncastConversionApi, data: {
    item: ModelItem;
    range: ModelRange;
}) => ViewElement | null;
/**
 * A function that takes the model element and {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi downcast
 * conversion API} as parameters and returns a view container element with slots for model child nodes to be converted into.
 *
 * @callback module:engine/conversion/downcasthelpers~DowncastStructureCreatorFunction
 *
 * @param element The model element to be converted to the view structure.
 * @param conversionApi The conversion interface.
 * @param data Additional information about the change (same as for
 * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:insert `insert`} event).
 * @param data.item Inserted item.
 * @param data.range Range spanning over inserted item.
 * @returns The view structure with slots for model child nodes.
 *
 * @see module:engine/conversion/downcasthelpers~DowncastHelpers#elementToStructure
 * @see module:engine/conversion/downcasthelpers~insertStructure
 */
export type DowncastStructureCreatorFunction = DowncastElementCreatorFunction;
/**
 * A view element creator function that takes the model attribute value and
 * {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi downcast conversion API} as parameters and returns a view
 * attribute element.
 *
 * @callback module:engine/conversion/downcasthelpers~DowncastAttributeElementCreatorFunction
 *
 * @param attributeValue The model attribute value to be converted to the view attribute element.
 * @param conversionApi The conversion interface.
 * @param data Additional information about the change (same as for
 * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute `attribute`} event).
 * @param data.item Changed item or converted selection.
 * @param data.range Range spanning over changed item or selection range.
 * @param data.attributeKey Attribute key.
 * @param data.attributeOldValue Attribute value before the change. This is `null` when selection attribute is converted.
 * @param data.attributeNewValue New attribute value.
 * @returns The view attribute element.
 *
 * @see module:engine/conversion/downcasthelpers~DowncastHelpers#attributeToElement
 * @see module:engine/conversion/downcasthelpers~wrap
 */
export type DowncastAttributeElementCreatorFunction = (attributeValue: any, conversionApi: DowncastConversionApi, data: {
    item: ModelItem | ModelSelection | ModelDocumentSelection;
    range: ModelRange;
    attributeKey: string;
    attributeOldValue: unknown;
    attributeNewValue: unknown;
}) => ViewAttributeElement | null;
/**
 * A function that takes the model attribute value and
 * {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi downcast conversion API}
 * as parameters.
 *
 * @callback module:engine/conversion/downcasthelpers~DowncastAttributeCreatorFunction
 *
 * @param attributeValue The model attribute value to be converted to the view attribute element.
 * @param conversionApi The conversion interface.
 * @param data Additional information about the change (same as for
 * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute `attribute`} event).
 * @param data.item Changed item or converted selection.
 * @param data.range Range spanning over changed item or selection range.
 * @param data.attributeKey Attribute key.
 * @param data.attributeOldValue Attribute value before the change. This is `null` when selection attribute is converted.
 * @param data.attributeNewValue New attribute value.
 * @returns A `{ key, value }` object. If `key` is `'class'`, `value` can be a `String` or an
 * array of `String`s. If `key` is `'style'`, `value` is an object with key-value pairs. In other cases, `value` is a `String`.
 *
 * @see module:engine/conversion/downcasthelpers~DowncastHelpers#attributeToAttribute
 */
export type DowncastAttributeCreatorFunction = (attributeValue: unknown, conversionApi: DowncastConversionApi, data: {
    item: ModelItem;
    range: ModelRange;
    attributeKey: string;
    attributeOldValue: unknown;
    attributeNewValue: unknown;
}) => DowncastAttributeDescriptor | null;
export type DowncastAttributeDescriptor = {
    key: 'class';
    value: string | Array<string>;
} | {
    key: 'style';
    value: Record<string, string>;
} | {
    key: Exclude<string, 'class' | 'style'>;
    value: string;
};
export type DowncastMarkerElementCreatorFunction = (data: {
    markerRange: ModelRange;
    markerName: string;
    isOpening?: boolean;
}, conversionApi: DowncastConversionApi) => ViewUIElement | null;
export type DowncastHighlightDescriptorCreatorFunction = (data: {
    markerRange: ModelRange;
    markerName: string;
}, conversionApi: DowncastConversionApi) => DowncastHighlightDescriptor | null;
export type DowncastAddHighlightCallback = (viewElement: ViewElement, descriptor: DowncastHighlightDescriptor, writer: ViewDowncastWriter) => void;
export type DowncastRemoveHighlightCallback = (viewElement: ViewElement, id: string, writer: ViewDowncastWriter) => void;
export type DowncastMarkerDataCreatorFunction = (markerName: string, conversionApi: DowncastConversionApi) => {
    name: string;
    group: string;
} | null;
/**
 * A function that is expected to consume all the consumables that were used by the element creator.
 *
 * @callback module:engine/conversion/downcasthelpers~ConsumerFunction
 *
 * @internal
 * @param element The model element to be converted to the view structure.
 * @param consumable The `ModelConsumable` same as in
 * {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi#consumable `DowncastConversionApi.consumable`}.
 * @param options.preflight Whether should consume or just check if can be consumed.
 * @returns `true` if all consumable values were available and were consumed, `false` otherwise.
 *
 * @see module:engine/conversion/downcasthelpers~insertStructure
 */
export type ConsumerFunction = (element: ModelElement, consumable: ModelConsumable, options?: {
    preflight?: boolean;
}) => boolean | null;
