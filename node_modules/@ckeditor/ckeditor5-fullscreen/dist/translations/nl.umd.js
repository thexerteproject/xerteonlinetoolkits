/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'nl' ]: { dictionary, getPluralForm } } = {"nl":{"dictionary":{"Enter fullscreen mode":"Volledig scherm openen","Leave fullscreen mode":"Volledig scherm verlaten","Fullscreen mode":"Volledig scherm","Toggle fullscreen mode":"Volledig scherm inschakelen","Document outline":"Overzicht document","Connected users":"Aangesloten gebruikers","Show left sidebar":"Linkerzijbalk weergeven","Hide left sidebar":"Linkerzijbalk verbergen","Toggle sidebar":"Zijbalk in-/uitschakelen"},getPluralForm(n){return (n != 1);}}};
e[ 'nl' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'nl' ].dictionary = Object.assign( e[ 'nl' ].dictionary, dictionary );
e[ 'nl' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
