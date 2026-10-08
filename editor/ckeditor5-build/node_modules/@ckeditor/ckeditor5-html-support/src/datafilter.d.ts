/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module html-support/datafilter
 */
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { type MatcherPattern, type UpcastConversionApi, type ViewElement, type MatcherObjectPattern } from 'ckeditor5/src/engine.js';
import { Widget } from 'ckeditor5/src/widget.js';
import { DataSchema, type HtmlSupportDataSchemaDefinition } from './dataschema.js';
import { type GHSViewAttributes } from './utils.js';
import '../theme/datafilter.css';
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
 */
export declare class DataFilter extends Plugin {
    /**
     * An instance of the {@link module:html-support/dataschema~DataSchema}.
     */
    private readonly _dataSchema;
    /**
     * {@link module:engine/view/matcher~Matcher Matcher} instance describing rules upon which
     * content attributes should be allowed.
     */
    private readonly _allowedAttributes;
    /**
     * {@link module:engine/view/matcher~Matcher Matcher} instance describing rules upon which
     * content attributes should be disallowed.
     */
    private readonly _disallowedAttributes;
    /**
     * Allowed element definitions by {@link module:html-support/datafilter~DataFilter#allowElement} method.
    */
    private readonly _allowedElements;
    /**
     * Disallowed element names by {@link module:html-support/datafilter~DataFilter#disallowElement} method.
     */
    private readonly _disallowedElements;
    /**
     * Indicates if {@link module:engine/controller/datacontroller~DataController editor's data controller}
     * data has been already initialized.
    */
    private _dataInitialized;
    /**
     * Cached map of coupled attributes. Keys are the feature attributes names
     * and values are arrays with coupled GHS attributes names.
     */
    private _coupledAttributes;
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    static get pluginName(): "DataFilter";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof DataSchema, typeof Widget];
    /**
     * Load a configuration of one or many elements, where their attributes should be allowed.
     *
     * **Note**: Rules will be applied just before next data pipeline data init or set.
     *
     * @param config Configuration of elements that should have their attributes accepted in the editor.
     */
    loadAllowedConfig(config: Array<MatcherObjectPattern>): void;
    /**
     * Load a configuration of one or many elements, where their attributes should be disallowed.
     *
     * **Note**: Rules will be applied just before next data pipeline data init or set.
     *
     * @param config Configuration of elements that should have their attributes rejected from the editor.
     */
    loadDisallowedConfig(config: Array<MatcherObjectPattern>): void;
    /**
     * Load a configuration of one or many elements, where when empty should be allowed.
     *
     * **Note**: It modifies DataSchema so must be loaded before registering filtering rules.
     *
     * @param config Configuration of elements that should be preserved even if empty.
     */
    loadAllowedEmptyElementsConfig(config: Array<string>): void;
    /**
     * Allow the given element in the editor context.
     *
     * This method will only allow elements described by the {@link module:html-support/dataschema~DataSchema} used
     * to create data filter.
     *
     * **Note**: Rules will be applied just before next data pipeline data init or set.
     *
     * @param viewName String or regular expression matching view name.
     */
    allowElement(viewName: string | RegExp): void;
    /**
     * Disallow the given element in the editor context.
     *
     * This method will only disallow elements described by the {@link module:html-support/dataschema~DataSchema} used
     * to create data filter.
     *
     * @param viewName String or regular expression matching view name.
     */
    disallowElement(viewName: string | RegExp): void;
    /**
     * Allow the given empty element in the editor context.
     *
     * This method will only allow elements described by the {@link module:html-support/dataschema~DataSchema} used
     * to create data filter.
     *
     * **Note**: It modifies DataSchema so must be called before registering filtering rules.
     *
     * @param viewName String or regular expression matching view name.
     */
    allowEmptyElement(viewName: string): void;
    /**
     * Allow the given attributes for view element allowed by {@link #allowElement} method.
     *
     * @param config Pattern matching all attributes which should be allowed.
     */
    allowAttributes(config: MatcherPattern): void;
    /**
     * Disallow the given attributes for view element allowed by {@link #allowElement} method.
     *
     * @param config Pattern matching all attributes which should be disallowed.
     */
    disallowAttributes(config: MatcherPattern): void;
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
     */
    processViewAttributes(viewElement: ViewElement, conversionApi: UpcastConversionApi): GHSViewAttributes | null;
    /**
     * Adds allowed element definition and fires registration event.
     */
    private _addAllowedElement;
    /**
     * Registers elements allowed by {@link module:html-support/datafilter~DataFilter#allowElement} method
     * once {@link module:engine/controller/datacontroller~DataController editor's data controller} is initialized.
    */
    private _registerElementsAfterInit;
    /**
     * Registers default element handlers.
     */
    private _registerElementHandlers;
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
     */
    private _registerCoupledAttributesPostFixer;
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
     */
    private _registerAssociatedHtmlAttributesPostFixer;
    /**
     * Collects the map of coupled attributes. The returned map is keyed by the feature attribute name
     * and coupled GHS attribute names are stored in the value array.
     */
    private _getCoupledAttributesMap;
    /**
     * Fires `register` event for the given element definition.
     */
    private _fireRegisterEvent;
    /**
     * Registers object element and attribute converters for the given data schema definition.
     */
    private _registerObjectElement;
    /**
     * Registers block element and attribute converters for the given data schema definition.
     */
    private _registerBlockElement;
    /**
     * Registers inline element and attribute converters for the given data schema definition.
     *
     * Extends `$text` model schema to allow the given definition model attribute and its properties.
     */
    private _registerInlineElement;
}
/**
 * Fired when {@link module:html-support/datafilter~DataFilter} is registering element and attribute
 * converters for the {@link module:html-support/dataschema~HtmlSupportDataSchemaDefinition element definition}.
 *
 * The event also accepts {@link module:html-support/dataschema~HtmlSupportDataSchemaDefinition#view} value
 * as an event namespace, e.g. `register:span`.
 *
 * ```ts
 * dataFilter.on( 'register', ( evt, definition ) => {
 * 	editor.model.schema.register( definition.model, definition.modelSchema );
 * 	editor.conversion.elementToElement( { model: definition.model, view: definition.view } );
 *
 * 	evt.stop();
 * } );
 *
 * dataFilter.on( 'register:span', ( evt, definition ) => {
 * 	editor.model.schema.extend( '$text', { allowAttributes: 'htmlSpan' } );
 *
 * 	editor.conversion.for( 'upcast' ).elementToAttribute( { view: 'span', model: 'htmlSpan' } );
 * 	editor.conversion.for( 'downcast' ).attributeToElement( { view: 'span', model: 'htmlSpan' } );
 *
 * 	evt.stop();
 * }, { priority: 'high' } )
 * ```
 *
 * @eventName ~DataFilter#register
 */
export interface HtmlSupportDataFilterRegisterEvent {
    name: 'register' | `register:${string}`;
    args: [data: HtmlSupportDataSchemaDefinition];
}
