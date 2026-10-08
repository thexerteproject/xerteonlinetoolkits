/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { View } from '../view.js';
import { ButtonView } from '../button/buttonview.js';
import { type ViewCollection } from '../viewcollection.js';
import type { FocusableView } from '../focuscycler.js';
import type { Locale } from '@ckeditor/ckeditor5-utils';
import '../../theme/components/collapsible/collapsible.css';
/**
 * A collapsible UI component. Consists of a labeled button and a container which can be collapsed
 * by clicking the button. The collapsible container can be a host to other UI views.
 *
 * @internal
 */
export declare class CollapsibleView extends View {
    /**
     * `true` when the container with {@link #children} is collapsed. `false` otherwise.
     *
     * @observable
     */
    isCollapsed: boolean;
    /**
     * The text label of the {@link #buttonView}.
     *
     * @observable
     * @default 'Show more'
     */
    label: string;
    /**
     * The ID of the label inside the {@link #buttonView} that describes the collapsible
     * container for assistive technologies. Set after the button was {@link #render rendered}.
     *
     * @internal
     * @readonly
     * @observable
     */
    _collapsibleAriaLabelUid: string | undefined;
    /**
     * The main button that, when clicked, collapses or expands the container with {@link #children}.
     */
    readonly buttonView: ButtonView;
    /**
     * A collection of the child views that can be collapsed by clicking the {@link #buttonView}.
     */
    readonly children: ViewCollection<FocusableView>;
    /**
     * Creates an instance of the collapsible view.
     *
     * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
     * @param childViews An optional array of initial child views to be inserted into the collapsible.
     */
    constructor(locale: Locale, childViews?: Array<FocusableView>);
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * Focuses the first focusable.
     */
    focus(): void;
    /**
     * Creates the main {@link #buttonView} of the collapsible.
     */
    private _createButtonView;
}
