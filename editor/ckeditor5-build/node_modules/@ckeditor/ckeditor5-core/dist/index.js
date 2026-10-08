/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { ObservableMixin, insertToPriorityArray, CKEditorError, EmitterMixin, Config, Locale, Collection, KeystrokeHandler, env, global, uid, decodeLicenseKey, toArray, crc32, releaseDate, logError, isFeatureBlockedByLicenseKey, setDataInElement } from '@ckeditor/ckeditor5-utils/dist/index.js';
import { get, set, isFunction } from 'es-toolkit/compat';
import { Model, StylesProcessor, DataController, EditingController, Conversion } from '@ckeditor/ckeditor5-engine/dist/index.js';
import { EditorWatchdog, ContextWatchdog } from '@ckeditor/ckeditor5-watchdog/dist/index.js';

/**
 * The base class for CKEditor plugin classes.
 */ class Plugin extends /* #__PURE__ */ ObservableMixin() {
    /**
	 * The editor instance.
	 *
	 * Note that most editors implement the {@link module:core/editor/editor~Editor#ui} property.
	 * However, editors with an external UI (i.e. Bootstrap-based) or a headless editor may not have this property or
	 * throw an error when accessing it.
	 *
	 * Because of above, to make plugins more universal, it is recommended to split features into:
	 *  - The "editing" part that uses the {@link module:core/editor/editor~Editor} class without `ui` property.
	 *  - The "UI" part that uses the {@link module:core/editor/editor~Editor} class and accesses `ui` property.
	 */ editor;
    /**
	 * Holds identifiers for {@link #forceDisabled} mechanism.
	 */ _disableStack = new Set();
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super();
        this.editor = editor;
        this.set('isEnabled', true);
    }
    /**
	 * Disables the plugin.
	 *
	 * Plugin may be disabled by multiple features or algorithms (at once). When disabling a plugin, unique id should be passed
	 * (e.g. feature name). The same identifier should be used when {@link #clearForceDisabled enabling back} the plugin.
	 * The plugin becomes enabled only after all features {@link #clearForceDisabled enabled it back}.
	 *
	 * Disabling and enabling a plugin:
	 *
	 * ```ts
	 * plugin.isEnabled; // -> true
	 * plugin.forceDisabled( 'MyFeature' );
	 * plugin.isEnabled; // -> false
	 * plugin.clearForceDisabled( 'MyFeature' );
	 * plugin.isEnabled; // -> true
	 * ```
	 *
	 * Plugin disabled by multiple features:
	 *
	 * ```ts
	 * plugin.forceDisabled( 'MyFeature' );
	 * plugin.forceDisabled( 'OtherFeature' );
	 * plugin.clearForceDisabled( 'MyFeature' );
	 * plugin.isEnabled; // -> false
	 * plugin.clearForceDisabled( 'OtherFeature' );
	 * plugin.isEnabled; // -> true
	 * ```
	 *
	 * Multiple disabling with the same identifier is redundant:
	 *
	 * ```ts
	 * plugin.forceDisabled( 'MyFeature' );
	 * plugin.forceDisabled( 'MyFeature' );
	 * plugin.clearForceDisabled( 'MyFeature' );
	 * plugin.isEnabled; // -> true
	 * ```
	 *
	 * **Note:** some plugins or algorithms may have more complex logic when it comes to enabling or disabling certain plugins,
	 * so the plugin might be still disabled after {@link #clearForceDisabled} was used.
	 *
	 * @param id Unique identifier for disabling. Use the same id when {@link #clearForceDisabled enabling back} the plugin.
	 */ forceDisabled(id) {
        this._disableStack.add(id);
        if (this._disableStack.size == 1) {
            this.on('set:isEnabled', forceDisable$1, {
                priority: 'highest'
            });
            this.isEnabled = false;
        }
    }
    /**
	 * Clears forced disable previously set through {@link #forceDisabled}. See {@link #forceDisabled}.
	 *
	 * @param id Unique identifier, equal to the one passed in {@link #forceDisabled} call.
	 */ clearForceDisabled(id) {
        this._disableStack.delete(id);
        if (this._disableStack.size == 0) {
            this.off('set:isEnabled', forceDisable$1);
            this.isEnabled = true;
        }
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        this.stopListening();
    }
    /**
	 * @inheritDoc
	 */ static get isContextPlugin() {
        return false;
    }
    /**
	 * @inheritDoc
	 * @internal
	 */ static get isOfficialPlugin() {
        return false;
    }
    /**
	 * @inheritDoc
	 * @internal
	 */ static get isPremiumPlugin() {
        return false;
    }
}
/**
 * Helper function that forces plugin to be disabled.
 */ function forceDisable$1(evt) {
    evt.return = false;
    evt.stop();
}

/**
 * Base class for the CKEditor commands.
 *
 * Commands are the main way to manipulate the editor contents and state. They are mostly used by UI elements (or by other
 * commands) to make changes in the model. Commands are available in every part of the code that has access to
 * the {@link module:core/editor/editor~Editor editor} instance.
 *
 * Instances of registered commands can be retrieved from {@link module:core/editor/editor~Editor#commands `editor.commands`}.
 * The easiest way to execute a command is through {@link module:core/editor/editor~Editor#execute `editor.execute()`}.
 *
 * By default, commands are disabled when the editor is in the {@link module:core/editor/editor~Editor#isReadOnly read-only} mode
 * but commands with the {@link module:core/command~Command#affectsData `affectsData`} flag set to `false` will not be disabled.
 */ class Command extends /* #__PURE__ */ ObservableMixin() {
    /**
	 * The editor on which this command will be used.
	 */ editor;
    /**
	 * A flag indicating whether a command's `isEnabled` state should be changed depending on where the document
	 * selection is placed.
	 *
	 * By default, it is set to `true`. If the document selection is placed in a
	 * {@link module:engine/model/model~Model#canEditAt non-editable} place (such as non-editable root), the command becomes disabled.
	 *
	 * The flag should be changed to `false` in a concrete command's constructor if the command should not change its `isEnabled`
	 * accordingly to the document selection.
	 */ _isEnabledBasedOnSelection;
    /**
	 * A flag indicating whether a command execution changes the editor data or not.
	 *
	 * @see #affectsData
	 */ _affectsData;
    /**
	 * Holds identifiers for {@link #forceDisabled} mechanism.
	 */ _disableStack;
    /**
	 * `Command` class is commonly put in `config.plugins` array.
	 *
	 * This property helps with better error detection.
	 *
	 * @internal
	 */ static get _throwErrorWhenUsedAsAPlugin() {
        return true;
    }
    /**
	 * Creates a new `Command` instance.
	 *
	 * @param editor The editor on which this command will be used.
	 */ constructor(editor){
        super();
        this.editor = editor;
        this.set('value', undefined);
        this.set('isEnabled', false);
        this._affectsData = true;
        this._isEnabledBasedOnSelection = true;
        this._disableStack = new Set();
        this.decorate('execute');
        // By default, every command is refreshed when changes are applied to the model.
        this.listenTo(this.editor.model.document, 'change', ()=>{
            this.refresh();
        });
        this.listenTo(editor, 'change:isReadOnly', ()=>{
            this.refresh();
        });
        // By default, commands are disabled if the selection is in non-editable place or editor is in read-only mode.
        this.on('set:isEnabled', (evt)=>{
            if (!this.affectsData) {
                return;
            }
            const selection = editor.model.document.selection;
            const selectionInGraveyard = selection.getFirstPosition().root.rootName == '$graveyard';
            const canEditAtSelection = !selectionInGraveyard && editor.model.canEditAt(selection);
            // Disable if editor is read only, or when selection is in a place which cannot be edited.
            //
            // Checking `editor.isReadOnly` is needed for all commands that have `_isEnabledBasedOnSelection == false`.
            // E.g. undo does not base on selection, but affects data and should be disabled when the editor is in read-only mode.
            if (editor.isReadOnly || this._isEnabledBasedOnSelection && !canEditAtSelection) {
                evt.return = false;
                evt.stop();
            }
        }, {
            priority: 'highest'
        });
        this.on('execute', (evt)=>{
            if (!this.isEnabled) {
                evt.stop();
            }
        }, {
            priority: 'high'
        });
    }
    /**
	 * A flag indicating whether a command execution changes the editor data or not.
	 *
	 * Commands with `affectsData` set to `false` will not be automatically disabled in
	 * the {@link module:core/editor/editor~Editor#isReadOnly read-only mode} and
	 * {@glink features/read-only#related-features other editor modes} with restricted user write permissions.
	 *
	 * **Note:** You do not have to set it for your every command. It is `true` by default.
	 *
	 * @default true
	 */ get affectsData() {
        return this._affectsData;
    }
    set affectsData(affectsData) {
        this._affectsData = affectsData;
    }
    /**
	 * Refreshes the command. The command should update its {@link #isEnabled} and {@link #value} properties
	 * in this method.
	 *
	 * This method is automatically called when
	 * {@link module:engine/model/document~ModelDocument#event:change any changes are applied to the document}.
	 */ refresh() {
        this.isEnabled = true;
    }
    /**
	 * Disables the command.
	 *
	 * Command may be disabled by multiple features or algorithms (at once). When disabling a command, unique id should be passed
	 * (e.g. the feature name). The same identifier should be used when {@link #clearForceDisabled enabling back} the command.
	 * The command becomes enabled only after all features {@link #clearForceDisabled enabled it back}.
	 *
	 * Disabling and enabling a command:
	 *
	 * ```ts
	 * command.isEnabled; // -> true
	 * command.forceDisabled( 'MyFeature' );
	 * command.isEnabled; // -> false
	 * command.clearForceDisabled( 'MyFeature' );
	 * command.isEnabled; // -> true
	 * ```
	 *
	 * Command disabled by multiple features:
	 *
	 * ```ts
	 * command.forceDisabled( 'MyFeature' );
	 * command.forceDisabled( 'OtherFeature' );
	 * command.clearForceDisabled( 'MyFeature' );
	 * command.isEnabled; // -> false
	 * command.clearForceDisabled( 'OtherFeature' );
	 * command.isEnabled; // -> true
	 * ```
	 *
	 * Multiple disabling with the same identifier is redundant:
	 *
	 * ```ts
	 * command.forceDisabled( 'MyFeature' );
	 * command.forceDisabled( 'MyFeature' );
	 * command.clearForceDisabled( 'MyFeature' );
	 * command.isEnabled; // -> true
	 * ```
	 *
	 * **Note:** some commands or algorithms may have more complex logic when it comes to enabling or disabling certain commands,
	 * so the command might be still disabled after {@link #clearForceDisabled} was used.
	 *
	 * @param id Unique identifier for disabling. Use the same id when {@link #clearForceDisabled enabling back} the command.
	 */ forceDisabled(id) {
        this._disableStack.add(id);
        if (this._disableStack.size == 1) {
            this.on('set:isEnabled', forceDisable, {
                priority: 'highest'
            });
            this.isEnabled = false;
        }
    }
    /**
	 * Clears forced disable previously set through {@link #forceDisabled}. See {@link #forceDisabled}.
	 *
	 * @param id Unique identifier, equal to the one passed in {@link #forceDisabled} call.
	 */ clearForceDisabled(id) {
        this._disableStack.delete(id);
        if (this._disableStack.size == 0) {
            this.off('set:isEnabled', forceDisable);
            this.refresh();
        }
    }
    /**
	 * Executes the command.
	 *
	 * A command may accept parameters. They will be passed from {@link module:core/editor/editor~Editor#execute `editor.execute()`}
	 * to the command.
	 *
	 * The `execute()` method will automatically abort when the command is disabled ({@link #isEnabled} is `false`).
	 * This behavior is implemented by a high priority listener to the {@link #event:execute} event.
	 *
	 * In order to see how to disable a command from "outside" see the {@link #isEnabled} documentation.
	 *
	 * This method may return a value, which would be forwarded all the way down to the
	 * {@link module:core/editor/editor~Editor#execute `editor.execute()`}.
	 *
	 * @fires execute
	 */ execute(...args) {
        return undefined;
    }
    /**
	 * Destroys the command.
	 */ destroy() {
        this.stopListening();
    }
}
/**
 * Helper function that forces command to be disabled.
 */ function forceDisable(evt) {
    evt.return = false;
    evt.stop();
}

