/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/focuscycler
 */
import { type ArrayOrItem, type FocusTracker, type KeystrokeHandler, type KeystrokeHandlerOptions } from '@ckeditor/ckeditor5-utils';
import { type View } from './view.js';
import { type ViewCollection } from './viewcollection.js';
declare const FocusCycler_base: {
    new (): import("@ckeditor/ckeditor5-utils").Emitter;
    prototype: import("@ckeditor/ckeditor5-utils").Emitter;
};
/**
 * A utility class that helps cycling over {@link module:ui/focuscycler~FocusableView focusable views} in a
 * {@link module:ui/viewcollection~ViewCollection} when the focus is tracked by the
 * {@link module:utils/focustracker~FocusTracker} instance. It helps implementing keyboard
 * navigation in HTML forms, toolbars, lists and the like.
 *
 * To work properly it requires:
 * * a collection of focusable (HTML `tabindex` attribute) views that implement the `focus()` method,
 * * an associated focus tracker to determine which view is focused.
 *
 * A simple cycler setup can look like this:
 *
 * ```ts
 * const focusables = new ViewCollection<FocusableView>();
 * const focusTracker = new FocusTracker();
 *
 * // Add focusable views to the focus tracker.
 * focusTracker.add( ... );
 * ```
 *
 * Then, the cycler can be used manually:
 *
 * ```ts
 * const cycler = new FocusCycler( { focusables, focusTracker } );
 *
 * // Will focus the first focusable view in #focusables.
 * cycler.focusFirst();
 *
 * // Will log the next focusable item in #focusables.
 * console.log( cycler.next );
 * ```
 *
 * Alternatively, it can work side by side with the {@link module:utils/keystrokehandler~KeystrokeHandler}:
 *
 * ```ts
 * const keystrokeHandler = new KeystrokeHandler();
 *
 * // Activate the keystroke handler.
 * keystrokeHandler.listenTo( sourceOfEvents );
 *
 * const cycler = new FocusCycler( {
 * 	focusables, focusTracker, keystrokeHandler,
 * 	actions: {
 * 		// When arrowup of arrowleft is detected by the #keystrokeHandler,
 * 		// focusPrevious() will be called on the cycler.
 * 		focusPrevious: [ 'arrowup', 'arrowleft' ],
 * 	}
 * } );
 * ```
 *
 * Check out the {@glink framework/deep-dive/ui/focus-tracking "Deep dive into focus tracking"} guide to learn more.
 */
