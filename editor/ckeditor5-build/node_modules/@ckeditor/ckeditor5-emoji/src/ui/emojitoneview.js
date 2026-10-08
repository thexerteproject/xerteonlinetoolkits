/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module emoji/ui/emojitoneview
 */
import { createDropdown, addListToDropdown, View, UIModel } from 'ckeditor5/src/ui.js';
import { Collection } from 'ckeditor5/src/utils.js';
import '../../theme/emojitone.css';
/**
 * A view responsible for selecting a skin tone for an emoji.
 */
export class EmojiToneView extends View {
    /**
     * A dropdown element for selecting an active skin tone.
     */
    dropdownView;
    /**
     * An array of available skin tones.
     */
    _skinTones;
    /**
     * @inheritDoc
     */
    constructor(locale, { skinTone, skinTones }) {
        super(locale);
        this.set('skinTone', skinTone);
        this._skinTones = skinTones;
        const t = locale.t;
        const accessibleLabel = t('Select skin tone');
        const dropdownView = createDropdown(locale);
        const itemDefinitions = new Collection();
        for (const { id, icon, tooltip } of this._skinTones) {
            const def = {
                type: 'button',
                model: new UIModel({
                    value: id,
                    label: icon,
                    ariaLabel: tooltip,
                    tooltip,
                    tooltipPosition: 'e',
                    role: 'menuitemradio',
                    withText: true,
                    // To improve accessibility, disconnect a button and its label connection so that screen
                    // readers can read the `[aria-label]` attribute directly from the more descriptive button.
                    ariaLabelledBy: undefined
                })
            };
            def.model.bind('isOn').to(this, 'skinTone', value => value === id);
            itemDefinitions.add(def);
        }
        addListToDropdown(dropdownView, itemDefinitions, {
            ariaLabel: accessibleLabel,
            role: 'menu'
        });
        dropdownView.buttonView.set({
            label: this._getSkinTone().icon,
            ariaLabel: accessibleLabel,
            ariaLabelledBy: undefined,
            isOn: false,
            withText: true,
            tooltip: accessibleLabel
        });
        this.dropdownView = dropdownView;
        // Execute command when an item from the dropdown is selected.
        this.listenTo(dropdownView, 'execute', evt => {
            this.skinTone = evt.source.value;
        });
        dropdownView.buttonView.bind('label').to(this, 'skinTone', () => {
            return this._getSkinTone().icon;
        });
        dropdownView.buttonView.bind('ariaLabel').to(this, 'skinTone', () => {
            // Render a current state, but also what the dropdown does.
            return `${this._getSkinTone().tooltip}, ${accessibleLabel}`;
        });
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: ['ck', 'ck-emoji__skin-tone']
            },
            children: [dropdownView]
        });
    }
    /**
     * @inheritDoc
     */
    focus() {
        this.dropdownView.buttonView.focus();
    }
    /**
     * Helper method for receiving an object describing the active skin tone.
     */
    _getSkinTone() {
        return this._skinTones.find(tone => tone.id === this.skinTone);
    }
}
