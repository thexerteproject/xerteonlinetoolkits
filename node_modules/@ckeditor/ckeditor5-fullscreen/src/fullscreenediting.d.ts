/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module fullscreen/fullscreenediting
 */
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
/**
 * A plugin that registers the fullscreen mode command.
 */
export declare class FullscreenEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "FullscreenEditing";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    init(): void;
}
