/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'hy' ]: { dictionary, getPluralForm } } = {"hy":{"dictionary":{"Yellow marker":"","Green marker":"","Pink marker":"","Blue marker":"","Red pen":"","Green pen":"","Remove highlight":"","Highlight":"","Text highlight toolbar":""},getPluralForm(n){return (n != 1);}}};
e[ 'hy' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'hy' ].dictionary = Object.assign( e[ 'hy' ].dictionary, dictionary );
e[ 'hy' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
