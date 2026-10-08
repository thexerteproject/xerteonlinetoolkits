/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/element
 */
import { ViewNode } from './node.js';
import { type ArrayOrItem } from '@ckeditor/ckeditor5-utils';
import { type MatcherPattern, type NormalizedPropertyPattern } from './matcher.js';
import { type Styles, type StyleValue } from './stylesmap.js';
import { type ViewDocument } from './document.js';
import { type ViewItem } from './item.js';
/**
 * View element.
 *
 * The editing engine does not define a fixed semantics of its elements (it is "DTD-free").
 * This is why the type of the {@link module:engine/view/element~ViewElement} need to
 * be defined by the feature developer. When creating an element you should use one of the following methods:
 *
 * * {@link module:engine/view/downcastwriter~ViewDowncastWriter#createContainerElement `downcastWriter#createContainerElement()`}
 * in order to create a {@link module:engine/view/containerelement~ViewContainerElement},
 * * {@link module:engine/view/downcastwriter~ViewDowncastWriter#createAttributeElement `downcastWriter#createAttributeElement()`}
 * in order to create a {@link module:engine/view/attributeelement~ViewAttributeElement},
 * * {@link module:engine/view/downcastwriter~ViewDowncastWriter#createEmptyElement `downcastWriter#createEmptyElement()`}
 * in order to create a {@link module:engine/view/emptyelement~ViewEmptyElement}.
 * * {@link module:engine/view/downcastwriter~ViewDowncastWriter#createUIElement `downcastWriter#createUIElement()`}
 * in order to create a {@link module:engine/view/uielement~ViewUIElement}.
 * * {@link module:engine/view/downcastwriter~ViewDowncastWriter#createEditableElement `downcastWriter#createEditableElement()`}
 * in order to create a {@link module:engine/view/editableelement~ViewEditableElement}.
 *
 * Note that for view elements which are not created from the model, like elements from mutations, paste or
 * {@link module:engine/controller/datacontroller~DataController#set data.set} it is not possible to define the type of the element.
 * In such cases the {@link module:engine/view/upcastwriter~ViewUpcastWriter#createElement `UpcastWriter#createElement()`} method
 * should be used to create generic view elements.
 */
