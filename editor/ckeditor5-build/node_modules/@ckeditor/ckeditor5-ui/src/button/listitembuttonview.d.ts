/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/button/listitembuttonview
 */
import type { Locale } from '@ckeditor/ckeditor5-utils';
import { type ButtonLabel } from './buttonlabel.js';
import { type ViewCollection } from '../viewcollection.js';
import { ButtonView } from './buttonview.js';
import { View } from '../view.js';
import '../../theme/components/button/listitembutton.css';
/**
 * Button that is used as dropdown list item entry.
 */
export declare class ListItemButtonView extends ButtonView {
    /**
     * Indicates whether the button view has reserved space for a check holder.
     *
     * @observable
     */
    hasCheckSpace: boolean;
    /**
     * The flag that indicates if the button should render a check holder.
     *
     * @internal
     * @readonly
     * @observable
     */
    _hasCheck: boolean;
    /**
     * Holds the view for the check icon of a button list item.
     */
    private readonly _checkIconHolderView;
    /**
     * @inheritDoc
     */
    constructor(locale?: Locale, labelView?: ButtonLabel);
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * Renders the check icon if the button is toggleable.
     */
    private _watchCheckIconHolderMount;
}
/**
 * @internal
 */
export declare class CheckIconHolderView extends View {
    /**
     * Collection of child views.
     */
    readonly children: ViewCollection<View>;
    /**
     * Indicates whether the button is in the "on" state.
     */
    isOn: boolean;
    /**
     * The view for the check icon of the button list item.
     */
    private readonly _checkIconView;
    /**
     * @inheritDoc
     */
    constructor();
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * Renders the check icon if the button is toggleable.
     */
    private _watchCheckIconMount;
    /**
     * Creates a check icon view.
     */
    private _createCheckIconView;
}
