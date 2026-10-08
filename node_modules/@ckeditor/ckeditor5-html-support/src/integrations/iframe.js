/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { DataFilter } from '../datafilter.js';
/**
 * Provides the General HTML Support integration for `iframe` elements with a mandatory sandbox attribute.
 */
export class IframeElementSupport extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires() {
        return [DataFilter];
    }
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'IframeElementSupport';
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
        this.editor.config.define('htmlSupport.htmlIframeSandbox', true);
        this._setupSandboxConversion();
    }
    /**
     * Sets up the conversion to enforce the sandbox attribute on `iframe` elements.
     */
    _setupSandboxConversion() {
        const { plugins, config, conversion } = this.editor;
        const dataFilter = plugins.get(DataFilter);
        const iframeSandboxConfig = config.get('htmlSupport.htmlIframeSandbox');
        if (iframeSandboxConfig === false) {
            return;
        }
        const allowedSandboxFlags = Array.isArray(iframeSandboxConfig) ? Array.from(iframeSandboxConfig) : [];
        dataFilter.on('register:iframe', (_, definition) => {
            conversion.for('editingDowncast').add((dispatcher) => {
                dispatcher.on(`insert:${definition.model}`, (_, data, conversionApi) => {
                    const { mapper, writer } = conversionApi;
                    const viewElement = mapper.toViewElement(data.item);
                    for (const { item } of writer.createRangeOn(viewElement)) {
                        if (!item.is('element', 'iframe')) {
                            continue;
                        }
                        if (item.hasAttribute('sandbox')) {
                            // If there is an existing sandbox attribute, read and filter out disallowed values.
                            const sandboxValues = new Set();
                            const existingSandbox = item.getAttribute('sandbox');
                            for (const value of existingSandbox.trim().split(/\s+/)) {
                                if (allowedSandboxFlags.includes(value)) {
                                    sandboxValues.add(value);
                                }
                            }
                            writer.setAttribute('sandbox', Array.from(sandboxValues).join(' '), item);
                        }
                        else {
                            // If there was no existing sandbox attribute, just use the configured one.
                            writer.setAttribute('sandbox', allowedSandboxFlags.join(' '), item);
                        }
                    }
                }, { priority: 'lowest' });
            });
        });
    }
}
