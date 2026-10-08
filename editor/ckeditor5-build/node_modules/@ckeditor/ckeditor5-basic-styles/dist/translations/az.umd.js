/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'az' ]: { dictionary, getPluralForm } } = {"az":{"dictionary":{"Bold":"Yarıqalın","Italic":"Maili","Underline":"Altdan xətt","Code":"Kod","Strikethrough":"Qaralanmış","Subscript":"Alt yazı","Superscript":"Üst yazı","Italic text":"","Move out of an inline code style":"","Bold text":"","Underline text":"","Strikethrough text":""},getPluralForm(n){return (n != 1);}}};
e[ 'az' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'az' ].dictionary = Object.assign( e[ 'az' ].dictionary, dictionary );
e[ 'az' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
