/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/observer/domeventdata
 */
import { extend } from 'es-toolkit/compat';
/**
 * Information about a DOM event in context of the {@link module:engine/view/document~ViewDocument}.
 * It wraps the native event, which usually should not be used as the wrapper contains
 * additional data (like key code for keyboard events).
 *
 * @typeParam TEvent The type of DOM Event that this class represents.
 */
export class ViewDocumentDomEventData {
    /**
     * Instance of the view controller.
     */
    view;
    /**
     * The instance of the document.
     */
    document;
    /**
     * The DOM event.
     */
    domEvent;
    /**
     * The DOM target.
     */
    domTarget;
    /**
     * @param view The instance of the view controller.
     * @param domEvent The DOM event.
     * @param additionalData Additional properties that the instance should contain.
     */
    constructor(view, domEvent, additionalData) {
        this.view = view;
        this.document = view.document;
        this.domEvent = domEvent;
        this.domTarget = domEvent.target;
        extend(this, additionalData);
    }
    /**
     * The tree view element representing the target.
     */
    get target() {
        return this.view.domConverter.mapDomToView(this.domTarget);
    }
    /**
     * Prevents the native's event default action.
     */
    preventDefault() {
        this.domEvent.preventDefault();
    }
    /**
     * Stops native event propagation.
     */
    stopPropagation() {
        this.domEvent.stopPropagation();
    }
}
