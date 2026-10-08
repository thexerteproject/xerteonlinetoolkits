/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module html-embed/htmlembedediting
 */
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import '../theme/htmlembed.css';
/**
 * The HTML embed editing feature.
 */
export declare class HtmlEmbedEditing extends Plugin {
    /**
     * Keeps references to {@link module:ui/button/buttonview~ButtonView edit, save, and cancel} button instances created for
     * each widget so they can be destroyed if they are no longer in DOM after the editing view was re-rendered.
     */
    private _widgetButtonViewReferences;
    /**
     * @inheritDoc
     */
    static get pluginName(): "HtmlEmbedEditing";
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
     * Prepares converters for the feature.
     */
    private _setupConversion;
}
/**
 * The API exposed on each raw HTML embed widget so other features can control a particular widget.
 *
 * @internal
 */
export interface RawHtmlApi {
    makeEditable(): void;
    save(newValue: string): void;
    cancel(): void;
}
