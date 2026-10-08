/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'pt' ]: { dictionary, getPluralForm } } = {"pt":{"dictionary":{"Insert image or file":"Inserir imagem ou ficheiro","Could not obtain resized image URL.":"Não é possível obter o URL da imagem redimensionada.","Selecting resized image failed":"A seleção da imagem redimensionada falhou","Could not insert image at the current position.":"Não é possível inserir a imagem na posição atual.","Inserting image failed":"A inserção da imagem falhou"},getPluralForm(n){return (n != 1);}}};
e[ 'pt' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'pt' ].dictionary = Object.assign( e[ 'pt' ].dictionary, dictionary );
e[ 'pt' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
