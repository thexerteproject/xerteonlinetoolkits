/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'lv' ]: { dictionary, getPluralForm } } = {"lv":{"dictionary":{"Enable editing":"Iespējot labošanu","Previous editable region":"Iepriekšējais labošanas reģions","Next editable region":"Nākamais labošanas reģions","Navigate editable regions":"Navigēt caur labojamajiem reģioniem","Disable inline editing":"Atspējot iekļauto rediģēšanu","Enable inline editing":"Iespējot iekļauto rediģēšanu","Disable block editing":"Atspējot bloku rediģēšanu","Enable block editing":"Iespējot bloku rediģēšanu","Disable editing":"Atspējot rediģēšanu"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n != 0 ? 1 : 2);}}};
e[ 'lv' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'lv' ].dictionary = Object.assign( e[ 'lv' ].dictionary, dictionary );
e[ 'lv' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
