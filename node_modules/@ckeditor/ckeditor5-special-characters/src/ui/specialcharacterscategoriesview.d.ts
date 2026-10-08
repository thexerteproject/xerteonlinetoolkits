/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module special-characters/ui/specialcharacterscategoriesview
 */
import { type Locale } from 'ckeditor5/src/utils.js';
import { View } from 'ckeditor5/src/ui.js';
/**
 * A class representing the navigation part of the special characters UI. It is responsible
 * for describing the feature and allowing the user to select a particular character group.
 *
 * @internal
 */
export declare class SpecialCharactersCategoriesView extends View {
    /**
     * Currently selected special characters group's name.
     */
    currentGroupName: string;
    private _groupNames;
    private _dropdownView;
    /**
     * Creates an instance of the {@link module:special-characters/ui/specialcharacterscategoriesview~SpecialCharactersCategoriesView}
     * class.
     *
     * @param locale The localization services instance.
     * @param groupNames The names of the character groups.
     */
    constructor(locale: Locale, groupNames: Map<string, string>);
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * @inheritDoc
     */
    focus(): void;
    /**
     * Creates dropdown item list, sets up bindings and fills properties.
     */
    private _setupDropdown;
}
