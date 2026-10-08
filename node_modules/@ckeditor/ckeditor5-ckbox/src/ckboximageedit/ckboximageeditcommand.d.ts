/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ckbox/ckboximageedit/ckboximageeditcommand
 */
import { Command, type Editor } from 'ckeditor5/src/core.js';
/**
 * The CKBox edit image command.
 *
 * Opens the CKBox dialog for editing the image.
 */
export declare class CKBoxImageEditCommand extends Command {
    /**
     * Flag indicating whether the command is active, i.e. dialog is open.
     */
    value: boolean;
    /**
     * The DOM element that acts as a mounting point for the CKBox Edit Image dialog.
     */
    private _wrapper;
    /**
     * The states of image processing in progress.
     */
    private _processInProgress;
    /**
     * Determines if the element can be edited.
     */
    private _canEdit;
    /**
     * A wrapper function to prepare mount options. Ensures that at most one preparation is in-flight.
     */
    private _prepareOptions;
    /**
    * CKBox's onClose function runs before the final cleanup, potentially causing
    * page layout changes after it finishes. To address this, we use a setTimeout hack
    * to ensure that floating elements on the page maintain their correct position.
    *
    * See: https://github.com/ckeditor/ckeditor5/issues/16153.
    */
    private _updateUiDelayed;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Opens the CKBox Image Editor dialog for editing the image.
     */
    execute(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Indicates if the CKBox Image Editor dialog is already opened.
     */
    private _getValue;
    /**
     * Creates the options object for the CKBox Image Editor dialog.
     */
    private _prepareOptionsAbortable;
    /**
     * Initializes event lister for an event of removing an image.
     */
    private _prepareListeners;
    /**
     * Gets processing states of images that have been deleted in the mean time.
     */
    private _getProcessingStatesOfDeletedImages;
    private _checkIfElementIsBeingProcessed;
    /**
     * Closes the CKBox Image Editor dialog.
     */
    private _handleImageEditorClose;
    /**
     * Save edited image. In case server respond with "success" replace with edited image,
     * otherwise show notification error.
     */
    private _handleImageEditorSave;
    /**
     * Get asset's status on server. If server responds with "success" status then
     * image is already proceeded and ready for saving.
     */
    private _getAssetStatusFromServer;
    /**
     * Waits for an asset to be processed.
     * It retries retrieving asset status from the server in case of failure.
     */
    private _waitForAssetProcessed;
    /**
     * Shows processing indicator while image is processing.
     *
     * @param asset Data about certain asset.
     */
    private _showImageProcessingIndicator;
    /**
     * Replace the edited image with the new one.
     */
    private _replaceImage;
}
