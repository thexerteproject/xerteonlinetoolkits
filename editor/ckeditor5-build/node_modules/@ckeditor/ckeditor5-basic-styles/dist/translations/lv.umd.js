/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'lv' ]: { dictionary, getPluralForm } } = {"lv":{"dictionary":{"Bold":"Trekns","Italic":"Kursīvs","Underline":"Pasvītrots","Code":"Kods","Strikethrough":"Nosvītrots","Subscript":"Apakšraksts","Superscript":"Augšraksts","Italic text":"Teksts slīprakstā","Move out of an inline code style":"Iziet no iekļautā koda stila","Bold text":"Teksts treknrakstā","Underline text":"Pasvītrot tekstu","Strikethrough text":"Pārsvītrot teksts"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n != 0 ? 1 : 2);}}};
e[ 'lv' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'lv' ].dictionary = Object.assign( e[ 'lv' ].dictionary, dictionary );
e[ 'lv' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
