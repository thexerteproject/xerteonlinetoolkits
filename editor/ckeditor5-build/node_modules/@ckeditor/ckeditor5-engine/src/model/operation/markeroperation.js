/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/model/operation/markeroperation
 */
import { Operation } from './operation.js';
import { ModelRange } from '../range.js';
export class MarkerOperation extends Operation {
    /**
     * Marker name.
     *
     * @readonly
     */
    name;
    /**
     * Marker range before the change.
     *
     * @readonly
     */
    oldRange;
    /**
     * Marker range after the change.
     *
     * @readonly
     */
    newRange;
    /**
     * Specifies whether the marker operation affects the data produced by the data pipeline
     * (is persisted in the editor's data).
     *
     * @readonly
     */
    affectsData;
    /**
     * Marker collection on which change should be executed.
     */
    _markers;
    /**
     * @param name Marker name.
     * @param oldRange Marker range before the change.
     * @param newRange Marker range after the change.
     * @param markers Marker collection on which change should be executed.
     * @param affectsData Specifies whether the marker operation affects the data produced by the data pipeline
     * (is persisted in the editor's data).
     * @param baseVersion Document {@link module:engine/model/document~ModelDocument#version} on which operation
     * can be applied or `null` if the operation operates on detached (non-document) tree.
     */
    constructor(name, oldRange, newRange, markers, affectsData, baseVersion) {
        super(baseVersion);
        this.name = name;
        this.oldRange = oldRange ? oldRange.clone() : null;
        this.newRange = newRange ? newRange.clone() : null;
        this.affectsData = affectsData;
        this._markers = markers;
    }
    /**
     * @inheritDoc
     */
    get type() {
        return 'marker';
    }
    /**
     * @inheritDoc
     */
    get affectedSelectable() {
        const ranges = [];
        if (this.oldRange) {
            ranges.push(this.oldRange.clone());
        }
        if (this.newRange) {
            if (this.oldRange) {
                ranges.push(...this.newRange.getDifference(this.oldRange));
            }
            else {
                ranges.push(this.newRange.clone());
            }
        }
        return ranges;
    }
    /**
     * Creates and returns an operation that has the same parameters as this operation.
     */
    clone() {
        return new MarkerOperation(this.name, this.oldRange, this.newRange, this._markers, this.affectsData, this.baseVersion);
    }
    /**
     * See {@link module:engine/model/operation/operation~Operation#getReversed `Operation#getReversed()`}.
     */
    getReversed() {
        return new MarkerOperation(this.name, this.newRange, this.oldRange, this._markers, this.affectsData, this.baseVersion + 1);
    }
    /**
     * @inheritDoc
     * @internal
     */
    _execute() {
        if (this.newRange) {
            this._markers._set(this.name, this.newRange, true, this.affectsData);
        }
        else {
            this._markers._remove(this.name);
        }
    }
    /**
     * @inheritDoc
     * @internal
     */
    toJSON() {
        const json = super.toJSON();
        if (this.oldRange) {
            json.oldRange = this.oldRange.toJSON();
        }
        if (this.newRange) {
            json.newRange = this.newRange.toJSON();
        }
        delete json._markers;
        return json;
    }
    /**
     * @inheritDoc
     */
    static get className() {
        return 'MarkerOperation';
    }
    /**
     * Creates `MarkerOperation` object from deserialized object, i.e. from parsed JSON string.
     *
     * @param json Deserialized JSON object.
     * @param document Document on which this operation will be applied.
     */
    static fromJSON(json, document) {
        return new MarkerOperation(json.name, json.oldRange ? ModelRange.fromJSON(json.oldRange, document) : null, json.newRange ? ModelRange.fromJSON(json.newRange, document) : null, document.model.markers, json.affectsData, json.baseVersion);
    }
}
