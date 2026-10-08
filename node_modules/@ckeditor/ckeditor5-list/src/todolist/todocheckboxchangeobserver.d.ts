/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/todolist/todocheckboxchangeobserver
 */
import { DomEventObserver, type ViewDocumentDomEventData } from 'ckeditor5/src/engine.js';
/**
 * Observes all to-do list checkboxes state changes.
 *
 * Note that this observer is not available by default. To make it available it needs to be added to
 * {@link module:engine/view/view~EditingView} by {@link module:engine/view/view~EditingView#addObserver} method.
 *
 * @internal
 */
export declare class TodoCheckboxChangeObserver extends DomEventObserver<'change'> {
    /**
     * @inheritDoc
     */
    readonly domEventType: readonly ["change"];
    /**
     * @inheritDoc
     */
    onDomEvent(domEvent: Event): void;
}
/**
 * Fired when the to-do list checkbox is toggled.
 *
 * Introduced by {@link module:list/todolist/todocheckboxchangeobserver~TodoCheckboxChangeObserver}.
 *
 * Note that this event is not available by default. To make it available,
 * {@link module:list/todolist/todocheckboxchangeobserver~TodoCheckboxChangeObserver}
 * needs to be added to {@link module:engine/view/view~EditingView} by the {@link module:engine/view/view~EditingView#addObserver} method.
 *
 * @see module:list/todolist/todocheckboxchangeobserver~TodoCheckboxChangeObserver
 * @eventName module:engine/view/document~ViewDocument#todoCheckboxChange
 * @param data The event data.
 */
export type ViewDocumentTodoCheckboxChangeEvent = {
    name: 'todoCheckboxChange';
    args: [data: ViewDocumentDomEventData<Event>];
};
