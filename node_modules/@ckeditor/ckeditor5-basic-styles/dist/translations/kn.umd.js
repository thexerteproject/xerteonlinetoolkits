/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'kn' ]: { dictionary, getPluralForm } } = {"kn":{"dictionary":{"Bold":"‍‍ದಪ್ಪ","Italic":"‍ಇಟಾಲಿಕ್","Underline":"","Code":"","Strikethrough":"","Subscript":"","Superscript":"","Italic text":"","Move out of an inline code style":"","Bold text":"","Underline text":"","Strikethrough text":""},getPluralForm(n){return (n != 1);}}};
e[ 'kn' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'kn' ].dictionary = Object.assign( e[ 'kn' ].dictionary, dictionary );
e[ 'kn' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
