/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ur' ]: { dictionary, getPluralForm } } = {"ur":{"dictionary":{"Yellow marker":"پیلا نشان","Green marker":"سبز نشان","Pink marker":"گلابی نشان","Blue marker":"نیلا نشان","Red pen":"سرخ قلم","Green pen":"سبز قلم","Remove highlight":"غیر نمایاں کریں","Highlight":"نمایاں","Text highlight toolbar":"خانہ آلات برائے نمایاں متن"},getPluralForm(n){return (n != 1);}}};
e[ 'ur' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ur' ].dictionary = Object.assign( e[ 'ur' ].dictionary, dictionary );
e[ 'ur' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
