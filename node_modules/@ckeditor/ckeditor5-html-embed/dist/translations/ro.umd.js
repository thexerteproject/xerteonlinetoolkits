/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ro' ]: { dictionary, getPluralForm } } = {"ro":{"dictionary":{"Insert HTML":"Inserează HTML","HTML snippet":"Fragment HTML","Paste raw HTML here...":"Inserați aici HTML brut... ","Edit source":"Editează sursa","Save changes":"Salvează schimbările","No preview available":"Previzualizare indisponibilă","Empty snippet content":"Golește conținutul fragmentului"},getPluralForm(n){return (n == 1 ? 0 : (n == 0 || (n % 100 > 0 && n % 100 < 20)) ? 1 : 2);}}};
e[ 'ro' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ro' ].dictionary = Object.assign( e[ 'ro' ].dictionary, dictionary );
e[ 'ro' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
