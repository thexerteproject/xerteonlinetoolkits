/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module editor-inline/inlineeditoruiview
 */
import { BalloonPanelView, EditorUIView, InlineEditableUIView, MenuBarView, ToolbarView } from 'ckeditor5/src/ui.js';
import { Rect, ResizeObserver, toUnit } from 'ckeditor5/src/utils.js';
import '../theme/inlineeditor.css';
const toPx = /* #__PURE__ */ toUnit('px');
/**
 * Inline editor UI view. Uses an nline editable and a floating toolbar.
 */
export class InlineEditorUIView extends EditorUIView {
    /**
     * A floating toolbar view instance.
     */
    toolbar;
    /**
     * A balloon panel view instance.
     */
    panel;
    /**
     * A set of positioning functions used by the {@link #panel} to float around
     * {@link #element editableElement}.
     *
     * The positioning functions are as follows:
     *
     * * West:
     *
     * ```
     * [ Panel ]
     * +------------------+
     * | #editableElement |
     * +------------------+
     *
     * +------------------+
     * | #editableElement |
     * |[ Panel ]         |
     * |                  |
     * +------------------+
     *
     * +------------------+
     * | #editableElement |
     * +------------------+
     * [ Panel ]
     * ```
     *
     * * East:
     *
     * ```
     *            [ Panel ]
     * +------------------+
     * | #editableElement |
     * +------------------+
     *
     * +------------------+
     * | #editableElement |
     * |         [ Panel ]|
     * |                  |
     * +------------------+
     *
     * +------------------+
     * | #editableElement |
     * +------------------+
     *            [ Panel ]
     * ```
     *
     * See: {@link module:utils/dom/position~DomOptimalPositionOptions#positions}.
     */
    panelPositions;
    /**
     * Editable UI view.
     */
    editable;
    /**
     * An instance of the resize observer that helps dynamically determine the geometry of the toolbar
     * and manage items that do not fit into a single row.
     *
     * **Note:** Created in {@link #render}.
     */
    _resizeObserver;
    /**
     * Creates an instance of the inline editor UI view.
     *
     * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
     * @param editingView The editing view instance this view is related to.
     * @param editableElement The editable element. If not specified, it will be automatically created by
     * {@link module:ui/editableui/editableuiview~EditableUIView}. Otherwise, the given element will be used.
     * @param options Configuration options for the view instance.
     * @param options.shouldToolbarGroupWhenFull When set `true` enables automatic items grouping
     * in the main {@link module:editor-inline/inlineeditoruiview~InlineEditorUIView#toolbar toolbar}.
     * See {@link module:ui/toolbar/toolbarview~ToolbarOptions#shouldGroupWhenFull} to learn more.
     * @param options.label When set, this value will be used as an accessible `aria-label` of the
     * {@link module:ui/editableui/editableuiview~EditableUIView editable view}.
     */
    constructor(locale, editingView, editableElement, options = {}) {
        super(locale);
        this.toolbar = new ToolbarView(locale, {
            shouldGroupWhenFull: options.shouldToolbarGroupWhenFull,
            isFloating: true
        });
        if (options.useMenuBar) {
            this.menuBarView = new MenuBarView(locale);
        }
        this.set('viewportTopOffset', 0);
        this.panel = new BalloonPanelView(locale);
        this.panelPositions = this._getPanelPositions();
        this.panel.extendTemplate({
            attributes: {
                class: 'ck-toolbar-container'
            }
        });
        this.editable = new InlineEditableUIView(locale, editingView, editableElement, {
            label: options.label
        });
        this._resizeObserver = null;
    }
    /**
     * @inheritDoc
     */
    render() {
        super.render();
        this.body.add(this.panel);
        this.registerChild(this.editable);
        if (this.menuBarView) {
            // Set toolbar as a child of a stickyPanel and makes toolbar sticky.
            this.panel.content.addMany([this.menuBarView, this.toolbar]);
        }
        else {
            this.panel.content.add(this.toolbar);
        }
        const options = this.toolbar.options;
        // Set toolbar's max-width on the initialization and update it on the editable resize,
        // if 'shouldToolbarGroupWhenFull' in config is set to 'true'.
        if (options.shouldGroupWhenFull) {
            const editableElement = this.editable.element;
            this._resizeObserver = new ResizeObserver(editableElement, () => {
                this.toolbar.maxWidth = toPx(new Rect(editableElement).width);
            });
        }
    }
    /**
     * @inheritDoc
     */
    destroy() {
        super.destroy();
        if (this._resizeObserver) {
            this._resizeObserver.destroy();
        }
    }
    /**
     * Determines the panel top position of the {@link #panel} in {@link #panelPositions}.
     *
     * @param editableRect Rect of the {@link #element}.
     * @param panelRect Rect of the {@link #panel}.
     */
    _getPanelPositionTop(editableRect, panelRect) {
        let top;
        if (editableRect.top > panelRect.height + this.viewportTopOffset) {
            top = editableRect.top - panelRect.height;
        }
        else if (editableRect.bottom > panelRect.height + this.viewportTopOffset + 50) {
            top = this.viewportTopOffset;
        }
        else {
            top = editableRect.bottom;
        }
        return top;
    }
    /**
     * Returns the positions for {@link #panelPositions}.
     *
     * See: {@link module:utils/dom/position~DomOptimalPositionOptions#positions}.
     */
    _getPanelPositions() {
        const positions = [
            (editableRect, panelRect) => {
                return {
                    top: this._getPanelPositionTop(editableRect, panelRect),
                    left: editableRect.left,
                    name: 'toolbar_west',
                    config: {
                        withArrow: false
                    }
                };
            },
            (editableRect, panelRect) => {
                return {
                    top: this._getPanelPositionTop(editableRect, panelRect),
                    left: editableRect.left + editableRect.width - panelRect.width,
                    name: 'toolbar_east',
                    config: {
                        withArrow: false
                    }
                };
            }
        ];
        if (this.locale.uiLanguageDirection === 'ltr') {
            return positions;
        }
        else {
            return positions.reverse();
        }
    }
}
