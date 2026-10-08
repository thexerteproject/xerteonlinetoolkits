/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'pt' ]: { dictionary, getPluralForm } } = {"pt":{"dictionary":{"Bold":"Negrito","Italic":"Itálico","Underline":"Sublinhado","Code":"Código","Strikethrough":"Rasurar","Subscript":"Subscrito","Superscript":"Sobrescrito","Italic text":"Texto em itálico","Move out of an inline code style":"Sair de um estilo de código inline","Bold text":"Texto em negrito","Underline text":"Sublinhar texto","Strikethrough text":"Texto rasurado"},getPluralForm(n){return (n != 1);}}};
e[ 'pt' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'pt' ].dictionary = Object.assign( e[ 'pt' ].dictionary, dictionary );
e[ 'pt' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
