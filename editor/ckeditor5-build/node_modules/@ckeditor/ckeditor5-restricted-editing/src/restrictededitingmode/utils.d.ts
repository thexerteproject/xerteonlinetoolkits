/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import type { Editor } from 'ckeditor5/src/core.js';
import type { ModelDocumentSelection, Marker, ModelPosition, ModelRange, Model } from 'ckeditor5/src/engine.js';
/**
 * @module restricted-editing/restrictededitingmode/utils
 */
/**
 * Returns a single "restricted-editing-exception" marker at a given position. Contrary to
 * {@link module:engine/model/markercollection~MarkerCollection#getMarkersAtPosition}, it returnd a marker also when the postion is
 * equal to one of the marker's start or end positions.
 *
 * @internal
 */
export declare function getMarkerAtPosition(editor: Editor, position: ModelPosition): Marker | undefined;
/**
 * Checks if the position is fully contained in the range. Positions equal to range start or end are considered "in".
 *
 * @internal
 */
export declare function isPositionInRangeBoundaries(range: ModelRange, position: ModelPosition): boolean;
/**
 * Checks if the selection is fully contained in the marker. Positions on marker boundaries are considered "in".
 *
 * ```xml
 * <marker>[]foo</marker> -> true
 * <marker>f[oo]</marker> -> true
 * <marker>f[oo</marker> ba]r -> false
 * <marker>foo</marker> []bar -> false
 * ```
 *
 * @internal
 */
export declare function isSelectionInMarker(selection: ModelDocumentSelection, model: Model, marker?: Marker): boolean;
/**
 * Returns the marker range asjusted to the inside of exception wrapper element if needed.
 *
 * @internal
 */
export declare function getExceptionRange(marker: Marker, model: Model): ModelRange;
