/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/converters/table-caption-post-fixer
 */
import type { Model } from 'ckeditor5/src/engine.js';
/**
 * Injects a table caption post-fixer into the model.
 *
 * The role of the table caption post-fixer is to ensure that the table with caption have the correct structure
 * after a {@link module:engine/model/model~Model#change `change()`} block was executed.
 *
 * The correct structure means that:
 *
 * * If there are many caption model element, they are merged into one model.
 * * A final, merged caption model is placed at the end of the table.
 *
 * @internal
 */
export declare function injectTableCaptionPostFixer(model: Model): void;
