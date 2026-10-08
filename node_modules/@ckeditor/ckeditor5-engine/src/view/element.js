/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/element
 */
import { ViewNode } from './node.js';
import { ViewText } from './text.js';
import { ViewTextProxy } from './textproxy.js';
import { isIterable, toMap } from '@ckeditor/ckeditor5-utils';
import { Matcher, isPatternMatched } from './matcher.js';
import { StylesMap } from './stylesmap.js';
import { ViewTokenList } from './tokenlist.js';
// @if CK_DEBUG_ENGINE // const { convertMapToTags } = require( '../dev-utils/utils' );
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
export class ViewElement extends ViewNode {
    /**
     * Name of the element.
     */
    name;
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
    _unsafeAttributesToRender = [];
    /**
     * Map of attributes, where attributes names are keys and attributes values are values.
     */
    _attrs;
    /**
     * Array of child nodes.
     */
    _children;
    /**
     * Map of custom properties.
     * Custom properties can be added to element instance, will be cloned but not rendered into DOM.
     */
    _customProperties = new Map();
    /**
     * Set of classes associated with element instance.
     *
     * Note that this is just an alias for `this._attrs.get( 'class' );`
     */
    get _classes() {
        return this._attrs.get('class');
    }
    /**
     * Normalized styles.
     *
     * Note that this is just an alias for `this._attrs.get( 'style' );`
     */
    get _styles() {
        return this._attrs.get('style');
    }
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
    constructor(document, name, attrs, children) {
        super(document);
        this.name = name;
        this._attrs = this._parseAttributes(attrs);
        this._children = [];
        if (children) {
            this._insertChild(0, children);
        }
    }
    /**
     * Number of element's children.
     */
    get childCount() {
        return this._children.length;
    }
    /**
     * Is `true` if there are no nodes inside this element, `false` otherwise.
     */
    get isEmpty() {
        return this._children.length === 0;
    }
    /**
     * Gets child at the given index.
     *
     * @param index Index of child.
     * @returns Child node.
     */
    getChild(index) {
        return this._children[index];
    }
    /**
     * Gets index of the given child node. Returns `-1` if child node is not found.
     *
     * @param node Child node.
     * @returns Index of the child node.
     */
    getChildIndex(node) {
        return this._children.indexOf(node);
    }
    /**
     * Gets child nodes iterator.
     *
     * @returns Child nodes iterator.
     */
    getChildren() {
        return this._children[Symbol.iterator]();
    }
    /**
     * Returns an iterator that contains the keys for attributes. Order of inserting attributes is not preserved.
     *
     * @returns Keys for attributes.
     */
    *getAttributeKeys() {
        // This is yielded in this specific order to maintain backward compatibility of data.
        // Otherwise, we could simply just have the `for` loop only inside this method.
        if (this._classes) {
            yield 'class';
        }
        if (this._styles) {
            yield 'style';
        }
        for (const key of this._attrs.keys()) {
            if (key != 'class' && key != 'style') {
                yield key;
            }
        }
    }
    /**
     * Returns iterator that iterates over this element's attributes.
     *
     * Attributes are returned as arrays containing two items. First one is attribute key and second is attribute value.
     * This format is accepted by native `Map` object and also can be passed in `Node` constructor.
     */
    *getAttributes() {
        for (const [name, value] of this._attrs.entries()) {
            yield [name, String(value)];
        }
    }
    /**
     * Gets attribute by key. If attribute is not present - returns undefined.
     *
     * @param key Attribute key.
     * @returns Attribute value.
     */
    getAttribute(key) {
        return this._attrs.has(key) ? String(this._attrs.get(key)) : undefined;
    }
    /**
     * Returns a boolean indicating whether an attribute with the specified key exists in the element.
     *
     * @param key Attribute key.
     * @returns `true` if attribute with the specified key exists in the element, `false` otherwise.
     */
    hasAttribute(key, token) {
        if (!this._attrs.has(key)) {
            return false;
        }
        if (token !== undefined) {
            if (usesStylesMap(this.name, key) || usesTokenList(this.name, key)) {
                return this._attrs.get(key).has(token);
            }
            else {
                return this._attrs.get(key) === token;
            }
        }
        return true;
    }
    /**
     * Checks if this element is similar to other element.
     * Both elements should have the same name and attributes to be considered as similar. Two similar elements
     * can contain different set of children nodes.
     */
    isSimilar(otherElement) {
        if (!(otherElement instanceof ViewElement)) {
            return false;
        }
        // If exactly the same Element is provided - return true immediately.
        if (this === otherElement) {
            return true;
        }
        // Check element name.
        if (this.name != otherElement.name) {
            return false;
        }
        // Check number of attributes, classes and styles.
        if (this._attrs.size !== otherElement._attrs.size) {
            return false;
        }
        // Check if attributes are the same.
        for (const [key, value] of this._attrs) {
            const otherValue = otherElement._attrs.get(key);
            if (otherValue === undefined) {
                return false;
            }
            if (typeof value == 'string' || typeof otherValue == 'string') {
                if (otherValue !== value) {
                    return false;
                }
            }
            else if (!value.isSimilar(otherValue)) {
                return false;
            }
        }
        return true;
    }
    /**
     * Returns true if class is present.
     * If more then one class is provided - returns true only when all classes are present.
     *
     * ```ts
     * element.hasClass( 'foo' ); // Returns true if 'foo' class is present.
     * element.hasClass( 'foo', 'bar' ); // Returns true if 'foo' and 'bar' classes are both present.
     * ```
     */
    hasClass(...className) {
        for (const name of className) {
            if (!this._classes || !this._classes.has(name)) {
                return false;
            }
        }
        return true;
    }
    /**
     * Returns iterator that contains all class names.
     */
    getClassNames() {
        const array = this._classes ? this._classes.keys() : [];
        // This is overcomplicated because we need to be backward compatible for use cases when iterator is expected.
        const iterator = array[Symbol.iterator]();
        return Object.assign(array, {
            next: iterator.next.bind(iterator)
        });
    }
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
    getStyle(property) {
        return this._styles && this._styles.getAsString(property);
    }
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
    getNormalizedStyle(property) {
        return this._styles && this._styles.getNormalized(property);
    }
    /**
     * Returns an array that contains all style names.
     *
     * @param expand Expand shorthand style properties and return all equivalent style representations.
     */
    getStyleNames(expand) {
        return this._styles ? this._styles.getStyleNames(expand) : [];
    }
    /**
     * Returns true if style keys are present.
     * If more then one style property is provided - returns true only when all properties are present.
     *
     * ```ts
     * element.hasStyle( 'color' ); // Returns true if 'border-top' style is present.
     * element.hasStyle( 'color', 'border-top' ); // Returns true if 'color' and 'border-top' styles are both present.
     * ```
     */
    hasStyle(...property) {
        for (const name of property) {
            if (!this._styles || !this._styles.has(name)) {
                return false;
            }
        }
        return true;
    }
    /**
     * Returns ancestor element that match specified pattern.
     * Provided patterns should be compatible with {@link module:engine/view/matcher~Matcher Matcher} as it is used internally.
     *
     * @see module:engine/view/matcher~Matcher
     * @param patterns Patterns used to match correct ancestor. See {@link module:engine/view/matcher~Matcher}.
     * @returns Found element or `null` if no matching ancestor was found.
     */
    findAncestor(...patterns) {
        const matcher = new Matcher(...patterns);
        let parent = this.parent;
        while (parent && !parent.is('documentFragment')) {
            if (matcher.match(parent)) {
                return parent;
            }
            parent = parent.parent;
        }
        return null;
    }
    /**
     * Returns the custom property value for the given key.
     */
    getCustomProperty(key) {
        return this._customProperties.get(key);
    }
    /**
     * Returns an iterator which iterates over this element's custom properties.
     * Iterator provides `[ key, value ]` pairs for each stored property.
     */
    *getCustomProperties() {
        yield* this._customProperties.entries();
    }
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
    getIdentity() {
        const classes = this._classes ? this._classes.keys().sort().join(',') : '';
        const styles = this._styles && String(this._styles);
        const attributes = Array.from(this._attrs)
            .filter(([key]) => key != 'style' && key != 'class')
            .map(i => `${i[0]}="${i[1]}"`)
            .sort().join(' ');
        return this.name +
            (classes == '' ? '' : ` class="${classes}"`) +
            (!styles ? '' : ` style="${styles}"`) +
            (attributes == '' ? '' : ` ${attributes}`);
    }
    /**
     * Decides whether an unsafe attribute is whitelisted and should be rendered in the editing pipeline even though filtering mechanisms
     * like {@link module:engine/view/domconverter~ViewDomConverter#shouldRenderAttribute} say it should not.
     *
     * Unsafe attribute names can be specified when creating an element via {@link module:engine/view/downcastwriter~ViewDowncastWriter}.
     *
     * @param attributeName The name of the attribute to be checked.
     */
    shouldRenderUnsafeAttribute(attributeName) {
        return this._unsafeAttributesToRender.includes(attributeName);
    }
    /**
     * Converts `ViewElement` to plain object and returns it.
     *
     * @returns `ViewElement` converted to plain object.
     */
    toJSON() {
        const json = super.toJSON();
        json.name = this.name;
        json.type = 'Element';
        if (this._attrs.size) {
            json.attributes = Object.fromEntries(this.getAttributes());
        }
        if (this._children.length > 0) {
            json.children = [];
            for (const node of this._children) {
                json.children.push(node.toJSON());
            }
        }
        return json;
    }
    /**
     * Clones provided element.
     *
     * @internal
     * @param deep If set to `true` clones element and all its children recursively. When set to `false`,
     * element will be cloned without any children.
     * @returns Clone of this element.
     */
    _clone(deep = false) {
        const childrenClone = [];
        if (deep) {
            for (const child of this.getChildren()) {
                childrenClone.push(child._clone(deep));
            }
        }
        // ViewContainerElement and ViewAttributeElement should be also cloned properly.
        const cloned = new this.constructor(this.document, this.name, this._attrs, childrenClone);
        // Clone custom properties.
        cloned._customProperties = new Map(this._customProperties);
        // Clone filler offset method.
        // We can't define this method in a prototype because it's behavior which
        // is changed by e.g. toWidget() function from ckeditor5-widget. Perhaps this should be one of custom props.
        cloned.getFillerOffset = this.getFillerOffset;
        // Clone unsafe attributes list.
        cloned._unsafeAttributesToRender = this._unsafeAttributesToRender;
        return cloned;
    }
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
    _appendChild(items) {
        return this._insertChild(this.childCount, items);
    }
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
    _insertChild(index, items) {
        this._fireChange('children', this, { index });
        let count = 0;
        const nodes = normalize(this.document, items);
        for (const node of nodes) {
            // If node that is being added to this element is already inside another element, first remove it from the old parent.
            if (node.parent !== null) {
                node._remove();
            }
            node.parent = this;
            node.document = this.document;
            this._children.splice(index, 0, node);
            index++;
            count++;
        }
        return count;
    }
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
    _removeChildren(index, howMany = 1) {
        this._fireChange('children', this, { index });
        for (let i = index; i < index + howMany; i++) {
            this._children[i].parent = null;
        }
        return this._children.splice(index, howMany);
    }
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
    _setAttribute(key, value, overwrite = true) {
        this._fireChange('attributes', this);
        if (usesStylesMap(this.name, key) || usesTokenList(this.name, key)) {
            let currentValue = this._attrs.get(key);
            if (!currentValue) {
                currentValue = usesStylesMap(this.name, key) ?
                    new StylesMap(this.document.stylesProcessor) :
                    new ViewTokenList();
                this._attrs.set(key, currentValue);
            }
            if (overwrite) {
                // If reset is set then value have to be a string to tokenize.
                currentValue.setTo(String(value));
            }
            else if (usesStylesMap(this.name, key)) {
                if (Array.isArray(value)) {
                    currentValue.set(value[0], value[1]);
                }
                else {
                    currentValue.set(value);
                }
            }
            else { // TokenList.
                currentValue.set(typeof value == 'string' ? value.split(/\s+/) : value);
            }
        }
        else {
            this._attrs.set(key, String(value));
        }
    }
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
    _removeAttribute(key, tokens) {
        this._fireChange('attributes', this);
        if (tokens !== undefined && (usesStylesMap(this.name, key) || usesTokenList(this.name, key))) {
            const currentValue = this._attrs.get(key);
            if (!currentValue) {
                return false;
            }
            if (usesTokenList(this.name, key) && typeof tokens == 'string') {
                tokens = tokens.split(/\s+/);
            }
            currentValue.remove(tokens);
            if (currentValue.isEmpty) {
                return this._attrs.delete(key);
            }
            return false;
        }
        return this._attrs.delete(key);
    }
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
    _addClass(className) {
        this._setAttribute('class', className, false);
    }
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
    _removeClass(className) {
        this._removeAttribute('class', className);
    }
    _setStyle(property, value) {
        if (typeof property != 'string') {
            this._setAttribute('style', property, false);
        }
        else {
            this._setAttribute('style', [property, value], false);
        }
    }
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
    _removeStyle(property) {
        this._removeAttribute('style', property);
    }
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
    _collectAttributesMatch(patterns, match, exclude) {
        for (const [keyPattern, tokenPattern, valuePattern] of patterns) {
            let hasKey = false;
            let hasValue = false;
            for (const [key, value] of this._attrs) {
                if (exclude && exclude.includes(key) || !isPatternMatched(keyPattern, key)) {
                    continue;
                }
                hasKey = true;
                if (typeof value == 'string') {
                    if (isPatternMatched(tokenPattern, value)) {
                        match.push([key]);
                        hasValue = true;
                    }
                    else if (!(keyPattern instanceof RegExp)) {
                        return false;
                    }
                }
                else {
                    const tokenMatch = value._getTokensMatch(tokenPattern, valuePattern || true);
                    if (tokenMatch) {
                        hasValue = true;
                        for (const tokenMatchItem of tokenMatch) {
                            match.push([key, tokenMatchItem]);
                        }
                    }
                    else if (!(keyPattern instanceof RegExp)) {
                        return false;
                    }
                }
            }
            if (!hasKey || !hasValue) {
                return false;
            }
        }
        return true;
    }
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
    _getConsumables(key, token) {
        const attributes = [];
        if (key) {
            const value = this._attrs.get(key);
            if (value !== undefined) {
                if (typeof value == 'string') {
                    attributes.push([key]);
                }
                else {
                    for (const prop of value._getConsumables(token)) {
                        attributes.push([key, prop]);
                    }
                }
            }
        }
        else {
            for (const [key, value] of this._attrs) {
                if (typeof value == 'string') {
                    attributes.push([key]);
                }
                else {
                    for (const prop of value._getConsumables()) {
                        attributes.push([key, prop]);
                    }
                }
            }
        }
        return {
            name: !key,
            attributes
        };
    }
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
    _canMergeAttributesFrom(otherElement) {
        if (this.name != otherElement.name) {
            return false;
        }
        for (const [key, otherValue] of otherElement._attrs) {
            const value = this._attrs.get(key);
            if (value === undefined) {
                continue;
            }
            if (typeof value == 'string' || typeof otherValue == 'string') {
                if (value !== otherValue) {
                    return false;
                }
            }
            else if (!value._canMergeFrom(otherValue)) {
                return false;
            }
        }
        return true;
    }
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
    _mergeAttributesFrom(otherElement) {
        this._fireChange('attributes', this);
        // Move all attributes/classes/styles from wrapper to wrapped ViewAttributeElement.
        for (const [key, otherValue] of otherElement._attrs) {
            const value = this._attrs.get(key);
            if (value === undefined || typeof value == 'string' || typeof otherValue == 'string') {
                this._setAttribute(key, otherValue);
            }
            else {
                value._mergeFrom(otherValue);
            }
        }
    }
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
    _canSubtractAttributesOf(otherElement) {
        if (this.name != otherElement.name) {
            return false;
        }
        for (const [key, otherValue] of otherElement._attrs) {
            const value = this._attrs.get(key);
            if (value === undefined) {
                return false;
            }
            if (typeof value == 'string' || typeof otherValue == 'string') {
                if (value !== otherValue) {
                    return false;
                }
            }
            else if (!value._isMatching(otherValue)) {
                return false;
            }
        }
        return true;
    }
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
    _subtractAttributesOf(otherElement) {
        this._fireChange('attributes', this);
        for (const [key, otherValue] of otherElement._attrs) {
            const value = this._attrs.get(key);
            if (typeof value == 'string' || typeof otherValue == 'string') {
                this._attrs.delete(key);
            }
            else {
                value.remove(otherValue.keys());
                if (value.isEmpty) {
                    this._attrs.delete(key);
                }
            }
        }
    }
    /**
     * Sets a custom property. Unlike attributes, custom properties are not rendered to the DOM,
     * so they can be used to add special data to elements.
     *
     * @see module:engine/view/downcastwriter~ViewDowncastWriter#setCustomProperty
     * @internal
     */
    _setCustomProperty(key, value) {
        this._customProperties.set(key, value);
    }
    /**
     * Removes the custom property stored under the given key.
     *
     * @see module:engine/view/downcastwriter~ViewDowncastWriter#removeCustomProperty
     * @internal
     * @returns Returns true if property was removed.
     */
    _removeCustomProperty(key) {
        return this._customProperties.delete(key);
    }
    /**
     * Parses attributes provided to the element constructor before they are applied to an element. If attributes are passed
     * as an object (instead of `Iterable`), the object is transformed to the map. Attributes with `null` value are removed.
     * Attributes with non-`String` value are converted to `String`.
     *
     * @param attrs Attributes to parse.
     * @returns Parsed attributes.
     */
    _parseAttributes(attrs) {
        const attrsMap = toMap(attrs);
        for (const [key, value] of attrsMap) {
            if (value === null) {
                attrsMap.delete(key);
            }
            else if (usesStylesMap(this.name, key)) {
                // This is either an element clone so we need to clone styles map, or a new instance which requires value to be parsed.
                const newValue = value instanceof StylesMap ?
                    value._clone() :
                    new StylesMap(this.document.stylesProcessor).setTo(String(value));
                attrsMap.set(key, newValue);
            }
            else if (usesTokenList(this.name, key)) {
                // This is either an element clone so we need to clone token list, or a new instance which requires value to be parsed.
                const newValue = value instanceof ViewTokenList ?
                    value._clone() :
                    new ViewTokenList().setTo(String(value));
                attrsMap.set(key, newValue);
            }
            else if (typeof value != 'string') {
                attrsMap.set(key, String(value));
            }
        }
        return attrsMap;
    }
}
// The magic of type inference using `is` method is centralized in `TypeCheckable` class.
// Proper overload would interfere with that.
ViewElement.prototype.is = function (type, name) {
    if (!name) {
        return type === 'element' || type === 'view:element' ||
            // From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
            type === 'node' || type === 'view:node';
    }
    else {
        return name === this.name && (type === 'element' || type === 'view:element');
    }
};
/**
 * Converts strings to Text and non-iterables to arrays.
 */
function normalize(document, nodes) {
    // Separate condition because string is iterable.
    if (typeof nodes == 'string') {
        return [new ViewText(document, nodes)];
    }
    if (!isIterable(nodes)) {
        nodes = [nodes];
    }
    const normalizedNodes = [];
    for (const node of nodes) {
        if (typeof node == 'string') {
            normalizedNodes.push(new ViewText(document, node));
        }
        else if (node instanceof ViewTextProxy) {
            normalizedNodes.push(new ViewText(document, node.data));
        }
        else {
            normalizedNodes.push(node);
        }
    }
    return normalizedNodes;
}
/**
 * Returns `true` if an attribute on a given element should be handled as a TokenList.
 */
function usesTokenList(elementName, key) {
    return key == 'class' || elementName == 'a' && key == 'rel';
}
/**
 * Returns `true` if an attribute on a given element should be handled as a StylesMap.
 */
function usesStylesMap(elementName, key) {
    return key == 'style';
}
