/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'da' ]: { dictionary, getPluralForm } } = {"da":{"dictionary":{"Bold":"Fed","Italic":"Kursiv","Underline":"Understreget","Code":"Kode","Strikethrough":"Gennemstreg","Subscript":"Sænket skrift","Superscript":"Hævet skrift","Italic text":"Kursiv tekst","Move out of an inline code style":"Flyt ud af en inline-kodestil","Bold text":"Fed tekst","Underline text":"Understreget tekst","Strikethrough text":"Gennemstreget tekst"},getPluralForm(n){return (n != 1);}}};
e[ 'da' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'da' ].dictionary = Object.assign( e[ 'da' ].dictionary, dictionary );
e[ 'da' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
