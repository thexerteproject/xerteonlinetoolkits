/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/observer/clickobserver
 */
import { DomEventObserver } from './domeventobserver.js';
/**
 * {@link module:engine/view/document~ViewDocument#event:click Click} event observer.
 *
 * Note that this observer is not available by default. To make it available it needs to be added to
 * {@link module:engine/view/view~EditingView view controller} by a {@link module:engine/view/view~EditingView#addObserver} method.
 */
export class ClickObserver extends DomEventObserver {
    /**
     * @inheritDoc
     */
    domEventType = 'click';
    /**
     * @inheritDoc
     */
    onDomEvent(domEvent) {
        this.fire(domEvent.type, domEvent);
    }
}
