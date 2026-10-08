/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import type { ListPropertiesConfig, ListPropertiesStyleListType } from '../../listconfig.js';
/**
 * Normalizes {@link module:list/listconfig~ListPropertiesConfig} in the configuration of the list properties feature.
 * The structure of normalized list properties options looks as follows:
 *
 * ```ts
 * {
 * 	styles: {
 * 		listTypes: [ 'bulleted', 'numbered' ],
 * 		useAttribute: false
 * 	},
 * 	startIndex: true,
 * 	reversed: true
 * }
 * ```
 *
 * @internal
 * @param config The list properties {@link module:list/listconfig~ListPropertiesConfig config}.
 * @returns An object with normalized list properties options.
 */
export declare function getNormalizedConfig(config: ListPropertiesConfig): NormalizedListPropertiesConfig;
/**
* Normalized list properties config.
*
* @internal
*/
export type NormalizedListPropertiesConfig = {
    styles: {
        listTypes: Array<ListPropertiesStyleListType>;
        listStyleTypes?: {
            numbered?: Array<string>;
            bulleted?: Array<string>;
        };
        useAttribute: boolean;
    };
    startIndex: boolean;
    reversed: boolean;
};
