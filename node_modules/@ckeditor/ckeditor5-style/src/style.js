/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module style/style
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { StyleUI } from './styleui.js';
import { StyleEditing } from './styleediting.js';
/**
 * The style plugin.
 *
 * This is a "glue" plugin that loads the {@link module:style/styleediting~StyleEditing style editing feature}
 * and {@link module:style/styleui~StyleUI style UI feature}.
 */
export class Style extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'Style';
    }
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin() {
        return true;
    }
    /**
     * @inheritDoc
     */
    static get requires() {
        return [StyleEditing, StyleUI];
    }
}
