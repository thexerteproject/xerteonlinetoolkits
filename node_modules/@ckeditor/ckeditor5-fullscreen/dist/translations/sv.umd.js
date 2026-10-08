/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sv' ]: { dictionary, getPluralForm } } = {"sv":{"dictionary":{"Enter fullscreen mode":"Gå in i helskärmsläge","Leave fullscreen mode":"Lämna helskärmsläget","Fullscreen mode":"Helskärmsläge","Toggle fullscreen mode":"Skifta helskärmsläge","Document outline":"Dokumentöversikt","Connected users":"Anslutna användare","Show left sidebar":"Visa vänster sidopanel","Hide left sidebar":"Dölj vänster sidopanel","Toggle sidebar":"Växla sidopanel"},getPluralForm(n){return (n != 1);}}};
e[ 'sv' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sv' ].dictionary = Object.assign( e[ 'sv' ].dictionary, dictionary );
e[ 'sv' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