/**
 * A CKEditor command that aggregates other commands.
 *
 * This command is used to proxy multiple commands. The multi-command is enabled when
 * at least one of its registered child commands is enabled.
 * When executing a multi-command, the first enabled command with highest priority will be executed.
 *
 * ```ts
 * const multiCommand = new MultiCommand( editor );
 *
 * const commandFoo = new Command( editor );
 * const commandBar = new Command( editor );
 *
 * // Register a child command.
 * multiCommand.registerChildCommand( commandFoo );
 * // Register a child command with a low priority.
 * multiCommand.registerChildCommand( commandBar, { priority: 'low' } );
 *
 * // Enable one of the commands.
 * commandBar.isEnabled = true;
 *
 * multiCommand.execute(); // Will execute commandBar.
 * ```
 */ class MultiCommand extends Command {
    /**
	 * Registered child commands definitions.
	 */ _childCommandsDefinitions = [];
    /**
	 * @inheritDoc
	 */ refresh() {
    // Override base command refresh(): the command's state is changed when one of child commands changes states.
    }
    /**
	 * Executes the first enabled command which has the highest priority of all registered child commands.
	 *
	 * @returns The value returned by the {@link module:core/command~Command#execute `command.execute()`}.
	 */ execute(...args) {
        const command = this._getFirstEnabledCommand();
        return !!command && command.execute(args);
    }
    /**
	 * Registers a child command.
	 *
	 * @param options An object with configuration options.
	 * @param options.priority Priority of a command to register.
	 */ registerChildCommand(command, options = {}) {
        insertToPriorityArray(this._childCommandsDefinitions, {
            command,
            priority: options.priority || 'normal'
        });
        // Change multi-command enabled state when one of registered commands changes state.
        command.on('change:isEnabled', ()=>this._checkEnabled());
        this._checkEnabled();
    }
    /**
	 * Checks if any of child commands is enabled.
	 */ _checkEnabled() {
        this.isEnabled = !!this._getFirstEnabledCommand();
    }
    /**
	 * Returns a first enabled command with the highest priority or `undefined` if none of them is enabled.
	 */ _getFirstEnabledCommand() {
        const commandDefinition = this._childCommandsDefinitions.find(({ command })=>command.isEnabled);
        return commandDefinition && commandDefinition.command;
    }
}

/**
 * Collection of commands. Its instance is available in {@link module:core/editor/editor~Editor#commands `editor.commands`}.
 */ class CommandCollection {
    /**
	 * Command map.
	 */ _commands;
    /**
	 * Creates collection instance.
	 */ constructor(){
        this._commands = new Map();
    }
    /**
	 * Registers a new command.
	 *
	 * @param commandName The name of the command.
	 */ add(commandName, command) {
        this._commands.set(commandName, command);
    }
    /**
	 * Retrieves a command from the collection.
	 *
	 * @param commandName The name of the command.
	 */ get(commandName) {
        return this._commands.get(commandName);
    }
    /**
	 * Executes a command.
	 *
	 * @param commandName The name of the command.
	 * @param commandParams Command parameters.
	 * @returns The value returned by the {@link module:core/command~Command#execute `command.execute()`}.
	 */ execute(commandName, ...commandParams) {
        const command = this.get(commandName);
        if (!command) {
            /**
			 * Command does not exist.
			 *
			 * @error commandcollection-command-not-found
			 * @param {string} commandName Name of the command.
			 */ throw new CKEditorError('commandcollection-command-not-found', this, {
                commandName
            });
        }
        return command.execute(...commandParams);
    }
    /**
	 * Returns iterator of command names.
	 */ *names() {
        yield* this._commands.keys();
    }
    /**
	 * Returns iterator of command instances.
	 */ *commands() {
        yield* this._commands.values();
    }
    /**
	 * Iterable interface.
	 *
	 * Returns `[ commandName, commandInstance ]` pairs.
	 */ [Symbol.iterator]() {
        return this._commands[Symbol.iterator]();
    }
    /**
	 * Destroys all collection commands.
	 */ destroy() {
        for (const command of this.commands()){
            command.destroy();
        }
    }
}

