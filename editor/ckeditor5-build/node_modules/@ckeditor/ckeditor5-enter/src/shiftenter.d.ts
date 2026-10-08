/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
/**
 * This plugin handles the <kbd>Shift</kbd>+<kbd>Enter</kbd> keystroke (soft line break) in the editor.
 *
 * See also the {@link module:enter/enter~Enter} plugin.
 *
 * For more information about this feature see the {@glink api/enter package page}.
 */
export declare class ShiftEnter extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "ShiftEnter";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    init(): void;
}
