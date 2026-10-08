/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ckbox/ckboxui
 */
import { Plugin } from 'ckeditor5/src/core.js';
/**
 * Introduces UI components for the `CKBox` plugin.
 *
 * The plugin introduces two UI components to the {@link module:ui/componentfactory~ComponentFactory UI component factory}:
 *
 * * the `'ckbox'` toolbar button,
 * * the `'menuBar:ckbox'` menu bar component, which is by default added to the `'Insert'` menu.
 *
 * It also integrates with the `insertImage` toolbar component and `menuBar:insertImage` menu component.
 */
export declare class CKBoxUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "CKBoxUI";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    afterInit(): void;
    /**
     * Creates the base for various kinds of the button component provided by this feature.
     */
    private _createButton;
    /**
     * Creates a simple toolbar button for files management, with an icon and a tooltip.
     */
    private _createFileToolbarButton;
    /**
     * Creates a simple toolbar button for images management, with an icon and a tooltip.
     */
    private _createImageToolbarButton;
    /**
     * Creates a button for images management for the dropdown view, with an icon, text and no tooltip.
     */
    private _createImageDropdownButton;
    /**
     * Creates a button for files management for the menu bar.
     */
    private _createFileMenuBarButton;
    /**
     * Creates a button for images management for the menu bar.
     */
    private _createImageMenuBarButton;
}
