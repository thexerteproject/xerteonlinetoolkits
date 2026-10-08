/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module utils/config
 */
import { isPlainObject, isElement, cloneDeepWith } from 'es-toolkit/compat';
/**
 * Handles a configuration dictionary.
 *
 * @typeParam Cfg A type of the configuration dictionary.
 */
export class Config {
    /**
     * Store for the whole configuration.
     */
    _config;
    /**
     * Creates an instance of the {@link ~Config} class.
     *
     * @param configurations The initial configurations to be set. Usually, provided by the user.
     * @param defaultConfigurations The default configurations. Usually, provided by the system.
     */
    constructor(configurations, defaultConfigurations) {
        this._config = Object.create(null);
        // Set default configuration.
        if (defaultConfigurations) {
            // Clone the configuration to make sure that the properties will not be shared
            // between editors and make the watchdog feature work correctly.
            this.define(cloneConfig(defaultConfigurations));
        }
        // Set initial configuration.
        if (configurations) {
            this._setObjectToTarget(this._config, configurations);
        }
    }
    set(name, value) {
        this._setToTarget(this._config, name, value);
    }
    define(name, value) {
        const isDefine = true;
        this._setToTarget(this._config, name, value, isDefine);
    }
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
    get(name) {
        return this._getFromSource(this._config, name);
    }
    /**
     * Iterates over all top level configuration names.
     */
    *names() {
        for (const name of Object.keys(this._config)) {
            yield name;
        }
    }
    /**
     * Saves passed configuration to the specified target (nested object).
     *
     * @param target Nested config object.
     * @param name The configuration name or an object from which take properties as
     * configuration entries. Configuration names are case-sensitive.
     * @param value The configuration value. Used if a name is passed.
     * @param isDefine Define if passed configuration should overwrite existing one.
     */
    _setToTarget(target, name, value, isDefine = false) {
        // In case of an object, iterate through it and call `_setToTarget` again for each property.
        if (isPlainObject(name)) {
            this._setObjectToTarget(target, name, isDefine);
            return;
        }
        // The configuration name should be split into parts if it has dots. E.g. `resize.width` -> [`resize`, `width`].
        const parts = name.split('.');
        // Take the name of the configuration out of the parts. E.g. `resize.width` -> `width`.
        name = parts.pop();
        // Iterate over parts to check if currently stored configuration has proper structure.
        for (const part of parts) {
            // If there is no object for specified part then create one.
            if (!isPlainObject(target[part])) {
                target[part] = Object.create(null);
            }
            // Nested object becomes a target.
            target = target[part];
        }
        // In case of value is an object.
        if (isPlainObject(value)) {
            // We take care of proper config structure.
            if (!isPlainObject(target[name])) {
                target[name] = Object.create(null);
            }
            target = target[name];
            // And iterate through this object calling `_setToTarget` again for each property.
            this._setObjectToTarget(target, value, isDefine);
            return;
        }
        // Do nothing if we are defining configuration for non empty name.
        if (isDefine && typeof target[name] != 'undefined') {
            return;
        }
        target[name] = value;
    }
    /**
     * Get specified configuration from specified source (nested object).
     *
     * @param source level of nested object.
     * @param name The configuration name. Configuration names are case-sensitive.
     * @returns The configuration value or `undefined` if the configuration entry was not found.
     */
    _getFromSource(source, name) {
        // The configuration name should be split into parts if it has dots. E.g. `resize.width` -> [`resize`, `width`].
        const parts = name.split('.');
        // Take the name of the configuration out of the parts. E.g. `resize.width` -> `width`.
        name = parts.pop();
        // Iterate over parts to check if currently stored configuration has proper structure.
        for (const part of parts) {
            if (!isPlainObject(source[part])) {
                source = null;
                break;
            }
            // Nested object becomes a source.
            source = source[part];
        }
        // Always returns undefined for non existing configuration.
        return source ? cloneConfig(source[name]) : undefined;
    }
    /**
     * Iterates through passed object and calls {@link #_setToTarget} method with object key and value for each property.
     *
     * @param target Nested config object.
     * @param configuration Configuration data set
     * @param isDefine Defines if passed configuration is default configuration or not.
     */
    _setObjectToTarget(target, configuration, isDefine) {
        Object.keys(configuration).forEach(key => {
            this._setToTarget(target, key, configuration[key], isDefine);
        });
    }
}
/**
 * Clones configuration object or value.
 */
function cloneConfig(source) {
    return cloneDeepWith(source, leaveItemReferences);
}
/**
 * A customized function for cloneDeepWith.
 * In case if it's a DOM Element it will leave references to DOM Elements instead of cloning them.
 * If it's a function it will leave reference to actuall function.
 */
function leaveItemReferences(value) {
    return isElement(value) || typeof value === 'function' ? value : undefined;
}
