/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * A helper which executes a native `Event.preventDefault()` if the target of an event equals the
 * {@link module:ui/view~View#element element of the view}. It shortens the definition of a
 * {@link module:ui/view~View#template template}.
 *
 * ```ts
 * // In a class extending View.
 * import { preventDefault } from '@ckeditor/ckeditor5-ui/src/bindings/preventdefault';
 *
 * // ...
 *
 * this.setTemplate( {
 * 	tag: 'div',
 *
 * 	on: {
 * 		// Prevent the default mousedown action on this view.
 * 		mousedown: preventDefault( this )
 * 	}
 * } );
 * ```
 *
 * @param view View instance that defines the template.
 * @internal
 */
export function preventDefault(view) {
    return view.bindTemplate.to(evt => {
        if (evt.target === view.element) {
            evt.preventDefault();
        }
    });
}
