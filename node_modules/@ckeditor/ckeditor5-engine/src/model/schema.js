/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/model/schema
 */
import { ModelElement } from './element.js';
import { ModelPosition } from './position.js';
import { ModelRange } from './range.js';
import { ModelText } from './text.js';
import { ModelTreeWalker } from './treewalker.js';
import { CKEditorError, first, ObservableMixin } from '@ckeditor/ckeditor5-utils';
/**
 * The model's schema. It defines the allowed and disallowed structures of nodes as well as nodes' attributes.
 * The schema is usually defined by the features and based on them, the editing framework and features
 * make decisions on how to change and process the model.
 *
 * The instance of schema is available in {@link module:engine/model/model~Model#schema `editor.model.schema`}.
 *
 * Read more about the schema in:
 *
 * * The {@glink framework/architecture/editing-engine#schema schema section} of the
 * {@glink framework/architecture/editing-engine Introduction to the Editing engine architecture} guide.
 * * The {@glink framework/deep-dive/schema Schema deep-dive} guide.
 */
export class ModelSchema extends /* #__PURE__ */ ObservableMixin() {
    _sourceDefinitions = {};
    /**
     * A dictionary containing attribute properties.
     */
    _attributeProperties = Object.create(null);
    /**
     * Stores additional callbacks registered for schema items, which are evaluated when {@link ~ModelSchema#checkChild} is called.
     *
     * Keys are schema item names for which the callbacks are registered. Values are arrays with the callbacks.
     *
     * Some checks are added under {@link ~ModelSchema#_genericCheckSymbol} key, these are
     * evaluated for every {@link ~ModelSchema#checkChild} call.
     */
    _customChildChecks = new Map();
    /**
     * Stores additional callbacks registered for attribute names, which are evaluated when {@link ~ModelSchema#checkAttribute} is called.
     *
     * Keys are schema attribute names for which the callbacks are registered. Values are arrays with the callbacks.
     *
     * Some checks are added under {@link ~ModelSchema#_genericCheckSymbol} key, these are evaluated for every
     * {@link ~ModelSchema#checkAttribute} call.
     */
    _customAttributeChecks = new Map();
    _genericCheckSymbol = Symbol('$generic');
    _compiledDefinitions;
    /**
     * Creates a schema instance.
     */
    constructor() {
        super();
        this.decorate('checkChild');
        this.decorate('checkAttribute');
        this.on('checkAttribute', (evt, args) => {
            args[0] = new ModelSchemaContext(args[0]);
        }, { priority: 'highest' });
        this.on('checkChild', (evt, args) => {
            args[0] = new ModelSchemaContext(args[0]);
            args[1] = this.getDefinition(args[1]);
        }, { priority: 'highest' });
    }
    /**
     * Registers a schema item. Can only be called once for every item name.
     *
     * ```ts
     * schema.register( 'paragraph', {
     * 	inheritAllFrom: '$block'
     * } );
     * ```
     */
    register(itemName, definition) {
        if (this._sourceDefinitions[itemName]) {
            /**
             * A single item cannot be registered twice in the schema.
             *
             * This situation may happen when:
             *
             * * Two or more plugins called {@link module:engine/model/schema~ModelSchema#register `register()`} with the same name.
             * This will usually mean that there is a collision between plugins which try to use the same element in the model.
             * Unfortunately, the only way to solve this is by modifying one of these plugins to use a unique model element name.
             * * A single plugin was loaded twice. This happens when it is installed by npm/yarn in two versions
             * and usually means one or more of the following issues:
             *     * a version mismatch (two of your dependencies require two different versions of this plugin),
             *     * incorrect imports (this plugin is somehow imported twice in a way which confuses webpack),
             *     * mess in `node_modules/` (`rm -rf node_modules/` may help).
             *
             * **Note:** Check the logged `itemName` to better understand which plugin was duplicated/conflicting.
             *
             * @param itemName The name of the model element that is being registered twice.
             * @error schema-cannot-register-item-twice
             */
            throw new CKEditorError('schema-cannot-register-item-twice', this, {
                itemName
            });
        }
        this._sourceDefinitions[itemName] = [
            Object.assign({}, definition)
        ];
        this._clearCache();
    }
    /**
     * Extends a {@link #register registered} item's definition.
     *
     * Extending properties such as `allowIn` will add more items to the existing properties,
     * while redefining properties such as `isBlock` will override the previously defined ones.
     *
     * ```ts
     * schema.register( 'foo', {
     * 	allowIn: '$root',
     * 	isBlock: true;
     * } );
     * schema.extend( 'foo', {
     * 	allowIn: 'blockQuote',
     * 	isBlock: false
     * } );
     *
     * schema.getDefinition( 'foo' );
     * //	{
     * //		allowIn: [ '$root', 'blockQuote' ],
     * // 		isBlock: false
     * //	}
     * ```
     */
    extend(itemName, definition) {
        if (!this._sourceDefinitions[itemName]) {
            /**
             * Cannot extend an item which was not registered yet.
             *
             * This error happens when a plugin tries to extend the schema definition of an item which was not
             * {@link module:engine/model/schema~ModelSchema#register registered} yet.
             *
             * @param itemName The name of the model element which is being extended.
             * @error schema-cannot-extend-missing-item
             */
            throw new CKEditorError('schema-cannot-extend-missing-item', this, {
                itemName
            });
        }
        this._sourceDefinitions[itemName].push(Object.assign({}, definition));
        this._clearCache();
    }
    /**
     * Returns data of all registered items.
     *
     * This method should normally be used for reflection purposes (e.g. defining a clone of a certain element,
     * checking a list of all block elements, etc).
     * Use specific methods (such as {@link #checkChild `checkChild()`} or {@link #isLimit `isLimit()`})
     * in other cases.
     */
    getDefinitions() {
        if (!this._compiledDefinitions) {
            this._compile();
        }
        return this._compiledDefinitions;
    }
    /**
     * Returns a definition of the given item or `undefined` if an item is not registered.
     *
     * This method should normally be used for reflection purposes (e.g. defining a clone of a certain element,
     * checking a list of all block elements, etc).
     * Use specific methods (such as {@link #checkChild `checkChild()`} or {@link #isLimit `isLimit()`})
     * in other cases.
     */
    getDefinition(item) {
        let itemName;
        if (typeof item == 'string') {
            itemName = item;
        }
        else if ('is' in item && (item.is('$text') || item.is('$textProxy'))) {
            itemName = '$text';
        }
        // Element or module:engine/model/schema~ModelSchemaContextItem.
        else {
            itemName = item.name;
        }
        return this.getDefinitions()[itemName];
    }
    /**
     * Returns `true` if the given item is registered in the schema.
     *
     * ```ts
     * schema.isRegistered( 'paragraph' ); // -> true
     * schema.isRegistered( editor.model.document.getRoot() ); // -> true
     * schema.isRegistered( 'foo' ); // -> false
     * ```
     */
    isRegistered(item) {
        return !!this.getDefinition(item);
    }
    /**
     * Returns `true` if the given item is defined to be
     * a block by the {@link module:engine/model/schema~ModelSchemaItemDefinition}'s `isBlock` property.
     *
     * ```ts
     * schema.isBlock( 'paragraph' ); // -> true
     * schema.isBlock( '$root' ); // -> false
     *
     * const paragraphElement = writer.createElement( 'paragraph' );
     * schema.isBlock( paragraphElement ); // -> true
     * ```
     *
     * See the {@glink framework/deep-dive/schema#block-elements Block elements} section of
     * the {@glink framework/deep-dive/schema Schema deep-dive} guide for more details.
     */
    isBlock(item) {
        const def = this.getDefinition(item);
        return !!(def && def.isBlock);
    }
    /**
     * Returns `true` if the given item should be treated as a limit element.
     *
     * It considers an item to be a limit element if its
     * {@link module:engine/model/schema~ModelSchemaItemDefinition}'s
     * {@link module:engine/model/schema~ModelSchemaItemDefinition#isLimit `isLimit`} or
     * {@link module:engine/model/schema~ModelSchemaItemDefinition#isObject `isObject`} property
     * was set to `true`.
     *
     * ```ts
     * schema.isLimit( 'paragraph' ); // -> false
     * schema.isLimit( '$root' ); // -> true
     * schema.isLimit( editor.model.document.getRoot() ); // -> true
     * schema.isLimit( 'imageBlock' ); // -> true
     * ```
     *
     * See the {@glink framework/deep-dive/schema#limit-elements Limit elements} section of
     * the {@glink framework/deep-dive/schema Schema deep-dive} guide for more details.
     */
    isLimit(item) {
        const def = this.getDefinition(item);
        if (!def) {
            return false;
        }
        return !!(def.isLimit || def.isObject);
    }
    /**
     * Returns `true` if the given item should be treated as an object element.
     *
     * It considers an item to be an object element if its
     * {@link module:engine/model/schema~ModelSchemaItemDefinition}'s
     * {@link module:engine/model/schema~ModelSchemaItemDefinition#isObject `isObject`} property
     * was set to `true`.
     *
     * ```ts
     * schema.isObject( 'paragraph' ); // -> false
     * schema.isObject( 'imageBlock' ); // -> true
     *
     * const imageElement = writer.createElement( 'imageBlock' );
     * schema.isObject( imageElement ); // -> true
     * ```
     *
     * See the {@glink framework/deep-dive/schema#object-elements Object elements} section of
     * the {@glink framework/deep-dive/schema Schema deep-dive} guide for more details.
     */
    isObject(item) {
        const def = this.getDefinition(item);
        if (!def) {
            return false;
        }
        // Note: Check out the implementation of #isLimit(), #isSelectable(), and #isContent()
        // to understand why these three constitute an object.
        return !!(def.isObject || (def.isLimit && def.isSelectable && def.isContent));
    }
    /**
     * Returns `true` if the given item is defined to be
     * an inline element by the {@link module:engine/model/schema~ModelSchemaItemDefinition}'s `isInline` property.
     *
     * ```ts
     * schema.isInline( 'paragraph' ); // -> false
     * schema.isInline( 'softBreak' ); // -> true
     *
     * const text = writer.createText( 'foo' );
     * schema.isInline( text ); // -> true
     * ```
     *
     * See the {@glink framework/deep-dive/schema#inline-elements Inline elements} section of
     * the {@glink framework/deep-dive/schema Schema deep-dive} guide for more details.
     */
    isInline(item) {
        const def = this.getDefinition(item);
        return !!(def && def.isInline);
    }
    /**
     * Returns `true` if the given item is defined to be
     * a selectable element by the {@link module:engine/model/schema~ModelSchemaItemDefinition}'s `isSelectable` property.
     *
     * ```ts
     * schema.isSelectable( 'paragraph' ); // -> false
     * schema.isSelectable( 'heading1' ); // -> false
     * schema.isSelectable( 'imageBlock' ); // -> true
     * schema.isSelectable( 'tableCell' ); // -> true
     *
     * const text = writer.createText( 'foo' );
     * schema.isSelectable( text ); // -> false
     * ```
     *
     * See the {@glink framework/deep-dive/schema#selectable-elements Selectable elements section} of
     * the {@glink framework/deep-dive/schema Schema deep-dive} guide for more details.
     */
    isSelectable(item) {
        const def = this.getDefinition(item);
        if (!def) {
            return false;
        }
        return !!(def.isSelectable || def.isObject);
    }
    /**
     * Returns `true` if the given item is defined to be
     * a content by the {@link module:engine/model/schema~ModelSchemaItemDefinition}'s `isContent` property.
     *
     * ```ts
     * schema.isContent( 'paragraph' ); // -> false
     * schema.isContent( 'heading1' ); // -> false
     * schema.isContent( 'imageBlock' ); // -> true
     * schema.isContent( 'horizontalLine' ); // -> true
     *
     * const text = writer.createText( 'foo' );
     * schema.isContent( text ); // -> true
     * ```
     *
     * See the {@glink framework/deep-dive/schema#content-elements Content elements section} of
     * the {@glink framework/deep-dive/schema Schema deep-dive} guide for more details.
     */
    isContent(item) {
        const def = this.getDefinition(item);
        if (!def) {
            return false;
        }
        return !!(def.isContent || def.isObject);
    }
    /**
     * Checks whether the given node can be a child of the given context.
     *
     * ```ts
     * schema.checkChild( model.document.getRoot(), paragraph ); // -> false
     *
     * schema.register( 'paragraph', {
     * 	allowIn: '$root'
     * } );
     *
     * schema.checkChild( model.document.getRoot(), paragraph ); // -> true
     * ```
     *
     * Both {@link module:engine/model/schema~ModelSchema#addChildCheck callback checks} and declarative rules (added when
     * {@link module:engine/model/schema~ModelSchema#register registering} and
     * {@link module:engine/model/schema~ModelSchema#extend extending} items)
     * are evaluated when this method is called.
     *
     * Note that callback checks have bigger priority than declarative rules checks and may overwrite them.
     *
     * Note that when verifying whether the given node can be a child of the given context, the schema also verifies the entire
     * context &ndash; from its root to its last element. Therefore, it is possible for `checkChild()` to return `false` even though
     * the `context` last element can contain the checked child. It happens if one of the `context` elements does not allow its child.
     * When `context` is verified, {@link module:engine/model/schema~ModelSchema#addChildCheck custom checks} are considered as well.
     *
     * @fires checkChild
     * @param context The context in which the child will be checked.
     * @param def The child to check.
     */
    checkChild(context, def) {
        // Note: `context` and `def` are already normalized here to `ModelSchemaContext` and `ModelSchemaCompiledItemDefinition`.
        if (!def) {
            return false;
        }
        return this._checkContextMatch(context, def);
    }
    /**
     * Checks whether the given attribute can be applied in the given context (on the last item of the context).
     *
     * ```ts
     * schema.checkAttribute( textNode, 'bold' ); // -> false
     *
     * schema.extend( '$text', {
     * 	allowAttributes: 'bold'
     * } );
     *
     * schema.checkAttribute( textNode, 'bold' ); // -> true
     * ```
     *
     * Both {@link module:engine/model/schema~ModelSchema#addAttributeCheck callback checks} and declarative rules (added when
     * {@link module:engine/model/schema~ModelSchema#register registering} and
     * {@link module:engine/model/schema~ModelSchema#extend extending} items)
     * are evaluated when this method is called.
     *
     * Note that callback checks have bigger priority than declarative rules checks and may overwrite them.
     *
     * @fires checkAttribute
     * @param context The context in which the attribute will be checked.
     * @param attributeName Name of attribute to check in the given context.
     */
    checkAttribute(context, attributeName) {
        // Note: `context` is already normalized here to `ModelSchemaContext`.
        const def = this.getDefinition(context.last);
        if (!def) {
            return false;
        }
        // First, check all attribute checks declared as callbacks.
        // Note that `_evaluateAttributeChecks()` will return `undefined` if neither child check was applicable (no decision was made).
        const isAllowed = this._evaluateAttributeChecks(context, attributeName);
        // If the decision was not made inside attribute check callbacks, then use declarative rules.
        return isAllowed !== undefined ? isAllowed : def.allowAttributes.includes(attributeName);
    }
    /**
     * Checks whether the given element (`elementToMerge`) can be merged with the specified base element (`positionOrBaseElement`).
     *
     * In other words &ndash; both elements are not a limit elements and whether `elementToMerge`'s children
     * {@link #checkChild are allowed} in the `positionOrBaseElement`.
     *
     * This check ensures that elements merged with {@link module:engine/model/writer~ModelWriter#merge `Writer#merge()`}
     * will be valid.
     *
     * Instead of elements, you can pass the instance of the {@link module:engine/model/position~ModelPosition} class as the
     * `positionOrBaseElement`. It means that the elements before and after the position will be checked whether they can be merged.
     *
     * @param positionOrBaseElement The position or base element to which the `elementToMerge` will be merged.
     * @param elementToMerge The element to merge. Required if `positionOrBaseElement` is an element.
     */
    checkMerge(positionOrBaseElement, elementToMerge) {
        if (positionOrBaseElement instanceof ModelPosition) {
            const nodeBefore = positionOrBaseElement.nodeBefore;
            const nodeAfter = positionOrBaseElement.nodeAfter;
            if (!(nodeBefore instanceof ModelElement)) {
                /**
                 * The node before the merge position must be an element.
                 *
                 * @error schema-check-merge-no-element-before
                 */
                throw new CKEditorError('schema-check-merge-no-element-before', this);
            }
            if (!(nodeAfter instanceof ModelElement)) {
                /**
                 * The node after the merge position must be an element.
                 *
                 * @error schema-check-merge-no-element-after
                 */
                throw new CKEditorError('schema-check-merge-no-element-after', this);
            }
            return this.checkMerge(nodeBefore, nodeAfter);
        }
        if (this.isLimit(positionOrBaseElement) || this.isLimit(elementToMerge)) {
            return false;
        }
        for (const child of elementToMerge.getChildren()) {
            if (!this.checkChild(positionOrBaseElement, child)) {
                return false;
            }
        }
        return true;
    }
    /**
     * Allows registering a callback to the {@link #checkChild} method calls.
     *
     * Callbacks allow you to implement rules which are not otherwise possible to achieve
     * by using the declarative API of {@link module:engine/model/schema~ModelSchemaItemDefinition}.
     *
     * Note that callback checks have bigger priority than declarative rules checks and may overwrite them.
     *
     * For example, by using this method you can disallow elements in specific contexts:
     *
     * ```ts
     * // Disallow `heading1` inside a `blockQuote` that is inside a table.
     * schema.addChildCheck( ( context, childDefinition ) => {
     * 	if ( context.endsWith( 'tableCell blockQuote' ) ) {
     * 		return false;
     * 	}
     * }, 'heading1' );
     * ```
     *
     * You can skip the optional `itemName` parameter to evaluate the callback for every `checkChild()` call.
     *
     * ```ts
     * // Inside specific custom element, allow only children, which allows for a specific attribute.
     * schema.addChildCheck( ( context, childDefinition ) => {
     * 	if ( context.endsWith( 'myElement' ) ) {
     * 		return childDefinition.allowAttributes.includes( 'myAttribute' );
     * 	}
     * } );
     * ```
     *
     * Please note that the generic callbacks may affect the editor performance and should be avoided if possible.
     *
     * When one of the callbacks makes a decision (returns `true` or `false`) the processing is finished and other callbacks are not fired.
     * Callbacks are fired in the order they were added, however generic callbacks are fired before callbacks added for a specified item.
     *
     * You can also use `checkChild` event, if you need even better control. The result from the example above could also be
     * achieved with following event callback:
     *
     * ```ts
     * schema.on( 'checkChild', ( evt, args ) => {
     * 	const context = args[ 0 ];
     * 	const childDefinition = args[ 1 ];
     *
     * 	if ( context.endsWith( 'myElement' ) ) {
     * 		// Prevent next listeners from being called.
     * 		evt.stop();
     * 		// Set the `checkChild()` return value.
     * 		evt.return = childDefinition.allowAttributes.includes( 'myAttribute' );
     * 	}
     * }, { priority: 'high' } );
     * ```
     *
     * Note that the callback checks and declarative rules checks are processed on `normal` priority.
     *
     * Adding callbacks this way can also negatively impact editor performance.
     *
     * @param callback The callback to be called. It is called with two parameters:
     * {@link module:engine/model/schema~ModelSchemaContext} (context) instance and
     * {@link module:engine/model/schema~ModelSchemaCompiledItemDefinition} (definition). The callback may return `true/false` to
     * override `checkChild()`'s return value. If it does not return a boolean value, the default algorithm (or other callbacks) will define
     * `checkChild()`'s return value.
     * @param itemName Name of the schema item for which the callback is registered. If specified, the callback will be run only for
     * `checkChild()` calls which `def` parameter matches the `itemName`. Otherwise, the callback will run for every `checkChild` call.
     */
    addChildCheck(callback, itemName) {
        const key = itemName !== undefined ? itemName : this._genericCheckSymbol;
        const checks = this._customChildChecks.get(key) || [];
        checks.push(callback);
        this._customChildChecks.set(key, checks);
    }
    /**
     * Allows registering a callback to the {@link #checkAttribute} method calls.
     *
     * Callbacks allow you to implement rules which are not otherwise possible to achieve
     * by using the declarative API of {@link module:engine/model/schema~ModelSchemaItemDefinition}.
     *
     * Note that callback checks have bigger priority than declarative rules checks and may overwrite them.
     *
     * For example, by using this method you can disallow setting attributes on nodes in specific contexts:
     *
     * ```ts
     * // Disallow setting `bold` on text inside `heading1` element:
     * schema.addAttributeCheck( context => {
     * 	if ( context.endsWith( 'heading1 $text' ) ) {
     * 		return false;
     * 	}
     * }, 'bold' );
     * ```
     *
     * You can skip the optional `attributeName` parameter to evaluate the callback for every `checkAttribute()` call.
     *
     * ```ts
     * // Disallow formatting attributes on text inside custom `myTitle` element:
     * schema.addAttributeCheck( ( context, attributeName ) => {
     * 	if ( context.endsWith( 'myTitle $text' ) && schema.getAttributeProperties( attributeName ).isFormatting ) {
     * 		return false;
     * 	}
     * } );
     * ```
     *
     * Please note that the generic callbacks may affect the editor performance and should be avoided if possible.
     *
     * When one of the callbacks makes a decision (returns `true` or `false`) the processing is finished and other callbacks are not fired.
     * Callbacks are fired in the order they were added, however generic callbacks are fired before callbacks added for a specified item.
     *
     * You can also use {@link #event:checkAttribute} event, if you need even better control. The result from the example above could also
     * be achieved with following event callback:
     *
     * ```ts
     * schema.on( 'checkAttribute', ( evt, args ) => {
     * 	const context = args[ 0 ];
     * 	const attributeName = args[ 1 ];
     *
     * 	if ( context.endsWith( 'myTitle $text' ) && schema.getAttributeProperties( attributeName ).isFormatting ) {
     * 		// Prevent next listeners from being called.
     * 		evt.stop();
     * 		// Set the `checkAttribute()` return value.
     * 		evt.return = false;
     * 	}
     * }, { priority: 'high' } );
     * ```
     *
     * Note that the callback checks and declarative rules checks are processed on `normal` priority.
     *
     * Adding callbacks this way can also negatively impact editor performance.
     *
     * @param callback The callback to be called. It is called with two parameters:
     * {@link module:engine/model/schema~ModelSchemaContext `context`} and attribute name. The callback may return `true` or `false`, to
     * override `checkAttribute()`'s return value. If it does not return a boolean value, the default algorithm (or other callbacks)
     * will define `checkAttribute()`'s return value.
     * @param attributeName Name of the attribute for which the callback is registered. If specified, the callback will be run only for
     * `checkAttribute()` calls with matching `attributeName`. Otherwise, the callback will run for every `checkAttribute()` call.
     */
    addAttributeCheck(callback, attributeName) {
        const key = attributeName !== undefined ? attributeName : this._genericCheckSymbol;
        const checks = this._customAttributeChecks.get(key) || [];
        checks.push(callback);
        this._customAttributeChecks.set(key, checks);
    }
    /**
     * This method allows assigning additional metadata to the model attributes. For example,
     * {@link module:engine/model/schema~ModelAttributeProperties `AttributeProperties#isFormatting` property} is
     * used to mark formatting attributes (like `bold` or `italic`).
     *
     * ```ts
     * // Mark bold as a formatting attribute.
     * schema.setAttributeProperties( 'bold', {
     * 	isFormatting: true
     * } );
     *
     * // Override code not to be considered a formatting markup.
     * schema.setAttributeProperties( 'code', {
     * 	isFormatting: false
     * } );
     * ```
     *
     * Properties are not limited to members defined in the
     * {@link module:engine/model/schema~ModelAttributeProperties `AttributeProperties` type} and you can also use custom properties:
     *
     * ```ts
     * schema.setAttributeProperties( 'blockQuote', {
     * 	customProperty: 'value'
     * } );
     * ```
     *
     * Subsequent calls with the same attribute will extend its custom properties:
     *
     * ```ts
     * schema.setAttributeProperties( 'blockQuote', {
     * 	one: 1
     * } );
     *
     * schema.setAttributeProperties( 'blockQuote', {
     * 	two: 2
     * } );
     *
     * console.log( schema.getAttributeProperties( 'blockQuote' ) );
     * // Logs: { one: 1, two: 2 }
     * ```
     *
     * @param attributeName A name of the attribute to receive the properties.
     * @param properties A dictionary of properties.
     */
    setAttributeProperties(attributeName, properties) {
        this._attributeProperties[attributeName] = Object.assign(this.getAttributeProperties(attributeName), properties);
    }
    /**
     * Returns properties associated with a given model attribute. See {@link #setAttributeProperties `setAttributeProperties()`}.
     *
     * @param attributeName A name of the attribute.
     */
    getAttributeProperties(attributeName) {
        return this._attributeProperties[attributeName] || Object.create(null);
    }
    /**
     * Returns the lowest {@link module:engine/model/schema~ModelSchema#isLimit limit element} containing the entire
     * selection/range/position or the root otherwise.
     *
     * @param selectionOrRangeOrPosition The selection/range/position to check.
     * @returns The lowest limit element containing the entire `selectionOrRangeOrPosition`.
     */
    getLimitElement(selectionOrRangeOrPosition) {
        let element;
        if (selectionOrRangeOrPosition instanceof ModelPosition) {
            element = selectionOrRangeOrPosition.parent;
        }
        else {
            const ranges = selectionOrRangeOrPosition instanceof ModelRange ?
                [selectionOrRangeOrPosition] :
                Array.from(selectionOrRangeOrPosition.getRanges());
            // Find the common ancestor for all selection's ranges.
            element = ranges
                .reduce((element, range) => {
                const rangeCommonAncestor = range.getCommonAncestor();
                if (!element) {
                    return rangeCommonAncestor;
                }
                return element.getCommonAncestor(rangeCommonAncestor, { includeSelf: true });
            }, null);
        }
        while (!this.isLimit(element)) {
            if (element.parent) {
                element = element.parent;
            }
            else {
                break;
            }
        }
        return element;
    }
    /**
     * Checks whether the attribute is allowed in selection:
     *
     * * if the selection is not collapsed, then checks if the attribute is allowed on any of nodes in that range,
     * * if the selection is collapsed, then checks if on the selection position there's a text with the
     * specified attribute allowed.
     *
     * @param selection Selection which will be checked.
     * @param attribute The name of the attribute to check.
     */
    checkAttributeInSelection(selection, attribute) {
        if (selection.isCollapsed) {
            const firstPosition = selection.getFirstPosition();
            const context = [
                ...firstPosition.getAncestors(),
                new ModelText('', selection.getAttributes())
            ];
            // Check whether schema allows for a text with the attribute in the selection.
            return this.checkAttribute(context, attribute);
        }
        else {
            const ranges = selection.getRanges();
            // For all ranges, check nodes in them until you find a node that is allowed to have the attribute.
            for (const range of ranges) {
                for (const value of range) {
                    if (this.checkAttribute(value.item, attribute)) {
                        // If we found a node that is allowed to have the attribute, return true.
                        return true;
                    }
                }
            }
        }
        // If we haven't found such node, return false.
        return false;
    }
    /**
     * Transforms the given set of ranges into a set of ranges where the given attribute is allowed (and can be applied).
     *
     * @param ranges Ranges to be validated.
     * @param attribute The name of the attribute to check.
     * @param options Optional configuration.
     * @param options.includeEmptyRanges When `true`, empty ranges that allow the attribute are also included
     * in the returned ranges.
     * @returns Ranges in which the attribute is allowed.
     */
    *getValidRanges(ranges, attribute, options = {}) {
        ranges = convertToMinimalFlatRanges(ranges);
        for (const range of ranges) {
            yield* this._getValidRangesForRange(range, attribute, options);
        }
    }
    /**
     * Basing on given `position`, finds and returns a {@link module:engine/model/range~ModelRange range} which is
     * nearest to that `position` and is a correct range for selection.
     *
     * The correct selection range might be collapsed when it is located in a position where the text node can be placed.
     * Non-collapsed range is returned when selection can be placed around element marked as an "object" in
     * the {@link module:engine/model/schema~ModelSchema schema}.
     *
     * Direction of searching for the nearest correct selection range can be specified as:
     *
     * * `both` - searching will be performed in both ways,
     * * `forward` - searching will be performed only forward,
     * * `backward` - searching will be performed only backward.
     *
     * When valid selection range cannot be found, `null` is returned.
     *
     * @param position Reference position where new selection range should be looked for.
     * @param direction Search direction.
     * @returns Nearest selection range or `null` if one cannot be found.
     */
    getNearestSelectionRange(position, direction = 'both') {
        if (position.root.rootName == '$graveyard') {
            // No valid selection range in the graveyard.
            // This is important when getting the document selection default range.
            return null;
        }
        // Return collapsed range if provided position is valid.
        if (this.checkChild(position, '$text')) {
            return new ModelRange(position);
        }
        let backwardWalker, forwardWalker;
        // Never leave a limit element.
        const limitElement = position.getAncestors().reverse().find(item => this.isLimit(item)) ||
            position.root;
        if (direction == 'both' || direction == 'backward') {
            backwardWalker = new ModelTreeWalker({
                boundaries: ModelRange._createIn(limitElement),
                startPosition: position,
                direction: 'backward'
            });
        }
        if (direction == 'both' || direction == 'forward') {
            forwardWalker = new ModelTreeWalker({
                boundaries: ModelRange._createIn(limitElement),
                startPosition: position
            });
        }
        for (const data of combineWalkers(backwardWalker, forwardWalker)) {
            const type = (data.walker == backwardWalker ? 'elementEnd' : 'elementStart');
            const value = data.value;
            if (value.type == type && this.isObject(value.item)) {
                return ModelRange._createOn(value.item);
            }
            if (this.checkChild(value.nextPosition, '$text')) {
                return new ModelRange(value.nextPosition);
            }
        }
        return null;
    }
    /**
     * Tries to find position ancestors that allow to insert a given node.
     * It starts searching from the given position and goes node by node to the top of the model tree
     * as long as a {@link module:engine/model/schema~ModelSchema#isLimit limit element}, an
     * {@link module:engine/model/schema~ModelSchema#isObject object element} or a topmost ancestor is not reached.
     *
     * @param position The position that the search will start from.
     * @param node The node for which an allowed parent should be found or its name.
     * @returns Allowed parent or null if nothing was found.
     */
    findAllowedParent(position, node) {
        let parent = position.parent;
        while (parent) {
            if (this.checkChild(parent, node)) {
                return parent;
            }
            // Do not split limit elements.
            if (this.isLimit(parent)) {
                return null;
            }
            parent = parent.parent;
        }
        return null;
    }
    /**
     * Sets attributes allowed by the schema on a given node.
     *
     * @param node A node to set attributes on.
     * @param attributes Attributes keys and values.
     * @param writer An instance of the model writer.
     */
    setAllowedAttributes(node, attributes, writer) {
        const model = writer.model;
        for (const [attributeName, attributeValue] of Object.entries(attributes)) {
            if (model.schema.checkAttribute(node, attributeName)) {
                writer.setAttribute(attributeName, attributeValue, node);
            }
        }
    }
    /**
     * Removes attributes disallowed by the schema.
     *
     * @param nodes Nodes that will be filtered.
     */
    removeDisallowedAttributes(nodes, writer) {
        for (const node of nodes) {
            // When node is a `Text` it has no children, so just filter it out.
            if (node.is('$text')) {
                removeDisallowedAttributeFromNode(this, node, writer);
            }
            // In a case of `Element` iterates through positions between nodes inside this element
            // and filter out node before the current position, or position parent when position
            // is at start of an element. Using positions prevent from omitting merged nodes
            // see https://github.com/ckeditor/ckeditor5-engine/issues/1789.
            else {
                const rangeInNode = ModelRange._createIn(node);
                const positionsInRange = rangeInNode.getPositions();
                for (const position of positionsInRange) {
                    const item = position.nodeBefore || position.parent;
                    removeDisallowedAttributeFromNode(this, item, writer);
                }
            }
        }
    }
    /**
     * Gets attributes of a node that have a given property.
     *
     * @param node Node to get attributes from.
     * @param propertyName Name of the property that attribute must have to return it.
     * @param propertyValue Desired value of the property that we want to check.
     * When `undefined` attributes will be returned if they have set a given property no matter what the value is. If specified it will
     * return attributes which given property's value is equal to this parameter.
     * @returns Object with attributes' names as key and attributes' values as value.
     */
    getAttributesWithProperty(node, propertyName, propertyValue) {
        const attributes = {};
        for (const [attributeName, attributeValue] of node.getAttributes()) {
            const attributeProperties = this.getAttributeProperties(attributeName);
            if (attributeProperties[propertyName] === undefined) {
                continue;
            }
            if (propertyValue === undefined || propertyValue === attributeProperties[propertyName]) {
                attributes[attributeName] = attributeValue;
            }
        }
        return attributes;
    }
    /**
     * Creates an instance of the schema context.
     */
    createContext(context) {
        return new ModelSchemaContext(context);
    }
    _clearCache() {
        this._compiledDefinitions = null;
    }
    _compile() {
        const definitions = {};
        const sourceRules = this._sourceDefinitions;
        const itemNames = Object.keys(sourceRules);
        for (const itemName of itemNames) {
            definitions[itemName] = compileBaseItemRule(sourceRules[itemName], itemName);
        }
        const items = Object.values(definitions);
        // Sometimes features add rules (allows, disallows) for items that has not been registered yet. We allow that, to make it easier
        // to put the schema together. However, sometimes these items are never registered. To prevent operating
        // removeUnregisteredEntries( definitions, items );
        // 1. Propagate `childItem.allowIn` to `parentItem.allowChildren` and vice versa, so that these properties are completely mirrored
        // for all children and parents. Do the same for `disallowIn` and `disallowChildren`.
        for (const item of items) {
            propagateAllowIn(definitions, item);
            propagateAllowChildren(definitions, item);
            propagateDisallowIn(definitions, item);
            propagateDisallowChildren(definitions, item);
        }
        // 2. Remove from `allowIn` and `allowChildren` these items which where disallowed by `disallowIn` and `disallowChildren`.
        // Do the same for attributes. Now we have a clear situation where which item/attribute is allowed. Inheritance is in next steps.
        for (const item of items) {
            resolveDisallows(definitions, item);
        }
        // 3. Compile `item.allowContentOf` property. For each entry in `allowContentOf`, we want to take `allowChildren` and rewrite
        // them into `item.allowChildren`. `item.disallowChildren` is used to filter out some entries. This way "own rules" have higher
        // priority than "inherited rules". Mirroring from step 1. is maintained.
        for (const item of items) {
            compileAllowContentOf(definitions, item);
        }
        // 4. Compile `item.allowWhere` property. For each entry in `allowWhere`, we want to take `allowIn` and rewrite them into
        // `item.allowIn`. `item.disallowIn` is used to filter out some entries. This way "own rules" have higher priority than
        // "inherited rules". Mirroring from step 1. is maintained.
        for (const item of items) {
            compileAllowWhere(definitions, item);
        }
        // 5. Compile `item.allowAttributesOf`. For each entry in `allowAttributesOf`, we want to take `allowAttributes` and rewrite them
        // into `item.allowAttributes`. `item.disallowAttributes` is used to filter out some entries. This way "own rules" have higher
        // priority than "inherited rules".
        for (const item of items) {
            compileAllowAttributesOf(definitions, item);
        }
        // 6. Compile `item.inheritTypesFrom` property. For each entry in `inheritTypesFrom`, we want to take `is*` properties and
        // set them on `item` (if they are not set yet).
        for (const item of items) {
            compileInheritPropertiesFrom(definitions, item);
        }
        // Compile final definitions. Unnecessary properties are removed and some additional cleaning is applied.
        this._compiledDefinitions = compileDefinitions(definitions);
    }
    _checkContextMatch(context, def) {
        const parentItem = context.last;
        // First, check all child checks declared as callbacks.
        // Note that `_evaluateChildChecks()` will return `undefined` if neither child check was applicable (no decision was made).
        let isAllowed = this._evaluateChildChecks(context, def);
        // If the decision was not made inside child check callbacks, then use declarative rules.
        isAllowed = isAllowed !== undefined ? isAllowed : def.allowIn.includes(parentItem.name);
        // If the item is not allowed in the `context`, return `false`.
        if (!isAllowed) {
            return false;
        }
        // If the item is allowed, recursively verify the rest of the `context`.
        const parentItemDefinition = this.getDefinition(parentItem);
        const parentContext = context.trimLast();
        // One of the items in the original `context` did not have a definition specified. In this case, the whole context is disallowed.
        if (!parentItemDefinition) {
            return false;
        }
        // Whole `context` was verified and passed checks.
        if (parentContext.length == 0) {
            return true;
        }
        // Verify "truncated" parent context. The last item of the original context is now the definition to check.
        return this._checkContextMatch(parentContext, parentItemDefinition);
    }
    /**
     * Calls child check callbacks to decide whether `def` is allowed in `context`. It uses both generic and specific (defined for `def`
     * item) callbacks. If neither callback makes a decision, `undefined` is returned.
     *
     * Note that the first callback that makes a decision "wins", i.e., if any callback returns `true` or `false`, then the processing
     * is over and that result is returned.
     */
    _evaluateChildChecks(context, def) {
        const genericChecks = this._customChildChecks.get(this._genericCheckSymbol) || [];
        const childChecks = this._customChildChecks.get(def.name) || [];
        for (const check of [...genericChecks, ...childChecks]) {
            const result = check(context, def);
            if (result !== undefined) {
                return result;
            }
        }
    }
    /**
     * Calls attribute check callbacks to decide whether `attributeName` can be set on the last element of `context`. It uses both
     * generic and specific (defined for `attributeName`) callbacks. If neither callback makes a decision, `undefined` is returned.
     *
     * Note that the first callback that makes a decision "wins", i.e., if any callback returns `true` or `false`, then the processing
     * is over and that result is returned.
     */
    _evaluateAttributeChecks(context, attributeName) {
        const genericChecks = this._customAttributeChecks.get(this._genericCheckSymbol) || [];
        const childChecks = this._customAttributeChecks.get(attributeName) || [];
        for (const check of [...genericChecks, ...childChecks]) {
            const result = check(context, attributeName);
            if (result !== undefined) {
                return result;
            }
        }
    }
    /**
     * Takes a flat range and an attribute name. Traverses the range recursively and deeply to find and return all ranges
     * inside the given range on which the attribute can be applied.
     *
     * This is a helper function for {@link ~ModelSchema#getValidRanges}.
     *
     * @param range The range to process.
     * @param attribute The name of the attribute to check.
     * @returns Ranges in which the attribute is allowed.
     */
    *_getValidRangesForRange(range, attribute, options) {
        let start = range.start;
        let end = range.start;
        for (const item of range.getItems({ shallow: true })) {
            if (item.is('element')) {
                if (options.includeEmptyRanges && item.isEmpty) {
                    // In empty block check if it accepts text with the given attribute.
                    const context = this.createContext(item);
                    if (this.checkChild(context, '$text') &&
                        this.checkAttribute(context.push('$text'), attribute)) {
                        yield ModelRange._createIn(item);
                    }
                }
                else {
                    yield* this._getValidRangesForRange(ModelRange._createIn(item), attribute, options);
                }
            }
            if (!this.checkAttribute(item, attribute)) {
                if (!start.isEqual(end)) {
                    yield new ModelRange(start, end);
                }
                start = ModelPosition._createAfter(item);
            }
            end = ModelPosition._createAfter(item);
        }
        if (!start.isEqual(end)) {
            yield new ModelRange(start, end);
        }
    }
    /**
     * Returns a model range which is optimal (in terms of UX) for inserting a widget block.
     *
     * For instance, if a selection is in the middle of a paragraph, the collapsed range before this paragraph
     * will be returned so that it is not split. If the selection is at the end of a paragraph,
     * the collapsed range after this paragraph will be returned.
     *
     * Note: If the selection is placed in an empty block, the range in that block will be returned. If that range
     * is then passed to {@link module:engine/model/model~Model#insertContent}, the block will be fully replaced
     * by the inserted widget block.
     *
     * @internal
     * @param selection The selection based on which the insertion position should be calculated.
     * @param place The place where to look for optimal insertion range.
     * The `auto` value will determine itself the best position for insertion.
     * The `before` value will try to find a position before selection.
     * The `after` value will try to find a position after selection.
     * @returns The optimal range.
     */
    findOptimalInsertionRange(selection, place) {
        const selectedElement = selection.getSelectedElement();
        if (selectedElement && this.isObject(selectedElement) && !this.isInline(selectedElement)) {
            if (place == 'before' || place == 'after') {
                return new ModelRange(ModelPosition._createAt(selectedElement, place));
            }
            return ModelRange._createOn(selectedElement);
        }
        const firstBlock = first(selection.getSelectedBlocks());
        // There are no block elements within ancestors (in the current limit element).
        if (!firstBlock) {
            return new ModelRange(selection.focus);
        }
        // If inserting into an empty block – return position in that block. It will get
        // replaced with the image by insertContent(). #42.
        if (firstBlock.isEmpty) {
            return new ModelRange(ModelPosition._createAt(firstBlock, 0));
        }
        const positionAfter = ModelPosition._createAfter(firstBlock);
        // If selection is at the end of the block - return position after the block.
        if (selection.focus.isTouching(positionAfter)) {
            return new ModelRange(positionAfter);
        }
        // Otherwise, return position before the block.
        return new ModelRange(ModelPosition._createBefore(firstBlock));
    }
}
/**
 * A schema context &ndash; a list of ancestors of a given position in the document.
 *
 * Considering such position:
 *
 * ```xml
 * <$root>
 * 	<blockQuote>
 * 		<paragraph>
 * 			^
 * 		</paragraph>
 * 	</blockQuote>
 * </$root>
 * ```
 *
 * The context of this position is its {@link module:engine/model/position~ModelPosition#getAncestors lists of ancestors}:
 *
 *		[ rootElement, blockQuoteElement, paragraphElement ]
 *
 * Contexts are used in the {@link module:engine/model/schema~ModelSchema#event:checkChild `Schema#checkChild`} and
 * {@link module:engine/model/schema~ModelSchema#event:checkAttribute `Schema#checkAttribute`} events as a definition
 * of a place in the document where the check occurs. The context instances are created based on the first arguments
 * of the {@link module:engine/model/schema~ModelSchema#checkChild `Schema#checkChild()`} and
 * {@link module:engine/model/schema~ModelSchema#checkAttribute `Schema#checkAttribute()`} methods so when
 * using these methods you need to use {@link module:engine/model/schema~ModelSchemaContextDefinition}s.
 */
