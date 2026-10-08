/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Config, type Locale, type LocaleTranslate } from '@ckeditor/ckeditor5-utils';
import { Conversion, DataController, EditingController, Model } from '@ckeditor/ckeditor5-engine';
import type { EditorUI } from '@ckeditor/ckeditor5-ui';
import { ContextWatchdog, EditorWatchdog } from '@ckeditor/ckeditor5-watchdog';
import { Context } from '../context.js';
import { PluginCollection } from '../plugincollection.js';
import { CommandCollection, type CommandsMap } from '../commandcollection.js';
import { EditingKeystrokeHandler } from '../editingkeystrokehandler.js';
import { Accessibility } from '../accessibility.js';
import type { LoadedPlugins, PluginConstructor } from '../plugin.js';
import type { EditorConfig } from './editorconfig.js';
import '../../theme/core.css';
declare global {
    var CKEDITOR_GLOBAL_LICENSE_KEY: string | undefined;
    var CKEDITOR_WARNING_SUPPRESSIONS: Record<string, boolean>;
}
declare const Editor_base: {
    new (): import("@ckeditor/ckeditor5-utils").Observable;
    prototype: import("@ckeditor/ckeditor5-utils").Observable;
};
/**
 * The class representing a basic, generic editor.
 *
 * Check out the list of its subclasses to learn about specific editor implementations.
 *
 * All editor implementations (like {@link module:editor-classic/classiceditor~ClassicEditor} or
 * {@link module:editor-inline/inlineeditor~InlineEditor}) should extend this class. They can add their
 * own methods and properties.
 *
 * When you are implementing a plugin, this editor represents the API
 * which your plugin can expect to get when using its {@link module:core/plugin~Plugin#editor} property.
 *
 * This API should be sufficient in order to implement the "editing" part of your feature
 * (schema definition, conversion, commands, keystrokes, etc.).
 * It does not define the editor UI, which is available only if
 * the specific editor implements also the {@link ~Editor#ui} property
 * (as most editor implementations do).
 */
