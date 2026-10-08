/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'no' ]: { dictionary, getPluralForm } } = {"no":{"dictionary":{"Insert a soft break (a <code>&lt;br&gt;</code> element)":"Sett inn et mykt linjeskift (et <code>&lt;br&gt;</code>-element)","Insert a hard break (a new paragraph)":"Sett inn et hardt linjeskift (et nytt avsnitt)"},getPluralForm(n){return (n != 1);}}};
e[ 'no' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'no' ].dictionary = Object.assign( e[ 'no' ].dictionary, dictionary );
e[ 'no' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
