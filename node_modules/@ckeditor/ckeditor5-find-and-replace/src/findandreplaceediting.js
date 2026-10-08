/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module find-and-replace/findandreplaceediting
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { scrollViewportToShowTarget } from 'ckeditor5/src/utils.js';
import { FindCommand } from './findcommand.js';
import { ReplaceCommand } from './replacecommand.js';
import { ReplaceAllCommand } from './replaceallcommand.js';
import { FindNextCommand } from './findnextcommand.js';
import { FindPreviousCommand } from './findpreviouscommand.js';
import { FindAndReplaceState } from './findandreplacestate.js';
import { FindAndReplaceUtils } from './findandreplaceutils.js';
import { debounce } from 'es-toolkit/compat';
import '../theme/findandreplace.css';
const HIGHLIGHT_CLASS = 'ck-find-result_selected';
/**
 * Implements the editing part for find and replace plugin. For example conversion, commands etc.
 */
export class FindAndReplaceEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires() {
        return [FindAndReplaceUtils];
    }
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'FindAndReplaceEditing';
    }
    /**
     * @inheritDoc
     * @internal
     */
    static get licenseFeatureCode() {
        return 'FAR';
    }
    /**
     * @inheritDoc
     */
    static get isPremiumPlugin() {
        return true;
    }
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin() {
        return true;
    }
    /**
     * An object storing the find and replace state within a given editor instance.
     */
    state;
    /**
     * @inheritDoc
     */
    init() {
        this.state = new FindAndReplaceState(this.editor.model);
        this.set('_isSearchActive', false);
        this._defineConverters();
        this._defineCommands();
        this.listenTo(this.state, 'change:highlightedResult', (eventInfo, name, newValue, oldValue) => {
            const { model } = this.editor;
            model.change(writer => {
                if (oldValue) {
                    const oldMatchId = oldValue.marker.name.split(':')[1];
                    const oldMarker = model.markers.get(`findResultHighlighted:${oldMatchId}`);
                    if (oldMarker) {
                        writer.removeMarker(oldMarker);
                    }
                }
                if (newValue) {
                    const newMatchId = newValue.marker.name.split(':')[1];
                    writer.addMarker(`findResultHighlighted:${newMatchId}`, {
                        usingOperation: false,
                        affectsData: false,
                        range: newValue.marker.getRange()
                    });
                }
            });
        });
        /* istanbul ignore next -- @preserve */
        const scrollToHighlightedResult = (eventInfo, name, newValue) => {
            if (newValue) {
                const domConverter = this.editor.editing.view.domConverter;
                const viewRange = this.editor.editing.mapper.toViewRange(newValue.marker.getRange());
                scrollViewportToShowTarget({
                    target: domConverter.viewRangeToDom(viewRange),
                    viewportOffset: 40
                });
            }
        };
        const debouncedScrollListener = debounce(scrollToHighlightedResult.bind(this), 32);
        // Debounce scroll as highlight might be changed very frequently, e.g. when there's a replace all command.
        this.listenTo(this.state, 'change:highlightedResult', debouncedScrollListener, { priority: 'low' });
        // It's possible that the editor will get destroyed before debounced call kicks in.
        // This would result with accessing a view three that is no longer in DOM.
        this.listenTo(this.editor, 'destroy', debouncedScrollListener.cancel);
        this.on('change:_isSearchActive', (evt, name, isSearchActive) => {
            if (isSearchActive) {
                this.listenTo(this.editor.model.document, 'change:data', this._onDocumentChange);
            }
            else {
                this.stopListening(this.editor.model.document, 'change:data', this._onDocumentChange);
            }
        });
    }
    /**
     * Initiate a search.
     */
    find(callbackOrText, findAttributes) {
        this._isSearchActive = true;
        this.editor.execute('find', callbackOrText, findAttributes);
        return this.state.results;
    }
    /**
     * Stops active results from updating, and clears out the results.
     */
    stop() {
        this.state.clear(this.editor.model);
        this._isSearchActive = false;
    }
    /**
     * Sets up the commands.
     */
    _defineCommands() {
        this.editor.commands.add('find', new FindCommand(this.editor, this.state));
        this.editor.commands.add('findNext', new FindNextCommand(this.editor, this.state));
        this.editor.commands.add('findPrevious', new FindPreviousCommand(this.editor, this.state));
        this.editor.commands.add('replace', new ReplaceCommand(this.editor, this.state));
        this.editor.commands.add('replaceAll', new ReplaceAllCommand(this.editor, this.state));
    }
    /**
     * Sets up the marker downcast converters for search results highlighting.
     */
    _defineConverters() {
        const { editor } = this;
        // Setup the marker highlighting conversion.
        editor.conversion.for('editingDowncast').markerToHighlight({
            model: 'findResult',
            view: ({ markerName }) => {
                const [, id] = markerName.split(':');
                // Marker removal from the view has a bug: https://github.com/ckeditor/ckeditor5/issues/7499
                // A minimal option is to return a new object for each converted marker...
                return {
                    name: 'span',
                    classes: ['ck-find-result'],
                    attributes: {
                        // ...however, adding a unique attribute should be future-proof..
                        'data-find-result': id
                    }
                };
            }
        });
        editor.conversion.for('editingDowncast').markerToHighlight({
            model: 'findResultHighlighted',
            view: ({ markerName }) => {
                const [, id] = markerName.split(':');
                // Marker removal from the view has a bug: https://github.com/ckeditor/ckeditor5/issues/7499
                // A minimal option is to return a new object for each converted marker...
                return {
                    name: 'span',
                    classes: [HIGHLIGHT_CLASS],
                    attributes: {
                        // ...however, adding a unique attribute should be future-proof..
                        'data-find-result': id
                    }
                };
            }
        });
    }
    /**
     * Reacts to document changes in order to update search list.
     */
    _onDocumentChange = () => {
        const changedNodes = new Set();
        const removedMarkers = new Set();
        const model = this.editor.model;
        const { results } = this.state;
        const changes = model.document.differ.getChanges();
        const changedMarkers = model.document.differ.getChangedMarkers();
        // Get nodes in which changes happened to re-run a search callback on them.
        changes.forEach(change => {
            if (!change.position) {
                return;
            }
            if (change.name === '$text' || (change.position.nodeAfter && model.schema.isInline(change.position.nodeAfter))) {
                changedNodes.add(change.position.parent);
                [...model.markers.getMarkersAtPosition(change.position)].forEach(markerAtChange => {
                    removedMarkers.add(markerAtChange.name);
                });
            }
            else if (change.type === 'insert' && change.position.nodeAfter) {
                changedNodes.add(change.position.nodeAfter);
            }
        });
        // Get markers from removed nodes also.
        changedMarkers.forEach(({ name, data: { newRange } }) => {
            if (newRange && newRange.start.root.rootName === '$graveyard') {
                removedMarkers.add(name);
            }
        });
        // Get markers from the updated nodes and remove all (search will be re-run on these nodes).
        changedNodes.forEach(node => {
            const markersInNode = [...model.markers.getMarkersIntersectingRange(model.createRangeIn(node))];
            markersInNode.forEach(marker => removedMarkers.add(marker.name));
        });
        // Remove results from the changed part of content.
        removedMarkers.forEach(markerName => {
            if (!results.has(markerName)) {
                return;
            }
            if (results.get(markerName) === this.state.highlightedResult) {
                this.state.highlightedResult = null;
            }
            results.remove(markerName);
        });
        // Run search callback again on updated nodes.
        const changedSearchResults = [];
        const findAndReplaceUtils = this.editor.plugins.get('FindAndReplaceUtils');
        changedNodes.forEach(nodeToCheck => {
            const changedNodeSearchResults = findAndReplaceUtils.updateFindResultFromRange(model.createRangeOn(nodeToCheck), model, this.state.lastSearchCallback, results);
            changedSearchResults.push(...changedNodeSearchResults);
        });
        changedMarkers.forEach(markerToCheck => {
            // Handle search result highlight update when T&C plugin is active.
            // Lookup is performed only on newly inserted markers.
            if (markerToCheck.data.newRange) {
                const changedNodeSearchResults = findAndReplaceUtils.updateFindResultFromRange(markerToCheck.data.newRange, model, this.state.lastSearchCallback, results);
                changedSearchResults.push(...changedNodeSearchResults);
            }
        });
        if (!this.state.highlightedResult && changedSearchResults.length) {
            // If there are found phrases but none is selected, select the first one.
            this.state.highlightedResult = changedSearchResults[0];
        }
        else {
            // If there is already highlight item then refresh highlight offset after appending new items.
            this.state.refreshHighlightOffset(model);
        }
    };
}
