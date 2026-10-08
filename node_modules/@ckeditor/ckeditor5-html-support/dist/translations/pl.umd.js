/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'pl' ]: { dictionary, getPluralForm } } = {"pl":{"dictionary":{"HTML object":"Obiekt HTML"},getPluralForm(n){return (n == 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'pl' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'pl' ].dictionary = Object.assign( e[ 'pl' ].dictionary, dictionary );
e[ 'pl' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
