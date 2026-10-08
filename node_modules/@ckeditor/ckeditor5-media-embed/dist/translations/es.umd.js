/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'es' ]: { dictionary, getPluralForm } } = {"es":{"dictionary":{"media widget":"Widget de contenido multimedia","Media URL":"URL del contenido multimedia","Paste the media URL in the input.":"Pega la URL del contenido multimedia","Tip: Paste the URL into the content to embed faster.":"Tip: pega la URL dentro del contenido para embeber más rápido","The URL must not be empty.":"La URL no debe estar vacía","This media URL is not supported.":"La URL de este contenido multimedia no está soportada","Insert media":"Insertar contenido multimedia","Media":"Multimedia","Media toolbar":"Barra de herramientas de contenido multimedia","Open media in new tab":"Abrir medio en una pestaña nueva","Media embed":"Inserción de medios"},getPluralForm(n){return (n != 1);}}};
e[ 'es' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'es' ].dictionary = Object.assign( e[ 'es' ].dictionary, dictionary );
e[ 'es' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
