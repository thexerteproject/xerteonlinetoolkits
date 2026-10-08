/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
export type IfTrue<T> = T extends true ? true : never;
/**
 * Makes any page `HTMLElement` or `Range` (`target`) visible inside the browser viewport.
 * This helper will scroll all `target` ancestors and the web browser viewport to reveal the target to
 * the user. If the `target` is already visible, nothing will happen.
 *
 * @param options Additional configuration of the scrolling behavior.
 * @param options.target A target, which supposed to become visible to the user.
 * @param options.viewportOffset An offset from the edge of the viewport (in pixels)
 * the `target` will be moved by if the viewport is scrolled. It enhances the user experience
 * by keeping the `target` some distance from the edge of the viewport and thus making it easier to
 * read or edit by the user.
 * @param options.ancestorOffset An offset from the boundary of scrollable ancestors (if any)
 * the `target` will be moved by if the viewport is scrolled. It enhances the user experience
 * by keeping the `target` some distance from the edge of the ancestors and thus making it easier to
 * read or edit by the user.
 * @param options.alignToTop When set `true`, the helper will make sure the `target` is scrolled up
 * to the top boundary of the viewport and/or scrollable ancestors if scrolled up. When not set
 * (default), the `target` will be revealed by scrolling as little as possible. This option will
 * not affect `targets` that must be scrolled down because they will appear at the top of the boundary
 * anyway.
 *
 * ```
 *                                             scrollViewportToShowTarget() with            scrollViewportToShowTarget() with
 *          Initial state                        alignToTop unset (default)                        alignToTop = true
 *
 * ┌────────────────────────────────┬─┐       ┌────────────────────────────────┬─┐        ┌────────────────────────────────┬─┐
 * │                                │▲│       │                                │▲│        │   [ Target to be revealed ]    │▲│
 * │                                │ │       │                                │ │        │                                │ │
 * │                                │█│       │                                │ │        │                                │ │
 * │                                │█│       │                                │ │        │                                │ │
 * │                                │ │       │                                │█│        │                                │ │
 * │                                │ │       │                                │█│        │                                │█│
 * │                                │ │       │                                │ │        │                                │█│
 * │                                │▼│       │   [ Target to be revealed ]    │▼│        │                                │▼│
 * └────────────────────────────────┴─┘       └────────────────────────────────┴─┘        └────────────────────────────────┴─┘
 *
 *
 *     [ Target to be revealed ]
 *```
 *
 * @param options.forceScroll When set `true`, the `target` will be aligned to the top of the viewport
 * and scrollable ancestors whether it is already visible or not. This option will only work when `alignToTop`
 * is `true`
 */
export declare function scrollViewportToShowTarget<T extends boolean, U extends IfTrue<T>>({ target, viewportOffset, ancestorOffset, alignToTop, forceScroll }: {
    readonly target: HTMLElement | Range;
    readonly viewportOffset?: number | {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
    readonly ancestorOffset?: number;
    readonly alignToTop?: T;
    readonly forceScroll?: U;
}): void;
/**
 * Makes any page `HTMLElement` or `Range` (target) visible within its scrollable ancestors,
 * e.g. if they have `overflow: scroll` CSS style.
 *
 * @param target A target, which supposed to become visible to the user.
 * @param ancestorOffset An offset between the target and the boundary of scrollable ancestors
 * to be maintained while scrolling.
 * @param limiterElement The outermost ancestor that should be scrolled. If specified, it can prevent
 * scrolling the whole page.
 * @param alignToTop When set `true`, the function will make sure the `target` is scrolled up
 * to the top boundary of the scrollable ancestors if scrolled up. When not set (default), the `target`
 * will be revealed by scrolling as little as possible. This option will not affect target elements that must be
 * scrolled down because they will appear at the top of the boundary anyway.
 * @param forceScroll When set `true`, the `target` will be aligned to the top of scrollable ancestors
 * whether it is already visible or not. This option will only work when `alignToTop` is `true`
 */
export declare function scrollAncestorsToShowTarget(target: HTMLElement | Range, ancestorOffset?: number, limiterElement?: HTMLElement, alignToTop?: boolean, forceScroll?: true): void;
