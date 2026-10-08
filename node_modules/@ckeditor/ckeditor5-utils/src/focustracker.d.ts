/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import type { View } from '@ckeditor/ckeditor5-ui';
declare const FocusTracker_base: import("./mix.js").Mixed<{
    new (): import("./observablemixin.js").Observable;
    prototype: import("./observablemixin.js").Observable;
}, import("./dom/emittermixin.js").DomEmitter>;
/**
 * Allows observing a group of DOM `Element`s or {@link module:ui/view~View view instances} whether at least one of them (or their child)
 * is focused.
 *
 * Used by the {@link module:core/editor/editor~Editor} in order to track whether the focus is still within the application,
 * or were used outside of its UI.
 *
 * **Note** `focus` and `blur` listeners use event capturing, so it is only needed to register wrapper `Element`
 * which contain other `focusable` elements. But note that this wrapper element has to be focusable too
 * (have e.g. `tabindex="-1"`).
 *
 * Check out the {@glink framework/deep-dive/ui/focus-tracking "Deep dive into focus tracking"} guide to learn more.
 */
export declare class FocusTracker extends /* #__PURE__ */ FocusTracker_base {
    /**
     * True when one of the registered {@link #elements} or {@link #externalViews} is focused.
     *
     * @readonly
     * @observable
     */
    isFocused: boolean;
    /**
     * The currently focused element.
     *
     * While {@link #isFocused `isFocused`} remains `true`, the focus can move between different UI elements. This property tracks those
     * elements and tells which one is currently focused.
     *
     * **Note**: The values of this property are restricted to {@link #elements} or {@link module:ui/view~View#element elements}
     * registered in {@link #externalViews}.
     *
     * @readonly
     * @observable
     */
    focusedElement: Element | null;
    /**
     * List of registered DOM elements.
     *
     * @internal
     */
    _elements: Set<Element>;
    /**
     * List of views with external focus trackers that contribute to the state of this focus tracker.
     *
     * @internal
     */
    _externalViews: Set<ViewWithFocusTracker>;
    /**
     * Asynchronous blur event timeout.
     */
    private _blurTimeout;
    constructor();
    /**
     * List of registered DOM elements.
     *
     * **Note**: The list does do not include elements from {@link #externalViews}.
     */
    get elements(): Array<Element>;
    /**
     * List of external focusable views that contribute to the state of this focus tracker. See {@link #add} to learn more.
     */
    get externalViews(): Array<ViewWithFocusTracker>;
    /**
     * Starts tracking a specified DOM element or a {@link module:ui/view~View} instance.
     *
     * * If a DOM element is passed, the focus tracker listens to the `focus` and `blur` events on this element.
     * Tracked elements are listed in {@link #elements}.
     * * If a {@link module:ui/view~View} instance is passed that has a `FocusTracker` instance ({@link ~ViewWithFocusTracker}),
     * the external focus tracker's state ({@link #isFocused}, {@link #focusedElement}) starts contributing to the current tracker instance.
     * This allows for increasing the "reach" of a focus tracker instance, by connecting two or more focus trackers together when DOM
     * elements they track are located in different subtrees in DOM. External focus trackers are listed in {@link #externalViews}.
     * * If a {@link module:ui/view~View} instance is passed that has no `FocusTracker` (**not** a {@link ~ViewWithFocusTracker}),
     * its {@link module:ui/view~View#element} is used to track focus like any other DOM element.
     */
    add(elementOrView: Element | View): void;
    /**
     * Stops tracking focus in the specified DOM element or a {@link module:ui/view~View view instance}. See {@link #add} to learn more.
     */
    remove(elementOrView: Element | View): void;
    /**
     * Adds a DOM element to the focus tracker and starts listening to the `focus` and `blur` events on it.
     */
    private _addElement;
    /**
     * Removes a DOM element from the focus tracker.
     */
    private _removeElement;
    /**
     * Adds an external {@link module:ui/view~View view instance} to this focus tracker and makes it contribute to this focus tracker's
     * state either by its `View#element` or by its `View#focusTracker` instance.
     */
    private _addView;
    /**
     * Removes an external {@link module:ui/view~View view instance} from this focus tracker.
     */
    private _removeView;
    /**
     * Destroys the focus tracker by:
     * - Disabling all event listeners attached to tracked elements or external views.
     * - Removing all tracked elements and views that were previously added.
     */
    destroy(): void;
    /**
     * Stores currently focused element as {@link #focusedElement} and sets {@link #isFocused} `true`.
     */
    private _focus;
    /**
     * Clears currently {@link #focusedElement} and sets {@link #isFocused} `false`.
     *
     * This method uses `setTimeout()` to change order of `blur` and `focus` events calls, ensuring that moving focus between
     * two elements within a single focus tracker's scope, will not cause `[ blurA, focusB ]` sequence but just `[ focusB ]`.
     * The former would cause a momentary change of `#isFocused` to `false` which is not desired because any logic listening to
     * a focus tracker state would experience UI flashes and glitches as the user focus travels across the UI.
     */
    private _blur;
    /**
     * Clears the asynchronous blur event timeout on demand. See {@link #_blur} to learn more.
     */
    private _clearBlurTimeout;
}
/**
 * A {@link module:ui/view~View} instance with a {@link module:utils/focustracker~FocusTracker} instance exposed
 * at the `#focusTracker` property.
 */
export type ViewWithFocusTracker = View & {
    focusTracker: FocusTracker;
};
/**
 * Checks whether a view is an instance of {@link ~ViewWithFocusTracker}.
 */
export declare function isViewWithFocusTracker(view: any): view is ViewWithFocusTracker;
export {};
