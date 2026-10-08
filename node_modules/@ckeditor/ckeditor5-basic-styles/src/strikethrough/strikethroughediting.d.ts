/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module basic-styles/strikethrough/strikethroughediting
 */
import { Plugin } from 'ckeditor5/src/core.js';
/**
 * The strikethrough editing feature.
 *
 * It registers the `'strikethrough'` command, the <kbd>Ctrl+Shift+X</kbd> keystroke and introduces the
 * `strikethroughsthrough` attribute in the model which renders to the view
 * as a `<s>` element.
 */
export declare class StrikethroughEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "StrikethroughEditing";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
}
