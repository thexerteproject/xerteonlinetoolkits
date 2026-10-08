/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module typing/texttransformation
 */
import { Plugin, type Editor } from '@ckeditor/ckeditor5-core';
/**
 * The text transformation plugin.
 */
export declare class TextTransformation extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly ["Delete", "Input"];
    /**
     * @inheritDoc
     */
    static get pluginName(): "TextTransformation";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Create new TextWatcher listening to the editor for typing and selection events.
     */
    private _enableTransformationWatchers;
}
