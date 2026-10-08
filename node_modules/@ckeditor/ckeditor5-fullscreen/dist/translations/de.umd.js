/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'de' ]: { dictionary, getPluralForm } } = {"de":{"dictionary":{"Enter fullscreen mode":"Vollbildmodus aktivieren","Leave fullscreen mode":"Vollbildmodus deaktivieren","Fullscreen mode":"Vollbildmodus","Toggle fullscreen mode":"Vollbildmodus umschalten","Document outline":"Dokumentgliederung","Connected users":"Verbundene Nutzer","Show left sidebar":"Linke Seitenleiste anzeigen","Hide left sidebar":"Linke Seitenleiste ausblenden","Toggle sidebar":"Seitenleiste umschalten"},getPluralForm(n){return (n != 1);}}};
e[ 'de' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'de' ].dictionary = Object.assign( e[ 'de' ].dictionary, dictionary );
e[ 'de' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
