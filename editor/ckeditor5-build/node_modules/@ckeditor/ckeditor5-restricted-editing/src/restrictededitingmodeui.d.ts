/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module restricted-editing/restrictededitingmodeui
 */
import { Plugin } from 'ckeditor5/src/core.js';
/**
 * The restricted editing mode UI feature.
 *
 * It introduces the `'restrictedEditing'` dropdown that offers tools to navigate between exceptions across
 * the document.
 */
export declare class RestrictedEditingModeUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "RestrictedEditingModeUI";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Creates a button for restricted editing command to use in menu bar.
     */
    private _createMenuBarButton;
    /**
     * Returns a definition of the navigation button to be used in the dropdown.
     *
     * @param commandName The name of the command that the button represents.
     * @param label The translated label of the button.
     * @param keystroke The button keystroke.
     */
    private _getButtonDefinition;
    /**
     * Returns definitions for UI buttons.
     *
     * @internal
     */
    private _getButtonDefinitions;
}
