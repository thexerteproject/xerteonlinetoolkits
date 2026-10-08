/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { LegacyListUtils } from './legacylistutils.js';
import { Plugin } from 'ckeditor5/src/core.js';
import { Enter } from 'ckeditor5/src/enter.js';
import { Delete } from 'ckeditor5/src/typing.js';
import '../../theme/list.css';
/**
 * The engine of the list feature. It handles creating, editing and removing lists and list items.
 *
 * It registers the `'numberedList'`, `'bulletedList'`, `'indentList'` and `'outdentList'` commands.
 */
export declare class LegacyListEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "LegacyListEditing";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof Enter, typeof Delete, typeof LegacyListUtils];
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * @inheritDoc
     */
    afterInit(): void;
}
