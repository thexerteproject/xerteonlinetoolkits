/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/labeledfield/labeledfieldview
 */
import { View } from '../view.js';
import { LabelView } from '../label/labelview.js';
import { uid } from '@ckeditor/ckeditor5-utils';
import '../../theme/components/labeledfield/labeledfieldview.css';
/**
 * The labeled field view class. It can be used to enhance any view with the following features:
 *
 * * a label,
 * * (optional) an error message,
 * * (optional) an info (status) text,
 *
 * all bound logically by proper DOM attributes for UX and accessibility.  It also provides an interface
 * (e.g. observable properties) that allows controlling those additional features.
 *
 * The constructor of this class requires a callback that returns a view to be labeled. The callback
 * is called with unique ids that allow binding of DOM properties:
 *
 * ```ts
 * const labeledInputView = new LabeledFieldView( locale, ( labeledFieldView, viewUid, statusUid ) => {
 * 	const inputView = new InputTextView( labeledFieldView.locale );
 *
 * 	inputView.set( {
 * 		id: viewUid,
 * 		ariaDescribedById: statusUid
 * 	} );
 *
 * 	inputView.bind( 'isReadOnly' ).to( labeledFieldView, 'isEnabled', value => !value );
 * 	inputView.bind( 'hasError' ).to( labeledFieldView, 'errorText', value => !!value );
 *
 * 	return inputView;
 * } );
 *
 * labeledInputView.label = 'User name';
 * labeledInputView.infoText = 'Full name like for instance, John Doe.';
 * labeledInputView.render();
 *
 * document.body.append( labeledInputView.element );
 * ```
 *
 * See {@link module:ui/labeledfield/utils} to discover ready–to–use labeled input helpers for common
 * UI components.
 */
export class LabeledFieldView extends View {
    /**
     * The field view that gets labeled.
     */
    fieldView;
    /**
     * The label view instance that describes the entire view.
     */
    labelView;
    /**
     * The status view for the {@link #fieldView}. It displays {@link #errorText} and
     * {@link #infoText}.
     */
    statusView;
    /**
     * A collection of children of the internal wrapper element. Allows inserting additional DOM elements (views) next to
     * the {@link #fieldView} for easy styling (e.g. positioning).
     *
     * By default, the collection contains {@link #fieldView} and {@link #labelView}.
     */
    fieldWrapperChildren;
    /**
     * Creates an instance of the labeled field view class using a provided creator function
     * that provides the view to be labeled.
     *
     * @param locale The locale instance.
     * @param viewCreator A function that returns a {@link module:ui/view~View}
     * that will be labeled. The following arguments are passed to the creator function:
     *
     * * an instance of the `LabeledFieldView` to allow binding observable properties,
     * * an UID string that connects the {@link #labelView label} and the labeled field view in DOM,
     * * an UID string that connects the {@link #statusView status} and the labeled field view in DOM.
     */
    constructor(locale, viewCreator) {
        super(locale);
        const viewUid = `ck-labeled-field-view-${uid()}`;
        const statusUid = `ck-labeled-field-view-status-${uid()}`;
        this.fieldView = viewCreator(this, viewUid, statusUid);
        this.set('label', undefined);
        this.set('isEnabled', true);
        this.set('isEmpty', true);
        this.set('isFocused', false);
        this.set('errorText', null);
        this.set('infoText', null);
        this.set('class', undefined);
        this.set('placeholder', undefined);
        this.labelView = this._createLabelView(viewUid);
        this.statusView = this._createStatusView(statusUid);
        this.fieldWrapperChildren = this.createCollection([this.fieldView, this.labelView]);
        this.bind('_statusText').to(this, 'errorText', this, 'infoText', (errorText, infoText) => errorText || infoText);
        const bind = this.bindTemplate;
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-labeled-field-view',
                    bind.to('class'),
                    bind.if('isEnabled', 'ck-disabled', value => !value),
                    bind.if('isEmpty', 'ck-labeled-field-view_empty'),
                    bind.if('isFocused', 'ck-labeled-field-view_focused'),
                    bind.if('placeholder', 'ck-labeled-field-view_placeholder'),
                    bind.if('errorText', 'ck-error')
                ]
            },
            children: [
                {
                    tag: 'div',
                    attributes: {
                        class: [
                            'ck',
                            'ck-labeled-field-view__input-wrapper'
                        ]
                    },
                    children: this.fieldWrapperChildren
                },
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
     * Creates the status view instance. It displays {@link #errorText} and {@link #infoText}
     * next to the {@link #fieldView}. See {@link #_statusText}.
     *
     * @param statusUid Unique id of the status, shared with the {@link #fieldView view's}
     * `aria-describedby` attribute.
     */
    _createStatusView(statusUid) {
        const statusView = new View(this.locale);
        const bind = this.bindTemplate;
        statusView.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-labeled-field-view__status',
                    bind.if('errorText', 'ck-labeled-field-view__status_error'),
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
     * Focuses the {@link #fieldView}.
     */
    focus(direction) {
        this.fieldView.focus(direction);
    }
}
