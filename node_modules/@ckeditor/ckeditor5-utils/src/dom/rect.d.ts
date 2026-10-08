/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * A helper class representing a `ClientRect` object, e.g. value returned by
 * the native `object.getBoundingClientRect()` method. Provides a set of methods
 * to manipulate the rect and compare it against other rect instances.
 */
export declare class Rect {
    /**
     * The "top" value of the rect.
     *
     * @readonly
     */
    top: number;
    /**
     * The "right" value of the rect.
     *
     * @readonly
     */
    right: number;
    /**
     * The "bottom" value of the rect.
     *
     * @readonly
     */
    bottom: number;
    /**
     * The "left" value of the rect.
     *
     * @readonly
     */
    left: number;
    /**
     * The "width" value of the rect.
     *
     * @readonly
     */
    width: number;
    /**
     * The "height" value of the rect.
     *
     * @readonly
     */
    height: number;
    /**
     * The object this rect is for.
     *
     * @readonly
     */
    private _source;
    /**
     * Creates an instance of rect.
     *
     * ```ts
     * // Rect of an HTMLElement.
     * const rectA = new Rect( document.body );
     *
     * // Rect of a DOM Range.
     * const rectB = new Rect( document.getSelection().getRangeAt( 0 ) );
     *
     * // Rect of a window (web browser viewport).
     * const rectC = new Rect( window );
     *
     * // Rect out of an object.
     * const rectD = new Rect( { top: 0, right: 10, bottom: 10, left: 0, width: 10, height: 10 } );
     *
     * // Rect out of another Rect instance.
     * const rectE = new Rect( rectD );
     *
     * // Rect out of a ClientRect.
     * const rectF = new Rect( document.body.getClientRects().item( 0 ) );
     * ```
     *
     * **Note**: By default a rect of an HTML element includes its CSS borders and scrollbars (if any)
     * ant the rect of a `window` includes scrollbars too. Use {@link #excludeScrollbarsAndBorders}
     * to get the inner part of the rect.
     *
     * @param source A source object to create the rect.
     */
    constructor(source: RectSource);
    /**
     * Returns a clone of the rect.
     *
     * @returns A cloned rect.
     */
    clone(): Rect;
    /**
     * Moves the rect so that its upper–left corner lands in desired `[ x, y ]` location.
     *
     * @param x Desired horizontal location.
     * @param y Desired vertical location.
     * @returns A rect which has been moved.
     */
    moveTo(x: number, y: number): this;
    /**
     * Moves the rect in–place by a dedicated offset.
     *
     * @param x A horizontal offset.
     * @param y A vertical offset
     * @returns A rect which has been moved.
     */
    moveBy(x: number, y: number): this;
    /**
     * Returns a new rect a a result of intersection with another rect.
     */
    getIntersection(anotherRect: Rect): Rect | null;
    /**
     * Returns the area of intersection with another rect.
     *
     * @returns Area of intersection.
     */
    getIntersectionArea(anotherRect: Rect): number;
    /**
     * Returns the area of the rect.
     */
    getArea(): number;
    /**
     * Returns a new rect, a part of the original rect, which is actually visible to the user and is relative to the,`body`,
     * e.g. an original rect cropped by parent element rects which have `overflow` set in CSS
     * other than `"visible"`.
     *
     * If there's no such visible rect, which is when the rect is limited by one or many of
     * the ancestors, `null` is returned.
     *
     * **Note**: This method does not consider the boundaries of the viewport (window).
     * To get a rect cropped by all ancestors and the viewport, use an intersection such as:
     *
     * ```ts
     * const visibleInViewportRect = new Rect( window ).getIntersection( new Rect( source ).getVisible() );
     * ```
     *
     * @returns A visible rect instance or `null`, if there's none.
     */
    getVisible(): Rect | null;
    /**
     * Checks if all property values ({@link #top}, {@link #left}, {@link #right},
     * {@link #bottom}, {@link #width} and {@link #height}) are the equal in both rect
     * instances.
     *
     * @param anotherRect A rect instance to compare with.
     * @returns `true` when Rects are equal. `false` otherwise.
     */
    isEqual(anotherRect: Rect): boolean;
    /**
     * Checks whether a rect fully contains another rect instance.
     *
     * @param anotherRect
     * @returns `true` if contains, `false` otherwise.
     */
    contains(anotherRect: Rect): boolean;
    /**
     * Recalculates screen coordinates to coordinates relative to the positioned ancestor offset.
     */
    toAbsoluteRect(): Rect;
    /**
     * Excludes scrollbars and CSS borders from the rect.
     *
     * * Borders are removed when {@link #_source} is an HTML element.
     * * Scrollbars are excluded from HTML elements and the `window`.
     *
     * @returns A rect which has been updated.
     */
    excludeScrollbarsAndBorders(): this;
    /**
     * Returns an array of rects of the given native DOM Range.
     *
     * @param range A native DOM range.
     * @returns DOM Range rects.
     */
    static getDomRangeRects(range: Range): Array<Rect>;
    /**
     * Returns a bounding rectangle that contains all the given `rects`.
     *
     * @param rects A list of rectangles that should be contained in the result rectangle.
     * @returns Bounding rectangle or `null` if no `rects` were given.
     */
    static getBoundingRect(rects: Iterable<Rect>): Rect | null;
}
/**
 * A source of {@link module:utils/dom/rect~Rect}.
 */
export type RectSource = HTMLElement | Range | Window | DomRectLike;
/**
 * An object that describes properties of `ClientRect` object.
 */
export interface DomRectLike {
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly left: number;
    readonly width: number;
    readonly height: number;
}
