/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ckbox/ckboxediting
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { CKBoxUploadAdapter } from './ckboxuploadadapter.js';
import { CKBoxUtils } from './ckboxutils.js';
/**
 * The CKBox editing feature. It introduces the {@link module:ckbox/ckboxcommand~CKBoxCommand CKBox command} and
 * {@link module:ckbox/ckboxuploadadapter~CKBoxUploadAdapter CKBox upload adapter}.
 */
export declare class CKBoxEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "CKBoxEditing";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly ["LinkEditing", "PictureEditing", typeof CKBoxUploadAdapter, typeof CKBoxUtils];
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * @inheritDoc
     */
    afterInit(): void;
    /**
     * Returns true only when the integrator intentionally wants to use the plugin, i.e. when the `config.ckbox` exists or
     * the CKBox JavaScript library is loaded.
     */
    private _shouldBeInitialised;
    /**
     * Blocks `uploadImage` and `ckboxImageEdit` commands.
     */
    private _blockImageCommands;
    /**
     * Checks if at least one image plugin is loaded.
     */
    private _checkImagePlugins;
    /**
     * Extends the schema to allow the `ckboxImageId` and `ckboxLinkId` attributes for links and images.
     */
    private _initSchema;
    /**
     * Configures the upcast and downcast conversions for the `ckboxImageId` and `ckboxLinkId` attributes.
     */
    private _initConversion;
    /**
     * Registers post-fixers that add or remove the `ckboxLinkId` and `ckboxImageId` attributes.
     */
    private _initFixers;
}