/**
 * Manages a list of CKEditor plugins, including loading, resolving dependencies and initialization.
 */ class PluginCollection extends /* #__PURE__ */ EmitterMixin() {
    _context;
    _plugins = new Map();
    /**
	 * A map of plugin constructors that can be retrieved by their names.
	 */ _availablePlugins;
    /**
	 * Map of {@link module:core/contextplugin~ContextPlugin context plugins} which can be retrieved by their constructors or instances.
	 */ _contextPlugins;
    /**
	 * Creates an instance of the plugin collection class.
	 * Allows loading and initializing plugins and their dependencies.
	 * Allows providing a list of already loaded plugins. These plugins will not be destroyed along with this collection.
	 *
	 * @param availablePlugins Plugins (constructors) which the collection will be able to use
	 * when {@link module:core/plugincollection~PluginCollection#init} is used with the plugin names (strings, instead of constructors).
	 * Usually, the editor will pass its built-in plugins to the collection so they can later be
	 * used in `config.plugins` or `config.removePlugins` by names.
	 * @param contextPlugins A list of already initialized plugins represented by a `[ PluginConstructor, pluginInstance ]` pair.
	 */ constructor(context, availablePlugins = [], contextPlugins = []){
        super();
        this._context = context;
        this._availablePlugins = new Map();
        for (const PluginConstructor of availablePlugins){
            if (PluginConstructor.pluginName) {
                this._availablePlugins.set(PluginConstructor.pluginName, PluginConstructor);
            }
        }
        this._contextPlugins = new Map();
        for (const [PluginConstructor, pluginInstance] of contextPlugins){
            this._contextPlugins.set(PluginConstructor, pluginInstance);
            this._contextPlugins.set(pluginInstance, PluginConstructor);
            // To make it possible to require a plugin by its name.
            if (PluginConstructor.pluginName) {
                this._availablePlugins.set(PluginConstructor.pluginName, PluginConstructor);
            }
        }
    }
    /**
	 * Iterable interface.
	 *
	 * Returns `[ PluginConstructor, pluginInstance ]` pairs.
	 */ *[Symbol.iterator]() {
        for (const entry of this._plugins){
            if (typeof entry[0] == 'function') {
                yield entry;
            }
        }
    }
    /**
	 * Gets the plugin instance by its constructor or name.
	 *
	 * ```ts
	 * // Check if 'Clipboard' plugin was loaded.
	 * if ( editor.plugins.has( 'ClipboardPipeline' ) ) {
	 * 	// Get clipboard plugin instance
	 * 	const clipboard = editor.plugins.get( 'ClipboardPipeline' );
	 *
	 * 	this.listenTo( clipboard, 'inputTransformation', ( evt, data ) => {
	 * 		// Do something on clipboard input.
	 * 	} );
	 * }
	 * ```
	 *
	 * **Note**: This method will throw an error if a plugin is not loaded. Use `{@link #has editor.plugins.has()}`
	 * to check if a plugin is available.
	 *
	 * @param key The plugin constructor or {@link module:core/plugin~PluginStaticMembers#pluginName name}.
	 */ get(key) {
        const plugin = this._plugins.get(key);
        if (!plugin) {
            let pluginName = key;
            if (typeof key == 'function') {
                pluginName = key.pluginName || key.name;
            }
            /**
			 * The plugin is not loaded and could not be obtained.
			 *
			 * Plugin classes (constructors) need to be provided to the editor and must be loaded before they can be obtained from
			 * the plugin collection.
			 *
			 * **Note**: You can use `{@link module:core/plugincollection~PluginCollection#has editor.plugins.has()}`
			 * to check if a plugin was loaded.
			 *
			 * @error plugincollection-plugin-not-loaded
			 * @param {string} plugin The name of the plugin which is not loaded.
			 */ throw new CKEditorError('plugincollection-plugin-not-loaded', this._context, {
                plugin: pluginName
            });
        }
        return plugin;
    }
    /**
	 * Checks if a plugin is loaded.
	 *
	 * ```ts
	 * // Check if the 'Clipboard' plugin was loaded.
	 * if ( editor.plugins.has( 'ClipboardPipeline' ) ) {
	 * 	// Now use the clipboard plugin instance:
	 * 	const clipboard = editor.plugins.get( 'ClipboardPipeline' );
	 *
	 * 	// ...
	 * }
	 * ```
	 *
	 * @param key The plugin constructor or {@link module:core/plugin~PluginStaticMembers#pluginName name}.
	 */ has(key) {
        return this._plugins.has(key);
    }
    /**
	 * Initializes a set of plugins and adds them to the collection.
	 *
	 * @param plugins An array of {@link module:core/plugin~PluginInterface plugin constructors}
	 * or {@link module:core/plugin~PluginStaticMembers#pluginName plugin names}.
	 * @param pluginsToRemove Names of the plugins or plugin constructors
	 * that should not be loaded (despite being specified in the `plugins` array).
	 * @param pluginsSubstitutions An array of {@link module:core/plugin~PluginInterface plugin constructors}
	 * that will be used to replace plugins of the same names that were passed in `plugins` or that are in their dependency tree.
	 * A useful option for replacing built-in plugins while creating tests (for mocking their APIs). Plugins that will be replaced
	 * must follow these rules:
	 *   * The new plugin must be a class.
	 *   * The new plugin must be named.
	 *   * Both plugins must not depend on other plugins.
	 * @returns A promise which gets resolved once all plugins are loaded and available in the collection.
	 */ async init(plugins, pluginsToRemove = [], pluginsSubstitutions = []) {
        // Plugin initialization procedure consists of 2 main steps:
        // 1) collecting all available plugin constructors,
        // 2) verification whether all required plugins can be instantiated.
        //
        // In the first step, all plugin constructors, available in the provided `plugins` array and inside
        // plugin's dependencies (from the `Plugin.requires` array), are recursively collected and added to the existing
        // `this._availablePlugins` map, but without any verification at the given moment. Performing the verification
        // at this point (during the plugin constructor searching) would cause false errors to occur, that some plugin
        // is missing but in fact it may be defined further in the array as the dependency of other plugin. After
        // traversing the entire dependency tree, it will be checked if all required "top level" plugins are available.
        //
        // In the second step, the list of plugins that have not been explicitly removed is traversed to get all the
        // plugin constructors to be instantiated in the correct order and to validate against some rules. Finally, if
        // no plugin is missing and no other error has been found, they all will be instantiated.
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        const context = this._context;
        findAvailablePluginConstructors(plugins);
        validatePlugins(plugins);
        const pluginsToLoad = plugins.filter((plugin)=>!isPluginRemoved(plugin, pluginsToRemove));
        const pluginConstructors = [
            ...getPluginConstructors(pluginsToLoad)
        ];
        substitutePlugins(pluginConstructors, pluginsSubstitutions);
        const pluginInstances = loadPlugins(pluginConstructors);
        await initPlugins(pluginInstances, 'init');
        await initPlugins(pluginInstances, 'afterInit');
        return pluginInstances;
        function isPluginConstructor(plugin) {
            return typeof plugin === 'function';
        }
        function isContextPlugin(plugin) {
            return isPluginConstructor(plugin) && !!plugin.isContextPlugin;
        }
        function isPluginRemoved(plugin, pluginsToRemove) {
            return pluginsToRemove.some((removedPlugin)=>{
                if (removedPlugin === plugin) {
                    return true;
                }
                if (getPluginName(plugin) === removedPlugin) {
                    return true;
                }
                if (getPluginName(removedPlugin) === plugin) {
                    return true;
                }
                return false;
            });
        }
        function getPluginName(plugin) {
            return isPluginConstructor(plugin) ? plugin.pluginName || plugin.name : plugin;
        }
        function findAvailablePluginConstructors(plugins, processed = new Set()) {
            plugins.forEach((plugin)=>{
                if (!isPluginConstructor(plugin)) {
                    return;
                }
                if (processed.has(plugin)) {
                    return;
                }
                processed.add(plugin);
                if (plugin.pluginName && !that._availablePlugins.has(plugin.pluginName)) {
                    that._availablePlugins.set(plugin.pluginName, plugin);
                }
                if (plugin.requires) {
                    findAvailablePluginConstructors(plugin.requires, processed);
                }
            });
        }
        function getPluginConstructors(plugins, processed = new Set()) {
            return plugins.map((plugin)=>{
                return isPluginConstructor(plugin) ? plugin : that._availablePlugins.get(plugin);
            }).reduce((result, plugin)=>{
                if (processed.has(plugin)) {
                    return result;
                }
                processed.add(plugin);
                if (plugin.requires) {
                    validatePlugins(plugin.requires, plugin);
                    getPluginConstructors(plugin.requires, processed).forEach((plugin)=>result.add(plugin));
                }
                return result.add(plugin);
            }, new Set());
        }
        function validatePlugins(plugins, parentPluginConstructor = null) {
            plugins.map((plugin)=>{
                return isPluginConstructor(plugin) ? plugin : that._availablePlugins.get(plugin) || plugin;
            }).forEach((plugin)=>{
                checkPluginConstructor(plugin);
                checkMissingPlugin(plugin, parentPluginConstructor);
                checkContextPlugin(plugin, parentPluginConstructor);
                checkRemovedPlugin(plugin, parentPluginConstructor);
            });
        }
        function checkPluginConstructor(plugin) {
            if (typeof plugin !== 'function') {
                return;
            }
            if (plugin._throwErrorWhenUsedAsAPlugin) {
                /**
				 * The provided class constructor is not a plugin.
				 *
				 * This error is usually caused by passing an editor, context, or command
				 * constructor in the `config.plugins` array.
				 *
				 * @param {String} name The name of the provided constructor.
				 * @error plugincollection-plugin-invalid-constructor
				 */ throw new CKEditorError('plugincollection-plugin-invalid-constructor', context, {
                    name: plugin.name
                });
            }
        }
        function checkMissingPlugin(plugin, parentPluginConstructor) {
            if (isPluginConstructor(plugin)) {
                return;
            }
            if (parentPluginConstructor) {
                /**
				 * A required "soft" dependency was not found on the plugin list.
				 *
				 * When configuring the editor, either prior to building (via
				 * {@link module:core/editor/editor~Editor.builtinPlugins `Editor.builtinPlugins`}) or when
				 * creating a new instance of the editor (e.g. via
				 * {@link module:core/editor/editorconfig~EditorConfig#plugins `config.plugins`}), you need to provide
				 * some of the dependencies for other plugins that you used.
				 *
				 * This error is thrown when one of these dependencies was not provided. The name of the missing plugin
				 * can be found in `missingPlugin` and the plugin that required it in `requiredBy`.
				 *
				 * In order to resolve it, you need to import the missing plugin and add it to the
				 * current list of plugins (`Editor.builtinPlugins` or `config.plugins`/`config.extraPlugins`).
				 *
				 * Soft requirements were introduced in version 26.0.0. If you happen to stumble upon this error
				 * when upgrading to version 26.0.0, read also the
				 * {@glink updating/guides/update-to-26 Migration to 26.0.0} guide.
				 *
				 * @error plugincollection-soft-required
				 * @param {string} missingPlugin The name of the required plugin.
				 * @param {string} requiredBy The name of the plugin that requires the other plugin.
				 */ throw new CKEditorError('plugincollection-soft-required', context, {
                    missingPlugin: plugin,
                    requiredBy: getPluginName(parentPluginConstructor)
                });
            }
            /**
			 * A plugin is not available and could not be loaded.
			 *
			 * Plugin classes (constructors) need to be provided to the editor before they can be loaded by name.
			 * This is usually done in the now deprecated CKEditor 5 builds by setting
			 * the {@link module:core/editor/editor~Editor.builtinPlugins} property.
			 *
			 * **If you see this warning when using one of the deprecated CKEditor 5 Builds**,
			 * it means that you tried to enable a plugin that was not included in that build. This may be due to a typo
			 * in the plugin name or simply because that plugin was not a part of this build.
			 *
			 * **Predefined builds are no longer supported and you need to
			 * {@glink updating/nim-migration/migration-to-new-installation-methods migrate to new installation methods}**.
			 *
			 * **If you see this warning when using one of the editor creators directly** (not a build), then it means
			 * that you tried loading plugins by name. However, unlike CKEditor 4, CKEditor 5 does not implement a "plugin loader".
			 * This means that CKEditor 5 does not know where to load the plugin modules from. Therefore, you need to
			 * provide each plugin through a reference (as a constructor function). Check out the examples in the
			 * {@glink getting-started/installation/cloud/quick-start Quick start} guide.
			 *
			 * @error plugincollection-plugin-not-found
			 * @param {string} plugin The name of the plugin which could not be loaded.
			 */ throw new CKEditorError('plugincollection-plugin-not-found', context, {
                plugin
            });
        }
        function checkContextPlugin(plugin, parentPluginConstructor) {
            if (!isContextPlugin(parentPluginConstructor)) {
                return;
            }
            if (isContextPlugin(plugin)) {
                return;
            }
            /**
			 * If a plugin is a context plugin, all plugins it requires should also be context plugins
			 * instead of plugins. In other words, if one plugin can be used in the context,
			 * all its requirements should also be ready to be used in the context. Note that the context
			 * provides only a part of the API provided by the editor. If one plugin needs a full
			 * editor API, all plugins which require it are considered as plugins that need a full
			 * editor API.
			 *
			 * @error plugincollection-context-required
			 * @param {string} plugin The name of the required plugin.
			 * @param {string} requiredBy The name of the parent plugin.
			 */ throw new CKEditorError('plugincollection-context-required', context, {
                plugin: getPluginName(plugin),
                requiredBy: getPluginName(parentPluginConstructor)
            });
        }
        function checkRemovedPlugin(plugin, parentPluginConstructor) {
            if (!parentPluginConstructor) {
                return;
            }
            if (!isPluginRemoved(plugin, pluginsToRemove)) {
                return;
            }
            /**
			 * Cannot load a plugin because one of its dependencies is listed in the `removePlugins` option.
			 *
			 * @error plugincollection-required
			 * @param {string} plugin The name of the required plugin.
			 * @param {string} requiredBy The name of the parent plugin.
			 */ throw new CKEditorError('plugincollection-required', context, {
                plugin: getPluginName(plugin),
                requiredBy: getPluginName(parentPluginConstructor)
            });
        }
        function loadPlugins(pluginConstructors) {
            return pluginConstructors.map((PluginConstructor)=>{
                let pluginInstance = that._contextPlugins.get(PluginConstructor);
                pluginInstance = pluginInstance || new PluginConstructor(context);
                that._add(PluginConstructor, pluginInstance);
                return pluginInstance;
            });
        }
        function initPlugins(pluginInstances, method) {
            return pluginInstances.reduce((promise, plugin)=>{
                if (!plugin[method]) {
                    return promise;
                }
                if (that._contextPlugins.has(plugin)) {
                    return promise;
                }
                return promise.then(plugin[method].bind(plugin));
            }, Promise.resolve());
        }
        /**
		 * Replaces plugin constructors with the specified set of plugins.
		 */ function substitutePlugins(pluginConstructors, pluginsSubstitutions) {
            for (const pluginItem of pluginsSubstitutions){
                if (typeof pluginItem != 'function') {
                    /**
					 * The plugin replacing an existing plugin must be a function.
					 *
					 * @error plugincollection-replace-plugin-invalid-type
					 * @param {never} pluginItem The plugin item.
					 */ throw new CKEditorError('plugincollection-replace-plugin-invalid-type', null, {
                        pluginItem
                    });
                }
                const pluginName = pluginItem.pluginName;
                if (!pluginName) {
                    /**
					 * The plugin replacing an existing plugin must have a name.
					 *
					 * @error plugincollection-replace-plugin-missing-name
					 * @param {module:core/plugin~PluginConstructor} pluginItem The plugin item.
					 */ throw new CKEditorError('plugincollection-replace-plugin-missing-name', null, {
                        pluginItem
                    });
                }
                if (pluginItem.requires && pluginItem.requires.length) {
                    /**
					 * The plugin replacing an existing plugin cannot depend on other plugins.
					 *
					 * @error plugincollection-plugin-for-replacing-cannot-have-dependencies
					 * @param {string} pluginName The name of the plugin.
					 */ throw new CKEditorError('plugincollection-plugin-for-replacing-cannot-have-dependencies', null, {
                        pluginName
                    });
                }
                const pluginToReplace = that._availablePlugins.get(pluginName);
                if (!pluginToReplace) {
                    /**
					 * The replaced plugin does not exist in the
					 * {@link module:core/plugincollection~PluginCollection available plugins} collection.
					 *
					 * @error plugincollection-plugin-for-replacing-not-exist
					 * @param {string} pluginName The name of the plugin.
					 */ throw new CKEditorError('plugincollection-plugin-for-replacing-not-exist', null, {
                        pluginName
                    });
                }
                const indexInPluginConstructors = pluginConstructors.indexOf(pluginToReplace);
                if (indexInPluginConstructors === -1) {
                    // The Context feature can substitute plugins as well.
                    // It may happen that the editor will be created with the given context, where the plugin for substitute
                    // was already replaced. In such a case, we don't want to do it again.
                    if (that._contextPlugins.has(pluginToReplace)) {
                        return;
                    }
                    /**
					 * The replaced plugin will not be loaded so it cannot be replaced.
					 *
					 * @error plugincollection-plugin-for-replacing-not-loaded
					 * @param {string} pluginName The name of the plugin.
					 */ throw new CKEditorError('plugincollection-plugin-for-replacing-not-loaded', null, {
                        pluginName
                    });
                }
                if (pluginToReplace.requires && pluginToReplace.requires.length) {
                    /**
					 * The replaced plugin cannot depend on other plugins.
					 *
					 * @error plugincollection-replaced-plugin-cannot-have-dependencies
					 * @param {string} pluginName The name of the plugin.
					 */ throw new CKEditorError('plugincollection-replaced-plugin-cannot-have-dependencies', null, {
                        pluginName
                    });
                }
                pluginConstructors.splice(indexInPluginConstructors, 1, pluginItem);
                that._availablePlugins.set(pluginName, pluginItem);
            }
        }
    }
    /**
	 * Destroys all loaded plugins.
	 */ destroy() {
        const promises = [];
        for (const [, pluginInstance] of this){
            if (typeof pluginInstance.destroy == 'function' && !this._contextPlugins.has(pluginInstance)) {
                promises.push(pluginInstance.destroy());
            }
        }
        return Promise.all(promises);
    }
    /**
	 * Adds the plugin to the collection. Exposed mainly for testing purposes.
	 *
	 * @param PluginConstructor The plugin constructor.
	 * @param plugin The instance of the plugin.
	 */ _add(PluginConstructor, plugin) {
        this._plugins.set(PluginConstructor, plugin);
        const pluginName = PluginConstructor.pluginName;
        if (!pluginName) {
            return;
        }
        if (this._plugins.has(pluginName)) {
            /**
			 * Two plugins with the same {@link module:core/plugin~PluginStaticMembers#pluginName} were loaded.
			 * This will lead to runtime conflicts between these plugins.
			 *
			 * In practice, this warning usually means that new plugins were added to an existing CKEditor 5 build.
			 * Plugins should always be added to a source version of the editor (`@ckeditor/ckeditor5-editor-*`),
			 * not to an editor imported from one of the `@ckeditor/ckeditor5-build-*` packages.
			 *
			 * Check your import paths and the list of plugins passed to
			 * {@link module:core/editor/editor~Editor.create `Editor.create()`}
			 * or specified in {@link module:core/editor/editor~Editor.builtinPlugins `Editor.builtinPlugins`}.
			 *
			 * Predefined builds are a deprecated solution and we strongly advise
			 * {@glink updating/nim-migration/migration-to-new-installation-methods migrating to new installation methods}.
			 *
			 * The second option is that your `node_modules/` directory contains duplicated versions of the same
			 * CKEditor 5 packages. Normally, on clean installations, npm deduplicates packages in `node_modules/`, so
			 * it may be enough to call `rm -rf node_modules && npm i`. However, if you installed conflicting versions
			 * of some packages, their dependencies may need to be installed in more than one version which may lead to this
			 * warning.
			 *
			 * Technically speaking, this error occurs because after adding a plugin to an existing editor build
			 * the dependencies of this plugin are being duplicated.
			 * They are already built into that editor build and now get added for the second time as dependencies
			 * of the plugin you are installing.
			 *
			 * @error plugincollection-plugin-name-conflict
			 * @param {string} pluginName The duplicated plugin name.
			 * @param {module:core/plugin~PluginConstructor} plugin1 The first plugin constructor.
			 * @param {module:core/plugin~PluginConstructor} plugin2 The second plugin constructor.
			 */ throw new CKEditorError('plugincollection-plugin-name-conflict', null, {
                pluginName,
                plugin1: this._plugins.get(pluginName).constructor,
                plugin2: PluginConstructor
            });
        }
        this._plugins.set(pluginName, plugin);
    }
}

