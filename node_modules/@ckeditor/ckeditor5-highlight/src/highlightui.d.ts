/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module highlight/highlightui
 */
import { Plugin } from 'ckeditor5/src/core.js';
import './../theme/highlight.css';
/**
 * The default highlight UI plugin. It introduces:
 *
 * * The `'highlight'` dropdown,
 * * The `'removeHighlight'` and `'highlight:*'` buttons.
 *
 * The default configuration includes the following buttons:
 *
 * * `'highlight:yellowMarker'`
 * * `'highlight:greenMarker'`
 * * `'highlight:pinkMarker'`
 * * `'highlight:blueMarker'`
 * * `'highlight:redPen'`
 * * `'highlight:greenPen'`
 *
 * See the {@link module:highlight/highlightconfig~HighlightConfig#options configuration} to learn more
 * about the defaults.
 */
export declare class HighlightUI extends Plugin {
    /**
     * Returns the localized option titles provided by the plugin.
     *
     * The following localized titles corresponding with default
     * {@link module:highlight/highlightconfig~HighlightConfig#options} are available:
     *
     * * `'Yellow marker'`,
     * * `'Green marker'`,
     * * `'Pink marker'`,
     * * `'Blue marker'`,
     * * `'Red pen'`,
     * * `'Green pen'`.
     */
    get localizedOptionTitles(): Record<string, string>;
    /**
     * @inheritDoc
     */
    static get pluginName(): "HighlightUI";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Creates the "Remove highlight" button.
     */
    private _addRemoveHighlightButton;
    /**
     * Creates a toolbar button from the provided highlight option.
     */
    private _addHighlighterButton;
    /**
     * Internal method for creating highlight buttons.
     *
     * @param name The name of the button.
     * @param label The label for the button.
     * @param icon The button icon.
     * @param value The `value` property passed to the executed command.
     * @param decorateButton A callback getting ButtonView instance so that it can be further customized.
     */
    private _addButton;
    /**
     * Creates the split button dropdown UI from the provided highlight options.
     */
    private _addDropdown;
    /**
     * Creates the menu bar button for highlight including submenu with available options.
     */
    private _addMenuBarButton;
}
