/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'nl' ]: { dictionary, getPluralForm } } = {"nl":{"dictionary":{"Find and replace":"Zoeken en vervangen","Find in text…":"Zoeken in tekst","Find":"Zoeken","Previous result":"Volgende zoeken","Next result":"Vorige zoeken","Replace":"Vervangen","Replace all":"Alles vervangen","Match case":"Hoofdlettergevoelig","Whole words only":"Alleen volledige woorden","Replace with…":"Vervangen door","Text to find must not be empty.":"Dit veld mag niet leeg zijn","Tip: Find some text first in order to replace it.":"Tip: zoek eerst de tekst om hem te vervangen","Advanced options":"Geavanceerde opties","Find in the document":"Zoek in het document"},getPluralForm(n){return (n != 1);}}};
e[ 'nl' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'nl' ].dictionary = Object.assign( e[ 'nl' ].dictionary, dictionary );
e[ 'nl' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
