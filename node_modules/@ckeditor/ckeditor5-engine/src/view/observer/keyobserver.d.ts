/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/observer/keyobserver
 */
import { DomEventObserver } from './domeventobserver.js';
import { type ViewDocumentDomEventData } from './domeventdata.js';
import type { BubblingEvent } from './bubblingemittermixin.js';
import { type KeystrokeInfo } from '@ckeditor/ckeditor5-utils';
/**
 * Observer for events connected with pressing keyboard keys.
 *
 * Note that this observer is attached by the {@link module:engine/view/view~EditingView} and is available by default.
 */
export declare class KeyObserver extends DomEventObserver<'keydown' | 'keyup', KeystrokeInfo & {
    keystroke: number;
}> {
    /**
     * @inheritDoc
     */
    readonly domEventType: readonly ["keydown", "keyup"];
    /**
     * @inheritDoc
     */
    onDomEvent(domEvt: KeyboardEvent): void;
}
/**
 * Fired when a key has been pressed.
 *
 * Introduced by {@link module:engine/view/observer/keyobserver~KeyObserver}.
 *
 * Note that because {@link module:engine/view/observer/keyobserver~KeyObserver} is attached by the
 * {@link module:engine/view/view~EditingView} this event is available by default.
 *
 * @see module:engine/view/observer/keyobserver~KeyObserver
 * @eventName module:engine/view/document~ViewDocument#keydown
 */
export type ViewDocumentKeyDownEvent = BubblingEvent<{
    name: 'keydown';
    args: [data: ViewDocumentKeyEventData];
}>;
/**
 * Fired when a key has been released.
 *
 * Introduced by {@link module:engine/view/observer/keyobserver~KeyObserver}.
 *
 * Note that because {@link module:engine/view/observer/keyobserver~KeyObserver} is attached by the
 * {@link module:engine/view/view~EditingView} this event is available by default.
 *
 * @see module:engine/view/observer/keyobserver~KeyObserver
 * @eventName module:engine/view/document~ViewDocument#keyup
 */
export type ViewDocumentKeyUpEvent = BubblingEvent<{
    name: 'keyup';
    args: [data: ViewDocumentKeyEventData];
}>;
/**
 * The value of both events - {@link ~ViewDocumentKeyDownEvent} and {@link ~ViewDocumentKeyUpEvent}.
 */
export interface ViewDocumentKeyEventData extends ViewDocumentDomEventData<KeyboardEvent>, KeystrokeInfo {
    /**
     * Code of the whole keystroke. See {@link module:utils/keyboard~getCode}.
     */
    keystroke: number;
}
