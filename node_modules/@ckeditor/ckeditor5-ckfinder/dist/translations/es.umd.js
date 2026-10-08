/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'es' ]: { dictionary, getPluralForm } } = {"es":{"dictionary":{"Insert image or file":"Insertar imagen o archivo","Could not obtain resized image URL.":"No se pudo obtener el URL de la imagen redimensionada.","Selecting resized image failed":"No se pudo seleccionar la imagen redimensionada","Could not insert image at the current position.":"No se pudo insertar la imagen en la posición actual.","Inserting image failed":"Error al insertar la imagen"},getPluralForm(n){return (n != 1);}}};
e[ 'es' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'es' ].dictionary = Object.assign( e[ 'es' ].dictionary, dictionary );
e[ 'es' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
