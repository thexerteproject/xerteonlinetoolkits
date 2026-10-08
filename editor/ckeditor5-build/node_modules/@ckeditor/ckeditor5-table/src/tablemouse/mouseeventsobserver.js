/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/tablemouse/mouseeventsobserver
 */
import { DomEventObserver } from 'ckeditor5/src/engine.js';
/**
 * The mouse selection event observer.
 *
 * It registers listeners for the following DOM events:
 *
 * - `'mousemove'`
 * - `'mouseleave'`
 *
 * Note that this observer is disabled by default. To enable this observer, it needs to be added to
 * {@link module:engine/view/view~EditingView} using the {@link module:engine/view/view~EditingView#addObserver} method.
 *
 * The observer is registered by the {@link module:table/tableselection~TableSelection} plugin.
 *
 * @internal
 */
export class MouseEventsObserver extends DomEventObserver {
    domEventType = [
        'mousemove', 'mouseleave'
    ];
    /**
     * @inheritDoc
     */
    onDomEvent(domEvent) {
        this.fire(domEvent.type, domEvent);
    }
}
