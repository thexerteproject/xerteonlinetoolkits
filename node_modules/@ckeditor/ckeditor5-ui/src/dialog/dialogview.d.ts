/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/dialog/dialogview
 */
import { KeystrokeHandler, FocusTracker, Rect, type Locale, type DecoratedMethodEvent, type KeystrokeHandlerOptions } from '@ckeditor/ckeditor5-utils';
import { ViewCollection } from '../viewcollection.js';
import { View } from '../view.js';
import { FormHeaderView } from '../formheader/formheaderview.js';
import { ButtonView } from '../button/buttonview.js';
import { type DraggableView } from '../bindings/draggableviewmixin.js';
import { DialogActionsView, type DialogActionButtonDefinition } from './dialogactionsview.js';
import { DialogContentView } from './dialogcontentview.js';
import { type EditorUI } from '../editorui/editorui.js';
import '../../theme/components/dialog/dialog.css';
/**
 * Available dialog view positions:
 *
 * * `DialogViewPosition.SCREEN_CENTER` &ndash; A fixed position in the center of the screen.
 * * `DialogViewPosition.EDITOR_CENTER` &ndash; A dynamic position in the center of the editor editable area.
 * * `DialogViewPosition.EDITOR_TOP_SIDE` &ndash; A dynamic position at the top-right (for the left-to-right languages)
 * or top-left (for right-to-left languages) corner of the editor editable area.
 * * `DialogViewPosition.EDITOR_TOP_CENTER` &ndash; A dynamic position at the top-center of the editor editable area.
 * * `DialogViewPosition.EDITOR_BOTTOM_CENTER` &ndash; A dynamic position at the bottom-center of the editor editable area.
 * * `DialogViewPosition.EDITOR_ABOVE_CENTER` &ndash; A dynamic position centered above the editor editable area.
 * * `DialogViewPosition.EDITOR_BELOW_CENTER` &ndash; A dynamic position centered below the editor editable area.
 *
 * The position of a dialog is specified by a {@link module:ui/dialog/dialog~DialogDefinition#position `position` property} of a
 * definition passed to the {@link module:ui/dialog/dialog~Dialog#show} method.
 */
export declare const DialogViewPosition: {
    readonly SCREEN_CENTER: "screen-center";
    readonly EDITOR_CENTER: "editor-center";
    readonly EDITOR_TOP_SIDE: "editor-top-side";
    readonly EDITOR_TOP_CENTER: "editor-top-center";
    readonly EDITOR_BOTTOM_CENTER: "editor-bottom-center";
    readonly EDITOR_ABOVE_CENTER: "editor-above-center";
    readonly EDITOR_BELOW_CENTER: "editor-below-center";
};
declare const DialogView_base: import("@ckeditor/ckeditor5-utils").Mixed<typeof View, DraggableView>;
/**
 * A dialog view class.
 */
