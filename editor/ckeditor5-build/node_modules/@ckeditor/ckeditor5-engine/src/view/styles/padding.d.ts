/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/styles/padding
 */
import type { StylesProcessor } from '../stylesmap.js';
/**
 * Adds a padding CSS styles processing rules.
 *
 * ```ts
 * editor.data.addStyleProcessorRules( addPaddingStylesRules );
 * ```
 *
 * The normalized value is stored as:
 *
 * ```ts
 * const styles = {
 * 	padding: {
 * 		top,
 * 		right,
 * 		bottom,
 * 		left
 * 	}
 * };
 * ```
 */
export declare function addPaddingStylesRules(stylesProcessor: StylesProcessor): void;