/**
 * Provides a common, higher-level environment for solutions that use multiple {@link module:core/editor/editor~Editor editors}
 * or plugins that work outside the editor. Use it instead of {@link module:core/editor/editor~Editor.create `Editor.create()`}
 * in advanced application integrations.
 *
 * All configuration options passed to a context will be used as default options for the editor instances initialized in that context.
 *
 * {@link module:core/contextplugin~ContextPlugin Context plugins} passed to a context instance will be shared among all
 * editor instances initialized in this context. These will be the same plugin instances for all the editors.
 *
 * **Note:** The context can only be initialized with {@link module:core/contextplugin~ContextPlugin context plugins}
 * (e.g. [comments](https://ckeditor.com/collaboration/comments/)). Regular {@link module:core/plugin~Plugin plugins} require an
 * editor instance to work and cannot be added to a context.
 *
 * **Note:** You can add a context plugin to an editor instance, though.
 *
 * If you are using multiple editor instances on one page and use any context plugins, create a context to share the configuration and
 * plugins among these editors. Some plugins will use the information about all existing editors to better integrate between them.
 *
 * If you are using plugins that do not require an editor to work (e.g. [comments](https://ckeditor.com/collaboration/comments/)),
 * enable and configure them using the context.
 *
 * If you are using only a single editor on each page, use {@link module:core/editor/editor~Editor.create `Editor.create()`} instead.
 * In such a case, a context instance will be created by the editor instance in a transparent way.
 *
 * See {@link ~Context.create `Context.create()`} for usage examples.
 */ class Context {
    /**
	 * Stores all the configurations specific to this context instance.
	 */ config;
    /**
	 * The plugins loaded and in use by this context instance.
	 */ plugins;
    locale;
    /**
	 * Shorthand for {@link module:utils/locale~Locale#t}.
	 */ t;
    /**
	 * A list of editors that this context instance is injected to.
	 */ editors;
    /**
	 * The default configuration which is built into the `Context` class.
	 *
	 * It was used in the now deprecated CKEditor 5 builds featuring `Context` to provide the default configuration options
	 * which are later used during the context initialization.
	 *
	 * ```ts
	 * Context.defaultConfig = {
	 * 	foo: 1,
	 * 	bar: 2
	 * };
	 *
	 * Context
	 * 	.create()
	 * 	.then( context => {
	 * 		context.config.get( 'foo' ); // -> 1
	 * 		context.config.get( 'bar' ); // -> 2
	 * 	} );
	 *
	 * // The default options can be overridden by the configuration passed to create().
	 * Context
	 * 	.create( { bar: 3 } )
	 * 	.then( context => {
	 * 		context.config.get( 'foo' ); // -> 1
	 * 		context.config.get( 'bar' ); // -> 3
	 * 	} );
	 * ```
	 *
	 * See also {@link module:core/context~Context.builtinPlugins `Context.builtinPlugins`}
	 * and {@link module:core/editor/editor~Editor.defaultConfig `Editor.defaultConfig`}.
	 */ static defaultConfig;
    /**
	 * An array of plugins built into the `Context` class.
	 *
	 * It was used in the now deprecated CKEditor 5 builds featuring `Context` to provide the default configuration options
	 * which are later used during the context initialization.
	 *
	 * They will be automatically initialized by `Context` unless `config.plugins` is passed.
	 *
	 * ```ts
	 * // Build some context plugins into the Context class first.
	 * Context.builtinPlugins = [ FooPlugin, BarPlugin ];
	 *
	 * // Normally, you need to define config.plugins, but since Context.builtinPlugins was
	 * // defined, now you can call create() without any configuration.
	 * Context
	 * 	.create()
	 * 	.then( context => {
	 * 		context.plugins.get( FooPlugin ); // -> An instance of the Foo plugin.
	 * 		context.plugins.get( BarPlugin ); // -> An instance of the Bar plugin.
	 * 	} );
	 * ```
	 *
	 * See also {@link module:core/context~Context.defaultConfig `Context.defaultConfig`}
	 * and {@link module:core/editor/editor~Editor.builtinPlugins `Editor.builtinPlugins`}.
	 */ static builtinPlugins;
    /**
	 * Reference to the editor which created the context.
	 * Null when the context was created outside of the editor.
	 *
	 * It is used to destroy the context when removing the editor that has created the context.
	 */ _contextOwner = null;
    /**
	 * Creates a context instance with a given configuration.
	 *
	 * Usually not to be used directly. See the static {@link module:core/context~Context.create `create()`} method.
	 *
	 * @param config The context configuration.
	 */ constructor(config){
        // We don't pass translations to the config, because its behavior of splitting keys
        // with dots (e.g. `resize.width` => `resize: { width }`) breaks the translations.
        const { translations, ...rest } = config || {};
        this.config = new Config(rest, this.constructor.defaultConfig);
        const availablePlugins = this.constructor.builtinPlugins;
        this.config.define('plugins', availablePlugins);
        this.plugins = new PluginCollection(this, availablePlugins);
        const languageConfig = this.config.get('language') || {};
        this.locale = new Locale({
            uiLanguage: typeof languageConfig === 'string' ? languageConfig : languageConfig.ui,
            contentLanguage: this.config.get('language.content'),
            translations
        });
        this.t = this.locale.t;
        this.editors = new Collection();
    }
    /**
	 * Loads and initializes plugins specified in the configuration.
	 *
	 * @returns A promise which resolves once the initialization is completed, providing an array of loaded plugins.
	 */ initPlugins() {
        const plugins = this.config.get('plugins') || [];
        const substitutePlugins = this.config.get('substitutePlugins') || [];
        // Plugins for substitution should be checked as well.
        for (const Plugin of plugins.concat(substitutePlugins)){
            if (typeof Plugin != 'function') {
                /**
				 * Only a constructor function is allowed as a {@link module:core/contextplugin~ContextPlugin context plugin}.
				 *
				 * @error context-initplugins-constructor-only
				 */ throw new CKEditorError('context-initplugins-constructor-only', null, {
                    Plugin
                });
            }
            if (Plugin.isContextPlugin !== true) {
                /**
				 * Only a plugin marked as a {@link module:core/contextplugin~ContextPlugin.isContextPlugin context plugin}
				 * is allowed to be used with a context.
				 *
				 * @error context-initplugins-invalid-plugin
				 */ throw new CKEditorError('context-initplugins-invalid-plugin', null, {
                    Plugin
                });
            }
        }
        return this.plugins.init(plugins, [], substitutePlugins);
    }
    /**
	 * Destroys the context instance and all editors used with the context,
	 * releasing all resources used by the context.
	 *
	 * @returns A promise that resolves once the context instance is fully destroyed.
	 */ destroy() {
        return Promise.all(Array.from(this.editors, (editor)=>editor.destroy())).then(()=>this.plugins.destroy());
    }
    /**
	 * Adds a reference to the editor which is used with this context.
	 *
	 * When the given editor has created the context, the reference to this editor will be stored
	 * as a {@link ~Context#_contextOwner}.
	 *
	 * This method should only be used by the editor.
	 *
	 * @internal
	 * @param isContextOwner Stores the given editor as a context owner.
	 */ _addEditor(editor, isContextOwner) {
        if (this._contextOwner) {
            /**
			 * Cannot add multiple editors to the context which is created by the editor.
			 *
			 * @error context-addeditor-private-context
			 */ throw new CKEditorError('context-addeditor-private-context');
        }
        this.editors.add(editor);
        if (isContextOwner) {
            this._contextOwner = editor;
        }
    }
    /**
	 * Removes a reference to the editor which was used with this context.
	 * When the context was created by the given editor, the context will be destroyed.
	 *
	 * This method should only be used by the editor.
	 *
	 * @internal
	 * @return A promise that resolves once the editor is removed from the context or when the context was destroyed.
	 */ _removeEditor(editor) {
        if (this.editors.has(editor)) {
            this.editors.remove(editor);
        }
        if (this._contextOwner === editor) {
            return this.destroy();
        }
        return Promise.resolve();
    }
    /**
	 * Returns the context configuration which will be copied to the editors created using this context.
	 *
	 * The configuration returned by this method has the plugins configuration removed &ndash; plugins are shared with all editors
	 * through another mechanism.
	 *
	 * This method should only be used by the editor.
	 *
	 * @internal
	 * @returns Configuration as a plain object.
	 */ _getEditorConfig() {
        const result = {};
        for (const name of this.config.names()){
            if (![
                'plugins',
                'removePlugins',
                'extraPlugins'
            ].includes(name)) {
                result[name] = this.config.get(name);
            }
        }
        return result;
    }
    /**
	 * Creates and initializes a new context instance.
	 *
	 * ```ts
	 * const commonConfig = { ... }; // Configuration for all the plugins and editors.
	 * const editorPlugins = [ ... ]; // Regular plugins here.
	 *
	 * Context
	 * 	.create( {
	 * 		// Only context plugins here.
	 * 		plugins: [ ... ],
	 *
	 * 		// Configure the language for all the editors (it cannot be overwritten).
	 * 		language: { ... },
	 *
	 * 		// Configuration for context plugins.
	 * 		comments: { ... },
	 * 		...
	 *
	 * 		// Default configuration for editor plugins.
	 * 		toolbar: { ... },
	 * 		image: { ... },
	 * 		...
	 * 	} )
	 * 	.then( context => {
	 * 		const promises = [];
	 *
	 * 		promises.push( ClassicEditor.create(
	 * 			document.getElementById( 'editor1' ),
	 * 			{
	 * 				editorPlugins,
	 * 				context
	 * 			}
	 * 		) );
	 *
	 * 		promises.push( ClassicEditor.create(
	 * 			document.getElementById( 'editor2' ),
	 * 			{
	 * 				editorPlugins,
	 * 				context,
	 * 				toolbar: { ... } // You can overwrite the configuration of the context.
	 * 			}
	 * 		) );
	 *
	 * 		return Promise.all( promises );
	 * 	} );
	 * ```
	 *
	 * @param config The context configuration.
	 * @returns A promise resolved once the context is ready. The promise resolves with the created context instance.
	 */ static create(config) {
        return new Promise((resolve)=>{
            const context = new this(config);
            resolve(context.initPlugins().then(()=>context));
        });
    }
    /**
	 * `Context` class is commonly put in `config.plugins` array.
	 *
	 * This property helps with better error detection.
	 *
	 * @internal
	 */ static get _throwErrorWhenUsedAsAPlugin() {
        return true;
    }
}

/**
 * The base class for {@link module:core/context~Context} plugin classes.
 *
 * A context plugin can either be initialized for an {@link module:core/editor/editor~Editor editor} or for
 * a {@link module:core/context~Context context}. In other words, it can either
 * work within one editor instance or with one or more editor instances that use a single context.
 * It is the context plugin's role to implement handling for both modes.
 *
 * There are a few rules for interaction between the editor plugins and context plugins:
 *
 * * A context plugin can require another context plugin.
 * * An {@link module:core/plugin~Plugin editor plugin} can require a context plugin.
 * * A context plugin MUST NOT require an {@link module:core/plugin~Plugin editor plugin}.
 */ class ContextPlugin extends /* #__PURE__ */ ObservableMixin() {
    /**
	 * The context or editor instance.
	 */ context;
    /**
	 * Creates a new plugin instance.
	 */ constructor(context){
        super();
        this.context = context;
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        this.stopListening();
    }
    /**
	 * @inheritDoc
	 */ static get isContextPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return false;
    }
    /**
	 * @inheritDoc
	 */ static get isPremiumPlugin() {
        return false;
    }
}

/**
 * A keystroke handler for editor editing. Its instance is available
 * in {@link module:core/editor/editor~Editor#keystrokes} so plugins
 * can register their keystrokes.
 *
 * E.g. an undo plugin would do this:
 *
 * ```ts
 * editor.keystrokes.set( 'Ctrl+Z', 'undo' );
 * editor.keystrokes.set( 'Ctrl+Shift+Z', 'redo' );
 * editor.keystrokes.set( 'Ctrl+Y', 'redo' );
 * ```
 */ class EditingKeystrokeHandler extends KeystrokeHandler {
    /**
	 * The editor instance.
	 */ editor;
    /**
	 * Creates an instance of the keystroke handler.
	 */ constructor(editor){
        super();
        this.editor = editor;
    }
    /**
	 * Registers a handler for the specified keystroke.
	 *
	 * The handler can be specified as a command name or a callback.
	 *
	 * @param keystroke Keystroke defined in a format accepted by
	 * the {@link module:utils/keyboard~parseKeystroke} function.
	 * @param callback If a string is passed, then the keystroke will
	 * {@link module:core/editor/editor~Editor#execute execute a command}.
	 * If a function, then it will be called with the
	 * {@link module:engine/view/observer/keyobserver~ViewDocumentKeyEventData key event data} object and
	 * a `cancel()` helper to both `preventDefault()` and `stopPropagation()` of the event.
	 * @param options Additional options.
	 * @param options.priority The priority of the keystroke callback. The higher the priority value
	 * the sooner the callback will be executed. Keystrokes having the same priority
	 * are called in the order they were added.
	 */ set(keystroke, callback, options = {}) {
        if (typeof callback == 'string') {
            const commandName = callback;
            callback = (evtData, cancel)=>{
                this.editor.execute(commandName);
                cancel();
            };
        }
        super.set(keystroke, callback, options);
    }
}

