/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/downcastwriter
 */
import { ViewPosition, type ViewPositionOffset } from './position.js';
import { ViewRange } from './range.js';
import { ViewSelection, type ViewPlaceOrOffset, type ViewSelectable, type ViewSelectionOptions } from './selection.js';
import { ViewContainerElement } from './containerelement.js';
import { ViewAttributeElement } from './attributeelement.js';
import { ViewEmptyElement } from './emptyelement.js';
import { ViewUIElement } from './uielement.js';
import { ViewRawElement } from './rawelement.js';
import { type ArrayOrItem } from '@ckeditor/ckeditor5-utils';
import { ViewDocumentFragment } from './documentfragment.js';
import { ViewText } from './text.js';
import { ViewEditableElement } from './editableelement.js';
import { type ViewDocument } from './document.js';
import { type ViewNode } from './node.js';
import type { ViewElement, ViewElementAttributes } from './element.js';
import { type ViewDomConverter } from './domconverter.js';
import { type ViewItem } from './item.js';
import type { DowncastSlotFilter } from '../conversion/downcasthelpers.js';
type DomDocument = globalThis.Document;
type DomElement = globalThis.HTMLElement;
/**
 * View downcast writer.
 *
 * It provides a set of methods used to manipulate view nodes.
 *
 * Do not create an instance of this writer manually. To modify a view structure, use
 * the {@link module:engine/view/view~EditingView#change `View#change()`} block.
 *
 * The `ViewDowncastWriter` is designed to work with semantic views which are the views that were/are being downcasted from the model.
 * To work with ordinary views (e.g. parsed from a pasted content) use the
 * {@link module:engine/view/upcastwriter~ViewUpcastWriter upcast writer}.
 *
 * Read more about changing the view in the {@glink framework/architecture/editing-engine#changing-the-view Changing the view}
 * section of the {@glink framework/architecture/editing-engine Editing engine architecture} guide.
 */
