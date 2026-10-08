/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module html-support/fullpage
 */
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
/**
 * The full page editing feature. It preserves the whole HTML page in the editor data.
 */
export declare class FullPage extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "FullPage";
    /**
     * @inheritDoc
     * @internal
     */
    static get licenseFeatureCode(): string;
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get isPremiumPlugin(): true;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Checks if in the document exists any `<style>` elements injected by the plugin and removes them,
     * so these could be re-rendered later.
     * There is used `data-full-page-style-id` attribute to recognize styles injected by the feature.
     */
    private _removeStyleElementsFromDom;
    /**
     * Extracts `<style>` elements from the full page data and renders them in the main document `<head>`.
     * CSS content is sanitized before rendering.
     */
    private _renderStyleElementsInDom;
    /**
     * Removes existing `<style>` elements injected by the plugin and renders new ones from the full page data.
     */
    private _renderStylesFromHead;
}
