/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import type { Batch, Model, ModelRange } from '@ckeditor/ckeditor5-engine';
declare const TextWatcher_base: {
    new (): import("@ckeditor/ckeditor5-utils").Observable;
    prototype: import("@ckeditor/ckeditor5-utils").Observable;
};
/**
 * The text watcher feature.
 *
 * Fires the {@link module:typing/textwatcher~TextWatcher#event:matched:data `matched:data`},
 * {@link module:typing/textwatcher~TextWatcher#event:matched:selection `matched:selection`} and
 * {@link module:typing/textwatcher~TextWatcher#event:unmatched `unmatched`} events on typing or selection changes.
 */
export declare class TextWatcher extends /* #__PURE__ */ TextWatcher_base {
    /**
     * The editor's model.
     */
    readonly model: Model;
    /**
     * The function used to match the text.
     *
     * The test callback can return 3 values:
     *
     * * `false` if there is no match,
     * * `true` if there is a match,
     * * an object if there is a match and we want to pass some additional information to the {@link #event:matched:data} event.
     */
    testCallback: (text: string) => unknown;
    /**
     * Whether there is a match currently.
     */
    private _hasMatch;
    /**
     * Flag indicating whether the `TextWatcher` instance is enabled or disabled.
     * A disabled TextWatcher will not evaluate text.
     *
     * To disable TextWatcher:
     *
     * ```ts
     * const watcher = new TextWatcher( editor.model, testCallback );
     *
     * // After this a testCallback will not be called.
     * watcher.isEnabled = false;
     * ```
     */
    isEnabled: boolean;
    /**
     * Creates a text watcher instance.
     *
     * @param testCallback See {@link module:typing/textwatcher~TextWatcher#testCallback}.
     */
    constructor(model: Model, testCallback: (text: string) => unknown);
    /**
     * Flag indicating whether there is a match currently.
     */
    get hasMatch(): boolean;
    /**
     * Starts listening to the editor for typing and selection events.
     */
    private _startListening;
    /**
     * Checks the editor content for matched text.
     *
     * @fires matched:data
     * @fires matched:selection
     * @fires unmatched
     *
     * @param suffix A suffix used for generating the event name.
     * @param data Data object for event.
     */
    private _evaluateTextBeforeSelection;
}
export type TextWatcherMatchedEvent<TCallbackResult extends Record<string, unknown> = Record<string, unknown>> = {
    name: 'matched' | 'matched:data' | 'matched:selection';
    args: [
        {
            text: string;
            range: ModelRange;
            batch?: Batch;
        } & TCallbackResult
    ];
};
/**
 * Fired whenever the text watcher found a match for data changes.
 *
 * @eventName ~TextWatcher#matched:data
 * @param data Event data.
 * @param data.testResult The additional data returned from the {@link module:typing/textwatcher~TextWatcher#testCallback}.
 */
export type TextWatcherMatchedDataEvent<TCallbackResult extends Record<string, unknown>> = {
    name: 'matched:data';
    args: [data: TextWatcherMatchedTypingDataEventData & TCallbackResult];
};
export interface TextWatcherMatchedTypingDataEventData {
    /**
     * The full text before selection to which the regexp was applied.
     */
    text: string;
    /**
     * The range representing the position of the `data.text`.
     */
    range: ModelRange;
    batch: Batch;
}
/**
 * Fired whenever the text watcher found a match for selection changes.
 *
 * @eventName ~TextWatcher#matched:selection
 * @param data Event data.
 * @param data.testResult The additional data returned from the {@link module:typing/textwatcher~TextWatcher#testCallback}.
 */
export type TextWatcherMatchedTypingSelectionEvent<TCallbackResult extends Record<string, unknown>> = {
    name: 'matched:selection';
    args: [data: TextWatcherMatchedTypingSelectionEventData & TCallbackResult];
};
export interface TextWatcherMatchedTypingSelectionEventData {
    /**
     * The full text before selection.
     */
    text: string;
    /**
     * The range representing the position of the `data.text`.
     */
    range: ModelRange;
}
/**
 * Fired whenever the text does not match anymore. Fired only when the text watcher found a match.
 *
 * @eventName ~TextWatcher#unmatched
 */
export type TextWatcherUnmatchedTypingEvent = {
    name: 'unmatched';
    args: [];
};
export {};
