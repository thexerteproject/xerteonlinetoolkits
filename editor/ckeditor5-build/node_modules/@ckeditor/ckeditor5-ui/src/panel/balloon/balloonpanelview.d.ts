/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/panel/balloon/balloonpanelview
 */
import { View } from '../../view.js';
import { type ViewCollection } from '../../viewcollection.js';
import { type Locale, type DomOptimalPositionOptions, type PositioningFunction } from '@ckeditor/ckeditor5-utils';
import '../../../theme/components/panel/balloonpanel.css';
/**
 * The balloon panel view class.
 *
 * A floating container which can
 * {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView#pin pin} to any
 * {@link module:utils/dom/position~DomOptimalPositionOptions#target target} in the DOM and remain in that position
 * e.g. when the web page is scrolled.
 *
 * The balloon panel can be used to display contextual, non-blocking UI like forms, toolbars and
 * the like in its {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView#content} view
 * collection.
 *
 * There is a number of {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView.defaultPositions}
 * that the balloon can use, automatically switching from one to another when the viewport space becomes
 * scarce to keep the balloon visible to the user as long as it is possible. The balloon will also
 * accept any custom position set provided by the user compatible with the
 * {@link module:utils/dom/position~DomOptimalPositionOptions options}.
 *
 * ```ts
 * const panel = new BalloonPanelView( locale );
 * const childView = new ChildView();
 * const positions = BalloonPanelView.defaultPositions;
 *
 * panel.render();
 *
 * // Add a child view to the panel's content collection.
 * panel.content.add( childView );
 *
 * // Start pinning the panel to an element with the "target" id DOM.
 * // The balloon will remain pinned until unpin() is called.
 * panel.pin( {
 * 	target: document.querySelector( '#target' ),
 * 	positions: [
 * 		positions.northArrowSouth,
 * 		positions.southArrowNorth
 * 	]
 * } );
 * ```
 */
