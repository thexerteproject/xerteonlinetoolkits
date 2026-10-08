/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sr-latn' ]: { dictionary, getPluralForm } } = {"sr-latn":{"dictionary":{"Unlink":"Оtkloni link","Link":"Link","Link URL":"URL link","Link URL must not be empty.":"URL linka ne sme biti prazan.","Link image":"Link slike","Edit link":"Ispravi link","Open link in new tab":"Otvori link u novom prozoru","Open in a new tab":"Otvori u novoj kartici","Downloadable":"Moguće preuzimanje","Create link":"Kreirajte vezu","Move out of a link":"Pomerite se sa veze","Link properties":"","Displayed text":"","No links available":""},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'sr-latn' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sr-latn' ].dictionary = Object.assign( e[ 'sr-latn' ].dictionary, dictionary );
e[ 'sr-latn' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
