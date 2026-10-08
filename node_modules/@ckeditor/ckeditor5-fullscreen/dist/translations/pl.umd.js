/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'pl' ]: { dictionary, getPluralForm } } = {"pl":{"dictionary":{"Enter fullscreen mode":"Włącz tryb pełnoekranowy","Leave fullscreen mode":"Wyłącz tryb pełnoekranowy","Fullscreen mode":"Tryb pełnoekranowy","Toggle fullscreen mode":"Przełącz tryb pełnoekranowy","Document outline":"Zarys dokumentu","Connected users":"Połączeni użytkownicy","Show left sidebar":"Pokaż lewy pasek boczny","Hide left sidebar":"Ukryj lewy pasek boczny","Toggle sidebar":"Przełącz pasek boczny"},getPluralForm(n){return (n == 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'pl' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'pl' ].dictionary = Object.assign( e[ 'pl' ].dictionary, dictionary );
e[ 'pl' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
