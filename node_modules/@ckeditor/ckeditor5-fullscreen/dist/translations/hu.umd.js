/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'hu' ]: { dictionary, getPluralForm } } = {"hu":{"dictionary":{"Enter fullscreen mode":"Teljes képernyős mód","Leave fullscreen mode":"Kilépés a teljes képernyőből","Fullscreen mode":"Teljes képernyős mód","Toggle fullscreen mode":"Váltás teljes képernyőre","Document outline":"Dokumentum vázlata","Connected users":"Csatlakozott felhasználók","Show left sidebar":"Bal oldalsáv megjelenítése","Hide left sidebar":"Bal oldalsáv elrejtése","Toggle sidebar":"Oldalsáv megjelenítése/elrejtése"},getPluralForm(n){return (n != 1);}}};
e[ 'hu' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'hu' ].dictionary = Object.assign( e[ 'hu' ].dictionary, dictionary );
e[ 'hu' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
