/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/iframe/iframeview
 */
import { View } from '../view.js';
import type { Locale } from '@ckeditor/ckeditor5-utils';
/**
 * The iframe view class.
 *
 * ```ts
 * const iframe = new IframeView();
 *
 * iframe.render();
 * document.body.appendChild( iframe.element );
 *
 * iframe.on( 'loaded', () => {
 * 	console.log( 'The iframe has loaded', iframe.element.contentWindow );
 * } );
 *
 * iframe.element.src = 'https://ckeditor.com';
 * ```
 */
export declare class IframeView extends View<HTMLIFrameElement> {
    /**
     * Creates a new instance of the iframe view.
     *
     * @param locale The locale instance.
     */
    constructor(locale?: Locale);
    /**
     * Renders the iframe's {@link #element} and returns a `Promise` for asynchronous
     * child `contentDocument` loading process.
     *
     * @returns A promise which resolves once the iframe `contentDocument` has
     * been {@link #event:loaded}.
     */
    render(): Promise<unknown>;
}
/**
 * Fired when the DOM iframe's `contentDocument` finished loading.
 *
 * @eventName ~IframeView#loaded
 */
export type IframeViewLoadedEvent = {
    name: 'loaded';
    args: [];
};
