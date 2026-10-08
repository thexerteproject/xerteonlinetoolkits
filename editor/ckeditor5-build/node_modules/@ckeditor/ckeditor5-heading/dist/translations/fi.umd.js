/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'fi' ]: { dictionary, getPluralForm } } = {"fi":{"dictionary":{"Heading":"Otsikkotyyli","Choose heading":"Valitse otsikko","Heading 1":"Otsikko 1","Heading 2":"Otsikko 2","Heading 3":"Otsikko 3","Heading 4":"Otsikko 4","Heading 5":"Otsikko 5","Heading 6":"Otsikko 6","Type your title":"Kirjoita otsikkosi","Type or paste your content here.":"Kirjoita tai liitä sisältösi tänne."},getPluralForm(n){return (n != 1);}}};
e[ 'fi' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'fi' ].dictionary = Object.assign( e[ 'fi' ].dictionary, dictionary );
e[ 'fi' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
