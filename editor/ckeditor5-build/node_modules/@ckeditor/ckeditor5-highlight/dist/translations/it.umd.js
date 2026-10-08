/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'it' ]: { dictionary, getPluralForm } } = {"it":{"dictionary":{"Yellow marker":"Contrassegno giallo","Green marker":"Contrassegno verde","Pink marker":"Contrassegno rosa","Blue marker":"Contrassegno blu","Red pen":"Penna rossa","Green pen":"Penna verde","Remove highlight":"Rimuovi evidenziazione","Highlight":"Evidenzia","Text highlight toolbar":"Barra degli strumenti dell'evidenziazione del testo"},getPluralForm(n){return (n != 1);}}};
e[ 'it' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'it' ].dictionary = Object.assign( e[ 'it' ].dictionary, dictionary );
e[ 'it' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
