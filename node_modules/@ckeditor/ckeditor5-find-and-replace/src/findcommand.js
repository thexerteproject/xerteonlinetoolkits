/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module find-and-replace/findcommand
*/
import { Command } from 'ckeditor5/src/core.js';
/**
 * The find command. It is used by the {@link module:find-and-replace/findandreplace~FindAndReplace find and replace feature}.
 */
export class FindCommand extends Command {
    /**
     * The find and replace state object used for command operations.
     */
    _state;
    /**
     * Creates a new `FindCommand` instance.
     *
     * @param editor The editor on which this command will be used.
     * @param state An object to hold plugin state.
     */
    constructor(editor, state) {
        super(editor);
        // The find command is always enabled.
        this.isEnabled = true;
        // It does not affect data so should be enabled in read-only mode.
        this.affectsData = false;
        this._state = state;
    }
    /**
     * Executes the command.
     *
     * @param callbackOrText
     * @param options Options object.
     * @param options.matchCase If set to `true`, the letter case will be matched.
     * @param options.wholeWords If set to `true`, only whole words that match `callbackOrText` will be matched.
     *
     * @fires execute
     */
    execute(callbackOrText, { matchCase, wholeWords } = {}) {
        const { editor } = this;
        const { model } = editor;
        const findAndReplaceUtils = editor.plugins.get('FindAndReplaceUtils');
        let findCallback;
        let callbackSearchText = '';
        // Allow to execute `find()` on a plugin with a keyword only.
        if (typeof callbackOrText === 'string') {
            findCallback = (...args) => ({
                results: findAndReplaceUtils.findByTextCallback(callbackOrText, { matchCase, wholeWords })(...args),
                searchText: callbackOrText
            });
        }
        else {
            findCallback = callbackOrText;
        }
        // Wrap the callback to get the search text that will be assigned to the state.
        const oldCallback = findCallback;
        findCallback = (...args) => {
            const result = oldCallback(...args);
            if (result && 'searchText' in result) {
                callbackSearchText = result.searchText;
            }
            return result;
        };
        // Initial search is done on all nodes in all roots inside the content.
        const results = model.document.getRootNames()
            .reduce(((currentResults, rootName) => findAndReplaceUtils.updateFindResultFromRange(model.createRangeIn(model.document.getRoot(rootName)), model, findCallback, currentResults)), null);
        this._state.clear(model);
        this._state.results.addMany(results);
        this._state.highlightedResult = results.get(0);
        this._state.searchText = callbackSearchText;
        if (findCallback) {
            this._state.lastSearchCallback = findCallback;
        }
        this._state.matchCase = !!matchCase;
        this._state.matchWholeWords = !!wholeWords;
        return {
            results,
            findCallback
        };
    }
}
