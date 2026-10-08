/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module clipboard/clipboardobserver
 */
import { EventInfo, getRangeFromMouseEvent } from '@ckeditor/ckeditor5-utils';
import { ViewDataTransfer, DomEventObserver } from '@ckeditor/ckeditor5-engine';
/**
 * Clipboard events observer.
 *
 * Fires the following events:
 *
 * * {@link module:engine/view/document~ViewDocument#event:clipboardInput},
 * * {@link module:engine/view/document~ViewDocument#event:paste},
 * * {@link module:engine/view/document~ViewDocument#event:copy},
 * * {@link module:engine/view/document~ViewDocument#event:cut},
 * * {@link module:engine/view/document~ViewDocument#event:drop},
 * * {@link module:engine/view/document~ViewDocument#event:dragover},
 * * {@link module:engine/view/document~ViewDocument#event:dragging},
 * * {@link module:engine/view/document~ViewDocument#event:dragstart},
 * * {@link module:engine/view/document~ViewDocument#event:dragend},
 * * {@link module:engine/view/document~ViewDocument#event:dragenter},
 * * {@link module:engine/view/document~ViewDocument#event:dragleave}.
 *
 * **Note**: This observer is not available by default (ckeditor5-engine does not add it on its own).
 * To make it available, it needs to be added to {@link module:engine/view/document~ViewDocument} by using
 * the {@link module:engine/view/view~EditingView#addObserver `View#addObserver()`} method. Alternatively, you can load the
 * {@link module:clipboard/clipboard~Clipboard} plugin which adds this observer automatically (because it uses it).
 */
export class ClipboardObserver extends DomEventObserver {
    domEventType = [
        'paste', 'copy', 'cut', 'drop', 'dragover', 'dragstart', 'dragend', 'dragenter', 'dragleave'
    ];
    constructor(view) {
        super(view);
        const viewDocument = this.document;
        this.listenTo(viewDocument, 'paste', handleInput('clipboardInput'), { priority: 'low' });
        this.listenTo(viewDocument, 'drop', handleInput('clipboardInput'), { priority: 'low' });
        this.listenTo(viewDocument, 'dragover', handleInput('dragging'), { priority: 'low' });
        function handleInput(type) {
            return (evt, data) => {
                data.preventDefault();
                const targetRanges = data.dropRange ? [data.dropRange] : null;
                const eventInfo = new EventInfo(viewDocument, type);
                viewDocument.fire(eventInfo, {
                    dataTransfer: data.dataTransfer,
                    method: evt.name,
                    targetRanges,
                    target: data.target,
                    domEvent: data.domEvent
                });
                // If CKEditor handled the input, do not bubble the original event any further.
                // This helps external integrations recognize that fact and act accordingly.
                // https://github.com/ckeditor/ckeditor5-upload/issues/92
                if (eventInfo.stop.called) {
                    data.stopPropagation();
                }
            };
        }
    }
    onDomEvent(domEvent) {
        const nativeDataTransfer = 'clipboardData' in domEvent ? domEvent.clipboardData : domEvent.dataTransfer;
        const cacheFiles = domEvent.type == 'drop' || domEvent.type == 'paste';
        const evtData = {
            dataTransfer: new ViewDataTransfer(nativeDataTransfer, { cacheFiles })
        };
        if (domEvent.type == 'drop' || domEvent.type == 'dragover') {
            const domRange = getRangeFromMouseEvent(domEvent);
            evtData.dropRange = domRange && this.view.domConverter.domRangeToView(domRange);
        }
        this.fire(domEvent.type, domEvent, evtData);
    }
}
