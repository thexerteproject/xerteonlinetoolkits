/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module widget/widgetresize
 */
import { WidgetResizer } from './widgetresize/resizer.js';
import { Plugin } from '@ckeditor/ckeditor5-core';
import { MouseObserver } from '@ckeditor/ckeditor5-engine';
import { DomEmitterMixin, global } from '@ckeditor/ckeditor5-utils';
import { throttle } from 'es-toolkit/compat';
import '../theme/widgetresize.css';
/**
 * The widget resize feature plugin.
 *
 * Use the {@link module:widget/widgetresize~WidgetResize#attachTo} method to create a resizer for the specified widget.
 */
export class WidgetResize extends Plugin {
    /**
     * A map of resizers created using this plugin instance.
     */
    _resizers = new Map();
    _observer;
    _redrawSelectedResizerThrottled;
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'WidgetResize';
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
        const editing = this.editor.editing;
        const domDocument = global.window.document;
        this.set('selectedResizer', null);
        this.set('_activeResizer', null);
        editing.view.addObserver(MouseObserver);
        this._observer = new (DomEmitterMixin())();
        this.listenTo(editing.view.document, 'mousedown', this._mouseDownListener.bind(this), { priority: 'high' });
        this._observer.listenTo(domDocument, 'mousemove', this._mouseMoveListener.bind(this));
        this._observer.listenTo(domDocument, 'mouseup', this._mouseUpListener.bind(this));
        this._redrawSelectedResizerThrottled = throttle(() => this.redrawSelectedResizer(), 200);
        // Redrawing on any change of the UI of the editor (including content changes).
        this.editor.ui.on('update', this._redrawSelectedResizerThrottled);
        // Remove view widget-resizer mappings for widgets that have been removed from the document.
        // https://github.com/ckeditor/ckeditor5/issues/10156
        // https://github.com/ckeditor/ckeditor5/issues/10266
        this.editor.model.document.on('change', () => {
            for (const [viewElement, resizer] of this._resizers) {
                if (!viewElement.isAttached()) {
                    this._resizers.delete(viewElement);
                    resizer.destroy();
                }
            }
        }, { priority: 'lowest' });
        // Resizers need to be redrawn upon window resize, because new window might shrink resize host.
        this._observer.listenTo(global.window, 'resize', this._redrawSelectedResizerThrottled);
        const viewSelection = this.editor.editing.view.document.selection;
        viewSelection.on('change', () => {
            const selectedElement = viewSelection.getSelectedElement();
            const resizer = this.getResizerByViewElement(selectedElement) || null;
            if (resizer) {
                this.select(resizer);
            }
            else {
                this.deselect();
            }
        });
    }
    /**
     * Redraws the selected resizer if there is any selected resizer and if it is visible.
     */
    redrawSelectedResizer() {
        if (this.selectedResizer && this.selectedResizer.isVisible) {
            this.selectedResizer.redraw();
        }
    }
    /**
     * @inheritDoc
     */
    destroy() {
        super.destroy();
        this._observer.stopListening();
        for (const resizer of this._resizers.values()) {
            resizer.destroy();
        }
        this._redrawSelectedResizerThrottled.cancel();
    }
    /**
     * Marks resizer as selected.
     */
    select(resizer) {
        this.deselect();
        this.selectedResizer = resizer;
        this.selectedResizer.isSelected = true;
    }
    /**
     * Deselects currently set resizer.
     */
    deselect() {
        if (this.selectedResizer) {
            this.selectedResizer.isSelected = false;
        }
        this.selectedResizer = null;
    }
    /**
     * @param options Resizer options.
     */
    attachTo(options) {
        const resizer = new WidgetResizer(options);
        const plugins = this.editor.plugins;
        resizer.attach();
        if (plugins.has('WidgetToolbarRepository')) {
            // Hiding widget toolbar to improve the performance
            // (https://github.com/ckeditor/ckeditor5-widget/pull/112#issuecomment-564528765).
            const widgetToolbarRepository = plugins.get('WidgetToolbarRepository');
            resizer.on('begin', () => {
                widgetToolbarRepository.forceDisabled('resize');
            }, { priority: 'lowest' });
            resizer.on('cancel', () => {
                widgetToolbarRepository.clearForceDisabled('resize');
            }, { priority: 'highest' });
            resizer.on('commit', () => {
                widgetToolbarRepository.clearForceDisabled('resize');
            }, { priority: 'highest' });
        }
        this._resizers.set(options.viewElement, resizer);
        const viewSelection = this.editor.editing.view.document.selection;
        const selectedElement = viewSelection.getSelectedElement();
        // If the element the resizer is created for is currently focused, it should become visible.
        if (this.getResizerByViewElement(selectedElement) == resizer) {
            this.select(resizer);
        }
        return resizer;
    }
    /**
     * Returns a resizer created for a given view element (widget element).
     *
     * @param viewElement View element associated with the resizer.
     */
    getResizerByViewElement(viewElement) {
        return this._resizers.get(viewElement);
    }
    /**
     * Returns a resizer that contains a given resize handle.
     */
    _getResizerByHandle(domResizeHandle) {
        for (const resizer of this._resizers.values()) {
            if (resizer.containsHandle(domResizeHandle)) {
                return resizer;
            }
        }
    }
    /**
     * @param domEventData Native DOM event.
     */
    _mouseDownListener(event, domEventData) {
        const resizeHandle = domEventData.domTarget;
        if (!WidgetResizer.isResizeHandle(resizeHandle)) {
            return;
        }
        this._activeResizer = this._getResizerByHandle(resizeHandle) || null;
        if (this._activeResizer) {
            this._activeResizer.begin(resizeHandle);
            // Do not call other events when resizing. See: #6755.
            event.stop();
            domEventData.preventDefault();
        }
    }
    /**
     * @param domEventData Native DOM event.
     */
    _mouseMoveListener(event, domEventData) {
        if (this._activeResizer) {
            this._activeResizer.updateSize(domEventData);
        }
    }
    _mouseUpListener() {
        if (this._activeResizer) {
            this._activeResizer.commit();
            this._activeResizer = null;
        }
    }
}
