/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module html-support/fullpage
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { logWarning, global } from 'ckeditor5/src/utils.js';
import { ViewUpcastWriter } from 'ckeditor5/src/engine.js';
import { HtmlPageDataProcessor } from './htmlpagedataprocessor.js';
/**
 * The full page editing feature. It preserves the whole HTML page in the editor data.
 */
export class FullPage extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'FullPage';
    }
    /**
     * @inheritDoc
     * @internal
     */
    static get licenseFeatureCode() {
        return 'FPH';
    }
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin() {
        return true;
    }
    /**
     * @inheritDoc
     */
    static get isPremiumPlugin() {
        return true;
    }
    /**
     * @inheritDoc
     */
    constructor(editor) {
        super(editor);
        editor.config.define('htmlSupport.fullPage', {
            allowRenderStylesFromHead: false,
            sanitizeCss: rawCss => {
                /**
                 * When using the Full page with the `config.htmlSupport.fullPage.allowRenderStylesFromHead` set to `true`,
                 * it is strongly recommended to define a sanitize function that will clean up the CSS
                 * which is present in the `<head>` in editors content in order to avoid XSS vulnerability.
                 *
                 * For a detailed overview, check the {@glink features/html/full-page-html Full page HTML feature} documentation.
                 *
                 * @error css-full-page-provide-sanitize-function
                 */
                logWarning('css-full-page-provide-sanitize-function');
                return {
                    css: rawCss,
                    hasChanged: false
                };
            }
        });
        editor.data.processor = new HtmlPageDataProcessor(editor.data.viewDocument);
    }
    /**
     * @inheritDoc
     */
    init() {
        const editor = this.editor;
        const properties = ['$fullPageDocument', '$fullPageDocType', '$fullPageXmlDeclaration', '$fullPageHeadStyles'];
        editor.model.schema.extend('$root', {
            allowAttributes: properties
        });
        // Apply custom properties from view document fragment to the model root attributes.
        editor.data.on('toModel', (evt, [viewElementOrFragment]) => {
            const root = editor.model.document.getRoot();
            editor.model.change(writer => {
                for (const name of properties) {
                    const value = viewElementOrFragment.getCustomProperty(name);
                    if (value) {
                        writer.setAttribute(name, value, root);
                    }
                }
            });
            if (isAllowedRenderStylesFromHead(editor)) {
                this._renderStylesFromHead(root);
            }
        }, { priority: 'low' });
        // Apply root attributes to the view document fragment.
        editor.data.on('toView', (evt, [modelElementOrFragment]) => {
            if (!modelElementOrFragment.is('rootElement')) {
                return;
            }
            const root = modelElementOrFragment;
            const viewFragment = evt.return;
            if (!root.hasAttribute('$fullPageDocument')) {
                return;
            }
            const writer = new ViewUpcastWriter(viewFragment.document);
            for (const name of properties) {
                const value = root.getAttribute(name);
                if (value) {
                    writer.setCustomProperty(name, value, viewFragment);
                }
            }
        }, { priority: 'low' });
        // Clear root attributes related to full page editing on editor content reset.
        editor.data.on('set', () => {
            const root = editor.model.document.getRoot();
            editor.model.change(writer => {
                for (const name of properties) {
                    if (root.hasAttribute(name)) {
                        writer.removeAttribute(name, root);
                    }
                }
            });
        }, { priority: 'high' });
        // Make sure that document is returned even if there is no content in the page body.
        editor.data.on('get', (evt, args) => {
            if (!args[0]) {
                args[0] = {};
            }
            args[0].trim = false;
        }, { priority: 'high' });
    }
    /**
     * @inheritDoc
     */
    destroy() {
        super.destroy();
        if (isAllowedRenderStylesFromHead(this.editor)) {
            this._removeStyleElementsFromDom();
        }
    }
    /**
     * Checks if in the document exists any `<style>` elements injected by the plugin and removes them,
     * so these could be re-rendered later.
     * There is used `data-full-page-style-id` attribute to recognize styles injected by the feature.
     */
    _removeStyleElementsFromDom() {
        const existingStyleElements = Array.from(global.document.querySelectorAll(`[data-full-page-style-id="${this.editor.id}"]`));
        for (const style of existingStyleElements) {
            style.remove();
        }
    }
    /**
     * Extracts `<style>` elements from the full page data and renders them in the main document `<head>`.
     * CSS content is sanitized before rendering.
     */
    _renderStyleElementsInDom(root) {
        const editor = this.editor;
        // Get `<style>` elements list from the `<head>` from the full page data.
        const styleElements = root.getAttribute('$fullPageHeadStyles');
        if (!styleElements) {
            return;
        }
        const sanitizeCss = editor.config.get('htmlSupport.fullPage.sanitizeCss');
        // Add `data-full-page-style-id` attribute to the `<style>` element and render it in `<head>` in the main document.
        for (const style of styleElements) {
            style.setAttribute('data-full-page-style-id', editor.id);
            // Sanitize the CSS content before rendering it in the editor.
            const sanitizedCss = sanitizeCss(style.innerText);
            if (sanitizedCss.hasChanged) {
                style.innerText = sanitizedCss.css;
            }
            global.document.head.append(style);
        }
    }
    /**
     * Removes existing `<style>` elements injected by the plugin and renders new ones from the full page data.
     */
    _renderStylesFromHead(root) {
        this._removeStyleElementsFromDom();
        this._renderStyleElementsInDom(root);
    }
}
/**
 * Normalize the Full page configuration option `allowRenderStylesFromHead`.
 */
function isAllowedRenderStylesFromHead(editor) {
    return editor.config.get('htmlSupport.fullPage.allowRenderStylesFromHead');
}
