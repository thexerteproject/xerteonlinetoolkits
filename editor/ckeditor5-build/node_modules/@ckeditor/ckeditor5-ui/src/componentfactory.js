/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/componentfactory
 */
import { CKEditorError } from '@ckeditor/ckeditor5-utils';
/**
 * A helper class implementing the UI component ({@link module:ui/view~View view}) factory.
 *
 * It allows functions producing specific UI components to be registered under their unique names
 * in the factory. A registered component can be then instantiated by providing its name.
 * Note that the names are case insensitive.
 *
 * ```ts
 * // The editor provides localization tools for the factory.
 * const factory = new ComponentFactory( editor );
 *
 * factory.add( 'foo', locale => new FooView( locale ) );
 * factory.add( 'bar', locale => new BarView( locale ) );
 *
 * // An instance of FooView.
 * const fooInstance = factory.create( 'foo' );
 *
 * // Names are case insensitive so this is also allowed:
 * const barInstance = factory.create( 'Bar' );
 * ```
 *
 * The {@link module:core/editor/editor~Editor#locale editor locale} is passed to the factory
 * function when {@link module:ui/componentfactory~ComponentFactory#create} is called.
 */
export class ComponentFactory {
    /**
     * The editor instance that the factory belongs to.
     */
    editor;
    /**
     * Registered component factories.
     */
    _components = new Map();
    /**
     * Creates an instance of the factory.
     *
     * @param editor The editor instance.
     */
    constructor(editor) {
        this.editor = editor;
    }
    /**
     * Returns an iterator of registered component names. Names are returned in lower case.
     */
    *names() {
        for (const value of this._components.values()) {
            yield value.originalName;
        }
    }
    /**
     * Registers a component factory function that will be used by the
     * {@link #create create} method and called with the
     * {@link module:core/editor/editor~Editor#locale editor locale} as an argument,
     * allowing localization of the {@link module:ui/view~View view}.
     *
     * @param name The name of the component.
     * @param callback The callback that returns the component.
     */
    add(name, callback) {
        this._components.set(getNormalized(name), { callback, originalName: name });
    }
    /**
     * Creates an instance of a component registered in the factory under a specific name.
     *
     * When called, the {@link module:core/editor/editor~Editor#locale editor locale} is passed to
     * the previously {@link #add added} factory function, allowing localization of the
     * {@link module:ui/view~View view}.
     *
     * @param name The name of the component.
     * @returns The instantiated component view.
     */
    create(name) {
        if (!this.has(name)) {
            /**
             * The required component is not registered in the component factory. Please make sure
             * the provided name is correct and the component has been correctly
             * {@link module:ui/componentfactory~ComponentFactory#add added} to the factory.
             *
             * @error componentfactory-item-missing
             * @param {string} name The name of the missing component.
             */
            throw new CKEditorError('componentfactory-item-missing', this, { name });
        }
        return this._components.get(getNormalized(name)).callback(this.editor.locale);
    }
    /**
     * Checks if a component of a given name is registered in the factory.
     *
     * @param name The name of the component.
     */
    has(name) {
        return this._components.has(getNormalized(name));
    }
}
/**
 * Ensures that the component name used as the key in the internal map is in lower case.
 */
function getNormalized(name) {
    return String(name).toLowerCase();
}
