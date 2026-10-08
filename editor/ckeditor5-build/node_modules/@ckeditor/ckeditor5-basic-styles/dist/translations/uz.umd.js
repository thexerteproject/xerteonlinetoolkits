/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'uz' ]: { dictionary, getPluralForm } } = {"uz":{"dictionary":{"Bold":"Qalin","Italic":"Kursiv","Underline":"Tagi chizilgan","Code":"Manba kodi","Strikethrough":"Chizilgan","Subscript":"Pastki yozuv","Superscript":"Yuqori yozuv","Italic text":"","Move out of an inline code style":"","Bold text":"","Underline text":"","Strikethrough text":""},getPluralForm(n){return (n > 1);}}};
e[ 'uz' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'uz' ].dictionary = Object.assign( e[ 'uz' ].dictionary, dictionary );
e[ 'uz' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
