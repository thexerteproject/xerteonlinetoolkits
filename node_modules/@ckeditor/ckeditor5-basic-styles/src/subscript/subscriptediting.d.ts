/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module basic-styles/subscript/subscriptediting
 */
import { Plugin } from 'ckeditor5/src/core.js';
/**
 * The subscript editing feature.
 *
 * It registers the `sub` command and introduces the `sub` attribute in the model which renders to the view
 * as a `<sub>` element.
 */
export declare class SubscriptEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "SubscriptEditing";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
}
