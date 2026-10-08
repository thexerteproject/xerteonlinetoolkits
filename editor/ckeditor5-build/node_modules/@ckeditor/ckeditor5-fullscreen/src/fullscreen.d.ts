/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module fullscreen/fullscreen
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { FullscreenEditing } from './fullscreenediting.js';
import { FullscreenUI } from './fullscreenui.js';
/**
 * The fullscreen mode feature.
 */
export declare class Fullscreen extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof FullscreenEditing, typeof FullscreenUI];
    /**
     * @inheritDoc
     */
    static get pluginName(): "Fullscreen";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
}
