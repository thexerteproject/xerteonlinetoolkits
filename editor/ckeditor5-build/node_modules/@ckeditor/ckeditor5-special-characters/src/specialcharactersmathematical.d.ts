/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module special-characters/specialcharactersmathematical
 */
import { Plugin } from 'ckeditor5/src/core.js';
/**
 * A plugin that provides special characters for the "Mathematical" category.
 *
 * ```ts
 * ClassicEditor
 *   .create( {
 *     plugins: [ ..., SpecialCharacters, SpecialCharactersMathematical ],
 *   } )
 *   .then( ... )
 *   .catch( ... );
 * ```
 */
export declare class SpecialCharactersMathematical extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "SpecialCharactersMathematical";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
}
