/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/observer/arrowkeysobserver
 */
import { Observer } from './observer.js';
import { type EditingView } from '../view.js';
import type { ViewDocumentKeyEventData } from './keyobserver.js';
import type { BubblingEvent } from './bubblingemittermixin.js';
/**
 * Arrow keys observer introduces the {@link module:engine/view/document~ViewDocument#event:arrowKey `Document#arrowKey`} event.
 *
 * Note that this observer is attached by the {@link module:engine/view/view~EditingView} and is available by default.
 */
export declare class ArrowKeysObserver extends Observer {
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
 * Event fired when the user presses an arrow keys.
 *
 * Introduced by {@link module:engine/view/observer/arrowkeysobserver~ArrowKeysObserver}.
 *
 * Note that because {@link module:engine/view/observer/arrowkeysobserver~ArrowKeysObserver} is attached by the
 * {@link module:engine/view/view~EditingView} this event is available by default.
 *
 * @eventName module:engine/view/document~ViewDocument#arrowKey
 * @param data
 */
export type ViewDocumentArrowKeyEvent = BubblingEvent<{
    name: 'arrowKey';
    args: [data: ViewDocumentKeyEventData];
}>;
