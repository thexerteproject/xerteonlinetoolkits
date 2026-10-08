/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'id' ]: { dictionary, getPluralForm } } = {"id":{"dictionary":{"Bold":"Tebal","Italic":"Miring","Underline":"Garis bawah","Code":"Kode","Strikethrough":"Coret","Subscript":"Subskrip","Superscript":"Superskrip","Italic text":"Teks miring","Move out of an inline code style":"Keluar dari gaya kode sebaris","Bold text":"Teks tebal","Underline text":"Teks bergaris bawah","Strikethrough text":"Teks yang dicoret"},getPluralForm(n){return 0;}}};
e[ 'id' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'id' ].dictionary = Object.assign( e[ 'id' ].dictionary, dictionary );
e[ 'id' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
