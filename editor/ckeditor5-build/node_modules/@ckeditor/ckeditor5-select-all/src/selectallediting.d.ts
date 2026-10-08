/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module select-all/selectallediting
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
/**
 * The select all editing feature.
 *
 * It registers the `'selectAll'` {@link module:select-all/selectallcommand~SelectAllCommand command}
 * and the <kbd>Ctrl/⌘</kbd>+<kbd>A</kbd> keystroke listener which executes it.
 */
export declare class SelectAllEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "SelectAllEditing";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
}
