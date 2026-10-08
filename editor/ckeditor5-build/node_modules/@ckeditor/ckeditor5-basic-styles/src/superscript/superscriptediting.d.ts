/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module basic-styles/superscript/superscriptediting
 */
import { Plugin } from 'ckeditor5/src/core.js';
/**
 * The superscript editing feature.
 *
 * It registers the `super` command and introduces the `super` attribute in the model which renders to the view
 * as a `<super>` element.
 */
export declare class SuperscriptEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "SuperscriptEditing";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
}
