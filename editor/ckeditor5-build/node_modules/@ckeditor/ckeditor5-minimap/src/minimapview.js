/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module minimap/minimapview
 */
import { View } from 'ckeditor5/src/ui.js';
import { Rect } from 'ckeditor5/src/utils.js';
import { MinimapIframeView } from './minimapiframeview.js';
import { MinimapPositionTrackerView } from './minimappositiontrackerview.js';
/**
 * The main view of the minimap. It renders the original content but scaled down with a tracker element
 * visualizing the subset of the content visible to the user and allowing interactions (scrolling, dragging).
 *
 * @internal
 */
export class MinimapView extends View {
    /**
     * An instance of the tracker view displayed over the minimap.
     */
    _positionTrackerView;
    /**
     * The scale ratio of the minimap relative to the original editing DOM root with the content.
     */
    _scaleRatio;
    /**
     * An instance of the iframe view that hosts the minimap.
     */
    _minimapIframeView;
    /**
     * Creates an instance of the minimap view.
     */
    constructor({ locale, scaleRatio, pageStyles, extraClasses, useSimplePreview, domRootClone }) {
        super(locale);
        const bind = this.bindTemplate;
        this._positionTrackerView = new MinimapPositionTrackerView(locale);
        this._positionTrackerView.delegate('drag').to(this);
        this._scaleRatio = scaleRatio;
        this._minimapIframeView = new MinimapIframeView(locale, {
            useSimplePreview,
            pageStyles,
            extraClasses,
            scaleRatio,
            domRootClone
        });
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-minimap'
                ]
            },
            children: [
                this._positionTrackerView
            ],
            on: {
                click: bind.to(this._handleMinimapClick.bind(this)),
                wheel: bind.to(this._handleMinimapMouseWheel.bind(this))
            }
        });
    }
    /**
     * @inheritDoc
     */
    destroy() {
        this._minimapIframeView.destroy();
        super.destroy();
    }
    /**
     * Returns the DOM {@link module:utils/dom/rect~Rect} height of the minimap.
     */
    get height() {
        return new Rect(this.element).height;
    }
    /**
     * Returns the number of available space (pixels) the position tracker (visible subset of the content) can use to scroll vertically.
     */
    get scrollHeight() {
        return Math.max(0, Math.min(this.height, this._minimapIframeView.height) - this._positionTrackerView.height);
    }
    /**
     * @inheritDoc
     */
    render() {
        super.render();
        this._minimapIframeView.render();
        this.element.appendChild(this._minimapIframeView.element);
    }
    /**
     * Sets the new height of the minimap (in px) to respond to the changes in the original editing DOM root.
     *
     * **Note**:The provided value should be the `offsetHeight` of the original editing DOM root.
     */
    setContentHeight(newHeight) {
        this._minimapIframeView.setHeight(newHeight * this._scaleRatio);
    }
    /**
     * Sets the minimap scroll progress.
     *
     * The minimap scroll progress is linked to the original editing DOM root and its scrollable container (ancestor).
     * Changing the progress will alter the vertical position of the minimap (and its position tracker) and give the user an accurate
     * overview of the visible document.
     *
     * **Note**: The value should be between 0 and 1. 0 when the DOM root has not been scrolled, 1 when the
     * scrolling has reached the end.
     */
    setScrollProgress(newScrollProgress) {
        const iframeView = this._minimapIframeView;
        const positionTrackerView = this._positionTrackerView;
        // The scrolling should end when the bottom edge of the iframe touches the bottom edge of the minimap.
        if (iframeView.height < this.height) {
            iframeView.setTopOffset(0);
            positionTrackerView.setTopOffset((iframeView.height - positionTrackerView.height) * newScrollProgress);
        }
        else {
            const totalOffset = iframeView.height - this.height;
            iframeView.setTopOffset(-totalOffset * newScrollProgress);
            positionTrackerView.setTopOffset((this.height - positionTrackerView.height) * newScrollProgress);
        }
        positionTrackerView.setScrollProgress(Math.round(newScrollProgress * 100));
    }
    /**
     * Sets the new height of the tracker (in px) to visualize the subset of the content visible to the user.
     */
    setPositionTrackerHeight(trackerHeight) {
        this._positionTrackerView.setHeight(trackerHeight * this._scaleRatio);
    }
    /**
     * @param data DOM event data
     */
    _handleMinimapClick(data) {
        const positionTrackerView = this._positionTrackerView;
        if (data.target === positionTrackerView.element) {
            return;
        }
        const trackerViewRect = new Rect(positionTrackerView.element);
        const diff = data.clientY - trackerViewRect.top - trackerViewRect.height / 2;
        const percentage = diff / this._minimapIframeView.height;
        this.fire('click', percentage);
    }
    /**
     * @param data DOM event data
     */
    _handleMinimapMouseWheel(data) {
        this.fire('drag', data.deltaY * this._scaleRatio);
    }
}
