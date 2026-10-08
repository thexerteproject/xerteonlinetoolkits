/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'en' ]: { dictionary, getPluralForm } } = {"en":{"dictionary":{"Bold":"Bold","Italic":"Italic","Underline":"Underline","Code":"Code","Strikethrough":"Strikethrough","Subscript":"Subscript","Superscript":"Superscript","Italic text":"Italic text","Move out of an inline code style":"Move out of an inline code style","Bold text":"Bold text","Underline text":"Underline text","Strikethrough text":"Strikethrough text"},getPluralForm(n){return (n != 1);}}};
e[ 'en' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'en' ].dictionary = Object.assign( e[ 'en' ].dictionary, dictionary );
e[ 'en' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
