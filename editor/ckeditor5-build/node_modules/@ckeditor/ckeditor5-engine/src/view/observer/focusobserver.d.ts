/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/observer/focusobserver
 */
import { DomEventObserver } from './domeventobserver.js';
import { type ViewDocumentDomEventData } from './domeventdata.js';
import { type EditingView } from '../view.js';
/**
 * {@link module:engine/view/document~ViewDocument#event:focus Focus}
 * and {@link module:engine/view/document~ViewDocument#event:blur blur} events observer.
 * Focus observer handle also {@link module:engine/view/rooteditableelement~ViewRootEditableElement#isFocused isFocused} property of the
 * {@link module:engine/view/rooteditableelement~ViewRootEditableElement root elements}.
 *
 * Note that this observer is attached by the {@link module:engine/view/view~EditingView} and is available by default.
 */
export declare class FocusObserver extends DomEventObserver<'focus' | 'blur'> {
    /**
     * Identifier of the timeout currently used by focus listener to delay rendering execution.
     */
    private _renderTimeoutId;
    /**
     * Set to `true` if the document is in the process of setting the focus.
     *
     * The flag is used to indicate that setting the focus is in progress.
     */
    private _isFocusChanging;
    /**
     * @inheritDoc
     */
    readonly domEventType: readonly ["focus", "blur"];
    /**
     * @inheritDoc
     */
    constructor(view: EditingView);
    /**
     * Finishes setting the document focus state.
     */
    flush(): void;
    /**
     * @inheritDoc
     */
    onDomEvent(domEvent: FocusEvent): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * The `focus` event handler.
     */
    private _handleFocus;
    /**
     * The `blur` event handler.
     */
    private _handleBlur;
    /**
     * Clears timeout.
     */
    private _clearTimeout;
}
/**
 * Fired when one of the editables gets focus.
 *
 * Introduced by {@link module:engine/view/observer/focusobserver~FocusObserver}.
 *
 * Note that because {@link module:engine/view/observer/focusobserver~FocusObserver} is attached by the
 * {@link module:engine/view/view~EditingView} this event is available by default.
 *
 * @see module:engine/view/observer/focusobserver~FocusObserver
 * @eventName module:engine/view/document~ViewDocument#focus
 * @param data Event data.
 */
export type ViewDocumentFocusEvent = {
    name: 'focus';
    args: [data: ViewDocumentDomEventData<FocusEvent>];
};
/**
 * Fired when one of the editables loses focus.
 *
 * Introduced by {@link module:engine/view/observer/focusobserver~FocusObserver}.
 *
 * Note that because {@link module:engine/view/observer/focusobserver~FocusObserver} is attached by the
 * {@link module:engine/view/view~EditingView} this event is available by default.
 *
 * @see module:engine/view/observer/focusobserver~FocusObserver
 * @eventName module:engine/view/document~ViewDocument#blur
 * @param data Event data.
 */
export type ViewDocumentBlurEvent = {
    name: 'blur';
    args: [data: ViewDocumentDomEventData<FocusEvent>];
};
