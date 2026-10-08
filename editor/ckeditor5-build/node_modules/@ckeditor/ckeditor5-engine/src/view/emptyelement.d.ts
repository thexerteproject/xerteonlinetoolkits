/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/emptyelement
 */
import { ViewElement, type ViewElementAttributes } from './element.js';
import { ViewNode } from './node.js';
import { type ViewDocument } from './document.js';
import { type ViewItem } from './item.js';
/**
 * Empty element class. It is used to represent elements that cannot contain any child nodes (for example `<img>` elements).
 *
 * To create a new empty element use the
 * {@link module:engine/view/downcastwriter~ViewDowncastWriter#createEmptyElement `downcastWriter#createEmptyElement()`} method.
 */
export declare class ViewEmptyElement extends ViewElement {
    /**
     * Creates new instance of ViewEmptyElement.
     *
     * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-emptyelement-cannot-add` when third parameter is passed,
     * to inform that usage of ViewEmptyElement is incorrect (adding child nodes to ViewEmptyElement is forbidden).
     *
     * @see module:engine/view/downcastwriter~ViewDowncastWriter#createEmptyElement
     * @internal
     * @param document The document instance to which this element belongs.
     * @param name Node name.
     * @param attributes Collection of attributes.
     * @param children A list of nodes to be inserted into created element.
     */
    constructor(document: ViewDocument, name: string, attributes?: ViewElementAttributes, children?: ViewNode | Iterable<ViewNode>);
    /**
     * Converts `ViewEmptyElement` instance to plain object and returns it.
     *
     * @returns `ViewEmptyElement` instance converted to plain object.
     */
    toJSON(): unknown;
    /**
     * Overrides {@link module:engine/view/element~ViewElement#_insertChild} method.
     * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-emptyelement-cannot-add` to prevent
     * adding any child nodes to ViewEmptyElement.
     *
     * @internal
     */
    _insertChild(index: number, items: ViewItem | Iterable<ViewItem>): number;
}
