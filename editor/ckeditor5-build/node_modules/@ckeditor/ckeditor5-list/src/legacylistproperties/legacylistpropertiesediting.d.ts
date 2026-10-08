/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/legacylistproperties/legacylistpropertiesediting
 */
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { LegacyListEditing } from '../legacylist/legacylistediting.js';
/**
 * The engine of the list properties feature.
 *
 * It sets the value for the `listItem` attribute of the {@link module:list/legacylist~LegacyList `<listItem>`} element that
 * allows modifying the list style type.
 *
 * It registers the `'listStyle'`, `'listReversed'` and `'listStart'` commands if they are enabled in the configuration.
 * Read more in {@link module:list/listconfig~ListPropertiesConfig}.
 */
export declare class LegacyListPropertiesEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof LegacyListEditing];
    /**
     * @inheritDoc
     */
    static get pluginName(): "LegacyListPropertiesEditing";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * @inheritDoc
     */
    afterInit(): void;
    /**
     * Starts listening to {@link module:engine/model/model~Model#deleteContent} and checks whether two lists will be merged into a single
     * one after deleting the content.
     *
     * The purpose of this action is to adjust the `listStyle`, `listReversed` and `listStart` values
     * for the list that was merged.
     *
     * Consider the following model's content:
     *
     * ```xml
     * <listItem listIndent="0" listType="bulleted" listStyle="square">UL List item 1</listItem>
     * <listItem listIndent="0" listType="bulleted" listStyle="square">UL List item 2</listItem>
     * <paragraph>[A paragraph.]</paragraph>
     * <listItem listIndent="0" listType="bulleted" listStyle="circle">UL List item 1</listItem>
     * <listItem listIndent="0" listType="bulleted" listStyle="circle">UL List item 2</listItem>
     * ```
     *
     * After removing the paragraph element, the second list will be merged into the first one.
     * We want to inherit the `listStyle` attribute for the second list from the first one.
     *
     * ```xml
     * <listItem listIndent="0" listType="bulleted" listStyle="square">UL List item 1</listItem>
     * <listItem listIndent="0" listType="bulleted" listStyle="square">UL List item 2</listItem>
     * <listItem listIndent="0" listType="bulleted" listStyle="square">UL List item 1</listItem>
     * <listItem listIndent="0" listType="bulleted" listStyle="square">UL List item 2</listItem>
     * ```
     *
     * See https://github.com/ckeditor/ckeditor5/issues/7879.
     *
     * @param attributeStrategies Strategies for the enabled attributes.
     */
    private _mergeListAttributesWhileMergingLists;
}
