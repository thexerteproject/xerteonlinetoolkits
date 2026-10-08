/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'de' ]: { dictionary, getPluralForm } } = {"de":{"dictionary":{"Heading":"Überschrift","Choose heading":"Überschrift auswählen","Heading 1":"Überschrift 1","Heading 2":"Überschrift 2","Heading 3":"Überschrift 3","Heading 4":"Überschrift 4","Heading 5":"Überschrift 5","Heading 6":"Überschrift 6","Type your title":"Titel eingeben","Type or paste your content here.":"Hier Inhalt einfügen."},getPluralForm(n){return (n != 1);}}};
e[ 'de' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'de' ].dictionary = Object.assign( e[ 'de' ].dictionary, dictionary );
e[ 'de' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
