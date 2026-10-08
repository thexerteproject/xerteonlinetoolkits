/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module widget/widgetresize/resizerstate
 */
import { ObservableMixin, Rect } from '@ckeditor/ckeditor5-utils';
import { calculateResizeHostPercentageWidth } from '../utils.js';
/**
 * Stores the internal state of a single resizable object.
 */
export class WidgetResizeState extends /* #__PURE__ */ ObservableMixin() {
    /**
     * The reference point of the resizer where the dragging started. It is used to measure the distance the user cursor
     * traveled, so how much the image should be enlarged.
     * This information is only known after the DOM was rendered, so it will be updated later.
     *
     * @internal
     */
    _referenceCoordinates;
    /**
     * Resizer options.
     */
    _options;
    /**
     * The original width (pixels) of the resized object when the resize process was started.
     *
     * @readonly
     */
    _originalWidth;
    /**
     * The original height (pixels) of the resized object when the resize process was started.
     *
     * @readonly
     */
    _originalHeight;
    /**
     * The original width (percents) of the resized object when the resize process was started.
     *
     * @readonly
     */
    _originalWidthPercents;
    /**
     * A width to height ratio of the resized image.
     *
     * @readonly
     */
    _aspectRatio;
    /**
     * @param options Resizer options.
     */
    constructor(options) {
        super();
        this.set('activeHandlePosition', null);
        this.set('proposedWidthPercents', null);
        this.set('proposedWidth', null);
        this.set('proposedHeight', null);
        this.set('proposedHandleHostWidth', null);
        this.set('proposedHandleHostHeight', null);
        this._options = options;
        this._referenceCoordinates = null;
    }
    /**
     * The original width (pixels) of the resized object when the resize process was started.
     */
    get originalWidth() {
        return this._originalWidth;
    }
    /**
     * The original height (pixels) of the resized object when the resize process was started.
     */
    get originalHeight() {
        return this._originalHeight;
    }
    /**
     * The original width (percents) of the resized object when the resize process was started.
     */
    get originalWidthPercents() {
        return this._originalWidthPercents;
    }
    /**
     * A width to height ratio of the resized image.
     */
    get aspectRatio() {
        return this._aspectRatio;
    }
    /**
     *
     * @param domResizeHandle The handle used to calculate the reference point.
     */
    begin(domResizeHandle, domHandleHost, domResizeHost) {
        const clientRect = new Rect(domHandleHost);
        this.activeHandlePosition = getHandlePosition(domResizeHandle);
        this._referenceCoordinates = getAbsoluteBoundaryPoint(domHandleHost, getOppositePosition(this.activeHandlePosition));
        this._originalWidth = clientRect.width;
        this._originalHeight = clientRect.height;
        this._aspectRatio = clientRect.width / clientRect.height;
        const widthStyle = domResizeHost.style.width;
        if (widthStyle && widthStyle.match(/^\d+(\.\d*)?%$/)) {
            this._originalWidthPercents = parseFloat(widthStyle);
        }
        else {
            this._originalWidthPercents = calculateResizeHostPercentageWidth(domResizeHost, clientRect);
        }
    }
    update(newSize) {
        this.proposedWidth = newSize.width;
        this.proposedHeight = newSize.height;
        this.proposedWidthPercents = newSize.widthPercents;
        this.proposedHandleHostWidth = newSize.handleHostWidth;
        this.proposedHandleHostHeight = newSize.handleHostHeight;
    }
}
/**
 * Returns coordinates of the top-left corner of an element, relative to the document's top-left corner.
 *
 * @param resizerPosition The position of the resize handle, e.g. `"top-left"`, `"bottom-right"`.
 */
function getAbsoluteBoundaryPoint(element, resizerPosition) {
    const elementRect = new Rect(element);
    const positionParts = resizerPosition.split('-');
    const ret = {
        x: positionParts[1] == 'right' ? elementRect.right : elementRect.left,
        y: positionParts[0] == 'bottom' ? elementRect.bottom : elementRect.top
    };
    ret.x += element.ownerDocument.defaultView.scrollX;
    ret.y += element.ownerDocument.defaultView.scrollY;
    return ret;
}
/**
 * @param resizerPosition The expected resizer position, like `"top-left"`, `"bottom-right"`.
 * @returns A prefixed HTML class name for the resizer element.
 */
function getResizerHandleClass(resizerPosition) {
    return `ck-widget__resizer__handle-${resizerPosition}`;
}
/**
 * Determines the position of a given resize handle.
 *
 * @param domHandle Handle used to calculate the reference point.
 * @returns Returns a string like `"top-left"` or `undefined` if not matched.
 */
function getHandlePosition(domHandle) {
    const resizerPositions = ['top-left', 'top-right', 'bottom-right', 'bottom-left'];
    for (const position of resizerPositions) {
        if (domHandle.classList.contains(getResizerHandleClass(position))) {
            return position;
        }
    }
}
/**
 * @param position Like `"top-left"`.
 * @returns Inverted `position`, e.g. it returns `"bottom-right"` if `"top-left"` was given as `position`.
 */
function getOppositePosition(position) {
    const parts = position.split('-');
    const replacements = {
        top: 'bottom',
        bottom: 'top',
        left: 'right',
        right: 'left'
    };
    return `${replacements[parts[0]]}-${replacements[parts[1]]}`;
}
