/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/observer/keyobserver
 */
import { DomEventObserver } from './domeventobserver.js';
import { getCode } from '@ckeditor/ckeditor5-utils';
/**
 * Observer for events connected with pressing keyboard keys.
 *
 * Note that this observer is attached by the {@link module:engine/view/view~EditingView} and is available by default.
 */
export class KeyObserver extends DomEventObserver {
    /**
     * @inheritDoc
     */
    domEventType = ['keydown', 'keyup'];
    /**
     * @inheritDoc
     */
    onDomEvent(domEvt) {
        const data = {
            keyCode: domEvt.keyCode,
            altKey: domEvt.altKey,
            ctrlKey: domEvt.ctrlKey,
            shiftKey: domEvt.shiftKey,
            metaKey: domEvt.metaKey,
            get keystroke() {
                return getCode(this);
            }
        };
        this.fire(domEvt.type, domEvt, data);
    }
}
