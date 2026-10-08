/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sq' ]: { dictionary, getPluralForm } } = {"sq":{"dictionary":{"Copy selected content":"","Paste content":"","Paste content as plain text":""},getPluralForm(n){return (n != 1);}}};
e[ 'sq' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sq' ].dictionary = Object.assign( e[ 'sq' ].dictionary, dictionary );
e[ 'sq' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
