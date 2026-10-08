/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'gl' ]: { dictionary, getPluralForm } } = {"gl":{"dictionary":{"Insert code block":"Inserir bloque de código","Plain text":"Texto simple","Leaving %0 code snippet":"Abandonando o fragmento de código %0","Entering %0 code snippet":"Introducindo o fragmento de código %0","Entering code snippet":"Introducindo un fragmento de código","Leaving code snippet":"Abandonando o fragmento de código","Code block":"Bloque de código "},getPluralForm(n){return (n != 1);}}};
e[ 'gl' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'gl' ].dictionary = Object.assign( e[ 'gl' ].dictionary, dictionary );
e[ 'gl' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