export declare class ViewElement extends ViewNode {
    /**
     * Name of the element.
     */
    readonly name: string;
    /**
     * A list of attribute names that should be rendered in the editing pipeline even though filtering mechanisms
     * implemented in the {@link module:engine/view/domconverter~ViewDomConverter} (for instance,
     * {@link module:engine/view/domconverter~ViewDomConverter#shouldRenderAttribute}) would filter them out.
     *
     * These attributes can be specified as an option when the element is created by
     * the {@link module:engine/view/downcastwriter~ViewDowncastWriter}. To check whether an unsafe an attribute should
     * be permitted, use the {@link #shouldRenderUnsafeAttribute} method.
     *
     * @internal
     */
    readonly _unsafeAttributesToRender: Array<string>;
    /**
     * Map of attributes, where attributes names are keys and attributes values are values.
     */
    private readonly _attrs;
    /**
     * Array of child nodes.
     */
    private readonly _children;
    /**
     * Map of custom properties.
     * Custom properties can be added to element instance, will be cloned but not rendered into DOM.
     */
    private readonly _customProperties;
    /**
     * Set of classes associated with element instance.
     *
     * Note that this is just an alias for `this._attrs.get( 'class' );`
     */
    private get _classes();
    /**
     * Normalized styles.
     *
     * Note that this is just an alias for `this._attrs.get( 'style' );`
     */
    private get _styles();
    /**
     * Creates a view element.
     *
     * Attributes can be passed in various formats:
     *
     * ```ts
     * new Element( viewDocument, 'div', { class: 'editor', contentEditable: 'true' } ); // object
     * new Element( viewDocument, 'div', [ [ 'class', 'editor' ], [ 'contentEditable', 'true' ] ] ); // map-like iterator
     * new Element( viewDocument, 'div', mapOfAttributes ); // map
     * ```
     *
     * @internal
     * @param document The document instance to which this element belongs.
     * @param name Node name.
     * @param attrs Collection of attributes.
     * @param children A list of nodes to be inserted into created element.
     */
    constructor(document: ViewDocument, name: string, attrs?: ViewElementAttributes, children?: ViewNode | Iterable<ViewNode>);
    /**
     * Number of element's children.
     */
    get childCount(): number;
    /**
     * Is `true` if there are no nodes inside this element, `false` otherwise.
     */
    get isEmpty(): boolean;
    /**
     * Gets child at the given index.
     *
     * @param index Index of child.
     * @returns Child node.
     */
    getChild(index: number): ViewNode | undefined;
    /**
     * Gets index of the given child node. Returns `-1` if child node is not found.
     *
     * @param node Child node.
     * @returns Index of the child node.
     */
    getChildIndex(node: ViewNode): number;
    /**
     * Gets child nodes iterator.
     *
     * @returns Child nodes iterator.
     */
    getChildren(): IterableIterator<ViewNode>;
    /**
     * Returns an iterator that contains the keys for attributes. Order of inserting attributes is not preserved.
     *
     * @returns Keys for attributes.
     */
    getAttributeKeys(): IterableIterator<string>;
    /**
     * Returns iterator that iterates over this element's attributes.
     *
     * Attributes are returned as arrays containing two items. First one is attribute key and second is attribute value.
     * This format is accepted by native `Map` object and also can be passed in `Node` constructor.
     */
    getAttributes(): IterableIterator<[string, string]>;
    /**
     * Gets attribute by key. If attribute is not present - returns undefined.
     *
     * @param key Attribute key.
     * @returns Attribute value.
     */
    getAttribute(key: string): string | undefined;
    /**
     * Returns a boolean indicating whether an attribute with the specified key exists in the element.
     *
     * @param key Attribute key.
     * @returns `true` if attribute with the specified key exists in the element, `false` otherwise.
     */
    hasAttribute(key: string, token?: string): boolean;
    /**
     * Checks if this element is similar to other element.
     * Both elements should have the same name and attributes to be considered as similar. Two similar elements
     * can contain different set of children nodes.
     */
    isSimilar(otherElement: ViewItem): boolean;
    /**
     * Returns true if class is present.
     * If more then one class is provided - returns true only when all classes are present.
     *
     * ```ts
     * element.hasClass( 'foo' ); // Returns true if 'foo' class is present.
     * element.hasClass( 'foo', 'bar' ); // Returns true if 'foo' and 'bar' classes are both present.
     * ```
     */
    hasClass(...className: Array<string>): boolean;
    /**
     * Returns iterator that contains all class names.
     */
    getClassNames(): IterableIterator<string>;
    /**
     * Returns style value for the given property name.
     * If the style does not exist `undefined` is returned.
     *
     * **Note**: This method can work with normalized style names if
     * {@link module:engine/controller/datacontroller~DataController#addStyleProcessorRules a particular style processor rule is enabled}.
     * See {@link module:engine/view/stylesmap~StylesMap#getAsString `StylesMap#getAsString()`} for details.
     *
     * For an element with style set to `'margin:1px'`:
     *
     * ```ts
     * // Enable 'margin' shorthand processing:
     * editor.data.addStyleProcessorRules( addMarginStylesRules );
     *
     * const element = view.change( writer => {
     * 	const element = writer.createElement();
     * 	writer.setStyle( 'margin', '1px' );
     * 	writer.setStyle( 'margin-bottom', '3em' );
     *
     * 	return element;
     * } );
     *
     * element.getStyle( 'margin' ); // -> 'margin: 1px 1px 3em;'
     * ```
     */
    getStyle(property: string): string | undefined;
    /**
     * Returns a normalized style object or single style value.
     *
     * For an element with style set to: margin:1px 2px 3em;
     *
     * ```ts
     * element.getNormalizedStyle( 'margin' ) );
     * ```
     *
     * will return:
     *
     * ```ts
     * {
     * 	top: '1px',
     * 	right: '2px',
     * 	bottom: '3em',
     * 	left: '2px'    // a normalized value from margin shorthand
     * }
     * ```
     *
     * and reading for single style value:
     *
     * ```ts
     * styles.getNormalizedStyle( 'margin-left' );
     * ```
     *
     * Will return a `2px` string.
     *
     * **Note**: This method will return normalized values only if
     * {@link module:engine/controller/datacontroller~DataController#addStyleProcessorRules a particular style processor rule is enabled}.
     * See {@link module:engine/view/stylesmap~StylesMap#getNormalized `StylesMap#getNormalized()`} for details.
     *
     * @param property Name of CSS property
     */
    getNormalizedStyle(property: string): StyleValue | undefined;
    /**
     * Returns an array that contains all style names.
     *
     * @param expand Expand shorthand style properties and return all equivalent style representations.
     */
    getStyleNames(expand?: boolean): Array<string>;
    /**
     * Returns true if style keys are present.
     * If more then one style property is provided - returns true only when all properties are present.
     *
     * ```ts
     * element.hasStyle( 'color' ); // Returns true if 'border-top' style is present.
     * element.hasStyle( 'color', 'border-top' ); // Returns true if 'color' and 'border-top' styles are both present.
     * ```
     */
    hasStyle(...property: Array<string>): boolean;
    /**
     * Returns ancestor element that match specified pattern.
     * Provided patterns should be compatible with {@link module:engine/view/matcher~Matcher Matcher} as it is used internally.
     *
     * @see module:engine/view/matcher~Matcher
     * @param patterns Patterns used to match correct ancestor. See {@link module:engine/view/matcher~Matcher}.
     * @returns Found element or `null` if no matching ancestor was found.
     */
    findAncestor(...patterns: Array<MatcherPattern | ((element: ViewElement) => boolean)>): ViewElement | null;
    /**
     * Returns the custom property value for the given key.
     */
    getCustomProperty(key: string | symbol): unknown;
    /**
     * Returns an iterator which iterates over this element's custom properties.
     * Iterator provides `[ key, value ]` pairs for each stored property.
     */
    getCustomProperties(): IterableIterator<[string | symbol, unknown]>;
    /**
     * Returns identity string based on element's name, styles, classes and other attributes.
     * Two elements that {@link #isSimilar are similar} will have same identity string.
     * It has the following format:
     *
     * ```ts
     * 'name class="class1,class2" style="style1:value1;style2:value2" attr1="val1" attr2="val2"'
     * ```
     *
     * For example:
     *
     * ```ts
     * const element = writer.createContainerElement( 'foo', {
     * 	banana: '10',
     * 	apple: '20',
     * 	style: 'color: red; border-color: white;',
     * 	class: 'baz'
     * } );
     *
     * // returns 'foo class="baz" style="border-color:white;color:red" apple="20" banana="10"'
     * element.getIdentity();
     * ```
     *
     * **Note**: Classes, styles and other attributes are sorted alphabetically.
     */
    getIdentity(): string;
    /**
     * Decides whether an unsafe attribute is whitelisted and should be rendered in the editing pipeline even though filtering mechanisms
     * like {@link module:engine/view/domconverter~ViewDomConverter#shouldRenderAttribute} say it should not.
     *
     * Unsafe attribute names can be specified when creating an element via {@link module:engine/view/downcastwriter~ViewDowncastWriter}.
     *
     * @param attributeName The name of the attribute to be checked.
     */
    shouldRenderUnsafeAttribute(attributeName: string): boolean;
    /**
     * Converts `ViewElement` to plain object and returns it.
     *
     * @returns `ViewElement` converted to plain object.
     */
    toJSON(): unknown;
    /**
     * Clones provided element.
     *
     * @internal
     * @param deep If set to `true` clones element and all its children recursively. When set to `false`,
     * element will be cloned without any children.
     * @returns Clone of this element.
     */
    _clone(deep?: boolean): this;
    /**
     * {@link module:engine/view/element~ViewElement#_insertChild Insert} a child node or a list of child nodes at the end of this node
     * and sets the parent of these nodes to this element.
     *
     * @see module:engine/view/downcastwriter~ViewDowncastWriter#insert
     * @internal
     * @param items Items to be inserted.
     * @fires change
     * @returns Number of appended nodes.
     */
    _appendChild(items: ViewItem | string | Iterable<ViewItem | string>): number;
    /**
     * Inserts a child node or a list of child nodes on the given index and sets the parent of these nodes to
     * this element.
     *
     * @internal
     * @see module:engine/view/downcastwriter~ViewDowncastWriter#insert
     * @param index Position where nodes should be inserted.
     * @param items Items to be inserted.
     * @fires change
     * @returns Number of inserted nodes.
     */
    _insertChild(index: number, items: ViewItem | string | Iterable<ViewItem | string>): number;
    /**
     * Removes number of child nodes starting at the given index and set the parent of these nodes to `null`.
     *
     * @see module:engine/view/downcastwriter~ViewDowncastWriter#remove
     * @internal
     * @param index Number of the first node to remove.
     * @param howMany Number of nodes to remove.
     * @fires change
     * @returns The array of removed nodes.
     */
    _removeChildren(index: number, howMany?: number): Array<ViewNode>;
    /**
     * Adds or overwrite attribute with a specified key and value.
     *
     * @see module:engine/view/downcastwriter~ViewDowncastWriter#setAttribute
     * @internal
     * @param key Attribute key.
     * @param value Attribute value.
     * @param overwrite Whether tokenized attribute should override the attribute value or just add a token.
     * @fires change
     */
    _setAttribute(key: string, value: unknown, overwrite?: boolean): void;
    /**
     * Removes attribute from the element.
     *
     * @see module:engine/view/downcastwriter~ViewDowncastWriter#removeAttribute
     * @internal
     * @param key Attribute key.
     * @param tokens Attribute value tokens to remove. The whole attribute is removed if not specified.
     * @returns Returns true if an attribute existed and has been removed.
     * @fires change
     */
    _removeAttribute(key: string, tokens?: ArrayOrItem<string>): boolean;
    /**
     * Adds specified class.
     *
     * ```ts
     * element._addClass( 'foo' ); // Adds 'foo' class.
     * element._addClass( [ 'foo', 'bar' ] ); // Adds 'foo' and 'bar' classes.
     * ```
     *
     * @see module:engine/view/downcastwriter~ViewDowncastWriter#addClass
     * @internal
     * @fires change
     */
    _addClass(className: ArrayOrItem<string>): void;
    /**
     * Removes specified class.
     *
     * ```ts
     * element._removeClass( 'foo' );  // Removes 'foo' class.
     * element._removeClass( [ 'foo', 'bar' ] ); // Removes both 'foo' and 'bar' classes.
     * ```
     *
     * @see module:engine/view/downcastwriter~ViewDowncastWriter#removeClass
     * @internal
     * @fires change
     */
    _removeClass(className: ArrayOrItem<string>): void;
    /**
     * Adds style to the element.
     *
     * ```ts
     * element._setStyle( 'color', 'red' );
     * ```
     *
     * **Note**: This method can work with normalized style names if
     * {@link module:engine/controller/datacontroller~DataController#addStyleProcessorRules a particular style processor rule is enabled}.
     * See {@link module:engine/view/stylesmap~StylesMap#set `StylesMap#set()`} for details.
     *
     * @see module:engine/view/downcastwriter~ViewDowncastWriter#setStyle
     * @label KEY_VALUE
     * @internal
     * @param property Property name.
     * @param value Value to set.
     * @fires change
     */
    _setStyle(property: string, value: string): void;
    /**
     * Adds style to the element.
     *
     * ```ts
     * element._setStyle( {
     * 	color: 'red',
     * 	position: 'fixed'
     * } );
     * ```
     *
     * **Note**: This method can work with normalized style names if
     * {@link module:engine/controller/datacontroller~DataController#addStyleProcessorRules a particular style processor rule is enabled}.
     * See {@link module:engine/view/stylesmap~StylesMap#set `StylesMap#set()`} for details.
     *
     * @see module:engine/view/downcastwriter~ViewDowncastWriter#setStyle
     * @label OBJECT
     * @internal
     * @param properties Object with key - value pairs.
     * @fires change
     */
    _setStyle(properties: Record<string, string>): void;
    /**
     * Removes specified style.
     *
     * ```ts
     * element._removeStyle( 'color' );  // Removes 'color' style.
     * element._removeStyle( [ 'color', 'border-top' ] ); // Removes both 'color' and 'border-top' styles.
     * ```
     *
     * **Note**: This method can work with normalized style names if
     * {@link module:engine/controller/datacontroller~DataController#addStyleProcessorRules a particular style processor rule is enabled}.
     * See {@link module:engine/view/stylesmap~StylesMap#remove `StylesMap#remove()`} for details.
     *
     * @see module:engine/view/downcastwriter~ViewDowncastWriter#removeStyle
     * @internal
     * @fires change
     */
    _removeStyle(property: ArrayOrItem<string>): void;
    /**
     * Used by the {@link module:engine/view/matcher~Matcher Matcher} to collect matching attribute tuples
     * (attribute name and optional token).
     *
     * Normalized patterns can be used in following ways:
     * - to match any attribute name with any or no value:
     *
     * ```ts
     * patterns: [
     * 	[ true, true ]
     * ]
     * ```
     *
     * - to match a specific attribute with any value:
     *
     * ```ts
     * patterns: [
     * 	[ 'required', true ]
     * ]
     * ```
     *
     * - to match an attribute name with a RegExp with any value:
     *
     * ```ts
     * patterns: [
     * 	[ /h[1-6]/, true ]
     * ]
     * ```
     *
     * 	- to match a specific attribute with the exact value:
     *
     * ```ts
     * patterns: [
     * 	[ 'rel', 'nofollow' ]
     * ]
     * ```
     *
     * 	- to match a specific attribute with a value matching a RegExp:
     *
     * ```ts
     * patterns: [
     * 	[ 'src', /^https/ ]
     * ]
     * ```
     *
     * 	- to match an attribute name with a RegExp and the exact value:
     *
     * ```ts
     * patterns: [
     * 	[ /^data-property-/, 'foobar' ],
     * ]
     * ```
     *
     * 	- to match an attribute name with a RegExp and match a value with another RegExp:
     *
     * ```ts
     * patterns: [
     * 	[ /^data-property-/, /^foo/ ]
     * ]
     * ```
     *
     * 	- to match a specific style property with the value matching a RegExp:
     *
     * ```ts
     * patterns: [
     * 	[ 'style', 'font-size', /px$/ ]
     * ]
     * ```
     *
     * 	- to match a specific class (class attribute is tokenized so it matches tokens individually):
     *
     * ```ts
     * patterns: [
     * 	[ 'class', 'foo' ]
     * ]
     * ```
     *
     * @internal
     * @param patterns An array of normalized patterns (tuples of 2 or 3 items depending on if tokenized attribute value match is needed).
     * @param match An array to populate with matching tuples.
     * @param exclude Array of attribute names to exclude from match.
     * @returns `true` if element matches all patterns. The matching tuples are pushed to the `match` array.
     */
    _collectAttributesMatch(patterns: Array<NormalizedPropertyPattern>, match: Array<[string, string?]>, exclude?: Array<string>): boolean;
    /**
     * Used by the {@link module:engine/conversion/viewconsumable~ViewConsumable} to collect the
     * {@link module:engine/view/element~ViewNormalizedConsumables} for the element.
     *
     * When `key` and `token` parameters are provided the output is filtered for the specified attribute and it's tokens and related tokens.
     *
     * @internal
     * @param key Attribute name.
     * @param token Reference token to collect all related tokens.
     */
    _getConsumables(key?: string, token?: string): ViewNormalizedConsumables;
    /**
     * Verify if the given element can be merged without conflicts into the element.
     *
     * Note that this method is extended by the {@link module:engine/view/attributeelement~ViewAttributeElement} implementation.
     *
     * This method is used by the {@link module:engine/view/downcastwriter~ViewDowncastWriter} while down-casting
     * an {@link module:engine/view/attributeelement~ViewAttributeElement} to merge it with other ViewAttributeElement.
     *
     * @internal
     * @returns Returns `true` if elements can be merged.
     */
    _canMergeAttributesFrom(otherElement: ViewElement): boolean;
    /**
     * Merges attributes of a given element into the element.
     * This includes also tokenized attributes like style and class.
     *
     * Note that you should make sure there are no conflicts before merging (see {@link #_canMergeAttributesFrom}).
     *
     * This method is used by the {@link module:engine/view/downcastwriter~ViewDowncastWriter} while down-casting
     * an {@link module:engine/view/attributeelement~ViewAttributeElement} to merge it with other ViewAttributeElement.
     *
     * @internal
     */
    _mergeAttributesFrom(otherElement: ViewElement): void;
    /**
     * Verify if the given element attributes can be fully subtracted from the element.
     *
     * Note that this method is extended by the {@link module:engine/view/attributeelement~ViewAttributeElement} implementation.
     *
     * This method is used by the {@link module:engine/view/downcastwriter~ViewDowncastWriter} while down-casting
     * an {@link module:engine/view/attributeelement~ViewAttributeElement} to unwrap the ViewAttributeElement.
     *
     * @internal
     * @returns Returns `true` if elements attributes can be fully subtracted.
     */
    _canSubtractAttributesOf(otherElement: ViewElement): boolean;
    /**
     * Removes (subtracts) corresponding attributes of the given element from the element.
     * This includes also tokenized attributes like style and class.
     * All attributes, classes and styles from given element should be present inside the element being unwrapped.
     *
     * Note that you should make sure all attributes could be subtracted before subtracting them (see {@link #_canSubtractAttributesOf}).
     *
     * This method is used by the {@link module:engine/view/downcastwriter~ViewDowncastWriter} while down-casting
     * an {@link module:engine/view/attributeelement~ViewAttributeElement} to unwrap the ViewAttributeElement.
     *
     * @internal
     */
    _subtractAttributesOf(otherElement: ViewElement): void;
    /**
     * Sets a custom property. Unlike attributes, custom properties are not rendered to the DOM,
     * so they can be used to add special data to elements.
     *
     * @see module:engine/view/downcastwriter~ViewDowncastWriter#setCustomProperty
     * @internal
     */
    _setCustomProperty(key: string | symbol, value: unknown): void;
    /**
     * Removes the custom property stored under the given key.
     *
     * @see module:engine/view/downcastwriter~ViewDowncastWriter#removeCustomProperty
     * @internal
     * @returns Returns true if property was removed.
     */
    _removeCustomProperty(key: string | symbol): boolean;
    /**
     * Parses attributes provided to the element constructor before they are applied to an element. If attributes are passed
     * as an object (instead of `Iterable`), the object is transformed to the map. Attributes with `null` value are removed.
     * Attributes with non-`String` value are converted to `String`.
     *
     * @param attrs Attributes to parse.
     * @returns Parsed attributes.
     */
    private _parseAttributes;
    /**
     * Returns block {@link module:engine/view/filler filler} offset or `null` if block filler is not needed.
     */
    getFillerOffset?(): number | null;
}
/**
 * Common interface for a {@link module:engine/view/tokenlist~ViewTokenList} and {@link module:engine/view/stylesmap~StylesMap}.
 */
