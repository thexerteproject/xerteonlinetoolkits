/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'de' ]: { dictionary, getPluralForm } } = {"de":{"dictionary":{"Bold":"Fett","Italic":"Kursiv","Underline":"Unterstrichen","Code":"Code","Strikethrough":"Durchgestrichen","Subscript":"Tiefgestellt","Superscript":"Hochgestellt","Italic text":"Kursivschrift","Move out of an inline code style":"Inline Code Style verlassen","Bold text":"Fettschrift","Underline text":"Text hervorheben","Strikethrough text":"Durchgestrichener Text"},getPluralForm(n){return (n != 1);}}};
e[ 'de' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'de' ].dictionary = Object.assign( e[ 'de' ].dictionary, dictionary );
e[ 'de' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
