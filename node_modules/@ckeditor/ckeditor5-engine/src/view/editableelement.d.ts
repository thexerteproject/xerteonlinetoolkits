/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/editableelement
 */
import { ViewContainerElement } from './containerelement.js';
import type { ViewElementAttributes } from './element.js';
import { type ViewDocument } from './document.js';
import { type ViewNode } from './node.js';
declare const ViewEditableElement_base: import("@ckeditor/ckeditor5-utils").Mixed<typeof ViewContainerElement, import("@ckeditor/ckeditor5-utils").Observable>;
/**
 * Editable element which can be a {@link module:engine/view/rooteditableelement~ViewRootEditableElement root}
 * or nested editable area in the editor.
 *
 * Editable is automatically read-only when its {@link module:engine/view/document~ViewDocument Document} is read-only.
 *
 * The constructor of this class shouldn't be used directly. To create new `ViewEditableElement` use the
 * {@link module:engine/view/downcastwriter~ViewDowncastWriter#createEditableElement `downcastWriter#createEditableElement()`} method.
 */
export declare class ViewEditableElement extends /* #__PURE__ */ ViewEditableElement_base {
    /**
     * Whether the editable is in read-write or read-only mode.
     *
     * @observable
     */
    isReadOnly: boolean;
    /**
     * Whether the editable is focused.
     *
     * This property updates when {@link module:engine/view/document~ViewDocument#isFocused document.isFocused} or view
     * selection is changed.
     *
     * @readonly
     * @observable
     */
    isFocused: boolean;
    /**
     * Placeholder of editable element.
     *
     * ```ts
     * editor.editing.view.document.getRoot( 'main' ).placeholder = 'New placeholder';
     * ```
     *
     * @observable
     */
    placeholder?: string;
    /**
     * Creates an editable element.
     *
     * @see module:engine/view/downcastwriter~ViewDowncastWriter#createEditableElement
     * @internal
     * @param document The document instance to which this element belongs.
     * @param name Node name.
     * @param attributes Collection of attributes.
     * @param children A list of nodes to be inserted into created element.
     */
    constructor(document: ViewDocument, name: string, attributes?: ViewElementAttributes, children?: ViewNode | Iterable<ViewNode>);
    destroy(): void;
    /**
     * Converts `ViewEditableElement` instance to plain object and returns it.
     *
     * @returns `ViewEditableElement` instance converted to plain object.
     */
    toJSON(): unknown;
}
export {};
