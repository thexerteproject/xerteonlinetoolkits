/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/listproperties/converters
 */
import type { UpcastElementEvent } from 'ckeditor5/src/engine.js';
import type { GetCallback } from 'ckeditor5/src/utils.js';
import type { AttributeStrategy } from './listpropertiesediting.js';
/**
 * Returns a converter that consumes the `style`, `reversed`, and `start` attributes.
 * In `style`, it searches for the `list-style-type` definition.
 * If not found, the `"default"` value will be used.
 *
 * @internal
 * @param strategy
 */
export declare function listPropertiesUpcastConverter(strategy: AttributeStrategy): GetCallback<UpcastElementEvent>;
