/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ckbox/ckboximageedit
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { CKBoxImageEditEditing } from './ckboximageedit/ckboximageeditediting.js';
import { CKBoxImageEditUI } from './ckboximageedit/ckboximageeditui.js';
import '../theme/ckboximageedit.css';
/**
 * The CKBox image edit feature.
 */
export class CKBoxImageEdit extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'CKBoxImageEdit';
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
        return [CKBoxImageEditEditing, CKBoxImageEditUI];
    }
}
