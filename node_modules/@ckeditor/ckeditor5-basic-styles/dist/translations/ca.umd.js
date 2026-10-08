/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ca' ]: { dictionary, getPluralForm } } = {"ca":{"dictionary":{"Bold":"Negreta","Italic":"Cursiva","Underline":"Subrallat","Code":"Codi","Strikethrough":"Marcat","Subscript":"Subíndex","Superscript":"Superíndex","Italic text":"Text en cursiva","Move out of an inline code style":"Surt d'un codi d'estil en línia","Bold text":"Text en negreta","Underline text":"Subratlla el text","Strikethrough text":"Barra el text"},getPluralForm(n){return (n != 1);}}};
e[ 'ca' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ca' ].dictionary = Object.assign( e[ 'ca' ].dictionary, dictionary );
e[ 'ca' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
