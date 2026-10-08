/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { ViewDocumentDomEventData, Observer, type BubblingEvent, type ViewDocumentSelection, type ViewSelection, type EditingView } from '@ckeditor/ckeditor5-engine';
/**
 * Delete observer introduces the {@link module:engine/view/document~ViewDocument#event:delete} event.
 *
 * @internal
 */
export declare class DeleteObserver extends Observer {
    /**
     * @inheritDoc
     */
    constructor(view: EditingView);
    /**
     * @inheritDoc
     */
    observe(): void;
    /**
     * @inheritDoc
     */
    stopObserving(): void;
}
/**
 * Event fired when the user tries to delete content (e.g. presses <kbd>Delete</kbd> or <kbd>Backspace</kbd>).
 *
 * Note: This event is fired by the {@link module:typing/deleteobserver~DeleteObserver delete observer}
 * (usually registered by the {@link module:typing/delete~Delete delete feature}).
 *
 * @eventName module:engine/view/document~ViewDocument#delete
 * @param data The event data.
 */
export type ViewDocumentDeleteEvent = BubblingEvent<{
    name: 'delete';
    args: [data: DeleteEventData];
}>;
export interface DeleteEventData extends ViewDocumentDomEventData<InputEvent> {
    /**
     * The direction in which the deletion should happen.
     */
    direction: 'backward' | 'forward';
    /**
     * The "amount" of content that should be deleted.
     */
    unit: 'selection' | 'codePoint' | 'character' | 'word';
    /**
     * A number describing which subsequent delete event it is without the key being released.
     * If it's 2 or more it means that the key was pressed and hold.
     */
    sequence: number;
    /**
     * View selection which content should be removed. If not set,
     * current selection should be used.
     */
    selectionToRemove?: ViewSelection | ViewDocumentSelection;
}
