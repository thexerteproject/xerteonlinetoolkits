/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/panel/balloon/contextualballoon
 */
import { BalloonPanelView } from './balloonpanelview.js';
import { View } from '../../view.js';
import { ButtonView } from '../../button/buttonview.js';
import { type ViewCollection } from '../../viewcollection.js';
import { Plugin, type Editor } from '@ckeditor/ckeditor5-core';
import { FocusTracker, type Locale, type DomOptimalPositionOptions, type DecoratedMethodEvent } from '@ckeditor/ckeditor5-utils';
import '../../../theme/components/panel/balloonrotator.css';
import '../../../theme/components/panel/fakepanel.css';
/**
 * Provides the common contextual balloon for the editor.
 *
 * The role of this plugin is to unify the contextual balloons logic, simplify views management and help
 * avoid the unnecessary complexity of handling multiple {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView}
 * instances in the editor.
 *
 * This plugin allows for creating single or multiple panel stacks.
 *
 * Each stack may have multiple views, with the one on the top being visible. When the visible view is removed from the stack,
 * the previous view becomes visible.
 *
 * It might be useful to implement nested navigation in a balloon. For instance, a toolbar view may contain a link button.
 * When you click it, a link view (which lets you set the URL) is created and put on top of the toolbar view, so the link panel
 * is displayed. When you finish editing the link and close (remove) the link view, the toolbar view is visible again.
 *
 * However, there are cases when there are multiple independent balloons to be displayed, for instance, if the selection
 * is inside two inline comments at the same time. For such cases, you can create two independent panel stacks.
 * The contextual balloon plugin will create a navigation bar to let the users switch between these panel stacks using the "Next"
 * and "Previous" buttons.
 *
 * If there are no views in the current stack, the balloon panel will try to switch to the next stack. If there are no
 * panels in any stack, the balloon panel will be hidden.
 *
 * **Note**: To force the balloon panel to show only one view, even if there are other stacks, use the `singleViewMode=true` option
 * when {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon#add adding} a view to a panel.
 *
 * From the implementation point of view, the contextual ballon plugin is reusing a single
 * {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView} instance to display multiple contextual balloon
 * panels in the editor. It also creates a special {@link module:ui/panel/balloon/contextualballoon~RotatorView rotator view},
 * used to manage multiple panel stacks. Rotator view is a child of the balloon panel view and the parent of the specific
 * view you want to display. If there is more than one panel stack to be displayed, the rotator view will add a
 * navigation bar. If there is only one stack, the rotator view is transparent (it does not add any UI elements).
 */
