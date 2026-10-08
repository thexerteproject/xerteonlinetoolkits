/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'es' ]: { dictionary, getPluralForm } } = {"es":{"dictionary":{"Enter fullscreen mode":"Entrar al modo de pantalla completa","Leave fullscreen mode":"Salir del modo de pantalla completa","Fullscreen mode":"Modo de pantalla completa","Toggle fullscreen mode":"Alternar modo de pantalla completa","Document outline":"Boceto del documento","Connected users":"Usuarios conectados","Show left sidebar":"Mostrar barra lateral izquierda","Hide left sidebar":"Ocultar la barra lateral izquierda","Toggle sidebar":"Activar o desactivar la barra lateral"},getPluralForm(n){return (n != 1);}}};
e[ 'es' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'es' ].dictionary = Object.assign( e[ 'es' ].dictionary, dictionary );
e[ 'es' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
