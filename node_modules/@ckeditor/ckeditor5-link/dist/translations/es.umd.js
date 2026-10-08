/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'es' ]: { dictionary, getPluralForm } } = {"es":{"dictionary":{"Unlink":"Quitar enlace","Link":"Enlace","Link URL":"URL del enlace","Link URL must not be empty.":"La URL del enlace no puede estar vacía.","Link image":"URL de la imagen","Edit link":"Editar enlace","Open link in new tab":"Abrir enlace en una pestaña nueva","Open in a new tab":"Abrir en una pestaña nueva ","Downloadable":"Descargable","Create link":"Crea un enlace","Move out of a link":"Sale de un enlace","Link properties":"Propiedades del enlace","Displayed text":"Texto mostrado","No links available":"No hay enlaces disponibles"},getPluralForm(n){return (n != 1);}}};
e[ 'es' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'es' ].dictionary = Object.assign( e[ 'es' ].dictionary, dictionary );
e[ 'es' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
