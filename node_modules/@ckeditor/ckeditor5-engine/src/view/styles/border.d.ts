/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/styles/border
 */
import type { StylesProcessor } from '../stylesmap.js';
/**
 * Adds a border CSS styles processing rules.
 *
 * ```ts
 * editor.data.addStyleProcessorRules( addBorderStylesRules );
 * ```
 *
 * This rules merges all [border](https://developer.mozilla.org/en-US/docs/Web/CSS/border) styles notation shorthands:
 *
 * - border
 * - border-top
 * - border-right
 * - border-bottom
 * - border-left
 * - border-color
 * - border-style
 * - border-width
 *
 * and all corresponding longhand forms (like `border-top-color`, `border-top-style`, etc).
 *
 * It does not handle other shorthands (like `border-radius` or `border-image`).
 *
 * The normalized model stores border values as:
 *
 * ```ts
 * const styles = {
 * 	border: {
 * 		color: { top, right, bottom, left },
 * 		style: { top, right, bottom, left },
 * 		width: { top, right, bottom, left },
 * 	}
 * };
 * ```
 */
export declare function addBorderStylesRules(stylesProcessor: StylesProcessor): void;
