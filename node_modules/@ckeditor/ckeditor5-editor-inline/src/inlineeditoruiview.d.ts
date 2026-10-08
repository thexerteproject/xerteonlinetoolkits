/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module editor-inline/inlineeditoruiview
 */
import { BalloonPanelView, EditorUIView, InlineEditableUIView, ToolbarView } from 'ckeditor5/src/ui.js';
import { type PositioningFunction, type Locale } from 'ckeditor5/src/utils.js';
import type { EditingView } from 'ckeditor5/src/engine.js';
import '../theme/inlineeditor.css';
/**
 * Inline editor UI view. Uses an nline editable and a floating toolbar.
 */
export declare class InlineEditorUIView extends EditorUIView {
    /**
     * A floating toolbar view instance.
     */
    readonly toolbar: ToolbarView;
    /**
     * The offset from the top edge of the web browser's viewport which makes the
     * UI become sticky. The default value is `0`, which means that the UI becomes
     * sticky when its upper edge touches the top of the page viewport.
     *
     * This attribute is useful when the web page has UI elements positioned to the top
     * either using `position: fixed` or `position: sticky`, which would cover the
     * UI or vice–versa (depending on the `z-index` hierarchy).
     *
     * Bound to {@link module:ui/editorui/editorui~EditorUI#viewportOffset `EditorUI#viewportOffset`}.
     *
     * If {@link module:core/editor/editorconfig~EditorConfig#ui `EditorConfig#ui.viewportOffset.top`} is defined, then
     * it will override the default value.
     *
     * @observable
     * @default 0
     */
    viewportTopOffset: number;
    /**
     * A balloon panel view instance.
     */
    readonly panel: BalloonPanelView;
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
    readonly panelPositions: Array<PositioningFunction>;
    /**
     * Editable UI view.
     */
    readonly editable: InlineEditableUIView;
    /**
     * An instance of the resize observer that helps dynamically determine the geometry of the toolbar
     * and manage items that do not fit into a single row.
     *
     * **Note:** Created in {@link #render}.
     */
    private _resizeObserver;
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
    constructor(locale: Locale, editingView: EditingView, editableElement?: HTMLElement, options?: {
        shouldToolbarGroupWhenFull?: boolean;
        useMenuBar?: boolean;
        label?: string | Record<string, string>;
    });
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Determines the panel top position of the {@link #panel} in {@link #panelPositions}.
     *
     * @param editableRect Rect of the {@link #element}.
     * @param panelRect Rect of the {@link #panel}.
     */
    private _getPanelPositionTop;
    /**
     * Returns the positions for {@link #panelPositions}.
     *
     * See: {@link module:utils/dom/position~DomOptimalPositionOptions#positions}.
     */
    private _getPanelPositions;
}
