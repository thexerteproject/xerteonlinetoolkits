/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module enter/enterobserver
 */
import { Observer, ViewDocumentDomEventData, type EditingView, type BubblingEvent } from '@ckeditor/ckeditor5-engine';
/**
 * Enter observer introduces the {@link module:engine/view/document~ViewDocument#event:enter `Document#enter`} event.
 */
export declare class EnterObserver extends Observer {
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
 * Fired when the user presses the <kbd>Enter</kbd> key.
 *
 * Note: This event is fired by the {@link module:enter/enterobserver~EnterObserver observer}
 * (usually registered by the {@link module:enter/enter~Enter Enter feature} and
 * {@link module:enter/shiftenter~ShiftEnter ShiftEnter feature}).
 *
 * @eventName module:engine/view/document~ViewDocument#enter
 */
export type ViewDocumentEnterEvent = BubblingEvent<{
    name: 'enter';
    args: [ViewDocumentEnterEventData];
}>;
export interface ViewDocumentEnterEventData extends ViewDocumentDomEventData<InputEvent> {
    /**
     * Whether it is a soft enter (<kbd>Shift</kbd>+<kbd>Enter</kbd>) or a hard enter (<kbd>Enter</kbd>).
     */
    isSoft: boolean;
}
