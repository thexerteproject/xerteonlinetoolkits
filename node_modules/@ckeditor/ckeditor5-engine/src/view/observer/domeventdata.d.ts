/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { type ViewDocument } from '../document.js';
import { type ViewElement } from '../element.js';
import { type EditingView } from '../view.js';
/**
 * Information about a DOM event in context of the {@link module:engine/view/document~ViewDocument}.
 * It wraps the native event, which usually should not be used as the wrapper contains
 * additional data (like key code for keyboard events).
 *
 * @typeParam TEvent The type of DOM Event that this class represents.
 */
export declare class ViewDocumentDomEventData<TEvent extends Event = Event> {
    /**
     * Instance of the view controller.
     */
    readonly view: EditingView;
    /**
     * The instance of the document.
     */
    readonly document: ViewDocument;
    /**
     * The DOM event.
     */
    readonly domEvent: TEvent;
    /**
     * The DOM target.
     */
    readonly domTarget: HTMLElement;
    /**
     * @param view The instance of the view controller.
     * @param domEvent The DOM event.
     * @param additionalData Additional properties that the instance should contain.
     */
    constructor(view: EditingView, domEvent: TEvent, additionalData?: object);
    /**
     * The tree view element representing the target.
     */
    get target(): ViewElement;
    /**
     * Prevents the native's event default action.
     */
    preventDefault(): void;
    /**
     * Stops native event propagation.
     */
    stopPropagation(): void;
}
