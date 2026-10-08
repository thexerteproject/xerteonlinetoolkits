/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/badge/badge
 */
import type { Editor } from '@ckeditor/ckeditor5-core';
import { type View } from '../view.js';
declare const Badge_base: {
    new (): import("@ckeditor/ckeditor5-utils").DomEmitter;
    prototype: import("@ckeditor/ckeditor5-utils").DomEmitter;
};
/**
 * A helper that enables the badge feature in the editor and renders a custom view next to the bottom of the editable element
 * (editor root, source editing area, etc.) when the editor is focused.
 *
 * @private
 */
export declare abstract class Badge extends /* #__PURE__ */ Badge_base {
    /**
     * Editor instance the helper was created for.
     */
    protected readonly editor: Editor;
    /**
     * A reference to the balloon panel hosting and positioning the badge content.
     */
    private _balloonView;
    /**
     * A throttled version of the {@link #_showBalloon} method meant for frequent use to avoid performance loss.
     */
    private _showBalloonThrottled;
    /**
     * A reference to the last editable element (root, source editing area, etc.) focused by the user.
     * Since the focus can move to other focusable elements in the UI, this reference allows positioning the balloon over the
     * right element whether the user is typing or using the UI.
     */
    private _lastFocusedEditableElement;
    /**
     * An additional CSS class added to the `BalloonView`.
     */
    private readonly _balloonClass;
    /**
     * Creates a badge for a given editor. The feature is initialized on Editor#ready
     * event.
     */
    protected constructor(editor: Editor, options?: {
        balloonClass?: string;
    });
    /**
     * Destroys the badge along with its view.
     */
    destroy(): void;
    /**
     * Enables badge label once the editor (ui) is ready.
     */
    protected _handleEditorReady(): void;
    /**
     * Returns normalized configuration for the badge.
     */
    protected _getNormalizedConfig(): BadgeConfig;
    /**
     * Creates the badge content.
     */
    protected abstract _createBadgeContent(): View<HTMLElement>;
    /**
     * Enables the badge feature.
     */
    protected abstract _isEnabled(): boolean;
    /**
     * Attempts to display the balloon with the badge view.
     */
    private _showBalloon;
    /**
     * Hides the badge balloon if already visible.
     */
    private _hideBalloon;
    /**
     * Creates an instance of the {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView balloon panel}
     * with the badge view inside ready for positioning.
     */
    private _createBalloonView;
    /**
     * Returns the options for attaching the balloon to the focused editable element.
     */
    private _getBalloonAttachOptions;
    /**
     * Updates the {@link #_lastFocusedEditableElement} based on the state of the global focus tracker.
     */
    private _updateLastFocusedEditableElement;
}
/**
 * The badge configuration options.
 **/
export interface BadgeConfig {
    /**
     * The position of the badge.
     *
     * * When `'inside'`, the badge will be displayed within the boundaries of the editing area.
     * * When `'border'`, the basge will be displayed over the bottom border of the editing area.
     *
     * @default 'border'
     */
    position: 'inside' | 'border';
    /**
     * Allows choosing the side of the editing area where the badge will be displayed.
     *
     * **Note:** If {@link module:core/editor/editorconfig~EditorConfig#language `config.language`} is set to an RTL (right-to-left)
     * language, the side switches to `'left'` by default.
     *
     * @default 'right'
     */
    side: 'left' | 'right';
    /**
     * The vertical distance the badge can be moved away from its default position.
     *
     * **Note:** If `position` is `'border'`, the offset is measured from the (vertical) center of the badge.
     *
     * @default 5
     */
    verticalOffset: number;
    /**
     * The horizontal distance between the side of the editing root and the nearest side of the badge.
     *
     * @default 5
     */
    horizontalOffset: number;
}
export {};
