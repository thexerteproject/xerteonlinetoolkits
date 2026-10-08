/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'fr' ]: { dictionary, getPluralForm } } = {"fr":{"dictionary":{"Enable editing":"Activer l'édition","Previous editable region":"Région éditable précédente","Next editable region":"Région éditable suivante","Navigate editable regions":"Naviguer vers","Disable inline editing":"Désactiver la modification en ligne","Enable inline editing":"Activer la modification en ligne","Disable block editing":"Désactiver la modification par blocs","Enable block editing":"Activer la modification par blocs","Disable editing":"Désactiver la modification"},getPluralForm(n){return (n <= -2 || n >= 2);}}};
e[ 'fr' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'fr' ].dictionary = Object.assign( e[ 'fr' ].dictionary, dictionary );
e[ 'fr' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
