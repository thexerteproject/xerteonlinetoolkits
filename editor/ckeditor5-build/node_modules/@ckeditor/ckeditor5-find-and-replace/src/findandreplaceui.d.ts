/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module find-and-replace/findandreplaceui
 */
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { Dialog, type ViewWithCssTransitionDisabler } from 'ckeditor5/src/ui.js';
import { FindAndReplaceFormView } from './ui/findandreplaceformview.js';
/**
 * The default find and replace UI.
 *
 * It registers the `'findAndReplace'` UI button in the editor's {@link module:ui/componentfactory~ComponentFactory component factory}.
 * that uses the {@link module:find-and-replace/findandreplace~FindAndReplace FindAndReplace} plugin API.
 */
export declare class FindAndReplaceUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof Dialog];
    /**
     * @inheritDoc
     */
    static get pluginName(): "FindAndReplaceUI";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * A reference to the find and replace form view.
     */
    formView: FindAndReplaceFormView & ViewWithCssTransitionDisabler | null;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Creates a dropdown containing the find and replace form.
     */
    private _createDropdown;
    /**
     * Creates a button that opens a dialog with the find and replace form.
     */
    private _createDialogButtonForToolbar;
    /**
     * Creates a button for for menu bar that will show find and replace dialog.
     */
    private _createDialogButtonForMenuBar;
    /**
     * Creates a button for find and replace command to use either in toolbar or in menu bar.
     */
    private _createButton;
    /**
     * Shows the find and replace dialog.
     */
    private _showDialog;
    /**
     * Sets up the form view for the findN and replace.
     */
    private _createFormView;
    /**
     * Clears the find and replace form and focuses the search text field.
     */
    private _setupFormView;
}
/**
 * Fired when the UI was reset and the search results marked in the editing root should be invalidated,
 * for instance, because the user changed the searched phrase (or options) but didn't hit
 * the "Find" button yet.
 *
 * @eventName ~FindAndReplaceUI#searchReseted
 */
export type FindResetedEvent = {
    name: 'searchReseted';
    args: [];
};
