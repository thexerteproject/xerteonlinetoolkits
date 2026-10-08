/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import type { DowncastAttributeEvent, UpcastElementEvent } from 'ckeditor5/src/engine.js';
import { type GetCallback } from 'ckeditor5/src/utils.js';
import type { ImageStyleOptionDefinition } from '../imageconfig.js';
/**
 * @module image/imagestyle/converters
 */
/**
 * Returns a converter for the `imageStyle` attribute. It can be used for adding, changing and removing the attribute.
 *
 * @param styles An array containing available image style options.
 * @returns A model-to-view attribute converter.
 * @internal
 */
export declare function modelToViewStyleAttribute(styles: Array<ImageStyleOptionDefinition>): GetCallback<DowncastAttributeEvent>;
/**
 * Returns a view-to-model converter converting image CSS classes to a proper value in the model.
 *
 * @param styles Image style options for which the converter is created.
 * @returns A view-to-model converter.
 * @internal
 */
export declare function viewToModelStyleAttribute(styles: Array<ImageStyleOptionDefinition>): GetCallback<UpcastElementEvent>;
