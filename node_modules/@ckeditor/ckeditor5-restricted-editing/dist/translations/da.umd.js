/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'da' ]: { dictionary, getPluralForm } } = {"da":{"dictionary":{"Enable editing":"Aktivér redigering","Previous editable region":"Forrige redigérbare region","Next editable region":"Næste redigérbare region","Navigate editable regions":"Gennemgå redigérbare regioner","Disable inline editing":"Deaktiver inline redigering","Enable inline editing":"Aktiver inline redigering","Disable block editing":"Deaktiver blokredigering","Enable block editing":"Aktiver blokredigering","Disable editing":"Deaktiver redigering"},getPluralForm(n){return (n != 1);}}};
e[ 'da' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'da' ].dictionary = Object.assign( e[ 'da' ].dictionary, dictionary );
e[ 'da' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
