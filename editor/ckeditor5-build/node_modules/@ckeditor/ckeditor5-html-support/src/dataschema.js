/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module html-support/dataschema
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { toArray } from 'ckeditor5/src/utils.js';
import { defaultConfig } from './schemadefinitions.js';
import { mergeWith } from 'es-toolkit/compat';
/**
 * Holds representation of the extended HTML document type definitions to be used by the
 * editor in HTML support.
 *
 * Data schema is represented by data schema definitions.
 *
 * To add new definition for block element,
 * use {@link module:html-support/dataschema~DataSchema#registerBlockElement} method:
 *
 * ```ts
 * dataSchema.registerBlockElement( {
 * 	view: 'section',
 * 	model: 'my-section',
 * 	modelSchema: {
 * 		inheritAllFrom: '$block'
 * 	}
 * } );
 * ```
 *
 * To add new definition for inline element,
 * use {@link module:html-support/dataschema~DataSchema#registerInlineElement} method:
 *
 * ```
 * dataSchema.registerInlineElement( {
 * 	view: 'span',
 * 	model: 'my-span',
 * 	attributeProperties: {
 * 		copyOnEnter: true
 * 	}
 * } );
 * ```
 */
export class DataSchema extends Plugin {
    /**
     * A map of registered data schema definitions.
     */
    _definitions = [];
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'DataSchema';
    }
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin() {
        return true;
    }
    /**
     * @inheritDoc
     */
    init() {
        for (const definition of defaultConfig.block) {
            this.registerBlockElement(definition);
        }
        for (const definition of defaultConfig.inline) {
            this.registerInlineElement(definition);
        }
    }
    /**
     * Add new data schema definition describing block element.
     */
    registerBlockElement(definition) {
        this._definitions.push({ ...definition, isBlock: true });
    }
    /**
     * Add new data schema definition describing inline element.
     */
    registerInlineElement(definition) {
        this._definitions.push({ ...definition, isInline: true });
    }
    /**
     * Updates schema definition describing block element with new properties.
     *
     * Creates new scheme if it doesn't exist.
     * Array properties are concatenated with original values.
     *
     * @param definition Definition update.
     */
    extendBlockElement(definition) {
        this._extendDefinition({ ...definition, isBlock: true });
    }
    /**
     * Updates schema definition describing inline element with new properties.
     *
     * Creates new scheme if it doesn't exist.
     * Array properties are concatenated with original values.
     *
     * @param definition Definition update.
     */
    extendInlineElement(definition) {
        this._extendDefinition({ ...definition, isInline: true });
    }
    /**
     * Returns all definitions matching the given view name.
     *
     * @param includeReferences Indicates if this method should also include definitions of referenced models.
     */
    getDefinitionsForView(viewName, includeReferences = false) {
        const definitions = new Set();
        for (const definition of this._getMatchingViewDefinitions(viewName)) {
            if (includeReferences) {
                for (const reference of this._getReferences(definition.model)) {
                    definitions.add(reference);
                }
            }
            definitions.add(definition);
        }
        return definitions;
    }
    /**
     * Returns definitions matching the given model name.
     */
    getDefinitionsForModel(modelName) {
        return this._definitions.filter(definition => definition.model == modelName);
    }
    /**
     * Returns definitions matching the given view name.
     */
    _getMatchingViewDefinitions(viewName) {
        return this._definitions.filter(def => def.view && testViewName(viewName, def.view));
    }
    /**
     * Resolves all definition references registered for the given data schema definition.
     *
     * @param modelName Data schema model name.
     */
    *_getReferences(modelName) {
        const inheritProperties = [
            'inheritAllFrom',
            'inheritTypesFrom',
            'allowWhere',
            'allowContentOf',
            'allowAttributesOf'
        ];
        const definitions = this._definitions.filter(definition => definition.model == modelName);
        for (const { modelSchema } of definitions) {
            if (!modelSchema) {
                continue;
            }
            for (const property of inheritProperties) {
                for (const referenceName of toArray(modelSchema[property] || [])) {
                    const definitions = this._definitions.filter(definition => definition.model == referenceName);
                    for (const definition of definitions) {
                        if (referenceName !== modelName) {
                            yield* this._getReferences(definition.model);
                            yield definition;
                        }
                    }
                }
            }
        }
    }
    /**
     * Updates schema definition with new properties.
     *
     * Creates new scheme if it doesn't exist.
     * Array properties are concatenated with original values.
     *
     * @param definition Definition update.
     */
    _extendDefinition(definition) {
        const currentDefinitions = Array.from(this._definitions.entries())
            .filter(([, currentDefinition]) => currentDefinition.model == definition.model);
        if (currentDefinitions.length == 0) {
            this._definitions.push(definition);
            return;
        }
        for (const [idx, currentDefinition] of currentDefinitions) {
            this._definitions[idx] = mergeWith({}, currentDefinition, definition, (target, source) => {
                return Array.isArray(target) ? target.concat(source) : undefined;
            });
        }
    }
}
/**
 * Test view name against the given pattern.
 */
function testViewName(pattern, viewName) {
    if (typeof pattern === 'string') {
        return pattern === viewName;
    }
    if (pattern instanceof RegExp) {
        return pattern.test(viewName);
    }
    return false;
}