const DEFAULT_CATEGORY_ID = 'contentEditing';
/**
 * @internal
 */ const DEFAULT_GROUP_ID = 'common';
/**
 * A common namespace for various accessibility features of the editor.
 *
 * **Information about editor keystrokes**
 *
 * * The information about keystrokes available in the editor is stored in the {@link #keystrokeInfos} property.
 * * New info entries can be added using the {@link #addKeystrokeInfoCategory}, {@link #addKeystrokeInfoGroup},
 * and {@link #addKeystrokeInfos} methods.
 */ class Accessibility {
    /**
	 * Stores information about keystrokes brought by editor features for the users to interact with the editor, mainly
	 * keystroke combinations and their accessible labels.
	 *
	 * This information is particularly useful for screen reader and other assistive technology users. It gets displayed
	 * by the {@link module:ui/editorui/accessibilityhelp/accessibilityhelp~AccessibilityHelp Accessibility help} dialog.
	 *
	 * Keystrokes are organized in categories and groups. They can be added using ({@link #addKeystrokeInfoCategory},
	 * {@link #addKeystrokeInfoGroup}, and {@link #addKeystrokeInfos}) methods.
	 *
	 * Please note that:
	 * * two categories are always available:
	 *   * `'contentEditing'` for keystrokes related to content creation,
	 *   * `'navigation'` for keystrokes related to navigation in the UI and the content.
	 * * unless specified otherwise, new keystrokes are added into the `'contentEditing'` category and the `'common'`
	 * keystroke group within that category while using the {@link #addKeystrokeInfos} method.
	 */ keystrokeInfos = new Map();
    /**
	 * The editor instance.
	 */ _editor;
    /**
	 * @inheritDoc
	 */ constructor(editor){
        this._editor = editor;
        const isMenuBarVisible = editor.config.get('menuBar.isVisible');
        const t = editor.locale.t;
        this.addKeystrokeInfoCategory({
            id: DEFAULT_CATEGORY_ID,
            label: t('Content editing keystrokes'),
            description: t('These keyboard shortcuts allow for quick access to content editing features.')
        });
        const navigationKeystrokes = [
            {
                label: t('Close contextual balloons, dropdowns, and dialogs'),
                keystroke: 'Esc'
            },
            {
                label: t('Open the accessibility help dialog'),
                keystroke: 'Alt+0'
            },
            {
                label: t('Move focus between form fields (inputs, buttons, etc.)'),
                keystroke: [
                    [
                        'Tab'
                    ],
                    [
                        'Shift+Tab'
                    ]
                ]
            },
            {
                label: t('Move focus to the toolbar, navigate between toolbars'),
                keystroke: 'Alt+F10',
                mayRequireFn: true
            },
            {
                label: t('Navigate through the toolbar or menu bar'),
                keystroke: [
                    [
                        'arrowup'
                    ],
                    [
                        'arrowright'
                    ],
                    [
                        'arrowdown'
                    ],
                    [
                        'arrowleft'
                    ]
                ]
            },
            {
                // eslint-disable-next-line @stylistic/max-len
                label: t('Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.'),
                keystroke: [
                    [
                        'Enter'
                    ],
                    [
                        'Space'
                    ]
                ]
            }
        ];
        if (isMenuBarVisible) {
            navigationKeystrokes.push({
                label: t('Move focus to the menu bar, navigate between menu bars'),
                keystroke: 'Alt+F9',
                mayRequireFn: true
            });
        }
        this.addKeystrokeInfoCategory({
            id: 'navigation',
            label: t('User interface and content navigation keystrokes'),
            description: t('Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.'),
            groups: [
                {
                    id: 'common',
                    keystrokes: navigationKeystrokes
                }
            ]
        });
    }
    /**
	 * Adds a top-level category in the {@link #keystrokeInfos keystroke information database} with a label and optional description.
	 *
	 * Categories organize keystrokes and help users to find the right keystroke. Each category can have multiple groups
	 * of keystrokes that narrow down the context in which the keystrokes are available. Every keystroke category comes
	 * with a `'common'` group by default.
	 *
	 * By default, two categories are available:
	 * * `'contentEditing'` for keystrokes related to content creation,
	 * * `'navigation'` for keystrokes related to navigation in the UI and the content.
	 *
	 * To create a new keystroke category with new groups, use the following code:
	 *
	 * ```js
	 * class MyPlugin extends Plugin {
	 * 	// ...
	 * 	init() {
	 * 		const editor = this.editor;
	 * 		const t = editor.t;
	 *
	 * 		// ...
	 *
	 * 		editor.accessibility.addKeystrokeInfoCategory( {
	 * 			id: 'myCategory',
	 * 			label: t( 'My category' ),
	 * 			description: t( 'My category description.' ),
	 * 			groups: [
	 * 				{
	 * 					id: 'myGroup',
	 * 					label: t( 'My keystroke group' ),
	 * 					keystrokes: [
	 * 						{
	 * 							label: t( 'Keystroke label 1' ),
	 * 							keystroke: 'Ctrl+Shift+N'
	 * 						},
	 * 						{
	 * 							label: t( 'Keystroke label 2' ),
	 * 							keystroke: 'Ctrl+Shift+M'
	 * 						}
	 * 					]
	 * 				}
	 * 			]
	 * 		};
	 * 	}
	 * }
	 * ```
	 *
	 * See {@link #keystrokeInfos}, {@link #addKeystrokeInfoGroup}, and {@link #addKeystrokeInfos}.
	 */ addKeystrokeInfoCategory({ id, label, description, groups }) {
        this.keystrokeInfos.set(id, {
            id,
            label,
            description,
            groups: new Map()
        });
        this.addKeystrokeInfoGroup({
            categoryId: id,
            id: DEFAULT_GROUP_ID
        });
        if (groups) {
            groups.forEach((group)=>{
                this.addKeystrokeInfoGroup({
                    categoryId: id,
                    ...group
                });
            });
        }
    }
    /**
	 * Adds a group of keystrokes in a specific category to the {@link #keystrokeInfos keystroke information database}.
	 *
	 * Groups narrow down the context in which the keystrokes are available. When `categoryId` is not specified,
	 * the group goes to the `'contentEditing'` category (default).
	 *
	 * To create a new group within an existing category, use the following code:
	 *
	 * ```js
	 * class MyPlugin extends Plugin {
	 * 	// ...
	 * 	init() {
	 * 		const editor = this.editor;
	 * 		const t = editor.t;
	 *
	 * 		// ...
	 *
	 * 		editor.accessibility.addKeystrokeInfoGroup( {
	 * 			id: 'myGroup',
	 * 			categoryId: 'navigation',
	 * 			label: t( 'My keystroke group' ),
	 * 			keystrokes: [
	 * 				{
	 * 					label: t( 'Keystroke label 1' ),
	 * 					keystroke: 'Ctrl+Shift+N'
	 * 				},
	 * 				{
	 * 					label: t( 'Keystroke label 2' ),
	 * 					keystroke: 'Ctrl+Shift+M'
	 * 				}
	 * 			]
	 * 		} );
	 * 	}
	 * }
	 * ```
	 *
	 * See {@link #keystrokeInfos}, {@link #addKeystrokeInfoCategory}, and {@link #addKeystrokeInfos}.
	 */ addKeystrokeInfoGroup({ categoryId = DEFAULT_CATEGORY_ID, id, label, keystrokes }) {
        const category = this.keystrokeInfos.get(categoryId);
        if (!category) {
            throw new CKEditorError('accessibility-unknown-keystroke-info-category', this._editor, {
                groupId: id,
                categoryId
            });
        }
        category.groups.set(id, {
            id,
            label,
            keystrokes: keystrokes || []
        });
    }
    /**
	 * Adds information about keystrokes to the {@link #keystrokeInfos keystroke information database}.
	 *
	 * Keystrokes without specified `groupId` or `categoryId` go to the `'common'` group in the `'contentEditing'` category (default).
	 *
	 * To add a keystroke brought by your plugin (using default group and category), use the following code:
	 *
	 * ```js
	 * class MyPlugin extends Plugin {
	 * 	// ...
	 * 	init() {
	 * 		const editor = this.editor;
	 * 		const t = editor.t;
	 *
	 * 		// ...
	 *
	 * 		editor.accessibility.addKeystrokeInfos( {
	 * 			keystrokes: [
	 * 				{
	 * 					label: t( 'Keystroke label' ),
	 * 					keystroke: 'CTRL+B'
	 * 				}
	 * 			]
	 * 		} );
	 * 	}
	 * }
	 * ```
	 * To add a keystroke in a specific existing `'widget'` group in the default `'contentEditing'` category:
	 *
	 * ```js
	 * class MyPlugin extends Plugin {
	 * 	// ...
	 * 	init() {
	 * 		const editor = this.editor;
	 * 		const t = editor.t;
	 *
	 * 		// ...
	 *
	 * 		editor.accessibility.addKeystrokeInfos( {
	 * 			// Add a keystroke to the existing "widget" group.
	 * 			groupId: 'widget',
	 * 			keystrokes: [
	 * 				{
	 * 					label: t( 'A an action on a selected widget' ),
	 * 					keystroke: 'Ctrl+D',
	 * 				}
	 * 			]
	 * 		} );
	 * 	}
	 * }
	 * ```
	 *
	 * To add a keystroke to another existing category (using default group):
	 *
	 * ```js
	 * class MyPlugin extends Plugin {
	 * 	// ...
	 * 	init() {
	 * 		const editor = this.editor;
	 * 		const t = editor.t;
	 *
	 * 		// ...
	 *
	 * 		editor.accessibility.addKeystrokeInfos( {
	 * 			// Add keystrokes to the "navigation" category (one of defaults).
	 * 			categoryId: 'navigation',
	 * 			keystrokes: [
	 * 				{
	 * 					label: t( 'Keystroke label' ),
	 * 					keystroke: 'CTRL+B'
	 * 				}
	 * 			]
	 * 		} );
	 * 	}
	 * }
	 * ```
	 *
	 * See {@link #keystrokeInfos}, {@link #addKeystrokeInfoGroup}, and {@link #addKeystrokeInfoCategory}.
	 */ addKeystrokeInfos({ categoryId = DEFAULT_CATEGORY_ID, groupId = DEFAULT_GROUP_ID, keystrokes }) {
        if (!this.keystrokeInfos.has(categoryId)) {
            /**
			 * Cannot add keystrokes in an unknown category. Use
			 * {@link module:core/accessibility~Accessibility#addKeystrokeInfoCategory}
			 * to add a new category or make sure the specified category exists.
			 *
			 * @error accessibility-unknown-keystroke-info-category
			 * @param {string} categoryId The id of the unknown keystroke category.
			 * @param {module:core/accessibility~AddKeystrokeInfosData#keystrokes} keystrokes Keystroke definitions about to be added.
			 */ throw new CKEditorError('accessibility-unknown-keystroke-info-category', this._editor, {
                categoryId,
                keystrokes
            });
        }
        const category = this.keystrokeInfos.get(categoryId);
        if (!category.groups.has(groupId)) {
            /**
			 * Cannot add keystrokes to an unknown group.
			 *
			 * Use {@link module:core/accessibility~Accessibility#addKeystrokeInfoGroup}
			 * to add a new group or make sure the specified group exists.
			 *
			 * @error accessibility-unknown-keystroke-info-group
			 * @param {string} groupId The id of the unknown keystroke group.
			 * @param {string} categoryId The id of category the unknown group should belong to.
			 * @param {module:core/accessibility~AddKeystrokeInfosData#keystrokes} keystrokes Keystroke definitions about to be added.
			 */ throw new CKEditorError('accessibility-unknown-keystroke-info-group', this._editor, {
                groupId,
                categoryId,
                keystrokes
            });
        }
        category.groups.get(groupId).keystrokes.push(...keystrokes);
    }
}

