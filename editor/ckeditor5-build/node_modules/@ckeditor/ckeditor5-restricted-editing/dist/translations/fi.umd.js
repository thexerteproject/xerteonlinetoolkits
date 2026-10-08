/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'fi' ]: { dictionary, getPluralForm } } = {"fi":{"dictionary":{"Enable editing":"Ota muokkaus käyttöön","Previous editable region":"Aikaisempi muokattava alue","Next editable region":"Seuraava muokattava alue","Navigate editable regions":"Siirry muokattavilla alueilla","Disable inline editing":"Poista sisäinen muokkaus käytöstä","Enable inline editing":"Ota sisäinen muokkaus käyttöön","Disable block editing":"Poista lohkon muokkaus käytöstä","Enable block editing":"Ota lohkon muokkaus käyttöön","Disable editing":"Poista muokkaus käytöstä"},getPluralForm(n){return (n != 1);}}};
e[ 'fi' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'fi' ].dictionary = Object.assign( e[ 'fi' ].dictionary, dictionary );
e[ 'fi' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
