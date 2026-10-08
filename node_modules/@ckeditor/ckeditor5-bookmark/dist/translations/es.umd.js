/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'es' ]: { dictionary, getPluralForm } } = {"es":{"dictionary":{"Bookmark":"Marcador","Edit bookmark":"Editar marcador","Remove bookmark":"Eliminar marcador","Bookmark name":"Nombre del marcador","Enter the bookmark name without spaces.":"Introduzca el nombre del marcador sin espacios.","Bookmark must not be empty.":"El marcador no debe estar vacío.","Bookmark name cannot contain space characters.":"El nombre del marcador no puede contener espacios.","Bookmark name already exists.":"Ya existe el nombre del marcador.","bookmark widget":"Módulo interactivo del marcador","Bookmark toolbar":"Barra de marcadores","Bookmarks":"Marcadores","No bookmarks available.":"No hay marcadores disponibles.","Scroll to bookmark":"Desplazarse hasta el marcador"},getPluralForm(n){return (n != 1);}}};
e[ 'es' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'es' ].dictionary = Object.assign( e[ 'es' ].dictionary, dictionary );
e[ 'es' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