export declare class DialogView extends /* #__PURE__ */ DialogView_base implements DraggableView {
    /**
     * A collection of the child views inside of the dialog.
     * A dialog can have 3 optional parts: header, content, and actions.
     */
    readonly parts: ViewCollection;
    /**
     * A header view of the dialog. It is also a drag handle of the dialog.
     */
    headerView?: FormHeaderView;
    /**
     * A close button view. It is automatically added to the header view if present.
     */
    closeButtonView?: ButtonView;
    /**
     * A view with the action buttons available to the user.
     */
    actionsView?: DialogActionsView;
    /**
     * A default dialog element offset from the reference element (e.g. editor editable area).
     */
    static defaultOffset: number;
    /**
     * A view with the dialog content.
     */
    contentView?: DialogContentView;
    /**
     * A keystroke handler instance.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * A focus tracker instance.
     */
    readonly focusTracker: FocusTracker;
    /**
     * A flag indicating if the dialog was moved manually. If so, its position
     * will not be updated automatically upon window resize or document scroll.
     */
    wasMoved: boolean;
    /**
     * A flag indicating if this dialog view is a modal.
     *
     * @observable
     */
    isModal: boolean;
    /**
     * A label for the view dialog element to be used by the assistive technologies.
     *
     * @observable
     */
    ariaLabel: string;
    /**
     * A custom class name to be added to the dialog element.
     *
     * @observable
     */
    className: string | undefined;
    /**
     * The position of the dialog view.
     *
     * If set to a function, it will be called with the DOM root Rect and the dialog Rect as arguments.
     * It should return the coordinates of the dialog's position.
     *
     * @observable
     */
    position: typeof DialogViewPosition[keyof typeof DialogViewPosition] | null | ((dialogRect: Rect, domRootRect?: Rect | null) => {
        left: number;
        top: number;
    } | null);
    /**
     * A flag indicating that the dialog should be shown. Once set to `true`, the dialog will be shown
     * after its position is calculated. Until then, the dialog is transparent and not visible.
     *
     * See {@link #_isTransparent} property.
     *
     * @observable
     * @internal
     */
    _isVisible: boolean;
    /**
     * A flag indicating if a dialog is transparent. It is used to prevent the dialog from being visible
     * before its position is calculated.
     *
     * @observable
     * @internal
     */
    _isTransparent: boolean;
    /**
     * The calculated dialog `top` CSS property used for positioning.
     *
     * @observable
     * @internal
     */
    _top: number;
    /**
     * The calculated dialog `left` CSS property used for positioning.
     *
     * @observable
     * @internal
     */
    _left: number;
    /**
     * A callback returning the DOM root that requested the dialog.
     */
    private _getCurrentDomRoot;
    /**
     * A callback returning the configured editor viewport offset.
     */
    private _getViewportOffset;
    /**
     * The list of the focusable elements inside the dialog view.
     */
    private readonly _focusables;
    /**
     * The focus cycler instance.
     */
    private readonly _focusCycler;
    /**
     * @inheritDoc
     */
    constructor(locale: Locale, { getCurrentDomRoot, getViewportOffset, keystrokeHandlerOptions }: {
        getCurrentDomRoot: () => HTMLElement;
        getViewportOffset: () => EditorUI['viewportOffset'];
        keystrokeHandlerOptions?: KeystrokeHandlerOptions;
    });
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * Returns the element that should be used as a drag handle.
     */
    get dragHandleElement(): HTMLElement | null;
    /**
     * Creates the dialog parts. Which of them are created depends on the arguments passed to the method.
     * There are no rules regarding the dialog construction, that is, no part is mandatory.
     * Each part can only be created once.
     *
     * @internal
     */
    setupParts({ icon, title, hasCloseButton, content, actionButtons }: {
        icon?: string;
        title?: string;
        hasCloseButton?: boolean;
        content?: View | Array<View>;
        actionButtons?: Array<DialogActionButtonDefinition>;
    }): void;
    /**
     * Focuses the first focusable element inside the dialog.
     */
    focus(): void;
    /**
     * Normalizes the passed coordinates to make sure the dialog view
     * is displayed within the visible viewport and moves it there.
     *
     * @internal
     */
    moveTo(left: number, top: number): void;
    /**
     * Moves the dialog to the specified coordinates.
     */
    private _moveTo;
    /**
     * Moves the dialog by the specified offset.
     *
     * @internal
     */
    moveBy(left: number, top: number): void;
    /**
     * Moves the dialog view to the off-screen position.
     * Used when there is no space to display the dialog.
     */
    private _moveOffScreen;
    /**
     * Recalculates the dialog according to the set position and viewport,
     * and moves it to the new position.
     */
    updatePosition(): void;
    /**
     * Calculates the visible DOM root part.
     */
    private _getVisibleDomRootRect;
    /**
     * Calculates the dialog element rect.
     */
    private _getDialogRect;
    /**
     * Returns a viewport `Rect` shrunk by the viewport offset config from all sides.
     */
    private _getViewportRect;
    /**
     * Collects all focusable elements inside the dialog parts
     * and adds them to the focus tracker and focus cycler.
     */
    private _updateFocusCyclableItems;
    /**
     * Creates the close button view that is displayed in the header view corner.
     */
    private _createCloseButton;
}
/**
 * An event fired when the dialog is closed.
 *
 * @eventName ~DialogView#close
 */
export type DialogViewCloseEvent = {
    name: 'close';
    args: [{
        source: 'closeButton' | 'escKeyPress';
    }];
};
/**
 * An event fired when the dialog is moved.
 *
 * @eventName ~DialogView#moveTo
 */
export type DialogViewMoveToEvent = DecoratedMethodEvent<DialogView, 'moveTo'>;
export {};
