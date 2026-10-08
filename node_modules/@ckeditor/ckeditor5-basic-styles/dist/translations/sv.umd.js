/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sv' ]: { dictionary, getPluralForm } } = {"sv":{"dictionary":{"Bold":"Fet","Italic":"Kursiv","Underline":"Understrykning","Code":"Kod","Strikethrough":"Genomstruken","Subscript":"Nedsänkta tecken","Superscript":"Upphöjda tecken","Italic text":"Kursiv stil","Move out of an inline code style":"Flytta bort från inlinekodens stil","Bold text":"Fetstil","Underline text":"Understruken text","Strikethrough text":"Genomstruken text"},getPluralForm(n){return (n != 1);}}};
e[ 'sv' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sv' ].dictionary = Object.assign( e[ 'sv' ].dictionary, dictionary );
e[ 'sv' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
