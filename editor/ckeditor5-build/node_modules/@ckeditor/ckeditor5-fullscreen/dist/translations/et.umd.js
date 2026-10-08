/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'et' ]: { dictionary, getPluralForm } } = {"et":{"dictionary":{"Enter fullscreen mode":"Sisene täisekraani režiimi","Leave fullscreen mode":"Välju täisekraani režiimist","Fullscreen mode":"Täisekraani režiim","Toggle fullscreen mode":"Lülita täisekraani režiim sisse-välja","Document outline":"Dokumendi ülevaade","Connected users":"Ühenduses kasutajad","Show left sidebar":"Kuva vasakpoolne külgriba","Hide left sidebar":"Peida vasakpoolne külgriba","Toggle sidebar":"Kuva/peida külgriba"},getPluralForm(n){return (n != 1);}}};
e[ 'et' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'et' ].dictionary = Object.assign( e[ 'et' ].dictionary, dictionary );
e[ 'et' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
