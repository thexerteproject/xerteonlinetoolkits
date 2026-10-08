/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/styles/margin
 */
import type { StylesProcessor } from '../stylesmap.js';
/**
 * Adds a margin CSS styles processing rules.
 *
 * ```ts
 * editor.data.addStyleProcessorRules( addMarginStylesRules );
 * ```
 *
 * The normalized value is stored as:
 *
 * ```ts
 * const styles = {
 * 	margin: {
 * 		top,
 * 		right,
 * 		bottom,
 * 		left
 * 	}
 * };
 * ```
 */
export declare function addMarginStylesRules(stylesProcessor: StylesProcessor): void;
