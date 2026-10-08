/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/observer/compositionobserver
 */
import { DomEventObserver } from './domeventobserver.js';
import { type EditingView } from '../view.js';
import { type ViewDocumentDomEventData } from './domeventdata.js';
/**
 * {@link module:engine/view/document~ViewDocument#event:compositionstart Compositionstart},
 * {@link module:engine/view/document~ViewDocument#event:compositionupdate compositionupdate} and
 * {@link module:engine/view/document~ViewDocument#event:compositionend compositionend} events observer.
 *
 * Note that this observer is attached by the {@link module:engine/view/view~EditingView} and is available by default.
 */
export declare class CompositionObserver extends DomEventObserver<'compositionstart' | 'compositionupdate' | 'compositionend'> {
    /**
     * @inheritDoc
     */
    readonly domEventType: readonly ["compositionstart", "compositionupdate", "compositionend"];
    /**
     * @inheritDoc
     */
    constructor(view: EditingView);
    /**
     * @inheritDoc
     */
    onDomEvent(domEvent: CompositionEvent): void;
}
export interface ViewDocumentCompositionEventData extends ViewDocumentDomEventData<CompositionEvent> {
    data: string | null;
}
/**
 * Fired when composition starts inside one of the editables.
 *
 * Introduced by {@link module:engine/view/observer/compositionobserver~CompositionObserver}.
 *
 * Note that because {@link module:engine/view/observer/compositionobserver~CompositionObserver} is attached by the
 * {@link module:engine/view/view~EditingView} this event is available by default.
 *
 * @see module:engine/view/observer/compositionobserver~CompositionObserver
 * @eventName module:engine/view/document~ViewDocument#compositionstart
 * @param data Event data.
 */
export type ViewDocumentCompositionStartEvent = {
    name: 'compositionstart';
    args: [data: ViewDocumentCompositionEventData];
};
/**
 * Fired when composition is updated inside one of the editables.
 *
 * Introduced by {@link module:engine/view/observer/compositionobserver~CompositionObserver}.
 *
 * Note that because {@link module:engine/view/observer/compositionobserver~CompositionObserver} is attached by the
 * {@link module:engine/view/view~EditingView} this event is available by default.
 *
 * @see module:engine/view/observer/compositionobserver~CompositionObserver
 * @eventName module:engine/view/document~ViewDocument#compositionupdate
 * @param data Event data.
 */
export type ViewDocumentCompositionUpdateEvent = {
    name: 'compositionupdate';
    args: [data: ViewDocumentCompositionEventData];
};
/**
 * Fired when composition ends inside one of the editables.
 *
 * Introduced by {@link module:engine/view/observer/compositionobserver~CompositionObserver}.
 *
 * Note that because {@link module:engine/view/observer/compositionobserver~CompositionObserver} is attached by the
 * {@link module:engine/view/view~EditingView} this event is available by default.
 *
 * @see module:engine/view/observer/compositionobserver~CompositionObserver
 * @eventName module:engine/view/document~ViewDocument#compositionend
 * @param data Event data.
 */
export type ViewDocumentCompositionEndEvent = {
    name: 'compositionend';
    args: [data: ViewDocumentCompositionEventData];
};
