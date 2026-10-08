/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module link/ui/linkpreviewbuttonview
 */
import { ButtonView } from 'ckeditor5/src/ui.js';
import type { Locale } from 'ckeditor5/src/utils.js';
/**
 * The link button class. Rendered as an `<a>` tag with link opening in a new tab.
 *
 * Provides a custom `navigate` cancelable event.
 */
export declare class LinkPreviewButtonView extends ButtonView {
    /**
     * The value of the "href" attribute of the link.
     *
     * @observable
     */
    href: string | undefined;
    /**
     * @inheritDoc
     */
    constructor(locale: Locale);
}
/**
 * Fired when the button view is clicked.
 *
 * @eventName ~LinkPreviewButtonView#navigate
 */
export type LinkPreviewButtonNavigateEvent = {
    name: 'navigate';
    args: [href: string, cancel: () => void];
};
