/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * A mixin that brings the possibility to temporarily disable CSS transitions using
 * {@link module:ui/view~View} methods. It is helpful when, for instance, the transitions should not happen
 * when the view is first displayed but they should work normal in other cases.
 *
 * The methods to control the CSS transitions are:
 * * `disableCssTransitions()` – Adds the `.ck-transitions-disabled` class to the
 * {@link module:ui/view~View#element view element}.
 * * `enableCssTransitions()` – Removes the `.ck-transitions-disabled` class from the
 * {@link module:ui/view~View#element view element}.
 *
 * The usage comes down to:
 *
 * ```ts
 * const MyViewWithCssTransitionDisabler = CssTransitionDisablerMixin( MyView );
 * const view = new MyViewWithCssTransitionDisabler();
 *
 * // ...
 *
 * view.disableCssTransitions();
 * view.show();
 * view.enableCssTransitions();
 * ```
 *
 * @param view View instance that should get this functionality.
 */
export function CssTransitionDisablerMixin(view) {
    class Mixin extends view {
        disableCssTransitions() {
            this._isCssTransitionsDisabled = true;
        }
        enableCssTransitions() {
            this._isCssTransitionsDisabled = false;
        }
        constructor(...args) {
            super(...args);
            this.set('_isCssTransitionsDisabled', false);
            this.initializeCssTransitionDisablerMixin();
        }
        initializeCssTransitionDisablerMixin() {
            if (this.template) {
                this.extendTemplate({
                    attributes: {
                        class: [
                            this.bindTemplate.if('_isCssTransitionsDisabled', 'ck-transitions-disabled')
                        ]
                    }
                });
            }
        }
    }
    return Mixin;
}
;
