/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/iframe/iframeview
 */
import { View } from '../view.js';
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
export class IframeView extends View {
    /**
     * Creates a new instance of the iframe view.
     *
     * @param locale The locale instance.
     */
    constructor(locale) {
        super(locale);
        const bind = this.bindTemplate;
        this.setTemplate({
            tag: 'iframe',
            attributes: {
                class: [
                    'ck',
                    'ck-reset_all'
                ],
                // It seems that we need to allow scripts in order to be able to listen to events.
                // TODO: Research that. Perhaps the src must be set?
                sandbox: 'allow-same-origin allow-scripts'
            },
            on: {
                load: bind.to('loaded')
            }
        });
    }
    /**
     * Renders the iframe's {@link #element} and returns a `Promise` for asynchronous
     * child `contentDocument` loading process.
     *
     * @returns A promise which resolves once the iframe `contentDocument` has
     * been {@link #event:loaded}.
     */
    render() {
        return new Promise(resolve => {
            this.on('loaded', resolve);
            return super.render();
        });
    }
}
