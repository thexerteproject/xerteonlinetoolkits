/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module html-support/generalhtmlsupport
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { type ArrayOrItem } from 'ckeditor5/src/utils.js';
import { DataFilter } from './datafilter.js';
import { CodeBlockElementSupport } from './integrations/codeblock.js';
import { DualContentModelElementSupport } from './integrations/dualcontent.js';
import { HeadingElementSupport } from './integrations/heading.js';
import { ImageElementSupport } from './integrations/image.js';
import { MediaEmbedElementSupport } from './integrations/mediaembed.js';
import { ScriptElementSupport } from './integrations/script.js';
import { TableElementSupport } from './integrations/table.js';
import { StyleElementSupport } from './integrations/style.js';
import { ListElementSupport } from './integrations/list.js';
import { HorizontalLineElementSupport } from './integrations/horizontalline.js';
import { IframeElementSupport } from './integrations/iframe.js';
import { CustomElementSupport } from './integrations/customelement.js';
import type { ModelSelectable } from 'ckeditor5/src/engine.js';
/**
 * The General HTML Support feature.
 *
 * This is a "glue" plugin which initializes the {@link module:html-support/datafilter~DataFilter data filter} configuration
 * and features integration with the General HTML Support.
 */
export declare class GeneralHtmlSupport extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "GeneralHtmlSupport";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof DataFilter, typeof CodeBlockElementSupport, typeof DualContentModelElementSupport, typeof HeadingElementSupport, typeof ImageElementSupport, typeof MediaEmbedElementSupport, typeof ScriptElementSupport, typeof TableElementSupport, typeof StyleElementSupport, typeof ListElementSupport, typeof HorizontalLineElementSupport, typeof IframeElementSupport, typeof CustomElementSupport];
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * @inheritDoc
     */
    afterInit(): void;
    /**
     * Returns a GHS model attribute name related to a given view element name.
     *
     * @internal
     * @param viewElementName A view element name.
     */
    getGhsAttributeNameForElement(viewElementName: string): string;
    /**
     * Updates GHS model attribute for a specified view element name, so it includes the given class name.
     *
     * @internal
     * @param viewElementName A view element name.
     * @param className The css class to add.
     * @param selectable The selection or element to update.
     */
    addModelHtmlClass(viewElementName: string, className: ArrayOrItem<string>, selectable: ModelSelectable): void;
    /**
     * Updates GHS model attribute for a specified view element name, so it does not include the given class name.
     *
     * @internal
     * @param viewElementName A view element name.
     * @param className The css class to remove.
     * @param selectable The selection or element to update.
     */
    removeModelHtmlClass(viewElementName: string, className: ArrayOrItem<string>, selectable: ModelSelectable): void;
    /**
     * Updates GHS model attribute for a specified view element name, so it includes the given attribute.
     *
     * @param viewElementName A view element name.
     * @param attributes The object with attributes to set.
     * @param selectable The selection or element to update.
     */
    private setModelHtmlAttributes;
    /**
     * Updates GHS model attribute for a specified view element name, so it does not include the given attribute.
     *
     * @param viewElementName A view element name.
     * @param attributeName The attribute name (or names) to remove.
     * @param selectable The selection or element to update.
     */
    private removeModelHtmlAttributes;
    /**
     * Updates GHS model attribute for a specified view element name, so it includes a given style.
     *
     * @param viewElementName A view element name.
     * @param styles The object with styles to set.
     * @param selectable The selection or element to update.
     */
    private setModelHtmlStyles;
    /**
     * Updates GHS model attribute for a specified view element name, so it does not include a given style.
     *
     * @param viewElementName A view element name.
     * @param properties The style (or styles list) to remove.
     * @param selectable The selection or element to update.
     */
    private removeModelHtmlStyles;
}
