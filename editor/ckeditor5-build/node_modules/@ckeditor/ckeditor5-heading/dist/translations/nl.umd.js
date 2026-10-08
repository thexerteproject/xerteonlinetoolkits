/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'nl' ]: { dictionary, getPluralForm } } = {"nl":{"dictionary":{"Heading":"Koppen","Choose heading":"Kies kop","Heading 1":"Kop 1","Heading 2":"Kop 2","Heading 3":"Kop 3","Heading 4":"Kop 4","Heading 5":"Kop 5","Heading 6":"Kop 6","Type your title":"Voor uw titel in","Type or paste your content here.":"Voer of plak uw inhoud in."},getPluralForm(n){return (n != 1);}}};
e[ 'nl' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'nl' ].dictionary = Object.assign( e[ 'nl' ].dictionary, dictionary );
e[ 'nl' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
