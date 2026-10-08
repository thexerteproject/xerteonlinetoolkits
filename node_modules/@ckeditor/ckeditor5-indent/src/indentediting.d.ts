/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module indent/indentediting
 */
import { Plugin } from 'ckeditor5/src/core.js';
/**
 * The indent editing feature.
 *
 * This plugin registers the `'indent'` and `'outdent'` commands.
 *
 * **Note**: In order for the commands to work, at least one of the compatible features is required. Read more in the
 * {@link module:indent/indent~Indent indent feature} API documentation.
 */
export declare class IndentEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "IndentEditing";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
}
