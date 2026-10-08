/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ckfinder/ckfinderediting
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { Notification } from 'ckeditor5/src/ui.js';
/**
 * The CKFinder editing feature. It introduces the {@link module:ckfinder/ckfindercommand~CKFinderCommand CKFinder command}.
 */
export declare class CKFinderEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "CKFinderEditing";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof Notification, "LinkEditing"];
    /**
     * @inheritDoc
     */
    init(): void;
}
