/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { View } from '../view.js';
/**
 * A view displaying an information text related to different states of {@link module:ui/search/text/searchtextview~SearchTextView}.
 *
 * @internal
 */
export class SearchInfoView extends View {
    /**
     * @inheritDoc
     */
    constructor() {
        super();
        const bind = this.bindTemplate;
        this.set({
            isVisible: false,
            primaryText: '',
            secondaryText: ''
        });
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-search__info',
                    bind.if('isVisible', 'ck-hidden', value => !value)
                ],
                tabindex: -1
            },
            children: [
                {
                    tag: 'span',
                    children: [
                        {
                            text: [bind.to('primaryText')]
                        }
                    ]
                },
                {
                    tag: 'span',
                    children: [
                        {
                            text: [bind.to('secondaryText')]
                        }
                    ]
                }
            ]
        });
    }
    /**
     * Focuses the view
     */
    focus() {
        this.element.focus();
    }
}
