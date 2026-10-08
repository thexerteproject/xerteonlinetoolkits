/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'hu' ]: { dictionary, getPluralForm } } = {"hu":{"dictionary":{"Unlink":"Link eltávolítása","Link":"Link","Link URL":"URL link","Link URL must not be empty.":"A link URL-címe nem lehet üres.","Link image":"Hivatkozás","Edit link":"Link szerkesztése","Open link in new tab":"Link megnyitása új ablakban","Open in a new tab":"Megnyitás új lapon","Downloadable":"Letölthető","Create link":"Link létrehozása","Move out of a link":"Kilépés egy linkből","Link properties":"Link tulajdonságai","Displayed text":"Megjelenő szöveg","No links available":"Nincs elérhető link"},getPluralForm(n){return (n != 1);}}};
e[ 'hu' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'hu' ].dictionary = Object.assign( e[ 'hu' ].dictionary, dictionary );
e[ 'hu' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
