/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'it' ]: { dictionary, getPluralForm } } = {"it":{"dictionary":{"Enter fullscreen mode":"Entra in modalità a schermo intero","Leave fullscreen mode":"Esci dalla modalità a schermo intero","Fullscreen mode":"Modalità a schermo intero","Toggle fullscreen mode":"Attiva/disattiva la modalità a schermo intero","Document outline":"Schema del documento","Connected users":"Utenti connessi","Show left sidebar":"Mostra barra laterale sinistra","Hide left sidebar":"Nascondi barra laterale sinistra","Toggle sidebar":"Attiva/disattiva barra laterale"},getPluralForm(n){return (n != 1);}}};
e[ 'it' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'it' ].dictionary = Object.assign( e[ 'it' ].dictionary, dictionary );
e[ 'it' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
