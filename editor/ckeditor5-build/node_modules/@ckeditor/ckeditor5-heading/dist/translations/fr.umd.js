/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'fr' ]: { dictionary, getPluralForm } } = {"fr":{"dictionary":{"Heading":"En-tête","Choose heading":"Choisir l'en-tête","Heading 1":"Titre 1","Heading 2":"Titre 2","Heading 3":"Titre 3","Heading 4":"Titre 4","Heading 5":"Titre 5","Heading 6":"Titre 6","Type your title":"Rentrer votre titre","Type or paste your content here.":"Noter ou coller votre contenu ici"},getPluralForm(n){return (n <= -2 || n >= 2);}}};
e[ 'fr' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'fr' ].dictionary = Object.assign( e[ 'fr' ].dictionary, dictionary );
e[ 'fr' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
