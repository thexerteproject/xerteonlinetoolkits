/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/labeledinput/labeledinputview
 */
import { View } from '../view.js';
import { LabelView } from '../label/labelview.js';
import { uid } from '@ckeditor/ckeditor5-utils';
import '../../theme/components/labeledinput/labeledinput.css';
/**
 * The labeled input view class.
 */
export class LabeledInputView extends View {
    /**
     * The label view.
     */
    labelView;
    /**
     * The input view.
     */
    inputView;
    /**
     * The status view for the {@link #inputView}. It displays {@link #errorText} and
     * {@link #infoText}.
     */
    statusView;
    /**
     * Creates an instance of the labeled input view class.
     *
     * @param locale The locale instance.
     * @param InputView Constructor of the input view.
     */
    constructor(locale, InputView) {
        super(locale);
        const inputUid = `ck-input-${uid()}`;
        const statusUid = `ck-status-${uid()}`;
        this.set('label', undefined);
        this.set('value', undefined);
        this.set('isReadOnly', false);
        this.set('errorText', null);
        this.set('infoText', null);
        this.labelView = this._createLabelView(inputUid);
        this.inputView = this._createInputView(InputView, inputUid, statusUid);
        this.statusView = this._createStatusView(statusUid);
        this.bind('_statusText').to(this, 'errorText', this, 'infoText', (errorText, infoText) => errorText || infoText);
        const bind = this.bindTemplate;
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-labeled-input',
                    bind.if('isReadOnly', 'ck-disabled')
                ]
            },
            children: [
                this.labelView,
                this.inputView,
                this.statusView
            ]
        });
    }
    /**
     * Creates label view class instance and bind with view.
     *
     * @param id Unique id to set as labelView#for attribute.
     */
    _createLabelView(id) {
        const labelView = new LabelView(this.locale);
        labelView.for = id;
        labelView.bind('text').to(this, 'label');
        return labelView;
    }
    /**
     * Creates input view class instance and bind with view.
     *
     * @param InputView Input view constructor.
     * @param inputUid Unique id to set as inputView#id attribute.
     * @param statusUid Unique id of the status for the input's `aria-describedby` attribute.
     */
    _createInputView(InputView, inputUid, statusUid) {
        const inputView = new InputView(this.locale, statusUid);
        inputView.id = inputUid;
        inputView.ariaDescribedById = statusUid;
        inputView.bind('value').to(this);
        inputView.bind('isReadOnly').to(this);
        inputView.bind('hasError').to(this, 'errorText', value => !!value);
        inputView.on('input', () => {
            // UX: Make the error text disappear and disable the error indicator as the user
            // starts fixing the errors.
            this.errorText = null;
        });
        return inputView;
    }
    /**
     * Creates the status view instance. It displays {@link #errorText} and {@link #infoText}
     * next to the {@link #inputView}. See {@link #_statusText}.
     *
     * @param statusUid Unique id of the status, shared with the input's `aria-describedby` attribute.
     */
    _createStatusView(statusUid) {
        const statusView = new View(this.locale);
        const bind = this.bindTemplate;
        statusView.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-labeled-input__status',
                    bind.if('errorText', 'ck-labeled-input__status_error'),
                    bind.if('_statusText', 'ck-hidden', value => !value)
                ],
                id: statusUid,
                role: bind.if('errorText', 'alert')
            },
            children: [
                {
                    text: bind.to('_statusText')
                }
            ]
        });
        return statusView;
    }
    /**
     * Moves the focus to the input and selects the value.
     */
    select() {
        this.inputView.select();
    }
    /**
     * Focuses the input.
     */
    focus() {
        this.inputView.focus();
    }
}
