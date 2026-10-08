/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module image/image/imageloadobserver
 */
import { Observer } from 'ckeditor5/src/engine.js';
/**
 * Observes all new images added to the {@link module:engine/view/document~ViewDocument},
 * fires {@link module:engine/view/document~ViewDocument#event:imageLoaded} and
 * {@link module:engine/view/document~ViewDocument#event:layoutChanged} event every time when the new image
 * has been loaded.
 *
 * **Note:** This event is not fired for images that has been added to the document and rendered as `complete` (already loaded).
 */
export class ImageLoadObserver extends Observer {
    /**
     * @inheritDoc
     */
    observe(domRoot) {
        this.listenTo(domRoot, 'load', (event, domEvent) => {
            const domElement = domEvent.target;
            if (this.checkShouldIgnoreEventFromTarget(domElement)) {
                return;
            }
            if (domElement.tagName == 'IMG') {
                this._fireEvents(domEvent);
            }
            // Use capture phase for better performance (#4504).
        }, { useCapture: true });
    }
    /**
     * @inheritDoc
     */
    stopObserving(domRoot) {
        this.stopListening(domRoot);
    }
    /**
     * Fires {@link module:engine/view/document~ViewDocument#event:layoutChanged} and
     * {@link module:engine/view/document~ViewDocument#event:imageLoaded}
     * if observer {@link #isEnabled is enabled}.
     *
     * @param domEvent The DOM event.
     */
    _fireEvents(domEvent) {
        if (this.isEnabled) {
            this.document.fire('layoutChanged');
            this.document.fire('imageLoaded', domEvent);
        }
    }
}
