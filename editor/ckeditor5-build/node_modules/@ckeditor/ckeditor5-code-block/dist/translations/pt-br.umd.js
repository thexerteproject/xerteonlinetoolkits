/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'pt-br' ]: { dictionary, getPluralForm } } = {"pt-br":{"dictionary":{"Insert code block":"Inserir bloco de código","Plain text":"Texto sem formatação","Leaving %0 code snippet":"Deixando o trecho de código %0","Entering %0 code snippet":"Inserção do trecho de código %0","Entering code snippet":"Inserção de trecho de código","Leaving code snippet":"Deixando o trecho de código","Code block":"Bloco de código"},getPluralForm(n){return (n != 1);}}};
e[ 'pt-br' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'pt-br' ].dictionary = Object.assign( e[ 'pt-br' ].dictionary, dictionary );
e[ 'pt-br' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
