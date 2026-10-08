/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sr' ]: { dictionary, getPluralForm } } = {"sr":{"dictionary":{"Bookmark":"Obeleživač","Edit bookmark":"Uredi obeleživač","Remove bookmark":"Ukloni obeleživač","Bookmark name":"Naziv obeleživača","Enter the bookmark name without spaces.":"Unesite naziv obeleživača bez razmaka.","Bookmark must not be empty.":"Naziv obeleživača ne sme biti prazan.","Bookmark name cannot contain space characters.":"Naziv obeleživača ne može da sadrži znakove sa razmakom.","Bookmark name already exists.":"Naziv obeleživača već postoji.","bookmark widget":"vidžet obeleživača","Bookmark toolbar":"Traka sa alatkama za obeleživače","Bookmarks":"Obeleživači","No bookmarks available.":"Nema dostupnih obeleživača.","Scroll to bookmark":"Dođite do obeleživača"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'sr' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sr' ].dictionary = Object.assign( e[ 'sr' ].dictionary, dictionary );
e[ 'sr' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
