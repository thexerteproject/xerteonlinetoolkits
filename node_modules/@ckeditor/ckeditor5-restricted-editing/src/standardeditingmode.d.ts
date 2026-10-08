/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module restricted-editing/standardeditingmode
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { StandardEditingModeEditing } from './standardeditingmodeediting.js';
import { StandardEditingModeUI } from './standardeditingmodeui.js';
import '../theme/restrictedediting.css';
/**
 * The standard editing mode plugin.
 *
 * This is a "glue" plugin that loads the following plugins:
 *
 * * The {@link module:restricted-editing/standardeditingmodeediting~StandardEditingModeEditing standard mode editing feature}.
 * * The {@link module:restricted-editing/standardeditingmodeui~StandardEditingModeUI standard mode UI feature}.
 */
export declare class StandardEditingMode extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "StandardEditingMode";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    static get requires(): readonly [typeof StandardEditingModeEditing, typeof StandardEditingModeUI];
}
