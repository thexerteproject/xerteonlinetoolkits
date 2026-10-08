/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'cs' ]: { dictionary, getPluralForm } } = {"cs":{"dictionary":{"Enter fullscreen mode":"Přejít do režimu celé obrazovky","Leave fullscreen mode":"Opustit režim celé obrazovky","Fullscreen mode":"Režim celé obrazovky","Toggle fullscreen mode":"Přepnout režim celé obrazovky","Document outline":"Osnova dokumentu","Connected users":"Připojení uživatelé","Show left sidebar":"Zobrazit levý postranní panel","Hide left sidebar":"Skrýt levý postranní panel","Toggle sidebar":"Přepnout postranní panel"},getPluralForm(n){return (n == 1 ? 0 : (n >= 2 && n <= 4) ? 1 : 2);}}};
e[ 'cs' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'cs' ].dictionary = Object.assign( e[ 'cs' ].dictionary, dictionary );
e[ 'cs' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
