/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { type Locale } from 'ckeditor5/src/utils.js';
import type { AlignmentFormat, AlignmentSupportedOption } from './alignmentconfig.js';
/**
 * @module alignment/utils
 */
/**
 * The list of supported alignment options:
 *
 * * `'left'`,
 * * `'right'`,
 * * `'center'`,
 * * `'justify'`
 *
 * @internal
 */
export declare const supportedOptions: ReadonlyArray<AlignmentSupportedOption>;
/**
 * Checks whether the passed option is supported by {@link module:alignment/alignmentediting~AlignmentEditing}.
 *
 * @internal
 * @param option The option value to check.
 */
export declare function isSupported(option: string): boolean;
/**
 * Checks whether alignment is the default one considering the direction
 * of the editor content.
 *
 * @internal
 * @param alignment The name of the alignment to check.
 * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
 */
export declare function isDefault(alignment: string, locale: Locale): boolean;
/**
 * Brings the configuration to the common form, an array of objects.
 *
 * @internal
 * @param configuredOptions Alignment plugin configuration.
 * @returns Normalized object holding the configuration.
 */
export declare function normalizeAlignmentOptions(configuredOptions: Array<string | AlignmentFormat>): Array<AlignmentFormat>;
