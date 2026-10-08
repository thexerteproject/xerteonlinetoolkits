/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ur' ]: { dictionary, getPluralForm } } = {"ur":{"dictionary":{"Font Size":"فانٹ کا حجم","Tiny":"ننھا","Small":"چھوٹا","Big":"بڑا","Huge":"جسيم","Font Family":"فانٹ خاندان","Default":"طے شدہ","Font Color":"فانٹ کا رنگ","Font Background Color":"فانٹ کے پس منظر کا رنگ","Document colors":"دستاویز کے رنگ"},getPluralForm(n){return (n != 1);}}};
e[ 'ur' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ur' ].dictionary = Object.assign( e[ 'ur' ].dictionary, dictionary );
e[ 'ur' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
