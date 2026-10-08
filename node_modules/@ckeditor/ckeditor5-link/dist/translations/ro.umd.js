/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ro' ]: { dictionary, getPluralForm } } = {"ro":{"dictionary":{"Unlink":"Șterge link","Link":"Link","Link URL":"Link URL","Link URL must not be empty.":"URL-ul linkului nu trebuie să fie necompletat.","Link image":"Link imagine","Edit link":"Modifică link","Open link in new tab":"Deschide link în tab nou","Open in a new tab":"Deschide în tab nou","Downloadable":"Descărcabil","Create link":"Crearea unui link","Move out of a link":"Ieșire dintr-un link","Link properties":"Proprietățile linkului","Displayed text":"Textul afișat","No links available":"Niciun link disponibil"},getPluralForm(n){return (n == 1 ? 0 : (n == 0 || (n % 100 > 0 && n % 100 < 20)) ? 1 : 2);}}};
e[ 'ro' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ro' ].dictionary = Object.assign( e[ 'ro' ].dictionary, dictionary );
e[ 'ro' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
