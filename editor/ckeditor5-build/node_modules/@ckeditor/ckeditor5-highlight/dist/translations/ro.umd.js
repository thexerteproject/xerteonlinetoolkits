/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ro' ]: { dictionary, getPluralForm } } = {"ro":{"dictionary":{"Yellow marker":"Evidențiator galben","Green marker":"Evidențiator verde","Pink marker":"Evidențiator roz","Blue marker":"Evidențiator albastru","Red pen":"Pix roșu","Green pen":"Pix verde","Remove highlight":"Șterge evidențiere text","Highlight":"Evidențiere text","Text highlight toolbar":"Bară evidențiere text"},getPluralForm(n){return (n == 1 ? 0 : (n == 0 || (n % 100 > 0 && n % 100 < 20)) ? 1 : 2);}}};
e[ 'ro' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ro' ].dictionary = Object.assign( e[ 'ro' ].dictionary, dictionary );
e[ 'ro' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
