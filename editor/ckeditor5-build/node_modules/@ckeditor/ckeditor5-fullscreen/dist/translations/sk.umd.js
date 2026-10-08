/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sk' ]: { dictionary, getPluralForm } } = {"sk":{"dictionary":{"Enter fullscreen mode":"Otvoriť režim celej obrazovky","Leave fullscreen mode":"Opustiť režim celej obrazovky","Fullscreen mode":"Režim celej obrazovky","Toggle fullscreen mode":"Prepnúť režim celej obrazovky","Document outline":"Náčrt dokumentu","Connected users":"Pripojení používatelia","Show left sidebar":"Zobraziť ľavý bočný panel","Hide left sidebar":"Skryť ľavý bočný panel","Toggle sidebar":"Prepnúť bočný panel"},getPluralForm(n){return (n == 1 ? 0 : (n >= 2 && n <= 4) ? 1 : 2);}}};
e[ 'sk' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sk' ].dictionary = Object.assign( e[ 'sk' ].dictionary, dictionary );
e[ 'sk' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
