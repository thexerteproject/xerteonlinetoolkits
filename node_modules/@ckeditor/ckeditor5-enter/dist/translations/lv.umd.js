/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'lv' ]: { dictionary, getPluralForm } } = {"lv":{"dictionary":{"Insert a soft break (a <code>&lt;br&gt;</code> element)":"Ievietot rindiņas pārtraukumu (<code>&lt;br&gt;</code> elements)","Insert a hard break (a new paragraph)":"Ievietot stingro rindiņas pārtraukumu (jaunu rindkopu)"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n != 0 ? 1 : 2);}}};
e[ 'lv' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'lv' ].dictionary = Object.assign( e[ 'lv' ].dictionary, dictionary );
e[ 'lv' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
