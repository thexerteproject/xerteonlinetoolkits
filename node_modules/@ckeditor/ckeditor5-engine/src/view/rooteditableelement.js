/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/rooteditableelement
 */
import { ViewEditableElement } from './editableelement.js';
const rootNameSymbol = Symbol('rootName');
/**
 * Class representing a single root in the data view. A root can be either
 * {@link ~ViewRootEditableElement#isReadOnly editable or read-only},
 * but in both cases it is called "an editable". Roots can contain other {@link module:engine/view/editableelement~ViewEditableElement
 * editable elements} making them "nested editables".
 */
export class ViewRootEditableElement extends ViewEditableElement {
    /**
     * Creates root editable element.
     *
     * @param document The document instance to which this element belongs.
     * @param name Node name.
     */
    constructor(document, name) {
        super(document, name);
        this.rootName = 'main';
    }
    /**
     * Name of this root inside {@link module:engine/view/document~ViewDocument} that is an owner of this root. If no
     * other name is set, `main` name is used.
     *
     * @readonly
     */
    get rootName() {
        return this.getCustomProperty(rootNameSymbol);
    }
    set rootName(rootName) {
        this._setCustomProperty(rootNameSymbol, rootName);
    }
    /**
     * Converts `ViewRootEditableElement` instance to string and returns it.
     *
     * @returns `ViewRootEditableElement` instance converted to string.
     */
    toJSON() {
        return this.rootName;
    }
    /**
     * Overrides old element name and sets new one.
     * This is needed because view roots are created before they are attached to the DOM.
     * The name of the root element is temporary at this stage. It has to be changed when the
     * view root element is attached to the DOM element.
     *
     * @internal
     * @param name The new name of element.
     */
    set _name(name) {
        this.name = name;
    }
}
// The magic of type inference using `is` method is centralized in `TypeCheckable` class.
// Proper overload would interfere with that.
ViewRootEditableElement.prototype.is = function (type, name) {
    if (!name) {
        return type === 'rootElement' || type === 'view:rootElement' ||
            // From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
            type === 'editableElement' || type === 'view:editableElement' ||
            type === 'containerElement' || type === 'view:containerElement' ||
            type === 'element' || type === 'view:element' ||
            type === 'node' || type === 'view:node';
    }
    else {
        return name === this.name && (type === 'rootElement' || type === 'view:rootElement' ||
            // From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
            type === 'editableElement' || type === 'view:editableElement' ||
            type === 'containerElement' || type === 'view:containerElement' ||
            type === 'element' || type === 'view:element');
    }
};
