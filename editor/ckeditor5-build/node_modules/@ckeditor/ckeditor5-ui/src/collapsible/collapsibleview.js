/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/collapsible/collapsibleview
 */
import { IconDropdownArrow } from '@ckeditor/ckeditor5-icons';
import { View } from '../view.js';
import { ButtonView } from '../button/buttonview.js';
import '../../theme/components/collapsible/collapsible.css';
/**
 * A collapsible UI component. Consists of a labeled button and a container which can be collapsed
 * by clicking the button. The collapsible container can be a host to other UI views.
 *
 * @internal
 */
export class CollapsibleView extends View {
    /**
     * The main button that, when clicked, collapses or expands the container with {@link #children}.
     */
    buttonView;
    /**
     * A collection of the child views that can be collapsed by clicking the {@link #buttonView}.
     */
    children;
    /**
     * Creates an instance of the collapsible view.
     *
     * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
     * @param childViews An optional array of initial child views to be inserted into the collapsible.
     */
    constructor(locale, childViews) {
        super(locale);
        const bind = this.bindTemplate;
        this.set('isCollapsed', false);
        this.set('label', '');
        this.buttonView = this._createButtonView();
        this.children = this.createCollection();
        this.set('_collapsibleAriaLabelUid', undefined);
        if (childViews) {
            this.children.addMany(childViews);
        }
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-collapsible',
                    bind.if('isCollapsed', 'ck-collapsible_collapsed')
                ]
            },
            children: [
                this.buttonView,
                {
                    tag: 'div',
                    attributes: {
                        class: [
                            'ck',
                            'ck-collapsible__children'
                        ],
                        role: 'region',
                        hidden: bind.if('isCollapsed', 'hidden'),
                        'aria-labelledby': bind.to('_collapsibleAriaLabelUid')
                    },
                    children: this.children
                }
            ]
        });
    }
    /**
     * @inheritDoc
     */
    render() {
        super.render();
        this._collapsibleAriaLabelUid = this.buttonView.labelView.element.id;
    }
    /**
     * Focuses the first focusable.
     */
    focus() {
        this.buttonView.focus();
    }
    /**
     * Creates the main {@link #buttonView} of the collapsible.
     */
    _createButtonView() {
        const buttonView = new ButtonView(this.locale);
        const bind = buttonView.bindTemplate;
        buttonView.set({
            withText: true,
            icon: IconDropdownArrow
        });
        buttonView.extendTemplate({
            attributes: {
                'aria-expanded': bind.to('isOn', value => String(value))
            }
        });
        buttonView.bind('label').to(this);
        buttonView.bind('isOn').to(this, 'isCollapsed', isCollapsed => !isCollapsed);
        buttonView.on('execute', () => {
            this.isCollapsed = !this.isCollapsed;
        });
        return buttonView;
    }
}
