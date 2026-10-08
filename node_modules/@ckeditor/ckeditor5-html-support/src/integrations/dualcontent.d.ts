/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { DataFilter } from '../datafilter.js';
/**
 * Provides the General HTML Support integration for elements which can behave like sectioning element (e.g. article) or
 * element accepting only inline content (e.g. paragraph).
 *
 * The distinction between this two content models is important for choosing correct schema model and proper content conversion.
 * As an example, it ensures that:
 *
 * * children elements paragraphing is enabled for sectioning elements only,
 * * element and its content can be correctly handled by editing view (splitting and merging elements),
 * * model element HTML is semantically correct and easier to work with.
 *
 * If element contains any block element, it will be treated as a sectioning element and registered using
 * {@link module:html-support/dataschema~HtmlSupportDataSchemaDefinition#model} and
 * {@link module:html-support/dataschema~HtmlSupportDataSchemaDefinition#modelSchema} in editor schema.
 * Otherwise, it will be registered under
 * {@link module:html-support/dataschema~HtmlSupportDataSchemaBlockElementDefinition#paragraphLikeModel} model
 * name with model schema accepting only inline content (inheriting from `$block`).
 */
export declare class DualContentModelElementSupport extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof DataFilter];
    /**
     * @inheritDoc
     */
    static get pluginName(): "DualContentModelElementSupport";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Checks whether the given view element includes any other block element.
     */
    private _hasBlockContent;
    /**
     * Adds attribute filtering conversion for the given data schema.
     */
    private _addAttributeConversion;
}