export declare abstract class Editor extends /* #__PURE__ */ Editor_base {
    /**
     * A required name of the editor class. The name should reflect the constructor name.
     */
    static get editorName(): `${string}Editor`;
    /**
     * A namespace for the accessibility features of the editor.
     */
    readonly accessibility: Accessibility;
    /**
     * Commands registered to the editor.
     *
     * Use the shorthand {@link #execute `editor.execute()`} method to execute commands:
     *
     * ```ts
     * // Execute the bold command:
     * editor.execute( 'bold' );
     *
     * // Check the state of the bold command:
     * editor.commands.get( 'bold' ).value;
     * ```
     */
    readonly commands: CommandCollection;
    /**
     * Stores all configurations specific to this editor instance.
     *
     * ```ts
     * editor.config.get( 'image.toolbar' );
     * // -> [ 'imageStyle:block', 'imageStyle:side', '|', 'toggleImageCaption', 'imageTextAlternative' ]
     * ```
     */
    readonly config: Config<EditorConfig>;
    /**
     * Conversion manager through which you can register model-to-view and view-to-model converters.
     *
     * See the {@link module:engine/conversion/conversion~Conversion} documentation to learn how to add converters.
     */
    readonly conversion: Conversion;
    /**
     * The {@link module:engine/controller/datacontroller~DataController data controller}.
     * Used e.g. for setting and retrieving the editor data.
     */
    readonly data: DataController;
    /**
     * The {@link module:engine/controller/editingcontroller~EditingController editing controller}.
     * Controls user input and rendering the content for editing.
     */
    readonly editing: EditingController;
    /**
     * The locale instance.
     */
    readonly locale: Locale;
    /**
     * The editor's model.
     *
     * The central point of the editor's abstract data model.
     */
    readonly model: Model;
    /**
     * The plugins loaded and in use by this editor instance.
     *
     * ```ts
     * editor.plugins.get( 'ClipboardPipeline' ); // -> An instance of the clipboard pipeline plugin.
     * ```
     */
    readonly plugins: PluginCollection<Editor>;
    /**
     * An instance of the {@link module:core/editingkeystrokehandler~EditingKeystrokeHandler}.
     *
     * It allows setting simple keystrokes:
     *
     * ```ts
     * // Execute the bold command on Ctrl+E:
     * editor.keystrokes.set( 'Ctrl+E', 'bold' );
     *
     * // Execute your own callback:
     * editor.keystrokes.set( 'Ctrl+E', ( data, cancel ) => {
     * 	console.log( data.keyCode );
     *
     * 	// Prevent the default (native) action and stop the underlying keydown event
     * 	// so no other editor feature will interfere.
     * 	cancel();
     * } );
     * ```
     *
     * Note: Certain typing-oriented keystrokes (like <kbd>Backspace</kbd> or <kbd>Enter</kbd>) are handled
     * by a low-level mechanism and trying to listen to them via the keystroke handler will not work reliably.
     * To handle these specific keystrokes, see the events fired by the
     * {@link module:engine/view/document~ViewDocument editing view document} (`editor.editing.view.document`).
     */
    readonly keystrokes: EditingKeystrokeHandler;
    /**
     * Shorthand for {@link module:utils/locale~Locale#t}.
     *
     * @see module:utils/locale~Locale#t
     */
    readonly t: LocaleTranslate;
    readonly id: string;
    /**
     * Indicates the editor life-cycle state.
     *
     * The editor is in one of the following states:
     *
     * * `initializing` &ndash; During the editor initialization (before
     * {@link module:core/editor/editor~Editor.create `Editor.create()`}) finished its job.
     * * `ready` &ndash; After the promise returned by the {@link module:core/editor/editor~Editor.create `Editor.create()`}
     * method is resolved.
     * * `destroyed` &ndash; Once the {@link #destroy `editor.destroy()`} method was called.
     *
     * @observable
     */
    state: 'initializing' | 'ready' | 'destroyed';
    /**
     * The default configuration which is built into the editor class.
     *
     * It was used in the now deprecated CKEditor 5 builds to provide the default configuration options
     * which are later used during the editor initialization.
     *
     * ```ts
     * ClassicEditor.defaultConfig = {
     * 	foo: 1,
     * 	bar: 2
     * };
     *
     * ClassicEditor
     * 	.create( sourceElement )
     * 	.then( editor => {
     * 		editor.config.get( 'foo' ); // -> 1
     * 		editor.config.get( 'bar' ); // -> 2
     * 	} );
     *
     * // The default options can be overridden by the configuration passed to create().
     * ClassicEditor
     * 	.create( sourceElement, { bar: 3 } )
     * 	.then( editor => {
     * 		editor.config.get( 'foo' ); // -> 1
     * 		editor.config.get( 'bar' ); // -> 3
     * 	} );
     * ```
     *
     * See also {@link module:core/editor/editor~Editor.builtinPlugins}.
     */
    static defaultConfig?: EditorConfig;
    /**
     * An array of plugins built into this editor class.
     *
     * It is used in the now deprecated CKEditor 5 builds to provide a list of plugins which are later automatically initialized
     * during the editor initialization.
     *
     * They will be automatically initialized by the editor, unless listed in `config.removePlugins` and
     * unless `config.plugins` is passed.
     *
     * ```ts
     * // Build some plugins into the editor class first.
     * ClassicEditor.builtinPlugins = [ FooPlugin, BarPlugin ];
     *
     * // Normally, you need to define config.plugins, but since ClassicEditor.builtinPlugins was
     * // defined, now you can call create() without any configuration.
     * ClassicEditor
     * 	.create( sourceElement )
     * 	.then( editor => {
     * 		editor.plugins.get( FooPlugin ); // -> An instance of the Foo plugin.
     * 		editor.plugins.get( BarPlugin ); // -> An instance of the Bar plugin.
     * 	} );
     *
     * ClassicEditor
     * 	.create( sourceElement, {
     * 		// Do not initialize these plugins (note: it is defined by a string):
     * 		removePlugins: [ 'Foo' ]
     * 	} )
     * 	.then( editor => {
     * 		editor.plugins.get( FooPlugin ); // -> Undefined.
     * 		editor.config.get( BarPlugin ); // -> An instance of the Bar plugin.
     * 	} );
     *
     * ClassicEditor
     * 	.create( sourceElement, {
     * 		// Load only this plugin. It can also be defined by a string if
     * 		// this plugin was built into the editor class.
     * 		plugins: [ FooPlugin ]
     * 	} )
     * 	.then( editor => {
     * 		editor.plugins.get( FooPlugin ); // -> An instance of the Foo plugin.
     * 		editor.config.get( BarPlugin ); // -> Undefined.
     * 	} );
     * ```
     *
     * See also {@link module:core/editor/editor~Editor.defaultConfig}.
     */
    static builtinPlugins?: Array<PluginConstructor<Editor>>;
    /**
     * The editor UI instance.
     */
    abstract get ui(): EditorUI;
    /**
     * The editor context.
     * When it is not provided through the configuration, the editor creates it.
     */
    protected readonly _context: Context;
    /**
     * A set of lock IDs for the {@link #isReadOnly} getter.
     */
    protected readonly _readOnlyLocks: Set<symbol | string>;
    /**
     * `Editor` class is commonly put in `config.plugins` array.
     *
     * This property helps with better error detection.
     *
     * @internal
     */
    static get _throwErrorWhenUsedAsAPlugin(): true;
    /**
     * Creates a new instance of the editor class.
     *
     * Usually, not to be used directly. See the static {@link module:core/editor/editor~Editor.create `create()`} method.
     *
     * @param config The editor configuration.
     */
    constructor(config?: EditorConfig);
    /**
     * Defines whether the editor is in the read-only mode.
     *
     * In read-only mode the editor {@link #commands commands} are disabled so it is not possible
     * to modify the document by using them. Also, the editable element(s) become non-editable.
     *
     * In order to make the editor read-only, you need to call the {@link #enableReadOnlyMode} method:
     *
     * ```ts
     * editor.enableReadOnlyMode( 'feature-id' );
     * ```
     *
     * Later, to turn off the read-only mode, call {@link #disableReadOnlyMode}:
     *
     * ```ts
     * editor.disableReadOnlyMode( 'feature-id' );
     * ```
     *
     * @readonly
     * @observable
     */
    get isReadOnly(): boolean;
    set isReadOnly(value: boolean);
    /**
     * Turns on the read-only mode in the editor.
     *
     * Editor can be switched to or out of the read-only mode by many features, under various circumstances. The editor supports locking
     * mechanism for the read-only mode. It enables easy control over the read-only mode when many features wants to turn it on or off at
     * the same time, without conflicting with each other. It guarantees that you will not make the editor editable accidentally (which
     * could lead to errors).
     *
     * Each read-only mode request is identified by a unique id (also called "lock"). If multiple plugins requested to turn on the
     * read-only mode, then, the editor will become editable only after all these plugins turn the read-only mode off (using the same ids).
     *
     * Note, that you cannot force the editor to disable the read-only mode if other plugins set it.
     *
     * After the first `enableReadOnlyMode()` call, the {@link #isReadOnly `isReadOnly` property} will be set to `true`:
     *
     * ```ts
     * editor.isReadOnly; // `false`.
     * editor.enableReadOnlyMode( 'my-feature-id' );
     * editor.isReadOnly; // `true`.
     * ```
     *
     * You can turn off the read-only mode ("clear the lock") using the {@link #disableReadOnlyMode `disableReadOnlyMode()`} method:
     *
     * ```ts
     * editor.enableReadOnlyMode( 'my-feature-id' );
     * // ...
     * editor.disableReadOnlyMode( 'my-feature-id' );
     * editor.isReadOnly; // `false`.
     * ```
     *
     * All "locks" need to be removed to enable editing:
     *
     * ```ts
     * editor.enableReadOnlyMode( 'my-feature-id' );
     * editor.enableReadOnlyMode( 'my-other-feature-id' );
     * // ...
     * editor.disableReadOnlyMode( 'my-feature-id' );
     * editor.isReadOnly; // `true`.
     * editor.disableReadOnlyMode( 'my-other-feature-id' );
     * editor.isReadOnly; // `false`.
     * ```
     *
     * @param lockId A unique ID for setting the editor to the read-only state.
     */
    enableReadOnlyMode(lockId: string | symbol): void;
    /**
     * Removes the read-only lock from the editor with given lock ID.
     *
     * When no lock is present on the editor anymore, then the {@link #isReadOnly `isReadOnly` property} will be set to `false`.
     *
     * @param lockId The lock ID for setting the editor to the read-only state.
     */
    disableReadOnlyMode(lockId: string | symbol): void;
    /**
     * Sets the data in the editor.
     *
     * ```ts
     * editor.setData( '<p>This is editor!</p>' );
     * ```
     *
     * If your editor implementation uses multiple roots, you should pass an object with keys corresponding
     * to the editor root names and values equal to the data that should be set in each root:
     *
     * ```ts
     * editor.setData( {
     *     header: '<p>Content for header part.</p>',
     *     content: '<p>Content for main part.</p>',
     *     footer: '<p>Content for footer part.</p>'
     * } );
     * ```
     *
     * By default the editor accepts HTML. This can be controlled by injecting a different data processor.
     * See the {@glink features/markdown Markdown output} guide for more details.
     *
     * @param data Input data.
     */
    setData(data: string | Record<string, string>): void;
    /**
     * Gets the data from the editor.
     *
     * ```ts
     * editor.getData(); // -> '<p>This is editor!</p>'
     * ```
     *
     * If your editor implementation uses multiple roots, you should pass root name as one of the options:
     *
     * ```ts
     * editor.getData( { rootName: 'header' } ); // -> '<p>Content for header part.</p>'
     * ```
     *
     * By default, the editor outputs HTML. This can be controlled by injecting a different data processor.
     * See the {@glink features/markdown Markdown output} guide for more details.
     *
     * A warning is logged when you try to retrieve data for a detached root, as most probably this is a mistake. A detached root should
     * be treated like it is removed, and you should not save its data. Note, that the detached root data is always an empty string.
     *
     * @param options Additional configuration for the retrieved data.
     * Editor features may introduce more configuration options that can be set through this parameter.
     * @param options.rootName Root name. Defaults to `'main'`.
     * @param options.trim Whether returned data should be trimmed. This option is set to `'empty'` by default,
     * which means that whenever editor content is considered empty, an empty string is returned. To turn off trimming
     * use `'none'`. In such cases exact content will be returned (for example `'<p>&nbsp;</p>'` for an empty editor).
     * @returns Output data.
     */
    getData(options?: {
        rootName?: string;
        trim?: 'empty' | 'none';
        [key: string]: unknown;
    }): string;
    /**
     * Loads and initializes plugins specified in the configuration.
     *
     * @returns A promise which resolves once the initialization is completed, providing an array of loaded plugins.
     */
    initPlugins(): Promise<LoadedPlugins>;
    /**
     * Destroys the editor instance, releasing all resources used by it.
     *
     * **Note** The editor cannot be destroyed during the initialization phase so if it is called
     * while the editor {@link #state is being initialized}, it will wait for the editor initialization before destroying it.
     *
     * @fires destroy
     * @returns A promise that resolves once the editor instance is fully destroyed.
     */
    destroy(): Promise<unknown>;
    /**
     * Executes the specified command with given parameters.
     *
     * Shorthand for:
     *
     * ```ts
     * editor.commands.get( commandName ).execute( ... );
     * ```
     *
     * @param commandName The name of the command to execute.
     * @param commandParams Command parameters.
     * @returns The value returned by the {@link module:core/commandcollection~CommandCollection#execute `commands.execute()`}.
     */
    execute<TName extends string>(commandName: TName, ...commandParams: Parameters<CommandsMap[TName]['execute']>): ReturnType<CommandsMap[TName]['execute']>;
    /**
     * Focuses the editor.
     *
     * **Note** To explicitly focus the editing area of the editor, use the
     * {@link module:engine/view/view~EditingView#focus `editor.editing.view.focus()`} method of the editing view.
     *
     * Check out the {@glink framework/deep-dive/ui/focus-tracking#focus-in-the-editor-ui Focus in the editor UI} section
     * of the {@glink framework/deep-dive/ui/focus-tracking Deep dive into focus tracking} guide to learn more.
     */
    focus(): void;
    /**
     * Creates and initializes a new editor instance.
     *
     * This is an abstract method. Every editor type needs to implement its own initialization logic.
     *
     * See the `create()` methods of the existing editor types to learn how to use them:
     *
     * * {@link module:editor-classic/classiceditor~ClassicEditor.create `ClassicEditor.create()`}
     * * {@link module:editor-balloon/ballooneditor~BalloonEditor.create `BalloonEditor.create()`}
     * * {@link module:editor-decoupled/decouplededitor~DecoupledEditor.create `DecoupledEditor.create()`}
     * * {@link module:editor-inline/inlineeditor~InlineEditor.create `InlineEditor.create()`}
     */
    static create(...args: Array<unknown>): void;
    /**
     * The {@link module:core/context~Context} class.
     *
     * Exposed as static editor field for easier access in editor builds.
     */
    static Context: typeof Context;
    /**
     * The {@link module:watchdog/editorwatchdog~EditorWatchdog} class.
     *
     * Exposed as static editor field for easier access in editor builds.
     */
    static EditorWatchdog: typeof EditorWatchdog;
    /**
     * The {@link module:watchdog/contextwatchdog~ContextWatchdog} class.
     *
     * Exposed as static editor field for easier access in editor builds.
     */
    static ContextWatchdog: typeof ContextWatchdog;
    protected _showLicenseError(reason: LicenseErrorReason, name?: string): void;
    /**
     * This part of the code is _not_ executed in installations under the GPL license (with `config.licenseKey = 'GPL'`).
     *
     * It is only executed when a specific license key is provided. If you are uncertain whether
     * this applies to your installation, please contact our support team.
     */
    private _sendUsageRequest;
}
/**
 * @internal
 */
