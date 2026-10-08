/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ms' ]: { dictionary, getPluralForm } } = {"ms":{"dictionary":{"Bold":"Tebal","Italic":"Italik","Underline":"Garis bawah","Code":"Kod","Strikethrough":"Garis lorek","Subscript":"Subskrip","Superscript":"Superskrip","Italic text":"Teks huruf condong","Move out of an inline code style":"Alih keluar daripada gaya kod sebaris","Bold text":"Teks tebal","Underline text":"Teks garis bawah","Strikethrough text":"Teks coretan"},getPluralForm(n){return 0;}}};
e[ 'ms' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ms' ].dictionary = Object.assign( e[ 'ms' ].dictionary, dictionary );
e[ 'ms' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
