/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module heading/headingui
 */
import { Plugin } from 'ckeditor5/src/core.js';
import '../theme/heading.css';
/**
 * The headings UI feature. It introduces the `headings` dropdown.
 */
export declare class HeadingUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "HeadingUI";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
}
