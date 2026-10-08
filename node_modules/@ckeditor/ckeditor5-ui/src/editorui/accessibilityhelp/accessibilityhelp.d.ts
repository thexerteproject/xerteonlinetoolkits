/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/editorui/accessibilityhelp/accessibilityhelp
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import { Dialog } from '../../dialog/dialog.js';
import { AccessibilityHelpContentView } from './accessibilityhelpcontentview.js';
import '../../../theme/components/editorui/accessibilityhelp.css';
/**
 * A plugin that brings the accessibility help dialog to the editor available under the <kbd>Alt</kbd>+<kbd>0</kbd>
 * keystroke and via the "Accessibility help" toolbar button. The dialog displays a list of keystrokes that can be used
 * by the user to perform various actions in the editor.
 *
 * Keystroke information is loaded from {@link module:core/accessibility~Accessibility#keystrokeInfos}. New entries can be
 * added using the API provided by the {@link module:core/accessibility~Accessibility} class.
 */
export declare class AccessibilityHelp extends Plugin {
    /**
     * The view that displays the dialog content (list of keystrokes).
     * Created when the dialog is opened for the first time.
     */
    contentView: AccessibilityHelpContentView | null;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof Dialog];
    /**
     * @inheritDoc
     */
    static get pluginName(): "AccessibilityHelp";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Creates a button to show accessibility help dialog, for use either in toolbar or in menu bar.
     */
    private _createButton;
    /**
     * Injects a help text into each editing root's `aria-label` attribute allowing assistive technology users
     * to discover the availability of the Accessibility help dialog.
     */
    private _setupRootLabels;
    /**
     * Shows the accessibility help dialog. Also, creates {@link #contentView} on demand.
     */
    private _toggleDialog;
}
