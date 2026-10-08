/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'si' ]: { dictionary, getPluralForm } } = {"si":{"dictionary":{"Bold":"තදකුරු","Italic":"ඇලකුරු","Underline":"","Code":"","Strikethrough":"","Subscript":"","Superscript":"","Italic text":"","Move out of an inline code style":"","Bold text":"","Underline text":"","Strikethrough text":""},getPluralForm(n){return (n != 1);}}};
e[ 'si' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'si' ].dictionary = Object.assign( e[ 'si' ].dictionary, dictionary );
e[ 'si' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
