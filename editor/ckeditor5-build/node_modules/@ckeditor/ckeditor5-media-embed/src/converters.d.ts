/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import type { DowncastDispatcher } from 'ckeditor5/src/engine.js';
import { type MediaRegistry } from './mediaregistry.js';
import type { MediaOptions } from './utils.js';
/**
 * Returns a function that converts the model "url" attribute to the view representation.
 *
 * Depending on the configuration, the view representation can be "semantic" (for the data pipeline):
 *
 * ```html
 * <figure class="media">
 * 	<oembed url="foo"></oembed>
 * </figure>
 * ```
 *
 * or "non-semantic" (for the editing view pipeline):
 *
 * ```html
 * <figure class="media">
 * 	<div data-oembed-url="foo">[ non-semantic media preview for "foo" ]</div>
 * </figure>
 * ```
 *
 * **Note:** Changing the model "url" attribute replaces the entire content of the
 * `<figure>` in the view.
 *
 * @param registry The registry providing
 * the media and their content.
 * @param options options object with following properties:
 * - elementName When set, overrides the default element name for semantic media embeds.
 * - renderMediaPreview When `true`, the converter will create the view in the non-semantic form.
 * - renderForEditingView When `true`, the converter will create a view specific for the
 * editing pipeline (e.g. including CSS classes, content placeholders).
 *
 * @internal
 */
export declare function modelToViewUrlAttributeConverter(registry: MediaRegistry, options: MediaOptions): (dispatcher: DowncastDispatcher) => void;