export interface ViewElementAttributeValue {
    /**
     * Returns `true` if attribute has no value set.
     */
    get isEmpty(): boolean;
    /**
     * Number of tokens (styles, classes or other tokens) defined.
     */
    get size(): number;
    /**
     * Checks if a given token (style, class, token) is set.
     */
    has(name: string): boolean;
    /**
     * Returns all tokens (styles, classes, other tokens).
     */
    keys(): Array<string>;
    /**
     * Resets the value to the given one.
     */
    setTo(value: string): this;
    /**
     * Sets a given style property and value.
     */
    set(name: string, value: StyleValue): void;
    /**
     * Sets a given token (for style also a record of properties).
     */
    set(stylesOrTokens: Styles | ArrayOrItem<string>): void;
    /**
     * Removes given token (style, class, other token).
     */
    remove(tokens: ArrayOrItem<string>): void;
    /**
     * Removes all tokens.
     */
    clear(): void;
    /**
     * Returns a normalized tokens string (styles, classes, etc.).
     */
    toString(): string;
    /**
     * Returns `true` if both attributes have the same content.
     */
    isSimilar(other: this): boolean;
    /**
     * Clones the attribute value.
     */
    _clone(): this;
    /**
     * Used by the {@link module:engine/view/matcher~Matcher Matcher} to collect matching attribute tokens.
     *
     * @param tokenPattern The matched token name pattern.
     * @param valuePattern The matched token value pattern.
     * @returns An array of matching tokens.
     */
    _getTokensMatch(tokenPattern: true | string | RegExp, valuePattern?: true | string | RegExp): Array<string> | undefined;
    /**
     * Returns a list of consumables for the attribute. This includes related tokens
     * (for example other forms of notation of the same style property).
     *
     * Could be filtered by the given token name (class name, style property, etc.).
     */
    _getConsumables(name?: string): Array<string>;
    /**
     * Used by {@link ~ViewElement#_canMergeAttributesFrom} to verify if the given attribute can be merged without
     * conflicts into the attribute.
     *
     * This method is indirectly used by the {@link module:engine/view/downcastwriter~ViewDowncastWriter} while down-casting
     * an {@link module:engine/view/attributeelement~ViewAttributeElement} to merge it with other ViewAttributeElement.
     */
    _canMergeFrom(other: this): boolean;
    /**
     * Used by {@link ~ViewElement#_mergeAttributesFrom} to merge a given attribute into the attribute.
     *
     * This method is indirectly used by the {@link module:engine/view/downcastwriter~ViewDowncastWriter} while down-casting
     * an {@link module:engine/view/attributeelement~ViewAttributeElement} to merge it with other ViewAttributeElement.
     */
    _mergeFrom(other: this): void;
    /**
     * Used by {@link ~ViewElement#_canSubtractAttributesOf} to verify if the given attribute can be fully subtracted from the attribute.
     *
     * This method is indirectly used by the {@link module:engine/view/downcastwriter~ViewDowncastWriter} while down-casting
     * an {@link module:engine/view/attributeelement~ViewAttributeElement} to unwrap the ViewAttributeElement.
     */
    _isMatching(other: this): boolean;
}
/**
 * Collection of attributes.
 */
