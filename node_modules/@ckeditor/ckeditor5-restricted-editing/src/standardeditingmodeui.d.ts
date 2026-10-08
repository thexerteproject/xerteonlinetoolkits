/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module restricted-editing/standardeditingmodeui
 */
import { Plugin } from 'ckeditor5/src/core.js';
/**
 * The standard editing mode UI feature.
 *
 * It introduces the `'restrictedEditingException'` button that marks text as unrestricted for editing.
 */
export declare class StandardEditingModeUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "StandardEditingModeUI";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Creates a button for restricted editing exception command to use either in toolbar or in menu bar.
     */
    private _createButton;
}
