/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Rect, type RectSource } from './rect.js';
/**
 * Calculates the `position: absolute` coordinates of a given element so it can be positioned with respect to the
 * target in the visually most efficient way, taking various restrictions like viewport or limiter geometry
 * into consideration.
 *
 * **Note**: If there are no position coordinates found that meet the requirements (arguments of this helper),
 * `null` is returned.
 *
 * ```ts
 * // The element which is to be positioned.
 * const element = document.body.querySelector( '#toolbar' );
 *
 * // A target to which the element is positioned relatively.
 * const target = document.body.querySelector( '#container' );
 *
 * // Finding the optimal coordinates for the positioning.
 * const { left, top, name } = getOptimalPosition( {
 * 	element: element,
 * 	target: target,
 *
 * 	// The algorithm will chose among these positions to meet the requirements such
 * 	// as "limiter" element or "fitInViewport", set below. The positions are considered
 * 	// in the order of the array.
 * 	positions: [
 * 		//
 * 	 	//	[ Target ]
 * 		//	+-----------------+
 * 		//	|     Element     |
 * 		//	+-----------------+
 * 		//
 * 		targetRect => ( {
 * 			top: targetRect.bottom,
 * 			left: targetRect.left,
 * 			name: 'mySouthEastPosition'
 * 		} ),
 *
 * 		//
 * 		//	+-----------------+
 * 		//	|     Element     |
 * 		//	+-----------------+
 * 		//	[ Target ]
 * 		//
 * 		( targetRect, elementRect ) => ( {
 * 			top: targetRect.top - elementRect.height,
 * 			left: targetRect.left,
 * 			name: 'myNorthEastPosition'
 * 		} )
 * 	],
 *
 * 	// Find a position such guarantees the element remains within visible boundaries of <body>.
 * 	limiter: document.body,
 *
 * 	// Find a position such guarantees the element remains within visible boundaries of the browser viewport.
 * 	fitInViewport: true
 * } );
 *
 * // The best position which fits into document.body and the viewport. May be useful
 * // to set proper class on the `element`.
 * console.log( name ); // -> "myNorthEastPosition"
 *
 * // Using the absolute coordinates which has been found to position the element
 * // as in the diagram depicting the "myNorthEastPosition" position.
 * element.style.top = top;
 * element.style.left = left;
 * ```
 *
 * @param options The input data and configuration of the helper.
 */
export declare function getOptimalPosition({ element, target, positions, limiter, fitInViewport, viewportOffsetConfig }: DomOptimalPositionOptions): DomPoint | null;
/**
 * Returns a viewport `Rect` shrunk by the viewport offset config from all sides.
 */
export declare function getConstrainedViewportRect(viewportOffsetConfig: DomOptimalPositionOptions['viewportOffsetConfig']): Rect;
/**
 * A position object which instances are created and used by the {@link module:utils/dom/position~getOptimalPosition} helper.
 *
 * {@link module:utils/dom/position~DomPoint#top} and {@link module:utils/dom/position~DomPoint#left} properties of the position instance
 * translate directly to the `top` and `left` properties in CSS "`position: absolute` coordinate system". If set on the positioned element
 * in DOM, they will make it display it in the right place in the viewport.
 */
export interface DomPoint {
    /**
     * Position name.
     */
    readonly name?: string;
    /**
     * Additional position configuration, as passed from the {@link module:utils/dom/position~PositioningFunction positioning function}.
     *
     * This object can be use, for instance, to pass through presentation options used by the consumer of the
     * {@link module:utils/dom/position~getOptimalPosition} helper.
     */
    readonly config?: object;
    /**
     * The left value in pixels in the CSS `position: absolute` coordinate system.
     * Set it on the positioned element in DOM to move it to the position.
     */
    readonly left: number;
    /**
     * The top value in pixels in the CSS `position: absolute` coordinate system.
     * Set it on the positioned element in DOM to move it to the position.
     */
    readonly top: number;
}
/**
 * The `getOptimalPosition()` helper options.
 */
export interface DomOptimalPositionOptions {
    /**
     * Element that is to be positioned.
     */
    readonly element: HTMLElement;
    /**
     * Target with respect to which the `element` is to be positioned.
     */
    readonly target: RectSource | (() => RectSource);
    /**
     * An array of positioning functions.
     *
     * **Note**: Positioning functions are processed in the order of preference. The first function that works
     * in the current environment (e.g. offers the complete fit in the viewport geometry) will be picked by
     * `getOptimalPosition()`.
     *
     * **Note**: Any positioning function returning `null` is ignored.
     */
    readonly positions: ReadonlyArray<PositioningFunction>;
    /**
     * When set, the algorithm will chose position which fits the most in the
     * limiter's bounding rect.
     */
    readonly limiter?: RectSource | (() => (RectSource | null)) | null;
    /**
     * When set, the algorithm will chose such a position which fits `element`
     * the most inside visible viewport.
     */
    readonly fitInViewport?: boolean;
    /**
     * Viewport offset config object. It restricts the visible viewport available to the `getOptimalPosition()` from each side.
     *
     * ```ts
     * {
     * 	top: 50,
     * 	right: 50,
     * 	bottom: 50,
     * 	left: 50
     * }
     * ```
     */
    readonly viewportOffsetConfig?: {
        readonly top?: number;
        readonly right?: number;
        readonly bottom?: number;
        readonly left?: number;
    };
}
/**
 * A positioning function which, based on positioned element and target {@link module:utils/dom/rect~Rect Rects}, returns rect coordinates
 * representing the geometrical relation between them. Used by the {@link module:utils/dom/position~getOptimalPosition} helper.
 *
 * ```ts
 * // This simple position will place the element directly under the target, in the middle:
 * //
 * //	    [ Target ]
 * //	+-----------------+
 * //	|     Element     |
 * //	+-----------------+
 * //
 * const position = ( targetRect, elementRect, [ viewportRect ] ) => ( {
 * 	top: targetRect.bottom,
 * 	left: targetRect.left + targetRect.width / 2 - elementRect.width / 2,
 * 	name: 'bottomMiddle',
 *
 * 	// Note: The config is optional.
 * 	config: {
 * 		zIndex: '999'
 * 	}
 * } );
 * ```
 *
 * @param elementRect The rect of the element to be positioned.
 * @param targetRect The rect of the target the element (its rect) is relatively positioned to.
 * @param viewportRect The rect of the visual browser viewport.
 * @returns When the function returns `null`, it will not be considered by {@link module:utils/dom/position~getOptimalPosition}.
 */
export type PositioningFunction = (elementRect: Rect, targetRect: Rect, viewportRect: Rect, limiterRect?: Rect) => DomPositioningFunctionResult | null;
/**
 * The result of {@link module:utils/dom/position~PositioningFunction}.
 */
export interface DomPositioningFunctionResult {
    /**
     * The `top` value of the element rect that would represent the position.
     */
    top: number;
    /**
     * The `left` value of the element rect that would represent the position.
     */
    left: number;
    /**
     * The name of the position. It helps the user of the {@link module:utils/dom/position~getOptimalPosition}
     * helper to recognize different positioning function results. It will pass through to the {@link module:utils/dom/position~DomPoint}
     * returned by the helper.
     */
    name?: string;
    /**
     * An optional configuration that will pass-through the {@link module:utils/dom/position~getOptimalPosition} helper
     * to the {@link module:utils/dom/position~DomPoint} returned by this helper.
     * This configuration may, for instance, let the user of {@link module:utils/dom/position~getOptimalPosition} know that this particular
     * position comes with a certain presentation.
     */
    config?: object;
}