/**
 * This part of the code is not executed in open-source implementations using a GPL key.
 * It only runs when a specific license key is provided. If you are uncertain whether
 * this applies to your installation, please contact our support team.
 *
 * @internal
 */ function getEditorUsageData(editor) {
    return {
        sessionId: getSessionId(),
        pageSessionId: getPageSessionID(),
        hostname: window.location.hostname,
        version: globalThis.CKEDITOR_VERSION,
        type: getEditorType(editor),
        plugins: getPluginsUsageData(editor.plugins),
        distribution: getDistributionUsageData(),
        env: getEnvUsageData(),
        integration: Object.create(null),
        menuBar: {
            isVisible: !!editor.config.get('menuBar.isVisible')
        },
        language: {
            ui: editor.locale.uiLanguage,
            content: editor.locale.contentLanguage
        },
        toolbar: {
            main: getToolbarUsageData(editor.config.get('toolbar')),
            block: getToolbarUsageData(editor.config.get('blockToolbar')),
            balloon: getToolbarUsageData(editor.config.get('balloonToolbar'))
        }
    };
}
function getEditorType(editor) {
    return Object.getPrototypeOf(editor).constructor.editorName;
}
function getPluginsUsageData(collection) {
    return Array.from(collection).filter(([PluginConstructor])=>!!PluginConstructor.pluginName).map(([PluginConstructor])=>{
        const { pluginName, isContextPlugin, isOfficialPlugin, isPremiumPlugin } = PluginConstructor;
        return {
            isContext: !!isContextPlugin,
            isOfficial: !!isOfficialPlugin,
            isPremium: !!isPremiumPlugin,
            name: pluginName
        };
    });
}
function getToolbarUsageData(toolbarConfig) {
    if (!toolbarConfig) {
        return undefined;
    }
    const normalizedToolbar = Array.isArray(toolbarConfig) ? {
        items: toolbarConfig
    } : toolbarConfig;
    const flattenToolbarConfigNames = extractToolbarConfigItemsNames(normalizedToolbar.items || []);
    const isMultiline = flattenToolbarConfigNames.includes('-');
    return {
        isMultiline,
        shouldNotGroupWhenFull: !!normalizedToolbar.shouldNotGroupWhenFull,
        items: stripToolbarSeparatorItems(flattenToolbarConfigNames)
    };
    function stripToolbarSeparatorItems(items) {
        return items.filter((item)=>item !== '|' && item !== '-');
    }
    function extractToolbarConfigItemsNames(items) {
        return items.flatMap((item)=>{
            if (typeof item === 'string') {
                return [
                    item
                ];
            }
            return extractToolbarConfigItemsNames(item.items);
        });
    }
}
function getDistributionUsageData() {
    return {
        channel: window[Symbol.for('cke distribution')] || 'sh'
    };
}
function getEnvUsageData() {
    let os = 'unknown';
    let browser = 'unknown';
    if (env.isMac) {
        os = 'mac';
    } else if (env.isWindows) {
        os = 'windows';
    } else if (env.isiOS) {
        os = 'ios';
    } else if (env.isAndroid) {
        os = 'android';
    }
    if (env.isGecko) {
        browser = 'gecko';
    } else if (env.isBlink) {
        browser = 'blink';
    } else if (env.isSafari) {
        browser = 'safari';
    }
    return {
        os,
        browser
    };
}
function getSessionId() {
    if (!localStorage.getItem('__ckeditor-session-id')) {
        localStorage.setItem('__ckeditor-session-id', uid());
    }
    return localStorage.getItem('__ckeditor-session-id');
}
function getPageSessionID() {
    global.window.CKEDITOR_PAGE_SESSION_ID = global.window.CKEDITOR_PAGE_SESSION_ID || uid();
    return global.window.CKEDITOR_PAGE_SESSION_ID;
}

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
 */ class Editor extends /* #__PURE__ */ ObservableMixin() {
    /**
	 * A required name of the editor class. The name should reflect the constructor name.
	 */ static get editorName() {
        return 'Editor';
    }
    /**
	 * A namespace for the accessibility features of the editor.
	 */ accessibility;
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
	 */ commands;
    /**
	 * Stores all configurations specific to this editor instance.
	 *
	 * ```ts
	 * editor.config.get( 'image.toolbar' );
	 * // -> [ 'imageStyle:block', 'imageStyle:side', '|', 'toggleImageCaption', 'imageTextAlternative' ]
	 * ```
	 */ config;
    /**
	 * Conversion manager through which you can register model-to-view and view-to-model converters.
	 *
	 * See the {@link module:engine/conversion/conversion~Conversion} documentation to learn how to add converters.
	 */ conversion;
    /**
	 * The {@link module:engine/controller/datacontroller~DataController data controller}.
	 * Used e.g. for setting and retrieving the editor data.
	 */ data;
    /**
	 * The {@link module:engine/controller/editingcontroller~EditingController editing controller}.
	 * Controls user input and rendering the content for editing.
	 */ editing;
    /**
	 * The locale instance.
	 */ locale;
    /**
	 * The editor's model.
	 *
	 * The central point of the editor's abstract data model.
	 */ model;
    /**
	 * The plugins loaded and in use by this editor instance.
	 *
	 * ```ts
	 * editor.plugins.get( 'ClipboardPipeline' ); // -> An instance of the clipboard pipeline plugin.
	 * ```
	 */ plugins;
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
	 */ keystrokes;
    /**
	 * Shorthand for {@link module:utils/locale~Locale#t}.
	 *
	 * @see module:utils/locale~Locale#t
	 */ t;
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
	 */ static defaultConfig;
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
	 */ static builtinPlugins;
    /**
	 * The editor context.
	 * When it is not provided through the configuration, the editor creates it.
	 */ _context;
    /**
	 * A set of lock IDs for the {@link #isReadOnly} getter.
	 */ _readOnlyLocks;
    /**
	 * `Editor` class is commonly put in `config.plugins` array.
	 *
	 * This property helps with better error detection.
	 *
	 * @internal
	 */ static get _throwErrorWhenUsedAsAPlugin() {
        return true;
    }
    /**
	 * Creates a new instance of the editor class.
	 *
	 * Usually, not to be used directly. See the static {@link module:core/editor/editor~Editor.create `create()`} method.
	 *
	 * @param config The editor configuration.
	 */ constructor(config = {}){
        super();
        if (typeof config !== 'object' || Array.isArray(config)) {
            /**
			 * Editor configuration must be an object.
			 *
			 * A common cause of this error is passing an Editor class (for example
			 * `ClassicEditor`) in the `config.plugins` array. In such case, the editor
			 * constructor is called with an Editor or Context instance instead of
			 * the configuration object.
			 *
			 * @error editor-config-invalid-type
			 */ throw new CKEditorError('editor-config-invalid-type');
        }
        if ('sanitizeHtml' in config) {
            /**
			 * Configuration property `config.sanitizeHtml` was removed in CKEditor version 43.1.0 and is no longer supported.
			 *
			 * Please use `config.htmlEmbed.sanitizeHtml` and/or `config.mergeFields.sanitizeHtml` instead.
			 *
			 * @error editor-config-sanitizehtml-not-supported
			 */ throw new CKEditorError('editor-config-sanitizehtml-not-supported');
        }
        const constructor = this.constructor;
        // We don't pass translations to the config, because its behavior of splitting keys
        // with dots (e.g. `resize.width` => `resize: { width }`) breaks the translations.
        const { translations: defaultTranslations, ...defaultConfig } = constructor.defaultConfig || {};
        const { translations = defaultTranslations, ...rest } = config;
        // Prefer the language passed as the argument to the constructor instead of the constructor's `defaultConfig`, if both are set.
        const language = config.language || defaultConfig.language;
        this._context = config.context || new Context({
            language,
            translations
        });
        this._context._addEditor(this, !config.context);
        // Clone the plugins to make sure that the plugin array will not be shared
        // between editors and make the watchdog feature work correctly.
        const availablePlugins = Array.from(constructor.builtinPlugins || []);
        this.config = new Config(rest, defaultConfig);
        this.config.define('plugins', availablePlugins);
        this.config.define(this._context._getEditorConfig());
        checkLicenseKeyIsDefined(this.config);
        this.plugins = new PluginCollection(this, availablePlugins, this._context.plugins);
        this.locale = this._context.locale;
        this.t = this.locale.t;
        this._readOnlyLocks = new Set();
        this.commands = new CommandCollection();
        this.set('state', 'initializing');
        this.once('ready', ()=>this.state = 'ready', {
            priority: 'high'
        });
        this.once('destroy', ()=>this.state = 'destroyed', {
            priority: 'high'
        });
        this.model = new Model(this.config);
        this.on('change:isReadOnly', ()=>{
            this.model.document.isReadOnly = this.isReadOnly;
        });
        const stylesProcessor = new StylesProcessor();
        this.data = new DataController(this.model, stylesProcessor);
        this.editing = new EditingController(this.model, stylesProcessor);
        this.editing.view.document.bind('isReadOnly').to(this);
        this.conversion = new Conversion([
            this.editing.downcastDispatcher,
            this.data.downcastDispatcher
        ], this.data.upcastDispatcher);
        this.conversion.addAlias('dataDowncast', this.data.downcastDispatcher);
        this.conversion.addAlias('editingDowncast', this.editing.downcastDispatcher);
        this.keystrokes = new EditingKeystrokeHandler(this);
        this.keystrokes.listenTo(this.editing.view.document);
        this.accessibility = new Accessibility(this);
        verifyLicenseKey(this);
        // Checks if the license key is defined and throws an error if it is not.
        function checkLicenseKeyIsDefined(config) {
            let licenseKey = config.get('licenseKey');
            if (!licenseKey && window.CKEDITOR_GLOBAL_LICENSE_KEY) {
                licenseKey = window.CKEDITOR_GLOBAL_LICENSE_KEY;
                config.set('licenseKey', licenseKey);
            }
            if (!licenseKey) {
                /**
				 * The `licenseKey` property is missing in the editor configuration.
				 *
				 * * If you are using the editor in a commercial setup, please provide your license key.
				 * * If you still need to acquire a key, please [contact us](https://ckeditor.com/contact/) or
				 *   [create a free account with a 14 day premium features trial](https://portal.ckeditor.com/checkout?plan=free).
				 * * If you are using the editor under a GPL license or another license from our Open Source Initiative,
				 *   use the 'GPL' license key instead.
				 *
				 * ```js
				 * ClassicEditor.create( document.querySelector( '#editor' ), {
				 * 	licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
				 * 	// ... Other configuration options ...
				 * } ) ;
				 *
				 * @error license-key-missing
				 */ throw new CKEditorError('license-key-missing');
            }
        }
        function verifyLicenseKey(editor) {
            const licenseKey = editor.config.get('licenseKey');
            const distributionChannel = window[Symbol.for('cke distribution')] || 'sh';
            function blockEditor(reason, name) {
                editor.enableReadOnlyMode(Symbol('invalidLicense'));
                editor._showLicenseError(reason, name);
            }
            function hasAllRequiredFields(licensePayload) {
                const requiredFields = [
                    'exp',
                    'jti',
                    'vc'
                ];
                return requiredFields.every((field)=>field in licensePayload);
            }
            function getCrcInputData(licensePayload) {
                const keysToCheck = Object.getOwnPropertyNames(licensePayload).sort();
                const filteredValues = keysToCheck.filter((key)=>key != 'vc' && licensePayload[key] != null).map((key)=>licensePayload[key]);
                return filteredValues;
            }
            function checkLicensedHosts(licensedHosts) {
                const { hostname } = new URL(window.location.href);
                if (licensedHosts.includes(hostname)) {
                    return true;
                }
                const segments = hostname.split('.');
                return licensedHosts// Filter out hosts without wildcards.
                .filter((host)=>host.includes('*'))// Split the hosts into segments.
                .map((host)=>host.split('.'))// Filter out hosts that have more segments than the current hostname.
                .filter((host)=>host.length <= segments.length)// Pad the beginning of the licensed host if it's shorter than the current hostname.
                .map((host)=>Array(segments.length - host.length).fill(host[0] === '*' ? '*' : '').concat(host))// Check if some license host matches the hostname.
                .some((octets)=>segments.every((segment, index)=>octets[index] === segment || octets[index] === '*'));
            }
            function warnAboutNonProductionLicenseKey(licenseType) {
                const capitalizedLicenseType = licenseType[0].toUpperCase() + licenseType.slice(1);
                const article = licenseType === 'evaluation' ? 'an' : 'a';
                console.info(`%cCKEditor 5 ${capitalizedLicenseType} License`, 'color: #ffffff; background: #743CCD; font-size: 14px; padding: 4px 8px; border-radius: 4px;');
                console.warn(`⚠️ You are using ${article} ${licenseType} license of CKEditor 5` + `${licenseType === 'trial' ? ' which is for evaluation purposes only' : ''}. ` + 'For production usage, please obtain a production license at https://portal.ckeditor.com/');
            }
            if (licenseKey == 'GPL') {
                if (distributionChannel == 'cloud') {
                    blockEditor('distributionChannel');
                }
                return;
            }
            const licensePayload = decodeLicenseKey(licenseKey);
            if (!licensePayload) {
                blockEditor('invalid');
                return;
            }
            if (!hasAllRequiredFields(licensePayload)) {
                blockEditor('invalid');
                return;
            }
            if (licensePayload.distributionChannel && !toArray(licensePayload.distributionChannel).includes(distributionChannel)) {
                blockEditor('distributionChannel');
                return;
            }
            if (crc32(getCrcInputData(licensePayload)) != licensePayload.vc.toLowerCase()) {
                blockEditor('invalid');
                return;
            }
            const expirationDate = new Date(licensePayload.exp * 1000);
            if (expirationDate < releaseDate) {
                blockEditor('expired');
                return;
            }
            const licensedHosts = licensePayload.licensedHosts;
            if (licensedHosts && licensedHosts.length > 0 && !checkLicensedHosts(licensedHosts)) {
                blockEditor('domainLimit');
                return;
            }
            if ([
                'evaluation',
                'trial'
            ].includes(licensePayload.licenseType) && licensePayload.exp * 1000 < Date.now()) {
                blockEditor('expired');
                return;
            }
            if ([
                'development',
                'evaluation',
                'trial'
            ].includes(licensePayload.licenseType)) {
                const { licenseType } = licensePayload;
                window.CKEDITOR_WARNING_SUPPRESSIONS = window.CKEDITOR_WARNING_SUPPRESSIONS || {};
                if (!window.CKEDITOR_WARNING_SUPPRESSIONS[licenseType]) {
                    warnAboutNonProductionLicenseKey(licenseType);
                    window.CKEDITOR_WARNING_SUPPRESSIONS[licenseType] = true;
                }
            }
            if (licensePayload.licenseType === 'evaluation') {
                const timerId = setTimeout(()=>{
                    blockEditor('evaluationLimit');
                }, 600000);
                editor.on('destroy', ()=>{
                    clearTimeout(timerId);
                });
            }
            if (licensePayload.usageEndpoint) {
                editor.once('ready', ()=>{
                    const request = {
                        requestId: uid(),
                        requestTime: Math.round(Date.now() / 1000),
                        license: licenseKey,
                        editor: collectUsageData(editor)
                    };
                    /**
					 * This part of the code is not executed in open-source implementations using a GPL key.
					 * It only runs when a specific license key is provided. If you are uncertain whether
					 * this applies to your installation, please contact our support team.
					 */ editor._sendUsageRequest(licensePayload.usageEndpoint, request).then((response)=>{
                        const { status, message } = response;
                        if (message) {
                            console.warn(message);
                        }
                        if (status != 'ok') {
                            blockEditor('usageLimit');
                        }
                    }, ()=>{
                        /**
						 * Your license key cannot be validated due to a network issue.
						 * Please ensure that your setup does not block requests to the validation endpoint.
						 *
						 * @error license-key-validation-endpoint-not-reachable
						 * @param {string} url The URL that was attempted to be reached for validation.
						 */ logError('license-key-validation-endpoint-not-reachable', {
                            url: licensePayload.usageEndpoint
                        });
                    });
                }, {
                    priority: 'high'
                });
            }
        }
    }
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
	 */ get isReadOnly() {
        return this._readOnlyLocks.size > 0;
    }
    set isReadOnly(value) {
        /**
		 * The {@link module:core/editor/editor~Editor#isReadOnly Editor#isReadOnly} property is read-only since version `34.0.0`
		 * and can be set only using {@link module:core/editor/editor~Editor#enableReadOnlyMode `Editor#enableReadOnlyMode( lockId )`} and
		 * {@link module:core/editor/editor~Editor#disableReadOnlyMode `Editor#disableReadOnlyMode( lockId )`}.
		 *
		 * Usage before version `34.0.0`:
		 *
		 * ```ts
		 * editor.isReadOnly = true;
		 * editor.isReadOnly = false;
		 * ```
		 *
		 * Usage since version `34.0.0`:
		 *
		 * ```ts
		 * editor.enableReadOnlyMode( 'my-feature-id' );
		 * editor.disableReadOnlyMode( 'my-feature-id' );
		 * ```
		 *
		 * @error editor-isreadonly-has-no-setter
		 */ throw new CKEditorError('editor-isreadonly-has-no-setter');
    }
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
	 */ enableReadOnlyMode(lockId) {
        if (typeof lockId !== 'string' && typeof lockId !== 'symbol') {
            /**
			 * The lock ID is missing or it is not a string or symbol.
			 *
			 * @error editor-read-only-lock-id-invalid
			 * @param {never} lockId Lock ID.
			 */ throw new CKEditorError('editor-read-only-lock-id-invalid', null, {
                lockId
            });
        }
        if (this._readOnlyLocks.has(lockId)) {
            return;
        }
        this._readOnlyLocks.add(lockId);
        if (this._readOnlyLocks.size === 1) {
            // Manually fire the `change:isReadOnly` event as only getter is provided.
            this.fire('change:isReadOnly', 'isReadOnly', true, false);
        }
    }
    /**
	 * Removes the read-only lock from the editor with given lock ID.
	 *
	 * When no lock is present on the editor anymore, then the {@link #isReadOnly `isReadOnly` property} will be set to `false`.
	 *
	 * @param lockId The lock ID for setting the editor to the read-only state.
	 */ disableReadOnlyMode(lockId) {
        if (typeof lockId !== 'string' && typeof lockId !== 'symbol') {
            throw new CKEditorError('editor-read-only-lock-id-invalid', null, {
                lockId
            });
        }
        if (!this._readOnlyLocks.has(lockId)) {
            return;
        }
        this._readOnlyLocks.delete(lockId);
        if (this._readOnlyLocks.size === 0) {
            // Manually fire the `change:isReadOnly` event as only getter is provided.
            this.fire('change:isReadOnly', 'isReadOnly', false, true);
        }
    }
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
	 */ setData(data) {
        this.data.set(data);
    }
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
	 */ getData(options) {
        return this.data.get(options);
    }
    /**
	 * Loads and initializes plugins specified in the configuration.
	 *
	 * @returns A promise which resolves once the initialization is completed, providing an array of loaded plugins.
	 */ initPlugins() {
        const config = this.config;
        const plugins = config.get('plugins');
        const removePlugins = config.get('removePlugins') || [];
        const extraPlugins = config.get('extraPlugins') || [];
        const substitutePlugins = config.get('substitutePlugins') || [];
        return this.plugins.init(plugins.concat(extraPlugins), removePlugins, substitutePlugins).then((plugins)=>{
            checkPluginsAllowedByLicenseKey(this);
            return plugins;
        });
        function checkPluginsAllowedByLicenseKey(editor) {
            const licenseKey = editor.config.get('licenseKey');
            if (licenseKey === 'GPL') {
                return;
            }
            const decodedPayload = decodeLicenseKey(licenseKey);
            if (!decodedPayload) {
                return;
            }
            const disallowedPlugin = [
                ...editor.plugins
            ].map(([pluginConstructor])=>pluginConstructor).find((pluginConstructor)=>{
                if (!pluginConstructor.pluginName) {
                    return false;
                }
                if (!pluginConstructor.licenseFeatureCode) {
                    return false;
                }
                return isFeatureBlockedByLicenseKey(decodedPayload, pluginConstructor.licenseFeatureCode);
            });
            if (disallowedPlugin) {
                editor.enableReadOnlyMode(Symbol('invalidLicense'));
                editor._showLicenseError('pluginNotAllowed', disallowedPlugin.pluginName);
            }
        }
    }
    /**
	 * Destroys the editor instance, releasing all resources used by it.
	 *
	 * **Note** The editor cannot be destroyed during the initialization phase so if it is called
	 * while the editor {@link #state is being initialized}, it will wait for the editor initialization before destroying it.
	 *
	 * @fires destroy
	 * @returns A promise that resolves once the editor instance is fully destroyed.
	 */ destroy() {
        let readyPromise = Promise.resolve();
        if (this.state == 'initializing') {
            readyPromise = new Promise((resolve)=>this.once('ready', resolve));
        }
        return readyPromise.then(()=>{
            this.fire('destroy');
            this.stopListening();
            this.commands.destroy();
        }).then(()=>this.plugins.destroy()).then(()=>{
            this.model.destroy();
            this.data.destroy();
            this.editing.destroy();
            this.keystrokes.destroy();
        })// Remove the editor from the context.
        // When the context was created by this editor, the context will be destroyed.
        .then(()=>this._context._removeEditor(this));
    }
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
	 */ execute(commandName, ...commandParams) {
        try {
            return this.commands.execute(commandName, ...commandParams);
        } catch (err) {
            // @if CK_DEBUG // throw err;
            /* istanbul ignore next -- @preserve */ CKEditorError.rethrowUnexpectedError(err, this);
        }
    }
    /**
	 * Focuses the editor.
	 *
	 * **Note** To explicitly focus the editing area of the editor, use the
	 * {@link module:engine/view/view~EditingView#focus `editor.editing.view.focus()`} method of the editing view.
	 *
	 * Check out the {@glink framework/deep-dive/ui/focus-tracking#focus-in-the-editor-ui Focus in the editor UI} section
	 * of the {@glink framework/deep-dive/ui/focus-tracking Deep dive into focus tracking} guide to learn more.
	 */ focus() {
        this.editing.view.focus();
    }
    /* istanbul ignore next -- @preserve */ /**
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
	 */ static create(...args) {
        throw new Error('This is an abstract method.');
    }
    /**
	 * The {@link module:core/context~Context} class.
	 *
	 * Exposed as static editor field for easier access in editor builds.
	 */ static Context = Context;
    /**
	 * The {@link module:watchdog/editorwatchdog~EditorWatchdog} class.
	 *
	 * Exposed as static editor field for easier access in editor builds.
	 */ static EditorWatchdog = EditorWatchdog;
    /**
	 * The {@link module:watchdog/contextwatchdog~ContextWatchdog} class.
	 *
	 * Exposed as static editor field for easier access in editor builds.
	 */ static ContextWatchdog = ContextWatchdog;
    _showLicenseError(reason, name) {
        setTimeout(()=>{
            if (reason == 'invalid') {
                /**
				 * The license key provided is invalid. Please ensure that it is copied correctly
				 * from the [Customer Portal](http://portal.ckeditor.com). If the issue persists,
				 * please [contact our customer support](https://ckeditor.com/contact/).
				 *
				 * @error invalid-license-key
				 */ throw new CKEditorError('invalid-license-key');
            }
            if (reason == 'expired') {
                /**
				 * Your license key has expired.
				 *
				 * If you used our free trial, you either need to switch to
				 * [open-source license](https://ckeditor.com/docs/ckeditor5/latest/getting-started/licensing/license-and-legal.html), or
				 * in case of a commercial plan, change the trial key to production key or development key.
				 * Switching from trial, you also need to align the editor configuration to the features available in your plan.
				 *
				 * If you already had one of our Cloud or Custom plans, please renew your license in the
				 * [Customer Portal](https://portal.ckeditor.com).
				 *
				 * @error license-key-expired
				 */ throw new CKEditorError('license-key-expired');
            }
            if (reason == 'domainLimit') {
                /**
				 * The provided license does not allow the editor to run on this domain.
				 * Some license keys are restricted to local test environments only.
				 * For more details, please refer to the
				 * {@glink getting-started/licensing/license-key-and-activation#license-key-types license key type documentation}.
				 *
				 * @error license-key-domain-limit
				 */ throw new CKEditorError('license-key-domain-limit');
            }
            if (reason == 'pluginNotAllowed') {
                // It's safe to assume `name` exists because `pluginNotAllowed` must know a plugin name when checking the license.
                const gluePluginName = name.replace(/(Editing|UI)$/, '');
                const containsGluePlugin = this.plugins.has(gluePluginName);
                /**
				 * The plugin you are trying to use is not permitted under your current license.
				 * Please check the available features on the
				 * [Customer Portal](https://portal.ckeditor.com) or
				 * [contact support](https://ckeditor.com/contact/) for more information.
				 *
				 * @error license-key-plugin-not-allowed
				 * @param {String} pluginName The plugin you tried to load.
				 */ throw new CKEditorError('license-key-plugin-not-allowed', null, {
                    pluginName: containsGluePlugin ? gluePluginName : name
                });
            }
            if (reason == 'featureNotAllowed') {
                /**
				 * The feature you are trying to use is not permitted under your current license.
				 * Please check the available features on the
				 * [Customer Portal](https://portal.ckeditor.com) or
				 * [contact support](https://ckeditor.com/contact/) for more information.
				 *
				 * @error license-key-feature-not-allowed
				 * @param {String} featureName The feature you tried to use.
				 */ throw new CKEditorError('license-key-feature-not-allowed', null, {
                    featureName: name
                });
            }
            if (reason == 'evaluationLimit') {
                /**
				 * You have exceeded the editor operation limit available for your evaluation license key.
				 * Please restart the editor to continue using it.
				 * {@glink getting-started/licensing/license-key-and-activation#license-key-types Read more about license key types}.
				 *
				 * @error license-key-evaluation-limit
				 */ throw new CKEditorError('license-key-evaluation-limit');
            }
            if (reason == 'trialLimit') {
                /**
				 * You have exceeded the editor operation limit for your trial license key.
				 * Please restart the editor to continue using it.
				 * {@glink getting-started/licensing/license-key-and-activation#license-key-types Read more about license key types}.
				 *
				 * @error license-key-trial-limit
				 */ throw new CKEditorError('license-key-trial-limit');
            }
            if (reason == 'developmentLimit') {
                /**
				 * You have exceeded the operation limit for your development license key within the editor.
				 * Please restart the editor to continue using it.
				 * {@glink getting-started/licensing/license-key-and-activation#license-key-types Read more about license key types}.
				 *
				 * @error license-key-development-limit
				 */ throw new CKEditorError('license-key-development-limit');
            }
            if (reason == 'usageLimit') {
                /**
				 * You have reached the usage limit of your license key. This can occur in the following situations:
				 *
				 * * You are on a free subscription without a connected payment method and have exceeded the allowed usage threshold.
				 * * Your account has overdue invoices and the grace period has ended.
				 *
				 * To extend the limit and restore access, please update the required details in the
				 * [Customer Portal](https://portal.ckeditor.com) or
				 * [contact our customer support](https://ckeditor.com/contact).
				 *
				 * @error license-key-usage-limit
				 */ throw new CKEditorError('license-key-usage-limit');
            }
            if (reason == 'distributionChannel') {
                /**
				 * Your license does not allow the current distribution channel.
				 *
				 * These are the available distribution channels:
				 * * Self-hosted - the editor is installed via npm or from a ZIP package
				 * * Cloud - the editor is run from CDN
				 *
				 * The licenses available include:
				 * * GPL license for open-source users.
				 * * Commercial plans (Cloud or sales-assisted).
				 *
				 * The relation between distribution channels and licenses works as follows:
				 * * With the 'GPL' license key, you may use the editor installed via npm or a ZIP package (self-hosted).
				 * * With the CKEditor Cloud plans, you may use the editor via our CDN.
				 * * With the CKEditor Custom plans, depending on your plan details, you can use the editor via npm
				 *   or a ZIP package (self-hosted) or Cloud (CDN).
				 *
				 * {@glink getting-started/licensing/usage-based-billing#key-terms Read more about distributions in the documentation}.
				 * Please verify your installation or [contact support](https://ckeditor.com/contact/) for assistance.
				 * Should you need to migrate your installation from npm to CDN, please refer to our
				 * [dedicated migration guides](https://ckeditor.com/docs/ckeditor5/latest/updating/migrations/vanilla-js.html).
				 *
				 * @error license-key-invalid-distribution-channel
				 */ throw new CKEditorError('license-key-invalid-distribution-channel');
            }
        }, 0);
        this._showLicenseError = ()=>{};
    }
    /**
	 * This part of the code is _not_ executed in installations under the GPL license (with `config.licenseKey = 'GPL'`).
	 *
	 * It is only executed when a specific license key is provided. If you are uncertain whether
	 * this applies to your installation, please contact our support team.
	 */ async _sendUsageRequest(endpoint, request) {
        const headers = new Headers({
            'Content-Type': 'application/json'
        });
        const response = await fetch(new URL(endpoint), {
            method: 'POST',
            headers,
            body: JSON.stringify(request)
        });
        if (!response.ok) {
            // TODO: refine message.
            throw new Error(`HTTP Response: ${response.status}`);
        }
        return response.json();
    }
}
function collectUsageData(editor) {
    const collectedData = getEditorUsageData(editor);
    function setUsageData(path, value) {
        if (get(collectedData, path) !== undefined) {
            /**
			 * The error thrown when trying to set the usage data path that was already set.
			 * Make sure that you are not setting the same path multiple times.
			 *
			 * @error editor-usage-data-path-already-set
			 * @param {string} path The path that was already set.
			 */ throw new CKEditorError('editor-usage-data-path-already-set', {
                path
            });
        }
        set(collectedData, path, value);
    }
    editor.fire('collectUsageData', {
        setUsageData
    });
    return collectedData;
}
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
 */  /**
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

/**
 * Checks if the editor is initialized on a `<textarea>` element that belongs to a form. If yes, it updates the editor's element
 * content before submitting the form.
 *
 * This helper requires the {@link module:core/editor/utils/elementapimixin~ElementApi ElementApi interface}.
 *
 * @param editor Editor instance.
 */ function attachToForm(editor) {
    if (!isFunction(editor.updateSourceElement)) {
        /**
		 * The editor passed to `attachToForm()` must implement the
		 * {@link module:core/editor/utils/elementapimixin~ElementApi} interface.
		 *
		 * @error attachtoform-missing-elementapi-interface
		 */ throw new CKEditorError('attachtoform-missing-elementapi-interface', editor);
    }
    const sourceElement = editor.sourceElement;
    // Only when replacing a textarea which is inside of a form element.
    if (isTextArea(sourceElement) && sourceElement.form) {
        let originalSubmit;
        const form = sourceElement.form;
        const onSubmit = ()=>editor.updateSourceElement();
        // Replace the original form#submit() to call a custom submit function first.
        // Check if #submit is a function because the form might have an input named "submit".
        if (isFunction(form.submit)) {
            originalSubmit = form.submit;
            form.submit = ()=>{
                onSubmit();
                originalSubmit.apply(form);
            };
        }
        // Update the replaced textarea with data before each form#submit event.
        form.addEventListener('submit', onSubmit);
        // Remove the submit listener and revert the original submit method on
        // editor#destroy.
        editor.on('destroy', ()=>{
            form.removeEventListener('submit', onSubmit);
            if (originalSubmit) {
                form.submit = originalSubmit;
            }
        });
    }
}
function isTextArea(sourceElement) {
    return !!sourceElement && sourceElement.tagName.toLowerCase() === 'textarea';
}

