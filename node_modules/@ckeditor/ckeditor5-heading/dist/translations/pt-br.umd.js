/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'pt-br' ]: { dictionary, getPluralForm } } = {"pt-br":{"dictionary":{"Heading":"Titulo","Choose heading":"Escolha o título","Heading 1":"Título 1","Heading 2":"Título 2","Heading 3":"Título 3","Heading 4":"Título 4","Heading 5":"Título 5","Heading 6":"Título 6","Type your title":"Digite o título","Type or paste your content here.":"Digite ou cole o conteúdo aqui."},getPluralForm(n){return (n != 1);}}};
e[ 'pt-br' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'pt-br' ].dictionary = Object.assign( e[ 'pt-br' ].dictionary, dictionary );
e[ 'pt-br' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
