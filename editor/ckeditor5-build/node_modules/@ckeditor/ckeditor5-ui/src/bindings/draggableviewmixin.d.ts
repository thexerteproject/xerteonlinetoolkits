/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/bindings/draggableviewmixin
 */
import { type View } from '../view.js';
import { type Constructor, type Mixed } from '@ckeditor/ckeditor5-utils';
/**
 * A mixin that brings the possibility to observe dragging of the view element.
 * The view has to implement the {@link ~DraggableView} interface to use it:
 *
 * ```js
 * export class MyDraggableView extends DraggableViewMixin( View ) implements DraggableView {
 * 		// ...
 * }
 * ```
 *
 * Creating a class extending it attaches a set of mouse and touch listeners allowing to observe dragging of the view element:
 * * `mousedown` and `touchstart` on the view element - starting the dragging.
 * * `mousemove` and `touchmove` on the document - updating the view coordinates.
 * * `mouseup` and `touchend` on the document - stopping the dragging.
 *
 * The mixin itself does not provide a visual feedback (that is, the dragged element does not change its position) -
 * it is up to the developer to implement it.
 */
export declare function DraggableViewMixin<Base extends Constructor<View>>(view: Base): Mixed<Base, DraggableView>;
/**
 * An interface that should be implemented by views that want to be draggable.
 */
export interface DraggableView extends View {
    get dragHandleElement(): HTMLElement | null;
}
/**
 * An event data object for the {@link ~DraggableView} `drag` event. Fired when the view is dragged.
 */
export type DraggableViewDragEvent = {
    name: 'drag';
    args: [
        {
            deltaX: number;
            deltaY: number;
        }
    ];
};
