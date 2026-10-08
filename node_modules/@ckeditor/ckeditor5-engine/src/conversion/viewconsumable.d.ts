/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import type { ViewElement, ViewNormalizedConsumables } from '../view/element.js';
import { type ViewNode } from '../view/node.js';
import { type ViewText } from '../view/text.js';
import { type ViewDocumentFragment } from '../view/documentfragment.js';
import type { Match } from '../view/matcher.js';
/**
 * Class used for handling consumption of view {@link module:engine/view/element~ViewElement elements},
 * {@link module:engine/view/text~ViewText text nodes} and
 * {@link module:engine/view/documentfragment~ViewDocumentFragment document fragments}.
 * Element's name and its parts (attributes, classes and styles) can be consumed separately. Consuming an element's name
 * does not consume its attributes, classes and styles.
 * To add items for consumption use {@link module:engine/conversion/viewconsumable~ViewConsumable#add add method}.
 * To test items use {@link module:engine/conversion/viewconsumable~ViewConsumable#test test method}.
 * To consume items use {@link module:engine/conversion/viewconsumable~ViewConsumable#consume consume method}.
 * To revert already consumed items use {@link module:engine/conversion/viewconsumable~ViewConsumable#revert revert method}.
 *
 * ```ts
 * viewConsumable.add( element, { name: true } ); // Adds element's name as ready to be consumed.
 * viewConsumable.add( textNode ); // Adds text node for consumption.
 * viewConsumable.add( docFragment ); // Adds document fragment for consumption.
 * viewConsumable.test( element, { name: true }  ); // Tests if element's name can be consumed.
 * viewConsumable.test( textNode ); // Tests if text node can be consumed.
 * viewConsumable.test( docFragment ); // Tests if document fragment can be consumed.
 * viewConsumable.consume( element, { name: true }  ); // Consume element's name.
 * viewConsumable.consume( textNode ); // Consume text node.
 * viewConsumable.consume( docFragment ); // Consume document fragment.
 * viewConsumable.revert( element, { name: true }  ); // Revert already consumed element's name.
 * viewConsumable.revert( textNode ); // Revert already consumed text node.
 * viewConsumable.revert( docFragment ); // Revert already consumed document fragment.
 * ```
 */
