/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module indent/indentblock
 */
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { IndentBlockListIntegration } from './integrations/indentblocklistintegration.js';
/**
 * The block indentation feature.
 *
 * It registers the `'indentBlock'` and `'outdentBlock'` commands.
 *
 * If the plugin {@link module:indent/indent~Indent} is defined, it also attaches the `'indentBlock'` and `'outdentBlock'` commands to
 * the `'indent'` and `'outdent'` commands.
 */
export declare class IndentBlock extends Plugin {
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    static get pluginName(): "IndentBlock";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof IndentBlockListIntegration];
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * @inheritDoc
     */
    afterInit(): void;
    /**
     * Setups conversion for using offset indents.
     */
    private _setupConversionUsingOffset;
    /**
     * Setups conversion for using classes.
     */
    private _setupConversionUsingClasses;
}
