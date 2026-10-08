/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin, type NonEmptyArray } from '@ckeditor/ckeditor5-core';
import { ModelRange, type ModelDocumentFragment, type ModelElement, type ModelDocumentSelection, type ModelSelection, type ModelWriter } from '@ckeditor/ckeditor5-engine';
/**
 * Part of the clipboard logic. Responsible for collecting markers from selected fragments
 * and restoring them with proper positions in pasted elements.
 *
 * @internal
 */
export declare class ClipboardMarkersUtils extends Plugin {
    /**
     * Map of marker names that can be copied.
     *
     * @internal
     */
    private _markersToCopy;
    /**
     * @inheritDoc
     */
    static get pluginName(): "ClipboardMarkersUtils";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * Registers marker name as copyable in clipboard pipeline.
     *
     * @param markerName Name of marker that can be copied.
     * @param config Configuration that describes what can be performed on specified marker.
     * @internal
     */
    _registerMarkerToCopy(markerName: string, config: ClipboardMarkerConfiguration): void;
    /**
     * Performs copy markers on provided selection and paste it to fragment returned from `getCopiedFragment`.
     *
     * 	1. Picks all markers in provided selection.
     * 	2. Inserts fake markers to document.
     * 	3. Gets copied selection fragment from document.
     * 	4. Removes fake elements from fragment and document.
     * 	5. Inserts markers in the place of removed fake markers.
     *
     * Due to selection modification, when inserting items, `getCopiedFragment` must *always* operate on `writer.model.document.selection'.
     * Do not use any other custom selection object within callback, as this will lead to out-of-bounds exceptions in rare scenarios.
     *
     * @param action Type of clipboard action.
     * @param selection Selection to be checked.
     * @param getCopiedFragment	Callback that performs copy of selection and returns it as fragment.
     * @internal
     */
    _copySelectedFragmentWithMarkers(action: ClipboardMarkerRestrictedAction, selection: ModelSelection | ModelDocumentSelection, getCopiedFragment?: (writer: ModelWriter) => ModelDocumentFragment): ModelDocumentFragment;
    /**
     * Performs paste of markers on already pasted element.
     *
     * 	1. Inserts fake markers that are present in fragment element (such fragment will be processed in `getPastedDocumentElement`).
     * 	2. Calls `getPastedDocumentElement` and gets element that is inserted into root model.
     * 	3. Removes all fake markers present in transformed element.
     * 	4. Inserts new markers with removed fake markers ranges into pasted fragment.
     *
     * There are multiple edge cases that have to be considered before calling this function:
     *
     * 	* `markers` are inserted into the same element that must be later transformed inside `getPastedDocumentElement`.
     * 	* Fake marker elements inside `getPastedDocumentElement` can be cloned, but their ranges cannot overlap.
     * 	* If `duplicateOnPaste` is `true` in marker config then associated marker ID is regenerated before pasting.
     *
     * @param markers Object that maps marker name to corresponding range.
     * @param getPastedDocumentElement Getter used to get target markers element.
     * @internal
     */
    _pasteMarkersIntoTransformedElement(markers: Record<string, ModelRange> | Map<string, ModelRange>, getPastedDocumentElement: (writer: ModelWriter) => ModelElement): ModelElement;
    /**
     * Pastes document fragment with markers to document.
     * If `duplicateOnPaste` is `true` in marker config then associated markers IDs
     * are regenerated before pasting to avoid markers duplications in content.
     *
     * @param fragment Document fragment that should contain already processed by pipeline markers.
     * @internal
     */
    _pasteFragmentWithMarkers(fragment: ModelDocumentFragment): ModelRange;
    /**
     * In some situations we have to perform copy on selected fragment with certain markers. This function allows to temporarily bypass
     * restrictions on markers that we want to copy.
     *
     * This function executes `executor()` callback. For the duration of the callback, if the clipboard pipeline is used to copy
     * content, markers with the specified name will be copied to the clipboard as well.
     *
     * @param markerName Which markers should be copied.
     * @param executor Callback executed.
     * @param config Optional configuration flags used to copy (such like partial copy flag).
     * @internal
     */
    _forceMarkersCopy(markerName: string, executor: VoidFunction, config?: ClipboardMarkerConfiguration): void;
    /**
     * Checks if marker can be copied.
     *
     * @param markerName Name of checked marker.
     * @param action Type of clipboard action. If null then checks only if marker is registered as copyable.
     * @internal
     */
    _isMarkerCopyable(markerName: string, action: ClipboardMarkerRestrictedAction | null): boolean;
    /**
     * Checks if marker has any clipboard copy behavior configuration.
     *
     * @param markerName Name of checked marker.
     */
    _hasMarkerConfiguration(markerName: string): boolean;
    /**
     * Returns marker's configuration flags passed during registration.
     *
     * @param markerName Name of marker that should be returned.
     * @internal
     */
    _getMarkerClipboardConfig(markerName: string): ClipboardMarkerConfiguration | null;
    /**
     * First step of copying markers. It looks for markers intersecting with given selection and inserts `$marker` elements
     * at positions where document markers start or end. This way `$marker` elements can be easily copied together with
     * the rest of the content of the selection.
     *
     * @param writer An instance of the model writer.
     * @param selection Selection to be checked.
     * @param action Type of clipboard action.
     */
    private _insertFakeMarkersIntoSelection;
    /**
     * Returns array of markers that can be copied in specified selection.
     *
     * If marker cannot be copied partially (according to `copyPartiallySelected` configuration flag) and
     * is not present entirely in any selection range then it will be skipped.
     *
     * @param writer An instance of the model writer.
     * @param selection  Selection which will be checked.
     * @param action Type of clipboard action. If null then checks only if marker is registered as copyable.
     */
    private _getCopyableMarkersFromSelection;
    /**
     * Picks all markers from markers map that can be pasted.
     * If `duplicateOnPaste` is `true`, it regenerates their IDs to ensure uniqueness.
     * If marker is not registered, it will be kept in the array anyway.
     *
     * @param markers Object that maps marker name to corresponding range.
     * @param action Type of clipboard action. If null then checks only if marker is registered as copyable.
     */
    private _getPasteMarkersFromRangeMap;
    /**
     * Inserts specified array of fake markers elements to document and assigns them `type` and `name` attributes.
     * Fake markers elements are used to calculate position of markers on pasted fragment that were transformed during
     * steps between copy and paste.
     *
     * @param writer An instance of the model writer.
     * @param markers Array of markers that will be inserted.
     */
    private _insertFakeMarkersElements;
    /**
     * Removes all `$marker` elements from the given document fragment.
     *
     * Returns an object where keys are marker names, and values are ranges corresponding to positions
     * where `$marker` elements were inserted.
     *
     * If the document fragment had only one `$marker` element for given marker (start or end) the other boundary is set automatically
     * (to the end or start of the document fragment, respectively).
     *
     * @param writer An instance of the model writer.
     * @param rootElement The element to be checked.
     */
    private _removeFakeMarkersInsideElement;
    /**
     * Returns array that contains list of fake markers with corresponding `$marker` elements.
     *
     * For each marker, there can be two `$marker` elements or only one (if the document fragment contained
     * only the beginning or only the end of a marker).
     *
     * @param writer An instance of the model writer.
     * @param rootElement The element to be checked.
     */
    private _getAllFakeMarkersFromElement;
    /**
     * When copy of markers occurs we have to make sure that pasted markers have different names
     * than source markers. This functions helps with assigning unique part to marker name to
     * prevent duplicated markers error.
     *
     * @param name Name of marker
     */
    private _getUniqueMarkerName;
}
/**
 * Specifies which action is performed during clipboard event.
 *
 * @internal
 */
export type ClipboardMarkerRestrictedAction = 'copy' | 'cut' | 'dragstart';
/**
 * Specifies behavior of markers during clipboard actions.
 *
 * @internal
 */
export type ClipboardMarkerConfiguration = {
    allowedActions: NonEmptyArray<ClipboardMarkerRestrictedAction> | 'all';
    copyPartiallySelected?: boolean;
    duplicateOnPaste?: boolean;
};
