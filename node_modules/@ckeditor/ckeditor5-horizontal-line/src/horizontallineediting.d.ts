/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module horizontal-line/horizontallineediting
 */
import { Plugin } from 'ckeditor5/src/core.js';
import '../theme/horizontalline.css';
/**
 * The horizontal line editing feature.
 */
export declare class HorizontalLineEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "HorizontalLineEditing";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
}
