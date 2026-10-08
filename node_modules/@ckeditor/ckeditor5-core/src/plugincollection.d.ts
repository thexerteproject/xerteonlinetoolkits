/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import type { LoadedPlugins, PluginClassConstructor, PluginConstructor, PluginInterface } from './plugin.js';
declare const PluginCollection_base: {
    new (): import("@ckeditor/ckeditor5-utils").Emitter;
    prototype: import("@ckeditor/ckeditor5-utils").Emitter;
};
/**
 * Manages a list of CKEditor plugins, including loading, resolving dependencies and initialization.
 */
export declare class PluginCollection<TContext extends object> extends /* #__PURE__ */ PluginCollection_base implements Iterable<PluginEntry<TContext>> {
    private _context;
    private _plugins;
    /**
     * A map of plugin constructors that can be retrieved by their names.
     */
    private _availablePlugins;
    /**
     * Map of {@link module:core/contextplugin~ContextPlugin context plugins} which can be retrieved by their constructors or instances.
     */
    private _contextPlugins;
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
     */
    constructor(context: TContext, availablePlugins?: Iterable<PluginConstructor<TContext>>, contextPlugins?: Iterable<PluginEntry<TContext>>);
    /**
     * Iterable interface.
     *
     * Returns `[ PluginConstructor, pluginInstance ]` pairs.
     */
    [Symbol.iterator](): IterableIterator<PluginEntry<TContext>>;
    get<TConstructor extends PluginClassConstructor<TContext>>(key: TConstructor): InstanceType<TConstructor>;
    get<TName extends string>(key: TName): PluginsMap[TName];
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
     */
    has(key: PluginConstructor<TContext> | string): boolean;
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
     */
    init(plugins: ReadonlyArray<PluginConstructor<TContext> | string>, pluginsToRemove?: ReadonlyArray<PluginConstructor<TContext> | string>, pluginsSubstitutions?: ReadonlyArray<PluginConstructor<TContext>>): Promise<LoadedPlugins>;
    /**
     * Destroys all loaded plugins.
     */
    destroy(): Promise<unknown>;
    /**
     * Adds the plugin to the collection. Exposed mainly for testing purposes.
     *
     * @param PluginConstructor The plugin constructor.
     * @param plugin The instance of the plugin.
     */
    private _add;
}
/**
 * A `[ PluginConstructor, pluginInstance ]` pair.
 */
export type PluginEntry<TContext> = [PluginConstructor<TContext>, PluginInterface];
/**
 * Helper type that maps plugin names to their types.
 * It is meant to be extended with module augmentation.
 *
 * ```ts
 * class MyPlugin extends Plugin {
 * 	public static pluginName() {
 * 		return 'MyPlugin' as const;
 * 	}
 * }
 *
 * declare module '@ckeditor/ckeditor5-core' {
 * 	interface PluginsMap {
 * 		[ MyPlugin.pluginName ]: MyPlugin;
 * 	}
 * }
 *
 * // Returns `MyPlugin`.
 * const myPlugin = editor.plugins.get( 'MyPlugin' );
 * ```
 */
export interface PluginsMap {
    [name: string]: PluginInterface;
}
export {};
