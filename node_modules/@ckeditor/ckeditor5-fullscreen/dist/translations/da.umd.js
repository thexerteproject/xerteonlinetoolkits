/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'da' ]: { dictionary, getPluralForm } } = {"da":{"dictionary":{"Enter fullscreen mode":"Gå i fuldskærmstilstand","Leave fullscreen mode":"Forlad fuldskærmstilstand","Fullscreen mode":"Fuldskærmstilstand","Toggle fullscreen mode":"Slå fuldskærmstilstand til/fra","Document outline":"Dokumentoversigt","Connected users":"Tilsluttede brugere","Show left sidebar":"Vis venstre sidepanel","Hide left sidebar":"Skjul venstre sidepanel","Toggle sidebar":"Vis eller skjul sidepanel"},getPluralForm(n){return (n != 1);}}};
e[ 'da' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'da' ].dictionary = Object.assign( e[ 'da' ].dictionary, dictionary );
e[ 'da' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
