/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Rect, DomEmitterMixin } from '@ckeditor/ckeditor5-utils';
import { BalloonPanelView } from '../panel/balloon/balloonpanelview.js';
import { throttle } from 'es-toolkit/compat';
// ⚠ Note, whenever changing the threshold, make sure to update the docs/support/managing-ckeditor-logo.md docs
// as this information is also mentioned there ⚠.
const NARROW_ROOT_HEIGHT_THRESHOLD = 50;
const NARROW_ROOT_WIDTH_THRESHOLD = 350;
/**
 * A helper that enables the badge feature in the editor and renders a custom view next to the bottom of the editable element
 * (editor root, source editing area, etc.) when the editor is focused.
 *
 * @private
 */
export class Badge extends /* #__PURE__ */ DomEmitterMixin() {
    /**
     * Editor instance the helper was created for.
     */
    editor;
    /**
     * A reference to the balloon panel hosting and positioning the badge content.
     */
    _balloonView = null;
    /**
     * A throttled version of the {@link #_showBalloon} method meant for frequent use to avoid performance loss.
     */
    _showBalloonThrottled = throttle(() => this._showBalloon(), 50, { leading: true });
    /**
     * A reference to the last editable element (root, source editing area, etc.) focused by the user.
     * Since the focus can move to other focusable elements in the UI, this reference allows positioning the balloon over the
     * right element whether the user is typing or using the UI.
     */
    _lastFocusedEditableElement = null;
    /**
     * An additional CSS class added to the `BalloonView`.
     */
    _balloonClass;
    /**
     * Creates a badge for a given editor. The feature is initialized on Editor#ready
     * event.
     */
    constructor(editor, options = {}) {
        super();
        this.editor = editor;
        this._balloonClass = options.balloonClass;
        editor.on('ready', () => this._handleEditorReady());
    }
    /**
     * Destroys the badge along with its view.
     */
    destroy() {
        const balloon = this._balloonView;
        if (balloon) {
            // Balloon gets destroyed by the body collection.
            // The badge view gets destroyed by the balloon.
            balloon.unpin();
            this._balloonView = null;
        }
        this._showBalloonThrottled.cancel();
        this.stopListening();
    }
    /**
     * Enables badge label once the editor (ui) is ready.
     */
    _handleEditorReady() {
        const editor = this.editor;
        if (!this._isEnabled()) {
            return;
        }
        // No view means no body collection to append the badge balloon to.
        if (!editor.ui.view) {
            return;
        }
        editor.ui.focusTracker.on('change:isFocused', (evt, data, isFocused) => {
            this._updateLastFocusedEditableElement();
            if (isFocused) {
                this._showBalloon();
            }
            else {
                this._hideBalloon();
            }
        });
        editor.ui.focusTracker.on('change:focusedElement', (evt, data, focusedElement) => {
            this._updateLastFocusedEditableElement();
            if (focusedElement) {
                this._showBalloon();
            }
        });
        editor.ui.on('update', () => {
            this._showBalloonThrottled();
        });
    }
    /**
     * Returns normalized configuration for the badge.
     */
    _getNormalizedConfig() {
        return {
            side: this.editor.locale.contentLanguageDirection === 'ltr' ? 'right' : 'left',
            position: 'border',
            verticalOffset: 0,
            horizontalOffset: 5
        };
    }
    /**
     * Attempts to display the balloon with the badge view.
     */
    _showBalloon() {
        const attachOptions = this._getBalloonAttachOptions();
        if (!attachOptions) {
            return;
        }
        if (!this._balloonView) {
            this._balloonView = this._createBalloonView();
        }
        this._balloonView.pin(attachOptions);
    }
    /**
     * Hides the badge balloon if already visible.
     */
    _hideBalloon() {
        if (this._balloonView) {
            this._balloonView.unpin();
        }
    }
    /**
     * Creates an instance of the {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView balloon panel}
     * with the badge view inside ready for positioning.
     */
    _createBalloonView() {
        const editor = this.editor;
        const balloon = new BalloonPanelView();
        const view = this._createBadgeContent();
        balloon.content.add(view);
        if (this._balloonClass) {
            balloon.class = this._balloonClass;
        }
        editor.ui.view.body.add(balloon);
        return balloon;
    }
    /**
     * Returns the options for attaching the balloon to the focused editable element.
     */
    _getBalloonAttachOptions() {
        if (!this._lastFocusedEditableElement) {
            return null;
        }
        const badgeConfig = this._getNormalizedConfig();
        const positioningFunction = badgeConfig.side === 'right' ?
            getLowerRightCornerPosition(this._lastFocusedEditableElement, badgeConfig) :
            getLowerLeftCornerPosition(this._lastFocusedEditableElement, badgeConfig);
        return {
            target: this._lastFocusedEditableElement,
            positions: [positioningFunction]
        };
    }
    /**
     * Updates the {@link #_lastFocusedEditableElement} based on the state of the global focus tracker.
     */
    _updateLastFocusedEditableElement() {
        const editor = this.editor;
        const isFocused = editor.ui.focusTracker.isFocused;
        const focusedElement = editor.ui.focusTracker.focusedElement;
        if (!isFocused || !focusedElement) {
            this._lastFocusedEditableElement = null;
            return;
        }
        const editableEditorElements = Array.from(editor.ui.getEditableElementsNames()).map(name => {
            return editor.ui.getEditableElement(name);
        });
        if (editableEditorElements.includes(focusedElement)) {
            this._lastFocusedEditableElement = focusedElement;
        }
        else {
            // If it's none of the editable element, then the focus is somewhere in the UI. Let's display the badge
            // over the first element then.
            this._lastFocusedEditableElement = editableEditorElements[0];
        }
    }
}
function getLowerRightCornerPosition(focusedEditableElement, config) {
    return getLowerCornerPosition(focusedEditableElement, config, (rootRect, balloonRect) => {
        return rootRect.left + rootRect.width - balloonRect.width - config.horizontalOffset;
    });
}
function getLowerLeftCornerPosition(focusedEditableElement, config) {
    return getLowerCornerPosition(focusedEditableElement, config, rootRect => rootRect.left + config.horizontalOffset);
}
function getLowerCornerPosition(focusedEditableElement, config, getBalloonLeft) {
    return (visibleEditableElementRect, balloonRect) => {
        const editableElementRect = new Rect(focusedEditableElement);
        if (editableElementRect.width < NARROW_ROOT_WIDTH_THRESHOLD || editableElementRect.height < NARROW_ROOT_HEIGHT_THRESHOLD) {
            return null;
        }
        let balloonTop;
        if (config.position === 'inside') {
            balloonTop = editableElementRect.bottom - balloonRect.height;
        }
        else {
            balloonTop = editableElementRect.bottom - balloonRect.height / 2;
        }
        balloonTop -= config.verticalOffset;
        const balloonLeft = getBalloonLeft(editableElementRect, balloonRect);
        // Clone the editable element rect and place it where the balloon would be placed.
        // This will allow getVisible() to work from editable element's perspective (rect source).
        // and yield a result as if the balloon was on the same (scrollable) layer as the editable element.
        const newBalloonPositionRect = visibleEditableElementRect
            .clone()
            .moveTo(balloonLeft, balloonTop)
            .getIntersection(balloonRect.clone().moveTo(balloonLeft, balloonTop));
        const newBalloonPositionVisibleRect = newBalloonPositionRect.getVisible();
        if (!newBalloonPositionVisibleRect || newBalloonPositionVisibleRect.getArea() < balloonRect.getArea()) {
            return null;
        }
        return {
            top: balloonTop,
            left: balloonLeft,
            name: `position_${config.position}-side_${config.side}`,
            config: {
                withArrow: false
            }
        };
    };
}
