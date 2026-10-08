/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'fr' ]: { dictionary, getPluralForm } } = {"fr":{"dictionary":{"Insert code block":"Insérer un bloc de code","Plain text":"Texte brut","Leaving %0 code snippet":"Laisser un extrait de code %0","Entering %0 code snippet":"Saisie d'un extrait de code %0","Entering code snippet":"Saisie d'un extrait de code","Leaving code snippet":"Laisser un extrait de code","Code block":"Bloc de code"},getPluralForm(n){return (n <= -2 || n >= 2);}}};
e[ 'fr' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'fr' ].dictionary = Object.assign( e[ 'fr' ].dictionary, dictionary );
e[ 'fr' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
