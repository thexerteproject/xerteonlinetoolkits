/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module fullscreen/fullscreenui
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { FullscreenEditing } from './fullscreenediting.js';
import '../theme/fullscreen.css';
/**
 * A plugin registering the fullscreen mode buttons.
 */
export declare class FullscreenUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof FullscreenEditing];
    /**
     * @inheritDoc
     */
    static get pluginName(): "FullscreenUI";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Creates a button that toggles the fullscreen mode.
     */
    private _createButton;
}
