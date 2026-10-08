/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { View } from '../view.js';
import '../../theme/components/menubar/menubarmenupanel.css';
/**
 * A view representing a {@link module:ui/menubar/menubarmenuview~MenuBarMenuView#panelView} of a menu.
 */
export class MenuBarMenuPanelView extends View {
    /**
     * Collection of the child views in this panel.
     */
    children;
    /**
     * Creates an instance of the menu panel view.
     *
     * @param locale The localization services instance.
     */
    constructor(locale) {
        super(locale);
        const bind = this.bindTemplate;
        this.set('isVisible', false);
        this.set('position', 'se');
        this.children = this.createCollection();
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-reset',
                    'ck-menu-bar__menu__panel',
                    bind.to('position', value => `ck-menu-bar__menu__panel_position_${value}`),
                    bind.if('isVisible', 'ck-hidden', value => !value)
                ],
                tabindex: '-1'
            },
            children: this.children,
            on: {
                // Drag and drop in the panel should not break the selection in the editor.
                // https://github.com/ckeditor/ckeditor5-ui/issues/228
                selectstart: bind.to(evt => {
                    if (evt.target.tagName.toLocaleLowerCase() === 'input') {
                        return;
                    }
                    evt.preventDefault();
                })
            }
        });
    }
    /**
     * Focuses the first child of the panel (default) or the last one if the `direction` is `-1`.
     */
    focus(direction = 1) {
        if (this.children.length) {
            if (direction === 1) {
                this.children.first.focus();
            }
            else {
                this.children.last.focus();
            }
        }
    }
}
