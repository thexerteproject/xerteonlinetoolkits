/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * Handles a configuration dictionary.
 *
 * @typeParam Cfg A type of the configuration dictionary.
 */
export declare class Config<Cfg> {
    /**
     * Store for the whole configuration.
     */
    private readonly _config;
    /**
     * Creates an instance of the {@link ~Config} class.
     *
     * @param configurations The initial configurations to be set. Usually, provided by the user.
     * @param defaultConfigurations The default configurations. Usually, provided by the system.
     */
    constructor(configurations?: Partial<Cfg>, defaultConfigurations?: Partial<Cfg>);
    /**
     * Set configuration values.
     *
     * It also accepts setting a "deep configuration" by using dots in the name. For example, `'resize.width'` sets
     * the value for the `width` configuration in the `resize` subset.
     *
     * ```ts
     * config.set( 'resize.width', 500 );
     * ```
     *
     * It accepts both a name/value pair or an object, which properties and values will be used to set
     * configurations. See {@link #set:CONFIG_OBJECT}.
     *
     * @label KEY_VALUE
     * @param name The configuration name. Configuration names are case-sensitive.
     * @param value The configuration value.
     */
    set<K extends string>(name: K, value: GetSubConfig<Cfg, K>): void;
    /**
     * Set configuration values.
     *
     * It accepts an object, which properties and values will be used to set configurations.
     *
     * ```ts
     * config.set( {
     * 	width: 500
     * 	toolbar: {
     * 		collapsed: true
     * 	}
     * } );
     *
     * // Equivalent to:
     * config.set( 'width', 500 );
     * config.set( 'toolbar.collapsed', true );
     * ```
     *
     * Passing an object as the value will amend the configuration, not replace it.
     *
     * ```ts
     * config.set( 'toolbar', {
     * 	collapsed: true,
     * } );
     *
     * config.set( 'toolbar', {
     * 	color: 'red',
     * } );
     *
     * config.get( 'toolbar.collapsed' ); // true
     * config.get( 'toolbar.color' ); // 'red'
     * ```
     *
     * It accepts both a name/value pair or an object, which properties and values will be used to set
     * configurations. See {@link #set:KEY_VALUE}.
     *
     * @label CONFIG_OBJECT
     * @param config The configuration object from which take properties as
     * configuration entries. Configuration names are case-sensitive.
     */
    set(config: Partial<Cfg>): void;
    /**
     * Does exactly the same as {@link #set:KEY_VALUE} with one exception – passed configuration extends
     * existing one, but does not overwrite already defined values.
     *
     * This method is supposed to be called by plugin developers to setup plugin's configurations. It would be
     * rarely used for other needs.
     *
     * @label KEY_VALUE
     * @param name The configuration name. Configuration names are case-sensitive.
     * @param value The configuration value.
     */
    define<K extends string>(name: K, value: GetSubConfig<Cfg, K>): void;
    /**
     * Does exactly the same as {@link #set:CONFIG_OBJECT} with one exception – passed configuration extends
     * existing one, but does not overwrite already defined values.
     *
     * This method is supposed to be called by plugin developers to setup plugin's configurations. It would be
     * rarely used for other needs.
     *
     * @label CONFIG_OBJECT
     * @param config The configuration object from which take properties as
     * configuration entries. Configuration names are case-sensitive.
     */
    define(config: Partial<Cfg>): void;
    /**
     * Gets the value for a configuration entry.
     *
     * ```ts
     * config.get( 'name' );
     * ```
     *
     * Deep configurations can be retrieved by separating each part with a dot.
     *
     * ```ts
     * config.get( 'toolbar.collapsed' );
     * ```
     *
     * @param name The configuration name. Configuration names are case-sensitive.
     * @returns The configuration value or `undefined` if the configuration entry was not found.
     */
    get<K extends string>(name: K): GetSubConfig<Cfg, K> | undefined;
    /**
     * Iterates over all top level configuration names.
     */
    names(): Iterable<string>;
    /**
     * Saves passed configuration to the specified target (nested object).
     *
     * @param target Nested config object.
     * @param name The configuration name or an object from which take properties as
     * configuration entries. Configuration names are case-sensitive.
     * @param value The configuration value. Used if a name is passed.
     * @param isDefine Define if passed configuration should overwrite existing one.
     */
    private _setToTarget;
    /**
     * Get specified configuration from specified source (nested object).
     *
     * @param source level of nested object.
     * @param name The configuration name. Configuration names are case-sensitive.
     * @returns The configuration value or `undefined` if the configuration entry was not found.
     */
    private _getFromSource;
    /**
     * Iterates through passed object and calls {@link #_setToTarget} method with object key and value for each property.
     *
     * @param target Nested config object.
     * @param configuration Configuration data set
     * @param isDefine Defines if passed configuration is default configuration or not.
     */
    private _setObjectToTarget;
}
/**
 * An utility type excluding primitive values and arrays from the union.
 */
export type OnlyObject<T> = Exclude<T, undefined | null | string | number | boolean | Array<any>>;
/**
 * An utility type extracting configuration value from the given name.
 *
 * @typeParam T The type of a configuration dictionary.
 * @typeParam K The literal type of configuration name (dot-separated path).
 */
export type GetSubConfig<T, K> = K extends keyof T ? T[K] : K extends `${infer K1}.${infer K2}` ? K1 extends keyof T ? GetSubConfig<OnlyObject<T[K1]>, K2> : unknown : unknown;