export declare class ContextualBalloon extends Plugin {
    /**
     * The {@link module:utils/dom/position~DomOptimalPositionOptions#limiter position limiter}
     * for the {@link #view balloon}, used when no `limiter` has been passed into {@link #add}
     * or {@link #updatePosition}.
     *
     * By default, a function that obtains the farthest DOM
     * {@link module:engine/view/rooteditableelement~ViewRootEditableElement}
     * of the {@link module:engine/view/document~ViewDocument#selection}.
     */
    positionLimiter: DomOptimalPositionOptions['limiter'];
    visibleStack?: string;
    /**
     * The currently visible view or `null` when there are no views in any stack.
     *
     * @readonly
     * @observable
     */
    visibleView: View | null;
    /**
     * A total number of all stacks in the balloon.
     *
     * @private
     * @readonly
     * @observable
     */
    _numberOfStacks: number;
    /**
     * A flag that controls the single view mode.
     *
     * @private
     * @readonly
     * @observable
     */
    _singleViewMode: boolean;
    /**
     * The map of views and their stacks.
     */
    private _viewToStack;
    /**
     * The map of IDs and stacks.
     */
    private _idToStack;
    /**
     * The common balloon panel view.
     */
    private _view;
    /**
     * Rotator view embedded in the contextual balloon.
     * Displays the currently visible view in the balloon and provides navigation for switching stacks.
     */
    private _rotatorView;
    /**
     * Displays fake panels under the balloon panel view when multiple stacks are added to the balloon.
     */
    private _fakePanelsView;
    /**
     * @inheritDoc
     */
    static get pluginName(): "ContextualBalloon";
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
    destroy(): void;
    /**
     * The common balloon panel view.
     */
    get view(): BalloonPanelView;
    /**
     * Returns `true` when the given view is in one of the stacks. Otherwise returns `false`.
     */
    hasView(view: View): boolean;
    /**
     * Adds a new view to the stack and makes it visible if the current stack is visible
     * or it is the first view in the balloon.
     *
     * @param data The configuration of the view.
     * @param data.stackId The ID of the stack that the view is added to. Defaults to `'main'`.
     * @param data.view The content of the balloon.
     * @param data.position Positioning options.
     * @param data.balloonClassName An additional CSS class added to the {@link #view balloon} when visible.
     * @param data.withArrow Whether the {@link #view balloon} should be rendered with an arrow. Defaults to `true`.
     * @param data.singleViewMode Whether the view should be the only visible view even if other stacks were added. Defaults to `false`.
     */
    add(data: ViewConfiguration): void;
    /**
     * Removes the given view from the stack. If the removed view was visible,
     * the view preceding it in the stack will become visible instead.
     * When there is no view in the stack, the next stack will be displayed.
     * When there are no more stacks, the balloon will hide.
     *
     * @param view A view to be removed from the balloon.
     */
    remove(view: View): void;
    /**
     * Updates the position of the balloon using the position data of the first visible view in the stack.
     * When new position data is given, the position data of the currently visible view will be updated.
     *
     * @param position Position options.
     */
    updatePosition(position?: Partial<DomOptimalPositionOptions>): void;
    /**
     * Returns position options of the last view in the stack.
     * This keeps the balloon in the same position when the view is changed.
     */
    getPositionOptions(): Partial<DomOptimalPositionOptions> | undefined;
    /**
     * Shows the last view from the stack of a given ID.
     */
    showStack(id: string): void;
    /**
     * Initializes view instances.
     */
    private _createPanelView;
    /**
     * Returns the stack of the currently visible view.
     */
    private get _visibleStack();
    /**
     * Returns the ID of the given stack.
     */
    private _getStackId;
    /**
     * Shows the last view from the next stack.
     */
    private _showNextStack;
    /**
     * Shows the last view from the previous stack.
     */
    private _showPrevStack;
    /**
     * Creates a rotator view.
     */
    private _createRotatorView;
    /**
     * Creates a fake panels view.
     */
    private _createFakePanelsView;
    /**
     * Sets the view as the content of the balloon and attaches the balloon using position
     * options of the first view.
     *
     * @param data Configuration.
     * @param data.view The view to show in the balloon.
     * @param data.balloonClassName Additional class name which will be added to the {@link #view balloon}.
     * @param data.withArrow Whether the {@link #view balloon} should be rendered with an arrow.
     */
    private _showView;
}
/**
 * An event fired when the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon} is about to get the position of the balloon.
 *
 * @eventName ~ContextualBalloon#getPositionOptions
 */
export type ContextualBalloonGetPositionOptionsEvent = DecoratedMethodEvent<ContextualBalloon, 'getPositionOptions'>;
/**
 * The configuration of the view.
 */
export interface ViewConfiguration {
    /**
     * The ID of the stack that the view is added to.
     *
     * @default 'main'
     */
    stackId?: string;
    /**
     * The content of the balloon.
     */
    view: View;
    /**
     * Positioning options.
     */
    position?: Partial<DomOptimalPositionOptions>;
    /**
     * An additional CSS class added to the {@link #view balloon} when visible.
     */
    balloonClassName?: string;
    /**
     * Whether the {@link #view balloon} should be rendered with an arrow.
     *
     * @default true
     */
    withArrow?: boolean;
    /**
     * Whether the view should be the only visible view even if other stacks were added.
     *
     * @default false
     */
    singleViewMode?: boolean;
}
/**
 * Rotator view is a helper class for the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon ContextualBalloon}.
 * It is used for displaying the last view from the current stack and providing navigation buttons for switching stacks.
 * See the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon ContextualBalloon} documentation to learn more.
 * @internal
 */
export declare class RotatorView extends View {
    /**
     * Used for checking if a view is focused or not.
     */
    readonly focusTracker: FocusTracker;
    /**
     * Navigation button for switching the stack to the previous one.
     */
    readonly buttonPrevView: ButtonView;
    /**
     * Navigation button for switching the stack to the next one.
     */
    readonly buttonNextView: ButtonView;
    /**
     * A collection of the child views that creates the rotator content.
     */
    readonly content: ViewCollection;
    /**
     * Defines whether navigation is visible or not.
     *
     * @observable
     */
    isNavigationVisible: boolean;
    /**
     * @observable
     */
    counter: string;
    /**
     * @inheritDoc
     */
    constructor(locale: Locale);
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Shows a given view.
     *
     * @param view The view to show.
     */
    showView(view: View): void;
    /**
     * Hides the currently displayed view.
     */
    hideView(): void;
    /**
     * Creates a navigation button view.
     *
     * @param label The button label.
     * @param icon The button icon.
     */
    private _createButtonView;
}
