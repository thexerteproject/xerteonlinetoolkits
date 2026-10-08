/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command, type Editor } from 'ckeditor5/src/core.js';
import type { CKBoxAssetDefinition, CKBoxAssetImageAttributesDefinition, CKBoxRawAssetDefinition } from './ckboxconfig.js';
/**
 * The CKBox command. It is used by the {@link module:ckbox/ckboxediting~CKBoxEditing CKBox editing feature} to open the CKBox file manager.
 * The file manager allows inserting an image or a link to a file into the editor content.
 *
 * ```ts
 * editor.execute( 'ckbox' );
 * ```
 *
 * **Note:** This command uses other features to perform the following tasks:
 * - To insert images it uses the {@link module:image/image/insertimagecommand~InsertImageCommand 'insertImage'} command from the
 * {@link module:image/image~Image Image feature}.
 * - To insert links to other files it uses the {@link module:link/linkcommand~LinkCommand 'link'} command from the
 * {@link module:link/link~Link Link feature}.
 */
export declare class CKBoxCommand extends Command {
    value: boolean;
    /**
     * A set of all chosen assets. They are stored temporarily and they are automatically removed 1 second after being chosen.
     * Chosen assets have to be "remembered" for a while to be able to map the given asset with the element inserted into the model.
     * This association map is then used to set the ID on the model element.
     *
     * All chosen assets are automatically removed after the timeout, because (theoretically) it may happen that they will never be
     * inserted into the model, even if the {@link module:link/linkcommand~LinkCommand `'link'`} command or the
     * {@link module:image/image/insertimagecommand~InsertImageCommand `'insertImage'`} command is enabled. Such a case may arise when
     * another plugin blocks the command execution. Then, in order not to keep the chosen (but not inserted) assets forever, we delete
     * them automatically to prevent memory leakage. The 1 second timeout is enough to insert the asset into the model and extract the
     * ID from the chosen asset.
     *
     * The assets are stored only if
     * the {@link module:ckbox/ckboxconfig~CKBoxConfig#ignoreDataId `config.ckbox.ignoreDataId`} option is set to `false` (by default).
     *
     * @internal
     */
    readonly _chosenAssets: Set<CKBoxAssetDefinition>;
    /**
     * The DOM element that acts as a mounting point for the CKBox dialog.
     */
    private _wrapper;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * @inheritDoc
     */
    execute(): void;
    /**
     * Indicates if the CKBox dialog is already opened.
     *
     * @protected
     * @returns {Boolean}
     */
    private _getValue;
    /**
     * Checks whether the command can be enabled in the current context.
     */
    private _checkEnabled;
    /**
     * Creates the options object for the CKBox dialog.
     *
     * @returns The object with properties:
     * - theme The theme for CKBox dialog.
     * - language The language for CKBox dialog.
     * - tokenUrl The token endpoint URL.
     * - serviceOrigin The base URL of the API service.
     * - forceDemoLabel Whether to force "Powered by CKBox" link.
     * - assets.onChoose The callback function invoked after choosing the assets.
     * - dialog.onClose The callback function invoked after closing the CKBox dialog.
     * - dialog.width The dialog width in pixels.
     * - dialog.height The dialog height in pixels.
     * - categories.icons Allows setting custom icons for categories.
     * - view.openLastView Sets if the last view visited by the user will be reopened
     * on the next startup.
     * - view.startupFolderId Sets the ID of the folder that will be opened on startup.
     * - view.startupCategoryId Sets the ID of the category that will be opened on startup.
     * - view.hideMaximizeButton Sets whether to hide the ‘Maximize’ button.
     * - view.componentsHideTimeout Sets timeout after which upload components are hidden
     * after completed upload.
     * - view.dialogMinimizeTimeout Sets timeout after which upload dialog is minimized
     * after completed upload.
     */
    private _prepareOptions;
    /**
     * Initializes various event listeners for the `ckbox:*` events, because all functionality of the `ckbox` command is event-based.
     */
    private _initListeners;
    /**
     * Inserts the asset into the model.
     *
     * @param asset The asset to be inserted.
     * @param isLastAsset Indicates if the current asset is the last one from the chosen set.
     * @param writer An instance of the model writer.
     * @param isSingleAsset It's true when only one asset is processed.
     */
    private _insertAsset;
    /**
     * Inserts the image by calling the `insertImage` command.
     *
     * @param asset The asset to be inserted.
     */
    private _insertImage;
    /**
     * Inserts the link to the asset by calling the `link` command.
     *
     * @param asset The asset to be inserted.
     * @param writer An instance of the model writer.
     * @param isSingleAsset It's true when only one asset is processed.
     */
    private _insertLink;
}
/**
 * Parses the assets attributes into the internal data format.
 *
 * @internal
 */
export declare function prepareImageAssetAttributes(asset: CKBoxRawAssetDefinition): CKBoxAssetImageAttributesDefinition;