export declare class ViewConsumable {
    /**
     * Map of consumable elements. If {@link module:engine/view/element~ViewElement element} is used as a key,
     * {@link module:engine/conversion/viewconsumable~ViewElementConsumables ViewElementConsumables} instance is stored as value.
     * For {@link module:engine/view/text~ViewText text nodes} and
     * {@link module:engine/view/documentfragment~ViewDocumentFragment document fragments} boolean value is stored as value.
     */
    private _consumables;
    /**
     * Adds view {@link module:engine/view/element~ViewElement element}, {@link module:engine/view/text~ViewText text node} or
     * {@link module:engine/view/documentfragment~ViewDocumentFragment document fragment} as ready to be consumed.
     *
     * ```ts
     * viewConsumable.add( p, { name: true } ); // Adds element's name to consume.
     * viewConsumable.add( p, { attributes: 'name' } ); // Adds element's attribute.
     * viewConsumable.add( p, { classes: 'foobar' } ); // Adds element's class.
     * viewConsumable.add( p, { styles: 'color' } ); // Adds element's style
     * viewConsumable.add( p, { attributes: 'name', styles: 'color' } ); // Adds attribute and style.
     * viewConsumable.add( p, { classes: [ 'baz', 'bar' ] } ); // Multiple consumables can be provided.
     * viewConsumable.add( textNode ); // Adds text node to consume.
     * viewConsumable.add( docFragment ); // Adds document fragment to consume.
     * ```
     *
     * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `viewconsumable-invalid-attribute` when `class` or `style`
     * attribute is provided - it should be handled separately by providing actual style/class.
     *
     * ```ts
     * viewConsumable.add( p, { attributes: 'style' } ); // This call will throw an exception.
     * viewConsumable.add( p, { styles: 'color' } ); // This is properly handled style.
     * ```
     *
     * @param consumables Used only if first parameter is {@link module:engine/view/element~ViewElement view element} instance.
     * @param consumables.name If set to true element's name will be included.
     * @param consumables.attributes Attribute name or array of attribute names.
     * @param consumables.classes Class name or array of class names.
     * @param consumables.styles Style name or array of style names.
     */
    add(element: ViewText | ViewElement | ViewDocumentFragment, consumables?: Consumables | ViewNormalizedConsumables): void;
    /**
     * Tests if {@link module:engine/view/element~ViewElement view element}, {@link module:engine/view/text~ViewText text node} or
     * {@link module:engine/view/documentfragment~ViewDocumentFragment document fragment} can be consumed.
     * It returns `true` when all items included in method's call can be consumed. Returns `false` when
     * first already consumed item is found and `null` when first non-consumable item is found.
     *
     * ```ts
     * viewConsumable.test( p, { name: true } ); // Tests element's name.
     * viewConsumable.test( p, { attributes: 'name' } ); // Tests attribute.
     * viewConsumable.test( p, { classes: 'foobar' } ); // Tests class.
     * viewConsumable.test( p, { styles: 'color' } ); // Tests style.
     * viewConsumable.test( p, { attributes: 'name', styles: 'color' } ); // Tests attribute and style.
     * viewConsumable.test( p, { classes: [ 'baz', 'bar' ] } ); // Multiple consumables can be tested.
     * viewConsumable.test( textNode ); // Tests text node.
     * viewConsumable.test( docFragment ); // Tests document fragment.
     * ```
     *
     * Testing classes and styles as attribute will test if all added classes/styles can be consumed.
     *
     * ```ts
     * viewConsumable.test( p, { attributes: 'class' } ); // Tests if all added classes can be consumed.
     * viewConsumable.test( p, { attributes: 'style' } ); // Tests if all added styles can be consumed.
     * ```
     *
     * @param consumables Used only if first parameter is {@link module:engine/view/element~ViewElement view element} instance.
     * @param consumables.name If set to true element's name will be included.
     * @param consumables.attributes Attribute name or array of attribute names.
     * @param consumables.classes Class name or array of class names.
     * @param consumables.styles Style name or array of style names.
     * @returns Returns `true` when all items included in method's call can be consumed. Returns `false`
     * when first already consumed item is found and `null` when first non-consumable item is found.
     */
    test(element: ViewNode | ViewDocumentFragment, consumables?: Consumables | Match): boolean | null;
    /**
     * Consumes {@link module:engine/view/element~ViewElement view element}, {@link module:engine/view/text~ViewText text node} or
     * {@link module:engine/view/documentfragment~ViewDocumentFragment document fragment}.
     * It returns `true` when all items included in method's call can be consumed, otherwise returns `false`.
     *
     * ```ts
     * viewConsumable.consume( p, { name: true } ); // Consumes element's name.
     * viewConsumable.consume( p, { attributes: 'name' } ); // Consumes element's attribute.
     * viewConsumable.consume( p, { classes: 'foobar' } ); // Consumes element's class.
     * viewConsumable.consume( p, { styles: 'color' } ); // Consumes element's style.
     * viewConsumable.consume( p, { attributes: 'name', styles: 'color' } ); // Consumes attribute and style.
     * viewConsumable.consume( p, { classes: [ 'baz', 'bar' ] } ); // Multiple consumables can be consumed.
     * viewConsumable.consume( textNode ); // Consumes text node.
     * viewConsumable.consume( docFragment ); // Consumes document fragment.
     * ```
     *
     * Consuming classes and styles as attribute will test if all added classes/styles can be consumed.
     *
     * ```ts
     * viewConsumable.consume( p, { attributes: 'class' } ); // Consume only if all added classes can be consumed.
     * viewConsumable.consume( p, { attributes: 'style' } ); // Consume only if all added styles can be consumed.
     * ```
     *
     * @param consumables Used only if first parameter is {@link module:engine/view/element~ViewElement view element} instance.
     * @param consumables.name If set to true element's name will be included.
     * @param consumables.attributes Attribute name or array of attribute names.
     * @param consumables.classes Class name or array of class names.
     * @param consumables.styles Style name or array of style names.
     * @returns Returns `true` when all items included in method's call can be consumed,
     * otherwise returns `false`.
     */
    consume(element: ViewNode | ViewDocumentFragment, consumables?: Consumables | Match): boolean;
    /**
     * Reverts {@link module:engine/view/element~ViewElement view element}, {@link module:engine/view/text~ViewText text node} or
     * {@link module:engine/view/documentfragment~ViewDocumentFragment document fragment} so they can be consumed once again.
     * Method does not revert items that were never previously added for consumption, even if they are included in
     * method's call.
     *
     * ```ts
     * viewConsumable.revert( p, { name: true } ); // Reverts element's name.
     * viewConsumable.revert( p, { attributes: 'name' } ); // Reverts element's attribute.
     * viewConsumable.revert( p, { classes: 'foobar' } ); // Reverts element's class.
     * viewConsumable.revert( p, { styles: 'color' } ); // Reverts element's style.
     * viewConsumable.revert( p, { attributes: 'name', styles: 'color' } ); // Reverts attribute and style.
     * viewConsumable.revert( p, { classes: [ 'baz', 'bar' ] } ); // Multiple names can be reverted.
     * viewConsumable.revert( textNode ); // Reverts text node.
     * viewConsumable.revert( docFragment ); // Reverts document fragment.
     * ```
     *
     * Reverting classes and styles as attribute will revert all classes/styles that were previously added for
     * consumption.
     *
     * ```ts
     * viewConsumable.revert( p, { attributes: 'class' } ); // Reverts all classes added for consumption.
     * viewConsumable.revert( p, { attributes: 'style' } ); // Reverts all styles added for consumption.
     * ```
     *
     * @param consumables Used only if first parameter is {@link module:engine/view/element~ViewElement view element} instance.
     * @param consumables.name If set to true element's name will be included.
     * @param consumables.attributes Attribute name or array of attribute names.
     * @param consumables.classes Class name or array of class names.
     * @param consumables.styles Style name or array of style names.
     */
    revert(element: ViewNode, consumables: Consumables | Match): void;
    /**
     * Creates {@link module:engine/conversion/viewconsumable~ViewConsumable ViewConsumable} instance from
     * {@link module:engine/view/node~ViewNode node} or {@link module:engine/view/documentfragment~ViewDocumentFragment document fragment}.
     * Instance will contain all elements, child nodes, attributes, styles and classes added for consumption.
     *
     * @param from View node or document fragment from which `ViewConsumable` will be created.
     * @param instance If provided, given `ViewConsumable` instance will be used
     * to add all consumables. It will be returned instead of a new instance.
     */
    static createFrom(from: ViewNode | ViewDocumentFragment, instance?: ViewConsumable): ViewConsumable;
}
/**
 * Object describing all features of a view element that could be consumed and converted individually.
 * This is a non-normalized form of {@link module:engine/view/element~ViewNormalizedConsumables} generated from the view Element.
 *
 * Example element:
 *
 * ```html
 * <a class="foo bar" style="color: red; margin: 5px" href="https://ckeditor.com" rel="nofollow noreferrer" target="_blank">
 * ```
 *
 * The `Consumables` would include:
 *
 * ```json
 * {
 * 	name: true,
 * 	classes: [ "foo", "bar" ],
 * 	styles: [ "color", "margin" ]
 * }
 * ```
 *
 * You could convert a `Consumable` into a {@link module:engine/view/element~ViewNormalizedConsumables}
 * using the {@link module:engine/conversion/viewconsumable~normalizeConsumables} helper.
 */