export type LicenseErrorReason = 'invalid' | 'expired' | 'domainLimit' | 'pluginNotAllowed' | 'featureNotAllowed' | 'evaluationLimit' | 'trialLimit' | 'developmentLimit' | 'usageLimit' | 'distributionChannel';
/**
 * Fired when the {@link module:engine/controller/datacontroller~DataController#event:ready data} and all additional
 * editor components are ready.
 *
 * Note: This event is most useful for plugin developers. When integrating the editor with your website or
 * application, you do not have to listen to `editor#ready` because when the promise returned by the static
 * {@link module:core/editor/editor~Editor.create `Editor.create()`} event is resolved, the editor is already ready.
 * In fact, since the first moment when the editor instance is available to you is inside `then()`'s callback,
 * you cannot even add a listener to the `editor#ready` event.
 *
 * See also the {@link module:core/editor/editor~Editor#state `editor.state`} property.
 *
 * @eventName ~Editor#ready
 */
export type EditorReadyEvent = {
    name: 'ready';
    args: [];
};
/**
 * Fired when the editor is about to collect usage data.
 *
 * This event is fired when the editor is about to collect usage data. It allows plugins to provide additional data for
 * the usage statistics. The usage data is collected by the editor and sent to the usage tracking server. All plugins are
 * expected to be ready at this point.
 *
 * @eventName ~Editor#collectUsageData
 */
