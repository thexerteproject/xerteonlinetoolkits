/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ckbox/ckboximageedit/ckboximageeditediting
 */
import { PendingActions, Plugin } from 'ckeditor5/src/core.js';
import { Notification } from 'ckeditor5/src/ui.js';
import { CKBoxEditing } from '../ckboxediting.js';
import { CKBoxUtils } from '../ckboxutils.js';
/**
 * The CKBox image edit editing plugin.
 */
export declare class CKBoxImageEditEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "CKBoxImageEditEditing";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof CKBoxEditing, typeof CKBoxUtils, typeof PendingActions, typeof Notification, "ImageUtils", "ImageEditing"];
    /**
     * @inheritDoc
     */
    init(): void;
}
