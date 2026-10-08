/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'lv' ]: { dictionary, getPluralForm } } = {"lv":{"dictionary":{"Enter fullscreen mode":"Ieiet pilnekrāna režīmā","Leave fullscreen mode":"Iziet no pilnekrāna režīma","Fullscreen mode":"Pilnekrāna režīms","Toggle fullscreen mode":"Pārslēgt uz pilnekrāna režīmu","Document outline":"Dokumenta izklāsts","Connected users":"Pievienotie lietotāji","Show left sidebar":"Rādīt kreiso sānu joslu","Hide left sidebar":"Slēpt kreiso sānu joslu","Toggle sidebar":"Pārslēgt sānu joslu"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n != 0 ? 1 : 2);}}};
e[ 'lv' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'lv' ].dictionary = Object.assign( e[ 'lv' ].dictionary, dictionary );
e[ 'lv' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