/**
 * Implementation of the {@link module:core/editor/utils/elementapimixin~ElementApi}.
 */ function ElementApiMixin(base) {
    class Mixin extends base {
        sourceElement;
        updateSourceElement(data) {
            if (!this.sourceElement) {
                /**
				 * Cannot update the source element of a detached editor.
				 *
				 * The {@link module:core/editor/utils/elementapimixin~ElementApi#updateSourceElement `updateSourceElement()`}
				 * method cannot be called if you did not pass an element to `Editor.create()`.
				 *
				 * @error editor-missing-sourceelement
				 */ throw new CKEditorError('editor-missing-sourceelement', this);
            }
            const shouldUpdateSourceElement = this.config.get('updateSourceElementOnDestroy');
            const isSourceElementTextArea = this.sourceElement instanceof HTMLTextAreaElement;
            // The data returned by the editor might be unsafe, so we want to prevent rendering
            // unsafe content inside the source element different than <textarea>, which is considered
            // secure. This behavior could be changed by setting the `updateSourceElementOnDestroy`
            // configuration option to `true`.
            if (!shouldUpdateSourceElement && !isSourceElementTextArea) {
                setDataInElement(this.sourceElement, '');
                return;
            }
            const dataToSet = typeof data === 'string' ? data : this.data.get();
            setDataInElement(this.sourceElement, dataToSet);
        }
    }
    return Mixin;
}

