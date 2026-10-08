/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module show-blocks/showblocksui
 */
import { Plugin } from 'ckeditor5/src/core.js';
import '../theme/showblocks.css';
/**
 * The UI plugin of the show blocks feature.
 *
 * It registers the `'showBlocks'` UI button in the editor's {@link module:ui/componentfactory~ComponentFactory component factory}
 * that toggles the visibility of the HTML element names of content blocks.
 */
export declare class ShowBlocksUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "ShowBlocksUI";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Creates a button for show blocks command to use either in toolbar or in menu bar.
     */
    private _createButton;
}
