/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/icon/iconview
 */
import { View } from '../view.js';
import { CKEditorError } from '@ckeditor/ckeditor5-utils';
import '../../theme/components/icon/icon.css';
/**
 * The icon view class.
 */
export class IconView extends View {
    /**
     * A list of presentational attributes that can be set on the `<svg>` element and should be preserved
     * when the icon {@link module:ui/icon/iconview~IconView#content content} is loaded.
     *
     * See the [specification](https://www.w3.org/TR/SVG/styling.html#TermPresentationAttribute) to learn more.
     */
    static presentationalAttributeNames = [
        'alignment-baseline', 'baseline-shift', 'clip-path', 'clip-rule', 'color', 'color-interpolation',
        'color-interpolation-filters', 'color-rendering', 'cursor', 'direction', 'display', 'dominant-baseline', 'fill', 'fill-opacity',
        'fill-rule', 'filter', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style',
        'font-variant', 'font-weight', 'image-rendering', 'letter-spacing', 'lighting-color', 'marker-end', 'marker-mid', 'marker-start',
        'mask', 'opacity', 'overflow', 'paint-order', 'pointer-events', 'shape-rendering', 'stop-color', 'stop-opacity', 'stroke',
        'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width',
        'text-anchor', 'text-decoration', 'text-overflow', 'text-rendering', 'transform', 'unicode-bidi', 'vector-effect',
        'visibility', 'white-space', 'word-spacing', 'writing-mode'
    ];
    /**
     * @inheritDoc
     */
    constructor() {
        super();
        const bind = this.bindTemplate;
        this.set('content', '');
        this.set('viewBox', '0 0 20 20');
        this.set('fillColor', '');
        this.set('isColorInherited', true);
        this.set('isVisible', true);
        this.setTemplate({
            tag: 'svg',
            ns: 'http://www.w3.org/2000/svg',
            attributes: {
                class: [
                    'ck',
                    'ck-icon',
                    bind.if('isVisible', 'ck-hidden', value => !value),
                    // Exclude icon internals from the CSS reset to allow rich (non-monochromatic) icons
                    // (https://github.com/ckeditor/ckeditor5/issues/12599).
                    'ck-reset_all-excluded',
                    // The class to remove the dynamic color inheritance is toggleable
                    // (https://github.com/ckeditor/ckeditor5/issues/12599).
                    bind.if('isColorInherited', 'ck-icon_inherit-color')
                ],
                viewBox: bind.to('viewBox'),
                'aria-hidden': true
            }
        });
    }
    /**
     * @inheritDoc
     */
    render() {
        super.render();
        this._updateXMLContent();
        this._colorFillPaths();
        // This is a hack for lack of innerHTML binding.
        // See: https://github.com/ckeditor/ckeditor5-ui/issues/99.
        this.on('change:content', () => {
            this._updateXMLContent();
            this._colorFillPaths();
        });
        this.on('change:fillColor', () => {
            this._colorFillPaths();
        });
    }
    /**
     * Updates the {@link #element} with the value of {@link #content}.
     */
    _updateXMLContent() {
        if (this.content) {
            const parsed = new DOMParser().parseFromString(this.content.trim(), 'image/svg+xml');
            const svg = parsed.querySelector('svg');
            if (!svg) {
                /**
                 * The provided icon content is not a valid SVG.
                 *
                 * @error ui-iconview-invalid-svg
                 */
                throw new CKEditorError('ui-iconview-invalid-svg', this);
            }
            const viewBox = svg.getAttribute('viewBox');
            if (viewBox) {
                this.viewBox = viewBox;
            }
            // Preserve presentational attributes of the <svg> element from the source.
            // They can affect rendering of the entire icon (https://github.com/ckeditor/ckeditor5/issues/12597).
            for (const { name, value } of Array.from(svg.attributes)) {
                if (IconView.presentationalAttributeNames.includes(name)) {
                    this.element.setAttribute(name, value);
                }
            }
            while (this.element.firstChild) {
                this.element.removeChild(this.element.firstChild);
            }
            while (svg.childNodes.length > 0) {
                this.element.appendChild(svg.childNodes[0]);
            }
        }
    }
    /**
     * Fills all child `path.ck-icon__fill` with the `#fillColor`.
     */
    _colorFillPaths() {
        if (this.fillColor) {
            this.element.querySelectorAll('.ck-icon__fill').forEach(path => {
                path.style.fill = this.fillColor;
            });
        }
    }
}