export class ModelSchemaContext {
    _items;
    /**
     * Creates an instance of the context.
     */
    constructor(context) {
        if (context instanceof ModelSchemaContext) {
            return context;
        }
        let items;
        if (typeof context == 'string') {
            items = [context];
        }
        else if (!Array.isArray(context)) {
            // `context` is item or position.
            // Position#getAncestors() doesn't accept any parameters but it works just fine here.
            items = context.getAncestors({ includeSelf: true });
        }
        else {
            items = context;
        }
        this._items = items.map(mapContextItem);
    }
    /**
     * The number of items.
     */
    get length() {
        return this._items.length;
    }
    /**
     * The last item (the lowest node).
     */
    get last() {
        return this._items[this._items.length - 1];
    }
    /**
     * Iterable interface.
     *
     * Iterates over all context items.
     */
    [Symbol.iterator]() {
        return this._items[Symbol.iterator]();
    }
    /**
     * Returns a new schema context instance with an additional item.
     *
     * Item can be added as:
     *
     * ```ts
     * const context = new ModelSchemaContext( [ '$root' ] );
     *
     * // An element.
     * const fooElement = writer.createElement( 'fooElement' );
     * const newContext = context.push( fooElement ); // [ '$root', 'fooElement' ]
     *
     * // A text node.
     * const text = writer.createText( 'foobar' );
     * const newContext = context.push( text ); // [ '$root', '$text' ]
     *
     * // A string (element name).
     * const newContext = context.push( 'barElement' ); // [ '$root', 'barElement' ]
     * ```
     *
     * **Note** {@link module:engine/model/node~ModelNode} that is already in the model tree will be added as the only item
     * (without ancestors).
     *
     * @param item An item that will be added to the current context.
     * @returns A new schema context instance with an additional item.
     */
    push(item) {
        const ctx = new ModelSchemaContext([item]);
        ctx._items = [...this._items, ...ctx._items];
        return ctx;
    }
    /**
     * Returns a new schema context that is based on this context but has the last item removed.
     *
     * ```ts
     * const ctxParagraph = new ModelSchemaContext( [ '$root', 'blockQuote', 'paragraph' ] );
     * const ctxBlockQuote = ctxParagraph.trimLast(); // Items in `ctxBlockQuote` are: `$root` an `blockQuote`.
     * const ctxRoot = ctxBlockQuote.trimLast(); // Items in `ctxRoot` are: `$root`.
     * ```
     *
     * @returns A new reduced schema context instance.
     */
    trimLast() {
        const ctx = new ModelSchemaContext([]);
        ctx._items = this._items.slice(0, -1);
        return ctx;
    }
    /**
     * Gets an item on the given index.
     */
    getItem(index) {
        return this._items[index];
    }
    /**
     * Returns the names of items.
     */
    *getNames() {
        yield* this._items.map(item => item.name);
    }
    /**
     * Checks whether the context ends with the given nodes.
     *
     * ```ts
     * const ctx = new ModelSchemaContext( [ rootElement, paragraphElement, textNode ] );
     *
     * ctx.endsWith( '$text' ); // -> true
     * ctx.endsWith( 'paragraph $text' ); // -> true
     * ctx.endsWith( '$root' ); // -> false
     * ctx.endsWith( 'paragraph' ); // -> false
     * ```
     */
    endsWith(query) {
        return Array.from(this.getNames()).join(' ').endsWith(query);
    }
    /**
     * Checks whether the context starts with the given nodes.
     *
     * ```ts
     * const ctx = new ModelSchemaContext( [ rootElement, paragraphElement, textNode ] );
     *
     * ctx.endsWith( '$root' ); // -> true
     * ctx.endsWith( '$root paragraph' ); // -> true
     * ctx.endsWith( '$text' ); // -> false
     * ctx.endsWith( 'paragraph' ); // -> false
     * ```
     */
    startsWith(query) {
        return Array.from(this.getNames()).join(' ').startsWith(query);
    }
}
function compileBaseItemRule(sourceItemRules, itemName) {
    const itemRule = {
        name: itemName,
        allowIn: new Set(),
        allowChildren: new Set(),
        disallowIn: new Set(),
        disallowChildren: new Set(),
        allowContentOf: new Set(),
        allowWhere: new Set(),
        allowAttributes: new Set(),
        disallowAttributes: new Set(),
        allowAttributesOf: new Set(),
        inheritTypesFrom: new Set()
    };
    copyTypes(sourceItemRules, itemRule);
    copyProperty(sourceItemRules, itemRule, 'allowIn');
    copyProperty(sourceItemRules, itemRule, 'allowChildren');
    copyProperty(sourceItemRules, itemRule, 'disallowIn');
    copyProperty(sourceItemRules, itemRule, 'disallowChildren');
    copyProperty(sourceItemRules, itemRule, 'allowContentOf');
    copyProperty(sourceItemRules, itemRule, 'allowWhere');
    copyProperty(sourceItemRules, itemRule, 'allowAttributes');
    copyProperty(sourceItemRules, itemRule, 'disallowAttributes');
    copyProperty(sourceItemRules, itemRule, 'allowAttributesOf');
    copyProperty(sourceItemRules, itemRule, 'inheritTypesFrom');
    resolveInheritAll(sourceItemRules, itemRule);
    return itemRule;
}
function propagateAllowIn(definitions, item) {
    for (const parentName of item.allowIn) {
        const parentItem = definitions[parentName];
        if (parentItem) {
            parentItem.allowChildren.add(item.name);
        }
        else {
            item.allowIn.delete(parentName);
        }
    }
}
function propagateAllowChildren(definitions, item) {
    for (const childName of item.allowChildren) {
        const childItem = definitions[childName];
        if (childItem) {
            childItem.allowIn.add(item.name);
        }
        else {
            item.allowChildren.delete(childName);
        }
    }
}
function propagateDisallowIn(definitions, item) {
    for (const parentName of item.disallowIn) {
        const parentItem = definitions[parentName];
        if (parentItem) {
            parentItem.disallowChildren.add(item.name);
        }
        else {
            item.disallowIn.delete(parentName);
        }
    }
}
function propagateDisallowChildren(definitions, item) {
    for (const childName of item.disallowChildren) {
        const childItem = definitions[childName];
        if (childItem) {
            childItem.disallowIn.add(item.name);
        }
        else {
            item.disallowChildren.delete(childName);
        }
    }
}
function resolveDisallows(definitions, item) {
    for (const childName of item.disallowChildren) {
        item.allowChildren.delete(childName);
    }
    for (const parentName of item.disallowIn) {
        item.allowIn.delete(parentName);
    }
    for (const attributeName of item.disallowAttributes) {
        item.allowAttributes.delete(attributeName);
    }
}
function compileAllowContentOf(definitions, item) {
    for (const allowContentOfItemName of item.allowContentOf) {
        const baseItem = definitions[allowContentOfItemName];
        if (!baseItem) {
            continue;
        }
        // Copy `disallowChildren` to propagate this "knowledge" down the inheritance chain. The inheritance may involve multiple items and
        // if this is not propagated, then items down the chain may start to allow for items that were disallowed by previous base items.
        //
        // The scenarios were it is important involves multiple inherits both on parent items side and on the child items side.
        baseItem.disallowChildren.forEach(childName => {
            // Own item's rules takes precedence before inherited.
            // If the item directly allows for given child, ignore that base item disallowed that child.
            if (item.allowChildren.has(childName)) {
                return;
            }
            item.disallowChildren.add(childName);
            definitions[childName].disallowIn.add(item.name);
        });
        // Copy `allowChildren` from the base item to allow for the same items.
        baseItem.allowChildren.forEach(childName => {
            // Own item's rules takes precedence before inherited.
            // Also, `item.disallowChildren` might get some new items during inheritance process.
            if (item.disallowChildren.has(childName)) {
                return;
            }
            item.allowChildren.add(childName);
            definitions[childName].allowIn.add(item.name);
        });
    }
}
function compileAllowWhere(definitions, item) {
    for (const allowWhereItemName of item.allowWhere) {
        const baseItem = definitions[allowWhereItemName];
        if (!baseItem) {
            continue;
        }
        // Copy `disallowIn` to propagate this "knowledge" down the inheritance chain. The inheritance may involve multiple items and
        // if this is not propagated, then items down the chain may start to be allowed in items in which they were disallowed previously.
        //
        // The scenarios were it is important involves multiple inherits both on parent items side and on the child items side.
        baseItem.disallowIn.forEach(parentName => {
            // Own item's rules takes precedence before inherited.
            // If the item is directly allowed in given parent, ignore that base item was disallowed in it.
            if (item.allowIn.has(parentName)) {
                return;
            }
            item.disallowIn.add(parentName);
            definitions[parentName].disallowChildren.add(item.name);
        });
        // Copy `allowIn` from the base item to allow item in same parents.
        baseItem.allowIn.forEach(parentName => {
            // Own item's rules takes precedence before inherited.
            // Also, `item.disallowIn` might get some new items during inheritance process.
            if (item.disallowIn.has(parentName)) {
                return;
            }
            item.allowIn.add(parentName);
            definitions[parentName].allowChildren.add(item.name);
        });
    }
}
function compileDefinitions(definitions) {
    const finalDefinitions = {};
    for (const item of Object.values(definitions)) {
        finalDefinitions[item.name] = {
            name: item.name,
            // `is*` properties may not be set - convert `undefined` to `false`.
            isBlock: !!item.isBlock,
            isContent: !!item.isContent,
            isInline: !!item.isInline,
            isLimit: !!item.isLimit,
            isObject: !!item.isObject,
            isSelectable: !!item.isSelectable,
            // Filter out non-existing items.
            allowIn: Array.from(item.allowIn).filter(name => !!definitions[name]),
            allowChildren: Array.from(item.allowChildren).filter(name => !!definitions[name]),
            allowAttributes: Array.from(item.allowAttributes)
        };
    }
    return finalDefinitions;
}
function compileAllowAttributesOf(definitions, item) {
    for (const allowAttributeOfItemName of item.allowAttributesOf) {
        const baseItem = definitions[allowAttributeOfItemName];
        if (!baseItem) {
            return;
        }
        baseItem.allowAttributes.forEach(attributeName => {
            if (item.disallowAttributes.has(attributeName)) {
                return;
            }
            item.allowAttributes.add(attributeName);
        });
    }
}
function compileInheritPropertiesFrom(definitions, item) {
    for (const inheritPropertiesOfItemName of item.inheritTypesFrom) {
        const inheritFrom = definitions[inheritPropertiesOfItemName];
        if (inheritFrom) {
            const typeNames = Object.keys(inheritFrom).filter(name => name.startsWith('is'));
            for (const name of typeNames) {
                if (!(name in item)) {
                    item[name] = inheritFrom[name];
                }
            }
        }
    }
}
function copyTypes(sourceItemRules, itemRule) {
    for (const sourceItemRule of sourceItemRules) {
        const typeNames = Object.keys(sourceItemRule).filter(name => name.startsWith('is'));
        for (const name of typeNames) {
            itemRule[name] = !!sourceItemRule[name];
        }
    }
}
function copyProperty(sourceItemRules, itemRule, propertyName) {
    for (const sourceItemRule of sourceItemRules) {
        let value = sourceItemRule[propertyName];
        // `value` can be a string, an array or undefined.
        // Convert a string to an array with one item, then handle an array. Skip undefined this way.
        if (typeof value == 'string') {
            value = [value];
        }
        if (Array.isArray(value)) {
            value.forEach(singleValue => itemRule[propertyName].add(singleValue));
        }
    }
}
function resolveInheritAll(sourceItemRules, itemRule) {
    for (const sourceItemRule of sourceItemRules) {
        const inheritFrom = sourceItemRule.inheritAllFrom;
        if (inheritFrom) {
            itemRule.allowContentOf.add(inheritFrom);
            itemRule.allowWhere.add(inheritFrom);
            itemRule.allowAttributesOf.add(inheritFrom);
            itemRule.inheritTypesFrom.add(inheritFrom);
        }
    }
}
function mapContextItem(ctxItem) {
    if (typeof ctxItem == 'string' || ctxItem.is('documentFragment')) {
        return {
            name: typeof ctxItem == 'string' ? ctxItem : '$documentFragment',
            *getAttributeKeys() { },
            getAttribute() { }
        };
    }
    else {
        return {
            // '$text' means text nodes and text proxies.
            name: ctxItem.is('element') ? ctxItem.name : '$text',
            *getAttributeKeys() {
                yield* ctxItem.getAttributeKeys();
            },
            getAttribute(key) {
                return ctxItem.getAttribute(key);
            }
        };
    }
}
/**
 * Generator function returning values from provided walkers, switching between them at each iteration. If only one walker
 * is provided it will return data only from that walker.
 *
 * @param backward Walker iterating in backward direction.
 * @param forward Walker iterating in forward direction.
 * @returns Object returned at each iteration contains `value` and `walker` (informing which walker returned
 * given value) fields.
 */
function* combineWalkers(backward, forward) {
    let done = false;
    while (!done) {
        done = true;
        if (backward) {
            const step = backward.next();
            if (!step.done) {
                done = false;
                yield {
                    walker: backward,
                    value: step.value
                };
            }
        }
        if (forward) {
            const step = forward.next();
            if (!step.done) {
                done = false;
                yield {
                    walker: forward,
                    value: step.value
                };
            }
        }
    }
}
/**
 * Takes an array of non-intersecting ranges. For each of them gets minimal flat ranges covering that range and returns
 * all those minimal flat ranges.
 *
 * @param ranges Ranges to process.
 * @returns Minimal flat ranges of given `ranges`.
 */
function* convertToMinimalFlatRanges(ranges) {
    for (const range of ranges) {
        yield* range.getMinimalFlatRanges();
    }
}
function removeDisallowedAttributeFromNode(schema, node, writer) {
    for (const attribute of node.getAttributeKeys()) {
        if (!schema.checkAttribute(node, attribute)) {
            writer.removeAttribute(attribute, node);
        }
    }
}
