/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sv' ]: { dictionary, getPluralForm } } = {"sv":{"dictionary":{"Heading":"Rubrik","Choose heading":"Välj rubrik","Heading 1":"Rubrik 1","Heading 2":"Rubrik 2","Heading 3":"Rubrik 3","Heading 4":"Rubrik 4","Heading 5":"Rubrik 5","Heading 6":"Rubrik 6","Type your title":"Skriv in rubriken","Type or paste your content here.":"Skriv eller klistra in ditt innehåll här."},getPluralForm(n){return (n != 1);}}};
e[ 'sv' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sv' ].dictionary = Object.assign( e[ 'sv' ].dictionary, dictionary );
e[ 'sv' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
