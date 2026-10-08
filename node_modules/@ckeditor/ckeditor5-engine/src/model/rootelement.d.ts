/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/model/rootelement
 */
import { ModelElement } from './element.js';
import { type ModelDocument } from './document.js';
/**
 * Type of {@link module:engine/model/element~ModelElement} that is a root of a model tree.
 */
export declare class ModelRootElement extends ModelElement {
    /**
     * Unique root name used to identify this root element by {@link module:engine/model/document~ModelDocument}.
     */
    readonly rootName: string;
    /**
     * Document that is an owner of this root.
     */
    private readonly _document;
    /**
     * @internal
     */
    _isAttached: boolean;
    /**
     * Informs if the root element is loaded (default).
     *
     * @internal
     */
    _isLoaded: boolean;
    /**
     * Creates root element.
     *
     * @param document Document that is an owner of this root.
     * @param name Node name.
     * @param rootName Unique root name used to identify this root element by {@link module:engine/model/document~ModelDocument}.
     */
    constructor(document: ModelDocument, name: string, rootName?: string);
    /**
     * {@link module:engine/model/document~ModelDocument Document} that owns this root element.
     */
    get document(): ModelDocument;
    /**
     * Informs if the root element is currently attached to the document, or not.
     *
     * A detached root is equivalent to being removed and cannot contain any children or markers.
     *
     * By default, a newly added root is attached. It can be detached using
     * {@link module:engine/model/writer~ModelWriter#detachRoot `Writer#detachRoot`}. A detached root can be re-attached again using
     * {@link module:engine/model/writer~ModelWriter#addRoot `Writer#addRoot`}.
     */
    isAttached(): boolean;
    /**
     * Converts `RootElement` instance to `string` containing its name.
     *
     * @returns `RootElement` instance converted to `string`.
     */
    toJSON(): unknown;
}
