/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { parseBase64EncodedObject } from '@ckeditor/ckeditor5-utils';
import { View } from '../view.js';
import { Badge } from '../badge/badge.js';
/**
 * A helper that enables the "evaluation badge" feature in the editor at the bottom of the editable element
 * (editor root, source editing area, etc.) when the editor is focused.
 *
 * @private
 */
export class EvaluationBadge extends Badge {
    licenseTypeMessage = {
        evaluation: 'For evaluation purposes only',
        trial: 'For evaluation purposes only',
        development: 'For development purposes only'
    };
    constructor(editor) {
        super(editor, { balloonClass: 'ck-evaluation-badge-balloon' });
    }
    /**
     * Enables "evaluation badge" label.
     */
    _isEnabled() {
        const editor = this.editor;
        const licenseKey = editor.config.get('licenseKey');
        const licenseType = getLicenseTypeFromLicenseKey(licenseKey);
        return Boolean(licenseType && this.licenseTypeMessage[licenseType]);
    }
    /**
     * Creates the content of the "evaluation badge".
     */
    _createBadgeContent() {
        const licenseKey = this.editor.config.get('licenseKey');
        const licenseType = getLicenseTypeFromLicenseKey(licenseKey);
        return new EvaluationBadgeView(this.editor.locale, this.licenseTypeMessage[licenseType]);
    }
    /**
     * Returns the normalized configuration for the "evaluation badge".
     * It takes 'ui.poweredBy' configuration into account to determine the badge position and side.
     */
    _getNormalizedConfig() {
        const badgeConfig = super._getNormalizedConfig();
        const userConfig = this.editor.config.get('ui.poweredBy') || {};
        const position = userConfig.position || badgeConfig.position;
        const poweredBySide = userConfig.side || badgeConfig.side;
        return {
            position,
            side: poweredBySide === 'left' ? 'right' : 'left',
            verticalOffset: badgeConfig.verticalOffset,
            horizontalOffset: badgeConfig.horizontalOffset
        };
    }
}
/**
 * A view displaying the "evaluation badge".
 */
class EvaluationBadgeView extends View {
    /**
     * Creates an instance of the "evaluation badge" view.
     *
     * @param locale The localization services instance.
     * @param label The label text.
     */
    constructor(locale, label) {
        super(locale);
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: ['ck', 'ck-evaluation-badge'],
                'aria-hidden': true
            },
            children: [
                {
                    tag: 'span',
                    attributes: {
                        class: ['ck', 'ck-evaluation-badge__label']
                    },
                    children: [label]
                }
            ]
        });
    }
}
/**
 * Returns the license type based on the license key.
 */
function getLicenseTypeFromLicenseKey(licenseKey) {
    if (licenseKey == 'GPL') {
        return 'GPL';
    }
    const licenseContent = parseBase64EncodedObject(licenseKey.split('.')[1]);
    if (!licenseContent) {
        return null;
    }
    return licenseContent.licenseType || 'production';
}
