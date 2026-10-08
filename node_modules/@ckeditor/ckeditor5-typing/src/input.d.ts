/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module typing/input
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
/**
 * Handles text input coming from the keyboard or other input methods.
 */
export declare class Input extends Plugin {
    /**
     * The queue of `insertText` command executions that are waiting for the DOM to get updated after beforeinput event.
     */
    private _typingQueue;
    /**
     * @inheritDoc
     */
    static get pluginName(): "Input";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
}
