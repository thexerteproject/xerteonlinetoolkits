/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/tooltipmanager
 */
import { View } from './view.js';
import { BalloonPanelView } from './panel/balloon/balloonpanelview.js';
import { type PositioningFunction } from '@ckeditor/ckeditor5-utils';
import type { Editor } from '@ckeditor/ckeditor5-core';
import '../theme/components/tooltip/tooltip.css';
declare const TooltipManager_base: {
    new (): import("@ckeditor/ckeditor5-utils").DomEmitter;
    prototype: import("@ckeditor/ckeditor5-utils").DomEmitter;
};
/**
 * A tooltip manager class for the UI of the editor.
 *
 * **Note**: Most likely you do not have to use the `TooltipManager` API listed below in order to display tooltips. Popular
 * {@glink framework/architecture/ui-library UI components} support tooltips out-of-the-box via observable properties
 * (see {@link module:ui/button/buttonview~ButtonView#tooltip} and {@link module:ui/button/buttonview~ButtonView#tooltipPosition}).
 *
 * # Displaying tooltips
 *
 * To display a tooltip, set `data-cke-tooltip-text` attribute on any DOM element:
 *
 * ```ts
 * domElement.dataset.ckeTooltipText = 'My tooltip';
 * ```
 *
 * The tooltip will show up whenever the user moves the mouse over the element or the element gets focus in DOM.
 *
 * # Positioning tooltips
 *
 * To change the position of the tooltip, use the `data-cke-tooltip-position` attribute (`s`, `se`, `sw`, `n`, `e`, or `w`):
 *
 * ```ts
 * domElement.dataset.ckeTooltipText = 'Tooltip to the north';
 * domElement.dataset.ckeTooltipPosition = 'n';
 * ```
 *
 * # Disabling tooltips
 *
 * In order to disable the tooltip temporarily, use the `data-cke-tooltip-disabled` attribute:
 *
 * ```ts
 * domElement.dataset.ckeTooltipText = 'Disabled. For now.';
 * domElement.dataset.ckeTooltipDisabled = 'true';
 * ```
 *
 * # Instant tooltips
 *
 * To remove the delay before showing or hiding the tooltip, use the `data-cke-tooltip-instant` attribute:
 *
 * ```ts
 * domElement.dataset.ckeTooltipInstant = 'true';
 * ```
 *
 * # Styling tooltips
 *
 * By default, the tooltip has `.ck-tooltip` class and its text inner `.ck-tooltip__text`.
 *
 * If your tooltip requires custom styling, using `data-cke-tooltip-class` attribute will add additional class to the balloon
 * displaying the tooltip:
 *
 * ```ts
 * domElement.dataset.ckeTooltipText = 'Tooltip with a red text';
 * domElement.dataset.ckeTooltipClass = 'my-class';
 * ```
 *
 * ```css
 * .ck.ck-tooltip.my-class { color: red }
 * ```
 *
 * **Note**: This class is a singleton. All editor instances re-use the same instance loaded by
 * {@link module:ui/editorui/editorui~EditorUI} of the first editor.
 */
export declare class TooltipManager extends /* #__PURE__ */ TooltipManager_base {
    /**
     * The view rendering text of the tooltip.
     */
    readonly tooltipTextView: View & {
        text: string;
    };
    /**
     * The instance of the balloon panel that renders and positions the tooltip.
     */
    readonly balloonPanelView: BalloonPanelView;
    /**
     * A set of default {@link module:utils/dom/position~PositioningFunction positioning functions} used by the `TooltipManager`
     * to pin tooltips in different positions.
     */
    static defaultBalloonPositions: Record<string, PositioningFunction>;
    /**
     * Stores the reference to the DOM element the tooltip is attached to. `null` when there's no tooltip
     * in the UI.
     */
    private _currentElementWithTooltip;
    /**
     * Stores the current tooltip position. `null` when there's no tooltip in the UI.
     */
    private _currentTooltipPosition;
    /**
     * An instance of the mutation observer that keeps track on target element attributes changes.
     */
    private _mutationObserver;
    /**
     * A debounced version of {@link #_pinTooltip}. Tooltips show with a delay to avoid flashing and
     * to improve the UX.
     */
    private _pinTooltipDebounced;
    /**
     * A debounced version of {@link #_unpinTooltip}. Tooltips hide with a delay to allow hovering of their titles.
     */
    private _unpinTooltipDebounced;
    private readonly _watchdogExcluded;
    /**
     * A set of editors the single tooltip manager instance must listen to.
     * This is mostly to handle `EditorUI#update` listeners from individual editors.
     */
    private static _editors;
    /**
     * A reference to the `TooltipManager` instance. The class is a singleton and as such,
     * successive attempts at creating instances should return this instance.
     */
    private static _instance;
    /**
     * Creates an instance of the tooltip manager.
     */
    constructor(editor: Editor);
    /**
     * Destroys the tooltip manager.
     *
     * **Note**: The manager singleton cannot be destroyed until all editors that use it are destroyed.
     *
     * @param editor The editor the manager was created for.
     */
    destroy(editor: Editor): void;
    /**
     * Returns {@link #balloonPanelView} {@link module:utils/dom/position~PositioningFunction positioning functions} for a given position
     * name.
     *
     * @param position Name of the position (`s`, `se`, `sw`, `n`, `e`, or `w`).
     * @returns Positioning functions to be used by the {@link #balloonPanelView}.
     */
    static getPositioningFunctions(position: TooltipPosition): Array<PositioningFunction>;
    /**
     * Handles hiding tooltips on `keydown` in DOM.
     *
     * @param evt An object containing information about the fired event.
     * @param domEvent The DOM event.
     */
    private _onKeyDown;
    /**
     * Handles displaying tooltips on `mouseenter` and `focus` in DOM.
     *
     * @param evt An object containing information about the fired event.
     * @param domEvent The DOM event.
     */
    private _onEnterOrFocus;
    /**
     * Handles hiding tooltips on `mouseleave` and `blur` in DOM.
     *
     * @param evt An object containing information about the fired event.
     * @param domEvent The DOM event.
     */
    private _onLeaveOrBlur;
    /**
     * Handles hiding tooltips on `scroll` in DOM.
     *
     * @param evt An object containing information about the fired event.
     * @param domEvent The DOM event.
     */
    private _onScroll;
    /**
     * Pins the tooltip to a specific DOM element.
     *
     * @param targetDomElement Element to be pinned to.
     * @param options Options for the tooltip.
     * @param options.text Text of the tooltip to display.
     * @param options.position The position of the tooltip.
     * @param options.cssClass Additional CSS class of the balloon with the tooltip.
     */
    private _pinTooltip;
    /**
     * Unpins the tooltip and cancels all queued pinning.
     */
    private _unpinTooltip;
    /**
     * Updates the position of the tooltip so it stays in sync with the element it is pinned to.
     *
     * Hides the tooltip when the element is no longer visible in DOM or the tooltip text was removed.
     */
    private _updateTooltipPosition;
}
export type TooltipPosition = 's' | 'n' | 'e' | 'w' | 'sw' | 'se';
export {};
