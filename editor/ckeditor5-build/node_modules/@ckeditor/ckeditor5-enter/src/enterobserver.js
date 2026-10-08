/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module enter/enterobserver
 */
import { Observer, ViewDocumentDomEventData, BubblingEventInfo } from '@ckeditor/ckeditor5-engine';
import { env } from '@ckeditor/ckeditor5-utils';
const ENTER_EVENT_TYPES = {
    insertParagraph: { isSoft: false },
    insertLineBreak: { isSoft: true }
};
/**
 * Enter observer introduces the {@link module:engine/view/document~ViewDocument#event:enter `Document#enter`} event.
 */
export class EnterObserver extends Observer {
    /**
     * @inheritDoc
     */
    constructor(view) {
        super(view);
        const doc = this.document;
        let shiftPressed = false;
        doc.on('keydown', (evt, data) => {
            shiftPressed = data.shiftKey;
        });
        doc.on('beforeinput', (evt, data) => {
            if (!this.isEnabled) {
                return;
            }
            let inputType = data.inputType;
            // See https://github.com/ckeditor/ckeditor5/issues/13321.
            if (env.isSafari && shiftPressed && inputType == 'insertParagraph') {
                inputType = 'insertLineBreak';
            }
            const domEvent = data.domEvent;
            const enterEventSpec = ENTER_EVENT_TYPES[inputType];
            if (!enterEventSpec) {
                return;
            }
            const event = new BubblingEventInfo(doc, 'enter', data.targetRanges[0]);
            doc.fire(event, new ViewDocumentDomEventData(view, domEvent, {
                isSoft: enterEventSpec.isSoft
            }));
            // Stop `beforeinput` event if `enter` event was stopped.
            // https://github.com/ckeditor/ckeditor5/issues/753
            if (event.stop.called) {
                evt.stop();
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
