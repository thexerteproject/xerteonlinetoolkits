/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sr-latn' ]: { dictionary, getPluralForm } } = {"sr-latn":{"dictionary":{"Bold":"Podebljano","Italic":"Kurziv","Underline":"Podvučen","Code":"Kod","Strikethrough":"Precrtan","Subscript":"Index dole","Superscript":"Index gore","Italic text":"Kurziv tekst","Move out of an inline code style":"Izađite iz inline stila koda","Bold text":"Zadebljani tekst","Underline text":"Podvuci tekst","Strikethrough text":"Precrtan tekst"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'sr-latn' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sr-latn' ].dictionary = Object.assign( e[ 'sr-latn' ].dictionary, dictionary );
e[ 'sr-latn' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
