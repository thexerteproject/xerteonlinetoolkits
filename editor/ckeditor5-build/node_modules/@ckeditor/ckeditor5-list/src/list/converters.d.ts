/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/list/converters
 */
import { type DowncastAttributeEvent, type ViewDowncastWriter, type EditingController, type ModelElement, type DowncastElementCreatorFunction, type Mapper, type Model, type UpcastElementEvent, type ViewElement, type DowncastRemoveEvent, type EditingView, type MapperModelToViewPositionEvent, type ModelSchema } from 'ckeditor5/src/engine.js';
import type { GetCallback } from 'ckeditor5/src/utils.js';
import { type ListElement } from './utils/model.js';
import type { ListEditing, ListDowncastStrategy } from './listediting.js';
/**
 * Returns the upcast converter for list items. It's supposed to work after the block converters (content inside list items) are converted.
 *
 * @internal
 */
export declare function listItemUpcastConverter(): GetCallback<UpcastElementEvent>;
/**
 * Returns a model document change:data event listener that triggers conversion of related items if needed.
 *
 * @internal
 * @param model The editor model.
 * @param editing The editing controller.
 * @param attributeNames The list of all model list attributes (including registered strategies).
 * @param listEditing The document list editing plugin.
 */
export declare function reconvertItemsOnDataChange(model: Model, editing: EditingController, attributeNames: Array<string>, listEditing: ListEditing): () => void;
/**
 * Returns the list item downcast converter.
 *
 * @internal
 * @param attributeNames A list of attribute names that should be converted if they are set.
 * @param strategies The strategies.
 * @param model The model.
 */
export declare function listItemDowncastConverter(attributeNames: Array<string>, strategies: Array<ListDowncastStrategy>, model: Model, { dataPipeline }?: {
    dataPipeline?: boolean;
}): GetCallback<DowncastAttributeEvent<ListElement>>;
/**
 * The 'remove' downcast converter for custom markers.
 *
 * @internal
 */
export declare function listItemDowncastRemoveConverter(schema: ModelSchema): GetCallback<DowncastRemoveEvent>;
/**
 * Returns the bogus paragraph view element creator. A bogus paragraph is used if a list item contains only a single block or nested list.
 *
 * @internal
 * @param attributeNames The list of all model list attributes (including registered strategies).
 */
export declare function bogusParagraphCreator(attributeNames: Array<string>, { dataPipeline }?: {
    dataPipeline?: boolean;
}): DowncastElementCreatorFunction;
/**
 * Helper for mapping mode to view elements. It's using positions mapping instead of mapper.toViewElement( element )
 * to find outermost view element. This is for cases when mapping is using inner view element like in the code blocks (pre > code).
 *
 * @internal
 * @param element The model element.
 * @param mapper The mapper instance.
 * @param model The model.
 * @param writer The view downcast writer.
 */
export declare function findMappedViewElement(element: ModelElement, mapper: Mapper, model: Model, writer: ViewDowncastWriter): ViewElement | undefined;
/**
 * The model to view custom position mapping for cases when marker is injected at the beginning of a block.
 *
 * @internal
 */
export declare function createModelToViewPositionMapper(strategies: Array<ListDowncastStrategy>, view: EditingView): GetCallback<MapperModelToViewPositionEvent>;
