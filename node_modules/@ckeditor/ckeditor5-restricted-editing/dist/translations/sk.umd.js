/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sk' ]: { dictionary, getPluralForm } } = {"sk":{"dictionary":{"Enable editing":"Zapnúť režim úprav","Previous editable region":"Predchádzajúca oblasť úprav","Next editable region":"Nasledujúca oblasť úprav","Navigate editable regions":"Navigácia v oblasti úprav","Disable inline editing":"Zakázať vložené úpravy","Enable inline editing":"Povoliťvložené úpravy","Disable block editing":"Zakázať úpravu blokov","Enable block editing":"Povoliť úpravu blokov","Disable editing":"Deaktivovať úpravu"},getPluralForm(n){return (n == 1 ? 0 : (n >= 2 && n <= 4) ? 1 : 2);}}};
e[ 'sk' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sk' ].dictionary = Object.assign( e[ 'sk' ].dictionary, dictionary );
e[ 'sk' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