export declare class ViewDowncastWriter {
    /**
     * The view document instance in which this writer operates.
     */
    readonly document: ViewDocument;
    /**
     * Holds references to the attribute groups that share the same {@link module:engine/view/attributeelement~ViewAttributeElement#id id}.
     * The keys are `id`s, the values are `Set`s holding {@link module:engine/view/attributeelement~ViewAttributeElement}s.
     */
    private readonly _cloneGroups;
    /**
     * The slot factory used by the `elementToStructure` downcast helper.
     */
    private _slotFactory;
    /**
     * @param document The view document instance.
     */
    constructor(document: ViewDocument);
    /**
     * Sets {@link module:engine/view/documentselection~ViewDocumentSelection selection's} ranges and direction to the
     * specified location based on the given {@link module:engine/view/selection~ViewSelectable selectable}.
     *
     * Usage:
     *
     * ```ts
     * // Sets collapsed selection at the position of given item and offset.
     * const paragraph = writer.createContainerElement( 'p' );
     * writer.setSelection( paragraph, offset );
     * ```
     *
     * Creates a range inside an {@link module:engine/view/element~ViewElement element} which starts before the first child of
     * that element and ends after the last child of that element.
     *
     * ```ts
     * writer.setSelection( paragraph, 'in' );
     * ```
     *
     * Creates a range on the {@link module:engine/view/item~ViewItem item} which starts before the item and ends just after the item.
     *
     * ```ts
     * writer.setSelection( paragraph, 'on' );
     * ```
     *
     * `ViewDowncastWriter#setSelection()` allow passing additional options (`backward`, `fake` and `label`) as the last argument.
     *
     * ```ts
     * // Sets selection as backward.
     * writer.setSelection( element, 'in', { backward: true } );
     *
     * // Sets selection as fake.
     * // Fake selection does not render as browser native selection over selected elements and is hidden to the user.
     * // This way, no native selection UI artifacts are displayed to the user and selection over elements can be
     * // represented in other way, for example by applying proper CSS class.
     * writer.setSelection( element, 'in', { fake: true } );
     *
     * // Additionally fake's selection label can be provided. It will be used to describe fake selection in DOM
     * // (and be  properly handled by screen readers).
     * writer.setSelection( element, 'in', { fake: true, label: 'foo' } );
     * ```
     *
     * See also: {@link #setSelection:SELECTABLE `setSelection( selectable, options )`}.
     *
     * @label NODE_OFFSET
     */
    setSelection(selectable: ViewNode, placeOrOffset: ViewPlaceOrOffset, options?: ViewSelectionOptions): void;
    /**
     * Sets {@link module:engine/view/documentselection~ViewDocumentSelection selection's} ranges and direction to the
     * specified location based on the given {@link module:engine/view/selection~ViewSelectable selectable}.
     *
     * Usage:
     *
     * ```ts
     * // Sets selection to the given range.
     * const range = writer.createRange( start, end );
     * writer.setSelection( range );
     *
     * // Sets backward selection to the given range.
     * const range = writer.createRange( start, end );
     * writer.setSelection( range );
     *
     * // Sets selection to given ranges.
     * const ranges = [ writer.createRange( start1, end2 ), writer.createRange( start2, end2 ) ];
     * writer.setSelection( range );
     *
     * // Sets selection to the other selection.
     * const otherSelection = writer.createSelection();
     * writer.setSelection( otherSelection );
     *
     * // Sets collapsed selection at the given position.
     * const position = writer.createPositionFromPath( root, path );
     * writer.setSelection( position );
     *
     * // Removes all ranges.
     * writer.setSelection( null );
     * ```
     *
     * `ViewDowncastWriter#setSelection()` allow passing additional options (`backward`, `fake` and `label`) as the last argument.
     *
     * ```ts
     * // Sets selection as backward.
     * writer.setSelection( range, { backward: true } );
     *
     * // Sets selection as fake.
     * // Fake selection does not render as browser native selection over selected elements and is hidden to the user.
     * // This way, no native selection UI artifacts are displayed to the user and selection over elements can be
     * // represented in other way, for example by applying proper CSS class.
     * writer.setSelection( range, { fake: true } );
     *
     * // Additionally fake's selection label can be provided. It will be used to describe fake selection in DOM
     * // (and be  properly handled by screen readers).
     * writer.setSelection( range, { fake: true, label: 'foo' } );
     * ```
     *
     * See also: {@link #setSelection:NODE_OFFSET `setSelection( node, placeOrOffset, options )`}.
     *
     * @label SELECTABLE
     */
    setSelection(selectable: Exclude<ViewSelectable, ViewNode>, options?: ViewSelectionOptions): void;
    /**
     * Moves {@link module:engine/view/documentselection~ViewDocumentSelection#focus selection's focus} to the specified location.
     *
     * The location can be specified in the same form as
     * {@link module:engine/view/view~EditingView#createPositionAt view.createPositionAt()}
     * parameters.
     *
     * @param itemOrPosition
     * @param offset Offset or one of the flags. Used only when the first parameter is a {@link module:engine/view/item~ViewItem view item}.
     */
    setSelectionFocus(itemOrPosition: ViewItem | ViewPosition, offset?: ViewPositionOffset): void;
    /**
     * Creates a new {@link module:engine/view/documentfragment~ViewDocumentFragment} instance.
     *
     * @param children A list of nodes to be inserted into the created document fragment.
     * @returns The created document fragment.
     */
    createDocumentFragment(children?: ViewNode | Iterable<ViewNode>): ViewDocumentFragment;
    /**
     * Creates a new {@link module:engine/view/text~ViewText text node}.
     *
     * ```ts
     * writer.createText( 'foo' );
     * ```
     *
     * @param data The text's data.
     * @returns The created text node.
     */
    createText(data: string): ViewText;
    /**
     * Creates a new {@link module:engine/view/attributeelement~ViewAttributeElement}.
     *
     * ```ts
     * writer.createAttributeElement( 'strong' );
     * writer.createAttributeElement( 'a', { href: 'foo.bar' } );
     *
     * // Make `<a>` element contain other attributes element so the `<a>` element is not broken.
     * writer.createAttributeElement( 'a', { href: 'foo.bar' }, { priority: 5 } );
     *
     * // Set `id` of a marker element so it is not joined or merged with "normal" elements.
     * writer.createAttributeElement( 'span', { class: 'my-marker' }, { id: 'marker:my' } );
     * ```
     *
     * @param name Name of the element.
     * @param attributes Element's attributes.
     * @param options Element's options.
     * @param options.priority Element's {@link module:engine/view/attributeelement~ViewAttributeElement#priority priority}.
     * @param options.id Element's {@link module:engine/view/attributeelement~ViewAttributeElement#id id}.
     * @param options.renderUnsafeAttributes A list of attribute names that should be rendered in the editing
     * pipeline even though they would normally be filtered out by unsafe attribute detection mechanisms.
     * @returns Created element.
     */
    createAttributeElement(name: string, attributes?: ViewElementAttributes, options?: {
        priority?: number;
        id?: number | string;
        renderUnsafeAttributes?: Array<string>;
    }): ViewAttributeElement;
    /**
     * Creates a new {@link module:engine/view/containerelement~ViewContainerElement}.
     *
     * ```ts
     * writer.createContainerElement( 'p' );
     *
     * // Create element with custom attributes.
     * writer.createContainerElement( 'div', { id: 'foo-bar', 'data-baz': '123' } );
     *
     * // Create element with custom styles.
     * writer.createContainerElement( 'p', { style: 'font-weight: bold; padding-bottom: 10px' } );
     *
     * // Create element with custom classes.
     * writer.createContainerElement( 'p', { class: 'foo bar baz' } );
     *
     * // Create element with specific options.
     * writer.createContainerElement( 'span', { class: 'placeholder' }, { renderUnsafeAttributes: [ 'foo' ] } );
     * ```
     *
     * @label WITHOUT_CHILDREN
     * @param name Name of the element.
     * @param attributes Elements attributes.
     * @param options Element's options.
     * @param options.renderUnsafeAttributes A list of attribute names that should be rendered in the editing
     * pipeline even though they would normally be filtered out by unsafe attribute detection mechanisms.
     * @returns Created element.
     */
    createContainerElement(name: string, attributes?: ViewElementAttributes, options?: {
        renderUnsafeAttributes?: Array<string>;
    }): ViewContainerElement;
    /**
     * Creates a new {@link module:engine/view/containerelement~ViewContainerElement} with children.
     *
     * ```ts
     * // Create element with children.
     * writer.createContainerElement( 'figure', { class: 'image' }, [
     * 	writer.createEmptyElement( 'img' ),
     * 	writer.createContainerElement( 'figcaption' )
     * ] );
     *
     * // Create element with specific options.
     * writer.createContainerElement( 'figure', { class: 'image' }, [
     * 	writer.createEmptyElement( 'img' ),
     * 	writer.createContainerElement( 'figcaption' )
     * ], { renderUnsafeAttributes: [ 'foo' ] } );
     * ```
     *
     * @label WITH_CHILDREN
     * @param name Name of the element.
     * @param attributes Elements attributes.
     * @param children A node or a list of nodes to be inserted into the created element.
     * If no children were specified, element's `options` can be passed in this argument.
     * @param options Element's options.
     * @param options.renderUnsafeAttributes A list of attribute names that should be rendered in the editing
     * pipeline even though they would normally be filtered out by unsafe attribute detection mechanisms.
     * @returns Created element.
     */
    createContainerElement(name: string, attributes: ViewElementAttributes, children: ViewNode | Iterable<ViewNode>, options?: {
        renderUnsafeAttributes?: Array<string>;
    }): ViewContainerElement;
    /**
     * Creates a new {@link module:engine/view/editableelement~ViewEditableElement}.
     *
     * ```ts
     * writer.createEditableElement( 'div' );
     * writer.createEditableElement( 'div', { id: 'foo-1234' } );
     * ```
     *
     * Note: The editable element is to be used in the editing pipeline. Usually, together with
     * {@link module:widget/utils~toWidgetEditable `toWidgetEditable()`}.
     *
     * @param name Name of the element.
     * @param attributes Elements attributes.
     * @param options Element's options.
     * @param options.renderUnsafeAttributes A list of attribute names that should be rendered in the editing
     * pipeline even though they would normally be filtered out by unsafe attribute detection mechanisms.
     * @returns Created element.
     */
    createEditableElement(name: string, attributes?: ViewElementAttributes, options?: {
        renderUnsafeAttributes?: Array<string>;
    }): ViewEditableElement;
    /**
     * Creates a new {@link module:engine/view/emptyelement~ViewEmptyElement}.
     *
     * ```ts
     * writer.createEmptyElement( 'img' );
     * writer.createEmptyElement( 'img', { id: 'foo-1234' } );
     * ```
     *
     * @param name Name of the element.
     * @param attributes Elements attributes.
     * @param options Element's options.
     * @param options.renderUnsafeAttributes A list of attribute names that should be rendered in the editing
     * pipeline even though they would normally be filtered out by unsafe attribute detection mechanisms.
     * @returns Created element.
     */
    createEmptyElement(name: string, attributes?: ViewElementAttributes, options?: {
        renderUnsafeAttributes?: Array<string>;
    }): ViewEmptyElement;
    /**
     * Creates a new {@link module:engine/view/uielement~ViewUIElement}.
     *
     * ```ts
     * writer.createUIElement( 'span' );
     * writer.createUIElement( 'span', { id: 'foo-1234' } );
     * ```
     *
     * A custom render function can be provided as the third parameter:
     *
     * ```ts
     * writer.createUIElement( 'span', null, function( domDocument ) {
     * 	const domElement = this.toDomElement( domDocument );
     * 	domElement.innerHTML = '<b>this is ui element</b>';
     *
     * 	return domElement;
     * } );
     * ```
     *
     * Unlike {@link #createRawElement raw elements}, UI elements are by no means editor content, for instance,
     * they are ignored by the editor selection system.
     *
     * You should not use UI elements as data containers. Check out {@link #createRawElement} instead.
     *
     * @param name The name of the element.
     * @param attributes Element attributes.
     * @param renderFunction A custom render function.
     * @returns The created element.
     */
    createUIElement(name: string, attributes?: ViewElementAttributes, renderFunction?: (this: ViewUIElement, domDocument: DomDocument, domConverter: ViewDomConverter) => DomElement): ViewUIElement;
    /**
     * Creates a new {@link module:engine/view/rawelement~ViewRawElement}.
     *
     * ```ts
     * writer.createRawElement( 'span', { id: 'foo-1234' }, function( domElement ) {
     * 	domElement.innerHTML = '<b>This is the raw content of the raw element.</b>';
     * } );
     * ```
     *
     * Raw elements work as data containers ("wrappers", "sandboxes") but their children are not managed or
     * even recognized by the editor. This encapsulation allows integrations to maintain custom DOM structures
     * in the editor content without, for instance, worrying about compatibility with other editor features.
     * Raw elements are a perfect tool for integration with external frameworks and data sources.
     *
     * Unlike {@link #createUIElement UI elements}, raw elements act like "real" editor content (similar to
     * {@link module:engine/view/containerelement~ViewContainerElement} or {@link module:engine/view/emptyelement~ViewEmptyElement}),
     * and they are considered by the editor selection.
     *
     * You should not use raw elements to render the UI in the editor content. Check out {@link #createUIElement `#createUIElement()`}
     * instead.
     *
     * @param name The name of the element.
     * @param attributes Element attributes.
     * @param renderFunction A custom render function.
     * @param options Element's options.
     * @param options.renderUnsafeAttributes A list of attribute names that should be rendered in the editing
     * pipeline even though they would normally be filtered out by unsafe attribute detection mechanisms.
     * @returns The created element.
     */
    createRawElement(name: string, attributes?: ViewElementAttributes, renderFunction?: (domElement: DomElement, domConverter: ViewDomConverter) => void, options?: {
        renderUnsafeAttributes?: Array<string>;
    }): ViewRawElement;
    /**
     * Adds or overwrites the element's attribute with a specified key and value.
     *
     * ```ts
     * writer.setAttribute( 'href', 'http://ckeditor.com', linkElement );
     * ```
     *
     * @param key The attribute key.
     * @param value The attribute value.
     * @param element The element to set an attribute on.
     */
    setAttribute(key: string, value: unknown, element: ViewElement): void;
    /**
     * Adds or overwrites the element's attribute with a specified key and value.
     * Note that for tokenized attributes it allows the `reset` parameter to specify if the previous
     * attribute value should be overwritten or a new token (class name, style property) should be added.
     *
     * ```ts
     * writer.setAttribute( 'href', 'http://ckeditor.com', linkElement );
     * writer.setAttribute( 'class', 'foo', false, element );
     * ```
     *
     * @param key The attribute key.
     * @param value The attribute value.
     * @param overwrite Whether tokenized attribute should overwrite the attribute value or just add a token.
     * @param element The element to set an attribute on.
     */
    setAttribute(key: string, value: unknown, overwrite: boolean, element: ViewElement): void;
    /**
     * Removes attribute from the element.
     *
     * ```ts
     * writer.removeAttribute( 'href', linkElement );
     * ```
     *
     * @param key Attribute key.
     * @param element The element to remove an attribute of.
     */
    removeAttribute(key: string, element: ViewElement): void;
    /**
     * Removes specified tokens from an attribute value (for example class names, style properties).
     * If resulting attribute become empty, the whole attribute is removed.
     *
     * ```ts
     * writer.removeAttribute( 'class', 'foo', linkElement );
     * ```
     *
     * @param key Attribute key.
     * @param tokens Tokens to partly remove from attribute value. For example class names or style property names.
     * @param element The element to remove an attribute of.
     */
    removeAttribute(key: string, tokens: ArrayOrItem<string>, element: ViewElement): void;
    /**
     * Adds specified class to the element.
     *
     * ```ts
     * writer.addClass( 'foo', linkElement );
     * writer.addClass( [ 'foo', 'bar' ], linkElement );
     * ```
     */
    addClass(className: string | Array<string>, element: ViewElement): void;
    /**
     * Removes specified class from the element.
     *
     * ```ts
     * writer.removeClass( 'foo', linkElement );
     * writer.removeClass( [ 'foo', 'bar' ], linkElement );
     * ```
     */
    removeClass(className: string | Array<string>, element: ViewElement): void;
    /**
     * Adds style to the element.
     *
     * ```ts
     * writer.setStyle( 'color', 'red', element );
     * ```
     *
     * **Note**: The passed style can be normalized if
     * {@link module:engine/controller/datacontroller~DataController#addStyleProcessorRules a particular style processor rule is enabled}.
     * See {@link module:engine/view/stylesmap~StylesMap#set `StylesMap#set()`} for details.
     *
     * @label KEY_VALUE
     * @param property Property name.
     * @param value Value to set.
     * @param element Element to set styles on.
     */
    setStyle(property: string, value: string, element: ViewElement): void;
    /**
     * Adds many styles to the element.
     *
     * ```ts
     * writer.setStyle( {
     * 	color: 'red',
     * 	position: 'fixed'
     * }, element );
     * ```
     *
     * **Note**: The passed style can be normalized if
     * {@link module:engine/controller/datacontroller~DataController#addStyleProcessorRules a particular style processor rule is enabled}.
     * See {@link module:engine/view/stylesmap~StylesMap#set `StylesMap#set()`} for details.
     *
     * @label OBJECT
     * @param property Object with key - value pairs.
     * @param element Element to set styles on.
     */
    setStyle(property: Record<string, string>, element: ViewElement): void;
    /**
     * Removes specified style from the element.
     *
     * ```ts
     * writer.removeStyle( 'color', element ); // Removes 'color' style.
     * writer.removeStyle( [ 'color', 'border-top' ], element ); // Removes both 'color' and 'border-top' styles.
     * ```
     *
     * **Note**: This method can work with normalized style names if
     * {@link module:engine/controller/datacontroller~DataController#addStyleProcessorRules a particular style processor rule is enabled}.
     * See {@link module:engine/view/stylesmap~StylesMap#remove `StylesMap#remove()`} for details.
     */
    removeStyle(property: string | Array<string>, element: ViewElement): void;
    /**
     * Sets a custom property on element. Unlike attributes, custom properties are not rendered to the DOM,
     * so they can be used to add special data to elements.
     */
    setCustomProperty(key: string | symbol, value: unknown, element: ViewElement | ViewDocumentFragment): void;
    /**
     * Removes a custom property stored under the given key.
     *
     * @returns Returns true if property was removed.
     */
    removeCustomProperty(key: string | symbol, element: ViewElement | ViewDocumentFragment): boolean;
    /**
     * Breaks attribute elements at the provided position or at the boundaries of a provided range. It breaks attribute elements
     * up to their first ancestor that is a container element.
     *
     * In following examples `<p>` is a container, `<b>` and `<u>` are attribute elements:
     *
     * ```html
     * <p>foo<b><u>bar{}</u></b></p> -> <p>foo<b><u>bar</u></b>[]</p>
     * <p>foo<b><u>{}bar</u></b></p> -> <p>foo{}<b><u>bar</u></b></p>
     * <p>foo<b><u>b{}ar</u></b></p> -> <p>foo<b><u>b</u></b>[]<b><u>ar</u></b></p>
     * <p><b>fo{o</b><u>ba}r</u></p> -> <p><b>fo</b><b>o</b><u>ba</u><u>r</u></b></p>
     * ```
     *
     * **Note:** {@link module:engine/view/documentfragment~ViewDocumentFragment DocumentFragment} is treated like a container.
     *
     * **Note:** The difference between {@link module:engine/view/downcastwriter~ViewDowncastWriter#breakAttributes breakAttributes()} and
     * {@link module:engine/view/downcastwriter~ViewDowncastWriter#breakContainer breakContainer()} is that `breakAttributes()` breaks all
     * {@link module:engine/view/attributeelement~ViewAttributeElement attribute elements} that are ancestors of a given `position`,
     * up to the first encountered {@link module:engine/view/containerelement~ViewContainerElement container element}.
     * `breakContainer()` assumes that a given `position` is directly in the container element and breaks that container element.
     *
     * Throws the `view-writer-invalid-range-container` {@link module:utils/ckeditorerror~CKEditorError CKEditorError}
     * when the {@link module:engine/view/range~ViewRange#start start}
     * and {@link module:engine/view/range~ViewRange#end end} positions of a passed range are not placed inside same parent container.
     *
     * Throws the `view-writer-cannot-break-empty-element` {@link module:utils/ckeditorerror~CKEditorError CKEditorError}
     * when trying to break attributes inside an {@link module:engine/view/emptyelement~ViewEmptyElement ViewEmptyElement}.
     *
     * Throws the `view-writer-cannot-break-ui-element` {@link module:utils/ckeditorerror~CKEditorError CKEditorError}
     * when trying to break attributes inside a {@link module:engine/view/uielement~ViewUIElement UIElement}.
     *
     * @see module:engine/view/attributeelement~ViewAttributeElement
     * @see module:engine/view/containerelement~ViewContainerElement
     * @see module:engine/view/downcastwriter~ViewDowncastWriter#breakContainer
     * @param positionOrRange The position where to break attribute elements.
     * @returns The new position or range, after breaking the attribute elements.
     */
    breakAttributes(positionOrRange: ViewPosition | ViewRange): ViewPosition | ViewRange;
    /**
     * Breaks a {@link module:engine/view/containerelement~ViewContainerElement container view element} into two, at the given position.
     * The position has to be directly inside the container element and cannot be in the root. It does not break the conrainer view element
     * if the position is at the beginning or at the end of its parent element.
     *
     * ```html
     * <p>foo^bar</p> -> <p>foo</p><p>bar</p>
     * <div><p>foo</p>^<p>bar</p></div> -> <div><p>foo</p></div><div><p>bar</p></div>
     * <p>^foobar</p> -> ^<p>foobar</p>
     * <p>foobar^</p> -> <p>foobar</p>^
     * ```
     *
     * **Note:** The difference between {@link module:engine/view/downcastwriter~ViewDowncastWriter#breakAttributes breakAttributes()} and
     * {@link module:engine/view/downcastwriter~ViewDowncastWriter#breakContainer breakContainer()} is that `breakAttributes()` breaks all
     * {@link module:engine/view/attributeelement~ViewAttributeElement attribute elements} that are ancestors of a given `position`,
     * up to the first encountered {@link module:engine/view/containerelement~ViewContainerElement container element}.
     * `breakContainer()` assumes that the given `position` is directly in the container element and breaks that container element.
     *
     * @see module:engine/view/attributeelement~ViewAttributeElement
     * @see module:engine/view/containerelement~ViewContainerElement
     * @see module:engine/view/downcastwriter~ViewDowncastWriter#breakAttributes
     * @param position The position where to break the element.
     * @returns The position between broken elements. If an element has not been broken,
     * the returned position is placed either before or after it.
     */
    breakContainer(position: ViewPosition): ViewPosition;
    /**
     * Merges {@link module:engine/view/attributeelement~ViewAttributeElement attribute elements}. It also merges text nodes if needed.
     * Only {@link module:engine/view/attributeelement~ViewAttributeElement#isSimilar similar} attribute elements can be merged.
     *
     * In following examples `<p>` is a container and `<b>` is an attribute element:
     *
     * ```html
     * <p>foo[]bar</p> -> <p>foo{}bar</p>
     * <p><b>foo</b>[]<b>bar</b></p> -> <p><b>foo{}bar</b></p>
     * <p><b foo="bar">a</b>[]<b foo="baz">b</b></p> -> <p><b foo="bar">a</b>[]<b foo="baz">b</b></p>
     * ```
     *
     * It will also take care about empty attributes when merging:
     *
     * ```html
     * <p><b>[]</b></p> -> <p>[]</p>
     * <p><b>foo</b><i>[]</i><b>bar</b></p> -> <p><b>foo{}bar</b></p>
     * ```
     *
     * **Note:** Difference between {@link module:engine/view/downcastwriter~ViewDowncastWriter#mergeAttributes mergeAttributes} and
     * {@link module:engine/view/downcastwriter~ViewDowncastWriter#mergeContainers mergeContainers} is that `mergeAttributes` merges two
     * {@link module:engine/view/attributeelement~ViewAttributeElement attribute elements} or
     * {@link module:engine/view/text~ViewText text nodes} while `mergeContainer` merges two
     * {@link module:engine/view/containerelement~ViewContainerElement container elements}.
     *
     * @see module:engine/view/attributeelement~ViewAttributeElement
     * @see module:engine/view/containerelement~ViewContainerElement
     * @see module:engine/view/downcastwriter~ViewDowncastWriter#mergeContainers
     * @param position Merge position.
     * @returns Position after merge.
     */
    mergeAttributes(position: ViewPosition): ViewPosition;
    /**
     * Merges two {@link module:engine/view/containerelement~ViewContainerElement container elements} that are
     * before and after given position. Precisely, the element after the position is removed and it's contents are
     * moved to element before the position.
     *
     * ```html
     * <p>foo</p>^<p>bar</p> -> <p>foo^bar</p>
     * <div>foo</div>^<p>bar</p> -> <div>foo^bar</div>
     * ```
     *
     * **Note:** Difference between {@link module:engine/view/downcastwriter~ViewDowncastWriter#mergeAttributes mergeAttributes} and
     * {@link module:engine/view/downcastwriter~ViewDowncastWriter#mergeContainers mergeContainers} is that `mergeAttributes` merges two
     * {@link module:engine/view/attributeelement~ViewAttributeElement attribute elements} or
     * {@link module:engine/view/text~ViewText text nodes} while `mergeContainer` merges two
     * {@link module:engine/view/containerelement~ViewContainerElement container elements}.
     *
     * @see module:engine/view/attributeelement~ViewAttributeElement
     * @see module:engine/view/containerelement~ViewContainerElement
     * @see module:engine/view/downcastwriter~ViewDowncastWriter#mergeAttributes
     * @param position Merge position.
     * @returns Position after merge.
     */
    mergeContainers(position: ViewPosition): ViewPosition;
    /**
     * Inserts a node or nodes at specified position. Takes care about breaking attributes before insertion
     * and merging them afterwards.
     *
     * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-insert-invalid-node` when nodes to insert
     * contains instances that are not {@link module:engine/view/text~ViewText Texts},
     * {@link module:engine/view/attributeelement~ViewAttributeElement ViewAttributeElements},
     * {@link module:engine/view/containerelement~ViewContainerElement ViewContainerElements},
     * {@link module:engine/view/emptyelement~ViewEmptyElement ViewEmptyElements},
     * {@link module:engine/view/rawelement~ViewRawElement RawElements} or
     * {@link module:engine/view/uielement~ViewUIElement UIElements}.
     *
     * @param position Insertion position.
     * @param nodes Node or nodes to insert.
     * @returns Range around inserted nodes.
     */
    insert(position: ViewPosition, nodes: ViewNode | Iterable<ViewNode>): ViewRange;
    /**
     * Removes provided range from the container.
     *
     * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-invalid-range-container` when
     * {@link module:engine/view/range~ViewRange#start start} and {@link module:engine/view/range~ViewRange#end end}
     * positions are not placed inside same parent container.
     *
     * @param rangeOrItem Range to remove from container
     * or an {@link module:engine/view/item~ViewItem item} to remove. If range is provided, after removing, it will be updated
     * to a collapsed range showing the new position.
     * @returns Document fragment containing removed nodes.
     */
    remove(rangeOrItem: ViewRange | ViewItem): ViewDocumentFragment;
    /**
     * Removes matching elements from given range.
     *
     * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-invalid-range-container` when
     * {@link module:engine/view/range~ViewRange#start start} and {@link module:engine/view/range~ViewRange#end end}
     * positions are not placed inside same parent container.
     *
     * @param range Range to clear.
     * @param element Element to remove.
     */
    clear(range: ViewRange, element: ViewElement): void;
    /**
     * Moves nodes from provided range to target position.
     *
     * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-invalid-range-container` when
     * {@link module:engine/view/range~ViewRange#start start} and {@link module:engine/view/range~ViewRange#end end}
     * positions are not placed inside same parent container.
     *
     * @param sourceRange Range containing nodes to move.
     * @param targetPosition Position to insert.
     * @returns Range in target container. Inserted nodes are placed between
     * {@link module:engine/view/range~ViewRange#start start} and {@link module:engine/view/range~ViewRange#end end} positions.
     */
    move(sourceRange: ViewRange, targetPosition: ViewPosition): ViewRange;
    /**
     * Wraps elements within range with provided {@link module:engine/view/attributeelement~ViewAttributeElement ViewAttributeElement}.
     * If a collapsed range is provided, it will be wrapped only if it is equal to view selection.
     *
     * If a collapsed range was passed and is same as selection, the selection
     * will be moved to the inside of the wrapped attribute element.
     *
     * Throws {@link module:utils/ckeditorerror~CKEditorError} `view-writer-invalid-range-container`
     * when {@link module:engine/view/range~ViewRange#start}
     * and {@link module:engine/view/range~ViewRange#end} positions are not placed inside same parent container.
     *
     * Throws {@link module:utils/ckeditorerror~CKEditorError} `view-writer-wrap-invalid-attribute` when passed attribute element is not
     * an instance of {@link module:engine/view/attributeelement~ViewAttributeElement ViewAttributeElement}.
     *
     * Throws {@link module:utils/ckeditorerror~CKEditorError} `view-writer-wrap-nonselection-collapsed-range` when passed range
     * is collapsed and different than view selection.
     *
     * @param range Range to wrap.
     * @param attribute Attribute element to use as wrapper.
     * @returns range Range after wrapping, spanning over wrapping attribute element.
     */
    wrap(range: ViewRange, attribute: ViewAttributeElement): ViewRange;
    /**
     * Unwraps nodes within provided range from attribute element.
     *
     * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-invalid-range-container` when
     * {@link module:engine/view/range~ViewRange#start start} and {@link module:engine/view/range~ViewRange#end end}
     * positions are not placed inside same parent container.
     */
    unwrap(range: ViewRange, attribute: ViewAttributeElement): ViewRange;
    /**
     * Renames element by creating a copy of renamed element but with changed name and then moving contents of the
     * old element to the new one. Keep in mind that this will invalidate all {@link module:engine/view/position~ViewPosition positions}
     * which has renamed element as {@link module:engine/view/position~ViewPosition#parent a parent}.
     *
     * New element has to be created because `Element#tagName` property in DOM is readonly.
     *
     * Since this function creates a new element and removes the given one, the new element is returned to keep reference.
     *
     * @param newName New name for element.
     * @param viewElement Element to be renamed.
     * @returns Element created due to rename.
     */
    rename(newName: string, viewElement: ViewContainerElement): ViewContainerElement;
    /**
     * Cleans up memory by removing obsolete cloned elements group from the writer.
     *
     * Should be used whenever all {@link module:engine/view/attributeelement~ViewAttributeElement attribute elements}
     * with the same {@link module:engine/view/attributeelement~ViewAttributeElement#id id} are going to be removed from the view and
     * the group will no longer be needed.
     *
     * Cloned elements group are not removed automatically in case if the group is still needed after all its elements
     * were removed from the view.
     *
     * Keep in mind that group names are equal to the `id` property of the attribute element.
     *
     * @param groupName Name of the group to clear.
     */
    clearClonedElementsGroup(groupName: string): void;
    /**
     * Creates position at the given location. The location can be specified as:
     *
     * * a {@link module:engine/view/position~ViewPosition position},
     * * parent element and offset (offset defaults to `0`),
     * * parent element and `'end'` (sets position at the end of that element),
     * * {@link module:engine/view/item~ViewItem view item} and `'before'` or `'after'` (sets position before or after given view item).
     *
     * This method is a shortcut to other constructors such as:
     *
     * * {@link #createPositionBefore},
     * * {@link #createPositionAfter},
     *
     * @param offset Offset or one of the flags. Used only when the first parameter is a {@link module:engine/view/item~ViewItem view item}.
     */
    createPositionAt(itemOrPosition: ViewItem | ViewPosition, offset?: ViewPositionOffset): ViewPosition;
    /**
     * Creates a new position after given view item.
     *
     * @param item View item after which the position should be located.
     */
    createPositionAfter(item: ViewItem): ViewPosition;
    /**
     * Creates a new position before given view item.
     *
     * @param item View item before which the position should be located.
     */
    createPositionBefore(item: ViewItem): ViewPosition;
    /**
     * Creates a range spanning from `start` position to `end` position.
     *
     * **Note:** This factory method creates its own {@link module:engine/view/position~ViewPosition} instances basing on passed values.
     *
     * @param start Start position.
     * @param end End position. If not set, range will be collapsed at `start` position.
     */
    createRange(start: ViewPosition, end?: ViewPosition | null): ViewRange;
    /**
     * Creates a range that starts before given {@link module:engine/view/item~ViewItem view item} and ends after it.
     */
    createRangeOn(item: ViewItem): ViewRange;
    /**
     * Creates a range inside an {@link module:engine/view/element~ViewElement element} which starts before the first child of
     * that element and ends after the last child of that element.
     *
     * @param element Element which is a parent for the range.
     */
    createRangeIn(element: ViewElement | ViewDocumentFragment): ViewRange;
    /**
     * Creates new {@link module:engine/view/selection~ViewSelection} instance.
     *
     * ```ts
     * // Creates collapsed selection at the position of given item and offset.
     * const paragraph = writer.createContainerElement( 'p' );
     * const selection = writer.createSelection( paragraph, offset );
     *
     * // Creates a range inside an {@link module:engine/view/element~ViewElement element} which starts before the
     * // first child of that element and ends after the last child of that element.
     * const selection = writer.createSelection( paragraph, 'in' );
     *
     * // Creates a range on an {@link module:engine/view/item~ViewItem item} which starts before the item and ends
     * // just after the item.
     * const selection = writer.createSelection( paragraph, 'on' );
     * ```
     *
     * `Selection`'s constructor allow passing additional options (`backward`, `fake` and `label`) as the last argument.
     *
     * ```ts
     * // Creates backward selection.
     * const selection = writer.createSelection( element, 'in', { backward: true } );
     * ```
     *
     * Fake selection does not render as browser native selection over selected elements and is hidden to the user.
     * This way, no native selection UI artifacts are displayed to the user and selection over elements can be
     * represented in other way, for example by applying proper CSS class.
     *
     * Additionally fake's selection label can be provided. It will be used to describe fake selection in DOM
     * (and be  properly handled by screen readers).
     *
     * ```ts
     * // Creates fake selection with label.
     * const selection = writer.createSelection( element, 'in', { fake: true, label: 'foo' } );
     * ```
     *
     * See also: {@link #createSelection:SELECTABLE `createSelection( selectable, options )`}.
     *
     * @label NODE_OFFSET
     */
    createSelection(selectable: ViewNode, placeOrOffset: ViewPlaceOrOffset, options?: ViewSelectionOptions): ViewSelection;
    /**
     * Creates new {@link module:engine/view/selection~ViewSelection} instance.
     *
     * ```ts
     * // Creates empty selection without ranges.
     * const selection = writer.createSelection();
     *
     * // Creates selection at the given range.
     * const range = writer.createRange( start, end );
     * const selection = writer.createSelection( range );
     *
     * // Creates selection at the given ranges
     * const ranges = [ writer.createRange( start1, end2 ), writer.createRange( star2, end2 ) ];
     * const selection = writer.createSelection( ranges );
     *
     * // Creates selection from the other selection.
     * const otherSelection = writer.createSelection();
     * const selection = writer.createSelection( otherSelection );
     *
     * // Creates selection from the document selection.
     * const selection = writer.createSelection( editor.editing.view.document.selection );
     *
     * // Creates selection at the given position.
     * const position = writer.createPositionFromPath( root, path );
     * const selection = writer.createSelection( position );
     * ```
     *
     * `Selection`'s constructor allow passing additional options (`backward`, `fake` and `label`) as the last argument.
     *
     * ```ts
     * // Creates backward selection.
     * const selection = writer.createSelection( range, { backward: true } );
     * ```
     *
     * Fake selection does not render as browser native selection over selected elements and is hidden to the user.
     * This way, no native selection UI artifacts are displayed to the user and selection over elements can be
     * represented in other way, for example by applying proper CSS class.
     *
     * Additionally fake's selection label can be provided. It will be used to describe fake selection in DOM
     * (and be  properly handled by screen readers).
     *
     * ```ts
     * // Creates fake selection with label.
     * const selection = writer.createSelection( range, { fake: true, label: 'foo' } );
     * ```
     *
     * See also: {@link #createSelection:NODE_OFFSET `createSelection( node, placeOrOffset, options )`}.
     *
     * @label SELECTABLE
     */
    createSelection(selectable?: Exclude<ViewSelectable, ViewNode>, option?: ViewSelectionOptions): ViewSelection;
    /**
     * Creates placeholders for child elements of the {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToStructure
     * `elementToStructure()`} conversion helper.
     *
     * ```ts
     * const viewSlot = conversionApi.writer.createSlot();
     * const viewPosition = conversionApi.writer.createPositionAt( viewElement, 0 );
     *
     * conversionApi.writer.insert( viewPosition, viewSlot );
     * ```
     *
     * It could be filtered down to a specific subset of children (only `<foo>` model elements in this case):
     *
     * ```ts
     * const viewSlot = conversionApi.writer.createSlot( node => node.is( 'element', 'foo' ) );
     * const viewPosition = conversionApi.writer.createPositionAt( viewElement, 0 );
     *
     * conversionApi.writer.insert( viewPosition, viewSlot );
     * ```
     *
     * While providing a filtered slot, make sure to provide slots for all child nodes. A single node cannot be downcasted into
     * multiple slots.
     *
     * **Note**: You should not change the order of nodes. View elements should be in the same order as model nodes.
     *
     * @param modeOrFilter The filter for child nodes.
     * @returns The slot element to be placed in to the view structure while processing
     * {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToStructure `elementToStructure()`}.
     */
    createSlot(modeOrFilter?: 'children' | DowncastSlotFilter): ViewElement;
    /**
     * Registers a slot factory.
     *
     * @internal
     * @param slotFactory The slot factory.
     */
    _registerSlotFactory(slotFactory: (writer: ViewDowncastWriter, modeOrFilter: 'children' | DowncastSlotFilter) => ViewElement): void;
    /**
     * Clears the registered slot factory.
     *
     * @internal
     */
    _clearSlotFactory(): void;
    /**
     * Inserts a node or nodes at the specified position. Takes care of breaking attributes before insertion
     * and merging them afterwards if requested by the breakAttributes param.
     *
     * @param position Insertion position.
     * @param nodes Node or nodes to insert.
     * @param breakAttributes Whether attributes should be broken.
     * @returns Range around inserted nodes.
     */
    private _insertNodes;
    /**
     * Wraps children with provided `wrapElement`. Only children contained in `parent` element between
     * `startOffset` and `endOffset` will be wrapped.
     */
    private _wrapChildren;
    /**
     * Unwraps children from provided `unwrapElement`. Only children contained in `parent` element between
     * `startOffset` and `endOffset` will be unwrapped.
     */
    private _unwrapChildren;
    /**
     * Helper function for `view.writer.wrap`. Wraps range with provided attribute element.
     * This method will also merge newly added attribute element with its siblings whenever possible.
     *
     * Throws {@link module:utils/ckeditorerror~CKEditorError} `view-writer-wrap-invalid-attribute` when passed attribute element is not
     * an instance of {@link module:engine/view/attributeelement~ViewAttributeElement ViewAttributeElement}.
     *
     * @returns New range after wrapping, spanning over wrapping attribute element.
     */
    private _wrapRange;
    /**
     * Helper function for {@link #wrap}. Wraps position with provided attribute element.
     * This method will also merge newly added attribute element with its siblings whenever possible.
     *
     * Throws {@link module:utils/ckeditorerror~CKEditorError} `view-writer-wrap-invalid-attribute` when passed attribute element is not
     * an instance of {@link module:engine/view/attributeelement~ViewAttributeElement ViewAttributeElement}.
     *
     * @returns New position after wrapping.
     */
    private _wrapPosition;
    /**
     * Helper function used by other `ViewDowncastWriter` methods. Breaks attribute elements at the boundaries of given range.
     *
     * @param range Range which `start` and `end` positions will be used to break attributes.
     * @param forceSplitText If set to `true`, will break text nodes even if they are directly in container element.
     * This behavior will result in incorrect view state, but is needed by other view writing methods which then fixes view state.
     * @returns New range with located at break positions.
     */
    private _breakAttributesRange;
    /**
     * Helper function used by other `ViewDowncastWriter` methods. Breaks attribute elements at given position.
     *
     * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-cannot-break-empty-element` when break position
     * is placed inside {@link module:engine/view/emptyelement~ViewEmptyElement ViewEmptyElement}.
     *
     * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-cannot-break-ui-element` when break position
     * is placed inside {@link module:engine/view/uielement~ViewUIElement UIElement}.
     *
     * @param position Position where to break attributes.
     * @param forceSplitText If set to `true`, will break text nodes even if they are directly in container element.
     * This behavior will result in incorrect view state, but is needed by other view writing methods which then fixes view state.
     * @returns New position after breaking the attributes.
     */
    private _breakAttributes;
    /**
     * Stores the information that an {@link module:engine/view/attributeelement~ViewAttributeElement attribute element} was
     * added to the tree. Saves the reference to the group in the given element and updates the group, so other elements
     * from the group now keep a reference to the given attribute element.
     *
     * The clones group can be obtained using {@link module:engine/view/attributeelement~ViewAttributeElement#getElementsWithSameId}.
     *
     * Does nothing if added element has no {@link module:engine/view/attributeelement~ViewAttributeElement#id id}.
     *
     * @param element Attribute element to save.
     */
    private _addToClonedElementsGroup;
    /**
     * Removes all the information about the given {@link module:engine/view/attributeelement~ViewAttributeElement attribute element}
     * from its clones group.
     *
     * Keep in mind, that the element will still keep a reference to the group (but the group will not keep a reference to it).
     * This allows to reference the whole group even if the element was already removed from the tree.
     *
     * Does nothing if the element has no {@link module:engine/view/attributeelement~ViewAttributeElement#id id}.
     *
     * @param element Attribute element to remove.
     */
    private _removeFromClonedElementsGroup;
}
export {};
