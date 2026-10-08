/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'af' ]: { dictionary, getPluralForm } } = {"af":{"dictionary":{"Bold":"Vet","Italic":"Kursief","Underline":"Onderstreep","Code":"Bronkode","Strikethrough":"Deurstreep","Subscript":"Onderskrif","Superscript":"Boskrif","Italic text":"","Move out of an inline code style":"","Bold text":"","Underline text":"","Strikethrough text":""},getPluralForm(n){return (n != 1);}}};
e[ 'af' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'af' ].dictionary = Object.assign( e[ 'af' ].dictionary, dictionary );
e[ 'af' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
