/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/todolist/todocheckboxchangeobserver
 */
import { DomEventObserver } from 'ckeditor5/src/engine.js';
/**
 * Observes all to-do list checkboxes state changes.
 *
 * Note that this observer is not available by default. To make it available it needs to be added to
 * {@link module:engine/view/view~EditingView} by {@link module:engine/view/view~EditingView#addObserver} method.
 *
 * @internal
 */
export class TodoCheckboxChangeObserver extends DomEventObserver {
    /**
     * @inheritDoc
     */
    domEventType = ['change'];
    /**
     * @inheritDoc
     */
    onDomEvent(domEvent) {
        if (domEvent.target) {
            const viewTarget = this.view.domConverter.mapDomToView(domEvent.target);
            if (viewTarget &&
                viewTarget.is('element', 'input') &&
                viewTarget.getAttribute('type') == 'checkbox' &&
                viewTarget.findAncestor({ classes: 'todo-list__label' })) {
                this.fire('todoCheckboxChange', domEvent);
            }
        }
    }
}
