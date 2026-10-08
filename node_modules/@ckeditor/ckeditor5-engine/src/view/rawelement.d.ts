/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/rawelement
 */
import { ViewElement, type ViewElementAttributes } from './element.js';
import { ViewNode } from './node.js';
import { type ViewDocument } from './document.js';
import { type ViewDomConverter } from './domconverter.js';
import { type ViewItem } from './item.js';
type DomElement = globalThis.HTMLElement;
/**
 * The raw element class.
 *
 * The raw elements work as data containers ("wrappers", "sandboxes") but their children are not managed or
 * even recognized by the editor. This encapsulation allows integrations to maintain custom DOM structures
 * in the editor content without, for instance, worrying about compatibility with other editor features.
 * Raw elements are a perfect tool for integration with external frameworks and data sources.
 *
 * Unlike {@link module:engine/view/uielement~ViewUIElement UI elements}, raw elements act like real editor
 * content (similar to {@link module:engine/view/containerelement~ViewContainerElement} or
 * {@link module:engine/view/emptyelement~ViewEmptyElement}), they are considered by the editor selection and
 * {@link module:widget/utils~toWidget they can work as widgets}.
 *
 * To create a new raw element, use the
 * {@link module:engine/view/downcastwriter~ViewDowncastWriter#createRawElement `downcastWriter#createRawElement()`} method.
 */
export declare class ViewRawElement extends ViewElement {
    /**
     * Creates a new instance of a raw element.
     *
     * Throws the `view-rawelement-cannot-add` {@link module:utils/ckeditorerror~CKEditorError CKEditorError} when the `children`
     * parameter is passed to inform that the usage of `ViewRawElement` is incorrect (adding child nodes to `ViewRawElement` is forbidden).
     *
     * @see module:engine/view/downcastwriter~ViewDowncastWriter#createRawElement
     * @internal
     * @param document The document instance to which this element belongs.
     * @param name Node name.
     * @param attrs Collection of attributes.
     * @param children A list of nodes to be inserted into created element.
     */
    constructor(document: ViewDocument, name: string, attrs?: ViewElementAttributes, children?: ViewNode | Iterable<ViewNode>);
    /**
     * Converts `ViewRawElement` instance to plain object and returns it.
     *
     * @returns `ViewRawElement` instance converted to plain object.
     */
    toJSON(): unknown;
    /**
     * Overrides the {@link module:engine/view/element~ViewElement#_insertChild} method.
     * Throws the `view-rawelement-cannot-add` {@link module:utils/ckeditorerror~CKEditorError CKEditorError} to prevent
     * adding any child nodes to a raw element.
     *
     * @internal
     */
    _insertChild(index: number, items: ViewItem | Iterable<ViewItem>): number;
    /**
     * This allows rendering the children of a {@link module:engine/view/rawelement~ViewRawElement} on the DOM level.
     * This method is called by the {@link module:engine/view/domconverter~ViewDomConverter} with the raw DOM element
     * passed as an argument, leaving the number and shape of the children up to the integrator.
     *
     * This method **must be defined** for the raw element to work:
     *
     * ```ts
     * const myRawElement = downcastWriter.createRawElement( 'div' );
     *
     * myRawElement.render = function( domElement, domConverter ) {
     * 	domConverter.setContentOf( domElement, '<b>This is the raw content of myRawElement.</b>' );
     * };
     * ```
     *
     * @param domElement The native DOM element representing the raw view element.
     * @param domConverter Instance of the ViewDomConverter used to optimize the output.
     */
    render(domElement: DomElement, domConverter: ViewDomConverter): void;
}
export {};
