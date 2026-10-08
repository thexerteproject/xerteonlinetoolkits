/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/listproperties/listpropertiesui
 */
import { Plugin } from 'ckeditor5/src/core.js';
import '../../theme/liststyles.css';
/**
 * The list properties UI plugin. It introduces the extended `'bulletedList'` and `'numberedList'` toolbar
 * buttons that allow users to control such aspects of list as the marker, start index or order.
 *
 * **Note**: Buttons introduced by this plugin override implementations from the {@link module:list/list/listui~ListUI}
 * (because they share the same names).
 */
export declare class ListPropertiesUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "ListPropertiesUI";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    init(): void;
}
