/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module basic-styles/italic/italicediting
 */
import { Plugin } from 'ckeditor5/src/core.js';
/**
 * The italic editing feature.
 *
 * It registers the `'italic'` command, the <kbd>Ctrl+I</kbd> keystroke and introduces the `italic` attribute in the model
 * which renders to the view as an `<i>` element.
 */
export declare class ItalicEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "ItalicEditing";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
}