export type ViewElementAttributes = Record<string, unknown> | Iterable<[string, unknown]> | null;
/**
 * Object describing all features of a view element that could be consumed and converted individually.
 * This is a normalized form of {@link module:engine/conversion/viewconsumable~Consumables} generated from the view Element.
 *
 * Example element:
 *
 * ```html
 * <a class="foo bar" style="color: red; margin: 5px" href="https://ckeditor.com" rel="nofollow noreferrer" target="_blank">
 * ```
 *
 * The `ViewNormalizedConsumables` would include:
 *
 * ```json
 * {
 * 	name: true,
 * 	attributes: [
 * 		[ "class", "foo" ],
 * 		[ "class", "bar" ],
 * 		[ "style", "color" ],
 * 		[ "style", "margin-top" ],
 * 		[ "style", "margin-right" ],
 * 		[ "style", "margin-bottom" ],
 * 		[ "style", "margin-left" ],
        [ "style", "margin" ],
 * 		[ "href" ],
 * 		[ "rel", "nofollow" ],
 * 		[ "rel", "noreferrer" ],
 * 		[ "target" ]
 * 	]
 * }
 * ```
 */
export interface ViewNormalizedConsumables {
    /**
     * If set to `true` element's name will be included in a consumable.
     * Depending on the usage context it would be added as consumable, tested for being available for consume or consumed.
     */
    name: boolean;
    /**
     * Array of tuples - an attribute name, and optional token for tokenized attributes.
     * Note that there could be multiple entries for the same attribute with different tokens (class names or style properties).
     */
    attributes: Array<[string, string?]>;
}
