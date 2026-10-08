/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { EditingView } from '../view/view.js';
import { Mapper } from '../conversion/mapper.js';
import { DowncastDispatcher } from '../conversion/downcastdispatcher.js';
import type { Model } from '../model/model.js';
import { type ModelItem } from '../model/item.js';
import type { Marker } from '../model/markercollection.js';
import type { StylesProcessor } from '../view/stylesmap.js';
declare const EditingController_base: {
    new (): import("@ckeditor/ckeditor5-utils").Observable;
    prototype: import("@ckeditor/ckeditor5-utils").Observable;
};
/**
 * A controller for the editing pipeline. The editing pipeline controls the {@link ~EditingController#model model} rendering,
 * including selection handling. It also creates the {@link ~EditingController#view view} which builds a
 * browser-independent virtualization over the DOM elements. The editing controller also attaches default converters.
 */
export declare class EditingController extends /* #__PURE__ */ EditingController_base {
    /**
     * Editor model.
     */
    readonly model: Model;
    /**
     * Editing view controller.
     */
    readonly view: EditingView;
    /**
     * A mapper that describes the model-view binding.
     */
    readonly mapper: Mapper;
    /**
     * Downcast dispatcher that converts changes from the model to the {@link #view editing view}.
     */
    readonly downcastDispatcher: DowncastDispatcher;
    /**
     * Creates an editing controller instance.
     *
     * @param model Editing model.
     * @param stylesProcessor The styles processor instance.
     */
    constructor(model: Model, stylesProcessor: StylesProcessor);
    /**
     * Removes all event listeners attached to the `EditingController`. Destroys all objects created
     * by `EditingController` that need to be destroyed.
     */
    destroy(): void;
    /**
     * Calling this method will refresh the marker by triggering the downcast conversion for it.
     *
     * Reconverting the marker is useful when you want to change its {@link module:engine/view/element~ViewElement view element}
     * without changing any marker data. For instance:
     *
     * ```ts
     * let isCommentActive = false;
     *
     * model.conversion.markerToHighlight( {
     * 	model: 'comment',
     * 	view: data => {
     * 		const classes = [ 'comment-marker' ];
     *
     * 		if ( isCommentActive ) {
     * 			classes.push( 'comment-marker--active' );
     * 		}
     *
     * 		return { classes };
     * 	}
     * } );
     *
     * // ...
     *
     * // Change the property that indicates if marker is displayed as active or not.
     * isCommentActive = true;
     *
     * // Reconverting will downcast and synchronize the marker with the new isCommentActive state value.
     * editor.editing.reconvertMarker( 'comment' );
     * ```
     *
     * **Note**: If you want to reconvert a model item, use {@link #reconvertItem} instead.
     *
     * @param markerOrName Name of a marker to update, or a marker instance.
     */
    reconvertMarker(markerOrName: Marker | string): void;
    /**
     * Calling this method will downcast a model item on demand (by requesting a refresh in the {@link module:engine/model/differ~Differ}).
     *
     * You can use it if you want the view representation of a specific item updated as a response to external modifications. For instance,
     * when the view structure depends not only on the associated model data but also on some external state.
     *
     * **Note**: If you want to reconvert a model marker, use {@link #reconvertMarker} instead.
     *
     * @param item Item to refresh.
     */
    reconvertItem(item: ModelItem): void;
}
export {};