export declare class FocusCycler extends /* #__PURE__ */ FocusCycler_base {
    /**
     * A {@link module:ui/focuscycler~FocusableView focusable views} collection that the cycler operates on.
     */
    readonly focusables: ViewCollection<FocusableView>;
    /**
     * A focus tracker instance that the cycler uses to determine the current focus
     * state in {@link #focusables}.
     */
    readonly focusTracker: FocusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}
     * which can respond to certain keystrokes and cycle the focus.
     */
    readonly keystrokeHandler?: KeystrokeHandler;
    /**
     * Actions that the cycler can take when a keystroke is pressed. Requires
     * `options.keystrokeHandler` to be passed and working. When an action is
     * performed, `preventDefault` and `stopPropagation` will be called on the event
     * the keystroke fired in the DOM.
     *
     * ```ts
     * actions: {
     * 	// Will call #focusPrevious() when arrowleft or arrowup is pressed.
     * 	focusPrevious: [ 'arrowleft', 'arrowup' ],
     *
     * 	// Will call #focusNext() when arrowdown is pressed.
     * 	focusNext: 'arrowdown'
     * }
     * ```
     */
    readonly actions?: FocusCyclerActions;
    /**
     * Creates an instance of the focus cycler utility.
     *
     * @param options Configuration options.
     */
    constructor(options: {
        focusables: ViewCollection<FocusableView>;
        focusTracker: FocusTracker;
        keystrokeHandler?: KeystrokeHandler;
        keystrokeHandlerOptions?: KeystrokeHandlerOptions;
        actions?: FocusCyclerActions;
    });
    /**
     * Returns the first focusable view in {@link #focusables}.
     * Returns `null` if there is none.
     *
     * **Note**: Hidden views (e.g. with `display: none`) are ignored.
     */
    get first(): FocusableView | null;
    /**
     * Returns the last focusable view in {@link #focusables}.
     * Returns `null` if there is none.
     *
     * **Note**: Hidden views (e.g. with `display: none`) are ignored.
     */
    get last(): FocusableView | null;
    /**
     * Returns the next focusable view in {@link #focusables} based on {@link #current}.
     * Returns `null` if there is none.
     *
     * **Note**: Hidden views (e.g. with `display: none`) are ignored.
     */
    get next(): FocusableView | null;
    /**
     * Returns the previous focusable view in {@link #focusables} based on {@link #current}.
     * Returns `null` if there is none.
     *
     * **Note**: Hidden views (e.g. with `display: none`) are ignored.
     */
    get previous(): FocusableView | null;
    /**
     * An index of the view in the {@link #focusables} which is focused according
     * to {@link #focusTracker}. Returns `null` when there is no such view.
     */
    get current(): number | null;
    /**
     * Focuses the {@link #first} item in {@link #focusables}.
     *
     * **Note**: Hidden views (e.g. with `display: none`) are ignored.
     */
    focusFirst(): void;
    /**
     * Focuses the {@link #last} item in {@link #focusables}.
     *
     * **Note**: Hidden views (e.g. with `display: none`) are ignored.
     */
    focusLast(): void;
    /**
     * Focuses the {@link #next} item in {@link #focusables}.
     *
     * **Note**: Hidden views (e.g. with `display: none`) are ignored.
     */
    focusNext(): void;
    /**
     * Focuses the {@link #previous} item in {@link #focusables}.
     *
     * **Note**: Hidden views (e.g. with `display: none`) are ignored.
     */
    focusPrevious(): void;
    /**
     * Allows for creating continuous focus cycling across multiple focus cyclers and their collections of {@link #focusables}.
     *
     * It starts listening to the {@link module:ui/focuscycler~FocusCyclerForwardCycleEvent} and
     * {@link module:ui/focuscycler~FocusCyclerBackwardCycleEvent} events of the chained focus cycler and engages,
     * whenever the user reaches the last (forwards navigation) or first (backwards navigation) focusable view
     * and would normally start over. Instead, the navigation continues on the higher level (flattens).
     *
     * For instance, for the following nested focus navigation structure, the focus would get stuck the moment
     * the AB gets focused and its focus cycler starts managing it:
     *
     *	   ┌────────────┐   ┌──────────────────────────────────┐   ┌────────────┐
     *	   │ AA         │   │ AB                               │   │ AC         │
     *	   │            │   │                                  │   │            │
     *	   │            │   │    ┌─────┐  ┌─────┐  ┌─────┐     │   │            │
     *	   │            │   │ ┌──► ABA ├──► ABB ├──► ABC ├───┐ │   │            │
     *	   │            ├───► │  └─────┘  └─────┘  └─────┘   │ │   │            │
     *	   │            │   │ │                              │ │   │            │
     *	   │            │   │ │                              │ │   │            │
     *	   │            │   │ └──────────────────────────────┘ │   │            │
     *	   │            │   │                                  │   │            │
     *	   └────────────┘   └──────────────────────────────────┘   └────────────┘
     *
     * Chaining a focus tracker that manages AA, AB, and AC with the focus tracker that manages ABA, ABB, and ABC
     * creates a seamless navigation experience instead:
     *
     *	   ┌────────────┐   ┌──────────────────────────────────┐   ┌────────────┐
     *	   │ AA         │   │ AB                               │   │ AC         │
     *	   │            │   │                                  │   │            │
     *	   │            │   │    ┌─────┐  ┌─────┐  ┌─────┐     │   │            │
     *	   │            │   │ ┌──► ABA ├──► ABB ├──► ABC ├──┐  │   │            │
     *	┌──►            ├───┼─┘  └─────┘  └─────┘  └─────┘  └──┼───►            ├──┐
     *	│  │            │   │                                  │   │            │  │
     *	│  │            │   │                                  │   │            │  │
     *	│  │            │   │                                  │   │            │  │
     *	│  │            │   │                                  │   │            │  │
     *	│  └────────────┘   └──────────────────────────────────┘   └────────────┘  │
     *	│                                                                          │
     *	│                                                                          │
     *	└──────────────────────────────────────────────────────────────────────────┘
     *
     * See {@link #unchain} to reverse the chaining.
     */
    chain(chainedFocusCycler: FocusCycler): void;
    /**
     * Reverses a chaining made by {@link #chain}.
     */
    unchain(otherFocusCycler: FocusCycler): void;
    /**
     * Focuses the given view if it exists.
     *
     * @param view The view to be focused
     * @param direction The direction of the focus if the view has focusable children.
     * @returns
     */
    private _focus;
    /**
     * Returns the next or previous focusable view in {@link #focusables} with respect
     * to {@link #current}.
     *
     * @param step Either `1` for checking forward from {@link #current} or `-1` for checking backwards.
     */
    private _getDomFocusableItem;
}
/**
 * A {@link module:ui/view~View} that can be focused (e.g. has `focus()` method).
 */
export type FocusableView = View & {
    /**
     * Focuses the view.
     *
     * @param direction This optional parameter helps improve the UX by providing additional information about the direction the focus moved
     * (e.g. in a complex view or a form). It is useful for views that host multiple focusable children (e.g. lists, toolbars):
     * * `1` indicates that the focus moved forward and, in most cases, the first child of the focused view should get focused,
     * * `-1` indicates that the focus moved backwards, and the last focusable child should get focused
     *
     * See {@link module:ui/focuscycler~FocusCycler#event:forwardCycle} and {@link module:ui/focuscycler~FocusCycler#event:backwardCycle}
     * to learn more.
     */
    focus(direction?: 1 | -1): void;
};
/**
 * A {@link module:ui/view~View} that hosts one or more of focusable children being managed by a {@link module:ui/focuscycler~FocusCycler}
 * instance exposed under `focusCycler` property.
 */
export type ViewWithFocusCycler = FocusableView & {
    focusCycler: FocusCycler;
};
export type FocusCyclerActions = {
    [key in 'focusFirst' | 'focusLast' | 'focusPrevious' | 'focusNext']?: ArrayOrItem<string>;
};
/**
 * Fired when the focus cycler is about to move the focus from the last focusable item
 * to the first one.
 *
 * @eventName ~FocusCycler#forwardCycle
 */
export type FocusCyclerForwardCycleEvent = {
    name: 'forwardCycle';
    args: [];
};
/**
 * Fired when the focus cycler is about to move the focus from the first focusable item
 * to the last one.
 *
 * @eventName ~FocusCycler#backwardCycle
 */
export type FocusCyclerBackwardCycleEvent = {
    name: 'backwardCycle';
    args: [];
};
/**
 * Checks whether a view is {@link ~FocusableView}.
 *
 * @param view A view to be checked.
 */
export declare function isFocusable(view: View): view is FocusableView;
/**
 * Checks whether a view is an instance of {@link ~ViewWithFocusCycler}.
 *
 * @param view A view to be checked.
 */
export declare function isViewWithFocusCycler(view: View): view is ViewWithFocusCycler;
export {};
