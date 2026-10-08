/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'es-co' ]: { dictionary, getPluralForm } } = {"es-co":{"dictionary":{"Bold":"Negrita","Italic":"Cursiva","Underline":"Subrayado","Code":"Código","Strikethrough":"Tachado","Subscript":"Subíndice","Superscript":"Superíndice","Italic text":"Texto en cursiva","Move out of an inline code style":"","Bold text":"","Underline text":"","Strikethrough text":""},getPluralForm(n){return (n != 1);}}};
e[ 'es-co' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'es-co' ].dictionary = Object.assign( e[ 'es-co' ].dictionary, dictionary );
e[ 'es-co' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
