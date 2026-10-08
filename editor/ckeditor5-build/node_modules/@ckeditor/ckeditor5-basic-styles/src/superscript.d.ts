/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module basic-styles/superscript
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { SuperscriptEditing } from './superscript/superscriptediting.js';
import { SuperscriptUI } from './superscript/superscriptui.js';
/**
 * The superscript feature.
 *
 * It loads the {@link module:basic-styles/superscript/superscriptediting~SuperscriptEditing} and
 * {@link module:basic-styles/superscript/superscriptui~SuperscriptUI} plugins.
 */
export declare class Superscript extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof SuperscriptEditing, typeof SuperscriptUI];
    /**
     * @inheritDoc
     */
    static get pluginName(): "Superscript";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
}
