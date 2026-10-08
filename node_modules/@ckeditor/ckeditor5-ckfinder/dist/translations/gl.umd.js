/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'gl' ]: { dictionary, getPluralForm } } = {"gl":{"dictionary":{"Insert image or file":"Inserir imaxe ou ficheiro","Could not obtain resized image URL.":"Non foi posíbel obter o URL da imaxe redimensionada.","Selecting resized image failed":"Non foi posíbel seleccionar a imaxe redimensionada","Could not insert image at the current position.":"Non foi posíbel inserir a imaxe na posición actual.","Inserting image failed":"Fallou a inserción da imaxe"},getPluralForm(n){return (n != 1);}}};
e[ 'gl' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'gl' ].dictionary = Object.assign( e[ 'gl' ].dictionary, dictionary );
e[ 'gl' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
