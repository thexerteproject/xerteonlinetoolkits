/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'no' ]: { dictionary, getPluralForm } } = {"no":{"dictionary":{"Enable editing":"Aktivere redigering","Previous editable region":"Forrige redigerbare region","Next editable region":"Neste redigerbare region","Navigate editable regions":"Naviger redigerbare regioner","Disable inline editing":"Deaktiver innebygd redigering","Enable inline editing":"Aktiver innebygd redigering","Disable block editing":"Deaktiver blokkredigering","Enable block editing":"Aktiver blokkredigering","Disable editing":"Deaktiver redigering"},getPluralForm(n){return (n != 1);}}};
e[ 'no' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'no' ].dictionary = Object.assign( e[ 'no' ].dictionary, dictionary );
e[ 'no' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