/**
 * Marks the source element on which the editor was initialized. This prevents other editor instances from using this element.
 *
 * Running multiple editor instances on the same source element causes various issues and it is
 * crucial this helper is called as soon as the source element is known to prevent collisions.
 *
 * @param editor Editor instance.
 * @param sourceElement Element to bind with the editor instance.
 */ function secureSourceElement(editor, sourceElement) {
    if (sourceElement.ckeditorInstance) {
        /**
		 * A DOM element used to create the editor (e.g.
		 * {@link module:editor-inline/inlineeditor~InlineEditor.create `InlineEditor.create()`})
		 * has already been used to create another editor instance. Make sure each editor is
		 * created with a unique DOM element.
		 *
		 * @error editor-source-element-already-used
		 * @param {HTMLElement} element DOM element that caused the collision.
		 */ throw new CKEditorError('editor-source-element-already-used', editor);
    }
    sourceElement.ckeditorInstance = editor;
    editor.once('destroy', ()=>{
        delete sourceElement.ckeditorInstance;
    });
}

/**
 * The list of pending editor actions.
 *
 * This plugin should be used to synchronise plugins that execute long-lasting actions
 * (e.g. file upload) with the editor integration. It gives the developer who integrates the editor
 * an easy way to check if there are any actions pending whenever such information is needed.
 * All plugins that register a pending action also provide a message about the action that is ongoing
 * which can be displayed to the user. This lets them decide if they want to interrupt the action or wait.
 *
 * Adding and updating a pending action:
 *
 * ```ts
 * const pendingActions = editor.plugins.get( 'PendingActions' );
 * const action = pendingActions.add( 'Upload in progress: 0%.' );
 *
 * // You can update the message:
 * action.message = 'Upload in progress: 10%.';
 * ```
 *
 * Removing a pending action:
 *
 * ```ts
 * const pendingActions = editor.plugins.get( 'PendingActions' );
 * const action = pendingActions.add( 'Unsaved changes.' );
 *
 * pendingActions.remove( action );
 * ```
 *
 * Getting pending actions:
 *
 * ```ts
 * const pendingActions = editor.plugins.get( 'PendingActions' );
 *
 * const action1 = pendingActions.add( 'Action 1' );
 * const action2 = pendingActions.add( 'Action 2' );
 *
 * pendingActions.first; // Returns action1
 * Array.from( pendingActions ); // Returns [ action1, action2 ]
 * ```
 *
 * This plugin is used by features like {@link module:upload/filerepository~FileRepository} to register their ongoing actions
 * and by features like {@link module:autosave/autosave~Autosave} to detect whether there are any ongoing actions.
 * Read more about saving the data in the
 * {@glink getting-started/setup/getting-and-setting-data Saving and getting data} guide.
 */ class PendingActions extends ContextPlugin {
    /**
	 * A list of pending actions.
	 */ _actions;
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'PendingActions';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        this.set('hasAny', false);
        this._actions = new Collection({
            idProperty: '_id'
        });
        this._actions.delegate('add', 'remove').to(this);
    }
    /**
	 * Adds an action to the list of pending actions.
	 *
	 * This method returns an action object with an observable message property.
	 * The action object can be later used in the {@link #remove} method. It also allows you to change the message.
	 *
	 * @param message The action message.
	 * @returns An observable object that represents a pending action.
	 */ add(message) {
        if (typeof message !== 'string') {
            /**
			 * The message must be a string.
			 *
			 * @error pendingactions-add-invalid-message
			 */ throw new CKEditorError('pendingactions-add-invalid-message', this);
        }
        const action = new (ObservableMixin())();
        action.set('message', message);
        this._actions.add(action);
        this.hasAny = true;
        return action;
    }
    /**
	 * Removes an action from the list of pending actions.
	 *
	 * @param action An action object.
	 */ remove(action) {
        this._actions.remove(action);
        this.hasAny = !!this._actions.length;
    }
    /**
	 * Returns the first action from the list or null if the list is empty
	 *
	 * @returns The pending action object.
	 */ get first() {
        return this._actions.get(0);
    }
    /**
	 * Iterable interface.
	 */ [Symbol.iterator]() {
        return this._actions[Symbol.iterator]();
    }
}

export { Accessibility, Command, CommandCollection, Context, ContextPlugin, EditingKeystrokeHandler, Editor, ElementApiMixin, MultiCommand, PendingActions, Plugin, DEFAULT_GROUP_ID as _DEFAULT_ACCESSIBILITY_GROUP_ID, getEditorUsageData as _getEditorUsageData, attachToForm, secureSourceElement };
//# sourceMappingURL=index.js.map
