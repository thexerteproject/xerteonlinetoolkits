/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/observer/arrowkeysobserver
 */
import { Observer } from './observer.js';
import { BubblingEventInfo } from './bubblingeventinfo.js';
import { isArrowKeyCode } from '@ckeditor/ckeditor5-utils';
/**
 * Arrow keys observer introduces the {@link module:engine/view/document~ViewDocument#event:arrowKey `Document#arrowKey`} event.
 *
 * Note that this observer is attached by the {@link module:engine/view/view~EditingView} and is available by default.
 */
export class ArrowKeysObserver extends Observer {
    /**
     * @inheritDoc
     */
    constructor(view) {
        super(view);
        this.document.on('keydown', (event, data) => {
            if (this.isEnabled && isArrowKeyCode(data.keyCode)) {
                const eventInfo = new BubblingEventInfo(this.document, 'arrowKey', this.document.selection.getFirstRange());
                this.document.fire(eventInfo, data);
                if (eventInfo.stop.called) {
                    event.stop();
                }
            }
        });
    }
    /**
     * @inheritDoc
     */
    observe() { }
    /**
     * @inheritDoc
     */
    stopObserving() { }
}
