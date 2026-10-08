/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/icon/iconview
 */
import { View } from '../view.js';
import '../../theme/components/icon/icon.css';
/**
 * The icon view class.
 */
export declare class IconView extends View {
    /**
     * The SVG source of the icon.
     *
     * The user must provide the entire XML string, not just the path. See the
     * {@glink framework/architecture/ui-library#setting-label-icon-and-tooltip UI library} guide for details.
     *
     * @observable
     */
    content: string | undefined;
    /**
     * This attribute specifies the boundaries to which the
     * icon content should stretch.
     *
     * @observable
     * @default '0 0 20 20'
     */
    viewBox: string;
    /**
     * The fill color of the child `path.ck-icon__fill`.
     *
     * @observable
     * @default ''
     */
    fillColor: string;
    /**
     * When set true (default), all parts of the icon inherit the fill color from the CSS `color` property of the
     * icon's DOM parent.
     *
     * This effectively makes the icon monochromatic and allows it to change its fill color dynamically, for instance,
     * when a {@link module:ui/button/buttonview~ButtonView} displays an icon and it switches between different states
     * (pushed, hovered, etc.) the icon will follow along.
     *
     * **Note**: For the monochromatic icon to render properly, it must be made up of shapes that can be filled
     * with color instead of, for instance, paths with strokes. Be sure to use the *outline stroke* tool
     * (the name could be different in your vector graphics editor) before exporting your icon. Also, remove any
     * excess `fill="..."` attributes that could break the color inheritance.
     *
     * **Note**: If you want to preserve the original look of your icon and disable dynamic color inheritance,
     * set this flag to `false`.
     *
     * @observable
     * @default true
     */
    isColorInherited: boolean;
    /**
     * Controls whether the icon is visible.
     *
     * @observable
     * @default true
     */
    isVisible: boolean;
    /**
     * A list of presentational attributes that can be set on the `<svg>` element and should be preserved
     * when the icon {@link module:ui/icon/iconview~IconView#content content} is loaded.
     *
     * See the [specification](https://www.w3.org/TR/SVG/styling.html#TermPresentationAttribute) to learn more.
     */
    private static presentationalAttributeNames;
    /**
     * @inheritDoc
     */
    constructor();
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * Updates the {@link #element} with the value of {@link #content}.
     */
    private _updateXMLContent;
    /**
     * Fills all child `path.ck-icon__fill` with the `#fillColor`.
     */
    private _colorFillPaths;
}
