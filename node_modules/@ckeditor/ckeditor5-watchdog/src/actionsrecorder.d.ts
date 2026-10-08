/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module watchdog/actionsrecorder
 */
import type { Editor } from '@ckeditor/ckeditor5-core';
import type { ActionsRecorderEntry } from './actionsrecorderconfig.js';
/**
 * A plugin that records user actions and editor state changes for debugging purposes. It tracks commands execution, model operations,
 * UI interactions, and document events. It just collects data locally, and does not send it anywhere, integrator is responsible
 * for gathering data from this plugin for further processing.
 *
 * **Important! `ActionsRecorder` is an experimental feature, and may become deprecated.**
 *
 * By default, plugin stores latest 1000 action entries. Integrator can register an `onError` callback to collect those entries
 * in case of exception. Integrator should augment this data with application specific data such as page-id or session-id,
 * depending on the application. Augmented data should be processed by the integrator, for example integrator should send it
 * to some data collecting endpoint for later analysis.
 *
 * Example:
 *
 * ```ts
 * 	ClassicEditor
 * 		.create( editorElement, {
 * 			plugins: [ ActionsRecorder, ... ],
 * 			actionsRecorder: {
 * 				maxEntries: 1000, // This is the default value and could be adjusted.
 *
 * 				onError( error, entries ) {
 * 					console.error( 'ActionsRecorder - Error detected:', error );
 * 					console.warn( 'Actions recorded before error:', entries );
 *
 * 					this.flushEntries();
 *
 * 					// Integrator should send and store the entries. The error is already in the last entry in serializable form.
 * 				}
 * 			}
 * 		} )
 * 		.then( ... )
 * 		.catch( ... );
 * ```
 *
 * Alternatively integrator could continuously collect actions in batches and send them to theirs endpoint for later analysis:
 *
 * ```ts
 * 	ClassicEditor
 * 		.create( editorElement, {
 * 			plugins: [ ActionsRecorder, ... ],
 * 			actionsRecorder: {
 * 				maxEntries: 50, // This is the batch size.
 *
 * 				onMaxEntries() {
 * 					const entries = this.getEntries();
 *
 * 					this.flushEntries();
 *
 * 					console.log( 'ActionsRecorder - Batch of entries:', entries );
 *
 * 					// Integrator should send and store the entries.
 * 				},
 *
 * 				onError( error, entries ) {
 * 					console.error( 'ActionsRecorder - Error detected:', error );
 * 					console.warn( 'Actions recorded before error:', entries );
 *
 * 					this.flushEntries();
 *
 * 					// Integrator should send and store the entries. The error is already in the last entry in serializable form.
 * 				}
 * 			}
 * 		} )
 * 		.then( ... )
 * 		.catch( ... );
 * ```
 *
 * See {@link module:watchdog/actionsrecorderconfig~ActionsRecorderConfig plugin configuration} for more details.
 *
 */
export declare class ActionsRecorder {
    /**
     * The editor instance.
     */
    readonly editor: Editor;
    /**
     * Array storing all recorded action entries with their context and state snapshots.
     */
    private _entries;
    /**
     * Stack tracking nested action frames to maintain call hierarchy.
     */
    private _frameStack;
    /**
     * Set of already reported errors used to notify only once for each error (not on every try-catch nested block).
     */
    private _errors;
    /**
     * Maximum number of action entries to keep in memory.
     */
    private _maxEntries;
    /**
     * Error callback.
     */
    private _errorCallback?;
    /**
     * Filter function to determine which entries should be stored.
     */
    private _filterCallback?;
    /**
     * Callback triggered every time count of recorded entries reaches maxEntries.
     */
    private _maxEntriesCallback;
    /**
     * @inheritDoc
     */
    static get pluginName(): "ActionsRecorder";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * Returns all recorded action entries.
     */
    getEntries(): Array<ActionsRecorderEntry>;
    /**
     * Flushes all recorded entries.
     */
    flushEntries(): void;
    /**
     * Creates a new action frame and adds it to the recording stack.
     *
     * @param action The name/type of the action being recorded.
     * @param params Optional parameters associated with the event.
     * @returns The created call frame object.
     */
    private _enterFrame;
    /**
     * Closes an action frame and records its final state and results.
     *
     * @param callFrame The call frame to close.
     * @param result Optional result value from the action.
     * @param error Optional error that occurred during the action.
     */
    private _leaveFrame;
    /**
     * Builds a snapshot of the current editor state including document version,
     * read-only status, focus state, and model selection.
     *
     * @returns An object containing the current editor state snapshot.
     */
    private _buildStateSnapshot;
    /**
     * Sets up recording for all editor commands, both existing and future ones.
     * Taps into the command execution to track when commands are run.
     */
    private _tapCommands;
    /**
     * Sets up recording for model operation applications.
     * Tracks when operations are applied to the model document.
     */
    private _tapOperationApply;
    /**
     * Sets up recording for key model methods like insertContent, insertObject, and deleteContent.
     * These methods represent high-level model manipulation operations.
     */
    private _tapModelMethods;
    /**
     * Sets up recording for model selection changes.
     * Tracks when the selection range, attributes, or markers change.
     */
    private _tapModelSelection;
    /**
     * Sets up recording for a specific command execution.
     *
     * @param commandName The name of the command to record.
     * @param command The command instance to tap into.
     */
    private _tapCommand;
    /**
     * Sets up recording for UI component factory creation and component interactions.
     * Tracks when components are created and their execute events.
     */
    private _tapComponentFactory;
    /**
     * Sets up recording for view document events like clicks, keyboard input,
     * selection changes, and other user interactions.
     */
    private _tapViewDocumentEvents;
    /**
     * Sets up recording for specific events fired by an emitter object.
     *
     * @param emitter The object that fires events to be recorded.
     * @param eventNames Array of event names to record.
     * @param context Additional context to include with recorded events.
     */
    private _tapFireMethod;
    /**
     * Triggers error callback.
     */
    private _callErrorCallback;
    /**
     * The default handler for maxEntries callback.
     */
    private _maxEntriesDefaultHandler;
}
/**
 * Creates a wrapper around a method to record its calls, results, and errors.
 *
 * @internal
 *
 * @param object The object containing the method to tap.
 * @param methodName The name of the method to tap.
 * @param tap The tap configuration with before/after/error hooks.
 * @param context Additional context to include with the method calls.
 */
export declare function tapObjectMethod(object: any, methodName: string, tap: MethodTap, context?: Record<string, any>): void;
/**
 * Represents a method tap with optional hooks for before, after, and error handling.
 */
interface MethodTap extends Record<string, any> {
    /**
     * Hook called before the original method execution.
     *
     * @param context The call context object for storing state between hooks.
     * @param args The arguments passed to the original method.
     * @returns True if the method call should be recorded, false to ignore it.
     */
    before?: (context: Record<string, any>, args: Array<any>) => boolean;
    /**
     * Hook called after successful method execution.
     *
     * @param context The call context object with state from the before hook.
     * @param result The result returned by the original method.
     */
    after?: (context: Record<string, any>, result: any) => void;
    /**
     * Hook called when the method execution throws an error.
     *
     * @param context The call context object with state from the before hook.
     * @param error The error thrown by the original method.
     */
    error?: (context: Record<string, any>, error: any) => void;
}
/**
 * Serializes a value into a JSON-serializable format.
 *
 * @internal
 *
 * @param value The value to serialize.
 * @param visited Set of already serialized objects to avoid circular references.
 * @returns A JSON-serializable representation of the value.
 */
export declare function serializeValue(value: any, visited?: WeakSet<object>): any;
export {};