export interface Consumables {
    /**
     * If set to `true` element's name will be included in a consumable.
     * Depending on the usage context it would be added as consumable, tested for being available for consume or consumed.
     */
    name?: boolean;
    /**
     * Attribute name or array of attribute names.
     */
    attributes?: string | Array<string>;
    /**
     * Class name or array of class names.
     */
    classes?: string | Array<string>;
    /**
     * Style name or array of style names.
     */
    styles?: string | Array<string>;
}
/**
 * This is a private helper-class for {@link module:engine/conversion/viewconsumable~ViewConsumable}.
 * It represents and manipulates consumable parts of a single {@link module:engine/view/element~ViewElement}.
 *
 * @internal
 */
export declare class ViewElementConsumables {
    readonly element: ViewElement;
    /**
     * Flag indicating if name of the element can be consumed.
     */
    private _canConsumeName;
    /**
     * A map of element's consumables.
     * * For plain attributes the value is a boolean indicating whether the attribute is available to consume.
     * * For token based attributes (like class list and style) the value is a map of tokens to booleans
     * indicating whether the token is available to consume on the given attribute.
     */
    private readonly _attributes;
    /**
     * Creates ViewElementConsumables instance.
     *
     * @param from View element from which `ViewElementConsumables` is being created.
     */
    constructor(from: ViewElement);
    /**
     * Adds consumable parts of the {@link module:engine/view/element~ViewElement view element}.
     * Element's name itself can be marked to be consumed (when element's name is consumed its attributes, classes and
     * styles still could be consumed):
     *
     * ```ts
     * consumables.add( { name: true } );
     * ```
     *
     * Attributes classes and styles:
     *
     * ```ts
     * consumables.add( { attributes: [ [ 'title' ], [ 'class', 'foo' ], [ 'style', 'color'] ] } );
     * consumables.add( { attributes: [ [ 'title' ], [ 'name' ], [ 'class', 'foo' ], [ 'class', 'bar' ] ] } );
     * ```
     *
     * Note: This method accepts only {@link module:engine/view/element~ViewNormalizedConsumables}.
     * You can use {@link module:engine/conversion/viewconsumable~normalizeConsumables} helper to convert from
     * {@link module:engine/conversion/viewconsumable~Consumables} to `ViewNormalizedConsumables`.
     *
     * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `viewconsumable-invalid-attribute` when `class` or `style`
     * attribute is provided - it should be handled separately by providing `style` and `class` in consumables object.
     *
     * @param consumables Object describing which parts of the element can be consumed.
     */
    add(consumables: ViewNormalizedConsumables): void;
    /**
     * Tests if parts of the {@link module:engine/view/element~ViewElement view element} can be consumed.
     *
     * Element's name can be tested:
     *
     * ```ts
     * consumables.test( { name: true } );
     * ```
     *
     * Attributes classes and styles:
     *
     * ```ts
     * consumables.test( { attributes: [ [ 'title' ], [ 'class', 'foo' ], [ 'style', 'color' ] ] } );
     * consumables.test( { attributes: [ [ 'title' ], [ 'name' ], [ 'class', 'foo' ], [ 'class', 'bar' ] ] } );
     * ```
     *
     * @param consumables Object describing which parts of the element should be tested.
     * @returns `true` when all tested items can be consumed, `null` when even one of the items
     * was never marked for consumption and `false` when even one of the items was already consumed.
     */
    test(consumables: ViewNormalizedConsumables): boolean | null;
    /**
     * Tests if parts of the {@link module:engine/view/element~ViewElement view element} can be consumed and consumes them if available.
     * It returns `true` when all items included in method's call can be consumed, otherwise returns `false`.
     *
     * Element's name can be consumed:
     *
     * ```ts
     * consumables.consume( { name: true } );
     * ```
     *
     * Attributes classes and styles:
     *
     * ```ts
     * consumables.consume( { attributes: [ [ 'title' ], [ 'class', 'foo' ], [ 'style', 'color' ] ] } );
     * consumables.consume( { attributes: [ [ 'title' ], [ 'name' ], [ 'class', 'foo' ], [ 'class', 'bar' ] ] } );
     * ```
     *
     * @param consumables Object describing which parts of the element should be consumed.
     * @returns `true` when all tested items can be consumed and `false` when even one of the items could not be consumed.
     */
    consume(consumables: ViewNormalizedConsumables): boolean;
    /**
     * Revert already consumed parts of {@link module:engine/view/element~ViewElement view Element}, so they can be consumed once again.
     * Element's name can be reverted:
     *
     * ```ts
     * consumables.revert( { name: true } );
     * ```
     *
     * Attributes classes and styles:
     *
     * ```ts
     * consumables.revert( { attributes: [ [ 'title' ], [ 'class', 'foo' ], [ 'style', 'color' ] ] } );
     * consumables.revert( { attributes: [ [ 'title' ], [ 'name' ], [ 'class', 'foo' ], [ 'class', 'bar' ] ] } );
     * ```
     *
     * @param consumables Object describing which parts of the element should be reverted.
     */
    revert(consumables: ViewNormalizedConsumables): void;
}
/**
 * Normalizes a {@link module:engine/conversion/viewconsumable~Consumables} or {@link module:engine/view/matcher~Match}
 * to a {@link module:engine/view/element~ViewNormalizedConsumables}.
 *
 * @internal
 */
export declare function normalizeConsumables(consumables: Consumables | Match): ViewNormalizedConsumables;
