/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { BalloonPanelView } from '../../panel/balloon/balloonpanelview.js';
import '../../../theme/components/dropdown/menu/dropdownmenupanel.css';
/**
 * Represents the view for the dropdown menu panel.
 */
export class DropdownMenuNestedMenuPanelView extends BalloonPanelView {
    /**
     * Creates an instance of the menu panel view.
     *
     * @param locale The localization services instance.
     */
    constructor(locale) {
        super(locale);
        const bind = this.bindTemplate;
        this.set({
            isVisible: false,
            position: 'se',
            class: null,
            top: 0,
            left: 0
        });
        this.extendTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck-reset',
                    'ck-dropdown-menu__nested-menu__panel'
                ],
                tabindex: '-1'
            },
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
     *
     * @param direction The direction to focus. Default is `1`.
     */
    focus(direction = 1) {
        const { content } = this;
        if (content.length) {
            if (direction === 1) {
                content.first.focus();
            }
            else {
                content.last.focus();
            }
        }
    }
}
