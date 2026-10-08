/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/observer/selectionobserver
 */
import { Observer } from './observer.js';
import { MutationObserver } from './mutationobserver.js';
import { FocusObserver } from './focusobserver.js';
import type { EditingView } from '../view.js';
import type { ViewDocumentSelection } from '../documentselection.js';
import type { ViewDomConverter } from '../domconverter.js';
import type { ViewSelection } from '../selection.js';
type DomSelection = globalThis.Selection;
/**
 * Selection observer class observes selection changes in the document. If a selection changes on the document this
 * observer checks if the DOM selection is different from the {@link module:engine/view/document~ViewDocument#selection view selection}.
 * The selection observer fires {@link module:engine/view/document~ViewDocument#event:selectionChange} event only if
 * a selection change was the only change in the document and the DOM selection is different from the view selection.
 *
 * This observer also manages the {@link module:engine/view/document~ViewDocument#isSelecting} property of the view document.
 *
 * Note that this observer is attached by the {@link module:engine/view/view~EditingView} and is available by default.
 */
export declare class SelectionObserver extends Observer {
    /**
     * Instance of the mutation observer. Selection observer calls
     * {@link module:engine/view/observer/mutationobserver~MutationObserver#flush} to ensure that the mutations will be handled
     * before the {@link module:engine/view/document~ViewDocument#event:selectionChange} event is fired.
     */
    readonly mutationObserver: MutationObserver;
    /**
     * Instance of the focus observer. Focus observer calls
     * {@link module:engine/view/observer/focusobserver~FocusObserver#flush} to mark the latest focus change as complete.
     */
    readonly focusObserver: FocusObserver;
    /**
     * Reference to the view {@link module:engine/view/documentselection~ViewDocumentSelection} object used to compare
     * new selection with it.
     */
    readonly selection: ViewDocumentSelection;
    /**
     * Reference to the {@link module:engine/view/view~EditingView#domConverter}.
     */
    readonly domConverter: ViewDomConverter;
    /**
     * A set of documents which have added `selectionchange` listener to avoid adding a listener twice to the same
     * document.
     */
    private readonly _documents;
    /**
     * Fires debounced event `selectionChangeDone`. It uses `es-toolkit#debounce` method to delay function call.
     */
    private readonly _fireSelectionChangeDoneDebounced;
    /**
     * When called, starts clearing the {@link #_loopbackCounter} counter in time intervals. When the number of selection
     * changes exceeds a certain limit within the interval of time, the observer will not fire `selectionChange` but warn about
     * possible infinite selection loop.
     */
    private readonly _clearInfiniteLoopInterval;
    /**
     * Unlocks the `isSelecting` state of the view document in case the selection observer did not record this fact
     * correctly (for whatever reason). It is a safeguard (paranoid check), that returns document to the normal state
     * after a certain period of time (debounced, postponed by each selectionchange event).
     */
    private readonly _documentIsSelectingInactivityTimeoutDebounced;
    /**
     * Private property to check if the code does not enter infinite loop.
     */
    private _loopbackCounter;
    /**
     * A set of DOM documents that have a pending selection change.
     * Pending selection change is recorded while selection change event is detected on non focused editable.
     */
    private _pendingSelectionChange;
    constructor(view: EditingView);
    /**
     * @inheritDoc
     */
    observe(domElement: HTMLElement): void;
    /**
     * @inheritDoc
     */
    stopObserving(domElement: HTMLElement): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    private _reportInfiniteLoop;
    /**
     * Selection change listener. {@link module:engine/view/observer/mutationobserver~MutationObserver#flush Flush} mutations, check if
     * a selection changes and fires {@link module:engine/view/document~ViewDocument#event:selectionChange} event on every change
     * and {@link module:engine/view/document~ViewDocument#event:selectionChangeDone} when a selection stop changing.
     *
     * @param domDocument DOM document.
     */
    private _handleSelectionChange;
    /**
     * Clears `SelectionObserver` internal properties connected with preventing infinite loop.
     */
    private _clearInfiniteLoop;
}
/**
 * The value of {@link ~ViewDocumentObserverSelectionChangeEvent} and {@link ~ViewDocumentObserverSelectionChangeDoneEvent} events.
 */
export type ViewDocumentObserverSelectionEventData = {
    /**
     * Old View selection which is {@link module:engine/view/document~ViewDocument#selection}.
     */
    oldSelection: ViewDocumentSelection;
    /**
     * New View selection which is converted DOM selection.
     */
    newSelection: ViewSelection;
    /**
     * Native DOM selection.
     */
    domSelection: DomSelection | null;
};
/**
 * Fired when a selection has changed. This event is fired only when the selection change was the only change that happened
 * in the document, and the old selection is different then the new selection.
 *
 * Introduced by {@link module:engine/view/observer/selectionobserver~SelectionObserver}.
 *
 * Note that because {@link module:engine/view/observer/selectionobserver~SelectionObserver} is attached by the
 * {@link module:engine/view/view~EditingView} this event is available by default.
 *
 * @see module:engine/view/observer/selectionobserver~SelectionObserver
 * @eventName module:engine/view/document~ViewDocument#selectionChange
 */
export type ViewDocumentObserverSelectionChangeEvent = {
    name: 'selectionChange';
    args: [ViewDocumentObserverSelectionEventData];
};
/**
 * Fired when selection stops changing.
 *
 * Introduced by {@link module:engine/view/observer/selectionobserver~SelectionObserver}.
 *
 * Note that because {@link module:engine/view/observer/selectionobserver~SelectionObserver} is attached by the
 * {@link module:engine/view/view~EditingView} this event is available by default.
 *
 * @see module:engine/view/observer/selectionobserver~SelectionObserver
 * @eventName module:engine/view/document~ViewDocument#selectionChangeDone
 */
export type ViewDocumentObserverSelectionChangeDoneEvent = {
    name: 'selectionChangeDone';
    args: [ViewDocumentObserverSelectionEventData];
};
export {};
