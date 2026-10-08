/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/tablecaption/tablecaptionediting
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { ModelElement } from 'ckeditor5/src/engine.js';
/**
 * The table caption editing plugin.
 */
export declare class TableCaptionEditing extends Plugin {
    /**
     * A map that keeps saved JSONified table captions and table model elements they are
     * associated with.
     *
     * To learn more about this system, see {@link #_saveCaption}.
     */
    private _savedCaptionsMap;
    /**
     * A map that keeps generated ids for table captions to reuse them if the same caption is rendered again.
     */
    private _captionIdsMapping;
    /**
     * @inheritDoc
     */
    static get pluginName(): "TableCaptionEditing";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Returns the saved {@link module:engine/model/element~ModelElement#toJSON JSONified} caption
     * of a table model element.
     *
     * See {@link #_saveCaption}.
     *
     * @internal
     * @param tableModelElement The model element the caption should be returned for.
     * @returns The model caption element or `null` if there is none.
     */
    _getSavedCaption(tableModelElement: ModelElement): ModelElement | null;
    /**
     * Saves a {@link module:engine/model/element~ModelElement#toJSON JSONified} caption for
     * a table element to allow restoring it in the future.
     *
     * A caption is saved every time it gets hidden. The
     * user should be able to restore it on demand.
     *
     * **Note**: The caption cannot be stored in the table model element attribute because,
     * for instance, when the model state propagates to collaborators, the attribute would get
     * lost (mainly because it does not convert to anything when the caption is hidden) and
     * the states of collaborators' models would de-synchronize causing numerous issues.
     *
     * See {@link #_getSavedCaption}.
     *
     * @internal
     * @param tableModelElement The model element the caption is saved for.
     * @param caption The caption model element to be saved.
     */
    _saveCaption(tableModelElement: ModelElement, caption: ModelElement): void;
}