export type EditorCollectUsageDataEvent = {
    name: 'collectUsageData';
    args: [
        {
            setUsageData(path: string, value: unknown): void;
        }
    ];
};
/**
 * Fired when this editor instance is destroyed. The editor at this point is not usable and this event should be used to
 * perform the clean-up in any plugin.
 *
 * See also the {@link module:core/editor/editor~Editor#state `editor.state`} property.
 *
 * @eventName ~Editor#destroy
 */
export type EditorDestroyEvent = {
    name: 'destroy';
    args: [];
};
export {};
/**
 * This error is thrown when trying to pass a `<textarea>` element to a `create()` function of an editor class.
 *
 * The only editor type which can be initialized on `<textarea>` elements is
 * the {@glink getting-started/setup/editor-types#classic-editor classic editor}.
 * This editor hides the passed element and inserts its own UI next to it. Other types of editors reuse the passed element as their root
 * editable element and therefore `<textarea>` is not appropriate for them. Use a `<div>` or another text container instead:
 *
 * ```html
 * <div id="editor">
 * 	<p>Initial content.</p>
 * </div>
 * ```
 *
 * @error editor-wrong-element
 */
/**
 * You are running [CKEditor 5 Long-term Support Edition (LTS)](https://ckeditor.com/ckeditor-5-lts/),
 * but the provided license key does not include access to the LTS version, or the key is invalid.
 *
 * Please ensure that it is copied correctly from the [Customer Portal](http://portal.ckeditor.com/),
 * and if the issue persists, please [contact our customer support](https://ckeditor.com/contact/).
 *
 * In case you intended to use the [LTS Edition](https://ckeditor.com/ckeditor-5-lts/),
 * but have not yet made a purchase, please [contact our sales team](https://ckeditor.com/contact-sales/)
 *
 * If you did not intend to use LTS, please switch to non-LTS edition, for example,
 * the [latest](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/changelog.html) build.
 *
 * @error license-key-lts-not-allowed
 */
