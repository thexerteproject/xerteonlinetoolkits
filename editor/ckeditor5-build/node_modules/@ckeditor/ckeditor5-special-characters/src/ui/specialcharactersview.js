/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module special-characters/ui/specialcharactersview
 */
import { View, FocusCycler } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler } from 'ckeditor5/src/utils.js';
/**
 * A view that glues pieces of the special characters dropdown panel together:
 *
 * * the navigation view (allows selecting the category),
 * * the grid view (displays characters as a grid),
 * * and the info view (displays detailed info about a specific character).
 *
 * @internal
 */
export class SpecialCharactersView extends View {
    /**
     * A collection of the focusable children of the view.
     */
    items;
    /**
     * Tracks information about the DOM focus in the view.
     */
    focusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    keystrokes;
    /**
     * Helps cycling over focusable {@link #items} in the view.
     */
    _focusCycler;
    /**
     * An instance of the `SpecialCharactersCategoriesView`.
     */
    categoriesView;
    /**
     * An instance of the `CharacterGridView`.
     */
    gridView;
    /**
     * An instance of the `CharacterInfoView`.
     */
    infoView;
    /**
     * Creates an instance of the `SpecialCharactersView`.
     */
    constructor(locale, categoriesView, gridView, infoView) {
        super(locale);
        this.categoriesView = categoriesView;
        this.gridView = gridView;
        this.infoView = infoView;
        this.items = this.createCollection();
        this.focusTracker = new FocusTracker();
        this.keystrokes = new KeystrokeHandler();
        this._focusCycler = new FocusCycler({
            focusables: this.items,
            focusTracker: this.focusTracker,
            keystrokeHandler: this.keystrokes,
            actions: {
                focusPrevious: 'shift + tab',
                focusNext: 'tab'
            }
        });
        this.setTemplate({
            tag: 'div',
            children: [
                this.categoriesView,
                this.gridView,
                this.infoView
            ],
            attributes: {
                // Avoid focus loss when the user clicks the area of the grid that is not a button.
                // https://github.com/ckeditor/ckeditor5/pull/12319#issuecomment-1231779819
                tabindex: '-1'
            }
        });
        this.items.add(this.categoriesView);
        this.items.add(this.gridView);
    }
    /**
     * @inheritDoc
     */
    render() {
        super.render();
        this.focusTracker.add(this.categoriesView.element);
        this.focusTracker.add(this.gridView.element);
        // Start listening for the keystrokes coming from #element.
        this.keystrokes.listenTo(this.element);
    }
    /**
     * @inheritDoc
     */
    destroy() {
        super.destroy();
        this.focusTracker.destroy();
        this.keystrokes.destroy();
    }
    /**
     * Focuses the first focusable in {@link #items}.
     */
    focus() {
        this._focusCycler.focusFirst();
    }
}