export declare class BalloonPanelView extends View {
    /**
     * A collection of the child views that creates the balloon panel contents.
     */
    readonly content: ViewCollection;
    /**
     * The absolute top position of the balloon panel in pixels.
     *
     * @observable
     * @default 0
     */
    top: number;
    /**
     * The absolute left position of the balloon panel in pixels.
     *
     * @observable
     * @default 0
     */
    left: number;
    /**
     * The balloon panel's current position. The position name is reflected in the CSS class set
     * to the balloon, i.e. `.ck-balloon-panel_arrow_nw` for the "arrow_nw" position. The class
     * controls the minor aspects of the balloon's visual appearance like the placement
     * of an {@link #withArrow arrow}. To support a new position, an additional CSS must be created.
     *
     * Default position names correspond with
     * {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView.defaultPositions}.
     *
     * See the {@link #attachTo} and {@link #pin} methods to learn about custom balloon positions.
     *
     * @observable
     * @default 'arrow_nw'
     */
    position: 'arrow_nw' | 'arrow_ne' | 'arrow_sw' | 'arrow_se';
    /**
     * Controls whether the balloon panel is visible or not.
     *
     * @observable
     * @default false
     */
    isVisible: boolean;
    /**
     * Controls whether the balloon panel has an arrow. The presence of the arrow
     * is reflected in the `ck-balloon-panel_with-arrow` CSS class.
     *
     * @observable
     * @default true
     */
    withArrow: boolean;
    /**
     * An additional CSS class added to the {@link #element}.
     *
     * @observable
     */
    class: string | undefined;
    /**
     * A callback that starts pinning the panel when {@link #isVisible} gets
     * `true`. Used by {@link #pin}.
     *
     * @private
     */
    private _pinWhenIsVisibleCallback;
    /**
     * An instance of resize observer used to detect if target element is still visible.
     */
    private _resizeObserver;
    /**
     * @inheritDoc
     */
    constructor(locale?: Locale);
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Shows the panel.
     *
     * See {@link #isVisible}.
     */
    show(): void;
    /**
     * Hides the panel.
     *
     * See {@link #isVisible}.
     */
    hide(): void;
    /**
     * Attaches the panel to a specified {@link module:utils/dom/position~DomOptimalPositionOptions#target} with a
     * smart positioning heuristics that chooses from available positions to make sure the panel
     * is visible to the user i.e. within the limits of the viewport.
     *
     * This method accepts configuration {@link module:utils/dom/position~DomOptimalPositionOptions options}
     * to set the `target`, optional `limiter` and `positions` the balloon should choose from.
     *
     * ```ts
     * const panel = new BalloonPanelView( locale );
     * const positions = BalloonPanelView.defaultPositions;
     *
     * panel.render();
     *
     * // Attach the panel to an element with the "target" id DOM.
     * panel.attachTo( {
     * 	target: document.querySelector( '#target' ),
     * 	positions: [
     * 		positions.northArrowSouth,
     * 		positions.southArrowNorth
     * 	]
     * } );
     * ```
     *
     * **Note**: Attaching the panel will also automatically {@link #show} it.
     *
     * **Note**: An attached panel will not follow its target when the window is scrolled or resized.
     * See the {@link #pin} method for a more permanent positioning strategy.
     *
     * @param options Positioning options compatible with {@link module:utils/dom/position~getOptimalPosition}.
     * Default `positions` array is {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView.defaultPositions}.
     * @returns Whether the balloon was shown and successfully attached or not. Attaching can fail if the target
     * provided in the options is invisible (e.g. element detached from DOM).
     */
    attachTo(options: Partial<DomOptimalPositionOptions>): boolean;
    /**
     * Works the same way as the {@link #attachTo} method except that the position of the panel is
     * continuously updated when:
     *
     * * any ancestor of the {@link module:utils/dom/position~DomOptimalPositionOptions#target}
     * or {@link module:utils/dom/position~DomOptimalPositionOptions#limiter} is scrolled,
     * * the browser window gets resized or scrolled.
     *
     * Thanks to that, the panel always sticks to the {@link module:utils/dom/position~DomOptimalPositionOptions#target}
     * and is immune to the changing environment.
     *
     * ```ts
     * const panel = new BalloonPanelView( locale );
     * const positions = BalloonPanelView.defaultPositions;
     *
     * panel.render();
     *
     * // Pin the panel to an element with the "target" id DOM.
     * panel.pin( {
     * 	target: document.querySelector( '#target' ),
     * 	positions: [
     * 		positions.northArrowSouth,
     * 		positions.southArrowNorth
     * 	]
     * } );
     * ```
     *
     * To leave the pinned state, use the {@link #unpin} method.
     *
     * **Note**: Pinning the panel will also automatically {@link #show} it.
     *
     * @param options Positioning options compatible with {@link module:utils/dom/position~getOptimalPosition}.
     * Default `positions` array is {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView.defaultPositions}.
     */
    pin(options: Partial<DomOptimalPositionOptions>): void;
    /**
     * Stops pinning the panel, as set up by {@link #pin}.
     */
    unpin(): void;
    /**
     * Starts managing the pinned state of the panel. See {@link #pin}.
     *
     * @param options Positioning options compatible with {@link module:utils/dom/position~getOptimalPosition}.
     * @returns Whether the balloon was shown and successfully attached or not. Attaching can fail if the target
     * provided in the options is invisible (e.g. element detached from DOM).
     */
    private _startPinning;
    /**
     * Stops managing the pinned state of the panel. See {@link #pin}.
     */
    private _stopPinning;
    /**
     * Returns available {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView}
     * {@link module:utils/dom/position~PositioningFunction positioning functions} adjusted by the specific offsets.
     *
     * @internal
     * @param options Options to generate positions. If not specified, this helper will simply return
     * {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView.defaultPositions}.
     * @param options.sideOffset A custom side offset (in pixels) of each position. If
     * not specified, {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView.arrowSideOffset the default value}
     * will be used.
     * @param options.heightOffset A custom height offset (in pixels) of each position. If
     * not specified, {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView.arrowHeightOffset the default value}
     * will be used.
     * @param options.stickyVerticalOffset A custom offset (in pixels) of the `viewportStickyNorth` positioning function.
     * If not specified, {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView.stickyVerticalOffset the default value}
     * will be used.
     * @param options.config Additional configuration of the balloon balloon panel view.
     * Currently only {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView#withArrow} is supported. Learn more
     * about {@link module:utils/dom/position~PositioningFunction positioning functions}.
     */
    static generatePositions(options?: {
        sideOffset?: number;
        heightOffset?: number;
        stickyVerticalOffset?: number;
        config?: object;
    }): Record<string, PositioningFunction>;
    /**
     * A side offset of the arrow tip from the edge of the balloon. Controlled by CSS.
     *
     * ```
     *		 ┌───────────────────────┐
     *		 │                       │
     *		 │         Balloon       │
     *		 │         Content       │
     *		 │                       │
     *		 └──+    +───────────────┘
     *		 |   \  /
     *		 |    \/
     *		>┼─────┼< ─────────────────────── side offset
     *
     * ```
     *
     * @default 25
     */
    static arrowSideOffset: number;
    /**
     * A height offset of the arrow from the edge of the balloon. Controlled by CSS.
     *
     * ```
     *		 ┌───────────────────────┐
     *		 │                       │
     *		 │         Balloon       │
     *		 │         Content       │      ╱-- arrow height offset
     *		 │                       │      V
     *		 └──+    +───────────────┘ --- ─┼───────
     *		     \  /                       │
     *		      \/                        │
     *		────────────────────────────────┼───────
     *		                                ^
     *
     *
     *		>┼────┼<  arrow height offset
     *		 │    │
     *		 │    ┌────────────────────────┐
     *		 │    │                        │
     *		 │   ╱                         │
     *		 │ ╱            Balloon        │
     *		 │ ╲            Content        │
     *		 │   ╲                         │
     *		 │    │                        │
     *		 │    └────────────────────────┘
     * ```
     *
     * @default 10
    */
    static arrowHeightOffset: number;
    /**
     * A vertical offset of the balloon panel from the edge of the viewport if sticky.
     * It helps in accessing toolbar buttons underneath the balloon panel.
     *
     * ```
     *		  ┌───────────────────────────────────────────────────┐
     *		  │                      Target                       │
     *		  │                                                   │
     *		  │                            /── vertical offset    │
     *		┌─────────────────────────────V─────────────────────────┐
     *		│ Toolbar            ┌─────────────┐                    │
     *		├────────────────────│   Balloon   │────────────────────┤
     *		│ │                  └─────────────┘                  │ │
     *		│ │                                                   │ │
     *		│ │                                                   │ │
     *		│ │                                                   │ │
     *		│ └───────────────────────────────────────────────────┘ │
     *		│                        Viewport                       │
     *		└───────────────────────────────────────────────────────┘
     * ```
     *
     * @default 20
     */
    static stickyVerticalOffset: number;
    /**
     * Function used to calculate the optimal position for the balloon.
     */
    private static _getOptimalPosition;
    /**
     * A default set of positioning functions used by the balloon panel view
     * when attaching using the {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView#attachTo} method.
     *
     * The available positioning functions are as follows:
     *
     * **North west**
     *
     * * `northWestArrowSouthWest`
     *
     * ```
     *		+-----------------+
     *		|     Balloon     |
     *		+-----------------+
     *		 V
     *		 [ Target ]
     * ```
     *
     * * `northWestArrowSouthMiddleWest`
     *
     * ```
     *		+-----------------+
     *		|     Balloon     |
     *		+-----------------+
     *		    V
     *		    [ Target ]
     * ```
     *
     * * `northWestArrowSouth`
     *
     * ```
     *		+-----------------+
     *		|     Balloon     |
     *		+-----------------+
     *		         V
     *		         [ Target ]
     * ```
     *
     * * `northWestArrowSouthMiddleEast`
     *
     * ```
     *		+-----------------+
     *		|     Balloon     |
     *		+-----------------+
     *		             V
     *		             [ Target ]
     * ```
     *
     * * `northWestArrowSouthEast`
     *
     * ```
     *		+-----------------+
     *		|     Balloon     |
     *		+-----------------+
     *		                 V
     *		                 [ Target ]
     * ```
     *
     * **North**
     *
     * * `northArrowSouthWest`
     *
     * ```
     *		    +-----------------+
     *		    |     Balloon     |
     *		    +-----------------+
     *		     V
     *		[ Target ]
     * ```
     *
     * * `northArrowSouthMiddleWest`
     *
     * ```
     *		 +-----------------+
     *		 |     Balloon     |
     *		 +-----------------+
     *		     V
     *		[ Target ]
     * ```
     * * `northArrowSouth`
     *
     * ```
     *		+-----------------+
     *		|     Balloon     |
     *		+-----------------+
     *		         V
     *		    [ Target ]
     * ```
     *
     * * `northArrowSouthMiddleEast`
     *
     * ```
     *		+-----------------+
     *		|     Balloon     |
     *		+-----------------+
     *		             V
     *		        [ Target ]
     * ```
     *
     * * `northArrowSouthEast`
     *
     * ```
     *		+-----------------+
     *		|     Balloon     |
     *		+-----------------+
     *		                V
     *		           [ Target ]
     * ```
     *
     * **North east**
     *
     * * `northEastArrowSouthWest`
     *
     * ```
     *		        +-----------------+
     *		        |     Balloon     |
     *		        +-----------------+
     *		         V
     *		[ Target ]
     * ```
     *
     * * `northEastArrowSouthMiddleWest`
     *
     * ```
     *		     +-----------------+
     *		     |     Balloon     |
     *		     +-----------------+
     *		         V
     *		[ Target ]
     * ```
     *
     * * `northEastArrowSouth`
     *
     * ```
     *		+-----------------+
     *		|     Balloon     |
     *		+-----------------+
     *		         V
     *		[ Target ]
     * ```
     *
     * * `northEastArrowSouthMiddleEast`
     *
     * ```
     *		+-----------------+
     *		|     Balloon     |
     *		+-----------------+
     *		             V
     *		    [ Target ]
     * ```
     *
     * * `northEastArrowSouthEast`
     *
     * ```
     *		+-----------------+
     *		|     Balloon     |
     *		+-----------------+
     *		                 V
     *		        [ Target ]
     * ```
     *
     * **South**
     *
     * * `southArrowNorthWest`
     *
     * ```
     *		[ Target ]
     *		     ^
     *		    +-----------------+
     *		    |     Balloon     |
     *		    +-----------------+
     * ```
     *
     * * `southArrowNorthMiddleWest`
     *
     * ```
     *		   [ Target ]
     *		        ^
     *		    +-----------------+
     *		    |     Balloon     |
     *		    +-----------------+
     * ```
     *
     * * `southArrowNorth`
     *
     * ```
     *		    [ Target ]
     *		         ^
     *		+-----------------+
     *		|     Balloon     |
     *		+-----------------+
     * ```
     *
     * * `southArrowNorthMiddleEast`
     *
     * ```
     *		            [ Target ]
     *		                 ^
     *		   +-----------------+
     *		   |     Balloon     |
     *		   +-----------------+
     * ```
     *
     * * `southArrowNorthEast`
     *
     * ```
     *		            [ Target ]
     *		                 ^
     *		+-----------------+
     *		|     Balloon     |
     *		+-----------------+
     * ```
     *
     * **South west**
     *
     * * `southWestArrowNorthWest`
     *
     *
     * ```
     *		 [ Target ]
     *		 ^
     *		+-----------------+
     *		|     Balloon     |
     *		+-----------------+
     * ```
     *
     * * `southWestArrowNorthMiddleWest`
     *
     * ```
     *		     [ Target ]
     *		     ^
     *		 +-----------------+
     *		 |     Balloon     |
     *		 +-----------------+
     * ```
     *
     * * `southWestArrowNorth`
     *
     * ```
     *		         [ Target ]
     *		         ^
     *		+-----------------+
     *		|     Balloon     |
     *		+-----------------+
     * ```
     *
     * * `southWestArrowNorthMiddleEast`
     *
     * ```
     *		              [ Target ]
     *		              ^
     *		+-----------------+
     *		|     Balloon     |
     *		+-----------------+
     * ```
     *
     * * `southWestArrowNorthEast`
     *
     * ```
     *		                 [ Target ]
     *		                 ^
     *		+-----------------+
     *		|     Balloon     |
     *		+-----------------+
     * ```
     *
     * **South east**
     *
     * * `southEastArrowNorthWest`
     *
     * ```
     *		[ Target ]
     *		         ^
     *		        +-----------------+
     *		        |     Balloon     |
     *		        +-----------------+
     * ```
     *
     * * `southEastArrowNorthMiddleWest`
     *
     * ```
     *		   [ Target ]
     *		            ^
     *		        +-----------------+
     *		        |     Balloon     |
     *		        +-----------------+
     * ```
     *
     * * `southEastArrowNorth`
     *
     * ```
     *		[ Target ]
     *		         ^
     *		+-----------------+
     *		|     Balloon     |
     *		+-----------------+
     * ```
     *
     * * `southEastArrowNorthMiddleEast`
     *
     * ```
     *		     [ Target ]
     *		              ^
     *		+-----------------+
     *		|     Balloon     |
     *		+-----------------+
     * ```
     *
     * * `southEastArrowNorthEast`
     *
     * ```
     *		        [ Target ]
     *		                 ^
     *		+-----------------+
     *		|     Balloon     |
     *		+-----------------+
     * ```
     *
     * **West**
     *
     * * `westArrowEast`
     *
     * ```
     *		+-----------------+
     *		|     Balloon     |>[ Target ]
     *		+-----------------+
     * ```
     *
     * **East**
     *
     * * `eastArrowWest`
     *
     * ```
     *		           +-----------------+
     *		[ Target ]<|     Balloon     |
     *		           +-----------------+
     * ```
     *
     * **Sticky**
     *
     * * `viewportStickyNorth`
     *
     * ```
     *		    +---------------------------+
     *		    |        [ Target ]         |
     *		    |                           |
     *		+-----------------------------------+
     *		|   |    +-----------------+    |   |
     *		|   |    |     Balloon     |    |   |
     *		|   |    +-----------------+    |   |
     *		|   |                           |   |
     *		|   |                           |   |
     *		|   |                           |   |
     *		|   |                           |   |
     *		|   +---------------------------+   |
     *		|             Viewport              |
     *		+-----------------------------------+
     * ```
     *
     * See {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView#attachTo}.
     *
     * Positioning functions must be compatible with {@link module:utils/dom/position~DomPoint}.
     *
     * Default positioning functions with customized offsets can be generated using
     * {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView.generatePositions}.
     *
     * The name that the position function returns will be reflected in the balloon panel's class that
     * controls the placement of the "arrow". See {@link #position} to learn more.
     */
    static defaultPositions: Record<string, PositioningFunction>;
}
