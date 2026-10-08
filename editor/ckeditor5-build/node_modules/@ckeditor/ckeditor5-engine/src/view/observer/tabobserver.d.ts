/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/observer/tabobserver
 */
import { type EditingView } from '../view.js';
import { Observer } from './observer.js';
import type { ViewDocumentKeyEventData } from './keyobserver.js';
import type { BubblingEvent } from './bubblingemittermixin.js';
/**
 * Tab observer introduces the {@link module:engine/view/document~ViewDocument#event:tab `Document#tab`} event.
 *
 * Note that because {@link module:engine/view/observer/tabobserver~TabObserver} is attached by the
 * {@link module:engine/view/view~EditingView}, this event is available by default.
 */
export declare class TabObserver extends Observer {
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
 * Event fired when the user presses a tab key.
 *
 * Introduced by {@link module:engine/view/observer/tabobserver~TabObserver}.
 *
 * Note that because {@link module:engine/view/observer/tabobserver~TabObserver} is attached by the
 * {@link module:engine/view/view~EditingView}, this event is available by default.
 *
 * @eventName module:engine/view/document~ViewDocument#tab
 * @param data
 */
export type ViewDocumentTabEvent = BubblingEvent<{
    name: 'tab';
    args: [data: ViewDocumentKeyEventData];
}>;
