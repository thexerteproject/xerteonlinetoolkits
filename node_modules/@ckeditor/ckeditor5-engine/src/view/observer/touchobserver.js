/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/observer/touchobserver
 */
import { DomEventObserver } from './domeventobserver.js';
/**
 * Touch events observer.
 *
 * Note that this observer is not available by default. To make it available it needs to be added to
 * {@link module:engine/view/view~EditingView} by {@link module:engine/view/view~EditingView#addObserver} method.
 */
export class TouchObserver extends DomEventObserver {
    /**
     * @inheritDoc
     */
    domEventType = ['touchstart', 'touchend', 'touchmove'];
    /**
     * @inheritDoc
     */
    onDomEvent(domEvent) {
        this.fire(domEvent.type, domEvent);
    }
}
