/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/uielement
 */
import { ViewElement, type ViewElementAttributes } from './element.js';
import { ViewNode } from './node.js';
import { type EditingView } from './view.js';
import { type ViewDocument } from './document.js';
import { type ViewDomConverter } from './domconverter.js';
import { type ViewItem } from './item.js';
type DomDocument = globalThis.Document;
type DomElement = globalThis.HTMLElement;
/**
 * UI element class. It should be used to represent editing UI which needs to be injected into the editing view
 * If possible, you should keep your UI outside the editing view. However, if that is not possible,
 * UI elements can be used.
 *
 * How a UI element is rendered is in your control (you pass a callback to
 * {@link module:engine/view/downcastwriter~ViewDowncastWriter#createUIElement `downcastWriter#createUIElement()`}).
 * The editor will ignore your UI element – the selection cannot be placed in it, it is skipped (invisible) when
 * the user modifies the selection by using arrow keys and the editor does not listen to any mutations which
 * happen inside your UI elements.
 *
 * The limitation is that you cannot convert a model element to a UI element. UI elements need to be
 * created for {@link module:engine/model/markercollection~Marker markers} or as additinal elements
 * inside normal {@link module:engine/view/containerelement~ViewContainerElement container elements}.
 *
 * To create a new UI element use the
 * {@link module:engine/view/downcastwriter~ViewDowncastWriter#createUIElement `downcastWriter#createUIElement()`} method.
 */
export declare class ViewUIElement extends ViewElement {
    /**
     * Creates new instance of UIElement.
     *
     * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-uielement-cannot-add` when third parameter is passed,
     * to inform that usage of UIElement is incorrect (adding child nodes to UIElement is forbidden).
     *
     * @see module:engine/view/downcastwriter~ViewDowncastWriter#createUIElement
     * @internal
     * @param document The document instance to which this element belongs.
     * @param name Node name.
     * @param attrs Collection of attributes.
     * @param children A list of nodes to be inserted into created element.
     */
    constructor(document: ViewDocument, name: string, attrs?: ViewElementAttributes, children?: ViewNode | Iterable<ViewNode>);
    /**
     * Overrides {@link module:engine/view/element~ViewElement#_insertChild} method.
     * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-uielement-cannot-add` to prevent adding any child nodes
     * to UIElement.
     *
     * @internal
     */
    _insertChild(index: number, items: ViewItem | Iterable<ViewItem>): number;
    /**
     * Renders this {@link module:engine/view/uielement~ViewUIElement} to DOM. This method is called by
     * {@link module:engine/view/domconverter~ViewDomConverter}.
     * Do not use inheritance to create custom rendering method, replace `render()` method instead:
     *
     * ```ts
     * const myUIElement = downcastWriter.createUIElement( 'span' );
     * myUIElement.render = function( domDocument, domConverter ) {
     * 	const domElement = this.toDomElement( domDocument );
     *
     * 	domConverter.setContentOf( domElement, '<b>this is ui element</b>' );
     *
     * 	return domElement;
     * };
     * ```
     *
     * If changes in your UI element should trigger some editor UI update you should call
     * the {@link module:ui/editorui/editorui~EditorUI#update `editor.ui.update()`} method
     * after rendering your UI element.
     *
     * @param domConverter Instance of the ViewDomConverter used to optimize the output.
     */
    render(domDocument: DomDocument, domConverter: ViewDomConverter): DomElement;
    /**
     * Creates DOM element based on this view UIElement.
     * Note that each time this method is called new DOM element is created.
     */
    toDomElement(domDocument: DomDocument): DomElement;
    /**
     * Converts `ViewUIElement` instance to plain object and returns it.
     *
     * @returns `ViewUIElement` instance converted to plain object.
     */
    toJSON(): unknown;
}
/**
 * This function injects UI element handling to the given {@link module:engine/view/document~ViewDocument document}.
 *
 * A callback is added to {@link module:engine/view/document~ViewDocument#event:keydown document keydown event}.
 * The callback handles the situation when right arrow key is pressed and selection is collapsed before a UI element.
 * Without this handler, it would be impossible to "jump over" UI element using right arrow key.
 *
 * @param view View controller to which the quirks handling will be injected.
 * @internal
 */
export declare function injectUiElementHandling(view: EditingView): void;
export {};
