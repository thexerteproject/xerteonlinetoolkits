/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'cs' ]: { dictionary, getPluralForm } } = {"cs":{"dictionary":{"Bold":"Tučné","Italic":"Kurzíva","Underline":"Podtržené","Code":"Kódový blok","Strikethrough":"Přeškrtnuté","Subscript":"Dolní index","Superscript":"Horní index","Italic text":"Kurzíva","Move out of an inline code style":"Odejít ze stylu vloženého kódu","Bold text":"Tučně","Underline text":"Podtrhnutí","Strikethrough text":"Přešktnutí"},getPluralForm(n){return (n == 1 ? 0 : (n >= 2 && n <= 4) ? 1 : 2);}}};
e[ 'cs' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'cs' ].dictionary = Object.assign( e[ 'cs' ].dictionary, dictionary );
e[ 'cs' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
