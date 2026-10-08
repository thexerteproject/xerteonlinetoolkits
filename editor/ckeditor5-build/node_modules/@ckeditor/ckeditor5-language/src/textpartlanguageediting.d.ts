/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
/**
 * The text part language editing.
 *
 * Introduces the `'textPartLanguage'` command and the `'language'` model element attribute.
 */
export declare class TextPartLanguageEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "TextPartLanguageEditing";
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
     * @private
     */
    private _defineConverters;
}
