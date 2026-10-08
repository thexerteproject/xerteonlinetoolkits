/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module enter/enter
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
/**
 * This plugin handles the <kbd>Enter</kbd> keystroke (hard line break) in the editor.
 *
 * See also the {@link module:enter/shiftenter~ShiftEnter} plugin.
 *
 * For more information about this feature see the {@glink api/enter package page}.
 */
export declare class Enter extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "Enter";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    init(): void;
}
