/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'lt' ]: { dictionary, getPluralForm } } = {"lt":{"dictionary":{"Unlink":"Pašalinti nuorodą","Link":"Pridėti nuorodą","Link URL":"Nuorodos URL","Link URL must not be empty.":"Nuorodos URL negali būti tuščias.","Link image":"Susieti paveikslėlį","Edit link":"Keisti nuorodą","Open link in new tab":"Atidaryti nuorodą naujame skirtuke","Open in a new tab":"Atverti naujoje kortelėje","Downloadable":"Parsisiunčiamas","Create link":"Sukurti nuorodą","Move out of a link":"Išeiti iš nuorodos","Link properties":"Nuorodos savybės","Displayed text":"Rodomas tekstas","No links available":"Nėra jokių nuorodų"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'lt' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'lt' ].dictionary = Object.assign( e[ 'lt' ].dictionary, dictionary );
e[ 'lt' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
