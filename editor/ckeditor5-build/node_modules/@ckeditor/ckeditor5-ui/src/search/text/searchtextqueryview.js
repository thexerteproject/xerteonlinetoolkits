/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/search/text/searchtextqueryview
 */
import { IconCancel, IconLoupe } from '@ckeditor/ckeditor5-icons';
import { ButtonView } from '../../button/buttonview.js';
import { IconView } from '../../icon/iconview.js';
import { LabeledFieldView } from '../../labeledfield/labeledfieldview.js';
import { createLabeledInputText } from '../../labeledfield/utils.js';
/**
 * A search input field for the {@link module:ui/search/text/searchtextview~SearchTextView} component.
 *
 * @internal
 * @extends module:ui/labeledfield/labeledfieldview~LabeledFieldView
 */
export class SearchTextQueryView extends LabeledFieldView {
    /**
     * The loupe icon displayed next to the {@link #fieldView}.
     */
    iconView;
    /**
     * The button that clears and focuses the {@link #fieldView}.
     */
    resetButtonView;
    /**
     * A reference to the view configuration.
     */
    _viewConfig;
    /**
     * @inheritDoc
     */
    constructor(locale, config) {
        const t = locale.t;
        const viewConfig = Object.assign({}, {
            showResetButton: true,
            showIcon: true,
            creator: createLabeledInputText
        }, config);
        super(locale, viewConfig.creator);
        this.label = config.label;
        this._viewConfig = viewConfig;
        if (this._viewConfig.showIcon) {
            this.iconView = new IconView();
            this.iconView.content = IconLoupe;
            this.fieldWrapperChildren.add(this.iconView, 0);
            this.extendTemplate({
                attributes: {
                    class: 'ck-search__query_with-icon'
                }
            });
        }
        if (this._viewConfig.showResetButton) {
            this.resetButtonView = new ButtonView(locale);
            this.resetButtonView.set({
                label: t('Clear'),
                icon: IconCancel,
                class: 'ck-search__reset',
                isVisible: false,
                tooltip: true
            });
            this.resetButtonView.on('execute', () => {
                this.reset();
                this.focus();
                this.fire('reset');
            });
            this.resetButtonView.bind('isVisible').to(this.fieldView, 'isEmpty', isEmpty => !isEmpty);
            this.fieldWrapperChildren.add(this.resetButtonView);
            this.extendTemplate({
                attributes: {
                    class: 'ck-search__query_with-reset'
                }
            });
        }
    }
    /**
     * Resets the search field to its default state.
     */
    reset() {
        this.fieldView.reset();
        if (this._viewConfig.showResetButton) {
            this.resetButtonView.isVisible = false;
        }
    }
}
