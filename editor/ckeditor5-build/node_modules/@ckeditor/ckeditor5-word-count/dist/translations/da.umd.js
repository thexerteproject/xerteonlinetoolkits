/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'da' ]: { dictionary, getPluralForm } } = {"da":{"dictionary":{"Words: %0":"Ord: %0","Characters: %0":"Karakterer: %0"},getPluralForm(n){return (n != 1);}}};
e[ 'da' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'da' ].dictionary = Object.assign( e[ 'da' ].dictionary, dictionary );
e[ 'da' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
