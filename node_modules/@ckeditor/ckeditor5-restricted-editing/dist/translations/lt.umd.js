/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'lt' ]: { dictionary, getPluralForm } } = {"lt":{"dictionary":{"Enable editing":"Įjungti redagavimą","Previous editable region":"Buvusi redaguojama sritis","Next editable region":"Sekanti redaguojama sritis","Navigate editable regions":"Naviguoti tarp redaguojamų sričių","Disable inline editing":"Išjungti eilučių redagavimą","Enable inline editing":"Įjungti eilučių redagavimą","Disable block editing":"Išjungti blokų redagavimą","Enable block editing":"Įjungti blokų redagavimą","Disable editing":"Išjungti redagavimą"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'lt' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'lt' ].dictionary = Object.assign( e[ 'lt' ].dictionary, dictionary );
e[ 'lt' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
