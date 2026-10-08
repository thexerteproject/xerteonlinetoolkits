/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module special-characters/specialcharacters
 */
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { Typing } from 'ckeditor5/src/typing.js';
import { Dialog } from 'ckeditor5/src/ui.js';
import '../theme/specialcharacters.css';
/**
 * The special characters feature.
 *
 * Introduces the `'specialCharacters'` dropdown.
 */
export declare class SpecialCharacters extends Plugin {
    /**
     * Registered characters. A pair of a character name and its symbol.
     */
    private _characters;
    /**
     * Registered groups. Each group contains a displayed label and a collection with symbol names.
     */
    private _groups;
    /**
     * A label describing the "All" special characters category.
     */
    private _allSpecialCharactersGroupLabel;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof Typing, typeof Dialog];
    /**
     * @inheritDoc
     */
    static get pluginName(): "SpecialCharacters";
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
     * Adds a collection of special characters to the specified group. The title of a special character must be unique.
     *
     * **Note:** The "All" category name is reserved by the plugin and cannot be used as a new name for a special
     * characters category.
     */
    addItems(groupName: string, items: Array<SpecialCharacterDefinition>, options?: {
        label: string;
    }): void;
    /**
     * Returns special character groups in an order determined based on configuration and registration sequence.
     */
    getGroups(): Set<string>;
    /**
     * Returns a collection of special characters symbol names (titles).
     */
    getCharactersForGroup(groupName: string): Set<string> | undefined;
    /**
     * Returns the symbol of a special character for the specified name. If the special character could not be found, `undefined`
     * is returned.
     *
     * @param title The title of a special character.
     */
    getCharacter(title: string): string | undefined;
    /**
     * Returns a group of special characters. If the group with the specified name does not exist, it will be created.
     *
     * @param groupName The name of the group to create.
     * @param label The label describing the new group.
     */
    private _getGroup;
    /**
     * Updates the symbol grid depending on the currently selected character group.
     */
    private _updateGrid;
    /**
     * Initializes the dropdown, used for lazy loading.
     *
     * @returns An object with `categoriesView`, `gridView` and `infoView` properties, containing UI parts.
     */
    private _createDropdownPanelContent;
    /**
     * Creates a button for toolbar and menu bar that will show special characters dialog.
     */
    private _createDialogButton;
    private _showDialog;
}
export interface SpecialCharacterDefinition {
    /**
     * A unique name of the character (e.g. "greek small letter epsilon").
     */
    title: string;
    /**
     * A human-readable character displayed as the label (e.g. "ε").
     */
    character: string;
}
